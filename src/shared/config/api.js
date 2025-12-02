import axios from 'axios';

// Usa variable de entorno de Vite; fallback a localhost para desarrollo
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://convertech-bf96e8817559.herokuapp.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Aumentado a 60s para operaciones lentas
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;