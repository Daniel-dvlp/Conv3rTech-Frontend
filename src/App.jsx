import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout Principal
import DashboardLayout from './shared/layout/DashboardLayout';


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
import ServicesCategoryPage from './features/dashboard/pages/services_category/ServicesCategoryPage';
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
        {/* Redirección de la ruta raíz al dashboard */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Ruta de Login */}
        <Route path="/login" element={<LoginPage />} />


          <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="programacion_laboral" element={<WorkSchedulingPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="proyectos_servicios" element={<ProjectPage/>} />
          <Route path="perfil" element={<EditProfilePage />} /> {/* <-- AÑADIMOS LA NUEVA RUTA */}
          {/* Rutas de Daniel */}
    

          {/*Rutas Luissy */}
          <Route path="usuarios" element= {<UsersPages/> } />
          <Route path="clientes" element= {<ClientsPage/> } />
          <Route path="pagosyabonos" element= {<Payments_InstallmentsPage/>} />
          {/*Rutas Elany */}
          <Route path="categoria_servicios" element={<ServicesCategoryPage />} />
          <Route path="servicios" element={<ServicesPage />} />
          <Route path="citas" element={<AppoinmentsPage />} />
          {/*Rutas Sarai */}
          <Route path="productos" element={<ProductsPage />} />
         <Route path="categoria_productos" element={<ProductsCategoryPage />} />
          <Route path="venta_productos" element={<ProductsSalePage />} />
          <Route path="cotizaciones" element={<QuotesPage/>} />
          {/*Rutas Cruz */}
          <Route path= "ordenes_servicios" element= {<ServiceOrdersPage/>} />
          <Route path= "proveedores" element= {<SuppliersPage/>} />
          <Route path= "compras" element= {<PurchasesPage/>} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;