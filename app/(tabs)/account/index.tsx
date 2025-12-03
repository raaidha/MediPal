import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../../context/AuthContext';
import { useThemeMode } from '../../../context/ThemeContext';

export default function AccountScreen() {
  const { logout } = useAuth();
  const { colors } = useThemeMode();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Text style={[styles.title, { color: colors.text }]}>Account</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>Manage your profile, appearance, and sign out.</Text>

      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.accent }]}>
        <Link href="/(tabs)/account/profile" asChild>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="person-outline" size={20} color={colors.accent} />
              <Text style={[styles.rowText, { color: colors.text }]}>Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/account/appearance" asChild>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="color-palette-outline" size={20} color={colors.accent} />
              <Text style={[styles.rowText, { color: colors.text }]}>Personalization</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={[styles.row, styles.logoutRow]} onPress={handleLogout}>
          <View style={styles.rowLeft}>
            <Ionicons name="log-out-outline" size={20} color="#B91C1C" />
            <Text style={[styles.rowText, { color: '#B91C1C' }]}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#B91C1C" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 22 },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 14, marginBottom: 12 },
  card: {
    borderRadius: 16,
    paddingVertical: 6,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  logoutRow: { borderBottomWidth: 0 },
});
