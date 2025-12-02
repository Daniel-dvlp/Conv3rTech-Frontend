import React, { useState } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa'; // Importa FaPlusCircle para el nuevo botón
import PaymentsDetailModal from './PaymentsDetailModal';

// Helper para formatear montos a moneda local (COP)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Asegúrate de que este componente reciba la prop 'onRegisterNewAbono'
const PagosTable = ({ pagos, onRegisterNewAbono, handleOpenPaymentDetails  }) => { // Agrega onRegisterNewAbono a las props
  const [selectedPayment, setSelectedPayment] = useState(null);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full text-center">
        <thead className="bg-gray-50">
          <tr>
            {['Fecha', 'Número de Contrato', 'Nombre y Apellido', 'Monto Pagado', 'Método de Pago', 'Estado', 'Acciones']
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
              <td className="px-4 py-2">{p.fecha}</td>
              <td className="px-4 py-2">{p.numeroContrato}</td>
              <td className="px-4 py-2">{p.nombre} {p.apellido}</td>
              <td className="px-4 py-2">{formatCurrency(p.montoAbonado)}</td>
              <td className="px-4 py-2">{p.metodoPago}</td>
              <td className="px-4 py-2">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${p.estado === 'Registrado' ? 'bg-green-100 text-green-800' : p.estado === 'Cancelado' ? 'bg-red-100 text-red-800' : p.estado === 'Completado' ? 'bg-blue-100 text-blue-800' : p.estado === 'Sin pagos' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {p.estado}
                </span>
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                  <button className='text-blue-600 hover:text-blue-800' onClick={() => handleOpenPaymentDetails(p.numeroContrato, p.clienteId)}>
                    <FaEye />
                  </button>
                  <button
                    className="text-conv3rge-drak hover:text-conv3ge-dark-800"
                    onClick={() => onRegisterNewAbono(p)}
                    title="Registrar Abono"
                  >
                    <FaPlus />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de detalle */}
      
    </div>
  );
};

export default PagosTable;