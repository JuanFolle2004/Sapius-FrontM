import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Button,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Folder } from '../types';
import { useUser } from '../context/UserContext';
import { getDashboard } from '../services/dashboardService';
import { getRandomFolderWithGames } from '../services/folderService';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { logout, token, setUser, user } = useUser();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  // 👇 Configure header buttons (logout + disable back)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title="Logout" onPress={logout} />,
      headerBackVisible: false,   // 🚫 hide back arrow
      gestureEnabled: false,      // 🚫 disable swipe-back gesture
    });
  }, [navigation, logout]);

  // 👇 Fetch dashboard data
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        console.log('🔐 fetching: /dashboard');
        const data = await getDashboard();
        console.log('📊 Dashboard loaded:', data);
        setFolders(data.folders || []);
        setUser(data.user); // 👈 keep context user in sync
      } catch (e: any) {
        console.log('❌ dashboard error:', {
          message: e?.message,
          status: e?.response?.status,
          url: e?.response?.config?.url,
          data: e?.response?.data,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const openFolder = (folderId: string) => {
    navigation.navigate('FolderScreen', { folderId });
  };

  const openRandomTrivia = async () => {
    try {
      const { folder, games } = await getRandomFolderWithGames();

      if (games.length > 0) {
        // 🚀 Jump straight into GameScreen with first game + full list
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
      console.log('❌ random trivia error', e?.response?.data || e?.message);
      Alert.alert('Error', 'Could not load random trivia.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.welcome}>
        Welcome, {user?.name || 'User'}!
      </Text>

      {/* ➕ New AI Folder button */}
      <TouchableOpacity
        style={styles.newFolderBtn}
        onPress={() => navigation.navigate('CourseGeneration')}
      >
        <Text style={styles.newFolderText}>➕ New AI Folder</Text>
      </TouchableOpacity>

      {/* 🎲 Random Trivia button */}
      <TouchableOpacity
        style={styles.randomBtn}
        onPress={openRandomTrivia}
      >
        <Text style={styles.randomText}>🎲 Random Trivia</Text>
      </TouchableOpacity>

      {/* User's saved folders */}
      <FlatList
        data={folders}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openFolder(item.id)}>
            <Text style={styles.title}>{item.title}</Text>
            {!!item.description && <Text>{item.description}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 20 }}>No folders yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  card: { padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },

  // ➕ New AI Folder
  newFolderBtn: {
    backgroundColor: '#14b8a6',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  newFolderText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },

  // 🎲 Random Trivia
  randomBtn: {
    backgroundColor: '#f59e0b',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  randomText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
