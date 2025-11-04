肓# Integración con API de Programación Laboral (Labor Scheduling)

## Descripción
Este módulo está siendo integrado con la API de programación laboral desplegada en `https://backend-conv3rtech.onrender.com/api/labor-scheduling`.

## Servicios Creados

### laborSchedulingApi.js
- `getAllSchedulings()` - Obtener todas las programaciones laborales
- `getSchedulingById(id)` - Obtener programación por ID
- `createScheduling(schedulingData)` - Crear nueva programación
- `updateScheduling(id, schedulingData)` - Actualizar programación
- `deleteScheduling(id)` - Eliminar programación

## Hooks Creados

### useLaborScheduling.js
Hook que maneja:
- Transformación de datos entre backend y frontend (formato FullCalendar)
- Operaciones CRUD
- Estados de carga
- Manejo de errores

## Transformaciones de Datos

### Backend → Frontend (FullCalendar)
```
{
  id_programacion: 1,
  fecha_inicio: "2025-07-07",
  hora_inicio: "09:00:00",
  hora_fin: "17:00:00",
  id_usuario: 1,
  user: { nombre: "Ana", apellido: "García" }
}
↓
{
  id: "shift-1",
  title: "Ana García",
  start: "2025-07-07T09:00:00",
  end: "2025-07-07T17:00:00",
  backgroundColor: "#FFB300",
  extendedProps: {
    id_programacion: 1,
    employeeId: 1,
    role: "Técnico"
  }
}
```

### Frontend → Backend
- Convierte datetime de FullCalendar a fecha_inicio, hora_inicio y hora_fin
- Mapea employeeId a id_usuario

## Endpoints

- `GET /api/labor-scheduling` - Listar programaciones
- `POST /api/labor-scheduling` - Crear programación
- `GET /api/labor-scheduling/:id` - Obtener programación
- `PUT /api/labor-scheduling/:id` - Actualizar programación
- `DELETE /api/labor-scheduling/:id` - Eliminar programación

## Estado de Implementación

✅ Archivos creados:
- laborSchedulingApi.js
- useLaborScheduling.js
- README_API.md

⚠️ Pendiente:
- Actualizar WorkSchedulingPage.jsx para usar el hook
- Eliminar datos mock
- Integrar completamente con el calendario

