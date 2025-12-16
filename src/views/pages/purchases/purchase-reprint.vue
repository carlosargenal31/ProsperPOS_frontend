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
                  <strong style="font-size: 13px;">{{ companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;">{{ companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.telefono || 'N/A' }}</small>
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
                      <td style="padding: 4px;">{{ item.product_name }}</td>
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
                <!-- Header con Logo y Datos de la Empresa -->
                <div class="row mb-2">
                  <div class="col-6">
                    <div style="font-size: 11px;">
                      <strong style="font-size: 13px; color: #0056b3;">{{ companyInfo.company_name || 'EMPRESA' }}</strong><br>
                      <strong style="font-size: 10px;">{{ companyInfo.business_line || 'Comercio en general' }}</strong><br>
                      <strong>RTN:</strong> {{ companyInfo.rtn || '00000000000000' }}<br>
                      <strong>Dirección:</strong> {{ companyInfo.direccion || 'Sin dirección' }}<br>
                      <strong>Teléfono:</strong> {{ companyInfo.telefono || 'N/A' }}<br>
                      <strong>Email:</strong> {{ companyInfo.email || 'info@empresa.com' }}
                    </div>
                  </div>
                  <div class="col-6 text-end">
                    <div style="background-color: #ff8c00; color: white; padding: 8px; border-radius: 4px; font-size: 11px;">
                      <strong style="font-size: 14px;">DEVOLUCIÓN: {{ selectedDocument.correlative }}</strong><br>
                      <span style="font-size: 9px;">
                        #Control Interno: {{ selectedDocument.correlative }}<br>
                        Doc/Devuelto: {{ selectedDocument.purchase_number }}<br>
                        Proveedor: {{ selectedDocument.supplier_name }}<br>
                        Emisión: {{ formatDate(selectedDocument.emission_date) }}<br>
                        Condiciones de la Transacción: Contado<br>
                        Entrega: {{ formatDate(selectedDocument.emission_date) }}
                      </span>
                    </div>
                  </div>
                </div>

                <hr style="border-top: 2px solid #ff8c00; margin: 8px 0;">

                <!-- Información del Proveedor -->
                <div class="mb-2" style="font-size: 10px;">
                  <strong>Proveedor:</strong> {{ selectedDocument.supplier_name }}<br>
                  <strong>RTN:</strong> {{ selectedDocument.supplier_rtn || '00000000000000' }}
                </div>

                <!-- Tabla de Detalles de Devolución -->
                <table class="table table-sm table-bordered mb-2" style="font-size: 9px;">
                  <thead style="background-color: #ff8c00; color: white;">
                    <tr>
                      <th style="padding: 4px;">MOTIVO</th>
                      <th style="padding: 4px;">OBSERVACIONES</th>
                      <th class="text-end" style="padding: 4px;">MONTO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding: 4px;">{{ selectedDocument.reason || 'Devolución de mercadería' }}</td>
                      <td style="padding: 4px;">{{ selectedDocument.notes || 'N/A' }}</td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(selectedDocument.total) }}</td>
                    </tr>
                  </tbody>
                </table>

                <!-- Sección de Totales -->
                <div class="row" style="font-size: 10px;">
                  <div class="col-7">
                    <div class="border p-2" style="background-color: #f8f9fa;">
                      <strong>TOTAL:</strong> {{ numberToWords(selectedDocument.total) }} LEMPIRAS CON {{ String(Math.floor((selectedDocument.total % 1) * 100)).padStart(2, '0') }}/100
                    </div>
                    <div class="text-center mt-2 pt-3" style="border-top: 1px solid #000;">
                      <strong style="font-size: 9px;">Original Proveedor<br>Copia Obligado Tributario Emisor</strong>
                    </div>
                    <div class="mt-2" style="font-size: 9px;">
                      <strong>Notas:</strong> {{ selectedDocument.notes || 'N/A' }}
                    </div>
                  </div>
                  <div class="col-5">
                    <table class="table table-sm table-bordered mb-0" style="font-size: 9px;">
                      <tr>
                        <td style="padding: 3px; background-color: #f8f9fa;"><strong>Importe Exonerado:</strong></td>
                        <td class="text-end" style="padding: 3px;">L 0.00</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px; background-color: #f8f9fa;"><strong>Importe Exento:</strong></td>
                        <td class="text-end" style="padding: 3px;">L 0.00</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px; background-color: #f8f9fa;"><strong>Gravado 15%:</strong></td>
                        <td class="text-end" style="padding: 3px;">L {{ formatCurrency(selectedDocument.subtotal_15 || 0) }}</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px; background-color: #f8f9fa;"><strong>Gravado 18%:</strong></td>
                        <td class="text-end" style="padding: 3px;">L 0.00</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px; background-color: #f8f9fa;"><strong>I.S.V 15%:</strong></td>
                        <td class="text-end" style="padding: 3px;">L {{ formatCurrency(selectedDocument.tax || 0) }}</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px; background-color: #f8f9fa;"><strong>I.S.V 18%:</strong></td>
                        <td class="text-end" style="padding: 3px;">L 0.00</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px; background-color: #f8f9fa;"><strong>RECARGOS:</strong></td>
                        <td class="text-end" style="padding: 3px;">L 0.00</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px; background-color: #f8f9fa;"><strong>DESCUENTOS Y REBAJAS:</strong></td>
                        <td class="text-end" style="padding: 3px;">L 0.00</td>
                      </tr>
                      <tr style="background-color: #ff8c00; color: white;">
                        <td style="padding: 4px;"><strong>TOTAL:</strong></td>
                        <td class="text-end" style="padding: 4px;"><strong>L {{ formatCurrency(selectedDocument.total) }}</strong></td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>

              <!-- NOTA CREDITO COMPRA -->
              <div v-else-if="selectedDocumentType === 'NOTA CREDITO COMPRA'" id="purchaseCreditNoteContent">
                <div class="text-center mb-2">
                  <strong style="font-size: 13px;">{{ companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;">{{ companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.telefono || 'N/A' }}</small>
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
import { LOGO_BASE64 } from '@/assets/img/logo.js';

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
        this.companyInfo = {
          company_name: 'ProsperPOS',
          direccion: 'Honduras',
          telefono: 'N/A',
          rtn: 'N/A'
        };
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
        const response = await axios.get(`/api/v1/purchase-reprint/${this.selectedDocumentType}/${doc.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.selectedDocument = response.data.data;
          this.showDocumentModal = true;
        }
      } catch (error) {
        console.error('Error loading document details:', error);
        alert('Error al cargar los detalles del documento');
      }
    },
    closeDocumentModal() {
      this.showDocumentModal = false;
      this.showExportDropdown = false;
      this.selectedDocument = null;
    },
    printDocument() {
      const printWindow = window.open('', '_blank');
      const html = this.buildDocumentHTML();
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
          data.push([
            item.product_name,
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

        const htmlContent = this.buildDocumentHTML();
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

        const htmlContent = this.buildDocumentHTML();
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
    buildDocumentHTML() {
      const docTitle = this.selectedDocumentType;

      // HTML específico para DEVOLUCIÓN DE COMPRA
      if (this.selectedDocumentType === 'DEVOLUCION COMPRA') {
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>DEVOLUCIÓN DE COMPRA - ${this.selectedDocument.correlative}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: Arial, sans-serif;
                color: #000;
                background: #fff;
                padding: 20px;
                font-size: 12px;
              }
              .doc-container {
                max-width: 850px;
                margin: 0 auto;
                background: white;
                padding: 15px;
              }
              .orange-box {
                background-color: #ff8c00;
                color: white;
                padding: 10px;
                border-radius: 5px;
              }
              .table-bordered td, .table-bordered th {
                border: 1px solid #dee2e6;
              }
              @media print {
                body { padding: 10px; }
                @page { size: letter; margin: 10mm; }
              }
            </style>
          </head>
          <body>
            <div class="doc-container">
              <!-- Header -->
              <div class="row mb-3">
                <div class="col-6">
                  <div style="font-size: 11px;">
                    <strong style="font-size: 14px; color: #0056b3;">${this.companyInfo.company_name || 'EMPRESA'}</strong><br>
                    <strong style="font-size: 10px;">${this.companyInfo.business_line || 'Comercio en general'}</strong><br>
                    <strong>RTN:</strong> ${this.companyInfo.rtn || '00000000000000'}<br>
                    <strong>Dirección:</strong> ${this.companyInfo.direccion || 'Sin dirección'}<br>
                    <strong>Teléfono:</strong> ${this.companyInfo.telefono || 'N/A'}<br>
                    <strong>Email:</strong> ${this.companyInfo.email || 'info@empresa.com'}
                  </div>
                </div>
                <div class="col-6 text-end">
                  <div class="orange-box" style="font-size: 11px;">
                    <strong style="font-size: 15px;">DEVOLUCIÓN: ${this.selectedDocument.correlative}</strong><br>
                    <span style="font-size: 9px;">
                      #Control Interno: ${this.selectedDocument.correlative}<br>
                      Doc/Devuelto: ${this.selectedDocument.purchase_number}<br>
                      Proveedor: ${this.selectedDocument.supplier_name}<br>
                      Emisión: ${this.formatDate(this.selectedDocument.emission_date)}<br>
                      Condiciones de la Transacción: Contado<br>
                      Entrega: ${this.formatDate(this.selectedDocument.emission_date)}
                    </span>
                  </div>
                </div>
              </div>

              <hr style="border-top: 2px solid #ff8c00; margin: 10px 0;">

              <!-- Proveedor -->
              <div class="mb-2" style="font-size: 11px;">
                <strong>Proveedor:</strong> ${this.selectedDocument.supplier_name}<br>
                <strong>RTN:</strong> ${this.selectedDocument.supplier_rtn || '00000000000000'}
              </div>

              <!-- Tabla de Detalles -->
              <table class="table table-sm table-bordered mb-2" style="font-size: 10px;">
                <thead style="background-color: #ff8c00; color: white;">
                  <tr>
                    <th style="padding: 5px;">MOTIVO</th>
                    <th style="padding: 5px;">OBSERVACIONES</th>
                    <th class="text-end" style="padding: 5px;">MONTO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 5px;">${this.selectedDocument.reason || 'Devolución de mercadería'}</td>
                    <td style="padding: 5px;">${this.selectedDocument.notes || 'N/A'}</td>
                    <td class="text-end" style="padding: 5px;">L ${this.formatCurrency(this.selectedDocument.total)}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Totales -->
              <div class="row" style="font-size: 10px;">
                <div class="col-7">
                  <div class="border p-2" style="background-color: #f8f9fa;">
                    <strong>TOTAL:</strong> ${this.numberToWords(this.selectedDocument.total)} LEMPIRAS CON ${String(Math.floor((this.selectedDocument.total % 1) * 100)).padStart(2, '0')}/100
                  </div>
                  <div class="text-center mt-2 pt-3" style="border-top: 1px solid #000;">
                    <strong style="font-size: 9px;">Original Proveedor<br>Copia Obligado Tributario Emisor</strong>
                  </div>
                  <div class="mt-2" style="font-size: 9px;">
                    <strong>Notas:</strong> ${this.selectedDocument.notes || 'N/A'}
                  </div>
                </div>
                <div class="col-5">
                  <table class="table table-sm table-bordered mb-0" style="font-size: 9px;">
                    <tr>
                      <td style="padding: 3px; background-color: #f8f9fa;"><strong>Importe Exonerado:</strong></td>
                      <td class="text-end" style="padding: 3px;">L 0.00</td>
                    </tr>
                    <tr>
                      <td style="padding: 3px; background-color: #f8f9fa;"><strong>Importe Exento:</strong></td>
                      <td class="text-end" style="padding: 3px;">L 0.00</td>
                    </tr>
                    <tr>
                      <td style="padding: 3px; background-color: #f8f9fa;"><strong>Gravado 15%:</strong></td>
                      <td class="text-end" style="padding: 3px;">L ${this.formatCurrency(this.selectedDocument.subtotal_15 || 0)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 3px; background-color: #f8f9fa;"><strong>Gravado 18%:</strong></td>
                      <td class="text-end" style="padding: 3px;">L 0.00</td>
                    </tr>
                    <tr>
                      <td style="padding: 3px; background-color: #f8f9fa;"><strong>I.S.V 15%:</strong></td>
                      <td class="text-end" style="padding: 3px;">L ${this.formatCurrency(this.selectedDocument.tax || 0)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 3px; background-color: #f8f9fa;"><strong>I.S.V 18%:</strong></td>
                      <td class="text-end" style="padding: 3px;">L 0.00</td>
                    </tr>
                    <tr>
                      <td style="padding: 3px; background-color: #f8f9fa;"><strong>RECARGOS:</strong></td>
                      <td class="text-end" style="padding: 3px;">L 0.00</td>
                    </tr>
                    <tr>
                      <td style="padding: 3px; background-color: #f8f9fa;"><strong>DESCUENTOS Y REBAJAS:</strong></td>
                      <td class="text-end" style="padding: 3px;">L 0.00</td>
                    </tr>
                    <tr style="background-color: #ff8c00; color: white;">
                      <td style="padding: 5px;"><strong>TOTAL:</strong></td>
                      <td class="text-end" style="padding: 5px;"><strong>L ${this.formatCurrency(this.selectedDocument.total)}</strong></td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;
      }

      // HTML para otros tipos de documentos (COMPRA, NOTA CREDITO)
      let tableRows = '';
      let total = 0;

      if (this.selectedDocument.items && this.selectedDocument.items.length > 0) {
        this.selectedDocument.items.forEach((item) => {
          const qty = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.unit_price) || 0;
          const itemTotal = item.total || (qty * price);
          total += itemTotal;

          tableRows += `
            <tr>
              <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(qty)}</td>
              <td style="padding: 3px; font-size: 13px; line-height: 1.3;">${item.product_name}</td>
              <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(price)}</td>
              <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(itemTotal)}</td>
            </tr>
          `;
        });
      }

      const finalTotal = this.selectedDocument.total || this.selectedDocument.total_amount || total;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${docTitle} - ${this.selectedDocument.document_number || this.selectedDocument.correlative}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              color: #000;
              background: #fff;
              padding: 0;
              margin: 0;
              font-size: 14px;
            }
            .invoice-container {
              max-width: 80mm;
              margin: 0 auto;
              background: white;
              padding: 12px 18px;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            .company-logo img {
              max-width: 120px;
              height: auto;
            }
            .company-name {
              font-size: 13px;
              font-weight: 700;
              color: #000;
              margin: 5px 0;
            }
            .doc-title {
              font-size: 17px;
              font-weight: 700;
              text-align: center;
              margin: 10px 0;
              color: #000;
            }
            .info-section {
              font-size: 12px;
              line-height: 1.4;
              margin: 10px 0;
            }
            .products-table {
              width: 100%;
              margin: 10px 0;
              border-collapse: collapse;
            }
            .products-table th {
              padding: 5px;
              text-align: left;
              font-size: 12px;
              border-bottom: 1px solid #000;
            }
            .products-table td {
              padding: 5px;
              font-size: 12px;
            }
            .totals-section {
              margin-top: 10px;
              text-align: right;
              font-size: 14px;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; padding: 0; }
              @page { size: 80mm auto; margin: 2mm; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-logo">
                <img src="${LOGO_BASE64}" alt="Logo">
              </div>
              <div class="company-name">${this.companyInfo.company_name || 'EMPRESA'}</div>
              <div style="font-size: 11px;">
                ${this.companyInfo.direccion || 'Sin dirección'}<br>
                Tel: ${this.companyInfo.telefono || 'N/A'}
              </div>
            </div>

            <div class="doc-title">${docTitle}</div>

            <div class="info-section">
              <strong>Documento:</strong> ${this.selectedDocument.invoice_number || this.selectedDocument.purchase_number || this.selectedDocument.correlative || 'N/A'}<br>
              <strong>Proveedor:</strong> ${this.selectedDocument.supplier_name || 'N/A'}<br>
              <strong>RTN:</strong> ${this.selectedDocument.supplier_rtn || '00000000000000'}<br>
              <strong>Fecha:</strong> ${this.formatDate(this.selectedDocument.purchase_date || this.selectedDocument.emission_date)}
            </div>

            ${tableRows ? `
            <table class="products-table">
              <thead>
                <tr>
                  <th style="width: 35px;">Cant</th>
                  <th>Producto</th>
                  <th style="width: 60px; text-align: right;">P/Unit</th>
                  <th style="width: 65px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            ` : ''}

            <div class="totals-section">
              TOTAL: L ${this.formatCurrency(finalTotal)}
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
