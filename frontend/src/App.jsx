//Es la primera página en ser cargada por la aplicación

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import RecoverPassword from "./pages/RecoverPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ClientsPage from "./pages/ClientsPage";
import ClientFormPage from "./pages/ClientFormPage";
import UsersManagementPage from "./pages/UsersManagementPage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleFormPage from "./pages/VehicleFormPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import WorkOrderFormPage from "./pages/WorkOrderFormPage";
import WorkOrderDetailPage from "./pages/WorkOrderDetailPage";
import WorkOrdersByStatusPage from "./pages/WorkOrdersByStatusPage";
import HistoryPage from "./pages/HistoryPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registerUser" element={<RegisterUser />} />
      <Route path="/recuperar" element={<RecoverPassword />} />

      {/* Ruta raíz: protegida */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/new" element={<ClientFormPage />} />
          <Route path="clients/:id" element={<ClientFormPage />} />
          <Route path="usuarios" element={<UsersManagementPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/new" element={<VehicleFormPage />} />
          <Route path="vehicles/:id" element={<VehicleFormPage />} />
          <Route path="ordenes" element={<WorkOrdersPage />} />
          <Route path="ordenes/new" element={<WorkOrderFormPage />} />
          <Route path="ordenes/:id" element={<WorkOrderDetailPage />} />
          <Route path="ordenes/status/:status" element={<WorkOrdersByStatusPage />} />
          <Route path="historial" element={<HistoryPage />} />
        </Route>
      </Route>

      {/* Redirección de rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;