// Labels estados

export const getStatusLabel = (status) => {
  switch (status) {
    case 'por_asignar':
      return 'Jefe';
    case 'asignado':
      return 'Técnico';
    case 'en_aprobacion':
      return 'Asesor';
    case 'por_repuestos':
      return 'Repuestos';
    case 'en_soporte':
      return 'Soporte Técnico';
    case 'en_proceso':
      return 'Proceso Técnico';
    case 'completado':
      return 'Listo para Entrega';
    case 'entregado':
      return 'Entregado';
    default:
      return status;
  }
};
