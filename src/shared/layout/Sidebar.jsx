import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaDollarSign, FaClipboardList, FaCalendarAlt,
  FaConciergeBell, FaCog, FaSignOutAlt, FaLock, FaUnlock
} from 'react-icons/fa';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';

// Componente Tooltip mejorado
const Tooltip = ({ children, text, isExpanded }) => {
  if (isExpanded) return children;

  return (
    <div className="relative group">
      {children}
      <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-800 to-gray-700 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 border border-gray-600">
        {text}
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { filterMenuItems, userRole } = usePermissions();
  
  // Ref para mantener el estado expandido durante la navegación
  const wasExpandedRef = useRef(false);
  const isNavigatingRef = useRef(false);

  // Preservar el estado expandido cuando cambia la ruta
  useEffect(() => {
    // Si estaba expandido antes de navegar, mantenerlo expandido
    if (wasExpandedRef.current && !isLocked) {
      setIsExpanded(true);
    }
    // Marcar que ya no estamos navegando
    isNavigatingRef.current = false;
  }, [location.pathname, isLocked]);

  // Si está bloqueado, mantener siempre expandido
  useEffect(() => {
    if (isLocked && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isLocked, isExpanded]);

  const isChildActive = (children) => {
    return children?.some(child => location.pathname === child.path);
  };

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => {
      const newMenus = { ...prev };
      // Cerrar otros menús al abrir uno nuevo
      Object.keys(newMenus).forEach(key => {
        if (key !== menuName) {
          newMenus[key] = false;
        }
      });
      newMenus[menuName] = !prev[menuName];
      return newMenus;
    });
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
        { name: 'Categoría de Servicios', path: '/dashboard/categoria_servicios' },
        { name: 'Servicios', path: '/dashboard/servicios'},
        { name: 'Programación laboral', path: '/dashboard/programacion_laboral' },
      ]
    },
    {
      name: 'Ventas',
      icon: <FaCalendarAlt />,
      children: [
        { name: 'Clientes', path: '/dashboard/clientes' },
        { name: 'Venta de Productos', path: '/dashboard/venta_productos' },
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
        { name: 'Gestión de Roles', path: '/dashboard/roles' }
      ]
    }
  ];

  const logoutItem = { name: 'Cerrar Sesión', icon: <FaSignOutAlt />, path: '/logout' };

  // Filtrar menús según permisos del usuario
  const filteredMainMenuItems = filterMenuItems(mainMenuItems);
  const filteredBottomMenuItems = filterMenuItems(bottomMenuItems);
  
  // Always add logout item at the end
  const finalBottomItems = [...filteredBottomMenuItems, logoutItem];

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const { showAlert } = await import("../utils/alertas");
      const result = await showAlert({
        title: "Cerrar sesión",
        text: "¿Estás seguro de que deseas cerrar sesión?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#e74c3c",
      });
      
      if (result.isConfirmed) {
        await logout();
        const { showToast } = await import("../utils/alertas");
        showToast("Sesión cerrada correctamente", "success");
        navigate('/login');
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      const { showToast } = await import("../utils/alertas");
      showToast("Error al cerrar sesión", "error");
    }
  };

  const getBubbleClasses = (isActive) => {
    return isActive
      ? 'bg-gradient-to-r from-[#FFF8DC] to-[#FFF3CD] text-[#00012A] font-semibold shadow-lg rounded-xl pl-4 pr-2 transition-all duration-300'
      : 'hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-500 hover:text-white hover:shadow-md text-gray-400 transition-all duration-300';
  };

  const getSubitemBubbleClasses = (isActive) => {
    return isActive
      ? 'bg-gradient-to-r from-[#FFF8DC] to-[#FFF3CD] text-[#00012A] font-semibold shadow-lg rounded-xl pl-3 pr-2 transition-all duration-300'
      : 'hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-500 hover:text-white hover:shadow-md text-gray-400 transition-all duration-300';
  };

  const getActiveTextColor = (isActive) => {
    return isActive ? { color: '#00012A' } : {};
  };

  const handleMouseEnter = () => {
    if (!isLocked) {
      wasExpandedRef.current = true;
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isLocked) {
      wasExpandedRef.current = false;
      setIsExpanded(false);
    }
  };

  const sidebarWidth = isExpanded ? '256px' : '80px'; // 256px = w-64, 80px = w-20

  return (
    <aside
      className={`bg-gradient-to-b from-[#00012A] to-[#001133] text-white h-screen pl-1 rounded-r-xl flex flex-col transition-all duration-500 ease-in-out shadow-2xl relative`}
      style={{ 
        width: sidebarWidth, 
        minWidth: sidebarWidth, 
        maxWidth: sidebarWidth 
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* LOGO */}
      <div className="flex items-center justify-start pl-5 mb-5 mt-6 h-10 relative">
        {isExpanded ? (
          <>
            <h1 className="text-3xl font-bold whitespace-nowrap">
              Conv<span style={{ color: '#FFB300' }}>3</span>rTech
            </h1>
            <button
              onClick={() => setIsLocked(!isLocked)}
              className="absolute right-2 p-1.5 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-md transition-all duration-300 hover:scale-110"
              title={isLocked ? 'Desbloquear sidebar' : 'Bloquear sidebar'}
            >
              {isLocked ? <FaLock size={12} /> : <FaUnlock size={12} />}
            </button>
          </>
        ) : (
          <span className="mr-0 text-3xl font-extrabold text-white" style={{letterSpacing: '2px'}}>
            <span style={{ color: '#FFB300' }}>C</span>3
          </span>
        )}
      </div>

      {/* Indicador de rol */}
      {/* {isExpanded && userRole && (
        <div className="flex items-center justify-center mb-4">
          <span className="text-xs text-[#FFD54F] bg-gradient-to-r from-gray-700 to-gray-600 px-3 py-1 rounded-full shadow-md border border-gray-600">
            {userRole}
          </span>
        </div>
      )} */}

      {/* BOTÓN DASHBOARD SIEMPRE ARRIBA */}
      <nav className="flex-grow overflow-y-auto scrollbar-hide px-2" style={{ width: '100%', overflowX: 'hidden' }}>
        <ul className="pl-0 space-y-2" style={{ width: '100%', listStyle: 'none', margin: 0, padding: 0 }}>
          <li className="relative" style={{ width: '100%' }}>
            <Tooltip text="Dashboard" isExpanded={isExpanded}>
              <Link
                to="/dashboard"
                className={`no-underline flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg ${location.pathname === '/dashboard' ? 'bg-gradient-to-r from-[#FFF8DC] to-[#FFF3CD] text-[#00012A] font-semibold shadow-lg rounded-xl pl-4 pr-2' : 'hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-500 hover:text-white hover:shadow-md text-gray-400'}`}
                style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                <span className="text-2xl flex-shrink-0">
                  <FaTachometerAlt />
                </span>
                {isExpanded && (
                  <span className="ml-4 font-semibold whitespace-nowrap">
                    Dashboard
                  </span>
                )}
              </Link>
            </Tooltip>
          </li>
          {/* RESTO DEL MENÚ FILTRADO */}
          {filteredMainMenuItems.filter(item => item.name !== 'Dashboard').map((item) => {
            const isActiveParent = location.pathname === item.path || isChildActive(item.children);
            return (
              <li key={item.name} className="relative" style={{ width: '100%' }}>
                {item.children ? (
                  <>
                    <Tooltip text={item.name} isExpanded={isExpanded}>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg ${getBubbleClasses(isActiveParent)}`}
                        style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
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
                    </Tooltip>
                    {(openMenus[item.name] || isActiveParent) && isExpanded && (
                      <ul className="mt-1 pl-0" style={{ width: 'calc(100% - 0.5rem)', listStyle: 'none', margin: 0, padding: 0, marginLeft: '2rem' }}>
                        {item.children.map((subItem) => {
                          const isActive = location.pathname === subItem.path;
                          return (
                            <li key={subItem.name} className="relative" style={{ width: '100%' }}>
                              <Link
                                to={subItem.path}
                                className={`no-underline flex items-center p-2 rounded-lg text-sm ${getSubitemBubbleClasses(isActive)}`}
                                style={{ width: '85%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
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
                  <Tooltip text={item.name} isExpanded={isExpanded}>
                    <Link
                      to={item.path}
                      className={`no-underline flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg ${getBubbleClasses(isActiveParent)}`}
                      style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
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
                  </Tooltip>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* MENÚ INFERIOR */}
      <div className="border-t border-gray-600 pt-1 pb-6 pr-0 px-2" style={{ width: '100%', overflowX: 'hidden' }}>
        <ul className="pl-0 pr-0 space-y-2" style={{ width: '100%', height: '100%', listStyle: 'none', margin: 0, padding: 0 }}>
          {/* Espacio adicional para mejor separación */}
          <li className="h-2"></li>
          {finalBottomItems.map((item) => {
            const isActiveParent = location.pathname === item.path || isChildActive(item.children);
            return (
              <li key={item.name} className="relative" style={{ width: '100%' }}>
                {item.children ? (
                  <>
                    <Tooltip text={item.name} isExpanded={isExpanded}>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg ${getBubbleClasses(isActiveParent)}`}
                        style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
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
                    </Tooltip>
                    {(openMenus[item.name] || isActiveParent) && isExpanded && (
                      <ul className="mt-1 pl-0" style={{ width: 'calc(100% - 0.5rem)', listStyle: 'none', margin: 0, padding: 0, marginLeft: '2rem' }}>
                        {item.children.map((subItem) => {
                          const isActive = location.pathname === subItem.path;
                          return (
                            <li key={subItem.name} className="relative" style={{ width: '100%' }}>
                              <Link
                                to={subItem.path}
                                className={`no-underline flex items-center p-2 rounded-lg text-sm ${getSubitemBubbleClasses(isActive)}`}
                                style={{ width: '85%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
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
                  <Tooltip text={item.name} isExpanded={isExpanded}>
                    <Link
                      to={item.path}
                      className={`no-underline flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-2 rounded-lg ${getBubbleClasses(isActiveParent)}`}
                      style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
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
                  </Tooltip>
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


