//Hooks para el contador de las órdenes de trabajo

// src/hooks/useWorkOrderCounts.js
import { useState, useEffect } from "react";
import { getWorkOrderCountsRequest } from "../api/workOrder.api";

export const useWorkOrderCounts = () => {
  const [counts, setCounts] = useState({
    por_asignar: 0,
    asignado: 0,
    en_aprobacion: 0,
    por_repuestos: 0,
    en_soporte: 0,
    en_proceso: 0,
    baterias: 0, 
    completado: 0,
    entregado: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // ✅ SOLUCIÓN iOS: Generamos un timestamp único para cada petición.
        // Esto engaña a Safari/Chrome en iOS y le obliga a descargar 
        // los datos frescos en lugar de mostrar la caché en "0".
        const timestamp = new Date().getTime();
        
        // Pasamos el timestamp como parámetro (?t=123456789)
        const response = await getWorkOrderCountsRequest({ t: timestamp }); 
        
        setCounts(response.data);
      } catch (error) {
        console.error("Error al obtener conteos:", error);
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
                       counts.baterias + 
                       counts.completado;

  return { counts, totalEnTaller, loading };
};