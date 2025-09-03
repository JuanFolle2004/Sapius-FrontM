import api from './api';
import type { Game } from '../types';

// 🔹 Shared type for folder progress
export type FolderProgress = {
  playedGames: {
    [gameId: string]: { correct: boolean; answeredAt: string };
  };
  strike?: number;
  lastPlayedAt?: string;
};

// 🎮 Get all games for a folder
export async function getGamesByFolder(folderId: string): Promise<Game[]> {
  const { data } = await api.get<Game[]>(`/games/folder/${folderId}`);
  return data;
}

// 🎮 Get a single game by ID
export async function getGameById(gameId: string): Promise<Game> {
  const { data } = await api.get<Game>(`/games/${gameId}`);
  return data;
}

// ✅ Track game progress
export async function markGamePlayed(folderId: string, gameId: string, correct: boolean) {
  const { data } = await api.post(`/progress/${folderId}/${gameId}`, { correct });
  return data;
}

// ✅ Get progress for a folder
export async function getFolderProgress(folderId: string): Promise<FolderProgress> {
  const { data } = await api.get<FolderProgress>(`/progress/${folderId}`);
  return data;
}

// 🔹 Report issue with a game
export async function reportGameIssue(
  folderId: string,
  gameId: string,
  data: { question: string; selectedAnswer: string | null; correctAnswer: string }
) {
  const res = await api.post(`/games/${gameId}/report`, {
    folderId,
    ...data,
  });
  return res.data;
}