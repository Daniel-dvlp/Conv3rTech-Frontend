import api from "./api";

class RolesService {
  // Obtener todos los roles
  async getAllRoles() {
    try {
      const response = await api.get("/roles");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching roles:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener roles",
      };
    }
  }

  // Obtener un rol por ID
  async getRoleById(id) {
    try {
      const response = await api.get(`/roles/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching role:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener el rol",
      };
    }
  }

  // Crear un nuevo rol
  async createRole(roleData) {
    try {
      console.log("📤 Sending role data:", roleData);
      const response = await api.post("/roles", roleData);
      console.log("✅ Role created successfully:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("❌ Error creating role:", error);
      console.error("📋 Error details:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
        data: error.response?.data,
      });

      // Log detallado de los errores específicos
      if (error.response?.data?.errors) {
        console.error("🔍 Validation errors:", error.response.data.errors);
        error.response.data.errors.forEach((err, index) => {
          console.error(`Error ${index + 1}:`, err);
        });
      }
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear el rol",
        errors: error.response?.data?.errors || [],
      };
    }
  }

  // Actualizar un rol
  async updateRole(id, roleData) {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating role:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar el rol",
      };
    }
  }

  // Eliminar un rol
  async deleteRole(id) {
    try {
      const response = await api.delete(`/roles/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting role:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al eliminar el rol",
      };
    }
  }

  // Obtener permisos disponibles
  async getAvailablePermissions() {
    try {
      const response = await api.get("/permissions");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener permisos",
      };
    }
  }

  // Asignar permisos a un rol
  async assignPermissionsToRole(roleId, permissions) {
    try {
      const response = await api.post(`/roles/${roleId}/permissions`, {
        permissions,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error assigning permissions:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al asignar permisos",
      };
    }
  }

  // Obtener permisos asignados de un rol específico
  async getRolePermissions(roleId) {
    try {
      const response = await api.get(`/roles/${roleId}/permissions`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al obtener permisos del rol",
      };
    }
  }

  // Obtener usuarios con un rol específico
  async getUsersByRole(roleId) {
    try {
      const response = await api.get(`/roles/${roleId}/users`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al obtener usuarios del rol",
      };
    }
  }
}

export default new RolesService();
