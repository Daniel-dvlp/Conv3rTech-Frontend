// src/features/dashboard/pages/productos/components/ProductosTable.jsx

import React from 'react';
import { FaEdit, FaMinusCircle, FaEye } from 'react-icons/fa';

const ProductsTable = ({ products }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <img
                  src={product.foto || 'https://via.placeholder.com/40'}
                  alt={`Foto de ${product.nombre}`}
                  className="w-10 h-10 object-cover rounded"
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{product.nombre}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{product.modelo}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{product.categoria}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{product.unidad}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${product.precio.toLocaleString()}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{product.stock}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  product.estado === 'Activo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.estado}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  <button className="text-gray-600 hover:text-gray-900" title="Ver">
                    <FaEye size={16} />
                  </button>
                  <button className="text-blue-600 hover:text-blue-900" title="Editar">
                    <FaEdit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-900" title="Eliminar">
                    <FaMinusCircle size={16} />
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

export default ProductsTable;
