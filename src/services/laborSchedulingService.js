import api from "./api";

class LaborSchedulingService {
  async getEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.rangeStart) query.append("rangeStart", params.rangeStart);
    if (params.rangeEnd) query.append("rangeEnd", params.rangeEnd);
    if (params.usuarioIds?.length) query.append("usuarioIds", params.usuarioIds.join(","));
    const qs = query.toString();
    const response = await api.get(`/events${qs ? `?${qs}` : ""}`);
    return response.data.data || response.data;
  }

  async getProgramaciones(params = {}) {
    const query = new URLSearchParams();
    if (params.includeInactive) query.append("includeInactive", "true");
    if (params.usuarioId) query.append("usuarioId", params.usuarioId);
    const qs = query.toString();
    const response = await api.get(`/programaciones${qs ? `?${qs}` : ""}`);
    return response.data.data || response.data;
  }

  async getProgramacionById(id) {
    const response = await api.get(`/programaciones/${id}`);
    return response.data.data || response.data;
  }

  async getAvailableUsers() {
    const response = await api.get("/programaciones/usuarios-disponibles");
    return response.data.data || response.data;
  }

  async createProgramacion(payload) {
    const response = await api.post("/programaciones", payload);
    return response.data.data || response.data;
  }

  async updateProgramacion(id, payload) {
    const response = await api.put(`/programaciones/${id}`, payload);
    return response.data.data || response.data;
  }

  async deleteProgramacion(id) {
    const response = await api.delete(`/programaciones/${id}`);
    return response.data;
  }

  async getNovedades(params = {}) {
    const query = new URLSearchParams();
    if (params.usuarioId) query.append("usuarioId", params.usuarioId);
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);
    if (params.includeInactive) query.append("includeInactive", "true");
    const qs = query.toString();
    const response = await api.get(`/novedades${qs ? `?${qs}` : ""}`);
    return response.data.data || response.data;
  }

  async getNovedadById(id) {
    const response = await api.get(`/novedades/${id}`);
    return response.data.data || response.data;
  }

  async createNovedad(payload) {
    const response = await api.post("/novedades", payload);
    return response.data.data || response.data;
  }

  async updateNovedad(id, payload) {
    const response = await api.put(`/novedades/${id}`, payload);
    return response.data.data || response.data;
  }

  async deleteNovedad(id) {
    const response = await api.delete(`/novedades/${id}`);
    return response.data;
  }
}

export default new LaborSchedulingService();
