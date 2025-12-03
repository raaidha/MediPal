import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useThemeMode } from '../context/ThemeContext';
import { useMedications } from '../hooks/useMedications';
import { Medication } from '../types';

interface Props {
  med: Medication;
}

export default function MedicineCard({ med }: Props) {
  const { deleteMedication, deleteDose } = useMedications();
  const router = useRouter();
  const { colors } = useThemeMode();

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => router.push({ pathname: '/edit', params: { id: med.id } })} style={styles.touchable}>
      <View
        style={[
          styles.card,
          {
            borderColor: med.color || colors.border,
            backgroundColor: colors.card,
            shadowColor: colors.accent,
          },
        ]}>
        <View style={styles.header}>
          <View style={styles.iconPill}>
            <Text style={styles.iconPillText}>{med.emoji}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.title, { color: colors.text }]}>{med.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="calendar-outline" size={12} color="#0BB69D" />
                <Text style={styles.badgeText}>{med.duration} days</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="repeat" size={12} color="#0BB69D" />
                <Text style={styles.badgeText}>{med.frequency}x daily</Text>
              </View>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => deleteMedication(med.id)}>
              <Ionicons name="trash-outline" size={18} color="#E16162" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push({ pathname: '/edit', params: { id: med.id } })}>
              <Ionicons name="pencil" size={18} color="#0BB69D" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.detail, { color: colors.text }]}>
          Dosage: {med.dosageAmount ?? '-'} {med.dosageUnit ?? ''}
        </Text>
        <Text style={[styles.detail, { color: colors.text }]}>Times per day: {med.timesPerDay ?? med.reminderTimes.length}</Text>
        {med.remainingAmount !== undefined && med.dosageUnit && (med.dosageUnit === 'pill' || med.dosageUnit === 'tablet' || med.dosageUnit === 'capsule') && (
          <Text style={[styles.detail, { color: colors.text }]}>Remaining: {med.remainingAmount} left</Text>
        )}

        {med.enableReminders && (
          <View style={styles.dosesRow}>
            {med.reminderTimes.map((time) => (
              <View key={time} style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.chipText, { color: colors.text }]}>{time}</Text>
                <TouchableOpacity onPress={() => deleteDose(med.id, time)}>
                  <Ionicons name="close" size={14} color="#0F766E" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: { width: '100%' },
  card: {
    padding: 16,
    marginVertical: 10,
    borderRadius: 20,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    gap: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillText: { fontSize: 20 },
  title: { fontSize: 17, fontFamily: 'Poppins_700Bold' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EAFBF7',
    borderRadius: 10,
  },
  badgeText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#0BB69D' },
  actions: { flexDirection: 'row', gap: 12, marginLeft: 6, alignItems: 'center' },
  detail: { marginTop: 4, fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#334155' },
  dosesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: '#0F766E' },
});
