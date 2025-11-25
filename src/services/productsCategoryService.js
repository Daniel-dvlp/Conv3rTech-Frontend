import api from "./api";

class ProductsCategoryService {
  // Obtener todas las categorías de productos
  async getAllCategories() {
    try {
      const response = await api.get("/productsCategory");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener categoría por ID
  async getCategoryById(id) {
    try {
      const response = await api.get(`/productsCategory/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nueva categoría
  async createCategory(categoryData) {
    try {
      const response = await api.post("/productsCategory", categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar categoría
  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/productsCategory/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar categoría
  async deleteCategory(id) {
    try {
      const response = await api.delete(`/productsCategory/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado de la categoría
  async changeCategoryStatus(id, statusData) {
    try {
      const response = await api.put(
        `/productsCategory/${id}/status`,
        statusData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductsCategoryService();
