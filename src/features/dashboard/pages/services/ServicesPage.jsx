import React, { useState, useEffect } from 'react';
import ServicesTable from './components/ServicesTable';
import SkeletonCard from './components/SkeletonCard';
import MockServices from './data/Services_data';

// Componente que se muestra durante la carga
const ServiciosLoading = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

const ServicesPage = () => {
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    // Simula un fetch
    setTimeout(() => {
      setServicios(MockServices);
      setLoading(false);
    }, 1500);
  }, []);

  const handleVer = (id) => {
    console.log('Ver servicio', id);
  };

  const handleEditar = (id) => {
    console.log('Editar servicio', id);
  };

  const handleEliminar = (id) => {
    console.log('Eliminar servicio', id);
  };

  const serviciosFiltrados =
    filtro === 'todos'
      ? servicios
      : servicios.filter((s) => s.tipo === filtro); // tipo: 'instalacion' o 'mantenimiento'

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Servicios</h2>

      {/* Filtros */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`text-sm font-medium ${
            filtro === 'todos' ? 'text-blue-600 underline' : 'text-gray-600'
          }`}
          onClick={() => setFiltro('todos')}
        >
          Todos
        </button>
        <button
          className={`text-sm font-medium ${
            filtro === 'instalacion' ? 'text-blue-600 underline' : 'text-gray-600'
          }`}
          onClick={() => setFiltro('instalacion')}
        >
          Servicio de instalación
        </button>
        <button
          className={`text-sm font-medium ${
            filtro === 'mantenimiento' ? 'text-blue-600 underline' : 'text-gray-600'
          }`}
          onClick={() => setFiltro('mantenimiento')}
        >
          Servicio de mantenimiento
        </button>
      </div>

      {/* Tabla o skeleton */}
      {loading ? (
        <ServiciosLoading />
      ) : (
        <ServicesTable
          servicios={serviciosFiltrados}
          onVer={handleVer}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}
    </div>
  );
};

export default ServicesPage;
