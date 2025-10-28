// Hook para exportar tablas en excel

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