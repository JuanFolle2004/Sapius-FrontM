import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import LoadingView from '../../components/LoadingView';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Game } from '../types';
import { getGameById, markGamePlayed, reportGameIssue } from '../services/gameService';
import { useTranslation } from 'react-i18next';

type Route = RouteProp<RootStackParamList, 'GameScreen'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'GameScreen'>;

export default function GameScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();

  const { gameId, folderId, games, currentIndex, onPlayed } = params as {
    gameId: string;
    folderId: string;
    games: Game[];
    currentIndex: number;
    onPlayed: (gameId: string, isCorrect: boolean) => void;
  };

  const [game, setGame] = useState<Game | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // 🔹 Load game
  useEffect(() => {
    (async () => {
      const data = await getGameById(gameId);
      setGame(data);
    })();
  }, [gameId]);

  // 🔹 When answered, record progress
  useEffect(() => {
    if (selected && game) {
      const isCorrect = selected === game.correctAnswer;

      // ✅ call backend
      markGamePlayed(folderId, game.id, isCorrect).catch(e =>
        console.log("❌ mark played error", e)
      );

      // ✅ notify FolderScreen
      if (onPlayed) onPlayed(game.id, isCorrect);

      // ✅ mark as played locally
      const idx = games.findIndex((g) => g.id === game.id);
      if (idx !== -1) {
        games[idx].played = true;
      }
    }
  }, [selected, game]);

  if (!game) return <LoadingView />;

  // 🔹 Move to next *unplayed* game or back to folder
  const goNext = () => {
    const nextGame = games.find((g, idx) => idx > currentIndex && !g.played);

    if (nextGame) {
      navigation.replace('GameScreen', {
        gameId: nextGame.id,
        folderId,
        games,
        currentIndex: games.findIndex((g) => g.id === nextGame.id),
        onPlayed,
      } as any);
    } else {
      navigation.goBack(); // all done
    }
  };

  // 🔹 Report incorrect answer
  const handleReport = async () => {
    try {
      await reportGameIssue(folderId, game.id, {
        selectedAnswer: selected,
        correctAnswer: game.correctAnswer,
        question: game.question,
      });
      Alert.alert(t('game.thankYou'), t('game.feedbackSubmitted'));
    } catch (err) {
      Alert.alert(t('common.error'), t('game.feedbackError'));
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
          <Text style={styles.explanation}>{t('game.explanationPrefix')} {game.explanation}</Text>

          {/* 🔹 Next Question / Finish */}
          <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
            <Text style={styles.nextText}>
              {games.some((g, idx) => idx > currentIndex && !g.played)
                ? t('game.next')
                : t('game.finish')}
            </Text>
          </TouchableOpacity>

          {/* 🔹 Report Issue */}
          <TouchableOpacity style={styles.reportBtn} onPress={handleReport}>
            <Text style={styles.reportText}>⚠️ {t('game.reportIssue')}</Text>
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
  reportBtn: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  reportText: { color: 'white', fontWeight: '700' },
});
