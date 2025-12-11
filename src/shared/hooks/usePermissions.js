import { useMemo } from "react";
import {
  hasAccess,
  canManage,
  getAccessibleModules,
  rolePermissions,
} from "../config/rolePermissions";
import { useAuth } from "../contexts/AuthContext";

export const usePermissions = () => {
  const { user, permissions, hasPermission, hasPrivilege } = useAuth();

  const userRole = user?.rol || null;
  console.log("🔐 usePermissions - User role:", userRole);

  const accessibleModules = useMemo(() => {
    // Preferir mapping dinámico del backend
    if (permissions && typeof permissions === "object") {
      const modules = Object.keys(permissions);
      console.log("📋 Accessible modules (backend mapping):", modules);
      return modules;
    }
    // Fallback al mapping estático por roles
    if (!userRole) return [];
    const modules = getAccessibleModules(userRole);
    console.log("📋 Accessible modules for", userRole, ":", modules);
    return modules;
  }, [permissions, userRole]);

  const checkAccess = (module) => {
    // Administrador siempre tiene acceso total
    if (userRole === "Administrador" || userRole === "Admin" || userRole === "administrador") {
      return true;
    }
    // Preferir verificación dinámica
    if (hasPermission) {
      return hasPermission(module);
    }
    // Fallback
    return hasAccess(userRole, module);
  };

  const canCreate = (module) => {
    if (userRole === "Administrador" || userRole === "Admin" || userRole === "administrador") return true;
    
    // 1. Preferir sistema dinámico si está cargado
    if (permissions && hasPrivilege) {
        return hasPrivilege(module, "Crear");
    }
    
    // 2. Fallback a configuración estática granular
    const staticPerms = rolePermissions[userRole]?.permissions?.[module];
    if (staticPerms && staticPerms.includes("Crear")) return true;

    return false;
  };

  const canEdit = (module) => {
    if (userRole === "Administrador" || userRole === "Admin" || userRole === "administrador") return true;
    
    if (permissions && hasPrivilege) {
        return hasPrivilege(module, "Editar");
    }
    
    // Fallback a configuración estática granular
    const staticPerms = rolePermissions[userRole]?.permissions?.[module];
    if (staticPerms && staticPerms.includes("Editar")) return true;

    return false;
  };

  const canDelete = (module) => {
    if (userRole === "Administrador" || userRole === "Admin" || userRole === "administrador") return true;
    
    if (permissions && hasPrivilege) {
        return hasPrivilege(module, "Eliminar");
    }
    
    // Fallback a configuración estática granular
    const staticPerms = rolePermissions[userRole]?.permissions?.[module];
    if (staticPerms && staticPerms.includes("Eliminar")) return true;

    return false;
  };

  const checkManage = (module) => {
    // Administrador puede gestionar todo
    if (userRole === "Administrador" || userRole === "Admin" || userRole === "administrador") {
      return true;
    }
    // Si hay privilegios del backend, comprobar alguno típico de gestión
    if (hasPrivilege) {
      const managePrivileges = [
        "Gestionar",
        "Administrar",
        "Crear",
        "Editar",
        "Eliminar",
      ];
      return managePrivileges.some((p) => hasPrivilege(module, p));
    }
    // Fallback a configuración estática
    return canManage(userRole, module);
  };

  const filterMenuItems = (menuItems) => {
    const filtered = menuItems
      .filter((item) => {
        // Si el item tiene children, verificar si al menos uno es accesible
        if (item.children) {
          const accessibleChildren = item.children.filter((child) => {
            const module = child.path.replace("/dashboard/", "");
            return checkAccess(module);
          });
          return accessibleChildren.length > 0;
        }
        // Si es un item directo, verificar acceso
        const module = item.path.replace("/dashboard/", "");
        return checkAccess(module);
      })
      .map((item) => {
        // Si tiene children, filtrar solo los accesibles
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) =>
              checkAccess(child.path.replace("/dashboard/", ""))
            ),
          };
        }
        return item;
      });

    return filtered;
  };

  return {
    userRole,
    accessibleModules,
    checkAccess,
    checkManage,
    canCreate,
    canEdit,
    canDelete,
    filterMenuItems,
  };
};
