//Hooks para el contador de las órdenes de trabajo

import { useState, useEffect } from "react";
import { utils, writeFile } from 'xlsx';

export const useExportToExcel = () => {
  const exportToExcel = (data, filename, sheetName = 'Datos') => {
    // Crear una hoja de trabajo
    const worksheet = utils.json_to_sheet(data);
    
    // Crear un libro de trabajo
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Guardar el archivo
    writeFile(workbook, `${filename}.xlsx`);
  };

  return { exportToExcel };
};

export const useWorkOrderCounts = () => {
  const [counts, setCounts] = useState({
    por_asignar: 0,
    asignado: 0,
    en_aprobacion: 0,
    por_repuestos: 0,
    en_soporte: 0,
    completado: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/work-orders/counts', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCounts(data);
        }
      } catch (error) {
        console.error("Error al obtener conteos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return { counts, loading };
};