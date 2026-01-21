<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Libro de Compras</h4>
            <h6>Gestiona tu libro de compras con filtros avanzados</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li class="me-2">
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Refresh"
              @click="loadPurchaseBook"
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

      <!-- Summary Cards - Primera fila: 3 tarjetas -->
      <div class="row gx-3 mb-3">
        <div class="col-xl-4 col-sm-6 col-12 d-flex">
          <div class="card border border-primary sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-primary text-white">
                <i class="ti ti-shopping-cart"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Total Compras</p>
                <h3 class="summary-value-md mb-0">{{ totals.total_compras || 0 }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-sm-6 col-12 d-flex">
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
        <div class="col-xl-4 col-sm-6 col-12 d-flex">
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

      <!-- Summary Cards - Segunda fila: 3 tarjetas -->
      <div class="row gx-3 mb-3">
        <div class="col-xl-4 col-sm-6 col-12 d-flex">
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
        <div class="col-xl-4 col-sm-6 col-12 d-flex">
          <div class="card border border-secondary sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-secondary text-white">
                <i class="ti ti-receipt-tax"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">ISV</p>
                <h3 class="summary-value-md mb-0">L {{ formatCurrency(totals.isv_total) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-sm-6 col-12 d-flex">
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
                  @change="loadPurchaseBook"
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
                  @change="loadPurchaseBook"
                />
              </div>
            </div>
            <div class="col-lg-3 col-sm-6 col-12">
              <div class="input-blocks">
                <label>Estado de Pago</label>
                <select
                  class="form-select"
                  v-model="filters.payment_status"
                  @change="loadPurchaseBook"
                >
                  <option value="">Todos</option>
                  <option value="Completed">Completado</option>
                  <option value="Returned">Devuelto</option>
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
                  placeholder="Buscar por número de documento, proveedor, RTN..."
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
                  <th v-if="isColumnVisible('fecha')" @click="sortByColumn('fecha_raw')" class="cursor-pointer">
                    Fecha <i :class="getSortIcon('fecha_raw')"></i>
                  </th>
                  <th v-if="isColumnVisible('numero_factura')" @click="sortByColumn('numero_factura')" class="cursor-pointer">
                    Número Factura <i :class="getSortIcon('numero_factura')"></i>
                  </th>
                  <th v-if="isColumnVisible('proveedor')" @click="sortByColumn('proveedor')" class="cursor-pointer">
                    Proveedor <i :class="getSortIcon('proveedor')"></i>
                  </th>
                  <th v-if="isColumnVisible('rtn')" @click="sortByColumn('rtn_proveedor')" class="cursor-pointer">
                    RTN <i :class="getSortIcon('rtn_proveedor')"></i>
                  </th>
                  <th v-if="isColumnVisible('subtotal')" @click="sortByColumn('subtotal')" class="text-end cursor-pointer">
                    Subtotal <i :class="getSortIcon('subtotal')"></i>
                  </th>
                  <th v-if="isColumnVisible('descuento')" @click="sortByColumn('descuento')" class="text-end cursor-pointer">
                    Descuento <i :class="getSortIcon('descuento')"></i>
                  </th>
                  <th v-if="isColumnVisible('recargo')" @click="sortByColumn('recargo')" class="text-end cursor-pointer">
                    Recargo <i :class="getSortIcon('recargo')"></i>
                  </th>
                  <th v-if="isColumnVisible('isv')" @click="sortByColumn('isv')" class="text-end cursor-pointer">
                    ISV <i :class="getSortIcon('isv')"></i>
                  </th>
                  <th v-if="isColumnVisible('total')" @click="sortByColumn('total')" class="text-end cursor-pointer">
                    Total <i :class="getSortIcon('total')"></i>
                  </th>
                  <th v-if="isColumnVisible('estatus')" @click="sortByColumn('estatus_raw')" class="cursor-pointer">
                    Estatus <i :class="getSortIcon('estatus_raw')"></i>
                  </th>
                  <th v-if="isColumnVisible('usuario')" @click="sortByColumn('usuario')" class="cursor-pointer">
                    Usuario <i :class="getSortIcon('usuario')"></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="purchase in filteredPurchases" :key="purchase.id">
                  <td v-if="isColumnVisible('fecha')">{{ purchase.fecha }}</td>
                  <td v-if="isColumnVisible('numero_factura')">{{ purchase.numero_factura }}</td>
                  <td v-if="isColumnVisible('proveedor')">{{ purchase.proveedor }}</td>
                  <td v-if="isColumnVisible('rtn')">{{ purchase.rtn_proveedor || 'N/A' }}</td>
                  <td v-if="isColumnVisible('subtotal')" class="text-end">{{ formatCurrency(purchase.subtotal) }}</td>
                  <td v-if="isColumnVisible('descuento')" class="text-end">{{ formatCurrency(purchase.descuento) }}</td>
                  <td v-if="isColumnVisible('recargo')" class="text-end">{{ formatCurrency(purchase.recargo) }}</td>
                  <td v-if="isColumnVisible('isv')" class="text-end">{{ formatCurrency(purchase.isv) }}</td>
                  <td v-if="isColumnVisible('total')" class="text-end fw-bold">
                    {{ formatCurrency(purchase.total) }}
                  </td>
                  <td v-if="isColumnVisible('estatus')">
                    <span
                      :class="getStatusBadgeClass(purchase.estatus_raw)"
                      class="badge"
                    >
                      {{ purchase.estatus }}
                    </span>
                  </td>
                  <td v-if="isColumnVisible('usuario')">{{ purchase.usuario }}</td>
                </tr>
                <tr v-if="filteredPurchases.length === 0">
                  <td :colspan="visibleColumnsCount" class="text-center py-4">
                    <i class="ti ti-database-off fs-48 text-muted"></i>
                    <p class="text-muted mt-2">No se encontraron registros</p>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="filteredPurchases.length > 0">
                <tr class="table-active fw-bold">
                  <td v-if="isColumnVisible('fecha')"></td>
                  <td v-if="isColumnVisible('numero_factura')"></td>
                  <td v-if="isColumnVisible('proveedor')"></td>
                  <td v-if="isColumnVisible('rtn')">SUBTOTALES:</td>
                  <td v-if="isColumnVisible('subtotal')" class="text-end">{{ formatCurrency(totals.subtotal_total) }}</td>
                  <td v-if="isColumnVisible('descuento')" class="text-end">{{ formatCurrency(totals.descuento_total) }}</td>
                  <td v-if="isColumnVisible('recargo')" class="text-end">{{ formatCurrency(totals.recargo_total) }}</td>
                  <td v-if="isColumnVisible('isv')" class="text-end">{{ formatCurrency(totals.isv_total) }}</td>
                  <td v-if="isColumnVisible('total')" class="text-end">{{ formatCurrency(totals.total_total) }}</td>
                  <td v-if="isColumnVisible('estatus')"></td>
                  <td v-if="isColumnVisible('usuario')"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="text-center py-5" v-else>
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando libro de compras...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Guardar Reporte -->
    <div v-if="showSaveReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Guardar Reporte - Libro de Compras</h5>
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
  name: 'PurchaseBook',
  data() {
    // Calculate dates inline to avoid calling methods before they're initialized
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const dateFrom = firstDay.toISOString().split('T')[0];
    const dateTo = now.toISOString().split('T')[0];

    return {
      purchases: [],
      totals: {
        total_registros: 0,
        total_compras: 0,
        total_devoluciones: 0,
        subtotal_total: 0,
        descuento_total: 0,
        recargo_total: 0,
        isv_total: 0,
        total_total: 0,
        total_devuelto: 0,
      },
      filters: {
        date_from: dateFrom,
        date_to: dateTo,
        payment_status: '',
      },
      searchQuery: '',
      sortColumn: 'fecha_raw',
      sortDirection: 'desc',
      loading: false,
      showColumnSelector: false,
      showSaveReportModal: false,
      companyInfo: {},
      availableColumns: [
        { key: 'fecha', label: 'Fecha', visible: true },
        { key: 'numero_factura', label: 'Número Factura', visible: true },
        { key: 'proveedor', label: 'Proveedor', visible: true },
        { key: 'rtn', label: 'RTN', visible: true },
        { key: 'subtotal', label: 'Subtotal', visible: true },
        { key: 'descuento', label: 'Descuento', visible: true },
        { key: 'recargo', label: 'Recargo', visible: true },
        { key: 'isv', label: 'ISV', visible: true },
        { key: 'total', label: 'Total', visible: true },
        { key: 'estatus', label: 'Estatus', visible: true },
        { key: 'usuario', label: 'Usuario', visible: true },
      ],
    };
  },
  computed: {
    filteredPurchases() {
      let filtered = [...this.purchases];

      // Filtrar devoluciones según el estado seleccionado
      // Si el filtro es "Completed", excluir las devoluciones
      if (this.filters.payment_status === 'Completed') {
        filtered = filtered.filter(pur => pur.tipo_fila !== 'DEVOLUCION' && pur.estatus_raw !== 'Returned');
      }
      // Si el filtro es "Returned", mostrar devoluciones Y facturas devueltas
      else if (this.filters.payment_status === 'Returned') {
        filtered = filtered.filter(pur => pur.tipo_fila === 'DEVOLUCION' || pur.estatus_raw === 'Returned');
      }
      // Si no hay filtro o es "Todos", mostrar todo

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (pur) =>
            pur.numero_factura.toLowerCase().includes(query) ||
            pur.proveedor.toLowerCase().includes(query) ||
            (pur.rtn_proveedor && pur.rtn_proveedor.toLowerCase().includes(query)) ||
            pur.usuario.toLowerCase().includes(query)
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
          if (['subtotal', 'isv', 'total'].includes(this.sortColumn)) {
            valueA = parseFloat(valueA) || 0;
            valueB = parseFloat(valueB) || 0;
          }

          // Ordenamiento de fechas
          if (this.sortColumn === 'fecha_raw') {
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
    async loadPurchaseBook() {
      this.loading = true;
      try {
        const params = {
          date_from: this.filters.date_from,
          date_to: this.filters.date_to,
        };

        if (this.filters.payment_status) {
          params.payment_status = this.filters.payment_status;
        }

        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/purchase-book', {
          params,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          this.purchases = response.data.data.purchases;
          this.totals = response.data.data.totals;
        } else {
          console.error('Error al cargar libro de compras:', response.data.message);
        }
      } catch (error) {
        console.error('Error al cargar libro de compras:', error);
        alert('Error al cargar el libro de compras. Por favor, intenta nuevamente.');
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
        'Completed': 'bg-success',  // Verde para completado
        'Returned': 'bg-danger',    // Rojo para devuelto
      };
      return classes[status] || 'bg-secondary';
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
    saveAsExcel() {
      this.showSaveReportModal = false;

      try {
        const wb = XLSX.utils.book_new();

        const headerData = [
          [this.companyInfo.commercial_name || this.companyInfo.company_name || 'PROSPERPOS'],
          [this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'],
          [`Tel: ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'}`],
          [''],
          ['LIBRO DE COMPRAS'],
          [`Desde: ${this.filters.date_from} | Hasta: ${this.filters.date_to}`],
          [''],
          [''],
        ];

        const ws = XLSX.utils.aoa_to_sheet(headerData);

        const data = this.filteredPurchases.map(pur => ({
          'Fecha': pur.fecha,
          'Número Factura': pur.numero_factura,
          'Proveedor': pur.proveedor,
          'RTN': pur.rtn_proveedor || 'N/A',
          'Estatus': pur.estatus,
          'Subtotal': parseFloat(pur.subtotal || 0),
          'Descuento': parseFloat(pur.descuento || 0),
          'Recargo': parseFloat(pur.recargo || 0),
          'ISV': parseFloat(pur.isv || 0),
          'Total': parseFloat(pur.total || 0),
          'Usuario': pur.usuario
        }));

        data.push({
          'Fecha': '',
          'Número Factura': '',
          'Proveedor': '',
          'RTN': '',
          'Estatus': 'TOTALES',
          'Subtotal': this.totals.subtotal_total,
          'Descuento': this.totals.descuento_total,
          'Recargo': this.totals.recargo_total,
          'ISV': this.totals.isv_total,
          'Total': this.totals.total_total,
          'Usuario': ''
        });

        XLSX.utils.sheet_add_json(ws, data, { origin: 'A9', skipHeader: false });
        XLSX.utils.book_append_sheet(wb, ws, 'Libro de Compras');

        const fileName = `libro-compras-${this.filters.date_from}-${this.filters.date_to}.xlsx`;
        XLSX.writeFile(wb, fileName);
      } catch (error) {
        console.error('Error al guardar Excel:', error);
        alert('Error al generar el archivo Excel');
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
        const response = await api.get('/image-proxy', {
          params: { url: dbLogoUrl }
        });
        if (response.data.success && response.data.data.base64) {
          return response.data.data.base64;
        }
      } catch (error) {
        console.error('Error al cargar logo:', error);
      }
      return '';
    },
    async buildPurchaseBookHTML() {
      // Obtener logo desde la base de datos
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

      // Generar HTML de tabla de compras
      const purchaseRows = this.filteredPurchases.map(pur => {
        return `
        <tr>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${pur.fecha ? pur.fecha.substring(0, 10) : 'N/A'}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${pur.numero_factura}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${pur.proveedor.substring(0, 25)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px; color: #000; font-weight: bold;">${pur.estatus}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">${this.formatCurrency(pur.subtotal)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">${this.formatCurrency(pur.descuento)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">${this.formatCurrency(pur.recargo)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">${this.formatCurrency(pur.isv)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">${this.formatCurrency(pur.total)}</td>
        </tr>
      `}).join('');

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
                <strong>${this.companyInfo.commercial_name || this.companyInfo.company_name || 'PROSPERPOS'}</strong><br>
                <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'}<br>
                <strong>Tel:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'} | <strong>Móvil:</strong> ${this.companyInfo.whatsapp || 'N/A'}<br>
                <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}
              </div>
            </div>
            <div class="report-box">
              <div class="report-title">LIBRO DE COMPRAS</div>
              <div class="report-details">
                <strong>Desde:</strong> ${this.filters.date_from}<br>
                <strong>Hasta:</strong> ${this.filters.date_to}<br>
                <strong>Compras:</strong> ${this.totals.total_compras || 0}<br>
                <strong>Devoluciones:</strong> ${this.totals.total_devoluciones || 0}
              </div>
            </div>
          </div>

          <hr class="separator">

          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nro Factura</th>
                <th>Proveedor</th>
                <th>Estatus</th>
                <th class="text-right">Subtotal</th>
                <th class="text-right">Descuento</th>
                <th class="text-right">Recargo</th>
                <th class="text-right">ISV</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${purchaseRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align: right; font-weight: bold;">TOTALES:</td>
                <td class="text-right">L ${this.formatCurrency(this.totals.subtotal_total)}</td>
                <td class="text-right">L ${this.formatCurrency(this.totals.descuento_total)}</td>
                <td class="text-right">L ${this.formatCurrency(this.totals.recargo_total)}</td>
                <td class="text-right">L ${this.formatCurrency(this.totals.isv_total)}</td>
                <td class="text-right">L ${this.formatCurrency(this.totals.total_total)}</td>
              </tr>
              <tr style="background: #e8e8e8;">
                <td colspan="9" style="padding: 8px 4px; font-size: 9px;">
                  <strong>Total Devuelto:</strong> L ${this.formatCurrency(this.totals.total_devuelto || 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;
    },
    async saveAsPDF() {
      this.showSaveReportModal = false;

      try {
        const fileName = `libro-compras-${this.filters.date_from}-${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildPurchaseBookHTML();
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
        const fileName = `libro-compras-${this.filters.date_from}-${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildPurchaseBookHTML();
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

        const htmlContent = await this.buildPurchaseBookHTML();
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
          console.error('Error al cargar información pública de empresa:', publicError);
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
    toggleHeader() {
      const header = document.querySelector('.page-header');
      if (header) {
        header.classList.toggle('d-none');
      }
    },
  },
  mounted() {
    this.loadPurchaseBook();
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

.badge {
  font-size: 0.6rem;
  padding: 0.2rem 0.4rem;
}

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
