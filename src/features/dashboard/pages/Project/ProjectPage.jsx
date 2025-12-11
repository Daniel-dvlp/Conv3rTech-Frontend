// src/features/dashboard/pages/project/ProjectPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { FaPlus, FaSearch, FaFileExcel } from "react-icons/fa";
import ProjectsTable from "./components/ProjectsTable";
import TableSkeleton from "../../../../shared/components/TableSkeleton";
import Pagination from "../../../../shared/components/Pagination";
import ProjectDetailModal from "./components/ProjectDetailModal";
import NewProjectModal from "./components/NewProjectModal";
import EditProjectModal from "./components/EditProjectModal";
import SalidaMaterialModal from "./components/SalidaMaterialModal";
import * as XLSX from "xlsx";
import { showToast, showAlert } from "../../../../shared/utils/alertas";
import { usePermissions } from "../../../../shared/hooks/usePermissions";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import projectsService from "../../../../services/projectsService";

// --- CONSTANTE PARA EL NÚMERO DE ELEMENTOS POR PÁGINA ---
const ITEMS_PER_PAGE = 5;

const ProjectPage = () => {
  const { checkManage } = usePermissions();
  const { hasPermission, hasPrivilege, user } = useAuth();
  
  // Verificar si es Técnico
  const isTecnico = user?.id_rol === 2 || user?.rol?.toLowerCase().includes('tecnico');
  const canCreate = !isTecnico && (hasPrivilege('Proyectos', 'Crear') || hasPrivilege('proyectos', 'Crear'));
  // --- TODA TU LÓGICA DE ESTADO Y FUNCIONES PERMANECE EXACTAMENTE IGUAL ---
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showSalidaModal, setShowSalidaModal] = useState(false);
  const [selectedProjectForSalida, setSelectedProjectForSalida] =
    useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projectsService.getAllProjects();
      if (response.success) {
        const projects = response.data || [];
        console.log('🔍 Verificación de Cotizaciones en ProjectsPage:', projects.map(p => ({
          id: p.id,
          nombre: p.nombre,
          cotizacion: p.cotizacion
        })));
        setAllProjects(projects);
      } else {
        showToast(response.message || "Error al cargar los proyectos", "error");
        setAllProjects([]);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error de conexión al cargar proyectos";
      showToast(errorMessage, "error");
      setAllProjects([]);
    }
    setLoading(false);
  };

  // --- AQUÍ ES DONDE SE AÑADE LA LÓGICA DE FILTRADO Y PÁGINACIÓN ---

  const filteredProjects = useMemo(() => {
    // Verificar que allProjects sea un array antes de usar filter
    if (!Array.isArray(allProjects)) {
      console.warn("⚠️ allProjects is not an array:", allProjects);
      return [];
    }

    // Filtrar por búsqueda
    let filtered = allProjects.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.responsable?.nombre
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase()) ||
        p.responsable?.apellido
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase()) ||
        p.numeroContrato.toString().includes(searchTerm) ||
        p.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prioridad.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Si es Técnico, filtrar solo los proyectos asignados a él (como responsable o empleado asociado)
    if (isTecnico) {
      filtered = filtered.filter(p => {
        const isResponsable = p.responsable?.id === user.id_usuario || p.responsable?.id === user.id;
        const isEmpleadoAsociado = p.empleadosAsociados?.some(emp => emp.id === user.id_usuario || emp.id === user.id);
        return isResponsable || isEmpleadoAsociado;
      });
    }

    return filtered;
  }, [allProjects, searchTerm, isTecnico, user]);

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
  const handleAddProject = async (newProject) => {
    try {
      const response = await projectsService.createProject(newProject);
      if (response.success) {
        loadProjects(); // Recargar la lista completa
        setShowNewModal(false);
        showToast("Proyecto creado exitosamente", "success");
      } else {
        showToast(response.message || "Error al crear el proyecto", "error");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      showToast("Error de conexión al crear proyecto", "error");
    }
  };

  // Editar proyecto
  const handleUpdateProject = async (updatedProject) => {
    try {
      const response = await projectsService.updateProject(
        updatedProject.id,
        updatedProject
      );
      if (response.success) {
        loadProjects(); // Recargar la lista completa
        setEditingProject(null);
        showToast("Proyecto actualizado exitosamente", "success");
      } else {
        showToast(
          response.message || "Error al actualizar el proyecto",
          "error"
        );
        throw new Error(response.message || "Error al actualizar el proyecto");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      showToast("Error de conexión al actualizar proyecto", "error");
      throw error;
    }
  };

  // Eliminar proyecto
  const handleDeleteProject = async (project) => {
    const result = await showAlert({
      title: "¿Estás seguro?",
      text: `¿Seguro que deseas eliminar el proyecto "${project.nombre}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        const response = await projectsService.deleteProject(project.id);
        if (response.success) {
          loadProjects(); // Recargar la lista completa
          showToast("Proyecto eliminado exitosamente", "success");
        } else {
          showToast(
            response.message || "Error al eliminar el proyecto",
            "error"
          );
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        showToast("Error de conexión al eliminar proyecto", "error");
      }
    }
  };

  // Manejar apertura de modal de salida de material para un proyecto específico
  const handleOpenSalidaModal = (project) => {
    setSelectedProjectForSalida(project);
    setShowSalidaModal(true);
  };

  // Manejar salida de material
  const handleSaveSalida = async (nuevaSalida) => {
    try {
      // Llamar al servicio backend para crear la salida de material
      const response = await projectsService.createSalidaMaterial(nuevaSalida);
      
      if (response && response.success) {
        showToast("Salida de material registrada exitosamente", "success");
        
        // Recargar los proyectos para reflejar los cambios en el inventario y presupuesto
        loadProjects();
        setShowSalidaModal(false);
      } else {
        throw new Error(response?.message || "Error desconocido al registrar salida");
      }
    } catch (error) {
      console.error("Error saving material exit:", error);
      showToast(error.message || "Error al registrar la salida de material", "error");
    }
  };

  // Manejar apertura de detalles del proyecto
  const handleViewDetails = async (project) => {
    try {
      // Mostrar spinner o indicador de carga si fuera necesario, 
      // pero por ahora solo intentamos obtener datos frescos
      const response = await projectsService.getProjectById(project.id);
      if (response.success && response.data) {
        setSelectedProject(response.data);
      } else {
        // Fallback al proyecto de la lista si falla
        setSelectedProject(project);
      }
    } catch (error) {
      console.error("Error loading project details:", error);
      setSelectedProject(project);
    }
  };

  // Manejar apertura de edición del proyecto
  const handleEditProject = async (project) => {
    try {
      const response = await projectsService.getProjectById(project.id);
      if (response.success && response.data) {
        setEditingProject(response.data);
      } else {
        setEditingProject(project);
      }
    } catch (error) {
      console.error("Error loading project details for editing:", error);
      setEditingProject(project);
    }
  };

  const projectTableHeaders = [
    "Proyecto",
    "Descripción",
    "Responsable",
    "Fechas",
    "Estado",
    "Prioridad",
    "Progreso",
    "Acciones",
  ];
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {hasPrivilege('proyectos_servicios', 'Exportar') && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors text-sm"
            >
              <FaFileExcel />
              Exportar
            </button>
          )}

          {canCreate && (
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 bg-conv3r-gold hover:bg-yellow-500 text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md transition-colors text-sm"
            >
              <FaPlus /> Nuevo Proyecto
            </button>
          )}
        </div>
      </div>

      {/* El resto del componente no cambia */}
      {loading ? (
        <TableSkeleton
          headers={projectTableHeaders}
          rowCount={ITEMS_PER_PAGE}
        />
      ) : (
        <ProjectsTable
          projects={paginatedProjects}
          onViewDetails={handleViewDetails}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onCreateSalida={handleOpenSalidaModal}
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
              responsable:
                typeof p.responsable === "object" && p.responsable?.nombre
                  ? p.responsable.nombre
                  : p.responsable || "",
              empleadosAsociados: Array.isArray(p.empleadosAsociados)
                ? p.empleadosAsociados.map((emp) =>
                    typeof emp === "object" && emp.nombre ? emp.nombre : emp
                  )
                : [],
            };
          })()}
        />
      )}

      {showSalidaModal && selectedProjectForSalida && (
        <SalidaMaterialModal
          isOpen={showSalidaModal}
          onClose={() => {
            setShowSalidaModal(false);
            setSelectedProjectForSalida(null);
          }}
          onSaveSalida={handleSaveSalida}
          selectedProject={selectedProjectForSalida}
        />
      )}
    </div>
  );
};

export default ProjectPage;
