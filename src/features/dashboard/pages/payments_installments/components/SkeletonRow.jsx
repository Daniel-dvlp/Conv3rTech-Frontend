import React from 'react';
import { FaEye } from 'react-icons/fa';

const SkeletonRow = () => {
  return (
    <tr className="animate-pulse">
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="h-4 w-5 bg-gray-200 rounded-full mx-auto"></div>
      </td>
    </tr>
  );
};

export default SkeletonRow;
