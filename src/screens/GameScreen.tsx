import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Game } from '../types';
import { getGameById } from '../services/gameService';
import type { StyleProp, ViewStyle } from 'react-native';

type Route = RouteProp<RootStackParamList, 'GameScreen'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'GameScreen'>;

export default function GameScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { gameId, folderId, games: passedGames, currentIndex } = params;

  const [game, setGame] = useState<Game | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load game: either from passed list (Random mode) or fetch by ID (Normal mode)
  useEffect(() => {
    if (passedGames && typeof currentIndex === 'number') {
      setGame(passedGames[currentIndex]);
      setLoading(false);
    } else {
      (async () => {
        try {
          const g = await getGameById(gameId);
          setGame(g);
        } catch (e: any) {
          console.log('load game error', e?.response?.data || e?.message);
          Alert.alert('Error', 'Failed to load game.');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [gameId, passedGames, currentIndex]);

  useEffect(() => {
    navigation.setOptions({ title: 'Game' });
  }, [navigation]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!game) return <View style={styles.center}><Text>Game not found.</Text></View>;

  const isCorrect = selected && selected === game.correctAnswer;

  return (
    <View style={styles.page}>
      <Text style={styles.question}>{game.question}</Text>

      {game.options.map((opt, idx) => {
        let bg: StyleProp<ViewStyle> = styles.opt;

        if (selected) {
          if (opt === game.correctAnswer) bg = [styles.opt, styles.correct];
          else if (opt === selected) bg = [styles.opt, styles.wrong];
        }

        return (
          <TouchableOpacity
            key={idx}
            style={bg}
            onPress={() => { if (!selected) setSelected(opt); }}
            disabled={!!selected}
          >
            <Text style={styles.optText}>{opt}</Text>
          </TouchableOpacity>
        );
      })}

      {selected && (
        <Text style={styles.explain}>Explanation: {game.explanation}</Text>
      )}

      {/* Random Trivia flow: Next Question */}
      {passedGames && typeof currentIndex === 'number' && currentIndex < passedGames.length - 1 && (
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() =>
            navigation.replace('GameScreen', {
              gameId: passedGames[currentIndex + 1].id,
              folderId,
              games: passedGames,
              currentIndex: currentIndex + 1,
            })
          }
        >
          <Text style={styles.nextText}>Next Question ➡️</Text>
        </TouchableOpacity>
      )}

      {/* Back button → to folder or dashboard */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          if (passedGames) navigation.navigate('Dashboard'); // random trivia ends back at Dashboard
          else navigation.navigate('FolderScreen', { folderId });
        }}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  page: { flex: 1, padding: 16 },
  question: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  opt: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 10, backgroundColor: '#f3f4f6' },
  correct: { backgroundColor: '#bbf7d0' },
  wrong: { backgroundColor: '#fecaca' },
  optText: { fontSize: 16 },
  explain: { marginTop: 12, fontStyle: 'italic', color: '#334155' },

  nextBtn: { marginTop: 18, backgroundColor: '#22c55e', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  nextText: { color: 'white', fontWeight: '700', fontSize: 16 },

  backBtn: { marginTop: 18, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  backText: { color: 'white', fontWeight: '700' },
});
