// src/features/dashboard/pages/roles/_mock/roles.data.js

export const mockRoles = [
  { 
    id: 1, 
    name: 'Administrador', 
    description: 'Acceso total a todos los módulos y configuraciones.', 
    status: 'Activo',
    // NUEVA PROPIEDAD: Un arreglo con los permisos del rol
    permisos: ['Gestion', 'Compras', 'Servicios', 'Ventas',]
  },
  { 
    id: 2, 
    name: 'Técnico de Campo', 
    description: 'Puede ver y gestionar órdenes de servicio y agenda.', 
    status: 'Activo',
    permisos: ['Agenda', 'Órdenes de Servicio', 'Citas']
  },
  { 
    id: 3, 
    name: 'Vendedor', 
    description: 'Acceso a los módulos de ventas, clientes y cotizaciones.', 
    status: 'Activo',
    permisos: ['Ventas', 'Clientes', 'Cotizaciones', 'Proyectos']
  },
  { 
    id: 4, 
    name: 'Rol Obsoleto', 
    description: 'Este rol ya no se utiliza en el sistema actual.', 
    status: 'Inactivo',
    permisos: [] // No tiene permisos
  },
];