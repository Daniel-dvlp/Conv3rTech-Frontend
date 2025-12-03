// Configuración de permisos basada en roles
export const rolePermissions = {
  Administrador: {
    canAccess: [
      "dashboard",
      "usuarios",
      "proveedores",
      "categoria_productos",
      "productos",
      "compras",
      "servicios",
      "categoria_servicios",
      "ordenes_servicios",
      "programacion_laboral",
      "clientes",
      "venta_productos",
      "citas",
      "cotizaciones",
      "proyectos_servicios",
      "pagosyabonos",
      "roles",
      "profile",
    ],
    canManage: [
      "dashboard",
      "usuarios",
      "roles",
      "proveedores",
      "productos",
      "servicios",
      "clientes",
      "proyectos",
      "salida_material",
    ],
  },
  Admin: {
    canAccess: [
      "dashboard",
      "usuarios",
      "proveedores",
      "categoria_productos",
      "productos",
      "compras",
      "servicios",
      "categoria_servicios",
      "ordenes_servicios",
      "programacion_laboral",
      "clientes",
      "venta_productos",
      "citas",
      "cotizaciones",
      "proyectos_servicios",
      "pagosyabonos",
      "roles",
      "profile",
    ],
    canManage: [
      "dashboard",
      "usuarios",
      "roles",
      "proveedores",
      "productos",
      "servicios",
      "clientes",
      "proyectos",
      "salida_material",
    ],
  },

  Supervisor: {
    canAccess: [
      "dashboard",
      "usuarios",
      "proveedores",
      "categoria_productos",
      "productos",
      "compras",
      "servicios",
      "categoria_servicios",
      "ordenes_servicios",
      "programacion_laboral",
      "clientes",
      "venta_productos",
      "citas",
      "cotizaciones",
      "proyectos_servicios",
      "pagosyabonos",
      "profile",
    ],
    canManage: [
      "proveedores",
      "productos",
      "servicios",
      "clientes",
      "proyectos",
      "salida_material",
    ],
  },

  Tecnico: {
    canAccess: [
      "dashboard",
      "ordenes_servicios",
      "programacion_laboral",
      "proyectos_servicios",
      "citas",
      "profile",
    ],
    canManage: ["ordenes_servicios", "proyectos_servicios"],
  },

  Recepcionista: {
    canAccess: [
      "dashboard",
      "clientes",
      "citas",
      "cotizaciones",
      "venta_productos",
      "pagosyabonos",
      "profile",
    ],
    canManage: ["clientes", "citas", "cotizaciones"],
  },
};

// Función para verificar acceso a módulo
export const hasAccess = (userRole, module) => {
  const permissions = rolePermissions[userRole];
  if (!permissions) return false;
  return permissions.canAccess.includes(module);
};

// Función para verificar gestión de módulo
export const canManage = (userRole, module) => {
  const permissions = rolePermissions[userRole];
  if (!permissions) return false;
  return permissions.canManage.includes(module);
};

// Función para obtener módulos accesibles
export const getAccessibleModules = (userRole) => {
  const permissions = rolePermissions[userRole];
  return permissions ? permissions.canAccess : [];
};
