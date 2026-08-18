import axios from 'axios';

export const API_URL =
  import.meta.env.VITE_API_URL ||
  // 'http://booth-daily-bk.test:8080/api';
  'https://rest-referring-pursuit-calls.trycloudflare.com/api';

export const APP_URL = API_URL.replace(/\/api\/?$/, '');

export const getImageUrl = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${APP_URL}/${cleanPath}`;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
