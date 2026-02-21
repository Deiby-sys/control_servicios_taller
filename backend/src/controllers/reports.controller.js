// Controlador informes

import WorkOrder from '../models/workOrder.model.js';
import mongoose from 'mongoose';

export const getSevenDayReports = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Pipeline para ingresos (usando createdAt, sin importar estado)
    const ingresosPipeline = [
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo, $lte: today }
        }
      },
      {
        $count: "ingresos"
      }
    ];

    // Pipeline para completados y entregados (usando updatedAt)
    const estadosPipeline = [
      {
        $match: {
          updatedAt: { $gte: sevenDaysAgo, $lte: today }
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

    // Ejecutar ambos pipelines
    const ingresosResult = await WorkOrder.aggregate(ingresosPipeline);
    const estadosResult = await WorkOrder.aggregate(estadosPipeline);

    const ingresos = ingresosResult[0]?.ingresos || 0;
    const completados = estadosResult[0]?.completados || 0;
    const entregados = estadosResult[0]?.entregados || 0;

    res.json({
      ingresos,
      completados,
      entregados,
      period: {
        from: sevenDaysAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Error al generar informes:', error);
    res.status(500).json({ message: 'Error al generar informes' });
  }
};