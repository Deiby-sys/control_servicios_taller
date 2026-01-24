// Esquema módulo placas

import { z } from 'zod';

const sanitizeText = (str) => {
  if (!str) return str;
  return str
    .replace(/[<>'"&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const vehicleSchema = z.object({
  plate: z.string({
    required_error: "La placa es requerida",
  })
    .min(6, "La placa debe tener exactamente 6 caracteres")
    .max(6, "La placa debe tener exactamente 6 caracteres")
    .regex(/^[A-Z0-9]+$/, "La placa solo puede contener letras mayúsculas y números")
    .transform(str => str.toUpperCase()),
    
  vin: z.string({
    required_error: "El VIN es requerido",
  })
    .min(10, "El VIN debe tener al menos 10 caracteres")
    .max(17, "El VIN no puede exceder 17 caracteres")
    .transform(sanitizeText),
    
  brand: z.string({
    required_error: "La marca es requerida",
  })
    .min(2, "La marca debe tener al menos 2 caracteres")
    .max(50, "La marca no puede exceder 50 caracteres")
    .transform(sanitizeText),
    
  line: z.string({
    required_error: "La línea es requerida",
  })
    .min(2, "La línea debe tener al menos 2 caracteres")
    .max(50, "La línea no puede exceder 50 caracteres")
    .transform(sanitizeText),
    
  model: z.number({
    required_error: "El modelo es requerido",
  })
    .int()
    .min(1900, "El modelo debe ser mayor o igual a 1900")
    .max(new Date().getFullYear() + 1, `El modelo no puede ser mayor a ${new Date().getFullYear() + 1}`),
    
  color: z.string({
    required_error: "El color es requerido",
  })
    .min(2, "El color debe tener al menos 2 caracteres")
    .max(30, "El color no puede exceder 30 caracteres")
    .transform(sanitizeText),
    
  client: z.string({
    required_error: "El cliente es requerido",
  })
    .regex(/^[0-9a-fA-F]{24}$/, "ID de cliente inválido")
    .min(1, "Debe seleccionar un cliente"),
});