# Integración con API de Usuarios

## Descripción
Este módulo está completamente integrado con la API de usuarios desplegada en `https://backend-conv3rtech.onrender.com/api/users`.

## Estructura de Datos

### Usuario (API Response)
```json
{
  "id_usuario": 1,
  "documento": "12345678",
  "tipo_documento": "CC",
  "nombre": "Administrador",
  "apellido": "Sistema",
  "celular": "+573001234567",
  "correo": "admin@conv3rtech.com",
  "id_rol": 1,
  "estado_usuario": "Activo",
  "fecha_creacion": "2025-09-25T14:06:59.000Z",
  "rol": {
    "id_rol": 1,
    "nombre_rol": "Administrador",
    "descripcion": "Acceso completo a todos los módulos del sistema",
    "permisos": [...],
    "privilegios": [...]
  }
}
```

### Usuario (API Request)
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan@conv3rtech.com",
  "contrasena": "password123",
  "id_rol": 2,
  "documento": "1234567890",
  "tipo_documento": "CC",
  "celular": "3001234567"
}
```

## Servicios Implementados

### usersApi.js
- `getAllUsers()` - Obtener todos los usuarios
- `getUserById(id)` - Obtener usuario por ID
- `createUser(userData)` - Crear nuevo usuario
- `updateUser(id, userData)` - Actualizar usuario
- `deleteUser(id)` - Eliminar usuario
- `changeUserStatus(id, newStatus)` - Cambiar estado del usuario
- `searchUsers(searchTerm)` - Buscar usuarios

### rolesApi.js
- `getAllRoles()` - Obtener todos los roles
- `getRoleById(id)` - Obtener rol por ID

## Hooks Implementados

### useUsers.js
Hook personalizado que maneja:
- Estado de usuarios y roles
- Operaciones CRUD
- Loading states
- Error handling
- Toast notifications

## Componentes Actualizados

### UsersPage.jsx
- Integrado con `useUsers` hook
- Filtrado actualizado para estructura de API
- Paginación funcional

### UsersTable.jsx
- Mapeo de datos actualizado para estructura de API
- Acciones integradas con API

### CreateUserModal.jsx
- Formulario actualizado para enviar datos en formato de API
- Validaciones mantenidas
- Integración con roles de API

## Uso

```jsx
import { useUsers } from './hooks/useUsers';

const MyComponent = () => {
  const {
    usuarios,
    roles,
    loading,
    createUser,
    updateUser,
    deleteUser,
    changeUserStatus
  } = useUsers();

  // Los datos se cargan automáticamente
  // Las operaciones están listas para usar
};
```

## Endpoints Utilizados

- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
- `PATCH /api/users/:id/status` - Cambiar estado
- `GET /api/roles` - Listar roles

## Notas Importantes

1. **Autenticación**: Los endpoints requieren autenticación (token JWT)
2. **Validaciones**: Se mantienen las validaciones del frontend
3. **Error Handling**: Manejo de errores con toast notifications
4. **Loading States**: Estados de carga para mejor UX
5. **Estructura de Datos**: Mapeo correcto entre frontend y API
