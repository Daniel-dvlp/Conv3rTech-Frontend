import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { hasAccess } from "../config/rolePermissions";

const ProtectedRoute = ({ children, requiredModule = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

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

  // Si se especifica un módulo requerido, verificar permisos
  if (requiredModule) {
    const hasModuleAccess = hasAccess(user.rol, requiredModule);

    if (!hasModuleAccess) {
      // Redirigir al dashboard si no tiene permisos para el módulo
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
