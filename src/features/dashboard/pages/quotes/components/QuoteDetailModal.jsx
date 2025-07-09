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

          <DetailCard title="Servicios incluidos">
            {detalleOrden.servicios?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center border border-gray-200">
                  <thead className="bg-conv3r-dark text-white">
                    <tr>
                      <th className="p-3 font-semibold">Servicio</th>
                      <th className="font-semibold">Descripción</th>
                      <th className="font-semibold">Cantidad</th>
                      <th className="font-semibold">Precio Unit.</th>
                      <th className="font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-gray-700">
                    {detalleOrden.servicios.map((serv, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="p-2">{serv.servicio}</td>
                        <td>{serv.descripcion}</td>
                        <td>{serv.cantidad}</td>
                        <td>${serv.precioUnitario.toLocaleString('es-CO')}</td>
                        <td>${(serv.precioUnitario * serv.cantidad).toLocaleString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t text-sm text-gray-700">
                    <tr>
                      <td colSpan="4" className="text-right font-semibold px-4 py-2">Subtotal servicios:</td>
                      <td className="font-bold px-4 py-2 text-conv3r-dark">
                        ${detalleOrden.subtotalServicios.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay servicios registrados.</p>
            )}
          </DetailCard>


          <DetailCard title="Productos incluidos">
            {detalleOrden.productos?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center border border-gray-200">
                  <thead className="bg-conv3r-dark text-white">
                    <tr>
                      <th className="p-3 font-semibold">Producto</th>
                      <th className="font-semibold">Descripción</th>
                      <th className="font-semibold">Cantidad</th>
                      <th className="font-semibold">Precio Unit.</th>
                      <th className="font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-gray-700">
                    {detalleOrden.productos.map((prod, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="p-2">{prod.nombre}</td>
                        <td>{prod.descripcion}</td>
                        <td>{prod.cantidad}</td>
                        <td>${prod.precioUnitario.toLocaleString('es-CO')}</td>
                        <td>${(prod.precioUnitario * prod.cantidad).toLocaleString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t text-sm text-gray-700">
                    <tr>
                      <td colSpan="4" className="text-right font-semibold px-4 py-2">Subtotal productos:</td>
                      <td className="font-bold px-4 py-2 text-conv3r-dark">
                        ${detalleOrden.subtotalProductos.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay productos en esta cotización.</p>
            )}
          </DetailCard>


          <DetailCard title="Totales">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Subtotal productos">
                <span className="text-conv3r-dark font-semibold">
                  ${detalleOrden.subtotalProductos.toLocaleString('es-CO')}
                </span>
              </InfoRow>
              <InfoRow label="Subtotal servicios">
                <span className="text-conv3r-dark font-semibold">
                  ${detalleOrden.subtotalServicios.toLocaleString('es-CO')}
                </span>
              </InfoRow>
              <InfoRow label="IVA">
                <span className="text-conv3r-dark font-semibold">
                  ${detalleOrden.iva.toLocaleString('es-CO')}
                </span>
              </InfoRow>
              <InfoRow label="Total">
                <span className="text-conv3r-gold font-bold text-lg">
                  ${detalleOrden.total.toLocaleString('es-CO')}
                </span>
              </InfoRow>
            </div>
          </DetailCard>

        </div>
      </div>
    </div>
  );
};

export default QuoteDetailModal;
