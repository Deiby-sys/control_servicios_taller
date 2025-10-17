//Autenticación, validación, etc.

//Se genera para validar autenticación del usuario

import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const authRequired = (req, res, next) => {
  try {
    // 1. Buscar en cookies
    let token = req.cookies?.token;

    // 2. Si no está en cookies, buscar en headers
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization.split(" ");
      if (authHeader[0] === "Bearer") {
        token = authHeader[1];
      }
    }

    // 3. Validar si no hay token
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // 4. Verificar token
    jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });

      // Normalizamos el id (a veces el token guarda `_id` y otras `id`)
      req.user = {
        ...decoded,
        id: decoded.id || decoded._id,
      };

      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Error en autenticación", error });
  }
};

