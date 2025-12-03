import api from "./api";

class QuotesService {
  // Obtener todas las cotizaciones
  async getAllQuotes() {
    try {
      const response = await api.get("/quotes");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener cotización por ID
  async getQuoteById(id) {
    try {
      const response = await api.get(`/quotes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nueva cotización
  async createQuote(quoteData) {
    try {
      const response = await api.post("/quotes", quoteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar cotización
  async updateQuote(id, quoteData) {
    try {
      const response = await api.put(`/quotes/${id}`, quoteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar cotización
  async deleteQuote(id) {
    try {
      const response = await api.delete(`/quotes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado de la cotización
  async changeQuoteStatus(id, statusData) {
    try {
      const response = await api.patch(`/quotes/${id}/estado`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener detalles de cotización
  async getQuoteDetails(quoteId) {
    try {
      const response = await api.get(`/quotes/details/quote/${quoteId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear detalle de cotización
  async createQuoteDetail(quoteId, detailData) {
    try {
      const response = await api.post(`/quotes/details`, {
        ...detailData,
        quoteId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar detalle de cotización
  async updateQuoteDetail(id, detailData) {
    try {
      const response = await api.put(`/quotes/details/${id}`, detailData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar detalle de cotización
  async deleteQuoteDetail(id) {
    try {
      const response = await api.delete(`/quotes/details/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new QuotesService();
