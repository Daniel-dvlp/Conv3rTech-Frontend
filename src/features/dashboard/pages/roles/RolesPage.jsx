// src/features/dashboard/pages/roles/RolesPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';
import RolesTable from './components/RolesTable'; 
import TableSkeleton from '../../../../shared/components/TableSkeleton'; // Usando el esqueleto compartido
import Pagination from '../../../../shared/components/Pagination';
import NewRoleModal from './components/NewRoleModal';
import EditRoleModal from './components/EditRoleModal';
import RoleDetailModal from './components/RoleDetailModal';
// 1. IMPORTAMOS todas las funciones CRUD que necesitamos de nuestro archivo de datos
import { getRoles, createRole, updateRole, deleteRole } from './data/Roles_data'; 
import { showToast, showAlert } from '../../../../shared/utils/alertas';

const ITEMS_PER_PAGE = 5;

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingRole, setViewingRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  const loadRoles = () => {
    setLoading(true);
    setTimeout(() => {
      const allRoles = getRoles();
      setRoles(allRoles);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const totalPages = Math.ceil(roles.length / ITEMS_PER_PAGE);
  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return roles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [roles, currentPage]);

  // Reset to first page when roles change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [roles, currentPage, totalPages]);

  const handleSaveRole = (newRoleData) => {
    try {
      createRole(newRoleData);
      loadRoles();
      showToast('Rol creado exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear el rol', 'error');
    }
  };

  // Corregimos esta función para que llame a 'updateRole'
  const handleUpdateRole = (id, updatedData) => {
    try {
      updateRole(id, updatedData);
      loadRoles();
      showToast('Rol actualizado exitosamente', 'success');
    } catch (error) {
      showToast('Error al actualizar el rol', 'error');
    }
  };

  const handleViewDetails = (rol) => {
    setViewingRole(rol);
  };

  const handleOpenEditModal = (rol) => {
    setEditingRole(rol);
  };

  // 2. NUEVA FUNCIÓN PARA MANEJAR LA ELIMINACIÓN
  const handleDeleteRole = async (rol) => {
    const result = await showAlert({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el rol "${rol.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      try {
        deleteRole(rol.id);
        loadRoles();
        showToast(`El rol "${rol.name}" ha sido eliminado.`, 'success');
      } catch (error) {
        showToast('Error al eliminar el rol.', 'error');
      }
    }
  };

  const roleTableHeaders = ['Rol', 'Descripción', 'Permisos', 'Estado', 'Acciones'];

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Roles</h1>
          <p className="text-gray-600 mt-2">Administra los roles y permisos del sistema</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="flex items-center gap-2 bg-conv3r-gold hover:bg-yellow-500 text-conv3r-dark font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <FaPlus /> Nuevo Rol
        </button>
      </div>

      {/* ... tus tarjetas de estadísticas no cambian ... */}

      {loading ? (
        <TableSkeleton headers={roleTableHeaders} rowCount={ITEMS_PER_PAGE} />
      ) : (
        // 3. CONECTAMOS TODAS las acciones a la tabla
        <RolesTable 
          roles={paginatedRoles}
          onViewDetails={handleViewDetails}
          onEditRole={handleOpenEditModal}
          onDeleteRole={handleDeleteRole}
        />
      )}
      
      {/* Paginación siempre visible - igual diseño que proyectos pero siempre presente */}
      {!loading && (
        <Pagination 
          currentPage={currentPage}
          totalPages={Math.max(1, totalPages)}
          onPageChange={setCurrentPage}
        />
      )}
      

      {/* Los modales ahora reciben las funciones correctas */}
      <NewRoleModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(data) => {
          handleSaveRole(data);
          setIsCreateModalOpen(false);
        }}
      />
      <RoleDetailModal 
        role={viewingRole}
        onClose={() => setViewingRole(null)}
      />
      <EditRoleModal
        isOpen={!!editingRole}
        onClose={() => setEditingRole(null)}
        onUpdate={(id, data) => {
          handleUpdateRole(id, data);
          setEditingRole(null);
        }}
        role={editingRole}
      />
    </div>
  );
};

export default RolesPage;