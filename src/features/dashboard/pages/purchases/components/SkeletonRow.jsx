// src/features/dashboard/pages/purchases/components/SkeletonPurchaseRow.jsx

import React from 'react';

const SkeletonPurchaseRow = () => {
  return (
    <tr className="animate-pulse">
      {/* Se elimina el ID */}
      {/*
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </td>
      */}
      {/* Receipt Number */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      {/* Supplier */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
      </td>
      {/* Amount (Monto Total) */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </td>
      {/* Registration Date (Fecha de Registro) */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-28 bg-gray-200 rounded"></div>
      </td>
      {/* Estado */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-20 bg-gray-200 rounded"></div> {/* Un poco más ancho para el estado */}
      </td>
      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center gap-3">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );
};

export default SkeletonPurchaseRow;