// src/features/dashboard/pages/service_orders/components/SkeletonServiceOrderRow.jsx

import React from 'react';

const SkeletonServiceOrderRow = () => {
  return (
    <tr className="animate-pulse">
      {/* Order ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </td>
      {/* Quote ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </td>
      {/* Client Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
      </td>
      {/* Contact */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-28 bg-gray-200 rounded"></div>
      </td>
      {/* Request Date */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-5 w-28 bg-gray-200 rounded-full"></div>
      </td>
      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center gap-3">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );
};

export default SkeletonServiceOrderRow;
