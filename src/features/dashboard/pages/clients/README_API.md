# Integración con API de Clientes

## Descripción
Este módulo está completamente integrado con la API de clientes desplegada en `https://backend-conv3rtech.onrender.com/api/clients`.

## Estructura de Datos

### Cliente (API Response)
```json
{
  "id_cliente": 1,
  "documento": "9767456388",
  "tipo_documento": "CC",
  "nombre": "Marcos",
  "apellido": "Lopera",
  "telefono": "38445627828",
  "correo": "MarcosSas@example.com",
  "credito": false,
  "estado_cliente": true,
  "AddressClients": [
    {
      "id_direccion": 1,
      "id_cliente": 1,
      "nombre_direccion": "Sede 1",
      "direccion": "Calle 765",
      "ciudad": "Medellin"
    }
  ]
}
```

### Cliente (API Request)
```json
{
  "documento": "9767456388",
  "tipo_documento": "CC",
  "nombre": "Marcos",
  "apellido": "Lopera",
  "telefono": "38445627828",
  "correo": "MarcosSas@example.com",
  "credito": false,
  "estado_cliente": true,
  "addresses": [
    { 
      "nombre_direccion": "Sede 1", 
      "direccion": "Calle 765", 
      "ciudad": "Medellin" 
    }
  ]
}
```

## Servicios Implementados

### clientsApi.js
- `getAllClients()` - Obtener todos los clientes
- `getClientById(id)` - Obtener cliente por ID
- `createClient(clientData)` - Crear nuevo cliente
- `updateClient(id, clientData)` - Actualizar cliente
- `deleteClient(id)` - Eliminar cliente
- `changeClientStatus(id, newStatus)` - Cambiar estado del cliente
- `changeCreditStatus(id, creditStatus)` - Cambiar estado de crédito
- `searchClients(searchTerm)` - Buscar clientes

## Hooks Implementados

### useClients.js
Hook personalizado que maneja:
- Estado de clientes
- Operaciones CRUD
- Cambio de estado y crédito
- Loading states
- Error handling
- Toast notifications

## Componentes Actualizados

### ClientsPage.jsx
- Integrado con `useClients` hook
- Filtrado actualizado para estructura de API
- Paginación funcional
- Búsqueda mejorada

### ClientesTable.jsx
- Mapeo de datos actualizado para estructura de API
- Columnas de estado y crédito
- Acciones integradas con API

### CreateClientModal.jsx
- Formulario actualizado para enviar datos en formato de API
- Manejo de direcciones múltiples
- Validaciones mantenidas

### EditClientModal.jsx
- Formulario de edición actualizado
- Mapeo correcto de datos de la API
- Manejo de direcciones

### ClientsDetailModal.jsx
- Visualización completa de datos del cliente
- Información de direcciones
- Estados de cliente y crédito

## Uso

```jsx
import { useClients } from './hooks/useClients';

const MyComponent = () => {
  const {
    clientes,
    loading,
    createClient,
    updateClient,
    deleteClient,
    changeClientStatus,
    changeCreditStatus
  } = useClients();

  // Los datos se cargan automáticamente
  // Las operaciones están listas para usar
};
```

## Endpoints Utilizados

- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente
- `PATCH /api/clients/:id/status` - Cambiar estado
- `PATCH /api/clients/:id/credit` - Cambiar estado de crédito

## Características Especiales

### Manejo de Direcciones
- Los clientes pueden tener múltiples direcciones
- Cada dirección tiene: nombre, dirección y ciudad
- Se envían como array en el campo `addresses`

### Estados del Cliente
- **Estado del Cliente**: Activo/Inactivo
- **Estado de Crédito**: Con Crédito/Sin Crédito
- Ambos estados se pueden cambiar independientemente

### Validaciones
- Documento único
- Correo único
- Teléfono con formato válido
- Direcciones completas

## Notas Importantes

1. **Autenticación**: Los endpoints requieren autenticación (token JWT)
2. **Validaciones**: Se mantienen las validaciones del frontend
3. **Error Handling**: Manejo de errores con toast notifications
4. **Loading States**: Estados de carga para mejor UX
5. **Estructura de Datos**: Mapeo correcto entre frontend y API
6. **Direcciones**: Manejo especial para arrays de direcciones
