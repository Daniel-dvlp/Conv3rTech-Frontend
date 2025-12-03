import api from "./api";

class ProjectsService {
  // Obtener todos los proyectos
  async getAllProjects() {
    try {
      const response = await api.get("/projects");
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching projects:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener proyectos",
      };
    }
  }

  // Obtener un proyecto por ID
  async getProjectById(id) {
    try {
      const response = await api.get(`/projects/${id}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching project:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al obtener el proyecto",
      };
    }
  }

  // Crear un nuevo proyecto
  async createProject(projectData) {
    try {
      const response = await api.post("/projects", projectData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error creating project:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear el proyecto",
      };
    }
  }

  // Actualizar un proyecto
  async updateProject(id, projectData) {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error updating project:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al actualizar el proyecto",
      };
    }
  }

  // Eliminar un proyecto
  async deleteProject(id) {
    try {
      const response = await api.delete(`/projects/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting project:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al eliminar el proyecto",
      };
    }
  }

  // Obtener proyectos por cliente
  async getProjectsByClient(clientId) {
    try {
      const response = await api.get(`/projects/client/${clientId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching projects by client:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al obtener proyectos del cliente",
      };
    }
  }

  // Obtener proyectos por estado
  async getProjectsByStatus(status) {
    try {
      const response = await api.get(`/projects/status/${status}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching projects by status:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al obtener proyectos por estado",
      };
    }
  }

  // Actualizar estado del proyecto
  async updateProjectStatus(id, status) {
    try {
      const response = await api.patch(`/projects/${id}/status`, { status });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating project status:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al actualizar el estado del proyecto",
      };
    }
  }

  // Asignar técnico al proyecto
  async assignTechnician(projectId, technicianId) {
    try {
      const response = await api.patch(`/projects/${projectId}/assign`, {
        technicianId,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error assigning technician:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al asignar técnico",
      };
    }
  }

  // Obtener estadísticas de proyectos
  async getProjectStats() {
    try {
      const response = await api.get("/projects/stats");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching project stats:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al obtener estadísticas",
      };
    }
  }
}

export default new ProjectsService();
