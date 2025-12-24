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
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkOrderDeliveryPage from "./pages/WorkOrderDeliveryPage";
import WorkOrderHistoryPage from "./pages/WorkOrderHistoryPage";
import RoleGuard from "./components/RoleGuard";

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
          
          {/* Profile - Todos los perfiles */}
          <Route 
            path="profile" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']} >
                <Profile />
              </RoleGuard>
            } 
          />
          
          {/* Clientes - Solo admin, asesor, jefe */}
          <Route 
            path="clients" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'jefe']} >
                <ClientsPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="clients/new" 
            element={
              <RoleGuard allowedRoles={['admin']} >
                <ClientFormPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="clients/:id" 
            element={
              <RoleGuard allowedRoles={['admin']} >
                <ClientFormPage />
              </RoleGuard>
            } 
          />
          
          {/* Usuarios - Solo admin */}
          <Route 
            path="usuarios" 
            element={
              <RoleGuard allowedRoles={['admin']} >
                <UsersManagementPage />
              </RoleGuard>
            } 
          />
          
          {/* Vehículos - Solo admin, asesor, jefe */}
          <Route 
            path="vehicles" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'jefe']} >
                <VehiclesPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="vehicles/new" 
            element={
              <RoleGuard allowedRoles={['admin']} >
                <VehicleFormPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="vehicles/:id" 
            element={
              <RoleGuard allowedRoles={['admin']} >
                <VehicleFormPage />
              </RoleGuard>
            } 
          />
          
          {/* Órdenes de trabajo - Todos los perfiles de taller */}
          <Route 
            path="ordenes" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']} >
                <WorkOrdersPage />
              </RoleGuard>
            } 
          />
          
          {/* Crear órdenes - Solo admin, asesor y jefe */}
          <Route 
            path="ordenes/new" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'jefe']} >
                <WorkOrderFormPage />
              </RoleGuard>
            } 
          />
          
          {/* Detalle de órdenes - Todos los perfiles de taller */}
          <Route 
            path="ordenes/:id" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']} >
                <WorkOrderDetailPage />
              </RoleGuard>
            } 
          />
          
          {/* Entrega de órdenes - Solo admin, asesor y jefe */}
          <Route 
            path="ordenes/:id/entregar" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'jefe']} >
                <WorkOrderDeliveryPage />
              </RoleGuard>
            } 
          />
          
          {/* Órdenes por estado - Todos los perfiles de taller */}
          <Route 
            path="ordenes/status/:status" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']} >
                <WorkOrdersByStatusPage />
              </RoleGuard>
            } 
          />
          
          {/* Histórico - Todos los perfiles de taller */}
          <Route 
            path="historial" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']} >
                <WorkOrderHistoryPage />
              </RoleGuard>
            } 
          />
        </Route>
      </Route>

      {/* Redirección de rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;