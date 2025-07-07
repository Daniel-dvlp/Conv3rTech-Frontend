// src/features/dashboard/pages/ventas/components/SalesTable.jsx

import React from 'react';
import { FaEye, FaDownload, FaMinusCircle } from 'react-icons/fa';

const SalesTable = ({ sales, onViewDetails, onDownloadPDF }) => {
  if (!sales || sales.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 text-center">
        <p className="text-gray-500">No hay ventas registradas.</p>
      </div>
    );
  }
  
  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Registrada':
        return 'bg-green-100 text-green-800';
      case 'Anulada':
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Venta</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha y Hora</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Total</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método de Pago</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {sale.numero}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                {sale.cliente}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {sale.fechaHora}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                ${sale.monto.toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {sale.metodoPago}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoStyle(sale.estado)}`}>
                  {sale.estado}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  <button className="text-blue-600 hover:text-gray-900" title="Ver detalle" onClick={() => onViewDetails(sale)}>
                    <FaEye size={16} />
                  </button>
                  <button className="text-green-600 hover:text-green-800" title="Descargar factura" onClick={() => onDownloadPDF(sale)}>
                    <FaDownload size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="Anular venta">
                    <FaMinusCircle size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
