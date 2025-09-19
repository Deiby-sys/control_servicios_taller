//con el esquemas para tasks vamos a validar datos para work order

import { z } from "zod";

export const createWorkOrderSchema = z.object({
  title: z.string({
    required_error: "El título es obligatorio",
  }),

  description: z.string({
    required_error: "La descripción es obligatoria",
  }),

  date: z.string().datetime().optional(),

  status: z.enum([
    "pendiente_asignar",
    "pendiente_aprobación",
    "pendiente_repuestos",
    "en_progreso",
    "finalizado"
  ]).default("pendiente_asignar"),

  cliente: z.string({
    required_error: "El cliente es obligatorio",
  }),

  tecnicoAsignado: z.string().optional(), // puede ir vacío al crear
});
