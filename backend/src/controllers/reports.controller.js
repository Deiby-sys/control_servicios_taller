// Controlador informes

import WorkOrder from '../models/workOrder.model.js';
import mongoose from 'mongoose';

export const getReports = async (req, res) => {
  try {
    const today = new Date();

    // Fechas de referencia
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Pipeline para ingresos (createdAt)
    const ingresosPipeline = (fromDate) => [
      {
        $match: {
          createdAt: { $gte: fromDate, $lte: today }
        }
      },
      {
        $count: "ingresos"
      }
    ];

    // Pipeline para completados y entregados (updatedAt)
    const estadosPipeline = (fromDate) => [
      {
        $match: {
          updatedAt: { $gte: fromDate, $lte: today }
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

    // Ejecutar pipelines para 7 días
    const ingresos7 = await WorkOrder.aggregate(ingresosPipeline(sevenDaysAgo));
    const estados7 = await WorkOrder.aggregate(estadosPipeline(sevenDaysAgo));

    // Ejecutar pipelines para 30 días
    const ingresos30 = await WorkOrder.aggregate(ingresosPipeline(thirtyDaysAgo));
    const estados30 = await WorkOrder.aggregate(estadosPipeline(thirtyDaysAgo));

    // Extraer resultados
    const sevenDayReports = {
      ingresos: ingresos7[0]?.ingresos || 0,
      completados: estados7[0]?.completados || 0,
      entregados: estados7[0]?.entregados || 0,
      period: {
        from: sevenDaysAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
      }
    };

    const thirtyDayReports = {
      ingresos: ingresos30[0]?.ingresos || 0,
      completados: estados30[0]?.completados || 0,
      entregados: estados30[0]?.entregados || 0,
      period: {
        from: thirtyDaysAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
      }
    };

    res.json({
      last7Days: sevenDayReports,
      last30Days: thirtyDayReports
    });

  } catch (error) {
    console.error('Error al generar informes:', error);
    res.status(500).json({ message: 'Error al generar informes' });
  }
};