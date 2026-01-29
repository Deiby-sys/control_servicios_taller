// Controlador para usuarios

import User from "../models/user.model.js";

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

// Crear nuevo usuario (solo admin)
export const createUser = async (req, res) => {
  try {
    if (req.user.profile !== "admin") {
      return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
    }

    const { name, lastName, email, password, profile } = req.body;
    
    // Sanitizar campos de texto
    const sanitizedName = sanitizeText(name);
    const sanitizedLastName = sanitizeText(lastName);
    const sanitizedEmail = email ? email.toLowerCase().trim() : email;

    const validProfiles = ['admin', 'asesor', 'bodega', 'jefe', 'tecnico'];
    if (!validProfiles.includes(profile)) {
      return res.status(400).json({ message: "Perfil no válido" });
    }

    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email ya registrado" });
    }

    const newUser = new User({
      name: sanitizedName,
      lastName: sanitizedLastName,
      email: sanitizedEmail,
      password,
      profile
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error en createUser:", error);
    res.status(500).json({ message: error.message });
  }
};

//Listar todos los usuarios (solo admin)
export const getUsers = async (req, res) => {
  try {
    if (req.user.profile !== "admin") {
      return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
    }

    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    console.error("Error en getUsers:", error);
    res.status(500).json({ message: error.message });
  }
};

//Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.profile !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const user = await User.findById(id, "-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    console.error("Error en getUserById:", error);
    res.status(500).json({ message: error.message });
  }
};

//Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.profile !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "No autorizado para actualizar este usuario" });
    }

    // Sanitizar campos de texto en la actualización
    const sanitizedBody = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        sanitizedBody[key] = sanitizeText(value);
      } else {
        sanitizedBody[key] = value;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, sanitizedBody, {
      new: true,
      select: "-password",
    });

    if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error en updateUser:", error);
    res.status(500).json({ message: error.message });
  }
};

//Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.profile !== "admin") {
      return res.status(403).json({ message: "No autorizado para eliminar usuarios" });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error en deleteUser:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lista de responsables para todos los perfiles
export const getPublicUsersList = async (req, res) => {
  try {
    const users = await User.find(
      {}, 
      'name lastName _id profile' // solo campos seguros
    ).sort({ name: 1, lastName: 1 });
    
    res.json(users);
  } catch (error) {
    console.error("Error al obtener lista de usuarios:", error);
    res.status(500).json({ message: "Error al obtener lista de usuarios" });
  }
};