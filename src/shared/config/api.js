import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (import.meta.env.MODE === 'development') {
      console.debug('[API] request', { method: config.method, url: config.url, baseURL: API_BASE_URL });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
