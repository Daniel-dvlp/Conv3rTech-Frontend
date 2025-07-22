import React, { useState, useEffect } from 'react';
import ServicesTable from './components/ServicesTable';
import SkeletonCard from './components/SkeletonCard';
import MockServices from './data/Services_data';
import ServiceFormModal from './components/ServiceFormModal';
import ServiceViewModal from './components/ServiceViewModal';
import { showSuccess, confirmDelete } from '../../../../shared/utils/alerts.js';

const ServiciosLoading = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

const ServicesPage = () => {
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const serviciosPorPagina = 8;

  useEffect(() => {
    setTimeout(() => {
      const serviciosConEstado = MockServices.map(s => ({
        ...s,
        estado: s.estado || 'activo',
      }));
      setServicios(serviciosConEstado);
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
      estado: 'activo',
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
    setServicios((prev) =>
      prev.map((s) => (s.id === actualizado.id ? actualizado : s))
    );
    setEsEdicion(false);
    setSelectedService(null);
  };

  const handleToggleEstado = (id) => {
    setServicios((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, estado: s.estado === 'activo' ? 'inactivo' : 'activo' }
          : s
      )
    );
  };

  const serviciosFiltrados = servicios
    .filter((s) => filtro === 'todos' || s.tipo === filtro)
    .filter((s) =>
      s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

  const indexInicio = (currentPage - 1) * serviciosPorPagina;
  const indexFin = indexInicio + serviciosPorPagina;
  const serviciosPaginados = serviciosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(serviciosFiltrados.length / serviciosPorPagina);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#000435]">
        SERVICIOS
      </h2>

      {/* Buscador centrado y botón */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar servicio..."
          className="border px-4 py-2 rounded w-full sm:w-96 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button
          onClick={() => {
            setModalOpen(true);
            setEsEdicion(false);
            setSelectedService(null);
          }}
          className="bg-[#FFB800] text-black px-4 py-2 rounded hover:bg-[#e0a500] transition w-full sm:w-auto"
        >
          + Crear Servicio
        </button>
      </div>

      {/* Filtros por tipo */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {[
          { tipo: 'todos', label: 'Todos' },
          { tipo: 'instalacion', label: 'Instalación' },
          { tipo: 'mantenimiento', label: 'Mantenimiento' },
        ].map(({ tipo, label }) => (
          <button
            key={tipo}
            onClick={() => {
              setFiltro(tipo);
              setCurrentPage(1);
            }}
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
        <>
          <ServicesTable
            servicios={serviciosPaginados}
            onVer={handleVer}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            onToggleEstado={handleToggleEstado}
          />

          {/* Paginador estilo categoría */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center mt-10 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm font-medium border shadow ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded text-sm font-semibold border transition ${
                    currentPage === i + 1
                      ? 'bg-[#FFB800] text-black border-[#FFB800]'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))}
                disabled={currentPage === totalPaginas}
                className={`px-3 py-1 rounded text-sm font-medium border shadow ${
                  currentPage === totalPaginas
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de crear o editar */}
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

      {/* Modal de ver */}
      <ServiceViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        servicio={selectedService}
      />
    </div>
  );
};

export default ServicesPage;
