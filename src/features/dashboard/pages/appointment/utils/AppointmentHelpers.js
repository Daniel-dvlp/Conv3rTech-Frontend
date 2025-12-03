/**
 * Obtiene el color de fondo según el estado de la cita
 */
export const getColorByStatus = (estado) => {
    const colors = {
        Pendiente: "#FCD34D", // Amarillo
        Confirmada: "#60A5FA", // Azul
        Cancelada: "#F87171", // Rojo
        Completada: "#34D399", // Verde
    };
    return colors[estado] || "#9CA3AF"; // Gris por defecto
};

/**
 * Calcula la hora de fin basándose en hora de inicio y duración
 * @param {string} startTime - Hora de inicio en formato "HH:MM"
 * @param {string} duration - Duración en formato "1h 30m" o "2h" o "45m"
 * @returns {string} Hora de fin en formato "HH:MM"
 */
export const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return "";

    const minutes = parseDuration(duration);
    const [hours, mins] = startTime.split(":").map(Number);

    const startDate = new Date();
    startDate.setHours(hours, mins, 0, 0);

    const endDate = new Date(startDate.getTime() + minutes * 60000);

    const endHours = String(endDate.getHours()).padStart(2, "0");
    const endMins = String(endDate.getMinutes()).padStart(2, "0");

    return `${endHours}:${endMins}`;
};

/**
 * Convierte una cadena de duración a minutos
 * @param {string} durationString - Duración en formato "1h 30m" o "2h" o "45m"
 * @returns {number} Duración en minutos
 */
export const parseDuration = (durationString) => {
    if (!durationString) return 0;

    let totalMinutes = 0;

    // Extraer horas
    const hoursMatch = durationString.match(/(\d+)h/);
    if (hoursMatch) {
        totalMinutes += parseInt(hoursMatch[1]) * 60;
    }

    // Extraer minutos
    const minutesMatch = durationString.match(/(\d+)m/);
    if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1]);
    }

    return totalMinutes;
};

/**
 * Verifica si una hora está dentro de los bloques de trabajo
 * @param {string} time - Hora en formato "HH:MM"
 * @param {Array} workingBlocks - Array de bloques {horaInicio, horaFin}
 * @returns {boolean}
 */
export const isWithinWorkingHours = (time, workingBlocks) => {
    if (!time || !workingBlocks || workingBlocks.length === 0) return false;

    return workingBlocks.some((block) => {
        return time >= block.horaInicio && time <= block.horaFin;
    });
};

/**
 * Verifica si una cita puede ser eliminada (más de 3 horas de anticipación)
 * @param {string} appointmentDate - Fecha en formato "YYYY-MM-DD"
 * @param {string} appointmentTime - Hora en formato "HH:MM:SS" o "HH:MM"
 * @returns {boolean}
 */
export const canDeleteAppointment = (appointmentDate, appointmentTime) => {
    if (!appointmentDate || !appointmentTime) return false;

    const now = new Date();
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);

    const diffHours = (appointmentDateTime - now) / (1000 * 60 * 60);

    return diffHours >= 3;
};

/**
 * Formatea una hora para el backend (agrega segundos si no los tiene)
 * @param {string} time - Hora en formato "HH:MM"
 * @returns {string} Hora en formato "HH:MM:SS"
 */
export const formatTimeForBackend = (time) => {
    if (!time) return "";

    // Si ya tiene formato HH:MM:SS, retornar
    if (time.length === 8 && time.split(":").length === 3) {
        return time;
    }

    // Si tiene formato HH:MM, agregar :00
    if (time.length === 5 && time.split(":").length === 2) {
        return `${time}:00`;
    }

    return time;
};

/**
 * Formatea una hora del backend para el frontend (remueve segundos)
 * @param {string} time - Hora en formato "HH:MM:SS"
 * @returns {string} Hora en formato "HH:MM"
 */
export const formatTimeForFrontend = (time) => {
    if (!time) return "";

    // Si tiene formato HH:MM:SS, quitar segundos
    if (time.length === 8 && time.split(":").length === 3) {
        return time.substring(0, 5);
    }

    return time;
};

/**
 * Obtiene el nombre del día de la semana en español
 * @param {string} date - Fecha en formato "YYYY-MM-DD"
 * @returns {string} Nombre del día en minúsculas
 */
export const getDayOfWeek = (date) => {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const dateObj = new Date(date + 'T00:00:00');
    return diasSemana[dateObj.getDay()];
};
