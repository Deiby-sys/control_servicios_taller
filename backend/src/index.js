//index.js se encarga de arrancar la aplicación (server)

// Cargar dotenv PRIMERO, antes de cualquier otro import
// backend/src/index.js
import dotenv from "dotenv";
dotenv.config();

// Validación temprana de variables críticas
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error("❌ Variables de entorno faltantes: JWT_SECRET o MONGO_URI");
  process.exit(1);
}

// Importar módulos
import { connectDB } from "./database.js";
import app from "./app.js";

// Conectar a la base de datos y luego iniciar el servidor
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT} | NODE_ENV=${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar a MongoDB:", err.message);
    process.exit(1); // Esto hace que Render marque el deploy como fallido si hay error
  });

// Manejo global de errores (crítico para Render)
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

app.use(cors({
  origin: ['https://mytallerapp.vercel.app', 'http://localhost:5173', 'http://localhost:10000'],
  credentials: true
}));