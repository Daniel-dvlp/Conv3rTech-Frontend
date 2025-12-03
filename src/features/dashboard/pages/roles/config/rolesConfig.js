export const MODULES_CONFIG = [
  {
    name: "Dashboard",
    icon: "📊",
    privileges: ["Ver"],
  },
  {
    name: "Usuarios",
    key: "usuarios",
    icon: "👥",
    privileges: ["Crear", "Ver", "Editar", "Eliminar", "Exportar"],
  },
  {
    name: "Compras",
    icon: "💰",
    submodules: [
      {
        name: "Proveedores",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Categorías de Productos",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      { name: "Productos", privileges: ["Crear", "Ver", "Editar", "Eliminar"] },
      { name: "Compras", privileges: ["Crear", "Ver", "Editar", "Anular"] },
    ],
  },
  {
    name: "Servicios",
    icon: "🔧",
    submodules: [
      {
        name: "Categoría de Servicios",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Órdenes de Servicio",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Programación laboral",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
    ],
  },
  {
    name: "Ventas",
    icon: "📈",
    submodules: [
      { name: "Clientes", privileges: ["Crear", "Ver", "Editar", "Eliminar"] },
      {
        name: "Venta de Productos",
        privileges: ["Crear", "Ver", "Editar", "Anular"],
      },
      {
        name: "Órdenes de Servicios",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      { name: "Citas", privileges: ["Crear", "Ver", "Editar", "Eliminar"] },
      {
        name: "Cotizaciones",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Proyectos de Servicio",
        key: "proyectos_servicios",
        privileges: ["Crear", "Ver", "Editar", "Eliminar", "Exportar"],
      },
      {
        name: "Pagos y Abonos",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
    ],
  },
  {
    name: "Configuración",
    icon: "⚙️",
    submodules: [
      { name: "Editar mi Perfil", privileges: ["Ver", "Editar"] },
      {
        name: "Gestión de Roles",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
    ],
  },
];
