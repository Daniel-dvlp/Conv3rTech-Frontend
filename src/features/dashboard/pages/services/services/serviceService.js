import api from '../../../../../services/api.js';

export const serviceService = {
  getAllServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },

  getServiceById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  createService: async (serviceData) => {
    const payload = {
      nombre: serviceData.nombre?.trim(),
      descripcion: serviceData.descripcion?.trim(),
      precio: parseFloat(serviceData.precio) || 0,
      estado: (serviceData.estado || 'activo').toLowerCase(),
      id_categoria_servicio: parseInt(serviceData.id_categoria_servicio) || serviceData.categoriaId,
      duracion: serviceData.duracion || '',
    };
    // Si hay imagen, enviar URL (si es string) o placeholder
    payload.url_imagen = serviceData.url_imagen && serviceData.url_imagen.trim()
      ? serviceData.url_imagen.trim()
      : 'https://placehold.co/1x1.png';
    const response = await api.post('/services', payload);
    return response.data;
  },

  updateService: async (id, serviceData) => {
    const payload = {
      nombre: serviceData.nombre?.trim(),
      descripcion: serviceData.descripcion?.trim(),
      precio: parseFloat(serviceData.precio) || 0,
      estado: (serviceData.estado || 'activo').toLowerCase(),
    };
    if (serviceData.id_categoria_servicio !== undefined) {
      payload.id_categoria_servicio = parseInt(serviceData.id_categoria_servicio);
    } else if (serviceData.categoriaId !== undefined) {
      payload.id_categoria_servicio = parseInt(serviceData.categoriaId);
    }
    if (serviceData.duracion !== undefined) {
      payload.duracion = serviceData.duracion || '';
    }
    if (serviceData.url_imagen !== undefined) {
      payload.url_imagen = serviceData.url_imagen || 'https://placehold.co/1x1.png';
    }
    const response = await api.put(`/services/${id}`, payload);
    return response.data;
  },

  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

