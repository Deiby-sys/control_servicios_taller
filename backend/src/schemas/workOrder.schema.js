//con el esquema vamos a validar datos para work order

// src/schemas/workOrder.schema.js
import { z } from 'zod';

export const workOrderSchema = z.object({
  vehicle: z.string({
    required_error: "El vehículo es requerido",
  }).min(1, "Debe seleccionar un vehículo"),
  currentMileage: z.number({
    required_error: "El kilometraje es requerido",
  }).min(0, "El kilometraje no puede ser negativo"),
  serviceRequest: z.string({
    required_error: "La solicitud es requerida",
  }).min(10, "La solicitud debe tener al menos 10 caracteres")
});