import React, { useState, useEffect } from 'react';
import ServicesTable from './components/ServicesTable';
import SkeletonCard from './components/SkeletonCard';
import ServiceFormModal from './components/ServiceFormModal';
import ServiceViewModal from './components/ServiceViewModal';
import { showSuccess, confirmDelete } from '../../../../shared/utils/alerts.js';
import { serviceService } from './services/serviceService.js';
import cloudinaryService from '../../../../services/cloudinaryService';
import { toast } from 'react-hot-toast';
import { FaPlus, FaSearch } from "react-icons/fa";
<<<<<<< HEAD

=======
>>>>>>> origin/dev

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
      // Obtener el servicio para acceder a su imagen
      const servicio = servicios.find((s) => s.id_servicio === id || s.id === id);
      
      // Eliminar imagen de Cloudinary si existe
      if (servicio?.url_imagen && servicio.url_imagen.includes('res.cloudinary.com')) {
        try {
          await cloudinaryService.deleteImage(servicio.url_imagen);
          console.log('✅ Imagen eliminada de Cloudinary');
        } catch (deleteError) {
          console.error('❌ Error al eliminar imagen de Cloudinary:', deleteError);
          // Continuar con la eliminación del servicio aunque falle la imagen
        }
      }
      
      // Eliminar servicio del backend
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
      setModalOpen(false);
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
      
      // Obtener el servicio actual para comparar imágenes
      const servicioActual = servicios.find((s) => s.id_servicio === id || s.id === id);
      
      // Si cambió la imagen y la antigua era de Cloudinary, eliminarla
      if (servicioActual?.url_imagen && 
          servicioActual.url_imagen !== servicioEditado.url_imagen &&
          servicioActual.url_imagen.includes('res.cloudinary.com')) {
        try {
          await cloudinaryService.deleteImage(servicioActual.url_imagen);
          console.log('✅ Imagen anterior eliminada de Cloudinary');
        } catch (deleteError) {
          console.error('❌ Error al eliminar imagen anterior:', deleteError);
          // Continuar con la actualización aunque falle la eliminación
        }
      }
      
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


  const serviciosFiltrados = servicios.filter((s) =>
    (s.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (s.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexInicio = (currentPage - 1) * serviciosPorPagina;
  const indexFin = indexInicio + serviciosPorPagina;
  const serviciosPaginados = serviciosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(serviciosFiltrados.length / serviciosPorPagina);

  return (
    <div className="p-6">
<<<<<<< HEAD

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
=======
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#000435]">SERVICIOS</h2>

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
>>>>>>> origin/dev
          </button>
        </div>
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