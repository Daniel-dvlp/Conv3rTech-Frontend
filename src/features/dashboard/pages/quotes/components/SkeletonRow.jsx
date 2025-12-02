import React from 'react';

const SkeletonRow = () => {
  return (
    <tr className="animate-pulse">

      {/* Nombre de la Cotización */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </td>

      {/* Cliente */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </td>

      {/* Documento cliente */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </td>
      
      {/* Monto de la Cotización (total) */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>

      {/* Estado de la Cotización */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="h-5 w-28 bg-gray-200 rounded-full"></div>
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
