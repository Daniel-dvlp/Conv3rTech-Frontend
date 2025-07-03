// src/features/dashboard/pages/roles/data/Roles_data.js

export let mockRoles = [
  {
    id: 1,
    name: 'Administrador',
    description: 'Acceso total a todos los módulos y configuraciones.',
    status: 'Activo',
    permisos: ['Gestion', 'Compras', 'Servicios', 'Ventas'],
    // Nueva estructura de permisos detallados
    permissions: {
      'Dashboard': ['Ver'],
      'Usuarios': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Compras.Proveedores': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Compras.Categorías de Productos': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Compras.Productos': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Compras.Compras': ['Crear', 'Ver', 'Editar', 'Anular'],
      'Servicios.Categoría de Servicios': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Servicios.Órdenes de Servicio': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Servicios.Programación laboral': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Ventas.Clientes': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Ventas.Venta de Productos': ['Crear', 'Ver', 'Editar', 'Anular'],
      'Ventas.Órdenes de Servicios': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Ventas.Citas': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Ventas.Cotizaciones': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Ventas.Proyectos de Servicio': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Ventas.Pagos y Abonos': ['Crear', 'Ver', 'Editar', 'Eliminar'],
      'Configuración.Editar mi Perfil': ['Ver', 'Editar'],
      'Configuración.Gestión de Roles': ['Crear', 'Ver', 'Editar', 'Eliminar']
    }
  },
  {
    id: 2,
    name: 'Técnico de Campo',
    description: 'Puede ver y gestionar órdenes de servicio y agenda.',
    status: 'Activo',
    permisos: ['Agenda', 'Órdenes de Servicio', 'Citas'],
    permissions: {
      'Dashboard': ['Ver'],
      'Servicios.Órdenes de Servicio': ['Crear', 'Ver', 'Editar'],
      'Servicios.Programación laboral': ['Ver', 'Editar'],
      'Ventas.Citas': ['Crear', 'Ver', 'Editar'],
      'Configuración.Editar mi Perfil': ['Ver', 'Editar']
    }
  },
  {
    id: 3,
    name: 'Vendedor',
    description: 'Acceso a los módulos de ventas, clientes y cotizaciones.',
    status: 'Activo',
    permisos: ['Ventas', 'Clientes', 'Cotizaciones', 'Proyectos'],
    permissions: {
      'Dashboard': ['Ver'],
      'Ventas.Clientes': ['Crear', 'Ver', 'Editar'],
      'Ventas.Venta de Productos': ['Crear', 'Ver'],
      'Ventas.Citas': ['Crear', 'Ver', 'Editar'],
      'Ventas.Cotizaciones': ['Crear', 'Ver', 'Editar'],
      'Ventas.Proyectos de Servicio': ['Crear', 'Ver', 'Editar'],
      'Configuración.Editar mi Perfil': ['Ver', 'Editar']
    }
  },
  {
    id: 4,
    name: 'Rol Obsoleto',
    description: 'Este rol ya no se utiliza en el sistema actual.',
    status: 'Inactivo',
    permisos: [],
    permissions: {}
  }
];

// Función para obtener el siguiente ID disponible
const getNextId = () => {
  return Math.max(...mockRoles.map(role => role.id)) + 1;
};

// Función para crear un nuevo rol
export const createRole = (roleData) => {
  // Generar permisos simplificados para mantener compatibilidad
  const permisos = [];
  Object.keys(roleData.permissions || {}).forEach(key => {
    if (key.includes('.')) {
      const [module] = key.split('.');
      if (!permisos.includes(module)) {
        permisos.push(module);
      }
    } else {
      if (!permisos.includes(key)) {
        permisos.push(key);
      }
    }
  });

  const newRole = {
    id: getNextId(),
    name: roleData.name,
    description: roleData.description,
    status: 'Activo',
    permisos: permisos,
    permissions: roleData.permissions || {}
  };
  
  mockRoles.unshift(newRole); // Añadir al principio del array
  return newRole;
};

// Función para obtener todos los roles
export const getRoles = () => {
  return [...mockRoles];
};

// Función para obtener un rol por ID
export const getRoleById = (id) => {
  return mockRoles.find(role => role.id === id);
};

// Función para actualizar un rol
export const updateRole = (id, updatedData) => {
  const index = mockRoles.findIndex(role => role.id === id);
  if (index !== -1) {
    mockRoles[index] = { ...mockRoles[index], ...updatedData };
    return mockRoles[index];
  }
  return null;
};

// Función para eliminar un rol
export const deleteRole = (id) => {
  const index = mockRoles.findIndex(role => role.id === id);
  if (index !== -1) {
    const deletedRole = mockRoles[index];
    mockRoles.splice(index, 1);
    return deletedRole;
  }
  return null;
};