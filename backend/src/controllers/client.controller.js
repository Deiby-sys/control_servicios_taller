// Controlador de clientes CRUD

import Client from '../models/client.model.js';

// 1. CREAR un nuevo cliente
export const createClient = async (req, res) => {
    try {
        // Extraemos los datos del cuerpo de la petición (req.body)
        const { 
            identificationType, 
            identificationNumber, 
            name, 
            lastName, 
            email, 
            phone, 
            city,
            address 
        } = req.body;
        
        const clientFound = await Client.findOne({ identificationNumber });
        if (clientFound) {
            return res.status(400).json({ message: "Ya existe un cliente con este número de identificación." });
        }

        const newClient = new Client({
            identificationType,
            identificationNumber,
            name,
            lastName,
            email,
            phone,
            city,
            address,
            user: req.user.id, 
        });

        const savedClient = await newClient.save();
        
        res.status(201).json(savedClient);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. OBTENER todos los clientes
export const getClients = async (req, res) => {
    try {
        const clients = await Client.find({ user: req.user.id });
        res.json(clients);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ message: "Error al obtener clientes" });
    }
};

// 3. OBTENER un cliente por ID
export const getClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        
        if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
        
        if (client.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "No autorizado para ver este cliente" });
        }
        
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. ACTUALIZAR un cliente
export const updateClient = async (req, res) => {
    try {
        // Mongoose usará los campos presentes en req.body
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (!client) return res.status(404).json({ message: "Cliente no encontrado para actualizar" });
        
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. ELIMINAR un cliente
export const deleteClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        
        if (!client) return res.status(404).json({ message: "Cliente no encontrado para eliminar" });
        
        return res.sendStatus(204); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};