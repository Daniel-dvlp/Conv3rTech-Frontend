// src/services/api.js
import api from "../shared/config/api";

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // Manejo más claro de 403 (Forbidden) en endpoints protegidos
    if (status === 403) {
      // Opcional: podrías navegar a una página de No Autorizado si existe
      // window.location.href = "/unauthorized";
      console.warn("Acceso denegado (403) en:", url);
    }
    return Promise.reject(error);
  }
);

export default api;
