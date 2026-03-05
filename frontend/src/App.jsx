// App.jsx
// Es la primera página en ser cargada por la aplicación

import { Routes, Route, Navigate } from "react-router-dom";

// Páginas públicas
import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";
import ResetPassword from "./pages/ResetPassword";

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
import RegisterUser from "./pages/RegisterUser";

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

// Informes
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <Routes>
      {/* ====================== RUTA DE RESET PASSWORD ====================== */}
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ====================== RUTAS PÚBLICAS ====================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar" element={<RecoverPassword />} />

      {/* 🔒 CAMBIO CLAVE: 
          Cualquier acceso a la raíz "/" redirige FORZOSAMENTE a "/login".
          Esto obliga a pasar por el login sin importar si hay sesión activa.
      */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ====================== RUTAS PROTEGIDAS ====================== */}
      {/* Nota: Ahora el path base es "/" pero las rutas hijas son las específicas */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard principal (accesible vía /dashboard) */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Perfil de usuario */}
        <Route 
          path="profile" 
          element={
            <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']}>
              <Profile />
            </RoleGuard>
          } 
        />
        
        {/* Cotizador */}
        <Route 
          path="cotizador" 
          element={
            <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe']}>
              <CotizadorPage />
            </RoleGuard>
          } 
        />
        
        {/* Gestión de Clientes */}
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
        
        {/* Gestión de Usuarios */}
        <Route 
          path="usuarios" 
          element={
            <RoleGuard allowedRoles={['admin']}>
              <UsersManagementPage />
            </RoleGuard>
          } 
        />
        
        {/* Registro de Usuarios */}
        <Route 
          path="registerUser" 
          element={
            <RoleGuard allowedRoles={['admin']}>
              <RegisterUser />
            </RoleGuard>
          } 
        />
        
        {/* Gestión de Vehículos */}
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
        
        {/* Gestión de Órdenes de Trabajo */}
        <Route 
          path="ordenes" 
          element={
            <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']}>
              <WorkOrdersPage />
            </RoleGuard>
          } 
        />
        
        <Route 
          path="ordenes/new" 
          element={
            <RoleGuard allowedRoles={['admin', 'asesor', 'jefe']}>
              <WorkOrderFormPage />
            </RoleGuard>
          } 
        />
        
        <Route 
          path="ordenes/:id" 
          element={
            <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']}>
              <WorkOrderDetailPage />
            </RoleGuard>
          } 
        />
        
        <Route 
          path="ordenes/:id/entregar" 
          element={
            <RoleGuard allowedRoles={['admin', 'asesor', 'jefe']}>
              <WorkOrderDeliveryPage />
            </RoleGuard>
          } 
        />
        
        <Route 
          path="ordenes/status/:status" 
          element={
            <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']}>
              <WorkOrdersByStatusPage />
            </RoleGuard>
          } 
        />
        
        {/* Histórico */}
        <Route 
          path="historial" 
          element={
            <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']}>
              <WorkOrderHistoryPage />
            </RoleGuard>
          } 
        />

        {/* Informes */}
        <Route 
          path="informes" 
          element={
            <RoleGuard allowedRoles={['admin', 'asesor', 'bodega', 'jefe', 'tecnico']}>
              <ReportsPage />
            </RoleGuard>
          } 
        />
      </Route>

      {/* ====================== RUTAS NO ENCONTRADAS ====================== */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;