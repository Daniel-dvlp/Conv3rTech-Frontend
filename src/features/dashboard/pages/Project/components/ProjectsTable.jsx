// src/features/dashboard/pages/project/components/ProjectsTable.jsx

import React from 'react';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Pequeño componente interno para la barra de progreso
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

const ProjectsTable = ({ projects, onViewDetails, onEditProject, onDeleteProject }) => {
  // Función para determinar el color del estado
  const getStatusClass = (status) => {
    switch (status) {
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'En Progreso': return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para los colores de prioridad
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-orange-100 text-orange-800';
      case 'Baja': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full text-m">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-m font-medium text-gray-500 uppercase tracking-wider">Numero de Contrato</th>
            <th className="px-6 py-4 text-left text-m font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
            {/* --- COLUMNAS REINTEGRADAS --- */}
            <th className="px-6 py-4 text-left text-m font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
            <th className="px-6 py-4 text-left text-m font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
            {/* --------------------------- */}
            <th className="px-6 py-4 text-left text-m font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-4 text-left text-m font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
            <th className="px-6 py-4 text-left text-m font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Progreso</th>
            <th className="px-6 py-4 text-right text-m font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <button onClick={() => onViewDetails(project)} className="font-bold text-blue-600 text-left text-m">
                  {project.numeroContrato}
                </button>
              </td>
              <td className="px-6 py-4">
                <button onClick={() => onViewDetails(project)} className="font-bold text-blue-600  text-left text-m">
                  {project.nombre}
                </button>
                <div className="text-m text-gray-500">Cliente: {project.cliente}</div>
              </td>
              {/* --- CELDAS REINTEGRADAS --- */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${project.responsable.avatarSeed}`}
                    alt={project.responsable.nombre}
                  />
                  <span className="text-m">{project.responsable.nombre}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-600">
                <div className="text-m">Inicio: {project.fechaInicio}</div>
                <div className="text-m">Fin: {project.fechaFin}</div>
              </td>
              {/* ------------------------- */}
              <td className="px-6 py-4">
                <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getStatusClass(project.estado)} text-m`}>
                  {project.estado}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getPriorityClass(project.prioridad)} text-m`}>
                  {project.prioridad}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <ProgressBar progress={project.progreso} />
                  <span className="text-m font-semibold">{project.progreso}%</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-4">
                   <button onClick={() => onViewDetails(project)} className="text-blue-400 hover:text-blue-600 text-m" title="Ver Detalles">
                    <FaEye size={16} />
                  </button>
                   <button onClick={() => onEditProject(project)} className="text-yellow-400 hover:text-yellow-600 text-m" title="Editar"><FaEdit size={16} /></button>
                   <button onClick={() => onDeleteProject(project)} className="text-red-400 hover:text-red-600 text-m" title="Eliminar"><FaTrashAlt size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;