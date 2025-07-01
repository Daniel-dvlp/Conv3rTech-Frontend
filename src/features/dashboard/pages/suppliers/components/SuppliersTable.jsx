import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const SuppliersTable = ({ suppliers }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th> {/* Empresa primero */}
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
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{supplier.empresa}</td> {/* Empresa primero */}
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{supplier.encargado}</td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{supplier.telefono}</td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{supplier.correo}</td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{supplier.direccion}</td>
              <td className="px-6 py-3 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  supplier.estado === 'Activo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {supplier.estado}
                </span>
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  <button className="text-yellow-500 hover:text-yellow-600" title="Editar">
                    <FaEdit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="Eliminar">
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
