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
import { productsService, categoriesService, featuresService } from './services/productsService';

const ITEMS_PER_PAGE = 5;

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
        // Cargar datos en paralelo
        const [productsData, categoriesData, featuresData] = await Promise.all([
          productsService.getAllProducts(),
          categoriesService.getAllCategories(),
          featuresService.getAllFeatures()
        ]);

        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setFeatures(Array.isArray(featuresData) ? featuresData : []);

      } catch (err) {
        console.error('Error al cargar datos:', err);
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
    console.log('Datos a enviar:', JSON.stringify(newProduct, null, 2));
    const created = await productsService.createProduct(newProduct);
    console.log('Producto creado:', created);
    setProducts((prev) => [created, ...prev]);
    setShowNewModal(false);
    showSuccess('Producto agregado exitosamente');

    // Actualizar características para que el select tenga la nueva característica disponible
    try {
      const updatedFeatures = await featuresService.getAllFeatures();
      setFeatures(Array.isArray(updatedFeatures) ? updatedFeatures : []);
    } catch (featureError) {
      console.warn('Error al actualizar características:', featureError);
    }
    // Si hay error, se lanza y será capturado en el modal
  };

  // Editar producto
  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const saved = await productsService.updateProduct(updatedProduct.id_producto, updatedProduct);
      
      // Ajuste: a veces updateProduct devuelve directamente el producto o un objeto { data: ... }
      // Si el servicio devuelve { success: true, data: ... } hay que extraer
      const savedData = saved.data || saved;
      
      setProducts((prev) =>
        prev.map((p) => (p.id_producto === savedData.id_producto ? savedData : p))
      );
      setIsEditing(false);
      setSelectedProduct(null);
      showSuccess('Producto actualizado exitosamente');

      // Actualizar características para que el select tenga las nuevas características disponibles
      try {
        const updatedFeatures = await featuresService.getAllFeatures();
        setFeatures(Array.isArray(updatedFeatures) ? updatedFeatures : []);
      } catch (featureError) {
        console.warn('Error al actualizar características:', featureError);
      }
    } catch (err) {
      console.error('Error al actualizar producto:', err);
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
      await productsService.deleteProduct(productId);
      setProducts((prev) => prev.filter((prod) => prod.id_producto !== productId));
      showSuccess('Producto eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      let errorMessage = 'No se pudo eliminar el producto';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showError(errorMessage);
    }
  };


  // Exportar a Excel
  const handleExport = () => {
    const getCategoryName = (id_categoria) => {
      if (!Array.isArray(categories)) return 'Desconocida';
      const cat = categories.find((c) => c.id_categoria === id_categoria);
      return cat ? cat.nombre : 'Desconocida';
    };

    const buildSpecsText = (product) => {
      if (Array.isArray(product?.fichas_tecnicas) && product.fichas_tecnicas.length > 0) {
        return product.fichas_tecnicas
          .map((spec) => {
            const label =
              spec?.caracteristica?.nombre ??
              spec?.nombre ??
              spec?.concepto ??
              'Característica';
            const value = spec?.valor ?? spec?.detalle ?? '';
            return value ? `${label}: ${value}` : label;
          })
          .join(' | ');
      }

      if (
        Array.isArray(product?.especificaciones_tecnicas) &&
        product.especificaciones_tecnicas.length > 0
      ) {
        return product.especificaciones_tecnicas
          .map((spec) => {
            const label = spec?.nombre ?? spec?.concepto ?? 'Característica';
            const value = spec?.valor ?? spec?.detalle ?? '';
            return value ? `${label}: ${value}` : label;
          })
          .join(' | ');
      }

      return 'Sin especificaciones';
    };

    const dataToExport = filteredProducts.map((product) => ({
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
      Especificaciones: buildSpecsText(product),
    }));

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
            Registrar producto
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Nombre', 'Modelo', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map((header) => (
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
          features={features}
        />
      )}
    </div>
  );
};

export default ProductsPage;