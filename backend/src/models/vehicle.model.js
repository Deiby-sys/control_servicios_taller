// Modelo para el módulo vehículos

import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  plate: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    minlength: 6,  // Valida el mínimo de caracteres para la placa
    maxlength: 6   // Valida el máximo de caracteres para la placa
  },
  vin: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  line: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client', // o 'Client' si tienes un modelo separado
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Vehicle', vehicleSchema);