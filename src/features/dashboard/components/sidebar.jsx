// src/shared/layout/Sidebar.jsx

import { useState } from 'react';
// 1. Importamos todos los íconos necesarios de Font Awesome (fa)
import {
  FaTachometerAlt, FaUserFriends, FaTruck, FaConciergeBell, FaBoxOpen,
  FaShoppingCart, FaDollarSign, FaClipboardList, FaFileContract, FaCalendarAlt,
  FaCalendarWeek, FaUsersCog, FaUserShield, FaCog, FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // 2. Creamos el array para los ítems del menú principal
  const mainMenuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt /> },
    { name: 'Clientes', icon: <FaUserFriends /> },
    { name: 'Proveedores', icon: <FaTruck /> },
    { name: 'Servicios', icon: <FaConciergeBell /> },
    { name: 'Inventario', icon: <FaBoxOpen /> },
    { name: 'Compras', icon: <FaShoppingCart /> },
    { name: 'Ventas', icon: <FaDollarSign /> },
    { name: 'Órdenes de Servicio', icon: <FaClipboardList /> },
    { name: 'Cotizaciones', icon: <FaFileContract /> },
    { name: 'Agenda', icon: <FaCalendarAlt /> },
    { name: 'Programación Laboral', icon: <FaCalendarWeek /> },
    { name: 'Usuarios', icon: <FaUsersCog /> },
    { name: 'Gestión de Roles', icon: <FaUserShield /> },
  ];

  // 3. Creamos un array separado para los ítems inferiores
  const bottomMenuItems = [
    { name: 'Configuración', icon: <FaCog /> },
    { name: 'Cerrar Sesión', icon: <FaSignOutAlt /> },
  ];

  return (
    <aside
      className={`bg-[#00012A] text-white h-screen p-4 flex flex-col justify-between transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Sección Superior del Menú */}
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
            {mainMenuItems.map((item, index) => (
              <li key={index} className="mb-2">
                <a
                  href="#"
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    activeIndex === index
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="text-2xl flex-shrink-0">{item.icon}</div>
                  {isExpanded && <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Sección Inferior del Menú */}
      <div className="border-t border-gray-700 pt-4">
        <ul>
          {bottomMenuItems.map((item, index) => (
            <li key={index} className="mb-2">
              <a
                href="#"
                className="flex items-center p-3 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <div className="text-2xl flex-shrink-0">{item.icon}</div>
                {isExpanded && <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;