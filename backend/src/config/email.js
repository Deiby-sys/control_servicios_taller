//Notificaciones a correos electrónicos

// backend/src/config/email.js
import nodemailer from 'nodemailer';

// 1. Configuración del Transportador (Brevo SMTP)
const createTransporter = () => {
  const user = process.env.BREVO_USER;
  const pass = process.env.BREVO_PASS;

  
  // LOG DE DEPURACIÓN CRÍTICA (Bórralo después de probar)
  console.log("🔍 [DEBUG BREVO] User:", user ? user.substring(0, 3) + "..." : "UNDEFINED");
  console.log("🔍 [DEBUG BREVO] Pass:", pass ? "DEFINIDA" : "UNDEFINED");

  if (!user || !pass) {
    console.error("❌ ERROR CRÍTICO: Faltan variables de entorno BREVO_USER o BREVO_PASS");
    throw new Error("Configuración de correo incompleta");
  }

  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true para 465, false para otros puertos como 587
    auth: {
      user: user,
      pass: pass,
    },
  });
};

// Remitente oficial (Brevo te da uno tipo "tu_usuario@smtp-brevo.com" o usa tu dominio si lo verificas)
// Usa el que te aparezca en tu dashboard de Brevo > Senders
const FROM_EMAIL = 'My Taller App <a449b5001@smtp-brevo.com>'; 

// 2. Función para Recuperar Contraseña
export const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log(`📧 [BREVO] Enviando recuperación a: ${email}`);
  
  const transporter = createTransporter();

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
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
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [BREVO] Email de recuperación enviado! Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ [BREVO] Error crítico enviando recuperación:", error.message);
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
  
  console.log(`📧 [BREVO] Enviando notificación a: ${assignedUserEmail} para orden ${orderId}`);

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM_EMAIL,
    to: assignedUserEmail,
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
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [BREVO] Notificación enviada! Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ [BREVO] Error crítico enviando notificación:", error.message);
    throw error;
  }
};