// Ruta de usuarios (exclusivo para administradores)

import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getPublicUsersList
} from "../controllers/users.controller.js";
import { authRequired } from "../middlewares/validateToken.js"; 
import { validateSchema } from "../middlewares/validator.middleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { updateUserSchema } from "../schemas/user.schema.js";

const router = Router();

// Ruta pública: lista de usuarios para asignación (todos los perfiles autenticados)
router.get("/public", authRequired, getPublicUsersList);

// Listar todos los usuarios requiere autenticación Y perfil de administrador
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