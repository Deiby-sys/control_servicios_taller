//Es la primera página en ser cargada por la aplicación
//se instala y se importa cors para que enlace las url de backend(4000) con el fronted(5173)

import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from "./routes/users.routes.js";
import clientRoutes from "./routes/client.routes.js";
import vehicleRoutes from "./routes/vehicles.routes.js";
import workOrderRoutes from "./routes/workOrders.routes.js";

const app = express();

// Habilitar CORS con cookies
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Prefijos de rutas
app.use("/api/auth", authRoutes);       // Todas las auth empiezan con /api/auth
app.use("/api/users", userRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use('/api/orders', workOrderRoutes);


export default app;
