import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Game, Folder, RootStackParamList } from '../types';
import { getFolderWithGames, generateGamesForFolder } from '../services/folderService';
import { getMe } from '../services/userService';
import { useUser } from '../context/UserContext';

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

  useEffect(() => {
    fetchFolder();
  }, [token, params?.folderId]);

  // generate new games
  async function handleGenerate() {
    if (!folder) return;
    setGenerating(true);
    try {
      await generateGamesForFolder(folder.id);
      await fetchFolder();
    } catch (e) {
      console.log("❌ generate games error", e);
    } finally {
      setGenerating(false);
    }
  }

  // ✅ Callback: mark game as played locally (immediate feedback)
  function markGameAsPlayedLocally(gameId: string) {
    setPlayedGameIds((prev) =>
      prev.includes(gameId) ? prev : [...prev, gameId]
    );
  }

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!folder) return <View style={styles.center}><Text>Folder not found</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{folder.title}</Text>
      {folder.description && <Text style={styles.subtitle}>{folder.description}</Text>}

      {/* Generate more games button */}
      <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={generating}>
        <Text style={styles.generateText}>
          {generating ? "⏳ Generating..." : "➕ Generate More Games"}
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
              playedGameIds.includes(item.id) && { backgroundColor: '#e5e7eb' }
            ]}
            onPress={() =>
              navigation.navigate('GameScreen', {
                gameId: item.id,
                folderId: folder.id,
                games,
                currentIndex: index,
                onPlayed: markGameAsPlayedLocally, // ✅ pass callback
              } as any) // 👈 casting to any so we can add callback param
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
});
