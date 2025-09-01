import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Game, Folder, RootStackParamList } from '../types';
import {
  getFolderWithGames,
  generateGamesForFolder,
  updateFolder,
  deleteFolder,
} from '../services/folderService';
import { getMe } from '../services/userService';
import { useUser } from '../context/UserContext';

// ✅ For rename input
import Prompt from 'react-native-prompt-android';

type Route = RouteProp<RootStackParamList, 'FolderScreen'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'FolderScreen'>;

export default function FolderScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { token } = useUser()!;

  const [folder, setFolder] = useState<Folder | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [playedGameIds, setPlayedGameIds] = useState<string[]>([]);

  // fetch folder and user played games
  async function fetchFolder() {
    if (!token || !params?.folderId) return;
    try {
      const data = await getFolderWithGames(params.folderId);
      setFolder(data.folder);
      setGames(data.games);

      const user = await getMe(token);
      setPlayedGameIds(user.playedGameIds || []);
    } catch (e) {
      console.log('❌ folder fetch error', e);
    } finally {
      setLoading(false);
    }
  }

  // 👇 Refetch whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchFolder();
    }, [token, params?.folderId])
  );

  // generate new games
  async function handleGenerate() {
    if (!folder) return;
    setGenerating(true);
    try {
      await generateGamesForFolder(folder.id);
      await fetchFolder(); // refresh after generation
    } catch (e) {
      console.log('❌ generate games error', e);
    } finally {
      setGenerating(false);
    }
  }

  // ✅ Rename folder with prompt
  async function handleRename() {
    if (!folder) return;
    Prompt(
      'Rename Folder',
      'Enter a new name for this folder:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async (newTitle) => {
            if (!newTitle || !newTitle.trim()) return;
            try {
              const updated = await updateFolder(folder.id, {
                title: newTitle,
                description: folder.description,
                prompt: folder.description || '',
              });
              setFolder(updated);
              Alert.alert('✅ Success', 'Folder renamed');
            } catch (e) {
              console.log('❌ rename error', e);
              Alert.alert('Error', 'Could not rename folder');
            }
          },
        },
      ],
      { defaultValue: folder.title }
    );
  }

  // ✅ Delete folder
  async function handleDelete() {
    if (!folder) return;
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this folder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFolder(folder.id);
            Alert.alert('Deleted', 'Folder removed');
            navigation.goBack(); // go back to Dashboard
          } catch (e) {
            console.log('❌ delete error', e);
            Alert.alert('Error', 'Could not delete folder');
          }
        },
      },
    ]);
  }

  // ✅ Callback: mark game as played locally (immediate feedback)
  function markGameAsPlayedLocally(gameId: string) {
    setPlayedGameIds((prev) => (prev.includes(gameId) ? prev : [...prev, gameId]));
  }

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!folder) return <View style={styles.center}><Text>Folder not found</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{folder.title}</Text>
      {folder.description && <Text style={styles.subtitle}>{folder.description}</Text>}

      {/* Rename & Delete actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.renameBtn} onPress={handleRename}>
          <Text style={styles.actionText}>✏️ Rename</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.actionText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Generate more games button */}
      <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={generating}>
        <Text style={styles.generateText}>
          {generating ? '⏳ Generating...' : '➕ Generate More Games'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Games</Text>
      <FlatList
        data={games}
        keyExtractor={(g) => g.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.card,
              playedGameIds.includes(item.id) && { backgroundColor: '#e5e7eb' },
            ]}
            onPress={() =>
              navigation.navigate('GameScreen', {
                gameId: item.id,
                folderId: folder.id,
                games,
                currentIndex: index,
                onPlayed: markGameAsPlayedLocally, // ✅ pass callback
              } as any)
            }
          >
            <Text style={{ fontWeight: '600' }}>{item.title}</Text>
            <Text numberOfLines={2}>{item.question}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No games in this folder yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 12, color: '#555' },
  card: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
  },
  generateBtn: {
    backgroundColor: '#14b8a6',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  generateText: { color: 'white', fontWeight: '700' },
  actions: { flexDirection: 'row', marginBottom: 12 },
  renameBtn: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
  },
  actionText: { color: 'white', fontWeight: '700' },
});
