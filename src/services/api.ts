// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.26:8000', // Or your current IP + port
});

export const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
