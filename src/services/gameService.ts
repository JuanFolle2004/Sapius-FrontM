import api from './api';
import type { Game } from '../types';

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

// ✅ Mark a game as played (adds to user's playedGameIds in Firestore)
export async function markGamePlayed(gameId: string) {
  const { data } = await api.post(`/games/${gameId}/mark-played`);
  return data;
}
