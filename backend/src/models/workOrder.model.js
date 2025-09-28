//Esquemas mongoose

// Modelo de Orden de Trabajo

import mongoose from "mongoose";

const workOrderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // relación con el cliente
      required: false,
    },
    tecnicoAsignado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // relación con el técnico asignado
      required: false, // puede estar vacío al inicio
    },
    status: {
      type: String,
      enum: [
        "pendiente_asignar",
        "pendiente_aprobación",
        "pendiente_repuestos",
        "en_progreso",
        "completada",
        "cancelada",
      ],
      default: "pendiente_asignar",
    },

    // Relación con el usuario que creó la orden
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  
  {
    timestamps: true, // crea createdAt y updatedAt automáticamente
  }
);

export default mongoose.model("WorkOrder", workOrderSchema);