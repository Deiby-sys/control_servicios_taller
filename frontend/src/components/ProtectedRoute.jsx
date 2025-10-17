// Proteger las rutas privadas del frontend

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() { 
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading">Cargando...</div>; 
  }

  if (!isAuthenticated) {
    // Redirigir a /login, NO a /
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; 
}

export default ProtectedRoute;


