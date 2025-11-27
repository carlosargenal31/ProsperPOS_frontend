import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Exporta datos a formato PDF
 * @param {Array} data - Datos a exportar
 * @param {Array} columns - Columnas a mostrar [{header: 'Nombre', dataKey: 'name'}]
 * @param {String} filename - Nombre del archivo
 * @param {String} title - Título del documento
 */
export const exportToPDF = (data, columns, filename = 'documento', title = 'Reporte') => {
  try {
    const doc = new jsPDF();

    // Configuración de título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);

    // Información adicional
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-GT')}`, 14, 28);
    doc.text(`Total de registros: ${data.length}`, 14, 34);

    // Crear tabla
    doc.autoTable({
      startY: 40,
      head: [columns.map(col => col.header)],
      body: data.map(row =>
        columns.map(col => {
          const value = row[col.dataKey];
          // Formatear valores especiales
          if (value === null || value === undefined) return 'N/A';
          if (typeof value === 'boolean') return value ? 'Sí' : 'No';
          if (col.dataKey.includes('date') || col.dataKey.includes('created') || col.dataKey.includes('updated')) {
            return value ? new Date(value).toLocaleDateString('es-GT') : 'N/A';
          }
          return String(value);
        })
      ),
      headStyles: {
        fillColor: [102, 126, 234], // Color primario
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40 },
      theme: 'grid'
    });

    // Guardar PDF
    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('No se pudo generar el archivo PDF');
  }
};

/**
 * Exporta datos a formato Excel
 * @param {Array} data - Datos a exportar
 * @param {Array} columns - Columnas a mostrar [{header: 'Nombre', dataKey: 'name'}]
 * @param {String} filename - Nombre del archivo
 * @param {String} sheetName - Nombre de la hoja
 */
export const exportToExcel = (data, columns, filename = 'documento', sheetName = 'Datos') => {
  try {
    // Preparar datos con encabezados
    const headers = columns.map(col => col.header);
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.dataKey];
        // Formatear valores especiales
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'boolean') return value ? 'Sí' : 'No';
        if (col.dataKey.includes('date') || col.dataKey.includes('created') || col.dataKey.includes('updated')) {
          return value ? new Date(value).toLocaleDateString('es-GT') : 'N/A';
        }
        return value;
      })
    );

    // Crear hoja de cálculo
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Ajustar ancho de columnas
    const colWidths = columns.map(col => ({
      wch: Math.max(
        col.header.length,
        ...data.map(row => String(row[col.dataKey] || '').length)
      ) + 2
    }));
    ws['!cols'] = colWidths;

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Guardar archivo
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error al generar Excel:', error);
    throw new Error('No se pudo generar el archivo Excel');
  }
};

/**
 * Formatea los datos de la tabla para exportación
 * @param {Array} data - Datos originales
 * @param {Array} columnsConfig - Configuración de columnas para exportar
 * @returns {Array} Datos formateados
 */
export const formatDataForExport = (data, columnsConfig) => {
  return data.map(row => {
    const formattedRow = {};
    columnsConfig.forEach(col => {
      formattedRow[col.dataKey] = row[col.dataKey];
    });
    return formattedRow;
  });
};
