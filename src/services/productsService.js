import api from "./api";

class ProductsService {
  // Obtener todos los productos
  async getAllProducts() {
    try {
      const response = await api.get("/products/products");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener producto por ID
  async getProductById(id) {
    try {
      const response = await api.get(`/products/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nuevo producto
  async createProduct(productData) {
    try {
      const response = await api.post("/products/products", productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar producto
  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar producto
  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado del producto
  async changeProductState(id, stateData) {
    try {
      const response = await api.patch(
        `/products/products/${id}/estado`,
        stateData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener características del producto
  async getProductFeatures(productId) {
    try {
      const response = await api.get(`/products/features/product/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear característica del producto
  async createProductFeature(featureData) {
    try {
      const response = await api.post("/products/features", featureData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar característica del producto
  async updateProductFeature(id, featureData) {
    try {
      const response = await api.put(`/products/features/${id}`, featureData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar característica del producto
  async deleteProductFeature(id) {
    try {
      const response = await api.delete(`/products/features/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener datasheets del producto
  async getProductDatasheets(productId) {
    try {
      const response = await api.get(
        `/products/datasheets/product/${productId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear datasheet del producto
  async createProductDatasheet(datasheetData) {
    try {
      const response = await api.post("/products/datasheets", datasheetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar datasheet del producto
  async updateProductDatasheet(id, datasheetData) {
    try {
      const response = await api.put(
        `/products/datasheets/${id}`,
        datasheetData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar datasheet del producto
  async deleteProductDatasheet(id) {
    try {
      const response = await api.delete(`/products/datasheets/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductsService();
