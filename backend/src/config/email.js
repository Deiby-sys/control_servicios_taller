// backend/src/config/email.js
import sgMail from '@sendgrid/mail';

// 1. Configurar la API Key
const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;

if (!apiKey) {
  console.error("❌ ERROR CRÍTICO: Falta la variable de entorno SENDGRID_API_KEY");
  throw new Error("Configuración de SendGrid incompleta");
}

if (!fromEmail) {
  console.error("⚠️ ADVERTENCIA: Falta SENDGRID_FROM_EMAIL, usando valor por defecto.");
}

sgMail.setApiKey(apiKey);

// Remitente por defecto
const DEFAULT_SENDER = fromEmail || 'deibyleandro@hotmail.com';
const FROM_NAME = "My Taller App";

// 2. Función para Recuperar Contraseña
export const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log(`📧 [SENDGRID] Enviando recuperación a: ${email}`);

  const msg = {
    to: email,
    from: { name: FROM_NAME, email: DEFAULT_SENDER },
    subject: 'Recuperación de contraseña - My Taller App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Recuperación de contraseña</h2>
        <p>Haz clic en el botón para restablecer tu contraseña:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Restablecer contraseña
          </a>
        </p>
        <p style="font-size: 12px; word-break: break-all;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Este enlace expirará en 30 minutos.</p>
        <p style="font-size: 12px; color: #999;">Si no solicitaste este cambio, ignora este correo.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ [SENDGRID] Email de recuperación enviado exitosamente a ${email}`);
  } catch (error) {
    console.error("❌ [SENDGRID] Error enviando recuperación:", error.response?.body || error.message);
    throw error;
  }
};

// 3. Función para Notificaciones de Estado
export const sendOrderStatusNotification = async (assignedUserEmail, assignedUserName, orderDetails) => {
  const { 
    placa = 'No disponible', 
    cliente = 'No especificado', 
    actividadSolicitada = 'Sin descripción', 
    orderId = 'N/A', 
    nuevoEstado = 'Desconocido' 
  } = orderDetails || {};
  
  console.log(`📧 [SENDGRID] Enviando notificación a: ${assignedUserEmail} para orden ${orderId}`);

  const msg = {
    to: assignedUserEmail,
    from: { name: FROM_NAME, email: DEFAULT_SENDER },
    subject: `🔧 Actualización de Orden #${orderId} - Placa ${placa}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #28a745;">¡Hola ${assignedUserName || 'Usuario'}!</h2>
        <p>Se ha actualizado una orden de trabajo asignada a ti:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 5px solid #007bff; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>🚗 Placa:</strong> ${placa}</p>
          <p style="margin: 5px 0;"><strong>👤 Cliente:</strong> ${cliente}</p>
          <p style="margin: 5px 0;"><strong>📝 Actividad:</strong> ${actividadSolicitada}</p>
          <p style="margin: 5px 0;"><strong>🔄 Nuevo Estado:</strong> <span style="color: #007bff; font-weight: bold; font-size: 1.1em;">${nuevoEstado}</span></p>
          <p style="margin: 5px 0;"><strong>🆔 ID Orden:</strong> ${orderId}</p>
        </div>
        
        <p>Por favor ingresa al sistema para revisar los detalles completos y continuar con el proceso.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.9em;">
          <p>Saludos,<br/><strong>Equipo de Gestión - My Taller App</strong></p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ [SENDGRID] Notificación enviada exitosamente a ${assignedUserEmail}`);
  } catch (error) {
    console.error("❌ [SENDGRID] Error enviando notificación:", error.response?.body || error.message);
    throw error;
  }
};