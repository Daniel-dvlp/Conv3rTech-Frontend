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

  Coordinador: {
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
      // "roles", // Excluido explícitamente si se desea bloquear gestión de roles
      "salida_material",
    ],
    permissions: {
      "dashboard": ["Ver"],
      "usuarios": ["Ver", "Crear", "Editar"],
      "proveedores": ["Ver", "Crear", "Editar"],
      "categoria_productos": ["Ver", "Crear", "Editar"],
      "productos": ["Ver", "Crear", "Editar"],
      "compras": ["Ver", "Crear", "Editar"], // Sin Eliminar/Anular
      "servicios": ["Ver", "Crear", "Editar"],
      "categoria_servicios": ["Ver", "Crear", "Editar"],
      "ordenes_servicios": ["Ver", "Crear", "Editar"],
      "programacion_laboral": ["Ver", "Crear", "Editar"],
      "clientes": ["Ver", "Crear", "Editar"],
      "venta_productos": ["Ver", "Crear", "Editar"],
      "citas": ["Ver", "Crear", "Editar", "Eliminar"], // Acceso total solicitado
      "cotizaciones": ["Ver", "Crear", "Editar"],
      "proyectos_servicios": ["Ver", "Crear", "Editar"],
      "pagosyabonos": ["Ver", "Crear", "Editar"],
      "roles": ["Ver"],
      "salida_material": ["Ver", "Crear"],
      "profile": ["Ver", "Editar"]
    }
  },

  Tecnico: {
    canAccess: [
      "dashboard",
      "programacion_laboral",
      "proyectos_servicios",
      "citas",
      "profile",
    ],
    canManage: [], // Técnico solo visualiza
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
