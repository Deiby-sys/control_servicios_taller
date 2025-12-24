// Rutas de vehículos

import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { 
  getVehicles, 
  createVehicle, 
  getVehicleById, 
  updateVehicle, 
  deleteVehicle,
  getVehicleByPlate 
} from "../controllers/vehicle.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { vehicleSchema } from "../schemas/vehicle.schema.js";

const router = Router();

// =======================================================
// === LECTURA: admin, asesor, jefe
// =======================================================

router.get("/", authRequired, requireRole(['admin', 'asesor', 'jefe']), getVehicles);
router.get("/:id", authRequired, requireRole(['admin', 'asesor', 'jefe']), getVehicleById);
router.get("/plate/:plate", authRequired, requireRole(['admin', 'asesor', 'jefe']), getVehicleByPlate);

// =======================================================
// === ESCRITURA: solo admin
// =======================================================

router.post("/", authRequired, requireRole(['admin']), validateSchema(vehicleSchema), createVehicle);
router.put("/:id", authRequired, requireRole(['admin']), validateSchema(vehicleSchema), updateVehicle);
router.delete("/:id", authRequired, requireRole(['admin']), deleteVehicle);

export default router;