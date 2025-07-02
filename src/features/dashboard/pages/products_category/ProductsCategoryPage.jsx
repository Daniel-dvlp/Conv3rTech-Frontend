// src/features/dashboard/pages/categorias/ProductsCategoryPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import ProductsCategoryTable from './components/ProductsCategoryTable';
import SkeletonRow from './components/SkeletonRow';
import { mockProductsCategory } from './data/ProductsCategory_data';
import Pagination from '../../../../shared/components/Pagination';
import NewProductCategoryModal from './components/NewProductCategoryModal';
import ProductCategoryDetailModal from './components/ProductCategoryDetailModal';

const ITEMS_PER_PAGE = 5;

const ProductsCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setCategories(mockProductsCategory);
      setLoading(false);
    }, 1500);
  }, []);

  const normalize = (text) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredProductsCategory = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);
    return categories.filter((cat) =>
      normalize(cat.nombre).includes(normalizedSearch) ||
      normalize(cat.descripcion).includes(normalizedSearch) ||
      normalize(cat.estado.toString()).includes(normalizedSearch)
    );
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredProductsCategory.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProductsCategory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProductsCategory, currentPage]);

  const handleAddCategory = (newCategory) => {
    setCategories(prev => [newCategory, ...prev]);
    setShowNewModal(false);
  };

  return (
    <div className="p-4 md:p-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Categorías de Productos</h1>
        <div className="flex gap-4 flex-wrap items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o estado..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
          >
            <FaPlus />
            Nueva Categoría
          </button>
        </div>
      </div>

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
        <>
          <ProductsCategoryTable
            categories={currentItems}
            onViewDetails={(cat) => setSelectedCategory(cat)}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}

      {showNewModal && (
        <NewProductCategoryModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSave={handleAddCategory}
          existingCategories={categories}
        />
      )}

      {selectedCategory && (
        <ProductCategoryDetailModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

export default ProductsCategoryPage;
