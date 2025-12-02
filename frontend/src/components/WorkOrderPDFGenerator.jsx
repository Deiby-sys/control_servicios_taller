// Generador PDF

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateWorkOrderPDF = (workOrder) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Título
  doc.setFontSize(18);
  doc.text('ORDEN DE TRABAJO', 105, 20, null, null, 'center');
  
  // Línea divisoria
  doc.line(20, 25, 190, 25);
  
  // Información general
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Información General', 20, 35);
  
  doc.setFont(undefined, 'normal');
  doc.text(`Número: ${workOrder.orderNumber}`, 20, 45);
  doc.text(`Fecha de Ingreso: ${new Date(workOrder.entryDate).toLocaleDateString()}`, 20, 50);
  doc.text(`Estado: ${getStatusLabel(workOrder.status)}`, 20, 55);
  
  // Creado por
  if (workOrder.createdBy) {
    doc.text(`Creado por: ${workOrder.createdBy.name} ${workOrder.createdBy.lastName}`, 20, 60);
  }
  
  // Línea divisoria
  doc.line(20, 65, 190, 65);
  
  // Información del vehículo
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Vehículo', 20, 75);
  
  doc.setFont(undefined, 'normal');
  if (workOrder.vehicle) {
    doc.text(`Placa: ${workOrder.vehicle.plate}`, 20, 85);
    doc.text(`VIN: ${workOrder.vehicle.vin}`, 20, 90);
    doc.text(`Marca: ${workOrder.vehicle.brand}`, 20, 95);
    doc.text(`Línea: ${workOrder.vehicle.line}`, 20, 100);
    doc.text(`Modelo: ${workOrder.vehicle.model}`, 20, 105);
    doc.text(`Color: ${workOrder.vehicle.color}`, 20, 110);
  }
  
  // Línea divisoria
  doc.line(20, 115, 190, 115);
  
  // Información del cliente
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Cliente', 20, 125);
  
  doc.setFont(undefined, 'normal');
  if (workOrder.client) {
    doc.text(`Nombre: ${workOrder.client.name} ${workOrder.client.lastName}`, 20, 135);
    doc.text(`Email: ${workOrder.client.email || 'N/A'}`, 20, 140);
    doc.text(`Teléfono: ${workOrder.client.phone || 'N/A'}`, 20, 145);
  }
  
  // Línea divisoria
  doc.line(20, 150, 190, 150);
  
  // Detalles de la orden
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Detalles de la Orden', 20, 160);
  
  doc.setFont(undefined, 'normal');
  doc.text(`Kilometraje: ${workOrder.currentMileage.toLocaleString()} km`, 20, 170);
  doc.text('Solicitud:', 20, 175);
  
  // Solicitud con salto de línea si es necesario
  const lines = doc.splitTextToSize(workOrder.serviceRequest, 170);
  doc.text(lines, 20, 180);
  
  // Responsables
  let currentY = 190 + (lines.length * 5);
  if (workOrder.assignedTo && workOrder.assignedTo.length > 0) {
    doc.setFont(undefined, 'bold');
    doc.text('Responsables:', 20, currentY);
    doc.setFont(undefined, 'normal');
    
    const responsables = workOrder.assignedTo.map(user => 
      `${user.name} ${user.lastName}`
    ).join(', ');
    
    currentY += 5;
    doc.text(responsables, 20, currentY);
    currentY += 10;
  } else {
    currentY += 10;
  }
  
  // PUNTO 4: Añadir resumen de actividades si existe (entregado)
  if (workOrder.deliveryNote) {
    doc.setFont(undefined, 'bold');
    doc.text('Resumen de Actividades Realizadas:', 20, currentY);
    doc.setFont(undefined, 'normal');
    
    const noteLines = doc.splitTextToSize(workOrder.deliveryNote, 170);
    doc.text(noteLines, 20, currentY + 5);
    
    currentY += 5 + (noteLines.length * 5);
  }
  
  // PUNTO 5: Añadir firma de entrega si existe (entregado)
  if (workOrder.deliverySignature && workOrder.deliveryDate) {
    doc.setFont(undefined, 'bold');
    doc.text('Firma de Recibido por el Cliente:', 20, currentY);
    
    // Añadir imagen de firma de entrega
    doc.addImage(
      workOrder.deliverySignature, 
      'PNG', 
      20, 
      currentY + 5, 
      60, 
      30
    );
    
    // Texto descriptivo con fecha y hora
    const entregaY = currentY + 40;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100); // Gris oscuro
    doc.text(
      `Firmado digitalmente por el cliente el ${new Date(workOrder.deliveryDate).toLocaleString('es-CO')}`, 
      20, 
      entregaY
    );
    
    currentY = entregaY + 5;
  }
  
  // Firma del cliente (si existe) - solo si NO es entrega
  if (workOrder.clientSignature && !workOrder.deliverySignature) {
    const signatureY = currentY;
    
    doc.setFont(undefined, 'bold');
    doc.text('Firma Digital del Cliente:', 20, signatureY);
    
    // Añadir imagen de firma
    doc.addImage(
      workOrder.clientSignature, 
      'PNG', 
      20, 
      signatureY + 5, 
      60, 
      30
    );
  }
  
  // Guardar PDF
  doc.save(`orden_${workOrder.orderNumber}.pdf`);
};

// Función para mapear estados a etiquetas
const getStatusLabel = (status) => {
  const labels = {
    'por_asignar': 'Por Asignar',
    'asignado': 'Asignado',
    'en_aprobacion': 'En Aprobación',
    'por_repuestos': 'Por Repuestos',
    'en_soporte': 'En Soporte',
    'en_proceso': 'En Proceso',
    'completado': 'Completado',
    'entregado': 'Entregado'
  };
  return labels[status] || status;
};

export default generateWorkOrderPDF;