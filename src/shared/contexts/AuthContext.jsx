import { createContext, useContext, useState, useEffect } from "react";
import authService from "../../services/authService";
import { showToast } from "../utils/alertas";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState(null);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const isAuth = localStorage.getItem("isAuthenticated") === "true";

      console.log("🔍 Checking auth status:", {
        token: !!token,
        userData: !!userData,
        isAuth,
      });

      if (token && userData && isAuth) {
        const parsedUser = JSON.parse(userData);
        console.log("👤 User data loaded:", parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Cargar permisos reales del backend
        try {
          const permissionsResponse = await authService.getMyPermissions();
          // El backend devuelve { success, data: {<mapping>} }
          const mapping = permissionsResponse?.data ?? null;
          setPermissions(mapping);
        } catch (error) {
          console.error("Error cargando permisos:", error);
          setPermissions(null);
        }
      } else {
        console.log("❌ No valid auth data found");
        setUser(null);
        setIsAuthenticated(false);
        setPermissions(null);
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting login for:", email);
      const response = await authService.login(email, password);
      console.log("📝 Login response:", response);

      if (response.success) {
        const { user: userData, token } = response.data;

        console.log("✅ Login successful, saving data:", {
          user: userData,
          token: !!token,
        });
        console.log("👤 User role:", userData.rol);

        // Guardar en localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("isAuthenticated", "true");

        setUser(userData);
        setIsAuthenticated(true);

        // Cargar permisos reales del backend
        try {
          const permissionsResponse = await authService.getMyPermissions();
          const mapping = permissionsResponse?.data ?? null;
          setPermissions(mapping);
        } catch (error) {
          console.error("Error cargando permisos:", error);
          setPermissions(null);
        }

        return { success: true, data: response.data };
      }

      console.log("❌ Login failed:", response.message);
      return { success: false, message: response.message };
    } catch (error) {
      console.error("💥 Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      // Limpiar datos de sesión
      setUser(null);
      setIsAuthenticated(false);
      setPermissions(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      
      // Mostrar mensaje de éxito
      showToast("Sesión cerrada correctamente", "success");
      return { success: true };
    } catch (error) {
      console.error("Error en logout:", error);
      showToast("Error al cerrar sesión. Inténtalo de nuevo.", "error");
      return { success: false, error };
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  // Nuevo: verificación de permiso y privilegio según mapping del backend
  const hasPermission = (permission) => {
    if (!permissions) return false;
    // permissions es un objeto: { [permisoNombre]: ["Crear", "Ver", ...] }
    return !!permissions[permission];
  };

  const hasPrivilege = (permission, privilege) => {
    if (!permissions) return false;
    const privs = permissions[permission];
    if (!Array.isArray(privs)) return false;
    return privs.includes(privilege);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.rol === role;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    permissions,
    login,
    logout,
    updateUser,
    refreshToken,
    hasPermission,
    hasPrivilege,
    hasRole,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
