import axios from 'axios';

// Normaliza el baseURL para asegurar que incluya '/api' cuando apunte al backend
function normalizeBaseURL(raw) {
  try {
    const url = new URL(raw);
    // Si no hay pathname o es '/', añadimos '/api'
    if (!url.pathname || url.pathname === '/' ) {
      url.pathname = '/api';
    }
    // Evitar dobles '/api/api'
    if (!url.pathname.endsWith('/api')) {
      url.pathname = `${url.pathname.replace(/\/$/, '')}/api`;
    }
    return url.toString();
  } catch {
    // Si no es una URL absoluta, devolver tal cual
    return raw;
  }
}

const API_BASE_URL_RAW = import.meta.env?.VITE_API_BASE_URL || 'https://backend-conv3rtech.onrender.com/api';
const API_BASE_URL = normalizeBaseURL(API_BASE_URL_RAW);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor para adjuntar token (capa compartida)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const url = config.url || '';
    const isPublicAuthEndpoint = url.startsWith('/auth/login') || url.startsWith('/auth/password');
    if (token && !isPublicAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;