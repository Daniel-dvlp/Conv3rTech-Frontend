import React from 'react';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';

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

const ProductSaleDetailModal = ({ productSale, onClose }) => {
  if (!productSale) return null;

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
            <h2 className="text-3xl font-bold text-gray-800">Venta #{productSale.numero}</h2>
            <p className="text-md text-gray-600">ID: {productSale.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scroll space-y-6">
          <DetailCard title="Información general" icon={<FaInfoCircle className="text-gray-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Cliente">{productSale.cliente}</InfoRow>
              <InfoRow label="Documento">{productSale.clienteData.documento}</InfoRow>
              <InfoRow label="Fecha y Hora">{productSale.fechaHora}</InfoRow>
              <InfoRow label="Monto Total">
                ${productSale.monto.toLocaleString('es-CO')}
              </InfoRow>
              <InfoRow label="Método de Pago">{productSale.metodoPago}</InfoRow>
              <InfoRow label="Estado">{productSale.estado}</InfoRow>
            </div>
          </DetailCard>

          <DetailCard title="Productos vendidos" icon={<FaInfoCircle className="text-gray-500" />}>
            {Array.isArray(productSale.productos) && productSale.productos.length > 0 ? (
              <ul className="space-y-3">
                {productSale.productos.map((prod, idx) => (
                  <li
                    key={idx}
                    className="p-4 bg-white border rounded-lg shadow-sm text-sm"
                  >
                    <p>
                      <strong>Producto:</strong> {prod.nombre}
                    </p>
                    <p>
                      <strong>Modelo:</strong> {prod.modelo}
                    </p>
                    <p>
                      <strong>Cantidad:</strong> {prod.cantidad}
                    </p>
                    <p>
                      <strong>Unidad:</strong> {prod.unidad}
                    </p>
                    <p>
                      <strong>Precio Unitario:</strong> ${prod.precio.toLocaleString('es-CO')}
                    </p>
                    <p>
                      <strong>Subtotal:</strong> ${prod.subtotal.toLocaleString('es-CO')}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay productos en esta venta.</p>
            )}
          </DetailCard>
        </div>
      </div>
    </div>
  );
};

export default ProductSaleDetailModal;
