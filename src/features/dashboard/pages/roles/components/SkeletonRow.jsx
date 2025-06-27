// src/features/dashboard/pages/roles/components/SkeletonRow.jsx

import React from 'react';

const SkeletonRow = () => {
  return (
    // Cada fila tendrá la misma estructura que una fila de datos real
    <tr className="animate-pulse">
      {/* Celda para Rol (Avatar + Nombre) */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </td>
      {/* Celda para Descripción */}
      <td className="px-6 py-4">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
      </td>
      {/* Celda para Permisos */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
        </div>
      </td>
      {/* Celda para Estado */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
      </td>
      {/* Celda para Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center gap-4">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );
};

export default SkeletonRow;