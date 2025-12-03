import React from 'react';

const SkeletonRow = () => {
  return (
    <tr className="animate-pulse">
      {/* Documento */}
      <td className="px-4 py-2">
        <div className="h-4 w-30 bg-gray-200 rounded"></div>
      </td>
      {/*Tipo de Documento */}
      <td className="px-4 py-2">
        <div className="h-4 w-30 bg-gray-200 rounded"></div>
      </td>
        {/* Celda: Nombre */}
      <td className="px-4 py-2">
        <div className="h-4 w-30 bg-gray-200 rounded"></div>
      </td>
      {/* Celda: Correo */}
      <td className="px-4 py-2">
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
      </td>

      {/* Celda: Rol */}
      <td className="px-4 py-2 whitespace-nowrap">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>

      {/* Celda: Estado (Activo/Inactivo) */}
      <td className="px-4 py-2 whitespace-nowrap">
        <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
      </td>

      {/* Celda: Acciones */}
      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
        <div className="h-5 w-20 bg-gray-200 rounded-full">
        
        </div>
      </td>
    </tr>
  );
};

export default SkeletonRow;
