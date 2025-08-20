import api from './api';
import type { LoginResponse, RegisterRequest } from '../types';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const body = new FormData();
  body.append('username', email);
  body.append('password', password);
  const { data } = await api.post<LoginResponse>('/login', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const register = async (payload: RegisterRequest) => {
  const { data } = await api.post('/register', payload);
  return data;
};
