import api from "./api";

class SalesService {
  // Obtener todas las ventas
  async getAllSales() {
    try {
      const response = await api.get("/sales");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener venta por ID
  async getSaleById(id) {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nueva venta
  async createSale(saleData) {
    try {
      const response = await api.post("/sales", saleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar venta
  async updateSale(id, saleData) {
    try {
      const response = await api.put(`/sales/${id}`, saleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar venta
  async deleteSale(id) {
    try {
      const response = await api.delete(`/sales/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado de la venta
  async changeSaleStatus(id, statusData) {
    try {
      const response = await api.put(`/sales/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener detalles de venta
  async getSaleDetails(saleId) {
    try {
      const response = await api.get(`/sales/details/sale/${saleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear detalle de venta
  async createSaleDetail(saleId, detailData) {
    try {
      const response = await api.post(`/sales/details`, {
        ...detailData,
        saleId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar detalle de venta
  async updateSaleDetail(id, detailData) {
    try {
      const response = await api.put(`/sales/details/${id}`, detailData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar detalle de venta
  async deleteSaleDetail(id) {
    try {
      const response = await api.delete(`/sales/details/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new SalesService();
