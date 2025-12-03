import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeMode } from '../../../context/ThemeContext';

export default function AppearanceScreen() {
  const { mode, toggle, colors } = useThemeMode();
  const [isDark, setIsDark] = useState(mode === 'dark');

  useEffect(() => {
    setIsDark(mode === 'dark');
  }, [mode]);

  const onToggle = async () => {
    await toggle();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Text style={[styles.title, { color: colors.text }]}>Appearance</Text>
      <View style={[styles.row, { backgroundColor: colors.card, shadowColor: colors.accent }]}>
        <View>
          <Text style={[styles.label, { color: colors.text }]}>Dark mode</Text>
          <Text style={[styles.sub, { color: colors.subtext }]}>Toggle to switch theme preference</Text>
        </View>
        <Switch value={isDark} onValueChange={onToggle} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  sub: { fontFamily: 'Poppins_400Regular', fontSize: 12 },
});
