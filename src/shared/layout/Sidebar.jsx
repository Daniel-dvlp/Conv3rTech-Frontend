import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt, FaUserFriends, FaTruck, FaConciergeBell, FaBoxOpen,
  FaShoppingCart, FaDollarSign, FaClipboardList, FaFileContract, FaCalendarAlt,
  FaCalendarWeek, FaUsersCog, FaUserShield, FaCog, FaSignOutAlt, FaMoneyCheckAlt,
  FaBoxes, FaTags
} from "react-icons/fa";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const mainMenuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
    { name: "Clientes", icon: <FaUserFriends />, path: "/dashboard/clientes" },
    { name: "Proveedores", icon: <FaTruck />, path: "/dashboard/proveedores" },
    { name: "Servicios", icon: <FaConciergeBell />, path: "/dashboard/servicios" },
    { name: "Categoría de Servicios", icon: <FaClipboardList />, path: "/dashboard/categoria-servicios" },
    { name: "Productos", icon: <FaBoxes />, path: "/dashboard/productos" },
    { name: "Categoría de Productos", icon: <FaTags />, path: "/dashboard/categoria-productos" },
    { name: "Compras", icon: <FaShoppingCart />, path: "/dashboard/compras" },
    { name: "Ventas", icon: <FaDollarSign />, path: "/dashboard/ventas" },
    { name: "Órdenes de Servicio", icon: <FaClipboardList />, path: "/dashboard/ordenes" },
    { name: "Cotizaciones", icon: <FaFileContract />, path: "/dashboard/cotizaciones" },
    { name: "Proyectos", icon: <FaClipboardList />, path: "/dashboard/proyectos" },
    { name: "Pagos y Abonos", icon: <FaMoneyCheckAlt />, path: "/dashboard/pagosyabonos" },
    { name: "Citas", icon: <FaCalendarWeek />, path: "/dashboard/citas" },
    { name: "Programación Laboral", icon: <FaCalendarWeek />, path: "/dashboard/programacion" },
    { name: "Usuarios", icon: <FaUsersCog />, path: "/dashboard/usuarios" },
    { name: "Gestión de Roles", icon: <FaUserShield />, path: "/dashboard/roles" },
  ];

  const bottomMenuItems = [
    { name: "Configuración", icon: <FaCog />, path: "/dashboard/configuracion" },
    { name: "Cerrar Sesión", icon: <FaSignOutAlt />, path: "/logout" },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    alert("Cerrando sesión...");
  };

  return (
    // Se usa 'sticky' para que el sidebar "empuje" el contenido en lugar de flotar sobre él.
    <aside
  className={`bg-[#00012A] text-white h-screen sticky top-0 transition-all duration-300 ease-in-out ${
    isExpanded ? "w-64" : "w-20"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Sección del Logo (no se encoge) */}
        <div className="flex items-center justify-center h-20 flex-shrink-0">
          {isExpanded ? (
            <h1 className="text-xl font-bold whitespace-nowrap">Conv3rTech</h1>
          ) : (
            <img
              src="https://via.placeholder.com/40"
              alt="Logo"
              className="rounded-full"
            />
          )}
        </div>

        {/* Sección del Menú Principal (con scroll personalizado) */}
        <nav className="flex-grow px-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <ul>
            {mainMenuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <div className="text-xl flex-shrink-0 w-6 text-center">{item.icon}</div>
                  {isExpanded && <span className="truncate">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sección Inferior (no se encoge) */}
        <div className="border-t border-gray-700 px-2 py-3 flex-shrink-0">
          <ul>
            {bottomMenuItems.map((item) =>
              item.name === "Cerrar Sesión" ? (
                <li key={item.name}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    <div className="text-xl flex-shrink-0 w-6 text-center">{item.icon}</div>
                    {isExpanded && <span className="truncate">{item.name}</span>}
                  </button>
                </li>
              ) : (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <div className="text-xl flex-shrink-0 w-6 text-center">{item.icon}</div>
                    {isExpanded && <span className="truncate">{item.name}</span>}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;