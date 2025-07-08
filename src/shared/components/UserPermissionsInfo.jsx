import React from 'react';
import { FaUserShield, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { usePermissions } from '../hooks/usePermissions';

const UserPermissionsInfo = () => {
  const { userRole, accessibleModules, checkManage } = usePermissions();

  if (!userRole) return null;

  const manageableModules = accessibleModules.filter(module => checkManage(module));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FaUserShield className="text-yellow-600 text-lg" />
        <h3 className="text-lg font-semibold text-gray-800">Información de Permisos</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rol del usuario */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tu Rol</h4>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-500 text-sm" />
            <span className="text-sm font-semibold text-gray-800">{userRole}</span>
          </div>
        </div>

        {/* Módulos accesibles */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Módulos Accesibles</h4>
          <div className="flex flex-wrap gap-1">
            {accessibleModules.length > 0 ? (
              accessibleModules.slice(0, 3).map(module => (
                <span key={module} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {module}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">Ninguno</span>
            )}
            {accessibleModules.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{accessibleModules.length - 3} más
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Módulos que puede gestionar */}
      {manageableModules.length > 0 && (
        <div className="mt-4 bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
            <FaUserShield className="text-blue-600" />
            Módulos que puedes gestionar
          </h4>
          <div className="flex flex-wrap gap-1">
            {manageableModules.map(module => (
              <span key={module} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {module}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-800">
          <strong>Nota:</strong> Solo puedes ver y acceder a los módulos para los que tienes permisos según tu rol.
          Si necesitas acceso a módulos adicionales, contacta a tu administrador.
        </p>
      </div>
    </div>
  );
};

export default UserPermissionsInfo;