import api from './api';
import type { Game } from '../types';

export async function getGamesByFolder(folderId: string): Promise<Game[]> {
  const { data } = await api.get<Game[]>(`/games/folder/${folderId}`); // GET /games/folder/{folder_id}
  return data;
}
export async function getGameById(gameId: string): Promise<Game> {
  const { data } = await api.get<Game>(`/games/${gameId}`);           // GET /games/{game_id}
  return data;
}
