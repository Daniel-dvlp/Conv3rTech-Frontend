import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Principal
import DashboardLayout from './shared/layout/DashboardLayout';
import ProtectedRoute from './shared/components/ProtectedRoute';

// Importación de todas las páginas de los módulos

import DashboardPage from './features/dashboard/DashboardPage';

//Rutas Daniel
import LoginPage from './features/auth/pages/LoginPage';
import WorkSchedulingPage from './features/dashboard/pages/work_scheduling/WorkSchedulingPage';
import RolesPage from './features/dashboard/pages/Roles/RolesPage';
import ProjectPage from './features/dashboard/pages/project/ProjectPage';
import EditProfilePage from './features/dashboard/pages/profile/EditProfilePage';

// Rutas Luissy
import ClientsPage from './features/dashboard/pages/clients/ClientsPage';
import UsersPages from './features/dashboard/pages/users/UsersPage';
import Payments_InstallmentsPage from './features/dashboard/pages/payments_installments/Payments_InstallmentsPage';
//Rutas Elany
import ServicesCategoryPage from './features/dashboard/pages/Services_category/ServicesCategoryPage';
import ServicesPage from './features/dashboard/pages/services/ServicesPage';
import AppoinmentsPage from './features/dashboard/pages/appointment/AppointmentsPage';
//Rutas Sarai
import ProductsPage from './features/dashboard/pages/products/ProductsPage';
import ProductsCategoryPage from './features/dashboard/pages/products_Category/ProductsCategoryPage';
import ProductsSalePage from './features/dashboard/pages/products_sale/ProductsSalePage';
//Rutas Cruz
import PurchasesPage from './features/dashboard/pages/purchases/PurchasesPage';
import SuppliersPage from './features/dashboard/pages/suppliers/SuppliersPage';
import ServiceOrdersPage from './features/dashboard/pages/service_orders/ServicesOrdersPage';
import QuotesPage from './features/dashboard/pages/quotes/QuotesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección de la ruta raíz al login */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Ruta de Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas del dashboard */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          
          {/* Rutas con permisos específicos */}
          <Route path="usuarios" element={
            <ProtectedRoute requiredModule="usuarios">
              <UsersPages />
            </ProtectedRoute>
          } />
          
          <Route path="roles" element={
            <ProtectedRoute requiredModule="roles">
              <RolesPage />
            </ProtectedRoute>
          } />
          
          <Route path="proveedores" element={
            <ProtectedRoute requiredModule="proveedores">
              <SuppliersPage />
            </ProtectedRoute>
          } />
          
          <Route path="categoria_productos" element={
            <ProtectedRoute requiredModule="categoria_productos">
              <ProductsCategoryPage />
            </ProtectedRoute>
          } />
          
          <Route path="productos" element={
            <ProtectedRoute requiredModule="productos">
              <ProductsPage />
            </ProtectedRoute>
          } />
          
          <Route path="compras" element={
            <ProtectedRoute requiredModule="compras">
              <PurchasesPage />
            </ProtectedRoute>
          } />
          
          <Route path="categoria_servicios" element={
            <ProtectedRoute requiredModule="categoria_servicios">
              <ServicesCategoryPage />
            </ProtectedRoute>
          } />
          
          <Route path="ordenes_servicios" element={
            <ProtectedRoute requiredModule="ordenes_servicios">
              <ServiceOrdersPage />
            </ProtectedRoute>
          } />
          
          <Route path="programacion_laboral" element={
            <ProtectedRoute requiredModule="programacion_laboral">
              <WorkSchedulingPage />
            </ProtectedRoute>
          } />
          
          <Route path="clientes" element={
            <ProtectedRoute requiredModule="clientes">
              <ClientsPage />
            </ProtectedRoute>
          } />
          
          <Route path="venta_productos" element={
            <ProtectedRoute requiredModule="venta_productos">
              <ProductsSalePage />
            </ProtectedRoute>
          } />
          
          <Route path="citas" element={
            <ProtectedRoute requiredModule="citas">
              <AppoinmentsPage />
            </ProtectedRoute>
          } />
          
          <Route path="cotizaciones" element={
            <ProtectedRoute requiredModule="cotizaciones">
              <QuotesPage />
            </ProtectedRoute>
          } />
          
          <Route path="proyectos_servicios" element={
            <ProtectedRoute requiredModule="proyectos_servicios">
              <ProjectPage />
            </ProtectedRoute>
          } />
          
          <Route path="pagosyabonos" element={
            <ProtectedRoute requiredModule="pagosyabonos">
              <Payments_InstallmentsPage />
            </ProtectedRoute>
          } />
          
          <Route path="servicios" element={
            <ProtectedRoute requiredModule="categoria_servicios">
              <ServicesPage />
            </ProtectedRoute>
          } />
          
          {/* Ruta de perfil - accesible para todos los usuarios autenticados */}
          <Route path="profile" element={<EditProfilePage />} />
        </Route>
      </Routes>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </BrowserRouter>
    
  );
}

export default App;