import React from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { MODULES_CONFIG } from './pages/roles/config/rolesConfig';
import { FaLock, FaCheckCircle, FaUserShield } from 'react-icons/fa';

const DashboardFallbackPage = () => {
  const { user, hasPrivilege } = useAuth();
  const { checkAccess } = usePermissions();

  // Filtrar módulos a los que el usuario tiene acceso
  const accessibleModules = MODULES_CONFIG.filter(module => {
    if (module.name === 'Dashboard') return false; // No mostrar dashboard en la lista
    
    // Verificar acceso al módulo principal
    const hasModuleAccess = checkAccess(module.key || module.name) || hasPrivilege(module.name, 'Ver');
    
    if (hasModuleAccess) return true;

    // Verificar si tiene acceso a algún submódulo
    if (module.submodules) {
        return module.submodules.some(sub => 
            checkAccess(sub.key || sub.name) || hasPrivilege(sub.name, 'Ver') || hasPrivilege(`${module.name}.${sub.name}`, 'Ver')
        );
    }

    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header de Bienvenida */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Hola, {user?.nombre || 'Usuario'}!
            </h1>
            <p className="text-gray-600 text-lg">
              Bienvenido al sistema de gestión de Conv3rTech.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 bg-gray-100 w-fit px-3 py-1 rounded-full">
                <FaUserShield className="text-conv3r-gold" />
                <span>Rol actual: <span className="font-semibold text-gray-700">{user?.rol || 'Sin Rol'}</span></span>
            </div>
          </div>
          <div className="hidden md:block opacity-10">
            <img 
                src="https://ui-avatars.com/api/?name=Conv3r+Tech&background=random&size=128" 
                alt="Logo" 
                className="w-24 h-24 rounded-full"
            />
          </div>
        </div>

        {/* Panel de Funciones Disponibles */}
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Módulos Habilitados para ti
            </h2>
            
            {accessibleModules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accessibleModules.map((module) => (
                        <div key={module.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
                            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">
                                {module.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                {module.name}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Acceso habilitado a las funciones de {module.name.toLowerCase()}.
                            </p>
                            
                            {module.submodules && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Submódulos</p>
                                    <ul className="space-y-1">
                                        {module.submodules.map(sub => (
                                            <li key={sub.name} className="text-sm text-gray-600 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-conv3r-gold rounded-full"></span>
                                                {sub.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                    <FaLock className="mx-auto text-4xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800">Acceso Limitado</h3>
                    <p className="text-gray-500">
                        Tu rol actual no tiene módulos asignados visibles en este panel.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardFallbackPage;
