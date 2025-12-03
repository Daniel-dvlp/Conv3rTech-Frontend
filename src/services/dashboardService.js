import api from "./api";

class DashboardService {
  async getServerHealth() {
    try {
      const res = await api.get("/health");
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al consultar salud del servidor",
      };
    }
  }

  async getKpis() {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const todayStr = `${yyyy}-${mm}-${dd}`; // formato YYYY-MM-DD

      const [appointmentsRes, salesRes, quotesRes] = await Promise.all([
        api.get("/appointments").catch((e) => e.response),
        api.get("/sales").catch((e) => e.response),
        api.get("/quotes").catch((e) => e.response),
      ]);

      const citas = Array.isArray(appointmentsRes?.data)
        ? appointmentsRes.data
        : Array.isArray(appointmentsRes)
        ? appointmentsRes
        : [];

      const ventas = Array.isArray(salesRes?.data)
        ? salesRes.data
        : Array.isArray(salesRes)
        ? salesRes
        : Array.isArray(salesRes?.data?.data)
        ? salesRes.data.data
        : [];

      const cotizaciones = Array.isArray(quotesRes?.data)
        ? quotesRes.data
        : Array.isArray(quotesRes)
        ? quotesRes
        : Array.isArray(quotesRes?.data?.data)
        ? quotesRes.data.data
        : [];

      const appointmentsTodayCount = citas.filter((c) => c.fecha === todayStr).length;

      const salesTodayAmount = ventas
        .filter((v) => {
          const d = new Date(v.fecha_venta);
          const iso = isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
          return iso === todayStr && String(v.estado) === "Registrada";
        })
        .reduce((acc, v) => acc + Number(v.monto_venta || 0), 0);

      const quotesPendingCount = cotizaciones.filter((q) => q.estado === "Pendiente").length;

      return {
        success: true,
        data: {
          appointmentsToday: appointmentsTodayCount,
          salesToday: salesTodayAmount,
          quotesPending: quotesPendingCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener KPIs",
      };
    }
  }

  async getWeeklySales() {
    try {
      const res = await api.get("/sales");
      const ventas = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];

      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const last7 = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const iso = `${yyyy}-${mm}-${dd}`;
        const dow = days[d.getDay()];
        const total = ventas
          .filter((v) => {
            const d = new Date(v.fecha_venta);
            const dIso = isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
            return dIso === iso && String(v.estado) === "Registrada";
          })
          .reduce((acc, v) => acc + Number(v.monto_venta || 0), 0);
        last7.push({ day: dow, sales: Math.round(total) });
      }

      return { success: true, data: last7 };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener ventas semanales",
      };
    }
  }

  async getUpcomingProjects(limit = 3) {
    try {
      const res = await api.get("/projects");
      const projectsResp = res.data?.data ?? res.data ?? [];
      const normalized = Array.isArray(projectsResp) ? projectsResp : [];

      const mapped = normalized.map((p) => ({
        id: p.numeroContrato || p.id || `PR-${p.id}`,
        name: p.nombre,
        client: p.cliente,
        progress: Number(p.progreso || 0),
        estimatedCompletion: p.fechaFin || p.fecha_fin,
        priority: p.prioridad || "Media",
      }));

      const upcoming = mapped
        .filter((p) => p.estimatedCompletion)
        .sort((a, b) => new Date(a.estimatedCompletion) - new Date(b.estimatedCompletion))
        .slice(0, limit);

      return { success: true, data: upcoming };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener proyectos",
      };
    }
  }
}

export default new DashboardService();
