import api from "./api";

class ServicesService {
  // Obtener todos los servicios
  async getAllServices() {
    try {
      const response = await api.get("/services");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener servicio por ID
  async getServiceById(id) {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nuevo servicio
  async createService(serviceData) {
    try {
      const response = await api.post("/services", serviceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar servicio
  async updateService(id, serviceData) {
    try {
      const response = await api.put(`/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar servicio
  async deleteService(id) {
    try {
      const response = await api.delete(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado del servicio
  async changeServiceStatus(id, statusData) {
    try {
      const response = await api.put(`/services/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ServicesService();
