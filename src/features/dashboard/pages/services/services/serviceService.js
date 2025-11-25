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
    // 🟩 VALIDACIÓN: Descripción
    if (!serviceData.descripcion || serviceData.descripcion.trim().length < 10) {
      throw new Error('La descripción debe tener al menos 10 caracteres.');
    }
    if (serviceData.descripcion.trim().length > 300) {
      throw new Error('La descripción no puede superar los 300 caracteres.');
    }

    // ✅ No se permiten caracteres especiales en la descripción
    const regexDescripcion = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ.,\s-]+$/;
    if (!regexDescripcion.test(serviceData.descripcion.trim())) {
      throw new Error('La descripción contiene caracteres no válidos.');
    }

    // 🟩 VALIDACIÓN: Nombre (no vacío)
    if (!serviceData.nombre || serviceData.nombre.trim() === '') {
      throw new Error('El nombre del servicio no puede estar vacío.');
    }

    // 🟩 VALIDACIÓN: Nombre único
    const existingServices = await api.get('/services');
    const nombreExistente = existingServices.data.some(
      (s) => s.nombre.toLowerCase() === serviceData.nombre.trim().toLowerCase()
    );
    if (nombreExistente) {
      throw new Error('Ya existe un servicio con este nombre.');
    }

    // 🟩 VALIDACIÓN: Precio
    const precio = parseFloat(serviceData.precio);
    if (isNaN(precio)) {
      throw new Error('El precio debe ser un número válido.');
    }
    if (precio < 0) {
      throw new Error('El precio no puede ser negativo.');
    }
    if (precio > 9999999) {
      throw new Error('El precio no puede superar los 9,999,999.');
    }

    // 🟩 VALIDACIÓN: Estado
    const estadoValido = ['activo', 'inactivo'];
    const estado = (serviceData.estado || '').toLowerCase().trim();
    if (!estado || !estadoValido.includes(estado)) {
      throw new Error('El estado debe ser "activo" o "inactivo".');
    }

    // 🟩 VALIDACIÓN: Categoría del servicio
    const idCategoria = parseInt(serviceData.id_categoria_servicio) || parseInt(serviceData.categoriaId);
    if (isNaN(idCategoria)) {
      throw new Error('La categoría del servicio debe ser un número válido.');
    }

    // 🟩 VALIDACIÓN: Duración
    if (serviceData.duracion !== undefined) {
      if (typeof serviceData.duracion !== 'string') {
        throw new Error('La duración debe ser texto (por ejemplo: "30 minutos").');
      }
      if (serviceData.duracion.trim().length === 0) {
        throw new Error('La duración no puede estar vacía.');
      }
      if (serviceData.duracion.trim().length > 50) {
        throw new Error('La duración no puede superar los 50 caracteres.');
      }
      if (serviceData.duracion.trim().match(/^0+$/)) {
        throw new Error('La duración no puede ser cero.');
      }
    }

    // Construcción del payload
    const payload = {
      nombre: serviceData.nombre.trim(),
      descripcion: serviceData.descripcion.trim(),
      precio,
      estado,
      id_categoria_servicio: idCategoria,
      duracion: serviceData.duracion?.trim() || '',
      url_imagen: serviceData.url_imagen?.trim() || 'https://placehold.co/1x1.png',
    };

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
