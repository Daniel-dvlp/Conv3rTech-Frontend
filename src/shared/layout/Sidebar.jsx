import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt, FaUserFriends, FaTruck, FaConciergeBell, FaBoxOpen,
  FaShoppingCart, FaDollarSign, FaClipboardList, FaFileContract, FaCalendarAlt,
  FaCalendarWeek, FaUsersCog, FaUserShield, FaCog, FaSignOutAlt, FaMoneyCheckAlt
} from 'react-icons/fa';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const mainMenuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/dashboard' },
    {
      name: 'Gestión',
      icon: <FaClipboardList />,
      children: [
        { name: 'Usuarios', path: '/dashboard/usuarios' },
        { name: 'Gestión de Roles', path: '/dashboard/roles' },
      ]
    },
    {
      name: 'Compras',
      icon: <FaDollarSign />,
      children: [
        { name: 'Proveedores', path: '/dashboard/proveedores' },
        { name: 'Categorías de Productos', path: '/dashboard/categoria_productos' },
        { name: 'Productos', path: '/dashboard/productos' },
        { name: 'Cotizaciones', path: '/dashboard/cotizaciones'},
        { name: 'Compras', path: '/dashboard/compras' },
      ]
    },
    {
      name: 'Servicios',
      icon: <FaConciergeBell />,
      children: [
        { name: 'Servicios', path: '/dashboard/servicios'},
        { name: 'Categoría de Servicios', path: '/dashboard/categoria_servicios' },
        { name: 'Órdenes de Servicio', path: '/dashboard/ordenes_servicios' },
        { name: 'Programación laboral', path: '/dashboard/programacion_laboral' },
      ]
    },
    {
      name: 'Ventas',
      icon: <FaCalendarAlt />,
      children: [
        { name: 'Clientes', path: '/dashboard/clientes' },
        { name: 'Venta de Productos', path: '/dashboard/venta_productos' },
        { name: 'Ordenes de Servicios', path: '/dashboard/ordenes_servicios' },
        { name: 'Citas', path: '/dashboard/citas' },
        { name: 'Proyectos de Servicio', path: '/dashboard/proyectos_servicios' },
        { name: 'Pagos y Abonos', path: '/dashboard/pagosyabonos' },
      ]
    }
  ];

  const bottomMenuItems = [
    { name: 'Configuración', icon: <FaCog />, path: '/dashboard/configuracion' },
    { name: 'Cerrar Sesión', icon: <FaSignOutAlt />, path: '/logout' },

  ];

  const handleLogout = (e) => {
    e.preventDefault();

    alert('Cerrando sesión...');

  };

  return (
    // Se usa 'sticky' para que el sidebar "empuje" el contenido en lugar de flotar sobre él.
    <aside

      className={`bg-[#00012A] text-white h-screen p-3 flex flex-col transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'

      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >

      <div className="flex-grow overflow-y-auto invisible-scrollbar">
        <div className="flex items-center justify-center mb-10 h-10">
          {isExpanded ? (
            <h1 className="text-3xl font-bold ml-2 whitespace-nowrap">
              Conv<span style={{ color: 'rgb(255,179,0)' }}>3</span>rTech
            </h1>

          ) : (
            <img
              src="https://via.placeholder.com/40"
              alt="Logo"

              className="rounded-full flex-shrink-0"

            />
          )}
        </div>


        <nav>
          <ul className="pl-0">
            {mainMenuItems.map((item) => (
              <li key={item.name} className="mb-2">
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center ${
                        isExpanded ? 'justify-start' : 'justify-center'
                      } p-2 rounded-lg transition-colors duration-200 ${
                        openMenus[item.name]
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <div className={`text-2xl flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`}>
                        {item.icon}
                      </div>
                      {isExpanded && (
                        <>
                          <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>
                          <span className="ml-auto mr-2">{openMenus[item.name] ? '▲' : '▼'}</span>
                        </>
                      )}
                    </button>

                    {openMenus[item.name] && isExpanded && (
                      <ul className="ml-6 mt-1 pl-0">
                        {item.children.map((subItem) => (
                          <li key={subItem.name} className="mb-1">
                            <Link
                              to={subItem.path}
                              className={`no-underline flex items-center p-2 rounded-lg transition-colors duration-200 text-sm ${
                                location.pathname === subItem.path
                                  ? 'bg-gray-600 text-white'
                                  : 'text-gray-400 hover:bg-gray-600 hover:text-white'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`no-underline flex items-center ${
                      isExpanded ? 'justify-start' : 'justify-center'
                    } p-2 rounded-lg transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <div className={`text-2xl flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`}>
                      {item.icon}
                    </div>
                    {isExpanded && (
                      <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>
                    )}
                  </Link>
                )}

              </li>
            ))}
          </ul>
        </nav>

      </div>

      <div className="border-t border-gray-700 pt-4">
        <ul className="pl-0">
          {bottomMenuItems.map((item) => (
            <li key={item.name} className="mb-2">
              {item.name === 'Cerrar Sesión' ? (
                <button
                  onClick={handleLogout}
                  className={`no-underline w-full flex items-center ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  } p-2 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white`}
                >
                  <div className={`text-2xl flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`}>
                    {item.icon}
                  </div>
                  {isExpanded && (
                    <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>
                  )}
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`no-underline flex items-center ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  } p-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className={`text-2xl flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`}>
                    {item.icon}
                  </div>
                  {isExpanded && (
                    <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>
                  )}
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
