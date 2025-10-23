//Modelo clientes

import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
    {
        // 1. Identificación del Cliente
        identificationType: { // Tipo de documento: Cédula, RUC, Pasaporte, etc.
            type: String,
            required: [true, "El tipo de identificación es obligatorio"],
            enum: ['Cédula', 'RUC', 'Pasaporte', 'NIT', 'Otro'], // Limita las opciones
            default: 'Cédula',
        },
        identificationNumber: { // Número de identificación
            type: String,
            required: [true, "El número de identificación es obligatorio"],
            unique: true, // Asumimos que es un campo único
            trim: true,
        },
        
        // 2. Información Personal
        name: {
            type: String,
            required: [true, "El nombre del cliente es obligatorio"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "El apellido del cliente es obligatorio"],
            trim: true,
        },
        
        // 3. Contacto
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true, // Opcional: ¿Permitir clientes sin email o con emails duplicados?
            match: [/^\S+@\S+\.\S+$/, "El correo electrónico no tiene un formato válido"],
        },
        phone: {
            type: String,
            required: [true, "El teléfono de contacto es obligatorio"],
            trim: true,
        },
        
        // 4. Otros Datos
        address: {
            type: String,
            trim: true,
        },

        city: { // <--- CAMBIO AÑADIDO: Ciudad
            type: String,
            required: [true, "La ciudad es obligatoria"],
            trim: true,
        },
        
        // 5. Relación con el sistema (Quién lo creó)
        user: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Referencia al modelo de usuario que creó este cliente
            required: true, 
        }
    },
    {
        timestamps: true, // Añade 'createdAt' y 'updatedAt'
    }
);

export default mongoose.model("Client", clientSchema);