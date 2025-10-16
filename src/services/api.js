// src/services/api.js
import axios from "axios";
import { getApiConfig } from "../shared/config/api";

const config = getApiConfig();

// Log para verificar la configuración
if (config.ENABLE_LOGS) {
  console.log("🔧 API Configuration:", {
    baseURL: config.BASE_URL,
    timeout: config.TIMEOUT,
    enableLogs: config.ENABLE_LOGS,
  });
}

const api = axios.create({
  baseURL: config.BASE_URL,
  timeout: config.TIMEOUT,
  headers: config.DEFAULT_HEADERS,
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
