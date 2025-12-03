import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { STORAGE_KEYS } from '../constants';
import { Medication } from '../types';

const handled = new Set<string>();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const applyCounts = (m: Medication) => {
  const isPill = m.dosageUnit === 'pill' || m.dosageUnit === 'tablet' || m.dosageUnit === 'capsule';
  if (isPill && m.timesPerDay && m.dosageAmount && m.duration) {
    const total = m.timesPerDay * m.dosageAmount * m.duration;
    const remaining = m.remainingAmount ?? total;
    return { ...m, totalAmount: total, remainingAmount: remaining };
  }
  return { ...m, totalAmount: undefined, remainingAmount: undefined };
};

const updateRemaining = async (medId?: string, dosageAmount?: number, dosageUnit?: string) => {
  if (!medId) return;
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
  if (!stored) return;
  const list: Medication[] = JSON.parse(stored);
  const updated = list.map((m) => {
    if (m.id !== medId) return m;
    const isPill = m.dosageUnit === 'pill' || m.dosageUnit === 'tablet' || m.dosageUnit === 'capsule';
    if (!isPill) return m;
    const remaining = Math.max(0, (m.remainingAmount ?? m.totalAmount ?? 0) - (dosageAmount ?? 0));
    return applyCounts({ ...m, remainingAmount: remaining });
  });
  await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(updated));
};

Notifications.addNotificationResponseReceivedListener(async (response) => {
  const notifId = response.notification.request.identifier;
  if (handled.has(notifId)) return;
  handled.add(notifId);

  const actionId = response.actionIdentifier;
  const data = response.notification.request.content.data as {
    medId?: string;
    reminderTime?: string;
    snooze?: number;
    dosageAmount?: number;
    dosageUnit?: string;
    snoozedOnce?: boolean;
  };

  if (actionId === 'DONE') {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.cancelScheduledNotificationAsync(notifId);
    await updateRemaining(data.medId, data.dosageAmount, data.dosageUnit);
    return;
  }

  if ((actionId === 'REMIND_LATER' || actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) && !data.snoozedOnce) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to take your medicine',
        body: 'Tap Done after taking it.',
        categoryIdentifier: 'MEDICATION_REMINDER',
        data: { ...data, snoozedOnce: true },
      },
      trigger: { seconds: Math.max(60, (data.snooze ?? 10) * 60), repeats: false } as Notifications.TimeIntervalTriggerInput,
    });
  }
});
