// src/features/dashboard/pages/project/ProjectPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaFileExcel } from 'react-icons/fa';
import { mockProjects } from './data/projects.data';
import ProjectsTable from './components/ProjectsTable';
import TableSkeleton from '../../../../shared/components/TableSkeleton';
import Pagination from '../../../../shared/components/Pagination';
import ProjectDetailModal from './components/ProjectDetailModal';
import NewProjectModal from './components/NewProjectModal';
import * as XLSX from 'xlsx';

// --- CONSTANTE PARA EL NÚMERO DE ELEMENTOS POR PÁGINA ---
const ITEMS_PER_PAGE = 7;

const ProjectPage = () => {
  // --- TODA TU LÓGICA DE ESTADO Y FUNCIONES PERMANECE EXACTAMENTE IGUAL ---
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

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
    setAllProjects(prev => [newProject, ...prev]);
    setShowNewModal(false);
  };

  const projectTableHeaders = ['Proyecto', 'Responsable', 'Fechas', 'Estado', 'Prioridad', 'Progreso', 'Acciones'];
  // --------------------------------------------------------------------

  return (
    <div className="p-4 md:p-8 relative">
      
      {/* --- ESTA LÍNEA ES LA ÚNICA QUE CAMBIA PARA EL DISEÑO RESPONSIVE --- */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
      
        <h1 className="text-3xl font-bold text-gray-800">Proyectos</h1>
        
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <FaFileExcel />
            Exportar
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-colors"
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
        />
      )}

      {showNewModal && (
        <NewProjectModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSave={handleAddProject}
        />
      )}
    </div>
  );
};

export default ProjectPage;