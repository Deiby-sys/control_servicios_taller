// Proteger las rutas privadas del frontend

// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Mientras verifica la autenticación (loading), mostramos un indicador o nada
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#555'
      }}>
        Cargando sesión...
      </div>
    );
  }

  // 2. SI NO está autenticado, REDIRIGIR FORZOSAMENTE AL LOGIN
  // Guardamos la ruta donde quería ir para redirigirlo allí después del login (opcional)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Si está autenticado y no está cargando, mostrar el contenido protegido
  return children;
}

export default ProtectedRoute;
