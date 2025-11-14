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
  if (workOrder.assignedTo && workOrder.assignedTo.length > 0) {
    doc.setFont(undefined, 'bold');
    doc.text('Responsables:', 20, 190 + (lines.length * 5));
    doc.setFont(undefined, 'normal');
    
    const responsables = workOrder.assignedTo.map(user => 
      `${user.name} ${user.lastName}`
    ).join(', ');
    
    doc.text(responsables, 20, 195 + (lines.length * 5));
  }
  
  // Firma del cliente (si existe)
  if (workOrder.clientSignature) {
    const img = new Image();
    img.src = workOrder.clientSignature;
    
    // Ajustar la posición según la longitud del texto
    const signatureY = 205 + (lines.length * 5) + (workOrder.assignedTo?.length ? 15 : 0);
    
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
    'completado': 'Completado'
  };
  return labels[status] || status;
};

export default generateWorkOrderPDF;