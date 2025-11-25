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
    const nombre = categoryData.nombre?.trim();
    const descripcion = categoryData.descripcion?.trim();
    const estado = (categoryData.estado || 'activo').toLowerCase();

    // 🔹 VALIDACIONES DEL NOMBRE
    if (!nombre) throw new Error('El nombre no puede estar vacío.');
    if (nombre.length < 20 || nombre.length > 50) {
      throw new Error('El nombre debe tener entre 20 y 50 caracteres.');
    }
    if (/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]/.test(nombre)) {
      throw new Error('El nombre no puede contener caracteres especiales.');
    }

    // 🔹 VALIDACIONES DE LA DESCRIPCIÓN
    if (!descripcion) throw new Error('La descripción no puede estar vacía.');
    if (descripcion.length < 20) {
      throw new Error('La descripción debe tener al menos 20 caracteres.');
    }
    if (descripcion.length < 100 || descripcion.length > 300) {
      throw new Error('La descripción debe tener entre 100 y 300 caracteres.');
    }
    if (/[^a-zA-Z0-9\s.,;:!?áéíóúÁÉÍÓÚñÑ]/.test(descripcion)) {
      throw new Error('La descripción contiene caracteres no permitidos.');
    }

    // Si no hay imagen, enviar una por defecto
    const payload = {
      nombre,
      descripcion,
      estado,
      url_imagen: categoryData.url_imagen?.trim() || 'https://placehold.co/1x1.png',
    };

    const response = await api.post('/service-categories', payload);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const nombre = categoryData.nombre?.trim();
    const descripcion = categoryData.descripcion?.trim();
    const estado = (categoryData.estado || 'activo').toLowerCase();

    // 🔹 VALIDACIONES DEL NOMBRE
    if (!nombre) throw new Error('El nombre no puede estar vacío.');
    if (nombre.length < 20 || nombre.length > 50) {
      throw new Error('El nombre debe tener entre 20 y 50 caracteres.');
    }
    if (/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]/.test(nombre)) {
      throw new Error('El nombre no puede contener caracteres especiales.');
    }

    // 🔹 VALIDACIONES DE LA DESCRIPCIÓN
    if (!descripcion) throw new Error('La descripción no puede estar vacía.');
    if (descripcion.length < 20) {
      throw new Error('La descripción debe tener al menos 20 caracteres.');
    }
    if (descripcion.length < 100 || descripcion.length > 300) {
      throw new Error('La descripción debe tener entre 100 y 300 caracteres.');
    }
    if (/[^a-zA-Z0-9\s.,;:!?áéíóúÁÉÍÓÚñÑ]/.test(descripcion)) {
      throw new Error('La descripción contiene caracteres no permitidos.');
    }

    const payload = {
      nombre,
      descripcion,
      estado,
      url_imagen: categoryData.url_imagen || '',
    };

    const response = await api.put(`/service-categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/service-categories/${id}`);
    return response.data;
  },
};
