//Esquemas mongoose

// Datos a manejar para los usuarios

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "El apellido es obligatorio"],
      trim: true,
    },
    profile: {
      type: String,
      required: [true, "El perfil es obligatorio"],
      // Validación de perfiles permitidos
      enum: {
        values: ['admin', 'asesor', 'bodega', 'jefe', 'tecnico'],
        message: "Perfil no válido. Perfiles permitidos: admin, asesor, bodega, jefe, tecnico"
      },
      trim: true,
      lowercase: true // Asegura que siempre sea en minúsculas
    },
    email: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "El correo electrónico no tiene un formato válido",
      ],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener mínimo 6 caracteres"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);