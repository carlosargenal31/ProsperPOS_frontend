<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ti ti-eye me-2"></i>Detalles del Ajuste de Inventario
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <div class="modal-body py-3 px-4">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando detalles...</p>
          </div>

          <div v-else class="document-preview border rounded p-3" style="max-height: 500px; overflow-y: auto; background: #f8f9fa;">
            <div class="bg-white p-3 rounded shadow-sm">
              <div class="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom">
                <div>
                  <img v-if="companyLogo" :src="companyLogo" alt="Logo" style="max-width: 120px; height: auto; margin-bottom: 10px;">
                  <h6 class="mb-1">{{ companyInfo.company_name || 'Ceramicas Terrazos y Pulidos Universal' }}</h6>
                  <p class="small mb-0 text-muted">
                    <strong>RTN:</strong> {{ companyInfo.rtn || '01061977002516' }}<br>
                    <strong>Dirección:</strong> {{ companyInfo.direccion || 'Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico. La Ceiba, Atlántida' }}<br>
                    <strong>Teléfono:</strong> {{ companyInfo.telefono || '+504 2440-0037' }}<br>
                    <strong>Teléfono Móvil:</strong> {{ companyInfo.telefono_movil || '+504 9875-2725' }}<br>
                    <strong>Email:</strong> {{ companyInfo.email || 'mauricio_argenal@hotmail.com' }}
                  </p>
                </div>
                <div class="text-end">
                  <div class="badge bg-warning text-dark p-3">
                    <h6 class="mb-2">AJUSTE DE INVENTARIO</h6>
                    <div class="small">
                      <strong>No:</strong> {{ adjustment.consecutive }}<br>
                      <strong>Fecha:</strong> {{ formatDate(adjustment.issue_date) }}<br>
                      <strong>Estado:</strong> {{ getStatusLabel(adjustment.status) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <p class="small mb-1"><strong>Emisor:</strong> {{ adjustment.issuer || 'N/A' }}</p>
                <p class="small mb-1"><strong>Bodega:</strong> {{ adjustment.warehouse_name || 'N/A' }}</p>
                <p class="small mb-0"><strong>Concepto:</strong> {{ adjustment.concept || 'N/A' }}</p>
              </div>

              <div class="table-responsive">
                <table class="table table-sm table-bordered">
                  <thead class="table-warning">
                    <tr>
                      <th>NO</th>
                      <th>CÓDIGO</th>
                      <th>DESCRIPCIÓN</th>
                      <th class="text-center">EXIST. TEÓRICA</th>
                      <th class="text-center">EXIST. FÍSICA</th>
                      <th class="text-center">DIFERENCIA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in details" :key="item.id || index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ item.product_code || 'N/A' }}</td>
                      <td>{{ item.product_name || 'N/A' }}</td>
                      <td class="text-center">{{ formatNumber(item.quantity_before) }}</td>
                      <td class="text-center">{{ formatNumber(item.quantity_actual) }}</td>
                      <td class="text-center" :class="getDifferenceClass(item.difference)">
                        {{ formatNumber(item.difference, true) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="alert alert-info">
                <strong>Total de Productos Ajustados:</strong> {{ details.length }}<br>
                <strong>Impacto Total de Ajuste:</strong> <span :class="getDifferenceClass(getTotalDifference())">{{ formatNumber(getTotalDifference(), true) }} unidades</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer py-2 no-print">
          <div class="dropdown me-auto" :class="{ show: showExportDropdown }">
            <button class="btn btn-sm btn-warning dropdown-toggle" type="button" @click="showExportDropdown = !showExportDropdown">
              OTRAS OPCIONES
            </button>
            <ul class="dropdown-menu" :class="{ show: showExportDropdown }">
              <li><a class="dropdown-item" href="#" @click.prevent="exportToExcel"><i class="ti ti-file-spreadsheet me-2"></i>GUARDAR EXCEL</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="exportToPDF"><i class="ti ti-file-type-pdf me-2"></i>GUARDAR PDF</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="exportToImage"><i class="ti ti-photo me-2"></i>GUARDAR IMAGEN</a></li>
            </ul>
          </div>
          <button type="button" class="btn btn-sm btn-info" @click="printDocument">
            <i class="ti ti-printer me-1"></i> IMPRIMIR
          </button>
          <button
            type="button"
            class="btn btn-sm btn-success"
            v-if="adjustment.status === 'pending'"
            @click="applyAdjustment"
          >
            <i class="ti ti-check me-1"></i> Aplicar Ajuste
          </button>
          <button type="button" class="btn btn-sm btn-secondary" @click="$emit('close')">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="!loading"></div>
</template>

<script>
import api from "@/utils/axios";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { LOGO_BASE64 } from '@/assets/img/logo.js';

export default {
  name: 'StockAdjustmentViewModal',
  props: {
    adjustmentId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      adjustment: {},
      details: [],
      companyInfo: {},
      companyLogo: null,
      showExportDropdown: false
    }
  },
  mounted() {
    this.loadAdjustmentDetails();
    this.loadCompanyInfo();
  },
  methods: {
    async loadCompanyInfo() {
      try {
        const response = await api.get('/company-info');
        if (response.data && response.data.data) {
          this.companyInfo = response.data.data;
          // Cargar el logo si existe
          if (this.companyInfo.logo_path) {
            this.companyLogo = `/uploads/${this.companyInfo.logo_path}`;
          }
        }
      } catch (error) {
        console.error('Error al cargar información de la empresa:', error);
      }
    },
    async loadAdjustmentDetails() {
      this.loading = true;
      try {
        const response = await api.get(`/inventory-adjustments/${this.adjustmentId}`);

        if (response.data.success) {
          this.adjustment = response.data.data.adjustment || {};
          this.details = response.data.data.details || [];
        }
      } catch (error) {
        console.error('Error al cargar detalles:', error);
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los detalles del ajuste'
        });
        this.$emit('close');
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString.replace('Z', ''));
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    formatDateTime(dateString) {
      if (!dateString) return '-';
      // Crear la fecha interpretándola como hora local, no UTC
      const date = new Date(dateString.replace('Z', ''));
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    },
    formatNumber(value, showSign = false) {
      const num = parseFloat(value || 0);
      const formatted = num.toFixed(2);
      if (showSign && num > 0) {
        return `+${formatted}`;
      }
      return formatted;
    },
    formatCurrency(value) {
      if (!value) return '0.00';
      return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    getDifferenceClass(difference) {
      const diff = parseFloat(difference || 0);
      if (diff > 0) return 'text-success fw-bold';
      if (diff < 0) return 'text-danger fw-bold';
      return 'text-muted';
    },
    getStatusBadge(status) {
      const badges = {
        'pending': 'bg-warning',
        'processed': 'bg-success',
        'cancelled': 'bg-danger'
      };
      return badges[status] || 'bg-secondary';
    },
    getStatusLabel(status) {
      if (!status) return 'N/A';
      const labels = {
        'pending': 'PENDIENTE',
        'processed': 'PROCESADO',
        'cancelled': 'CANCELADO'
      };
      return labels[status] || status.toUpperCase();
    },
    getTotalDifference() {
      return this.details.reduce((sum, item) => sum + parseFloat(item.difference || 0), 0);
    },
    getTotalCostImpact() {
      return this.details.reduce((sum, item) => {
        return sum + (parseFloat(item.cost_unit || 0) * parseFloat(item.difference || 0));
      }, 0);
    },
    async exportToPDF() {
      this.showExportDropdown = false;
      try {
        const fileName = `Ajuste_Inventario_${this.adjustment.consecutive}`;

        // Crear iframe oculto con HTML limpio
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildDocumentHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        // Esperar a que se cargue el contenido
        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 800,
          windowWidth: 800
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'letter');
        const imgWidth = 216; // Letter width in mm (8.5 inches)
        const pageHeight = 279; // Letter height in mm (11 inches)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${fileName}.pdf`);
        document.body.removeChild(iframe);

        this.$swal.fire({
          icon: 'success',
          title: 'PDF Generado',
          text: 'El archivo PDF se ha descargado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al generar PDF:', error);
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el PDF'
        });
      }
    },
    async exportToExcel() {
      this.showExportDropdown = false;

      const data = [
        ['AJUSTE DE INVENTARIO'],
        [''],
        ['Empresa:', this.companyInfo.company_name || 'EMPRESA'],
        ['Dirección:', this.companyInfo.direccion || 'Sin dirección'],
        ['Teléfono:', this.companyInfo.telefono || 'N/A'],
        ['RTN:', this.companyInfo.rtn || 'N/A'],
        [''],
        ['Nro. Ajuste:', this.adjustment.consecutive],
        ['Fecha Emisión:', this.formatDate(this.adjustment.issue_date)],
        ['Emisor:', this.adjustment.issuer || 'N/A'],
        ['Bodega:', this.adjustment.warehouse_name || 'N/A'],
        ['Concepto:', this.adjustment.concept || 'N/A'],
        [''],
        ['Código', 'Descripción', 'Exist. Teórica', 'Exist. Física', 'Diferencia']
      ];

      this.details.forEach(item => {
        data.push([
          item.product_code || 'N/A',
          item.product_name || 'N/A',
          parseFloat(item.quantity_before || 0),
          parseFloat(item.quantity_actual || 0),
          parseFloat(item.difference || 0)
        ]);
      });

      data.push(['']);
      data.push(['Total de productos ajustados:', this.details.length]);

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ajuste Inventario');
      XLSX.writeFile(wb, `Ajuste_Inventario_${this.adjustment.consecutive}.xlsx`);

      this.$swal.fire({
        icon: 'success',
        title: 'Excel Generado',
        text: 'El archivo Excel se ha descargado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    async exportToImage() {
      this.showExportDropdown = false;
      try {
        const fileName = `Ajuste_Inventario_${this.adjustment.consecutive}`;

        // Crear iframe oculto con HTML limpio
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildDocumentHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        // Esperar a que se cargue el contenido
        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 800,
          windowWidth: 800
        });

        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);

        this.$swal.fire({
          icon: 'success',
          title: 'Imagen Guardada',
          text: 'La imagen se ha descargado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al generar imagen:', error);
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar la imagen'
        });
      }
    },
    printDocument() {
      // Generar documento limpio en nueva ventana para imprimir
      const printWindow = window.open('', '_blank');
      const html = this.buildDocumentHTML();
      printWindow.document.write(html);
      printWindow.document.close();

      // Esperar a que cargue el contenido y luego imprimir
      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
      };
    },
    buildDocumentHTML() {
      const docTitle = 'AJUSTE DE INVENTARIO';
      const docColor = '#FF9800'; // Color naranja uniforme

      // Construir filas de la tabla
      let tableRows = '';

      this.details.forEach((item, index) => {
        const quantityBefore = parseFloat(item.quantity_before) || 0;
        const quantityActual = parseFloat(item.quantity_actual) || 0;
        const difference = parseFloat(item.difference) || 0;

        // Color para la diferencia
        let diffColor = '#666';
        if (difference > 0) diffColor = '#28a745'; // Verde
        if (difference < 0) diffColor = '#dc3545'; // Rojo

        tableRows += `
          <tr>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${String(index + 1).padStart(2, '0')}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.product_code || 'N/A'}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.product_name || 'N/A'}</td>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${this.formatCurrency(quantityBefore)}</td>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${this.formatCurrency(quantityActual)}</td>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: ${diffColor}; font-size: 10px;">${difference > 0 ? '+' : ''}${this.formatCurrency(difference)}</td>
          </tr>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${docTitle} - ${this.adjustment.consecutive}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              background: #fff;
              padding: 0;
              margin: 0;
            }
            .invoice-container {
              max-width: 850px;
              margin: 0 auto;
              background: white;
              padding: 40px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 3px solid ${docColor};
            }
            .company-logo { flex: 1; }
            .company-name {
              font-size: 26px;
              font-weight: 700;
              color: ${docColor};
              margin-bottom: 6px;
              letter-spacing: -0.5px;
            }
            .company-details {
              font-size: 11px;
              color: #000;
              line-height: 1.5;
            }
            .invoice-header {
              text-align: right;
              background: ${docColor};
              color: white;
              padding: 15px 18px;
              border-radius: 6px;
              min-width: 280px;
            }
            .invoice-title {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .invoice-meta {
              font-size: 11px;
              line-height: 1.5;
              text-align: right;
            }
            .invoice-meta strong { font-weight: 600; }
            .products-table {
              width: 100%;
              margin-bottom: 20px;
              border-collapse: collapse;
              background: white;
            }
            .products-table thead { background: ${docColor}; }
            .products-table thead th {
              padding: 8px 6px;
              text-align: left;
              font-size: 10px;
              font-weight: 600;
              color: white;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .products-table thead th:first-child { text-align: center; }
            .products-table thead th:nth-child(4),
            .products-table thead th:nth-child(5),
            .products-table thead th:nth-child(6) { text-align: center; }
            .products-table tbody tr:hover { background: #fffbf0; }
            .summary-section {
              margin-top: 20px;
              padding: 15px;
              border: 1px solid #e0e0e0;
              border-radius: 4px;
              background: #f8f9fa;
            }
            .summary-title {
              font-size: 14px;
              font-weight: 700;
              color: ${docColor};
              margin-bottom: 10px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
              font-size: 11px;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .invoice-container {
                padding: 20px;
                max-width: 100%;
              }
              .header, .products-table, .summary-section {
                page-break-inside: avoid;
              }
              .invoice-header, .products-table thead {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                background: #FF9800 !important;
                color: white !important;
              }
              @page {
                size: letter;
                margin: 15mm;
              }
            }
            @page {
              size: letter;
              margin: 15mm;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-logo">
                <img src="${LOGO_BASE64}" style="max-width: 180px; height: auto; margin-bottom: 8px;" alt="Logo">
                <div style="font-size: 12px; font-weight: 700; color: #000; margin-bottom: 4px;">${this.companyInfo.company_name || 'Ceramicas Terrazos y Pulidos Universal'}</div>
                <div class="company-details">
                  <strong>RTN:</strong> ${this.companyInfo.rtn || '01061977002516'}<br>
                  <strong>Dirección:</strong> ${this.companyInfo.direccion || 'Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico. La Ceiba, Atlántida'}<br>
                  <strong>Teléfono:</strong> ${this.companyInfo.telefono || '+504 2440-0037'}<br>
                  <strong>Teléfono Móvil:</strong> ${this.companyInfo.telefono_movil || '+504 9875-2725'}<br>
                  <strong>Email:</strong> ${this.companyInfo.email || 'mauricio_argenal@hotmail.com'}
                </div>
              </div>
              <div style="flex: 1; margin-left: 20px;">
                <div style="font-size: 11px; color: #333;">
                  <strong>Emisor:</strong> ${this.adjustment.issuer || 'N/A'}<br>
                  <strong>Bodega:</strong> ${this.adjustment.warehouse_name || 'N/A'}
                </div>
              </div>
              <div class="invoice-header">
                <div class="invoice-title">${docTitle}: ${this.adjustment.consecutive}</div>
                <div class="invoice-meta">
                  <strong>#Control Interno:</strong> ${this.adjustment.consecutive.padStart(10, '0')}<br>
                  <strong>Sucursal:</strong> ${this.adjustment.warehouse_name || 'Principal'}<br>
                  <strong>Emisión:</strong> ${this.formatDate(this.adjustment.issue_date)}<br>
                  <strong>Estado:</strong> ${this.getStatusLabel(this.adjustment.status)}
                </div>
              </div>
            </div>
            <table class="products-table">
              <thead>
                <tr>
                  <th>NO.</th>
                  <th>CÓDIGO</th>
                  <th>DESCRIPCIÓN</th>
                  <th>EXIST. TEÓRICA</th>
                  <th>EXIST. FÍSICA</th>
                  <th>DIFERENCIA</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="summary-section">
              <div class="summary-title">Resumen del Ajuste</div>
              <div class="summary-row">
                <span><strong>Total de Productos Ajustados:</strong></span>
                <span><strong>${this.details.length}</strong></span>
              </div>
              <div class="summary-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd;">
                <span><strong>Impacto Total de Ajuste:</strong></span>
                <span><strong style="color: ${(() => {
                  const total = this.getTotalDifference();
                  if (total > 0) return '#28a745';
                  if (total < 0) return '#dc3545';
                  return '#666';
                })()};">${(() => {
                  const total = this.getTotalDifference();
                  return (total > 0 ? '+' : '') + this.formatCurrency(total);
                })()} unidades</strong></span>
              </div>
              ${this.adjustment.concept ? `
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
                  <strong>Concepto:</strong> ${this.adjustment.concept}
                </div>
              ` : ''}
            </div>
          </div>
        </body>
        </html>
      `;

      return html;
    },
    async applyAdjustment() {
      const result = await this.$swal.fire({
        title: '¿Aplicar Ajuste?',
        text: 'Esta acción actualizará el inventario en el sistema',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Aplicar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          await api.post(`/inventory-adjustments/${this.adjustmentId}/apply`);

          this.$swal.fire({
            icon: 'success',
            title: 'Ajuste Aplicado',
            text: 'El ajuste se ha aplicado correctamente al inventario',
            timer: 2000,
            showConfirmButton: false
          });

          this.$emit('applied');
          this.$emit('close');
        } catch (error) {
          console.error('Error al aplicar ajuste:', error);
          this.$swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'No se pudo aplicar el ajuste'
          });
        }
      }
    }
  }
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.fw-bold {
  font-weight: 700;
}

.fw-semibold {
  font-weight: 600;
}

.fs-16 {
  font-size: 16px;
}

.table-sm td,
.table-sm th {
  padding: 0.5rem;
}

.document-preview {
  font-family: 'Arial', sans-serif;
}

.badge-sm {
  font-size: 9px;
  padding: 2px 6px;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 1000;
  min-width: 200px;
  padding: 0.5rem 0;
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0,0,0,.15);
  border-radius: 0.25rem;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,.175);
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

@media print {
  .no-print {
    display: none !important;
  }

  .modal {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  .modal-dialog {
    max-width: 100% !important;
    margin: 0 !important;
  }

  .modal-content {
    border: none !important;
    box-shadow: none !important;
  }

  .modal-body {
    padding: 10px !important;
  }

  .modal-backdrop {
    display: none !important;
  }

  .document-preview {
    max-height: none !important;
    overflow: visible !important;
    border: none !important;
  }

  @page {
    size: letter;
    margin: 0.5cm;
  }
}
</style>
