// src/features/dashboard/pages/roles/components/RolesTable.jsx

import React from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";

const RolesTable = ({ roles, onViewDetails, onEditRole, onDeleteRole }) => {
  // Log para ver la estructura de los datos
  console.log("🔍 RolesTable - roles data:", roles);
  if (roles.length > 0) {
    console.log("🔍 First role structure:", roles[0]);
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {/* CAMBIO: Texto del encabezado a 'sm' */}
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Permisos
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {roles.map((rol) => (
            <tr
              key={rol.id_rol || rol.id || `rol-${Math.random()}`}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-4">
                  <img
                    className="h-10 w-10 rounded-full bg-gray-200"
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                      rol.nombre_rol || rol.name || "Rol"
                    }`}
                    alt={`Avatar de ${rol.nombre_rol || rol.name || "Rol"}`}
                  />
                  {/* CAMBIO: Texto del contenido a 'base' (mediano) */}
                  <div className="text-base font-semibold text-gray-900">
                    {rol.nombre_rol || rol.name || "Sin nombre"}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-base text-gray-600 line-clamp-2">
                  {rol.descripcion || rol.description || "Sin descripción"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-2">
                  {(rol.permisos ?? []).map((permiso, index) => {
                    const key =
                      typeof permiso === "object"
                        ? permiso.id_permiso || permiso.id || `permiso-${index}`
                        : `permiso-${permiso}-${index}`;
                    const nombre =
                      typeof permiso === "object"
                        ? permiso.nombre_permiso ||
                          permiso.nombre ||
                          permiso.descripcion ||
                          "Sin nombre"
                        : permiso;

                    return (
                      <span
                        key={key}
                        className="px-2 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {nombre}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    rol.estado === true ||
                    rol.estado === 1 ||
                    rol.status === "Activo"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {rol.estado === true || rol.estado === 1
                    ? "Activo"
                    : rol.status || "Inactivo"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {/* CAMBIO: Colores de los botones de acción actualizados */}
                <div className="flex justify-end items-center gap-4">
                  <button
                    onClick={() => onViewDetails(rol)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Ver Detalles"
                  >
                    <FaEye size={18} />
                  </button>
                  <button
                    onClick={() => onEditRole(rol)}
                    className="text-yellow-500 hover:text-yellow-700"
                    title="Editar"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteRole(rol)}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar"
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RolesTable;
