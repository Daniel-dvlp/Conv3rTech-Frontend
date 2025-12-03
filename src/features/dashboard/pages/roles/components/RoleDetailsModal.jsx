import React from "react";
import {
  FaTimes,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
} from "react-icons/fa";
import { MODULES_CONFIG } from "../config/rolesConfig";

const RoleDetailsModal = ({ role, isOpen, onClose }) => {
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

  // Normalizar strings para comparación
  const normalize = (str) =>
    str
      ? str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      : "";

  // Mapear permisos del rol para fácil acceso
  const rolePermissionsMap = {};
  if (role.permisos && Array.isArray(role.permisos)) {
    role.permisos.forEach((p) => {
      // El backend puede devolver nombre_permiso o module/modulo
      const pName = p.nombre_permiso || p.module || p.modulo;
      if (pName) {
        const privileges = [];
        // El backend puede devolver privilegios como array de objetos o strings
        const rawPrivs = p.privilegios || p.acciones || p.actions || [];
        
        if (Array.isArray(rawPrivs)) {
          rawPrivs.forEach((priv) => {
            const privName = typeof priv === "string" ? priv : priv.nombre_privilegio;
            if (privName) privileges.push(normalize(privName));
          });
        } else if (typeof rawPrivs === 'object') {
            // Caso borde si es un objeto map
            Object.keys(rawPrivs).forEach(k => {
                if(rawPrivs[k]) privileges.push(normalize(k));
            });
        }
        
        // Si no hay privilegios pero existe el permiso, asumimos "Ver" por defecto si es string simple
        if (privileges.length === 0 && typeof p === 'string') {
             privileges.push('ver');
        }

        rolePermissionsMap[normalize(pName)] = privileges;
      } else if (typeof p === "string") {
          rolePermissionsMap[normalize(p)] = ["ver"];
      }
    });
  }

  const renderModulePermissions = (moduleConfig) => {
    const hasSubmodules =
      moduleConfig.submodules && moduleConfig.submodules.length > 0;

    if (hasSubmodules) {
      const submodulesWithPermissions = moduleConfig.submodules.map((sub) => {
        const key = sub.key || normalize(sub.name);
        const assignedPrivs = rolePermissionsMap[key] || rolePermissionsMap[normalize(sub.name)];
        return {
          ...sub,
          assignedPrivs,
        };
      }).filter(sub => sub.assignedPrivs && sub.assignedPrivs.length > 0);

      if (submodulesWithPermissions.length === 0) return null;

      return (
        <div className="mb-4 border rounded-lg p-3 bg-white" key={moduleConfig.name}>
          <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2 border-b pb-2">
            <span className="text-xl">{moduleConfig.icon}</span>
            {moduleConfig.name}
          </h4>
          <div className="space-y-3 pl-4">
            {submodulesWithPermissions.map((sub) => (
              <div key={sub.name} className="text-sm">
                <div className="font-semibold text-gray-700 mb-1">{sub.name}</div>
                <div className="flex flex-wrap gap-2">
                  {sub.assignedPrivs.map((priv) => (
                    <span
                      key={priv}
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs capitalize"
                    >
                      {priv}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      const key = moduleConfig.key || normalize(moduleConfig.name);
      const assignedPrivs = rolePermissionsMap[key] || rolePermissionsMap[normalize(moduleConfig.name)];

      if (!assignedPrivs || assignedPrivs.length === 0) return null;

      return (
        <div className="mb-4 border rounded-lg p-3 bg-white" key={moduleConfig.name}>
          <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
            <span className="text-xl">{moduleConfig.icon}</span>
            {moduleConfig.name}
          </h4>
          <div className="flex flex-wrap gap-2 pl-8">
            {assignedPrivs.map((priv) => (
              <span
                key={priv}
                className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs capitalize"
              >
                {priv}
              </span>
            ))}
          </div>
        </div>
      );
    }
  };

  const hasAnyPermission = Object.keys(rolePermissionsMap).length > 0;

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
              <div className="bg-gray-50 rounded-lg p-4 h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaEye className="text-conv3r-gold" />
                  Permisos Asignados
                </h3>

                {hasAnyPermission ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {MODULES_CONFIG.map((moduleConfig) =>
                      renderModulePermissions(moduleConfig)
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaEye className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>No hay permisos asignados o reconocidos</p>
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
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RoleDetailsModal;
