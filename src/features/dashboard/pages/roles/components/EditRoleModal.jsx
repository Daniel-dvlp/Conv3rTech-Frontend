import React, { useState, useEffect } from "react";
import { FaTimes, FaShieldAlt, FaSave } from "react-icons/fa";
import { showToast } from "../../../../../shared/utils/alertas";
import { MODULES_CONFIG } from "../config/rolesConfig";

const EditRoleModal = ({ role, isOpen, onClose, onSave }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalizar strings para comparación
  const normalize = (str) =>
    str
      ? str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      : "";

  // Encontrar la clave del módulo/submódulo basada en el nombre del permiso
  const findModuleKey = (permissionName) => {
    const target = normalize(permissionName);
    const exactTarget = permissionName;

    for (const mod of MODULES_CONFIG) {
      if ((mod.key === exactTarget || normalize(mod.name) === target) && !mod.submodules) return mod.name;
      if (mod.submodules) {
        for (const sub of mod.submodules) {
          if (sub.key === exactTarget || normalize(sub.name) === target) return `${mod.name}.${sub.name}`;
        }
      }
    }
    return null;
  };

  // Normalizar nombre del privilegio
  const normalizePrivilege = (priv) => {
    const map = {
      crear: "Crear",
      ver: "Ver",
      editar: "Editar",
      eliminar: "Eliminar",
      anular: "Anular",
      crear_entrega: "Crear", // Ajuste por si acaso
    };
    const lower = priv.toLowerCase();
    return (
      map[lower] || priv.charAt(0).toUpperCase() + priv.slice(1).toLowerCase()
    );
  };

  // Cargar datos del rol cuando se abre el modal
  useEffect(() => {
    if (isOpen && role) {
      setRoleName(role.nombre_rol || role.name || "");
      setDescription(role.descripcion || role.description || "");

      // Convertir permisos del rol a formato del modal
      const rolePermissions = {};
      if (role.permisos && Array.isArray(role.permisos)) {
        role.permisos.forEach((p) => {
          const pName = p.nombre_permiso || p.module || p.modulo;
          if (pName) {
            const moduleKey = findModuleKey(pName);
            if (moduleKey) {
              if (!rolePermissions[moduleKey]) {
                rolePermissions[moduleKey] = {};
              }

              const rawPrivs = p.privilegios || p.acciones || p.actions || [];
              if (Array.isArray(rawPrivs)) {
                rawPrivs.forEach((priv) => {
                  const privName =
                    typeof priv === "string" ? priv : priv.nombre_privilegio;
                  if (privName) {
                    const normalizedPriv = normalizePrivilege(privName);
                    rolePermissions[moduleKey][normalizedPriv] = true;
                  }
                });
              } else if (typeof rawPrivs === "object") {
                Object.keys(rawPrivs).forEach((k) => {
                  if (rawPrivs[k]) {
                    rolePermissions[moduleKey][normalizePrivilege(k)] = true;
                  }
                });
              }
              
              // Si no hay privilegios explícitos, asumir "Ver"
              if (
                  (!rawPrivs || rawPrivs.length === 0) &&
                  typeof p === "string"
              ) {
                  rolePermissions[moduleKey]["Ver"] = true;
              }
            }
          } else if (typeof p === "string") {
             const moduleKey = findModuleKey(p);
             if(moduleKey) {
                 if(!rolePermissions[moduleKey]) rolePermissions[moduleKey] = {};
                 rolePermissions[moduleKey]["Ver"] = true;
             }
          }
        });
      }
      setPermissions(rolePermissions);
    }
  }, [isOpen, role]);

  const handlePermissionChange = (moduleName, submoduleName, privilege) => {
    const key = submoduleName ? `${moduleName}.${submoduleName}` : moduleName;

    setPermissions((prev) => {
      const currentPrivs = prev[key] || {};
      return {
        ...prev,
        [key]: { ...currentPrivs, [privilege]: !currentPrivs[privilege] },
      };
    });
  };

  const handleSelectAllModule = (moduleName, moduleConfig) => {
    const hasSubmodules =
      moduleConfig.submodules && moduleConfig.submodules.length > 0;

    if (hasSubmodules) {
      const newPermissions = { ...permissions };
      const allSelected = moduleConfig.submodules.every((sub) =>
        sub.privileges.every(
          (priv) => permissions[`${moduleName}.${sub.name}`]?.[priv]
        )
      );

      moduleConfig.submodules.forEach((sub) => {
        const key = `${moduleName}.${sub.name}`;
        if (allSelected) {
          delete newPermissions[key];
        } else {
          newPermissions[key] = {};
          sub.privileges.forEach((priv) => {
            newPermissions[key][priv] = true;
          });
        }
      });

      setPermissions(newPermissions);
    } else {
      const allSelected = moduleConfig.privileges.every(
        (priv) => permissions[moduleName]?.[priv]
      );

      if (allSelected) {
        const newPermissions = { ...permissions };
        delete newPermissions[moduleName];
        setPermissions(newPermissions);
      } else {
        setPermissions((prev) => ({
          ...prev,
          [moduleName]: moduleConfig.privileges.reduce(
            (acc, priv) => ({ ...acc, [priv]: true }),
            {}
          ),
        }));
      }
    }
  };

  const isModuleFullySelected = (moduleName, moduleConfig) => {
    const hasSubmodules =
      moduleConfig.submodules && moduleConfig.submodules.length > 0;

    if (hasSubmodules) {
      return moduleConfig.submodules.every((sub) =>
        sub.privileges.every(
          (priv) => permissions[`${moduleName}.${sub.name}`]?.[priv]
        )
      );
    } else {
      return moduleConfig.privileges.every(
        (priv) => permissions[moduleName]?.[priv]
      );
    }
  };

  const resetForm = () => {
    setRoleName("");
    setDescription("");
    setPermissions({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      alert("El nombre del rol es obligatorio");
      return;
    }

    if (!description.trim()) {
      alert("La descripción del rol es obligatoria");
      return;
    }

    const hasPermissions = Object.keys(permissions).some((key) =>
      Object.values(permissions[key]).some((value) => value === true)
    );

    if (!hasPermissions) {
      alert("Debe asignar al menos un permiso al rol");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convertir permisos a formato esperado por la función updateRole
      const formattedPermissions = {};
      Object.keys(permissions).forEach((key) => {
        const selectedPrivileges = Object.keys(permissions[key]).filter(
          (priv) => permissions[key][priv]
        );
        if (selectedPrivileges.length > 0) {
          // Enviamos solo la parte final del key (ej: "Proveedores" en vez de "Compras.Proveedores")
          // Esto depende de cómo el backend espera recibir los permisos. 
          // Si el backend usa "flat" names, usamos split.
          const permissionName = key.includes('.') ? key.split('.').pop() : key;
          formattedPermissions[permissionName] = selectedPrivileges;
        }
      });

      // Preparar datos del rol en el formato correcto del backend
      const roleData = {
        nombre_rol: roleName.trim(),
        descripcion: description.trim(),
        estado: 1, // 1 = Activo, 0 = Inactivo
      };

      console.log("Datos del rol a actualizar:", roleData, formattedPermissions);

      // Llamar a la función onSave que viene del componente padre
      await onSave(role.id_rol || role.id, roleData, formattedPermissions);

      // Limpiar formulario y cerrar modal
      resetForm();
      showToast("Rol actualizado exitosamente", "success");
    } catch (error) {
      console.error("Error al actualizar el rol:", error);
      alert("Error al actualizar el rol. Por favor, inténtalo de nuevo.");
      setIsSubmitting(false);
      showToast("Error al actualizar el rol", "error");
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Contar permisos seleccionados
  const selectedPermissionsCount = Object.keys(permissions).reduce(
    (total, key) => {
      const modulePermissions = Object.values(permissions[key]).filter(
        (value) => value === true
      );
      return total + modulePermissions.length;
    },
    0
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FaShieldAlt className="text-conv3r-gold" />
              Editar Rol
            </h2>
            {selectedPermissionsCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedPermissionsCount} permisos configurados
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <FaTimes className="text-gray-500" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="edit-role-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Información Básica */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-conv3r-gold" />
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Rol <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-conv3r-gold focus:border-transparent transition-all"
                    placeholder="Ej: Administrador"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-conv3r-gold focus:border-transparent transition-all"
                    placeholder="Breve descripción de las responsabilidades"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Configuración de Permisos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-conv3r-gold" />
                Configuración de Permisos
              </h3>
              <div className="space-y-6">
                {MODULES_CONFIG.map((module) => (
                  <div
                    key={module.name}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Module Header */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{module.icon}</span>
                        <h4 className="font-bold text-gray-800 text-lg">
                          {module.name}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectAllModule(module.name, module)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors uppercase tracking-wider ${
                          isModuleFullySelected(module.name, module)
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        }`}
                      >
                        {isModuleFullySelected(module.name, module)
                          ? "Desmarcar"
                          : "Marcar Todo"}
                      </button>
                    </div>

                    {/* Module Content */}
                    <div className="p-5">
                      {module.submodules ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {module.submodules.map((submodule) => (
                            <div
                              key={submodule.name}
                              className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden"
                            >
                              <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
                                <h5 className="font-semibold text-gray-700 text-sm">
                                  {submodule.name}
                                </h5>
                              </div>
                              <div className="p-3">
                                <div className="grid grid-cols-2 gap-2">
                                  {submodule.privileges.map((priv) => (
                                    <label
                                      key={priv}
                                      className="flex items-center gap-2 cursor-pointer group p-1 hover:bg-white rounded transition-colors"
                                    >
                                      <div className="relative flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={
                                            permissions[
                                              `${module.name}.${submodule.name}`
                                            ]?.[priv] || false
                                          }
                                          onChange={() =>
                                            handlePermissionChange(
                                              module.name,
                                              submodule.name,
                                              priv
                                            )
                                          }
                                          className="peer h-4 w-4 text-conv3r-gold border-gray-300 rounded focus:ring-conv3r-gold transition-all cursor-pointer"
                                        />
                                      </div>
                                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                        {priv}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {module.privileges.map((priv) => (
                            <label
                              key={priv}
                              className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-all duration-200 ${
                                permissions[module.name]?.[priv]
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  permissions[module.name]?.[priv] || false
                                }
                                onChange={() =>
                                  handlePermissionChange(module.name, null, priv)
                                }
                                className="h-4 w-4 text-conv3r-gold border-gray-300 rounded focus:ring-conv3r-gold"
                              />
                              <span className={`text-sm ${permissions[module.name]?.[priv] ? "text-blue-800 font-medium" : "text-gray-700"}`}>
                                {priv}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="flex justify-end gap-4 border-t border-gray-200 p-6 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-all shadow-sm"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-role-form"
            className="px-6 py-2.5 bg-gradient-to-r from-conv3r-gold to-yellow-500 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] font-medium transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <FaSave />
                Guardar Cambios
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default EditRoleModal;
