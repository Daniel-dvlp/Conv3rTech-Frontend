// src/features/dashboard/pages/payments_installments/services/paymentsApi.js
import api from '../../../../../services/api';

const PAYMENTS_ENDPOINT = 'payments-installments';

export const paymentsApi = {
  // Obtener todos los pagos/abonos
  getAllPayments: async () => {
    try {
      const response = await api.get(PAYMENTS_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      throw error;
    }
  },

  // Obtener un pago por ID
  getPaymentById: async (id) => {
    try {
      const response = await api.get(`${PAYMENTS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pago:', error);
      throw error;
    }
  },

  // Crear un nuevo pago/abono
  createPayment: async (paymentData) => {
    try {
      const response = await api.post(PAYMENTS_ENDPOINT, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear pago:', error);
      throw error;
    }
  },

  // Cancelar un pago
  cancelPayment: async (id) => {
    try {
      const response = await api.patch(`${PAYMENTS_ENDPOINT}/${id}/cancelar`);
      return response.data;
    } catch (error) {
      console.error('Error al cancelar pago:', error);
      throw error;
    }
  },

  // Buscar pagos por término
  searchPayments: async (term) => {
    try {
      const response = await api.get(`${PAYMENTS_ENDPOINT}/buscar/${term}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar pagos:', error);
      throw error;
    }
  }
};

export default paymentsApi;