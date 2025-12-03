import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (password !== confirm) {
      Alert.alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup(username.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Sign up failed', e.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <View style={styles.field}>
        <Ionicons name="person-outline" size={18} color="#0BB69D" />
        <TextInput
          placeholder="Username"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
      </View>

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

      <View style={styles.field}>
        <Ionicons name="lock-closed-outline" size={18} color="#0BB69D" />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Ionicons name="lock-closed-outline" size={18} color="#0BB69D" />
        <TextInput
          placeholder="Confirm password"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <View style={styles.linksRow}>
        <Text style={styles.secondaryText}>Already have an account?</Text>
        <Link href="/login" style={styles.linkText}>Log in</Link>
      </View>
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
  linksRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' },
  linkText: { color: '#0BB69D', fontFamily: 'Poppins_600SemiBold' },
  secondaryText: { color: '#475569', fontFamily: 'Poppins_400Regular' },
});
