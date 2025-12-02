import api from "./api";

class LaborSchedulingService {
  // ==================== LEGACY GOOGLE CALENDAR METHODS ====================

  /**
    * GET /api/labor-scheduling?calendarId=&usuarioId=&from=&to=
    * Obtener programaciones laborales con filtros (legacy)
    */
  async getAllSchedules(filters = {}) {
    const { calendarId, usuarioId, from, to } = filters;
    const params = new URLSearchParams();
    if (calendarId) params.append('calendarId', calendarId);
    if (usuarioId) params.append('usuarioId', usuarioId);
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const queryString = params.toString();
    const url = `/labor-scheduling${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data.data || response.data;
  }

  /**
   * GET /api/labor-scheduling/:eventId
   * Obtener programación por ID (legacy)
   */
  async getScheduleById(eventId, calendarId = null) {
    const params = calendarId ? `?calendarId=${calendarId}` : '';
    const response = await api.get(`/labor-scheduling/${eventId}${params}`);
    return response.data.data || response.data;
  }

  /**
   * POST /api/labor-scheduling
   * Crear nueva programación (legacy)
   */
  async createSchedule(scheduleData) {
    const response = await api.post("/labor-scheduling", scheduleData);
    return response.data.data || response.data;
  }

  /**
    * POST /api/labor-scheduling/bulk-create
    * Crear programación para múltiples usuarios (legacy)
    */
  async bulkCreateSchedule(scheduleData) {
    const response = await api.post("/labor-scheduling/bulk-create", scheduleData);
    return response.data.data || response.data;
  }

  /**
   * PUT /api/labor-scheduling/:eventId
   * Actualizar programación (legacy)
   */
  async updateSchedule(eventId, scheduleData, calendarId = null) {
    const params = calendarId ? `?calendarId=${calendarId}` : '';
    const response = await api.put(`/labor-scheduling/${eventId}${params}`, scheduleData);
    return response.data.data || response.data;
  }

  /**
   * DELETE /api/labor-scheduling/:eventId
   * Eliminar programación (legacy)
   */
  async deleteSchedule(eventId, calendarId = null) {
    const params = calendarId ? `?calendarId=${calendarId}` : '';
    const response = await api.delete(`/labor-scheduling/${eventId}${params}`);
    return response.data;
  }

  // ==================== SHIFT TEMPLATE METHODS ====================

  /**
   * POST /api/labor-scheduling/shift-templates
   * Crear nueva plantilla de turno
   */
  async createShiftTemplate(templateData) {
    const response = await api.post("/labor-scheduling/shift-templates", templateData);
    return response.data.data || response.data;
  }

  /**
   * GET /api/labor-scheduling/shift-templates
   * Lista todas las plantillas de turno
   */
  async getShiftTemplates(filters = {}) {
    const { estado } = filters;
    const params = new URLSearchParams();
    if (estado) params.append('estado', estado);

    const queryString = params.toString();
    const url = `/labor-scheduling/shift-templates${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data.data || response.data;
  }

  /**
   * GET /api/labor-scheduling/shift-templates/:templateId
   * Obtener plantilla de turno por ID
   */
  async getShiftTemplateById(templateId) {
    const response = await api.get(`/labor-scheduling/shift-templates/${templateId}`);
    return response.data.data || response.data;
  }

  /**
   * PUT /api/labor-scheduling/shift-templates/:templateId
   * Actualizar plantilla de turno
   */
  async updateShiftTemplate(templateId, updateData) {
    const response = await api.put(`/labor-scheduling/shift-templates/${templateId}`, updateData);
    return response.data.data || response.data;
  }

  /**
   * DELETE /api/labor-scheduling/shift-templates/:templateId
   * Eliminar plantilla de turno
   */
  async deleteShiftTemplate(templateId) {
    const response = await api.delete(`/labor-scheduling/shift-templates/${templateId}`);
    return response.data;
  }

  // ==================== SHIFT INSTANCE METHODS ====================

  /**
   * POST /api/labor-scheduling/shift-instances/generate
   * Generar instancias de turno para un período
   */
  async generateShiftInstances(templateId, startDate, endDate) {
    const response = await api.post("/labor-scheduling/shift-instances/generate", {
      templateId,
      startDate,
      endDate
    });
    return response.data.data || response.data;
  }

  /**
   * GET /api/labor-scheduling/shift-instances
   * Lista instancias de turno con filtros
   */
  async getShiftInstances(filters = {}) {
    const { templateId, startDate, endDate, estado } = filters;
    const params = new URLSearchParams();
    if (templateId) params.append('templateId', templateId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (estado) params.append('estado', estado);

    const queryString = params.toString();
    const url = `/labor-scheduling/shift-instances${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data.data || response.data;
  }

  // ==================== EMPLOYEE ASSIGNMENT METHODS ====================

  /**
   * POST /api/labor-scheduling/assignments
   * Asignar empleados a una instancia de turno
   */
  async assignEmployeesToShift(instanceId, employeeIds, notes = null) {
    const response = await api.post("/labor-scheduling/assignments", {
      instanceId,
      employeeIds,
      notes
    });
    return response.data.data || response.data;
  }

  /**
   * GET /api/labor-scheduling/assignments
   * Lista asignaciones de empleados
   */
  async getEmployeeAssignments(filters = {}) {
    const { instanceId, employeeId, estado } = filters;
    const params = new URLSearchParams();
    if (instanceId) params.append('instanceId', instanceId);
    if (employeeId) params.append('employeeId', employeeId);
    if (estado) params.append('estado', estado);

    const queryString = params.toString();
    const url = `/labor-scheduling/assignments${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data.data || response.data;
  }

  /**
   * PUT /api/labor-scheduling/assignments/:assignmentId
   * Actualizar estado de asignación
   */
  async updateEmployeeAssignment(assignmentId, updateData) {
    const response = await api.put(`/labor-scheduling/assignments/${assignmentId}`, updateData);
    return response.data.data || response.data;
  }

  // ==================== CALENDAR SYNC METHODS ====================

  /**
   * POST /api/labor-scheduling/sync-calendar
   * Sincronizar instancias con Google Calendar
   */
  async syncShiftInstancesToCalendar(instanceIds) {
    const response = await api.post("/labor-scheduling/sync-calendar", {
      instanceIds
    });
    return response.data.data || response.data;
  }
}

export default new LaborSchedulingService();
