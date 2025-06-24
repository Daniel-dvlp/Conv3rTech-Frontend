// src/shared/layout/DashboardLayout.jsx

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import Header from './Header';

const DashboardLayout = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen w-screen">
      <Sidebar />
      <div className="flex flex-col flex-grow min-h-screen">
        <Header />
        <main className="flex-grow p-6 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
