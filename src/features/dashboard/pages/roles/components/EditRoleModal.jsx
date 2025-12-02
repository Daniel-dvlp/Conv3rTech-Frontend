import React, { useState, useEffect } from "react";
import { FaTimes, FaShieldAlt, FaSave } from "react-icons/fa";
import { showToast } from "../../../../../shared/utils/alertas";
import rolesService from "../../../../../services/rolesService";

// Configuración de módulos (misma que en NewRoleModal)
const MODULES_CONFIG = [
  {
    name: "Dashboard",
    icon: "📊",
    privileges: ["Ver"],
  },
  {
    name: "Usuarios",
    icon: "👥",
    privileges: ["Crear", "Ver", "Editar", "Eliminar"],
  },
  {
    name: "Compras",
    icon: "💰",
    submodules: [
      {
        name: "Proveedores",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Categorías de Productos",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      { name: "Productos", privileges: ["Crear", "Ver", "Editar", "Eliminar"] },
      { name: "Compras", privileges: ["Crear", "Ver", "Editar", "Anular"] },
    ],
  },
  {
    name: "Servicios",
    icon: "🔧",
    submodules: [
      {
        name: "Categoría de Servicios",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Órdenes de Servicio",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Programación laboral",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
    ],
  },
  {
    name: "Ventas",
    icon: "📈",
    submodules: [
      { name: "Clientes", privileges: ["Crear", "Ver", "Editar", "Eliminar"] },
      {
        name: "Venta de Productos",
        privileges: ["Crear", "Ver", "Editar", "Anular"],
      },
      {
        name: "Órdenes de Servicios",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      { name: "Citas", privileges: ["Crear", "Ver", "Editar", "Eliminar"] },
      {
        name: "Cotizaciones",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Proyectos de Servicio",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
      {
        name: "Pagos y Abonos",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
    ],
  },
  {
    name: "Configuración",
    icon: "⚙️",
    submodules: [
      { name: "Editar mi Perfil", privileges: ["Ver", "Editar"] },
      {
        name: "Gestión de Roles",
        privileges: ["Crear", "Ver", "Editar", "Eliminar"],
      },
    ],
  },
];

const EditRoleModal = ({ role, isOpen, onClose, onSave }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicModules, setDynamicModules] = useState([]);

  // Cargar datos del rol cuando se abre el modal
  useEffect(() => {
    const loadRoleForEdit = async () => {
      if (!isOpen || !role) return;
      setRoleName(role.nombre_rol || role.name || "");
      setDescription(role.descripcion || role.description || "");

      // Helper: encontrar la clave del modal para un permiso por nombre
      const normalize = (str) =>
        String(str || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim();

      // Alias conocidos desde backend → UI keys del modal
      const NAME_ALIASES = {
        // Ventas
        [normalize("Proyectos")]: "Ventas.Proyectos de Servicio",
        [normalize("Ordenes de Servicios")]: "Ventas.Órdenes de Servicios",
        [normalize("Pagos y abonos")]: "Ventas.Pagos y Abonos",
        [normalize("Venta de Productos")]: "Ventas.Venta de Productos",
        [normalize("Clientes")]: "Ventas.Clientes",
        [normalize("Citas")]: "Ventas.Citas",
        [normalize("Cotizaciones")]: "Ventas.Cotizaciones",

        // Servicios
        [normalize("Ordenes de Servicio")]: "Servicios.Órdenes de Servicio",
        [normalize("Categoria de Servicios")]: "Servicios.Categoría de Servicios",
        [normalize("Programacion laboral")]: "Servicios.Programación laboral",

        // Compras
        [normalize("Proveedores")]: "Compras.Proveedores",
        [normalize("Categorias de Productos")]: "Compras.Categorías de Productos",
        [normalize("Productos")]: "Compras.Productos",
        [normalize("Compras")]: "Compras.Compras",

        // Configuración
        [normalize("Gestion de Roles")]: "Configuración.Gestión de Roles",
        [normalize("Editar mi Perfil")]: "Configuración.Editar mi Perfil",

        // Usuarios/Dashboard
        [normalize("Usuarios")]: "Usuarios",
        [normalize("Dashboard")]: "Dashboard",
      };

      const findPermissionKeyByName = (name) => {
        if (!name) return null;
        const n = normalize(name);

        // Intento 1: alias directos
        if (NAME_ALIASES[n]) return NAME_ALIASES[n];

        // Intento 2: coincidencia exacta por nombre
        for (const mod of MODULES_CONFIG) {
          if (normalize(mod.name) === n) return mod.name;
          if (Array.isArray(mod.submodules)) {
            for (const sub of mod.submodules) {
              if (normalize(sub.name) === n) return `${mod.name}.${sub.name}`;
            }
          }
        }

        // Intento 3: coincidencia laxa dentro de submódulos (incluye singular/plural)
        for (const mod of MODULES_CONFIG) {
          if (Array.isArray(mod.submodules)) {
            for (const sub of mod.submodules) {
              const sn = normalize(sub.name).replace(/s$/,"");
              const nn = n.replace(/s$/,"");
              if (sn === nn) return `${mod.name}.${sub.name}`;
            }
          }
        }

        // Fallback: usar el nombre tal cual
        return name;
      };

      const toUiPrivilege = (raw) => {
        const s = String(raw || "").toLowerCase().trim();
        const map = {
          crear: "Crear",
          editar: "Editar",
          ver: "Ver",
          eliminar: "Eliminar",
          anular: "Anular",
          crear_entrega: "Crear entrega",
        };
        return map[s] || raw;
      };

      // Traer permisos del backend si no están presentes
      let sourceRole = role;
      try {
        const id = role.id_rol || role.id;
        const missing = !Array.isArray(role.permisos) || role.permisos.length === 0;
        if (id && missing) {
          const resp = await rolesService.getRolePermissions(id);
          if (resp.success) {
            // Estructuras posibles: data.data (array), data.permisos (array), o data (array)
            const apiData = resp.data;
            const permisosFromApi = Array.isArray(apiData?.data)
              ? apiData.data
              : Array.isArray(apiData?.permisos)
              ? apiData.permisos
              : Array.isArray(apiData)
              ? apiData
              : [];
            sourceRole = { ...role, permisos: permisosFromApi };
          }
        }
      } catch (e) {
        console.warn("No se pudieron cargar permisos del rol:", e);
      }

      // Convertir permisos del rol a formato del modal
      const rolePermissions = {};

      // Caso A: datos del backend → soporta include y forma pivote
      if (Array.isArray(sourceRole.permisos) && sourceRole.permisos.length > 0) {
        sourceRole.permisos.forEach((permiso) => {
          const moduleName =
            permiso?.nombre_permiso ||
            permiso?.modulo ||
            permiso?.module ||
            permiso?.permiso?.nombre_permiso; // pivote: permiso.nombre_permiso

          const key = findPermissionKeyByName(moduleName);
          if (!key) return;
          if (!rolePermissions[key]) rolePermissions[key] = {};

          // Pivote: fila única con privilegio.nombre_privilegio
          const pivotPrivName =
            permiso?.privilegio?.nombre_privilegio || permiso?.privilegio?.nombre;
          if (pivotPrivName) {
            rolePermissions[key][toUiPrivilege(pivotPrivName)] = true;
            return;
          }

          // Include: arreglo de privilegios del permiso
          if (Array.isArray(permiso?.privilegios)) {
            permiso.privilegios.forEach((priv) => {
              const action = priv?.nombre_privilegio || priv?.nombre;
              if (action) rolePermissions[key][toUiPrivilege(action)] = true;
            });
          } else if (Array.isArray(permiso?.acciones)) {
            permiso.acciones.forEach((accion) => {
              rolePermissions[key][toUiPrivilege(accion)] = true;
            });
          } else if (Array.isArray(permiso?.actions)) {
            permiso.actions.forEach((accion) => {
              rolePermissions[key][toUiPrivilege(accion)] = true;
            });
          } else {
            // Si no hay detalle de privilegios, marcar "Ver" por defecto
            rolePermissions[key]["Ver"] = true;
          }
        });
      }

      // Caso B: datos mock del frontend → role.permissions = { "Modulo" o "Modulo.Submodulo": [acciones] }
      if (sourceRole && sourceRole.permissions && typeof sourceRole.permissions === "object") {
        Object.entries(sourceRole.permissions).forEach(([key, actions]) => {
          if (!rolePermissions[key]) rolePermissions[key] = {};
          (Array.isArray(actions) ? actions : []).forEach((accion) => {
            rolePermissions[key][accion] = true;
          });
        });
      }

      // Caso C: permisos simples como strings
      if (Array.isArray(sourceRole.permisos)) {
        sourceRole.permisos.forEach((permiso) => {
          if (typeof permiso === "string") {
            const key = findPermissionKeyByName(permiso);
            if (!rolePermissions[key]) rolePermissions[key] = {};
            rolePermissions[key]["Ver"] = true;
          }
        });
      }

      setPermissions(rolePermissions);

      try {
        const avail = await rolesService.getAvailablePermissions();
        const list = Array.isArray(avail?.data?.data)
          ? avail.data.data
          : Array.isArray(avail?.data)
          ? avail.data
          : [];
        const extras = [];
        for (const perm of list) {
          const moduleName = perm?.nombre_permiso;
          const key = findPermissionKeyByName(moduleName);
          const isMapped = !!key && key !== moduleName;
          if (!isMapped) {
            const privs = Array.isArray(perm?.privilegios)
              ? perm.privilegios
                  .map((p) => p?.nombre_privilegio || p?.nombre)
                  .filter(Boolean)
                  .map((n) => toUiPrivilege(n))
              : [];
            extras.push({ name: moduleName, privileges: privs });
          }
        }
        setDynamicModules(extras);
      } catch {}
    };

    loadRoleForEdit();
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
          formattedPermissions[key] = selectedPrivileges;
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
                {selectedPermissionsCount} permiso
                {selectedPermissionsCount !== 1 ? "s" : ""} seleccionado
                {selectedPermissionsCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="nombreRol"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre del Rol *
                </label>
                <input
                  id="nombreRol"
                  name="nombreRol"
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className={`block w-full text-sm border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold transition-colors ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  placeholder="Ej: Administrador, Vendedor, etc."
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="block w-full text-sm border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold transition-colors resize-none"
                  placeholder="Describe las responsabilidades de este rol..."
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Permisos y Privilegios */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🔐 Permisos y Privilegios del Rol
              </h3>

              <div className="space-y-4">
                {[...MODULES_CONFIG, ...dynamicModules].map((module) => (
                  <div
                    key={module.name}
                    className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Header del Módulo */}
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{module.icon}</span>
                          <h4 className="font-bold text-gray-800">
                            {module.name}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectAllModule(module.name, module)
                          }
                          disabled={isSubmitting}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors disabled:opacity-50 ${
                            isModuleFullySelected(module.name, module)
                              ? "bg-conv3r-gold text-conv3r-dark"
                              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {isModuleFullySelected(module.name, module)
                            ? "Desmarcar Todo"
                            : "Marcar Todo"}
                        </button>
                      </div>
                    </div>

                    {/* Contenido del Módulo */}
                    <div className="p-4">
                      {!module.submodules && (
                        <div className="flex flex-wrap gap-4">
                          {module.privileges.map((privilege) => (
                            <label
                              key={privilege}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  !!permissions[module.name]?.[privilege]
                                }
                                onChange={() =>
                                  handlePermissionChange(
                                    module.name,
                                    null,
                                    privilege
                                  )
                                }
                                disabled={isSubmitting}
                                className="h-4 w-4 text-conv3r-gold border-gray-300 rounded focus:ring-conv3r-gold focus:ring-2 disabled:opacity-50"
                              />
                              <span className="text-sm text-gray-700 flex items-center gap-1.5 group-hover:text-gray-900 transition-colors">
                                {privilege}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {module.submodules && (
                        <div className="space-y-4">
                          {module.submodules.map((submodule) => (
                            <div
                              key={submodule.name}
                              className="bg-white border border-gray-200 rounded-lg p-4"
                            >
                              <h5 className="font-semibold text-gray-700 mb-3">
                                {submodule.name}
                              </h5>
                              <div className="flex flex-wrap gap-4">
                                {submodule.privileges.map((privilege) => (
                                  <label
                                    key={privilege}
                                    className="flex items-center gap-2 cursor-pointer group"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        !!permissions[
                                          `${module.name}.${submodule.name}`
                                        ]?.[privilege]
                                      }
                                      onChange={() =>
                                        handlePermissionChange(
                                          module.name,
                                          submodule.name,
                                          privilege
                                        )
                                      }
                                      disabled={isSubmitting}
                                      className="h-4 w-4 text-conv3r-gold border-gray-300 rounded focus:ring-conv3r-gold focus:ring-2 disabled:opacity-50"
                                    />
                                    <span className="text-sm text-gray-700 flex items-center gap-1.5 group-hover:text-gray-900 transition-colors">
                                      {privilege}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
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
        <div className="flex justify-end gap-4 border-t border-gray-200 p-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-conv3r-gold text-conv3r-dark font-semibold hover:bg-conv3r-gold/90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoleModal;
