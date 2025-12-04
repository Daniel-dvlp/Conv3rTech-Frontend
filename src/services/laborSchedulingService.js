import api from "./api";

class LaborSchedulingService {
  async getEvents(params = {}) {
    try {
      console.log('[LaborSchedulingService] getEvents request', params);
      const query = new URLSearchParams();
      if (params.rangeStart) query.append("rangeStart", params.rangeStart);
      if (params.rangeEnd) query.append("rangeEnd", params.rangeEnd);
      if (params.usuarioIds?.length) query.append("usuarioIds", params.usuarioIds.join(","));
      const qs = query.toString();
      const url = `/events${qs ? `?${qs}` : ""}`;
      console.log('[LaborSchedulingService] getEvents url', url);
      const response = await api.get(url);
      let data = response.data.data || response.data;
      console.log('[LaborSchedulingService] getEvents response length', Array.isArray(data) ? data.length : 0);
      let events = Array.isArray(data) ? [...data] : [];
      try {
        const q = {};
        if (params.rangeStart && params.rangeEnd) {
          q.from = params.rangeStart;
          q.to = params.rangeEnd;
        }
        const novs = await this.getNovedades(q);
        const ids = new Set(events.map((e) => e.id));
        (novs || []).forEach((n) => {
          const startStr = n.allDay ? n.fechaInicio : `${n.fechaInicio}T${(n.horaInicio && n.horaInicio.length === 5) ? n.horaInicio : (n.horaInicio || '00:00')}:00`;
          const endStr = n.allDay ? (n.fechaFin || n.fechaInicio) : `${(n.fechaFin || n.fechaInicio)}T${(n.horaFin && n.horaFin.length === 5) ? n.horaFin : (n.horaFin || '00:00')}:00`;
          const ev = {
            id: `nov-${n.id ?? n.id_novedad ?? n.idNovedad}`,
            title: n.titulo,
            start: startStr,
            end: endStr,
            allDay: !!n.allDay,
            backgroundColor: n.color || '#EF4444',
            borderColor: n.color || '#EF4444',
            extendedProps: {
              type: 'novedad',
              meta: {
                novedadId: n.id ?? n.id_novedad ?? n.idNovedad,
                usuarioId: n.usuarioId ?? n.id_usuario ?? n.usuario?.id_usuario ?? n.usuario?.id,
                usuario: n.usuario,
                descripcion: n.descripcion,
              }
            }
          };
          if (!ids.has(ev.id)) events.push(ev);
        });
        console.log('[LaborSchedulingService] merged events length', events.length);
      } catch (mergeErr) {
        console.log('[LaborSchedulingService] merge novedades error', mergeErr?.message);
      }
      if (events.length > 0) return events;
      const status = response.status;
      if (status === 200 && Array.isArray(data) && data.length === 0) {
        const rangeStart = params.rangeStart;
        const rangeEnd = params.rangeEnd;
        const usuarioIds = Array.isArray(params.usuarioIds) ? params.usuarioIds : [];
        const ensureDate = (value) => {
          if (!value) return null;
          if (value instanceof Date) return new Date(value);
          if (typeof value === 'string' && value.includes('T')) return new Date(value);
          if (typeof value === 'string') {
            const [year, month, day] = value.split('-').map(Number);
            return new Date(year, month - 1, day);
          }
          return new Date(value);
        };
        const iterateDates = (fromStr, toStr, cb) => {
          const from = ensureDate(fromStr);
          const to = ensureDate(toStr);
          if (!from || !to) return;
          const d = new Date(from);
          while (d <= to) {
            cb(new Date(d));
            d.setDate(d.getDate() + 1);
          }
        };
        const formatTime = (dateStr, time) => `${dateStr}T${(time && time.length === 5) ? time : (time || '00:00')}:00`;
        const dayMap = { 0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado' };
        const progs = await this.getProgramaciones({});
        const novs = await this.getNovedades({});
        console.log('[LaborSchedulingService] fallback lists', { progs: (progs || []).length, novs: (novs || []).length });
        const filteredProgs = usuarioIds.length ? (progs || []).filter(p => usuarioIds.includes(p.usuarioId)) : (progs || []);
        const filteredNovs = usuarioIds.length ? (novs || []).filter(n => usuarioIds.includes(n.usuarioId)) : (novs || []);
        const result = [];
        iterateDates(rangeStart, rangeEnd, (date) => {
          const dateStr = date.toISOString().split('T')[0];
          const dayLabel = dayMap[date.getDay()];
          (filteredProgs || []).forEach((s) => {
            const slots = (s.dias || {})[dayLabel] || [];
            slots.forEach((slot, idx) => {
              const color = slot.color || s.color || '#2563EB';
              result.push({
                id: `prog-${s.id}-${dateStr}-${idx}`,
                title: slot.subtitulo || s.titulo,
                start: formatTime(dateStr, slot.horaInicio),
                end: formatTime(dateStr, slot.horaFin),
                allDay: false,
                backgroundColor: color,
                borderColor: color,
                extendedProps: {
                  type: 'programacion',
                  meta: { programacionId: s.id, usuarioId: s.usuarioId, usuario: s.usuario, descripcion: s.descripcion }
                }
              });
            });
          });
        });
        (filteredNovs || []).forEach((n) => {
          const startStr = n.allDay ? n.fechaInicio : formatTime(n.fechaInicio, n.horaInicio);
          const endStr = n.allDay ? (n.fechaFin || n.fechaInicio) : formatTime(n.fechaFin || n.fechaInicio, n.horaFin);
          result.push({
            id: `nov-${n.id}`,
            title: n.titulo,
            start: startStr,
            end: endStr,
            allDay: !!n.allDay,
            backgroundColor: n.color || '#EF4444',
            borderColor: n.color || '#EF4444',
            extendedProps: {
              type: 'novedad',
              meta: { novedadId: n.id, usuarioId: n.usuarioId, usuario: n.usuario, descripcion: n.descripcion }
            }
          });
        });
        console.log('[LaborSchedulingService] fallback result length', result.length);
        return result;
      }
      return data;
    } catch (error) {
      const status = error.response?.status;
      const notFound = status === 404 || (error.response?.data?.message || "").includes("Ruta no encontrada");
      if (!notFound) {
        console.error("[LaborSchedulingService] getEvents error", { params, status, data: error.response?.data });
        throw error;
      }
      const rangeStart = params.rangeStart;
      const rangeEnd = params.rangeEnd;
      const usuarioIds = Array.isArray(params.usuarioIds) ? params.usuarioIds : [];
      const ensureDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) return new Date(value);
        if (typeof value === 'string' && value.includes('T')) return new Date(value);
        if (typeof value === 'string') {
          const [year, month, day] = value.split('-').map(Number);
          return new Date(year, month - 1, day);
        }
        return new Date(value);
      };
      const iterateDates = (fromStr, toStr, cb) => {
        const from = ensureDate(fromStr);
        const to = ensureDate(toStr);
        if (!from || !to) return;
        const d = new Date(from);
        while (d <= to) {
          cb(new Date(d));
          d.setDate(d.getDate() + 1);
        }
      };
      const formatTime = (dateStr, time) => `${dateStr}T${(time && time.length === 5) ? time : (time || '00:00')}:00`;
      const dayMap = { 0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado' };
      let progs = [];
      let novs = [];
      try {
        progs = await this.getProgramaciones({});
      } catch (e1) {
        try {
          const r = await api.get('/programaciones');
          progs = r.data.data || r.data || [];
        } catch (e2) {
          progs = [];
        }
      }
      try {
        novs = await this.getNovedades({});
      } catch (e3) {
        try {
          const r = await api.get('/programaciones/novedades');
          novs = r.data.data || r.data || [];
        } catch (e4) {
          novs = [];
        }
      }
      const filteredProgs = usuarioIds.length ? (progs || []).filter(p => usuarioIds.includes(p.usuarioId)) : (progs || []);
      const filteredNovs = usuarioIds.length ? (novs || []).filter(n => usuarioIds.includes(n.usuarioId)) : (novs || []);
      const result = [];
      iterateDates(rangeStart, rangeEnd, (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayLabel = dayMap[date.getDay()];
        (filteredProgs || []).forEach((s) => {
          const slots = (s.dias || {})[dayLabel] || [];
          slots.forEach((slot, idx) => {
            const color = slot.color || s.color || '#2563EB';
            result.push({
              id: `prog-${s.id}-${dateStr}-${idx}`,
              title: slot.subtitulo || s.titulo,
              start: formatTime(dateStr, slot.horaInicio),
              end: formatTime(dateStr, slot.horaFin),
              allDay: false,
              backgroundColor: color,
              borderColor: color,
              extendedProps: {
                type: 'programacion',
                meta: { programacionId: s.id, usuarioId: s.usuarioId, usuario: s.usuario, descripcion: s.descripcion }
              }
            });
          });
        });
      });
      (filteredNovs || []).forEach((n) => {
        const startStr = n.allDay ? n.fechaInicio : formatTime(n.fechaInicio, n.horaInicio);
        const endStr = n.allDay ? (n.fechaFin || n.fechaInicio) : formatTime(n.fechaFin || n.fechaInicio, n.horaFin);
        result.push({
          id: `nov-${n.id}`,
          title: n.titulo,
          start: startStr,
          end: endStr,
          allDay: !!n.allDay,
          backgroundColor: n.color || '#EF4444',
          borderColor: n.color || '#EF4444',
          extendedProps: {
            type: 'novedad',
            meta: { novedadId: n.id, usuarioId: n.usuarioId, usuario: n.usuario, descripcion: n.descripcion }
          }
        });
      });
      return result;
    }
  }

  async getProgramaciones(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.includeInactive) query.append("includeInactive", "true");
      if (params.usuarioId) query.append("usuarioId", params.usuarioId);
      const qs = query.toString();
      const response = await api.get(`/labor-scheduling${qs ? `?${qs}` : ""}`);
      return response.data.data || response.data;
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) return [];
      throw error;
    }
  }

  async getProgramacionById(id) {
    const response = await api.get(`/labor-scheduling/${id}`);
    return response.data.data || response.data;
  }

  async getAvailableUsers() {
    const response = await api.get("/labor-scheduling/usuarios-disponibles");
    return response.data.data || response.data;
  }

  async createProgramacion(payload) {
    try {
      const response = await api.post("/labor-scheduling", payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error("[LaborSchedulingService] createProgramacion error", { payload, status: error.response?.status, data: error.response?.data });
      throw error;
    }
  }

  async updateProgramacion(id, payload) {
    try {
      const response = await api.put(`/labor-scheduling/${id}`, payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error("[LaborSchedulingService] updateProgramacion error", { id, payload, status: error.response?.status, data: error.response?.data });
      throw error;
    }
  }

  async deleteProgramacion(id) {
    try {
      const response = await api.delete(`/labor-scheduling/${id}`);
      return response.data;
    } catch (error) {
      console.error("[LaborSchedulingService] deleteProgramacion error", { id, status: error.response?.status, data: error.response?.data });
      throw error;
    }
  }

  async getNovedades(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.usuarioId) query.append("usuarioId", params.usuarioId);
      if (params.from) query.append("from", params.from);
      if (params.to) query.append("to", params.to);
      if (params.includeInactive) query.append("includeInactive", "true");
      const qs = query.toString();
      const response = await api.get(`/labor-scheduling/novedades${qs ? `?${qs}` : ""}`);
      return response.data.data || response.data;
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) return [];
      throw error;
    }
  }

  async getNovedadById(id) {
    const response = await api.get(`/labor-scheduling/novedades/${id}`);
    return response.data.data || response.data;
  }

  async createNovedad(payload) {
    try {
      const response = await api.post("/labor-scheduling/novedades", payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error("[LaborSchedulingService] createNovedad error", { payload, status: error.response?.status, data: error.response?.data });
      throw error;
    }
  }

  async updateNovedad(id, payload) {
    try {
      const response = await api.put(`/labor-scheduling/novedades/${id}`, payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error("[LaborSchedulingService] updateNovedad error", { id, payload, status: error.response?.status, data: error.response?.data });
      throw error;
    }
  }

  async deleteNovedad(id) {
    try {
      const response = await api.delete(`/labor-scheduling/novedades/${id}`);
      return response.data;
    } catch (error) {
      console.error("[LaborSchedulingService] deleteNovedad error", { id, status: error.response?.status, data: error.response?.data });
      throw error;
    }
  }
}

export default new LaborSchedulingService();
