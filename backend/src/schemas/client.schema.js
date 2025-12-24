// Esquema para clientes

import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string({ required_error: "El nombre es requerido" })
    .min(1, "El nombre no puede estar vacío")
    .trim(),
  lastName: z.string({ required_error: "El apellido es requerido" })
    .min(1, "El apellido no puede estar vacío")
    .trim(),
  identificationNumber: z.string({ required_error: "La identificación es requerida" })
    .min(1, "La identificación no puede estar vacía")
    .trim(),
  email: z.string({ required_error: "El email es requerido" })
    .email("Debe ser un email válido")
    .optional()
    .nullable(),
  phone: z.string({ required_error: "El teléfono es requerido" })
    .min(1, "El teléfono no puede estar vacío")
    .trim(),
  city: z.string({ required_error: "La ciudad es requerida" })
    .min(1, "La ciudad no puede estar vacía")
    .trim()
});

// Esquema para actualizaciones (todos los campos opcionales excepto identificación)
export const updateClientSchema = clientSchema.partial().required({
  identificationNumber: true
});