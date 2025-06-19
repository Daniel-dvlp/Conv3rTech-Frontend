// src/shared/layout/DashboardLayout.jsx

import { Outlet } from 'react-router-dom';
// LA CLAVE ESTÁ AQUÍ: Importamos el componente Sidebar que ya creamos
import Sidebar from './Sidebar'; 

const DashboardLayout = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen w-screen">
      
      {/* Y AQUÍ LO USAMOS: como si fuera una etiqueta HTML normal */}
      <Sidebar />

      {/* El resto de tu aplicación se renderizará aquí */}
      <main className="flex-grow p-8 bg-white">
        <Outlet />

      </main>
      
    </div>
  );
};

export default DashboardLayout;