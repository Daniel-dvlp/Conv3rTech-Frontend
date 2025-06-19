import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


import DashboardLayout from './shared/layout/DashboardLayout';


import DashboardPage from './features/dashboard/DashboardPage';
import WorkSchedulingPage from './features/dashboard/pages/Work_scheduling/WorkSchedulingPage';
import RolesPage from './features/dashboard/pages/Roles/RolesPage';
import ProjectPage from './features/dashboard/pages/Project/ProjectPage';
import ServicesCategoryPage from './features/dashboard/pages/Services_category/ServicesCategoryPage';
import ServicesPage from './features/dashboard/pages/services/ServicesPage';
import AppoinmentsPage from './features/dashboard/pages/appoinments/AppoinmentsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="programacion" element={<WorkSchedulingPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="proyectos" element={<ProjectPage />} />
          <Route path="categoria_servicios" element={<ServicesCategoryPage />} />
          <Route path="servicios" element={<ServicesPage />} />
          <Route path="citas" element={<AppoinmentsPage />} />
        
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
