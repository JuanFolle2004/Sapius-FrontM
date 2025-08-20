import api from './api';
import type { Folder, Game } from '../types';

export async function getUserFolders(): Promise<Folder[]> {
  const { data } = await api.get<Folder[]>('/folders/');             // GET /folders/
  return data;
}
export async function getFolderById(folderId: string): Promise<Folder> {
  const { data } = await api.get<Folder>(`/folders/${folderId}`);    // GET /folders/{folder_id}
  return data;
}
export async function getFolderWithGames(folderId: string): Promise<{ folder: Folder; games: Game[] }> {
  const { data } = await api.get<{ folder: Folder; games: Game[] }>(`/folders/${folderId}/with-games`);
  return data;
}
export async function createFolder(payload: { title: string; description?: string }) {
  const { data } = await api.post<Folder>('/folders/', payload);     // POST /folders/
  return data;
}
// Optional: generate from folder (like your web)
export async function generateGamesForFolder(folderId: string) {
  const { data } = await api.post(`/ai/generate-from-folder/${folderId}`);
  return data;
}



export async function createFolderWithGames(payload: {
  title: string;
  description?: string;
  prompt: string;
}): Promise<{ folder: Folder; games: Game[] }> {
  // 1) create folder
  const { data: folder } = await api.post<Folder>('/folders/', {
    title: payload.title,
    description: payload.description,
    prompt: payload.prompt, // keep if your server stores the prompt
  });

  // 2) ask AI to generate games for it
  await api.post(`/ai/generate-from-folder/${folder.id}`); // seen in your web FolderPage.tsx :contentReference[oaicite:9]{index=9}

  // 3) fetch folder + games
  const { data } = await api.get<{ folder: Folder; games: Game[] }>(`/folders/${folder.id}/with-games`);
  return data;
}

