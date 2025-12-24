// Rutas de clientes

import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { 
    getClients, 
    getClient, 
    createClient, 
    updateClient, 
    deleteClient 
} from '../controllers/client.controller.js';
import { requireRole } from "../middlewares/roleMiddleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { clientSchema, updateClientSchema } from "../schemas/client.schema.js";

const router = Router();

// =======================================================
// === LECTURA: admin, asesor, jefe
// =======================================================

router.get("/", authRequired, requireRole(['admin', 'asesor', 'jefe']), getClients);
router.get("/:id", authRequired, requireRole(['admin', 'asesor', 'jefe']), getClient);

// =======================================================
// === ESCRITURA: solo admin (con validación Zod)
// =======================================================

router.post("/", authRequired, requireRole(['admin']), validateSchema(clientSchema), createClient);
router.put("/:id", authRequired, requireRole(['admin']), validateSchema(updateClientSchema), updateClient);
router.delete("/:id", authRequired, requireRole(['admin']), deleteClient);

export default router;