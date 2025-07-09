import React from 'react';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AccessDenied = ({ moduleName = 'este módulo' }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <FaLock className="w-10 h-10 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Acceso Denegado
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          No tienes permisos para acceder a <span className="font-semibold text-gray-800">{moduleName}</span>.
          <br />
          Contacta a tu administrador si necesitas acceso a este módulo.
        </p>

        {/* Botón de regreso */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <FaArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </button>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            Si crees que esto es un error, verifica tu rol de usuario en tu perfil.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
