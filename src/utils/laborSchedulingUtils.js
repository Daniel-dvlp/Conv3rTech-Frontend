
/**
 * Utility functions for Labor Scheduling module
 * Handles event expansion, date formatting, and data transformation
 */

// Map JS day index (0-6) to backend day names
const DAY_MAP = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sabado'
};

/**
 * Helper to ensure a valid Date object
 * @param {string|Date} value 
 * @returns {Date|null}
 */
export const ensureDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return new Date(value);
  if (typeof value === 'string' && value.includes('T')) return new Date(value);
  if (typeof value === 'string') {
    // Handle YYYY-MM-DD (treat as local date, not UTC)
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {string}
 */
export const formatDateISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Combine date and time into ISO string
 * @param {string} dateStr YYYY-MM-DD
 * @param {string} timeStr HH:mm or HH:mm:ss
 * @returns {string} YYYY-MM-DDTHH:mm:ss
 */
export const formatDateTime = (dateStr, timeStr) => {
  const time = (timeStr && timeStr.length >= 5) ? timeStr.substring(0, 5) : '00:00';
  return `${dateStr}T${time}:00`;
};

/**
 * Expand recurring schedules into individual calendar events
 * @param {Array} schedules List of schedule objects from backend
 * @param {string} rangeStart YYYY-MM-DD
 * @param {string} rangeEnd YYYY-MM-DD
 * @param {Array} allowedUserIds Optional list of user IDs to filter
 * @returns {Array} List of FullCalendar events
 */
export const expandSchedulesToEvents = (schedules, rangeStart, rangeEnd, allowedUserIds = null) => {
  if (!schedules || !Array.isArray(schedules)) return [];
  
  const events = [];
  const start = ensureDate(rangeStart);
  const end = ensureDate(rangeEnd);
  
  if (!start || !end) return [];

  // Filter by user if needed
  const filteredSchedules = allowedUserIds && allowedUserIds.length > 0
    ? schedules.filter(s => allowedUserIds.includes(s.usuarioId))
    : schedules;

  filteredSchedules.forEach(schedule => {
    // Determine the effective start date for this schedule (max of range start or schedule start)
    const scheduleStart = ensureDate(schedule.fechaInicio);
    const effectiveStart = scheduleStart > start ? scheduleStart : start;
    
    // Iterate through days in range
    const current = new Date(effectiveStart);
    const scheduleEnd = schedule.fechaFin ? ensureDate(schedule.fechaFin) : null;

    while (current <= end) {
      // If there is a schedule end date and we passed it, stop
      if (scheduleEnd && current > scheduleEnd) break;

      const dayIndex = current.getDay();
      const dayName = DAY_MAP[dayIndex];
      const slots = (schedule.dias || {})[dayName];
      
      if (slots && Array.isArray(slots) && slots.length > 0) {
        const dateStr = formatDateISO(current);
        
        slots.forEach((slot, index) => {
          events.push({
            id: `prog-${schedule.id}-${dateStr}-${index}`,
            title: slot.subtitulo || schedule.titulo,
            start: formatDateTime(dateStr, slot.horaInicio),
            end: formatDateTime(dateStr, slot.horaFin),
            allDay: false,
            backgroundColor: slot.color || schedule.color || '#2563EB',
            borderColor: slot.color || schedule.color || '#2563EB',
            textColor: '#ffffff',
            extendedProps: {
              type: 'programacion',
              meta: {
                scheduleId: schedule.id,
                usuarioId: schedule.usuarioId,
                usuario: {
                  ...schedule.usuario,
                  // Ensure document and type are present if backend sends them differently
                  tipo_documento: schedule.usuario?.tipo_documento,
                  documento: schedule.usuario?.documento,
                  nombre: schedule.usuario?.nombre,
                  apellido: schedule.usuario?.apellido
                },
                descripcion: schedule.descripcion,
                estado: schedule.estado,
                motivoAnulacion: schedule.motivoAnulacion
              }
            }
          });
        });
      }
      
      current.setDate(current.getDate() + 1);
    }
  });

  return events;
};

/**
 * Transform novedades into calendar events
 * @param {Array} novedades List of novedad objects from backend
 * @param {Array} allowedUserIds Optional list of user IDs to filter
 * @returns {Array} List of FullCalendar events
 */
export const transformNovedadesToEvents = (novedades, allowedUserIds = null) => {
  if (!novedades || !Array.isArray(novedades)) return [];

  const filteredNovedades = allowedUserIds && allowedUserIds.length > 0
    ? novedades.filter(n => allowedUserIds.includes(n.usuarioId))
    : novedades;

  return filteredNovedades.map(n => {
    // Handle all-day vs timed events
    let start, end;
    
    if (n.allDay) {
      start = n.fechaInicio;
      // For all-day events, end date is exclusive in FullCalendar, so we might need to add 1 day if it's a range
      // But if fechaFin is same as fechaInicio, it's a single day.
      // If fechaFin is provided, use it.
      const endDate = n.fechaFin ? ensureDate(n.fechaFin) : ensureDate(n.fechaInicio);
      // Add 1 day to end date for FullCalendar exclusive end
      endDate.setDate(endDate.getDate() + 1);
      end = formatDateISO(endDate);
    } else {
      start = formatDateTime(n.fechaInicio, n.horaInicio);
      // If it spans multiple days but has times, it's tricky. Assuming single day for timed events mostly.
      // If fechaFin is different, it's a multi-day timed event.
      const endDateStr = n.fechaFin || n.fechaInicio;
      end = formatDateTime(endDateStr, n.horaFin);
    }

    return {
      id: `nov-${n.id}`,
      title: n.titulo,
      start: start,
      end: end,
      allDay: Boolean(n.allDay),
      backgroundColor: n.color || '#EF4444',
      borderColor: n.color || '#EF4444',
      textColor: '#ffffff',
      extendedProps: {
        type: 'novedad',
        meta: {
          novedadId: n.id,
          usuarioId: n.usuarioId,
          usuario: {
            ...n.usuario,
            tipo_documento: n.usuario?.tipo_documento,
            documento: n.usuario?.documento,
            nombre: n.usuario?.nombre,
            apellido: n.usuario?.apellido
          },
          descripcion: n.descripcion,
          estado: n.estado,
          motivoAnulacion: n.motivoAnulacion
        }
      }
    };
  });
};
