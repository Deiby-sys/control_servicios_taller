//Definición de endpoints

import {Router} from 'express'; //importamos Router para realizar el CRUD
import {register, login, logout, profile} from '../controllers/auth.controller.js'; //importamos las funciones login y register desde su ubicación
import { authRequired } from "../middlewares/validateToken.js";
import {validateSchema} from '../middlewares/validator.middleware.js';
import {registerSchema, loginSchema} from '../schemas/auth.schema.js';




const router = Router();

router.post('/register', validateSchema(registerSchema), register); //se crea la función registro en controllers

router.post('/login', validateSchema(loginSchema), login); //se crea la función login en controllers

router.post('/logout', logout); //se crea la función logout en controllers

router.get('/profile', authRequired, profile); //se crea la función para consultar el usuario y se protege la ruta con authRequired

export default router; //exporto el enrutador

