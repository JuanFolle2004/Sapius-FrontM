import React, { useState, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Button,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Folder } from '../types';
import { useUser } from '../context/UserContext';
import { getDashboard } from '../services/dashboardService';
import { getRandomFolderWithGames } from '../services/folderService';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ActionSheetIOS, Platform } from 'react-native';
import { setLanguage } from '../i18n';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { logout, token, setUser, user } = useUser();
  const { t, i18n } = useTranslation();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={styles.lifeContainer}>
          <View style={styles.lifeBarBackground}>
            <View style={styles.lifeBarFill} />
          </View>
          <Text style={styles.lifeText}>5/5</Text>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={showMenu} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="ellipsis-vertical" size={22} color="#111827" />
        </TouchableOpacity>
      ),
      headerBackVisible: false,
      gestureEnabled: false,
    });
  }, [navigation, logout, i18n.language, t]);

  // 👇 Fetch dashboard data
  async function fetchDashboard() {
    if (!token) return;
    try {
      const data = await getDashboard();
      setFolders(data.folders || []);
      setUser(data.user);
    } catch (e: any) {
      console.log('❌ dashboard error:', e?.message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Refetch on focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [token])
  );

  const openFolder = (folderId: string) => {
    navigation.navigate('FolderScreen', { folderId });
  };

  const openRandomTrivia = async () => {
    try {
      const { folder, games } = await getRandomFolderWithGames();
      if (games.length > 0) {
        navigation.navigate('GameScreen', {
          gameId: games[0].id,
          folderId: folder.id,
          games,
          currentIndex: 0,
        });
      } else {
        Alert.alert('No games available', 'Could not load random trivia.');
      }
    } catch (e: any) {
      Alert.alert('Error', 'Could not load random trivia.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#14b8a6" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#ecfdf5', '#f9fafb']} style={styles.container}>
      {/* 👇 Logo at the top */}
      <Image
        source={require('../../assets/images/Logo.png')}
        style={styles.logo}
      />

      <Text style={styles.welcome}>
        {t('dashboard.welcome', { name: user?.name || t('common.user') })}
      </Text>

      {/* ➕ New AI Folder */}
      <TouchableOpacity
        style={styles.newFolderBtn}
        onPress={() => navigation.navigate('CourseGeneration')}
      >
        <Text style={styles.newFolderText}>{t('dashboard.newAIFolder')}</Text>
      </TouchableOpacity>

      {/* 🎲 Random Trivia */}
      <TouchableOpacity style={styles.randomBtn} onPress={openRandomTrivia}>
        <Text style={styles.randomText}>{t('dashboard.randomTrivia')}</Text>
      </TouchableOpacity>

      {/* 📂 Folders */}
      <FlatList
        data={folders}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openFolder(item.id)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {!!item.description && (
              <Text style={styles.cardSubtitle}>{item.description}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('dashboard.noFolders')}</Text>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // 👇 Logo
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 12,
  },

  welcome: { fontSize: 22, fontWeight: '700', marginBottom: 20 },

  // ❤️ Life bar
  lifeContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  lifeBarBackground: {
    width: 80,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 7,
    marginRight: 6,
  },
  lifeBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 7,
  },
  lifeText: { fontSize: 12, fontWeight: '600' },

  // ➕ New AI Folder
  newFolderBtn: {
    backgroundColor: '#14b8a6',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newFolderText: { color: 'white', fontWeight: '700', fontSize: 16 },

  // 🎲 Random Trivia
  randomBtn: {
    backgroundColor: '#f59e0b',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  randomText: { color: 'white', fontWeight: '700', fontSize: 16 },

  // 📂 Folder cards
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#555' },

  emptyText: { textAlign: 'center', marginTop: 20, color: '#555' },
});
