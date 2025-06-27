import React from 'react';
import { FaEye, FaMinusCircle, FaDownload, FaEdit } from 'react-icons/fa';

const QuotesTable = ({ quotes }) => {
  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aprobada':
        return 'bg-green-100 text-green-800';
      case 'Rechazada':
        return 'bg-red-100 text-red-800';
      case 'Cerrada':
        return 'bg-gray-200 text-gray-700';
      case 'Servicio en ejecución':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden de Servicio</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto de la Cotización</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Vencimiento</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {quotes.map((quote) => (
            <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{quote.id}</td>
              <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{quote.cliente}</td>
              <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{quote.ordenServicio}</td>
              <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">${quote.monto.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{quote.fechaVencimiento}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoStyle(quote.estado)}`}>
                  {quote.estado}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  <button className="text-blue-600 hover:text-gray-900" title="Ver detalle">
                    <FaEye size={16} />
                  </button>
                  <button className="text-yellow-600 hover:text-blue-900" title="Editar">
                    <FaEdit size={16} />
                  </button>
                  <button className="text-green-600 hover:text-green-800" title="Descargar cotización">
                    <FaDownload size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="Eliminar cotización">
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

export default QuotesTable;
