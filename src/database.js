//con mongoose nos conectamos a la base de datos

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a la base de datos MongoDB");
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
    process.exit(1); // Detiene la app si falla la conexión
  }
};