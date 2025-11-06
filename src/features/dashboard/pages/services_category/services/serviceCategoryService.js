import api from '../../../../../services/api.js';

export const serviceCategoryService = {
  getAllCategories: async () => {
    const response = await api.get('/service-categories');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/service-categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const payload = {
      nombre: categoryData.nombre?.trim(),
      descripcion: categoryData.descripcion?.trim(),
      estado: (categoryData.estado || 'activo').toLowerCase(),
    };
    // Si no hay imagen, enviar una URL válida placeholder para APIs que la requieran
    payload.url_imagen = categoryData.url_imagen && categoryData.url_imagen.trim()
      ? categoryData.url_imagen.trim()
      : 'https://placehold.co/1x1.png';
    const response = await api.post('/service-categories', payload);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const payload = {
      nombre: categoryData.nombre?.trim(),
      descripcion: categoryData.descripcion?.trim(),
      estado: (categoryData.estado || 'activo').toLowerCase(),
    };
    if (categoryData.url_imagen !== undefined) {
      payload.url_imagen = categoryData.url_imagen || '';
    }
    const response = await api.put(`/service-categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/service-categories/${id}`);
    return response.data;
  },
};


