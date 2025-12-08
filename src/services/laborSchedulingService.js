import api from "./api";
import { expandSchedulesToEvents, transformNovedadesToEvents } from "../utils/laborSchedulingUtils";

class LaborSchedulingService {
  /**
   * Get all events (schedules expanded + novedades) for a given range
   * @param {Object} params { rangeStart, rangeEnd, usuarioIds, includeAnnulled }
   */
  async getEvents(params = {}) {
    try {
      console.log('[LaborSchedulingService] getEvents request', params);
      
      const { rangeStart, rangeEnd, usuarioIds, includeAnnulled } = params;

      // 1. Fetch Schedules
      const schedQuery = new URLSearchParams();
      if (includeAnnulled) schedQuery.append("includeAnnulled", "true");
      // Note: Backend filters by user role automatically. 
      // If we need to filter by specific selected users (e.g. Admin filtering dashboard), 
      // we can handle that in frontend expansion or send to backend if supported.
      // Current backend getAllSchedules doesn't seem to take usuarioIds list, 
      // but we can filter the result in frontend expansion.
      
      const schedResponse = await api.get(`/labor-scheduling?${schedQuery.toString()}`);
      const schedules = schedResponse.data.data || [];

      // 2. Fetch Novedades
      const novQuery = new URLSearchParams();
      if (includeAnnulled) novQuery.append("includeInactive", "true");
      if (rangeStart) novQuery.append("from", rangeStart);
      if (rangeEnd) novQuery.append("to", rangeEnd);
      // Novedades endpoint supports usuarioId (singular) or role based.
      // We will filter in frontend transformation if needed.

      const novResponse = await api.get(`/labor-scheduling/novedades?${novQuery.toString()}`);
      const novedades = novResponse.data.data || [];

      // 3. Process and Expand
      const scheduleEvents = expandSchedulesToEvents(schedules, rangeStart, rangeEnd, usuarioIds);
      const novedadEvents = transformNovedadesToEvents(novedades, usuarioIds);

      const allEvents = [...scheduleEvents, ...novedadEvents];
      
      console.log(`[LaborSchedulingService] Loaded ${allEvents.length} events (${scheduleEvents.length} schedules, ${novedadEvents.length} novedades)`);
      
      return allEvents;
    } catch (error) {
      console.error("[LaborSchedulingService] getEvents error", error);
      throw error;
    }
  }

  // --- Schedules ---

  async getAllSchedules(params = {}) {
    const query = new URLSearchParams();
    if (params.includeAnnulled) query.append("includeAnnulled", "true");
    const response = await api.get(`/labor-scheduling?${query.toString()}`);
    return response.data.data || [];
  }

  async getScheduleById(id) {
    const response = await api.get(`/labor-scheduling/${id}`);
    return response.data.data;
  }

  async createRecurringSchedule(payload) {
    const response = await api.post("/labor-scheduling/recurring", payload);
    return response.data.data;
  }

  async updateSchedule(id, payload) {
    const response = await api.put(`/labor-scheduling/${id}`, payload);
    return response.data.data;
  }

  async annulSchedule(id, motivo) {
    const response = await api.patch(`/labor-scheduling/${id}/anular`, { motivo });
    return response.data;
  }

  async deleteSchedule(id) {
    const response = await api.delete(`/labor-scheduling/${id}`);
    return response.data;
  }

  // --- Novedades ---

  async getNovedades(params = {}) {
    const query = new URLSearchParams();
    if (params.includeInactive) query.append("includeInactive", "true");
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);
    if (params.usuarioId) query.append("usuarioId", params.usuarioId);
    
    const response = await api.get(`/labor-scheduling/novedades?${query.toString()}`);
    return response.data.data || [];
  }

  async getNovedadById(id) {
    const response = await api.get(`/labor-scheduling/novedades/${id}`);
    return response.data.data;
  }

  async createNovedad(payload) {
    const response = await api.post("/labor-scheduling/novedades", payload);
    return response.data.data;
  }

  async updateNovedad(id, payload) {
    const response = await api.put(`/labor-scheduling/novedades/${id}`, payload);
    return response.data.data;
  }

  async deleteNovedad(id) {
    const response = await api.delete(`/labor-scheduling/novedades/${id}`);
    return response.data;
  }

  // --- Users Helper ---
  
  async getAvailableUsers() {
    // If there is a specific endpoint for this, use it. Otherwise, use usersService.
    // Assuming legacy support or specific endpoint exists.
    try {
        const response = await api.get("/labor-scheduling/usuarios-disponibles");
        return response.data.data || response.data;
    } catch (e) {
        console.warn("getAvailableUsers endpoint not found, falling back to empty");
        return [];
    }
  }
}

const laborSchedulingService = new LaborSchedulingService();
export default laborSchedulingService;
