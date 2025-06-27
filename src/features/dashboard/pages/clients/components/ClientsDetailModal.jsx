import React from 'react';
import {
  FaTimes, FaIdCard, FaEnvelope, FaPhone, FaUser, FaMapMarkedAlt, FaToggleOn, FaCreditCard
} from 'react-icons/fa';

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700">
    <span className="text-gray-400">{icon}</span>
    <span className="font-medium text-gray-600">{label}</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

const ClientsDetailModal = ({ cliente, onClose }) => {
  if (!cliente) return null;

  const getStatusClass = (estado) =>
    estado === 'Activo'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';

  return (
    <div className="fixed inset-0 bg-black/10 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-xl w-full max-w-4xl p-8 relative overflow-hidden"
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
          <h2 className="text-3xl font-bold text-[#00012A]">{cliente.nombre}</h2>
          <p className="text-sm text-gray-500">Detalles del cliente</p>
        </div>

        {/* Secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Info Cliente */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaUser className="text-blue-500" /> Información del Cliente
            </h3>
            <InfoRow icon={<FaIdCard />} label="Tipo de Documento" value={cliente.tipoDocumento} />
            <InfoRow icon={<FaIdCard />} label="Documento" value={cliente.documento} />
            <InfoRow icon={<FaPhone />} label="Celular" value={cliente.celular} />
            <InfoRow icon={<FaEnvelope />} label="Correo" value={cliente.email} />
          </div>

          {/* Estado y crédito */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaCreditCard className="text-purple-500" /> Crédito y Estado
              </h3>
              <InfoRow icon={<FaCreditCard />} label="Crédito" value={cliente.credito ? 'Sí' : 'No'} />
              <div className="flex items-center gap-2 ml-1">
                <FaToggleOn className="text-green-500" />
                <span className="font-medium text-gray-600">Estado:</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(cliente.estado)}`}>
                  {cliente.estado}
                </span>
              </div>
            </div>

            {/* Direcciones */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaMapMarkedAlt className="text-emerald-500" /> Direcciones
              </h3>
              {cliente.direcciones.map((dir, i) => (
                <InfoRow
                  key={i}
                  icon={<FaMapMarkedAlt />}
                  label={dir.nombre}
                  value={`${dir.direccion}, ${dir.ciudad}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsDetailModal;
