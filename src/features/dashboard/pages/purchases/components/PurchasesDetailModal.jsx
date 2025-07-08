import React from 'react';
import {
  FaTimes,
  FaCalendar,
  FaUser,
  FaBuilding,
  FaClipboard,
  FaMoneyBillWave,
  FaStickyNote,
  FaClock,
} from 'react-icons/fa';

const InfoRow = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 text-sm">
    <div className="text-gray-400 mt-0.5">{icon}</div>
    <div className="flex-1">
      <span className="text-gray-500">{label}:</span>
      <p className="font-semibold text-gray-900">{children}</p>
    </div>
  </div>
);

const PurchaseDetailModal = ({ purchase, onClose }) => {
  if (!purchase) return null;

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
            <h2 className="text-2xl font-bold text-gray-900">Compra #{String(purchase.id).padStart(3, '0')}</h2>
            <p className="text-md text-gray-600">Proveedor: {purchase.supplier}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-6">

          {/* Información de la Compra + datos de creación */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaClipboard className="text-gray-500" />
              <span>Información de la Compra</span>
            </h3>
            <div className="space-y-4">
              <InfoRow icon={<FaClipboard />} label="Número de Recibo">{purchase.receiptNumber}</InfoRow>
              <InfoRow icon={<FaBuilding />} label="Proveedor">{purchase.supplier}</InfoRow>
              <InfoRow icon={<FaCalendar />} label="Fecha de Registro">{purchase.registrationDate}</InfoRow>
              <InfoRow icon={<FaUser />} label="Creado por">{purchase.createdBy}</InfoRow>
              <InfoRow icon={<FaClock />} label="Creado en">{new Date(purchase.createdAt).toLocaleString()}</InfoRow>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaClipboard className="text-gray-500" />
              <span>Productos</span>
            </h3>
            {purchase.products?.length > 0 ? (
              <table className="w-full text-sm text-left border">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 border">Producto</th>
                    <th className="px-3 py-2 border">Cantidad</th>
                    <th className="px-3 py-2 border">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.products.map((product, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2 border">{product.product}</td>
                      <td className="px-3 py-2 border">{product.quantity}</td>
                      <td className="px-3 py-2 border">
                        ${parseFloat(product.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600 italic">No hay productos registrados.</p>
            )}
          </div>

          {/* Totales */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaMoneyBillWave className="text-gray-500" />
              <span>Totales</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoRow icon={<></>} label="Subtotal">${purchase.subtotal?.toLocaleString() || '0'}</InfoRow>
              <InfoRow icon={<></>} label="IVA">${purchase.iva?.toLocaleString() || '0'}</InfoRow>
              <InfoRow icon={<></>} label="Total">${purchase.total?.toLocaleString() || '0'}</InfoRow>
            </div>
          </div>

          {/* Observaciones */}
          {purchase.observations && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                <FaStickyNote className="text-gray-500" />
                <span>Observaciones</span>
              </h3>
              <p className="text-gray-800">{purchase.observations}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailModal;
