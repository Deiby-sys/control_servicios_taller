//Autenticación, validación

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { TOKEN_SECRET } from "../config.js";

export const authRequired = async (req, res, next) => {
  try {
    // 1. Buscar token en cookies
    let token = req.cookies?.token;

    // 2. Si no está en cookies, buscar en headers (Bearer token)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization.split(" ");
      if (authHeader[0] === "Bearer" && authHeader[1]) {
        token = authHeader[1];
      }
    }

    // 3. Si no hay token, rechazar
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // 4. Verificar el token
    const decoded = jwt.verify(token, TOKEN_SECRET);

    // 5. Buscar el usuario REAL en la base de datos
    const userId = decoded.id || decoded._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).json({ message: "Usuario no encontrado" });
    }

    // 6. Asignar el usuario completo a req.user
    req.user = user;
    next();
  } catch (error) {
    console.error("Error en authRequired:", error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: "Token inválido" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: "Token expirado" });
    }

    return res.status(500).json({ message: "Error en el proceso de autenticación" });
  }
};