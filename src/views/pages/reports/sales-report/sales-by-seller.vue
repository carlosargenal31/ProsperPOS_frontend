<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Ventas Por Vendedor</h4>
            <h6>Reporte de ventas agrupado por vendedor</h6>
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
            <div class="col-md-3">
              <div class="mb-3">
                <label class="form-label">Fecha Desde</label>
                <input type="date" class="form-control" v-model="filters.date_from" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="mb-3">
                <label class="form-label">Fecha Hasta</label>
                <input type="date" class="form-control" v-model="filters.date_to" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="mb-3">
                <label class="form-label">Vendedor</label>
                <select class="form-select" v-model="filters.seller_id">
                  <option value="all">Todos</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.first_name }} {{ user.last_name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="mb-3">
                <label class="form-label">Sucursal</label>
                <select class="form-select" v-model="filters.branch_id">
                  <option value="all">Todos</option>
                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.nombre }}
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
                  <th>Vendedor</th>
                  <th class="text-end">Neto</th>
                  <th class="text-end">Total+ISV</th>
                  <th class="text-end">Devuelto</th>
                  <th class="text-end">Cobrado</th>
                  <th class="text-end">Cant.Facturas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="seller in reportData.sellers" :key="seller.seller_id">
                  <td class="text-primary fw-bold">{{ seller.seller_name }}</td>
                  <td class="text-end">{{ formatCurrency(seller.neto) }}</td>
                  <td class="text-end">{{ formatCurrency(seller.total_con_isv) }}</td>
                  <td class="text-end">{{ formatCurrency(seller.devuelto) }}</td>
                  <td class="text-end">{{ formatCurrency(seller.cobrado) }}</td>
                  <td class="text-end">{{ seller.total_invoices }}</td>
                </tr>
              </tbody>
              <tfoot class="table-light fw-bold">
                <tr>
                  <td class="text-end">TOTALES</td>
                  <td class="text-end">{{ formatCurrency(reportData.totals.neto) }}</td>
                  <td class="text-end">{{ formatCurrency(reportData.totals.total_con_isv) }}</td>
                  <td class="text-end">{{ formatCurrency(reportData.totals.devuelto) }}</td>
                  <td class="text-end">{{ formatCurrency(reportData.totals.cobrado) }}</td>
                  <td class="text-end">{{ reportData.totals.total_invoices }}</td>
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
                <div class="mb-2" v-if="companyLogoBase64">
                  <img :src="companyLogoBase64" style="max-width: 180px; height: auto; margin-bottom: 8px;" alt="Logo" />
                </div>
                <div style="font-size: 11px; line-height: 1.5;">
                  <strong>{{ companyInfo.commercial_name || companyInfo.company_name || companyInfo.business_description || 'Cerámicas Terrazos y Pulidos' }}</strong><br>
                  <strong>RTN:</strong> {{ companyInfo.rtn || 'N/A' }}<br>
                  <strong>Dirección:</strong> {{ companyInfo.address || companyInfo.direccion || 'Sin dirección' }}<br>
                  <strong>Teléfono:</strong> {{ companyInfo.phone || companyInfo.telefono || 'N/A' }}<br>
                  <strong>Móvil:</strong> {{ companyInfo.whatsapp || companyInfo.telefono_movil || companyInfo.phone_mobile || 'N/A' }}<br>
                  <strong>Email:</strong> {{ companyInfo.email || 'N/A' }}
                </div>
              </div>
              <div class="col-5">
                <div class="text-white p-2" style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 8px;">
                  <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px;">REPORTE DE VENTAS POR VENDEDOR</div>
                  <div style="font-size: 10px; line-height: 1.6;">
                    <strong>Desde:</strong> {{ formatDate(filters.date_from) }}<br>
                    <strong>Hasta:</strong> {{ formatDate(filters.date_to) }}<br>
                    <strong>Vendedor:</strong> {{ getSellerFilterText() }}<br>
                    <strong>Sucursal:</strong> {{ getBranchFilterText() }}
                  </div>
                </div>
              </div>
            </div>

            <hr style="border-top: 3px solid #f97316; margin: 15px 0;">

            <!-- Tabla de datos -->
            <table class="table table-sm table-bordered" style="font-size: 11px;">
              <thead style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);">
                <tr class="text-white">
                  <th style="padding: 8px;">VENDEDOR</th>
                  <th class="text-end" style="padding: 8px;">NETO</th>
                  <th class="text-end" style="padding: 8px;">TOTAL+ISV</th>
                  <th class="text-end" style="padding: 8px;">DEVUELTO</th>
                  <th class="text-end" style="padding: 8px;">COBRADO</th>
                  <th class="text-end" style="padding: 8px;">CANT.</th>
                </tr>
              </thead>
              <tbody v-if="reportData">
                <tr v-for="seller in reportData.sellers" :key="seller.seller_id">
                  <td style="padding: 6px;">{{ seller.seller_name }}</td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(seller.neto) }}</td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(seller.total_con_isv) }}</td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(seller.devuelto) }}</td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(seller.cobrado) }}</td>
                  <td class="text-end" style="padding: 6px;">{{ seller.total_invoices }}</td>
                </tr>
              </tbody>
              <tfoot v-if="reportData" style="background: #f3f4f6; font-weight: bold;">
                <tr>
                  <td style="padding: 8px; text-align: right;">TOTALES:</td>
                  <td class="text-end" style="padding: 8px;">L {{ formatCurrency(reportData.totals.neto) }}</td>
                  <td class="text-end" style="padding: 8px;">L {{ formatCurrency(reportData.totals.total_con_isv) }}</td>
                  <td class="text-end" style="padding: 8px;">L {{ formatCurrency(reportData.totals.devuelto) }}</td>
                  <td class="text-end" style="padding: 8px;">L {{ formatCurrency(reportData.totals.cobrado) }}</td>
                  <td class="text-end" style="padding: 8px;">{{ reportData.totals.total_invoices }}</td>
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
import api from '@/utils/axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      filters: {
        date_from: this.getTodayDate(),
        date_to: this.getTodayDate(),
        seller_id: 'all',
        branch_id: 'all'
      },
      users: [],
      branches: [],
      reportData: null,
      loading: false,
      searched: false,
      showPrintModal: false,
      showExportDropdown: false,
      companyInfo: {},
      companyLogoBase64: '',
      printOptions: {
        orientation: 'vertical',
        format: 'standard'
      }
    };
  },
  mounted() {
    this.loadUsers();
    this.loadBranches();
    this.loadCompanyInfo();
  },
  watch: {
    async showPrintModal(newVal) {
      if (newVal) {
        // Cargar logo cuando se abre el modal
        this.companyLogoBase64 = await this.getCompanyLogo();
      }
    }
  },
  methods: {
    getFirstDayOfMonth() {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    },
    getTodayDate() {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    getSellerFilterText() {
      if (this.filters.seller_id === 'all') return 'TODOS';
      const user = this.users.find(u => u.id == this.filters.seller_id);
      return user ? `${user.first_name} ${user.last_name}` : 'TODOS';
    },
    getBranchFilterText() {
      if (this.filters.branch_id === 'all') return 'TODOS';
      const branch = this.branches.find(b => b.id == this.filters.branch_id);
      return branch ? branch.nombre : 'TODOS';
    },
    async getCompanyLogo() {
      if (!this.companyInfo?.logo_url) {
        return '';
      }

      const dbLogoUrl = this.companyInfo.logo_url;
      if (!dbLogoUrl.startsWith('http')) {
        return '';
      }

      try {
        const response = await api.get('/image-proxy', { params: { url: dbLogoUrl } });
        if (response.data.success && response.data.data.base64) {
          return response.data.data.base64;
        }
      } catch (error) {
        console.error('Error al cargar logo:', error);
      }

      return '';
    },
    async loadUsers() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          // Handle nested paginated response: {success, data: {data: [...], pagination: ...}}
          const responseData = response.data.data;
          let allUsers = [];
          if (Array.isArray(responseData)) {
            allUsers = responseData;
          } else if (responseData && Array.isArray(responseData.data)) {
            // Nested structure from user controller
            allUsers = responseData.data;
          } else if (responseData && responseData.users) {
            allUsers = responseData.users;
          } else if (responseData && responseData.rows) {
            allUsers = responseData.rows;
          }
          // Filter only users with vendor/seller role (check roles array or role_name)
          this.users = allUsers.filter(user => {
            // Check if user has vendor/seller role
            if (user.roles && Array.isArray(user.roles)) {
              return user.roles.some(role =>
                role.name?.toLowerCase().includes('vendedor') ||
                role.name?.toLowerCase().includes('seller') ||
                role.name?.toLowerCase().includes('sales')
              );
            }
            // Check role_name field
            if (user.role_name) {
              return user.role_name.toLowerCase().includes('vendedor') ||
                     user.role_name.toLowerCase().includes('seller') ||
                     user.role_name.toLowerCase().includes('sales');
            }
            // If no role info, include all users for now
            return true;
          });
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    },
    async loadBranches() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/branches', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          // Handle nested paginated response
          const responseData = response.data.data;
          let allBranches = [];
          if (Array.isArray(responseData)) {
            allBranches = responseData;
          } else if (responseData && Array.isArray(responseData.data)) {
            // Nested structure
            allBranches = responseData.data;
          } else if (responseData && responseData.branches) {
            allBranches = responseData.branches;
          } else if (responseData && responseData.rows) {
            allBranches = responseData.rows;
          }
          // Filter only active branches (not deleted)
          this.branches = allBranches.filter(branch => !branch.deleted_at);
        }
      } catch (error) {
        console.error('Error loading branches:', error);
      }
    },
    async loadCompanyInfo() {
      try {
        const response = await api.get('/companies/default');
        if (response.data && response.data.success) {
          this.companyInfo = response.data.data;
        } else if (response.data) {
          this.companyInfo = response.data;
        }
      } catch (error) {
        console.error('Error loading company info:', error);
        // Fallback: intentar con endpoint público
        try {
          const publicResponse = await api.get('/companies/public/default');
          if (publicResponse.data && publicResponse.data.success) {
            this.companyInfo = publicResponse.data.data;
          } else if (publicResponse.data) {
            this.companyInfo = publicResponse.data;
          }
        } catch (publicError) {
          console.error('Error loading public company info:', publicError);
          this.companyInfo = {
            company_name: 'ProsperPOS',
            commercial_name: 'ProsperPOS',
            direccion: 'Honduras',
            address: 'Honduras',
            telefono: 'N/A',
            phone: 'N/A',
            rtn: 'N/A',
            email: 'info@prosperpos.com'
          };
        }
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
        if (this.filters.seller_id) params.append('seller_id', this.filters.seller_id);
        if (this.filters.branch_id) params.append('branch_id', this.filters.branch_id);

        const response = await axios.get(`/api/v1/reports/sales-by-seller?${params.toString()}`, {
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
      // Parse YYYY-MM-DD format directly to avoid timezone issues
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
      const sellerFilterText = this.getSellerFilterText();
      const branchFilterText = this.getBranchFilterText();

      const data = [
        ['VENTAS POR VENDEDOR'],
        [''],
        ['Empresa:', this.companyInfo.company_name || 'EMPRESA'],
        ['Desde:', this.formatDate(this.filters.date_from)],
        ['Hasta:', this.formatDate(this.filters.date_to)],
        ['Vendedor:', sellerFilterText],
        ['Sucursal:', branchFilterText],
        [''],
        ['Vendedor', 'Neto', 'Total+ISV', 'Devuelto', 'Cobrado', 'Cant.Facturas']
      ];

      this.reportData.sellers.forEach(seller => {
        data.push([
          seller.seller_name,
          seller.neto,
          seller.total_con_isv,
          seller.devuelto,
          seller.cobrado,
          seller.total_invoices
        ]);
      });

      data.push(['']);
      data.push(['TOTALES', this.reportData.totals.neto, this.reportData.totals.total_con_isv, this.reportData.totals.devuelto, this.reportData.totals.cobrado, this.reportData.totals.total_invoices]);

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ventas por Vendedor');
      XLSX.writeFile(wb, `ventas_por_vendedor_${this.filters.date_from}_${this.filters.date_to}.xlsx`);
      this.showPrintModal = false;
    },
    async exportToPDF() {
      this.showExportDropdown = false;
      try {
        const fileName = `ventas_por_vendedor_${this.filters.date_from}_${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildReportHTML();
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
        const fileName = `ventas_por_vendedor_${this.filters.date_from}_${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildReportHTML();
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
    async buildReportHTML() {
      const sellerFilterText = this.getSellerFilterText();
      const branchFilterText = this.getBranchFilterText();

      // Obtener logo desde la base de datos
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

      let tableRows = '';
      this.reportData.sellers.forEach(seller => {
        tableRows += `
          <tr>
            <td style="padding: 6px;">${seller.seller_name}</td>
            <td style="padding: 6px; text-align: right;">L ${this.formatCurrency(seller.neto)}</td>
            <td style="padding: 6px; text-align: right;">L ${this.formatCurrency(seller.total_con_isv)}</td>
            <td style="padding: 6px; text-align: right;">L ${this.formatCurrency(seller.devuelto)}</td>
            <td style="padding: 6px; text-align: right;">L ${this.formatCurrency(seller.cobrado)}</td>
            <td style="padding: 6px; text-align: right;">${seller.total_invoices}</td>
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
              ${hasLogo ? `<img src="${logoUrl}" style="max-width: 180px; height: auto; margin-bottom: 8px;" alt="Logo">` : ''}
              <div class="company-details">
                <strong>${this.companyInfo.commercial_name || this.companyInfo.company_name || this.companyInfo.business_description || 'Cerámicas Terrazos y Pulidos'}</strong><br>
                <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'}<br>
                <strong>Teléfono:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'}<br>
                ${this.companyInfo.whatsapp ? '<strong>Móvil:</strong> ' + this.companyInfo.whatsapp + '<br>' : ''}
                <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}
              </div>
            </div>
            <div class="report-box">
              <div class="report-title">REPORTE DE VENTAS POR VENDEDOR</div>
              <div class="report-details">
                <strong>Desde:</strong> ${this.formatDate(this.filters.date_from)}<br>
                <strong>Hasta:</strong> ${this.formatDate(this.filters.date_to)}<br>
                <strong>Vendedor:</strong> ${sellerFilterText}<br>
                <strong>Sucursal:</strong> ${branchFilterText}
              </div>
            </div>
          </div>

          <hr class="separator">

          <table>
            <thead>
              <tr>
                <th>VENDEDOR</th>
                <th class="text-right">NETO</th>
                <th class="text-right">TOTAL+ISV</th>
                <th class="text-right">DEVUELTO</th>
                <th class="text-right">COBRADO</th>
                <th class="text-right">CANT.</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
            <tfoot>
              <tr>
                <td style="text-align: right;">TOTALES:</td>
                <td class="text-right">L ${this.formatCurrency(this.reportData.totals.neto)}</td>
                <td class="text-right">L ${this.formatCurrency(this.reportData.totals.total_con_isv)}</td>
                <td class="text-right">L ${this.formatCurrency(this.reportData.totals.devuelto)}</td>
                <td class="text-right">L ${this.formatCurrency(this.reportData.totals.cobrado)}</td>
                <td class="text-right">${this.reportData.totals.total_invoices}</td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;
    },
    async generatePrintableReport() {
      const printWindow = window.open('', '_blank');
      const html = await this.buildReportHTML();

      const printHtml = html.replace('</body>', `
        <scr` + `ipt>
          window.onload = function() {
            // Esperar a que todas las imágenes carguen antes de imprimir
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
