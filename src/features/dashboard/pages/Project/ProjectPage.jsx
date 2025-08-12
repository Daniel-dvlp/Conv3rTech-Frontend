// src/features/dashboard/pages/project/ProjectPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaFileExcel, FaTruck } from 'react-icons/fa';
import { mockProjects } from './data/projects.data';
import ProjectsTable from './components/ProjectsTable';
import TableSkeleton from '../../../../shared/components/TableSkeleton';
import Pagination from '../../../../shared/components/Pagination';
import ProjectDetailModal from './components/ProjectDetailModal';
import NewProjectModal from './components/NewProjectModal';
import EditProjectModal from './components/EditProjectModal';
import SalidaMaterialModal from './components/SalidaMaterialModal';
import * as XLSX from 'xlsx';
import { showToast, showAlert } from '../../../../shared/utils/alertas';
import { usePermissions } from '../../../../shared/hooks/usePermissions';

// --- CONSTANTE PARA EL NÚMERO DE ELEMENTOS POR PÁGINA ---
const ITEMS_PER_PAGE = 5;

const ProjectPage = () => {
  const { checkManage } = usePermissions();
  // --- TODA TU LÓGICA DE ESTADO Y FUNCIONES PERMANECE EXACTAMENTE IGUAL ---
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showSalidaModal, setShowSalidaModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setAllProjects(mockProjects);
      setLoading(false);
    }, 1500);
  }, []);

  // --- AQUÍ ES DONDE SE AÑADE LA LÓGICA DE FILTRADO Y PÁGINACIÓN --- 

  const filteredProjects = useMemo(() =>
  allProjects.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.responsable?.nombre?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    p.responsable?.apellido?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    p.numeroContrato.toString().includes(searchTerm) ||
    p.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.prioridad.toLowerCase().includes(searchTerm.toLowerCase())
  ), [allProjects, searchTerm]
);

  // --- AQUÍ SE CALCULA EL NÚMERO TOTAL DE PÁGINAS Y SE REALIZA LA PÁGINACIÓN ---
  // --- NO CAMBIA NADA MÁS EN ESTA SECCIÓN ---
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  // --- AQUÍ SE MANTIENE LA FUNCIÓN DE EXPORTACIÓN A EXCEL ---
  // --- NO CAMBIA NADA MÁS EN ESTA SECCIÓN ---
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredProjects);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proyectos");
    XLSX.writeFile(workbook, "ReporteDeProyectos.xlsx");
  };

  // --- AQUÍ SE MANTIENE LA FUNCIÓN PARA AÑADIR NUEVOS PROYECTOS ---
  const handleAddProject = (newProject) => {
    try {
      setAllProjects(prev => [newProject, ...prev]);
      setShowNewModal(false);
      showToast('Proyecto creado exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear el proyecto', 'error');
    }
  };

  // Editar proyecto
  const handleUpdateProject = (updatedProject) => {
    try {
      setAllProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      setEditingProject(null);
      showToast('Proyecto actualizado exitosamente', 'success');
    } catch (error) {
      showToast('Error al actualizar el proyecto', 'error');
    }
  };

  // Eliminar proyecto
  const handleDeleteProject = async (project) => {
    const result = await showAlert({
      title: '¿Estás seguro?',
      text: `¿Seguro que deseas eliminar el proyecto "${project.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      try {
        setAllProjects(prev => prev.filter(p => p.id !== project.id));
        showToast('Proyecto eliminado exitosamente', 'success');
      } catch (error) {
        showToast('Error al eliminar el proyecto', 'error');
      }
    }
  };

  // Manejar salida de material
  const handleSaveSalida = (nuevaSalida) => {
    try {
      // Encontrar el proyecto y la sede
      const proyectoIndex = allProjects.findIndex(p => p.nombre === nuevaSalida.proyecto);
      if (proyectoIndex === -1) {
        showToast('Proyecto no encontrado', 'error');
        return;
      }

      const proyecto = allProjects[proyectoIndex];
      const sedeIndex = proyecto.sedes.findIndex(s => s.nombre === nuevaSalida.sede);
      if (sedeIndex === -1) {
        showToast('Sede no encontrada', 'error');
        return;
      }

      // Actualizar el proyecto con la nueva salida
      const proyectosActualizados = [...allProjects];
      const proyectoActualizado = { ...proyecto };
      const sedeActualizada = { ...proyecto.sedes[sedeIndex] };

      // Agregar la salida al historial
      if (!sedeActualizada.salidasMaterial) {
        sedeActualizada.salidasMaterial = [];
      }
      sedeActualizada.salidasMaterial.push(nuevaSalida);

      // Actualizar presupuesto restante
      if (sedeActualizada.presupuesto) {
        sedeActualizada.presupuesto.restante = (sedeActualizada.presupuesto.restante || sedeActualizada.presupuesto.total) - nuevaSalida.costoTotal;
      }

      proyectoActualizado.sedes[sedeIndex] = sedeActualizada;
      proyectosActualizados[proyectoIndex] = proyectoActualizado;

      setAllProjects(proyectosActualizados);
      showToast('Salida de material registrada exitosamente', 'success');
    } catch (error) {
      showToast('Error al registrar la salida de material', 'error');
    }
  };

  const projectTableHeaders = ['Proyecto', 'Responsable', 'Fechas', 'Estado', 'Prioridad', 'Progreso', 'Acciones'];
  // --------------------------------------------------------------------

  return (
    <div className="p-4 md:p-8 relative">
      
      {/* --- ESTA LÍNEA ES LA ÚNICA QUE CAMBIA PARA EL DISEÑO RESPONSIVE --- */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
      
        <h1 className="text-3xl font-bold text-gray-800 text-m">Proyectos</h1>
        
        {/* El contenedor de los botones ya es responsive con 'flex-wrap' */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar proyecto o cliente..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors text-sm"
          >
            <FaFileExcel />
            Exportar
          </button>
          {checkManage('salida_material') && (
            <button
              onClick={() => setShowSalidaModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors text-sm"
            >
              <FaTruck />
              Salida de Material
            </button>
          )}
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-colors text-sm"
          >
            <FaPlus />
            Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* El resto del componente no cambia */}
      {loading ? (
        <TableSkeleton headers={projectTableHeaders} rowCount={ITEMS_PER_PAGE} />
      ) : (
        <ProjectsTable
          projects={paginatedProjects}
          onViewDetails={(project) => setSelectedProject(project)}
          onEditProject={(project) => setEditingProject(project)}
          onDeleteProject={handleDeleteProject}
        />
      )}

      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={(project) => {
            setEditingProject(project);
            setSelectedProject(null);
          }}
        />
      )}

      {showNewModal && (
        <NewProjectModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSave={handleAddProject}
        />
      )}

      {editingProject && (
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onUpdate={handleUpdateProject}
          project={(() => {
            // Adaptar responsable y empleadosAsociados a string para el modal
            const p = editingProject;
            return {
              ...p,
              responsable: typeof p.responsable === 'object' && p.responsable?.nombre ? p.responsable.nombre : (p.responsable || ''),
              empleadosAsociados: Array.isArray(p.empleadosAsociados)
                ? p.empleadosAsociados.map(emp => typeof emp === 'object' && emp.nombre ? emp.nombre : emp)
                : [],
            };
          })()}
        />
      )}

      {showSalidaModal && (
        <SalidaMaterialModal
          isOpen={showSalidaModal}
          onClose={() => setShowSalidaModal(false)}
          onSaveSalida={handleSaveSalida}
        />
      )}
    </div>
  );
};

export default ProjectPage;