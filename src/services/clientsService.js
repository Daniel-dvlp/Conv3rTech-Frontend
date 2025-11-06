import api from "./api";

class ClientsService {
  // Obtener todos los clientes
  async getAllClients() {
    try {
      const response = await api.get("/clients");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener cliente por ID
  async getClientById(id) {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nuevo cliente
  async createClient(clientData) {
    try {
      const response = await api.post("/clients", clientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar cliente
  async updateClient(id, clientData) {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar cliente
  async deleteClient(id) {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar clientes
  async searchClients(term) {
    try {
      const response = await api.get(`/clients/search/${term}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar crédito del cliente
  async changeClientCredit(id, creditData) {
    try {
      const response = await api.put(`/clients/${id}/credit`, creditData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado del cliente
  async changeClientStatus(id, statusData) {
    try {
      const response = await api.put(`/clients/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ClientsService();
