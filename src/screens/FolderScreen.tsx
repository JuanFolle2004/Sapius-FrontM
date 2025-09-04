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
import { getFolderProgress, FolderProgress } from '../services/gameService';
import { useUser } from '../context/UserContext';
import Prompt from 'react-native-prompt-android';
import { ActionSheetIOS, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

type Route = RouteProp<RootStackParamList, 'FolderScreen'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'FolderScreen'>;

type GameProgress = {
  [gameId: string]: { correct: boolean; answeredAt: string };
};

export default function FolderScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { token } = useUser()!;
  const { t } = useTranslation();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<GameProgress>({});

  // 🔹 Fetch folder + progress
  async function fetchFolder() {
    if (!token || !params?.folderId) return;
    try {
      const data = await getFolderWithGames(params.folderId);
      setFolder(data.folder);

      const prog: FolderProgress = await getFolderProgress(params.folderId);
      console.log("📊 Progress fetched:", prog);

      setProgress(prog.playedGames || {});

      // merge `played` flag into games
      const gamesWithProgress = data.games.map((g: Game) => ({
        ...g,
        played: !!prog.playedGames?.[g.id],
      }));
      setGames(gamesWithProgress);
    } catch (e) {
      console.log('❌ folder fetch error', e);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Refetch on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchFolder();
    }, [token, params?.folderId])
  );

  // 🔹 Generate games
  async function handleGenerate(difficulty: "same" | "easier" | "harder") {
    if (!folder) return;
    setGenerating(true);
    try {
      await generateGamesForFolder(folder.id, 5, difficulty);
      await fetchFolder();
    } catch (e) {
      console.log('❌ generate games error', e);
    } finally {
      setGenerating(false);
    }
  }

  function showGenerateOptions() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t('common.cancel'),
            t('folder.sameDifficulty'),
            t('folder.easier'),
            t('folder.harder'),
          ],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleGenerate("same");
          if (buttonIndex === 2) handleGenerate("easier");
          if (buttonIndex === 3) handleGenerate("harder");
        }
      );
    } else {
      Alert.alert(
        t('folder.generateMore'),
        t('folder.chooseDifficulty'),
        [
          { text: t('folder.sameDifficulty'), onPress: () => handleGenerate("same") },
          { text: t('folder.easier'), onPress: () => handleGenerate("easier") },
          { text: t('folder.harder'), onPress: () => handleGenerate("harder") },
          { text: t('common.cancel'), style: "cancel" },
        ]
      );
    }
  }

  // 🔹 Rename folder
  async function handleRename() {
    if (!folder) return;
    Prompt(
      t('folder.renameTitle'),
      t('folder.renamePrompt'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.ok'),
          onPress: async (newTitle) => {
            if (!newTitle || !newTitle.trim()) return;
            try {
              const updated = await updateFolder(folder.id, {
                title: newTitle,
                description: folder.description,
                prompt: folder.description || '',
              });
              setFolder(updated);
              Alert.alert(t('folder.renameSuccess'));
            } catch (e) {
              console.log('❌ rename error', e);
              Alert.alert(t('common.error'), t('folder.renameError'));
            }
          },
        },
      ],
      { defaultValue: folder.title }
    );
  }

  // 🔹 Delete folder
  async function handleDelete() {
    if (!folder) return;
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this folder?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFolder(folder.id);
            Alert.alert(t('folder.deleted'), t('folder.deleteSuccess'));
            navigation.goBack();
          } catch (e) {
            console.log('❌ delete error', e);
            Alert.alert(t('common.error'), t('folder.deleteError'));
          }
        },
      },
    ]);
  }

  // 🔹 Callback from GameScreen
  function markGameAsPlayedLocally(gameId: string, correct: boolean) {
    setProgress((prev) => ({
      ...prev,
      [gameId]: { correct, answeredAt: new Date().toISOString() },
    }));

    // also update local games with played = true
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, played: true } : g))
    );
  }

  // 🔹 Progress stats
  const totalPlayed = Object.keys(progress).length;
  const correctCount = Object.values(progress).filter((p) => p.correct).length;
  const percentage = totalPlayed > 0 ? Math.round((correctCount / totalPlayed) * 100) : 0;

  const unplayed = games.filter((g) => !g.played);
  const played = games.filter((g) => g.played);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!folder) return <View style={styles.center}><Text>{t('errors.folderNotFound')}</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{folder.title}</Text>
      {folder.description && <Text style={styles.subtitle}>{folder.description}</Text>}

      {/* 🔹 Folder progress */}
      <View style={{ marginVertical: 12 }}>
        <Text style={{ fontWeight: '600' }}>
          Progress: {correctCount}/{totalPlayed} ({percentage}%)
        </Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
      </View>

      {/* 🔹 Rename & Delete */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.renameBtn} onPress={handleRename}>
          <Text style={styles.actionText}>✏️ {t('folder.rename')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.actionText}>🗑️ {t('common.delete')}</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Generate more games */}
      <TouchableOpacity style={styles.generateBtn} onPress={showGenerateOptions} disabled={generating}>
        <Text style={styles.generateText}>
          {generating ? '⏳ Generating...' : t('folder.generateMore')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>{t('folder.games')}</Text>

      {/* 🔹 Unplayed */}
      <FlatList
        data={unplayed}
        keyExtractor={(g) => g.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('GameScreen', {
                gameId: item.id,
                folderId: folder.id,
                games,
                currentIndex: games.findIndex((x) => x.id === item.id),
                onPlayed: markGameAsPlayedLocally,
              } as any)
            }
          >
            <Text style={{ fontWeight: '600' }}>{item.title || `Game ${index + 1}`}</Text>
            <Text numberOfLines={2}>{item.question}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>🎉 {t('folder.allPlayed')}</Text>}
      />

      {/* 🔹 Played */}
      {played.length > 0 && <Text style={styles.subtitle}>{t('folder.played')}</Text>}

      <FlatList
        data={played}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => {
          const result = progress[item.id];
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#f3f4f6' }]}
              onPress={() =>
                navigation.navigate('GameScreen', {
                  gameId: item.id,
                  folderId: folder.id,
                  games,
                  currentIndex: games.findIndex((x) => x.id === item.id),
                  onPlayed: markGameAsPlayedLocally,
                } as any)
              }
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontWeight: '600' }}>{item.title || 'Game'}</Text>
                  <Text numberOfLines={2}>{item.question}</Text>
                </View>
                <Text style={{ fontSize: 22 }}>
                  {result?.correct ? '✅' : '❌'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginVertical: 8, color: '#555' },
  card: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    borderColor: '#ddd',
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
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 4,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#14b8a6',
    borderRadius: 4,
  },
});
