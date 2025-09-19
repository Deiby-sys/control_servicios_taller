//Es la primera página en ser cargada por la aplicación
//se instala y se importa cors para que enlace las url de backend(4000) con el fronted(5173)

import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from "./routes/users.routes.js";
import workOrderRoutes from "./routes/workOrders.routes.js";


const app = express();

app.use(cors({origin: 'http://localhost:5173',}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workorders", workOrderRoutes);

export default app;
