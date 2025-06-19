import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex bg-gray-100 min-h-screen w-screen overflow-hidden">
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      <main
        className={`flex-grow p-8 bg-white transition-all duration-300 ease-in-out ${
          isExpanded ? 'ml-64' : 'ml-20'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
