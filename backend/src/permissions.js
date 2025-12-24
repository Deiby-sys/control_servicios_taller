// Perfiles que pueden crear órdenes y entregar
const CREATE_DELIVER_PROFILES = ['admin', 'asesor', 'jefe'];

export const canCreateOrder = (profile) => {
  return CREATE_DELIVER_PROFILES.includes(profile);
};

export const canDeliverOrder = (profile) => {
  return CREATE_DELIVER_PROFILES.includes(profile);
};

// Opcional: si más adelante necesitas más reglas
export const canViewAllOrders = (profile) => true; // todos pueden ver
export const canEditOrderNotes = (profile) => ['admin', 'asesor', 'jefe', 'tecnico', 'bodega'].includes(profile);