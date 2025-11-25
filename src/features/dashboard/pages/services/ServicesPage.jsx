import React, { useState, useEffect } from 'react';
import ServicesTable from './components/ServicesTable';
import SkeletonCard from './components/SkeletonCard';
import ServiceFormModal from './components/ServiceFormModal';
import ServiceViewModal from './components/ServiceViewModal';
import { showSuccess, confirmDelete } from '../../../../shared/utils/alerts.js';
import { serviceService } from './services/serviceService.js';
import { toast } from 'react-hot-toast';
import { FaPlus, FaSearch } from "react-icons/fa";


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
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getAllServices();
      setServicios(response?.data || response || []);
    } catch (error) {
      toast.error('Error al cargar los servicios');
      setServicios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVer = (id) => {
    const servicio = servicios.find((s) => s.id_servicio === id || s.id === id);
    setSelectedService(servicio);
    setViewModalOpen(true);
  };

  const handleEditar = (id) => {
    const servicio = servicios.find((s) => s.id_servicio === id || s.id === id);
    setSelectedService(servicio);
    setEsEdicion(true);
    setModalOpen(true);
  };

  const handleEliminar = async (id) => {
    const confirmed = await confirmDelete('¿Deseas eliminar este servicio?');
    if (!confirmed) return;
    try {
      await serviceService.deleteService(id);
      setServicios((prev) => prev.filter((s) => s.id_servicio !== id && s.id !== id));
      showSuccess('Servicio eliminado correctamente');
      toast.success('Servicio eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el servicio');
    }
  };

  const handleAgregarServicio = async (nuevoServicio) => {
    try {
      const response = await serviceService.createService(nuevoServicio);
      const creado = response?.service || response;
      setServicios((prev) => [...prev, creado]);
      showSuccess('Servicio creado correctamente');
      toast.success('Servicio creado exitosamente');
    } catch (error) {
      const apiMsg = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;
      const status = error?.response?.status;
      const detail = Array.isArray(apiErrors) ? apiErrors.map(e => e.msg).join(' | ') : '';
      toast.error(`${status || ''} ${apiMsg || 'Error al crear el servicio'}${detail ? ': ' + detail : ''}`.trim());
      throw error;
    }
  };

  const handleActualizarServicio = async (servicioEditado) => {
    try {
      const id = servicioEditado.id_servicio || servicioEditado.id;
      const response = await serviceService.updateService(id, servicioEditado);
      const actualizado = response?.service || response;
      setServicios((prev) =>
        prev.map((s) => ((s.id_servicio === id || s.id === id) ? actualizado : s))
      );
      setModalOpen(false);
      setSelectedService(null);
      setEsEdicion(false);
      showSuccess('Servicio actualizado correctamente');
      toast.success('Servicio actualizado exitosamente');
    } catch (error) {
      const apiMsg = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;
      const status = error?.response?.status;
      const detail = Array.isArray(apiErrors) ? apiErrors.map(e => e.msg).join(' | ') : '';
      toast.error(`${status || ''} ${apiMsg || 'Error al actualizar el servicio'}${detail ? ': ' + detail : ''}`.trim());
      throw error;
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const servicio = servicios.find((s) => s.id_servicio === id || s.id === id);
      if (!servicio) return;
      
      const nuevoEstado = servicio.estado === 'activo' ? 'inactivo' : 'activo';
      const idToUpdate = servicio.id_servicio || servicio.id;
      
      await serviceService.updateService(idToUpdate, { ...servicio, estado: nuevoEstado });
      setServicios((prev) =>
        prev.map((s) =>
          (s.id_servicio === id || s.id === id)
            ? { ...s, estado: nuevoEstado }
            : s
        )
      );
      toast.success('Estado actualizado exitosamente');
    } catch (error) {
      toast.error('Error al cambiar el estado del servicio');
    }
  };

  const serviciosFiltrados = servicios
    .filter((s) => {
      if (filtro === 'todos') return true;
      const categoriaNombre = s.categoria?.nombre || s.categoria || '';
      if (filtro === 'mantenimiento') {
        return categoriaNombre.toLowerCase().includes('mantenimiento');
      }
      if (filtro === 'instalacion') {
        return categoriaNombre.toLowerCase().includes('instalacion');
      }
      return false;
    })
    .filter((s) =>
      (s.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (s.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
    );

  const indexInicio = (currentPage - 1) * serviciosPorPagina;
  const indexFin = indexInicio + serviciosPorPagina;
  const serviciosPaginados = serviciosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(serviciosFiltrados.length / serviciosPorPagina);

  return (
    <div className="p-6">

      {/* --------------------------- */}
      {/*   HEADER ESTANDARIZADO     */}
      {/* --------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">

        {/* TÍTULO A LA IZQUIERDA */}
        <h2 className="text-3xl font-bold text-[#000435]">
          SERVICIOS
        </h2>

        {/* BUSCADOR + BOTÓN A LA DERECHA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-0">
          <div className="relative">
          <input
            type="text"
            placeholder="Buscar servicio"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setCurrentPage(1);
            }}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            onClick={() => {
              setModalOpen(true);
              setEsEdicion(false);
              setSelectedService(null);
            }}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
          >
          <FaPlus />
            
             Nuevo Servicio
          </button>
        </div>
      </div>

      {/* Filtros */}
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
              ${filtro === tipo
                ? 'bg-[#000435] text-white border-[#000435]'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-[#e0e7ff] hover:text-[#000435] hover:border-[#cbd5e1]'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabla */}
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

      {/* Modal crear/editar */}
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

      {/* Modal ver */}
      <ServiceViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        servicio={selectedService}
      />
    </div>
  );
};

export default ServicesPage;
