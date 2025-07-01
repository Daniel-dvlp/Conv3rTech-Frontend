import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center animate-pulse">
      {/* Imagen simulada */}
      <div className="w-28 h-28 bg-gray-200 rounded-md mb-4"></div>

      {/* Nombre del servicio */}
      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>

      {/* Descripción */}
      <div className="h-3 w-32 bg-gray-200 rounded mb-4"></div>

      {/* Botones (ver, editar, eliminar) */}
      <div className="flex gap-4 mt-2">
        <div className="h-5 w-5 bg-gray-200 rounded"></div>
        <div className="h-5 w-5 bg-gray-200 rounded"></div>
        <div className="h-5 w-5 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
