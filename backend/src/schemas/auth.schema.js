//con schemas vamos a validar datos

import { z } from 'zod';

// Define los perfiles permitidos (usa los mismos valores que en el frontend)
const ALLOWED_PROFILES = ["admin", "asesor", "bodega", "jefe", "tecnico"];

export const registerSchema = z.object({
  name: z.string({
    required_error: "Name is required",
  }),
  lastName: z.string({
    required_error: "Last name is required",
  }),
  profile: z.enum(ALLOWED_PROFILES, {
    required_error: "Profile is required",
    invalid_type_error: "Invalid profile. Must be one of: admin, asesor, bodega, jefe, tecnico",
  }),
  email: z.string({
    required_error: "Email is required",
  }).email({
    message: "Invalid email",
  }),
  password: z.string({
    required_error: "Password is required",
  }).min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export const loginSchema = z.object({
  email: z.string({
    required_error: "Email is required",
  }).email({
    message: "Invalid email",
  }),
  password: z.string({
    required_error: "Password is required",
  }).min(6, {
    message: "Password must be at least 6 characters",
  }),
});