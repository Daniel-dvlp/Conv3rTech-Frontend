import api from '../../../../../services/api';

// Servicios para cotizaciones
export const quotesService = {
  // Obtener todas las cotizaciones
  getAllQuotes: async () => {
    const response = await api.get('/quotes');
    return response.data?.data ?? response.data;
  },

  // Obtener cotización por id
  getQuoteById: async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data?.data ?? response.data;
  },

  // Crear una nueva cotización
  createQuote: async (quoteData) => {
    const response = await api.post('/quotes', quoteData);
    // El backend suele responder { message, data }
    return response.data?.data ?? response.data;
  },

  // Cambiar estado de una cotización
  changeQuoteState: async (id, estado, motivoAnulacion = null) => {
    const payload = { estado };
    if (motivoAnulacion) {
      payload.motivo_anulacion = motivoAnulacion;
    }
    const response = await api.patch(`/quotes/${id}/estado`, payload);
    return response.data?.data ?? response.data;
  },

  // Actualizar cotización (campos base)
  updateQuote: async (id, data) => {
    const response = await api.put(`/quotes/${id}`, data);
    return response.data?.data ?? response.data;
  },

  // Detalles de una cotización
  getQuoteDetails: async (id) => {
    const response = await api.get(`/quotes/${id}/detalles`);
    return response.data?.data ?? response.data;
  },

  // Validar stock de productos
  validateStock: async (productId, quantity) => {
    const response = await api.post('/quotes/validate-stock', { id_producto: productId, cantidad: quantity });
    return response.data?.data ?? response.data;
  },
};

// Servicio simple para listar servicios (catálogo de servicios)
export const servicesCatalogApi = {
  getAllServices: async () => {
    const response = await api.get('/services');
    return response.data?.data ?? response.data;
  },
};

export default quotesService;


