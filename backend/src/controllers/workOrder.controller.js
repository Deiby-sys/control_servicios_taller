// Controlador órdenes de trabajo

import WorkOrder from "../models/workOrder.model.js";
import Vehicle from "../models/vehicle.model.js";
import Client from "../models/client.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// --- FUNCIONES DE BÚSQUEDA (GET) ---

/**
 * Busca un vehículo por su placa y popula la información del cliente.
 */
export const getVehicleByPlate = async (req, res) => {
  try {
    const { plate } = req.params;
    const cleanPlate = plate.trim().toUpperCase();

    const vehicle = await Vehicle.findOne({ plate: cleanPlate })
      .populate('client', 'name lastName identificationNumber phone city email');

    if (!vehicle) {
      return res.status(404).json({ message: `Vehículo con placa ${cleanPlate} no encontrado.` });
    }

    res.json(vehicle);
  } catch (error) {
    console.error("Error al buscar vehículo:", error);
    res.status(500).json({ message: "Error al buscar vehículo" });
  }
};

/**
 * Busca un cliente por su número de identificación.
 */
export const getClientByIdentification = async (req, res) => {
  try {
    const { identification } = req.params;
    const cleanId = identification.trim();

    const client = await Client.findOne({ 
      identificationNumber: cleanId 
    }).select('name lastName identificationNumber phone city email'); 

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado con esa identificación." });
    }

    res.json(client);
  } catch (error) {
    console.error("Error al buscar cliente:", error);
    res.status(500).json({ message: "Error al buscar cliente." });
  }
};

/**
 * Obtener todas las órdenes de trabajo.
 */
export const getWorkOrders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find()
      .populate('vehicle', 'plate vin brand line model color')
      .populate('client', 'name lastName email')
      .populate('createdBy', 'name lastName')
      .populate('assignedTo', 'name lastName')
      .populate('notes.author', 'name lastName')
      .sort({ entryDate: -1 })
      .select('-__v');
    res.json(workOrders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ message: "Error al obtener órdenes" });
  }
};

/**
 * Obtener orden por ID.
 */
export const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findById(id)
      .populate('vehicle', 'plate vin brand line model color client')
      .populate('client', 'name lastName email identificationNumber phone city')
      .populate('createdBy', 'name lastName profile')
      .populate('assignedTo', 'name lastName profile')
      .populate('notes.author', 'name lastName profile');
    
    if (!workOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    
    res.json(workOrder);
  } catch (error) {
    console.error("Error al obtener orden:", error);
    res.status(500).json({ message: "Error al obtener orden" });
  }
};

/**
 * Obtener órdenes por estado.
 */
export const getWorkOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    const validStatuses = [
      'por_asignar', 
      'asignado', 
      'en_aprobacion', 
      'por_repuestos', 
      'en_soporte', 
      'en_proceso', 
      'completado'
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const workOrders = await WorkOrder.find({ status })
      .populate('vehicle', 'plate brand model')
      .populate('client', 'name lastName')
      .populate('createdBy', 'name lastName')
      .select('-__v');
    
    res.json(workOrders);
  } catch (error) {
    console.error("Error al obtener órdenes por estado:", error);
    res.status(500).json({ message: "Error al obtener órdenes por estado" });
  }
};

/**
 * Historial completo de órdenes con búsqueda por placa.
 */
export const getWorkOrdersByPlate = async (req, res) => {
  try {
    const { plate } = req.params;
    const vehicleId = await Vehicle.findOne({ plate: plate.toUpperCase() }).select('_id');
    
    if (!vehicleId) {
      return res.status(200).json([]);
    }
    
    const workOrders = await WorkOrder.find({ vehicle: vehicleId._id })
      .populate('vehicle', 'plate vin brand line model color client')
      .populate('client', 'name lastName email identificationNumber phone city')
      .populate('createdBy', 'name lastName profile')
      .populate('assignedTo', 'name lastName profile')
      .populate('notes.author', 'name lastName profile')
      .sort({ entryDate: -1 });
    
    res.json(workOrders);
  } catch (error) {
    console.error("Error al buscar órdenes por placa:", error);
    res.status(500).json({ message: "Error al buscar órdenes por placa" });
  }
};

/**
 * Obtener contador de órdenes por estado.
 */
export const getWorkOrderCounts = async (req, res) => {
  try {
    const counts = await WorkOrder.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } }
    ]);

    // Añadido 'en_proceso'
    const result = {
      por_asignar: 0,
      asignado: 0,
      en_aprobacion: 0,
      por_repuestos: 0,
      en_soporte: 0,
      en_proceso: 0,
      completado: 0
    };

    counts.forEach(item => {
      if (result.hasOwnProperty(item.status)) {
        result[item.status] = item.count;
      }
    });

    res.json(result);
  } catch (error) {
    console.error("Error al contar órdenes por estado:", error);
    res.status(500).json({ message: "Error al contar órdenes por estado" });
  }
};

// --- FUNCIONES DE ACCIÓN (POST/PATCH) ---

/**
 * Crea una nueva orden de trabajo.
 */
export const createWorkOrder = async (req, res) => {
  try {
    const { vehicle, currentMileage, serviceRequest, clientSignature } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    if (!vehicle || !mongoose.Types.ObjectId.isValid(vehicle)) {
      return res.status(400).json({ message: "ID de vehículo inválido" });
    }

    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    const clientDoc = await Client.findById(vehicleDoc.client);
    if (!clientDoc) {
      return res.status(400).json({ message: "Cliente del vehículo no válido" });
    }

    const newOrder = new WorkOrder({
      vehicle: vehicleDoc._id,
      client: clientDoc._id,
      createdBy: req.user._id,
      currentMileage,
      serviceRequest,
      clientSignature
    });

    const savedOrder = await newOrder.save();

    // Obtener datos relacionados manualmente
    const [vehicleData, clientData, userData] = await Promise.all([
      Vehicle.findById(savedOrder.vehicle).select('plate vin brand line model color'),
      Client.findById(savedOrder.client).select('name lastName email identificationNumber phone city'),
      User.findById(savedOrder.createdBy).select('name lastName')
    ]);

    const response = {
      ...savedOrder.toObject(),
      vehicle: vehicleData,
      client: clientData,
      createdBy: userData
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error al crear orden:", error);
    res.status(500).json({ message: "Error interno al crear orden" });
  }
};

/**
 * Agrega una nota a una orden de trabajo existente.
 */
export const addNoteToWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const author = req.user._id;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    workOrder.notes.push({ author, content });
    await workOrder.save();

    const updatedOrder = await WorkOrder.findById(id)
      .populate('vehicle', 'plate brand model')
      .populate('client', 'name lastName')
      .populate('notes.author', 'name lastName')
      .populate('assignedTo', 'name lastName');

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error al agregar nota:", error);
    res.status(500).json({ message: "Error al agregar nota" });
  }
};

/**
 * Actualiza el estado y asigna responsables.
 */
export const updateWorkOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    // Validación opcional de estados
    const validStatuses = [
      'por_asignar', 
      'asignado', 
      'en_aprobacion', 
      'por_repuestos', 
      'en_soporte', 
      'en_proceso', 
      'completado',
      'entregado'
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (status) workOrder.status = status;
    if (assignedTo) workOrder.assignedTo = assignedTo;

    await workOrder.save();

    const updatedOrder = await WorkOrder.findById(id)
      .populate('vehicle', 'plate brand model')
      .populate('client', 'name lastName')
      .populate('assignedTo', 'name lastName')
      .populate('notes.author', 'name lastName');

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error al actualizar orden:", error);
    res.status(500).json({ message: "Error al actualizar orden" });
  }
};

/**
 * Proceso final de entrega y firma del cliente.
 */
export const deliverWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliverySignature } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (workOrder.status !== 'completado') {
      return res.status(400).json({ message: "La orden debe estar en estado 'completado' para entregar" });
    }

    workOrder.status = 'entregado';
    workOrder.deliverySignature = deliverySignature;
    workOrder.deliveryDate = new Date();
    await workOrder.save();

    const populatedOrder = await WorkOrder.findById(id)
      .populate('vehicle', 'plate brand model')
      .populate('client', 'name lastName')
      .populate('createdBy', 'name lastName');

    res.json(populatedOrder);
  } catch (error) {
    console.error("Error al entregar orden:", error);
    res.status(500).json({ message: "Error al entregar orden" });
  }
};

// Funciones para adjuntos

/**
 * Subir archivo adjunto a una orden de trabajo
 */
export const uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el archivo exista
    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ningún archivo" });
    }

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Añadir archivo a la orden
    workOrder.attachments.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      uploadedBy: req.user._id
    });

    await workOrder.save();

    // Poblar y devolver la orden actualizada
    const populatedOrder = await WorkOrder.findById(id)
      .populate('vehicle', 'plate brand model')
      .populate('client', 'name lastName email')
      .populate('createdBy', 'name lastName')
      .populate('assignedTo', 'name lastName')
      .populate('attachments.uploadedBy', 'name lastName');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("Error al subir archivo:", error);
    res.status(500).json({ message: "Error al subir archivo" });
  }
};

/**
 * Descargar archivo adjunto
 */
export const downloadAttachment = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const attachment = workOrder.attachments.id(fileId);
    if (!attachment) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    // Verificar permisos (opcional: solo el creador o asignados pueden descargar)
    const hasPermission = req.user._id.equals(workOrder.createdBy) || 
                         workOrder.assignedTo.some(user => user.equals(req.user._id));
    
    if (!hasPermission) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Enviar archivo
    const filePath = attachment.path;
    res.download(filePath, attachment.originalName);
  } catch (error) {
    console.error("Error al descargar archivo:", error);
    res.status(500).json({ message: "Error al descargar archivo" });
  }
};

/**
 * Eliminar archivo adjunto
 */
export const deleteAttachment = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const attachment = workOrder.attachments.id(fileId);
    if (!attachment) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    // Verificar que el usuario sea el que subió el archivo o el creador de la orden
    if (!attachment.uploadedBy.equals(req.user._id) && !workOrder.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "No autorizado para eliminar este archivo" });
    }

    // Eliminar archivo físico (opcional, dependiendo de tu configuración)
    // const fs = require('fs');
    // fs.unlinkSync(attachment.path);

    // Eliminar del array
    workOrder.attachments.pull({ _id: fileId });
    await workOrder.save();

    res.json({ message: "Archivo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
    res.status(500).json({ message: "Error al eliminar archivo" });
  }
};