// src/features/dashboard/pages/clients/services/clientsApi.js
import api from '../../../../../services/api';

const CLIENTS_ENDPOINT = 'clients';

export const clientsApi = {
  // Obtener todos los clientes
  getAllClients: async () => {
    try {
      const response = await api.get(CLIENTS_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  // Obtener un cliente por ID
  getClientById: async (id) => {
    try {
      const response = await api.get(`${CLIENTS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw error;
    }
  },

  // Crear un nuevo cliente
  createClient: async (clientData) => {
    try {
      const response = await api.post(CLIENTS_ENDPOINT, clientData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },

  // Actualizar un cliente
  updateClient: async (id, clientData) => {
    try {
      const response = await api.put(`${CLIENTS_ENDPOINT}/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  },

  // Eliminar un cliente
  deleteClient: async (id) => {
    try {
      const response = await api.delete(`${CLIENTS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw error;
    }
  },

  // Cambiar estado del cliente (Activo/Inactivo)
  changeClientStatus: async (id, newStatus) => {
    try {
      const response = await api.patch(`${CLIENTS_ENDPOINT}/${id}/status`, {
        estado_cliente: newStatus
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del cliente:', error);
      throw error;
    }
  },

  // Cambiar estado de crédito del cliente
  changeCreditStatus: async (id, creditStatus) => {
    try {
      const response = await api.patch(`${CLIENTS_ENDPOINT}/${id}/credit`, {
        credito: creditStatus
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de crédito:', error);
      throw error;
    }
  },

  // Buscar clientes por término
  searchClients: async (searchTerm) => {
    try {
      const response = await api.get(`${CLIENTS_ENDPOINT}/search`, {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      throw error;
    }
  }
};

export default clientsApi;
