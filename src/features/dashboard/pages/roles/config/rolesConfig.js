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
        key: "proveedores",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Categorías de Productos",
        key: "categoria de productos",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      { name: "Productos", key: "productos", privileges: ["Crear", "Ver", "Editar", "Eliminar"] },
      { name: "Compras", key: "compras", privileges: ["Crear", "Ver", "Editar", "Anular"] },
    ],
  },
  {
    name: "Servicios",
    icon: "🔧",
    submodules: [
      {
        name: "Categoría de Servicios",
        key: "categoría de servicios",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Órdenes de Servicio",
        key: "servicios", // Mapped to DB 'Servicios'
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Programación laboral",
        key: "programacion laboral",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
    ],
  },
  {
    name: "Ventas",
    icon: "📈",
    submodules: [
      { name: "Clientes", key: "clientes", privileges: ["Crear", "Ver", "Editar", "Eliminar"] },
      {
        name: "Venta de Productos",
        key: "venta de productos",
        privileges: ["Crear", "Ver", "Editar", "Anular"],
      },
      {
        name: "Órdenes de Servicios",
        key: "servicios",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      { name: "Citas", key: "citas", privileges: ["Crear", "Ver", "Editar", "Eliminar"] },
      {
        name: "Cotizaciones",
        key: "cotizaciones",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Proyectos de Servicio",
        key: "proyectos",
        privileges: ["Crear", "Ver", "Editar", "Eliminar", "Exportar"],
      },
      {
        name: "Pagos y Abonos",
        key: "pagos y abonos",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
    ],
  },
  {
    name: "Configuración",
    icon: "⚙️",
    submodules: [
      { name: "Editar mi Perfil", key: "perfil", privileges: ["Ver", "Editar"] },
      {
        name: "Gestión de Roles",
        key: "roles",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
    ],
  },
];
