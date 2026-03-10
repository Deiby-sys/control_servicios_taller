// backend/src/config/email.js
import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';

// 1. Inicializar la API de Brevo
const apiInstance = new TransactionalEmailsApi();

// Configurar la clave API (La misma que usabas o una nueva de API Keys)
// IMPORTANTE: Usa tu API KEY (la que empieza por 'xkeysib-...' o similar), NO la contraseña SMTP.
apiInstance.setApiKey(TransactionalEmailsApi.keys.apiKey, process.env.BREVO_API_KEY);

// Remitente por defecto (Usa el dominio verificado o el por defecto de Brevo)
const DEFAULT_SENDER = {
  name: "My Taller App",
  email: "deibyleandro@hotmail.com" // <--- ¡CAMBIA ESTO por el remitente que veas en Brevo > Senders!
};

// 2. Función para Recuperar Contraseña
export const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log(`📧 [BREVO API] Enviando recuperación a: ${email}`);

  const sendSmtpEmail = new SendSmtpEmail();
  sendSmtpEmail.sender = DEFAULT_SENDER;
  sendSmtpEmail.to = [{ email: email }];
  sendSmtpEmail.subject = 'Recuperación de contraseña - My Taller App';
  sendSmtpEmail.htmlContent = `
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
    </div>
  `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ [BREVO API] Email enviado! MessageID: ${data.messageId}`);
    return data;
  } catch (error) {
    console.error("❌ [BREVO API] Error crítico enviando recuperación:", error.response?.body || error.message);
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
  
  console.log(`📧 [BREVO API] Enviando notificación a: ${assignedUserEmail} para orden ${orderId}`);

  const sendSmtpEmail = new SendSmtpEmail();
  sendSmtpEmail.sender = DEFAULT_SENDER;
  sendSmtpEmail.to = [{ email: assignedUserEmail }];
  sendSmtpEmail.subject = `🔧 Actualización de Orden #${orderId} - Placa ${placa}`;
  sendSmtpEmail.htmlContent = `
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
      
      <p>Por favor ingresa al sistema para revisar los detalles completos.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.9em;">
        <p>Saludos,<br/><strong>Equipo de Gestión - My Taller App</strong></p>
      </div>
    </div>
  `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ [BREVO API] Notificación enviada! MessageID: ${data.messageId}`);
    return data;
  } catch (error) {
    console.error("❌ [BREVO API] Error crítico enviando notificación:", error.response?.body || error.message);
    throw error;
  }
};