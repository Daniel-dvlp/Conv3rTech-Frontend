import React from 'react';

const ServiceViewModal = ({ isOpen, onClose, servicio }) => {
  if (!isOpen || !servicio) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold text-center mb-4">Detalle del Servicio</h2>

      {servicio.imagen && (
        <img
          src={typeof servicio.imagen === 'string' ? servicio.imagen : URL.createObjectURL(servicio.imagen)}
          alt="Imagen del servicio"
          className="w-full h-48 object-cover rounded mb-4"
        />
      )}

  {/* Información con estilo de tarjetas */}
  <div className="space-y-3">
    <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
      <span className="block text-sm font-semibold text-gray-800">Categoría:</span>
      <span className="text-gray-600">{servicio.categoria || 'No especificada'}</span>
    </div>

    <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
      <span className="block text-sm font-semibold text-gray-800">Precio:</span>
      <span className="text-gray-600">${servicio.precio || 'No disponible'}</span>
    </div>

    <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
      <span className="block text-sm font-semibold text-gray-800">Duración:</span>
      <span className="text-gray-600">{servicio.duracion || 'No indicada'}</span>
    </div>

    <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
      <span className="block text-sm font-semibold text-gray-800">Descripción:</span>
      <p className="text-sm text-gray-600 mt-1">{servicio.descripcion || 'Sin descripción'}</p>
    </div>
  </div>



        {/* Botón cerrar */}
        <div className="flex justify-end mt-6">
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

export default ServiceViewModal;
