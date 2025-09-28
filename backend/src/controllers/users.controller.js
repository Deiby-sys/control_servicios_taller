//Servirá para listar usuarios

//getUserById → un "user" solo puede consultar su propio id.

//updateUser → un "user" solo puede modificar su propio id.

//deleteUser → solo "admin" puede eliminar.

//En todas las consultas, excluimos password con "-password"

import User from "../models/user.model.js";

//Listar todos los usuarios (solo admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // excluimos password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Si no es admin, solo puede ver su propio perfil
    if (req.user.profile !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const user = await User.findById(id, "-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Si no es admin, solo puede actualizar su propio perfil
    if (req.user.profile !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "No autorizado para actualizar este usuario" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      select: "-password",
    });

    if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Solo admin puede eliminar
    if (req.user.profile !== "admin") {
      return res.status(403).json({ message: "No autorizado para eliminar usuarios" });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
