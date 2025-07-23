import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ServicesPage from './features/dashboard/pages/services/ServicesPage.jsx';
// ... otras importaciones ...

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* ... otras rutas ... */}
        <Route path="/dashboard/servicios" element={<ServicesPage />} />
        {/* ... otras rutas ... */}
      </Routes>
    </Router>
  );
}
