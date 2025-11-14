  import React, { useEffect, useMemo, useState } from 'react';
  import { FaTimes, FaInfoCircle } from 'react-icons/fa';
  import { quotesService } from '../services/quotesService';
  import productsService from '../../../../../services/productsService';
  import servicesService from '../../../../../services/servicesService';

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

    const [details, setDetails] = useState([]);
    const [productNames, setProductNames] = useState({});
    const [serviceNames, setServiceNames] = useState({});

    // Compatibilidad con mocks y backend
    const clienteObj = quote.clienteData ?? quote.cliente ?? quote.cliente_nombre;
    const clienteNombre = useMemo(() => {
      if (typeof clienteObj === 'string') return clienteObj;
      if (clienteObj && typeof clienteObj === 'object') {
        const nombre = clienteObj.nombre || '';
        const apellido = clienteObj.apellido || '';
        return `${nombre} ${apellido}`.trim();
      }
      return '';
    }, [clienteObj]);

    const detalleOrden = quote.detalleOrden;

    useEffect(() => {
      // Si no hay detalleOrden (mocks), intentar cargar detalles del backend
      if (!detalleOrden && (quote.id_cotizacion || quote.id)) {
        const id = quote.id_cotizacion ?? quote.id;
        quotesService.getQuoteDetails(id)
          .then((res) => {
            const dets = Array.isArray(res) ? res : res?.data ?? [];
            setDetails(dets);

            // Fetch names for products
            const productIds = dets.filter(d => d.id_producto).map(d => d.id_producto);
            if (productIds.length > 0) {
              Promise.all(productIds.map(pid => productsService.getProductById(pid)))
                .then(products => {
                  const names = {};
                  products.forEach(p => {
                    const prodData = p.data || p;
                    const productId = prodData.id || prodData.id_producto;
                    const productName = prodData.nombre;
                    if (productId && productName) {
                      names[productId] = productName;
                    }
                  });
                  setProductNames(names);
                })
                .catch((error) => {
                  console.error('Error fetching product names:', error);
                });
            }

            // Fetch names for services
            const serviceIds = dets.filter(d => d.id_servicio).map(d => d.id_servicio);
            if (serviceIds.length > 0) {
              Promise.all(serviceIds.map(sid => servicesService.getServiceById(sid)))
                .then(services => {
                  const names = {};
                  services.forEach(s => {
                    const servData = s.data || s;
                    const serviceId = servData.id || servData.id_servicio;
                    const serviceName = servData.nombre;
                    if (serviceId && serviceName) {
                      names[serviceId] = serviceName;
                    }
                  });
                  setServiceNames(names);
                })
                .catch((error) => {
                  console.error('Error fetching service names:', error);
                });
            }
          })
          .catch(() => setDetails([]));
      }
    }, [detalleOrden, quote]);

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
              <h2 className="text-3xl font-bold text-gray-800">Cotización - {quote.nombre_cotizacion}</h2>
              <p className="text-md text-gray-600">ID: {quote.id_cotizacion}</p>
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
                <InfoRow label="Nombre del cliente">{clienteNombre}</InfoRow>
                {clienteObj?.documento && (
                  <InfoRow label="Documento">{clienteObj.tipoDocumento || clienteObj.tipo_documento}. {clienteObj.documento}</InfoRow>
                )}
                {clienteObj?.email || clienteObj?.correo ? (
                  <InfoRow label="Email">{clienteObj.email || clienteObj.correo}</InfoRow>
                ) : null}
                {clienteObj?.celular || clienteObj?.telefono ? (
                  <InfoRow label="Celular">{clienteObj.celular || clienteObj.telefono}</InfoRow>
                ) : null}
                {typeof clienteObj?.credito !== 'undefined' ? (
                  <InfoRow label="Crédito">{clienteObj.credito ? 'Sí' : 'No'}</InfoRow>
                ) : null}
                <InfoRow label="Estado de la cotización">{quote.estado}</InfoRow>
              </div>
            </DetailCard>

            <DetailCard title="Productos incluidos">
              {detalleOrden?.productos?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-center border border-gray-200">
                    <thead className="bg-conv3r-dark text-white">
                      <tr>
                        <th className="p-3 font-semibold">Producto</th>
                        <th className="font-semibold">Cantidad</th>
                        <th className="font-semibold">Precio Unit.</th>
                        <th className="font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-gray-700">
                      {detalleOrden.productos.map((prod, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="p-2">{prod.nombre}</td>
                          <td>{prod.cantidad}</td>
                          <td>${prod.precioUnitario.toLocaleString('es-CO')}</td>
                          <td>${(prod.precioUnitario * prod.cantidad).toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t text-sm text-gray-700">
                      <tr>
                        <td colSpan="3" className="text-right font-semibold px-4 py-2">Subtotal productos:</td>
                        <td className="font-bold px-4 py-2 text-conv3r-dark">
                          ${detalleOrden.subtotalProductos.toLocaleString('es-CO')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : details?.some(d => d.id_producto) ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-center border border-gray-200">
                    <thead className="bg-conv3r-dark text-white">
                      <tr>
                        <th className="p-3 font-semibold">Producto</th>
                        <th className="font-semibold">Cantidad</th>
                        <th className="font-semibold">Precio Unit.</th>
                        <th className="font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-gray-700">
                      {details.filter(d => d.id_producto).map((p, idx) => (
                        <tr key={`p-${idx}`} className="border-t border-gray-200">
                          <td className="p-2">{productNames[p.id_producto] || p.nombre || `Producto ${p.id_producto}`}</td>
                          <td>{p.cantidad}</td>
                          <td>${Number(p.precio_unitario || 0).toLocaleString('es-CO')}</td>
                          <td>${Number(p.subtotal || (p.precio_unitario * p.cantidad) || 0).toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay productos en esta cotización.</p>
              )}
            </DetailCard>

            <DetailCard title="Servicios incluidos">
              {detalleOrden?.servicios?.length > 0 ? (
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
              ) : details?.some(d => d.id_servicio) ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-center border border-gray-200">
                    <thead className="bg-conv3r-dark text-white">
                      <tr>
                        <th className="p-3 font-semibold">Servicio</th>
                        <th className="font-semibold">Cantidad</th>
                        <th className="font-semibold">Precio Unit.</th>
                        <th className="font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-gray-700">
                      {details.filter(d => d.id_servicio).map((s, idx) => (
                        <tr key={`s-${idx}`} className="border-t border-gray-200">
                          <td className="p-2">{serviceNames[s.id_servicio] || s.nombre || `Servicio ${s.id_servicio}`}</td>
                          <td>{s.cantidad}</td>
                          <td>${Number(s.precio_unitario || 0).toLocaleString('es-CO')}</td>
                          <td>${Number(s.subtotal || (s.precio_unitario * s.cantidad) || 0).toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay servicios registrados.</p>
              )}
            </DetailCard>


            <DetailCard title="Totales">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Subtotal productos">
                  <span className="text-conv3r-dark font-semibold">
                    ${Number(detalleOrden?.subtotalProductos ?? quote.subtotal_productos ?? 0).toLocaleString('es-CO')}
                  </span>
                </InfoRow>
                <InfoRow label="Subtotal servicios">
                  <span className="text-conv3r-dark font-semibold">
                    ${Number(detalleOrden?.subtotalServicios ?? quote.subtotal_servicios ?? 0).toLocaleString('es-CO')}
                  </span>
                </InfoRow>
                <InfoRow label="IVA">
                  <span className="text-conv3r-dark font-semibold">
                    ${Number(detalleOrden?.iva ?? quote.monto_iva ?? 0).toLocaleString('es-CO')}
                  </span>
                </InfoRow>
                <InfoRow label="Total">
                  <span className="text-conv3r-gold font-bold text-lg">
                    ${Number(detalleOrden?.total ?? quote.monto_cotizacion ?? 0).toLocaleString('es-CO')}
                  </span>
                </InfoRow>
              </div>
            </DetailCard>

            {quote.observaciones && (
              <DetailCard title="Observaciones" icon={<FaInfoCircle className="text-gray-500" />}>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.observaciones}</p>
                </div>
              </DetailCard>
            )}

            {quote.motivo_anulacion && (
              <DetailCard title="Motivo de Anulación" icon={<FaInfoCircle className="text-red-500" />}>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700 whitespace-pre-wrap">{quote.motivo_anulacion}</p>
                </div>
              </DetailCard>
            )}

          </div>
        </div>
      </div>
    );
  };

  export default QuoteDetailModal;
