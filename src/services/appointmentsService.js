import api from "./api";

class AppointmentsService {
  // Obtener todas las citas
  async getAllAppointments() {
    try {
      const response = await api.get("/appointments");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener cita por ID
  async getAppointmentById(id) {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nueva cita
  async createAppointment(appointmentData) {
    try {
      const response = await api.post("/appointments", appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar cita
  async updateAppointment(id, appointmentData) {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar cita
  async deleteAppointment(id) {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AppointmentsService();
