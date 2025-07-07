import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaFileExcel, FaSearch } from 'react-icons/fa';
import ProductsTable from './components/ProductsTable';
import SkeletonRow from './components/SkeletonRow';
import Pagination from '../../../../shared/components/Pagination';
import NewProductModal from './components/NewProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import { mockProducts } from './data/Products_data';
import { mockProductsCategory } from '../products_category/data/ProductsCategory_data';
import ProductEditModal from './components/ProductEditModal';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 5;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts);
      setCategories(mockProductsCategory);
      setLoading(false);
    }, 1500);
  }, []);

  const normalize = (text) =>
    text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);

    return products.filter((product) => {
      const estadoLegible = product.estado ? 'activo' : 'inactivo';
      const nameIncludes = normalize(product.nombre).includes(normalizedSearch);
      const modelIncludes = normalize(product.modelo).includes(normalizedSearch);
      const unityIncludes = normalize(product.unidad).includes(normalizedSearch);
      const stateIncludes = normalize(estadoLegible).startsWith(normalizedSearch);

      return nameIncludes || unityIncludes || modelIncludes || stateIncludes;
    });
  }, [products, searchTerm]);


  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    setShowNewModal(false);
  };

  const handleExport = () => {
    const getCategoryName = (id) => {
      if (!Array.isArray(categories)) return 'Desconocida';
      const cat = categories.find((c) => c.id === id);
      return cat ? cat.nombre : 'Desconocida';
    };
    const dataToExport = filteredProducts.map((product) => {
      const especificacionesTexto = Array.isArray(product.especificaciones_tecnicas)
        ? product.especificaciones_tecnicas
          .map((spec) => `${spec.concepto}: ${spec.valor}`)
          .join(' | ')
        : 'Sin especificaciones';

      return {
        ID: product.id,
        Nombre: product.nombre,
        Modelo: product.modelo,
        Categoría: getCategoryName(product.categoria),
        Unidad: product.unidad,
        Garantía: `${product.garantia} meses`,
        Código: product.codigo,
        Precio: product.precio,
        Stock: product.stock,
        Estado: product.estado ? 'Activo' : 'Inactivo',
        Especificaciones: especificacionesTexto,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
    XLSX.writeFile(workbook, 'ReporteProductos.xlsx');
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (!confirmDelete) return;

    setProducts(prev => prev.filter(cat => cat.id !== productId));
  };

  return (
    <div className="p-4 md:p-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar"
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
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <FaFileExcel />
            Exportar
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
          >
            <FaPlus />
            Nuevo producto
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Producto', 'Modelo', 'Estado', 'Acciones'].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
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
          <ProductsTable
            products={currentItems}
            categories={categories}
            onViewDetails={(product) => setSelectedProduct(product)}
            onEditProduct={(product) => {
              setSelectedProduct(product);
              setIsEditing(true);
            }}
            onDeleteProduct={handleDeleteProduct}
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

      <NewProductModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={handleAddProduct}
        categories={categories}
        onEditProduct={(product) => {
          setSelectedProduct(product);
          setIsEditing(true);
        }}
      />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          categories={categories}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {selectedProduct && isEditing && (
        <ProductEditModal
          isOpen={isEditing}
          onClose={() => {
            setIsEditing(false);
            setSelectedProduct(null);
          }}
          onSave={handleUpdateProduct}
          productToEdit={selectedProduct}
          existingProducts={products}
          categories={categories}
        />
      )}

    </div>
  );
};

export default ProductsPage;
