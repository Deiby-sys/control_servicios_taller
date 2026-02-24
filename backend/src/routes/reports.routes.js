//Ruta de reportes

import express from "express";
import { getReports } from "../controllers/reports.controller.js";

const router = express.Router();

// Ruta única que devuelve informes de 7 y 30 días
router.get("/summary", getReports);


export default router;