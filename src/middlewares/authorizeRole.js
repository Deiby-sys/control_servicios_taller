// middlewares/authorizeRole.js

/**
 * Middleware para verificar el rol del usuario autenticado
 * @param {Array} rolesPermitidos - Lista de roles que pueden acceder al recurso
 * @returns Middleware
 */
export const authorizeRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    try {
      // Validamos que el usuario venga en la request (ya seteado por validateToken)
      if (!req.user || !req.user.profile) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }

      const userRole = req.user.profile;

      // Verificamos si el rol del usuario está en la lista permitida
      if (!rolesPermitidos.includes(userRole)) {
        return res
          .status(403)
          .json({ message: "Acceso denegado: rol no autorizado" });
      }

      // Si pasa la validación, continúa
      next();
    } catch (error) {
      console.error("Error en authorizeRole:", error);
      return res
        .status(500)
        .json({ message: "Error en la autorización de roles" });
    }
  };
};




