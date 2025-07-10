import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaBell, FaCog, FaSignOutAlt, FaUser, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  // Obtener datos del usuario desde localStorage
  useEffect(() => {
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      try {
        const userData = JSON.parse(userFromStorage);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Si hay error, usar datos por defecto
        setCurrentUser({
          name: 'Usuario',
          lastName: 'Sistema',
          email: 'usuario@sistema.com',
          avatarSeed: 'Usuario',
          role: 'Usuario'
        });
      }
    } else {
      // Si no hay usuario en localStorage, redirigir al login
      navigate('/');
    }
  }, [navigate]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      // Limpiar datos de sesión
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      sessionStorage.clear();
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
    setIsProfileMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/dashboard/settings');
    setIsProfileMenuOpen(false);
  };

  // Si no hay usuario, mostrar loading
  if (!currentUser) {
    return (
      <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-800">Conv3rTech</h1>
        </div>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800">Conv3rTech</h1>
      </div>
      
      {/* Iconos alineados a la derecha */}
      <div className="flex items-center gap-4">
        {/* Perfil con dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="relative">
              <img
                className="h-10 w-10 rounded-full ring-2 ring-conv3r-gold"
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.avatarSeed}&backgroundColor=ffd700&textColor=1a1a1a`}
                alt="Avatar del usuario"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="hidden md:block text-left p-2">

              <p className="text-sm font-semibold text-gray-800">{currentUser.name} {currentUser.lastName}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <FaChevronDown className={`text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              {/* Header del dropdown */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <img
                    className="h-12 w-12 rounded-full ring-2 ring-conv3r-gold"
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.avatarSeed}&backgroundColor=ffd700&textColor=1a1a1a`}
                    alt="Avatar del usuario"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{currentUser.name} {currentUser.lastName}</p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                    <p className="text-xs text-conv3r-gold font-medium">{currentUser.role}</p>
                  </div>
                </div>
              </div>

              {/* Opciones del menú */}
              <div className="py-2">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaUser className="text-conv3r-gold" />
                  <span>Mi Perfil</span>
                </button>
                
                <button
                  onClick={handleSettingsClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaCog className="text-conv3r-gold" />
                  <span>Configuración</span>
                </button>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-100 my-2"></div>

              {/* Cerrar sesión */}
              <div className="px-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;