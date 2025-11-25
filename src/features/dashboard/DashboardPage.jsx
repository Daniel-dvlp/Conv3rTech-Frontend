import React, { useMemo, useState } from 'react';
import UserPermissionsInfo from '../../shared/components/UserPermissionsInfo';
import KpiCard from './components/KpiCard';
import ProjectCard from './components/ProjectCard';
import WeeklySalesChart from './components/WeeklySalesChart';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';


function DashboardPage() {
  // --- Estructura de Datos (Arreglos JavaScript) ---
  const kpiData = [
    { id: 1, title: 'Citas Hoy', value: 12 },
    { id: 2, title: 'Ventas Hoy', value: 4250 },
    { id: 3, title: 'Cotizaciones Pendientes', value: 21 },
  ];

  const projectsData = [
    {
      id: 'CT-2025-001',
      name: 'Instalación Sistema CCTV',
      client: 'Constructora XYZ',
      progress: 20,
      estimatedCompletion: '2025-09-02', // Formato YYYY-MM-DD
      priority: 'Alta',
    },
    {
      id: 'CT-2025-002',
      name: 'Mantenimiento Red Eléctrica',
      client: 'Hospital Central',
      progress: 2,
      estimatedCompletion: '2025-11-05',
      priority: 'Alta',
    },
    {
      id: 'CT-2025-003',
      name: 'Modernización de Tableros Eléctricos',
      client: 'Centro Comercial La Estación',
      progress: 20,
      estimatedCompletion: '2025-08-20',
      priority: 'Media',
    },
    {
      id: 'CT-2025-004',
      name: 'Actualización de Iluminación',
      client: 'Tiendas ABC',
      progress: 30,
      estimatedCompletion: '2025-07-15',
      priority: 'Baja',
    },
    {
      id: 'CT-2025-005',
      name: 'Implementación de Fibra Óptica',
      client: 'Zona Franca Tech',
      progress: 10,
      estimatedCompletion: '2026-01-30',
      priority: 'Alta',
    },
  ];

  const weeklySalesData = [
    { day: 'Lun', sales: 1200, productsSold: 17 },
    { day: 'Mar', sales: 1500, productsSold: 22 },
    { day: 'Mié', sales: 1100, productsSold: 15 },
    { day: 'Jue', sales: 2000, productsSold: 30 },
    { day: 'Vie', sales: 2500, productsSold: 35 },
    { day: 'Sáb', sales: 1800, productsSold: 28 },
    { day: 'Dom', sales: 900, productsSold: 10 },
  ];

  const ventasChange = useMemo(() => {
    const last = weeklySalesData[weeklySalesData.length - 1]?.sales ?? 0;
    const prev = weeklySalesData[weeklySalesData.length - 2]?.sales ?? 0;
    if (!prev) return 0;
    return ((last - prev) / prev) * 100;
  }, [weeklySalesData]);

  const citasSeries = [9, 10, 11, 9, 10, 10, 12];
  const cotizacionesSeries = [24, 23, 22, 22, 22, 22, 21];
  const computeChange = (series) => {
    const last = series[series.length - 1] ?? 0;
    const prev = series[series.length - 2] ?? 0;
    if (!prev) return 0;
    return ((last - prev) / prev) * 100;
  };
  const citasChange = computeChange(citasSeries);
  const cotizacionesChange = computeChange(cotizacionesSeries);

  const kpiDataWithChange = useMemo(() => (
    kpiData.map(k => (
      k.title === 'Ventas Hoy'
        ? { ...k, change: ventasChange }
        : k.title === 'Citas Hoy'
          ? { ...k, change: citasChange }
          : k.title === 'Cotizaciones Pendientes'
            ? { ...k, change: cotizacionesChange }
            : { ...k, change: null }
    ))
  ), [kpiData, ventasChange]);

  // Ordenar proyectos por fecha de finalización y luego por prioridad
  const sortedProjects = useMemo(() => {
    const priorityOrder = { 'Alta': 1, 'Media': 2, 'Baja': 3 };
    return [...projectsData].sort((a, b) => {
      const dateA = new Date(a.estimatedCompletion);
      const dateB = new Date(b.estimatedCompletion);

      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;

      // Si las fechas son iguales, ordenar por prioridad
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [projectsData]);

  const [projPage, setProjPage] = useState(0);
  const pageSize = 3;
  const maxPage = Math.max(0, Math.ceil(sortedProjects.length / pageSize) - 1);
  const visibleProjects = useMemo(() => {
    const start = projPage * pageSize;
    return sortedProjects.slice(start, start + pageSize);
  }, [sortedProjects, projPage]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {kpiDataWithChange.map(kpi => (
            <KpiCard key={kpi.id} {...kpi} />
          ))}
        </div>

        <div className="space-y-6">
          <WeeklySalesChart data={weeklySalesData} />
          <div className="rounded-xl p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-800">Proyectos Próximos a Culminar</h3>
              {sortedProjects.length > pageSize && (
                <div className="flex items-center gap-2">
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-black bg-white text-gray-700 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setProjPage(p => Math.max(0, p - 1))}
                    disabled={projPage === 0}
                    aria-label="Anterior"
                  >
                    <FaChevronLeft size={14} />
                  </button>
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-black bg-white text-gray-700 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setProjPage(p => Math.min(maxPage, p + 1))}
                    disabled={projPage === maxPage}
                    aria-label="Siguiente"
                  >
                    <FaChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {visibleProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
