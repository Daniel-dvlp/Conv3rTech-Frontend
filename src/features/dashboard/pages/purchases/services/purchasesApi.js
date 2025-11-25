// src/features/dashboard/pages/purchases/services/purchasesApi.js
import api from '../../../../../services/api';

const PURCHASES_ENDPOINT = 'purchases';

export const purchasesApi = {
  // Obtener todas las compras
  getAllPurchases: async () => {
    try {
      const response = await api.get(PURCHASES_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error al obtener compras:', error);
      throw error;
    }
  },

  // Obtener una compra por ID
  getPurchaseById: async (id) => {
    try {
      const response = await api.get(`${PURCHASES_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener compra:', error);
      throw error;
    }
  },

  // Crear una nueva compra
  createPurchase: async (purchaseData) => {
    try {
      const response = await api.post(PURCHASES_ENDPOINT, purchaseData);
      return response.data;
    } catch (error) {
      console.error('Error al crear compra:', error);
      throw error;
    }
  },

  // Actualizar una compra
  updatePurchase: async (id, purchaseData) => {
    try {
      const response = await api.put(`${PURCHASES_ENDPOINT}/${id}`, purchaseData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar compra:', error);
      throw error;
    }
  },

  // Eliminar una compra
  deletePurchase: async (id) => {
    try {
      await api.delete(`${PURCHASES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error al eliminar compra:', error);
      throw error;
    }
  },

  // Cambiar estado de la compra
  changePurchaseStatus: async (id, newStatus, motivo) => {
    try {
      const payload = { estado: newStatus, ...(motivo ? { motivo } : {}) };
      // Intento 1: PATCH /purchases/state/:id (documentado)
      try {
        await api.patch(`${PURCHASES_ENDPOINT}/state/${id}`, payload);
        return;
      } catch (err1) {
        const status1 = err1?.response?.status;
        // Intento 2: PATCH /purchases/:id/state (patrón usado en otros módulos)
        if (status1 === 404 || status1 === 400 || status1 === 405) {
          try {
            await api.patch(`${PURCHASES_ENDPOINT}/${id}/state`, payload);
            return;
          } catch (err2) {
            const status2 = err2?.response?.status;
            // Intento 3: PUT /purchases/:id con sólo { estado }
            if (status2 === 404 || status2 === 400 || status2 === 405) {
              await api.put(`${PURCHASES_ENDPOINT}/${id}`, payload);
              return;
            }
            throw err2;
          }
        }
        throw err1;
      }
    } catch (error) {
      console.error('Error al cambiar estado de la compra:', error);
      throw error;
    }
  }
};

export default purchasesApi;

