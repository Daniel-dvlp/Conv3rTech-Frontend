import api from "./api";

class PurchasesService {
  // Obtener todas las compras
  async getAllPurchases() {
    try {
      const response = await api.get("/purchases");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener compra por ID
  async getPurchaseById(id) {
    try {
      const response = await api.get(`/purchases/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nueva compra
  async createPurchase(purchaseData) {
    try {
      const response = await api.post("/purchases", purchaseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar compra
  async updatePurchase(id, purchaseData) {
    try {
      const response = await api.put(`/purchases/${id}`, purchaseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar compra
  async deletePurchase(id) {
    try {
      const response = await api.delete(`/purchases/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado de la compra
  async changePurchaseStatus(id, statusData) {
    try {
      const response = await api.put(`/purchases/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener detalles de compra
  async getPurchaseDetails(purchaseId) {
    try {
      const response = await api.get(`/purchases/${purchaseId}/details`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear detalle de compra
  async createPurchaseDetail(purchaseId, detailData) {
    try {
      const response = await api.post(
        `/purchases/${purchaseId}/details`,
        detailData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar detalle de compra
  async updatePurchaseDetail(purchaseId, detailId, detailData) {
    try {
      const response = await api.put(
        `/purchases/${purchaseId}/details/${detailId}`,
        detailData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar detalle de compra
  async deletePurchaseDetail(purchaseId, detailId) {
    try {
      const response = await api.delete(
        `/purchases/${purchaseId}/details/${detailId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new PurchasesService();
