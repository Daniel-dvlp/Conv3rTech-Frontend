import api from "./api";

// Servicios para productos
export const productsService = {
  // Obtener todos los productos
  getAllProducts: async () => {
    try {
      const response = await api.get('/products/products');
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  // Obtener un producto por ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw error;
    }
  },

  // Crear un nuevo producto
  createProduct: async (productData) => {
    try {
      console.log('📤 Enviando producto al backend:', productData);
      const response = await api.post('/products/products', productData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('✅ Respuesta del servidor:', response.data);
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('❌ Error al crear producto:', error);
      throw error;
    }
  },

  // Actualizar un producto
  updateProduct: async (id, productData) => {
    try {
      console.log('📤 Actualizando producto:', id, productData);
      
      // Enviar como JSON normal (las fotos ya están como URLs de Cloudinary)
      const response = await api.put(`/products/products/${id}`, productData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Producto actualizado:', response.data);
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      throw error;
    }
  },

  // Eliminar un producto
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/products/${id}`);
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
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('Error al crear característica:', error);
      throw error;
    }
  }
};

export default productsService;