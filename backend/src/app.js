//Es la primera página en ser cargada por la aplicación
//se instala y se importa cors para que enlace las url de backend(4000) con el fronted(5173)

// backend/src/app.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import session from 'express-session';

// Rutas
import authRoutes from './routes/auth.routes.js';
import userRoutes from "./routes/users.routes.js";
import clientRoutes from "./routes/client.routes.js";
import vehicleRoutes from "./routes/vehicles.routes.js";
import workOrderRoutes from "./routes/workOrders.routes.js";
import reportsRoutes from "./routes/reports.routes.js";

// Middlewares
import { securityLogger } from './middlewares/securityLogger.js';

const app = express();

// Rate limiting para endpoints sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Demasiados intentos. Inténtalo de nuevo en 15 minutos."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// CORS — ¡sin espacios al final y con PATCH incluido!
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mytallerapp.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// 2. CONFIGURACIÓN DE SESIÓN (CRÍTICO PARA SEGURIDAD)
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu_secreto_muy_seguro_cambialo_en_produccion', // Usa variable de entorno en Render
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true en producción (HTTPS), false en local
    httpOnly: true, // Evita acceso desde JS (XSS)
    maxAge: 24 * 60 * 60 * 1000, // 24 horas de duración máxima
    sameSite: 'none' // Necesario para cookies entre dominios diferentes (Vercel -> Render)
  }
}));

app.use(securityLogger);

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/reports", reportsRoutes);
app.use('/api/orders', workOrderRoutes);

export default app;