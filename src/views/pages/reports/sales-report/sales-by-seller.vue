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
          <div ref="reportContent" class="border p-3 bg-white" style="min-height: 300px;">
            <div class="text-center mb-3">
              <strong>{{ companyInfo.company_name || 'EMPRESA' }}</strong><br>
              <small>{{ companyInfo.direccion || 'Sin dirección' }}</small><br>
              <small>Tel: {{ companyInfo.telefono || 'N/A' }}</small>
            </div>
            <h6 class="text-danger text-center">Ventas Por Vendedor</h6>
            <div class="d-flex justify-content-around border p-2 mb-2" style="font-size: 11px;">
              <span><strong>Desde:</strong> {{ formatDate(filters.date_from) }}</span>
              <span><strong>Hasta:</strong> {{ formatDate(filters.date_to) }}</span>
              <span><strong>Vendedor:</strong> {{ getSellerFilterText() }}</span>
              <span><strong>Sucursal:</strong> {{ getBranchFilterText() }}</span>
            </div>
            <table class="table table-sm table-bordered" style="font-size: 11px;">
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th class="text-end">Neto</th>
                  <th class="text-end">Total+ISV</th>
                  <th class="text-end">Devuelto</th>
                  <th class="text-end">Cobrado</th>
                  <th class="text-end">Cant.</th>
                </tr>
              </thead>
              <tbody v-if="reportData">
                <tr v-for="seller in reportData.sellers" :key="seller.seller_id">
                  <td class="text-primary">{{ seller.seller_name }}</td>
                  <td class="text-end">{{ formatCurrency(seller.neto) }}</td>
                  <td class="text-end">{{ formatCurrency(seller.total_con_isv) }}</td>
                  <td class="text-end">{{ formatCurrency(seller.devuelto) }}</td>
                  <td class="text-end">{{ formatCurrency(seller.cobrado) }}</td>
                  <td class="text-end">{{ seller.total_invoices }}</td>
                </tr>
              </tbody>
              <tfoot v-if="reportData">
                <tr class="fw-bold">
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
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/reports/company-info', {
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
      // Generate same format as print report but for Excel/CSV
      const sellerFilterText = this.getSellerFilterText();
      const branchFilterText = this.getBranchFilterText();

      let csv = '\ufeff'; // UTF-8 BOM for Excel
      csv += `${this.companyInfo.company_name || 'EMPRESA'}\n`;
      csv += `Cedula:,${this.companyInfo.cedula || 'N/A'}\n`;
      csv += `Sucursal:,SUCURSAL PRINCIPAL\n`;
      csv += `Teléfono:,${this.companyInfo.telefono || 'N/A'},Email:,${this.companyInfo.email || 'N/A'}\n`;
      csv += `Direccion:,${this.companyInfo.direccion || 'N/A'}\n\n`;
      csv += 'Ventas Por Vendedor\n\n';
      csv += `Desde:,${this.formatDate(this.filters.date_from)},Hasta:,${this.formatDate(this.filters.date_to)},Vendedor:,${sellerFilterText},Sucursal:,${branchFilterText}\n\n`;
      csv += 'Vendedor,Neto,Total+ISV,Devuelto,Cobrado,Cant.Facturas\n';
      this.reportData.sellers.forEach(seller => {
        csv += `"${seller.seller_name}",${this.formatCurrency(seller.neto)},${this.formatCurrency(seller.total_con_isv)},${this.formatCurrency(seller.devuelto)},${this.formatCurrency(seller.cobrado)},${seller.total_invoices}\n`;
      });
      csv += `TOTALES,${this.formatCurrency(this.reportData.totals.neto)},${this.formatCurrency(this.reportData.totals.total_con_isv)},${this.formatCurrency(this.reportData.totals.devuelto)},${this.formatCurrency(this.reportData.totals.cobrado)},${this.reportData.totals.total_invoices}\n`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ventas_por_vendedor_${this.filters.date_from}_${this.filters.date_to}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      this.showPrintModal = false;
    },
    async exportToPDF() {
      this.showExportDropdown = false;
      try {
        // Create hidden iframe with the same format as print
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.generateReportHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        // Wait for content to load
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
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
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

        pdf.save(`ventas_por_vendedor_${this.filters.date_from}_${this.filters.date_to}.pdf`);
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
        // Create hidden iframe with the same format as print
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.generateReportHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        // Wait for content to load
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
        link.download = `ventas_por_vendedor_${this.filters.date_from}_${this.filters.date_to}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);
        this.showPrintModal = false;
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Error al generar la imagen');
      }
    },
    generateReportHTML() {
      const sellerFilterText = this.getSellerFilterText();
      const branchFilterText = this.getBranchFilterText();

      let tableRows = '';
      this.reportData.sellers.forEach(seller => {
        tableRows += `
          <tr>
            <td style="color: #0066cc; font-weight: bold;">${seller.seller_name}</td>
            <td style="text-align: right;">${this.formatCurrency(seller.neto)}</td>
            <td style="text-align: right;">${this.formatCurrency(seller.total_con_isv)}</td>
            <td style="text-align: right;">${this.formatCurrency(seller.devuelto)}</td>
            <td style="text-align: right;">${this.formatCurrency(seller.cobrado)}</td>
            <td style="text-align: right;">${seller.total_invoices}</td>
          </tr>
        `;
      });

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: white; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .company-info { color: #0066cc; font-size: 12px; }
            .company-info strong { font-size: 14px; color: black; }
            .report-title { color: #cc0000; font-weight: bold; margin: 20px 0 10px 0; text-align: center; font-size: 18px; }
            .filters { display: flex; border: 1px solid #ccc; margin-bottom: 10px; }
            .filters div { padding: 5px 10px; border-right: 1px solid #ccc; }
            .filters div:last-child { border-right: none; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ccc; }
            td { padding: 8px; border: 1px solid #ccc; }
            tfoot td { background: #f0f0f0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <strong>${this.companyInfo.company_name || 'EMPRESA'}</strong><br>
              <strong>Cedula:</strong> ${this.companyInfo.cedula || 'N/A'}<br>
              <strong>Sucursal:</strong> SUCURSAL PRINCIPAL<br>
              <strong>Teléfono:</strong> ${this.companyInfo.telefono || 'N/A'} <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}<br>
              <strong>Direccion:</strong> ${this.companyInfo.direccion || 'N/A'}
            </div>
          </div>

          <div class="report-title">Ventas Por Vendedor</div>

          <div class="filters">
            <div><strong>Desde:</strong> ${this.formatDate(this.filters.date_from)}</div>
            <div><strong>Hasta:</strong> ${this.formatDate(this.filters.date_to)}</div>
            <div><strong>Vendedor:</strong> ${sellerFilterText}</div>
            <div><strong>Sucursal:</strong> ${branchFilterText}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Vendedor</th>
                <th style="text-align: right;">Neto</th>
                <th style="text-align: right;">Total+ISV</th>
                <th style="text-align: right;">Devuelto</th>
                <th style="text-align: right;">Cobrado</th>
                <th style="text-align: right;">Cant.Facturas</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
            <tfoot>
              <tr>
                <td style="text-align: right;">TOTALES</td>
                <td style="text-align: right;">${this.formatCurrency(this.reportData.totals.neto)}</td>
                <td style="text-align: right;">${this.formatCurrency(this.reportData.totals.total_con_isv)}</td>
                <td style="text-align: right;">${this.formatCurrency(this.reportData.totals.devuelto)}</td>
                <td style="text-align: right;">${this.formatCurrency(this.reportData.totals.cobrado)}</td>
                <td style="text-align: right;">${this.reportData.totals.total_invoices}</td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;
    },
    generatePrintableReport(forPDF = false) {
      const printWindow = window.open('', '_blank');
      const sellerFilterText = this.getSellerFilterText();
      const branchFilterText = this.getBranchFilterText();

      let tableRows = '';
      this.reportData.sellers.forEach(seller => {
        tableRows += `
          <tr>
            <td style="color: #0066cc; font-weight: bold;">${seller.seller_name}</td>
            <td style="text-align: right;">${this.formatCurrency(seller.neto)}</td>
            <td style="text-align: right;">${this.formatCurrency(seller.total_con_isv)}</td>
            <td style="text-align: right;">${this.formatCurrency(seller.devuelto)}</td>
            <td style="text-align: right;">${this.formatCurrency(seller.cobrado)}</td>
            <td style="text-align: right;">${seller.total_invoices}</td>
          </tr>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ventas Por Vendedor - ${this.formatDate(this.filters.date_from)} al ${this.formatDate(this.filters.date_to)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .company-info { color: #0066cc; font-size: 12px; }
            .company-info strong { font-size: 14px; color: black; }
            .logo { text-align: right; }
            .logo img { max-width: 200px; }
            .report-title { color: #cc0000; font-weight: bold; margin: 20px 0 10px 0; text-align: center; font-size: 18px; }
            .filters { display: flex; border: 1px solid #ccc; margin-bottom: 10px; }
            .filters div { padding: 5px 10px; border-right: 1px solid #ccc; }
            .filters div:last-child { border-right: none; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ccc; }
            td { padding: 8px; border: 1px solid #ccc; }
            tfoot td { background: #f0f0f0; font-weight: bold; }
            @media print { body { margin: 0; } @page { size: auto; margin: 10mm; } }
            ${forPDF ? '.pdf-info { margin-top: 20px; font-size: 10px; color: #666; text-align: center; }' : ''}
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <strong>${this.companyInfo.company_name || 'EMPRESA'}</strong><br>
              <strong>Cedula:</strong> ${this.companyInfo.cedula || 'N/A'}<br>
              <strong>Sucursal:</strong> SUCURSAL PRINCIPAL<br>
              <strong>Teléfono:</strong> ${this.companyInfo.telefono || 'N/A'} <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}<br>
              <strong>Direccion:</strong> ${this.companyInfo.direccion || 'N/A'}
            </div>
          </div>

          <div class="report-title">Ventas Por Vendedor</div>

          <div class="filters">
            <div><strong>Desde:</strong> ${this.formatDate(this.filters.date_from)}</div>
            <div><strong>Hasta:</strong> ${this.formatDate(this.filters.date_to)}</div>
            <div><strong>Vendedor:</strong> ${sellerFilterText}</div>
            <div><strong>Sucursal:</strong> ${branchFilterText}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Vendedor</th>
                <th style="text-align: right;">Neto</th>
                <th style="text-align: right;">Total+ISV</th>
                <th style="text-align: right;">Devuelto</th>
                <th style="text-align: right;">Cobrado</th>
                <th style="text-align: right;">Cant.Facturas</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
            <tfoot>
              <tr>
                <td style="text-align: right;"><strong>TOTALES</strong></td>
                <td style="text-align: right;">${this.formatCurrency(this.reportData.totals.neto)}</td>
                <td style="text-align: right;">${this.formatCurrency(this.reportData.totals.total_con_isv)}</td>
                <td style="text-align: right;">${this.formatCurrency(this.reportData.totals.devuelto)}</td>
                <td style="text-align: right;">${this.formatCurrency(this.reportData.totals.cobrado)}</td>
                <td style="text-align: right;">${this.reportData.totals.total_invoices}</td>
              </tr>
            </tfoot>
          </table>

          ${forPDF ? '<div class="pdf-info">Para guardar como PDF, seleccione "Guardar como PDF" en las opciones de destino del diálogo de impresión.</div>' : ''}

          <scr` + `ipt>
            window.onload = function() {
              window.print();
            };
          </scr` + `ipt>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      this.showPrintModal = false;
      return printWindow;
    }
  }
};
</script>
