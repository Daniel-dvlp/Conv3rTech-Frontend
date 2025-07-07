import React from 'react';
import {
  FaTimes, FaCalendarAlt, FaFileContract, FaUser, FaMoneyBillWave,
  FaCreditCard, FaToggleOn, FaCommentDots
} from 'react-icons/fa';

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700">
    <span className="text-gray-400">{icon}</span>
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

const PaymentsDetailModal = ({ pago, onClose }) => {
  if (!pago) return null;

  const getStatusClass = (estado) =>
    estado === 'Registrado'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';

  return (
    <div className="fixed inset-0 bg-black/10 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-xl w-full max-w-3xl p-8 relative overflow-hidden"
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
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#00012A]">Contrato #{pago.numeroContrato}</h2>
          <p className="text-sm text-gray-500">Detalle de pago de {pago.nombre} {pago.apellido}</p>
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Información del cliente */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaUser className="text-blue-500" /> Información del Cliente
            </h3>
            <InfoRow icon={<FaUser />} label="Nombre" value={`${pago.nombre} ${pago.apellido}`} />
            <InfoRow icon={<FaFileContract />} label="Número de Contrato" value={pago.numeroContrato} />
            <InfoRow icon={<FaCalendarAlt />} label="Fecha de Pago" value={pago.fecha} />
          </div>

          {/* Información del pago */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-500" /> Detalles del Pago
            </h3>
            <InfoRow icon={<FaMoneyBillWave />} label="Monto Total" value={`$ ${Number(pago.montoTotal || 0).toLocaleString('es-CO')}`} />
            <InfoRow icon={<FaCreditCard />} label="Monto Abonado" value={`$ ${Number(pago.montoAbonado || 0).toLocaleString('es-CO')}`} />
            <InfoRow icon={<FaMoneyBillWave />} label="Monto Restante" value={`$ ${Number(pago.montoRestante || 0).toLocaleString('es-CO')}`} />
            <InfoRow icon={<FaCreditCard />} label="Método de Pago" value={pago.metodoPago || '—'} />
            <InfoRow icon={<FaCommentDots />} label="Concepto" value={pago.concepto || '—'} />
            <div className="flex items-center gap-2">
              <FaToggleOn className="text-indigo-500" />
              <span className="font-medium text-gray-600">Estado:</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(pago.estado)} 
              `}>
                {pago.estado}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentsDetailModal;
