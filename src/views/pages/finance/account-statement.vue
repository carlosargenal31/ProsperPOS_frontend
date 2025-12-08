<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4 class="fw-bold">Estado Cuenta Ventas</h4>
            <h6>Reporte consolidado de documentos de ventas</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="exportAllToPDF" data-bs-toggle="tooltip" data-bs-placement="top" title="Pdf">
              <img src="@/assets/img/icons/pdf.svg" alt="img" />
            </a>
          </li>
          <li>
            <a @click="exportAllToExcel" data-bs-toggle="tooltip" data-bs-placement="top" title="Excel">
              <img src="@/assets/img/icons/excel.svg" alt="img" />
            </a>
          </li>
          <li>
            <a @click="refreshDocuments" data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh">
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Collapse"
              id="collapse-header"
              @click="toggleHeader"
            >
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
      </div>

      <!-- Filters Card -->
      <div class="card">
        <div class="card-body">
          <div class="row row-gap-2 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Cliente</label>
              <div class="input-group">
                <button class="btn btn-info btn-sm" @click="showCustomerModal = true">
                  <i class="ti ti-search"></i>
                </button>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :value="selectedCustomerName"
                  readonly
                  placeholder="Nombre Cliente"
                />
              </div>
            </div>
            <div class="col-md-2">
              <label class="form-label">Tipo de documento</label>
              <select class="form-select form-select-sm" v-model="filters.document_type">
                <option value="">TODOS LOS DOCUMENTOS</option>
                <option value="factura">FACTURA</option>
                <option value="cotizacion">COTIZACIÓN</option>
                <option value="factura_espera">FACT EN ESPERA</option>
                <option value="guia_remision">GUÍA DE REMISIÓN</option>
                <option value="devolucion">DEVOLUCIÓN</option>
                <option value="nota_credito">NOTA DE CRÉDITO</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Estatus</label>
              <select class="form-select form-select-sm" v-model="filters.status">
                <option value="">TODOS LOS ESTATUS</option>
                <option value="paid">COBRADO</option>
                <option value="active">ACTIVO</option>
                <option value="pending">PENDIENTE</option>
                <option value="converted_to_invoice">IMPORTADO</option>
                <option value="overdue">VENCIDO</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Buscar por:</label>
              <select class="form-select form-select-sm" v-model="filters.search_by">
                <option value="resolution">Resolución</option>
                <option value="customer">Cliente</option>
                <option value="date">Fecha</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Ordenar Por</label>
              <select class="form-select form-select-sm" v-model="filters.sort_by">
                <option value="emission">Fecha de Emisión</option>
                <option value="due_date">Fecha de Vence</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Agencia</label>
              <select class="form-select form-select-sm" v-model="filters.branch">
                <option value="">TODAS LAS AGENCIAS</option>
                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.nombre }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Vendedor</label>
              <select class="form-select form-select-sm" v-model="filters.vendor">
                <option value="">TODOS LOS VENDEDORES</option>
                <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                  {{ vendor.name }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Fecha Emisión Desde</label>
              <input type="date" class="form-control form-control-sm" v-model="filters.date_from" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Fecha Hasta</label>
              <input type="date" class="form-control form-control-sm" v-model="filters.date_to" />
            </div>
            <div class="col-md-2">
              <button class="btn btn-secondary btn-sm w-100" @click="clearFilters">
                <i class="ti ti-x me-1"></i> LIMPIAR FILTROS
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents Table -->
      <div class="card table-list-card">
        <div class="card-header">
          <h4>Documentos de Ventas ({{ filteredDocuments.length }} registros)</h4>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Emisión</th>
                  <th>Vence</th>
                  <th>Documento</th>
                  <th>Agencia</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Usuario</th>
                  <th class="text-end">Total(L)</th>
                  <th>Estatus</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in paginatedDocuments" :key="`${doc.type}-${doc.id}`">
                  <td class="p-2">{{ formatDate(doc.emission_date) }}</td>
                  <td class="p-2">{{ formatDueDate(doc.emission_date, doc.type) }}</td>
                  <td class="p-2">
                    <div>
                      <span class="badge" :class="getDocTypeBadgeClass(doc.type)">
                        {{ getDocTypeLabel(doc.type) }}
                      </span>
                    </div>
                    <a href="#" class="text-primary">{{ doc.document_number }}</a>
                  </td>
                  <td class="p-2">{{ doc.branch_name || 'AGENCIA PRINCIPAL' }}</td>
                  <td class="p-2">{{ doc.customer_name }}</td>
                  <td class="p-2">{{ doc.seller_name || 'N/A' }}</td>
                  <td class="p-2">{{ doc.created_by_name || 'N/A' }}</td>
                  <td class="p-2 text-end fw-bold">{{ formatCurrency(doc.total) }}</td>
                  <td class="p-2">
                    <span class="badge" :class="getStatusBadgeClass(doc.status)">
                      {{ getStatusLabel(doc.status) }}
                    </span>
                  </td>
                  <td class="p-2 text-center">
                    <button class="btn btn-sm btn-outline-primary" @click="viewDocument(doc)">
                      <i class="ti ti-eye"></i> Visualizar
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredDocuments.length === 0">
                  <td colspan="10" class="text-center text-muted p-4">
                    No hay documentos para mostrar
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="card-footer d-flex justify-content-between align-items-center" v-if="filteredDocuments.length > 0">
          <div>
            Mostrando {{ ((currentPage - 1) * perPage) + 1 }} a {{ Math.min(currentPage * perPage, filteredDocuments.length) }} de {{ filteredDocuments.length }} registros
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary" @click="previousPage" :disabled="currentPage === 1">
              <i class="ti ti-chevron-left"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary" disabled>
              Página {{ currentPage }} de {{ totalPages }}
            </button>
            <button class="btn btn-sm btn-outline-primary" @click="nextPage" :disabled="currentPage === totalPages">
              <i class="ti ti-chevron-right"></i>
            </button>
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

  <!-- Modal de Búsqueda de Cliente -->
  <div class="modal fade" :class="{ show: showCustomerModal }" :style="{ display: showCustomerModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Búsqueda de Cliente</h5>
          <button type="button" class="btn-close btn-close-white" @click="showCustomerModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <input
              type="text"
              class="form-control"
              v-model="customerSearchQuery"
              placeholder="Buscar cliente por nombre o RTN..."
              @input="searchCustomers"
            />
          </div>
          <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="table table-sm table-hover">
              <thead class="table-light sticky-top">
                <tr>
                  <th>Nombre</th>
                  <th>RTN</th>
                  <th>Teléfono</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in filteredCustomers" :key="customer.id">
                  <td>{{ customer.nombre || customer.name }}</td>
                  <td>{{ customer.rtn || 'N/A' }}</td>
                  <td>{{ customer.telefono || customer.phone || 'N/A' }}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" @click="selectCustomer(customer)">
                      Seleccionar
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredCustomers.length === 0">
                  <td colspan="4" class="text-center text-muted">No se encontraron clientes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showCustomerModal" @click="showCustomerModal = false"></div>

  <!-- Modal de Visualización de Documento -->
  <div class="modal fade" :class="{ show: showDocumentModal }" :style="{ display: showDocumentModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-white py-2">
          <h6 class="modal-title mb-0">
            {{ currentDocument ? getDocTypeLabel(currentDocument.type) : 'Documento' }} - {{ currentDocument ? currentDocument.document_number : '' }}
          </h6>
          <button type="button" class="btn-close" @click="closeDocumentModal"></button>
        </div>

        <div class="modal-body py-2 px-3">
          <!-- Preview del documento -->
          <div ref="documentContent" class="border p-2 bg-white document-preview" style="max-height: 450px; overflow-y: auto;">
            <div v-if="currentDocument">

              <!-- VISTA PARA GUÍAS DE REMISIÓN -->
              <div v-if="currentDocument.type === 'guia_remision'">
                <!-- Título -->
                <div class="text-center mb-2 p-2 bg-warning text-dark">
                  <strong style="font-size: 13px;">🚚 Detalle de Guía de Remisión #{{ currentDocument.document_number }}</strong>
                </div>

                <!-- Información General -->
                <div class="mb-2 p-2 border-bottom">
                  <div class="d-flex align-items-center mb-1">
                    <i class="ti ti-info-circle me-2 text-primary"></i>
                    <strong style="font-size: 11px;">Información General</strong>
                  </div>
                  <div class="row" style="font-size: 10px;">
                    <div class="col-6"><strong>Número de Guía:</strong> {{ currentDocument.document_number }}</div>
                    <div class="col-6"><strong>Fecha de Emisión:</strong> {{ formatDate(currentDocument.emission_date) }}</div>
                    <div class="col-6"><strong>Estado:</strong> <span class="badge bg-warning">{{ currentDocument.status }}</span></div>
                    <div class="col-6"><strong>Factura Relacionada:</strong> {{ currentDocument.invoice_number || '#N' }}</div>
                  </div>
                </div>

                <!-- Cliente -->
                <div class="mb-2 p-2 border-bottom">
                  <div class="d-flex align-items-center mb-1">
                    <i class="ti ti-user me-2 text-success"></i>
                    <strong style="font-size: 11px;">Cliente</strong>
                  </div>
                  <div style="font-size: 10px;">
                    <strong>Nombre:</strong> {{ currentDocument.customer_name || 'CONSUMIDOR FINAL' }}
                  </div>
                </div>

                <!-- Receptor (si existe) -->
                <div class="mb-2 p-2 border-bottom" v-if="currentDocument.receiver_name">
                  <div class="d-flex align-items-center mb-1">
                    <i class="ti ti-user-check me-2 text-info"></i>
                    <strong style="font-size: 11px;">Receptor</strong>
                  </div>
                  <div class="row" style="font-size: 10px;">
                    <div class="col-6"><strong>Nombre:</strong> {{ currentDocument.receiver_name }}</div>
                    <div class="col-6"><strong>Teléfono:</strong> {{ currentDocument.receiver_phone || 'N/A' }}</div>
                  </div>
                  <div v-if="currentDocument.receiver_alt_name" class="mt-1" style="font-size: 10px;">
                    <strong>Receptor Alternativo:</strong> {{ currentDocument.receiver_alt_name }} - {{ currentDocument.receiver_alt_phone || 'N/A' }}
                  </div>
                </div>

                <!-- Transporte -->
                <div class="mb-2 p-2 border-bottom">
                  <div class="d-flex align-items-center mb-1">
                    <i class="ti ti-truck me-2 text-danger"></i>
                    <strong style="font-size: 11px;">Transporte</strong>
                  </div>
                  <div class="row" style="font-size: 10px;">
                    <div class="col-6"><strong>Conductor:</strong> {{ currentDocument.driver_name || 'N/A' }}</div>
                    <div class="col-6"><strong>Licencia:</strong> {{ currentDocument.driver_license || 'N/A' }}</div>
                    <div class="col-6"><strong>Vehículo:</strong> {{ currentDocument.vehicle_plate || 'N/A' }}</div>
                    <div class="col-6"><strong>Acompañante:</strong> {{ currentDocument.assistant_name || 'N/A' }}</div>
                  </div>
                </div>

                <!-- Origen y Destino -->
                <div class="row mb-2">
                  <div class="col-6 p-2 border-end">
                    <div class="d-flex align-items-center mb-1">
                      <i class="ti ti-map-pin me-2 text-secondary"></i>
                      <strong style="font-size: 11px;">Origen</strong>
                    </div>
                    <div style="font-size: 10px;">
                      <strong>Dirección:</strong> {{ currentDocument.origin_address || 'N/A' }}<br>
                      <strong>Ciudad:</strong> {{ currentDocument.origin_city || 'LA CEIBA' }}, {{ currentDocument.origin_state || 'Atlántida' }}
                    </div>
                  </div>
                  <div class="col-6 p-2">
                    <div class="d-flex align-items-center mb-1">
                      <i class="ti ti-map-pin-filled me-2 text-primary"></i>
                      <strong style="font-size: 11px;">Destino</strong>
                    </div>
                    <div style="font-size: 10px;">
                      <strong>Dirección:</strong> {{ currentDocument.destination_address || 'N/A' }}<br>
                      <strong>Ciudad:</strong> {{ currentDocument.destination_city || 'El Porvenir' }}, {{ currentDocument.destination_state || 'Atlántida' }}
                      <div v-if="currentDocument.destination_reference"><small>{{ currentDocument.destination_reference }}</small></div>
                    </div>
                  </div>
                </div>

                <!-- Observaciones -->
                <div v-if="currentDocument.notes" class="mb-2 p-2 border-top">
                  <div class="d-flex align-items-center mb-1">
                    <i class="ti ti-note me-2"></i>
                    <strong style="font-size: 11px;">Observaciones</strong>
                  </div>
                  <div style="font-size: 10px;">{{ currentDocument.notes }}</div>
                </div>

                <!-- Productos Transportados -->
                <div class="mb-2 p-2 border-top">
                  <div class="d-flex align-items-center mb-2">
                    <i class="ti ti-package me-2 text-success"></i>
                    <strong style="font-size: 11px;">Productos Transportados</strong>
                  </div>
                  <table class="table table-sm table-bordered mb-0" style="font-size: 10px;">
                    <thead class="table-light">
                      <tr>
                        <th style="padding: 3px;">Código</th>
                        <th style="padding: 3px;">Artículo</th>
                        <th class="text-center" style="padding: 3px;">Peso/Unit</th>
                        <th class="text-center" style="padding: 3px;">Cantidad</th>
                        <th class="text-center" style="padding: 3px;">Peso Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in currentDocument.items" :key="item.id">
                        <td style="padding: 3px;">{{ item.product_code || item.codigo || 'N/A' }}</td>
                        <td style="padding: 3px;">{{ item.product_name }}</td>
                        <td class="text-center" style="padding: 3px;">{{ formatWeight(item.weight) }}</td>
                        <td class="text-center" style="padding: 3px;">{{ item.quantity }}</td>
                        <td class="text-center" style="padding: 3px;">{{ formatTotalWeight(item.weight, item.quantity) }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr class="table-active">
                        <td colspan="4" class="text-end" style="padding: 3px;"><strong>PESO TOTAL:</strong></td>
                        <td class="text-center" style="padding: 3px;"><strong>{{ getTotalWeightForDocument(currentDocument.items) }}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <!-- VISTA PARA OTROS DOCUMENTOS (FACTURAS, COTIZACIONES, etc) -->
              <div v-else>
                <!-- Header de la empresa -->
                <div class="text-center mb-3">
                  <strong style="font-size: 14px;">{{ companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 11px;">{{ companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 11px;">Tel: {{ companyInfo.telefono || 'N/A' }} | RTN: {{ companyInfo.rtn || 'N/A' }}</small>
                </div>

                <!-- Tipo de documento -->
                <h6 class="text-center mb-3" :class="getDocTypeTitleClass(currentDocument.type)" style="font-size: 15px;">
                  {{ getDocTypeLabel(currentDocument.type) }}
                </h6>

                <!-- Información del documento -->
                <div class="row mb-3" style="font-size: 11px;">
                  <div class="col-6">
                    <strong>Nro. Documento:</strong> {{ currentDocument.document_number }}<br>
                    <strong>Fecha Emisión:</strong> {{ formatDate(currentDocument.emission_date) }}<br>
                    <strong v-if="currentDocument.due_date">Fecha Vence:</strong> {{ formatDate(currentDocument.due_date) }}
                  </div>
                  <div class="col-6">
                    <strong>Cliente:</strong> {{ currentDocument.customer_name }}<br>
                    <strong>RTN Cliente:</strong> {{ currentDocument.customer_rtn || '00000000000000' }}<br>
                    <strong>Vendedor:</strong> {{ currentDocument.seller_name || 'N/A' }}
                  </div>
                </div>

                <!-- Tabla de productos - FACTURAS, COTIZACIONES, etc -->
                <table class="table table-sm table-bordered mb-2" style="font-size: 10px;">
                <thead class="table-light">
                  <tr>
                    <th style="padding: 4px;">Código</th>
                    <th style="padding: 4px;">Producto</th>
                    <th class="text-end" style="padding: 4px;">Cant.</th>
                    <th class="text-end" style="padding: 4px;">Precio Unit.</th>
                    <th class="text-end" style="padding: 4px;">Desc %</th>
                    <th class="text-end" style="padding: 4px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in currentDocument.items" :key="item.id">
                    <td style="padding: 4px;">{{ item.product_code || item.codigo || 'N/A' }}</td>
                    <td style="padding: 4px;">{{ item.product_name }}</td>
                    <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.quantity) }}</td>
                    <td class="text-end" style="padding: 4px;">L {{ formatCurrency(item.unit_price || item.price) }}</td>
                    <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.discount_value || 0) }}%</td>
                    <td class="text-end" style="padding: 4px;">L {{ formatCurrency(calculateItemTotal(item)) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="5" class="text-end" style="padding: 4px;"><strong>SUBTOTAL:</strong></td>
                    <td class="text-end" style="padding: 4px;">L {{ formatCurrency(currentDocument.subtotal || 0) }}</td>
                  </tr>
                  <tr>
                    <td colspan="5" class="text-end" style="padding: 4px;"><strong>DESCUENTO:</strong></td>
                    <td class="text-end" style="padding: 4px;">L {{ formatCurrency(currentDocument.discount || 0) }}</td>
                  </tr>
                  <tr>
                    <td colspan="5" class="text-end" style="padding: 4px;"><strong>ISV 15%:</strong></td>
                    <td class="text-end" style="padding: 4px;">L {{ formatCurrency(currentDocument.tax || 0) }}</td>
                  </tr>
                  <tr class="table-active">
                    <td colspan="5" class="text-end" style="padding: 4px;"><strong>TOTAL:</strong></td>
                    <td class="text-end" style="padding: 4px;"><strong>L {{ formatCurrency(currentDocument.total) }}</strong></td>
                  </tr>
                </tfoot>
              </table>

              <div v-if="currentDocument.notes" class="mb-1" style="font-size: 10px;">
                <strong>Notas:</strong> {{ currentDocument.notes }}
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

export default {
  data() {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      showCustomerModal: false,
      showDocumentModal: false,
      showExportDropdown: false,
      currentDocument: null,
      documents: [],
      customers: [],
      branches: [],
      vendors: [],
      customerSearchQuery: '',
      selectedCustomer: null,
      filters: {
        customer_id: '',
        document_type: '',
        status: '',
        search_by: 'resolution',
        sort_by: 'emission',
        branch: '',
        vendor: '',
        date_from: `${firstOfMonth.getFullYear()}-${String(firstOfMonth.getMonth() + 1).padStart(2, '0')}-01`,
        date_to: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      },
      companyInfo: {},
      currentPage: 1,
      perPage: 10,
      isLoading: false
    };
  },
  computed: {
    selectedCustomerName() {
      return this.selectedCustomer ? (this.selectedCustomer.nombre || this.selectedCustomer.name) : '';
    },
    filteredCustomers() {
      if (!this.customerSearchQuery) return this.customers;

      const query = this.customerSearchQuery.toLowerCase();
      return this.customers.filter(c => {
        const name = (c.nombre || c.name || '').toLowerCase();
        const rtn = (c.rtn || '').toLowerCase();
        return name.includes(query) || rtn.includes(query);
      });
    },
    filteredDocuments() {
      let docs = [...this.documents];

      // Filtro por cliente
      if (this.filters.customer_id) {
        docs = docs.filter(d => d.customer_id === this.filters.customer_id);
      }

      // Filtro por tipo de documento
      if (this.filters.document_type) {
        docs = docs.filter(d => d.type === this.filters.document_type);
      }

      // Filtro por estatus
      if (this.filters.status) {
        docs = docs.filter(d => d.status === this.filters.status);
      }

      // Filtro por agencia
      if (this.filters.branch) {
        docs = docs.filter(d => d.branch_id == this.filters.branch);
      }

      // Filtro por vendedor
      if (this.filters.vendor) {
        docs = docs.filter(d => d.seller_id == this.filters.vendor);
      }

      // Ordenamiento
      if (this.filters.sort_by === 'emission') {
        docs.sort((a, b) => new Date(b.emission_date) - new Date(a.emission_date));
      } else if (this.filters.sort_by === 'due_date') {
        docs.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        });
      }

      return docs;
    },
    paginatedDocuments() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredDocuments.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredDocuments.length / this.perPage);
    }
  },
  watch: {
    'filters.customer_id'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.document_type'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.status'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.branch'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.vendor'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.date_from'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.date_to'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.sort_by'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    }
  },
  mounted() {
    this.loadCompanyInfo();
    this.loadCustomers();
    this.loadBranches();
    this.loadVendors();
    this.loadAllDocuments();
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
    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
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
    async loadCustomers() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.customers = response.data.data.data || response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading customers:', error);
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
    async loadVendors() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            limit: 10000,
            role: 4  // Role de vendedor
          }
        });

        console.log('📦 Vendors response:', response.data);

        let usersData = [];

        // Estructura: { success: true, data: { data: [...], pagination: {...} } }
        if (response.data && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          console.log('✅ Found users in response.data.data.data');
          usersData = response.data.data.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log('✅ Found users in response.data.data (as array)');
          usersData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          console.log('✅ Found users in response.data');
          usersData = response.data;
        }

        console.log(`📋 Total vendedores encontrados: ${usersData.length}`);

        this.vendors = usersData.map(u => ({
          id: u.id,
          code: u.id,
          name: `${u.first_name} ${u.last_name}`.trim()
        }));

        console.log('✅ Vendedores cargados:', this.vendors);
      } catch (error) {
        console.error('❌ Error loading vendors:', error);
      }
    },
    async loadAllDocuments() {
      this.isLoading = true;
      const token = localStorage.getItem('token');

      try {
        // Usar el endpoint consolidado del backend
        const params = {};

        // Agregar filtros opcionales solo si tienen valor
        if (this.filters.date_from) params.date_from = this.filters.date_from;
        if (this.filters.date_to) params.date_to = this.filters.date_to;
        if (this.filters.customer_id) params.customer_id = this.filters.customer_id;
        if (this.filters.branch) params.branch_id = this.filters.branch;
        if (this.filters.vendor) params.seller_id = this.filters.vendor;
        if (this.filters.document_type) params.document_type = this.filters.document_type;
        if (this.filters.status) params.status = this.filters.status;

        const response = await axios.get('/api/v1/account-statement', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });

        if (response.data.success) {
          this.documents = response.data.data || [];
        } else {
          this.documents = [];
        }
      } catch (error) {
        console.error('Error loading documents:', error);
        this.documents = [];
      } finally {
        this.isLoading = false;
      }
    },
    searchCustomers() {
      // El filtrado se hace automáticamente en el computed property
    },
    selectCustomer(customer) {
      this.selectedCustomer = customer;
      this.filters.customer_id = customer.id;
      this.showCustomerModal = false;
    },
    clearFilters() {
      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      this.selectedCustomer = null;
      this.filters = {
        customer_id: '',
        document_type: '',
        status: '',
        search_by: 'resolution',
        sort_by: 'emission',
        branch: '',
        vendor: '',
        date_from: `${firstOfMonth.getFullYear()}-${String(firstOfMonth.getMonth() + 1).padStart(2, '0')}-01`,
        date_to: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      };
      this.currentPage = 1;
    },
    refreshDocuments() {
      this.loadAllDocuments();
    },
    async viewDocument(doc) {
      // Cargar los detalles completos del documento usando el endpoint consolidado
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(`/api/v1/account-statement/${doc.type}/${doc.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response && response.data.success) {
          this.currentDocument = response.data.data;
          this.showDocumentModal = true;
        }
      } catch (error) {
        console.error('Error loading document details:', error);
        // Fallback: usar el documento sin items detallados
        this.currentDocument = { ...doc, items: [] };
        this.showDocumentModal = true;
      }
    },
    closeDocumentModal() {
      this.showDocumentModal = false;
      this.showExportDropdown = false;
      this.currentDocument = null;
    },
    async exportDocument(format) {
      this.showExportDropdown = false;

      if (format === 'excel') {
        await this.exportToExcel();
      } else if (format === 'pdf') {
        await this.exportToPDF();
      } else if (format === 'image') {
        await this.exportToImage();
      }
    },
    async exportToExcel() {
      const data = [
        [this.getDocTypeLabel(this.currentDocument.type)],
        [''],
        ['Empresa:', this.companyInfo.company_name || 'EMPRESA'],
        ['Dirección:', this.companyInfo.direccion || 'Sin dirección'],
        ['Teléfono:', this.companyInfo.telefono || 'N/A'],
        [''],
        ['Nro. Documento:', this.currentDocument.document_number],
        ['Fecha Emisión:', this.formatDate(this.currentDocument.emission_date)],
        ['Cliente:', this.currentDocument.customer_name],
        ['Vendedor:', this.currentDocument.seller_name || 'N/A'],
        [''],
        ['Producto', 'Cantidad', 'Precio Unit.', 'Desc %', 'Total']
      ];

      this.currentDocument.items.forEach(item => {
        data.push([
          item.product_name,
          item.quantity,
          item.unit_price || item.price,
          item.discount_value || 0,
          this.calculateItemTotal(item)
        ]);
      });

      data.push(['']);
      data.push(['', '', '', 'SUBTOTAL:', this.currentDocument.subtotal || 0]);
      data.push(['', '', '', 'DESCUENTO:', this.currentDocument.discount || 0]);
      data.push(['', '', '', 'ISV:', this.currentDocument.tax || 0]);
      data.push(['', '', '', 'TOTAL:', this.currentDocument.total]);

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Documento');
      XLSX.writeFile(wb, `${this.getDocTypeLabel(this.currentDocument.type)}_${this.currentDocument.document_number}.xlsx`);
    },
    async exportToPDF() {
      try {
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
        pdf.save(`${this.getDocTypeLabel(this.currentDocument.type)}_${this.currentDocument.document_number}.pdf`);
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error al generar el PDF');
      }
    },
    async exportToImage() {
      try {
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
        link.download = `${this.getDocTypeLabel(this.currentDocument.type)}_${this.currentDocument.document_number}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Error al generar la imagen');
      }
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
    buildDocumentHTML() {
      const docTitle = this.getDocTypeLabel(this.currentDocument.type);

      let tableRows = '';
      this.currentDocument.items.forEach(item => {
        const total = this.calculateItemTotal(item);
        tableRows += `
          <tr>
            <td>${item.product_code || item.codigo || 'N/A'}</td>
            <td>${item.product_name}</td>
            <td style="text-align: right;">${this.formatCurrency(item.quantity)}</td>
            <td style="text-align: right;">${this.formatCurrency(item.unit_price || item.price)}</td>
            <td style="text-align: right;">${this.formatCurrency(item.discount_value || 0)}</td>
            <td style="text-align: right;">${this.formatCurrency(total)}</td>
          </tr>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${docTitle} - ${this.currentDocument.document_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .company-info { font-size: 12px; }
            .doc-title { color: #0066cc; font-weight: bold; margin: 20px 0; text-align: center; font-size: 18px; }
            .info-section { margin-bottom: 15px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ccc; }
            td { padding: 8px; border: 1px solid #ccc; }
            tfoot td { background: #f0f0f0; font-weight: bold; }
            @media print { body { margin: 0; } @page { size: letter; margin: 10mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <strong>${this.companyInfo.company_name || 'EMPRESA'}</strong><br>
              ${this.companyInfo.direccion || 'N/A'}<br>
              Tel: ${this.companyInfo.telefono || 'N/A'} | RTN: ${this.companyInfo.rtn || 'N/A'}
            </div>
          </div>

          <div class="doc-title">${docTitle}</div>

          <div class="info-section">
            <strong>Nro. Documento:</strong> ${this.currentDocument.document_number}<br>
            <strong>Fecha Emisión:</strong> ${this.formatDate(this.currentDocument.emission_date)}<br>
            <strong>Cliente:</strong> ${this.currentDocument.customer_name}<br>
            <strong>RTN:</strong> ${this.currentDocument.customer_rtn || 'N/A'}<br>
            <strong>Vendedor:</strong> ${this.currentDocument.seller_name || 'N/A'}
          </div>

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th style="text-align: right;">Cant.</th>
                <th style="text-align: right;">Precio</th>
                <th style="text-align: right;">Desc</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" style="text-align: right;">SUBTOTAL</td>
                <td style="text-align: right;">${this.formatCurrency(this.currentDocument.subtotal || 0)}</td>
              </tr>
              <tr>
                <td colspan="5" style="text-align: right;">DESCUENTO</td>
                <td style="text-align: right;">${this.formatCurrency(this.currentDocument.discount || 0)}</td>
              </tr>
              <tr>
                <td colspan="5" style="text-align: right;">ISV 15%</td>
                <td style="text-align: right;">${this.formatCurrency(this.currentDocument.tax || 0)}</td>
              </tr>
              <tr>
                <td colspan="5" style="text-align: right;"><strong>TOTAL</strong></td>
                <td style="text-align: right;"><strong>${this.formatCurrency(this.currentDocument.total)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;

      return html;
    },
    exportAllToPDF() {
      // Exportar todos los documentos filtrados a PDF
      alert('Función de exportar todos a PDF en desarrollo');
    },
    exportAllToExcel() {
      // Exportar todos los documentos filtrados a Excel
      const data = [
        ['Estado de Cuenta Ventas'],
        ['Fecha Generación:', new Date().toLocaleString()],
        [''],
        ['Emisión', 'Vence', 'Tipo Doc', 'Nro. Documento', 'Cliente', 'Vendedor', 'Total', 'Pagado', 'Pendiente', 'Estatus']
      ];

      this.filteredDocuments.forEach(doc => {
        data.push([
          this.formatDate(doc.emission_date),
          this.formatDate(doc.due_date),
          this.getDocTypeLabel(doc.type),
          doc.document_number,
          doc.customer_name,
          doc.seller_name || 'N/A',
          doc.total,
          doc.paid_amount || 0,
          doc.pending_amount || 0,
          this.getStatusLabel(doc.status)
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Estado Cuenta Ventas');
      XLSX.writeFile(wb, `Estado_Cuenta_Ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
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
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    },
    formatDateTime(dateStr) {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    },
    formatDueDate(emissionDate, docType) {
      if (!emissionDate) return 'N/A';

      const date = new Date(emissionDate);
      let daysToAdd = 0;

      // Calcular días de vencimiento según tipo
      if (docType === 'factura') {
        daysToAdd = 7; // 7 días
      } else if (docType === 'cotizacion') {
        daysToAdd = 15; // 15 días
      } else if (docType === 'factura_espera') {
        daysToAdd = 0; // Mismo día
      } else if (docType === 'guia_remision') {
        daysToAdd = 0; // Mismo día
      } else {
        return 'N/A';
      }

      const dueDate = new Date(date);
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      return this.formatDate(dueDate);
    },
    getDocTypeLabel(type) {
      const labels = {
        'factura': 'FACTURA',
        'guia_remision': 'GUÍA DE REMISIÓN',
        'factura_espera': 'FACT EN ESPERA',
        'cotizacion': 'COTIZACIÓN',
        'nota_credito': 'NOTA DE CRÉDITO',
        'devolucion': 'DEVOLUCIÓN'
      };
      return labels[type] || type.toUpperCase();
    },
    getDocTypeBadgeClass(type) {
      const classes = {
        'factura': 'bg-success',
        'guia_remision': 'bg-info',
        'factura_espera': 'bg-warning',
        'cotizacion': 'bg-primary',
        'nota_credito': 'bg-danger',
        'devolucion': 'bg-dark'
      };
      return classes[type] || 'bg-secondary';
    },
    getDocTypeTitleClass(type) {
      const classes = {
        'factura': 'text-success',
        'guia_remision': 'text-info',
        'factura_espera': 'text-warning',
        'cotizacion': 'text-primary',
        'nota_credito': 'text-danger',
        'devolucion': 'text-dark'
      };
      return classes[type] || 'text-secondary';
    },
    getStatusLabel(status) {
      const labels = {
        'paid': 'COBRADO',
        'pending': 'PENDIENTE',
        'active': 'ACTIVO',
        'converted_to_invoice': 'IMPORTADO',
        'imported': 'IMPORTADO',
        'overdue': 'VENCIDO',
        'overdue': 'VENCIDO',
        'imported': 'IMPORTADO',
        'cancelled': 'CANCELADO'
      };
      return labels[status] || status?.toUpperCase() || 'N/A';
    },
    getStatusBadgeClass(status) {
      const classes = {
        'paid': 'bg-success',
        'pending': 'bg-warning',
        'partial': 'bg-info',
        'overdue': 'bg-danger',
        'imported': 'bg-primary',
        'cancelled': 'bg-secondary'
      };
      return classes[status] || 'bg-secondary';
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    formatWeight(weight) {
      const w = parseFloat(weight) || 0;
      return w.toFixed(2);
    },
    formatTotalWeight(weight, qty) {
      const w = parseFloat(weight) || 0;
      const q = parseFloat(qty) || 0;
      return (w * q).toFixed(2);
    },
    getTotalWeightForDocument() {
      if (!this.currentDocument?.items || this.currentDocument.items.length === 0) return '0.00';
      const total = this.currentDocument.items.reduce((sum, item) => {
        const w = parseFloat(item.weight) || 0;
        const q = parseFloat(item.quantity) || 0;
        return sum + (w * q);
      }, 0);
      return total.toFixed(2);
    }
  }
};
</script>

<style scoped>
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

.table-hover tbody tr:hover {
  background-color: #f0f8ff;
}
</style>
