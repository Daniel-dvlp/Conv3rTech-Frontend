// src/features/dashboard/pages/categorias/ProductsCategoryPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import ProductsCategoryTable from './components/ProductsCategoryTable';
import SkeletonRow from './components/SkeletonRow';
import { mockProductsCategory } from './data/ProductsCategory_data';
import Pagination from '../../../../shared/components/Pagination';
import NewProductCategoryModal from './components/NewProductCategoryModal';
import ProductCategoryDetailModal from './components/ProductCategoryDetailModal';
import ProductCategoryEditModal from './components/ProductCategoryEditModal';
import { showSuccess, showError, showInfo, confirmDelete } from '../../../../shared/utils/alerts';


const ITEMS_PER_PAGE = 5;
const API_URL = 'https://backend-conv3rtech.onrender.com/api/productsCategory';

const ProductsCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // ✅ Nuevo estado para edición

  // Helpers: extractor and normalizer for API
  const extractList = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.rows)) return res.rows;
    if (Array.isArray(res.result)) return res.result;
    if (res && typeof res.data === 'object' && res.data !== null) return [res.data];
    return [];
  };

  const normalizeCategory = (cat = {}) => ({
    id_categoria: cat.id_categoria ?? cat.id ?? cat._id ?? cat.idCategoria ?? cat.idcategory,
    nombre: cat.nombre ?? cat.name ?? '',
    descripcion: cat.descripcion ?? cat.description ?? '',
    estado: typeof cat.estado === 'boolean' ? cat.estado : (cat.estado === 1 || cat.active === true || cat.status === true),
  });

  // Listar categorías
useEffect(() => {
  let cancelled = false;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const json = await res.json().catch(() => ({}));
      const listRaw = extractList(json);
      const list = listRaw.map(normalizeCategory).filter(c => c.id_categoria != null);
      if (!cancelled) {
        setCategories(list);
      }
    } catch (e) {
      if (!cancelled) {
        showError('Error al cargar las categorías');
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  load();
  return () => { cancelled = true; };
}, []);

const normalize = (text) =>
  text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const filteredProductsCategory = useMemo(() => {
  const normalizedSearch = normalize(searchTerm);

  return (Array.isArray(categories) ? categories : []).filter((cat) => {
    const nombre = cat?.nombre || '';
    const descripcion = cat?.descripcion || '';
    const estadoLegible = cat?.estado ? 'activo' : 'inactivo';

    const nameIncludes = normalize(nombre).includes(normalizedSearch);
    const descriptionIncludes = normalize(descripcion).includes(normalizedSearch);
    const stateIncludes = normalize(estadoLegible).startsWith(normalizedSearch);

    return nameIncludes || descriptionIncludes || stateIncludes;
  });
}, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredProductsCategory.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProductsCategory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProductsCategory, currentPage]);

  // Agregar categoría
const handleAddCategory = async (newCategory) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: newCategory.nombre,
        descripcion: newCategory.descripcion,
        estado: true, // por compatibilidad si el backend lo requiere
      }),
    });
    const json = await res.json().catch(() => ({}));
    const created = normalizeCategory(json.data || json);
    if (!created || created.id_categoria == null) {
      showError('No se pudo crear la categoría');
      return false;
    }
    setCategories(prev => [created, ...prev]);
    showSuccess('Categoría creada exitosamente');
    return true;
  } catch {
    showError('Error al crear la categoría');
    return false;
  }
};

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsEditing(true);
  };

  // Editar categoría
  const handleUpdateCategory = async (updatedCategory) => {
    try {
      const res = await fetch(`${API_URL}/${updatedCategory.id_categoria}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: updatedCategory.nombre,
          descripcion: updatedCategory.descripcion
          // No envíes estado si la API no lo espera
        }),
      });
      const json = await res.json().catch(() => ({}));
      const updated = normalizeCategory(json.data || json);
      setCategories(prev =>
        prev.map(cat =>
          cat.id_categoria === updated.id_categoria ? updated : cat
        )
      );
      showSuccess('Categoría actualizada exitosamente');
    } catch {
      showError('Error al actualizar la categoría');
    } finally {
      setIsEditing(false);
      setSelectedCategory(null);
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = async (categoryId) => {
    const confirmed = await confirmDelete('¿Estás seguro de eliminar esta categoría?');
    if (!confirmed) return;

    fetch(`${API_URL}/${categoryId}`, { method: 'DELETE' })
      .then(() => {
        setCategories(prev => prev.filter(cat => Number(cat.id_categoria) !== Number(categoryId)));
        showSuccess('Categoría eliminada exitosamente');
      })
      .catch(() => showError('Error al eliminar la categoría'));
  };

  return (
    <div className="p-4 md:p-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Categorías de productos</h1>
        <div className="flex gap-4 flex-wrap items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
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
            Crear categoría
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
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
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

      {selectedCategory && !isEditing && (
        <ProductCategoryDetailModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}

      {selectedCategory && isEditing && (
        <ProductCategoryEditModal
          isOpen={isEditing}
          onClose={() => {
            setIsEditing(false);
            setSelectedCategory(null);
          }}
          onSave={handleUpdateCategory}
          categoryToEdit={selectedCategory}
          existingCategories={categories}
        />
      )}
    </div>
  );
};

export default ProductsCategoryPage;
