// Configuración estática de la aplicación
export const APP_CONFIG = {
  // URL base de la API
  API_BASE_URL: "https://backend-conv3rtech.onrender.com/api/",

  // Timeout para peticiones (en milisegundos)
  API_TIMEOUT: 15000,

  // Configuración de logging
  ENABLE_API_LOGS: true,

  // Entorno de la aplicación
  ENVIRONMENT: "production", // o "development"

  // Configuración de la aplicación
  APP_NAME: "Conv3rTech",
  APP_VERSION: "1.0.0",
};

// Configuración de desarrollo (solo para referencia)
export const DEV_CONFIG = {
  API_BASE_URL: "http://localhost:3001/api/",
  API_TIMEOUT: 10000,
  ENABLE_API_LOGS: true,
  ENVIRONMENT: "development",
};

// Función para obtener la configuración según el entorno
export const getConfig = () => {
  // Por ahora siempre usar producción
  return APP_CONFIG;

  // Para usar desarrollo, descomenta la siguiente línea:
  // return DEV_CONFIG;
};
