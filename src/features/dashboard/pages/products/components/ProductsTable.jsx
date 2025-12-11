import React from 'react';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import { usePermissions } from '../../../../../shared/hooks/usePermissions';

const ProductsTable = ({ products, categories, onViewDetails, onEditProduct, onDeleteProduct }) => {
  const { canEdit, canDelete } = usePermissions();
  //FUNCIÓN PARA FORMATEAR LOS MONTOS.
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '$0';
    const parsedNum = typeof num === 'string' ? parseFloat(num) : num;
    return isNaN(parsedNum) ? '$0' : new Intl.NumberFormat('es-MX').format(parsedNum);
  };

  const getCategoryName = (id_categoria) => {
    if (!Array.isArray(categories)) return 'Desconocida';
    const cat = categories.find((c) => c.id_categoria === id_categoria);
    return cat ? cat.nombre : 'Desconocida';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
           <tr>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
             <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
           </tr>
         </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
             <tr key={product.id_producto} className="hover:bg-gray-50 transition-colors">
               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{product.nombre}</td>
               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{product.modelo}</td>
               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{getCategoryName(product.id_categoria)}</td>
               {/* USO DE LA FUNCIÓN DE FORMATO DE MONTOS */}
               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${formatNumber(product.precio)}</td>
               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{product.stock < 5 ? <span className="text-red-500 font-semibold">{product.stock}</span> : product.stock}</td>

               <td className="px-4 py-3 whitespace-nowrap">
                 <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.estado === true
                   ? 'bg-green-100 text-green-800'
                   : 'bg-red-100 text-red-800'
                   }`}>
                   {product.estado ? 'Activo' : 'Inactivo'}
                 </span>
               </td>
               <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                 <div className="flex justify-end items-center gap-3">
                   <button
                     className="text-blue-600 hover:text-gray-900"
                     title="Ver"
                     onClick={() => onViewDetails(product)}
                   >
                     <FaEye size={16} />
                   </button>
                   {canEdit('productos') && (
                     <button className="text-yellow-600 hover:text-blue-900" title="Editar" onClick={() => onEditProduct(product)}>
                       <FaEdit size={16} />
                     </button>
                   )}
                   {canDelete('productos') && (
                     <button className="text-red-600 hover:text-red-900" title="Eliminar" onClick={() => onDeleteProduct(product.id_producto)}>
                       <FaTrashAlt size={16} />
                     </button>
                   )}
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
