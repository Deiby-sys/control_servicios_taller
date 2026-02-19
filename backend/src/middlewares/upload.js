// middlewares para los adjuntos

import multer from 'multer';

const storage = multer.memoryStorage();

// Filtros para tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/jpg',
    'image/gif',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/webm',
    'application/pdf'
  ];
  
  // Tamaño máximo: 50MB para videos, 10MB para otros
  const maxSize = file.mimetype.startsWith('video/') ? 
    50 * 1024 * 1024 : // 50MB para videos
    10 * 1024 * 1024;   // 10MB para imágenes y PDFs
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, MP4, AVI, MOV, WEBM, PDF'), false);
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = file.mimetype.startsWith('video/') ? 50 : 10;
    return cb(new Error(`Archivo demasiado grande. Máximo ${maxSizeMB}MB`), false);
  }
  
  cb(null, true);
};

// Tamaño máximo: 50MB para videos, 10MB para otros archivos
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo
  }
});

export default upload;