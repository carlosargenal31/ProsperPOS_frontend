<template>
  <div class="print-container">
    <!-- Botones de exportación (solo en pantalla, no se imprimen) -->
    <div class="export-buttons no-print">
      <button @click="showExportModal = true" class="btn btn-primary">
        <i class="ti ti-download"></i> Guardar/Imprimir
      </button>
      <button @click="goBack" class="btn btn-secondary">
        <i class="ti ti-arrow-left"></i> Volver
      </button>
    </div>

    <!-- Modal de opciones de exportación -->
    <div v-if="showExportModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Guardar Reporte - Arqueo de Caja</h5>
            <button type="button" class="btn-close" @click="showExportModal = false"></button>
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
              <button class="btn btn-outline-warning" @click="exportToImage">
                <i class="ti ti-photo me-2"></i> Guardar como Imagen
              </button>
              <button class="btn btn-outline-secondary" @click="printDocument">
                <i class="ti ti-printer me-2"></i> Imprimir
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showExportModal = false">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="print-content" v-if="session && billingSettings">
      <!-- Company Header -->
      <div class="company-header">
        <div class="logo-section" v-if="billingSettings.company_logo">
          <img :src="getLogoUrl()" alt="Logo" class="company-logo" />
        </div>
        <div class="company-info">
          <h1 class="company-name">{{ billingSettings.company_name || 'CERAMICAS TERRAZOS Y PULIDOS UNIVERSAL' }}</h1>
          <p class="company-subtitle">Ceramicas Terrazos y Pulidos Universal</p>
          <div class="company-details">
            <p><strong>RTN:</strong> {{ billingSettings.company_rtn || '01061977002516' }}</p>
            <p><strong>Dirección:</strong> {{ billingSettings.company_address || 'Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico, La Ceiba, Atlántida' }}</p>
            <p><strong>Teléfono:</strong> {{ billingSettings.company_phone || '+504 2440-0037' }} | <strong>Móvil:</strong> {{ billingSettings.company_mobile || '+504 9875-2725' }}</p>
            <p><strong>Email:</strong> {{ billingSettings.company_email || 'mauricio_argenal@hotmail.com' }}</p>
          </div>
        </div>
      </div>

      <!-- Document Title -->
      <div class="doc-title">
        <h2>ARQUEO DE CAJA</h2>
        <p class="arqueo-number">No.: <span class="highlight">{{ session.consecutive }}</span></p>
      </div>

      <!-- Fecha/Emisión Info -->
      <div class="emission-info">
        <div class="info-row">
          <div class="info-item">
            <strong>Fecha:</strong> {{ formatDate(session.date_from) }} <strong>Hora:</strong> {{ formatTime(session.time_from) }}
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <strong>Usuario:</strong> {{ session.user_name || 'GERENCIA' }}
          </div>
          <div class="info-item">
            <strong>Fecha/Emisión:</strong> {{ formatDateTime(new Date()) }}
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <strong>Fecha/Desde:</strong> {{ formatDate(session.date_from) }} - {{ formatTime(session.time_from) }}
          </div>
          <div class="info-item">
            <strong>Fecha/Hasta:</strong> {{ session.date_to ? formatDate(session.date_to) + ' - ' + formatTime(session.time_to) : 'N/A' }}
          </div>
        </div>
      </div>

      <!-- Movimientos de Caja -->
      <div class="section">
        <div class="section-header">MOVIMIENTOS DE CAJA</div>
        <table class="data-table">
          <tbody>
            <tr>
              <td class="label-cell">APERTURA DE CAJA</td>
              <td class="amount-cell">{{ formatCurrency(session.opening_amount || 0) }}</td>
            </tr>
            <tr>
              <td class="label-cell">EGRESOS DE CAJA</td>
              <td class="amount-cell">{{ formatCurrency(getTotalEgresos()) }}</td>
            </tr>
            <tr>
              <td class="label-cell">RETIROS DE CAJA</td>
              <td class="amount-cell">{{ formatCurrency(getTotalRetiros()) }}</td>
            </tr>
            <tr>
              <td class="label-cell">DEVOLUCIONES DE DINERO</td>
              <td class="amount-cell">{{ formatCurrency(getTotalDevoluciones()) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Título de Ventas del Día -->
      <div class="section">
        <div class="section-header bg-info text-white" style="background-color: #5bc0de !important;">
          <i class="ti ti-receipt me-2"></i>VENTAS DEL DÍA (SEGÚN SISTEMA)
        </div>
      </div>

      <!-- EFECTIVO Section -->
      <div class="section">
        <div class="section-header orange">EFECTIVO</div>
        <table class="denominations-table">
          <thead>
            <tr>
              <th>Denominacion</th>
              <th>Moneda</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <!-- Solo mostrar denominaciones si existen (arqueo realizado) -->
            <template v-if="session.denominations && session.denominations.length > 0">
              <tr v-for="(denom, index) in session.denominations" :key="index">
                <td>{{ denom.denomination }}</td>
                <td>{{ denom.currency || 'LEMPIRA' }}</td>
                <td class="text-center">{{ denom.quantity || 0 }}</td>
                <td class="text-right">{{ formatCurrency(parseFloat(denom.total_value || (denom.unit_value * denom.quantity))) }}</td>
              </tr>
              <!-- Solo mostrar TOTAL SEGÚN ARQUEO si hay denominaciones -->
              <tr class="total-row">
                <td colspan="3" class="text-right"><strong>TOTAL SEGUN ARQUEO</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(getTotalCashCount()) }}</strong></td>
              </tr>
            </template>
            <!-- Siempre mostrar TOTAL SEGÚN SISTEMA -->
            <tr class="system-row">
              <td colspan="3" class="text-right"><strong>TOTAL SEGUN SISTEMA</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(getEfectivoSegunSistema()) }}</strong></td>
            </tr>
            <!-- Solo mostrar DIFERENCIA si hay arqueo -->
            <tr v-if="session.denominations && session.denominations.length > 0" class="difference-row">
              <td colspan="3" class="text-right"><strong>DIFERENCIA</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(getTotalCashCount() - getEfectivoSegunSistema()) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- NOTA DE CREDITO Section -->
      <div class="section" v-if="systemTotals.total_credit_note > 0 || hasBankPayments('NOTA DE CREDITO')">
        <div class="section-header orange">NOTA DE CREDITO</div>
        <table class="payments-table">
          <thead>
            <tr>
              <th>Banco</th>
              <th>Referencia</th>
              <th>Moneda</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <!-- Solo mostrar pagos si existen (arqueo realizado) -->
            <template v-if="session.bank_payments && session.bank_payments.filter(p => p.payment_method === 'NOTA DE CREDITO' || p.payment_method === 'NOTA_CREDITO').length > 0">
              <tr v-for="(payment, index) in session.bank_payments.filter(p => p.payment_method === 'NOTA DE CREDITO' || p.payment_method === 'NOTA_CREDITO')" :key="index">
                <td>{{ payment.bank || '' }}</td>
                <td>{{ payment.reference || '' }}</td>
                <td>{{ payment.currency || 'LEMPIRA' }}</td>
                <td class="text-right">{{ formatCurrency(payment.total_local || payment.amount || 0) }}</td>
              </tr>
              <!-- Solo mostrar TOTAL SEGÚN ARQUEO si hay pagos registrados -->
              <tr class="total-row">
                <td colspan="3" class="text-right"><strong>TOTAL SEGUN ARQUEO</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(getTotalBankPayments('NOTA DE CREDITO')) }}</strong></td>
              </tr>
            </template>
            <!-- Siempre mostrar TOTAL SEGÚN SISTEMA (igual a devoluciones) -->
            <tr class="system-row">
              <td colspan="3" class="text-right"><strong>TOTAL SEGUN SISTEMA</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(getTotalDevoluciones()) }}</strong></td>
            </tr>
            <!-- Solo mostrar DIFERENCIA si hay arqueo -->
            <tr v-if="session.bank_payments && session.bank_payments.filter(p => p.payment_method === 'NOTA DE CREDITO' || p.payment_method === 'NOTA_CREDITO').length > 0" class="difference-row">
              <td colspan="3" class="text-right"><strong>DIFERENCIA:</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(getTotalBankPayments('NOTA DE CREDITO') - getTotalDevoluciones()) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TRANSFERENCIA Section -->
      <div class="section">
        <div class="section-header orange">TRANSFERENCIA</div>
        <table class="payments-table">
          <thead>
            <tr>
              <th>Banco</th>
              <th>Referencia</th>
              <th>Moneda</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <!-- Solo mostrar pagos si existen (arqueo realizado) -->
            <template v-if="session.bank_payments && session.bank_payments.filter(p => p.payment_method === 'TRANSFERENCIA').length > 0">
              <tr v-for="(payment, index) in session.bank_payments.filter(p => p.payment_method === 'TRANSFERENCIA')" :key="index">
                <td>{{ payment.bank || '' }}</td>
                <td>{{ payment.reference || '' }}</td>
                <td>{{ payment.currency || 'LEMPIRA' }}</td>
                <td class="text-right">{{ formatCurrency(payment.total_local || payment.amount || 0) }}</td>
              </tr>
              <!-- Solo mostrar TOTAL SEGÚN ARQUEO si hay pagos registrados -->
              <tr class="total-row">
                <td colspan="3" class="text-right"><strong>TOTAL SEGUN ARQUEO</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(getTotalBankPayments('TRANSFERENCIA')) }}</strong></td>
              </tr>
            </template>
            <!-- Siempre mostrar TOTAL SEGÚN SISTEMA -->
            <tr class="system-row">
              <td colspan="3" class="text-right"><strong>TOTAL SEGUN SISTEMA</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(systemTotals.total_transfer || 0) }}</strong></td>
            </tr>
            <!-- Solo mostrar DIFERENCIA si hay arqueo -->
            <tr v-if="session.bank_payments && session.bank_payments.filter(p => p.payment_method === 'TRANSFERENCIA').length > 0" class="difference-row">
              <td colspan="3" class="text-right"><strong>DIFERENCIA:</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(getTotalBankPayments('TRANSFERENCIA') - (systemTotals.total_transfer || 0)) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TARJ. CREDITO Section -->
      <div class="section">
        <div class="section-header orange">TARJ. CREDITO</div>
        <table class="payments-table">
          <thead>
            <tr>
              <th>Banco</th>
              <th>Referencia</th>
              <th>Moneda</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <!-- Solo mostrar pagos si existen (arqueo realizado) -->
            <template v-if="session.bank_payments && session.bank_payments.filter(p => p.payment_method === 'TARJETA' || p.payment_method === 'TARJ_CREDITO' || p.payment_method === 'TARJ. CREDITO').length > 0">
              <tr v-for="(payment, index) in session.bank_payments.filter(p => p.payment_method === 'TARJETA' || p.payment_method === 'TARJ_CREDITO' || p.payment_method === 'TARJ. CREDITO')" :key="index">
                <td>{{ payment.bank || '' }}</td>
                <td>{{ payment.reference || '' }}</td>
                <td>{{ payment.currency || 'LEMPIRA' }}</td>
                <td class="text-right">{{ formatCurrency(payment.total_local || payment.amount || 0) }}</td>
              </tr>
              <!-- Solo mostrar TOTAL SEGÚN ARQUEO si hay pagos registrados -->
              <tr class="total-row">
                <td colspan="3" class="text-right"><strong>TOTAL SEGUN ARQUEO</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(getTotalBankPayments('TARJETA')) }}</strong></td>
              </tr>
            </template>
            <!-- Siempre mostrar TOTAL SEGÚN SISTEMA -->
            <tr class="system-row">
              <td colspan="3" class="text-right"><strong>TOTAL SEGUN SISTEMA</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(systemTotals.total_card_credit || 0) }}</strong></td>
            </tr>
            <!-- Solo mostrar DIFERENCIA si hay arqueo -->
            <tr v-if="session.bank_payments && session.bank_payments.filter(p => p.payment_method === 'TARJETA' || p.payment_method === 'TARJ_CREDITO' || p.payment_method === 'TARJ. CREDITO').length > 0" class="difference-row">
              <td colspan="3" class="text-right"><strong>DIFERENCIA:</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(getTotalBankPayments('TARJETA') - (systemTotals.total_card_credit || 0)) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TARJ. DEBITO Section -->
      <div class="section">
        <div class="section-header orange">TARJ. DEBITO</div>
        <table class="payments-table">
          <thead>
            <tr>
              <th>Banco</th>
              <th>Referencia</th>
              <th>Moneda</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <!-- Solo mostrar pagos si existen (arqueo realizado) -->
            <template v-if="session.bank_payments && session.bank_payments.filter(p => p.payment_method === 'TARJ_DEBITO' || p.payment_method === 'TARJ. DEBITO').length > 0">
              <tr v-for="(payment, index) in session.bank_payments.filter(p => p.payment_method === 'TARJ_DEBITO' || p.payment_method === 'TARJ. DEBITO')" :key="index">
                <td>{{ payment.bank || '' }}</td>
                <td>{{ payment.reference || '' }}</td>
                <td>{{ payment.currency || 'LEMPIRA' }}</td>
                <td class="text-right">{{ formatCurrency(payment.total_local || payment.amount || 0) }}</td>
              </tr>
              <!-- Solo mostrar TOTAL SEGÚN ARQUEO si hay pagos registrados -->
              <tr class="total-row">
                <td colspan="3" class="text-right"><strong>TOTAL SEGUN ARQUEO</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(getTotalBankPayments('TARJ_DEBITO')) }}</strong></td>
              </tr>
            </template>
            <!-- Siempre mostrar TOTAL SEGÚN SISTEMA -->
            <tr class="system-row">
              <td colspan="3" class="text-right"><strong>TOTAL SEGUN SISTEMA</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(systemTotals.total_card_debit || 0) }}</strong></td>
            </tr>
            <!-- Solo mostrar DIFERENCIA si hay arqueo -->
            <tr v-if="session.bank_payments && session.bank_payments.filter(p => p.payment_method === 'TARJ_DEBITO' || p.payment_method === 'TARJ. DEBITO').length > 0" class="difference-row">
              <td colspan="3" class="text-right"><strong>DIFERENCIA:</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(getTotalBankPayments('TARJ_DEBITO') - (systemTotals.total_card_debit || 0)) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CHEQUE Section -->
      <div class="section">
        <div class="section-header orange">CHEQUE</div>
        <table class="payments-table">
          <thead>
            <tr>
              <th>Banco</th>
              <th>Referencia</th>
              <th>Moneda</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <!-- Solo mostrar pagos si existen (arqueo realizado) -->
            <template v-if="session.bank_payments && session.bank_payments.filter(p => p.payment_method === 'CHEQUE').length > 0">
              <tr v-for="(payment, index) in session.bank_payments.filter(p => p.payment_method === 'CHEQUE')" :key="index">
                <td>{{ payment.bank || '' }}</td>
                <td>{{ payment.reference || '' }}</td>
                <td>{{ payment.currency || 'LEMPIRA' }}</td>
                <td class="text-right">{{ formatCurrency(payment.total_local || payment.amount || 0) }}</td>
              </tr>
              <!-- Solo mostrar TOTAL SEGÚN ARQUEO si hay pagos registrados -->
              <tr class="total-row">
                <td colspan="3" class="text-right"><strong>TOTAL SEGUN ARQUEO</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(getTotalBankPayments('CHEQUE')) }}</strong></td>
              </tr>
            </template>
            <!-- Siempre mostrar TOTAL SEGÚN SISTEMA -->
            <tr class="system-row">
              <td colspan="3" class="text-right"><strong>TOTAL SEGUN SISTEMA</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(systemTotals.total_check || 0) }}</strong></td>
            </tr>
            <!-- Solo mostrar DIFERENCIA si hay arqueo -->
            <tr v-if="session.bank_payments && session.bank_payments.filter(p => p.payment_method === 'CHEQUE').length > 0" class="difference-row">
              <td colspan="3" class="text-right"><strong>DIFERENCIA:</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(getTotalBankPayments('CHEQUE') - (systemTotals.total_check || 0)) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TOTALES FINALES -->
      <div class="section">
        <div class="section-header orange">TOTALES</div>
        <table class="totals-summary">
          <tbody>
            <tr class="total-arqueo">
              <td class="text-right"><strong>TOTAL SEGUN ARQUEO:</strong></td>
              <td class="text-right highlight-amount"><strong>{{ formatCurrency(session.total_by_count || 0) }}</strong></td>
            </tr>
            <tr class="total-sistema">
              <td class="text-right"><strong>TOTAL SEGUN SISTEMA:</strong></td>
              <td class="text-right highlight-amount"><strong>{{ formatCurrency(systemTotals.total_general || 0) }}</strong></td>
            </tr>
            <tr class="total-diferencia">
              <td class="text-right"><strong>DIFERENCIA:</strong></td>
              <td class="text-right highlight-amount"><strong>{{ formatCurrency((session.total_by_count || 0) - (systemTotals.total_general || 0)) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer info -->
      <div class="footer-info" v-if="session.notes">
        <p><strong>Notas:</strong> {{ session.notes }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading">
      <p>Cargando arqueo de caja...</p>
    </div>
  </div>
</template>

<script>
import api from '@/api/config';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default {
  name: 'PrintArqueo',
  data() {
    return {
      session: null,
      billingSettings: null,
      showExportModal: false,
      systemTotals: {
        total_cash_sales: 0, // Solo ventas en efectivo
        total_cash: 0, // Efectivo disponible en caja
        total_card_credit: 0,
        total_card_debit: 0,
        total_transfer: 0,
        total_credit_note: 0,
        total_check: 0,
        total_link_payment: 0,
        total_general: 0
      }
    };
  },
  async mounted() {
    await this.loadData();

    // Si viene un formato en la query, ejecutar automáticamente
    const format = this.$route.query.format;
    if (format) {
      this.$nextTick(() => {
        switch(format) {
          case 'excel':
            this.exportToExcel();
            break;
          case 'pdf':
            this.exportToPDF();
            break;
          case 'image':
            this.exportToImage();
            break;
          case 'print':
            this.printDocument();
            break;
        }
      });
    }
  },
  methods: {
    async loadData() {
      try {
        const sessionId = this.$route.params.id;

        // Load session and billing settings in parallel
        const [sessionResponse, billingResponse] = await Promise.all([
          api.get(`/cash-register/sessions/${sessionId}`),
          api.get('/billing/settings')
        ]);

        this.session = sessionResponse.data?.data;
        this.systemTotals = this.session?.system_totals || this.systemTotals;
        this.billingSettings = billingResponse.data?.data;

        console.log('Session loaded:', this.session);
        console.log('System Totals:', this.systemTotals);
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Error al cargar el arqueo de caja');
      }
    },

    printDocument() {
      this.showExportModal = false;
      setTimeout(() => {
        window.print();
        // Detectar cuando se cierra el diálogo de impresión
        const mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener((mql) => {
          if (!mql.matches) {
            // El diálogo de impresión se cerró
            setTimeout(() => {
              window.close();
            }, 500);
          }
        });
      }, 100);
    },

    async exportToExcel() {
      this.showExportModal = false;
      try {
        // Importar XLSX dinámicamente
        const XLSX = await import('xlsx');

        // Preparar datos para Excel
        const data = [];

        // Encabezado
        data.push(['ARQUEO DE CAJA']);
        data.push(['Consecutivo:', this.session.consecutive]);
        data.push(['Usuario:', this.session.user_name]);
        data.push(['Fecha:', this.formatDate(this.session.date_from)]);
        data.push([]);

        // Movimientos de Caja
        data.push(['MOVIMIENTOS DE CAJA']);
        data.push(['Concepto', 'Monto']);
        data.push(['Apertura de Caja', this.session.opening_amount]);
        data.push(['Egresos de Caja', this.getTotalEgresos()]);
        data.push(['Retiros de Caja', this.getTotalRetiros()]);
        data.push(['Devoluciones de Dinero', this.getTotalDevoluciones()]);
        data.push([]);

        // Efectivo
        data.push(['EFECTIVO']);
        data.push(['Total Según Arqueo', this.getTotalCashCount()]);
        data.push(['Total Según Sistema', this.getEfectivoSegunSistema()]);
        data.push(['Diferencia', this.getTotalCashCount() - this.getEfectivoSegunSistema()]);
        data.push([]);

        // Transferencias
        if (this.systemTotals.total_transfer > 0) {
          data.push(['TRANSFERENCIA']);
          data.push(['Total Según Arqueo', this.getTotalBankPayments('TRANSFERENCIA')]);
          data.push(['Total Según Sistema', this.systemTotals.total_transfer]);
          data.push(['Diferencia', this.getTotalBankPayments('TRANSFERENCIA') - this.systemTotals.total_transfer]);
          data.push([]);
        }

        // Notas de Crédito
        if (this.getTotalDevoluciones() > 0) {
          data.push(['NOTA DE CREDITO']);
          data.push(['Total Según Arqueo', this.getTotalBankPayments('NOTA DE CREDITO')]);
          data.push(['Total Según Sistema', this.getTotalDevoluciones()]);
          data.push(['Diferencia', this.getTotalBankPayments('NOTA DE CREDITO') - this.getTotalDevoluciones()]);
          data.push([]);
        }

        // Totales Finales
        data.push(['TOTALES']);
        data.push(['Total Según Arqueo', this.session.total_by_count]);
        data.push(['Total Según Sistema', this.systemTotals.total_general]);
        data.push(['Diferencia', (this.session.total_by_count || 0) - this.systemTotals.total_general]);

        // Crear libro de Excel
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Arqueo de Caja');

        // Descargar archivo
        XLSX.writeFile(wb, `arqueo_caja_${this.session.consecutive}.xlsx`);

        // Cerrar ventana después de la descarga
        setTimeout(() => {
          window.close();
        }, 1000);
      } catch (error) {
        console.error('Error exporting Excel:', error);
        alert('Error al generar el archivo Excel');
      }
    },

    async exportToPDF() {
      this.showExportModal = false;
      try {
        const element = document.querySelector('.print-content');
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: element.scrollWidth,
          height: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'letter');

        // Calcular dimensiones con márgenes
        const pageWidth = 210; // Letter width en mm
        const pageHeight = 279.4; // Letter height en mm
        const margin = 15; // Margen de 15mm
        const imgWidth = pageWidth - (margin * 2); // 180mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = margin;

        // Agregar primera página
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);

        // Agregar páginas adicionales si es necesario
        while (heightLeft > 0) {
          position = heightLeft - imgHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
          heightLeft -= (pageHeight - margin * 2);
        }

        pdf.save(`arqueo_caja_${this.session.consecutive}.pdf`);

        // Cerrar ventana después de la descarga
        setTimeout(() => {
          window.close();
        }, 1000);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error al generar el PDF');
      }
    },

    async exportToImage() {
      this.showExportModal = false;
      try {
        const element = document.querySelector('.print-content');
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: element.scrollWidth,
          height: element.scrollHeight
        });

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `arqueo_caja_${this.session.consecutive}.png`;
          a.click();
          URL.revokeObjectURL(url);

          // Cerrar ventana después de la descarga
          setTimeout(() => {
            window.close();
          }, 1000);
        });
      } catch (error) {
        console.error('Error exporting image:', error);
        alert('Error al generar la imagen');
      }
    },

    goBack() {
      // Si está en iframe o ventana emergente, cerrar
      if (window.opener || window.parent !== window) {
        window.close();
      } else {
        // Si está en navegación normal, regresar a la lista
        this.$router.push('/cash-register');
      }
    },

    formatCurrency(value) {
      if (!value && value !== 0) return 'L 0.00';
      const num = parseFloat(value);
      return `L ${num.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    formatDate(date) {
      if (!date) return 'N/A';
      const d = new Date(date);
      // Sumar un día para compensar el problema de zona horaria UTC
      d.setDate(d.getDate() + 1);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },

    formatTime(time) {
      if (!time) return 'N/A';
      return time;
    },

    formatDateTime(datetime) {
      if (!datetime) return 'N/A';
      const d = new Date(datetime);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} - ${hours}:${minutes}`;
    },

    getLogoUrl() {
      if (!this.billingSettings?.company_logo) return '';
      // Si el logo ya es una URL completa, usarla directamente
      if (this.billingSettings.company_logo.startsWith('http')) {
        return this.billingSettings.company_logo;
      }
      // Si es una ruta relativa, construir la URL
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const baseUrl = API_URL.replace('/api/v1', '');
      return `${baseUrl}${this.billingSettings.company_logo}`;
    },

    getTotalCashCount() {
      // Si no hay denominaciones o la caja está ABIERTA (sin arqueo), retornar 0
      if (!this.session?.denominations || this.session.denominations.length === 0) {
        return 0;
      }

      // Sumar todas las denominaciones de efectivo
      const totalDenominations = this.session.denominations.reduce((sum, denom) => {
        const totalValue = parseFloat(denom.total_value) || 0;
        if (totalValue > 0) {
          return sum + totalValue;
        }
        const unitValue = parseFloat(denom.unit_value) || 0;
        const quantity = parseFloat(denom.quantity) || 0;
        return sum + (unitValue * quantity);
      }, 0);

      // Restar las notas de crédito de tipo EFECTIVO
      const creditNotesInCash = this.session.bank_payments
        ?.filter(p => p.payment_method === 'NOTA DE CREDITO' && p.credit_note_type === 'EFECTIVO')
        .reduce((sum, p) => sum + parseFloat(p.total_local || 0), 0) || 0;

      return totalDenominations - creditNotesInCash;
    },

    getTotalBankPayments(method) {
      if (!this.session?.bank_payments) return 0;

      const methodVariants = {
        'TRANSFERENCIA': ['TRANSFERENCIA'],
        'TARJETA': ['TARJETA', 'TARJ_CREDITO', 'TARJETA_CREDITO', 'TARJ. CREDITO'],
        'TARJ_DEBITO': ['TARJ_DEBITO', 'TARJETA_DEBITO', 'TARJ. DEBITO'],
        'CHEQUE': ['CHEQUE'],
        'NOTA DE CREDITO': ['NOTA DE CREDITO', 'NOTA_CREDITO']
      };

      const variants = methodVariants[method] || [method];

      return this.session.bank_payments
        .filter(p => variants.includes(p.payment_method))
        .reduce((sum, p) => sum + parseFloat(p.total_local || p.amount || 0), 0);
    },

    getBankPaymentsByMethod(method) {
      if (!this.session?.bank_payments) return [];

      const methodVariants = {
        'TRANSFERENCIA': ['TRANSFERENCIA'],
        'TARJETA': ['TARJETA', 'TARJ_CREDITO', 'TARJETA_CREDITO', 'TARJ. CREDITO'],
        'TARJ_DEBITO': ['TARJ_DEBITO', 'TARJETA_DEBITO', 'TARJ. DEBITO'],
        'CHEQUE': ['CHEQUE'],
        'NOTA DE CREDITO': ['NOTA DE CREDITO', 'NOTA_CREDITO']
      };

      const variants = methodVariants[method] || [method];

      return this.session.bank_payments.filter(p => variants.includes(p.payment_method));
    },

    hasBankPayments(method) {
      if (!this.session?.bank_payments) return false;

      const methodVariants = {
        'TRANSFERENCIA': ['TRANSFERENCIA'],
        'TARJETA': ['TARJETA', 'TARJ_CREDITO', 'TARJETA_CREDITO', 'TARJ. CREDITO'],
        'TARJ_DEBITO': ['TARJ_DEBITO', 'TARJETA_DEBITO', 'TARJ. DEBITO'],
        'CHEQUE': ['CHEQUE'],
        'NOTA DE CREDITO': ['NOTA DE CREDITO', 'NOTA_CREDITO']
      };

      const variants = methodVariants[method] || [method];

      return this.session.bank_payments.some(p => variants.includes(p.payment_method));
    },

    // Calcular egresos de caja (transacciones tipo EGRESO)
    getTotalEgresos() {
      if (!this.session?.transactions) return 0;
      return this.session.transactions
        .filter(t => t.transaction_type === 'EGRESO')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    },

    // Calcular retiros de caja (transacciones tipo RETIRO)
    getTotalRetiros() {
      if (!this.session?.transactions) return 0;
      return this.session.transactions
        .filter(t => t.transaction_type === 'RETIRO')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    },

    // Calcular devoluciones de dinero (transacciones tipo DEVOLUCION)
    getTotalDevoluciones() {
      if (!this.session?.transactions) return 0;
      return this.session.transactions
        .filter(t => t.transaction_type === 'DEVOLUCION')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    },

    // Calcular efectivo según sistema: ventas + apertura - movimientos
    getEfectivoSegunSistema() {
      const ventasEfectivo = this.systemTotals.total_cash_sales || 0;
      const apertura = parseFloat(this.session?.opening_amount || 0);
      const egresos = this.getTotalEgresos();
      const retiros = this.getTotalRetiros();
      const devoluciones = this.getTotalDevoluciones();

      return ventasEfectivo + apertura - egresos - retiros - devoluciones;
    }
  }
};
</script>

<style scoped>
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.print-container {
  width: 17cm;
  min-height: 27.94cm;
  margin: 0 auto;
  padding: 3cm 2.5cm;
  background: white;
  font-family: Arial, sans-serif;
  font-size: 9pt;
  color: #000;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.print-content {
  width: 100%;
}

/* Export Buttons */
.export-buttons {
  text-align: center;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 5px;
}

.export-buttons .btn {
  margin: 0 5px;
}

/* Company Header */
.company-header {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  border-bottom: 3px solid #ff6600;
  padding-bottom: 10px;
  align-items: center;
}

.logo-section {
  flex-shrink: 0;
}

.company-logo {
  max-width: 120px;
  max-height: 80px;
  object-fit: contain;
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 14pt;
  font-weight: bold;
  margin: 0;
  color: #000;
}

.company-subtitle {
  font-size: 10pt;
  margin: 3px 0;
  color: #333;
}

.company-details {
  font-size: 8pt;
  margin-top: 5px;
  line-height: 1.4;
}

.company-details p {
  margin: 2px 0;
}

/* Document Title */
.doc-title {
  text-align: center;
  background: linear-gradient(135deg, #ff6600 0%, #ff9933 100%);
  color: white;
  padding: 12px;
  margin: 10px 0;
  border-radius: 5px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.doc-title h2 {
  font-size: 16pt;
  font-weight: bold;
  margin: 0;
  color: white;
}

.arqueo-number {
  font-size: 11pt;
  margin: 5px 0 0 0;
}

.highlight {
  font-weight: bold;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 3px;
}

/* Emission Info */
.emission-info {
  border: 2px solid #ff6600;
  padding: 8px;
  margin: 10px 0;
  background: #fff8f0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin: 3px 0;
  font-size: 8pt;
}

.info-item {
  flex: 1;
}

/* Section Styles */
.section {
  margin: 12px 0;
  page-break-inside: avoid;
}

.section-header {
  background-color: #4472c4;
  color: white;
  padding: 6px;
  font-weight: bold;
  text-align: center;
  font-size: 10pt;
  margin-bottom: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.section-header.orange {
  background: linear-gradient(135deg, #ff6600 0%, #ff9933 100%);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Tables */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
}

.data-table tr {
  border: 1px solid #333;
}

.data-table td {
  padding: 6px 8px;
  font-size: 9pt;
  border: 1px solid #333;
}

.label-cell {
  text-align: left;
  width: 70%;
  font-weight: 500;
}

.amount-cell {
  text-align: right;
  width: 30%;
  font-weight: bold;
}

/* Denominations Table */
.denominations-table,
.payments-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
}

.denominations-table th,
.denominations-table td,
.payments-table th,
.payments-table td {
  border: 1px solid #333;
  padding: 5px 8px;
  font-size: 8pt;
}

.denominations-table th,
.payments-table th {
  background-color: #ffe6cc;
  font-weight: bold;
  text-align: center;
  color: #333;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.total-row {
  background-color: #fff3e0;
  font-weight: bold;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.system-row {
  background-color: #e3f2fd;
  font-weight: bold;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.difference-row {
  background-color: #f3e5f5;
  font-weight: bold;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Totals Summary */
.totals-summary {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
}

.totals-summary tr {
  border: 2px solid #ff6600;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.totals-summary td {
  padding: 8px;
  font-size: 11pt;
  border: 2px solid #ff6600;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.total-arqueo {
  background-color: #fff8f0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.total-sistema {
  background-color: #e3f2fd;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.total-diferencia {
  background-color: #f3e5f5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.highlight-amount {
  color: #000;
  font-size: 12pt;
  font-weight: bold;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Footer */
.footer-info {
  margin-top: 15px;
  padding: 8px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  font-size: 8pt;
}

/* Text Alignment */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

/* Loading State */
.loading {
  text-align: center;
  padding: 50px;
  font-size: 14pt;
}

/* Print Styles */
@media print {
  .no-print,
  .export-buttons {
    display: none !important;
  }

  .print-container {
    padding: 1.5cm 2cm;
    margin: 0;
    width: 100%;
  }

  body {
    margin: 0;
    padding: 0;
  }

  .section {
    page-break-inside: avoid;
  }

  @page {
    margin: 1.5cm 2cm;
  }
}
</style>
