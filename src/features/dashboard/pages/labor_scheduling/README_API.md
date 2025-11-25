# Integración con API de Programación Laboral (Labor Scheduling)

## Descripción
Este módulo está completamente integrado con la API de programación laboral desplegada en `https://backend-conv3rtech.onrender.com/api/labor-scheduling`. Utiliza Google Calendar API para gestionar las programaciones laborales de los usuarios.

## Estructura de Datos

### Programación Laboral (API Response - Backend)
```json
{
  "id": "google_calendar_event_id",
  "title": "Programación Laboral",
  "start": "2024-01-15T08:00:00-05:00",
  "end": "2024-01-15T17:00:00-05:00",
  "backgroundColor": "#3B82F6",
  "borderColor": "#3B82F6",
  "extendedProps": {
    "userId": 1,
    "eventType": "shift",
    "calendarId": "primary",
    "recurrence": null,
    "description": "Turno laboral"
  }
}
```

### Programación Laboral (Frontend - Transformado)
```json
{
  "id": "google_calendar_event_id",
  "title": "Programación Laboral",
  "start": "2024-01-15T08:00:00-05:00",
  "end": "2024-01-15T17:00:00-05:00",
  "backgroundColor": "#3B82F6",
  "borderColor": "#3B82F6",
  "extendedProps": {
    "userId": 1,
    "eventType": "shift",
    "calendarId": "primary",
    "recurrence": null,
    "description": "Turno laboral"
  },
  "_userData": {
    "id_usuario": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "documento": "12345678"
  }
}
```

### Programación Laboral (API Request - Backend)
```json
{
  "userIds": [1, 2, 3], // Para creación masiva
  "usuarioId": 1, // Para creación individual
  "startDateTime": "2024-01-15T08:00:00-05:00",
  "endDateTime": "2024-01-15T17:00:00-05:00",
  "startDate": "2024-01-15",
  "eventType": "shift",
  "timeZone": "America/Bogota",
  "daysOfWeek": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  "summary": "Turno laboral",
  "description": "Turno de trabajo"
}
```

## Servicios Implementados

### laborSchedulingApi.js
- `getAllSchedules(filters)` - Obtener programaciones con filtros
- `getScheduleById(eventId, calendarId)` - Obtener programación por ID
- `createSchedule(scheduleData)` - Crear nueva programación
- `bulkCreateSchedule(scheduleData)` - Crear programación para múltiples usuarios
- `updateSchedule(eventId, scheduleData, calendarId)` - Actualizar programación
- `deleteSchedule(eventId, calendarId)` - Eliminar programación

## Componentes Implementados

### laborSchedulingPage.jsx
Página principal que integra calendario y sidebar para gestión de programaciones.

### laborSchedulingCalendar.jsx
Componente de calendario que muestra las programaciones usando FullCalendar.

### laborSchedulingSidebar.jsx
Sidebar para filtrar usuarios y gestionar la visualización de programaciones.

### laborSchedulingShiftModal.jsx
Modal para crear y editar programaciones laborales con formulario completo.

### laborSchedulingUserDetailModal.jsx
Modal para mostrar detalles de usuario/programación.

## Uso

```jsx
import LaborSchedulingPage from './labor_scheduling/laborSchedulingPage';

const MyComponent = () => {
  return <LaborSchedulingPage />;
};
```

## Endpoints Utilizados

- `GET /api/labor-scheduling?calendarId=&usuarioId=&from=&to=` - Listar programaciones
- `POST /api/labor-scheduling` - Crear programación individual
- `POST /api/labor-scheduling/bulk-create` - Crear programación masiva
- `GET /api/labor-scheduling/:eventId` - Obtener programación por ID
- `PUT /api/labor-scheduling/:eventId` - Actualizar programación
- `DELETE /api/labor-scheduling/:eventId` - Eliminar programación

## Características Especiales

### Integración con Google Calendar
- Las programaciones se crean directamente en Google Calendar
- Soporte para eventos recurrentes semanales
- Sincronización automática entre frontend y Google Calendar

### Gestión de Usuarios
- Las programaciones están asociadas a usuarios del módulo de usuarios
- Filtros por usuario para visualizar programaciones específicas
- Creación masiva de programaciones para múltiples usuarios

### Tipos de Eventos
- **shift**: Turno laboral (azul)
- **free**: Día libre (verde)
- **absence**: Falta (rojo)
- **special**: Evento especial (amarillo)

### Recurrencia
- Eventos recurrentes semanales
- Configuración de días de la semana específicos
- Soporte para fechas de fin de recurrencia

## Notas Importantes

1. **Google Calendar**: Requiere configuración de credenciales de Google Calendar API
2. **Autenticación**: Los endpoints requieren token JWT
3. **Zona Horaria**: Todas las programaciones usan zona horaria de Bogotá (America/Bogota)
4. **IDs de Usuario**: Las programaciones están asociadas a `id_usuario` de la tabla usuarios
5. **Eventos Recurrentes**: Se crean como eventos recurrentes en Google Calendar
6. **Sin Datos Locales**: Todos los datos se gestionan a través de Google Calendar API

## Referencias

- Backend en: `https://backend-conv3rtech.onrender.com/api/labor-scheduling`
- Repositorio del modelo: `BackEnd_Conv3rTech/src/models/labor_scheduling/LaborSchedulingModel.js`
- Servicio de Google Calendar: `BackEnd_Conv3rTech/src/services/labor_scheduling/googleCalendarService.js`