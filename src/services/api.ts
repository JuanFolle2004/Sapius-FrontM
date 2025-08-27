import axios from 'axios';

const API = axios.create({
  baseURL: 'http://10.252.54.88:8000', 
});

export const setAuthToken = (token: string) => {
  if (token) API.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete API.defaults.headers.common.Authorization;
};

// Optional: debug logs
API.interceptors.request.use((c) => {
  console.log('➡️', c.method?.toUpperCase(), (c.baseURL || '') + (c.url || ''));
  return c;
});
API.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response) console.log('⛔', e.response.status, e.response.config?.url, e.response.data);
    else console.log('⛔ (no response)', e.message);
    return Promise.reject(e);
  }
);

export default API;
