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

const QuoteDetailModal = ({ quote, onClose }) => {
  if (!quote) return null;

  const { clienteData, detalleOrden } = quote;

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
            <h2 className="text-3xl font-bold text-gray-800">Cotización #{quote.ordenServicio}</h2>
            <p className="text-md text-gray-600">ID: {quote.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scroll space-y-6">
          <DetailCard title="Información Principal" icon={<FaInfoCircle className="text-gray-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Nombre del cliente">{clienteData.nombre} {clienteData.apellido}</InfoRow>
              <InfoRow label="Documento">{clienteData.tipoDocumento}. {clienteData.documento}</InfoRow>
              <InfoRow label="Email">{clienteData.email}</InfoRow>
              <InfoRow label="Celular">{clienteData.celular}</InfoRow>
              <InfoRow label="Crédito">{clienteData.credito ? 'Sí' : 'No'}</InfoRow>
              <InfoRow label="Estado de la cotización">{quote.estado}</InfoRow>
            </div>
          </DetailCard>

          <DetailCard title="Servicios solicitados" icon={<FaInfoCircle className="text-gray-500" />}>
            {detalleOrden.servicios?.length > 0 ? (
              <ul className="space-y-3">
                {detalleOrden.servicios.map((serv, idx) => (
                  <li key={idx} className="p-4 bg-white border rounded-lg shadow-sm text-sm">
                    <p><strong>Servicio:</strong> {serv.servicio}</p>
                    <p><strong>Descripción:</strong> {serv.descripcion}</p>
                    <p><strong>Cantidad:</strong> {serv.cantidad}</p>
                    <p><strong>Precio Unitario:</strong> ${serv.precioUnitario.toLocaleString('es-CO')}</p>
                    <p><strong>Subtotal:</strong> ${(serv.cantidad * serv.precioUnitario).toLocaleString('es-CO')}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay servicios registrados.</p>
            )}
          </DetailCard>

          <DetailCard title="Productos incluidos" icon={<FaInfoCircle className="text-gray-500" />}>
            {detalleOrden.productos?.length > 0 ? (
              <ul className="space-y-3">
                {detalleOrden.productos.map((prod, idx) => (
                  <li key={idx} className="p-4 bg-white border rounded-lg shadow-sm text-sm">
                    <p><strong>Producto:</strong> {prod.nombre}</p>
                    <p><strong>Descripción:</strong> {prod.descripcion}</p>
                    <p><strong>Cantidad:</strong> {prod.cantidad}</p>
                    <p><strong>Precio Unitario:</strong> ${prod.precioUnitario.toLocaleString('es-CO')}</p>
                    <p><strong>Subtotal:</strong> ${(prod.cantidad * prod.precioUnitario).toLocaleString('es-CO')}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay productos en esta cotización.</p>
            )}
          </DetailCard>

          <DetailCard title="Totales" icon={<FaInfoCircle className="text-gray-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Subtotal productos">${detalleOrden.subtotalProductos.toLocaleString('es-CO')}</InfoRow>
              <InfoRow label="Subtotal servicios">${detalleOrden.subtotalServicios.toLocaleString('es-CO')}</InfoRow>
              <InfoRow label="IVA">${detalleOrden.iva.toLocaleString('es-CO')}</InfoRow>
              <InfoRow label="Total">${detalleOrden.total.toLocaleString('es-CO')}</InfoRow>
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailModal;
