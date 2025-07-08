import { useState, useEffect } from 'react';
import { hasAccess, canManage, getAccessibleModules } from '../config/rolePermissions';

export const usePermissions = () => {
  const [userRole, setUserRole] = useState(null);
  const [accessibleModules, setAccessibleModules] = useState([]);

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      try {
        const userData = JSON.parse(userFromStorage);
        setUserRole(userData.role);
        setAccessibleModules(getAccessibleModules(userData.role));
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserRole('Usuario');
        setAccessibleModules([]);
      }
    }
  }, []);

  const checkAccess = (module) => {
    return hasAccess(userRole, module);
  };

  const checkManage = (module) => {
    return canManage(userRole, module);
  };

  const filterMenuItems = (menuItems) => {
    return menuItems.filter(item => {
      // Si el item tiene children, verificar si al menos uno es accesible
      if (item.children) {
        const accessibleChildren = item.children.filter(child => 
          checkAccess(child.path.replace('/dashboard/', ''))
        );
        return accessibleChildren.length > 0;
      }
      // Si es un item directo, verificar acceso
      return checkAccess(item.path.replace('/dashboard/', ''));
    }).map(item => {
      // Si tiene children, filtrar solo los accesibles
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => 
            checkAccess(child.path.replace('/dashboard/', ''))
          )
        };
      }
      return item;
    });
  };

  return {
    userRole,
    accessibleModules,
    checkAccess,
    checkManage,
    filterMenuItems
  };
};
