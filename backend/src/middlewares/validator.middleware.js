//Autenticación, validación, etc.

//vamos a crear una funnción para validar un Schema

export const validateSchema = (schema) => (req, res, next) => {
  try {
    // Parsear y OBTENER los datos transformados
    const parsedData = schema.parse(req.body);
    
    // Actualizar req.body con los datos sanitizados
    req.body = parsedData;
    
    next();
  } catch (error) {
    // Extraer solo los mensajes de error
    const errors = error.errors.map(err => err.message);
    return res.status(400).json({
      message: "Datos inválidos",
      errors
    });
  }
};