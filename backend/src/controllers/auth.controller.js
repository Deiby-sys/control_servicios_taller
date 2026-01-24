// Registro y Login de usuarios

import User from '../models/user.model.js';  
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

// Configuración de DOMPurify para Node.js
import { JSDOM } from 'jsdom';
const window = new JSDOM('').window;
import DOMPurify from 'dompurify';
const purify = DOMPurify(window);

// Helper para sanitizar texto con DOMPurify (versión final)
const sanitizeText = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  // Primero, sanitizar con DOMPurify
  let clean = purify.sanitize(str, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'img', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover']
  });
  
  // Luego, eliminar cualquier comilla restante y normalizar espacios
  clean = clean
    .replace(/["']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
    
  return clean;
};

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
    console.log("Datos recibidos:", req.body);
    
    const { name, lastName, email, password, profile } = req.body;

    const sanitizedName = sanitizeText(name);
    const sanitizedLastName = sanitizeText(lastName);
    const sanitizedEmail = email ? email.toLowerCase().trim() : email;

    console.log("Datos sanitizados:", { sanitizedName, sanitizedLastName, sanitizedEmail });

    const userFound = await User.findOne({ email: sanitizedEmail });
    if (userFound) return res.status(400).json({ message: "Email ya registrado" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: sanitizedName,
      lastName: sanitizedLastName,
      email: sanitizedEmail,
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
    console.error("Error en register:", error);
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

// Profile
export const profile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

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