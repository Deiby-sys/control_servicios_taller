//Servirá para listar usuarios

import User from "../models/userModel.js";

// ✅ Listar todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // ocultamos el password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// ✅ Obtener un usuario por ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

// ✅ Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { name, lastName, profile, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, lastName, profile, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

// ✅ Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};
