// src/features/dashboard/pages/service_orders/components/ServiceOrderDetailModal.jsx

import React from 'react';
import {
  FaTimes,
  FaInfoCircle,
  FaTools,
  FaBoxes,
  FaMoneyBillWave,
  FaStickyNote,
  FaBan // Icono para la razón de anulación
} from 'react-icons/fa';

import { mockProductos, mockServicios } from '../data/Service_orders_data';

// Componente auxiliar para estilizar las secciones de detalle
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

// Componente auxiliar para estilizar filas de información clave/valor
const InfoRow = ({ label, children }) => (
  <div className="text-base text-gray-700">
    <span className="text-gray-500 font-medium">{label}:</span>
    <p className="font-semibold text-gray-900 mt-1">{children}</p>
  </div>
);

const ServiceOrderDetailModal = ({ order, onClose }) => {
  // Si no hay una orden, no renderiza el modal
  if (!order) return null;

  const getProductName = (productId) => {
    const product = mockProductos.find(p => p.id === productId);
    return product ? product.nombre : 'Producto no encontrado';
  };

  const getProductPrice = (productId) => {
    const product = mockProductos.find(p => p.id === productId);
    return product ? product.precio : 0;
  };

  const getServiceName = (serviceId) => {
    const service = mockServicios.find(s => s.id === serviceId);
    return service ? service.nombre : 'Servicio no encontrado';
  };

  const getServicePrice = (serviceId) => {
    const service = mockServicios.find(s => s.id === serviceId);
    return service ? service.precio : 0;
  };

  const calculateSubtotals = () => {
    const subtotalProducts = order.products?.reduce((sum, product) => {
      const price = parseFloat(getProductPrice(product.productId)) || 0;
      const quantity = parseInt(product.quantity) || 0;
      return sum + (price * quantity);
    }, 0) || 0;

    const subtotalServices = order.services?.reduce((sum, service) => {
      const price = parseFloat(getServicePrice(service.serviceId)) || 0;
      const quantity = parseInt(service.quantity) || 0;
      return sum + (price * quantity);
    }, 0) || 0;

    const iva = subtotalProducts * 0.19;
    const total = subtotalProducts + subtotalServices + iva;

    return {
      subtotalProducts,
      subtotalServices,
      iva,
      total
    };
  };

  const financialData = calculateSubtotals();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-16 md:pt-24"
      // Note: Removed onClick={onClose} here to prevent closing on overlay click.
      // If you want it to close on overlay click, add onClick={onClose} back to this div.
    >
      <div
        className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal from closing it
      >
        <header className="flex justify-between items-center p-4 sm:p-6 border-b bg-white rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Orden de Servicio #{order.orderId}</h2>
            <p className="text-md text-gray-600">{order.projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-6">

          <DetailCard
            title="Información Básica"
            icon={<FaInfoCircle className="text-gray-500" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Cliente">{order.clientName || 'No especificado'}</InfoRow>
              <InfoRow label="Contacto">{order.contact || 'No especificado'}</InfoRow>
              <InfoRow label="Fecha de Solicitud">{order.requestDate || 'No especificada'}</InfoRow>
              <InfoRow label="Estado">
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  order.status === 'Completado' ? 'bg-green-100 text-green-800' :
                  order.status === 'En proceso' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'Anulada' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status || 'Pendiente'}
                </span>
              </InfoRow>
              <InfoRow label="Proyecto">{order.projectName || 'No especificado'}</InfoRow>
              <InfoRow label="ID Cotización">{order.quoteId || 'No aplica'}</InfoRow>
            </div>
          </DetailCard>

          <DetailCard
            title="Servicios"
            icon={<FaTools className="text-gray-500" />}
          >
            {order.services?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unitario</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.services.map((service, index) => {
                      const serviceName = getServiceName(service.serviceId);
                      const servicePrice = getServicePrice(service.serviceId);
                      const subtotal = servicePrice * service.quantity;

                      return (
                        <tr key={`service-${service.serviceId}-${index}`}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{serviceName}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{service.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${servicePrice.toLocaleString('es-CO')}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${subtotal.toLocaleString('es-CO')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay servicios registrados</p>
            )}
          </DetailCard>

          <DetailCard
            title="Productos"
            icon={<FaBoxes className="text-gray-500" />}
          >
            {order.products?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unitario</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.products.map((product, index) => {
                      const productName = getProductName(product.productId);
                      const productPrice = getProductPrice(product.productId);
                      const subtotal = productPrice * product.quantity;

                      return (
                        <tr key={`product-${product.productId}-${index}`}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{productName}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${productPrice.toLocaleString('es-CO')}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${subtotal.toLocaleString('es-CO')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay productos registrados</p>
            )}
          </DetailCard>

          <DetailCard
            title="Resumen Financiero"
            icon={<FaMoneyBillWave className="text-gray-500" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Subtotales</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Productos:</span>
                    <span>${financialData.subtotalProducts.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Servicios:</span>
                    <span>${financialData.subtotalServices.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="border-t pt-2 font-medium flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(financialData.subtotalProducts + financialData.subtotalServices).toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Totales</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>IVA (19% sobre productos):</span>
                    <span>${financialData.iva.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="border-t pt-2 font-medium flex justify-between">
                    <span>Total General:</span>
                    <span>${financialData.total.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>
            </div>
          </DetailCard>

          {/* This section will display "Observaciones" if order.observations is not empty. */}
          {/* It shows regardless of the order's status. */}
          {order.observations && order.observations.trim() !== '' && (
            <DetailCard
              title="Observaciones"
              icon={<FaStickyNote className="text-gray-500" />}
            >
              <p className="text-gray-800 whitespace-pre-line">{order.observations}</p>
            </DetailCard>
          )}

          {/* This section will display "Razón de Anulación" ONLY if the order status is 'Anulada' */}
          {/* AND order.cancellationReason is not empty. */}
          {order.status === 'Anulada' && order.cancellationReason && order.cancellationReason.trim() !== '' && (
            <DetailCard
              title="Razón de Anulación"
              icon={<FaBan className="text-red-500" />}
            >
              <p className="text-red-800 whitespace-pre-line font-medium">{order.cancellationReason}</p>
            </DetailCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderDetailModal;