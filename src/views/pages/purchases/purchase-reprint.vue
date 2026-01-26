<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Reimpresiones Compras</h4>
            <h6>Reimprimir documentos de compras del sistema</h6>
          </div>
        </div>
      </div>

      <!-- Document Type Selection Card -->
      <div class="card border-0">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <label class="form-label">Sucursal</label>
              <select class="form-select" v-model="selectedBranch">
                <option value="">Todas las Sucursales</option>
                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.nombre || branch.name }}
                </option>
              </select>
            </div>

            <div class="col-md-8">
              <label class="form-label">Tipo de documento</label>
              <div class="input-group">
                <button class="btn btn-info" @click="showDocumentTypeModal = true">
                  <i class="ti ti-search"></i>
                </button>
                <input
                  type="text"
                  class="form-control form-control-lg text-primary fw-bold"
                  :value="selectedDocumentType"
                  readonly
                  placeholder="Seleccione un Tipo de documento"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents List Table -->
      <div class="card table-list-card" v-if="selectedDocumentType">
        <div class="modal-header bg-white">
          <h5 class="modal-title">Búsqueda de datos</h5>
        </div>

        <div class="card-body">
          <!-- Search Filters -->
          <div class="row mb-3">
            <div class="col-md-4">
              <label class="form-label">Desde</label>
              <input type="date" class="form-control" v-model="filters.date_from" @change="searchDocuments" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Hasta</label>
              <input type="date" class="form-control" v-model="filters.date_to" @change="searchDocuments" />
            </div>
            <div class="col-md-4">
              <label class="form-label">&nbsp;</label>
              <div class="input-group">
                <button class="btn btn-primary" @click="searchDocuments">
                  <i class="ti ti-search"></i>
                </button>
                <input
                  type="text"
                  class="form-control"
                  v-model="searchQuery"
                  placeholder="Buscar..."
                  @keyup.enter="searchDocuments"
                />
              </div>
            </div>
          </div>

          <!-- Documents Table -->
          <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="table table-sm table-hover">
              <thead class="table-light sticky-top">
                <tr>
                  <th @click="sortTable('issue_date')" style="cursor: pointer;">
                    Emisión <i class="ti" :class="getSortIcon('issue_date')"></i>
                  </th>
                  <th @click="sortTable('document_number')" style="cursor: pointer;">
                    Documento <i class="ti" :class="getSortIcon('document_number')"></i>
                  </th>
                  <th @click="sortTable('supplier_name')" style="cursor: pointer;">
                    Proveedor <i class="ti" :class="getSortIcon('supplier_name')"></i>
                  </th>
                  <th @click="sortTable('created_by_name')" style="cursor: pointer;">
                    Usuario <i class="ti" :class="getSortIcon('created_by_name')"></i>
                  </th>
                  <th @click="sortTable('total')" style="cursor: pointer;" class="text-end">
                    Total(L) <i class="ti" :class="getSortIcon('total')"></i>
                  </th>
                  <th @click="sortTable('status')" style="cursor: pointer;">
                    Estatus <i class="ti" :class="getSortIcon('status')"></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="doc in documents"
                  :key="doc.id"
                  @click="selectDocument(doc)"
                  style="cursor: pointer;"
                  class="hover-row"
                >
                  <td>{{ formatDateTime(doc.issue_date) }}</td>
                  <td>
                    <a href="#" class="text-primary" @click.prevent="selectDocument(doc)">
                      {{ doc.document_number || doc.full_number }}
                    </a>
                  </td>
                  <td>{{ doc.supplier_name }}</td>
                  <td>{{ doc.created_by_name || 'N/A' }}</td>
                  <td class="text-end">{{ formatCurrency(doc.total) }}</td>
                  <td>
                    <span class="badge" :class="getStatusBadgeClass(doc.payment_status || doc.status)">{{ getStatusLabel(doc.payment_status || doc.status) }}</span>
                  </td>
                </tr>
                <tr v-if="documents.length === 0">
                  <td colspan="6" class="text-center text-muted">No hay documentos encontrados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
      <p class="mb-0 text-gray-9">
        {{ new Date().getFullYear() }} &copy; ProsperPOS. Todos los derechos reservados
      </p>
      <p>
        Diseñado &amp Desarrollado Por
        <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a>
      </p>
    </div>
  </div>

  <!-- Document Type Selection Modal -->
  <div class="modal fade" :class="{ show: showDocumentTypeModal }" :style="{ display: showDocumentTypeModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Seleccione un Tipo de documento</h5>
          <button type="button" class="btn-close btn-close-white" @click="showDocumentTypeModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="list-group">
            <button
              type="button"
              class="list-group-item list-group-item-action"
              v-for="docType in documentTypes"
              :key="docType"
              @click="selectDocumentType(docType)"
            >
              {{ docType }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showDocumentTypeModal" @click="showDocumentTypeModal = false"></div>

  <!-- Document Preview Modal -->
  <div class="modal fade" :class="{ show: showDocumentModal }" :style="{ display: showDocumentModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-white py-2">
          <h6 class="modal-title mb-0">Imprimir Documento</h6>
          <button type="button" class="btn-close" @click="closeDocumentModal"></button>
        </div>

        <div class="modal-body py-2 px-3">
          <div ref="documentContent" class="border p-2 bg-white document-preview" style="max-height: 450px; overflow-y: auto;">
            <div v-if="selectedDocument">
              <!-- COMPRA -->
              <div v-if="selectedDocumentType === 'COMPRA'" id="purchaseContent">
                <div class="text-center mb-2">
                  <strong style="font-size: 13px;">{{ companyInfo.commercial_name || companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;"><strong>RTN:</strong> {{ companyInfo.rtn || 'N/A' }}</small><br>
                  <small style="font-size: 10px;">{{ companyInfo.address || companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.phone || companyInfo.telefono || 'N/A' }}</small>
                </div>

                <h6 class="text-success text-center mb-2" style="font-size: 14px;">FACTURA DE COMPRA</h6>

                <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
                  <span><strong>Factura:</strong> {{ selectedDocument.invoice_number || selectedDocument.purchase_number }}</span>
                  <span><strong>Fecha:</strong> {{ formatDate(selectedDocument.purchase_date) }}</span>
                </div>

                <div class="mb-2" style="font-size: 10px;">
                  <strong>Proveedor:</strong> {{ selectedDocument.supplier_name }}<br>
                  <strong>RTN Proveedor:</strong> {{ selectedDocument.supplier_rtn || '00000000000000' }}
                </div>

                <table class="table table-sm table-bordered mb-2" style="font-size: 10px;">
                  <thead class="table-light">
                    <tr>
                      <th style="padding: 4px;">Código</th>
                      <th style="padding: 4px;">Producto</th>
                      <th class="text-end" style="padding: 4px;">Cant.</th>
                      <th class="text-end" style="padding: 4px;">Precio Unit.</th>
                      <th class="text-end" style="padding: 4px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selectedDocument.items" :key="item.id">
                      <td style="padding: 4px;">{{ item.product_code || 'N/A' }}</td>
                      <td style="padding: 4px;">{{ item.product_name }} <strong>{{ item.product_unit || item.unit || 'UNIDAD' }}</strong></td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.quantity) }}</td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(item.unit_price) }}</td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(item.total || (item.quantity * item.unit_price)) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="table-active">
                      <td colspan="4" class="text-end" style="padding: 4px;"><strong>TOTAL:</strong></td>
                      <td class="text-end" style="padding: 4px;"><strong>L {{ formatCurrency(selectedDocument.total || selectedDocument.total_amount) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- DEVOLUCION COMPRA -->
              <div v-else-if="selectedDocumentType === 'DEVOLUCION COMPRA'" id="purchaseReturnContent">
                <div class="text-center mb-2">
                  <strong style="font-size: 13px;">{{ companyInfo.commercial_name || companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;"><strong>RTN:</strong> {{ companyInfo.rtn || 'N/A' }}</small><br>
                  <small style="font-size: 10px;">{{ companyInfo.address || companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.phone || companyInfo.telefono || 'N/A' }}</small>
                </div>

                <h6 class="text-success text-center mb-2" style="font-size: 14px;">DEVOLUCIÓN DE COMPRA</h6>

                <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
                  <span><strong>Nro. Devolución:</strong> {{ selectedDocument.correlative }}</span>
                  <span><strong>Compra Original:</strong> {{ selectedDocument.purchase_number }}</span>
                  <span><strong>Fecha:</strong> {{ formatDate(selectedDocument.emission_date) }}</span>
                </div>

                <div class="mb-2" style="font-size: 10px;">
                  <strong>Proveedor:</strong> {{ selectedDocument.supplier_name }}<br>
                  <strong>RTN Proveedor:</strong> {{ selectedDocument.supplier_rtn || '00000000000000' }}
                </div>

                <div class="mb-1" style="font-size: 10px;">
                  <strong>Monto Devolución:</strong> L {{ formatCurrency(selectedDocument.total) }}<br>
                  <strong>Observaciones:</strong> {{ selectedDocument.notes || 'N/A' }}
                </div>
              </div>

              <!-- NOTA CREDITO COMPRA -->
              <div v-else-if="selectedDocumentType === 'NOTA CREDITO COMPRA'" id="purchaseCreditNoteContent">
                <div class="text-center mb-2">
                  <strong style="font-size: 13px;">{{ companyInfo.commercial_name || companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;"><strong>RTN:</strong> {{ companyInfo.rtn || 'N/A' }}</small><br>
                  <small style="font-size: 10px;">{{ companyInfo.address || companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.phone || companyInfo.telefono || 'N/A' }}</small>
                </div>

                <h6 class="text-danger text-center mb-2" style="font-size: 14px;">NOTA DE CRÉDITO DE COMPRA</h6>

                <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
                  <span><strong>Nro. Nota Crédito:</strong> {{ selectedDocument.credit_note_number || selectedDocument.correlative }}</span>
                  <span><strong>Compra Original:</strong> {{ selectedDocument.purchase_number }}</span>
                  <span><strong>Fecha:</strong> {{ formatDate(selectedDocument.credit_note_date || selectedDocument.emission_date) }}</span>
                </div>

                <div class="mb-2" style="font-size: 10px;">
                  <strong>Proveedor:</strong> {{ selectedDocument.supplier_name }}<br>
                  <strong>RTN Proveedor:</strong> {{ selectedDocument.supplier_rtn || '00000000000000' }}
                </div>

                <div class="mb-1" style="font-size: 10px;">
                  <strong>Monto NC:</strong> L {{ formatCurrency(selectedDocument.total) }}<br>
                  <strong>Observaciones:</strong> {{ selectedDocument.notes || 'N/A' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer py-2">
          <div class="dropdown me-auto" :class="{ show: showExportDropdown }">
            <button class="btn btn-sm btn-warning dropdown-toggle" type="button" @click="showExportDropdown = !showExportDropdown">
              OTRAS OPCIONES
            </button>
            <ul class="dropdown-menu" :class="{ show: showExportDropdown }">
              <li><a class="dropdown-item" href="#" @click.prevent="exportDocument('excel')"><i class="ti ti-file-spreadsheet me-2"></i>GUARDAR EXCEL</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="exportDocument('pdf')"><i class="ti ti-file-type-pdf me-2"></i>GUARDAR PDF</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="exportDocument('image')"><i class="ti ti-photo me-2"></i>GUARDAR IMAGEN</a></li>
            </ul>
          </div>
          <button type="button" class="btn btn-sm btn-info" @click="printDocument">
            <i class="ti ti-printer me-1"></i> IMPRIMIR
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showDocumentModal" @click="closeDocumentModal"></div>

</template>

<script>
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import api from '@/utils/axios';

export default {
  data() {
    return {
      showDocumentTypeModal: false,
      showDocumentModal: false,
      showExportDropdown: false,
      selectedBranch: '',
      selectedDocumentType: '',
      selectedDocument: null,
      searchQuery: '',
      sortColumn: 'issue_date',
      sortDirection: 'desc',
      filters: {
        date_from: this.getFirstDayOfMonth(),
        date_to: this.getTodayDate()
      },
      documentTypes: [
        'COMPRA',
        'DEVOLUCION COMPRA',
        'NOTA CREDITO COMPRA'
      ],
      documents: [],
      branches: [],
      companyInfo: {}
    };
  },
  mounted() {
    this.loadCompanyInfo();
    this.loadBranches();
  },
  methods: {
    getTodayDate() {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    getFirstDayOfMonth() {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
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
    async loadCompanyInfo() {
      try {
        const response = await api.get('/companies/default');
        if (response.data && response.data.success) {
          this.companyInfo = response.data.data;
        }
      } catch (error) {
        console.error('Error loading company info:', error);
        // Fallback: intentar con endpoint público
        try {
          const publicResponse = await api.get('/companies/public/default');
          if (publicResponse.data && publicResponse.data.success) {
            this.companyInfo = publicResponse.data.data;
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
    async loadBranches() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/branches', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.branches = response.data.data.data || response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading branches:', error);
      }
    },
    selectDocumentType(docType) {
      this.selectedDocumentType = docType;
      this.showDocumentTypeModal = false;
      this.documents = [];
      this.searchDocuments();
    },
    async searchDocuments() {
      if (!this.selectedDocumentType) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/purchase-reprint/search', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            documentType: this.selectedDocumentType,
            searchQuery: this.searchQuery,
            dateFrom: this.filters.date_from,
            dateTo: this.filters.date_to,
            branch: this.selectedBranch
          }
        });

        if (response.data.success) {
          this.documents = response.data.data || [];
        }
      } catch (error) {
        console.error('Error searching documents:', error);
        alert('Error al buscar documentos: ' + (error.response?.data?.message || error.message));
      }
    },
    async selectDocument(doc) {
      try {
        const token = localStorage.getItem('token');
        // Codificar el tipo de documento para manejar espacios correctamente
        const encodedDocType = encodeURIComponent(this.selectedDocumentType);
        console.log('Requesting document details:', {
          documentType: this.selectedDocumentType,
          encodedDocType,
          docId: doc.id
        });

        const response = await axios.get(`/api/v1/purchase-reprint/${encodedDocType}/${doc.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.selectedDocument = response.data.data;
          this.showDocumentModal = true;
        }
      } catch (error) {
        console.error('Error loading document details:', error);
        console.error('Error response:', error.response?.data);
        alert('Error al cargar los detalles del documento: ' + (error.response?.data?.message || error.message));
      }
    },
    closeDocumentModal() {
      this.showDocumentModal = false;
      this.showExportDropdown = false;
      this.selectedDocument = null;
    },
    async printDocument() {
      const printWindow = window.open('', '_blank');
      const html = await this.buildDocumentHTML();
      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
      };
    },
    async exportDocument(format) {
      if (format === 'excel') {
        await this.exportToExcel();
      } else if (format === 'pdf') {
        await this.exportToPDF();
      } else if (format === 'image') {
        await this.exportToImage();
      }
    },
    async exportToExcel() {
      this.showExportDropdown = false;

      const data = [
        [this.selectedDocumentType],
        [''],
        ['Empresa:', this.companyInfo.company_name || 'EMPRESA'],
        ['Documento:', this.selectedDocument.document_number || this.selectedDocument.purchase_number],
        ['Proveedor:', this.selectedDocument.supplier_name],
        ['Fecha:', this.formatDate(this.selectedDocument.purchase_date || this.selectedDocument.emission_date)],
        [''],
        ['Producto', 'Cantidad', 'Precio Unit.', 'Total']
      ];

      if (this.selectedDocument.items && this.selectedDocument.items.length > 0) {
        this.selectedDocument.items.forEach(item => {
          const unitText = item.product_unit || item.unit || 'UNIDAD';
          data.push([
            `${item.product_name} ${unitText}`,
            item.quantity,
            item.unit_price,
            item.total || (item.quantity * item.unit_price)
          ]);
        });
      }

      data.push(['']);
      data.push(['', '', 'TOTAL:', this.selectedDocument.total || this.selectedDocument.total_amount]);

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, this.selectedDocumentType);
      XLSX.writeFile(wb, `${this.selectedDocumentType}_${this.selectedDocument.document_number || this.selectedDocument.correlative}.xlsx`);
    },
    async exportToPDF() {
      this.showExportDropdown = false;
      try {
        const fileName = `${this.selectedDocumentType}_${this.selectedDocument.document_number || this.selectedDocument.correlative}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildDocumentHTML();
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
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error al generar el PDF');
      }
    },
    async exportToImage() {
      this.showExportDropdown = false;
      try {
        const fileName = `${this.selectedDocumentType}_${this.selectedDocument.document_number || this.selectedDocument.correlative}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildDocumentHTML();
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
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Error al generar la imagen');
      }
    },
    async buildDocumentHTML() {
      // Obtener logo desde la base de datos
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

      const docTitle = this.selectedDocumentType;
      const docColor = '#28a745'; // Verde para todos los documentos de compras

      // Construir filas de la tabla y calcular totales
      let tableRows = '';
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      if (this.selectedDocument.items && this.selectedDocument.items.length > 0) {
        this.selectedDocument.items.forEach((item, index) => {
          const qty = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.unit_price) || 0;
          const discount = parseFloat(item.discount) || 0;
          const tax = parseFloat(item.tax) || 0;

          // Calcular subtotal del item
          const itemSubtotal = qty * price;

          // Acumular totales
          subtotal += itemSubtotal;
          totalDiscount += discount;
          totalTax += tax;

          // Total del item
          const itemTotal = item.total || (itemSubtotal - discount + tax);
          const unitText = item.product_unit || item.unit || 'UNIDAD';

          tableRows += `
            <tr>
              <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${String(index + 1).padStart(2, '0')}</td>
              <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.product_code || 'N/A'}</td>
              <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.product_name} <span style="font-weight: 600;">${unitText}</span></td>
              <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${this.formatCurrency(qty)}</td>
              <td style="padding: 6px; text-align: right; border-bottom: 1px solid #e0e0e0; font-size: 10px;">L ${this.formatCurrency(price)}</td>
              <td style="padding: 6px; text-align: right; border-bottom: 1px solid #e0e0e0; font-weight: 600; font-size: 10px;">L ${this.formatCurrency(itemTotal)}</td>
            </tr>
          `;
        });
      }

      // Usar valores del documento si existen, sino usar los calculados
      const finalTotal = this.selectedDocument.total || this.selectedDocument.total_amount || 0;
      const finalSubtotal = this.selectedDocument.subtotal || subtotal;
      const finalDiscount = this.selectedDocument.discount || totalDiscount;
      const finalSurcharge = this.selectedDocument.surcharge || 0;
      const finalTax = this.selectedDocument.tax || totalTax;

      // El monto gravado es el subtotal menos descuentos (antes de impuestos)
      const taxableAmount = finalSubtotal - finalDiscount;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${docTitle} - ${this.selectedDocument.document_number || this.selectedDocument.correlative}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #000;
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
              font-size: 11px;
              font-weight: 700;
              color: #000;
              margin-bottom: 6px;
              line-height: 1.5;
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
              border-radius: 8px;
              min-width: 280px;
            }
            .invoice-title {
              font-size: 22px;
              font-weight: 700;
              margin-bottom: 10px;
              letter-spacing: 0.5px;
            }
            .invoice-info {
              font-size: 11px;
              line-height: 1.6;
            }
            .client-info {
              background: #f8f9fa;
              padding: 18px;
              border-left: 4px solid ${docColor};
              margin-bottom: 25px;
              font-size: 12px;
              line-height: 1.8;
            }
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
              font-size: 11px;
            }
            .products-table thead {
              background: ${docColor};
              color: white;
            }
            .products-table th {
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .products-table td {
              padding: 8px;
              border-bottom: 1px solid #e0e0e0;
            }
            .totals-section {
              display: flex;
              justify-content: space-between;
              margin-top: 25px;
            }
            .totals-left {
              flex: 1;
              padding-right: 30px;
            }
            .totals-box {
              background: #f8f9fa;
              border: 2px solid ${docColor};
              border-radius: 8px;
              padding: 15px;
              min-width: 320px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 11px;
            }
            .grand-total {
              margin-top: 8px;
              padding-top: 8px;
              border-top: 2px solid ${docColor};
              font-size: 13px;
              background: ${docColor};
              color: white;
              margin: 8px -15px -15px -15px;
              padding: 12px 15px;
              border-radius: 0 0 6px 6px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #dee2e6;
              text-align: center;
            }
            /* Forzar texto negro en todos los elementos */
            body, p, div, span, td, th, strong, b, label {
              color: #000 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* Excepciones: texto blanco en boxes de color */
            .invoice-header, .invoice-header *,
            .invoice-title, .invoice-title *,
            .invoice-info, .invoice-info *,
            .grand-total, .grand-total *,
            .products-table thead, .products-table thead * {
              color: white !important;
            }
            @media print {
              body { padding: 0; color: #000 !important; }
              @page { size: letter; margin: 15mm; }
              .invoice-container { padding: 20px; }
              * { color: #000 !important; }
              /* Excepciones en impresión */
              .invoice-header, .invoice-header *,
              .invoice-title, .invoice-title *,
              .invoice-info, .invoice-info *,
              .grand-total, .grand-total *,
              .products-table thead, .products-table thead * {
                color: white !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-logo">
                ${hasLogo ? `<img src="${logoUrl}" alt="Logo" style="max-width: 180px; height: auto; margin-bottom: 15px;">` : ''}
                <div class="company-name">${this.companyInfo.commercial_name || this.companyInfo.company_name || 'EMPRESA'}</div>
                <div class="company-details">
                  <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                  <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'}<br>
                  <strong>Tel:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'}${this.companyInfo.whatsapp ? ` | <strong>Móvil:</strong> ${this.companyInfo.whatsapp}` : ''}<br>
                  <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}
                </div>
              </div>
              <div class="invoice-header">
                <div class="invoice-title">${docTitle}</div>
                <div class="invoice-info">
                  <strong>#Control Interno:</strong> ${this.selectedDocument.correlative || this.selectedDocument.purchase_number || this.selectedDocument.credit_note_number || 'N/A'}<br>
                  ${this.selectedDocumentType === 'COMPRA' && this.selectedDocument.invoice_number ? `<strong>Factura Proveedor:</strong> ${this.selectedDocument.invoice_number}<br>` : ''}
                  ${this.selectedDocumentType === 'DEVOLUCION COMPRA' ? `<strong>Doc/Devuelto:</strong> ${this.selectedDocument.purchase_number || 'N/A'}<br>` : ''}
                  ${this.selectedDocumentType === 'NOTA CREDITO COMPRA' ? `<strong>Nota de Crédito:</strong> ${this.selectedDocument.credit_note_number || 'N/A'}<br><strong>Compra Original:</strong> ${this.selectedDocument.purchase_number || 'N/A'}<br>` : ''}
                  <strong>Emisión:</strong> ${this.formatPurchaseDate(this.selectedDocument.emission_date || this.selectedDocument.purchase_date || this.selectedDocument.credit_note_date)}<br>
                  <strong>Condiciones de la Transacción:</strong> Contado<br>
                  <strong>Entrega:</strong> ${this.formatPurchaseDate(this.selectedDocument.emission_date || this.selectedDocument.purchase_date || this.selectedDocument.credit_note_date)}
                </div>
              </div>
            </div>
            <div class="client-info">
              <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1;">
                  <strong>Proveedor:</strong> ${this.selectedDocument.supplier_name || 'N/A'}<br>
                  <strong>RTN:</strong> ${this.selectedDocument.supplier_rtn || '00000000000000'}
                </div>
              </div>
            </div>
            ${tableRows ? `
            <table class="products-table">
              <thead>
                <tr>
                  <th>NO.</th>
                  <th>CÓDIGO</th>
                  <th>DESCRIPCIÓN</th>
                  <th>CANTIDAD</th>
                  <th>PRECIO</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            ` : ''}
            <div class="totals-section">
              <div class="totals-left">
                <div style="margin-bottom: 15px;">
                  <strong>TOTAL:</strong> ${this.numberToWords(finalTotal).toUpperCase()} LEMPIRAS ${String(Math.round((finalTotal % 1) * 100)).padStart(2, '0')}/100
                </div>
                <div style="margin-top: auto; padding-top: 40px; text-align: center;">
                  <div style="border-top: 2px solid #000; width: 250px; margin: 0 auto 10px;"></div>
                  <div style="margin-bottom: 8px;"><strong>Original Proveedor</strong></div>
                  <div><strong>Copia Obligado Tributario Emisor</strong></div>
                </div>
                ${this.selectedDocument.notes ? `
                <div style="margin-top: 30px; text-align: left; font-size: 12px;">
                  <strong>Notas:</strong> ${this.selectedDocument.notes}
                </div>
                ` : ''}
              </div>
              <div class="totals-box">
                <div class="total-row">
                  <span class="label">Importe Exonerado:</span>
                  <span class="value">L ${this.formatCurrency(this.selectedDocument.exempt_amount || 0)}</span>
                </div>
                <div class="total-row">
                  <span class="label">Importe Exento:</span>
                  <span class="value">L ${this.formatCurrency(this.selectedDocument.tax_exempt_amount || 0)}</span>
                </div>
                <div class="total-row">
                  <span class="label">Gravado 15%</span>
                  <span class="value">L ${this.formatCurrency(taxableAmount)}</span>
                </div>
                <div class="total-row">
                  <span class="label">Gravado 18%</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row">
                  <span class="label">I.S.V 15 15%:</span>
                  <span class="value">L ${this.formatCurrency(finalTax)}</span>
                </div>
                <div class="total-row">
                  <span class="label">I.S.V 18 18%:</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row">
                  <span class="label">RECARGOS:</span>
                  <span class="value">L ${this.formatCurrency(finalSurcharge)}</span>
                </div>
                <div class="total-row">
                  <span class="label">DESCUENTOS Y REBAJAS OTORGADOS:</span>
                  <span class="value">L ${this.formatCurrency(finalDiscount)}</span>
                </div>
                <div class="total-row grand-total">
                  <span class="label"><strong>TOTAL:</strong></span>
                  <span class="value"><strong>L ${this.formatCurrency(finalTotal)}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      return html;
    },
    formatCurrency(value) {
      const num = parseFloat(value) || 0;
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    },
    formatPurchaseDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      // Sumar 1 día para facturas de compra
      if (this.selectedDocumentType === 'COMPRA') {
        date.setDate(date.getDate() + 1);
      }
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    },
    getStatusLabel(status) {
      const labelMap = {
        'paid': 'COBRADO',
        'pending': 'PENDIENTE',
        'partial': 'PARCIAL',
        'overdue': 'VENCIDO',
        'cancelled': 'CANCELADO',
        'returned': 'DEVUELTO',
        'approved': 'APROBADO',
        'rejected': 'RECHAZADO',
        'active': 'Activa',
        'Completada': 'Completada'
      };
      return labelMap[status] || status?.toUpperCase() || 'N/A';
    },
    getStatusBadgeClass(status) {
      const classMap = {
        'paid': 'bg-success',
        'pending': 'bg-warning',
        'active': 'bg-info',
        'cancelled': 'bg-danger',
        'Completada': 'bg-success'
      };
      return classMap[status] || 'bg-secondary';
    },
    sortTable(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
      this.applySorting();
    },
    getSortIcon(column) {
      if (this.sortColumn !== column) return 'ti-selector';
      return this.sortDirection === 'asc' ? 'ti-arrow-up' : 'ti-arrow-down';
    },
    applySorting() {
      this.documents.sort((a, b) => {
        let aVal = a[this.sortColumn];
        let bVal = b[this.sortColumn];

        if (this.sortColumn === 'total') {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        }

        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    },
    numberToWords(num) {
      const units = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
      const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
      const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
      const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

      const integer = Math.floor(num);

      if (integer === 0) return 'CERO';
      if (integer < 10) return units[integer];
      if (integer < 20) return teens[integer - 10];
      if (integer < 100) {
        const ten = Math.floor(integer / 10);
        const unit = integer % 10;
        return tens[ten] + (unit ? ' Y ' + units[unit] : '');
      }
      if (integer < 1000) {
        const hundred = Math.floor(integer / 100);
        const remainder = integer % 100;
        let result = integer === 100 ? 'CIEN' : hundreds[hundred];
        if (remainder > 0) {
          if (remainder < 10) result += ' ' + units[remainder];
          else if (remainder < 20) result += ' ' + teens[remainder - 10];
          else {
            const ten = Math.floor(remainder / 10);
            const unit = remainder % 10;
            result += ' ' + tens[ten] + (unit ? ' Y ' + units[unit] : '');
          }
        }
        return result;
      }
      if (integer < 1000000) {
        const thousands = Math.floor(integer / 1000);
        const remainder = integer % 1000;
        let result = thousands === 1 ? 'MIL' : this.numberToWords(thousands) + ' MIL';
        if (remainder > 0) {
          result += ' ' + this.numberToWords(remainder);
        }
        return result;
      }
      if (integer < 1000000000) {
        const millions = Math.floor(integer / 1000000);
        const remainder = integer % 1000000;
        let result = millions === 1 ? 'UN MILLÓN' : this.numberToWords(millions) + ' MILLONES';
        if (remainder > 0) {
          result += ' ' + this.numberToWords(remainder);
        }
        return result;
      }

      return integer.toString();
    }
  }
};
</script>

<style scoped>
.hover-row:hover {
  background-color: #f0f8ff;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

.document-preview {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.document-preview::-webkit-scrollbar {
  width: 8px;
}

.document-preview::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.document-preview::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.document-preview::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
