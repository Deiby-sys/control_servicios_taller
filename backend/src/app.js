//Es la primera página en ser cargada por la aplicación
//se instala y se importa cors para que enlace las url de backend(4000) con el fronted(5173)

import express from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from "./routes/users.routes.js";
import clientRoutes from "./routes/client.routes.js";
import vehicleRoutes from "./routes/vehicles.routes.js";
import workOrderRoutes from "./routes/workOrders.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import { securityLogger } from './middlewares/securityLogger.js';

const app = express();

// Rate limiting para endpoints sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos
  message: {
    message: "Demasiados intentos. Inténtalo de nuevo en 15 minutos."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting a rutas de autenticación
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Habilitar CORS con cookies
// Habilitar CORS con cookies
app.use(cors({
  origin: [
    'http://localhost:5173',           // desarrollo local
    'https://mytallerapp.vercel.app'   // producción
  ],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(securityLogger);

// Prefijos de rutas
app.use("/api/auth", authRoutes);       // Todas las auth empiezan con /api/auth
app.use("/api/users", userRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use('/api/orders', workOrderRoutes);
app.use("/api/reports", reportsRoutes);

// 👇 Captura errores globales (crítico para Render)
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

export default app;
