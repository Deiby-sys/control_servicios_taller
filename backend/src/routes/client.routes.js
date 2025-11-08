// Este archivo definirá los endpoints para el CRUD de clientes


import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js'; // Asumo que tienes un middleware para verificar el JWT
// Importa el controlador que vamos a crear en el siguiente paso
import { 
    getClients, 
    getClient, 
    createClient, 
    updateClient, 
    deleteClient 
} from '../controllers/client.controller.js'; 


const router = Router();

// Todas estas rutas están protegidas por el middleware 'authRequired'
router.get('/clients', authRequired, getClients);         // Obtener todos los clientes
router.get('/clients/:id', authRequired, getClient);       // Obtener un cliente por ID
router.post('/clients', authRequired, createClient);       // Crear un nuevo cliente
router.put('/clients/:id', authRequired, updateClient);    // Actualizar un cliente
router.delete('/clients/:id', authRequired, deleteClient); // Eliminar un cliente

export default router;