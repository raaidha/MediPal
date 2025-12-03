import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AVATARS } from '../../../constants/avatars';
import { useAuth } from '../../../context/AuthContext';
import { useThemeMode } from '../../../context/ThemeContext';
import { avatarSources } from '../../../lib/avatarSources';

export default function ProfileScreen() {
  const { user, updateProfile, changePassword } = useAuth();
  const { colors } = useThemeMode();
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? 'avatar1');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = async () => {
    try {
      await updateProfile({ username: username.trim(), email: email.trim(), avatar });
      Alert.alert('Updated', 'Profile saved');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update');
    }
  };

  const handleChangePassword = async () => {
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Updated', 'Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not change password');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Manage your account</Text>

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.accent }]}>
          <Text style={[styles.label, { color: colors.text }]}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholderTextColor={colors.subtext}
          />

          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholderTextColor={colors.subtext}
            keyboardType="email-address"
          />

          <Text style={[styles.label, { color: colors.text }]}>Choose an avatar</Text>
          <View style={styles.avatarRow}>
            {avatarSources.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[
                  styles.avatarChip,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  avatar === a.id && { borderColor: colors.accent, backgroundColor: '#E0F7F3' },
                ]}
                onPress={() => setAvatar(a.id)}>
                {avatar === a.id && (
                  <View style={styles.avatarOverlay}>
                    <Ionicons name="checkmark" size={16} color="#0BB69D" />
                  </View>
                )}
                <Image source={a.source} style={styles.avatarImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSave}>
            <Text style={styles.saveText}>Save profile</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.accent }]}>
          <Text style={[styles.label, { color: colors.text }]}>Change password</Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Current password"
            placeholderTextColor={colors.subtext}
            secureTextEntry
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="New password"
            placeholderTextColor={colors.subtext}
            secureTextEntry
          />
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleChangePassword}>
            <Text style={styles.saveText}>Update password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 22 },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 14, marginBottom: 12 },
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 10,
  },
  label: { fontFamily: 'Poppins_600SemiBold' },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    fontFamily: 'Poppins_500Medium',
  },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatarChip: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChipActive: { borderColor: '#0BB69D', backgroundColor: '#E0F7F3' },
  avatarOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 48, height: 48, borderRadius: 16 },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontFamily: 'Poppins_700Bold' },
});
