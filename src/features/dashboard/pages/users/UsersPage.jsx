import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import UsersTable from './components/UsersTable';
import SkeletonRow from './components/SkeletonRow';
import CreateUserModal from './components/CreateUserModal';
import { mockRoles } from '../roles/data/Roles_data';
import Pagination from '../../../../shared/components/Pagination';
import { showSuccess, confirmDelete } from '../../../../shared/utils/alerts.js';
import { toast } from 'react-hot-toast';
import { useUsers } from './hooks/useUsers';

const ITEMS_PER_PAGE = 5;

const UsuariosPage = () => {
  const {
    usuarios,
    roles,
    loading,
    createUser,
    updateUser,
    deleteUser,
    changeUserStatus,
    searchUsers
  } = useUsers();
  
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEliminarUsuario = async (usuarioId) => {
    const confirmed = await confirmDelete('¿Deseas eliminar este usuario?');

    if (confirmed) {
      try {
        await deleteUser(usuarioId);
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  // Los usuarios se cargan automáticamente con el hook useUsers

  const handleCreateUser = async (nuevoUsuario) => {
    try {
      await createUser(nuevoUsuario);
      setCurrentPage(Math.ceil((usuarios.length + 1) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error al crear usuario:', error);
    }
  };

  const filteredUsers = useMemo(() =>
    usuarios.filter(u =>
      u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.tipo_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.documento?.toString().includes(searchTerm) ||
      u.rol?.nombre_rol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.estado_usuario?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [usuarios, searchTerm]
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  return (
    <div className="p-2 md:p-8 ">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
            onClick={() => setOpenModal(true)}
          >
            + Crear Usuario
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tipo de Documento</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Documento</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nombre y Apellido</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Correo</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <UsersTable
            usuarios={usuarios}
            usuariosFiltrados={filteredUsers}
            paginaActual={currentPage}
            itemsPorPagina={ITEMS_PER_PAGE}
            onDelete={handleEliminarUsuario}
            onUpdate={updateUser}
            onChangeStatus={changeUserStatus}
            roles={roles}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}

      <CreateUserModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        roles={roles}
        onSubmit={handleCreateUser}
        usuariosExistentes={usuarios.map(u => ({
          documento: u.documento,
          tipoDocumento: u.tipo_documento,
          email: u.correo,
          celular: u.celular,
          contrasena: u.contrasena
        }))}
      />
    </div>
  );
};

export default UsuariosPage;
