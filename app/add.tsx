import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, EMOJIS, SNOOZE_OPTIONS } from '../constants';
import { useMedications } from '../hooks/useMedications';
import { useThemeMode } from '../context/ThemeContext';

export default function AddMedicine() {
  const { addMedication } = useMedications();
  const router = useRouter();
  const { colors } = useThemeMode();

  const [name, setName] = useState('');
  const [dosageAmount, setDosageAmount] = useState('1');
  const [dosageUnit, setDosageUnit] = useState<'pill' | 'tablet' | 'capsule' | 'ml' | 'unit' | 'drop'>('pill');
  const [duration, setDuration] = useState('7');
  const [timesPerDay, setTimesPerDay] = useState('2');
  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:00', '20:00']);
  const [enableReminders, setEnableReminders] = useState(true);
  const [snoozeInterval, setSnoozeInterval] = useState(15);
  const [color, setColor] = useState(COLORS[3]);
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [error, setError] = useState<string | null>(null);
  const [openPicker, setOpenPicker] = useState<{ index: number; field: 'hour' | 'minute' | 'meridiem' } | null>(null);
  const HOURS = useMemo(() => Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')), []);
  const MINUTES = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), []);
  const MERIDIEMS: Array<'AM' | 'PM'> = ['AM', 'PM'];

  const gradientButton = useMemo(
    () => (
      <LinearGradient
        colors={['#00BFA6', '#40E0D0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryButton}>
        <Text style={styles.primaryText}>Save Medicine</Text>
      </LinearGradient>
    ),
    [],
  );

  const syncTimes = (nextCount: number) => {
    const current = [...reminderTimes];
    if (nextCount > current.length) {
      const defaults = ['08:00', '12:00', '20:00'];
      while (current.length < nextCount) {
        current.push(defaults[current.length % defaults.length]);
      }
    } else if (nextCount < current.length) {
      current.length = Math.max(1, nextCount);
    }
    setReminderTimes(current);
  };

  const normalizeTime = (t: string) => {
    const match = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const to12h = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const meridiem: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour: hour12.toString().padStart(2, '0'), minute: m.toString().padStart(2, '0'), meridiem };
  };

  const to24h = (hour: string, minute: string, meridiem: 'AM' | 'PM') => {
    let h = parseInt(hour, 10);
    if (Number.isNaN(h)) h = 0;
    h = h % 12;
    if (meridiem === 'PM') h += 12;
    return `${h.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  const setTimePart = (index: number, part: 'hour' | 'minute' | 'meridiem', value: string) => {
    const parts = to12h(reminderTimes[index]);
    const next = [...reminderTimes];
    const updated = to24h(
      part === 'hour' ? value : parts.hour,
      part === 'minute' ? value : parts.minute,
      part === 'meridiem' ? (value as 'AM' | 'PM') : parts.meridiem,
    );
    next[index] = updated;
    setReminderTimes(next);
  };

  const validate = () => {
    if (!name.trim()) return 'Please add a medicine name.';
    const dosageAmtVal = Number(dosageAmount);
    if (!dosageAmtVal || dosageAmtVal <= 0) return 'Dosage amount must be greater than 0.';
    const durationVal = Number(duration);
    if (!durationVal || durationVal <= 0) return 'Duration must be at least 1 day.';
    const timesVal = Number(timesPerDay);
    if (!timesVal || timesVal <= 0) return 'Times per day must be at least 1.';
    if (reminderTimes.length !== timesVal) return 'Please add the same number of reminder times as times per day.';
    if (enableReminders) {
      const normalized = reminderTimes.map(normalizeTime);
      if (normalized.some((t) => t === null)) return 'Use HH:MM (24h) for reminder times (e.g., 08:00 or 09:30).';
      setReminderTimes(normalized as string[]);
    }
    return null;
  };

  const save = async () => {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);

    const builtDosage = `${Number(dosageAmount) || 0} ${dosageUnit}`;
    await addMedication({
      name: name.trim(),
      dosage: builtDosage,
      dosageAmount: Number(dosageAmount) || 0,
      dosageUnit,
      timesPerDay: Number(timesPerDay) || reminderTimes.length,
      duration: Number(duration),
      startDate: new Date().toISOString(),
      enableReminders,
      reminderTimes,
      snoozeInterval,
      color,
      emoji,
      frequency: reminderTimes.length,
    });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
    <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}>
      <Text style={[styles.title, { color: colors.text }]}>Add Medicine</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>Keep your doses on track with friendly reminders.</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.accent }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Medicine name</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="e.g. Paracetamol"
          value={name}
          onChangeText={setName}
          placeholderTextColor={colors.subtext}
        />

        <Text style={[styles.sectionLabel, { color: colors.text }]}>Times per day</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={timesPerDay}
          onChangeText={(t) => {
            setTimesPerDay(t);
            const num = Number(t);
            if (num > 0) syncTimes(num);
          }}
          placeholderTextColor={colors.subtext}
        />

        <Text style={[styles.sectionLabel, { color: colors.text }]}>Dosage</Text>
        <View style={styles.dosageRow}>
          <TextInput
            style={[
              styles.input,
              styles.dosageInput,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
            ]}
            placeholder="Amount"
            keyboardType="numeric"
            value={dosageAmount}
            onChangeText={setDosageAmount}
            placeholderTextColor={colors.subtext}
          />
          <View style={styles.unitPicker}>
            {(['pill', 'tablet', 'capsule', 'ml', 'unit', 'drop'] as const).map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitChip,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  dosageUnit === unit && { backgroundColor: '#E0F7F3', borderColor: '#0F766E' },
                ]}
                onPress={() => setDosageUnit(unit)}>
                <Text
                  style={[
                    styles.unitText,
                    { color: colors.text },
                    dosageUnit === unit && styles.unitTextActive,
                  ]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.text }]}>Duration (days)</Text>
        <View style={styles.pillRow}>
          {['7', '14', '30', '90'].map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.pill,
                { backgroundColor: colors.background, borderColor: colors.border },
                duration === d && styles.pillActive,
              ]}
              onPress={() => setDuration(d)}>
              <Text style={[styles.pillText, duration === d && styles.pillTextActive]}>{d} days</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
          placeholder="Custom days"
          placeholderTextColor={colors.subtext}
        />

        <Text style={[styles.sectionLabel, { color: colors.text }]}>Color tag</Text>
        <View style={styles.colorsRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorCircle,
                { backgroundColor: c },
                c === color && styles.colorCircleActive,
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.text }]}>Emoji</Text>
        <View style={styles.emojiRow}>
          {EMOJIS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiChip, e === emoji && styles.emojiChipActive]}
              onPress={() => setEmoji(e)}>
              <Text style={styles.emojiText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.reminderCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.label, { color: colors.text }]}>Set Reminders</Text>
              <Text style={[styles.microCopy, { color: colors.subtext }]}>Get notified when it's time</Text>
            </View>
            <Switch value={enableReminders} onValueChange={setEnableReminders} />
          </View>

        {enableReminders &&
          reminderTimes.map((time, idx) => (
            <View key={idx} style={styles.timeRow}>
              <View style={[styles.doseTag, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Text style={[styles.doseTagText, { color: colors.text }]}>Dose {idx + 1}</Text>
              </View>
              <View style={styles.timePickers}>
                <TouchableOpacity
                  style={styles.timeSelect}
                  onPress={() => setOpenPicker({ index: idx, field: 'hour' })}>
                  <Text style={[styles.timeSelectText, { color: colors.text }]}>{to12h(time).hour}</Text>
                  <Ionicons name="chevron-down" size={14} color="#0F766E" />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Poppins_700Bold', color: '#0F172A' }}>:</Text>
                <TouchableOpacity
                  style={styles.timeSelect}
                  onPress={() => setOpenPicker({ index: idx, field: 'minute' })}>
                  <Text style={[styles.timeSelectText, { color: colors.text }]}>{to12h(time).minute}</Text>
                  <Ionicons name="chevron-down" size={14} color="#0F766E" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeSelect}
                  onPress={() => setOpenPicker({ index: idx, field: 'meridiem' })}>
                  <Text style={[styles.timeSelectText, { color: colors.text }]}>{to12h(time).meridiem}</Text>
                  <Ionicons name="chevron-down" size={14} color="#0F766E" />
                </TouchableOpacity>
              </View>
              {reminderTimes.length > 1 && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    const next = reminderTimes.filter((_, i) => i !== idx);
                    setReminderTimes(next);
                    setTimesPerDay(String(next.length));
                  }}>
                  <Ionicons name="trash-outline" size={18} color="#0F766E" />
                </TouchableOpacity>
              )}
              {openPicker && openPicker.index === idx && (
                <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ScrollView style={{ maxHeight: 220 }}>
                    {(openPicker.field === 'hour' ? HOURS : openPicker.field === 'minute' ? MINUTES : MERIDIEMS).map(
                      (opt) => (
                        <TouchableOpacity
                          key={opt.toString()}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setTimePart(idx, openPicker.field, opt.toString());
                            setOpenPicker(null);
                          }}>
                          <Text style={[styles.dropdownText, { color: colors.text }]}>{opt}</Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          ))}

        {enableReminders && (
          <>
            <TouchableOpacity
              style={[styles.addDoseButton, { marginTop: 6 }]}
              onPress={() => {
                const next = [...reminderTimes, '12:00'];
                setReminderTimes(next);
                setTimesPerDay(String(next.length));
              }}>
              <Ionicons name="add" size={18} color="#0F766E" />
              <Text style={styles.addDoseText}>Add Another Dose</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 12, color: colors.text }]}>Snooze duration</Text>
            <View style={styles.chipRow}>
              {SNOOZE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    snoozeInterval === option.value && styles.chipActive,
                  ]}
                  onPress={() => setSnoozeInterval(option.value)}>
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.text },
                      snoozeInterval === option.value && styles.chipTextActive,
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        </View>

        <TouchableOpacity style={{ marginTop: 16 }} onPress={save}>
          {gradientButton}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFFFFA' },
  title: { fontSize: 26, fontFamily: 'Poppins_700Bold', color: '#0F172A' },
  subtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#475569', marginBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#00BFA6',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    gap: 10,
  },
  sectionLabel: { fontFamily: 'Poppins_700Bold', color: '#0F172A', marginTop: 12, textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5 },
  label: { fontFamily: 'Poppins_500Medium', color: '#0F172A', marginTop: 4 },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontFamily: 'Poppins_400Regular',
    color: '#0F172A',
    marginTop: 4,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 42,
    height: 42,
    backgroundColor: '#E0F7F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  addDoseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E0F7F3',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  addDoseText: { fontFamily: 'Poppins_500Medium', color: '#0F766E' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  chipActive: { backgroundColor: '#E0F7F3', borderWidth: 1, borderColor: '#0F766E' },
  chipText: { fontFamily: 'Poppins_400Regular', color: '#475569' },
  chipTextActive: { color: '#0F766E', fontFamily: 'Poppins_500Medium' },
  dosageRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dosageInput: { flex: 1 },
  unitPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  unitChipActive: { backgroundColor: '#E0F7F3', borderWidth: 1, borderColor: '#0F766E' },
  unitText: { fontFamily: 'Poppins_500Medium', color: '#475569' },
  unitTextActive: { color: '#0F766E' },
  timePickers: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between' },
  timeSelect: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7F1E7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeSelectText: { fontFamily: 'Poppins_600SemiBold', color: '#0F172A', fontSize: 14 },
  dropdown: {
    position: 'absolute',
    top: 56,
    left: 80,
    right: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7F1E7',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 10,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
  dropdownText: { fontFamily: 'Poppins_500Medium', color: '#0F172A' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  pill: { backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  pillActive: { backgroundColor: '#E0F7F3', borderColor: '#0F766E', borderWidth: 1 },
  pillText: { fontFamily: 'Poppins_500Medium', color: '#475569' },
  pillTextActive: { color: '#0F766E' },
  colorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  colorCircle: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: 'transparent' },
  colorCircleActive: { borderColor: '#0F766E' },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  emojiChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  emojiChipActive: { backgroundColor: '#E0F7F3', borderColor: '#0F766E', borderWidth: 1 },
  emojiText: { fontSize: 18 },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 16 },
  error: {
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    fontFamily: 'Poppins_500Medium',
  },
  reminderCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#EAFBF7',
    borderWidth: 1,
    borderColor: '#9DE5D8',
    gap: 10,
  },
  microCopy: { fontFamily: 'Poppins_400Regular', color: '#0F766E', fontSize: 12 },
  doseTag: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7F1E7',
  },
  doseTagText: { fontFamily: 'Poppins_600SemiBold', color: '#0F766E', fontSize: 12 },
});
