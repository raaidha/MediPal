import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

export default function LoadingScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: false,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace('/(tabs)');
    });
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ alignItems: 'center', opacity: fade }}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png' }}
          style={styles.logo}
        />
        <Text style={styles.title}>MediPal</Text>
        <Text style={styles.subtitle}>Your cute health companion</Text>
      </Animated.View>

      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressIndicator, { width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFFFFA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins_700Bold',
    color: '#0F766E',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#334155',
    marginBottom: 30,
  },
  progressBar: {
    width: '75%',
    height: 8,
    backgroundColor: '#CFF8EF',
    borderRadius: 14,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#00BFA6',
  },
});
