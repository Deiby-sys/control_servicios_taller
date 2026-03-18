// Controlador informes
// backend/src/controllers/reports.controller.js

import WorkOrder from '../models/workOrder.model.js';

// Función auxiliar para obtener fecha local sin hora
const getLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función para obtener inicio del día en zona horaria local
const getStartOfDay = (date) => {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
};

// Función para obtener fin del día en zona horaria local
const getEndOfDay = (date) => {
  const localDate = new Date(date);
  localDate.setHours(23, 59, 59, 999);
  return localDate;
};

export const getReports = async (req, res) => {
  try {
    const now = new Date();
    
    // Fechas locales correctas
    const todayEnd = getEndOfDay(now);        // Hoy 23:59:59
    const todayStart = getStartOfDay(now);     // Hoy 00:00:00
    
    const sevenDaysAgo = getStartOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    const thirtyDaysAgo = getStartOfDay(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

    // Pipeline base para contar ingresos (createdAt)
    const ingresosPipeline = (fromDate, toDate) => [
      {
        $match: {
          createdAt: { $gte: fromDate, $lte: toDate }
        }
      },
      { $count: "total" }
    ];

    // Pipeline base para contar por estado (updatedAt)
    const estadosPipeline = (fromDate, toDate) => [
      {
        $match: {
          updatedAt: { $gte: fromDate, $lte: toDate }
        }
      },
      {
        $group: {
          _id: null,
          completados: {
            $sum: { $cond: [{ $eq: ["$status", "completado"] }, 1, 0] }
          },
          entregados: {
            $sum: { $cond: [{ $eq: ["$status", "entregado"] }, 1, 0] }
          }
        }
      }
    ];

    // === HOY ===
    const ingresosHoy = await WorkOrder.aggregate(ingresosPipeline(todayStart, todayEnd));
    const estadosHoy = await WorkOrder.aggregate(estadosPipeline(todayStart, todayEnd));

    // === 7 DÍAS ===
    const ingresos7 = await WorkOrder.aggregate(ingresosPipeline(sevenDaysAgo, todayEnd));
    const estados7 = await WorkOrder.aggregate(estadosPipeline(sevenDaysAgo, todayEnd));

    // === 30 DÍAS ===
    const ingresos30 = await WorkOrder.aggregate(ingresosPipeline(thirtyDaysAgo, todayEnd));
    const estados30 = await WorkOrder.aggregate(estadosPipeline(thirtyDaysAgo, todayEnd));

    // Formatear respuesta usando fechas locales
    const todayReport = {
      ingresos: ingresosHoy[0]?.total || 0,
      completados: estadosHoy[0]?.completados || 0,
      entregados: estadosHoy[0]?.entregados || 0,
      period: {
        from: getLocalDate(todayStart),
        to: getLocalDate(todayEnd)
      }
    };

    const sevenDayReport = {
      ingresos: ingresos7[0]?.total || 0,
      completados: estados7[0]?.completados || 0,
      entregados: estados7[0]?.entregados || 0,
      period: {
        from: getLocalDate(sevenDaysAgo),
        to: getLocalDate(todayEnd)
      }
    };

    const thirtyDayReport = {
      ingresos: ingresos30[0]?.total || 0,
      completados: estados30[0]?.completados || 0,
      entregados: estados30[0]?.entregados || 0,
      period: {
        from: getLocalDate(thirtyDaysAgo),
        to: getLocalDate(todayEnd)
      }
    };

    res.json({
      today: todayReport,
      last7Days: sevenDayReport,
      last30Days: thirtyDayReport
    });

  } catch (error) {
    console.error('❌ Error al generar informes:', error);
    res.status(500).json({ message: 'Error al generar informes' });
  }
};