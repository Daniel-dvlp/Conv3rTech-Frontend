import React from 'react';
import { FaEye, FaEdit, FaDownload, FaMinusCircle } from 'react-icons/fa';
import {showError} from '../../../../../shared/utils/alerts';

const QuotesTable = ({ quotes, onViewDetails, onEdit, onDownloadPDF, onCancel }) => {
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '$0';
    const parsedNum = typeof num === 'string' ? parseFloat(num) : num;
    return isNaN(parsedNum) ? '$0' : new Intl.NumberFormat('es-ES').format(parsedNum);
  };

  const handleDisabledAction = () => {
    showError('No se puede realizar esta acción porque la cotización ya está rechazada/anulada.');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre cotización</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento cliente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto cotización</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de vencimiento</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {quotes.map((quote, index) => {
            const keyId = quote.id_cotizacion ?? quote.id ?? `q-${index}`;
            const rawCliente = quote.cliente ?? quote.clienteData ?? quote.cliente_nombre;
            let clienteDisplay = '';
            if (typeof rawCliente === 'string') {
              clienteDisplay = rawCliente;
            } else if (rawCliente && typeof rawCliente === 'object') {
              const nombre = rawCliente.nombre || '';
              const apellido = rawCliente.apellido || '';
              clienteDisplay = `${nombre} ${apellido}`.trim() || rawCliente.documento || rawCliente.correo || '';
            }
            const documento = rawCliente && typeof rawCliente === 'object' ? rawCliente.documento || '' : '';
            const monto = (
              quote.monto_cotizacion
              ?? quote.detalleOrden?.total
              ?? quote.total
              ?? 0
            );
            const fechaVenc = quote.fecha_vencimiento ?? quote.fechaVencimiento ?? '';
            return (
              <tr key={keyId}>
                <td className="px-4 py-3">{quote.nombre_cotizacion}</td>
                <td className="px-4 py-3">{clienteDisplay}</td>
                <td className="px-4 py-3">{documento}</td>
                <td className="px-4 py-3">${formatNumber(monto)}</td>
                <td className="px-4 py-3">{fechaVenc}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                  quote.estado === 'Rechazada' || quote.estado === 'Anulada' 
                    ? 'bg-red-100 text-red-800' 
                    : quote.estado === 'Pendiente' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {quote.estado === 'Anulada' ? 'Rechazada' : quote.estado}
                </span>
              </td>
              <td className="px-4 py-3 space-x-2">
                <button
                  onClick={() => onViewDetails(quote)}
                  title="Ver detalles"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaEye />
                </button>

                <button
                  onClick={() => (quote.estado === 'Rechazada' || quote.estado === 'Anulada') ? handleDisabledAction() : onEdit(quote)}
                  title="Editar"
                  disabled={quote.estado === 'Rechazada' || quote.estado === 'Anulada'}
                  className={(quote.estado === 'Rechazada' || quote.estado === 'Anulada') ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-500 hover:text-yellow-600'}
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
                  onClick={() => (quote.estado === 'Rechazada' || quote.estado === 'Anulada') ? handleDisabledAction() : onCancel(quote)}
                  title="Anular"
                  disabled={quote.estado === 'Rechazada' || quote.estado === 'Anulada'}
                  className={(quote.estado === 'Rechazada' || quote.estado === 'Anulada') ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-gray-900'}
                >
                  <FaMinusCircle />
                </button>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default QuotesTable;
