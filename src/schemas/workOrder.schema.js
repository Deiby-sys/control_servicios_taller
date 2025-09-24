//con el esquema vamos a validar datos para work order

//Cuando use POST /workorders, todos los campos son requeridos (salvo date, que es opcional).

//Cuando use PUT /workorders/:id, todos los campos son opcionales, pero si llegan, deben cumplir las validaciones

import { z } from "zod";

// 📌 Crear orden de trabajo
export const createWorkOrderSchema = z.object({
  title: z
    .string({
      required_error: "El título es obligatorio",
    })
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(100, "El título no puede tener más de 100 caracteres"),

  description: z
    .string({
      required_error: "La descripción es obligatoria",
    })
    .min(5, "La descripción debe tener al menos 5 caracteres")
    .max(500, "La descripción no puede tener más de 500 caracteres"),

  date: z
    .string()
    .datetime({ message: "La fecha debe ser un formato válido (ISO 8601)" })
    .optional(),
});

// 📌 Actualizar orden de trabajo (campos opcionales)
export const updateWorkOrderSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(100, "El título no puede tener más de 100 caracteres")
    .optional(),

  description: z
    .string()
    .min(5, "La descripción debe tener al menos 5 caracteres")
    .max(500, "La descripción no puede tener más de 500 caracteres")
    .optional(),

  date: z
    .string()
    .datetime({ message: "La fecha debe ser un formato válido (ISO 8601)" })
    .optional(),
});
