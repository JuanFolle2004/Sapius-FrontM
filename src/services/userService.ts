import api from './api';
import type { User } from '../types';

// 👤 Get current user
export async function getMe(token: string): Promise<User> {
  const res = await api.get<User>('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// 🧩 Update user interests
export async function updateUserInterests(token: string, interests: string[]): Promise<User> {
  const res = await api.put<User>(
    '/users/me/interests',
    { interests },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}
