import React from 'react';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import { usePermissions } from '../../../../../shared/hooks/usePermissions';

const ServicesCategoryTable = ({ categories, onViewDetails, onEditCategory, onDeleteCategory, onStatusChange }) => {
  const { canEdit, canDelete } = usePermissions();
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
                   <Switch
                     checked={isActive}
                     onChange={(checked) => onStatusChange(category.id, checked)}
                     className={`${
                       isActive ? 'bg-green-600' : 'bg-gray-200'
                     } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                   >
                     <span
                       className={`${
                         isActive ? 'translate-x-6' : 'translate-x-1'
                       } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                     />
                   </Switch>
                 </td>
                 <td className="px-4 py-3 text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => onViewDetails(category)}
                        className="text-blue-500 hover:text-blue-700 hover:blue-200 p-2 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <FaEye size={16} />
                      </button>
                      {canEdit('categoria_servicios') && (
                        <button
                          onClick={() => onEditCategory(category)}
                          className="text-yellow-500 hover:text-yellow-700 hover:yellow-200 p-2 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <FaEdit size={16} />
                        </button>
                      )}
                      {canDelete('categoria_servicios') && (
                        <button
                          onClick={() => onDeleteCategory(category.id)}
                          className="text-red-500 hover:text-red-700 hover:red-200 p-2 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      )}
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
