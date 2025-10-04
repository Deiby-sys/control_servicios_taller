// Esquema de Validación Zod para Clientes

// frontend/src/schemas/client.schema.js
import { z } from 'zod';

// Zod schema para la validación del formulario de clientes
export const clientSchema = z.object({
    identificationType: z.string({
        required_error: "El tipo de identificación es obligatorio",
    }).min(1, { message: "Seleccione un tipo de identificación" }),

    identificationNumber: z.string({
        required_error: "El número de identificación es obligatorio",
    }).min(4, {
        message: "El número de identificación debe tener al menos 4 caracteres",
    }),

    name: z.string({
        required_error: "El nombre es obligatorio",
    }).min(2, {
        message: "El nombre debe tener al menos 2 caracteres",
    }),

    lastName: z.string({
        required_error: "El apellido es obligatorio",
    }).min(2, {
        message: "El apellido debe tener al menos 2 caracteres",
    }),

    phone: z.string({
        required_error: "El teléfono de contacto es obligatorio",
    }).min(7, {
        message: "El teléfono debe tener al menos 7 dígitos",
    }),

    city: z.string({
        required_error: "La ciudad es obligatoria",
    }).min(2, {
        message: "Ingrese una ciudad válida",
    }),

    address: z.string().optional(),
    email: z.string().email({ message: "Email no válido" }).optional().or(z.literal('')),
});