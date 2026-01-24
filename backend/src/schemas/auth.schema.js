//con schemas vamos a validar datos

import { z } from 'zod';

const ALLOWED_PROFILES = ["admin", "asesor", "bodega", "jefe", "tecnico"];

export const registerSchema = z.object({
  name: z.string({
    required_error: "Name is required",
  })
    .min(1, "Name is required")
    .max(50, "Name is too long"),
    
  lastName: z.string({
    required_error: "Last name is required",
  })
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
    
  profile: z.enum(ALLOWED_PROFILES, {
    required_error: "Profile is required",
    invalid_type_error: "Invalid profile. Must be one of: admin, asesor, bodega, jefe, tecnico",
  }),
  
  email: z.string({
    required_error: "Email is required",
  })
    .email({
      message: "Invalid email",
    })
    .max(255, "Email is too long"),
    
  password: z.string({
    required_error: "Password is required",
  })
    .min(8, {
      message: "Password must be at least 8 characters",
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password must contain uppercase, lowercase, and number",
    }),
});

export const loginSchema = z.object({
  email: z.string({
    required_error: "Email is required",
  })
    .email({
      message: "Invalid email",
    })
    .max(255, "Email is too long"),
    
  password: z.string({
    required_error: "Password is required",
  })
    .min(6, {
      message: "Password must be at least 6 characters",
    }),
});