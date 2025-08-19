import api from './api';
import { Folder } from '../types';

export const fetchUserFolders = async (): Promise<Folder[]> => {
  const res = await api.get<Folder[]>('/folders/'); 
  return res.data;
};

export const createFolder = async (folder: Omit<Folder, 'id'>): Promise<Folder> => {
  const res = await api.post<Folder>('/folders', folder);
  return res.data;
};
