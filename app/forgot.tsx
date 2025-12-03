import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      Alert.alert('Check your inbox', 'Reset instructions have been sent (simulated).');
    } catch (e: any) {
      Alert.alert('Reset failed', e.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>

      <View style={styles.field}>
        <Ionicons name="mail-outline" size={18} color="#0BB69D" />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send reset email</Text>}
      </TouchableOpacity>

      <Link href="/login" style={styles.linkText}>Back to login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFFFFA', padding: 24, justifyContent: 'center', gap: 12 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 26, color: '#0F172A' },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#475569' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#00BFA6',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  input: { flex: 1, fontFamily: 'Poppins_500Medium', color: '#0F172A' },
  button: {
    backgroundColor: '#0BB69D',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#00BFA6',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  buttonText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 16 },
  linkText: { color: '#0BB69D', fontFamily: 'Poppins_600SemiBold', marginTop: 10, textAlign: 'center' },
});
