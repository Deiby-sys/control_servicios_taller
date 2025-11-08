// rutas para órdenes de trabajo

import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { 
getWorkOrders, 
createWorkOrder, 
getWorkOrderById,
getVehicleByPlate, 
getClientByIdentification, 
addNoteToWorkOrder,
updateWorkOrderStatus,
deliverWorkOrder,
getWorkOrdersByStatus,
getWorkOrderCounts,
getWorkOrdersByPlate
} from "../controllers/workOrder.controller.js";

const router = Router();


// =======================================================
// === 1. RUTAS FIJAS y CON PARÁMETROS ESPECÍFICOS PRIMERO
// =======================================================

// CONTADORES (Fijas)
router.get("/counts", authRequired, getWorkOrderCounts); 

// BÚSQUEDAS DINÁMICAS ESPECÍFICAS (DEBEN IR ANTES de /:id)
router.get("/vehicle/plate/:plate", authRequired, getVehicleByPlate); // Búsqueda de vehículo por placa
router.get("/client/:identification", authRequired, getClientByIdentification); // Búsqueda de cliente por ID
router.get("/historial/plate/:plate", authRequired, getWorkOrdersByPlate); // Historial por placa

// RUTAS DE ESTADO (Dinámicas pero Fijas)
router.get("/status/:status", authRequired, getWorkOrdersByStatus);


// =======================================================
// === 2. CRUD GENERAL y ACCIONES (Con parámetros ambiguos)
// =======================================================

// CRUD
router.get("/", authRequired, getWorkOrders); // Obtener todas las órdenes
router.post("/", authRequired, createWorkOrder); // Crear orden

// RUTAS CON ID DINÁMICO (/ALGUN_ID) Y RUTAS DE ACCIÓN
router.get("/:id", authRequired, getWorkOrderById); // Obtener UNA orden por ID (Comodín)
router.post("/:id/notes", authRequired, addNoteToWorkOrder);
router.patch("/:id/status", authRequired, updateWorkOrderStatus);
router.post("/:id/deliver", authRequired, deliverWorkOrder);

export default router;