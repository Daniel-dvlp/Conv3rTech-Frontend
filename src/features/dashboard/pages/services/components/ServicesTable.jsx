import React from "react";
import { FaEye, FaEdit, FaTrashAlt, FaToggleOn, FaToggleOff } from "react-icons/fa";

const ServicesTable = ({
  servicios,
  onVer,
  onEditar,
  onEliminar,
  onToggleEstado,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {servicios.map((servicio) => (
        <div
          key={servicio.id}
          className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center relative"
        >
          {/* Imagen del servicio */}
          <div className="w-28 h-28 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
            {servicio.imagen ? (
              <img
                src={servicio.imagen}
                alt={servicio.nombre}
                className="object-cover w-full h-full rounded-md"
              />
            ) : (
              <span className="text-gray-400 text-sm">Sin imagen</span>
            )}
          </div>

          {/* Nombre y descripción */}
          <h3 className="text-base font-semibold text-gray-800">
            {servicio.nombre}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {servicio.descripcion}
          </p>

          {/* Estado */}
          <div
            className={`mt-2 text-xs font-medium px-2 py-1 rounded-full ${
              servicio.estado === "activo"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {servicio.estado === "activo" ? "Activo" : "Inactivo"}
          </div>

          {/* Acciones */}
          <div className="flex gap-3 mt-4 text-gray-600">
            <button
              onClick={() => onVer(servicio.id)}
              className="hover:text-blue-600"
              title="Ver"
            >
              <FaEye size={18} />
            </button>
            <button
              onClick={() => onEditar(servicio.id)}
              className="hover:text-green-600"
              title="Editar"
            >
              <FaEdit size={18} />
            </button>
            <button
              onClick={() => onEliminar(servicio.id)}
              className="hover:text-red-600"
              title="Eliminar"
            >
              <FaTrashAlt size={18} />
            </button>
            <button
              onClick={() => onToggleEstado(servicio.id)}
              className="hover:text-yellow-600"
              title="Cambiar estado"
            >
              {servicio.estado === "activo" ? (
                <FaToggleOn size={20} />
              ) : (
                <FaToggleOff size={20} />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicesTable;
