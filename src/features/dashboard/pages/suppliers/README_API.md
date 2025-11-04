# Integración con API de Proveedores (Suppliers)

## Descripción
Este módulo está completamente integrado con la API de proveedores desplegada en `https://backend-conv3rtech.onrender.com/api/suppliers`.

## Estructura de Datos

### Proveedor (API Response - Backend)
```json
{
  "id_proveedor": 1,
  "nit": "123456789",
  "nombre_empresa": "Tech Solutions S.A.",
  "nombre_encargado": "Juan Pérez García",
  "telefono": "+52 55 1234 5678",
  "correo": "juan.perez@example.com",
  "direccion": "Calle Reforma #123",
  "estado": true,
  "fecha_registro": "2024-01-15"
}
```

### Proveedor (Frontend - Transformado)
```json
{
  "id": 1,
  "nit": "123456789",
  "empresa": "Tech Solutions S.A.",
  "encargado": "Juan Pérez García",
  "telefono": "+52 55 1234 5678",
  "correo": "juan.perez@example.com",
  "direccion": "Calle Reforma #123",
  "estado": "Activo",
  "_backendData": { ...datos originales del backend }
}
```

### Proveedor (API Request - Backend)
```json
{
  "nit": "123456789",
  "nombre_empresa": "Tech Solutions S.A.",
  "nombre_encargado": "Juan Pérez García",
  "telefono": "+52 55 1234 5678",
  "correo": "juan.perez@example.com",
  "direccion": "Calle Reforma #123",
  "estado": true
}
```

## Servicios Implementados

### suppliersApi.js
- `getAllSuppliers()` - Obtener todos los proveedores
- `getSupplierById(id)` - Obtener proveedor por ID
- `createSupplier(supplierData)` - Crear nuevo proveedor
- `updateSupplier(id, supplierData)` - Actualizar proveedor
- `deleteSupplier(id)` - Eliminar proveedor
- `changeSupplierStatus(id, newStatus)` - Cambiar estado del proveedor

## Hooks Implementados

### useSuppliers.js
Hook personalizado que maneja:
- Estado de proveedores
- Operaciones CRUD
- Transformación de datos entre frontend y backend
- Cambio de estado
- Loading states
- Error handling
- Toast notifications

**Transformaciones automáticas:**
- **Backend → Frontend:** 
  - `id_proveedor` → `id`
  - `nombre_empresa` → `empresa`
  - `nombre_encargado` → `encargado`
  - `estado` (boolean) → `estado` (string: "Activo"/"Inactivo")

- **Frontend → Backend:**
  - `id` → se usa como parámetro de ruta
  - `empresa` → `nombre_empresa`
  - `encargado` → `nombre_encargado`
  - `estado` ("Activo"/"Inactivo") → `estado` (boolean)

## Componentes Actualizados

### SuppliersPage.jsx
- Integrado con `useSuppliers` hook
- Filtrado funcionando con estructura transformada
- Paginación funcional
- Búsqueda mejorada
- Handlers async para operaciones CRUD

### SuppliersTable.jsx
- Mapeo de datos actualizado para estructura transformada
- Columnas de estado
- Acciones integradas con API
- Eliminación con confirmación SweetAlert2

### NewSuppliersModal.jsx
- Formulario actualizado para enviar datos en formato frontend
- Validaciones mantenidas
- Datos transformados automáticamente por el hook

### EditSupplierModal.jsx
- Formulario de edición actualizado
- Mapeo correcto de datos transformados
- Manejo de estados
- Validaciones

## Uso

```jsx
import { useSuppliers } from './hooks/useSuppliers';

const MyComponent = () => {
  const {
    suppliers,
    loading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    changeSupplierStatus
  } = useSuppliers();

  // Los datos se cargan automáticamente
  // Las operaciones están listas para usar
  // Los datos se transforman automáticamente
};
```

## Endpoints Utilizados

- `GET /api/suppliers` - Listar proveedores
- `POST /api/suppliers` - Crear proveedor
- `GET /api/suppliers/:id` - Obtener proveedor por ID
- `PUT /api/suppliers/:id` - Actualizar proveedor
- `DELETE /api/suppliers/:id` - Eliminar proveedor
- `PATCH /api/suppliers/:id/state` - Cambiar estado

## Características Especiales

### Transformación de Datos
- Los nombres de campos del frontend son más cortos y legibles
- El estado se maneja como string en el frontend ("Activo"/"Inactivo")
- El estado se envía como boolean al backend (true/false)
- Las transformaciones son automáticas y transparentes

### Estados del Proveedor
- **Estado**: Activo/Inactivo
- Se puede cambiar con el formulario de edición
- Los nuevos proveedores inician como Activos

### Validaciones
- NIT único
- Nombre de empresa único
- Correo único
- Teléfono con formato válido
- Dirección completa

## Notas Importantes

1. **Autenticación**: Los endpoints requieren autenticación (token JWT) - actualmente comentado en backend
2. **Validaciones**: Se mantienen las validaciones del frontend y backend
3. **Error Handling**: Manejo de errores con toast notifications
4. **Loading States**: Estados de carga para mejor UX
5. **Transformación Automática**: Los datos se transforman automáticamente entre frontend y backend
6. **Sin Datos Locales**: Todos los datos provienen del backend de Render

## Referencias

- Módulo de Clientes como referencia de implementación
- Backend en: `https://backend-conv3rtech.onrender.com/api/suppliers`
- Repositorio del modelo: `BackEnd_Conv3rTech/src/models/supplier/SupplierModel.js`

