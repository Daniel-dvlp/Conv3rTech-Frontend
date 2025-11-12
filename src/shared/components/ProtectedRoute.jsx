import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredModule = null }) => {
  const { isAuthenticated, user, loading, hasPermission } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" replace />;
  }

  // Si se especifica un módulo requerido, verificar permisos dinámicos del backend
  if (requiredModule) {
    // Administrador siempre tiene acceso total
    const isAdmin = user?.rol === "Administrador" || user?.rol === "Admin";
    const allowed = isAdmin || hasPermission(requiredModule);

    if (!allowed) {
      // Redirigir al dashboard si no tiene permisos para el módulo
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
