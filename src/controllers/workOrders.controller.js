// 📌 Obtener una orden de trabajo por ID

// Vamos a crear las funciones para las workOrder

//admin → CRUD completo sobre todas las órdenes.

//user → puede crear órdenes, y solo puede ver/editar las suyas.

//Solo admin puede eliminar órdenes.

import WorkOrder from "../models/workOrder.model.js";

//Listar órdenes de trabajo
export const getWorkOrders = async (req, res) => {
  try {
    let workOrders;

    if (req.user.profile === "admin") {
      // Admin ve todas
      workOrders = await WorkOrder.find().populate("user", "-password");
    } else {
      // Usuario normal solo ve las suyas
      workOrders = await WorkOrder.find({ user: req.user.id }).populate("user", "-password");
    }

    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Obtener una orden de trabajo por ID
export const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findById(id).populate("user", "-password");

    if (!workOrder) return res.status(404).json({ message: "Orden no encontrada" });

    // Validación: user solo accede a la suya
    if (req.user.profile !== "admin" && workOrder.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado para ver esta orden" });
    }

    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Crear orden de trabajo
export const createWorkOrder = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    const newWorkOrder = new WorkOrder({
      title,
      description,
      date,
      user: req.user.id, // siempre el id normalizado
    });

    const savedWorkOrder = await newWorkOrder.save();
    res.json(savedWorkOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Actualizar orden de trabajo
export const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let workOrder = await WorkOrder.findById(id);

    if (!workOrder) return res.status(404).json({ message: "Orden no encontrada" });

    // Validación: user solo edita la suya
    if (req.user.profile !== "admin" && workOrder.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado para actualizar esta orden" });
    }

    workOrder = await WorkOrder.findByIdAndUpdate(id, req.body, { new: true });
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Eliminar orden de trabajo
export const deleteWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findById(id);

    if (!workOrder) return res.status(404).json({ message: "Orden no encontrada" });

    // Solo admin puede eliminar
    if (req.user.profile !== "admin") {
      return res.status(403).json({ message: "No autorizado para eliminar esta orden" });
    }

    await WorkOrder.findByIdAndDelete(id);
    res.json({ message: "Orden eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
