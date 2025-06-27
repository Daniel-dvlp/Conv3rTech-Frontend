// src/features/dashboard/pages/service_orders/components/ServiceOrdersTable.jsx

import React from 'react';
import { FaEye, FaEdit, FaTimes, FaRegFileAlt } from 'react-icons/fa'; // ✅ FaRegFileAlt reemplaza a clipboard, FaTimes reemplaza a Trash

const ServiceOrdersTable = ({ orders }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Orden</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Cotización</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Solicitud</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderId}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quoteId}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.clientName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.contact}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.requestDate}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3 text-gray-600">
                  <button title="Ver" className="hover:text-blue-600">
                    <FaEye size={16} />
                  </button>
                  <button title="Crear Cotización" className="hover:text-yellow-600">
                    <FaRegFileAlt size={16} />
                  </button>
                  <button title="Editar Orden" className="hover:text-green-600">
                    <FaEdit size={16} />
                  </button>
                  <button title="Anular" className="hover:text-red-600">
                    <FaTimes size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceOrdersTable;
