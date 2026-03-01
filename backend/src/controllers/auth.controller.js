// Registro y Login de usuarios

import User from '../models/user.model.js';  
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import { generateResetToken, hashResetToken } from "../utils/tokenUtils.js";
import { sendPasswordResetEmail } from "../config/email.js";

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

// Recuperar contraseña

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    
    if (user) {
      // Generar token y hash
      const resetToken = generateResetToken();
      const hashedToken = hashResetToken(resetToken);
      
      // Guardar en base de datos
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutos
      await user.save();

      // Enviar email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      
      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (emailError) {
        console.error('Error al enviar email:', emailError);
        // No devolvemos error al cliente por seguridad
      }
    }

    // Mensaje genérico por seguridad
    res.json({
      message: "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña."
    });

  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validar que se envió contraseña
    if (!password) {
      return res.status(400).json({ message: "Contraseña requerida." });
    }

    // Hashear el token recibido
    const hashedToken = hashResetToken(token);

    // Buscar usuario con token válido
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Token inválido o expirado." 
      });
    }

    // Actualizar contraseña
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente." });

  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ message: "Error al restablecer la contraseña." });
  }
};

// Reset password
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.json({ valid: false });
    }

    const hashedToken = hashResetToken(token);
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    res.json({ valid: !!user });

  } catch (error) {
    console.error("Error validating token:", error);
    res.json({ valid: false });
  }
};