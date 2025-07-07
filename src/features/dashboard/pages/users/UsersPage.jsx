import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import UsersTable from './components/UsersTable';
import SkeletonRow from './components/SkeletonRow';
import CreateUserModal from './components/CreateUserModal';
import { mockUsuarios } from './data/User_data';
import { mockRoles } from '../roles/data/Roles_data';
import Pagination from '../../../../shared/components/Pagination';
import { showSuccess, confirmDelete } from '../../../../shared/utils/alerts.js'; // asegúrate de importar confirmDelete
import { toast } from 'react-hot-toast'; // si usas toast

const ITEMS_PER_PAGE = 5;

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEliminarUsuario = async (usuarioId) => {
  const confirmed = await confirmDelete('¿Deseas eliminar este usuario?');

  console.log('Intentando eliminar', usuarioId); // para verificar en consola

  if (confirmed) {
    setUsuarios(prev => {
      const updated = prev.filter(u => u.id !== usuarioId);
      console.log('Usuarios actualizados:', updated);
      return updated;
    });

    toast.success('Usuario eliminado exitosamente');
  }
};

  useEffect(() => {
    setTimeout(() => {
      setUsuarios(mockUsuarios);
      setLoading(false);
    }, 1500);
  }, []);

  const handleCreateUser = (nuevoUsuario) => {
    const nuevoId = usuarios.length ? usuarios[usuarios.length - 1].id + 1 : 1;

    const fechaActual = new Date();
    const fechaFormateada = `${String(fechaActual.getDate()).padStart(2, '0')}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(fechaActual.getFullYear()).slice(2)}`;

    const usuarioConFormato = {
      id: nuevoId,
      ...nuevoUsuario,
      status: 'Activo',
      fechaCreacion: fechaFormateada
    };


    setUsuarios((prev) => {
      const updated = [...prev, usuarioConFormato];
      setCurrentPage(Math.ceil(updated.length / ITEMS_PER_PAGE));
      return updated;
    });
    showSuccess('Usuario creado correctamente');
    console.log("✅ Usuario creado:", usuarioConFormato);
  };

  const filteredUsers = useMemo(() =>
    usuarios.filter(u =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.tipoDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.documento.toString().includes(searchTerm) ||
      u.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.status.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
            setUsuarios={setUsuarios}
            onDelete={handleEliminarUsuario}
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
        roles={mockRoles}
        onSubmit={handleCreateUser}
        usuariosExistentes={usuarios.map(u => ({
          documento: u.documento,
          tipoDocumento: u.tipoDocumento,
          email: u.email,
          celular: u.celular,
          contrasena: u.contrasena
        }))}
      />
    </div>
  );
};

export default UsuariosPage;
