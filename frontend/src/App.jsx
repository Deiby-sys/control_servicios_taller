// App.jsx
// Es la primera página en ser cargada por la aplicación

import { Routes, Route, Navigate } from "react-router-dom";

// Páginas públicas
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import RecoverPassword from "./pages/RecoverPassword";

// Layout y componentes de protección
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";

// Páginas del dashboard - en orden lógico
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CotizadorPage from "./pages/CotizadorPage";

// Gestión de clientes
import ClientsPage from "./pages/ClientsPage";
import ClientFormPage from "./pages/ClientFormPage";

// Gestión de usuarios (solo admin)
import UsersManagementPage from "./pages/UsersManagementPage";

// Gestión de vehículos
import VehiclesPage from "./pages/VehiclesPage";
import VehicleFormPage from "./pages/VehicleFormPage";

// Gestión de órdenes de trabajo
import WorkOrdersPage from "./pages/WorkOrdersPage";
import WorkOrderFormPage from "./pages/WorkOrderFormPage";
import WorkOrderDetailPage from "./pages/WorkOrderDetailPage";
import WorkOrdersByStatusPage from "./pages/WorkOrdersByStatusPage";
import WorkOrderDeliveryPage from "./pages/WorkOrderDeliveryPage";
import WorkOrderHistoryPage from "./pages/WorkOrderHistoryPage";

function App() {
  return (
    <Routes>
      {/* ====================== RUTAS PÚBLICAS ====================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/registerUser" element={<RegisterUser />} />
      <Route path="/recuperar" element={<RecoverPassword />} />

      {/* ====================== RUTAS PROTEGIDAS ====================== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          {/* Dashboard principal */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Perfil de usuario - Todos los perfiles */}
          <Route 
            path="profile" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']}>
                <Profile />
              </RoleGuard>
            } 
          />
          
          {/* Cotizador - Todos los perfiles autorizados */}
          <Route 
            path="cotizador" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe']}>
                <CotizadorPage />
              </RoleGuard>
            } 
          />
          
          {/* ====================== GESTIÓN DE CLIENTES ====================== */}
          {/* Solo admin, asesor, jefe */}
          <Route 
            path="clients" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'jefe']}>
                <ClientsPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="clients/new" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <ClientFormPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="clients/:id" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <ClientFormPage />
              </RoleGuard>
            } 
          />
          
          {/* ====================== GESTIÓN DE USUARIOS ====================== */}
          {/* Solo admin */}
          <Route 
            path="usuarios" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <UsersManagementPage />
              </RoleGuard>
            } 
          />
          
          {/* ====================== GESTIÓN DE VEHÍCULOS ====================== */}
          {/* Solo admin, asesor, jefe */}
          <Route 
            path="vehicles" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'jefe']}>
                <VehiclesPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="vehicles/new" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <VehicleFormPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="vehicles/:id" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <VehicleFormPage />
              </RoleGuard>
            } 
          />
          
          {/* ====================== GESTIÓN DE ÓRDENES DE TRABAJO ====================== */}
          {/* Todos los perfiles de taller */}
          <Route 
            path="ordenes" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']}>
                <WorkOrdersPage />
              </RoleGuard>
            } 
          />
          
          {/* Crear órdenes - Solo admin, asesor y jefe */}
          <Route 
            path="ordenes/new" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'jefe']}>
                <WorkOrderFormPage />
              </RoleGuard>
            } 
          />
          
          {/* Detalle de órdenes - Todos los perfiles de taller */}
          <Route 
            path="ordenes/:id" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']}>
                <WorkOrderDetailPage />
              </RoleGuard>
            } 
          />
          
          {/* Entrega de órdenes - Solo admin, asesor y jefe */}
          <Route 
            path="ordenes/:id/entregar" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'jefe']}>
                <WorkOrderDeliveryPage />
              </RoleGuard>
            } 
          />
          
          {/* Órdenes por estado - Todos los perfiles de taller */}
          <Route 
            path="ordenes/status/:status" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']}>
                <WorkOrdersByStatusPage />
              </RoleGuard>
            } 
          />
          
          {/* Histórico - Todos los perfiles de taller */}
          <Route 
            path="historial" 
            element={
              <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']}>
                <WorkOrderHistoryPage />
              </RoleGuard>
            } 
          />
        </Route>
      </Route>

      {/* ====================== RUTAS NO ENCONTRADAS ====================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;