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
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 text-base">Bienvenido al panel de control de Conv3rTech</p>
      </div>

      {/* Main Content Grid - 12 column layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* KPIs Section - 4 columns each */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map(kpi => (
            <KpiCard key={kpi.id} {...kpi} />
          ))}
        </div>

        {/* Main Chart - Full Width */}
        <div className="col-span-12">
          <WeeklySalesChart data={weeklySalesData} />
        </div>

        {/* Projects Section - Full Width */}
        <div className="col-span-12">
          <div className="bg-white rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.1)] border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Proyectos Próximos a Culminar</h3>
                <p className="text-sm text-gray-600">Gestión de proyectos activos</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                  <FaChevronLeft />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                  <FaChevronRight />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {sortedProjects.slice(0, 3).map(project => (
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