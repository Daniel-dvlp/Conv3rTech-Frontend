// src/features/dashboard/pages/services_category/ServicesCategoryPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import ServicesCategoryTable from './components/ServicesCategoryTable.jsx';
import SkeletonRow from './components/SkeletonRow.jsx';
import Pagination from '../../../../shared/components/Pagination';
import NewServiceCategoryModal from './components/NewServiceCategoryModal.jsx';
import ServiceCategoryDetailModal from './components/ServiceCategoryDetailModal.jsx';
import ServiceCategoryEditModal from './components/ServiceCategoryEditModal.jsx';
import { showSuccess, showError, showInfo, confirmDelete } from '../../../../shared/utils/alerts';
import { serviceCategoryService } from './services/serviceCategoryService.js';
import { usePermissions } from '../../../../shared/hooks/usePermissions';


const ITEMS_PER_PAGE = 5;

const ServicesCategoryPage = () => {
  const { canCreate } = usePermissions();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
    id: cat.id ?? cat._id ?? cat.idCategoria ?? cat.idcategory,
    nombre: cat.nombre ?? cat.name ?? '',
    descripcion: cat.descripcion ?? cat.description ?? '',
    estado: cat.estado ?? 'Activo',
  });

  // Listar categorías
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await serviceCategoryService.getAllCategories();
        const listRaw = extractList(res);
        const list = listRaw.map(normalizeCategory).filter(c => c.id != null);
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

const filteredServicesCategory = useMemo(() => {
  const normalizedSearch = normalize(searchTerm);

  return (Array.isArray(categories) ? categories : []).filter((cat) => {
    const nombre = cat?.nombre || '';
    const descripcion = cat?.descripcion || '';
    const estadoLegible = (cat?.estado || '').toLowerCase() === 'activo' ? 'activo' : 'inactivo';

    const nameIncludes = normalize(nombre).includes(normalizedSearch);
    const descriptionIncludes = normalize(descripcion).includes(normalizedSearch);
    const stateIncludes = normalize(estadoLegible).startsWith(normalizedSearch);

    return nameIncludes || descriptionIncludes || stateIncludes;
  });
}, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredServicesCategory.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredServicesCategory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredServicesCategory, currentPage]);

  // Agregar categoría
const handleAddCategory = async (newCategory) => {
  try {
    console.log('📤 Enviando nueva categoría:', newCategory);
    const response = await serviceCategoryService.createCategory(newCategory);
    console.log('📥 Respuesta del servidor:', response);
    
    const created = normalizeCategory(response.category || response.data || response);
    console.log('✅ Categoría normalizada:', created);
    
    if (!created || created.id == null) {
      console.error('❌ Error: No se pudo extraer el ID de la categoría');
      showError('No se pudo crear la categoría');
      return false;
    }
    setCategories(prev => [created, ...prev]);
    showSuccess('Categoría creada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
    showError(error.message || 'Error al crear la categoría');
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
      const res = await fetch(`${API_URL}/${updatedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: updatedCategory.nombre,
          descripcion: updatedCategory.descripcion
        }),
      });
      const json = await res.json().catch(() => ({}));
      const updated = normalizeCategory(json.data || json);
      setCategories(prev =>
        prev.map(cat =>
          cat.id === updated.id ? updated : cat
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
        setCategories(prev => prev.filter(cat => Number(cat.id) !== Number(categoryId)));
        showSuccess('Categoría eliminada exitosamente');
      })
      .catch(() => showError('Error al eliminar la categoría'));
  };

  // Cambiar estado
  const handleStatusChange = async (id, newStatus) => {
    try {
      const estadoStr = newStatus ? 'activo' : 'inactivo';
      await serviceCategoryService.changeStateCategory(id, estadoStr);
      
      setCategories(prev => prev.map(cat => 
        (cat.id === id) ? { ...cat, estado: estadoStr } : cat
      ));
      showSuccess(`Categoría ${newStatus ? 'activada' : 'desactivada'} exitosamente`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al cambiar el estado de la categoría';
      showError(errorMsg);
    }
  };

  return (
    <div className="p-4 md:p-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Categorías de Servicios</h1>
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
          {canCreate('categoria_servicios') && (
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
            >
              <FaPlus />
              Crear categoría
            </button>
          )}
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
          <ServicesCategoryTable
            categories={currentItems}
            onViewDetails={(cat) => setSelectedCategory(cat)}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onStatusChange={handleStatusChange}
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
        <NewServiceCategoryModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSave={handleAddCategory}
          existingCategories={categories}
        />
      )}

      {selectedCategory && !isEditing && (
        <ServiceCategoryDetailModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}

      {selectedCategory && isEditing && (
        <ServiceCategoryEditModal
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

export default ServicesCategoryPage;
