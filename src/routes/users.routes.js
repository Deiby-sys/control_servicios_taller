//CRUD para usuarios

//getUsers → solo admin puede listar todos los usuarios.

//getUserById y updateUser → pueden acceder admin y user. 

//deleteUser → solo admin puede eliminar usuarios.

import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/users.controller.js";
import { authRequired } from "../middlewares/validateToken.js";   //IMPORT correcto
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


