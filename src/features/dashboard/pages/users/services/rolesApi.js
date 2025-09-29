// src/features/dashboard/pages/users/services/rolesApi.js
import api from '../../../../../services/api';

const ROLES_ENDPOINT = 'roles';

export const rolesApi = {
  // Obtener todos los roles
  getAllRoles: async () => {
    try {
      const response = await api.get(ROLES_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    }
  },

  // Obtener un rol por ID
  getRoleById: async (id) => {
    try {
      const response = await api.get(`${ROLES_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener rol:', error);
      throw error;
    }
  }
};

export default rolesApi;
