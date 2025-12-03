import React from 'react';
import { FaTimes, FaInfoCircle, FaToggleOn, FaToggleOff } from 'react-icons/fa';

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

const ProductCategoryDetailModal = ({ category, onClose }) => {
  if (!category) return null;

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
            <h2 className="text-3xl font-bold text-gray-800">{category.nombre}</h2>
            <p className="text-md text-gray-600">ID: {category.id_categoria}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <div className="space-y-6">
            <DetailCard title="Información de la Categoría" icon={<FaInfoCircle className="text-gray-500" />}>
              <InfoRow label="Descripción">{category.descripcion}</InfoRow>
              <InfoRow label="Estado">
                <span
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-semibold ${
                    category.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {category.estado ? <FaToggleOn /> : <FaToggleOff />}
                  {category.estado ? 'Activo' : 'Inactivo'}
                </span>
              </InfoRow>
            </DetailCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCategoryDetailModal;
