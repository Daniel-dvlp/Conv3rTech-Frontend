# Sistema de Permisos por Roles - Conv3rTech

## 📋 Descripción General

Este sistema implementa un control de acceso basado en roles (RBAC - Role-Based Access Control) que permite mostrar diferentes módulos según el rol del usuario logueado.

## 🎯 Roles Disponibles

### 👑 **Administrador (Admin)**
- **Acceso completo** a todos los módulos
- **Gestión completa** de usuarios, roles, proveedores, productos, servicios, clientes y proyectos
- **Módulos accesibles**: Todos

### 👨‍💼 **Supervisor**
- **Acceso amplio** a la mayoría de módulos
- **Gestión** de proveedores, productos, servicios, clientes y proyectos
- **Módulos accesibles**: Dashboard, Usuarios, Compras, Servicios, Ventas, Perfil

### 🔧 **Técnico**
- **Acceso limitado** a servicios y proyectos
- **Gestión** de órdenes de servicio y proyectos de servicio
- **Módulos accesibles**: Dashboard, Órdenes de Servicio, Programación Laboral, Proyectos de Servicio, Citas, Perfil

### 📞 **Recepcionista**
- **Acceso a clientes** y gestión de citas
- **Gestión** de clientes, citas y cotizaciones
- **Módulos accesibles**: Dashboard, Clientes, Citas, Cotizaciones, Venta de Productos, Pagos y Abonos, Perfil

## 🔧 Componentes Implementados

### 1. **rolePermissions.js**
- Configuración central de permisos por rol
- Funciones de verificación de acceso
- Mapeo de módulos accesibles por rol

### 2. **usePermissions.js** (Hook)
- Hook personalizado para manejar permisos
- Filtrado de menús según permisos
- Verificación de acceso y gestión

### 3. **ProtectedRoute.jsx**
- Componente de protección de rutas
- Verificación de autenticación y permisos
- Redirección automática si no tiene acceso

### 4. **Sidebar.jsx** (Actualizado)
- Filtrado dinámico de menús según rol
- Indicador visual del rol del usuario
- Solo muestra módulos accesibles

### 5. **AccessDenied.jsx**
- Página de acceso denegado
- Mensaje informativo y botón de regreso
- Diseño consistente con la aplicación

### 6. **UserPermissionsInfo.jsx**
- Componente informativo de permisos
- Muestra rol y módulos accesibles
- Información sobre módulos gestionables

## 🚀 Cómo Funciona

### 1. **Login y Autenticación**
```javascript
// Al hacer login, se guarda la información del usuario
const userInfo = {
  id: user.id,
  name: user.nombre,
  lastName: user.apellido,
  email: user.email,
  role: user.rol, // ← Rol clave para permisos
  // ... otros datos
};
localStorage.setItem('user', JSON.stringify(userInfo));
```

### 2. **Verificación de Permisos**
```javascript
// En cada ruta protegida
<ProtectedRoute requiredModule="usuarios">
  <UsersPages />
</ProtectedRoute>
```

### 3. **Filtrado de Menús**
```javascript
// El sidebar filtra automáticamente según el rol
const filteredMainMenuItems = filterMenuItems(mainMenuItems);
```

### 4. **Hook de Permisos**
```javascript
const { userRole, checkAccess, filterMenuItems } = usePermissions();
```

## 📊 Módulos por Rol

| Módulo | Admin | Supervisor | Técnico | Recepcionista |
|--------|-------|------------|---------|---------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Usuarios | ✅ | ✅ | ❌ | ❌ |
| Roles | ✅ | ❌ | ❌ | ❌ |
| Proveedores | ✅ | ✅ | ❌ | ❌ |
| Productos | ✅ | ✅ | ❌ | ❌ |
| Compras | ✅ | ✅ | ❌ | ❌ |
| Servicios | ✅ | ✅ | ✅ | ❌ |
| Órdenes de Servicio | ✅ | ✅ | ✅ | ❌ |
| Programación Laboral | ✅ | ✅ | ✅ | ❌ |
| Clientes | ✅ | ✅ | ❌ | ✅ |
| Venta de Productos | ✅ | ✅ | ❌ | ✅ |
| Citas | ✅ | ✅ | ✅ | ✅ |
| Cotizaciones | ✅ | ✅ | ❌ | ✅ |
| Proyectos | ✅ | ✅ | ✅ | ❌ |
| Pagos y Abonos | ✅ | ✅ | ❌ | ✅ |
| Perfil | ✅ | ✅ | ✅ | ✅ |

## 🔒 Seguridad

- **Verificación en Frontend**: Protección de rutas y menús
- **Verificación en Backend**: Recomendado implementar también en el backend
- **Persistencia**: Permisos se mantienen en localStorage
- **Logout**: Limpieza automática de permisos al cerrar sesión

## 🛠️ Uso en Componentes

### Verificar Acceso
```javascript
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { checkAccess } = usePermissions();
  
  if (!checkAccess('usuarios')) {
    return <AccessDenied moduleName="Usuarios" />;
  }
  
  return <div>Contenido del módulo</div>;
};
```

### Filtrar Elementos
```javascript
const { checkManage } = usePermissions();

// Solo mostrar botón de crear si puede gestionar
{checkManage('usuarios') && (
  <button>Crear Usuario</button>
)}
```

## 📝 Notas Importantes

1. **Solo Frontend**: Este sistema es solo para el frontend. En producción, implementar también en el backend.
2. **Roles Dinámicos**: Los roles están hardcodeados. Para mayor flexibilidad, considerar roles dinámicos desde la base de datos.
3. **Permisos Granulares**: Se puede extender para permisos más específicos (crear, editar, eliminar, etc.).
4. **Auditoría**: Considerar implementar logs de acceso para auditoría.

## 🔄 Extensibilidad

Para agregar nuevos roles o módulos:

1. **Agregar rol en `rolePermissions.js`**
2. **Actualizar la tabla de permisos**
3. **Probar con diferentes usuarios**

El sistema es completamente escalable y mantenible.