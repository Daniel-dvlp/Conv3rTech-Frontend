import React from "react";
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaRegCircle,
} from "react-icons/fa";

const ServicesTable = ({
  servicios,
  onVer,
  onEditar,
  onEliminar,
  onToggleCompletado,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {servicios.map((servicio) => (
        <div
          key={servicio.id}
          className={`bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center ${
            servicio.completed ? "ring-1 ring-green-400" : ""
          }`}
        >
          {/* Imagen del servicio o placeholder */}
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
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            {servicio.nombre}
            {servicio.completed && (
              <span className="inline-flex items-center text-green-600 text-xs font-semibold">
                <FaCheckCircle className="mr-1" /> Completado
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {servicio.descripcion}
          </p>

          {/* Acciones */}
          <div className="flex gap-4 mt-4 text-gray-600">
            <button
              onClick={() => onToggleCompletado(servicio.id)}
              className={`${
                servicio.completed
                  ? "text-green-600 hover:text-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={
                servicio.completed
                  ? "Marcar como pendiente"
                  : "Marcar como completado"
              }
            >
              {servicio.completed ? (
                <FaCheckCircle size={18} />
              ) : (
                <FaRegCircle size={18} />
              )}
            </button>
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicesTable;
