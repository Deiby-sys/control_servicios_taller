// Envío de emails para recuperar contraseñas y notificaciones

import nodemailer from 'nodemailer';

// Función auxiliar para crear el transportador
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log('📧 Enviando email a:', email);
  
  // Crear transportador dentro de la función (después de que dotenv se ha cargado)
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Recuperación de contraseña - My Taller App',
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Restablecer contraseña
      </a>
      <p>Este enlace expirará en 30 minutos.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendOrderStatusNotification = async (assignedUserEmail, assignedUserName, orderDetails) => {
  const { placa, cliente, actividadSolicitada, orderId, nuevoEstado } = orderDetails;
  
  // Crear transportador dentro de la función
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: assignedUserEmail,
    subject: `Actualización de orden - Placa ${placa}`,
    html: `
      <h2>¡Hola ${assignedUserName}!</h2>
      <p>La orden de trabajo ha sido actualizada:</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <strong>Placa:</strong> ${placa}<br/>
        <strong>Cliente:</strong> ${cliente}<br/>
        <strong>Actividad:</<strong> ${actividadSolicitada}<br/>
        <strong>Nuevo estado:</strong> ${nuevoEstado}<br/>
        <strong>ID Orden:</strong> ${orderId}
      </div>
      <p>Por favor revisa el sistema para más detalles.</p>
      <p>Saludos,<br/>Equipo de Gestión</p>
    `
  };

  await transporter.sendMail(mailOptions);
};