// Cloudinary - Repositorio de adjuntos

import cloudinary from 'cloudinary';

// Función para obtener la configuración (se ejecuta cuando se necesita)
const getCloudinaryConfig = () => {
  // Verificación adicional
  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || 
      !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('❌ Cloudinary credentials not configured in .env file');
  }
  
  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  };
};

// Configurar Cloudinary solo cuando se use
const configureCloudinary = () => {
  const config = getCloudinaryConfig();
  cloudinary.v2.config(config);
  return cloudinary.v2;
};

export default configureCloudinary;