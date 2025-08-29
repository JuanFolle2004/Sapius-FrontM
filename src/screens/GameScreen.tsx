import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Game } from '../types';
import { getGameById } from '../services/gameService';

type Route = RouteProp<RootStackParamList, 'GameScreen'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'GameScreen'>;

export default function GameScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();

  const { gameId, folderId, games, currentIndex } = params;

  const [game, setGame] = useState<Game | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (games && typeof currentIndex === 'number') {
      setGame(games[currentIndex]);
      setSelected(null);   // ✅ reset selection so explanation isn’t shown
      setLoading(false);
    } else {
      (async () => {
        try {
          const g = await getGameById(gameId);
          setGame(g);
          setSelected(null);  // ✅ reset here too
        } catch (e) {
          console.log('❌ failed to load game', e);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [gameId, games, currentIndex]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.center}>
        <Text>Game not found</Text>
      </View>
    );
  }

  const isLastGame =
    games && typeof currentIndex === 'number' && currentIndex === games.length - 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{game.title}</Text>
      <Text style={styles.question}>{game.question}</Text>

      {game.options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.option,
            selected === opt && {
              backgroundColor: opt === game.correctAnswer ? '#4ade80' : '#f87171',
            },
          ]}
          onPress={() => setSelected(opt)}
        >
          <Text>{opt}</Text>
        </TouchableOpacity>
      ))}

      {selected && (
        <Text style={styles.explain}>Explanation: {game.explanation}</Text>
      )}

      {/* Next Question (only if not last) */}
      {games && typeof currentIndex === 'number' && currentIndex < games.length - 1 && (
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() =>
            navigation.navigate('GameScreen', {
              gameId: games[currentIndex + 1].id,
              folderId,
              games,
              currentIndex: currentIndex + 1,
            })
          }
        >
          <Text style={styles.nextText}>➡️ Next Question</Text>
        </TouchableOpacity>
      )}

      {/* Back to Folder (only if last) */}
      {games && isLastGame && (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (folderId) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'FolderScreen', params: { folderId } }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
              });
            }
          }}
        >
          <Text style={styles.backText}>⬅️ Back to Folder</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  question: { fontSize: 18, marginBottom: 16 },
  option: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  explain: { marginTop: 12, fontStyle: 'italic' },

  // Buttons
  nextBtn: {
    marginTop: 20,
    backgroundColor: '#14b8a6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextText: { color: 'white', fontWeight: '700' },

  backBtn: {
    marginTop: 20,
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  backText: { color: 'white', fontWeight: '700' },
});
