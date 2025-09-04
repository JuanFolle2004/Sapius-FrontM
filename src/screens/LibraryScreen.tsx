import React, { useCallback, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList, Folder } from '../types';
import { getDashboard } from '../services/dashboardService';
import { useUser } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ActionSheetIOS, Platform } from 'react-native';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Library'>;

export default function LibraryScreen() {
  const navigation = useNavigation<Nav>();
  const { logout, setUser } = useUser();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const showMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('common.cancel'), t('common.logout')],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) logout();
        }
      );
    } else {
      Alert.alert(
        t('common.options'),
        '',
        [
          { text: t('common.logout'), onPress: logout },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Library',
      headerRight: () => (
        <TouchableOpacity onPress={showMenu} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="settings-outline" size={22} color="#111827" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  async function fetchDashboard() {
    try {
      const data = await getDashboard();
      setFolders(data.folders || []);
      setUser(data.user);
    } catch (e: any) {
      console.log('❌ library dashboard error:', e?.message);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const openFolder = (folderId: string) => {
    navigation.navigate('FolderScreen', { folderId });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#14b8a6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.title}>Your Library</Text>

      <FlatList
        data={folders}
        keyExtractor={(f) => f.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.book} onPress={() => openFolder(item.id)} activeOpacity={0.85}>
            <LinearGradient
              colors={bookColors[index % bookColors.length]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.spine} />
            <Text numberOfLines={3} style={styles.bookTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No books yet.</Text>}
      />

      {/* Floating actions: Home + New Book */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Dashboard')}
        activeOpacity={0.9}
        style={[styles.homeBtn, { bottom: 16 + insets.bottom }]}
      >
        <Ionicons name="home-outline" size={18} color="#ffffff" />
        <Text style={styles.newBookText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('CourseGeneration')}
        activeOpacity={0.9}
        style={[styles.newBookBtn, { bottom: 16 + insets.bottom }]}
      >
        <Ionicons name="book-outline" size={18} color="#ffffff" />
        <Text style={styles.newBookText}>New Book</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8 },
  book: {
    width: (Dimensions.get('window').width - 16 * 2 - 12) / 2, // padding*2 + gap
    height: 160,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  bookTitle: { color: '#111827', fontWeight: '800', fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 24, color: '#555' },
  newBookBtn: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#14b8a6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  homeBtn: {
    position: 'absolute',
    left: 16,
    backgroundColor: '#14b8a6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  newBookText: { color: 'white', fontWeight: '800', marginLeft: 8 },
});

const bookColors: [string, string][] = [
  ['#fef3c7', '#fde68a'],
  ['#e9d5ff', '#d8b4fe'],
  ['#bfdbfe', '#93c5fd'],
  ['#bbf7d0', '#86efac'],
  ['#fecaca', '#fca5a5'],
  ['#bae6fd', '#7dd3fc'],
];
