<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>

  <div class="page-wrapper">
    <div class="content">
      <div class="row">
        <!-- Main Content Area -->
        <div class="col-12">
          <!-- Document List View -->
          <div>
            <!-- Page Header -->
            <div class="card mb-3">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 class="mb-0">Gestión de Cargo/Descargo</h4>
                    <p class="text-muted mb-0">Administración de documentos de cargo y descargo</p>
                  </div>
                  <div class="btn-group">
                    <button type="button" class="btn btn-success" @click="createNewDocument('CARGO')">
                      <i class="ti ti-file-plus me-1"></i>Nuevo Cargo
                    </button>
                    <button type="button" class="btn btn-warning" @click="createNewDocument('DESCARGO')">
                      <i class="ti ti-file-minus me-1"></i>Nuevo Descargo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filters Card -->
            <div class="card mb-3">
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-2">
                    <label class="form-label">Tipo Documento</label>
                    <select class="form-select form-select-sm" v-model="filters.document_type" @change="loadDocuments">
                      <option value="">Todos</option>
                      <option value="CARGO">CARGO</option>
                      <option value="DESCARGO">DESCARGO</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Bodega</label>
                    <select class="form-select form-select-sm" v-model="filters.warehouse_id" @change="loadDocuments">
                      <option value="">Todas</option>
                      <option v-for="w in warehouses" :key="w.value" :value="w.value">{{ w.label }}</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Estado</label>
                    <select class="form-select form-select-sm" v-model="filters.status" @change="loadDocuments">
                      <option value="">Todos</option>
                      <option value="PROCESADO">PROCESADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Desde</label>
                    <input type="date" class="form-control form-control-sm" v-model="filters.date_from" @change="loadDocuments">
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Hasta</label>
                    <input type="date" class="form-control form-control-sm" v-model="filters.date_to" @change="loadDocuments">
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Buscar</label>
                    <input type="text" class="form-control form-control-sm" v-model="searchQuery" placeholder="Buscar...">
                  </div>
                </div>
              </div>
            </div>

            <!-- Table Card -->
            <div class="card">
              <div class="card-body">
                <div class="table-responsive">
                  <a-table
                    :columns="columns"
                    :data-source="filteredDocuments"
                    :loading="loading"
                    :pagination="pagination"
                    @change="handleTableChange"
                    row-key="id"
                    size="small"
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'registration_date'">
                        {{ formatDate(record.registration_date) }}
                      </template>

                      <template v-if="column.key === 'document_type'">
                        <span :class="record.document_type === 'CARGO' ? 'badge bg-success' : 'badge bg-warning'">
                          {{ record.document_type }}
                        </span>
                      </template>

                      <template v-if="column.key === 'status'">
                        <span :class="{
                          'badge bg-primary': record.status === 'PROCESADO',
                          'badge bg-danger': record.status === 'CANCELADO'
                        }">
                          {{ record.status }}
                        </span>
                      </template>

                      <template v-if="column.key === 'total_amount'">
                        <span class="fw-bold">{{ formatMoney(record.total_amount) }}</span>
                      </template>

                      <template v-if="column.key === 'actions'">
                        <button class="btn btn-info btn-sm" @click="viewDocument(record)" title="Ver">
                          <i class="ti ti-eye"></i>
                        </button>
                      </template>
                    </template>
                  </a-table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Document Form Modal -->
  <div v-if="showFormModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header border-0">
              <div class="page-title">
                <h4>{{ isEdit ? 'Editar' : 'Nuevo' }} Documento de {{ form.document_type }}</h4>
              </div>
              <button type="button" class="close" @click="closeFormModal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form @submit.prevent="saveDocument">
              <div class="modal-body">
                <!-- Información del Documento -->
                <div class="row">
                  <div class="col-lg-3">
                    <div class="mb-3">
                      <label class="form-label">Tipo de Documento <span class="text-danger">*</span></label>
                      <input type="text" class="form-control bg-light" :value="form.document_type" readonly disabled />
                    </div>
                  </div>

                  <div class="col-lg-3">
                    <div class="mb-3">
                      <label class="form-label">Fecha <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" v-model="form.registration_date" readonly required>
                    </div>
                  </div>

                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Emisor <span class="text-danger">*</span></label>
                      <input type="text" class="form-control bg-light" v-model="form.issuer" placeholder="Nombre del emisor" readonly required>
                    </div>
                  </div>

                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Bodega <span class="text-danger">*</span></label>
                      <select class="form-select" v-model="form.warehouse_id" @change="loadProducts" required>
                        <option :value="null">Seleccione una bodega...</option>
                        <option v-for="w in warehouses" :key="w.value" :value="w.value">{{ w.label }}</option>
                      </select>
                    </div>
                  </div>

                  <div class="col-lg-8">
                    <div class="mb-3">
                      <label class="form-label">Concepto</label>
                      <input type="text" class="form-control" v-model="form.concept" placeholder="Concepto del documento">
                    </div>
                  </div>
                </div>

                <!-- Productos -->
                <div class="row mt-4">
                  <div class="col-12">
                    <h5>Productos</h5>
                    <div class="mb-3">
                      <div class="input-group">
                        <input
                          type="text"
                          class="form-control"
                          v-model="productSearch"
                          placeholder="Buscar producto por código o nombre"
                          @keyup.enter="searchProducts"
                        />
                        <button class="btn btn-primary" type="button" @click="searchProducts">
                          <i class="ti ti-search"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Lista de productos buscados -->
                    <div v-if="searchResults.length > 0" class="mb-3">
                      <div class="list-group">
                        <button
                          v-for="product in paginatedSearchResults"
                          :key="product.id"
                          type="button"
                          class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                          @click="addProductToDocument(product)"
                        >
                          <div>
                            <strong>{{ product.code }}</strong> - {{ product.name }}
                            <span class="badge bg-info ms-2">Stock: {{ product.stock || 0 }}</span>
                          </div>
                          <i class="ti ti-plus"></i>
                        </button>
                      </div>

                      <!-- Paginación de resultados de búsqueda -->
                      <div v-if="searchResultsTotalPages > 1" class="d-flex justify-content-center align-items-center gap-2 mt-3">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-primary"
                          @click="searchResultsCurrentPage = Math.max(1, searchResultsCurrentPage - 1)"
                          :disabled="searchResultsCurrentPage === 1"
                        >
                          <i class="ti ti-chevron-left"></i>
                        </button>
                        <span class="text-muted">
                          Página {{ searchResultsCurrentPage }} de {{ searchResultsTotalPages }}
                        </span>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-primary"
                          @click="searchResultsCurrentPage = Math.min(searchResultsTotalPages, searchResultsCurrentPage + 1)"
                          :disabled="searchResultsCurrentPage === searchResultsTotalPages"
                        >
                          <i class="ti ti-chevron-right"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Tabla de productos agregados -->
                    <div class="table-responsive">
                      <table class="table table-sm">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th width="100">Cantidad</th>
                            <th width="120">Costo Unit.</th>
                            <th width="120">Total</th>
                            <th width="150">Ubicación</th>
                            <th width="60"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="selectedProducts.length === 0">
                            <td colspan="7" class="text-center text-muted">No hay productos agregados</td>
                          </tr>
                          <tr v-for="(product, index) in selectedProducts" :key="index">
                            <td>{{ product.product_code }}</td>
                            <td>{{ product.product_name }}</td>
                            <td>
                              <input
                                type="number"
                                class="form-control form-control-sm"
                                v-model.number="product.quantity"
                                @input="calculateProductTotal(index)"
                                min="0.01"
                                step="0.01">
                            </td>
                            <td>
                              <input
                                type="number"
                                class="form-control form-control-sm"
                                v-model.number="product.unit_cost"
                                @input="calculateProductTotal(index)"
                                min="0"
                                step="0.01">
                            </td>
                            <td class="fw-bold">{{ formatMoney(product.total_cost) }}</td>
                            <td>
                              <input
                                type="text"
                                class="form-control form-control-sm"
                                v-model="product.warehouse_location"
                                placeholder="Ubicación">
                            </td>
                            <td class="text-center">
                              <button type="button" class="btn btn-danger btn-sm" @click="removeProduct(index)">
                                <i class="ti ti-trash"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot class="table-light fw-bold">
                          <tr>
                            <td colspan="4" class="text-end">SUBTOTAL:</td>
                            <td>{{ formatMoney(subtotal) }}</td>
                            <td colspan="2"></td>
                          </tr>
                          <tr>
                            <td colspan="4" class="text-end">IMPUESTO (15%):</td>
                            <td>{{ formatMoney(tax) }}</td>
                            <td colspan="2"></td>
                          </tr>
                          <tr>
                            <td colspan="4" class="text-end fs-4">TOTAL:</td>
                            <td class="text-primary fs-3 fw-bold">{{ formatMoney(total) }}</td>
                            <td colspan="2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-cancel" @click="closeFormModal">Cancelar</button>
                <button type="submit" class="btn btn-submit">{{ isEdit ? 'Actualizar' : 'Guardar' }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Visualización de Documento -->
  <div v-if="showDocumentModal && currentDocument" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-white py-2">
          <h6 class="modal-title mb-0">Documento {{ currentDocument.document_number }}</h6>
          <button type="button" class="btn-close" @click="closeDocumentModal"></button>
        </div>

        <div class="modal-body py-2 px-3">
          <div ref="documentContent" class="border p-3 bg-white" style="max-height: 500px; overflow-y: auto;">
            <!-- Header con 3 columnas: Logo | Empresa | Info Documento -->
            <div class="row mb-3">
              <!-- Logo -->
              <div class="col-3 d-flex align-items-center justify-content-center">
                <img src="@/assets/img/logo_ceramicasuniversal.png" alt="Logo" style="max-width: 120px; max-height: 120px;" onerror="this.style.display='none'">
              </div>

              <!-- Información de la empresa -->
              <div class="col-6 d-flex flex-column justify-content-center text-center">
                <h5 class="mb-1 fw-bold">{{ companyInfo.company_name }}</h5>
                <p class="mb-0" style="font-size: 11px;">
                  {{ companyInfo.direccion || 'Sin dirección' }}<br>
                  Tel: {{ companyInfo.telefono || 'N/A' }}<br>
                  RTN: {{ companyInfo.rtn || 'N/A' }}
                </p>
              </div>

              <!-- Información del documento (caja naranja) -->
              <div class="col-3">
                <div class="p-2" style="background-color: #ff9800; color: white; border-radius: 4px; font-size: 11px;">
                  <div class="mb-1"><strong>#Control Interno</strong></div>
                  <div class="mb-1" style="font-size: 10px;">{{ currentDocument.document_number }}</div>
                  <div class="mb-1"><strong>Bodega</strong></div>
                  <div class="mb-1" style="font-size: 10px;">{{ currentDocument.warehouse_name }}</div>
                  <div class="mb-1"><strong>Emisión</strong></div>
                  <div class="mb-1" style="font-size: 10px;">{{ formatDate(currentDocument.registration_date) }}</div>
                  <div class="mb-1"><strong>Estado</strong></div>
                  <div style="font-size: 10px;">{{ currentDocument.status }}</div>
                </div>
              </div>
            </div>

            <!-- Línea separadora naranja -->
            <div class="mb-3" style="border-top: 3px solid #ff9800;"></div>

            <!-- Título del documento -->
            <h5 class="text-center mb-3 fw-bold" style="color: #ff9800;">
              DOCUMENTO DE {{ currentDocument.document_type }}
            </h5>

            <!-- Información adicional -->
            <div class="row mb-3" style="font-size: 11px;">
              <div class="col-6">
                <strong>Emisor:</strong> {{ currentDocument.issuer }}
              </div>
              <div class="col-6">
                <strong>Registrado por:</strong> {{ currentDocument.registered_by_name || 'N/A' }}
              </div>
            </div>

            <div class="mb-3" style="font-size: 11px;">
              <strong>Concepto:</strong> {{ currentDocument.concept || 'Sin concepto' }}
            </div>

            <!-- Tabla de productos con encabezado naranja -->
            <table class="table table-sm table-bordered mb-3" style="font-size: 11px;">
              <thead style="background-color: #ff9800; color: white;">
                <tr>
                  <th class="text-center" style="padding: 8px;">Código</th>
                  <th style="padding: 8px;">Producto</th>
                  <th class="text-center" style="padding: 8px;">Cantidad</th>
                  <th class="text-end" style="padding: 8px;">Costo Unitario</th>
                  <th class="text-end" style="padding: 8px;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in currentDocument.details" :key="item.id">
                  <td class="text-center" style="padding: 6px;">{{ item.product_code }}</td>
                  <td style="padding: 6px;">{{ item.product_name }}</td>
                  <td class="text-center" style="padding: 6px;">{{ item.quantity }}</td>
                  <td class="text-end" style="padding: 6px;">{{ formatMoney(item.unit_cost) }}</td>
                  <td class="text-end" style="padding: 6px;">{{ formatMoney(item.total_cost) }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Resumen con borde naranja -->
            <div class="p-3 mb-3" style="border: 2px solid #ff9800; border-radius: 4px; background-color: #fff8f0;">
              <div class="row mb-2" style="font-size: 12px;">
                <div class="col-8 text-end"><strong>SUBTOTAL:</strong></div>
                <div class="col-4 text-end">{{ formatMoney(currentDocument.subtotal) }}</div>
              </div>
              <div class="row mb-2" style="font-size: 12px;">
                <div class="col-8 text-end"><strong>IMPUESTO (15%):</strong></div>
                <div class="col-4 text-end">{{ formatMoney(currentDocument.tax_amount) }}</div>
              </div>
              <div class="row" style="font-size: 14px;">
                <div class="col-8 text-end"><strong style="color: #ff9800;">TOTAL:</strong></div>
                <div class="col-4 text-end"><strong style="color: #ff9800;">{{ formatMoney(currentDocument.total_amount) }}</strong></div>
              </div>
            </div>

            <!-- Notas -->
            <div v-if="currentDocument.notes" class="mb-0" style="font-size: 11px;">
              <strong>Observaciones:</strong><br>
              {{ currentDocument.notes }}
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

</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { LOGO_BASE64 } from '@/assets/img/logo.js';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export default {
  data() {
    return {
      documents: [],
      warehouses: [],
      allProducts: [],
      loading: false,
      searchQuery: '',
      showProductModal: false,
      showFormModal: false,
      showDocumentModal: false,
      showExportDropdown: false,
      isEdit: false,
      editingId: null,
      currentDocument: null,
      companyInfo: {
        company_name: 'Ceramicas Terrazos y Pulidos Universal',
        direccion: 'Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico. La Ceiba, Atlántida',
        telefono: '+504 2440-0037',
        telefono_movil: '+504 9875-2725',
        rtn: '01061977002516',
        email: 'mauricio_argenal@hotmail.com'
      },

      // Stats
      stats: {
        draft: 0,
        processed: 0,
        cancelled: 0
      },

      // Form data
      form: {
        document_type: 'CARGO',
        warehouse_id: null,
        issuer: '',
        concept: '',
        registration_date: ''
      },

      // Product selection (similar a cupones)
      productSearch: '',
      searchResults: [],
      searchResultsCurrentPage: 1,
      searchResultsPerPage: 10,
      selectedProducts: [],

      // Filters
      filters: {
        document_type: '',
        warehouse_id: '',
        status: '',
        date_from: '',
        date_to: ''
      },

      // Table
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      columns: [
        { title: 'Emisión', dataIndex: 'registration_date', key: 'registration_date', width: 100 },
        { title: 'Documento', dataIndex: 'document_number', key: 'document_number', width: 130 },
        { title: 'Tipo', dataIndex: 'document_type', key: 'document_type', width: 90 },
        { title: 'Emisor', dataIndex: 'issuer', key: 'issuer', width: 150 },
        { title: 'Concepto', dataIndex: 'concept', key: 'concept' },
        { title: 'Bodega', dataIndex: 'warehouse_name', key: 'warehouse_name', width: 130 },
        { title: 'Estado', dataIndex: 'status', key: 'status', width: 100 },
        { title: 'Total', dataIndex: 'total_amount', key: 'total_amount', width: 100, align: 'right' },
        { title: 'Acciones', key: 'actions', width: 80, fixed: 'right', align: 'center' }
      ]
    };
  },

  computed: {
    filteredDocuments() {
      if (!this.searchQuery) return this.documents;
      const query = this.searchQuery.toLowerCase();
      return this.documents.filter(doc =>
        doc.document_number?.toLowerCase().includes(query) ||
        doc.issuer?.toLowerCase().includes(query) ||
        doc.concept?.toLowerCase().includes(query)
      );
    },
    subtotal() {
      return this.selectedProducts.reduce((sum, p) => sum + (p.quantity * p.unit_cost), 0);
    },
    tax() {
      return this.subtotal * 0.15;
    },
    total() {
      return this.subtotal + this.tax;
    },
    paginatedSearchResults() {
      const start = (this.searchResultsCurrentPage - 1) * this.searchResultsPerPage;
      return this.searchResults.slice(start, start + this.searchResultsPerPage);
    },
    searchResultsTotalPages() {
      return Math.ceil(this.searchResults.length / this.searchResultsPerPage);
    }
  },

  async mounted() {
    await this.loadWarehouses();
    await this.loadProducts();
    await this.loadDocuments();
    this.updateStats();
  },

  methods: {
    // Utility methods
    getHondurasDate() {
      const now = new Date();
      const hondurasOffset = -6 * 60;
      const localOffset = now.getTimezoneOffset();
      const diff = localOffset - hondurasOffset;
      const hondurasTime = new Date(now.getTime() - (diff * 60 * 1000));
      return hondurasTime.toISOString().split('T')[0];
    },

    getCurrentUserName() {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Usuario';
        }
      } catch (e) {
        console.error('Error getting user:', e);
      }
      return 'Usuario';
    },

    formatMoney(value) {
      return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL'
      }).format(value || 0);
    },

    formatCurrency(value) {
      if (!value) return '0.00';
      return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    formatNumber(value) {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString.replace('Z', ''));
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },

    // Data loading
    async loadWarehouses() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/warehouses`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 10000 }
        });

        const warehousesData = response.data?.data || response.data || [];
        if (Array.isArray(warehousesData)) {
          this.warehouses = warehousesData.map(w => ({
            label: w.nombre || w.name || w.warehouse_name || 'Sin nombre',
            value: w.id
          }));
        }
      } catch (error) {
        console.error('Error loading warehouses:', error);
        this.warehouses = [];
      }
    },

    async loadProducts() {
      try {
        const token = localStorage.getItem('token');
        const params = {
          limit: 10000,
          includeStock: true
        };

        // Si hay una bodega seleccionada, incluirla para obtener el stock de esa bodega
        if (this.form.warehouse_id) {
          params.warehouse_id = this.form.warehouse_id;
        }

        const response = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
          params: params
        });

        if (response.data.success) {
          const data = response.data.data || {};
          // Extract products array from the response object
          this.allProducts = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
        } else {
          this.allProducts = [];
        }
      } catch (error) {
        console.error('Error loading products:', error);
        this.allProducts = [];
      }
    },

    async loadDocuments() {
      try {
        this.loading = true;
        const token = localStorage.getItem('token');

        const params = {
          limit: this.pagination.pageSize,
          offset: (this.pagination.current - 1) * this.pagination.pageSize,
          ...this.filters
        };

        const response = await axios.get(`${API_URL}/cargo-descargo`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        });

        if (response.data.success) {
          const data = response.data.data || [];
          // Asegurar que documents sea siempre un array
          this.documents = Array.isArray(data) ? data : [data];
          this.pagination.total = response.data.total || this.documents.length;
          this.updateStats();
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        this.loading = false;
      }
    },

    updateStats() {
      this.stats.draft = this.documents.filter(d => d.status === 'BORRADOR').length;
      this.stats.processed = this.documents.filter(d => d.status === 'PROCESADO').length;
      this.stats.cancelled = this.documents.filter(d => d.status === 'CANCELADO').length;
    },

    handleTableChange(pagination) {
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;
      this.loadDocuments();
    },

    clearFilters() {
      this.filters = {
        document_type: '',
        warehouse_id: '',
        status: '',
        date_from: '',
        date_to: ''
      };
      this.loadDocuments();
    },

    // Modal control
    closeFormModal() {
      this.showFormModal = false;
      this.selectedProducts = [];
      this.isEdit = false;
      this.editingId = null;
    },

    // Document operations
    createNewDocument(type) {
      this.isEdit = false;
      this.editingId = null;
      this.form = {
        document_type: type,
        warehouse_id: this.warehouses.length > 0 ? this.warehouses[0].value : null,
        issuer: this.getCurrentUserName(),
        concept: '',
        registration_date: this.getHondurasDate()
      };
      this.selectedProducts = [];
      this.productSearch = '';
      this.searchResults = [];
      this.showFormModal = true;
    },

    async editDocument(record) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/cargo-descargo/${record.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const doc = response.data.data;
          this.isEdit = true;
          this.editingId = doc.id;

          this.form = {
            document_type: doc.document_type,
            warehouse_id: doc.warehouse_id,
            issuer: doc.issuer,
            concept: doc.concept,
            registration_date: doc.registration_date
          };

          this.selectedProducts = doc.details.map(d => ({
            product_id: d.product_id,
            product_code: d.product_code,
            product_name: d.product_name,
            quantity: d.quantity,
            unit_cost: d.unit_cost,
            total_cost: d.total_cost,
            warehouse_location: d.warehouse_location || '',
            sub_warehouse: d.sub_warehouse || '',
            current_stock: d.current_stock || 0,
            notes: d.notes || ''
          }));

          this.showFormModal = true;
        }
      } catch (error) {
        console.error('Error loading document:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el documento'
        });
      }
    },

    async viewDocument(record) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/cargo-descargo/${record.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.currentDocument = response.data.data;
          this.showDocumentModal = true;
        }
      } catch (error) {
        console.error('Error loading document:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el documento'
        });
      }
    },

    closeDocumentModal() {
      this.showDocumentModal = false;
      this.showExportDropdown = false;
      this.currentDocument = null;
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
      const doc = this.currentDocument;

      const data = [
        [doc.document_type],
        [''],
        ['Empresa:', this.companyInfo.company_name],
        ['Documento:', doc.document_number],
        ['Tipo:', doc.document_type],
        ['Emisor:', doc.issuer],
        ['Fecha:', this.formatDate(doc.registration_date)],
        ['Bodega:', doc.warehouse_name],
        ['Estado:', doc.status],
        ['Concepto:', doc.concept || ''],
        [''],
        ['Código', 'Producto', 'Cantidad', 'Costo Unit.', 'Total']
      ];

      doc.details.forEach(item => {
        data.push([
          item.product_code,
          item.product_name,
          item.quantity,
          item.unit_cost,
          item.total_cost
        ]);
      });

      data.push(['']);
      data.push(['', '', '', 'SUBTOTAL:', doc.subtotal]);
      data.push(['', '', '', 'IMPUESTO (15%):', doc.tax_amount]);
      data.push(['', '', '', 'TOTAL:', doc.total_amount]);

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Documento');
      XLSX.writeFile(wb, `${doc.document_type}_${doc.document_number}.xlsx`);
    },

    async exportToPDF() {
      this.showExportDropdown = false;
      try {
        const doc = this.currentDocument;
        const fileName = `${doc.document_type}_${doc.document_number}`;

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
        const doc = this.currentDocument;
        const fileName = `${doc.document_type}_${doc.document_number}`;

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
      const doc = this.currentDocument;
      const docTitle = `DOCUMENTO DE ${doc.document_type}`;
      const docColor = '#FF9800'; // Color naranja uniforme

      // Construir filas de la tabla
      let tableRows = '';
      doc.details.forEach((item, index) => {
        tableRows += `
          <tr>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${String(index + 1).padStart(2, '0')}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.product_code || 'N/A'}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.product_name || 'N/A'}</td>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${this.formatCurrency(item.quantity)}</td>
            <td style="padding: 6px; text-align: right; border-bottom: 1px solid #e0e0e0; font-size: 10px;">L ${this.formatCurrency(item.unit_cost)}</td>
            <td style="padding: 6px; text-align: right; border-bottom: 1px solid #e0e0e0; font-size: 10px;">L ${this.formatCurrency(item.total_cost)}</td>
          </tr>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${docTitle} - ${doc.document_number}</title>
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
            .products-table thead th:nth-child(4) { text-align: center; }
            .products-table thead th:nth-child(5),
            .products-table thead th:nth-child(6) { text-align: right; }
            .products-table tbody tr:hover { background: #fffbf0; }
            .summary-section {
              margin-top: 20px;
              padding: 15px;
              border: 2px solid ${docColor};
              border-radius: 4px;
              background: #fff8f0;
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
              font-size: 12px;
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
                  <strong>Emisor:</strong> ${doc.issuer || 'N/A'}<br>
                  <strong>Bodega:</strong> ${doc.warehouse_name || 'N/A'}
                </div>
              </div>
              <div class="invoice-header">
                <div class="invoice-title">${docTitle}</div>
                <div class="invoice-meta">
                  <strong>#Control Interno:</strong> ${doc.document_number}<br>
                  <strong>Sucursal:</strong> ${doc.warehouse_name || 'Principal'}<br>
                  <strong>Emisión:</strong> ${this.formatDate(doc.registration_date)}<br>
                  <strong>Estado:</strong> ${doc.status}
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
                  <th>COSTO UNIT.</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="summary-section">
              <div class="summary-title">Resumen del Documento</div>
              <div class="summary-row">
                <span><strong>SUBTOTAL:</strong></span>
                <span><strong>L ${this.formatCurrency(doc.subtotal)}</strong></span>
              </div>
              <div class="summary-row">
                <span><strong>IMPUESTO (15%):</strong></span>
                <span><strong>L ${this.formatCurrency(doc.tax_amount)}</strong></span>
              </div>
              <div class="summary-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 14px;">
                <span><strong style="color: ${docColor};">TOTAL:</strong></span>
                <span><strong style="color: ${docColor};">L ${this.formatCurrency(doc.total_amount)}</strong></span>
              </div>
              ${doc.concept ? `
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
                  <strong>Concepto:</strong> ${doc.concept}
                </div>
              ` : ''}
              ${doc.notes ? `
                <div style="margin-top: 10px;">
                  <strong>Observaciones:</strong> ${doc.notes}
                </div>
              ` : ''}
            </div>
          </div>
        </body>
        </html>
      `;

      return html;
    },

    async saveDocument() {
      if (!this.form.warehouse_id) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe seleccionar una bodega' });
        return;
      }

      if (!this.form.issuer) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe ingresar el emisor' });
        return;
      }

      if (this.selectedProducts.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe agregar al menos un producto' });
        return;
      }

      try {
        const token = localStorage.getItem('token');

        const data = {
          document_data: {
            ...this.form,
            subtotal: this.subtotal,
            tax_amount: this.tax,
            total_amount: this.total,
            status: 'PROCESADO'
          },
          details: this.selectedProducts
        };

        let response;
        if (this.isEdit) {
          response = await axios.put(`${API_URL}/cargo-descargo/${this.editingId}`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          response = await axios.post(`${API_URL}/cargo-descargo`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `Documento ${this.isEdit ? 'actualizado' : 'creado'} correctamente`,
            timer: 1500,
            showConfirmButton: false
          });
          this.showFormModal = false;
          this.loadDocuments();
        }
      } catch (error) {
        console.error('Error saving document:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo guardar el documento'
        });
      }
    },

    async processDocument(id) {
      const result = await Swal.fire({
        title: '¿Procesar documento?',
        text: 'Al procesar, el inventario será actualizado. Esta acción no se puede deshacer.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, procesar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post(`${API_URL}/cargo-descargo/${id}/process`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Procesado',
              text: 'Documento procesado correctamente',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadDocuments();
          }
        } catch (error) {
          console.error('Error processing document:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'No se pudo procesar el documento'
          });
        }
      }
    },

    async deleteDocument(id) {
      const result = await Swal.fire({
        title: '¿Eliminar documento?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33'
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.delete(`${API_URL}/cargo-descargo/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Documento eliminado correctamente',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadDocuments();
          }
        } catch (error) {
          console.error('Error deleting document:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'No se pudo eliminar el documento'
          });
        }
      }
    },

    // Product search operations (similar a cupones)
    async searchProducts() {
      if (!this.productSearch || this.productSearch.trim() === '') {
        this.searchResults = [];
        return;
      }

      // Asegurar que allProducts sea un array
      if (!Array.isArray(this.allProducts)) {
        console.error('allProducts no es un array:', this.allProducts);
        this.allProducts = [];
        this.searchResults = [];
        return;
      }

      const searchTerm = this.productSearch.toLowerCase().trim();
      const filtered = this.allProducts.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm) ||
        (p.code || '').toLowerCase().includes(searchTerm) ||
        (p.sku || '').toLowerCase().includes(searchTerm)
      );

      this.searchResults = filtered;
      this.searchResultsCurrentPage = 1;
    },

    addProductToDocument(product) {
      // Verificar si ya está agregado
      if (this.selectedProducts.find(p => p.product_id === product.id)) {
        Swal.fire({
          icon: 'info',
          title: 'Producto ya agregado',
          text: 'Este producto ya está en la lista',
          timer: 1500,
          showConfirmButton: false
        });
        return;
      }

      // Agregar producto
      this.selectedProducts.push({
        product_id: product.id,
        product_code: product.code || product.sku,
        product_name: product.name,
        quantity: 1,
        unit_cost: product.cost || 0,
        total_cost: product.cost || 0,
        current_stock: product.stock || 0,
        warehouse_location: '',
        sub_warehouse: '',
        notes: ''
      });

      // Limpiar búsqueda
      this.productSearch = '';
      this.searchResults = [];
    },

    calculateProductTotal(index) {
      const product = this.selectedProducts[index];
      product.total_cost = product.quantity * product.unit_cost;
    },

    removeProduct(index) {
      this.selectedProducts.splice(index, 1);
    }
  }
};
</script>

<style scoped>
.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8f9fa;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.modal {
  z-index: 1050;
}
</style>
