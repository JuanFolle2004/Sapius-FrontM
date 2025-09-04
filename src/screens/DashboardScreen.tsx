import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ActionSheetIOS, Platform, Alert } from 'react-native';
import { useEnergy } from '../hooks/useEnergy';
import { setLanguage } from '../i18n';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { logout, user } = useUser();
  const { t, i18n } = useTranslation();
  const { energy, max, refill, batterySegments } = useEnergy(5);

  // 👇 Configure header (life + logout)
  const showLanguageChooser = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('common.cancel'), t('common.english'), t('common.spanish')],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) setLanguage('en');
          if (idx === 2) setLanguage('es');
        }
      );
    } else {
      Alert.alert(
        t('common.language'),
        '',
        [
          { text: t('common.english'), onPress: () => setLanguage('en') },
          { text: t('common.spanish'), onPress: () => setLanguage('es') },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    }
  };

  const showMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('common.cancel'), t('common.language'), t('common.logout')],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) showLanguageChooser();
          if (idx === 2) logout();
        }
      );
    } else {
      Alert.alert(
        t('common.options'),
        '',
        [
          { text: t('common.language'), onPress: showLanguageChooser },
          { text: t('common.logout'), onPress: logout },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    }
  };
  
  const xp = (user?.playedGameIds?.length || 0) * 10;
  const streakDays = 0; // TODO: wire to backend or daily activity

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <LinearGradient colors={['#ecfdf5', '#f9fafb']} style={styles.container}>
      {/* Top bar: XP, Energy, Settings */}
      <View style={styles.topBar}>
        <View style={styles.xpPill}>
          <Ionicons name="flash" size={16} color="#f59e0b" />
          <Text style={styles.xpText}>{xp} XP</Text>
        </View>

        <View style={styles.energyContainer}>
          {batterySegments.map((filled, idx) => (
            <View key={idx} style={[styles.energySegment, filled ? styles.energyFilled : styles.energyEmpty]} />
          ))}
          <View style={styles.energyCap} />
          <Text style={styles.energyLabel}>{energy}/{max}</Text>
        </View>

        <TouchableOpacity onPress={showMenu} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Greeting + Logo */}
      <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
      <Text style={styles.greeting}>Hi {user?.name || 'Player'} 👋</Text>

      {/* Cards row 1: Streak */}
      <View style={styles.cardRow}>
        <View style={[styles.bigCard, styles.cardStreak]}> 
          <Text style={styles.cardTitle}>Streak</Text>
          <Text style={styles.streakValue}>{streakDays} days</Text>
        </View>
      </View>

      {/* Cards row 2: Library and Leagues */}
      <View style={styles.cardRow}>
        <TouchableOpacity style={[styles.squareCard, styles.cardLibrary]} onPress={() => navigation.navigate('Library')}>
          <Ionicons name="library-outline" size={24} color="#1f2937" />
          <Text style={styles.squareText}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.squareCard, styles.cardLeagues]} onPress={() => navigation.navigate('Leagues')}>
          <Ionicons name="trophy-outline" size={24} color="#1f2937" />
          <Text style={styles.squareText}>Leagues</Text>
        </TouchableOpacity>
      </View>

      {/* Optional: Refill energy quick action */}
      <TouchableOpacity style={styles.refillBtn} onPress={() => refill()}>
        <Text style={styles.refillText}>Refill Energy</Text>
      </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 12,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  xpPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  xpText: { marginLeft: 6, fontWeight: '700', color: '#92400e' },
  energyContainer: { flexDirection: 'row', alignItems: 'center' },
  energySegment: { width: 12, height: 18, marginRight: 2, borderRadius: 2 },
  energyFilled: { backgroundColor: '#10b981' },
  energyEmpty: { backgroundColor: '#e5e7eb' },
  energyCap: { width: 2, height: 10, backgroundColor: '#111827', marginLeft: 2, marginRight: 6 },
  energyLabel: { fontSize: 12, color: '#111827' },
  settingsBtn: { paddingHorizontal: 6, paddingVertical: 6 },
  greeting: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bigCard: { flex: 1, backgroundColor: '#ffffff', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardStreak: { backgroundColor: '#dbeafe' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  streakValue: { marginTop: 8, fontSize: 28, fontWeight: '800', color: '#1f2937' },
  squareCard: { flex: 1, backgroundColor: '#ffffff', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardLibrary: { marginRight: 8, backgroundColor: '#f0fdf4' },
  cardLeagues: { marginLeft: 8, backgroundColor: '#fff1f2' },
  squareText: { marginTop: 6, fontSize: 16, fontWeight: '700', color: '#1f2937' },
  refillBtn: { marginTop: 'auto', backgroundColor: '#14b8a6', padding: 14, borderRadius: 14, alignItems: 'center' },
  refillText: { color: 'white', fontWeight: '700' },
});
