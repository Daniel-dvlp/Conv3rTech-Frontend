// src/shared/components/TableSkeleton.jsx

import React from 'react';

// Este componente es configurable. Recibe el número de filas y un array con las cabeceras.
const TableSkeleton = ({ headers, rowCount = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {[...Array(rowCount)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              {/* Creamos una celda esqueleto por cada cabecera */}
              {headers.map((header) => (
                <td key={header} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;