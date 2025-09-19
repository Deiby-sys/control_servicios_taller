//index.js se encarga de arrancar la aplicación (server)


// server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./database.js";
import userRoutes from "./routes/users.routes.js";

// Importar rutas
import authRoutes from "./routes/auth.routes.js";
import workOrderRoutes from "./routes/workOrders.routes.js";
// import userRoutes from "./routes/users.routes.js"; // opcional futuro

dotenv.config(); // Cargar variables de entorno

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Conectar base de datos
connectDB();

// Rutas con prefijo
app.use("/api/auth", authRoutes);
app.use("/api/workorders", workOrderRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/users", userRoutes); // opcional futuro

// Puerto desde .env o por defecto 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
