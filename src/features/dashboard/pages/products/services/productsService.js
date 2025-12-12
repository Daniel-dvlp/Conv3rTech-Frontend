import api from '../../../../../services/api';

// Servicios para productos
export const productsService = {
  // Obtener todos los productos
  getAllProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  // Obtener un producto por ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw error;
    }
  },

  // Crear un nuevo producto
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      // El backend devuelve { message, data }
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  // Actualizar un producto
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      // El backend devuelve { message, data }
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      if (error.response) {
        console.error('Detalles del error (Backend):', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },

  // Eliminar un producto
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }
};

// Servicios para categorías de productos
export const categoriesService = {
  // Obtener todas las categorías
  getAllCategories: async () => {
    try {
      const response = await api.get('/productsCategory');
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  // Crear categoría
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/productsCategory', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  },

  // Actualizar categoría
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/productsCategory/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  },

  // Eliminar categoría
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/productsCategory/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  },

  // Cambiar estado de categoría
  changeStateCategory: async (id, state) => {
    try {
      const response = await api.patch(`/productsCategory/${id}`, { estado: state });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de categoría:', error);
      throw error;
    }
  }
};

// Servicios para características técnicas
export const featuresService = {
  // Obtener todas las características
  getAllFeatures: async () => {
    try {
      const response = await api.get('/products/features');
      return response.data;
    } catch (error) {
      console.error('Error al obtener características:', error);
      throw error;
    }
  },

  // Crear una nueva característica
  createFeature: async (featureData) => {
    try {
      const response = await api.post('/products/features', featureData);
      // El backend devuelve { message, data }
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('Error al crear característica:', error);
      throw error;
    }
  }
};
