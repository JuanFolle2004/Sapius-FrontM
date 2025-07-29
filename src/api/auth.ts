import api from '../services/api';
import { LoginResponse, RegisterRequest } from '../types';

/**
 * Log in a user and receive a JWT token
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>('/users/login', {
    username: email,
    password,
  });
  return res.data;
};
/**
 * Register a new user with name, lastname, birth date, etc.
 */
export const register = async ({
  email,
  password,
  birthDate,
  name,
  lastName,
  phone,
}: RegisterRequest): Promise<any> => {
  const res = await api.post('/users/register', {
    email,
    password,
    birthDate,
    name,
    lastName,
    phone,
  });
  return res.data;
};
