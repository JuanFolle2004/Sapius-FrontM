import api from './api';
import i18n from '../i18n';
import type { Folder, Game } from '../types';

// Get all user folders
export async function getUserFolders(): Promise<Folder[]> {
  const { data } = await api.get<Folder[]>('/folders/');
  return data;
}

// Get folder by ID
export async function getFolderById(folderId: string): Promise<Folder> {
  const { data } = await api.get<Folder>(`/folders/${folderId}`);
  return data;
}

// Get folder + its games
export async function getFolderWithGames(
  folderId: string
): Promise<{ folder: Folder; games: Game[] }> {
  const { data } = await api.get<{ folder: Folder; games: Game[] }>(
    `/folders/${folderId}/with-games`
  );
  return data;
}

// Create folder only
export async function createFolder(payload: {
  title: string;
  description?: string;
  prompt?: string;
}) {
  const { data } = await api.post<Folder>('/folders/', payload);
  return data;
}

// Generate more games for existing folder
export async function generateGamesForFolder(
  folderId: string,
  duration: number = 5,
  difficulty: "same" | "easier" | "harder" = "same",
  language?: 'en' | 'es'
) {
  const { data } = await api.post(`/ai/generate-from-folder/${folderId}`, {
    duration: Number(duration), // ensure numeric
    difficulty,
    language: language || (i18n.language as 'en' | 'es'),
  });
  return data;
}





// Get random folder with games
export async function getRandomFolderWithGames(): Promise<{
  folder: Folder;
  games: Game[];
}> {
  const { data } = await api.get<{ folder: Folder; games: Game[] }>(
    '/ai/folders/random/with-games'
  );
  return data;
}

// Update folder
export async function updateFolder(
  folderId: string,
  updates: { title?: string; description?: string; prompt?: string }
): Promise<Folder> {
  const { data } = await api.put<Folder>(`/folders/update/${folderId}`, updates);
  return data;
}

// Delete folder
export async function deleteFolder(folderId: string): Promise<void> {
  await api.delete(`/folders/delete/${folderId}`);
}
