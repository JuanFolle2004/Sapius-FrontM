import api from './api';
import type { RegisterRequest } from '../types';

export async function login(email: string, password: string) {
  const form = new FormData();
  form.append('username', email);
  form.append('password', password);

  const res = await api.post<{ access_token: string }>('/login', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function register(payload: RegisterRequest) {
  const res = await api.post('/register', payload);
  return res.data;
}
