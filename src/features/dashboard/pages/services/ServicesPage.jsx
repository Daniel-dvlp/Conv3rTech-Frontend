import React, { useState, useEffect } from 'react';
import ServicesTable from './components/ServicesTable';
import SkeletonCard from './components/SkeletonCard';
import MockServices from './data/Services_data';
import ServiceFormModal from './components/ServiceFormModal';
import ServiceViewModal from './components/ServiceViewModal';
import { showSuccess, confirmDelete } from '../../../../shared/utils/alerts.js'

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setServicios(MockServices);
      setLoading(false);
    }, 1500);
  }, []);

  const handleVer = (id) => {
    const servicio = servicios.find((s) => s.id === id);
    setSelectedService(servicio);
    setViewModalOpen(true);
  };

  const handleEditar = (id) => {
    const servicio = servicios.find((s) => s.id === id);
    setSelectedService(servicio);
    setEsEdicion(true);
    setModalOpen(true);
  };

const handleEliminar = async (id) => {
  const confirmed = await confirmDelete('¿Deseas eliminar este servicio?');
  if (confirmed) {
    setServicios((prev) => prev.filter((s) => s.id !== id));
    showSuccess('Servicio eliminado correctamente');
  }
};    


  const handleAgregarServicio = (nuevoServicio) => {
    const nuevo = {
      id: servicios.length + 1,
      ...nuevoServicio,
      tipo: nuevoServicio.categoria.toLowerCase().includes('mantenimiento')
        ? 'mantenimiento'
        : 'instalacion',
    };
    setServicios((prev) => [...prev, nuevo]);
  };

  const handleActualizarServicio = (servicioEditado) => {
    const actualizado = {
      ...servicioEditado,
      tipo: servicioEditado.categoria.toLowerCase().includes('mantenimiento')
        ? 'mantenimiento'
        : 'instalacion',
    };

    setServicios((prevServicios) =>
      prevServicios.map((s) => (s.id === actualizado.id ? actualizado : s))
    );

    setEsEdicion(false);
    setSelectedService(null);
  };

  const serviciosFiltrados =
    filtro === 'todos'
      ? servicios
      : servicios.filter((s) => s.tipo === filtro);

  return (
    <div className="p-6">
      {/* Título estilizado */}
      <h2 className="text-3xl font-bold mb-6 text-center text-[#000435]">
        SERVICIOS
      </h2>

      {/* Botón Crear Servicio */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setModalOpen(true);
            setEsEdicion(false);
            setSelectedService(null);
          }}
          className="bg-[#FFB800] text-black px-4 py-2 rounded hover:bg-[#e0a500] transition"
        >
          + Crear Servicio
        </button>
      </div>

      {/* Filtros con estilo mejorado */}
      <div className="flex justify-center gap-3 mb-8">
        {[
          { tipo: 'todos', label: 'Todos' },
          { tipo: 'instalacion', label: 'Servicio de instalación' },
          { tipo: 'mantenimiento', label: 'Servicio de mantenimiento' },
        ].map(({ tipo, label }) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition border shadow-sm
              ${
                filtro === tipo
                  ? 'bg-[#000435] text-white border-[#000435]'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-[#e0e7ff] hover:text-[#000435] hover:border-[#cbd5e1]'
              }`}
          >
            {label}
          </button>
        ))}
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

      {/* Modal de crear o editar servicio */}
      <ServiceFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEsEdicion(false);
          setSelectedService(null);
        }}
        onSubmit={esEdicion ? handleActualizarServicio : handleAgregarServicio}
        servicio={selectedService}
        esEdicion={esEdicion}
      />

      {/* Modal de ver servicio */}
      <ServiceViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        servicio={selectedService}
      />
    </div>
  );
};

export default ServicesPage;
