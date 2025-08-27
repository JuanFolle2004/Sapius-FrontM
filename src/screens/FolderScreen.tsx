import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Folder, Game } from '../types';
import { getFolderById } from '../services/folderService';
import { getGamesByFolder } from '../services/gameService';

type FolderRoute = RouteProp<RootStackParamList, 'FolderScreen'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'FolderScreen'>;

export default function FolderScreen() {
  const { params } = useRoute<FolderRoute>();
  const navigation = useNavigation<Nav>();
  const { folderId } = params;

  const [folder, setFolder] = useState<Folder | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ custom back button → Dashboard
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button title="Back" onPress={() => navigation.navigate('Dashboard')} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const [f, g] = await Promise.all([
          getFolderById(folderId),
          getGamesByFolder(folderId),
        ]);
        setFolder(f);
        setGames(g);
      } catch (e) {
        console.log('❌ folder screen error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [folderId]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!folder) return <View style={styles.center}><Text>Folder not found.</Text></View>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>{folder.title}</Text>
      {!!folder.description && <Text style={{ marginBottom: 8 }}>{folder.description}</Text>}
      <Text style={styles.subtitle}>Games</Text>

      <FlatList
        data={games}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('GameScreen', { gameId: item.id, folderId })}
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
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 16, fontWeight: '600', marginVertical: 8 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
});
