import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import UsersTable from './components/UsersTable'; 
import SkeletonRow from './components/SkeletonRow';
import CreateUserModal from './components/CreateUserModal';
import { mockUsuarios } from './data/User_data'; // debes tener este archivo
import { mockRoles } from '../Roles/data/Roles_data'


  
const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setUsuarios(mockUsuarios);
      setLoading(false);
    }, 1500);
  }, []);

  const handleCreateUser = (nuevoUsuario) => {
    
    console.log("Nuevo usuario:", nuevoUsuario);
    
    // Aquí puedes hacer la petición al backend para guardar el usuario
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button
          className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
          onClick={() => setOpenModal(true)}
        >
          + Crear Usuario
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Documento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <UsersTable usuarios={usuarios} />
      )}
      <CreateUserModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        roles={mockRoles}
        onSubmit={handleCreateUser}
      />
    </div>
  );
};

export default UsuariosPage;
