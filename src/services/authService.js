import api from "./api";

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post("/auth/login", {
        correo: email,
        contrasena: password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Guardar token y datos del usuario
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");

        return { success: true, data: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión",
      };
    }
  }

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      // Limpiar datos de sesión siempre
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
    }
  }

  async refreshToken() {
    try {
      const response = await api.post("/auth/refresh");

      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem("token", token);
        return { success: true, token };
      }

      return { success: false };
    } catch (error) {
      console.error("Error refreshing token:", error);
      return { success: false };
    }
  }

  async getProfile() {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.put("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMyPermissions() {
    try {
      const response = await api.get("/auth/permissions");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  isAuthenticated() {
    return (
      localStorage.getItem("isAuthenticated") === "true" &&
      localStorage.getItem("token") !== null
    );
  }

  getToken() {
    return localStorage.getItem("token");
  }

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
}

export default new AuthService();
