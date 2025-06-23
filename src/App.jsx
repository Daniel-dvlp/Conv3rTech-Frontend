import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout Principal
import DashboardLayout from './shared/layout/DashboardLayout';

// Importación de todas las páginas de los módulos
import DashboardPage from './features/dashboard/DashboardPage';
import WorkSchedulingPage from './features/dashboard/pages/Work_scheduling/WorkSchedulingPage';
import RolesPage from './features/dashboard/pages/Roles/RolesPage';
import ProjectPage from './features/dashboard/pages/Project/ProjectPage';
import ClientsPage from './features/dashboard/pages/clients/ClientsPage';
import UsersPage from './features/dashboard/pages/users/UsersPage'; 
import PaymentsInstallmentsPage from './features/dashboard/pages/payments_installments/Payments_InstallmentsPage'; 
import ServicesCategoryPage from './features/dashboard/pages/Services_category/ServicesCategoryPage';
import ServicesPage from './features/dashboard/pages/services/ServicesPage';
import AppoinmentsPage from './features/dashboard/pages/Appointment/AppoinmentsPage';
import ProductsPage from './features/dashboard/pages/Products/ProductsPage';
import ProductsCategoryPage from './features/dashboard/pages/Products_Category/ProductsCategoryPage'; 
import QuotesPage from './features/dashboard/pages/Quotes/QuotesPage'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección de la ruta raíz al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* Rutas anidadas que usan el DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Ruta por defecto del dashboard */}
          <Route index element={<DashboardPage />} />

          {/* Rutas de Gestión y Administración */}
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="clientes" element={<ClientsPage />} />

          {/* Rutas de Productos y Servicios */}
           <Route path="productos" element={<ProductsPage/>} />
          <Route path="categoria-productos" element={<ProductsCategoryPage />} /> 
          {/* Rutas Operativas y de Servicios */}
          <Route path="programacion" element={<WorkSchedulingPage />} />
          <Route path="proyectos" element={<ProjectPage />} />
          <Route path="categoria-servicios" element={<ServicesCategoryPage />} />
          <Route path="servicios" element={<ServicesPage />} />
          <Route path="citas" element={<AppoinmentsPage/>} />
          <Route path="cotizaciones" element={<QuotesPage />} />
          
          {/* Rutas Financieras y de Logística */}
          <Route path="pagosyabonos" element={<PaymentsInstallmentsPage />} />

          {/* ERROR CORREGIDO: Se eliminó la ruta duplicada para "proyectos" */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;