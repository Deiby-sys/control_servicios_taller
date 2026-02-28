// Proteger las rutas privadas del frontend

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <h2>Verificando sesión...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirigir a login pero guardando la ubicación actual por si queremos volver después
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

