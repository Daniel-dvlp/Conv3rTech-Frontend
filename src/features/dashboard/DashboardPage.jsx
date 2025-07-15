import React, { useMemo } from 'react';
import UserPermissionsInfo from '../../shared/components/UserPermissionsInfo';
import KpiCard from './components/KpiCard';
import ProjectCard from './components/ProjectCard';
import WeeklySalesChart from './components/WeeklySalesChart';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Para paginación o navegación en proyectos


function DashboardPage() {
  // --- Estructura de Datos (Arreglos JavaScript) ---
  const kpiData = [
    { id: 1, title: 'Citas Hoy', value: 8, icon: '📅' },
    { id: 2, title: 'Cotizaciones', value: 12, icon: '📦' },
    { id: 3, title: 'Órdenes Pendientes', value: 3, icon: '⚠️' },
    { id: 4, title: 'Ventas Hoy', value: 2450, unit: '$', icon: '💰' },
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al panel de control de Conv3rTech</p>
      </div>

      {/* Información de permisos del usuario (si es necesario) */}
      {/* <UserPermissionsInfo /> */}

      {/* Contenido del dashboard */}
      <div className="space-y-6"> {/* Un poco de espacio vertical entre secciones */}
        
        {/* Resúmenes (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiData.map(kpi => (
            <KpiCard key={kpi.id} {...kpi} />
          ))}
        </div>

        {/* Proyectos Próximos a Culminar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Proyectos Próximos a Culminar</h3>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><FaChevronLeft /></button>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><FaChevronRight /></button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {sortedProjects.slice(0, 3).map(project => ( // Mostrar solo los primeros 3 o los que desees
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* Gráfico de Ventas Semanales */}
        <WeeklySalesChart data={weeklySalesData} />
        
      </div>
    </div>
  );
}

export default DashboardPage;