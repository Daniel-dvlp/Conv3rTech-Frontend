import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt, FaDollarSign, FaClipboardList, FaCalendarAlt,
  FaConciergeBell, FaCog, FaSignOutAlt
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
      name: 'Usuarios',
      icon: <FaClipboardList />,
      path: '/dashboard/usuarios'
    },
    
    {
      name: 'Compras',
      icon: <FaDollarSign />,
      children: [
        { name: 'Proveedores', path: '/dashboard/proveedores' },
        { name: 'Categorías de Productos', path: '/dashboard/categoria_productos' },
        { name: 'Productos', path: '/dashboard/productos' },
        { name: 'Compras', path: '/dashboard/compras' },
      ]
    },
    {
      name: 'Servicios',
      icon: <FaConciergeBell />,
      children: [
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
        { name: 'Cotizaciones', path: '/dashboard/cotizaciones' },
        { name: 'Proyectos de Servicio', path: '/dashboard/proyectos_servicios' },
        { name: 'Pagos y Abonos', path: '/dashboard/pagosyabonos' },
      ]
    }
  ];

  const bottomMenuItems = [
    {
      name: 'Configuración',
      icon: <FaCog />,
      children: [
        { name: 'Editar mi Perfil', path: '/dashboard/perfil' },
        { name: 'Gestión de Roles', path: '/dashboard/roles' }
      ]
    },
    { name: 'Cerrar Sesión', icon: <FaSignOutAlt />, path: '/logout' }
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    alert('Cerrando sesión...');
  };

  return (
    <aside
      className={`bg-[#00012A] text-white h-screen p-3 flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* LOGO */}
      <div className="flex items-center justify-center mb-10 h-10">
        {isExpanded ? (
          <h1 className="text-3xl font-bold ml-2 whitespace-nowrap">
            Conv<span style={{ color: '#FFB300' }}>3</span>rTech
          </h1>
        ) : (
          <img
            src="https://via.placeholder.com/40"
            alt="Logo"
            className="rounded-full"
          />
        )}
      </div>

      {/* MENÚ PRINCIPAL */}
      <nav className="flex-grow overflow-y-auto">
        <ul className="pl-0">
          {mainMenuItems.map((item) => (
            <li key={item.name} className="mb-2">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg transition-colors duration-200 ${openMenus[item.name] ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                  >
                    <div className={`text-2xl flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`}>{item.icon}</div>
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
                        <li key={subItem.name} className="mb-1 w-100">
                          <Link
                            to={subItem.path}
                            className={`no-underline flex items-center p-2 rounded-lg text-sm transition-colors duration-200 ${
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
                  className={`no-underline flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className={`text-2xl flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`}>{item.icon}</div>
                  {isExpanded && (
                    <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* MENÚ INFERIOR */}
      <div className="border-t border-gray-700 pt-4">
        <ul className="pl-0">
          {bottomMenuItems.map((item) => (
            <li key={item.name} className="mb-2">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg transition-colors duration-200 ${
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
                            className={`no-underline flex items-center p-2 rounded-lg text-sm transition-colors duration-200 ${
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
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center p-2 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  }`}
                >
                  <div className={`text-2xl flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`}>
                    {item.icon}
                  </div>
                  {isExpanded && (
                    <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
