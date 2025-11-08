import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';
import UserDetailModal from './UserDetailModal';
import EditUserModal from './EditUserModal';
import { mockRoles } from '../../roles/data/Roles_data';
import { useAuth } from '../../../../../shared/contexts/AuthContext';


const UsersTable = ({ usuarios, usuariosFiltrados, paginaActual, itemsPorPagina, onDelete, onUpdate, onChangeStatus, roles = [] }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const { hasPermission, hasPrivilege } = useAuth();

  const startIndex = (paginaActual - 1) * itemsPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(startIndex, startIndex + itemsPorPagina);


  const handleEditarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalAbierto(true);
  };

  const actualizarUsuario = async (usuarioActualizado) => {
    try {
      await onUpdate(usuarioSeleccionado.id_usuario, usuarioActualizado);
      setModalAbierto(false);
      setUsuarioSeleccionado(null);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full text-center text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Tipo de Documento</th>
            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Documento</th>
            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Nombre y Apellido</th>
            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Correo</th>
            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Rol</th>
            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Estado</th>
            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {usuariosPaginados.map((usuario) => (
            <tr key={usuario.id_usuario} className="hover:bg-gray-50 transition-colors text-sm">

              <td className="px-6 py-3 text-center">
                <span className="text-sm text-gray-700">{usuario.tipo_documento}</span>
              </td>
              <td className="px-6 py-3 text-center">
                <span className="text-sm text-gray-700">{usuario.documento}</span>
              </td>
              
              <td className="px-6 py-3 text-center">
                <span className="text-sm text-gray-700">{usuario.nombre} {usuario.apellido}</span>
              </td>
      
              <td className="px-6 py-3 text-center">
                <span className="text-sm text-gray-700">{usuario.correo}</span>
              </td>
              <td className="px-6 py-3 text-center">
                <span className="text-sm text-gray-800 font-semibold">{usuario.rol?.nombre_rol || 'Sin rol'}</span>
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-center">
                <span className={`px-4 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                ${usuario.estado_usuario === 'Activo'
                    ? 'bg-green-100 text-green-800'
                    : usuario.estado_usuario === 'Inactivo'
                      ? 'bg-yellow-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {usuario.estado_usuario}
                </span>
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-center items-center gap-4">
                  {hasPermission('usuarios') && (
                    <button className="text-blue-600 hover:text-blue-900" title="Ver detalles" onClick={() => setSelectedUser(usuario)} >
                      <FaEye size={20} />
                    </button>
                  )}
                  {hasPrivilege('usuarios', 'Editar') && (
                    <button className="text-yellow-600 hover:text-yellow-900" onClick={() => handleEditarUsuario(usuario)} title="Editar">
                      <FaEdit size={20} />
                    </button>
                  )}
                  {hasPrivilege('usuarios', 'Eliminar') && (
                    <button className="text-red-600 hover:text-red-900" title="Eliminar" onClick={() => onDelete(usuario.id_usuario)} >
                      <FaTrashAlt size={20} />
                    </button>
                  )}
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
        {usuarioSeleccionado && (
          <EditUserModal
            isOpen={modalAbierto}
            onClose={() => setModalAbierto(false)}
            userData={usuarioSeleccionado}
            roles={roles}
            onSubmit={actualizarUsuario}
          />
        )}
      </table>
    </div>
  );
};

export default UsersTable;
