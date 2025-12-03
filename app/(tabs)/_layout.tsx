import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeMode } from '@/context/ThemeContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { colors, mode } = useThemeMode();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.subtext,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          height: 78,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: colors.card,
          borderTopWidth: 0,
          shadowColor: colors.accent,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -2 },
          elevation: 8,
        },
        tabBarLabelStyle: { fontFamily: 'Poppins_500Medium', fontSize: 12 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="addbutton"
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: () => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/add')}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                marginBottom: 24,
                position: 'absolute',
                top: -26,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0BB69D',
                shadowColor: '#00BFA6',
                shadowOpacity: 0.25,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              }}>
              <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={26} color={color} />,
        }}
      />
      {/* Explore tab removed */}
    </Tabs>
  );
}
