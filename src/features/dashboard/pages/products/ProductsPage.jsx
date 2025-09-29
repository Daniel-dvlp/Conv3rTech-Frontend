import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaFileExcel, FaSearch } from 'react-icons/fa';
import ProductsTable from './components/ProductsTable';
import SkeletonRow from './components/SkeletonRow';
import Pagination from '../../../../shared/components/Pagination';
import NewProductModal from './components/NewProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import ProductEditModal from './components/ProductEditModal';
import { showSuccess, showError, confirmDelete } from '../../../../shared/utils/alerts';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 5;
const API_URL = 'https://backend-conv3rtech.onrender.com/api/products/products';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [features, setFeatures] = useState([]); 
  const [isEditing, setIsEditing] = useState(false);

  // Cargar productos, categorías y características
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Productos
        const resProducts = await fetch(API_URL);
        const dataProducts = await resProducts.json();
        setProducts(Array.isArray(dataProducts) ? dataProducts : []);

        // Categorías
        const resCategories = await fetch('https://backend-conv3rtech.onrender.com/api/productsCategory');
        const dataCategories = await resCategories.json();
        setCategories(Array.isArray(dataCategories) ? dataCategories : []);

        // Características Técnicas
        const resFeatures = await fetch('https://backend-conv3rtech.onrender.com/api/products/features');
        const dataFeatures = await resFeatures.json();
        setFeatures(Array.isArray(dataFeatures) ? dataFeatures : []); 

      } catch (err) {
        showError('Error al cargar productos, categorías o características técnicas.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 💥 CORRECCIÓN IMPORTANTE AQUÍ 💥
  // Aseguramos que la función siempre devuelva un string ("") si el input es null/undefined
  const normalize = (text) =>
    (text || '') // Si 'text' es null/undefined, usa una cadena vacía
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);

    return products.filter((product) => {
      const estadoLegible = product.estado ? 'activo' : 'inactivo';
      
      // Aplicamos normalize() a todos los campos que pueden ser null
      const nameIncludes = normalize(product.nombre).includes(normalizedSearch);
      const modelIncludes = normalize(product.modelo).includes(normalizedSearch);
      const unityIncludes = normalize(product.unidad_medida).includes(normalizedSearch);
      
      // stateIncludes ya estaba bien porque estadoLegible siempre es un string
      const stateIncludes = normalize(estadoLegible).startsWith(normalizedSearch); 

      return nameIncludes || unityIncludes || modelIncludes || stateIncludes;
    });
  }, [products, searchTerm]);

  // ... (El resto del código de ProductsPage.jsx sigue igual)
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Crear producto
  const handleAddProduct = async (newProduct) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) throw new Error('Error al crear producto');
      const created = await res.json();
      setProducts((prev) => [created, ...prev]);
      setShowNewModal(false);
      showSuccess('Producto agregado exitosamente');
       if (newProduct.fichas_tecnicas.some(f => f.id_caracteristica === 'otro')) {
        const resFeatures = await fetch('https://backend-conv3rtech.onrender.com/api/products/features');
        const dataFeatures = await resFeatures.json();
        setFeatures(Array.isArray(dataFeatures) ? dataFeatures : []);
      }
    } catch (err) {
      showError('No se pudo crear el producto');
    }
  };

  // Editar producto
  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const res = await fetch(`${API_URL}/${updatedProduct.id_producto}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (!res.ok) throw new Error('Error al actualizar producto');
      const saved = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id_producto === saved.id_producto ? saved : p))
      );
      setIsEditing(false);
      setSelectedProduct(null);
      showSuccess('Producto actualizado exitosamente');
    } catch (err) {
      showError('No se pudo actualizar el producto');
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (productId) => {
    const confirmed = await confirmDelete(
      '¿Estás segura de eliminar este producto?',
      'Esta acción no se puede deshacer'
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_URL}/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar producto');
      setProducts((prev) => prev.filter((prod) => prod.id_producto !== productId));
      showSuccess('Producto eliminado exitosamente');
    } catch (err) {
      showError('No se pudo eliminar el producto');
    }
  };

  // Exportar a Excel
  const handleExport = () => {
    const getCategoryName = (id_categoria) => {
      if (!Array.isArray(categories)) return 'Desconocida';
      const cat = categories.find((c) => c.id_categoria === id_categoria);
      return cat ? cat.nombre : 'Desconocida';
    };
    const dataToExport = filteredProducts.map((product) => {
      const especificacionesTexto = Array.isArray(product.especificaciones_tecnicas)
        ? product.especificaciones_tecnicas
          .map((spec) => `${spec.concepto}: ${spec.valor}`)
          .join(' | ')
        : 'Sin especificaciones';

      return {
        ID: product.id_producto,
        Nombre: product.nombre,
        Modelo: product.modelo,
        Categoría: getCategoryName(product.id_categoria),
        Unidad: product.unidad_medida,
        Garantía: `${product.garantia} meses`,
        Código: product.codigo_barra,
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
    showSuccess('Los productos han sido exportados exitosamente');
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
        existingProducts={products}
        features={features}
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