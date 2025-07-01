import React from 'react';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';

const ServiceCategoryTable = ({ categorias, onVer, onEditar, onEliminar }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categorias.map((categoria) => (
        <div
          key={categoria.id}
          className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center"
        >
          {/* Imagen o placeholder */}
          <div className="w-28 h-28 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
            {categoria.imagen ? (
              <img src={categoria.imagen} alt={categoria.nombre} className="object-cover w-full h-full rounded-md" />
            ) : (
              <span className="text-gray-400 text-sm">Sin imagen</span>
            )}
          </div>

          {/* Nombre y descripción */}
          <h3 className="text-base font-semibold text-gray-800">{categoria.nombre}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{categoria.descripcion}</p>

          {/* Acciones */}
          <div className="flex gap-4 mt-4 text-gray-600">
            <button onClick={() => onVer(categoria.id)} className="hover:text-blue-600" title="Ver">
              <FaEye size={18} />
            </button>
            <button onClick={() => onEditar(categoria.id)} className="hover:text-green-600" title="Editar">
              <FaEdit size={18} />
            </button>
            <button onClick={() => onEliminar(categoria.id)} className="hover:text-red-600" title="Eliminar">
              <FaTrashAlt size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceCategoryTable;
