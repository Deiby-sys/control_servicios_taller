//con el esquema vamos a validar datos para work order

import { z } from 'zod';

const sanitizeText = (str) => {
  if (!str) return str;
  return str
    .replace(/[<>'"&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const workOrderSchema = z.object({
  vehicle: z.string({
    required_error: "El vehículo es requerido",
  })
    .regex(/^[0-9a-fA-F]{24}$/, "ID de vehículo inválido")
    .min(1, "Debe seleccionar un vehículo"),
    
  currentMileage: z.number({
    required_error: "El kilometraje es requerido",
  })
    .min(0, "El kilometraje no puede ser negativo")
    .max(9999999, "El kilometraje no puede exceder 9,999,999 km"),
    
  serviceRequest: z.string({
    required_error: "La solicitud es requerida",
  })
    .min(10, "La solicitud debe tener al menos 10 caracteres")
    .max(1000, "La solicitud no puede exceder 1000 caracteres")
    .transform(sanitizeText)
});