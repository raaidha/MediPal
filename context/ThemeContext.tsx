import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';

import { STORAGE_KEYS } from '../constants';

type ThemeMode = 'light' | 'dark';

const palettes = {
  light: {
    background: '#EFFFFA',
    card: '#FFFFFF',
    text: '#0F172A',
    subtext: '#475569',
    accent: '#0BB69D',
    border: '#E2E8F0',
  },
  dark: {
    background: '#0F172A',
    card: '#111827',
    text: '#F8FAFC',
    subtext: '#CBD5E1',
    accent: '#34D399',
    border: '#1F2937',
  },
} satisfies Record<ThemeMode, any>;

type ThemeContextValue = {
  mode: ThemeMode;
  colors: typeof palettes.light;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggle: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'light' || stored === 'dark') {
        setModeState(stored);
      }
    };
    load();
  }, []);

  const setMode = async (next: ThemeMode) => {
    setModeState(next);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, next);
  };

  const toggle = async () => {
    const next = mode === 'light' ? 'dark' : 'light';
    await setMode(next);
  };

  return <ThemeContext.Provider value={{ mode, colors: palettes[mode], setMode, toggle }}>{children}</ThemeContext.Provider>;
}

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used inside ThemeProvider');
  return ctx;
};
