// src/features/dashboard/pages/ventas/components/SkeletonRow.jsx

import React from 'react';

const SkeletonRow = () => {
  return (
    <tr className="animate-pulse">
      {/* # Venta */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </td>

      {/* Cliente */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </td>

      {/* Documento */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>

      {/* Fecha y Hora */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-4 w-36 bg-gray-200 rounded"></div>
      </td>

      {/* Monto Total */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>

      {/* Estado */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-5 w-24 bg-gray-200 rounded-full"></div>
      </td>

      {/* Acciones */}
      <td className="px-4 py-4 text-right">
        <div className="flex justify-end items-center gap-3">
          <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
          <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
          <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
        </div>
      </td>
    </tr>
  );
};

export default SkeletonRow;
