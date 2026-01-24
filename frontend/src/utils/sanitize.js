// Eliminar caracteres peligroso

export const sanitizeText = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/[<>'"&]/g, '') // Eliminar caracteres peligrosos
    .replace(/\s+/g, ' ')    // Normalizar espacios múltiples
    .trim();
};

export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};