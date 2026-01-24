// Controlador de vehículos

import Vehicle from "../models/vehicle.model.js";
import Client from "../models/client.model.js"; 

// Helper para sanitizar texto
const sanitizeText = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/[<>'"&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate('client', 'name lastName identificationNumber phone city')
      .select('-__v');
    res.json(vehicles);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    res.status(500).json({ message: "Error al obtener vehículos" });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { plate, vin, brand, line, model, color, client } = req.body;

    // Sanitizar campos de texto
    const sanitizedPlate = sanitizeText(plate).toUpperCase();
    const sanitizedVin = sanitizeText(vin);
    const sanitizedBrand = sanitizeText(brand);
    const sanitizedLine = sanitizeText(line);
    const sanitizedColor = sanitizeText(color);

    // Verificar que el cliente exista
    const clientExists = await Client.findById(client);
    if (!clientExists) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Verificar que la placa no exista
    const plateExists = await Vehicle.findOne({ plate: sanitizedPlate });
    if (plateExists) {
      return res.status(400).json({ message: "La placa ya está registrada" });
    }

    // Verificar que el VIN no exista
    const vinExists = await Vehicle.findOne({ vin: sanitizedVin });
    if (vinExists) {
      return res.status(400).json({ message: "El VIN ya está registrado" });
    }

    const newVehicle = new Vehicle({
      plate: sanitizedPlate,
      vin: sanitizedVin,
      brand: sanitizedBrand,
      line: sanitizedLine,
      model: parseInt(model),
      color: sanitizedColor,
      client
    });

    const savedVehicle = await newVehicle.save();
    const populatedVehicle = await Vehicle.findById(savedVehicle._id)
      .populate('client', 'name lastName identificationNumber');

    res.status(201).json(populatedVehicle);
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    res.status(500).json({ message: error.message || "Error al crear vehículo" });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id)
      .populate('client', 'name lastName identificationNumber phone city');
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    
    res.json(vehicle);
  } catch (error) {
    console.error("Error al obtener vehículo:", error);
    res.status(500).json({ message: "Error al obtener vehículo" });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { plate, vin, brand, line, model, color, client } = req.body;

    // Sanitizar campos de texto
    const sanitizedPlate = sanitizeText(plate).toUpperCase();
    const sanitizedVin = sanitizeText(vin);
    const sanitizedBrand = sanitizeText(brand);
    const sanitizedLine = sanitizeText(line);
    const sanitizedColor = sanitizeText(color);

    // Verificar cliente
    const clientExists = await Client.findById(client);
    if (!clientExists) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { 
        plate: sanitizedPlate, 
        vin: sanitizedVin, 
        brand: sanitizedBrand, 
        line: sanitizedLine, 
        model: parseInt(model), 
        color: sanitizedColor, 
        client 
      },
      { new: true, runValidators: true }
    ).populate('client', 'name lastName identificationNumber phone city');

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    res.json(updatedVehicle);
  } catch (error) {
    console.error("Error al actualizar vehículo:", error);
    res.status(500).json({ message: error.message || "Error al actualizar vehículo" });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);
    
    if (!deletedVehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    
    res.json({ message: "Vehículo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    res.status(500).json({ message: "Error al eliminar vehículo" });
  }
};

//Buscar el vehículo por placa
export const getVehicleByPlate = async (req, res) => {
  try {
    const { plate } = req.params;
    const cleanPlate = sanitizeText(plate).trim().toUpperCase();
    
    const vehicle = await Vehicle.findOne({ plate: cleanPlate })
      .populate('client', 'name lastName identificationNumber phone city');
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    
    res.json(vehicle);
  } catch (error) {
    console.error("Error al buscar vehículo por placa:", error);
    res.status(500).json({ message: "Error al buscar vehículo por placa" });
  }
};