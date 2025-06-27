// src/features/dashboard/pages/productos/components/SkeletonRow.jsx

import React from 'react';

const SkeletonRow = () => {
  return (
    <tr className="animate-pulse">
      {/* Celda: Foto */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-10 w-10 rounded bg-gray-200"></div>
      </td>

      {/* Celda: Nombre */}
      <td className="px-4 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>

      {/* Celda: Modelo */}
      <td className="px-4 py-4">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </td>

      {/* Celda: Categoría */}
      <td className="px-4 py-4">
        <div className="h-4 w-28 bg-gray-200 rounded"></div>
      </td>

      {/* Celda: Unidad */}
      <td className="px-4 py-4">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </td>

      {/* Celda: Precio */}
      <td className="px-4 py-4">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </td>

      {/* Celda: Stock */}
      <td className="px-4 py-4">
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
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
