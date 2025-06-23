// src/shared/layout/DashboardLayout.jsx

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; 

const DashboardLayout = () => {
  // NO hay estado aquí. El layout es "tonto" y solo organiza.
  return (
    // 1. El 'div' principal es un contenedor flex.
    <div className="flex w-full min-h-screen bg-gray-100">
      
      {/* 2. El Sidebar es un hijo directo. Ocupará su propio espacio físico. */}
      <Sidebar />

      {/* 3. El 'main' es el otro hijo y crece ('flex-grow') para ocupar el resto del espacio. */}
      <main className="flex-grow p-8 bg-white">
        <Outlet />
      </main>
      
    </div>
  );
};

export default DashboardLayout;