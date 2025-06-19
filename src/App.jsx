// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout principal
import DashboardLayout from './shared/layout/DashboardLayout';

// 1. IMPORTAMOS LA PÁGINA DEL DASHBOARD
import DashboardPage from './features/dashboard/DashboardPage';
import WorkSchedulingPage from './features/dashboard/pages/Work_scheduling/WorkSchedulingPage';
import RolesPage from './features/dashboard/pages/Roles/RolesPage';
import ProjectPage from './features/dashboard/pages/Project/ProjectPage';
import ClientsPage from './features/dashboard/pages/clients/ClientsPage';
import UsersPages from './features/dashboard/pages/users/UsersPage';
import Payments_InstallmentsPage from './features/dashboard/pages/payments_installments/Payments_InstallmentsPage';
;
// ... aquí irán las demás importaciones de tus páginas

function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardLayout />}>
          
          {/* 2. ESTA ES LA LÍNEA QUE LO CONECTA TODO */}
          {/* Le decimos que por defecto, en /dashboard, muestre DashboardPage */}
          <Route index element={<DashboardPage />} />
          <Route path="programacion" element={<WorkSchedulingPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="proyectos" element={<ProjectPage/>} />
          <Route path="usuarios" element= {<UsersPages/>} />
          <Route path="clientes" element= {<ClientsPage/>} />
          <Route path="pagosyabonos" element= {<Payments_InstallmentsPage/>} />
          {/* ... aquí configurarás las demás rutas */}
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );

}

export default App;