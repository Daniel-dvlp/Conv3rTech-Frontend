import React, { useState, useEffect } from 'react';
import ServiceCategoryTable from './components/ServicesCategoryTable.jsx';
import SkeletonCategoryCard from './components/SkeletonCategoryCard.jsx';
import MockCategories from './data/ServicesCategory_data.js';

// Carga simulada
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

  useEffect(() => {
    setTimeout(() => {
      setCategorias(MockCategories);
      setLoading(false);
    }, 1500);
  }, []);

  const handleVer = (id) => {
    console.log('Ver categoría', id);
  };

  const handleEditar = (id) => {
    console.log('Editar categoría', id);
  };

  const handleEliminar = (id) => {
    console.log('Eliminar categoría', id);
  };

  const categoriasFiltradas =
    filtro === 'todas'
      ? categorias
      : categorias.filter((c) => c.tipo === filtro); // tipo puede ser 'seguridad', 'deporte', etc.

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Categorías de Servicio</h2>

      {/* Filtros */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`text-sm font-medium ${filtro === 'todas' ? 'text-blue-600 underline' : 'text-gray-600'}`}
          onClick={() => setFiltro('todas')}
        >
          Todas
        </button>
        <button
          className={`text-sm font-medium ${filtro === 'seguridad' ? 'text-blue-600 underline' : 'text-gray-600'}`}
          onClick={() => setFiltro('seguridad')}
        >
          Seguridad
        </button>
        <button
          className={`text-sm font-medium ${filtro === 'tecnologia' ? 'text-blue-600 underline' : 'text-gray-600'}`}
          onClick={() => setFiltro('tecnologia')}
        >
          Tecnología
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <CategoriasLoading />
      ) : (
        <ServiceCategoryTable
          categorias={categoriasFiltradas}
          onVer={handleVer}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}
    </div>
  );
};

export default ServiceCategoryPage;
