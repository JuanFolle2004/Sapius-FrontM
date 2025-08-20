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
  const { gameId, folderId } = params;

  const [game, setGame] = useState<Game | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [gameId]);

  useEffect(() => {
    navigation.setOptions({ title: 'Game' });
  }, [navigation]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!game) return <View style={styles.center}><Text>Game not found.</Text></View>;

  const isCorrect = selected && selected === game.correctAnswer; // mirrors web logic :contentReference[oaicite:2]{index=2}

  return (
    <View style={styles.page}>
      <Text style={styles.question}>{game.question}</Text>

            {game.options.map((opt, idx) => {
        // ✅ allow single or array styles
        let bg: StyleProp<ViewStyle> = styles.opt;

        if (selected) {
            if (opt === game.correctAnswer) bg = [styles.opt, styles.correct];
            else if (opt === selected)      bg = [styles.opt, styles.wrong];
        }

        return (
            <TouchableOpacity
            key={idx}
            style={bg}                      // <— now happy with object or array
            onPress={() => { if (!selected) setSelected(opt); }}
            disabled={!!selected}
            >
            <Text style={styles.optText}>{opt}</Text>
            </TouchableOpacity>
        );
        })}

      {selected && (
        <Text style={styles.explain}>Explanation: {game.explanation}</Text>  // show explanation after answer :contentReference[oaicite:4]{index=4}
      )}

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate('FolderScreen', { folderId: folderId ?? game.folderId })} // back to folder :contentReference[oaicite:5]{index=5}
      >
        <Text style={styles.backText}>Back to Folder</Text>
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
  backBtn: { marginTop: 18, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  backText: { color: 'white', fontWeight: '700' },
});
