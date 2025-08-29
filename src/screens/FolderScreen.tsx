import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Game, Folder, RootStackParamList } from '../types';
import { getFolderWithGames } from '../services/folderService';
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

  // Fetch folder + games
  useEffect(() => {
    if (!token || !params?.folderId) return;

    (async () => {
      try {
        const data = await getFolderWithGames(params.folderId);
        setFolder(data.folder);
        setGames(data.games);
      } catch (e) {
        console.log('❌ folder fetch error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, params?.folderId]);

  // Replace back behavior → always go to Dashboard
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            })
          }
          style={{ marginLeft: 10 }}
        >
          <Text style={{ color: '#14b8a6', fontWeight: '700' }}>⬅️ Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!folder) return <View style={styles.center}><Text>Folder not found</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{folder.title}</Text>
      {folder.description && <Text style={styles.subtitle}>{folder.description}</Text>}

      <Text style={styles.subtitle}>Games</Text>
      <FlatList
        data={games}
        keyExtractor={(g) => g.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('GameScreen', {
                gameId: item.id,
                folderId: folder.id,
                games,
                currentIndex: index,
              })
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
});
