import api from "./api";

class SuppliersService {
  // Obtener todos los proveedores
  async getAllSuppliers() {
    try {
      const response = await api.get("/suppliers");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener proveedor por ID
  async getSupplierById(id) {
    try {
      const response = await api.get(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nuevo proveedor
  async createSupplier(supplierData) {
    try {
      const response = await api.post("/suppliers", supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar proveedor
  async updateSupplier(id, supplierData) {
    try {
      const response = await api.put(`/suppliers/${id}`, supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar proveedor
  async deleteSupplier(id) {
    try {
      const response = await api.delete(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado del proveedor
  async changeSupplierStatus(id, statusData) {
    try {
      const response = await api.put(`/suppliers/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new SuppliersService();
