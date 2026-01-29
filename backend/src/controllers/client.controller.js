// Controlador para clientes

import Client from '../models/client.model.js';

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
        
        // Sanitizar campos de texto
        const sanitizedData = {
            identificationType: sanitizeText(identificationType),
            identificationNumber: sanitizeText(identificationNumber),
            name: sanitizeText(name),
            lastName: sanitizeText(lastName),
            email: email ? email.toLowerCase().trim() : email,
            phone: sanitizeText(phone),
            city: sanitizeText(city),
            address: sanitizeText(address)
        };
        
        const clientFound = await Client.findOne({ identificationNumber: sanitizedData.identificationNumber });
        if (clientFound) {
            return res.status(400).json({ message: "Ya existe un cliente con este número de identificación." });
        }

        const newClient = new Client({
            ...sanitizedData,
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
        const clients = await Client.find();
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
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. ACTUALIZAR un cliente
export const updateClient = async (req, res) => {
    try {
        // Sanitizar campos de texto en la actualización
        const sanitizedBody = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (typeof value === 'string') {
                sanitizedBody[key] = sanitizeText(value);
            } else {
                sanitizedBody[key] = value;
            }
        }
        
        // Mongoose usará los campos presentes en sanitizedBody
        const client = await Client.findByIdAndUpdate(req.params.id, sanitizedBody, { new: true });
        
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