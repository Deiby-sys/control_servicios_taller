// Registro y Login de usuarios

// Vamos a crear las funciones para las auth


// src/controllers/auth.controller.js
import User from '../models/user.model.js';  
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

// Helper para crear token
function createAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      profile: user.profile,
    },
    TOKEN_SECRET,
    { expiresIn: "1d" }
  );
}

// Registro
export const register = async (req, res) => {
  try {
    const { name, lastName, email, password, profile } = req.body;

    const userFound = await User.findOne({ email });
    if (userFound) return res.status(400).json({ message: "Email ya registrado" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      lastName,
      email,
      password: passwordHash,
      profile: profile || "user",
    });

    const savedUser = await newUser.save();
    const token = createAccessToken(savedUser);

    res.cookie("token", token);
    res.json({
      id: savedUser._id,
      name: savedUser.name,
      lastName: savedUser.lastName,
      email: savedUser.email,
      profile: savedUser.profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(401).json({ message: "Usuario o contraseña inválidos" }); 

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(401).json({ message: "Usuario o contraseña inválidos" });

    const token = createAccessToken(userFound);

    res.cookie("token", token);
    res.json({
      id: userFound._id,
      name: userFound.name,       
      lastName: userFound.lastName,
      email: userFound.email,
      profile: userFound.profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("token");
  return res.sendStatus(200);
};

// src/controllers/auth.controller.js

// Profile
export const profile = async (req, res) => {
  try {
    // req.user ya es el usuario completo (gracias a authRequired)
    // No necesitamos buscarlo de nuevo en la base de datos
    
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Devolver directamente req.user (ya está completo)
    res.json({
      id: req.user._id,
      name: req.user.name,
      lastName: req.user.lastName,
      email: req.user.email,
      profile: req.user.profile,
    });
  } catch (error) {
    console.error("Error en profile:", error);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
};