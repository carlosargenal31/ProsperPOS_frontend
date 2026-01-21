<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Reporte de Pérdidas y Ganancias</h4>
            <h6>Visualiza los ingresos, gastos y utilidades de tu negocio</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li class="me-2">
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Actualizar"
              @click="generateReport"
            >
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Colapsar"
              id="collapse-header"
              @click="toggleHeader"
            >
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
      </div>

      <!-- Filtros -->
      <div class="card border-0">
        <div class="card-body pb-1">
          <form @submit.prevent="generateReport">
            <div class="row align-items-end">
              <div class="col-lg-10">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Rango de Fechas</label>
                      <div class="input-icon-start position-relative">
                        <input
                          type="text"
                          class="form-control date-range bookingrange"
                          placeholder="dd/mm/yyyy - dd/mm/yyyy"
                          ref="dateRangeInput"
                        />
                        <span class="input-icon-left">
                          <i class="ti ti-calendar"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="mb-3">
                      <label class="form-label">Agrupar por</label>
                      <vue-select
                        :options="availableGroupByOptions"
                        v-model="selectedGroupBy"
                        label="label"
                        :reduce="option => option.value"
                        placeholder="Seleccionar agrupación"
                      />
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="mb-3">
                      <label class="form-label">Sucursal</label>
                      <vue-select
                        :options="branchOptions"
                        v-model="selectedBranch"
                        label="label"
                        :reduce="option => option.value"
                        placeholder="Todas las sucursales"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-2">
                <div class="mb-3">
                  <button class="btn btn-primary w-100" type="submit" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Generando...' : 'Generar Reporte' }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Tabla de reporte -->
      <div class="card table-list-card no-search" v-if="reportData && reportData.periods && reportData.periods.length > 0">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <div>
            <h4>Pérdidas y Ganancias</h4>
            <p class="mb-0 text-muted">{{ formatDateRange(dateFrom, dateTo) }}</p>
          </div>
          <ul class="table-top-head">
            <li>
              <button class="btn btn-primary btn-sm" @click="showSaveReportModal = true">
                <i class="ti ti-download me-1"></i> Guardar Reporte
              </button>
            </li>
          </ul>
        </div>
        <div class="card-body" id="profit-loss-table">
          <div class="table-responsive table-responsive-horizontal">
            <table class="table table-bordered table-compact">
              <thead class="thead-light">
                <tr>
                  <th style="min-width: 150px;">Concepto</th>
                  <th
                    v-for="(period, index) in reportData.periods"
                    :key="index"
                    class="text-end"
                    :style="selectedGroupBy === 'week' ? 'min-width: 150px; max-width: 180px;' : 'min-width: 90px; max-width: 110px;'"
                  >
                    {{ period.period }}
                  </th>
                  <th class="text-end" style="min-width: 100px; background-color: #f0f0f0;"><strong>TOTAL</strong></th>
                </tr>
              </thead>
              <tbody>
                <!-- INGRESOS -->
                <tr class="table-active">
                  <td colspan="100%"><strong>Ingresos</strong></td>
                </tr>
                <tr>
                  <td class="ps-4">Ventas</td>
                  <td
                    v-for="(period, index) in reportData.periods"
                    :key="'sales-' + index"
                    class="text-end"
                  >
                    {{ formatCurrency(period.income.sales) }}
                  </td>
                  <td class="text-end" style="background-color: #f9f9f9; font-weight: bold;">
                    {{ formatCurrency(reportData.totals.income.sales) }}
                  </td>
                </tr>
                <tr>
                  <td class="ps-4">Servicios</td>
                  <td
                    v-for="(period, index) in reportData.periods"
                    :key="'service-' + index"
                    class="text-end"
                  >
                    {{ formatCurrency(period.income.service) }}
                  </td>
                  <td class="text-end" style="background-color: #f9f9f9; font-weight: bold;">
                    {{ formatCurrency(reportData.totals.income.service) }}
                  </td>
                </tr>
                <tr>
                  <td class="ps-4">Devoluciones de Compras</td>
                  <td
                    v-for="(period, index) in reportData.periods"
                    :key="'purchase-returns-' + index"
                    class="text-end"
                  >
                    {{ formatCurrency(period.income.purchase_returns) }}
                  </td>
                  <td class="text-end" style="background-color: #f9f9f9; font-weight: bold;">
                    {{ formatCurrency(reportData.totals.income.purchase_returns) }}
                  </td>
                </tr>
                <tr class="table-info">
                  <td><strong>Utilidad Bruta</strong></td>
                  <td
                    v-for="(period, index) in reportData.periods"
                    :key="'gross-' + index"
                    class="text-end"
                  >
                    <strong>{{ formatCurrency(period.gross_profit) }}</strong>
                  </td>
                  <td class="text-end" style="background-color: #e7f3ff; font-weight: bold;">
                    <strong>{{ formatCurrency(reportData.totals.gross_profit) }}</strong>
                  </td>
                </tr>

                <!-- GASTOS -->
                <tr class="table-active">
                  <td colspan="100%"><strong>Gastos</strong></td>
                </tr>
                <tr>
                  <td class="ps-4">Compras</td>
                  <td
                    v-for="(period, index) in reportData.periods"
                    :key="'purchases-' + index"
                    class="text-end"
                  >
                    {{ formatCurrency(period.expenses.sales_cost) }}
                  </td>
                  <td class="text-end" style="background-color: #f9f9f9; font-weight: bold;">
                    {{ formatCurrency(reportData.totals.expenses.sales_cost) }}
                  </td>
                </tr>
                <tr>
                  <td class="ps-4">Devoluciones de Ventas</td>
                  <td
                    v-for="(period, index) in reportData.periods"
                    :key="'sales-returns-' + index"
                    class="text-end"
                  >
                    {{ formatCurrency(period.expenses.sales_returns) }}
                  </td>
                  <td class="text-end" style="background-color: #f9f9f9; font-weight: bold;">
                    {{ formatCurrency(reportData.totals.expenses.sales_returns) }}
                  </td>
                </tr>
                <tr class="table-warning">
                  <td><strong>Total Gastos</strong></td>
                  <td
                    v-for="(period, index) in reportData.periods"
                    :key="'total-expenses-' + index"
                    class="text-end"
                  >
                    <strong>{{ formatCurrency(period.expenses.total) }}</strong>
                  </td>
                  <td class="text-end" style="background-color: #fff3cd; font-weight: bold;">
                    <strong>{{ formatCurrency(reportData.totals.expenses.total) }}</strong>
                  </td>
                </tr>

                <!-- UTILIDAD NETA -->
                <tr class="table-success">
                  <td><strong>Utilidad Neta</strong></td>
                  <td
                    v-for="(period, index) in reportData.periods"
                    :key="'net-profit-' + index"
                    class="text-end"
                    :class="period.net_profit >= 0 ? 'text-success' : 'text-danger'"
                  >
                    <strong>{{ formatCurrency(period.net_profit) }}</strong>
                  </td>
                  <td
                    class="text-end"
                    style="background-color: #d1e7dd; font-weight: bold;"
                    :class="reportData.totals.net_profit >= 0 ? 'text-success' : 'text-danger'"
                  >
                    <strong>{{ formatCurrency(reportData.totals.net_profit) }}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="!loading" class="card">
        <div class="card-body text-center py-5">
          <i class="ti ti-chart-line" style="font-size: 64px; color: #ccc;"></i>
          <h5 class="mt-3">No hay datos para mostrar</h5>
          <p class="text-muted">Selecciona un rango de fechas y genera el reporte</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="card">
        <div class="card-body text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-3">Generando reporte...</p>
        </div>
      </div>
    </div>

    <div class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
      <p class="mb-0 text-gray-9">
        {{ new Date().getFullYear() }} &copy; ProsperPOS. All Right Reserved
      </p>
      <p>
        Diseñado &amp Desarrollado Por;
        <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a>
      </p>
    </div>

    <!-- Modal Guardar Reporte -->
    <div v-if="showSaveReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Guardar Reporte - Pérdidas y Ganancias</h5>
            <button type="button" class="btn-close" @click="showSaveReportModal = false"></button>
          </div>
          <div class="modal-body">
            <p class="mb-3">Selecciona el formato en el que deseas guardar el reporte:</p>
            <div class="d-grid gap-2">
              <button class="btn btn-outline-success" @click="exportToExcel">
                <i class="ti ti-file-spreadsheet me-2"></i> Guardar como Excel
              </button>
              <button class="btn btn-outline-danger" @click="exportToPDF">
                <i class="ti ti-file-type-pdf me-2"></i> Guardar como PDF
              </button>
              <button class="btn btn-outline-primary" @click="captureAsImage">
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
import "daterangepicker/daterangepicker.css";
import "daterangepicker/daterangepicker.js";
import moment from "moment";
import DateRangePicker from "daterangepicker";
import api from "@/utils/axios";
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default {
  name: "ProfitLossReport",
  data() {
    return {
      loading: false,
      reportData: null,
      dateFrom: null,
      dateTo: null,
      selectedBranch: null,
      selectedGroupBy: "month",
      showSaveReportModal: false,
      companyInfo: {},
      dateRangePicker: null,
      branchOptions: [
        { label: "Todas", value: null }
      ],
      groupByOptions: [
        { label: "Por Hora", value: "hour" },
        { label: "Por Día", value: "day" },
        { label: "Por Semana", value: "week" },
        { label: "Por Mes", value: "month" },
        { label: "Por Año", value: "year" },
        { label: "Total", value: "total" }
      ]
    };
  },
  computed: {
    selectedGroupByLabel() {
      const option = this.groupByOptions.find(opt => opt.value === this.selectedGroupBy);
      return option ? option.label : 'Por Mes';
    },

    // Filtrar opciones de agrupación según el rango de fechas
    availableGroupByOptions() {
      if (!this.dateFrom || !this.dateTo) {
        return this.groupByOptions;
      }

      const start = moment(this.dateFrom);
      const end = moment(this.dateTo);
      const days = end.diff(start, 'days') + 1;

      console.log('📅 Días en el rango:', days);

      // 1 día exacto = solo por hora
      if (days === 1) {
        return this.groupByOptions.filter(opt => opt.value === 'hour');
      }

      // 2-6 días = solo por día
      if (days >= 2 && days <= 6) {
        return this.groupByOptions.filter(opt => opt.value === 'day');
      }

      // 7-90 días = por día, por semana
      if (days >= 7 && days <= 90) {
        return this.groupByOptions.filter(opt => ['day', 'week'].includes(opt.value));
      }

      // 91-364 días = por semana, por mes
      if (days >= 91 && days < 365) {
        return this.groupByOptions.filter(opt => ['week', 'month'].includes(opt.value));
      }

      // 365 días o más (1 año o más) = por mes, por año, total (sin semana)
      return this.groupByOptions.filter(opt => ['month', 'year', 'total'].includes(opt.value));
    }
  },
  watch: {
    selectedGroupBy(newValue, oldValue) {
      console.log('👁️ [WATCH] selectedGroupBy cambió de', oldValue, 'a', newValue);

      // Si ya hay un reporte generado, regenerarlo automáticamente
      if (this.reportData && this.dateFrom && this.dateTo && newValue !== oldValue) {
        console.log('✅ [WATCH] Regenerando reporte automáticamente');
        this.generateReport();
      } else {
        console.log('ℹ️ [WATCH] Agrupación configurada:', newValue);
      }
    },

    // Cuando cambian las fechas, verificar que la agrupación seleccionada sea válida
    availableGroupByOptions(newOptions) {
      const isCurrentValid = newOptions.some(opt => opt.value === this.selectedGroupBy);

      if (!isCurrentValid && newOptions.length > 0) {
        console.log('⚠️ Agrupación actual no válida, cambiando a:', newOptions[0].label);
        this.selectedGroupBy = newOptions[0].value;
      }
    }
  },
  mounted() {
    this.initializeDateRangePicker();
    this.loadCompanyInfo();
    this.loadBranches();
  },
  methods: {
    initializeDateRangePicker() {
      const start = moment().startOf('month');
      const end = moment().endOf('month');

      // Inicializar fechas con el mes actual
      this.dateFrom = start.format('YYYY-MM-DD');
      this.dateTo = end.format('YYYY-MM-DD');

      this.dateRangePicker = new DateRangePicker(
        this.$refs.dateRangeInput,
        {
          startDate: start,
          endDate: end,
          ranges: {
            'Hoy': [moment(), moment()],
            'Ayer': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Últimos 7 Días': [moment().subtract(6, 'days'), moment()],
            'Últimos 30 Días': [moment().subtract(29, 'days'), moment()],
            'Este Mes': [moment().startOf('month'), moment().endOf('month')],
            'Mes Anterior': [
              moment().subtract(1, 'month').startOf('month'),
              moment().subtract(1, 'month').endOf('month')
            ],
            'Este Año': [moment().startOf('year'), moment().endOf('year')]
          },
          locale: {
            format: 'DD/MM/YYYY',
            separator: ' - ',
            applyLabel: 'Aplicar',
            cancelLabel: 'Cancelar',
            fromLabel: 'Desde',
            toLabel: 'Hasta',
            customRangeLabel: 'Rango Personalizado',
            weekLabel: 'S',
            daysOfWeek: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
            monthNames: [
              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ],
            firstDay: 1
          }
        }
      );

      // Escuchar cambios en el date range picker
      this.$refs.dateRangeInput.addEventListener('apply.daterangepicker', (ev, picker) => {
        this.dateFrom = picker.startDate.format('YYYY-MM-DD');
        this.dateTo = picker.endDate.format('YYYY-MM-DD');
        console.log('📅 Fechas actualizadas:', this.dateFrom, '-', this.dateTo);
      });
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },

    async generateReport() {
      try {
        this.loading = true;

        // Obtener fechas del date picker
        const dateRange = this.$refs.dateRangeInput.value.split(' - ');
        this.dateFrom = moment(dateRange[0], 'DD/MM/YYYY').format('YYYY-MM-DD');
        this.dateTo = moment(dateRange[1], 'DD/MM/YYYY').format('YYYY-MM-DD');

        const params = {
          date_from: this.dateFrom,
          date_to: this.dateTo,
          group_by: this.selectedGroupBy
        };

        if (this.selectedBranch) {
          params.branch_id = this.selectedBranch;
        }

        console.log('📊 Generando reporte con parámetros:', params);
        console.log('   - Fechas:', this.dateFrom, 'a', this.dateTo);
        console.log('   - Agrupación:', this.selectedGroupBy);

        const response = await api.get('/profit-loss', { params });

        console.log('✅ Reporte recibido:');
        console.log('   - Total períodos:', response.data.data.periods.length);
        console.log('   - Primer período:', response.data.data.periods[0]?.period);
        console.log('   - Último período:', response.data.data.periods[response.data.data.periods.length - 1]?.period);

        this.reportData = response.data.data;

      } catch (error) {
        console.error('❌ Error generando reporte:', error);
        this.$toast.error('Error al generar el reporte');
      } finally {
        this.loading = false;
      }
    },

    async exportToExcel() {
      this.showSaveReportModal = false;

      try {
        const wb = XLSX.utils.book_new();

        const headerData = [
          [this.companyInfo.commercial_name || this.companyInfo.company_name || 'PROSPERPOS'],
          [`RTN: ${this.companyInfo.rtn || 'N/A'} | Tel: ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'} | Móvil: ${this.companyInfo.whatsapp || 'N/A'}`],
          [this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'],
          [''],
          ['REPORTE DE PÉRDIDAS Y GANANCIAS'],
          [`Desde: ${this.dateFrom} | Hasta: ${this.dateTo} | Agrupado por: ${this.selectedGroupByLabel}`],
          [''],
          ['']
        ];

        const ws = XLSX.utils.aoa_to_sheet(headerData);
        const data = [];

        const headerRow = ['Concepto'];
        this.reportData.periods.forEach(p => headerRow.push(p.period));
        headerRow.push('TOTAL');
        data.push(headerRow);

        data.push(['INGRESOS', ...Array(this.reportData.periods.length + 1).fill('')]);
        data.push(['Ventas', ...this.reportData.periods.map(p => p.income.sales), this.reportData.totals.income.sales]);
        data.push(['Servicios', ...this.reportData.periods.map(p => p.income.service), this.reportData.totals.income.service]);
        data.push(['Devoluciones de Compras', ...this.reportData.periods.map(p => p.income.purchase_returns), this.reportData.totals.income.purchase_returns]);
        data.push(['Utilidad Bruta', ...this.reportData.periods.map(p => p.gross_profit), this.reportData.totals.gross_profit]);

        data.push(['']);
        data.push(['GASTOS', ...Array(this.reportData.periods.length + 1).fill('')]);
        data.push(['Compras', ...this.reportData.periods.map(p => p.expenses.sales_cost), this.reportData.totals.expenses.sales_cost]);
        data.push(['Devoluciones de Ventas', ...this.reportData.periods.map(p => p.expenses.sales_returns), this.reportData.totals.expenses.sales_returns]);
        data.push(['Total Gastos', ...this.reportData.periods.map(p => p.expenses.total), this.reportData.totals.expenses.total]);

        data.push(['']);
        data.push(['UTILIDAD NETA', ...this.reportData.periods.map(p => p.net_profit), this.reportData.totals.net_profit]);

        XLSX.utils.sheet_add_aoa(ws, data, { origin: 'A8' });
        XLSX.utils.book_append_sheet(wb, ws, 'Pérdidas y Ganancias');

        const fileName = `perdidas-y-ganancias-${this.dateFrom}-${this.dateTo}.xlsx`;
        XLSX.writeFile(wb, fileName);

        this.$toast.success('Reporte exportado a Excel exitosamente');
      } catch (error) {
        console.error('Error exportando a Excel:', error);
        this.$toast.error('Error al exportar a Excel');
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
    async buildReportHTML() {
      // Obtener logo desde la base de datos
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

      // Dividir períodos en grupos de máximo 10 columnas
      const MAX_COLS_PER_TABLE = 10;
      const periods = this.reportData.periods;
      const totalPeriods = periods.length;

      // Determinar si necesitamos dividir en múltiples tablas
      const needsSplit = totalPeriods > MAX_COLS_PER_TABLE;

      // Función helper para generar una tabla con un rango de períodos
      const buildTable = (startIdx, endIdx, showTotal = false) => {
        const tablePeriods = periods.slice(startIdx, endIdx);
        const periodCount = tablePeriods.length;

        // Ajustar ancho de columnas según el tipo de agrupación
        const isWeekly = this.selectedGroupBy === 'week';
        const colStyle = isWeekly
          ? 'text-align: right; min-width: 90px; max-width: 110px; white-space: nowrap;'
          : 'text-align: right; min-width: 60px; max-width: 80px; white-space: nowrap;';

        const periodHeaders = tablePeriods.map(p =>
          `<th style="${colStyle}">${p.period}</th>`
        ).join('');

        const salesRow = tablePeriods.map(p =>
          `<td style="text-align: right;">${this.formatCurrency(p.income.sales)}</td>`
        ).join('');

        const serviceRow = tablePeriods.map(p =>
          `<td style="text-align: right;">${this.formatCurrency(p.income.service)}</td>`
        ).join('');

        const purchaseReturnsRow = tablePeriods.map(p =>
          `<td style="text-align: right;">${this.formatCurrency(p.income.purchase_returns)}</td>`
        ).join('');

        const grossProfitRow = tablePeriods.map(p =>
          `<td style="text-align: right; font-weight: bold;">${this.formatCurrency(p.gross_profit)}</td>`
        ).join('');

        const purchasesRow = tablePeriods.map(p =>
          `<td style="text-align: right;">${this.formatCurrency(p.expenses.sales_cost)}</td>`
        ).join('');

        const salesReturnsRow = tablePeriods.map(p =>
          `<td style="text-align: right;">${this.formatCurrency(p.expenses.sales_returns)}</td>`
        ).join('');

        const totalExpensesRow = tablePeriods.map(p =>
          `<td style="text-align: right; font-weight: bold;">${this.formatCurrency(p.expenses.total)}</td>`
        ).join('');

        const netProfitRow = tablePeriods.map(p =>
          `<td style="text-align: right; font-weight: bold; color: ${p.net_profit >= 0 ? '#198754' : '#dc3545'};">${this.formatCurrency(p.net_profit)}</td>`
        ).join('');

        // Columna TOTAL - solo en la última tabla
        const totalHeaderStyle = 'background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; font-weight: bold; text-align: right; min-width: 70px; border: 1px solid #f97316;';
        const totalCellStyle = 'background-color: #fff5f0; font-weight: bold; text-align: right; border: 1px solid #dee2e6;';

        const totalHeader = showTotal ? `<th style="${totalHeaderStyle}">TOTAL</th>` : '';
        const totalSales = showTotal ? `<td style="${totalCellStyle}">${this.formatCurrency(this.reportData.totals.income.sales)}</td>` : '';
        const totalService = showTotal ? `<td style="${totalCellStyle}">${this.formatCurrency(this.reportData.totals.income.service)}</td>` : '';
        const totalPurchaseReturns = showTotal ? `<td style="${totalCellStyle}">${this.formatCurrency(this.reportData.totals.income.purchase_returns)}</td>` : '';
        const totalGrossProfit = showTotal ? `<td style="${totalCellStyle}">${this.formatCurrency(this.reportData.totals.gross_profit)}</td>` : '';
        const totalPurchases = showTotal ? `<td style="${totalCellStyle}">${this.formatCurrency(this.reportData.totals.expenses.sales_cost)}</td>` : '';
        const totalSalesReturns = showTotal ? `<td style="${totalCellStyle}">${this.formatCurrency(this.reportData.totals.expenses.sales_returns)}</td>` : '';
        const totalExpenses = showTotal ? `<td style="${totalCellStyle}">${this.formatCurrency(this.reportData.totals.expenses.total)}</td>` : '';
        const totalNetProfit = showTotal ? `<td style="${totalCellStyle} color: ${this.reportData.totals.net_profit >= 0 ? '#198754' : '#dc3545'};">
          <strong>${this.formatCurrency(this.reportData.totals.net_profit)}</strong>
        </td>` : '';

        const colspan = periodCount + (showTotal ? 2 : 1);

        return `
          <table style="margin-bottom: 20px;">
            <thead>
              <tr>
                <th>Concepto</th>
                ${periodHeaders}
                ${totalHeader}
              </tr>
            </thead>
            <tbody>
              <tr class="section-header">
                <td colspan="${colspan}"><strong>INGRESOS</strong></td>
              </tr>
              <tr>
                <td>Ventas</td>
                ${salesRow}
                ${totalSales}
              </tr>
              <tr>
                <td>Servicios</td>
                ${serviceRow}
                ${totalService}
              </tr>
              <tr>
                <td>Devoluciones de Compras</td>
                ${purchaseReturnsRow}
                ${totalPurchaseReturns}
              </tr>
              <tr class="subtotal-row">
                <td>Utilidad Bruta</td>
                ${grossProfitRow}
                ${totalGrossProfit}
              </tr>

              <tr class="section-header">
                <td colspan="${colspan}"><strong>GASTOS</strong></td>
              </tr>
              <tr>
                <td>Compras</td>
                ${purchasesRow}
                ${totalPurchases}
              </tr>
              <tr>
                <td>Devoluciones de Ventas</td>
                ${salesReturnsRow}
                ${totalSalesReturns}
              </tr>
              <tr class="total-row">
                <td>Total Gastos</td>
                ${totalExpensesRow}
                ${totalExpenses}
              </tr>

              <tr class="net-profit-row">
                <td><strong>UTILIDAD NETA</strong></td>
                ${netProfitRow}
                ${totalNetProfit}
              </tr>
            </tbody>
          </table>
        `;
      };

      // Generar las tablas
      let tablesHTML = '';

      if (!needsSplit) {
        // Una sola tabla con TOTAL
        tablesHTML = buildTable(0, totalPeriods, true);
      } else {
        // Primera tabla: columnas 1-10
        tablesHTML += buildTable(0, MAX_COLS_PER_TABLE, false);

        // Tablas siguientes: de 10 en adelante
        let currentIdx = MAX_COLS_PER_TABLE;
        while (currentIdx < totalPeriods) {
          const endIdx = Math.min(currentIdx + MAX_COLS_PER_TABLE, totalPeriods);
          const isLastTable = endIdx === totalPeriods;

          tablesHTML += buildTable(currentIdx, endIdx, isLastTable);
          currentIdx = endIdx;
        }
      }

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 10px; background: white; margin: 0; }
            .header-section { display: flex; justify-content: space-between; margin-bottom: 10px; gap: 10px; }
            .company-info { width: 60%; }
            .company-info img { max-width: 150px; height: auto; margin-bottom: 5px; }
            .company-details { font-size: 9px; line-height: 1.4; }
            .report-box { width: 38%; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                          -webkit-print-color-adjust: exact; print-color-adjust: exact;
                          color: white; padding: 8px; border-radius: 6px; }
            .report-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; }
            .report-details { font-size: 8px; line-height: 1.5; }
            .separator { border: none; border-top: 2px solid #f97316; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 7px; margin-top: 8px; table-layout: auto; }
            thead { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white;
                    -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            th { padding: 5px 2px; text-align: left; border: 1px solid #f97316; font-size: 7px; font-weight: 600; color: white; white-space: nowrap;
                 background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                 -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            th:first-child { min-width: 100px; text-align: left; }
            td { padding: 4px 2px; border: 1px solid #dee2e6; font-size: 7px; white-space: nowrap; }
            td:first-child { text-align: left; min-width: 100px; }
            .section-header { background: #e9ecef; font-weight: bold;
                             -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .subtotal-row { font-weight: bold; }
            .total-row { font-weight: bold; }
            .net-profit-row { font-weight: bold; }
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
              <div class="report-title">PÉRDIDAS Y GANANCIAS</div>
              <div class="report-details">
                <strong>Desde:</strong> ${this.dateFrom}<br>
                <strong>Hasta:</strong> ${this.dateTo}<br>
                <strong>Agrupado por:</strong> ${this.selectedGroupByLabel}
              </div>
            </div>
          </div>

          <hr class="separator">

          ${tablesHTML}

        </body>
        </html>
      `;
    },

    async exportToPDF() {
      this.showSaveReportModal = false;

      try {
        const fileName = `perdidas-y-ganancias-${this.dateFrom}-${this.dateTo}`;

        // Determinar si usar orientación horizontal basado en número de columnas
        const numColumns = this.reportData.periods.length;
        const useLandscape = numColumns > 8;

        // Usar ancho mayor para acomodar más columnas + columna TOTAL (aumentado de 800px a 1500px)
        const iframeWidth = useLandscape ? '1500px' : '1100px';

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = iframeWidth;
        iframe.style.height = '800px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildReportHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const canvasWidth = useLandscape ? 1500 : 1100;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: canvasWidth,
          windowWidth: canvasWidth
        });

        const imgData = canvas.toDataURL('image/png');

        // Usar orientación landscape para reportes con muchas columnas
        const orientation = useLandscape ? 'l' : 'p';
        const pdf = new jsPDF(orientation, 'mm', 'letter');

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

        this.$toast.success('Reporte exportado a PDF exitosamente');
      } catch (error) {
        console.error('Error exportando a PDF:', error);
        this.$toast.error('Error al exportar a PDF');
      }
    },

    async captureAsImage() {
      this.showSaveReportModal = false;

      try {
        const fileName = `perdidas-y-ganancias-${this.dateFrom}-${this.dateTo}`;

        // Usar mismo ancho que PDF para consistencia
        const numColumns = this.reportData.periods.length;
        const useLandscape = numColumns > 8;
        const iframeWidth = useLandscape ? '1500px' : '1100px';

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = iframeWidth;
        iframe.style.height = '800px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildReportHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const canvasWidth = useLandscape ? 1500 : 1100;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: canvasWidth,
          windowWidth: canvasWidth
        });

        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);

        this.$toast.success('Imagen capturada exitosamente');
      } catch (error) {
        console.error('Error capturando imagen:', error);
        this.$toast.error('Error al capturar imagen');
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

    async loadBranches() {
      try {
        const response = await api.get('/branches/active');
        console.log('Branches raw data:', response.data.data);
        if (response.data.success && response.data.data) {
          this.branchOptions = [
            { label: 'Todas', value: null },
            ...response.data.data.map(branch => ({
              label: branch.nombre || branch.name, // Usar 'nombre' que es como viene del backend
              value: branch.id
            }))
          ];
          console.log('Branch options count:', this.branchOptions.length);
          console.log('Branch options:', JSON.parse(JSON.stringify(this.branchOptions)));
        }
      } catch (error) {
        console.error('Error loading branches:', error);
        // Si falla, al menos mantener la opción "Todas"
        this.branchOptions = [{ label: 'Todas', value: null }];
      }
    },

    async printReport() {
      this.showSaveReportModal = false;

      try {
        // Crear un iframe oculto con el HTML del reporte
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '210mm'; // Tamaño A4
        iframe.style.height = '297mm';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildReportHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        // Usar la función de impresión del navegador
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // Esperar un poco antes de eliminar el iframe
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);

        this.$toast.success('Abriendo diálogo de impresión');
      } catch (error) {
        console.error('Error imprimiendo:', error);
        this.$toast.error('Error al imprimir');
      }
    },

    formatCurrency(value) {
      return 'L ' + new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },

    formatDateRange(from, to) {
      if (!from || !to) return '';
      return `${moment(from).format('DD/MM/YYYY')} - ${moment(to).format('DD/MM/YYYY')}`;
    }
  }
};
</script>

<style scoped>
/* Estilos generales de tabla */
.table th,
.table td {
  vertical-align: middle;
}

.table-responsive {
  overflow-x: auto;
}

/* Hacer la tabla horizontal con scroll para hasta 30 columnas */
.table-responsive-horizontal {
  overflow-x: auto;
  overflow-y: visible;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
}

.table-compact {
  font-size: 0.75rem;
  white-space: nowrap;
}

.table-compact th,
.table-compact td {
  padding: 0.4rem 0.3rem;
  font-size: 0.7rem;
}

.table-compact th:first-child,
.table-compact td:first-child {
  position: sticky;
  left: 0;
  background-color: #fff;
  z-index: 10;
  min-width: 150px !important;
}

.table-compact thead th:first-child {
  background-color: #f8f9fa;
  z-index: 11;
}

/* Estilos de la tabla */
.table {
  font-size: 0.85rem;
}

.table thead {
  background-color: #f8f9fa;
  color: #333;
}

.table thead th {
  font-size: 0.8rem;
  padding: 0.75rem 0.5rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid #dee2e6;
}

.table tbody td {
  font-size: 0.8rem;
  padding: 0.5rem;
  line-height: 1.4;
  border: 1px solid #dee2e6;
}

/* Filas de sección (Ingresos, Gastos) */
.table-active {
  background-color: #e9ecef !important;
  color: #333 !important;
}

.table-active td {
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.6rem 0.5rem;
  border: 1px solid #dee2e6;
}

/* Filas de totales - SIN COLORES DE FONDO */
.table-info td,
.table-warning td,
.table-success td {
  font-weight: 700;
  border: 1px solid #dee2e6;
}

.table-success td {
  font-size: 0.9rem;
  padding: 0.75rem 0.5rem;
}

/* Indentación para elementos de detalle */
.ps-4 {
  padding-left: 1.5rem !important;
  font-weight: 500;
}

/* Colores para valores positivos/negativos */
.text-success {
  color: #198754 !important;
  font-weight: 700;
}

.text-danger {
  color: #dc3545 !important;
  font-weight: 700;
}

/* Ajustes responsive */
@media (max-width: 768px) {
  .table {
    font-size: 0.75rem;
  }

  .table thead th,
  .table tbody td {
    padding: 0.4rem 0.3rem;
    font-size: 0.7rem;
  }
}

@media print {
  .page-header,
  .card-header,
  .footer,
  .sidebar,
  .header {
    display: none !important;
  }

  .table thead,
  .table-active,
  .table-info,
  .table-warning,
  .table-success {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
