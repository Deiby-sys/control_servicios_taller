//con schemas vamos a validar datos

import {z} from 'zod';//con zod se comprueban los datos (si es un correo, si es una contraseña, etc)

export const registerSchema = z.object ({
    name: z.string ({
        required_error: "Name is required",
    }),
    lastName: z.string ({
        required_error: "Last name is required",
    }),
    profile: z.string ({
        required_error: "Profile is required",
    }),
    email: z.string ({
        required_error: "Email is required",
        })
        .email ({
            message: "Invalid email",
    }),
    password: z.string ({
        required_error: "Password is required",
        })
        .min(6, {
            message: "Password must be at least 6 characters",
    }),

});

export const loginSchema = z.object ({
    email: z.string ({
        required_error: "Email is required",
        })
        .email ({
            message: "Invalid email",
    }),
    password: z.string ({
        required_error: "Password is required",
        })
        .min (6, {
            message: "Password must be at least 6 characters",
        }),
});