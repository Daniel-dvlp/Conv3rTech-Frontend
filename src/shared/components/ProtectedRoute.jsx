import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasAccess } from '../config/rolePermissions';

const ProtectedRoute = ({ children, requiredModule = null }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const user = localStorage.getItem('user');

  if (!isAuthenticated || !user) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" replace />;
  }

  // Si se especifica un módulo requerido, verificar permisos
  if (requiredModule) {
    try {
      const userData = JSON.parse(user);
      const hasModuleAccess = hasAccess(userData.role, requiredModule);
      
      if (!hasModuleAccess) {
        // Redirigir al dashboard si no tiene permisos para el módulo
        return <Navigate to="/dashboard" replace />;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 