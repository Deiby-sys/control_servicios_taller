//Autenticación, validación, etc.

//vamos a crear una funnción para validar un Schema

export const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
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