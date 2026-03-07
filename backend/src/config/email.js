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

// Haz lo mismo para sendOrderStatusNotification
export const sendOrderStatusNotification = async (assignedUserEmail, assignedUserName, orderDetails) => {
  // ... mismos datos ...
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL, // <--- CLAVE: Usar este string exacto
      to: assignedUserEmail,
      subject: `Actualización de Orden`,
      html: `...`,
    });
    // ... resto del código ...
  } catch (error) {
     // ... manejo de error ...
  }
};