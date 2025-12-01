import React from 'react';
import { FaTimes, FaInfoCircle, FaToggleOn, FaToggleOff, FaClock, FaMoneyBillWave } from 'react-icons/fa';

// Componentes auxiliares estandarizados
const DetailCard = ({ title, icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
      {icon}
      <span>{title}</span>
    </h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, children }) => (
  <div className="text-base text-gray-700">
    <span className="text-gray-500 font-medium">{label}:</span>
    <p className="font-semibold text-gray-900 mt-1">{children}</p>
  </div>
);

const ServiceViewModal = ({ isOpen, onClose, servicio }) => {
  if (!isOpen || !servicio) return null;

  const imagenUrl = servicio.url_imagen || servicio.imagen;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-16 md:pt-24"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 sm:p-6 border-b bg-white rounded-t-xl">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {servicio.nombre || 'Detalle del Servicio'}
            </h2>
            <p className="text-md text-gray-600">
              ID: {servicio.id_servicio || servicio.id || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full transition"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scroll space-y-6">
          {/* Imagen del servicio */}
          {imagenUrl && (
            <DetailCard title="Imagen" icon={<FaInfoCircle className="text-gray-500" />}>
              <div className="flex justify-start">
                <img
                  src={imagenUrl}
                  alt={servicio.nombre || 'Servicio'}
                  className="w-50 h-50 object-cover rounded-lg shadow-sm transition-transform duration-200 hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Sin+Imagen';
                    e.target.onerror = null;
                  }}
                />
              </div>
            </DetailCard>
          )}

          {/* Información del servicio */}
          <DetailCard title="Información del servicio" icon={<FaInfoCircle className="text-gray-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Categoría">
                {servicio.categoria?.nombre || servicio.categoria || 'No especificada'}
              </InfoRow>

              <InfoRow label="Precio">
                <div className="space-y-1">
                  <span className="font-semibold text-gray-900">
                    $COP {parseFloat(servicio.precio || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </InfoRow>

              <InfoRow label="Duración">
                <div className="space-y-1">
                  {(servicio.horas || servicio.minutos) && (
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <FaClock className="text-blue-600" />
                      {servicio.horas && servicio.horas !== '0' ? `${servicio.horas}h` : ''}
                      {servicio.minutos && servicio.minutos !== '0' ? `${servicio.minutos}m` : ''}
                    </span>
                  )}
                </div>
              </InfoRow>

              <InfoRow label="Estado">
                <span
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-semibold ${(servicio.estado || '').toLowerCase() === 'activo'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    }`}
                >
                  {(servicio.estado || '').toLowerCase() === 'activo' ? (
                    <FaToggleOn />
                  ) : (
                    <FaToggleOff />
                  )}
                  {(servicio.estado || 'inactivo').toLowerCase() === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
              </InfoRow>
            </div>
          </DetailCard>

          {/* Descripción */}
          <DetailCard title="Descripción" icon={<FaInfoCircle className="text-gray-500" />}>
            <p className="text-gray-700 leading-relaxed">
              {servicio.descripcion || 'Sin descripción disponible'}
            </p>
          </DetailCard>
        </div>
      </div>
    </div>
  );
};

export default ServiceViewModal;