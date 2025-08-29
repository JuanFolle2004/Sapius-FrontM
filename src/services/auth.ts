import api from './api';
import type { RegisterRequest, LoginResponse } from '../types';

// 🔑 Login
export async function login(email: string, password: string): Promise<LoginResponse> {
  const form = new FormData();
  form.append('username', email);
  form.append('password', password);

  const res = await api.post<LoginResponse>('/login', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// 🆕 Register
export async function register(payload: RegisterRequest) {
  const res = await api.post('/register', payload);
  return res.data;
}
