// Proteger las rutas privadas del frontend

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <h1>Loading...</h1>;

  if (!user) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;
