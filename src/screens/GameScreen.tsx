import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Game } from '../types';
import { getGameById, markGamePlayed } from '../services/gameService';

type Route = RouteProp<RootStackParamList, 'GameScreen'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'GameScreen'>;

export default function GameScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();

  const { gameId, folderId, games, currentIndex, onPlayed } = params as any;

  const [game, setGame] = useState<Game | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getGameById(gameId);
      setGame(data);
    })();
  }, [gameId]);

  // ✅ mark game as played once answered
  useEffect(() => {
    if (selected && game) {
      markGamePlayed(game.id).catch(e =>
        console.log("❌ mark played error", e)
      );
      if (onPlayed) onPlayed(game.id); // ✅ callback to FolderScreen
    }
  }, [selected, game]);

  if (!game) return <Text>Loading...</Text>;

  const goNext = () => {
    if (currentIndex + 1 < games.length) {
      navigation.replace('GameScreen', {
        gameId: games[currentIndex + 1].id,
        folderId,
        games,
        currentIndex: currentIndex + 1,
        onPlayed, // pass down callback
      } as any);
    } else {
      navigation.goBack(); // back to folder when finished
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.question}>{game.question}</Text>

      {game.options.map((opt) => {
  const isCorrect = opt === game.correctAnswer;
  const isSelected = opt === selected;

  const optionStyle = [
    styles.option,
    selected && isSelected && isCorrect && styles.correct,
    selected && isSelected && !isCorrect && styles.incorrect,
    selected && !isSelected && isCorrect && styles.correct,
  ];

  return (
    <TouchableOpacity
      key={opt}
      style={optionStyle}
      onPress={() => {
        if (selected) return; // prevent multiple answers
        setSelected(opt);
      }}
    >
      <Text>{opt}</Text>
    </TouchableOpacity>
  );
})}


      {selected && (
        <>
          <Text style={styles.explanation}>💡 {game.explanation}</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
            <Text style={styles.nextText}>
              {currentIndex + 1 < games.length ? "➡️ Next Question" : "🏁 Finish"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  question: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  option: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  correct: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  incorrect: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  explanation: {
    marginTop: 16,
    fontStyle: 'italic',
    color: '#555',
  },
  nextBtn: {
    marginTop: 20,
    backgroundColor: '#14b8a6',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextText: { color: 'white', fontWeight: '700' },
});
