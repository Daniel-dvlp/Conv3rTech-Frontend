// src/features/dashboard/pages/categorias/components/SkeletonRow.jsx

import React from 'react';

const SkeletonRow = () => {
  return (
    <tr className="animate-pulse">
      {/* Celda: Nombre */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </td>

      {/* Celda: Descripción */}
      <td className="px-4 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </td>

      {/* Celda: Estado */}
      <td className="px-4 py-4">
        <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
      </td>

      {/* Celda: Acciones */}
      <td className="px-4 py-4 text-right">
        <div className="flex justify-end items-center gap-3">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );
};

export default SkeletonRow;
