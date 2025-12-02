// Configuración estática de la aplicación
export const APP_CONFIG = {
  // URL base de la API (producción)
  API_BASE_URL: "https://convertech-bf96e8817559.herokuapp.com/api",

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
  // (Deshabilitado) Config local: ahora apuntamos también a Render
  API_BASE_URL: "http://localhost:3006/api",
  API_TIMEOUT: 10000,
  ENABLE_API_LOGS: true,
  ENVIRONMENT: "development",
};

// Función para obtener la configuración según el entorno
export const getConfig = () => {
  // Si estamos en localhost, usar configuración de desarrollo (backend local)
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return DEV_CONFIG;
  }
  // Caso contrario, usar producción (Render)
  return APP_CONFIG;
};
