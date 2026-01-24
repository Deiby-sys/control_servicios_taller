// Actualización usuarios

import { z } from "zod";

const ALLOWED_PROFILES = ["admin", "asesor", "bodega", "jefe", "tecnico"];

const sanitizeText = (str) => {
  if (!str) return str;
  return str
    .replace(/[<>'"&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const updateUserSchema = z.object({
  name: z.string()
    .max(100, "El nombre no puede exceder 100 caracteres")
    .optional()
    .transform(sanitizeText),
    
  lastName: z.string()
    .max(100, "El apellido no puede exceder 100 caracteres")
    .optional()
    .transform(sanitizeText),
    
  profile: z.enum(ALLOWED_PROFILES, {
    message: "Perfil inválido. Debe ser uno de: admin, asesor, bodega, jefe, tecnico"
  }).optional(),
  
  email: z.string()
    .email({ message: "Formato de email inválido" })
    .max(255, "El email no puede exceder 255 caracteres")
    .optional()
    .transform(email => email ? email.toLowerCase().trim() : email)
});