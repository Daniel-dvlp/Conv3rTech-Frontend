<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import ServiceCategoryTable from "./components/ServicesCategoryTable.jsx";
import SkeletonCategoryCard from "./components/SkeletonCategoryCard.jsx";
import CategoryFormModal from "./components/CategoryFormModal.jsx";
import CategoryViewModal from "./components/CategoryViewModal.jsx";
import { confirmDelete, showSuccess } from "../../../../shared/utils/alerts.js";
import { serviceCategoryService } from "./services/serviceCategoryService.js";
import { toast } from "react-hot-toast";
import { FaPlus, FaSearch } from "react-icons/fa";
=======
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
>>>>>>> origin/dev


const ITEMS_PER_PAGE = 5;
const API_URL = 'https://backend-conv3rtech.onrender.com/api/service-categories';

const ServicesCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [esEdicion, setEsEdicion] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const categoriasPorPagina = 8;

  useEffect(() => {
    loadCategories();
  }, []);

  // Limpiar estado cuando el modal se cierra
  useEffect(() => {
    if (!modalOpen) {
      setSelectedCategoria(null);
      setEsEdicion(false);
    }
  }, [modalOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await serviceCategoryService.getAllCategories();
      setCategorias(response?.data || response || []);
    } catch (error) {
      toast.error("Error al cargar las categorías");
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVer = (id) => {
    const categoria = categorias.find((c) => c.id === id);
    setSelectedCategoria(categoria);
    setViewModalOpen(true);
  };

  const handleEditar = (id) => {
    const categoria = categorias.find((c) => c.id === id);
    setSelectedCategoria(categoria);
    setEsEdicion(true);
    setModalOpen(true);
  };

  const handleEliminar = async (id) => {
    const confirmed = await confirmDelete("¿Deseas eliminar esta categoría?");
    if (!confirmed) return;
    try {
      await serviceCategoryService.deleteCategory(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      showSuccess("Categoría eliminada correctamente");
      toast.success("Categoría eliminada exitosamente");
    } catch (error) {
      toast.error("Error al eliminar la categoría");
    }
  };

  const handleAgregarCategoria = async (nuevaCategoria) => {
    try {
      console.log('📤 Enviando nueva categoría:', nuevaCategoria);
      const response = await serviceCategoryService.createCategory(nuevaCategoria);
      console.log('📥 Respuesta completa del servidor:', response);
      
      // Extraer la categoría creada de la respuesta
      const creada = response?.data?.category || response?.data || response?.category || response;
      console.log('✅ Categoría extraída:', creada);
      
      // Actualizar el estado con la nueva categoría
      setCategorias((prev) => {
        const nuevaLista = [...prev, creada];
        console.log('📋 Lista actualizada (antes):', prev.length, '→ (después):', nuevaLista.length);
        return nuevaLista;
      });
      
      // Cerrar el modal y limpiar estado
      setModalOpen(false);
      setSelectedCategoria(null);
      setEsEdicion(false);
      
      // Solo una notificación
      toast.success("Categoría creada exitosamente");
    } catch (error) {
      console.error('❌ Error al crear categoría:', error);
      toast.error(error?.message || "Error al crear la categoría");
    }
  };

  const handleActualizarCategoria = async (categoriaEditada) => {
    try {
      console.log('📤 Actualizando categoría:', categoriaEditada);
      const response = await serviceCategoryService.updateCategory(
        categoriaEditada.id,
        categoriaEditada
      );
      console.log('📥 Respuesta de actualización:', response);
      
      const actualizada = response?.data?.category || response?.data || response?.category || response;
      console.log('✅ Categoría actualizada:', actualizada);
      
      setCategorias((prev) => {
        const nuevaLista = prev.map((c) => (c.id === actualizada.id ? actualizada : c));
        console.log('📋 Lista después de actualizar');
        return nuevaLista;
      });
      
      setModalOpen(false);
      setSelectedCategoria(null);
      setEsEdicion(false);
      
      // Solo una notificación
      toast.success("Categoría actualizada exitosamente");
    } catch (error) {
      console.error('❌ Error al actualizar categoría:', error);
      toast.error(error?.message || "Error al actualizar la categoría");
    }
  };

  // Búsqueda
  const categoriasFiltradas = categorias.filter((c) => {
    const coincideBusqueda =
      (c.nombre?.toLowerCase() || "").includes(busqueda) ||
      (c.descripcion?.toLowerCase() || "").includes(busqueda);
    return coincideBusqueda;
  });

  // Paginación
  const totalPaginas = Math.ceil(
    categoriasFiltradas.length / categoriasPorPagina
  );
  const indiceInicio = (paginaActual - 1) * categoriasPorPagina;
  const categoriasPaginadas = categoriasFiltradas.slice(
    indiceInicio,
    indiceInicio + categoriasPorPagina
  );

  return (
    <div className="p-6">
      {/* 🔥 HEADER ESTANDARIZADO (igual a Servicios y Categoría de Productos) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold text-[#000435]">
          CATEGORÍAS DE SERVICIOS
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
=======
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
      const res = await fetch(API_URL);
      const json = await res.json().catch(() => ({}));
      const listRaw = extractList(json);
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

  return (
    <div className="p-4 md:p-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Categorías de Servicios</h1>
        <div className="flex gap-4 flex-wrap items-center">
>>>>>>> origin/dev
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
<<<<<<< HEAD
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value.toLowerCase());
                setPaginaActual(1);
              }}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            onClick={() => {
              setModalOpen(true);
              setSelectedCategoria(null);
              setEsEdicion(false);
            }}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
          >
            <FaPlus />
            Crear Categoría
=======
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
>>>>>>> origin/dev
          </button>
        </div>
      </div>

      {/* Tabla */}
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

<<<<<<< HEAD
      {/* Paginación */}
      {!loading && totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaActual === 1}
            className="px-3 py-1 border rounded text-sm text-gray-600 disabled:opacity-50"
          >
            Anterior
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => setPaginaActual(i + 1)}
              className={`px-3 py-1 rounded text-sm font-semibold border ${
                paginaActual === i + 1
                  ? "bg-yellow-400 text-white shadow"
                  : "bg-white text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
            }
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 border rounded text-sm text-gray-600 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <CategoryFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategoria(null);
          setEsEdicion(false);
        }}
        onSubmit={
          esEdicion ? handleActualizarCategoria : handleAgregarCategoria
        }
        categoria={selectedCategoria}
        esEdicion={esEdicion}
      />

      {/* Modal Ver */}
      <CategoryViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        categoria={selectedCategoria}
      />
=======
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
>>>>>>> origin/dev
    </div>
  );
};

export default ServicesCategoryPage;
