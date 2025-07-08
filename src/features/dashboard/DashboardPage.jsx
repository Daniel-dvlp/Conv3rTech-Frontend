// src/features/dashboard/DashboardPage.jsx

import React from 'react';
import UserPermissionsInfo from '../../shared/components/UserPermissionsInfo';

function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al panel de control de Conv3rTech</p>
      </div>
      
      {/* Información de permisos del usuario */}
      <UserPermissionsInfo />
      
      {/* Contenido del dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen</h3>
          <p className="text-gray-600">Aquí puedes ver un resumen de las actividades recientes.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
          <p className="text-gray-600">Últimas acciones realizadas en el sistema.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h3>
          <p className="text-gray-600">Métricas y estadísticas importantes.</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;