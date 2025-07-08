import React from 'react';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';

const ProductsCategoryTable = ({ categories, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {category.nombre}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {category.descripcion}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  category.estado === true
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.estado ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  <button
                    className="text-blue-600 hover:text-gray-900"
                    title="Ver"
                    onClick={() => onViewDetails(category)}
                  >
                    <FaEye size={16} />
                  </button>
                  <button className="text-yellow-600 hover:text-blue-900" title="Editar">
                    <FaEdit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-900" title="Eliminar">
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

export default ProductsCategoryTable;
