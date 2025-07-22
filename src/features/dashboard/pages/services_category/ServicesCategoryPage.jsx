import React, { useState, useEffect } from 'react';
import ServiceCategoryTable from './components/ServicesCategoryTable.jsx';
import SkeletonCategoryCard from './components/SkeletonCategoryCard.jsx';
import MockCategories from './data/ServicesCategory_data.js';
import CategoryFormModal from './components/CategoryFormModal.jsx';
import CategoryViewModal from './components/CategoryViewModal.jsx';
import { confirmDelete, showSuccess } from '../../../../shared/utils/alerts.js';

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
  const [filtro, setFiltro] = useState('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [esEdicion, setEsEdicion] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const categoriasPorPagina = 8;

  useEffect(() => {
    setTimeout(() => {
      setCategorias(MockCategories);
      setLoading(false);
    }, 1500);
  }, []);

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
    const confirmed = await confirmDelete('¿Deseas eliminar esta categoría?');
    if (confirmed) {
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      showSuccess('Categoría eliminada correctamente');
    }
  };

  const handleAgregarCategoria = (nuevaCategoria) => {
    const nueva = {
      id: categorias.length + 1,
      ...nuevaCategoria,
      tipo: nuevaCategoria.nombre.toLowerCase().includes('tecnologia')
        ? 'tecnologia'
        : 'seguridad',
    };
    setCategorias((prev) => [...prev, nueva]);
  };

  const handleActualizarCategoria = (categoriaEditada) => {
    const actualizada = {
      ...categoriaEditada,
      tipo: categoriaEditada.nombre.toLowerCase().includes('tecnologia')
        ? 'tecnologia'
        : 'seguridad',
    };
    setCategorias((prev) =>
      prev.map((c) => (c.id === actualizada.id ? actualizada : c))
    );
    setModalOpen(false);
    setSelectedCategoria(null);
    setEsEdicion(false);
  };

  // Búsqueda y filtro
  const categoriasFiltradas = categorias.filter((c) => {
    const coincideTipo = filtro === 'todas' || c.tipo === filtro;
    const coincideBusqueda =
      (c.nombre?.toLowerCase() || '').includes(busqueda) ||
      (c.descripcion?.toLowerCase() || '').includes(busqueda);
    return coincideTipo && coincideBusqueda;
  });

  // Paginación
  const totalPaginas = Math.ceil(categoriasFiltradas.length / categoriasPorPagina);
  const indiceInicio = (paginaActual - 1) * categoriasPorPagina;
  const categoriasPaginadas = categoriasFiltradas.slice(
    indiceInicio,
    indiceInicio + categoriasPorPagina
  );

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#000435]">
        CATEGORÍAS DE SERVICIOS
      </h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setModalOpen(true);
            setSelectedCategoria(null);
            setEsEdicion(false);
          }}
          className="bg-[#FFB800] text-black px-4 py-2 rounded hover:bg-[#e0a500] transition"
        >
          + Crear Categoría
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Buscar"
          className="px-4 py-2 border border-gray-300 rounded-md w-full max-w-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value.toLowerCase());
            setPaginaActual(1);
          }}
        />
      </div>

      <div className="flex justify-center gap-3 mb-8">
        {['todas', 'seguridad', 'tecnologia'].map((tipo) => (
          <button
            key={tipo}
            onClick={() => {
              setFiltro(tipo);
              setPaginaActual(1);
            }}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition border shadow-sm
              ${
                filtro === tipo
                  ? 'bg-[#000435] text-white border-[#000435]'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-[#e0e7ff] hover:text-[#000435] hover:border-[#cbd5e1]'
              }`}
          >
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </button>
        ))}
      </div>

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
                  ? 'bg-yellow-400 text-white shadow'
                  : 'bg-white text-gray-700'
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

      <CategoryFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategoria(null);
          setEsEdicion(false);
        }}
        onSubmit={esEdicion ? handleActualizarCategoria : handleAgregarCategoria}
        categoria={selectedCategoria}
        esEdicion={esEdicion}
      />

      <CategoryViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        categoria={selectedCategoria}
      />
    </div>
  );
};

export default ServiceCategoryPage;
