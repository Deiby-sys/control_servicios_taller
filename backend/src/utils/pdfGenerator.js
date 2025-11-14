//Generador pdf

import puppeteer from "puppeteer";

export const generatePDF = async (workOrder) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // HTML para el PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Orden de Trabajo ${workOrder.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .section h3 { border-bottom: 2px solid #007bff; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .signature { margin-top: 40px; }
        .signature-line { border-top: 1px solid #000; width: 200px; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ORDEN DE TRABAJO</h1>
        <h2>${workOrder.orderNumber}</h2>
      </div>
      
      <div class="order-info">
        <div>
          <strong>Fecha de Ingreso:</strong> ${new Date(workOrder.entryDate).toLocaleString('es-CO')}
        </div>
        <div>
          <strong>Estado:</strong> ${workOrder.status.replace('_', ' ')}
        </div>
      </div>

      <div class="section">
        <h3>Datos del Vehículo</h3>
        <table>
          <tr><td><strong>Placa:</strong></td><td>${workOrder.vehicle.plate}</td></tr>
          <tr><td><strong>VIN:</strong></td><td>${workOrder.vehicle.vin}</td></tr>
          <tr><td><strong>Marca:</strong></td><td>${workOrder.vehicle.brand}</td></tr>
          <tr><td><strong>Línea:</strong></td><td>${workOrder.vehicle.line}</td></tr>
          <tr><td><strong>Modelo:</strong></td><td>${workOrder.vehicle.model}</td></tr>
          <tr><td><strong>Color:</strong></td><td>${workOrder.vehicle.color}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>Datos del Cliente</h3>
        <table>
          <tr><td><strong>Nombre:</strong></td><td>${workOrder.client.name} ${workOrder.client.lastName}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${workOrder.client.email}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>Solicitud del Cliente</h3>
        <p>${workOrder.serviceRequest}</p>
      </div>

      <div class="section">
        <h3>Kilometraje Actual</h3>
        <p>${workOrder.currentMileage.toLocaleString()} km</p>
      </div>

      <div class="signature">
        <div class="signature-line"></div>
        <p>Firma Digital del Cliente</p>
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  
  await browser.close();
  return pdf;
};