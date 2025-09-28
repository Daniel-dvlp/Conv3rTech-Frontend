// src/features/dashboard/pages/payments_installments/services/projectPaymentsApi.js
import api from '../../../../../services/api';

const PROJECT_PAYMENTS_ENDPOINT = 'projects';

export const projectPaymentsApi = {
  // Crear pago para un proyecto
  createProjectPayment: async (projectId, paymentData) => {
    try {
      const response = await api.post(`${PROJECT_PAYMENTS_ENDPOINT}/${projectId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear pago del proyecto:', error);
      throw error;
    }
  },

  // Listar pagos de un proyecto
  getProjectPayments: async (projectId) => {
    try {
      const response = await api.get(`${PROJECT_PAYMENTS_ENDPOINT}/${projectId}/payments`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pagos del proyecto:', error);
      throw error;
    }
  },

  // Obtener pago específico de un proyecto
  getProjectPayment: async (projectId, paymentId) => {
    try {
      const response = await api.get(`${PROJECT_PAYMENTS_ENDPOINT}/${projectId}/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pago del proyecto:', error);
      throw error;
    }
  },

  // Cancelar pago de un proyecto
  cancelProjectPayment: async (projectId, paymentId) => {
    try {
      const response = await api.delete(`${PROJECT_PAYMENTS_ENDPOINT}/${projectId}/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al cancelar pago del proyecto:', error);
      throw error;
    }
  }
};

export default projectPaymentsApi;
