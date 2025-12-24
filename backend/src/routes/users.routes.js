// Ruta de usuarios (exclusivo para administradores)

import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/users.controller.js";
import { authRequired } from "../middlewares/validateToken.js"; 
import { validateSchema } from "../middlewares/validator.middleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { updateUserSchema } from "../schemas/user.schema.js";

const router = Router();

// Todas las rutas requieren autenticación Y perfil de administrador

// Listar todos los usuarios
router.get("/", authRequired, requireRole(['admin']), getUsers);

// Obtener usuario por ID  
router.get("/:id", authRequired, requireRole(['admin']), getUserById);

// Crear usuario
router.post("/", authRequired, requireRole(['admin']), createUser);

// Actualizar usuario
router.put("/:id", authRequired, requireRole(['admin']), validateSchema(updateUserSchema), updateUser);

// Eliminar usuario
router.delete("/:id", authRequired, requireRole(['admin']), deleteUser);

export default router;