import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingView from '../../components/LoadingView';

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
  const insets = useSafeAreaInsets();

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

  // Start playing from the first unplayed game, else alert
  const handlePlayUnplayed = () => {
    if (!folder) return;
    const first = unplayed[0];
    if (!first) {
      Alert.alert(t('folder.noMore'));
      return;
    }
    navigation.navigate('GameScreen', {
      gameId: first.id,
      folderId: folder.id,
      games,
      currentIndex: games.findIndex((x) => x.id === first.id),
      onPlayed: markGameAsPlayedLocally,
    } as any);
  };

  if (loading) return <LoadingView />;
  if (!folder) return <SafeAreaView style={styles.center} edges={['top', 'bottom']}><Text>{t('errors.folderNotFound')}</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Library button stacked above the book header */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Library')}
        activeOpacity={0.9}
        style={styles.libraryBtn}
      >
        <Ionicons name="library-outline" size={18} color="#ffffff" />
        <Text style={styles.libraryBtnText}>{t('common.library')}</Text>
      </TouchableOpacity>

      {/* Book cover header directly below the Library button */}
      <View style={styles.bookHeader}>
        <View style={styles.spine} />
        <Text numberOfLines={2} style={styles.bookTitle}>{folder.title}</Text>
      </View>

      {/* Primary actions above the list */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryPlayBtn} onPress={handlePlayUnplayed}>
          <Text style={styles.primaryPlayText}>{t('folder.play')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.generateBtn} onPress={showGenerateOptions} disabled={generating}>
          <Text style={styles.generateText}>{generating ? t('common.loading') : t('folder.generateMore')}</Text>
        </TouchableOpacity>
      </View>

      {/* Pages: show only played games as pages */}
      <FlatList
        data={played}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item, index }) => {
          const result = progress[item.id];
          const played = !!result;
          return (
            <View style={[styles.pageCard, played && styles.pagePlayed]}>
              <View style={styles.pageHeader}>
                <Text style={styles.pageNumber}>{t('folder.page')} {index + 1}</Text>
                <Text style={styles.pageStatus}>{played ? (result?.correct ? '✅' : '❌') : '⏳'}</Text>
              </View>
              <Text numberOfLines={2} style={styles.pageTitle}>{item.title || 'Question'}</Text>
              <Text numberOfLines={2} style={styles.pagePreview}>{item.question}</Text>
              <TouchableOpacity
                style={styles.playBtn}
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
                <Text style={styles.playText}>{t('folder.play')}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Bottom fade so items gently disappear under the action bar */}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(248,250,252,0)", "rgba(248,250,252,0.85)", "#f8fafc"]}
        style={styles.bottomFade}
      />

      {/* Bottom actions: rename / delete */}
      <View style={[styles.bottomBar, { bottom: 16 + insets.bottom }]}>
        <TouchableOpacity style={styles.renameBtn} onPress={handleRename}>
          <Text style={styles.actionText}>{t('folder.rename')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.actionText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  bookHeader: {
    height: 80,
    backgroundColor: '#fde68a',
    borderRadius: 16,
    marginBottom: 12,
    justifyContent: 'center',
    paddingLeft: 16,
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
    width: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  bookTitle: { fontSize: 22, fontWeight: '800', color: '#1f2937', paddingLeft: 8 },
  pageCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  pagePlayed: {
    backgroundColor: '#f9fafb',
  },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  pageNumber: { color: '#6b7280', fontWeight: '700' },
  pageStatus: { fontSize: 18 },
  pageTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  pagePreview: { color: '#4b5563' },
  playBtn: { marginTop: 10, backgroundColor: '#14b8a6', padding: 12, borderRadius: 12, alignItems: 'center' },
  playText: { color: 'white', fontWeight: '700' },
  addPagesBtn: { marginTop: 6, backgroundColor: '#f59e0b', padding: 12, borderRadius: 12, alignItems: 'center' },
  addPagesText: { color: 'white', fontWeight: '700' },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  renameBtn: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 12, flex: 1, marginRight: 8, alignItems: 'center' },
  deleteBtn: { backgroundColor: '#ef4444', padding: 14, borderRadius: 12, flex: 1, marginLeft: 8, alignItems: 'center' },
  actionText: { color: 'white', fontWeight: '700' },
  libraryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#14b8a6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  libraryBtnText: { color: 'white', fontWeight: '800' },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
    zIndex: 10,
  },
  // New styles for top actions
  actionsContainer: {
    marginBottom: 12,
  },
  primaryPlayBtn: {
    backgroundColor: '#14b8a6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryPlayText: { color: 'white', fontWeight: '800' },
  generateBtn: {
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateText: { color: 'white', fontWeight: '700' },
});
