import React from 'react';

const SkeletonRow = () => {
  return (
    <tr className="animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="h-4 w-20 bg-gray-200 rounded-full mx-auto"></div>
      </td>
    </tr>
  );
};

export default SkeletonRow;
