// Lógica de negocio

// Vamos a crear las funciones para las workOrder

import WorkOrder from "../models/workOrder.model.js"; // ✅ ruta corregida

// 📌 Obtener todas las órdenes
export const getWorkOrders = async (req, res) => {
  try {
    const orders = await WorkOrder.find()
      .populate("cliente", "name lastName email")
      .populate("tecnicoAsignado", "name lastName email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Crear una orden
export const createWorkOrder = async (req, res) => {
  try {
    const { title, description, date, cliente, tecnicoAsignado } = req.body;
    const newWorkOrder = new WorkOrder({
      title,
      description,
      date,
      cliente,
      tecnicoAsignado,
    });
    const savedWorkOrder = await newWorkOrder.save();
    res.status(201).json(savedWorkOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📌 Obtener una orden por ID
export const getWorkOrder = async (req, res) => {
  try {
    const order = await WorkOrder.findById(req.params.id)
      .populate("cliente", "name lastName email")
      .populate("tecnicoAsignado", "name lastName email");
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Actualizar una orden
export const updateWorkOrder = async (req, res) => {
  try {
    const order = await WorkOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📌 Eliminar una orden
export const deleteWorkOrder = async (req, res) => {
  try {
    const order = await WorkOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    res.json({ message: "Orden eliminada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

