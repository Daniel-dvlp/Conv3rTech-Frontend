import React from 'react';

const CategoryViewModal = ({ isOpen, onClose, categoria }) => {
  if (!isOpen || !categoria) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-center">Detalles de la Categoría</h2>

        {/* Imagen */}
        <div className="w-full h-48 mb-4 flex items-center justify-center">
          {categoria.imagen || categoria.url_imagen ? (
            <img
              src={categoria.url_imagen || (typeof categoria.imagen === 'string' ? categoria.imagen : URL.createObjectURL(categoria.imagen))}
              alt={categoria.nombre}
              className="object-cover w-full h-full rounded-md border"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 rounded-md">
              Sin imagen
            </div>
          )}
        </div>

        {/* Información */}
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
            <span className="block text-sm font-semibold text-gray-800">Nombre:</span>
            <span className="text-gray-600">{categoria.nombre}</span>
          </div>

          <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
            <span className="block text-sm font-semibold text-gray-800">Descripción:</span>
            <p className="text-gray-600 text-sm mt-1">{categoria.descripcion}</p>
          </div>

          <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
            <span className="block text-sm font-semibold text-gray-800">Estado:</span>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
              (categoria.estado || '').toLowerCase() === 'activo' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {(categoria.estado || '').toLowerCase() === 'activo' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {/* Botón cerrar */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FFB800] text-black rounded hover:bg-[#e0a500] transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryViewModal;
