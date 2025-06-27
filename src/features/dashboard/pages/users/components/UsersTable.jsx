import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';
import UserDetailModal from './UserDetailModal';


const UsersTable = ({ usuarios }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Id</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Documento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Tipo de Documento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Apellido</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Correo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Rol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {usuarios.map((usuario) => (
            <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-center">
                <span className="text-sm text-gray-600">{usuario.id}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm text-gray-600">{usuario.documento}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm text-gray-600">{usuario.tipoDocumento}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm text-gray-600">{usuario.nombre}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm text-gray-600">{usuario.apellido}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm text-gray-600">{usuario.email}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm text-gray-700 font-medium">{usuario.rol}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${usuario.status === 'Activo'
                    ? 'bg-green-100 text-green-800'
                    : usuario.status === 'Inactivo'
                      ? 'bg-yellow-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {usuario.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-4">
                  <button className="text-blue-600 hover:text-blue-900" title="Ver detalles" onClick={() => setSelectedUser(usuario)} >
                    <FaEye size={18} />
                  </button>
                  <button className="text-yellow-600 hover:text-blue-900" title="Editar">
                    <FaEdit size={18} />
                  </button>
                  <button className="text-red-600 hover:text-red-900" title="Eliminar">
                    <FaTrashAlt size={18} />
                  </button>
                </div>
                {selectedUser && (
                  <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
};

export default UsersTable;
