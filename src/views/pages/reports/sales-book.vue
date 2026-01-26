<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Libro de Ventas</h4>
            <h6>Gestiona tu libro de ventas con filtros avanzados</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li class="me-2">
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Refresh"
              @click="loadSalesBook"
              ><i class="ti ti-refresh"></i
            ></a>
          </li>
          <li class="me-2">
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Collapse"
              id="collapse-header"
              @click="toggleHeader"
              ><i class="ti ti-chevron-up"></i
            ></a>
          </li>
        </ul>
      </div>

      <!-- Summary Cards - 2 filas: 4 tarjetas arriba, 4 abajo -->
      <!-- Primera fila -->
      <div class="row gx-3 mb-3">
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-primary sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-primary text-white">
                <i class="ti ti-file-invoice"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Total Facturas</p>
                <h3 class="summary-value-md mb-0">{{ totals.total_facturas || 0 }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-warning sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-warning text-white">
                <i class="ti ti-rotate-clockwise"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Total Devoluciones</p>
                <h3 class="summary-value-md mb-0">{{ totals.total_devoluciones || 0 }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-success sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-success text-white">
                <i class="ti ti-currency-dollar"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Total General</p>
                <h3 class="summary-value-md mb-0">L {{ formatCurrency(totals.total_total) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-danger sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-danger text-white">
                <i class="ti ti-arrow-back"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Total Devuelto</p>
                <h3 class="summary-value-md mb-0">L {{ formatCurrency(totals.total_devuelto || 0) }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Segunda fila -->
      <div class="row gx-3">
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-info sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-info text-white">
                <i class="ti ti-calculator"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Subtotal</p>
                <h3 class="summary-value-md mb-0">L {{ formatCurrency(totals.subtotal_total) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-secondary sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-secondary text-white">
                <i class="ti ti-discount-2"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Descuentos</p>
                <h3 class="summary-value-md mb-0">L {{ formatCurrency(totals.descuento_total) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-purple sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-purple text-white">
                <i class="ti ti-plus"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Recargos</p>
                <h3 class="summary-value-md mb-0">L {{ formatCurrency(totals.recargos_total || 0) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-dark sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-dark text-white">
                <i class="ti ti-receipt-tax"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Impuestos</p>
                <h3 class="summary-value-md mb-0">L {{ formatCurrency(totals.impuesto_total) }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-lg-3 col-sm-6 col-12">
              <div class="input-blocks">
                <label>Fecha Desde</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="filters.date_from"
                  @change="loadSalesBook"
                />
              </div>
            </div>
            <div class="col-lg-3 col-sm-6 col-12">
              <div class="input-blocks">
                <label>Fecha Hasta</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="filters.date_to"
                  @change="loadSalesBook"
                />
              </div>
            </div>
            <div class="col-lg-3 col-sm-6 col-12">
              <div class="input-blocks">
                <label>Estado de Pago</label>
                <select
                  class="form-select"
                  v-model="filters.payment_status"
                  @change="loadSalesBook"
                >
                  <option value="">Todos</option>
                  <option value="paid">Cobrado</option>
                  <option value="returned">Devuelto</option>
                </select>
              </div>
            </div>
            <div class="col-lg-3 col-sm-6 col-12">
              <div class="input-blocks">
                <label>Columnas Visibles</label>
                <button
                  class="btn btn-outline-secondary w-100 text-start"
                  type="button"
                  @click.stop="showColumnSelector = !showColumnSelector"
                >
                  <i class="ti ti-columns"></i> Columnas ({{ visibleColumnsCount }}/{{ availableColumns.length }})
                </button>
                <div v-if="showColumnSelector" class="card mt-2 position-absolute" style="z-index: 1050; max-height: 400px; overflow-y: auto; min-width: 250px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div class="card-body">
                    <div v-for="col in availableColumns" :key="col.key" class="form-check mb-2">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="'col-' + col.key"
                        v-model="col.visible"
                      />
                      <label class="form-check-label" :for="'col-' + col.key">
                        {{ col.label }}
                      </label>
                    </div>
                    <hr>
                    <button class="btn btn-sm btn-primary w-100 mb-2" @click="selectAllColumns">
                      Seleccionar Todas
                    </button>
                    <button class="btn btn-sm btn-secondary w-100 mb-2" @click="deselectAllColumns">
                      Deseleccionar Todas
                    </button>
                    <button class="btn btn-sm btn-light w-100" @click="showColumnSelector = false">
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card table-list-card">
        <div class="card-body">
          <div class="table-top">
            <div class="search-set">
              <div class="search-input">
                <i class="ti ti-search search-icon"></i>
                <input
                  type="search"
                  class="form-control ps-5"
                  v-model="searchQuery"
                  placeholder="Buscar por número de documento, cliente, RTN, vendedor..."
                />
              </div>
            </div>
            <div class="form-sort">
              <button class="btn btn-primary" @click="showSaveReportModal = true">
                <i class="ti ti-download"></i> Guardar Reporte
              </button>
            </div>
          </div>

          <div class="table-responsive" v-if="!loading">
            <table class="table table-hover table-striped">
              <thead>
                <tr>
                  <th v-if="isColumnVisible('fecha')" @click="sortByColumn('fecha_operacion_raw')" class="cursor-pointer">
                    Fecha <i :class="getSortIcon('fecha_operacion_raw')"></i>
                  </th>
                  <th v-if="isColumnVisible('sucursal')" @click="sortByColumn('sucursal')" class="cursor-pointer">
                    Sucursal <i :class="getSortIcon('sucursal')"></i>
                  </th>
                  <th v-if="isColumnVisible('tipo_documento')" @click="sortByColumn('tipo_documento')" class="cursor-pointer">
                    Tipo Doc <i :class="getSortIcon('tipo_documento')"></i>
                  </th>
                  <th v-if="isColumnVisible('nro_documento')" @click="sortByColumn('nro_documento')" class="cursor-pointer">
                    Nro Documento <i :class="getSortIcon('nro_documento')"></i>
                  </th>
                  <th v-if="isColumnVisible('nro_autorizacion')" @click="sortByColumn('nro_autorizacion')" class="cursor-pointer">
                    Nro Autorización <i :class="getSortIcon('nro_autorizacion')"></i>
                  </th>
                  <th v-if="isColumnVisible('cliente')" @click="sortByColumn('razon_social')" class="cursor-pointer">
                    Cliente <i :class="getSortIcon('razon_social')"></i>
                  </th>
                  <th v-if="isColumnVisible('rtn')" @click="sortByColumn('rtn_cliente')" class="cursor-pointer">
                    RTN <i :class="getSortIcon('rtn_cliente')"></i>
                  </th>
                  <th v-if="isColumnVisible('estatus')" @click="sortByColumn('estatus_raw')" class="cursor-pointer">
                    Estatus <i :class="getSortIcon('estatus_raw')"></i>
                  </th>
                  <th v-if="isColumnVisible('subtotal')" @click="sortByColumn('subtotal')" class="text-end cursor-pointer">
                    Subtotal <i :class="getSortIcon('subtotal')"></i>
                  </th>
                  <th v-if="isColumnVisible('descuento')" @click="sortByColumn('descuento')" class="text-end cursor-pointer">
                    Descuento <i :class="getSortIcon('descuento')"></i>
                  </th>
                  <th v-if="isColumnVisible('impuesto')" @click="sortByColumn('impuesto')" class="text-end cursor-pointer">
                    Impuesto <i :class="getSortIcon('impuesto')"></i>
                  </th>
                  <th v-if="isColumnVisible('recargos')" @click="sortByColumn('recargos')" class="text-end cursor-pointer">
                    Recargos <i :class="getSortIcon('recargos')"></i>
                  </th>
                  <th v-if="isColumnVisible('total')" @click="sortByColumn('total')" class="text-end cursor-pointer">
                    Total <i :class="getSortIcon('total')"></i>
                  </th>
                  <th v-if="isColumnVisible('devuelto')" @click="sortByColumn('devuelto')" class="text-end cursor-pointer">
                    Devuelto <i :class="getSortIcon('devuelto')"></i>
                  </th>
                  <th v-if="isColumnVisible('vendedor')" @click="sortByColumn('vendedor')" class="cursor-pointer">
                    Vendedor <i :class="getSortIcon('vendedor')"></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in filteredInvoices" :key="invoice.id">
                  <td v-if="isColumnVisible('fecha')">{{ invoice.fecha_operacion }}</td>
                  <td v-if="isColumnVisible('sucursal')">{{ invoice.sucursal || 'N/A' }}</td>
                  <td v-if="isColumnVisible('tipo_documento')">
                    <span class="badge bg-primary">{{
                      invoice.tipo_documento.toUpperCase()
                    }}</span>
                  </td>
                  <td v-if="isColumnVisible('nro_documento')">{{ invoice.nro_documento }}</td>
                  <td v-if="isColumnVisible('nro_autorizacion')">{{ invoice.nro_autorizacion || 'N/A' }}</td>
                  <td v-if="isColumnVisible('cliente')">{{ invoice.razon_social }}</td>
                  <td v-if="isColumnVisible('rtn')">{{ invoice.rtn_cliente || 'N/A' }}</td>
                  <td v-if="isColumnVisible('estatus')">
                    <span
                      :class="getStatusBadgeClass(invoice.estatus_raw)"
                      class="badge"
                    >
                      {{ invoice.estatus }}
                    </span>
                  </td>
                  <td v-if="isColumnVisible('subtotal')" class="text-end">{{ formatCurrency(invoice.subtotal) }}</td>
                  <td v-if="isColumnVisible('descuento')" class="text-end">{{ formatCurrency(invoice.descuento) }}</td>
                  <td v-if="isColumnVisible('impuesto')" class="text-end">{{ formatCurrency(invoice.impuesto) }}</td>
                  <td v-if="isColumnVisible('recargos')" class="text-end">{{ formatCurrency(invoice.recargos) }}</td>
                  <td v-if="isColumnVisible('total')" class="text-end fw-bold">
                    {{ formatCurrency(invoice.total) }}
                  </td>
                  <td v-if="isColumnVisible('devuelto')" class="text-end" :class="{ 'text-danger fw-bold': invoice.devuelto > 0 }">
                    {{ formatCurrency(invoice.devuelto || 0) }}
                  </td>
                  <td v-if="isColumnVisible('vendedor')">{{ invoice.vendedor }}</td>
                </tr>
                <tr v-if="filteredInvoices.length === 0">
                  <td :colspan="visibleColumnsCount" class="text-center py-4">
                    <i class="ti ti-database-off fs-48 text-muted"></i>
                    <p class="text-muted mt-2">No se encontraron registros</p>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="filteredInvoices.length > 0">
                <tr class="table-active fw-bold">
                  <td v-if="isColumnVisible('fecha')"></td>
                  <td v-if="isColumnVisible('sucursal')"></td>
                  <td v-if="isColumnVisible('tipo_documento')"></td>
                  <td v-if="isColumnVisible('nro_documento')"></td>
                  <td v-if="isColumnVisible('nro_autorizacion')"></td>
                  <td v-if="isColumnVisible('cliente')"></td>
                  <td v-if="isColumnVisible('rtn')"></td>
                  <td v-if="isColumnVisible('estatus')">SUBTOTALES:</td>
                  <td v-if="isColumnVisible('subtotal')" class="text-end">{{ formatCurrency(totals.subtotal_total) }}</td>
                  <td v-if="isColumnVisible('descuento')" class="text-end">{{ formatCurrency(totals.descuento_total) }}</td>
                  <td v-if="isColumnVisible('impuesto')" class="text-end">{{ formatCurrency(totals.impuesto_total) }}</td>
                  <td v-if="isColumnVisible('recargos')" class="text-end">{{ formatCurrency(totals.recargos_total) }}</td>
                  <td v-if="isColumnVisible('total')" class="text-end">{{ formatCurrency(totals.total_total) }}</td>
                  <td v-if="isColumnVisible('devuelto')" class="text-end text-danger">{{ formatCurrency(totals.total_devuelto || 0) }}</td>
                  <td v-if="isColumnVisible('vendedor')"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="text-center py-5" v-else>
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando libro de ventas...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Guardar Reporte -->
    <div v-if="showSaveReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Guardar Reporte - Libro de Ventas</h5>
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
  </div>
</template>

<script>
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import api from '@/utils/axios';

export default {
  name: 'SalesBook',
  data() {
    return {
      invoices: [],
      totals: {
        total_registros: 0,
        subtotal_total: 0,
        descuento_total: 0,
        impuesto_total: 0,
        total_total: 0,
        recargos_total: 0,
      },
      filters: {
        date_from: this.getDefaultDateFrom(),
        date_to: this.getDefaultDateTo(),
        customer_type: '',
        payment_status: '',
      },
      searchQuery: '',
      sortBy: 'fecha',
      sortColumn: 'fecha_operacion_raw',
      sortDirection: 'desc',
      loading: false,
      showColumnSelector: false,
      showSaveReportModal: false,
      companyInfo: {},
      availableColumns: [
        { key: 'fecha', label: 'Fecha', visible: true },
        { key: 'sucursal', label: 'Sucursal', visible: true },
        { key: 'tipo_documento', label: 'Tipo Doc', visible: true },
        { key: 'nro_documento', label: 'Nro Documento', visible: true },
        { key: 'nro_autorizacion', label: 'Nro Autorización', visible: true },
        { key: 'cliente', label: 'Cliente', visible: true },
        { key: 'rtn', label: 'RTN', visible: true },
        { key: 'estatus', label: 'Estatus', visible: true },
        { key: 'subtotal', label: 'Subtotal', visible: true },
        { key: 'descuento', label: 'Descuento', visible: true },
        { key: 'recargos', label: 'Recargos', visible: true },
        { key: 'impuesto', label: 'Impuesto', visible: true },
        { key: 'total', label: 'Total', visible: true },
        { key: 'devuelto', label: 'Devuelto', visible: true },
        { key: 'vendedor', label: 'Vendedor', visible: true },
      ],
    };
  },
  computed: {
    filteredInvoices() {
      let filtered = [...this.invoices];

      // Filtrar devoluciones según el estado seleccionado
      // Si el filtro es "paid" (Cobrado), excluir las devoluciones
      if (this.filters.payment_status === 'paid') {
        filtered = filtered.filter(inv => inv.tipo_fila !== 'DEVOLUCION' && inv.tipo_documento !== 'DEVOLUCION' && inv.estatus_raw !== 'returned');
      }
      // Si el filtro es "returned" (Devuelto), mostrar devoluciones Y facturas devueltas
      else if (this.filters.payment_status === 'returned') {
        filtered = filtered.filter(inv => inv.tipo_fila === 'DEVOLUCION' || inv.tipo_documento === 'DEVOLUCION' || inv.estatus_raw === 'returned');
      }
      // Si no hay filtro o es "Todos", mostrar todo

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (inv) =>
            inv.nro_documento.toLowerCase().includes(query) ||
            inv.razon_social.toLowerCase().includes(query) ||
            inv.rtn_cliente.toLowerCase().includes(query) ||
            inv.vendedor.toLowerCase().includes(query)
        );
      }

      // Aplicar ordenamiento
      if (this.sortColumn) {
        filtered.sort((a, b) => {
          let valueA = a[this.sortColumn];
          let valueB = b[this.sortColumn];

          // Manejar valores nulos o undefined
          if (valueA == null) valueA = '';
          if (valueB == null) valueB = '';

          // Ordenamiento numérico para columnas de montos
          if (['subtotal', 'descuento', 'recargos', 'impuesto', 'total', 'devuelto'].includes(this.sortColumn)) {
            valueA = parseFloat(valueA) || 0;
            valueB = parseFloat(valueB) || 0;
          }

          // Ordenamiento de fechas
          if (this.sortColumn === 'fecha_operacion_raw') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
          }

          // Comparar
          let comparison = 0;
          if (valueA > valueB) {
            comparison = 1;
          } else if (valueA < valueB) {
            comparison = -1;
          }

          return this.sortDirection === 'asc' ? comparison : -comparison;
        });
      }

      return filtered;
    },
    visibleColumnsCount() {
      return this.availableColumns.filter(col => col.visible).length;
    },
  },
  methods: {
    isColumnVisible(columnKey) {
      const column = this.availableColumns.find(col => col.key === columnKey);
      return column ? column.visible : true;
    },
    selectAllColumns() {
      this.availableColumns.forEach(col => col.visible = true);
    },
    deselectAllColumns() {
      this.availableColumns.forEach(col => col.visible = false);
    },
    getDefaultDateFrom() {
      const date = new Date();
      date.setDate(1); // Primer día del mes
      return date.toISOString().split('T')[0];
    },
    getDefaultDateTo() {
      return new Date().toISOString().split('T')[0];
    },
    async loadSalesBook() {
      this.loading = true;
      try {
        const params = {
          date_from: this.filters.date_from,
          date_to: this.filters.date_to,
        };

        if (this.filters.customer_type) {
          params.customer_type = this.filters.customer_type;
        }
        if (this.filters.payment_status) {
          params.payment_status = this.filters.payment_status;
        }

        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/sales-book', {
          params,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          this.invoices = response.data.data.invoices;
          this.totals = response.data.data.totals;
        } else {
          console.error('Error al cargar libro de ventas:', response.data.message);
        }
      } catch (error) {
        console.error('Error al cargar libro de ventas:', error);
        alert('Error al cargar el libro de ventas. Por favor, intenta nuevamente.');
      } finally {
        this.loading = false;
      }
    },
    formatCurrency(value) {
      if (!value && value !== 0) return '0.00';
      return parseFloat(value).toLocaleString('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    getStatusBadgeClass(status) {
      const classes = {
        paid: 'bg-success',
        pending: 'bg-warning',
        partial: 'bg-info',
        returned: 'bg-danger',
        cancelled: 'bg-secondary',
        overdue: 'bg-dark',
      };
      return classes[status] || 'bg-secondary';
    },
    sortData() {
      if (this.sortBy === 'fecha') {
        this.invoices.sort((a, b) => new Date(b.fecha_operacion_raw) - new Date(a.fecha_operacion_raw));
      } else if (this.sortBy === 'total') {
        this.invoices.sort((a, b) => b.total - a.total);
      } else if (this.sortBy === 'cliente') {
        this.invoices.sort((a, b) => a.razon_social.localeCompare(b.razon_social));
      }
    },
    sortByColumn(column) {
      if (this.sortColumn === column) {
        // Cambiar dirección si es la misma columna
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // Nueva columna, ordenar descendente por defecto
        this.sortColumn = column;
        this.sortDirection = 'desc';
      }
    },
    getSortIcon(column) {
      if (this.sortColumn !== column) {
        return 'ti ti-arrows-sort text-muted';
      }
      return this.sortDirection === 'asc' ? 'ti ti-sort-ascending' : 'ti ti-sort-descending';
    },
    async buildSalesBookHTML() {
      // Obtener logo desde la base de datos
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

      // Generar HTML de tabla de facturas
      const invoiceRows = this.filteredInvoices.map(inv => `
        <tr>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${inv.fecha_operacion.substring(0, 10)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${inv.sucursal || 'N/A'}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${inv.tipo_documento}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${inv.nro_documento}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${inv.razon_social.substring(0, 25)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${inv.estatus}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${inv.vendedor.substring(0, 15)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">${this.formatCurrency(inv.subtotal)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">${this.formatCurrency(inv.descuento)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">${this.formatCurrency(inv.impuesto)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">${this.formatCurrency(inv.recargos)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">${this.formatCurrency(inv.total)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px; ${(inv.devuelto || 0) > 0 ? 'color: #dc3545; font-weight: bold;' : ''}">${this.formatCurrency(inv.devuelto || 0)}</td>
        </tr>
      `).join('');

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
              width: 800px;
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
            .company-info img {
              max-width: 180px;
              height: auto;
              margin-bottom: 8px;
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
              font-size: 9px;
            }
            thead {
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: white;
            }
            th {
              padding: 8px 4px;
              text-align: left;
              border: 1px solid #ddd;
              font-size: 9px;
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
              padding: 8px 4px;
              font-size: 9px;
            }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="company-info">
              ${hasLogo ? `<img src="${logoUrl}" alt="Logo">` : ''}
              <div class="company-details">
                <strong>${this.companyInfo.commercial_name || this.companyInfo.company_name || 'EMPRESA'}</strong><br>
                <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'}<br>
                <strong>Tel:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'}${this.companyInfo.whatsapp ? ` | <strong>Móvil:</strong> ${this.companyInfo.whatsapp}` : ''}<br>
                <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}
              </div>
            </div>
            <div class="report-box">
              <div class="report-title">LIBRO DE VENTAS</div>
              <div class="report-details">
                <strong>Desde:</strong> ${this.filters.date_from}<br>
                <strong>Hasta:</strong> ${this.filters.date_to}<br>
                <strong>Facturas:</strong> ${this.totals.total_facturas || 0}<br>
                <strong>Devoluciones:</strong> ${this.totals.total_devoluciones || 0}
              </div>
            </div>
          </div>

          <hr class="separator">

          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Sucursal</th>
                <th>Tipo</th>
                <th>Nro Doc</th>
                <th>Cliente</th>
                <th>Estatus</th>
                <th>Vendedor</th>
                <th class="text-right">Subtotal</th>
                <th class="text-right">Desc</th>
                <th class="text-right">Impuesto</th>
                <th class="text-right">Recargos</th>
                <th class="text-right">Total</th>
                <th class="text-right">Devuelto</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7" style="text-align: right; font-weight: bold;">TOTALES:</td>
                <td class="text-right">L ${this.formatCurrency(this.totals.subtotal_total)}</td>
                <td class="text-right">L ${this.formatCurrency(this.totals.descuento_total)}</td>
                <td class="text-right">L ${this.formatCurrency(this.totals.impuesto_total)}</td>
                <td class="text-right">L ${this.formatCurrency(this.totals.recargos_total)}</td>
                <td class="text-right">L ${this.formatCurrency(this.totals.total_total)}</td>
                <td class="text-right" style="color: #dc3545; font-weight: bold;">L ${this.formatCurrency(this.totals.total_devuelto || 0)}</td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;
    },
    saveAsExcel() {
      this.showSaveReportModal = false;

      try {
        // Crear workbook
        const wb = XLSX.utils.book_new();

        // Datos del encabezado de la empresa (arriba de todo)
        const headerData = [
          [this.companyInfo.company_name || 'PROSPERPOS'],
          [this.companyInfo.direccion || 'Sin dirección'],
          [`Tel: ${this.companyInfo.telefono || 'N/A'}`],
          [''],
          ['LIBRO DE VENTAS'],
          [`Desde: ${this.filters.date_from} | Hasta: ${this.filters.date_to}`],
          [''],
          [''], // Fila vacía adicional antes de los encabezados
        ];

        // Crear worksheet PRIMERO con el encabezado
        const ws = XLSX.utils.aoa_to_sheet(headerData);

        // Preparar datos de las facturas
        const data = this.filteredInvoices.map(inv => ({
          'Fecha': inv.fecha_operacion,
          'Sucursal': inv.sucursal || 'N/A',
          'Tipo Doc': inv.tipo_documento,
          'Nro Documento': inv.nro_documento,
          'Nro Autorización': inv.nro_autorizacion || 'N/A',
          'Cliente': inv.razon_social,
          'RTN': inv.rtn_cliente || 'N/A',
          'Estatus': inv.estatus,
          'Subtotal': parseFloat(inv.subtotal || 0),
          'Descuento': parseFloat(inv.descuento || 0),
          'Impuesto': parseFloat(inv.impuesto || 0),
          'Recargos': parseFloat(inv.recargos || 0),
          'Total': parseFloat(inv.total || 0),
          'Devuelto': parseFloat(inv.devuelto || 0),
          'Vendedor': inv.vendedor
        }));

        // Agregar fila de totales
        data.push({
          'Fecha': '',
          'Sucursal': '',
          'Tipo Doc': '',
          'Nro Documento': '',
          'Nro Autorización': '',
          'Cliente': '',
          'RTN': '',
          'Estatus': 'TOTALES',
          'Subtotal': this.totals.subtotal_total,
          'Descuento': this.totals.descuento_total,
          'Impuesto': this.totals.impuesto_total,
          'Recargos': this.totals.recargos_total || 0,
          'Total': this.totals.total_total,
          'Devuelto': this.totals.total_devuelto || 0,
          'Vendedor': ''
        });

        // Agregar fila de resumen
        data.push({
          'Fecha': '',
          'Sucursal': '',
          'Tipo Doc': '',
          'Nro Documento': '',
          'Nro Autorización': '',
          'Cliente': '',
          'RTN': '',
          'Estatus': `Total Facturas: ${this.totals.total_facturas || 0} | Total Devoluciones: ${this.totals.total_devoluciones || 0}`,
          'Subtotal': '',
          'Descuento': '',
          'Recargos': '',
          'Impuesto': '',
          'Total': '',
          'Devuelto': '',
          'Vendedor': ''
        });

        // Agregar los datos de las facturas DESPUÉS del encabezado (fila 9)
        XLSX.utils.sheet_add_json(ws, data, { origin: 'A9', skipHeader: false });

        // Agregar al workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Libro de Ventas');

        const fileName = `libro-ventas-${this.filters.date_from}-${this.filters.date_to}.xlsx`;
        XLSX.writeFile(wb, fileName);

        // Reporte descargado exitosamente
      } catch (error) {
        console.error('Error al guardar Excel:', error);
        alert('Error al generar el archivo Excel');
      }
    },
    async saveAsPDF() {
      this.showSaveReportModal = false;

      try {
        const fileName = `libro-ventas-${this.filters.date_from}-${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildSalesBookHTML();
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

        pdf.save(`${fileName}.pdf`);
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error al guardar PDF:', error);
        alert('Error al generar el archivo PDF');
      }
    },
    async saveAsImage() {
      this.showSaveReportModal = false;

      try {
        const fileName = `libro-ventas-${this.filters.date_from}-${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildSalesBookHTML();
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

        const htmlContent = await this.buildSalesBookHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // Esperar un momento antes de remover el iframe
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (error) {
        console.error('Error al imprimir:', error);
        alert('Error al imprimir el reporte');
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
    toggleHeader() {
      const header = document.querySelector('.page-header');
      if (header) {
        header.classList.toggle('d-none');
      }
    },
  },
  mounted() {
    this.loadSalesBook();
    this.loadCompanyInfo();
  },
};
</script>

<style scoped>
.sale-widget {
  transition: all 0.3s ease;
}

.sale-widget:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Estilos para tarjetas de resumen - TAMAÑO MEDIANO */
.summary-label-md {
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  line-height: 1.2;
  color: #6c757d;
}

.summary-value-md {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.sale-icon-md {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
  font-size: 1.3rem;
}

.sale-widget .card-body {
  padding: 1rem !important;
}

.sale-widget {
  margin-bottom: 0;
  transition: all 0.3s ease;
}

.bg-purple {
  background-color: #6f42c1 !important;
}

.border-purple {
  border-color: #6f42c1 !important;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.fw-bold {
  font-weight: 700;
}

.cursor-pointer {
  cursor: pointer;
  user-select: none;
}

.cursor-pointer:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

th i {
  font-size: 0.75rem;
  margin-left: 4px;
}

/* Reducir tamaño de fuente en toda la tabla - MÁS PEQUEÑA */
.table {
  font-size: 0.7rem;
}

.table thead th {
  font-size: 0.65rem;
  padding: 0.4rem 0.3rem;
  font-weight: 600;
  white-space: nowrap;
}

.table tbody td {
  font-size: 0.65rem;
  padding: 0.35rem 0.3rem;
  line-height: 1.3;
}

.table tfoot td {
  font-size: 0.7rem;
  padding: 0.5rem 0.3rem;
  font-weight: 600;
}

/* Ajustar badges */
.badge {
  font-size: 0.6rem;
  padding: 0.2rem 0.4rem;
}

/* Ajustar input de búsqueda - ICONO A LA IZQUIERDA */
.search-input {
  position: relative;
  width: 100%;
}

.search-input .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  z-index: 5;
}

.search-input input.ps-5 {
  padding-left: 40px !important;
}

/* Hacer la tabla más compacta */
.table-responsive {
  font-size: 0.7rem;
}

.page-title h4 {
  font-size: 1.3rem;
}

.page-title h6 {
  font-size: 0.85rem;
}
</style>
