// Proteger las rutas privadas del frontend

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!isAuthenticated) {
    // Guardamos en state la ruta actual
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;



