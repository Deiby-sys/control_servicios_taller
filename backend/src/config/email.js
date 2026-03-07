// Envío de emails para recuperar contraseñas y notificaciones

import nodemailer from 'nodemailer';

// Función auxiliar para crear el transportador (Configuración robusta para Prod)
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error("❌ ERROR CRÍTICO: Faltan variables de entorno EMAIL_USER o EMAIL_PASS");
    // Lanzamos error para detener el intento si faltan credenciales
    throw new Error("Configuración de correo incompleta");
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      // Necesario para evitar errores de certificado en algunos entornos cloud como Render
      rejectUnauthorized: false 
    },
    logger: true, // Loguea actividad interna de nodemailer en consola
    debug: true   // Muestra información de depuración en consola
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log(`📧 [INTENTO] Enviando email de recuperación a: ${email}`);
  
  try {
    const transporter = createTransporter();
    
    // Verificar conexión antes de enviar (ayuda a detectar problemas de red rápido)
    await transporter.verify();
    console.log("✅ Conexión con SMTP verificada exitosamente.");

    const mailOptions = {
      from: `"My Taller App" <${process.env.EMAIL_USER}>`, // Nombre remitente claro
      to: email,
      subject: 'Recuperación de contraseña - My Taller App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Recuperación de contraseña</h2>
          <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Restablecer contraseña
            </a>
          </p>
          <p style="font-size: 14px; color: #666;">O copia y pega este enlace en tu navegador:</p>
          <p style="font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Este enlace expirará en 30 minutos.</p>
          <p style="font-size: 12px; color: #999;">Si no solicitaste este cambio, ignora este correo.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [ÉXITO] Email enviado a ${email}. Message ID: ${info.messageId}`);
    return info;

  } catch (error) {
    console.error("❌ [FALLO] Error crítico al enviar email de recuperación:", error.message);
    console.error("Detalles del error:", error);
    // No lanzamos el error para no romper el flujo de la API, pero logueamos todo
    throw error; // Relanzamos para que el controlador lo capture si quiere
  }
};

export const sendOrderStatusNotification = async (assignedUserEmail, assignedUserName, orderDetails) => {
  const { placa, cliente, actividadSolicitada, orderId, nuevoEstado } = orderDetails;
  
  console.log(`📧 [INTENTO] Enviando notificación de orden a: ${assignedUserEmail} (Orden: ${orderId})`);

  try {
    const transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: `"My Taller App" <${process.env.EMAIL_USER}>`,
      to: assignedUserEmail,
      subject: `🔧 Actualización de Orden #${orderId} - Placa ${placa}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">¡Hola ${assignedUserName}!</h2>
          <p>Se ha actualizado una orden de trabajo asignada a ti:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 5px solid #007bff; margin: 20px 0;">
            <p><strong>🚗 Placa:</strong> ${placa}</p>
            <p><strong>👤 Cliente:</strong> ${cliente}</p>
            <p><strong>📝 Actividad:</strong> ${actividadSolicitada}</p>
            <p><strong>🔄 Nuevo Estado:</strong> <span style="color: #007bff; font-weight: bold;">${nuevoEstado}</span></p>
            <p><strong>🆔 ID Orden:</strong> ${orderId}</p>
          </div>
          
          <p>Por favor ingresa al sistema para revisar los detalles completos y continuar con el proceso.</p>
          <p style="margin-top: 30px; color: #666;">Saludos,<br/><strong>Equipo de Gestión - My Taller App</strong></p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [ÉXITO] Notificación enviada a ${assignedUserEmail}. Message ID: ${info.messageId}`);
    return info;

  } catch (error) {
    console.error("❌ [FALLO] Error crítico al enviar notificación de orden:", error.message);
    console.error("Detalles del error:", error);
    throw error;
  }
};