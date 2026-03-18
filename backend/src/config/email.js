// Envío notificaciones por correo
// backend/src/config/email.js

import { Resend } from 'resend';

// ========================================
// CONFIGURACIÓN DE RESEND CON DEBUGGING
// ========================================
const resendApiKey = process.env.RESEND_API_KEY;
const useMock = process.env.USE_MOCK_EMAIL === 'true';
const DEFAULT_FROM = process.env.FROM_EMAIL || 'My Taller App <onboarding@resend.dev>';

// Log de diagnóstico al iniciar
console.log('📧 [EMAIL CONFIG]', {
  hasApiKey: !!resendApiKey,
  apiKeyStart: resendApiKey ? resendApiKey.substring(0, 10) + '...' : 'N/A',
  useMock,
  defaultFrom: DEFAULT_FROM,
  nodeEnv: process.env.NODE_ENV
});

// Crear instancia de Resend o mock
const resend = (resendApiKey && !useMock)
  ? new Resend(resendApiKey)
  : {
      emails: {
        send: async (options) => {
          console.log(`📧 [MOCK EMAIL] ⚠️ NO se envió correo real (mock activo):`, {
            to: options.to,
            from: options.from,
            subject: options.subject
          });
          // ✅ CORREGIDO: Agregar "data:" antes del objeto
          return { data: { id: 'mock-' + Date.now() }, error: null };
        }
      }
    };

// ========================================
// FUNCIÓN: Recuperar Contraseña
// ========================================
export const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log(`📧 [EMAIL] Recuperación solicitada para: ${email}`);
  console.log(`📧 [EMAIL] Config actual: useMock=${useMock}, hasApiKey=${!!resendApiKey}`);

  const msg = {
    from: DEFAULT_FROM,
    to: email?.trim()?.toLowerCase(),
    subject: 'Recuperación de contraseña - My Taller App',
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
          🔹 Si no solicitaste este cambio, ignora este correo.
        </p>
      </div>
    `,
  };

  try {
    console.log(`📧 [RESEND] Intentando enviar a: ${msg.to} desde: ${msg.from}`);
    
    const { data, error } = await resend.emails.send(msg);

    if (error) {
      console.error('❌ [RESEND] Error detallado:', {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
        body: error.body
      });
      throw new Error(error.message || 'Error desconocido de Resend');
    }

    console.log(`✅ [RESEND] Email enviado exitosamente a ${email} | ID: ${data?.id}`);
    return data;

  } catch (error) {
    console.error('❌ [EMAIL] Error crítico en sendPasswordResetEmail:', {
      message: error.message,
      stack: error.stack
    });
    return null;
  }
};

// ========================================
// FUNCIÓN: Notificación de Cambio de Estado
// ========================================
export const sendOrderStatusNotification = async (assignedUserEmail, assignedUserName, orderDetails) => {
  const { 
    placa = 'No disponible', 
    cliente = 'No especificado', 
    actividadSolicitada = 'Sin descripción', 
    orderId = 'N/A', 
    nuevoEstado = 'Desconocido' 
  } = orderDetails || {};

  // Limpieza y validación del email
  const cleanEmail = assignedUserEmail?.trim()?.toLowerCase();
  console.log(`📧 [EMAIL] Notificación para orden #${orderId} → ${cleanEmail}`);
  console.log(`📧 [EMAIL] Config: useMock=${useMock}, hasApiKey=${!!resendApiKey}`);

  // Validar formato de email antes de enviar
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    console.error(`❌ [EMAIL] Email inválido: "${assignedUserEmail}"`);
    return null;
  }

  const msg = {
    from: DEFAULT_FROM,
    to: cleanEmail,
    subject: `🔧 Orden #${orderId} - ${nuevoEstado} - Placa ${placa}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #28a745; text-align: center;">✅ Actualización Orden de Trabajo</h2>
        <p>¡Hola <strong>${assignedUserName || 'Usuario'}</strong>!</p>
        <p>Se ha actualizado una orden de trabajo asignada a ti:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 5px solid #007bff; margin: 25px 0;">
          <p style="margin: 8px 0;"><strong>🚗 Placa:</strong> ${placa}</p>
          <p style="margin: 8px 0;"><strong>👤 Cliente:</strong> ${cliente}</p>
          <p style="margin: 8px 0;"><strong>📝 Actividad:</strong> ${actividadSolicitada}</p>
          <p style="margin: 8px 0;"><strong>🔄 Nuevo Estado:</strong> <span style="color: #007bff; font-weight: 700; font-size: 1.1em;">${nuevoEstado}</span></p>
          <p style="margin: 8px 0;"><strong>🆔 ID Orden:</strong> ${orderId}</p>
        </div>
        <p style="background: #e7f3ff; padding: 12px; border-radius: 6px; border-left: 4px solid #007bff;">
          💡 <strong>Próximo paso:</strong> Ingresa al sistema para revisar los detalles completos.
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
        <div style="text-align: center; color: #6c757d; font-size: 12px;">
          <p>Este es un mensaje automático de <strong>My Taller App</strong>.<br/>No respondas a este correo.</p>
        </div>
      </div>
    `,
  };

  try {
    console.log(`📧 [RESEND] Intentando enviar a: ${msg.to} desde: ${msg.from}`);
    
    const { data, error } = await resend.emails.send(msg);

    if (error) {
      console.error('❌ [RESEND] Error detallado:', {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
        body: error.body
      });
      throw new Error(error.message || 'Error desconocido de Resend');
    }

    console.log(`✅ [RESEND] Notificación enviada a ${cleanEmail} | ID: ${data?.id}`);
    return data;

  } catch (error) {
    console.error('❌ [EMAIL] Error crítico en sendOrderStatusNotification:', {
      message: error.message,
      stack: error.stack
    });
    return null;
  }
};