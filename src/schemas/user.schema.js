//Actualización de usuarios

import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().optional(),
  lastName: z.string().optional(),
  profile: z.string().optional(),
  email: z.string().email({ message: "Invalid email format" }).optional(),
});
