//vamos a estructurar los datos a manejar para los usuarios
import mongoose from "mongoose";
const userSchema = mongoose.Schema = ({
    name: {
        type: String,
        required: true,
        trim: true
    },
        perfil: {
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

export default mongoose.model("User", userSchema);