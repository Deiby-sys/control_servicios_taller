// rutas para órdenes de trabajo

import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/upload.js";
import { 
  getWorkOrders, 
  createWorkOrder, 
  getWorkOrderById,
  getVehicleByPlate, 
  getClientByIdentification, 
  addNoteToWorkOrder,
  updateWorkOrderStatus,
  deliverWorkOrder,
  getWorkOrderCounts,
  getWorkOrdersByStatus,
  getWorkOrdersByPlate,
  uploadAttachment,
  downloadAttachment,
  deleteAttachment,
  getWorkOrderHistory,
  checkActiveOrderByPlate
} from "../controllers/workOrder.controller.js";

const router = Router();

// =======================================================
// === 1. RUTAS FIJAS
// =======================================================

// Contadores
router.get("/counts", authRequired, getWorkOrderCounts);

// Validación de órdenes duplicadas
router.get('/exists', authRequired, checkActiveOrderByPlate);

// Histórico
router.get("/historial", authRequired, getWorkOrderHistory);

// =======================================================
// === 2. RUTAS DINÁMICAS ESPECÍFICAS
// =======================================================

// Búsqueda de vehículo por placa
router.get("/vehicle/plate/:plate", authRequired, getVehicleByPlate);

// Búsqueda de cliente por identificación
router.get("/client/:identification", authRequired, getClientByIdentification);

// Histórico por placa
router.get("/historial/plate/:plate", authRequired, getWorkOrdersByPlate);

// Órdenes por estado
router.get("/status/:status", authRequired, getWorkOrdersByStatus);

// =======================================================
// === 3. CRUD GENERAL (RUTAS CON ID GENÉRICO)
// =======================================================

// Listar y crear órdenes
router.get("/", authRequired, getWorkOrders);
router.post("/", authRequired, requireRole(['admin', 'asesor', 'jefe']), createWorkOrder);

// Operaciones en una orden específica
router.get("/:id", authRequired, getWorkOrderById);
router.post("/:id/notes", authRequired, addNoteToWorkOrder);
router.patch("/:id/status", authRequired, updateWorkOrderStatus);
router.post("/:id/deliver", authRequired, requireRole(['admin', 'asesor', 'jefe']), deliverWorkOrder);

// Adjuntos
router.post("/:id/attachments", authRequired, upload.single('file'), uploadAttachment);
router.get("/:id/attachments/:fileId", authRequired, downloadAttachment);
router.delete("/:id/attachments/:fileId", authRequired, deleteAttachment);

export default router;