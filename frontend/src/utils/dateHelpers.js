// src/utils/dateHelpers.js

/**
 * Convierte cualquier string de fecha en un objeto Date válido para iOS, Android y Web.
 * Reemplaza el espacio por 'T' para cumplir con el estándar ISO 8601 que iOS exige.
 */
export const parseDateSafe = (dateString) => {
  if (!dateString) return new Date();
  if (dateString instanceof Date) return dateString;

  // Reemplaza el espacio por 'T' (ej: "2023-10-25 15:30:00" -> "2023-10-25T15:30:00")
  // También reemplaza '/' por '-' por si acaso
  const safeString = String(dateString).replace(' ', 'T').replace(/\//g, '-');
  
  const parsedDate = new Date(safeString);

  // Verificación de seguridad: si sigue siendo inválida, devuelve la fecha actual para no romper la app
  if (isNaN(parsedDate.getTime())) {
    console.warn('⚠️ Fecha inválida detectada en iOS:', dateString);
    return new Date(); 
  }

  return parsedDate;
};