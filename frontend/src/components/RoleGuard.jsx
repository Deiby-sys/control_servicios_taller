// RoleGuard
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.profile)) {
    // Redirigir técnicos al dashboard (que los redirige a sus órdenes)
    if (user.profile === 'tecnico') {
      return <Navigate to="/dashboard" replace />;
    }
    // Otros roles sin permiso van al dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default RoleGuard;