// src/features/dashboard/pages/service_orders/components/ServiceOrdersTable.jsx

import React from 'react';
import { FaEye, FaEdit, FaMinusCircle, FaRegFileAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const ServiceOrdersTable = ({ orders, onView, onEdit, onAnnul, onAssignQuote }) => {
  const handleAnnulClick = async (order) => {
    // Primer modal: Confirmación de anulación
    const confirmResult = await Swal.fire({
      title: '¿Estás seguro de anular esta orden?',
      text: `La orden con ID ${order.orderId} será marcada como inactiva. ¡Esta acción no se puede deshacer fácilmente!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    });

    if (confirmResult.isConfirmed) {
      // Segundo modal: Solicitar el motivo de la anulación
      const { value: cancellationReason } = await Swal.fire({
        title: 'Motivo de la Anulación',
        input: 'textarea', // Tipo de entrada como área de texto
        inputPlaceholder: 'Escribe aquí el motivo de la anulación...', // Placeholder para el textarea
        inputAttributes: {
          'aria-label': 'Escribe aquí el motivo de la anulación'
        },
        inputValidator: (value) => { // Validador para asegurar que no esté vacío
          if (!value || value.trim() === '') {
            return '¡Necesitas escribir un motivo para anular!';
          }
          return null; // No hay error si hay valor
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar Anulación',
        cancelButtonText: 'Cancelar',
      });

      if (cancellationReason) { // Si el usuario proporcionó un motivo y no canceló este segundo modal
        toast.success(`La orden ${order.orderId} ha sido anulada. Motivo: "${cancellationReason}"`);
        if (onAnnul) {
          onAnnul(order.id, cancellationReason); // Pasa el ID de la orden y la razón de anulación
        }
      } else {
        // Si el usuario canceló el segundo modal o no proporcionó un motivo
        toast('Anulación cancelada o motivo no proporcionado.', { icon: 'ℹ️' });
      }
    } else {
      // Si el usuario canceló el primer modal
      toast('Anulación cancelada.', { icon: 'ℹ️' });
    }
  };

  const handleCreateQuoteClick = (order) => {
    if (order.quoteId) {
      Swal.fire({
        title: 'Cotización ya asignada',
        text: `La orden ${order.orderId} ya tiene la cotización asignada: ${order.quoteId}.`,
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
    } else {
      const newQuoteId = `COT-${Math.floor(Math.random() * 10000) + 1}`;
      toast.success(`Cotización ${newQuoteId} creada y asignada a la orden ${order.orderId}.`);
      if (onAssignQuote) {
        onAssignQuote(order.id, newQuoteId);
      }
    }
  };

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
                      : order.status === 'Anulada'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  {/* BOTÓN DE COTIZACIÓN */}
                  {!order.quoteId && order.status !== 'Anulada' && (
                    <button
                      title="Crear Cotización"
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleCreateQuoteClick(order)}
                    >
                      <FaRegFileAlt size={16} />
                    </button>
                  )}
                  {/* Importante: Pasar el objeto 'order' completo para que el modal de detalle tenga toda la información */}
                  <button
                    title="Ver"
                    className="text-blue-600 hover:text-gray-900"
                    onClick={() => onView(order)}
                  >
                    <FaEye size={16} />
                  </button>
              
                  {order.status !== 'Anulada' && (
                    <button
                      title="Editar Orden"
                      className="text-yellow-600 hover:text-yellow-800"
                      onClick={() => onEdit(order)}
                    >
                      <FaEdit size={16} />
                    </button>
                  )}
                  {/* El botón de anular solo se muestra si la orden NO está anulada */}
                  {order.status !== 'Anulada' && (
                    <button
                      title="Anular"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleAnnulClick(order)}
                    >
                      <FaMinusCircle size={16} />
                    </button>
                  )}
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