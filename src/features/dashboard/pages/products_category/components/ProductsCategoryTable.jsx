import React from 'react';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import { Switch } from '@headlessui/react';

const ToggleSwitch = ({ checked, onChange }) => (
  <Switch
    checked={checked}
    onChange={onChange}
    className={`${checked ? 'bg-green-500' : 'bg-gray-300'}
    relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none`}
  >
    <span
      className={`${checked ? 'translate-x-5' : 'translate-x-1'}
      inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300`}
    />
  </Switch>
);

const ProductsCategoryTable = ({ categories, onViewDetails, onEditCategory, onDeleteCategory, onStatusChange }) => {
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
          {(Array.isArray(categories) ? categories : []).map((category) => (
            <tr key={category.id_categoria} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{category.nombre}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{category.descripcion}</td>
              <td className="px-4 py-3">
                <ToggleSwitch
                  checked={category.estado}
                  onChange={(checked) => onStatusChange(category.id_categoria, checked)}
                />
              </td>
              <td className="px-4 py-3 text-right text-sm font-medium">
                <div className="flex justify-end gap-3">
                  <button className="text-blue-600 hover:text-gray-900" title="Ver" onClick={() => onViewDetails(category)}>
                    <FaEye size={16} />
                  </button>
                  <button className="text-yellow-600 hover:text-yellow-800" title="Editar" onClick={() => onEditCategory(category)}>
                    <FaEdit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="Eliminar" onClick={() => onDeleteCategory(category.id_categoria)}>
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
