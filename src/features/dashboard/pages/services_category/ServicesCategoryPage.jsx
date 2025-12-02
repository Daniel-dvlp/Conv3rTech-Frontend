import React, { useState, useEffect } from "react";
import ServiceCategoryTable from "./components/ServicesCategoryTable.jsx";
import SkeletonCategoryCard from "./components/SkeletonCategoryCard.jsx";
import CategoryFormModal from "./components/CategoryFormModal.jsx";
import CategoryViewModal from "./components/CategoryViewModal.jsx";
import { confirmDelete, showSuccess } from "../../../../shared/utils/alerts.js";
import { serviceCategoryService } from "./services/serviceCategoryService.js";
import { toast } from "react-hot-toast";
import { FaPlus, FaSearch } from "react-icons/fa";

const CategoriasLoading = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <SkeletonCategoryCard key={i} />
      ))}
    </div>
  );
};

const ServiceCategoryPage = () => {
  const [loading, setLoading] = useState(true);
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
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
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
          </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <CategoriasLoading />
      ) : (
        <ServiceCategoryTable
          categorias={categoriasPaginadas}
          onVer={handleVer}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}

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
    </div>
  );
};

export default ServiceCategoryPage;
