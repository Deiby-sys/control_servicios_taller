// Proteger las rutas privadas del frontend

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />; // 👉 manda al login si no está autenticado
  }

  return children;
}

export default ProtectedRoute;

