// src/shared/services/projectsApi.js
import api from '../../services/api';

const PROJECTS_ENDPOINT = 'projects';

export const projectsApi = {
  // Obtener todos los proyectos
  getAllProjects: async () => {
    try {
      const response = await api.get(PROJECTS_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      throw error;
    }
  },

  // Obtener un proyecto por ID
  getProjectById: async (id) => {
    try {
      const response = await api.get(`${PROJECTS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener proyecto:', error);
      throw error;
    }
  },

  // Obtener saldo pendiente del proyecto
  getProjectOutstanding: async (id) => {
    try {
      const response = await api.get(`${PROJECTS_ENDPOINT}/${id}/outstanding`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener saldo pendiente:', error);
      throw error;
    }
  },

  // Buscar proyectos
  searchProjects: async (params) => {
    try {
      const response = await api.get(`${PROJECTS_ENDPOINT}/search`, { params });
      return response.data;
    } catch (error) {
      console.error('Error al buscar proyectos:', error);
      throw error;
    }
  }
};

export default projectsApi;