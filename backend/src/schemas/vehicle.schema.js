// Esquema módulo placas

import { z } from 'zod';

export const vehicleSchema = z.object({
  plate: z.string({
    required_error: "La placa es requerida",
  })
    .min(6, "La placa debe tener exactamente 6 caracteres")
    .max(6, "La placa debe tener exactamente 6 caracteres")
    .regex(/^[A-Z0-9]+$/, "La placa solo puede contener letras mayúsculas y números"),
  vin: z.string({
    required_error: "El VIN es requerido",
  }).min(10, "El VIN debe tener al menos 10 caracteres"),
  brand: z.string({
    required_error: "La marca es requerida",
  }).min(2, "La marca debe tener al menos 2 caracteres"),
  line: z.string({
    required_error: "La línea es requerida",
  }).min(2, "La línea debe tener al menos 2 caracteres"),
  model: z.number({
    required_error: "El modelo es requerido",
  }).int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string({
    required_error: "El color es requerido",
  }).min(2, "El color debe tener al menos 2 caracteres"),
  client: z.string({
    required_error: "El cliente es requerido",
  }).min(1, "Debe seleccionar un cliente"),
});