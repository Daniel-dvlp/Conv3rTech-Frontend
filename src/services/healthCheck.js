import api from "./api";

class HealthCheckService {
  // Verificar si el backend está disponible
  async checkBackendHealth() {
    try {
      const response = await api.get("/health");
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("❌ Health check failed:", error);
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        details: error.response?.data,
      };
    }
  }

  // Probar conexión básica
  async testConnection() {
    try {
      const startTime = Date.now();
      const response = await api.get("/health");
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        success: true,
        responseTime: `${responseTime}ms`,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export default new HealthCheckService();
