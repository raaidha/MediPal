import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { MedicationsProvider } from '../context/MedicationsContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../lib/notificationSetup';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const segments = useSegments();
  const router = useRouter();
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;
    const inAuth = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'forgot';
    if (!user && !inAuth) {
      router.replace('/login');
    }
    if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [segments, user, initializing]);

  if (initializing) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <MedicationsProvider>
            <RootNavigator />
          </MedicationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
