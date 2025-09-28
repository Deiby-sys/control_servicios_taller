//index.js se encarga de arrancar la aplicación (server)


// server.js

import dotenv from "dotenv";
import { connectDB } from "./database.js";
import app from "./app.js";  // aquí importo app ya configurada

dotenv.config();

// Conectar base de datos
connectDB();

// Puerto desde .env o por defecto 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

