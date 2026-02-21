//Ruta de reportes

import express from "express";
import { getSevenDayReports } from "../controllers/reports.controller.js";

const router = express.Router();

// Ruta para informes de los últimos 7 días
router.get("/last-7-days", getSevenDayReports);

export default router;