// src/features/dashboard/pages/roles/RolesPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import RolesTable from "./components/RolesTable";
import TableSkeleton from "../../../../shared/components/TableSkeleton"; // Usando el esqueleto compartido
import Pagination from "../../../../shared/components/Pagination";
import NewRoleModal from "./components/NewRoleModal";
import EditRoleModal from "./components/EditRoleModal";
import RoleDetailsModal from "./components/RoleDetailsModal";
import rolesService from "../../../../services/rolesService";
import { showToast, showAlert } from "../../../../shared/utils/alertas";

const ITEMS_PER_PAGE = 5;

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingRole, setViewingRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  // Debug: Log cuando cambie el estado del modal
  useEffect(() => {
    console.log("🔍 Modal state changed:", { isCreateModalOpen });
  }, [isCreateModalOpen]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await rolesService.getAllRoles();
      console.log("📋 Roles response:", response);

      if (response.success) {
        // El backend devuelve: {success: true, data: {success: true, data: Array, message: "..."}}
        // Necesitamos extraer los roles del nivel correcto
        let rolesData = [];

        if (response.data && response.data.data) {
          // Si hay datos anidados, usar el nivel interno
          rolesData = Array.isArray(response.data.data)
            ? response.data.data
            : [];
        } else if (Array.isArray(response.data)) {
          // Si los datos están directamente en response.data
          rolesData = response.data;
        }

        console.log("📋 Roles data extracted:", rolesData);
        setRoles(rolesData);
      } else {
        showToast("Error al cargar los roles", "error");
        setRoles([]);
      }
    } catch (error) {
      console.error("Error loading roles:", error);
      showToast("Error de conexión al cargar roles", "error");
      setRoles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const totalPages = Math.ceil(
    (Array.isArray(roles) ? roles.length : 0) / ITEMS_PER_PAGE
  );
  const paginatedRoles = useMemo(() => {
    if (!Array.isArray(roles)) {
      console.warn("⚠️ Roles is not an array:", roles);
      return [];
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return roles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [roles, currentPage]);

  // Reset to first page when roles change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [roles, currentPage, totalPages]);

  const handleSaveRole = async (newRoleData) => {
    try {
      const response = await rolesService.createRole(newRoleData);
      if (response.success) {
        loadRoles();
        showToast("Rol creado exitosamente", "success");
      } else {
        // Mostrar errores específicos del backend
        if (response.errors && response.errors.length > 0) {
          const errorMessages = response.errors
            .map((error) => error.message || error)
            .join(", ");
          showToast(`Errores de validación: ${errorMessages}`, "error");
        } else {
          showToast(response.message || "Error al crear el rol", "error");
        }
      }
    } catch (error) {
      console.error("Error creating role:", error);
      showToast("Error de conexión al crear rol", "error");
    }
  };

  // Corregimos esta función para que llame a 'updateRole'
  const handleUpdateRole = async (id, updatedData) => {
    try {
      const response = await rolesService.updateRole(id, updatedData);
      if (response.success) {
        loadRoles();
        showToast("Rol actualizado exitosamente", "success");
      } else {
        showToast(response.message || "Error al actualizar el rol", "error");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      showToast("Error de conexión al actualizar rol", "error");
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
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar el rol "${
        rol.nombre_rol || rol.name
      }"? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        const response = await rolesService.deleteRole(rol.id_rol || rol.id);
        if (response.success) {
          loadRoles();
          showToast(
            `El rol "${rol.nombre_rol || rol.name}" ha sido eliminado.`,
            "success"
          );
        } else {
          showToast(response.message || "Error al eliminar el rol.", "error");
        }
      } catch (error) {
        console.error("Error deleting role:", error);
        showToast("Error de conexión al eliminar rol.", "error");
      }
    }
  };

  const roleTableHeaders = [
    "Rol",
    "Descripción",
    "Permisos",
    "Estado",
    "Acciones",
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Roles</h1>
          <p className="text-gray-600 mt-2">
            Administra los roles y permisos del sistema
          </p>
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
      {isCreateModalOpen && (
        <NewRoleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={(data) => {
            handleSaveRole(data);
            setIsCreateModalOpen(false);
          }}
        />
      )}
      <RoleDetailsModal
        role={viewingRole}
        isOpen={!!viewingRole}
        onClose={() => setViewingRole(null)}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteRole}
      />
      {editingRole && (
        <EditRoleModal
          role={editingRole}
          isOpen={!!editingRole}
          onClose={() => setEditingRole(null)}
          onSave={(id, data) => {
            handleUpdateRole(id, data);
            setEditingRole(null);
          }}
        />
      )}
    </div>
  );
};

export default RolesPage;
