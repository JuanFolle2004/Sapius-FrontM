// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.68.104:8000', // adjust to your backend IP
  timeout: 15000,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Token set in axios headers:', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Debug interceptors
api.interceptors.request.use((c) => {
  console.log('➡️', c.method?.toUpperCase(), (c.baseURL || '') + (c.url || ''), c.headers);
  return c;
});
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response) {
      console.log('⛔', e.response.status, e.response.config?.url, e.response.data);
    } else {
      console.log('⛔ (no response)', e.message);
    }
    return Promise.reject(e);
  }
);

export default api;
