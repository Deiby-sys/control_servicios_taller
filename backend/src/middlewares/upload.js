// middlewares para los adjuntos
import multer from 'multer';

const storage = multer.memoryStorage();

// Filtros para tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // 📸 Imágenes
    'image/jpeg',
    'image/png', 
    'image/jpg',
    'image/gif',
    'image/webp',
    
    // 🎥 Videos
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/quicktime', // Safari/iOS usa este para .mov
    'video/webm',
    
    // 📄 Documentos
    'application/pdf',
    
    // 📝 Word
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    
    // 📊 Excel
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    
    // 📽️ PowerPoint
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
  ];
  
  // Tamaño máximo: 50MB para videos, 10MB para otros (imágenes, PDFs y Office)
  const maxSize = file.mimetype.startsWith('video/') ? 
    50 * 1024 * 1024 : // 50MB para videos
    10 * 1024 * 1024;   // 10MB para imágenes, PDFs y Office
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de archivo no permitido. Solo se permiten: Imágenes, Videos, PDF, Word (DOC/DOCX), Excel (XLS/XLSX) y PowerPoint (PPT/PPTX)'), false);
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = file.mimetype.startsWith('video/') ? 50 : 10;
    return cb(new Error(`Archivo demasiado grande. Máximo ${maxSizeMB}MB`), false);
  }
  
  cb(null, true);
};

// Configuración de Multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo global (el filtro de 10MB se aplica antes para no-videos)
  }
});

export default upload;