export interface Medication {
  id: string;
  name: string;
  dosage: string;
  dosageAmount?: number;
  dosageUnit?: 'pill' | 'tablet' | 'capsule' | 'ml' | 'unit' | 'drop';
  timesPerDay?: number;
  frequency: number;
  duration: number;
  startDate: string;
  enableReminders: boolean;
  reminderTimes: string[];
  snoozeInterval: number;
  color: string;
  emoji: string;
  totalAmount?: number;
  remainingAmount?: number;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  takenAt: string;
  scheduledFor: string;
  status: 'taken' | 'skipped' | 'snoozed';
  snoozedUntil?: string;
}

export interface ReminderAlert {
  medication: Medication;
  scheduledTime: string;
  logId?: string;
}
