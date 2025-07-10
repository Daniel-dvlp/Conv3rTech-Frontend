import React from 'react';
import {
  FaTimes, FaCalendarAlt, FaFileContract, FaUser, FaMoneyBillWave,
  FaCreditCard, FaToggleOn, FaCommentDots, FaClipboardList, FaDollarSign, FaHistory
} from 'react-icons/fa';

// Helper para formatear montos a moneda local (COP)
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0'; // O algún valor predeterminado si el monto no es un número válido
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700">
    <span className="text-gray-400">{icon}</span>
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

// El prop ahora es `contractData`
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
    <div className="fixed inset-0 bg-black/10 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-xl w-full max-w-4xl p-8 relative overflow-y-auto max-h-[90vh]" // Aumentado max-w y añadido max-h/overflow
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-2xl"
        >
          <FaTimes />
        </button>

        {/* Encabezado */}
        <div className="mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-[#00012A] mb-1">Detalles del Contrato</h2>
          <p className="text-xl text-gray-700 font-semibold flex items-center gap-2">
            <FaFileContract className="text-blue-500" /> Contrato #<span className="text-[#00012A]">{contrato.numero}</span>
          </p>
        </div>

        {/* Información General del Contrato y Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Información del cliente */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaUser className="text-blue-500" /> Información del Cliente
            </h3>
            <InfoRow icon={<FaUser />} label="Nombre Completo" value={`${cliente.nombre} ${cliente.apellido}`} />
            <InfoRow icon={<FaClipboardList />} label="Documento" value={cliente.documento || 'N/A'} />
            {/* Puedes añadir más info del cliente si la tienes en `cliente` */}
          </div>

          {/* Resumen del Contrato */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-500" /> Resumen Financiero
            </h3>
            <InfoRow icon={<FaDollarSign />} label="Monto Total Contrato" value={formatCurrency(contrato.montoTotal)} />
            <InfoRow icon={<FaMoneyBillWave />} label="Monto Abonado Total" value={formatCurrency(contrato.montoAbonado)} />
            <InfoRow icon={<FaCreditCard />} label="Monto Restante" value={formatCurrency(contrato.montoRestante)} />
            <InfoRow icon={<FaCalendarAlt />} label="Fecha de Inicio" value={contrato.fechaInicio || 'N/A'} /> {/* Asumiendo que existe en `contrato` */}
          </div>
        </div>

        {/* Tabla de Historial de Pagos */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-[#00012A] mb-4 flex items-center gap-2">
            <FaHistory className="text-purple-500" /> Historial de Pagos
          </h3>
          <div className="bg-white rounded-lg shadow-md overflow-x-auto border border-gray-200">
            <table className="w-full text-center divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                  <th scope="col" className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Abono</th>
                  <th scope="col" className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th scope="col" className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Restante Contrato</th>
                  <th scope="col" className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white text-center divide-y divide-gray-200">
                {pagos.length > 0 ? (
                  pagos.map((p, index) => (
                    <tr key={p.id || index} className="hover:bg-gray-50"> {/* Usar index como fallback para key si id no está */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{p.fecha}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{p.concepto}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{formatCurrency(p.montoAbonado)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{p.metodoPago}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{formatCurrency(p.montoRestante)}</td> {/* Monto restante del contrato después de este pago */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(p.estado)}`}>
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay pagos registrados para este contrato.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentsDetailModal;