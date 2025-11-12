import api from "./api";

class PaymentsInstallmentsService {
  // Obtener todos los pagos y abonos
  async getAllPaymentsInstallments() {
    try {
      const response = await api.get("/payments-installments");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener pago/abono por ID
  async getPaymentInstallmentById(id) {
    try {
      const response = await api.get(`/payments-installments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Crear nuevo pago/abono
  async createPaymentInstallment(paymentData) {
    try {
      const response = await api.post("/payments-installments", paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar pago/abono
  async updatePaymentInstallment(id, paymentData) {
    try {
      const response = await api.put(
        `/payments-installments/${id}`,
        paymentData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar pago/abono
  async deletePaymentInstallment(id) {
    try {
      const response = await api.delete(`/payments-installments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener pagos por cliente
  async getPaymentsByClient(clientId) {
    try {
      const response = await api.get(
        `/payments-installments/client/${clientId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener pagos por proyecto
  async getPaymentsByProject(projectId) {
    try {
      const response = await api.get(
        `/payments-installments/project/${projectId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new PaymentsInstallmentsService();
