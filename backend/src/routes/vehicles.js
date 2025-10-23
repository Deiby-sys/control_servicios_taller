// Rutas de vehículos

import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { 
  getVehicles, 
  createVehicle, 
  getVehicleById, 
  updateVehicle, 
  deleteVehicle 
} from "../controllers/vehicle.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { vehicleSchema } from "../schemas/vehicle.schema.js";

const router = Router();

router.get("/", authRequired, getVehicles);
router.post("/", authRequired, validateSchema(vehicleSchema), createVehicle);
router.get("/:id", authRequired, getVehicleById);
router.put("/:id", authRequired, validateSchema(vehicleSchema), updateVehicle);
router.delete("/:id", authRequired, deleteVehicle);

export default router;