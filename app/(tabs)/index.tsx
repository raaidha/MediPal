import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MedicineCard from '../../components/MedicineCard';
import { useAuth } from '../../context/AuthContext';
import { useMedications } from '../../hooks/useMedications';
import { avatarSources } from '../../lib/avatarSources';
import { useThemeMode } from '../../context/ThemeContext';

export default function Home() {
  const { medications } = useMedications();
  const { user } = useAuth();
  const { colors } = useThemeMode();
  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();
  const greeting = user?.username ? `Hi, ${user.username}` : 'Hi';
  const avatarIndex = avatarSources.findIndex((a) => a.id === (user?.avatar ?? 'avatar1'));
  const avatarImg = avatarSources[avatarIndex >= 0 ? avatarIndex : 0].source;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.headerCard, { backgroundColor: colors.card, shadowColor: colors.accent }]}>
        <View style={[styles.avatar, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}>
          <Image source={avatarImg} style={styles.avatarImage} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{greeting}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.accent }]}>{dateLabel}</Text>
          <Text style={[styles.headerTagline, { color: colors.subtext }]}>Small steps make a big change.</Text>
        </View>
      </View>

      {medications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.card, shadowColor: colors.accent }]}>
            <Ionicons name="sparkles" size={38} color={colors.accent} />
          </View>
          <Text style={[styles.emptyText, { color: colors.text }]}>No medicines yet!</Text>
          <Text style={[styles.subText, { color: colors.subtext }]}>Tap the + button to add your first medication.</Text>
        </View>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MedicineCard med={item} />}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 22,
    marginBottom: 18,
    marginTop: 18,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E0F7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImage: { width: 68, height: 68, borderRadius: 34 },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
  headerSubtitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, marginTop: 4 },
  headerTagline: { fontFamily: 'Poppins_500Medium', fontSize: 12, marginTop: 4 },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAFBF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  emptyText: { fontSize: 20, fontFamily: 'Poppins_700Bold', marginTop: 14 },
  subText: { fontSize: 14, fontFamily: 'Poppins_400Regular', marginTop: 6, textAlign: 'center' },
});
