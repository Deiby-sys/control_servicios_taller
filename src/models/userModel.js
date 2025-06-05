//vamos a estructurar los datos a manejar para los usuarios
import mongoose from 'mongoose';
import { email } from 'zod/v4';
const userSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
        profile: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }

    },

    {   //timestamps me agrega fecha de modificación de manera automática
        timestamps: true,
    });

export default mongoose.model('User', userSchema);