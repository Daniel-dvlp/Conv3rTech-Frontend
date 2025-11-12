import api from "./api";

class LaborSchedulingService {
  // Obtener toda la programación laboral
  async getAllSchedules() {
    try {
      const response = await api.get("/labor-scheduling");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener programación por ID
  async getScheduleById(id) {
    try {
      const response = await api.get(`/labor-scheduling/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nueva programación
  async createSchedule(scheduleData) {
    try {
      const response = await api.post("/labor-scheduling", scheduleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar programación
  async updateSchedule(id, scheduleData) {
    try {
      const response = await api.put(`/labor-scheduling/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar programación
  async deleteSchedule(id) {
    try {
      const response = await api.delete(`/labor-scheduling/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener programación por usuario
  async getSchedulesByUser(userId) {
    try {
      const response = await api.get(`/labor-scheduling/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener programación por fecha
  async getSchedulesByDate(date) {
    try {
      const response = await api.get(`/labor-scheduling/date/${date}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener programación por rango de fechas
  async getSchedulesByDateRange(startDate, endDate) {
    try {
      const response = await api.get(
        `/labor-scheduling/date-range?start=${startDate}&end=${endDate}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new LaborSchedulingService();
