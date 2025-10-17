//Rutas CRUD

//GET /api/workorders → admin ve todas, User solo las suyas.

//GET /api/workorders/:id → User solo puede ver la suya.

//POST /api/workorders → Crea orden ligada al req.user.id.

//PUT /api/workorders/:id → User solo actualiza la suya, admin cualquiera.

//DELETE /api/workorders/:id → Solo admin.

// src/routes/workOrders.routes.js
import { Router } from "express";
import {
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
} from "../controllers/workOrders.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import {
  createWorkOrderSchema,
  updateWorkOrderSchema,
} from "../schemas/workOrder.schema.js";

const router = Router();

// Listar todas las órdenes (admin ve todas, user solo las suyas)
router.get("/", authRequired, getWorkOrders);

// Obtener orden por ID
router.get("/:id", authRequired, getWorkOrderById);

// Crear orden (validación Zod)
router.post("/", authRequired, validateSchema(createWorkOrderSchema), createWorkOrder);

// Actualizar orden (validación Zod)
router.put("/:id", authRequired, validateSchema(updateWorkOrderSchema), updateWorkOrder);

// Eliminar orden
router.delete("/:id", authRequired, deleteWorkOrder);

export default router;



