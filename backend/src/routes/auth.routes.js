//Definición de endpoints

import {Router} from 'express'; //importamos Router para realizar el CRUD
import {register, login, logout, profile, forgotPassword, resetPassword, validateResetToken} from '../controllers/auth.controller.js'; //importamos las funciones login y register desde su ubicación
import { authRequired } from "../middlewares/validateToken.js";
import {validateSchema} from '../middlewares/validator.middleware.js';
import {registerSchema, loginSchema} from '../schemas/auth.schema.js';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', validateSchema(registerSchema), register); //se crea la función registro en controllers
router.post('/login', validateSchema(loginSchema), login); //se crea la función login en controllers
router.post('/logout', authRequired, logout); //se crea la función logout en controllers
router.get('/profile', authRequired, profile); //se crea la función para consultar el usuario y se protege la ruta con authRequired
router.post('/forgot-password', forgotPassword); //se crea la función para recuperar contraseña
router.post('/reset-password/:token', resetPassword); // se crea la función para resetear contraseña
router.post('/validate-reset-token', validateResetToken); // se crea la función para resetear contraseña

router.get('/verify', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    jwt.verify(token, process.env.TOKEN_SECRET);
    res.json({ authenticated: true });
  } catch (err) {
    res.status(401).json({ authenticated: false });
  }
});

export default router; //exporto el enrutador
