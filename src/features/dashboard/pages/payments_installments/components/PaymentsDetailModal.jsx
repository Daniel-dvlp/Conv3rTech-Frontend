import React from 'react';
import {
  FaTimes, FaCalendarAlt, FaFileContract, FaUser, FaMoneyBillWave,
  FaCreditCard, FaInfoCircle, FaHistory
} from 'react-icons/fa';

// Helper para formatear montos a moneda local (COP)
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0,00'; 
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const DetailCard = ({ title, icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
      {icon}
      <span>{title}</span>
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const InfoRow = ({ label, children }) => (
  <div className="text-base text-gray-700">
    <span className="text-gray-500 font-medium">{label}:</span>
    <p className="font-semibold text-gray-900 mt-1">{children}</p>
  </div>
);

const PaymentsDetailModal = ({ contractData, onClose }) => {
  // Si no hay datos de contrato, no renderizar el modal
  if (!contractData || !contractData.cliente || !contractData.contrato) {
    return null;
  }

  // Acceder a los datos del cliente y del contrato de forma segura
  const cliente = contractData.cliente;
  const contrato = contractData.contrato;
  const pagos = contrato.pagos || []; // Asegúrate de que pagos sea un array, incluso si está vacío

  const getStatusClass = (estado) =>
    estado === 'Registrado'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-16 md:pt-24"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <header className="flex justify-between items-center p-4 sm:p-6 border-b bg-white rounded-t-xl">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Contrato #{contrato.numero}</h2>
            <p className="text-md text-gray-600">Cliente: {cliente.nombre} {cliente.apellido}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scroll space-y-6">
            
          {/* Información General */}
          <DetailCard title="Información General" icon={<FaInfoCircle className="text-gray-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Cliente">{cliente.nombre} {cliente.apellido}</InfoRow>
              <InfoRow label="Documento">{cliente.documento || 'N/A'}</InfoRow>
              <InfoRow label="Fecha de Inicio">{contrato.fechaInicio || 'N/A'}</InfoRow>
              <InfoRow label="Estado Financiero">
                  {contrato.montoRestante === 0 ? 
                      <span className="text-green-600 font-bold">Pagado</span> : 
                      <span className="text-orange-600 font-bold">Pendiente</span>
                  }
              </InfoRow>
            </div>
          </DetailCard>

           {/* Resumen Financiero */}
           <DetailCard title="Resumen Financiero" icon={<FaMoneyBillWave className="text-green-500" />}>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <InfoRow label="Monto Total">
                 <span className="text-gray-900">{formatCurrency(contrato.montoTotal)}</span>
               </InfoRow>
               <InfoRow label="Monto Abonado">
                 <span className="text-green-700">{formatCurrency(contrato.montoAbonado)}</span>
               </InfoRow>
               <InfoRow label="Monto Restante">
                 <span className="text-red-600">{formatCurrency(contrato.montoRestante)}</span>
               </InfoRow>
             </div>
           </DetailCard>

          {/* Historial de Pagos */}
          <DetailCard title="Historial de Pagos" icon={<FaHistory className="text-purple-500" />}>
            {pagos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center border border-gray-200">
                  <thead className="bg-conv3r-dark text-white">
                    <tr>
                      <th className="p-3 font-semibold">Fecha</th>
                      <th className="font-semibold">Concepto</th>
                      <th className="font-semibold">Abono</th>
                      <th className="font-semibold">Método</th>
                      <th className="font-semibold">Restante</th>
                      <th className="font-semibold">Estado</th>
                      <th className="font-semibold">Motivo Anulación</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-gray-700">
                    {pagos.map((p, index) => (
                      <tr key={p.id || index} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="p-3 whitespace-nowrap">{p.fecha}</td>
                        <td className="p-3 text-left">{p.concepto}</td>
                        <td className="p-3 whitespace-nowrap font-medium">{formatCurrency(p.montoAbonado)}</td>
                        <td className="p-3 whitespace-nowrap">{p.metodoPago}</td>
                        <td className="p-3 whitespace-nowrap text-gray-500">{formatCurrency(p.montoRestante)}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(p.estado)}`}>
                            {p.estado}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gray-500 italic max-w-xs truncate" title={p.motivo_anulacion || ''}>
                           {p.estado === 'Cancelado' ? (p.motivo_anulacion || 'Sin motivo') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay pagos registrados para este contrato.</p>
            )}
          </DetailCard>

        </div>
      </div>
    </div>
  );
};

export default PaymentsDetailModal;