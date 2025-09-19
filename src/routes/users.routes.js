//CRUD para usuarios

import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/users.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { updateUserSchema } from "../schemas/user.schema.js";

const router = Router();

// Listar todos los usuarios
router.get("/", authRequired, getUsers);

// Obtener usuario por ID
router.get("/:id", authRequired, getUserById);

// Actualizar usuario
router.put("/:id", authRequired, validateSchema(updateUserSchema), updateUser);

// Eliminar usuario
router.delete("/:id", authRequired, deleteUser);

export default router;

