// Envío de emails con Resend (Más fiable en producción)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // Usa tu dominio verificado o el de prueba de Resend

export const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log(`📧 [RESEND] Enviando recuperación a: ${email}`);
  
  try {
    const { data, error } = await resend.emails.send({
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
        </div>
      `,
    });

    if (error) {
      console.error('❌ [RESEND] Error:', error);
      throw new Error(error.message);
    }

    console.log(`✅ [RESEND] Email enviado! ID: ${data.id}`);
    return data;

  } catch (error) {
    console.error("❌ Error crítico enviando email:", error);
    throw error;
  }
};

export const sendOrderStatusNotification = async (assignedUserEmail, assignedUserName, orderDetails) => {
  const { placa, cliente, actividadSolicitada, orderId, nuevoEstado } = orderDetails;
  
  console.log(`📧 [RESEND] Enviando notificación a: ${assignedUserEmail}`);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: assignedUserEmail,
      subject: `🔧 Actualización de Orden #${orderId} - Placa ${placa}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">¡Hola ${assignedUserName}!</h2>
          <p>Se ha actualizado una orden de trabajo:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 5px solid #007bff; margin: 20px 0;">
            <p><strong>🚗 Placa:</strong> ${placa}</p>
            <p><strong>👤 Cliente:</strong> ${cliente}</p>
            <p><strong>📝 Actividad:</strong> ${actividadSolicitada}</p>
            <p><strong>🔄 Estado:</strong> <span style="color: #007bff; font-weight: bold;">${nuevoEstado}</span></p>
          </div>
          <p>Ingresa al sistema para más detalles.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ [RESEND] Error:', error);
      throw new Error(error.message);
    }

    console.log(`✅ [RESEND] Notificación enviada! ID: ${data.id}`);
    return data;

  } catch (error) {
    console.error("❌ Error crítico enviando notificación:", error);
    throw error;
  }
};