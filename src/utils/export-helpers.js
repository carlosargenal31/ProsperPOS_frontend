/**
 * Export Helpers - Utilidades para exportar datos a PDF y Excel
 * Incluye información de la empresa en todos los reportes
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Obtener información de la empresa desde localStorage o API
 */
export async function getCompanyInfo() {
  try {
    // Intentar obtener de localStorage primero
    const cachedInfo = localStorage.getItem('companyInfo');
    if (cachedInfo) {
      return JSON.parse(cachedInfo);
    }

    // Si no existe, usar valores por defecto
    return {
      company_name: 'ProsperPOS',
      direccion: 'Tegucigalpa, Honduras',
      telefono: '+504 0000-0000',
      email: 'info@prosperpos.com',
      rtn: '00000000000000'
    };
  } catch (error) {
    console.error('Error getting company info:', error);
    return {
      company_name: 'ProsperPOS',
      direccion: '',
      telefono: '',
      email: '',
      rtn: ''
    };
  }
}

/**
 * Exportar datos a PDF
 * @param {Object} options - Opciones de exportación
 * @param {string} options.title - Título del documento
 * @param {Array} options.headers - Headers de la tabla
 * @param {Array} options.data - Datos a exportar
 * @param {string} options.filename - Nombre del archivo (sin extensión)
 * @param {Object} options.companyInfo - Información de la empresa (opcional)
 */
export async function exportToPDF(options) {
  const {
    title,
    headers,
    data,
    filename = 'reporte',
    companyInfo = null
  } = options;

  try {
    const company = companyInfo || await getCompanyInfo();

    // Crear PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header con info de la empresa
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(company.company_name || 'ProsperPOS', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    if (company.direccion) {
      doc.text(company.direccion, pageWidth / 2, 22, { align: 'center' });
    }
    if (company.telefono) {
      doc.text(`Tel: ${company.telefono}`, pageWidth / 2, 27, { align: 'center' });
    }

    // Título del reporte
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(title, pageWidth / 2, 35, { align: 'center' });

    // Fecha de generación
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    const now = new Date();
    const dateStr = `Generado: ${now.toLocaleDateString('es-HN')} ${now.toLocaleTimeString('es-HN')}`;
    doc.text(dateStr, pageWidth / 2, 42, { align: 'center' });

    // Tabla de datos
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 48,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 48, left: 10, right: 10 },
      didDrawPage: function(data) {
        // Footer con número de página
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
          `Página ${doc.internal.getCurrentPageInfo().pageNumber} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
    });

    // Guardar PDF
    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Error al generar el PDF');
  }
}

/**
 * Exportar datos a Excel
 * @param {Object} options - Opciones de exportación
 * @param {string} options.title - Título del documento
 * @param {Array} options.headers - Headers de la tabla
 * @param {Array} options.data - Datos a exportar
 * @param {string} options.filename - Nombre del archivo (sin extensión)
 * @param {Object} options.companyInfo - Información de la empresa (opcional)
 */
export async function exportToExcel(options) {
  const {
    title,
    headers,
    data,
    filename = 'reporte',
    companyInfo = null
  } = options;

  try {
    const company = companyInfo || await getCompanyInfo();

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Crear array con toda la información
    const wsData = [];

    // Header de la empresa
    wsData.push([company.company_name || 'ProsperPOS']);
    wsData.push([company.direccion || '']);
    wsData.push([`Tel: ${company.telefono || 'N/A'}`]);
    wsData.push([]); // Línea vacía

    // Título del reporte
    wsData.push([title]);

    // Fecha de generación
    const now = new Date();
    wsData.push([`Generado: ${now.toLocaleDateString('es-HN')} ${now.toLocaleTimeString('es-HN')}`]);
    wsData.push([]); // Línea vacía

    // Headers de la tabla
    wsData.push(headers);

    // Datos
    data.forEach(row => {
      wsData.push(row);
    });

    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Establecer anchos de columna
    const colWidths = headers.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31)); // Max 31 chars

    // Guardar archivo
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Error al generar el Excel');
  }
}

/**
 * Formatear moneda
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'L 0.00';
  }
  return `L ${parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Formatear fecha
 */
export function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formatear fecha y hora
 */
export function formatDateTime(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
