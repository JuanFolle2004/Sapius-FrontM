// src/services/auth.ts
import api from './api';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post<LoginResponse>('/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};
