import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt, FaDollarSign, FaClipboardList, FaCalendarAlt,
  FaConciergeBell, FaCog, FaSignOutAlt
} from 'react-icons/fa';
import { usePermissions } from '../hooks/usePermissions';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const { filterMenuItems, userRole } = usePermissions();

  const isChildActive = (children) => {
    return children?.some(child => location.pathname === child.path);
  };

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const mainMenuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/dashboard' },
    { name: 'Usuarios', icon: <FaClipboardList />, path: '/dashboard/usuarios' },
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
        { name: 'Servicios', path: '/dashboard/servicios'},
        { name: 'Categoría de Servicios', path: '/dashboard/categoria_servicios' },
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
        { name: 'Editar mi Perfil', path: '/dashboard/profile' },
        { name: 'Gestión de Roles', path: '/dashboard/roles' }
      ]
    },
    { name: 'Cerrar Sesión', icon: <FaSignOutAlt />, path: '/logout' }
  ];

  // Filtrar menús según permisos del usuario
  const filteredMainMenuItems = filterMenuItems(mainMenuItems);
  const filteredBottomMenuItems = filterMenuItems(bottomMenuItems);

  const handleLogout = (e) => {
    e.preventDefault();
    alert('Cerrando sesión...');
  };

  const getBubbleClasses = (isActive) => {
    return isActive
      ? 'bg-white text-[#00012A] font-semibold shadow-md rounded-l-full pl-4 pr-2 transition-all duration-300'
      : 'hover:bg-gray-700 hover:text-white text-gray-400 transition-all duration-300';
  };

  const getSubitemBubbleClasses = (isActive) => {
    return isActive
      ? 'bg-white text-[#00012A] font-semibold shadow-md rounded-l-full pl-4 pr-2 transition-all duration-300'
      : 'hover:bg-gray-700 hover:text-white text-gray-400 transition-all duration-300';
  };

  const getActiveTextColor = (isActive) => {
    return isActive ? { color: '#00012A' } : {};
  };

  return (
    <aside
      className={`bg-[#00012A] text-white h-screen pl-3 rounded-r-xl  flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
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

      {/* Indicador de rol */}
      {isExpanded && userRole && (
        <div className="px-4 py-2 mb-4 bg-yellow-600/20 rounded-lg border border-yellow-600/30">
          <p className="text-xs text-yellow-400 font-medium">Rol: {userRole}</p>
        </div>
      )}

      {/* MENÚ PRINCIPAL */}
      <nav className="flex-grow overflow-y-auto scrollbar-hide">
        <ul className="pl-0">
          {filteredMainMenuItems.map((item) => {
            const isActiveParent = location.pathname === item.path || isChildActive(item.children);
            return (
              <li key={item.name} className="mb-2 relative " >
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg ${getBubbleClasses(isActiveParent)}`}
                    >
                      <div className={`text-2xl flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`}>
                        {item.icon}
                      </div>
                      {isExpanded && (
                        <>
                          <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>
                          <span className="ml-auto mr-2">{(openMenus[item.name] || isActiveParent) ? '▲' : '▼'}</span>
                        </>
                      )}
                    </button>
                    {(openMenus[item.name] || isActiveParent) && isExpanded && (
                      <ul className="ml-6 mt-1 pl-0">
                        {item.children.map((subItem) => {
                          const isActive = location.pathname === subItem.path;
                          return (
                            <li key={subItem.name} className="mb-1 relative">
                              <Link
                                to={subItem.path}
                                className={`no-underline flex items-center p-2 rounded-lg text-sm ${getSubitemBubbleClasses(isActive)}`}
                              >
                                <span style={getActiveTextColor(isActive)}>{subItem.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`no-underline flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg ${getBubbleClasses(isActiveParent)}`}
                  >
                    <div className={`text-2xl flex-shrink-0 ${isExpanded ? '' : 'mx-auto '}`} style={getActiveTextColor(isActiveParent)}>
                      {item.icon}
                    </div>
                    {isExpanded && (
                      <span className="ml-4 font-semibold whitespace-nowrap" style={getActiveTextColor(isActiveParent)}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* MENÚ INFERIOR */}
      <div className="border-t border-gray-700 pt-4 pr-0">
        <ul className="pl-0 pr-0">
          {filteredBottomMenuItems.map((item) => {
            const isActiveParent = location.pathname === item.path || isChildActive(item.children);
            return (
              <li key={item.name} className="mb-2 relative">
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg ${getBubbleClasses(isActiveParent)}`}
                    >
                      <div className={`text-2xl flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`}>
                        {item.icon}
                      </div>
                      {isExpanded && (
                        <>
                          <span className="ml-4 font-semibold whitespace-nowrap">{item.name}</span>
                          <span className="ml-auto mr-2">{(openMenus[item.name] || isActiveParent) ? '▲' : '▼'}</span>
                        </>
                      )}
                    </button>
                    {(openMenus[item.name] || isActiveParent) && isExpanded && (
                      <ul className="ml-6 mt-1 pl-0">
                        {item.children.map((subItem) => {
                          const isActive = location.pathname === subItem.path;
                          return (
                            <li key={subItem.name} className="mb-1 relative">
                              <Link
                                to={subItem.path}
                                className={`no-underline flex items-center p-2 rounded-lg text-sm ${getSubitemBubbleClasses(isActive)}`}
                              >
                                <span style={getActiveTextColor(isActive)}>{subItem.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`no-underline flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg ${getBubbleClasses(isActiveParent)}`}
                    onClick={item.name === 'Cerrar Sesión' ? handleLogout : undefined}
                  >
                    <div className={`text-2xl flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`} style={getActiveTextColor(isActiveParent)}>
                      {item.icon}
                    </div>
                    {isExpanded && (
                      <span className="ml-4 font-semibold whitespace-nowrap" style={getActiveTextColor(isActiveParent)}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
