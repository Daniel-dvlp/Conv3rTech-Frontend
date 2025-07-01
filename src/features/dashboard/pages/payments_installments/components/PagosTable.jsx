import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import PaymentsDetailModal from './PaymentsDetailModal';

const PagosTable = ({ pagos }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full text-center">
        <thead className="bg-gray-50">
          <tr>
            {['ID','Fecha','Número de Contrato','Nombre y Apellido','Monto Total','Monto Pagado','Método de Pago','Estado','Acciones']
              .map(h => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  {h}
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {pagos.map(p => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2">{p.id}</td>
              <td className="px-4 py-2">{p.fecha}</td>
              <td className="px-4 py-2">{p.numeroContrato}</td>
              <td className="px-4 py-2">{p.nombre} {p.apellido}</td>
              <td className="px-4 py-2">{Number(p.montoTotal).toLocaleString('es-CO')}</td>
              <td className="px-4 py-2">{Number(p.montoAbonado).toLocaleString('es-CO')}</td>
              <td className="px-4 py-2">{p.metodoPago}</td>
              <td className="px-4 py-2">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  p.estado === 'Pagado'
                    ? 'bg-green-100 text-green-800'
                    : p.estado === 'Cancelado'
                      ? 'bg-yellow-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {p.estado}
                </span>
              </td>
              <td className="px-4 py-2">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setSelectedPayment(p)}
                  title="Ver detalles"
                >
                  <FaEye />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de detalle */}
      {selectedPayment && (
        <PaymentsDetailModal
          pago={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
};

export default PagosTable;
