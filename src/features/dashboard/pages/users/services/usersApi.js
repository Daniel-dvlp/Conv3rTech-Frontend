// src/features/dashboard/pages/users/services/usersApi.js
import api from '../../../../../services/api';

const USERS_ENDPOINT = 'users';

export const usersApi = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    try {
      const response = await api.get(USERS_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtener un usuario por ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`${USERS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  // Crear un nuevo usuario
  createUser: async (userData) => {
    try {
      const response = await api.post(USERS_ENDPOINT, userData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  // Actualizar un usuario
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`${USERS_ENDPOINT}/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  // Eliminar un usuario
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`${USERS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  },

  // Cambiar estado del usuario (Activo/Inactivo)
  changeUserStatus: async (id, newStatus) => {
    try {
      const response = await api.patch(`${USERS_ENDPOINT}/${id}/status`, {
        estado_usuario: newStatus
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      throw error;
    }
  },

  // Buscar usuarios por término
  searchUsers: async (searchTerm) => {
    try {
      const response = await api.get(`${USERS_ENDPOINT}/search`, {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }
};

export default usersApi;
