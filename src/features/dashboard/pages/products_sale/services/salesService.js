import api from '../../../../../services/api';

// Servicios para ventas de productos
export const salesService = {
  // Obtener todas las ventas
  getAllSales: async () => {
    try {
      const response = await api.get('/sales');
      return response.data;
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw error;
    }
  },

  // Obtener una venta por ID
  getSaleById: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener venta:', error);
      throw error;
    }
  },

  // Crear una nueva venta
  createSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      // El backend devuelve { message, data }
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    }
  },

  // Actualizar una venta
  updateSale: async (id, saleData) => {
    try {
      const response = await api.put(`/sales/${id}`, saleData);
      // El backend devuelve { message, data }
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      throw error;
    }
  },

  // Eliminar una venta
  deleteSale: async (id) => {
    try {
      const response = await api.delete(`/sales/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      throw error;
    }
  },

  // Cambiar estado de venta (ej: Anular)
  changeSaleState: async (id, estado, motivo_anulacion) => {
    try {
      const payload = { estado };
      if (motivo_anulacion) {
        payload.motivo_anulacion = motivo_anulacion;
      }
      const response = await api.patch(`/sales/${id}/estado`, payload);
      // El backend devuelve { message, data }
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('Error al cambiar estado de venta:', error);
      throw error;
    }
  },

  // Obtener detalles de una venta
  getSaleDetails: async (id) => {
    try {
      const response = await api.get(`/sales/details/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalles de venta:', error);
      throw error;
    }
  }
};

// Servicios para clientes (necesarios para las ventas)
export const clientsService = {
  // Obtener todos los clientes
  getAllClients: async () => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  // Obtener un cliente por ID
  getClientById: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw error;
    }
  },

  // Buscar cliente por documento
  getClientByDocument: async (documento) => {
    try {
      const response = await api.get(`/clients/document/${documento}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar cliente por documento:', error);
      throw error;
    }
  }
};
