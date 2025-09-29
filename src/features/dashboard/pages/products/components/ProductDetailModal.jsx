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

const ProductDetailModal = ({ product, categories, onClose }) => {
  if (!product) return null;

  const getCategoryName = (id_categoria) => {
    if (!Array.isArray(categories)) return 'Desconocida';
    const cat = categories.find((c) => c.id_categoria === id_categoria);
    return cat ? cat.nombre : 'Desconocida';
  };

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
            <p className="text-md text-gray-600">ID: {product.id_producto}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scroll space-y-6">
          <DetailCard title="Información del producto" icon={<FaInfoCircle className="text-gray-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Modelo">{product.modelo}</InfoRow>
              <InfoRow label="Categoría">{getCategoryName(product.id_categoria)}</InfoRow>
              <InfoRow label="Unidad de medida">{product.unidad_medida}</InfoRow>
              <InfoRow label="Garantía">{product.garantia} meses</InfoRow>
              <InfoRow label="Código">{product.codigo_barra ? <span className="font-semibold text-gray-900">{product.codigo_barra}</span> : 'N/A'}</InfoRow>
              <InfoRow label="Precio">$COP {Number(product.precio).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</InfoRow>
              <InfoRow label="Stock">{product.stock}</InfoRow>
              <InfoRow label="Estado">
                <span
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-semibold ${product.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                >
                  {product.estado ? <FaToggleOn /> : <FaToggleOff />}
                  {product.estado ? 'Activo' : 'Inactivo'}
                </span>
              </InfoRow>
            </div>
          </DetailCard>
          <DetailCard title="Fichas técnicas" icon={<FaInfoCircle className="text-gray-500" />}>
            {Array.isArray(product.fichas_tecnicas) && product.fichas_tecnicas.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {product.fichas_tecnicas.map((spec, index) => (
                  <li key={index}>
                    <strong>ID característica {spec.id_caracteristica}:</strong> {spec.valor}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">Sin fichas técnicas registradas.</p>
            )}
          </DetailCard>
          <DetailCard title="Imágenes del producto" icon={<FaInfoCircle className="text-gray-500" />}>
            {Array.isArray(product.fotos) && product.fotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.fotos.map((foto, idx) => (
                  <img key={idx} src={foto} alt={`Imagen ${idx + 1}`} className="w-full h-48 object-cover rounded-lg transition-transform duration-200 hover:scale-105" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Sin imágenes disponibles.</p>
            )}
          </DetailCard>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;