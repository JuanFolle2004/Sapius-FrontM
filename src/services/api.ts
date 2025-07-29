import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.26:8000', // 🔁 Replace with your actual IP when testing on mobile
});

export const setAuthToken = (token: string) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

export default API;
