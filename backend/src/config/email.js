//Email.js para Brevo
// backend/src/config/email.js

import axios from "axios";

// ========================================
// CONFIGURACIÓN DE BREVO
// ========================================
const brevoApiKey = process.env.BREVO_API_KEY;
const DEFAULT_FROM = process.env.FROM_EMAIL || "mytallerapp@gmail.com";

// Función genérica para enviar con Brevo API HTTP
const sendWithBrevo = async (msg) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "My Taller App", email: DEFAULT_FROM },
        to: [{ email: msg.to }],
        subject: msg.subject,
        htmlContent: msg.html,
      },
      {
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
      }
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error.message };
  }
};

// ========================================
// FUNCIÓN: Recuperar Contraseña
// ========================================
export const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log(`📧 [EMAIL] Recuperación solicitada para: ${email}`);

  const msg = {
    to: email,
    subject: "Recuperación de contraseña - My Taller App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #007bff; text-align: center;">🔐 Recuperación de contraseña</h2>
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña en <strong>My Taller App</strong>.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
            Restablecer contraseña
          </a>
        </div>
        
        <p style="font-size: 13px; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
          ${resetUrl}
        </p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
        
        <p style="font-size: 12px; color: #6c757d;">
          🔹 Este enlace expirará en <strong>30 minutos</strong>.<br/> 
          🔹 Si no solicitaste este cambio, ignora este correo.<br/> 
          🔹 Por seguridad, no compartas este enlace con nadie.
        </p>
        
        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 11px;">
          <p>My Taller App © ${new Date().getFullYear()}<br/>Sistema de Gestión de Taller</p>
        </div>
      </div>
    `,
  };

  const result = await sendWithBrevo(msg);

  if (result.error) {
    console.error("❌ [BREVO] Error enviando recuperación:", result.error);
    return null;
  }

  console.log(`✅ [BREVO] Email de recuperación enviado a ${email}`);
  return result.data;
};

// ========================================
// FUNCIÓN: Notificación de Cambio de Estado
// ========================================
export const sendOrderStatusNotification = async (assignedUserEmail, assignedUserName, orderDetails) => {
  const { placa = "No disponible", cliente = "No especificado", actividadSolicitada = "Sin descripción", orderId = "N/A", nuevoEstado = "Desconocido" } = orderDetails || {};

  console.log(`📧 [EMAIL] Notificación para orden #${orderId} → ${assignedUserEmail}`);

  const msg = {
    to: assignedUserEmail,
    subject: `🔧 Actualización Orden de Trabajo - My Taller App`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #28a745; text-align: center;">✅ Actualización Orden de Trabajo</h2>
        
        <p>¡Hola <strong>${assignedUserName || "Usuario"}</strong>!</p>
        <p>Se ha actualizado una orden de trabajo asignada a ti:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 5px solid #007bff; margin: 25px 0;">
          <p style="margin: 8px 0;"><strong>🚗 Placa:</strong> ${placa}</p>
          <p style="margin: 8px 0;"><strong>👤 Cliente:</strong> ${cliente}</p>
          <p style="margin: 8px 0;"><strong>📝 Actividad:</strong> ${actividadSolicitada}</p>
          <p style="margin: 8px 0;"><strong>🔄 Nuevo Estado:</strong> <span style="color: #007bff; font-weight: 700; font-size: 1.1em;">${nuevoEstado}</span></p>
          <p style="margin: 8px 0;"><strong>🆔 ID Orden:</strong> ${orderId}</p>
        </div>
        
        <p style="background: #e7f3ff; padding: 12px; border-radius: 6px; border-left: 4px solid #007bff;">
          💡 <strong>Próximo paso:</strong> Ingresa al sistema para revisar los detalles completos y continuar con el proceso.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
        
        <div style="text-align: center; color: #6c757d; font-size: 12px;">
          <p>Este es un mensaje automático del sistema <strong>My Taller App</strong>.<br/>No respondas a este correo.</p>
          <p style="margin-top: 15px;">© ${new Date().getFullYear()} Gestión de Taller</p>
        </div>
      </div>
    `,
  };

  const result = await sendWithBrevo(msg);

  if (result.error) {
    console.error("❌ [BREVO] Error enviando notificación:", result.error);
    return null;
  }

  console.log(`✅ [BREVO] Notificación enviada a ${assignedUserEmail}`);
  return result.data;
};