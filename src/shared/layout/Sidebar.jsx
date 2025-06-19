import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt, FaUserFriends, FaTruck, FaConciergeBell, FaBoxOpen,
  FaShoppingCart, FaDollarSign, FaClipboardList, FaFileContract, FaCalendarAlt,
  FaCalendarWeek, FaUsersCog, FaUserShield, FaCog, FaSignOutAlt, FaMoneyCheckAlt
} from 'react-icons/fa';

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const location = useLocation();

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
    { name: 'Proyectos', icon: <FaClipboardList />, path: '/dashboard/proyectos' },
    { name: 'Pagos y Abonos', icon: <FaMoneyCheckAlt />, path: '/dashboard/pagosyabonos' },
    { name: 'Agenda', icon: <FaCalendarAlt />, path: '/dashboard/agenda' },
    { name: 'Citas', icon: <FaCalendarWeek />, path: '/dashboard/citas' },
    { name: 'Categoria de Servicios', icon: <FaClipboardList />, path: '/dashboard/categoria_servicios' },
    { name: 'Programación Laboral', icon: <FaCalendarWeek />, path: '/dashboard/programacion' },
    { name: 'Usuarios', icon: <FaUsersCog />, path: '/dashboard/usuarios' },
    { name: 'Gestión de Roles', icon: <FaUserShield />, path: '/dashboard/roles' },
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
    <aside
      className={`bg-[#00012A] text-white h-screen fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-center h-16 px-4">
          {isExpanded ? (
            <h1 className="text-xl font-bold whitespace-nowrap">Conv3rTech</h1>
          ) : (
            <img src="https://via.placeholder.com/40" alt="Logo" className="rounded-full" />
          )}
        </div>

        <nav className="flex-grow px-2 space-y-1 overflow-hidden">
          {mainMenuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="text-xl">{item.icon}</div>
              {isExpanded && <span className="truncate">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-700 px-2 py-3">
          {bottomMenuItems.map((item) =>
            item.name === 'Cerrar Sesión' ? (
              <button
                key={item.name}
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <div className="text-xl">{item.icon}</div>
                {isExpanded && <span className="truncate">{item.name}</span>}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="text-xl">{item.icon}</div>
                {isExpanded && <span className="truncate">{item.name}</span>}
              </Link>
            )
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
