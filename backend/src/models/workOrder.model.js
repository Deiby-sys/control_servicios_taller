// Modelo de Orden de Trabajo

import mongoose from "mongoose";

// Esquema para archivos adjuntos
const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true }, // tamaño en bytes
  mimetype: { type: String, required: true },
  path: { type: String, required: true }, // ruta donde se guardó
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: { type: Date, default: Date.now }
});

// Esquema para notas
const noteSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const workOrderSchema = new mongoose.Schema({
  // Datos básicos
  orderNumber: {
    type: String,
    unique: true,
    default: () => `ORD-${Date.now()}`
  },
  entryDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  currentMileage: {
    type: Number,
    required: true,
    min: 0
  },
  serviceRequest: {
    type: String,
    required: true,
    trim: true
  },
  
  // Gestión de estados y responsables
  status: {
    type: String,
    enum: [
      'por_asignar', 
      'asignado', 
      'en_aprobacion', 
      'por_repuestos', 
      'en_soporte', 
      'en_proceso', 
      'completado'
    ],
    default: 'por_asignar'
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Seguimiento y notas
  notes: [noteSchema],
  
  // Archivos adjuntos
  attachments: [fileSchema],
  
  // Firma y PDF
  clientSignature: {
    type: String,
    default: null
  },
  pdfGenerated: {
    type: Boolean,
    default: false
  },
  
  // Relaciones
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  }
}, {
  timestamps: true
});

// ❌ Hook comentado temporalmente porque ha fallado el número de orden consecutivo
/*
workOrderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastOrder = await mongoose.model('WorkOrder').findOne({}, {}, { sort: { createdAt: -1 } });
    const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[1]) : 0;
    this.orderNumber = `ORD-${String(lastNumber + 1).padStart(4, '0')}`;
  }
  next();
});
*/

export default mongoose.model('WorkOrder', workOrderSchema);