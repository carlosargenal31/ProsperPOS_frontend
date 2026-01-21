<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Reimpresiones</h4>
            <h6>Reimprimir documentos del sistema</h6>
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
                  <th @click="sortTable('expiry_date')" style="cursor: pointer;">
                    Vence <i class="ti" :class="getSortIcon('expiry_date')"></i>
                  </th>
                  <th @click="sortTable('document_number')" style="cursor: pointer;">
                    Documento <i class="ti" :class="getSortIcon('document_number')"></i>
                  </th>
                  <th @click="sortTable('customer_name')" style="cursor: pointer;">
                    Cliente <i class="ti" :class="getSortIcon('customer_name')"></i>
                  </th>
                  <th @click="sortTable('seller_name')" style="cursor: pointer;">
                    {{ selectedDocumentType === 'DEVOLUCION' || selectedDocumentType === 'NOTA DE CREDITO' || selectedDocumentType === 'GUIA DE REMISION' ? 'Usuario' : 'Vendedor' }} <i class="ti" :class="getSortIcon('seller_name')"></i>
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
                    <span :class="getDueDateClass(doc.issue_date, selectedDocumentType)">
                      {{ formatDueDate(doc.issue_date, selectedDocumentType) }}
                    </span>
                  </td>
                  <td>
                    <a href="#" class="text-primary" @click.prevent="selectDocument(doc)">
                      {{ doc.document_number || doc.full_number }}
                    </a>
                  </td>
                  <td>{{ doc.customer_name }}</td>
                  <td>{{ doc.seller_name || doc.created_by_name || 'N/A' }}</td>
                  <td class="text-end">{{ formatCurrency(doc.total) }}</td>
                  <td>
                    <span class="badge" :class="getStatusBadgeClass(doc.payment_status || doc.status)">{{ getStatusLabel(doc.payment_status || doc.status) }}</span>
                  </td>
                </tr>
                <tr v-if="documents.length === 0">
                  <td colspan="7" class="text-center text-muted">No hay documentos encontrados</td>
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
          <!-- Preview del documento -->
          <div ref="documentContent" class="border p-2 bg-white document-preview" style="max-height: 450px; overflow-y: auto;">
            <!-- Document content will be rendered here based on document type -->
            <div v-if="selectedDocument">
              <!-- NOTA DE CRÉDITO -->
              <div v-if="selectedDocumentType === 'NOTA DE CREDITO'" id="creditNoteContent">
                <div class="text-center mb-2">
                  <strong style="font-size: 13px;">{{ companyInfo.commercial_name || companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;"><strong>RTN:</strong> {{ companyInfo.rtn || 'N/A' }}</small><br>
                  <small style="font-size: 10px;">{{ companyInfo.address || companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.phone || companyInfo.telefono || 'N/A' }}</small>
                </div>

                <h6 class="text-danger text-center mb-2" style="font-size: 14px;">NOTA DE CRÉDITO</h6>

                <!-- Información de Resolución -->
                <div class="d-flex justify-content-around border p-1 mb-1" style="font-size: 10px;" v-if="selectedDocument.cai">
                  <span><strong>Autorización:</strong> {{ selectedDocument.cai || selectedDocument.numero_resolucion || 'N/A' }}</span>
                  <span><strong>Rango:</strong> {{ selectedDocument.nro_inicial_control || '' }} - {{ selectedDocument.nro_final_control || '' }}</span>
                </div>

                <!-- Información del Documento -->
                <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
                  <span><strong>Documento:</strong> {{ selectedDocument.credit_note_number || selectedDocument.document_number || selectedDocument.correlative || 'N/A' }}</span>
                  <span><strong>Factura Original:</strong> {{ selectedDocument.invoice_number || 'N/A' }}</span>
                  <span><strong>Fecha:</strong> {{ formatDate(selectedDocument.emission_date || selectedDocument.issue_date) }}</span>
                </div>

                <div class="mb-2" style="font-size: 10px;">
                  <strong>Cliente:</strong> {{ selectedDocument.customer_name }}<br>
                  <strong>RTN Cliente:</strong> {{ selectedDocument.customer_rtn || '00000000000000' }}
                </div>

                <!-- Tabla de Productos -->
                <table class="table table-sm table-bordered mb-2" style="font-size: 10px;">
                  <thead class="table-light">
                    <tr>
                      <th style="padding: 4px;">Código</th>
                      <th style="padding: 4px;">Producto</th>
                      <th class="text-end" style="padding: 4px;">Cant.</th>
                      <th class="text-end" style="padding: 4px;">Precio Unit.</th>
                      <th class="text-end" style="padding: 4px;">Desc %</th>
                      <th class="text-end" style="padding: 4px;">ISV %</th>
                      <th class="text-end" style="padding: 4px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selectedDocument.items" :key="item.id">
                      <td style="padding: 4px;">{{ item.product_code || 'N/A' }}</td>
                      <td style="padding: 4px;">{{ item.product_name }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.quantity) }}</td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(item.unit_price) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.discount_value || 0) }}%</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.tax_rate || 0) }}%</td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(item.total || calculateItemTotal(item)) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="6" class="text-end" style="padding: 4px;"><strong>SUBTOTAL:</strong></td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(selectedDocument.subtotal) }}</td>
                    </tr>
                    <tr>
                      <td colspan="6" class="text-end" style="padding: 4px;"><strong>DESCUENTO:</strong></td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(selectedDocument.discount) }}</td>
                    </tr>
                    <tr>
                      <td colspan="6" class="text-end" style="padding: 4px;"><strong>ISV 15%:</strong></td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(selectedDocument.tax) }}</td>
                    </tr>
                    <tr class="table-active">
                      <td colspan="6" class="text-end" style="padding: 4px;"><strong>TOTAL:</strong></td>
                      <td class="text-end" style="padding: 4px;"><strong>L {{ formatCurrency(selectedDocument.total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>

                <div v-if="selectedDocument.notes" class="mb-1" style="font-size: 10px;">
                  <strong>Notas:</strong> {{ selectedDocument.notes }}
                </div>

                <div class="text-center mb-0" style="font-size: 9px;">
                  <p class="mb-0">Original: Cliente | Copia: Archivo</p>
                </div>
              </div>

              <!-- DEVOLUCIÓN -->
              <div v-else-if="selectedDocumentType === 'DEVOLUCION'" id="returnContent">
                <div class="text-center mb-2">
                  <strong style="font-size: 13px;">{{ companyInfo.commercial_name || companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;"><strong>RTN:</strong> {{ companyInfo.rtn || 'N/A' }}</small><br>
                  <small style="font-size: 10px;">{{ companyInfo.address || companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.phone || companyInfo.telefono || 'N/A' }}</small>
                </div>

                <h6 class="text-primary text-center mb-2" style="font-size: 14px;">DEVOLUCIÓN</h6>

                <!-- Información del Documento -->
                <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
                  <span><strong>Documento:</strong> {{ selectedDocument.document_number || selectedDocument.correlative }}</span>
                  <span><strong>Doc/Devuelto:</strong> {{ selectedDocument.invoice_number || 'N/A' }}</span>
                  <span><strong>Fecha:</strong> {{ formatDate(selectedDocument.emission_date || selectedDocument.issue_date) }}</span>
                </div>

                <div class="mb-2" style="font-size: 10px;">
                  <strong>Cliente:</strong> {{ selectedDocument.customer_name }}<br>
                  <strong>RTN:</strong> {{ selectedDocument.customer_rtn || '00000000000000' }}<br>
                  <strong>Condiciones:</strong> Contado | <strong>Entrega:</strong> {{ formatDate(selectedDocument.emission_date) }}
                </div>

                <!-- Tabla de Productos -->
                <table class="table table-sm table-bordered mb-2" style="font-size: 10px;">
                  <thead class="table-light">
                    <tr>
                      <th style="padding: 4px;">Código</th>
                      <th style="padding: 4px;">Nombre</th>
                      <th class="text-end" style="padding: 4px;">Precio Unit.</th>
                      <th class="text-end" style="padding: 4px;">Cant.</th>
                      <th class="text-end" style="padding: 4px;">Dscto</th>
                      <th class="text-end" style="padding: 4px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selectedDocument.items" :key="item.id">
                      <td style="padding: 4px;">{{ item.product_code || 'N/A' }}</td>
                      <td style="padding: 4px;">{{ item.product_name }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.unit_price) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.quantity) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.discount_value || 0) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(calculateItemTotal(item)) }}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="mb-1" style="font-size: 10px;">
                  <strong>TOTAL:</strong> {{ numberToWords(selectedDocument.total) }} L {{ String(Math.floor((selectedDocument.total % 1) * 100)).padStart(2, '0') }}/100
                </div>

                <div class="text-center mb-1" style="font-size: 9px;">
                  <p class="mb-0">Original Cliente | Copia Obligado Tributario Emisor</p>
                </div>
              </div>

              <!-- FACTURA / COTIZACION / GUIA DE REMISION / FACT EN ESPERA -->
              <div v-else id="genericDocContent">
                <div class="text-center mb-2">
                  <strong style="font-size: 13px;">{{ companyInfo.commercial_name || companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;"><strong>RTN:</strong> {{ companyInfo.rtn || 'N/A' }}</small><br>
                  <small style="font-size: 10px;">{{ companyInfo.address || companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.phone || companyInfo.telefono || 'N/A' }}</small>
                </div>

                <h6 class="text-info text-center mb-2" style="font-size: 14px;">{{ selectedDocumentType }}</h6>

                <!-- Información del Documento -->
                <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
                  <span><strong>Documento:</strong> {{ selectedDocument.document_number || selectedDocument.full_number || selectedDocument.correlative || 'N/A' }}</span>
                  <span><strong>Fecha:</strong> {{ formatDate(selectedDocument.issue_date || selectedDocument.quote_date || selectedDocument.created_at) }}</span>
                </div>

                <div class="mb-2" style="font-size: 10px;">
                  <strong>Cliente:</strong> {{ selectedDocument.customer_name }}<br>
                  <strong>RTN:</strong> {{ selectedDocument.customer_rtn || '00000000000000' }}
                </div>

                <!-- Tabla de Productos -->
                <table class="table table-sm table-bordered mb-2" style="font-size: 10px;">
                  <thead class="table-light">
                    <tr>
                      <th style="padding: 4px;">Código</th>
                      <th style="padding: 4px;">Producto</th>
                      <th class="text-end" style="padding: 4px;">Cant.</th>
                      <th class="text-end" style="padding: 4px;">Precio</th>
                      <th class="text-end" style="padding: 4px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selectedDocument.items" :key="item.id">
                      <td style="padding: 4px;">{{ item.product_code || 'N/A' }}</td>
                      <td style="padding: 4px;">{{ item.product_name }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.quantity) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.unit_price || item.price) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.total || calculateItemTotal(item)) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="table-active">
                      <td colspan="4" class="text-end" style="padding: 4px;"><strong>TOTAL:</strong></td>
                      <td class="text-end" style="padding: 4px;"><strong>L {{ formatCurrency(selectedDocument.total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
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
import api from '@/utils/axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      showDocumentTypeModal: false,
      showDocumentModal: false,
      showExportDropdown: false,
      selectedBranch: '',
      selectedDocumentType: '',
      selectedDocument: null,
      showImported: false,
      searchQuery: '',
      sortColumn: 'issue_date',
      sortDirection: 'desc',
      filters: {
        date_from: this.getFirstDayOfMonth(),
        date_to: this.getTodayDate(),
        vendor: ''
      },
      documentTypes: [
        'COTIZACION',
        'DEVOLUCION',
        'FACT EN ESPERA',
        'FACTURA',
        'GUIA DE REMISION',
        'NOTA DE CREDITO'
      ],
      documents: [],
      branches: [],
      vendors: [],
      companyInfo: {},
      bankAccounts: []
    };
  },
  mounted() {
    this.loadCompanyInfo();
    this.loadBranches();
    this.loadVendors();
    this.loadBankAccounts();
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
    async loadVendors() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const users = response.data.data.data || response.data.data || [];
          const vendorUsers = users.filter(user => {
            if (user.roles && Array.isArray(user.roles)) {
              return user.roles.some(role =>
                role.name?.toLowerCase().includes('vendedor') ||
                role.name?.toLowerCase().includes('seller') ||
                role.name?.toLowerCase().includes('sales')
              );
            }
            if (user.role_name) {
              const roleName = user.role_name.toLowerCase();
              return roleName.includes('vendedor') ||
                     roleName.includes('seller') ||
                     roleName.includes('sales');
            }
            return false;
          });

          this.vendors = vendorUsers.map(u => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`
          }));
        }
      } catch (error) {
        console.error('Error loading vendors:', error);
      }
    },
    async loadBankAccounts() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/bank-accounts', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.bankAccounts = response.data.data.data || response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading bank accounts:', error);
        this.bankAccounts = [];
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
        const response = await axios.get('/api/v1/reprint/search', {
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
        const response = await axios.get(`/api/v1/reprint/${this.selectedDocumentType}/${doc.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.selectedDocument = response.data.data;
          // Asegurarse de tener las cuentas bancarias cargadas
          if (this.bankAccounts.length === 0) {
            await this.loadBankAccounts();
          }

          // Debug: Ver datos del documento
          console.log('=== DATOS DEL DOCUMENTO ===');
          console.log('Discount:', this.selectedDocument.discount);
          console.log('Total Discount:', this.selectedDocument.total_discount);
          console.log('Surcharges:', this.selectedDocument.surcharges);
          console.log('Surcharge:', this.selectedDocument.surcharge);
          console.log('Items:', this.selectedDocument.items);
          console.log('Orden Compra:', this.selectedDocument.orden_compra);
          console.log('Constancia Exonerado:', this.selectedDocument.constancia_exonerado);
          console.log('Registro SAG:', this.selectedDocument.registro_sag);
          console.log('===========================');

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
        ['Documento:', this.selectedDocument.document_number || this.selectedDocument.full_number],
        ['Cliente:', this.selectedDocument.customer_name],
        ['Fecha:', this.formatDate(this.selectedDocument.issue_date || this.selectedDocument.emission_date)],
        [''],
        ['Producto', 'Cantidad', 'Precio Unit.', 'Total']
      ];

      this.selectedDocument.items.forEach(item => {
        const unitText = item.product_unit || item.unit || 'UNIDAD';
        data.push([
          `${item.product_name} ${unitText}`,
          item.quantity,
          item.unit_price || item.price,
          item.total || this.calculateItemTotal(item)
        ]);
      });

      data.push(['']);
      data.push(['', '', 'TOTAL:', this.selectedDocument.total]);

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
      const docTitle = this.selectedDocumentType;

      // Si es GUIA DE REMISION, usar formato de comprobante de entrega
      if (docTitle === 'GUIA DE REMISION') {
        return await this.buildShippingGuideHTML();
      }

      // Si es COTIZACIÓN, DEVOLUCIÓN, NOTA DE CRÉDITO o FACT EN ESPERA, usar formato carta (como estado de cuenta)
      if (docTitle === 'COTIZACION' || docTitle === 'DEVOLUCION' || docTitle === 'NOTA DE CREDITO' || docTitle === 'FACT EN ESPERA') {
        return await this.buildLetterFormatHTML();
      }

      // Para FACTURA, usar formato de ticket (80mm)

      let tableRows = '';
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;
      let exemptAmount = 0;
      let taxableAmount = 0;

      this.selectedDocument.items.forEach((item, index) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price || item.price) || 0;
        const discountValue = parseFloat(item.discount_value) || 0;
        const taxRate = parseFloat(item.tax_rate) || 0;

        const itemSubtotal = qty * price;
        const itemDiscount = itemSubtotal * (discountValue / 100);
        const itemAfterDiscount = itemSubtotal - itemDiscount;

        // Si tiene impuesto, es gravado, sino es exento
        if (taxRate > 0) {
          taxableAmount += itemAfterDiscount;
          const itemTax = itemAfterDiscount * (taxRate / 100);
          totalTax += itemTax;
        } else {
          exemptAmount += itemAfterDiscount;
        }

        const itemTax = itemAfterDiscount * (taxRate / 100);
        const itemTotal = itemAfterDiscount + itemTax;

        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;

        const unitText = item.product_unit || item.unit || 'UNIDAD';
        tableRows += `
          <tr>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(qty)}</td>
            <td style="padding: 3px; font-size: 13px; line-height: 1.3;">${item.product_name} <span style="font-weight: 600;">${unitText}</span></td>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(price)}</td>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(itemTotal)}</td>
          </tr>
        `;
      });

      // Usar los descuentos y recargos del documento si existen, sino usar los calculados
      const documentDiscount = parseFloat(this.selectedDocument.discount || this.selectedDocument.total_discount) || 0;
      const documentSurcharges = parseFloat(this.selectedDocument.surcharges || this.selectedDocument.surcharge) || 0;

      // Si hay descuentos a nivel de documento, usarlos en lugar de los calculados
      const finalDiscount = documentDiscount > 0 ? documentDiscount : totalDiscount;
      const finalSurcharges = documentSurcharges;

      const grandTotal = subtotal - finalDiscount + totalTax + finalSurcharges;

      // Obtener logo desde la base de datos
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

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

            /* Encabezado */
            .header {
              text-align: center;
              margin-bottom: 2px;
            }

            .company-logo {
              margin-bottom: 8px;
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
              text-transform: uppercase;
              line-height: 1.3;
            }

            .company-details {
              font-size: 13px;
              color: #000;
              line-height: 1.2;
            }

            .doc-title {
              font-size: 17px;
              font-weight: 700;
              text-align: center;
              margin: 2px 0;
              padding: 2px;
              color: #000;
              text-transform: uppercase;
            }

            /* Info boxes */
            .info-section {
              font-size: 14px;
              line-height: 1.2;
              margin: 2px 0;
              padding: 0;
              text-align: center;
            }

            .info-section strong {
              font-weight: 700;
            }

            /* Tabla de productos */
            .products-table {
              width: 100%;
              margin: 2px 0;
              border-collapse: collapse;
              font-size: 13px;
            }

            .products-table thead {
              background: none;
            }

            .products-table thead th {
              padding: 5px 4px;
              text-align: left;
              font-size: 13px;
              font-weight: 700;
              color: #000;
              border: none;
            }

            .products-table tbody td {
              padding: 5px 4px;
              font-size: 13px;
              vertical-align: top;
              border: none;
            }

            /* Totales */
            .totals-section {
              margin-top: 8px;
              padding-top: 0;
            }

            .totals-table {
              width: 100%;
              font-size: 13px;
              border-collapse: collapse;
            }

            .totals-table td {
              padding: 1px 4px;
              line-height: 1.1;
            }

            .totals-table .total-label {
              text-align: left;
              font-weight: 700;
              padding-right: 10px;
            }

            .totals-table .total-value {
              text-align: right;
              font-weight: 400;
              width: 90px;
            }

            .totals-table .grand-total {
              font-weight: 700;
              font-size: 15px;
            }

            .totals-table .grand-total td {
              padding-top: 4px;
              padding-bottom: 4px;
            }

            /* Pagos */
            .payment-section {
              margin-top: 6px;
              font-size: 12px;
              line-height: 1.1;
              padding-top: 4px;
              text-align: center;
            }

            .payment-section strong {
              font-weight: 700;
            }

            .payment-section div {
              margin: 1px 0;
            }

            /* Footer */
            .footer-note {
              font-size: 12px;
              text-align: center;
              margin-top: 2px;
              line-height: 1.1;
              padding-top: 2px;
            }

            @media print {
              body { margin: 0; padding: 0; }
              .invoice-container { padding: 5px; }
              @page { size: 80mm auto; margin: 2mm; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              ${hasLogo ? `<div class="company-logo"><img src="${logoUrl}" alt="Logo"></div>` : ''}
              <div class="company-name">${this.companyInfo.commercial_name || this.companyInfo.company_name || 'CERAMICAS TERRAZOS Y PULIDOS UNIVERSAL'}</div>
              <div class="company-details">
                <strong>RTN:</strong> ${this.companyInfo.rtn || '01061977002516'}<br>
                <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Casa Matriz, Barrio La Merced, La Ceiba, Atlántida'}<br>
                <strong>Teléfono:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || '2440-0037'}${this.companyInfo.whatsapp ? '<br><strong>Móvil:</strong> ' + this.companyInfo.whatsapp : ''}<br>
                ${this.companyInfo.email ? this.companyInfo.email + '<br>' : ''}
                <strong>CAI:</strong> ${this.selectedDocument.cai || this.selectedDocument.numero_resolucion || 'N/A'}
              </div>
            </div>

            <!-- Título del documento -->
            <div class="doc-title">${docTitle}</div>

            <!-- Número e información del documento -->
            <div class="info-section">
              ${this.selectedDocument.invoice_number || this.selectedDocument.document_number || this.selectedDocument.full_number || '000-002-01-00000000'}<br>
              <strong>Condiciones de la Transacción:</strong> CONTADO<br>
              <strong>Cliente:</strong> ${this.selectedDocument.customer_name || 'CONSUMIDOR FINAL'}<br>
              <strong>RTN:</strong> ${this.selectedDocument.customer_rtn || '00000000000000'}<br>
              <strong>Vendedor:</strong> ${this.selectedDocument.seller_name || this.selectedDocument.created_by_name || 'DANIEL ARGEÑAL'}
            </div>

            <!-- Tabla de productos -->
            <table class="products-table">
              <thead>
                <tr>
                  <td colspan="4" style="text-align: center; padding: 0; font-size: 12px; border: none;">.......................................................................................</td>
                </tr>
                <tr>
                  <th style="width: 35px; text-align: center;">Cant</th>
                  <th>Producto</th>
                  <th style="width: 60px; text-align: right;">P/Unit</th>
                  <th style="width: 65px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>

            <!-- Totales -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td class="total-label">Importe Exonerado:</td>
                  <td class="total-value">L 0.00</td>
                </tr>
                <tr>
                  <td class="total-label">Importe Exento:</td>
                  <td class="total-value">L 0.00</td>
                </tr>
                <tr>
                  <td class="total-label">Gravado 15%</td>
                  <td class="total-value">L ${this.formatCurrency(taxableAmount)}</td>
                </tr>
                <tr>
                  <td class="total-label">Gravado 18%</td>
                  <td class="total-value">L 0.00</td>
                </tr>
                <tr>
                  <td class="total-label">I.S.V 15 15%:</td>
                  <td class="total-value">L ${this.formatCurrency(totalTax)}</td>
                </tr>
                <tr>
                  <td class="total-label">I.S.V 18 18%:</td>
                  <td class="total-value">L 0.00</td>
                </tr>
                <tr>
                  <td class="total-label">RECARGOS:</td>
                  <td class="total-value">L ${this.formatCurrency(finalSurcharges)}</td>
                </tr>
                <tr>
                  <td class="total-label">DESCUENTOS Y REBAJAS OTORGADOS:</td>
                  <td class="total-value">L 0.00</td>
                </tr>
                <tr class="grand-total">
                  <td class="total-label"><strong>TOTAL A PAGAR:</strong></td>
                  <td class="total-value"><strong>L<br>${this.formatCurrency(this.selectedDocument.total || grandTotal)}</strong></td>
                </tr>
                <tr>
                  <td colspan="2" style="text-align: center; padding: 0; font-size: 12px;">.......................................................................................</td>
                </tr>
              </table>
            </div>

            <!-- Información de pago -->
            <div class="payment-section">
              <strong>Pagos Recibidos</strong><br>
              <strong>Transferencia:</strong> ${this.formatCurrency(this.selectedDocument.total || grandTotal)}<br>
              <strong>Valor en letras:</strong> ${(() => {
                const total = this.selectedDocument.total || grandTotal;
                const integerPart = Math.floor(total);
                const cents = String(Math.floor((total % 1) * 100)).padStart(2, '0');
                return this.numberToWords(integerPart).toUpperCase() + ' LEMPIRAS CON ' + cents + '/100';
              })()}<br>
              <strong>Rango de facturación Vigente:</strong><br>
              <strong>Desde:</strong> ${(() => {
                const prefix = this.selectedDocument.prefijo_control || '000-002-01-';
                const inicio = this.selectedDocument.nro_inicial_control || 40001;
                return prefix + String(inicio).padStart(8, '0');
              })()}<br>
              <strong>Hasta:</strong> ${(() => {
                const prefix = this.selectedDocument.prefijo_control || '000-002-01-';
                const final = this.selectedDocument.nro_final_control || 50000;
                return prefix + String(final).padStart(8, '0');
              })()}<br>
              <strong>Fecha Limite de Emisión Vigente:</strong> ${this.formatDate(this.selectedDocument.fecha_fin || '2026-12-28')}<br>
              <strong>No. Correlativo de la Orden de Compra<br>Exenta:</strong> ${this.selectedDocument.orden_compra || ''}<br>
              <strong>No. Correlativo de la Constancia del Reg<br>Exonerado:</strong> ${this.selectedDocument.constancia_exonerado || ''}<br>
              <strong>No. Identificativo del Registro SAG:</strong> ${this.selectedDocument.registro_sag || ''}<br>
              ${this.formatDateTime(this.selectedDocument.issue_date || this.selectedDocument.emission_date)}
            </div>

            <!-- Footer -->
            <div class="footer-note">
              <strong>Entrega:</strong> ${this.formatDate(this.selectedDocument.issue_date || this.selectedDocument.emission_date)}<br>
              Original: Cliente/Copia: Obligado Tributario<br>
              <strong>Emisor:</strong> ¡La Factura es beneficio de todos. Exígela!
            </div>
          </div>
        </body>
        </html>
      `;

      return html;
    },
    async buildLetterFormatHTML() {
      const docTitle = this.selectedDocumentType;
      const docColor = '#FF9800'; // Naranja/Amarillo uniforme

      // Si es GUÍA DE REMISIÓN, usar formato especial
      if (this.selectedDocumentType === 'GUIA DE REMISION') {
        return await this.buildShippingGuideHTML();
      }

      // Devoluciones y notas de crédito usan el mismo formato que los demás documentos

      // Construir filas de la tabla según el tipo de documento
      let tableRows = '';
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      this.selectedDocument.items.forEach((item, index) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price || item.price) || 0;
        const discountValue = parseFloat(item.discount_value) || 0;
        const taxRate = parseFloat(item.tax_rate) || 0;

        const itemSubtotal = qty * price;
        const itemDiscount = itemSubtotal * (discountValue / 100);
        const itemAfterDiscount = itemSubtotal - itemDiscount;
        const itemTax = itemAfterDiscount * (taxRate / 100);
        const itemTotal = itemAfterDiscount + itemTax;

        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
        totalTax += itemTax;

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

      const documentDiscount = parseFloat(this.selectedDocument.discount || this.selectedDocument.total_discount) || 0;
      const documentSurcharges = parseFloat(this.selectedDocument.surcharges || this.selectedDocument.surcharge) || 0;
      const finalDiscount = documentDiscount > 0 ? documentDiscount : totalDiscount;
      const finalSurcharges = documentSurcharges;
      const grandTotal = subtotal - finalDiscount + totalTax + finalSurcharges;

      // Obtener logo desde la base de datos
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

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
              min-width: 230px;
            }
            .invoice-title {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .invoice-meta {
              font-size: 12px;
              line-height: 1.6;
            }
            .invoice-meta strong { font-weight: 600; }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              gap: 20px;
            }
            .info-box {
              flex: 1;
              background: #fff;
              padding: 8px 12px;
              border-radius: 4px;
              border: 1px solid #e0e0e0;
              border-left: 3px solid ${docColor};
            }
            .info-box h3 {
              font-size: 9px;
              text-transform: uppercase;
              color: #000;
              margin-bottom: 6px;
              letter-spacing: 0.5px;
              font-weight: 600;
            }
            .info-box p {
              font-size: 12px;
              margin: 3px 0;
              color: #000;
              line-height: 1.3;
            }
            .info-box .highlight {
              font-weight: 700;
              color: #000;
              font-size: 13px;
            }
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
            .products-table thead th:nth-child(6) { text-align: right; }
            .products-table tbody tr:hover { background: #fffbf0; }
            .totals-section {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
              gap: 20px;
            }
            .totals-left {
              flex: 1;
              font-size: 12px;
              color: #000;
              padding: 10px;
              border: 1px solid #e0e0e0;
              border-radius: 4px;
              display: flex;
              flex-direction: column;
            }
            .totals-box {
              min-width: 350px;
              border: 1px solid #e0e0e0;
              border-radius: 4px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 15px;
              font-size: 11px;
              border-bottom: 1px solid #e0e0e0;
            }
            .total-row:last-child { border-bottom: none; }
            .total-row.grand-total {
              background: #f8f9fa;
              font-size: 13px;
              font-weight: 700;
              border-top: 2px solid ${docColor};
            }
            .total-row .label {
              font-weight: 400;
              color: #000;
            }
            .total-row .value {
              font-weight: 600;
              color: #000;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
            }
            .footer-signature {
              display: flex;
              justify-content: center;
              margin-bottom: 20px;
            }
            .signature-box { text-align: center; padding: 20px; }
            .signature-line {
              width: 300px;
              height: 1px;
              background: #000;
              margin: 40px auto 10px;
            }
            .signature-box p {
              font-size: 10px;
              color: #000;
              margin: 4px 0;
            }
            .footer-note {
              font-size: 10px;
              color: #000;
              margin-top: 20px;
              text-align: center;
              line-height: 1.6;
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
              .header, .products-table, .totals-section, .footer-note {
                page-break-inside: avoid;
              }
              .invoice-header {
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
                ${hasLogo ? `<img src="${logoUrl}" style="max-width: 180px; height: auto; margin-bottom: 8px;" alt="Logo">` : ''}
                <div class="company-name" style="font-size: 14px; font-weight: 700; color: #000; margin-bottom: 4px;">${this.companyInfo.commercial_name || this.companyInfo.company_name || 'PROSPERPOS'}</div>
                <div class="company-details">
                  <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                  <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'}<br>
                  <strong>Teléfono:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'}<br>
                  ${this.companyInfo.whatsapp ? '<strong>Móvil:</strong> ' + this.companyInfo.whatsapp + '<br>' : ''}
                  <strong>Email:</strong> ${this.companyInfo.email || 'info@prosperpos.com'}
                </div>
              </div>
              <div style="flex: 1; margin-left: 20px;">
                <div style="font-size: 11px; color: #333;">
                  <strong>Cliente:</strong> ${this.selectedDocument.customer_name || 'CONSUMIDOR FINAL'}<br>
                  <strong>RTN:</strong> ${this.selectedDocument.customer_rtn || '00000000000000'}<br>
                  ${this.selectedDocumentType !== 'DEVOLUCION' && this.selectedDocumentType !== 'NOTA DE CREDITO' ? `<strong>Vendedor:</strong> ${this.selectedDocument.seller_name || this.selectedDocument.created_by_name || 'N/A'}` : ''}
                </div>
              </div>
              <div class="invoice-header">
                <div class="invoice-title">${docTitle}: ${this.selectedDocument.correlative || this.selectedDocument.document_number || this.selectedDocument.full_number || 'N/A'}</div>
                <div class="invoice-meta">
                  <strong>#Control Interno:</strong> ${(() => {
                    const num = this.selectedDocument.correlative || this.selectedDocument.document_number || this.selectedDocument.full_number || '0';
                    const numStr = String(num);
                    return /^[0-9]+$/.test(numStr) ? numStr.padStart(10, '0') : numStr;
                  })()}<br>
                  ${this.selectedDocumentType === 'DEVOLUCION' || this.selectedDocumentType === 'NOTA DE CREDITO' ? `<strong>Doc/Devuelto:</strong> ${this.selectedDocument.invoice_number || 'N/A'}<br>` : ''}
                  <strong>Sucursal:</strong> ${this.selectedDocument.branch_name || this.companyInfo.company_name || 'AGENCIA PRINCIPAL'}<br>
                  <strong>Emisión:</strong> ${this.formatDate(this.selectedDocument.emission_date || this.selectedDocument.issue_date || this.selectedDocument.quote_date || this.selectedDocument.created_at)}<br>
                  <strong>Condiciones de la Transacción:</strong> ${this.selectedDocument.payment_terms || 'Contado'}<br>
                  <strong>Entrega:</strong> ${this.formatDate(this.selectedDocument.emission_date || this.selectedDocument.issue_date || this.selectedDocument.quote_date || this.selectedDocument.created_at)}<br>
                  ${this.selectedDocument.invoice_number && this.selectedDocumentType !== 'DEVOLUCION' && this.selectedDocumentType !== 'NOTA DE CREDITO' ? `<strong>Factura Orig.:</strong> ${this.selectedDocument.invoice_number}<br>` : ''}
                  <strong>No. Correlativo de la Orden de Compra Exenta:</strong> ${this.selectedDocument.orden_compra || 'N/A'}<br>
                  <strong>No. Correlativo de la Constancia del Reg Exonerado:</strong> ${this.selectedDocument.constancia_exonerado || 'N/A'}<br>
                  <strong>No. Identificativo del Registro SAG:</strong> ${this.selectedDocument.registro_sag || 'N/A'}
                </div>
              </div>
            </div>
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
            <div class="totals-section">
              <div class="totals-left">
                <div style="margin-bottom: 15px;">
                  <strong>TOTAL:</strong> ${this.numberToWords(this.selectedDocument.total || grandTotal).toUpperCase()} LEMPIRAS ${String(Math.floor(((this.selectedDocument.total || grandTotal) % 1) * 100)).padStart(2, '0')}/100
                </div>
                <div style="margin-top: auto; padding-top: 40px; text-align: center;">
                  <div style="border-top: 2px solid #000; width: 250px; margin: 0 auto 10px;"></div>
                  <div style="margin-bottom: 8px;"><strong>Original Cliente</strong></div>
                  <div><strong>Copia Obligado Tributario Emisor</strong></div>
                </div>
                ${(this.selectedDocumentType === 'DEVOLUCION' || this.selectedDocumentType === 'NOTA DE CREDITO') && this.selectedDocument.notes ? `
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
                  <span class="value">L ${this.formatCurrency(subtotal - finalDiscount)}</span>
                </div>
                <div class="total-row">
                  <span class="label">Gravado 18%</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row">
                  <span class="label">I.S.V 15 15%:</span>
                  <span class="value">L ${this.formatCurrency(totalTax)}</span>
                </div>
                <div class="total-row">
                  <span class="label">I.S.V 18 18%:</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row">
                  <span class="label">RECARGOS:</span>
                  <span class="value">L ${this.formatCurrency(finalSurcharges)}</span>
                </div>
                <div class="total-row">
                  <span class="label">DESCUENTOS Y REBAJAS OTORGADOS:</span>
                  <span class="value">L ${this.formatCurrency(finalDiscount)}</span>
                </div>
                <div class="total-row grand-total">
                  <span class="label"><strong>TOTAL:</strong></span>
                  <span class="value"><strong>L ${this.formatCurrency(this.selectedDocument.total || grandTotal)}</strong></span>
                </div>
              </div>
            </div>
            ${this.selectedDocumentType !== 'DEVOLUCION' && this.selectedDocumentType !== 'NOTA DE CREDITO' && this.selectedDocumentType !== 'GUIA DE REMISION' ? `
            <div class="footer">
              <div class="footer-note" style="margin-top: 20px; text-align: center; font-size: 14px; line-height: 2;">
                <strong style="font-size: 15px;">Cuentas Bancarias:</strong><br>
                ${this.bankAccounts && this.bankAccounts.length > 0 ? this.bankAccounts.filter(acc => acc.is_active).map(acc => {
                  const bankName = acc.banco || 'Banco';
                  const accountNumber = acc.numero_cuenta || 'N/A';
                  const accountType = acc.tipo_cuenta || '';
                  return `<strong>${bankName}:</strong> ${accountNumber}${accountType ? ` (${accountType})` : ''}`;
                }).join(' | ') : 'No hay cuentas registradas'}
              </div>
            </div>
            ` : ''}
          </div>
        </body>
        </html>
      `;

      return html;
    },
    async buildShippingGuideHTML() {
      const docColor = '#FF9800';

      // Obtener logo desde la base de datos
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

      // Construir tabla de productos (enfoque en cantidad y peso)
      let tableRows = '';
      this.selectedDocument.items.forEach((item, index) => {
        const qty = parseFloat(item.quantity) || 0;
        const weight = parseFloat(item.weight) || 0;
        const totalWeight = qty * weight;
        const unitText = item.product_unit || item.unit || 'UNIDAD';
        tableRows += `
          <tr>
            <td style="padding: 6px; text-align: center; border: 1px solid #ddd; font-size: 10px;">${String(index + 1).padStart(2, '0')}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 10px;">${item.product_code || 'N/A'}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 10px;">${item.product_name} <span style="font-weight: 600;">${unitText}</span></td>
            <td style="padding: 6px; text-align: center; border: 1px solid #ddd; font-size: 10px;">${weight.toFixed(2)}</td>
            <td style="padding: 6px; text-align: center; border: 1px solid #ddd; font-size: 10px;">${this.formatCurrency(qty)}</td>
            <td style="padding: 6px; text-align: center; border: 1px solid #ddd; font-size: 10px;">${totalWeight.toFixed(2)}</td>
          </tr>
        `;
      });

      // Condiciones de entrega por defecto
      const defaultConditions = `* Nuestro servicio de flete incluye la descarga del producto al pie del vehículo que entrega.
* Al momento de entregar debe haber una persona responsable encargada de recibir.
* No se aceptan cambios, ni reclamos.
* Una vez firmado el comprobante de entrega o una vez en el piso en su obra, la empresa no se hace responsable de quebraduras o roturas.
* Nuestra responsabilidad termina una vez entregado el producto.`;

      const deliveryConditions = this.selectedDocument.delivery_conditions || defaultConditions;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>GUIA DE REMISION - ${this.selectedDocument.shipment_number || this.selectedDocument.correlative}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }

            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              background: #fff;
              padding: 0;
              margin: 0;
            }

            .guide-container {
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

            .company-logo {
              flex: 1;
            }

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

            .guide-header {
              text-align: right;
              background: ${docColor};
              color: white;
              padding: 15px 18px;
              border-radius: 6px;
              min-width: 280px;
            }

            .guide-title {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 8px;
            }

            .guide-meta {
              font-size: 12px;
              line-height: 1.6;
            }

            .info-section {
              margin-bottom: 20px;
            }

            .info-row {
              display: flex;
              gap: 10px;
              margin-bottom: 10px;
            }

            .info-box {
              flex: 1;
              background: #f8f9fa;
              padding: 8px 12px;
              border-radius: 4px;
              border-left: 3px solid ${docColor};
            }

            .info-box h3 {
              font-size: 9px;
              text-transform: uppercase;
              color: ${docColor};
              margin-bottom: 5px;
              letter-spacing: 0.5px;
              font-weight: 700;
            }

            .info-box p {
              font-size: 10px;
              margin: 3px 0;
              color: #333;
              line-height: 1.3;
            }

            .info-box strong {
              font-weight: 600;
              color: #000;
            }

            .section-title {
              background: ${docColor};
              color: white;
              padding: 6px 10px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 8px;
              border-radius: 4px;
            }

            .products-table {
              width: 100%;
              margin-bottom: 10px;
              border-collapse: collapse;
              background: white;
            }

            .products-table thead {
              background: ${docColor};
            }

            .products-table thead th {
              padding: 6px 5px;
              text-align: left;
              font-size: 9px;
              font-weight: 600;
              color: white;
              text-transform: uppercase;
              border: 1px solid #fff;
            }

            .products-table thead th:first-child,
            .products-table thead th:nth-child(4),
            .products-table thead th:nth-child(5),
            .products-table thead th:nth-child(6) {
              text-align: center;
            }

            .delivery-conditions {
              background: #f8f9fa;
              padding: 8px 12px;
              border-radius: 4px;
              margin-bottom: 15px;
              margin-top: 10px;
              border-left: 3px solid ${docColor};
            }

            .delivery-conditions h3 {
              font-size: 10px;
              font-weight: 700;
              color: ${docColor};
              margin-bottom: 5px;
              text-transform: uppercase;
            }

            .delivery-conditions p {
              font-size: 9px;
              line-height: 1.3;
              color: #333;
              margin: 3px 0;
            }

            .signature-section {
              display: flex;
              justify-content: space-around;
              margin-top: 20px;
              gap: 30px;
            }

            .signature-box {
              flex: 1;
              text-align: center;
            }

            .signature-line {
              width: 100%;
              height: 1px;
              background: #000;
              margin: 30px 0 8px;
            }

            .signature-box p {
              font-size: 10px;
              color: #000;
              font-weight: 600;
              margin: 3px 0;
            }

            @media print {
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .guide-container {
                padding: 20px;
                max-width: 100%;
              }

              .header,
              .products-table,
              .signature-section {
                page-break-inside: avoid;
              }

              .guide-header,
              .section-title,
              .products-table thead {
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
          </style>
        </head>
        <body>
          <div class="guide-container">
            <!-- Header -->
            <div class="header">
              <div class="company-logo">
                ${hasLogo ? `<img src="${logoUrl}" style="max-width: 180px; height: auto; margin-bottom: 8px;" alt="Logo">` : ''}
                <div class="company-name" style="font-size: 14px; font-weight: 700; color: #000; margin-bottom: 4px;">${this.companyInfo.commercial_name || this.companyInfo.company_name || 'PROSPERPOS'}</div>
                <div class="company-details">
                  <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                  <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'}<br>
                  <strong>Teléfono:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'}<br>
                  ${this.companyInfo.whatsapp ? '<strong>Móvil:</strong> ' + this.companyInfo.whatsapp + '<br>' : ''}
                  <strong>Email:</strong> ${this.companyInfo.email || 'info@prosperpos.com'}
                </div>
              </div>
              <div class="guide-header">
                <div class="guide-title">GUIA DE REMISION</div>
                <div class="guide-meta">
                  <strong>No.:</strong> ${this.selectedDocument.correlative || this.selectedDocument.shipment_number || 'N/A'}<br>
                  <strong>#Control Interno:</strong> ${(() => {
                    const num = this.selectedDocument.correlative || this.selectedDocument.shipment_number || '0';
                    const numStr = String(num);
                    return /^[0-9]+$/.test(numStr) ? numStr.padStart(10, '0') : numStr;
                  })()}<br>
                  <strong>Fecha de Emisión:</strong> ${this.formatDate(this.selectedDocument.issue_date || this.selectedDocument.emission_date)}<br>
                  <strong>Sucursal:</strong> ${this.selectedDocument.branch_name || 'AGENCIA PRINCIPAL'}
                </div>
              </div>
            </div>

            <!-- Datos del Conductor y Vehículo -->
            <div class="section-title">Datos del Conductor y Vehículo</div>
            <div class="info-row">
              <div class="info-box">
                <p><strong>Conductor:</strong> ${this.selectedDocument.driver_name || 'N/A'}</p>
                <p><strong>DNI:</strong> ${this.selectedDocument.driver_id || 'N/A'}</p>
                <p><strong>Licencia:</strong> ${this.selectedDocument.driver_license || 'N/A'}</p>
                ${this.selectedDocument.companion1_name ? `<p><strong>Acompañante 1:</strong> ${this.selectedDocument.companion1_name}</p>` : ''}
                ${this.selectedDocument.companion2_name ? `<p><strong>Acompañante 2:</strong> ${this.selectedDocument.companion2_name}</p>` : ''}
              </div>
              <div class="info-box">
                <p><strong>Vehículo:</strong> ${this.selectedDocument.vehicle_brand || 'N/A'} ${this.selectedDocument.vehicle_model || ''}</p>
                <p><strong>Placa:</strong> ${this.selectedDocument.vehicle_plate || 'N/A'}</p>
              </div>
            </div>

            <!-- Información de Entrega -->
            <div class="section-title">Información de Entrega</div>
            <div class="info-row">
              <div class="info-box">
                <h3>Punto de Partida</h3>
                <p><strong>Dirección:</strong> ${this.selectedDocument.origin_address || 'N/A'}</p>
                <p><strong>Ciudad:</strong> ${this.selectedDocument.origin_city || 'N/A'}</p>
                <p><strong>Departamento:</strong> ${this.selectedDocument.origin_state || 'N/A'}</p>
              </div>
              <div class="info-box">
                <h3>Punto de Llegada</h3>
                <p><strong>Cliente:</strong> ${this.selectedDocument.customer_name || 'N/A'}</p>
                <p><strong>RTN:</strong> ${this.selectedDocument.customer_rtn || 'N/A'}</p>
                <p><strong>Dirección:</strong> ${this.selectedDocument.destination_address || this.selectedDocument.customer_address || 'N/A'}</p>
                ${this.selectedDocument.orden_compra ? `<p><strong>Orden de Compra:</strong> ${this.selectedDocument.orden_compra}</p>` : ''}
                ${this.selectedDocument.constancia_exonerado ? `<p><strong>Constancia Exonerado:</strong> ${this.selectedDocument.constancia_exonerado}</p>` : ''}
                ${this.selectedDocument.registro_sag ? `<p><strong>Registro SAG:</strong> ${this.selectedDocument.registro_sag}</p>` : ''}
              </div>
            </div>

            <!-- Quien Recibe -->
            <div class="section-title" style="margin-top: 15px;">Quien Recibe</div>
            <div class="info-row">
              <div class="info-box" style="padding: 6px 10px;">
                <p style="font-size: 10px; margin: 2px 0;"><strong>1.</strong> ${this.selectedDocument.receiver_name || 'N/A'} - <strong>DNI:</strong> ${this.selectedDocument.receiver_id_document || 'N/A'} - <strong>Tel:</strong> ${this.selectedDocument.receiver_phone || 'N/A'}</p>
                ${this.selectedDocument.receiver_alt_name ? `<p style="font-size: 10px; margin: 2px 0;"><strong>2.</strong> ${this.selectedDocument.receiver_alt_name} - <strong>DNI:</strong> ${this.selectedDocument.receiver_alt_id_document || 'N/A'} - <strong>Tel:</strong> ${this.selectedDocument.receiver_alt_phone || 'N/A'}</p>` : ''}
                ${this.selectedDocument.receiver_alt2_name ? `<p style="font-size: 10px; margin: 2px 0;"><strong>3.</strong> ${this.selectedDocument.receiver_alt2_name} - <strong>DNI:</strong> ${this.selectedDocument.receiver_alt2_id_document || 'N/A'} - <strong>Tel:</strong> ${this.selectedDocument.receiver_alt2_phone || 'N/A'}</p>` : ''}
              </div>
            </div>

            ${this.selectedDocument.documents && this.selectedDocument.documents.length > 0 ? `
            <!-- Documentos Involucrados -->
            <div class="section-title" style="margin-top: 15px;">Documentos Involucrados</div>
            <table class="products-table" style="margin-bottom: 10px;">
              <thead>
                <tr>
                  <th style="text-align: center;">#Doc</th>
                  <th>Cliente</th>
                  <th style="text-align: center;">Artículo(s)</th>
                </tr>
              </thead>
              <tbody>
                ${this.selectedDocument.documents.map(doc => `
                  <tr>
                    <td style="padding: 6px; text-align: center; border: 1px solid #ddd; font-size: 10px;">${doc.document_number || 'N/A'}</td>
                    <td style="padding: 6px; border: 1px solid #ddd; font-size: 10px;">${doc.customer_name || 'N/A'}</td>
                    <td style="padding: 6px; text-align: center; border: 1px solid #ddd; font-size: 10px;">${doc.total_items || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ` : ''}

            <!-- Detalle de Artículos -->
            <div class="section-title" style="margin-top: 15px;">Detalle de Artículos</div>
            <table class="products-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Código</th>
                  <th>Artículo</th>
                  <th>Peso/Unit</th>
                  <th>Cantidad</th>
                  <th>Peso/Total</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>

            <!-- Condiciones de Entrega -->
            <div class="delivery-conditions">
              <h3>Condiciones de Entrega</h3>
              <p style="white-space: pre-line; font-size: 10px; line-height: 1.4;">${deliveryConditions}</p>
            </div>

            <!-- Firmas -->
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>Firma del Conductor</p>
                <p>Nombre: _______________________</p>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>Firma y Sello del Cliente</p>
                <p>Nombre: _______________________</p>
                <p>Fecha de Recepción: ____________</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
              <p><strong>Original Cliente | Copia Obligado Tributario Emisor</strong></p>
            </div>
          </div>
        </body>
        </html>
      `;

      return html;
    },
    calculateItemTotal(item) {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price || item.price) || 0;
      const discountValue = parseFloat(item.discount_value) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;

      const itemTotal = qty * price;
      const itemDiscount = itemTotal * (discountValue / 100);
      const itemSubtotal = itemTotal - itemDiscount;
      const itemTax = itemSubtotal * (taxRate / 100);

      return itemSubtotal + itemTax;
    },
    formatCurrency(value) {
      const num = parseFloat(value) || 0;
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} ${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      // Extraer solo la fecha (puede venir con T o con espacio)
      const dateString = String(dateStr).split('T')[0].split(' ')[0];
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    },
    getStatusLabel(status) {
      const labelMap = {
        'paid': 'COBRADO',
        'pending': 'PENDIENTE',
        'partial': 'PARCIAL',
        'overdue': 'VENCIDO',
        'expired': 'VENCIDO',
        'cancelled': 'CANCELADO',
        'returned': 'DEVUELTO',
        'approved': 'APROBADO',
        'rejected': 'RECHAZADO',
        'active': 'Activa',
        'converted to invoice': 'Importada',
        'converted_to_invoice': 'Importada',
        'Completada': 'Completada'
      };
      return labelMap[status] || status?.toUpperCase() || 'N/A';
    },
    getStatusBadgeClass(status) {
      const classMap = {
        'paid': 'bg-success',
        'pending': 'bg-warning',
        'active': 'bg-info',
        'expired': 'bg-danger',
        'overdue': 'bg-danger',
        'converted to invoice': 'bg-success',
        'converted_to_invoice': 'bg-success',
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
    formatExpiry(expiryDate) {
      if (!expiryDate) return 'N/A';
      const expiry = new Date(expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);

      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'Vencida';
      if (diffDays === 0) return 'Vence Hoy';
      return `${diffDays} días`;
    },
    getExpiryClass(expiryDate) {
      if (!expiryDate) return '';
      const expiry = new Date(expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);

      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'text-danger fw-bold';
      if (diffDays <= 5) return 'text-warning fw-bold';
      return 'text-success';
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
    },

    /**
     * Formatea la fecha de vencimiento basándose en el tipo de documento
     */
    formatDueDate(emissionDate, docType) {
      if (!emissionDate) return 'N/A';

      const date = new Date(emissionDate);
      let daysToAdd = 0;

      // Mapear tipos de documento de reimpresiones a los mismos valores que estado de cuenta
      const normalizedDocType = docType ? docType.toLowerCase().replace(/\s+/g, '_') : '';

      if (normalizedDocType === 'factura') {
        daysToAdd = 7;
      } else if (normalizedDocType === 'cotizacion') {
        daysToAdd = 15;
      } else if (normalizedDocType === 'fact_en_espera') {
        daysToAdd = 0; // Mismo día
      } else if (normalizedDocType === 'guia_de_remision') {
        daysToAdd = 0;
      } else {
        return 'N/A';
      }

      const dueDate = new Date(date);
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDateOnly = new Date(dueDate);
      dueDateOnly.setHours(0, 0, 0, 0);

      const diffTime = dueDateOnly - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return `Vencido hace ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'día' : 'días'}`;
      } else if (diffDays === 0) {
        return 'Vence Hoy';
      } else {
        return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
      }
    },

    /**
     * Retorna la clase CSS para la columna "Vence" según el estado
     */
    getDueDateClass(emissionDate, docType) {
      if (!emissionDate) return '';

      const date = new Date(emissionDate);
      let daysToAdd = 0;

      const normalizedDocType = docType ? docType.toLowerCase().replace(/\s+/g, '_') : '';

      if (normalizedDocType === 'factura') {
        daysToAdd = 7;
      } else if (normalizedDocType === 'cotizacion') {
        daysToAdd = 15;
      } else if (normalizedDocType === 'fact_en_espera') {
        daysToAdd = 0;
      } else if (normalizedDocType === 'guia_de_remision') {
        daysToAdd = 0;
      } else {
        return '';
      }

      const dueDate = new Date(date);
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDateOnly = new Date(dueDate);
      dueDateOnly.setHours(0, 0, 0, 0);

      const diffTime = dueDateOnly - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return 'text-danger fw-bold'; // Vencido
      } else if (diffDays === 0) {
        return 'text-warning fw-bold'; // Vence hoy
      } else {
        return 'text-success'; // Pendiente
      }
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
