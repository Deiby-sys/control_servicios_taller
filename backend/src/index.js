//index.js se encarga de arrancar la aplicación (server)

// Cargar dotenv PRIMERO, antes de cualquier otro import
import dotenv from "dotenv";
dotenv.config();

console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
console.log('🔐 EMAIL_PASS configurado:', !!process.env.EMAIL_PASS);

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error("❌ Variables de entorno faltantes");
  process.exit(1);
}

// Importar otros módulos
import { connectDB } from "./database.js";
import app from "./app.js";

// Conectar base de datos
connectDB();

// Puerto desde .env o por defecto 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
