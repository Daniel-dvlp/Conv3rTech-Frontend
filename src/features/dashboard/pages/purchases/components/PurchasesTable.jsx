import React from 'react';
import { FaEye, FaMinusCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { usePermissions } from '../../../../../shared/hooks/usePermissions';

const STATUS_BADGES = {
  Activa: 'bg-green-100 text-green-800',
  Anulada: 'bg-red-100 text-red-800',
  Completada: 'bg-blue-100 text-blue-800'
};

const PurchasesTable = ({ compras, onView, onAnnul }) => {
  const { canDelete } = usePermissions();
  const manejarAnularClick = async (compra) => {
    // Primer modal: Confirmación de anulación
    const confirmResult = await Swal.fire({
      title: '¿Estás seguro de anular esta compra?',
      text: `La compra con número ${compra.numeroRecibo} será marcada como anulada y no podrá ser reactivada.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    });

    if (confirmResult.isConfirmed) {
      // Si confirma la anulación, pedir la razón en un segundo modal
      const { value: motivoAnulacion } = await Swal.fire({
        title: 'Motivo de la Anulación',
        input: 'textarea', // Tipo de entrada como área de texto
        inputPlaceholder: 'Ingresa el motivo de la anulación (ej. error de registro, devolución completa, etc.)', // Placeholder para el textarea
        inputAttributes: {
          'aria-label': 'Ingresa el motivo de la anulación'
        },
        inputValidator: (value) => { // Validador para asegurar que no esté vacío
          if (!value || value.trim() === '') {
            return '¡Necesitas escribir un motivo para la anulación!';
          }
          return null; // No hay error si hay valor
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar Anulación',
        cancelButtonText: 'Cancelar',
      });

      if (motivoAnulacion) { // Si el usuario proporcionó un motivo y no canceló este segundo modal
        try {
          if (onAnnul) {
            await onAnnul(compra.id, motivoAnulacion); // El hook gestionará el toast de éxito
          }
        } catch (err) {
          toast.error('Error al cambiar estado de la compra');
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número de Recibo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIT</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Total</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Registro</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {compras.map((compra) => (
            <tr key={compra.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{compra.numeroRecibo}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{compra.proveedor}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{compra.nit}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${(compra.total || 0).toLocaleString('es-CO')}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{compra.fechaRegistro}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    STATUS_BADGES[compra.estado] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {compra.estado}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  <button
                    title="Ver Detalles"
                    className="text-blue-600 hover:text-gray-900"
                    onClick={() => onView(compra)}
                  >
                    <FaEye size={16} />
                  </button>
                  {/* Solo muestra el botón de anular si la compra está Activa */}
                  {compra.estado === 'Activa' && canDelete('compras') && (
                    <button
                      title="Anular Compra"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => manejarAnularClick(compra)}
                    >
                      <FaMinusCircle size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {compras.length === 0 && (
            <tr>
              <td colSpan="7" className="px-4 py-3 text-center text-gray-500">
                No se encontraron compras.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PurchasesTable;