// src/shared/layout/Sidebar.jsx

import { useState } from 'react';
// 1. IMPORTAMOS Link y useLocation
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt, FaUserFriends, FaTruck, FaConciergeBell, FaBoxOpen,
  FaShoppingCart, FaDollarSign, FaClipboardList, FaFileContract, FaCalendarAlt,
  FaCalendarWeek, FaUsersCog, FaUserShield, FaCog, FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  // 2. OBTENEMOS LA UBICACIÓN ACTUAL
  const location = useLocation(); // Hook para saber en qué ruta estamos

  // 3. AÑADIMOS LA PROPIEDAD 'path' a cada objeto del menú
  const mainMenuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/dashboard' },
    { name: 'Clientes', icon: <FaUserFriends />, path: '/dashboard/clientes' },
    { name: 'Proveedores', icon: <FaTruck />, path: '/dashboard/proveedores' },
    { name: 'Servicios', icon: <FaConciergeBell />, path: '/dashboard/servicios' },
    { name: 'Inventario', icon: <FaBoxOpen />, path: '/dashboard/inventario' },
    { name: 'Compras', icon: <FaShoppingCart />, path: '/dashboard/compras' },
    { name: 'Ventas', icon: <FaDollarSign />, path: '/dashboard/ventas' },
    { name: 'Órdenes de Servicio', icon: <FaClipboardList />, path: '/dashboard/ordenes' },
    { name: 'Cotizaciones', icon: <FaFileContract />, path: '/dashboard/cotizaciones' },
    {name: 'Proyectos', icon: <FaClipboardList />, path: '/dashboard/proyectos' },
    { name: 'Agenda', icon: <FaCalendarAlt />, path: '/dashboard/agenda' },
    { name: 'Programación Laboral', icon: <FaCalendarWeek />, path: '/dashboard/programacion' },
    { name: 'Usuarios y Roles', icon: <FaUsersCog />, path: '/dashboard/usuarios' },
    { name: 'Gestión de Roles', icon: <FaUserShield />, path: '/dashboard/roles' },
  ];

  const bottomMenuItems = [
    { name: 'Configuración', icon: <FaCog />, path: '/dashboard/configuracion' },
    { name: 'Cerrar Sesión', icon: <FaSignOutAlt />, path: '/logout' }, // Path especial para la lógica de logout
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    // Aquí iría tu lógica para cerrar sesión
    alert('Cerrando sesión...');
  };

  return (
    <aside
      className={`bg-[#00012A] text-white h-screen p-4 flex flex-col justify-between transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div>
        <div className="flex items-center justify-center mb-10 h-10">
          {isExpanded ? (
            <h1 className="text-xl font-bold ml-2 whitespace-nowrap">Conv3rTech</h1>
          ) : (
            <img src="https://via.placeholder.com/40" alt="Logo" className="rounded-full flex-shrink-0" />
          )}
        </div>
        <nav>
          <ul>
            {mainMenuItems.map((item) => (
              <li key={item.name} className="mb-2">
                {/* 4. REEMPLAZAMOS <a> por <Link> y 'href' por 'to' */}
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    // 5. La clase activa se basa en la URL actual
                    location.pathname === item.path
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="text-2xl flex-shrink-0">{item.icon}</div>
                  {isExpanded && <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-gray-700 pt-4">
        <ul>
          {bottomMenuItems.map((item) => (
            <li key={item.name} className="mb-2">
              {item.name === 'Cerrar Sesión' ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center p-3 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  <div className="text-2xl flex-shrink-0">{item.icon}</div>
                  {isExpanded && <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>}
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="text-2xl flex-shrink-0">{item.icon}</div>
                  {isExpanded && <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;