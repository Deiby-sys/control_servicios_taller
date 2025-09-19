// Lógica de negocio

// Vamos a crear las funciones para las auth

import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';

export const register = async (req, res) => {
  const { name, lastName, profile, email, password } = req.body;
  try {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      lastName,
      profile,
      email,
      password: passwordHash,
    });

    const userSaved = await newUser.save();
    const token = await createAccessToken({ id: userSaved.id });

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    res.json({
      id: userSaved._id,
      name: userSaved.name,
      lastName: userSaved.lastName,
      profile: userSaved.profile,
      email: userSaved.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = await createAccessToken({ id: userFound.id });

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    res.json({
      id: userFound._id,
      name: userFound.name,
      lastName: userFound.lastName,
      profile: userFound.profile,
      email: userFound.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id);
  if (!userFound) return res.status(400).json({ message: "User not found" });

  return res.json({
    id: userFound._id,
    name: userFound.name,
    lastName: userFound.lastName,
    profile: userFound.profile,
    email: userFound.email,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt, // corregido
  });
};
