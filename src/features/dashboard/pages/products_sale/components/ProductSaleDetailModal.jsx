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

  // Calcular totales desde los detalles de la venta
  const subtotal = productSale.subtotal_venta ?? 0;
  const iva = productSale.monto_iva ?? 0;
  const monto = productSale.monto_venta ?? 0;  

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-16 md:pt-24"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 sm:p-6 border-b bg-white rounded-t-xl">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Venta #{productSale.numero_venta}</h2>
            <p className="text-md text-gray-600">ID: {productSale.id_venta}</p>
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
              <InfoRow label="Cliente">{productSale.cliente?.nombre} {productSale.cliente?.apellido}</InfoRow>
              <InfoRow label="Documento">{productSale.cliente?.documento}</InfoRow>
              <InfoRow label="Fecha y Hora">{new Date(productSale.fecha_venta).toLocaleString()}</InfoRow>
              <InfoRow label="Método de Pago">{productSale.metodo_pago}</InfoRow>
              <InfoRow label="Estado">{productSale.estado}</InfoRow>
            </div>
          </DetailCard>

          <DetailCard title="Productos vendidos" icon={<FaInfoCircle className="text-gray-500" />}>
            {Array.isArray(productSale.detalles) && productSale.detalles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center border border-gray-200">
                  <thead className="bg-conv3r-dark text-white">
                    <tr>
                      <th className="p-3 font-semibold">Producto</th>
                      <th className="font-semibold">Modelo</th>
                      <th className="font-semibold">Unidad</th>
                      <th className="font-semibold">Cantidad</th>
                      <th className="font-semibold">Precio Unit.</th>
                      <th className="font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-gray-700">
                    {productSale.detalles.map((detalle, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="p-3">{detalle.producto?.nombre}</td>
                        <td className="p-3">{detalle.producto?.modelo}</td>
                        <td className="p-3">{detalle.producto?.unidad_medida}</td>
                        <td className="p-3">{detalle.cantidad}</td>
                        <td className="p-3">${detalle.precio_unitario.toLocaleString('es-CO')}</td>
                        <td className="p-3">${detalle.subtotal_producto.toLocaleString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t text-sm text-gray-700">
                    <tr>
                      <td colSpan="5" className="text-right font-semibold px-4 py-2">Subtotal:</td>
                      <td className="font-bold px-4 py-2 text-conv3r-dark">
                        ${subtotal.toLocaleString('es-CO')}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="text-right font-semibold px-4 py-2">IVA (19%):</td>
                      <td className="font-bold px-4 py-2 text-conv3r-dark">
                        ${iva.toLocaleString('es-CO')}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="text-right font-semibold px-4 py-2">Total:</td>
                      <td className="font-bold text-conv3r-gold text-lg px-4 py-2">
                        ${monto.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
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