// src/features/dashboard/pages/productos/ProductosPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import ProductsTable from './components/ProductsTable';
import SkeletonRow from './components/SkeletonRow';
import { mockProducts } from './data/Products_data';
import Pagination from '../../../../shared/components/Pagination';
import { mockProductsCategory } from '../products_category/data/ProductsCategory_data';
import NewProductModal from './components/NewProductModal';

const ITEMS_PER_PAGE = 5;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1500);
  }, []);

  const normalize = (text) =>
    text?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || '';

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);
    return products.filter((p) =>
      normalize(p.nombre ?? "").includes(normalizedSearch) ||
      normalize(p.descripcion ?? "").includes(normalizedSearch) ||
      normalize(p.modelo ?? "").includes(normalizedSearch) ||
      normalize(p.categoria ?? "").includes(normalizedSearch) ||
      normalize(p.unidad ?? "").includes(normalizedSearch) ||
      normalize(String(p.precio) ?? "").includes(normalizedSearch) ||
      normalize(String(p.stock) ?? "").includes(normalizedSearch) ||
      normalize(p.estado?.toString() ?? "").includes(normalizedSearch)
    );
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleAddProduct = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    setShowNewModal(false);
  };

  return (
    <div className="p-4 md:p-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar por nombre, modelo, categoria..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
          >
            <FaPlus />
            Nuevo Producto
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Foto', 'Nombre', 'Modelo', 'Categoría', 'Unidad', 'Precio', 'Stock', 'Estado', 'Acciones'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {header}
                  </th>
                ))}
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
          <ProductsTable products={currentItems} categories={mockProductsCategory} />
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
        <NewProductModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSave={handleAddProduct}
          existingProducts={products}
          categories={mockProductsCategory}
        />
      )}
    </div>
  );
};

export default ProductsPage;
