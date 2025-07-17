// src/features/dashboard/pages/service_orders/ServiceOrdersPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import ServiceOrdersTable from './components/Service_ordersTable';
import SkeletonServiceOrderRow from './components/SkeletonRow';
import { mockServiceOrders } from './data/Service_orders_data'; // Mantén esta importación si es la que te funciona.
                                                              // Anteriormente usé initialMockServiceOrders,
                                                              // pero si 'mockServiceOrders' es lo que tienes, usa esa.
import Pagination from '../../../../../src/shared/components/Pagination';
import ServiceOrderDetailModal from './components/Service_ordersDetailModal';
import NewServiceOrderModal from './components/NewService_ordersModal';
import EditServiceOrderModal from './components/EditService_ordersModal';
import { Toaster } from 'react-hot-toast'; // Asegúrate de tener 'react-hot-toast' instalado si usas Toaster.

const ITEMS_PER_PAGE = 5;

const ServiceOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockServiceOrders);
      setLoading(false);
    }, 1500);
  }, []);

  const normalize = (text) =>
    (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredOrders = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);

    if (!normalizedSearch) return orders;

    return orders.filter((order) => {
      const searchFields = [
        order.orderId,
        order.quoteId,
        order.clientName,
        order.contact,
        order.projectName,
        order.status,
        order.requestDate
      ];

      return searchFields.some(field =>
        normalize(field).includes(normalizedSearch)
      );
    });
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handleEditOrder = (updatedOrder) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    setOrderToEdit(null);
  };

  // !!! MODIFICACIÓN CLAVE AQUÍ: AHORA RECIBE 'cancellationReason' Y LO GUARDA !!!
  const handleAnnulOrder = (orderId, cancellationReason) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              isActive: false, // Mantén 'isActive' o 'isActividad' según tu modelo de datos
              status: 'Anulada',
              cancellationReason: cancellationReason // <-- ¡Aquí se guarda la razón!
            }
          : order
      )
    );
    // Si la orden anulada es la que está abierta en el modal de detalles, ciérralo
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
    }
  };

  // --- FUNCIÓN PARA ASIGNAR COTIZACIÓN (sin cambios) ---
  const handleAssignQuote = (orderId, newQuoteId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, quoteId: newQuoteId } // Asigna el nuevo quoteId
          : order
      )
    );
  };

  return (
    <div className="p-4 md:p-8">
      {/* Sección de encabezado y búsqueda (sin cambios) */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Órdenes de Servicio</h1>
        <div className="flex gap-4 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              aria-label="Buscar orden de servicio"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
            aria-label="Crear nueva orden de servicio"
          >
            <FaPlus />
            Nueva orden
          </button>
        </div>
      </div>

      {/* Renderizado condicional: Esqueletos de carga o la tabla de órdenes */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número de Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número de Cotización</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Solicitud</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <SkeletonServiceOrderRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <ServiceOrdersTable
            orders={currentItems}
            onView={(order) => setSelectedOrder(order)}
            onEdit={(order) => setOrderToEdit(order)}
            onAnnul={handleAnnulOrder} // Asegúrate de que ServiceOrdersTable pasa la razón de anulación
            onAssignQuote={handleAssignQuote}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}

      {/* Modales */}
      <ServiceOrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      <NewServiceOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onSave={(newOrder) => setOrders((prev) => [newOrder, ...prev])}
      />
      <EditServiceOrderModal
        isOpen={!!orderToEdit}
        onClose={() => setOrderToEdit(null)}
        onSave={handleEditOrder}
        orderId={orderToEdit?.id}
      />
      {/* Toaster para notificaciones si lo usas */}
      <Toaster position="bottom-right" />
    </div>
  );
};

export default ServiceOrdersPage;