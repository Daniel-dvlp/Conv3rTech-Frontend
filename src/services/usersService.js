import api from "./api";

class UsersService {
  // Obtener todos los usuarios
  async getAllUsers() {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuarios por rol
  async getUsersByRole(roleName) {
    try {
      const response = await api.get(`/users/role/${roleName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener mi perfil
  async getMyProfile() {
    try {
      const response = await api.get('/users/profile/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nuevo usuario
  async createUser(userData) {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar usuario
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado del usuario
  async changeUserStatus(id, statusData) {
    try {
      // Si statusData es string, convertirlo a objeto
      const payload = typeof statusData === 'string' 
        ? { estado_usuario: statusData } 
        : statusData;
        
      const response = await api.put(`/users/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Asignar rol a usuario
  async assignRoleToUser(id, roleData) {
    try {
      const response = await api.put(`/users/${id}/role`, roleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UsersService();
