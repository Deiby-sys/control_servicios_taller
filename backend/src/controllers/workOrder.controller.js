// Controlador órdenes de trabajo

import WorkOrder from "../models/workOrder.model.js";
import Vehicle from "../models/vehicle.model.js";
import Client from "../models/client.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// Helper para sanitizar texto
const sanitizeText = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/[<>'"&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// --- FUNCIONES DE BÚSQUEDA (GET) ---

export const getVehicleByPlate = async (req, res) => {
  try {
    const { plate } = req.params;
    const cleanPlate = sanitizeText(plate).trim().toUpperCase();

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

export const getClientByIdentification = async (req, res) => {
  try {
    const { identification } = req.params;
    const cleanId = sanitizeText(identification).trim();

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

export const getWorkOrders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find()
      .populate('vehicle', 'plate') // Solo placa del vehículo
      .populate('client', 'name lastName') // Solo nombre del cliente
      .populate('createdBy', 'name lastName') // Solo creador
      .populate('assignedTo', 'name lastName') // Solo responsables
      .sort({ entryDate: -1 }) // Órdenes más recientes primero
      // CAMPOS ESENCIALES INCLUYEN entryDate Y deliveryDate
      .select(
        'entryDate deliveryDate status orderNumber currentMileage serviceRequest ' +
        'vehicle client createdBy assignedTo createdAt'
      );
    
    res.json(workOrders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ message: "Error al obtener órdenes" });
  }
};

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

export const getWorkOrdersByPlate = async (req, res) => {
  try {
    const { plate } = req.params;
    const cleanPlate = sanitizeText(plate).toUpperCase();
    const vehicleId = await Vehicle.findOne({ plate: cleanPlate }).select('_id');
    
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

export const getWorkOrderCounts = async (req, res) => {
  try {
    const counts = await WorkOrder.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } }
    ]);

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

export const createWorkOrder = async (req, res) => {
  try {
    // Validación de perfil

    console.log("Perfil del usuario en createWorkOrder:", req.user?.profile);

    if (!req.user || !['admin', 'asesor', 'jefe'].includes(req.user.profile)) {
      return res.status(403).json({ 
        message: "Solo administradores, asesores y jefes pueden crear órdenes" 
      });
    }

    const { vehicle, currentMileage, serviceRequest, clientSignature } = req.body;

    // Sanitizar campos de texto
    const sanitizedServiceRequest = sanitizeText(serviceRequest);
    const sanitizedClientSignature = clientSignature ? sanitizeText(clientSignature) : clientSignature;

    if (!vehicle || !mongoose.Types.ObjectId.isValid(vehicle)) {
      return res.status(400).json({ message: "ID de vehículo inválido" });
    }

    // BUSCAR VEHÍCULO Y PLACA
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    const clientDoc = await Client.findById(vehicleDoc.client);
    if (!clientDoc) {
      return res.status(400).json({ message: "Cliente del vehículo no válido" });
    }

    // VERIFICAR SI YA HAY UNA ORDEN ACTIVA PARA ESTA PLACA
    const existingActiveOrder = await WorkOrder.findOne({
      vehicle: vehicleDoc._id,
      status: { $ne: 'entregado' } // Cualquier estado excepto "entregado"
    });

    if (existingActiveOrder) {
      return res.status(409).json({ 
        message: `Ya existe una orden activa para la placa ${vehicleDoc.plate}. No se puede crear otra hasta que se entregue la actual.`
      });
    }

    // Crear la nueva orden
    const newOrder = new WorkOrder({
      vehicle: vehicleDoc._id,
      client: clientDoc._id,
      createdBy: req.user._id,
      currentMileage,
      serviceRequest: sanitizedServiceRequest,
      clientSignature: sanitizedClientSignature
    });

    const savedOrder = await newOrder.save();

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

export const addNoteToWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const author = req.user._id;

    // Sanitizar el contenido de la nota
    const sanitizedContent = sanitizeText(content);

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Bloquear si ya está entregada
    if (workOrder.status === 'entregado') {
      return res.status(400).json({ 
        message: "No se puede agregar nota a una orden ya entregada" 
      });
    }

    workOrder.notes.push({ author, content: sanitizedContent });
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
 * Actualiza estado y responsables — NO permite entregar ni editar órdenes entregadas.
 */
export const updateWorkOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Bloquear cualquier modificación si ya está entregada
    if (workOrder.status === 'entregado') {
      return res.status(400).json({ 
        message: "No se puede modificar una orden ya entregada" 
      });
    }

    // Prohibir cambiar a 'entregado' desde aquí
    if (status === 'entregado') {
      return res.status(400).json({ 
        message: "Use el endpoint /deliver para entregar una orden" 
      });
    }

    const validStatuses = [
      'por_asignar', 
      'asignado', 
      'en_aprobacion', 
      'por_repuestos', 
      'en_soporte', 
      'en_proceso', 
      'completado'
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado no válido" });
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
 * Entrega oficial: requiere firma, nota y establece deliveryDate.
 */
export const deliverWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliverySignature, deliveryNote } = req.body;

    // VALIDACIÓN CRÍTICA: verificar perfil del usuario
    if (!req.user || !['admin', 'asesor', 'jefe'].includes(req.user.profile)) {
      return res.status(403).json({ 
        message: "Solo administradores, asesores y jefes pueden entregar órdenes" 
      });
    }

    // Sanitizar campos de entrega
    const sanitizedDeliveryNote = sanitizeText(deliveryNote);
    const sanitizedDeliverySignature = sanitizeText(deliverySignature);

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Asegurar que no esté ya entregada (doble entrega)
    if (workOrder.status === 'entregado') {
      return res.status(400).json({ message: "La orden ya ha sido entregada" });
    }

    if (workOrder.status !== 'completado') {
      return res.status(400).json({ message: "La orden debe estar en estado 'completado' para entregar" });
    }

    if (!sanitizedDeliveryNote || !sanitizedDeliveryNote.trim()) {
      return res.status(400).json({ message: "La nota de resumen de actividades es obligatoria" });
    }

    if (!sanitizedDeliverySignature) {
      return res.status(400).json({ message: "La firma del cliente es obligatoria" });
    }

    workOrder.status = 'entregado';
    workOrder.deliverySignature = sanitizedDeliverySignature;
    workOrder.deliveryNote = sanitizedDeliveryNote;
    workOrder.deliveryDate = new Date();
    workOrder.deliveredBy = req.user._id;

    await workOrder.save();

    const populatedWorkOrder = await WorkOrder.findById(workOrder._id)
      .populate('vehicle', 'plate brand model')
      .populate('client', 'name lastName email')
      .populate('createdBy', 'name lastName')
      .populate('deliveredBy', 'name lastName')
      .populate('assignedTo', 'name lastName');

    res.json(populatedWorkOrder);
  } catch (error) {
    console.error("Error al entregar orden:", error);
    res.status(500).json({ message: "Error al entregar orden" });
  }
};

// --- Adjuntos ---

export const uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ningún archivo" });
    }

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Bloquear si ya está entregada
    if (workOrder.status === 'entregado') {
      return res.status(400).json({ 
        message: "No se pueden adjuntar archivos a una orden ya entregada" 
      });
    }

    workOrder.attachments.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      uploadedBy: req.user._id
    });

    await workOrder.save();

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

    const hasPermission = req.user._id.equals(workOrder.createdBy) || 
                         workOrder.assignedTo.some(user => user.equals(req.user._id));
    
    if (!hasPermission) {
      return res.status(403).json({ message: "No autorizado" });
    }

    res.download(attachment.path, attachment.originalName);
  } catch (error) {
    console.error("Error al descargar archivo:", error);
    res.status(500).json({ message: "Error al descargar archivo" });
  }
};

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

    if (!attachment.uploadedBy.equals(req.user._id) && !workOrder.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "No autorizado para eliminar este archivo" });
    }

    workOrder.attachments.pull({ _id: fileId });
    await workOrder.save();

    res.json({ message: "Archivo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
    res.status(500).json({ message: "Error al eliminar archivo" });
  }
};

export const getWorkOrderHistory = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find({ status: 'entregado' })
      .populate('vehicle', 'plate')
      .populate('client', 'name lastName')
      .populate('deliveredBy', 'name lastName')
      .sort({ deliveryDate: -1 })
      // SOLO CAMPOS NECESARIOS PARA EL HISTÓRICO
      .select(
        'orderNumber entryDate deliveryDate status currentMileage serviceRequest ' +
        'vehicle client deliveredBy'
      );

    res.json(workOrders);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ message: "Error al obtener historial" });
  }
};

export const checkActiveOrderByPlate = async (req, res) => {
  try {
    const { plate } = req.query;
    
    if (!plate) {
      return res.status(400).json({ message: "Placa requerida" });
    }

    const cleanPlate = sanitizeText(plate).trim().toUpperCase();
    console.log("Placa buscada:", cleanPlate);

    const vehicle = await Vehicle.findOne({ plate: cleanPlate });
    console.log("Vehículo encontrado:", vehicle);
    
    // Si el vehículo no existe, no hay órdenes activas
    if (!vehicle) {
      return res.json({ exists: false }); //Devuelve 200 con exists:false
    }

    const existingOrder = await WorkOrder.findOne({
      vehicle: vehicle._id,
      status: { $ne: 'entregado' }
    });
    console.log("Orden activa encontrada:", existingOrder);

    res.json({ exists: !!existingOrder });
  } catch (error) {
    console.error("Error al verificar orden activa:", error);
    res.status(500).json({ message: "Error al verificar orden" });
  }
};