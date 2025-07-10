import React from 'react';
import { FaEye, FaEdit, FaTimes, FaRegFileAlt } from 'react-icons/fa';

const ServiceOrdersTable = ({ orders, onView, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Orden</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Cotización</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Cliente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Proyecto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{order.orderId}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.quoteId ?? '-'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.clientName}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.contact}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.projectName}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'Completado'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'Pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'En proceso'
                      ? 'bg-blue-100 text-blue-800'
                      : order.status === 'Esperando repuestos'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  <button
                    title="Ver"
                    className="text-blue-600 hover:text-gray-900"
                    onClick={() => onView(order)}
                  >
                    <FaEye size={16} />
                  </button>
                  <button title="Crear Cotización" className="text-green-600 hover:text-green-800">
                    <FaRegFileAlt size={16} />
                  </button>
                  <button 
                    title="Editar Orden" 
                    className="text-yellow-600 hover:text-yellow-800"
                    onClick={() => onEdit(order)}
                  >
                    <FaEdit size={16} />
                  </button>
                  <button title="Anular" className="text-red-600 hover:text-red-800">
                    <FaTimes size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan="7" className="px-4 py-3 text-center text-gray-500">
                No hay órdenes para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceOrdersTable;