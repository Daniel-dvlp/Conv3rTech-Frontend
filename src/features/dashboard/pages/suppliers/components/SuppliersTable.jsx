// src/features/dashboard/pages/suppliers/components/SuppliersTable.jsx

import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2'; // <--- Importa SweetAlert2
import toast from 'react-hot-toast'; // Ya lo tienes, es bueno para las notificaciones finales

const SuppliersTable = ({ suppliers, onEdit, onDelete }) => {

  const getStatusClass = (status) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Inactivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // NUEVA FUNCIÓN PARA ELIMINAR CON SweetAlert2
  const handleDeleteClick = async (supplier) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¡Estás a punto de eliminar al proveedor "${supplier.empresa}" (NIT: ${supplier.nit})! Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Rojo para confirmar eliminación
      cancelButtonColor: '#6c757d', // Gris para cancelar
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      // Si el usuario confirma, procede con la eliminación
      onDelete(supplier.id); // Llama a la función onDelete pasada por props
      toast.success(`Proveedor "${supplier.empresa}" eliminado correctamente.`);
    } else {
      // Si el usuario cancela
      toast('Eliminación cancelada.', { icon: 'ℹ️' });
    }
  };

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        No se encontraron proveedores.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Encargado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {(suppliers || []).map((supplier) => (
            <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{supplier.nit}</td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{supplier.empresa}</td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{supplier.encargado}</td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{supplier.telefono}</td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{supplier.correo}</td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{supplier.direccion}</td>
              <td className="px-6 py-3 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(supplier.estado)}`}>
                  {supplier.estado}
                </span>
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  <button
                    onClick={() => onEdit(supplier)}
                    className="text-yellow-500 hover:text-yellow-600"
                    title="Editar"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(supplier)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar"
                  >
                    <FaTrashAlt size={16} />
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

export default SuppliersTable;