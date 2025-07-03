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

const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

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
            <h2 className="text-3xl font-bold text-gray-800">{product.nombre}</h2>
            <p className="text-md text-gray-600">ID: {product.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-6">
          <DetailCard title="Información del producto" icon={<FaInfoCircle className="text-gray-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Modelo">{product.modelo}</InfoRow>
              <InfoRow label="Categoría">{product.categoria}</InfoRow>
              <InfoRow label="Unidad de medida">{product.unidad}</InfoRow>
              <InfoRow label="Garantía">{product.garantia} meses</InfoRow>
              <InfoRow label="Código">{product.codigo}</InfoRow>
              <InfoRow label="Precio">$COP {product.precio.toFixed(2)}</InfoRow>
              <InfoRow label="Stock">{product.stock}</InfoRow>
              <InfoRow label="Estado">
                <span
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-semibold ${
                    product.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.estado ? <FaToggleOn /> : <FaToggleOff />}
                  {product.estado ? 'Activo' : 'Inactivo'}
                </span>
              </InfoRow>
            </div>
          </DetailCard>

          <DetailCard title="Especificaciones técnicas" icon={<FaInfoCircle className="text-gray-500" />}>
            {Array.isArray(product.especificaciones_tecnicas) && product.especificaciones_tecnicas.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {product.especificaciones_tecnicas.map((spec, index) => (
                  <li key={index}>
                    <strong>{spec.concepto}:</strong> {spec.valor}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">Sin especificaciones técnicas registradas.</p>
            )}
          </DetailCard>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
