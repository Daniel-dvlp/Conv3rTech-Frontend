import React from 'react';
import { FaEye, FaEdit, FaDownload, FaMinusCircle } from 'react-icons/fa';
import {showError} from '../../../../../shared/utils/alerts';

const QuotesTable = ({ quotes, onViewDetails, onEdit, onDownloadPDF, onCancel }) => {
  const handleDisabledAction = () => {
    showError('No se puede realizar esta acción porque la venta ya está anulada.');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden de Servicio</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {quotes.map((quote) => (
            <tr key={quote.id}>
              <td className="px-4 py-3">{quote.id}</td>
              <td className="px-4 py-3">{quote.cliente}</td>
              <td className="px-4 py-3">{quote.ordenServicio}</td>
              <td className="px-4 py-3">${quote.detalleOrden.total.toLocaleString()}</td>
              <td className="px-4 py-3">{quote.fechaVencimiento}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${quote.estado === 'Anulada' ? 'bg-gray-200 text-gray-700' :
                    quote.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                  }`}>
                  {quote.estado}
                </span>
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => onViewDetails(quote)}
                  title="Ver detalles"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaEye />
                </button>

                <button
                  onClick={() => quote.estado === 'Anulada' ? handleDisabledAction() : onEdit(quote)}
                  title="Editar"
                  className={quote.estado === 'Anulada' ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-500 hover:text-yellow-600'}
                >
                  <FaEdit />
                </button>

                <button
                  onClick={() => onDownloadPDF(quote)}
                  title="Descargar PDF"
                  className="text-green-600 hover:text-red-600"
                >
                  <FaDownload />
                </button>

                <button
                  onClick={() => quote.estado === 'Anulada' ? handleDisabledAction() : onCancel(quote)}
                  title="Anular"
                  className={quote.estado === 'Anulada' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-gray-900'}
                >
                  <FaMinusCircle />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuotesTable;
