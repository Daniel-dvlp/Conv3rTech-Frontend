import { getConfig } from "./constants";

// Configuración de la API
export const API_CONFIG = {
  // URL base de la API
  BASE_URL: getConfig().API_BASE_URL,

  // Timeout para las peticiones (en milisegundos)
  TIMEOUT: getConfig().API_TIMEOUT,

  // Headers por defecto
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },

  // Configuración de logging
  ENABLE_LOGS: getConfig().ENABLE_API_LOGS,

  // Endpoints principales
  ENDPOINTS: {
    // Autenticación
    AUTH: {
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      REFRESH: "/auth/refresh",
      PROFILE: "/auth/profile",
      CHANGE_PASSWORD: "/auth/change-password",
      PERMISSIONS: "/auth/permissions",
    },

    // Usuarios
    USERS: {
      BASE: "/users",
      BY_ID: (id) => `/users/${id}`,
      BY_STATUS: (status) => `/users/status/${status}`,
    },

    // Roles
    ROLES: {
      BASE: "/roles",
      BY_ID: (id) => `/roles/${id}`,
      PERMISSIONS: (id) => `/roles/${id}/permissions`,
      ASSIGN_PERMISSIONS: (id) => `/roles/${id}/permissions`,
    },

    // Permisos
    PERMISSIONS: {
      BASE: "/permissions",
      BY_ID: (id) => `/permissions/${id}`,
      AVAILABLE: "/roles/permissions/available",
    },

    // Privilegios
    PRIVILEGES: {
      BASE: "/privileges",
      BY_ID: (id) => `/privileges/${id}`,
      AVAILABLE: "/roles/privileges/available",
    },

    // Clientes
    CLIENTS: {
      BASE: "/clients",
      BY_ID: (id) => `/clients/${id}`,
      SEARCH: (term) => `/clients/search/${term}`,
      CREDIT: (id) => `/clients/${id}/credit`,
      STATUS: (id) => `/clients/${id}/status`,
    },

    // Productos
    PRODUCTS: {
      BASE: "/products/products",
      BY_ID: (id) => `/products/products/${id}`,
      STATUS: (id) => `/products/products/${id}/estado`,
      FEATURES: {
        BASE: "/products/features",
        BY_ID: (id) => `/products/features/${id}`,
        BY_PRODUCT: (productId) => `/products/features/product/${productId}`,
      },
      DATASHEETS: {
        BASE: "/products/datasheets",
        BY_ID: (id) => `/products/datasheets/${id}`,
        BY_PRODUCT: (productId) => `/products/datasheets/product/${productId}`,
      },
    },

    // Categorías de productos
    PRODUCTS_CATEGORY: {
      BASE: "/productsCategory",
      BY_ID: (id) => `/productsCategory/${id}`,
      STATUS: (id) => `/productsCategory/${id}/status`,
    },

    // Proveedores
    SUPPLIERS: {
      BASE: "/suppliers",
      BY_ID: (id) => `/suppliers/${id}`,
      STATUS: (id) => `/suppliers/${id}/status`,
    },

    // Compras
    PURCHASES: {
      BASE: "/purchases",
      BY_ID: (id) => `/purchases/${id}`,
      STATUS: (id) => `/purchases/${id}/status`,
      DETAILS: {
        BY_PURCHASE: (purchaseId) => `/purchases/${purchaseId}/details`,
        BY_ID: (purchaseId, detailId) =>
          `/purchases/${purchaseId}/details/${detailId}`,
      },
    },

    // Servicios
    SERVICES: {
      BASE: "/services",
      BY_ID: (id) => `/services/${id}`,
      STATUS: (id) => `/services/${id}/status`,
    },

    // Categorías de servicios
    SERVICES_CATEGORY: {
      BASE: "/service-categories",
      BY_ID: (id) => `/service-categories/${id}`,
      STATUS: (id) => `/service-categories/${id}/status`,
    },

    // Ventas
    SALES: {
      BASE: "/sales",
      BY_ID: (id) => `/sales/${id}`,
      STATUS: (id) => `/sales/${id}/status`,
      DETAILS: {
        BASE: "/sales/details",
        BY_ID: (id) => `/sales/details/${id}`,
        BY_SALE: (saleId) => `/sales/details/sale/${saleId}`,
      },
    },

    // Cotizaciones
    QUOTES: {
      BASE: "/quotes",
      BY_ID: (id) => `/quotes/${id}`,
      STATUS: (id) => `/quotes/${id}/status`,
      DETAILS: {
        BASE: "/quotes/details",
        BY_ID: (id) => `/quotes/details/${id}`,
        BY_QUOTE: (quoteId) => `/quotes/details/quote/${quoteId}`,
      },
    },

    // Citas
    APPOINTMENTS: {
      BASE: "/appointments",
      BY_ID: (id) => `/appointments/${id}`,
      STATUS: (id) => `/appointments/${id}/status`,
      BY_CLIENT: (clientId) => `/appointments/client/${clientId}`,
      BY_DATE: (date) => `/appointments/date/${date}`,
      BY_DATE_RANGE: (startDate, endDate) =>
        `/appointments/date-range?start=${startDate}&end=${endDate}`,
    },

    // Programación laboral
    LABOR_SCHEDULING: {
      BASE: "/labor-scheduling",
      BY_ID: (id) => `/labor-scheduling/${id}`,
      BY_USER: (userId) => `/labor-scheduling/user/${userId}`,
      BY_DATE: (date) => `/labor-scheduling/date/${date}`,
      BY_DATE_RANGE: (startDate, endDate) =>
        `/labor-scheduling/date-range?start=${startDate}&end=${endDate}`,
    },

    // Proyectos
    PROJECTS: {
      BASE: "/projects",
      BY_ID: (id) => `/projects/${id}`,
      SEARCH: (term) => `/projects/search?term=${term}`,
      STATS: "/projects/stats",
      OUTSTANDING: (id) => `/projects/${id}/outstanding`,
      PROGRESS: (id) => `/projects/${id}/progress`,
      STATUS: (id) => `/projects/${id}/status`,
      BY_CLIENT: (clientId) => `/projects/client/${clientId}`,
      BY_RESPONSIBLE: (responsibleId) =>
        `/projects/responsible/${responsibleId}`,
      SALIDA_MATERIAL: "/projects/salida-material",
      SALIDAS_MATERIAL: (projectId) =>
        `/projects/${projectId}/salidas-material`,
      PAYMENTS: {
        BY_PROJECT: (projectId) => `/projects/${projectId}/payments`,
        BY_ID: (projectId, paymentId) =>
          `/projects/${projectId}/payments/${paymentId}`,
      },
      SERVICES: {
        COMPLETE: (serviceId) => `/projects/servicios/${serviceId}/completar`,
        PENDING: (serviceId) => `/projects/servicios/${serviceId}/pendiente`,
      },
    },

    // Pagos y abonos (legacy)
    PAYMENTS_INSTALLMENTS: {
      BASE: "/payments-installments",
      BY_ID: (id) => `/payments-installments/${id}`,
      BY_CLIENT: (clientId) => `/payments-installments/client/${clientId}`,
      BY_PROJECT: (projectId) => `/payments-installments/project/${projectId}`,
    },

    // Upload de archivos
    UPLOAD: "/upload",

    // Health check
    HEALTH: "/health",
  },
};

// Configuración de desarrollo
export const DEV_CONFIG = {
  // Habilitar logs de desarrollo
  ENABLE_LOGS: true,

  // Simular delays en desarrollo
  SIMULATE_DELAY: false,
  DELAY_MS: 1000,
};

// Determinar configuración según el entorno
export const getApiConfig = () => {
  // Siempre usar la URL del backend desplegado
  return API_CONFIG;
};
