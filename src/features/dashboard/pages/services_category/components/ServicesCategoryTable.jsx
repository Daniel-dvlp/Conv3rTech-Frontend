import React from 'react';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';

const ServicesCategoryTable = ({ categories, onViewDetails, onEditCategory, onDeleteCategory }) => {
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
           {(Array.isArray(categories) ? categories : []).map((category) => {
             const isActive = (category.estado || '').toLowerCase() === 'activo';
             return (
               <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                 <td className="px-4 py-3 text-sm font-medium text-gray-900">{category.nombre}</td>
                 <td className="px-4 py-3 text-sm text-gray-700">{category.descripcion}</td>
                 <td className="px-4 py-3">
                   <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                     isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                   }`}>
                     {isActive ? 'Activo' : 'Inactivo'}
                   </span>
                 </td>
                 <td className="px-4 py-3 text-right text-sm font-medium">
                   <div className="flex justify-end gap-3">
                     <button className="text-blue-600 hover:text-gray-900" title="Ver" onClick={() => onViewDetails(category)}>
                       <FaEye size={16} />
                     </button>
                     <button className="text-yellow-600 hover:text-yellow-800" title="Editar" onClick={() => onEditCategory(category)}>
                       <FaEdit size={16} />
                     </button>
                     <button className="text-red-600 hover:text-red-800" title="Eliminar" onClick={() => onDeleteCategory(category.id)}>
                       <FaTrashAlt size={16} />
                     </button>
                   </div>
                 </td>
               </tr>
             );
           })}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesCategoryTable;
