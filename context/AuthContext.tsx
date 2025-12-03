import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { STORAGE_KEYS } from '../constants';

type StoredUser = {
  id: string;
  email: string;
  username: string;
  password: string;
  avatar: string;
};

type AuthContextValue = {
  user: Omit<StoredUser, 'password'> | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (updates: { username?: string; email?: string; avatar?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ensureId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<Omit<StoredUser, 'password'> | null>(null);
  const [initializing, setInitializing] = useState(true);

  const loadSession = async () => {
    const storedCurrent = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (storedCurrent) {
      setUser(JSON.parse(storedCurrent));
    }
    setInitializing(false);
  };

  useEffect(() => {
    loadSession();
  }, []);

  const persistUser = async (u: StoredUser | null) => {
    if (u) {
      const { password, ...publicUser } = u;
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(publicUser));
      setUser(publicUser);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      setUser(null);
    }
  };

  const readUsers = async (): Promise<StoredUser[]> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return stored ? JSON.parse(stored) : [];
  };

  const writeUsers = async (users: StoredUser[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  };

  const signup = async (username: string, email: string, password: string) => {
    const users = await readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already in use.');
    }
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already taken.');
    }
    const newUser: StoredUser = {
      id: ensureId(),
      email,
      username,
      password,
      avatar: 'avatar1',
    };
    const updated = [...users, newUser];
    await writeUsers(updated);
    await persistUser(newUser);
  };

  const login = async (email: string, password: string) => {
    const users = await readUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!found) throw new Error('Invalid email or password.');
    await persistUser(found);
  };

  const logout = async () => {
    await persistUser(null);
  };

  const forgotPassword = async (email: string) => {
    const users = await readUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('No account found with that email.');
    Alert.alert('Reset email', 'A reset link would be sent to your email (simulated).');
  };

  const updateProfile = async (updates: { username?: string; email?: string; avatar?: string }) => {
    const users = await readUsers();
    if (!user) throw new Error('Not logged in');
    const me = users.find((u) => u.id === user.id);
    if (!me) throw new Error('Session expired. Please log in again.');

    if (updates.email && updates.email.toLowerCase() !== me.email.toLowerCase()) {
      if (users.some((u) => u.email.toLowerCase() === updates.email?.toLowerCase() && u.id !== me.id)) {
        throw new Error('Email already in use.');
      }
    }
    if (updates.username && updates.username.toLowerCase() !== me.username.toLowerCase()) {
      if (users.some((u) => u.username.toLowerCase() === updates.username?.toLowerCase() && u.id !== me.id)) {
        throw new Error('Username already taken.');
      }
    }

    const updatedUser: StoredUser = {
      ...me,
      ...updates,
    };
    const newList = users.map((u) => (u.id === me.id ? updatedUser : u));
    await writeUsers(newList);
    await persistUser(updatedUser);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const users = await readUsers();
    if (!user) throw new Error('Not logged in');
    const me = users.find((u) => u.id === user.id);
    if (!me) throw new Error('Session expired. Please log in again.');
    if (me.password !== currentPassword) throw new Error('Current password is incorrect.');
    const updatedUser: StoredUser = { ...me, password: newPassword };
    const newList = users.map((u) => (u.id === me.id ? updatedUser : u));
    await writeUsers(newList);
    await persistUser(updatedUser);
  };

  const value = useMemo(
    () => ({ user, initializing, login, signup, logout, forgotPassword, updateProfile, changePassword }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
