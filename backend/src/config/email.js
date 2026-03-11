// backend/src/config/email.js
// Envío de emails con Resend (Producción) + Mock (Desarrollo)
import { Resend } from 'resend';

// ========================================
// CONFIGURACIÓN DE RESEND CON FALLBACK
// ========================================
const resendApiKey = process.env.RESEND_API_KEY;
const useMock = process.env.USE_MOCK_EMAIL === 'true';

// Remitente por defecto (puede sobrescribirse con FROM_EMAIL en .env)
const DEFAULT_FROM = process.env.FROM_EMAIL || 'My Taller App <onboarding@resend.dev>';

// Crear instancia de Resend o mock para desarrollo
const resend = (resendApiKey && !useMock)
  ? new Resend(resendApiKey)
  : {
      emails: {
        send: async (options) => {
          console.log(`📧 [MOCK EMAIL] No se envió correo real (modo desarrollo):`, {
            to: options.to,
            from: options.from,
            subject: options.subject,
            // No mostrar el HTML completo para no saturar la consola
            preview: options.html?.substring(0, 100) + '...'
          });
          // Simular respuesta exitosa para que el flujo continúe
          return { data: { id: 'mock-' + Date.now() }, error: null };
        }
      }
    };

// ========================================
// FUNCIÓN: Recuperar Contraseña
// ========================================
export const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log(`📧 [EMAIL] Recuperación solicitada para: ${email}`);

  const msg = {
    from: DEFAULT_FROM,
    to: email,
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
          🔹 Si no solicitaste este cambio, ignora este correo.<br/>
          🔹 Por seguridad, no compartas este enlace con nadie.
        </p>
        
        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 11px;">
          <p>My Taller App © ${new Date().getFullYear()}<br/>Sistema de Gestión de Taller</p>
        </div>
      </div>
    `,
  };

  try {
    const { data, error } = await resend.emails.send(msg);

    if (error) {
      console.error('❌ [RESEND] Error enviando recuperación:', error);
      throw new Error(error.message || 'Error desconocido de Resend');
    }

    const mode = useMock ? '[MOCK]' : '[RESEND]';
    console.log(`✅ ${mode} Email de recuperación enviado a ${email} | ID: ${data?.id}`);
    return data;

  } catch (error) {
    console.error('❌ [EMAIL] Error crítico en sendPasswordResetEmail:', error.message);
    // No lanzamos el error para no romper el flujo de forgotPassword
    // (el usuario recibe mensaje genérico por seguridad)
    return null;
  }
};

// ========================================
// FUNCIÓN: Notificación de Cambio de Estado
// ========================================
export const sendOrderStatusNotification = async (assignedUserEmail, assignedUserName, orderDetails) => {
  // Desestructuración con valores por defecto
  const { 
    placa = 'No disponible', 
    cliente = 'No especificado', 
    actividadSolicitada = 'Sin descripción', 
    orderId = 'N/A', 
    nuevoEstado = 'Desconocido' 
  } = orderDetails || {};

  console.log(`📧 [EMAIL] Notificación para orden #${orderId} → ${assignedUserEmail}`);

  const msg = {
    from: DEFAULT_FROM,
    to: assignedUserEmail,
    subject: `🔧 Orden #${orderId} - ${nuevoEstado} - Placa ${placa}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #28a745; text-align: center;">✅ Actualización de Orden</h2>
        
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

  try {
    const { data, error } = await resend.emails.send(msg);

    if (error) {
      console.error('❌ [RESEND] Error enviando notificación:', error);
      throw new Error(error.message || 'Error desconocido de Resend');
    }

    const mode = useMock ? '[MOCK]' : '[RESEND]';
    console.log(`✅ ${mode} Notificación enviada a ${assignedUserEmail} | ID: ${data?.id}`);
    return data;

  } catch (error) {
    console.error('❌ [EMAIL] Error crítico en sendOrderStatusNotification:', error.message);
    // No lanzamos el error para no interrumpir el flujo principal de la orden
    return null;
  }
};