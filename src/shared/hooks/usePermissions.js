import { useMemo } from "react";
import {
  hasAccess,
  canManage,
  getAccessibleModules,
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
    if (userRole === "Administrador" || userRole === "Admin") {
      return true;
    }
    // Preferir verificación dinámica
    if (hasPermission) {
      return hasPermission(module);
    }
    // Fallback
    return hasAccess(userRole, module);
  };

  const checkManage = (module) => {
    // Administrador puede gestionar todo
    if (userRole === "Administrador" || userRole === "Admin") {
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
    filterMenuItems,
  };
};
