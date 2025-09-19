//Rutas POST

import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import {
  getWorkOrders,
  getWorkOrder,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
} from "../controllers/workOrders.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { createWorkOrderSchema } from "../schemas/workOrder.schema.js";

const router = Router();

// 📌 Rutas protegidas con autenticación
router.get("/workorders", authRequired, getWorkOrders);

router.get("/workorders/:id", authRequired, getWorkOrder);

router.post(
  "/workorders",
  authRequired,
  validateSchema(createWorkOrderSchema),
  createWorkOrder
);

router.put("/workorders/:id", authRequired, updateWorkOrder);

router.delete("/workorders/:id", authRequired, deleteWorkOrder);

export default router;
