// src/features/dashboard/pages/suppliers/components/SupplierDetailModal.jsx

import React, { useRef } from 'react';
import {
  FaTimes,
  FaBuilding,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStickyNote,
  FaClock,
  FaInfoCircle
} from 'react-icons/fa';

// Modificado InfoRow para permitir alinear el contenido principal si es necesario
const InfoRow = ({ icon, label, children, alignRight = false }) => (
  <div className="flex items-start gap-3 text-sm">
    <div className="text-gray-400 mt-0.5">{icon}</div>
    <div className="flex-1">
      <span className="text-gray-500">{label}:</span>
      {/* Añadida clase condicional para alinear a la derecha */}
      <p className={`font-semibold text-gray-900 ${alignRight ? 'text-right' : ''}`}>{children}</p>
    </div>
  </div>
);

const SupplierDetailModal = ({ supplier, onClose }) => {
  const modalContentRef = useRef();
  // Eliminado mouseDownTargetRef y los handlers de mouse para prevenir cierre fuera del modal

  if (!supplier) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-16 md:pt-24"
      // Eliminado onMouseDown y onMouseUp aquí para que no cierre al hacer clic fuera
    >
      <div
        className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Esto detiene la propagación de clics dentro del modal
        ref={modalContentRef}
      >
        <header className="flex justify-between items-center p-4 sm:p-6 border-b bg-white rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Proveedor: {supplier.empresa}</h2>
            <p className="text-md text-gray-600">NIT: {supplier.nit || 'No especificado'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto flex-grow custom-scroll space-y-6">

          {/* Información de la Entidad */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaBuilding className="text-gray-500" />
              <span>Información de la Entidad</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={<FaBuilding />} label="Nombre Entidad">{supplier.empresa}</InfoRow>
              <InfoRow icon={<FaInfoCircle />} label="NIT">{supplier.nit || 'No especificado'}</InfoRow>
              <InfoRow icon={<FaPhone />} label="Teléfono Entidad">{supplier.telefono_entidad || 'No especificado'}</InfoRow>
              <InfoRow icon={<></>} label="Estado">
                <span className={`font-medium ${
                  supplier.estado === 'Activo' ? 'text-green-600' :
                  supplier.estado === 'Inactivo' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {supplier.estado}
                </span>
              </InfoRow>
            </div>
          </div>

          {/* Información del Encargado */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaUser className="text-gray-500" />
              <span>Información del Encargado</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={<FaUser />} label="Nombre Encargado">{supplier.encargado}</InfoRow>
              <InfoRow icon={<FaPhone />} label="Teléfono Encargado">{supplier.telefono_encargado || 'No especificado'}</InfoRow>
              <InfoRow icon={<FaEnvelope />} label="Correo Principal">{supplier.correo_principal}</InfoRow>
              <InfoRow icon={<FaEnvelope />} label="Correo Secundario">{supplier.correo_secundario || 'No especificado'}</InfoRow>
            </div>
          </div>

          {/* Información General */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaMapMarkerAlt className="text-gray-500" />
              <span>Información General</span>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <InfoRow icon={<FaMapMarkerAlt />} label="Dirección">{supplier.direccion || 'No especificada'}</InfoRow>
              {supplier.fecha_registro && <InfoRow icon={<FaClock />} label="Fecha de Registro">{new Date(supplier.fecha_registro).toLocaleString('es-CO')}</InfoRow>}
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaStickyNote className="text-gray-500" />
              <span>Observaciones</span>
            </h3>
            {supplier.observaciones ? (
              <p className="text-gray-800 whitespace-pre-line">{supplier.observaciones}</p>
            ) : (
              <p className="text-gray-500 italic">Sin observaciones registradas.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SupplierDetailModal;