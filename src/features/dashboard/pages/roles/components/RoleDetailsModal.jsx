import React from "react";
import {
  FaTimes,
  FaShieldAlt,
  FaEye,
  FaPencilAlt,
  FaTrashAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const RoleDetailsModal = ({ role, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !role) return null;

  const getStatusInfo = (estado) => {
    const isActive = estado === true || estado === 1;
    return {
      text: isActive ? "Activo" : "Inactivo",
      icon: isActive ? (
        <FaCheckCircle className="text-green-500" />
      ) : (
        <FaTimesCircle className="text-red-500" />
      ),
      className: isActive
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800",
    };
  };

  const statusInfo = getStatusInfo(role.estado);

  const formatPermissions = (permisos) => {
    if (!permisos || permisos.length === 0) return [];

    // Si los permisos son objetos con estructura compleja
    if (typeof permisos[0] === "object") {
      return permisos.map((permiso) => ({
        module: permiso.modulo || permiso.module || "Sin módulo",
        actions: permiso.acciones || permiso.actions || [],
      }));
    }

    // Si los permisos son strings simples
    return permisos.map((permiso) => ({
      module: permiso,
      actions: ["Ver"], // Acción por defecto
    }));
  };

  const permissions = formatPermissions(role.permisos);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-conv3r-gold text-2xl" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Detalles del Rol
              </h2>
              <p className="text-sm text-gray-600">
                Información completa del rol seleccionado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaShieldAlt className="text-conv3r-gold" />
                  Información Básica
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nombre del Rol
                    </label>
                    <div className="flex items-center gap-3">
                      <img
                        className="h-12 w-12 rounded-full bg-gray-200"
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                          role.nombre_rol || role.name || "Rol"
                        }`}
                        alt={`Avatar de ${
                          role.nombre_rol || role.name || "Rol"
                        }`}
                      />
                      <span className="text-lg font-semibold text-gray-900">
                        {role.nombre_rol || role.name || "Sin nombre"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Descripción
                    </label>
                    <p className="text-gray-800 bg-white p-3 rounded-lg border">
                      {role.descripcion ||
                        role.description ||
                        "Sin descripción"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Estado
                    </label>
                    <div className="flex items-center gap-2">
                      {statusInfo.icon}
                      <span
                        className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusInfo.className}`}
                      >
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      ID del Rol
                    </label>
                    <p className="text-gray-800 bg-white p-3 rounded-lg border font-mono text-sm">
                      {role.id_rol || role.id || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permisos */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaEye className="text-conv3r-gold" />
                  Permisos Asignados
                </h3>

                {permissions.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {permissions.map((permiso, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">
                            {permiso.module}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {permiso.actions.map((action, actionIndex) => (
                            <span
                              key={actionIndex}
                              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaEye className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>No hay permisos asignados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex justify-end gap-4 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onEdit(role);
              onClose();
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <FaPencilAlt />
            Editar Rol
          </button>
          <button
            onClick={() => {
              onDelete(role);
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <FaTrashAlt />
            Eliminar Rol
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RoleDetailsModal;
