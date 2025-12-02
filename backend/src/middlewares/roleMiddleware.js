// Middleware permisos roles

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    if (!roles.includes(req.user.profile)) {
      return res.status(403).json({ message: "Acceso denegado: rol no autorizado" });
    }
    
    next();
  };
};

// Middleware específico para técnicos
export const technicianAccess = (req, res, next) => {
  if (!req.user || req.user.profile !== 'tecnico') {
    return res.status(403).json({ message: "Acceso exclusivo para técnicos" });
  }
  next();
};