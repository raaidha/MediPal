import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { STORAGE_KEYS } from '../constants';
import { Medication } from '../types';

type MedicationInput = Omit<Medication, 'id' | 'frequency'> & { id?: string };

type MedicationsContextValue = {
  medications: Medication[];
  addMedication: (input: MedicationInput) => Promise<void>;
  updateMedication: (id: string, updates: Partial<MedicationInput>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  deleteDose: (id: string, reminderTime: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const MedicationsContext = createContext<MedicationsContextValue | undefined>(undefined);

const ensureId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const DEFAULT_SNOOZE_MINUTES = 10;
type NotifMap = Record<string, string[]>;

const parseTime = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
};

const computeNextTrigger = (hour: number, minute: number, dayOffset = 0) => {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1 + dayOffset);
  } else {
    target.setDate(target.getDate() + dayOffset);
  }
  return target;
};

const isPillUnit = (unit?: string) => unit === 'pill' || unit === 'tablet' || unit === 'capsule';

const applyCounts = (med: Medication): Medication => {
  if (isPillUnit(med.dosageUnit) && med.timesPerDay && med.dosageAmount && med.duration) {
    const total = med.timesPerDay * med.dosageAmount * med.duration;
    const remaining = med.remainingAmount ?? total;
    return { ...med, totalAmount: total, remainingAmount: remaining };
  }
  return { ...med, totalAmount: undefined, remainingAmount: undefined };
};

export function MedicationsProvider({ children }: PropsWithChildren) {
  const [medications, setMedications] = useState<Medication[]>([]);

  const persist = async (next: Medication[]) => {
    setMedications(next);
    await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(next));
    await scheduleAllReminders(next);
  };

  const cancelMedNotifications = async (medId: string, map: NotifMap) => {
    const ids = map[medId] || [];
    for (const id of ids) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {}
    }
    delete map[medId];
  };

  const applyRemainingUpdate = async (medId?: string, change?: (m: Medication) => Medication) => {
    if (!medId) return;
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (!stored) return;
    const list: Medication[] = JSON.parse(stored);
    const updated = list.map((m) => {
      if (m.id !== medId) return m;
      const updatedMed = change ? change(m) : m;
      return applyCounts(updatedMed);
    });
    setMedications(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(updated));
  };

  const refresh = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (stored) {
      const parsed: Medication[] = JSON.parse(stored);
      const normalized = parsed.map((m) => ({
        ...m,
        dosage: m.dosage ?? 'Dose',
        dosageAmount: m.dosageAmount ?? 1,
        dosageUnit: m.dosageUnit ?? 'pill',
        timesPerDay: m.timesPerDay ?? (m.reminderTimes?.length || 1),
        reminderTimes: m.reminderTimes ?? [],
        snoozeInterval: m.snoozeInterval ?? DEFAULT_SNOOZE_MINUTES,
        enableReminders: m.enableReminders ?? true,
        frequency: (m.reminderTimes ?? []).length,
      })).map(applyCounts);
      setMedications(normalized);
      await scheduleAllReminders(normalized);
    }
  };

  const addMedication = async (input: MedicationInput) => {
    const id = input.id ?? ensureId();
    const medication: Medication = applyCounts({
      ...input,
      id,
      frequency: input.reminderTimes.length,
    });
    const next = [...medications, medication];
    await persist(next);
  };

  const updateMedication = async (id: string, updates: Partial<MedicationInput>) => {
    const next = medications.map((m) =>
      m.id === id
        ? applyCounts({
            ...m,
            ...updates,
            frequency: updates.reminderTimes ? updates.reminderTimes.length : m.frequency,
          })
        : m,
    );
    await persist(next);
  };

  const deleteMedication = async (id: string) => {
    const next = medications.filter((m) => m.id !== id);
    await persist(next);
  };

  const deleteDose = async (id: string, reminderTime: string) => {
    const next = medications.map((m) =>
      m.id === id
        ? {
            ...m,
            reminderTimes: m.reminderTimes.filter((t) => t !== reminderTime),
            frequency: m.reminderTimes.filter((t) => t !== reminderTime).length,
          }
        : m,
    ).map(applyCounts);
    await persist(next);
  };

  const registerNotificationCategory = async () => {
    await Notifications.setNotificationCategoryAsync('MEDICATION_REMINDER', [
      {
        identifier: 'DONE',
        buttonTitle: 'Done',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'REMIND_LATER',
        buttonTitle: 'Remind me later',
        options: { opensAppToForeground: true },
      },
    ]);
  };

  const ensureAndroidChannel = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('med-reminders', {
        name: 'Medication reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        enableVibrate: true,
        vibrationPattern: [250, 250, 500],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  };

  const scheduleAllReminders = async (list: Medication[]) => {
    // Strategy: clear delivered + scheduled, then schedule repeats at selected hour/minute.
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.cancelAllScheduledNotificationsAsync();
    const notifMap: Record<string, string[]> = {};

    for (const med of list) {
      if (!med.enableReminders) continue;
      const ids: string[] = [];
      for (const reminderTime of med.reminderTimes) {
        const { hour, minute } = parseTime(reminderTime);
        if (Number.isNaN(hour) || Number.isNaN(minute)) continue;
        try {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Time to take your medicine',
              body: 'Tap Done after taking it.',
              categoryIdentifier: 'MEDICATION_REMINDER',
              data: {
                medId: med.id,
                reminderTime,
                snooze: med.snoozeInterval ?? DEFAULT_SNOOZE_MINUTES,
                dosage: med.dosage,
                dosageAmount: med.dosageAmount,
                dosageUnit: med.dosageUnit,
                snoozedOnce: false,
              },
            },
            trigger: {
              hour,
              minute,
              repeats: true,
              channelId: Platform.OS === 'android' ? 'med-reminders' : undefined,
            } as any,
          });
          ids.push(id);
        } catch (err) {
          console.warn('Failed to schedule notification', err);
        }
      }
      if (ids.length) notifMap[med.id] = ids;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_MAP, JSON.stringify(notifMap));
  };

  useEffect(() => {
    const setup = async () => {
      try {
        await Notifications.requestPermissionsAsync();
        await ensureAndroidChannel();
        await registerNotificationCategory();
      } catch (err) {
        console.warn('Notification setup failed', err);
      }
      await refresh();
    };
    setup();
  }, []);

  const value = useMemo(
    () => ({
      medications,
      addMedication,
      updateMedication,
      deleteMedication,
      deleteDose,
      refresh,
    }),
    [medications],
  );

  return <MedicationsContext.Provider value={value}>{children}</MedicationsContext.Provider>;
}

export const useMedicationsContext = () => {
  const ctx = useContext(MedicationsContext);
  if (!ctx) throw new Error('useMedications must be used inside MedicationsProvider');
  return ctx;
};
