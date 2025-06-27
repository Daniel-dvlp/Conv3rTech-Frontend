import React from 'react';

const SkeletonRow = () => {
  return (
    <tr className="animate-pulse">
    {/* Celda para Id*/}
    <td className="px-6 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </td>
      {/* Documento */}
      <td className="px-6 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </td>
      {/*Tipo de Documento */}
      <td className="px-6 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </td>
        {/* Celda: Nombre */}
      <td className="px-6 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </td>
      {/* Celda: Apellido */}
      <td className="px-6 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </td>
      {/* Celda: Correo */}
      <td className="px-6 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </td>

      {/* Celda: Rol */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>

      {/* Celda: Estado (Activo/Inactivo) */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
      </td>

      {/* Celda: Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center gap-4">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );
};

export default SkeletonRow;
