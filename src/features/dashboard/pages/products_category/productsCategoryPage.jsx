// src/features/dashboard/pages/categorias/CategoriasPage.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import ProductsCategoryTable from './components/ProductsCategoryTable';
import SkeletonRow from './components/SkeletonRow'; // Puedes hacer una versión específica si deseas
import { mockProductsCategory } from './data/ProductsCategory_data';

const ProductsCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCategories(mockProductsCategory);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="p-4 md:p-8">
      {/* Encabezado del módulo */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Categorías de Productos</h1>
        <button className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all">
          <FaPlus />
          Nueva Categoría
        </button>
      </div>

      {/* Tabla con Skeleton mientras carga */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ProductsCategoryTable categories={categories} />
      )}
    </div>
  );
};

export default ProductsCategoryPage;
