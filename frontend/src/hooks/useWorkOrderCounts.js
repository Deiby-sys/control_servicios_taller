//Hooks para el contador de las órdenes de trabajo

// src/hooks/useWorkOrderCounts.js
import { useState, useEffect } from "react";
import { getWorkOrderCountsRequest } from "../api/workOrder.api"; // Importa desde tu API

export const useWorkOrderCounts = () => {
  const [counts, setCounts] = useState({
    por_asignar: 0,
    asignado: 0,
    en_aprobacion: 0,
    por_repuestos: 0,
    en_soporte: 0,
    en_proceso: 0, 
    completado: 0,
    entregado: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await getWorkOrderCountsRequest(); // Esto ya usa la URL correcta
        setCounts(response.data); // Actualiza con los datos reales
      } catch (error) {
        console.error("Error al obtener conteos:", error);
        // Opcional: podrías mostrar un mensaje de error aquí
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const totalEnTaller = counts.por_asignar + 
                       counts.asignado + 
                       counts.en_aprobacion + 
                       counts.por_repuestos + 
                       counts.en_soporte + 
                       counts.en_proceso + 
                       counts.completado;

  return { counts, totalEnTaller, loading };
};