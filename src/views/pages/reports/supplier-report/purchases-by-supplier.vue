<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Reporte de Proveedores</h4>
            <h6>Reporte de compras agrupado por proveedor</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadReport">
              <i class="ti ti-refresh"></i>
            </a>
          </li>
        </ul>
      </div>

      <!-- Filtros -->
      <div class="card border-0">
        <div class="card-body pb-1">
          <div class="row align-items-end">
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Fecha Desde</label>
                <input type="date" class="form-control" v-model="filters.date_from" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Fecha Hasta</label>
                <input type="date" class="form-control" v-model="filters.date_to" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Proveedor</label>
                <select class="form-select" v-model="filters.supplier_id">
                  <option value="all">Todos</option>
                  <option v-for="supplier in suppliers" :key="supplier.supplier_name" :value="supplier.supplier_name">
                    {{ supplier.supplier_name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-end">
              <button class="btn btn-primary" @click="loadReport" :disabled="loading">
                <i class="ti ti-search me-1"></i> Generar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Resultados -->
      <div class="card table-list-card" v-if="reportData">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h4>Resultados</h4>
          <div>
            <button class="btn btn-sm btn-outline-primary me-2" @click="showPrintModal = true">
              <i class="ti ti-printer me-1"></i> Imprimir
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead class="table-light">
                <tr>
                  <th>Proveedor</th>
                  <th class="text-end">Neto</th>
                  <th class="text-end">Total+ISV</th>
                  <th class="text-end">Devuelto</th>
                  <th class="text-end">Descuentos</th>
                  <th class="text-end">Cant.Compras</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="supplier in reportData.suppliers" :key="supplier.supplier_name">
                  <td class="text-primary fw-bold">{{ supplier.supplier_name }}</td>
                  <td class="text-end">{{ formatCurrency(supplier.total_neto) }}</td>
                  <td class="text-end">{{ formatCurrency(supplier.total_con_isv) }}</td>
                  <td class="text-end">{{ formatCurrency(supplier.devuelto) }}</td>
                  <td class="text-end">{{ formatCurrency(supplier.total_descuento) }}</td>
                  <td class="text-end">{{ supplier.total_purchases }}</td>
                </tr>
              </tbody>
              <tfoot class="table-light fw-bold">
                <tr>
                  <td class="text-end">TOTALES</td>
                  <td class="text-end">{{ formatCurrency(reportData.totals.total_neto) }}</td>
                  <td class="text-end">{{ formatCurrency(reportData.totals.total_con_isv) }}</td>
                  <td class="text-end">{{ formatCurrency(reportData.totals.devuelto) }}</td>
                  <td class="text-end">{{ formatCurrency(reportData.totals.total_descuento) }}</td>
                  <td class="text-end">{{ reportData.totals.total_purchases }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Sin datos -->
      <div class="card" v-else-if="!loading && searched">
        <div class="card-body text-center py-5">
          <i class="ti ti-file-off fs-1 text-muted"></i>
          <p class="mt-3">No se encontraron datos para los filtros seleccionados</p>
        </div>
      </div>

      <!-- Loading -->
      <div class="card" v-if="loading">
        <div class="card-body text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-3">Generando reporte...</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Impresión -->
  <div class="modal fade" :class="{ show: showPrintModal }" :style="{ display: showPrintModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-white">
          <h5 class="modal-title">Imprimir Documento</h5>
          <button type="button" class="btn-close" @click="closePrintModal"></button>
        </div>
        <div class="modal-body">
          <!-- Preview del reporte -->
          <div ref="reportContent" class="bg-white" style="min-height: 300px; padding: 15px;">
            <!-- Header con logo y info de reporte -->
            <div class="row mb-3">
              <div class="col-7">
                <div class="mb-2">
                  <img :src="getLogoBase64()" style="max-width: 180px; height: auto; margin-bottom: 8px;" alt="Logo" />
                </div>
                <div style="font-size: 11px; line-height: 1.5;">
                  <strong>{{ companyInfo.business_description || companyInfo.description || 'Cerámicas Terrazos y Pulidos' }}</strong><br>
                  <strong>RTN:</strong> {{ companyInfo.rtn || 'N/A' }}<br>
                  <strong>Dirección:</strong> {{ companyInfo.direccion || 'Sin dirección' }}<br>
                  <strong>Teléfono:</strong> {{ companyInfo.telefono || 'N/A' }}<br>
                  <strong>Teléfono Móvil:</strong> {{ companyInfo.telefono_movil || companyInfo.phone_mobile || '+504 9875-2725' }}<br>
                  <strong>Email:</strong> {{ companyInfo.email || 'N/A' }}
                </div>
              </div>
              <div class="col-5">
                <div class="text-white p-2" style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 8px;">
                  <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px;">REPORTE DE PROVEEDORES</div>
                  <div style="font-size: 10px; line-height: 1.6;">
                    <strong>Desde:</strong> {{ formatDate(filters.date_from) }}<br>
                    <strong>Hasta:</strong> {{ formatDate(filters.date_to) }}<br>
                    <strong>Proveedor:</strong> {{ getSupplierFilterText() }}
                  </div>
                </div>
              </div>
            </div>

            <hr style="border-top: 3px solid #f97316; margin: 15px 0;">

            <!-- Tabla de datos -->
            <table class="table table-sm table-bordered" style="font-size: 11px;">
              <thead style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);">
                <tr class="text-white">
                  <th style="padding: 8px;">PROVEEDOR</th>
                  <th class="text-end" style="padding: 8px;">NETO</th>
                  <th class="text-end" style="padding: 8px;">TOTAL+ISV</th>
                  <th class="text-end" style="padding: 8px;">DEVUELTO</th>
                  <th class="text-end" style="padding: 8px;">DESCUENTOS</th>
                  <th class="text-end" style="padding: 8px;">CANT.</th>
                </tr>
              </thead>
              <tbody v-if="reportData">
                <tr v-for="supplier in reportData.suppliers" :key="supplier.supplier_name">
                  <td style="padding: 6px;">{{ supplier.supplier_name }}</td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(supplier.total_neto) }}</td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(supplier.total_con_isv) }}</td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(supplier.devuelto) }}</td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(supplier.total_descuento) }}</td>
                  <td class="text-end" style="padding: 6px;">{{ supplier.total_purchases }}</td>
                </tr>
              </tbody>
              <tfoot v-if="reportData" style="background: #f3f4f6; font-weight: bold;">
                <tr>
                  <td style="padding: 8px; text-align: right;">TOTALES:</td>
                  <td class="text-end" style="padding: 8px;">L {{ formatCurrency(reportData.totals.total_neto) }}</td>
                  <td class="text-end" style="padding: 8px;">L {{ formatCurrency(reportData.totals.total_con_isv) }}</td>
                  <td class="text-end" style="padding: 8px;">L {{ formatCurrency(reportData.totals.devuelto) }}</td>
                  <td class="text-end" style="padding: 8px;">L {{ formatCurrency(reportData.totals.total_descuento) }}</td>
                  <td class="text-end" style="padding: 8px;">{{ reportData.totals.total_purchases }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <div class="dropdown me-auto" :class="{ show: showExportDropdown }">
            <button class="btn btn-warning dropdown-toggle" type="button" @click="showExportDropdown = !showExportDropdown">
              OTRAS OPCIONES
            </button>
            <ul class="dropdown-menu" :class="{ show: showExportDropdown }">
              <li><a class="dropdown-item" href="#" @click.prevent="exportToExcel"><i class="ti ti-file-spreadsheet me-2"></i>GUARDAR EXCEL</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="exportToPDF"><i class="ti ti-file-type-pdf me-2"></i>GUARDAR PDF</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="exportToImage"><i class="ti ti-photo me-2"></i>GUARDAR IMAGEN</a></li>
            </ul>
          </div>
          <button type="button" class="btn btn-info" @click="printReport">
            <i class="ti ti-printer me-1"></i> IMPRIMIR
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showPrintModal" @click="closePrintModal"></div>
</template>

<script>
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { LOGO_BASE64 } from '@/assets/img/logo.js';
import logoImage from '@/assets/img/logo.png';

export default {
  data() {
    return {
      logoUrl: logoImage,
      filters: {
        date_from: this.getTodayDate(),
        date_to: this.getTodayDate(),
        supplier_id: 'all'
      },
      suppliers: [],
      reportData: null,
      loading: false,
      searched: false,
      showPrintModal: false,
      showExportDropdown: false,
      companyInfo: {}
    };
  },
  mounted() {
    this.loadSuppliers();
    this.loadCompanyInfo();
  },
  methods: {
    getTodayDate() {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    getSupplierFilterText() {
      if (this.filters.supplier_id === 'all') return 'TODOS';
      return this.filters.supplier_id;
    },
    getLogoBase64() {
      return LOGO_BASE64;
    },
    async loadSuppliers() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/supplier-reports/suppliers-list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          this.suppliers = response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading suppliers:', error);
      }
    },
    async loadCompanyInfo() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/supplier-reports/company-info', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          this.companyInfo = response.data.data;
        }
      } catch (error) {
        console.error('Error loading company info:', error);
      }
    },
    async loadReport() {
      this.loading = true;
      this.searched = true;
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();

        if (this.filters.date_from) params.append('date_from', this.filters.date_from);
        if (this.filters.date_to) params.append('date_to', this.filters.date_to);
        if (this.filters.supplier_id !== 'all') params.append('supplier_id', this.filters.supplier_id);

        const response = await axios.get(`/api/v1/supplier-reports/purchases-by-supplier?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.reportData = response.data.data;
        }
      } catch (error) {
        console.error('Error loading report:', error);
        this.$toast?.error('Error al cargar el reporte');
      } finally {
        this.loading = false;
      }
    },
    formatCurrency(value) {
      const num = parseFloat(value) || 0;
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    },
    closePrintModal() {
      this.showPrintModal = false;
      this.showExportDropdown = false;
    },
    printReport() {
      this.generatePrintableReport();
    },
    exportToExcel() {
      this.showExportDropdown = false;
      const supplierFilterText = this.getSupplierFilterText();

      const data = [
        ['REPORTE DE PROVEEDORES'],
        [''],
        ['Empresa:', this.companyInfo.company_name || 'EMPRESA'],
        ['Desde:', this.formatDate(this.filters.date_from)],
        ['Hasta:', this.formatDate(this.filters.date_to)],
        ['Proveedor:', supplierFilterText],
        [''],
        ['Proveedor', 'Neto', 'Total+ISV', 'Devuelto', 'Descuentos', 'Cant.Compras']
      ];

      this.reportData.suppliers.forEach(supplier => {
        data.push([
          supplier.supplier_name,
          supplier.total_neto,
          supplier.total_con_isv,
          supplier.devuelto,
          supplier.total_descuento,
          supplier.total_purchases
        ]);
      });

      data.push(['']);
      data.push(['TOTALES', this.reportData.totals.total_neto, this.reportData.totals.total_con_isv, this.reportData.totals.devuelto, this.reportData.totals.total_descuento, this.reportData.totals.total_purchases]);

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Proveedores');
      XLSX.writeFile(wb, `reporte_proveedores_${this.filters.date_from}_${this.filters.date_to}.xlsx`);
      this.showPrintModal = false;
    },
    async exportToPDF() {
      this.showExportDropdown = false;
      try {
        const fileName = `reporte_proveedores_${this.filters.date_from}_${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildReportHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

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
        const imgWidth = 216;
        const pageHeight = 279;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);
        document.body.removeChild(iframe);
        this.showPrintModal = false;
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error al generar el PDF');
      }
    },
    async exportToImage() {
      this.showExportDropdown = false;
      try {
        const fileName = `reporte_proveedores_${this.filters.date_from}_${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildReportHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

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
        this.showPrintModal = false;
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Error al generar la imagen');
      }
    },
    buildReportHTML() {
      const supplierFilterText = this.getSupplierFilterText();

      let tableRows = '';
      this.reportData.suppliers.forEach(supplier => {
        tableRows += `
          <tr>
            <td style="padding: 6px;">${supplier.supplier_name}</td>
            <td style="padding: 6px; text-align: right;">L ${this.formatCurrency(supplier.total_neto)}</td>
            <td style="padding: 6px; text-align: right;">L ${this.formatCurrency(supplier.total_con_isv)}</td>
            <td style="padding: 6px; text-align: right;">L ${this.formatCurrency(supplier.devuelto)}</td>
            <td style="padding: 6px; text-align: right;">L ${this.formatCurrency(supplier.total_descuento)}</td>
            <td style="padding: 6px; text-align: right;">${supplier.total_purchases}</td>
          </tr>
        `;
      });

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 15px;
              background: white;
              margin: 0;
            }
            .header-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              gap: 15px;
            }
            .company-info {
              width: 60%;
              flex-shrink: 0;
            }
            .company-details {
              font-size: 11px;
              line-height: 1.5;
            }
            .report-box {
              width: 38%;
              flex-shrink: 0;
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: white;
              padding: 10px;
              border-radius: 8px;
            }
            .report-title {
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .report-details {
              font-size: 10px;
              line-height: 1.6;
            }
            .separator {
              border: none;
              border-top: 3px solid #f97316;
              margin: 15px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            thead {
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: white;
            }
            th {
              padding: 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            td {
              padding: 6px;
              border: 1px solid #ddd;
            }
            .text-right {
              text-align: right;
            }
            tfoot {
              background: #f3f4f6;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-weight: bold;
            }
            tfoot td {
              padding: 8px;
            }

            @media print {
              body {
                padding: 10px;
              }
              .report-box,
              thead {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: linear-gradient(135deg, #f97316 0%, #fb923c 100%) !important;
                color: white !important;
              }
              @page {
                size: letter;
                margin: 15mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="company-info">
              <img src="${LOGO_BASE64}" style="max-width: 180px; height: auto; margin-bottom: 8px;" alt="Logo">
              <div class="company-details">
                <strong>${this.companyInfo.business_description || this.companyInfo.description || 'Cerámicas Terrazos y Pulidos'}</strong><br>
                <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                <strong>Dirección:</strong> ${this.companyInfo.direccion || 'Sin dirección'}<br>
                <strong>Teléfono:</strong> ${this.companyInfo.telefono || 'N/A'}<br>
                <strong>Teléfono Móvil:</strong> ${this.companyInfo.telefono_movil || this.companyInfo.phone_mobile || '+504 9875-2725'}<br>
                <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}
              </div>
            </div>
            <div class="report-box">
              <div class="report-title">REPORTE DE PROVEEDORES</div>
              <div class="report-details">
                <strong>Desde:</strong> ${this.formatDate(this.filters.date_from)}<br>
                <strong>Hasta:</strong> ${this.formatDate(this.filters.date_to)}<br>
                <strong>Proveedor:</strong> ${supplierFilterText}
              </div>
            </div>
          </div>

          <hr class="separator">

          <table>
            <thead>
              <tr>
                <th>PROVEEDOR</th>
                <th class="text-right">NETO</th>
                <th class="text-right">TOTAL+ISV</th>
                <th class="text-right">DEVUELTO</th>
                <th class="text-right">DESCUENTOS</th>
                <th class="text-right">CANT.</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
            <tfoot>
              <tr>
                <td style="text-align: right;">TOTALES:</td>
                <td class="text-right">L ${this.formatCurrency(this.reportData.totals.total_neto)}</td>
                <td class="text-right">L ${this.formatCurrency(this.reportData.totals.total_con_isv)}</td>
                <td class="text-right">L ${this.formatCurrency(this.reportData.totals.devuelto)}</td>
                <td class="text-right">L ${this.formatCurrency(this.reportData.totals.total_descuento)}</td>
                <td class="text-right">${this.reportData.totals.total_purchases}</td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;
    },
    generatePrintableReport() {
      const printWindow = window.open('', '_blank');
      const html = this.buildReportHTML();

      const printHtml = html.replace('</body>', `
        <scr` + `ipt>
          window.onload = function() {
            const images = document.getElementsByTagName('img');
            if (images.length > 0) {
              let loaded = 0;
              const total = images.length;

              function checkLoaded() {
                loaded++;
                if (loaded === total) {
                  setTimeout(function() {
                    window.print();
                  }, 300);
                }
              }

              for (let i = 0; i < images.length; i++) {
                if (images[i].complete) {
                  checkLoaded();
                } else {
                  images[i].onload = checkLoaded;
                  images[i].onerror = checkLoaded;
                }
              }
            } else {
              window.print();
            }
          };
        </scr` + `ipt>
        </body>
      `);

      printWindow.document.write(printHtml);
      printWindow.document.close();
      this.showPrintModal = false;
      return printWindow;
    }
  }
};
</script>
