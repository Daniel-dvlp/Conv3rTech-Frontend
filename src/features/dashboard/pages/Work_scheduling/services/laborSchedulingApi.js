// src/features/dashboard/pages/Work_scheduling/services/laborSchedulingApi.js
import api from '../../../../../services/api';

const LABOR_SCHEDULING_ENDPOINT = 'labor-scheduling';

export const laborSchedulingApi = {
  // Obtener todas las programaciones laborales
  getAllSchedulings: async () => {
    try {
      const response = await api.get(LABOR_SCHEDULING_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error al obtener programaciones laborales:', error);
      throw error;
    }
  },

  // Obtener una programación laboral por ID
  getSchedulingById: async (id) => {
    try {
      const response = await api.get(`${LABOR_SCHEDULING_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener programación laboral:', error);
      throw error;
    }
  },

  // Crear una nueva programación laboral
  createScheduling: async (schedulingData) => {
    try {
      const response = await api.post(LABOR_SCHEDULING_ENDPOINT, schedulingData);
      return response.data;
    } catch (error) {
      console.error('Error al crear programación laboral:', error);
      throw error;
    }
  },

  // Actualizar una programación laboral
  updateScheduling: async (id, schedulingData) => {
    try {
      const response = await api.put(`${LABOR_SCHEDULING_ENDPOINT}/${id}`, schedulingData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar programación laboral:', error);
      throw error;
    }
  },

  // Eliminar una programación laboral
  deleteScheduling: async (id) => {
    try {
      await api.delete(`${LABOR_SCHEDULING_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error al eliminar programación laboral:', error);
      throw error;
    }
  }
};

export default laborSchedulingApi;

