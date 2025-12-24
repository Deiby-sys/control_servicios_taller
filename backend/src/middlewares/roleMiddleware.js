// Middleware permisos roles

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Usuario no autenticado" });
    }

    if (!allowedRoles.includes(req.user.profile)) {
      return res.status(403).json({ 
        message: `Perfil '${req.user.profile}' no autorizado` 
      });
    }

    next();
  };
};