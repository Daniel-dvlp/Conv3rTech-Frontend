// src/features/dashboard/pages/suppliers/components/SkeletonSupplierRow.jsx

import React from 'react';

const SkeletonSupplierRow = () => {
  return (
    <tr className="animate-pulse">
      {/* Tax ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      {/* Contact Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </td>
      {/* Company */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
      </td>
      {/* Phone */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-28 bg-gray-200 rounded"></div>
      </td>
      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
      </td>
      {/* Address */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </td>
      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
      </td>
      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center gap-4">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );
};

export default SkeletonSupplierRow;
