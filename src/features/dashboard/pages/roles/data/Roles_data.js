// src/features/dashboard/pages/roles/data/Roles_data.js

// Datos iniciales por defecto
const defaultRoles = [
  {
    id: 1,
    name: 'Administrador',
    description: 'Acceso total a todos los módulos y configuraciones.',
    status: 'Activo',
    permisos: ['Gestion', 'Compras', 'Servicios', 'Ventas'],
    // Nueva estructura de permisos detallados
    permissions: {
      'Dashboard': ['Ver'],
      'Usuarios': ['Crear', 'Ver', 'Editar', 'Eliminar', 'Exportar'],
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
      'Ventas.Proyectos de Servicio': ['Crear', 'Ver', 'Editar', 'Eliminar', 'Exportar'],
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
    permisos: ['Agenda', 'Órdenes de Servicio', 'Citas', 'Usuarios', 'Proyectos'],
    permissions: {
      'Dashboard': ['Ver'],
      'Usuarios': ['Ver'],
      'Ventas.Proyectos de Servicio': ['Ver'],
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
      'Ventas.Proyectos de Servicio': ['Crear', 'Ver', 'Editar', 'Exportar'],
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

// Clave para localStorage
const ROLES_STORAGE_KEY = 'conv3rtech_roles';

// Función para obtener roles desde localStorage
const getRolesFromStorage = () => {
  try {
    const stored = localStorage.getItem(ROLES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultRoles;
  } catch (error) {
    console.error('Error al cargar roles desde localStorage:', error);
    return defaultRoles;
  }
};

// Función para guardar roles en localStorage
const saveRolesToStorage = (roles) => {
  try {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
  } catch (error) {
    console.error('Error al guardar roles en localStorage:', error);
  }
};

// Variable para mantener los roles en memoria
let mockRoles = getRolesFromStorage();

// Exportar mockRoles para compatibilidad con otros archivos
export { mockRoles };

// Función para obtener el siguiente ID disponible
const getNextId = () => {
  const roles = getRolesFromStorage();
  return Math.max(...roles.map(role => role.id), 0) + 1;
};

// Función para crear un nuevo rol
export const createRole = (roleData) => {
  const roles = getRolesFromStorage();
  
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
  
  // Añadir al principio del array
  roles.unshift(newRole);
  
  // Guardar en localStorage
  saveRolesToStorage(roles);
  
  // Actualizar la variable en memoria y exportada
  mockRoles = roles;
  
  return newRole;
};

// Función para obtener todos los roles
export const getRoles = () => {
  const roles = getRolesFromStorage();
  mockRoles = roles; // Actualizar la variable exportada
  return [...roles];
};

// Función para obtener un rol por ID
export const getRoleById = (id) => {
  const roles = getRolesFromStorage();
  return roles.find(role => role.id === id);
};

// Función para actualizar un rol
export const updateRole = (id, updatedData) => {
  const roles = getRolesFromStorage();
  const index = roles.findIndex(role => role.id === id);
  
  if (index !== -1) {
    // Generar permisos simplificados si se actualizan los permisos
    if (updatedData.permissions) {
      const permisos = [];
      Object.keys(updatedData.permissions).forEach(key => {
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
      updatedData.permisos = permisos;
    }
    
    roles[index] = { ...roles[index], ...updatedData };
    
    // Guardar en localStorage
    saveRolesToStorage(roles);
    
    // Actualizar la variable en memoria y exportada
    mockRoles = roles;
    
    return roles[index];
  }
  return null;
};

// Función para eliminar un rol
export const deleteRole = (id) => {
  const roles = getRolesFromStorage();
  const index = roles.findIndex(role => role.id === id);
  
  if (index !== -1) {
    const deletedRole = roles[index];
    roles.splice(index, 1);
    
    // Guardar en localStorage
    saveRolesToStorage(roles);
    
    // Actualizar la variable en memoria y exportada
    mockRoles = roles;
    
    return deletedRole;
  }
  return null;
};

// Función para resetear los datos a los valores por defecto
export const resetRolesToDefault = () => {
  saveRolesToStorage(defaultRoles);
  mockRoles = defaultRoles;
  return defaultRoles;
};

// Función para limpiar todos los datos
export const clearAllRoles = () => {
  localStorage.removeItem(ROLES_STORAGE_KEY);
  mockRoles = [];
  return [];
};