import React from "react";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";

const ServicesTable = ({
  servicios,
  onVer,
  onEditar,
  onEliminar,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {servicios.map((servicio) => {
        const servicioId = servicio.id_servicio || servicio.id;
        const imagenUrl = servicio.url_imagen || servicio.imagen;
        
        return (
          <div
            key={servicioId}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center relative hover:shadow-lg transition-shadow"
          >
            {/* Imagen del servicio */}
            <div className="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center overflow-hidden">
              {imagenUrl ? (
                <img
                  src={imagenUrl}
                  alt={servicio.nombre}
                  className="object-cover w-full h-full rounded-md"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Sin+Imagen';
                    e.target.onerror = null;
                  }}
                />
              ) : (
                <span className="text-gray-400 text-sm">Sin imagen</span>
              )}
            </div>

            {/* Nombre, precio, descripción */}
            <h3 className="text-base font-semibold text-gray-800 line-clamp-1 mb-0">
              {servicio.nombre}
            </h3>
            <p className="text-xs text-gray-400 mt-0">
              {servicio.categoria?.nombre || 'Sin categoría'}
            </p>
            
            <div className="flex items-center justify-center mt-0">
              {servicio.precio && (
                <p className="text-sm font-semibold text-[#FFB800]">
                  ${parseFloat(servicio.precio).toLocaleString('es-CO')}
                </p>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-0">
              {servicio.descripcion?.length > 40 ? `${servicio.descripcion.substring(0, 60)}...` : servicio.descripcion}
            </p>

            {/* Estado */}
            <div
              className={`mt-0 text-xs font-medium px-2 py-1 rounded-full ${
                (servicio.estado || '').toLowerCase() === "activo"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {(servicio.estado || '').toLowerCase() === "activo" ? "Activo" : "Inactivo"}
            </div>

            {/* Acciones */}
            <div className="flex gap-3 mt-2 text-gray-600">
              <button
                onClick={() => onVer(servicioId)}
                className="hover:text-blue-600 transition"
                title="Ver"
              >
                <FaEye size={18} />
              </button>
              <button
                onClick={() => onEditar(servicioId)}
                className="hover:text-green-600 transition"
                title="Editar"
              >
                <FaEdit size={18} />
              </button>
              <button
                onClick={() => onEliminar(servicioId)}
                className="hover:text-red-600 transition"
                title="Eliminar"
              >
                <FaTrashAlt size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ServicesTable;