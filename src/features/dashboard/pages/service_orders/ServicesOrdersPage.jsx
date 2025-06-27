// src/features/dashboard/pages/service_orders/ServiceOrdersPage.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import ServiceOrdersTable from './components/Service_ordersTable';
import SkeletonServiceOrderRow from './components/SkeletonRow';
import { mockServiceOrders } from './data/Service_orders_data';

const ServiceOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockServiceOrders);
      setLoading(false);
    }, 1500); // Simula un fetch
  }, []);

  return (
    <div className="p-4 md:p-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Órdenes de Servicio</h1>
        <button className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all">
          <FaPlus />
          Crear Orden
        </button>
      </div>

      {/* Tabla o Skeleton */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(4)].map((_, index) => (
                <SkeletonServiceOrderRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ServiceOrdersTable orders={orders} />
      )}
    </div>
  );
};

export default ServiceOrdersPage;
