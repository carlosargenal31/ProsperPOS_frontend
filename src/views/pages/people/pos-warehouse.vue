<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Bodegas</h4>
            <h6>Administra las bodegas del sistema</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="loadWarehouses" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar">
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Colapsar" id="collapse-header" @click="toggleHeader">
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
        <div class="page-btn d-flex gap-2">
          <a
            href="#"
            class="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#add-warehouse"
            @click="openAddModal"
          >
            <i class="ti ti-circle-plus me-1"></i>Agregar Nueva Bodega
          </a>
          <button class="btn btn-success" @click="showSaveReportModal = true">
            <i class="ti ti-download me-1"></i>Guardar Reporte
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <!-- Warehouses Table -->
      <div v-else class="card table-list-card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table datanew">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Encargado</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="warehouses.length === 0">
                  <td colspan="6" class="text-center">No hay bodegas registradas</td>
                </tr>
                <tr v-for="warehouse in warehouses" :key="warehouse.id">
                  <td>{{ warehouse.id }}</td>
                  <td>{{ warehouse.nombre }}</td>
                  <td>{{ warehouse.encargado || '-' }}</td>
                  <td>{{ warehouse.ubicacion || '-' }}</td>
                  <td>
                    <span :class="warehouse.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ warehouse.is_active ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openViewModal(warehouse)"
                        data-bs-toggle="modal"
                        data-bs-target="#view-warehouse"
                        title="Ver detalles"
                      >
                        <i data-feather="eye" class="feather-eye"></i>
                      </a>
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(warehouse)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-warehouse"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(warehouse)"
                        data-bs-toggle="modal"
                        data-bs-target="#delete-modal"
                      >
                        <i data-feather="trash-2" class="feather-trash-2"></i>
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <warehouse-modal
    :warehouse="selectedWarehouse"
    :is-edit="isEditMode"
    @warehouse-saved="onWarehouseSaved"
    @warehouse-deleted="onWarehouseDeleted"
  ></warehouse-modal>

  <!-- Modal Guardar Reporte -->
  <div v-if="showSaveReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Guardar Reporte - Bodegas</h5>
          <button type="button" class="btn-close" @click="showSaveReportModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-3">Selecciona el formato en el que deseas guardar el reporte:</p>
          <div class="d-grid gap-2">
            <button class="btn btn-outline-success" @click="saveAsExcel">
              <i class="ti ti-file-spreadsheet me-2"></i> Guardar como Excel
            </button>
            <button class="btn btn-outline-danger" @click="saveAsPDF">
              <i class="ti ti-file-type-pdf me-2"></i> Guardar como PDF
            </button>
            <button class="btn btn-outline-primary" @click="saveAsImage">
              <i class="ti ti-photo me-2"></i> Guardar como Imagen
            </button>
            <button class="btn btn-outline-secondary" @click="printReport">
              <i class="ti ti-printer me-2"></i> Imprimir
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showSaveReportModal = false">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import api from '@/utils/axios';

export default {
  data() {
    return {
      warehouses: [],
      selectedWarehouse: null,
      isEditMode: false,
      loading: false,
      error: null,
      showSaveReportModal: false,
      companyInfo: {}
    };
  },
  mounted() {
    this.loadWarehouses();
    this.loadCompanyInfo();
  },
  methods: {
    async loadWarehouses() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/warehouses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.warehouses = Array.isArray(response.data.data) ? response.data.data : [];
      } catch (error) {
        console.error('Error loading warehouses:', error);
        this.error = 'Error al cargar las bodegas';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedWarehouse = null;
      this.isEditMode = false;
    },

    openEditModal(warehouse) {
      this.selectedWarehouse = { ...warehouse };
      this.isEditMode = true;
    },

    openViewModal(warehouse) {
      this.selectedWarehouse = { ...warehouse };
    },

    openDeleteModal(warehouse) {
      this.selectedWarehouse = warehouse;
    },

    onWarehouseSaved() {
      this.loadWarehouses();
    },

    onWarehouseDeleted() {
      this.loadWarehouses();
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },

    async loadCompanyInfo() {
      try {
        const response = await api.get('/companies/default');
        if (response.data && response.data.success) {
          this.companyInfo = response.data.data;
        }
      } catch (error) {
        console.error('Error al cargar información de empresa:', error);
        try {
          const publicResponse = await api.get('/companies/public/default');
          if (publicResponse.data && publicResponse.data.success) {
            this.companyInfo = publicResponse.data.data;
          }
        } catch (publicError) {
          this.companyInfo = {
            company_name: 'ProsperPOS',
            commercial_name: 'ProsperPOS',
            rtn: 'N/A',
            address: 'Sin dirección',
            phone: 'N/A',
            whatsapp: 'N/A',
            email: 'N/A'
          };
        }
      }
    },

    async getCompanyLogo() {
      if (!this.companyInfo?.logo_url) return '';
      const dbLogoUrl = this.companyInfo.logo_url;
      if (!dbLogoUrl.startsWith('http')) return '';

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

    saveAsExcel() {
      this.showSaveReportModal = false;
      try {
        const wb = XLSX.utils.book_new();
        const headerData = [
          [this.companyInfo.commercial_name || this.companyInfo.company_name || 'PROSPERPOS'],
          [this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'],
          [`Tel: ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'}`],
          [''],
          ['REPORTE DE BODEGAS'],
          [''],
          ['']
        ];

        const ws = XLSX.utils.aoa_to_sheet(headerData);
        const data = this.warehouses.map(warehouse => ({
          'ID': warehouse.id,
          'Nombre': warehouse.nombre,
          'Encargado': warehouse.encargado || '-',
          'Ubicación': warehouse.ubicacion || '-',
          'Estado': warehouse.is_active ? 'Activa' : 'Inactiva'
        }));

        XLSX.utils.sheet_add_json(ws, data, { origin: 'A8', skipHeader: false });
        XLSX.utils.book_append_sheet(wb, ws, 'Bodegas');
        XLSX.writeFile(wb, `bodegas_${new Date().toISOString().split('T')[0]}.xlsx`);
      } catch (error) {
        console.error('Error al guardar Excel:', error);
        alert('Error al generar el archivo Excel');
      }
    },

    async saveAsPDF() {
      this.showSaveReportModal = false;
      try {
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
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft > 0) {
          position = -(imgHeight - heightLeft) + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pdfHeight - 20);
        }

        pdf.save(`bodegas_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error al guardar PDF:', error);
        alert('Error al generar el archivo PDF');
      }
    },

    async saveAsImage() {
      this.showSaveReportModal = false;
      try {
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
        link.download = `bodegas_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error al guardar imagen:', error);
        alert('Error al generar la imagen');
      }
    },

    async printReport() {
      this.showSaveReportModal = false;
      try {
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

        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (error) {
        console.error('Error al imprimir:', error);
        alert('Error al imprimir el reporte');
      }
    },

    async buildReportHTML() {
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

      const tableRows = this.warehouses.map(warehouse => `
        <tr>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${warehouse.id}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${warehouse.nombre}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${warehouse.encargado || '-'}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${warehouse.ubicacion || '-'}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px; text-align: center;">
            ${warehouse.is_active ? 'Activa' : 'Inactiva'}
          </td>
        </tr>
      `).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 15px; background: white; margin: 0; width: 800px; }
            .header-section { display: flex; justify-content: space-between; margin-bottom: 15px; gap: 15px; }
            .company-info { width: 60%; flex-shrink: 0; }
            .company-info img { max-width: 180px; height: auto; margin-bottom: 8px; }
            .company-details { font-size: 11px; line-height: 1.5; }
            .report-box { width: 38%; flex-shrink: 0; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                          -webkit-print-color-adjust: exact; print-color-adjust: exact;
                          color: white; padding: 10px; border-radius: 8px; }
            .report-title { font-size: 13px; font-weight: bold; margin-bottom: 8px; }
            .report-details { font-size: 10px; line-height: 1.6; }
            .separator { border: none; border-top: 3px solid #f97316; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; }
            thead { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                    -webkit-print-color-adjust: exact; print-color-adjust: exact; color: white; }
            th { padding: 8px 4px; text-align: left; border: 1px solid #ddd; font-size: 9px; }
            td { padding: 6px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="company-info">
              ${hasLogo ? `<img src="${logoUrl}" alt="Logo">` : ''}
              <div class="company-details">
                <strong>${this.companyInfo.commercial_name || this.companyInfo.company_name || 'PROSPERPOS'}</strong><br>
                <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'}<br>
                <strong>Tel:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'} | <strong>Móvil:</strong> ${this.companyInfo.whatsapp || 'N/A'}<br>
                <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}
              </div>
            </div>
            <div class="report-box">
              <div class="report-title">REPORTE DE BODEGAS</div>
              <div class="report-details">
                <strong>Generado:</strong> ${new Date().toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' })} - ${new Date().toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <hr class="separator">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Encargado</th>
                <th>Ubicación</th>
                <th style="text-align: center;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
        </html>
      `;
    }
  },
};
</script>
