// src/features/dashboard/pages/roles/components/RolesTable.jsx

import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const RolesTable = ({ roles }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {/* SE ELIMINÓ LA COLUMNA DEL CHECKBOX DE AQUÍ */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {roles.map((rol) => (
            <tr key={rol.id} className="hover:bg-gray-50 transition-colors">
              {/* SE ELIMINÓ LA CELDA DEL CHECKBOX DE AQUÍ */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-4">
                  <img
                    className="h-10 w-10 rounded-full bg-gray-200"
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${rol.name}`}
                    alt={`Avatar de ${rol.name}`}
                  />
                  <span className="text-sm font-semibold text-gray-900">{rol.name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600 line-clamp-2">{rol.description}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-2">
                  {rol.permisos.map((permiso) => (
                    <span key={permiso} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {permiso}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  rol.status === 'Activo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {rol.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-4">
                  <button className="text-blue-600 hover:text-blue-900" title="Editar">
                    <FaEdit size={18} />
                  </button>
                  <button className="text-red-600 hover:text-red-900" title="Eliminar">
                    <FaTrashAlt size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RolesTable;