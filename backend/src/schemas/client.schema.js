// Crear clientes

import { z } from 'zod';

const sanitizeText = (str) => {
  if (!str) return str;
  return str
    .replace(/[<>'"&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const clientSchema = z.object({
  name: z.string({ required_error: "El nombre es requerido" })
    .min(1, "El nombre no puede estar vacío")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim()
    .transform(sanitizeText),
    
  lastName: z.string({ required_error: "El apellido es requerido" })
    .min(1, "El apellido no puede estar vacío")
    .max(100, "El apellido no puede exceder 100 caracteres")
    .trim()
    .transform(sanitizeText),
    
  identificationNumber: z.string({ required_error: "La identificación es requerida" })
    .min(5, "La identificación debe tener al menos 5 caracteres")
    .max(20, "La identificación no puede exceder 20 caracteres")
    .regex(/^[A-Z0-9]+$/, "La identificación solo puede contener letras y números")
    .trim()
    .transform(str => str.toUpperCase()),
    
  email: z.string({ required_error: "El email es requerido" })
    .email("Debe ser un email válido")
    .max(255, "El email no puede exceder 255 caracteres")
    .optional()
    .nullable()
    .transform(email => email ? email.toLowerCase().trim() : null),
    
  phone: z.string({ required_error: "El teléfono es requerido" })
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(/^[\d\s()+-]+$/, "El teléfono solo puede contener números y símbolos (+, -, (), espacio)")
    .trim()
    .transform(sanitizeText),
    
  city: z.string({ required_error: "La ciudad es requerida" })
    .min(1, "La ciudad no puede estar vacía")
    .max(100, "La ciudad no puede exceder 100 caracteres")
    .trim()
    .transform(sanitizeText)
});

export const updateClientSchema = clientSchema.partial().required({
  identificationNumber: true
});