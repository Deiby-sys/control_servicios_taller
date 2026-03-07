// Envío de emails con Resend

import { Resend } from 'resend';

// Inicializar con tu API Key (que ya debes tener copiada)
const resend = new Resend(process.env.RESEND_API_KEY);

// Usamos el dominio de prueba oficial
const FROM_EMAIL = 'My Taller App <onboarding@resend.dev>'; 

export const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log(`📧 [RESEND] Enviando recuperación a: ${email}`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL, // <--- CLAVE: Usar este string exacto
      to: email,
      subject: 'Recuperación de contraseña - My Taller App',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic aquí: <a href="${resetUrl}">${resetUrl}</a></p>
      `,
    });

    if (error) {
      console.error('❌ Error Resend:', error);
      throw new Error(error.message);
    }

    console.log(`✅ Email enviado! ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error("Error crítico:", error);
    throw error;
  }
};

// Envío de notificaciones cambios de estado
export const sendOrderStatusNotification = async (assignedUserEmail, assignedUserName, orderDetails) => {
  // Desestructuración con valores por defecto por si vienen undefined
  const { 
    placa = 'No disponible', 
    cliente = 'No especificado', 
    actividadSolicitada = 'Sin descripción', 
    orderId = 'N/A', 
    nuevoEstado = 'Desconocido' 
  } = orderDetails || {}; // Protección extra si orderDetails es null
  
  console.log(`📧 [RESEND] Enviando notificación a: ${assignedUserEmail} para orden ${orderId}`);

  try {
    const { data, error } = await resend.emails.send({
      from: 'My Taller App <onboarding@resend.dev>',
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