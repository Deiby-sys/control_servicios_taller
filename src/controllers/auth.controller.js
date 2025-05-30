//Vamos a crear las funciones para las auth

import User from '../models/userModel.js';//importamos el modelo de usuario
import bcrypt from 'bcryptjs';//con bcrypt vamos a encriptar la contraseña
import {createAccessToken} from '../libs/jwt.js';//con createAccessToken recibiremos el token del usuario


export const register = async (req, res) => {
    const {name, lastName, profile, email, password} = req.body;
try {

    const passwordHash = await bcrypt.hash(password, 10); //el número de veces que se va a encriptar el algoritmo
    const newUser = new User ({
        name,
        lastName,
        profile,
        email,
        password: passwordHash,
    }); 
    const userSaved = await newUser.save();
    const token = await createAccessToken({id: userSaved.id});

    res.cookie('token', token);
    res.json ({ //muestra en pantalla el json de nuestro usuario creado
        id: userSaved._id,
        name: userSaved.name,
        lastName: userSaved.lastName,
        profile: userSaved.profile,
        email: userSaved.email,
    });
    }   catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;
try {

    const userFound = await User.findOne({email}); //esta constante va a buscar si exite el usuario
    if (!userFound) return res.status(400).json({message: "User not found"});


    const  isMatch = await bcrypt.compare(password, userFound.password); //si si exite lo vamos a comparar con bcrypt.compare
    if (!isMatch) return res.status(400).json({message: "Incorrect password"});
   
    const token = await createAccessToken({id: userFound.id});

    res.cookie('token', token);
    res.json ({ //muestra en pantalla el json de nuestro usuario creado
        id: userFound._id,
        name: userFound.name,
        lastName: userFound.lastName,
        profile: userFound.profile,
        email: userFound.email,
    });
    }   catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const logout = (req, res) => {
    res.cookie('token', "", {
        expires: new Date(0)
    })
    return res.sendStatus(200);
};

export const profile = async (req, res) => {
    const userFound = await User.findById(req.user.id);
    if (!userFound) return res.status(400).json({message: "User not found"});
    return res.json({
        id: userFound._id,
        name: userFound.name,
        lastName: userFound.lastName,
        email: userFound.email,
        createdAt: userFound.createdAt,
        updateAt: userFound.updateAt,
    })
};