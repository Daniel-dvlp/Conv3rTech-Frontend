// src/services/api.js
import api from "../shared/config/api";

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    // Asegurar que headers existe
    if (!config.headers) {
      config.headers = {};
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("[API] No token found in localStorage for request:", config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas de error (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const hasToken = !!localStorage.getItem("token");
    const isPublicAuthEndpoint = url.startsWith("/auth/login") || url.startsWith("/auth/password");

    // Solo redirigir si hay sesión y el 401 proviene de un endpoint protegido
    if (status === 401 && hasToken && !isPublicAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
