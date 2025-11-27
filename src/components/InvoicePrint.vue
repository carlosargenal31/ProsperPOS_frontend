<template>
  <div class="invoice-print-wrapper" v-if="invoiceData">
    <!-- Encabezado -->
    <div class="invoice-header text-center">
      <div class="company-logo mb-2">
        <img v-if="companyLogo" :src="companyLogo" alt="Logo" style="max-width: 150px; max-height: 80px;">
      </div>
      <h4 class="company-name mb-1">{{ companyInfo.name }}</h4>
      <p class="company-details mb-0">
        <strong>RTN:</strong> {{ companyInfo.rtn }}<br>
        <strong>Dirección:</strong> {{ companyInfo.address }}<br>
        <strong>Teléfono de Empresa:</strong> {{ companyInfo.phone }}<br>
        <strong>Teléfono Móvil:</strong> {{ companyInfo.mobile }}<br>
        {{ companyInfo.email }}
      </p>
      <p class="cai-info mt-2 mb-2">
        <strong>CAI:</strong> {{ resolutionInfo.cai }}
      </p>
      <h3 class="document-type mt-3 mb-2">{{ documentType }}</h3>
      <h4 class="invoice-number mb-3">{{ invoiceData.invoice_number }}</h4>
    </div>

    <!-- Información de Transacción -->
    <div class="transaction-info mb-3 text-center">
      <p class="mb-1"><strong>Condiciones de la Transacción:</strong> {{ invoiceData.payment_terms || 'CONTADO' }}</p>
      <p class="mb-1"><strong>Cliente:</strong> {{ customerInfo.name }}</p>
      <p class="mb-1"><strong>RTN:</strong> {{ customerInfo.rtn || '00000000000000' }}</p>
      <p class="mb-1"><strong>Vendedor:</strong> {{ vendorInfo.name }}</p>
    </div>

    <hr class="separator">

    <!-- Tabla de Productos -->
    <table class="items-table">
      <thead>
        <tr>
          <th class="text-center" style="width: 15%;">Cant</th>
          <th style="width: 50%;">Artículo</th>
          <th class="text-end" style="width: 17.5%;">P/Unit</th>
          <th class="text-end" style="width: 17.5%;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in invoiceData.items" :key="index">
          <td class="text-center">{{ formatQuantity(item.quantity) }}</td>
          <td>{{ item.product_name || item.name }}</td>
          <td class="text-end">{{ formatCurrency(item.price) }}</td>
          <td class="text-end">{{ formatCurrency(item.total) }}</td>
        </tr>
      </tbody>
    </table>

    <hr class="separator mt-3">

    <!-- Totales -->
    <div class="totals-section">
      <div class="totals-row">
        <span>Sub Total Importe Exonerado:</span>
        <span>L {{ formatCurrency(0) }}</span>
      </div>
      <div class="totals-row">
        <span>Sub Total Importe Exento:</span>
        <span>L {{ formatCurrency(0) }}</span>
      </div>
      <div class="totals-row">
        <span>Sub Total Importe Gravado 15%:</span>
        <span>L {{ formatCurrency(invoiceData.subtotal || 0) }}</span>
      </div>
      <div class="totals-row">
        <span>Sub Total Importe Gravado 18%:</span>
        <span>L {{ formatCurrency(0) }}</span>
      </div>
      <div class="totals-row">
        <span>I.S.V 15 15%:</span>
        <span>L {{ formatCurrency(invoiceData.tax || invoiceData.tax_amount || 0) }}</span>
      </div>
      <div class="totals-row">
        <span>I.S.V 18 18%:</span>
        <span>L {{ formatCurrency(0) }}</span>
      </div>
      <div class="totals-row">
        <span>Recargos:</span>
        <span>L {{ formatCurrency(invoiceData.surcharge || 0) }}</span>
      </div>
      <div class="totals-row">
        <span>Descuentos y Rebajas Otorgados:</span>
        <span>L {{ formatCurrency(invoiceData.discount || invoiceData.discount_amount || 0) }}</span>
      </div>
      <div class="totals-row total-final fw-bold">
        <span>TOTAL A PAGAR:</span>
        <span>L {{ formatCurrency(computedTotal) }}</span>
      </div>
    </div>

    <hr class="separator mt-3">

    <!-- Pagos Recibidos -->
    <div class="payments-section mt-3">
      <h5 class="text-center mb-2">Pagos Recibidos</h5>
      <div class="totals-row" v-if="invoiceData.payment_method">
        <span>{{ getPaymentMethodName(invoiceData.payment_method) }}:</span>
        <span>L {{ formatCurrency(computedTotal) }}</span>
      </div>
      <div v-if="invoiceData.payment_methods">
        <div class="totals-row" v-for="(payment, index) in invoiceData.payment_methods" :key="index">
          <span>{{ getPaymentMethodName(payment.method) }}:</span>
          <span>L {{ formatCurrency(payment.amount) }}</span>
        </div>
      </div>
      <p class="mt-2 mb-0 text-center"><strong>Valor en letras:</strong> {{ totalInWords }}</p>
    </div>

    <!-- Información Legal -->
    <div class="legal-info mt-4 text-center">
      <p class="mb-1"><strong>Rango de facturación Vigente:</strong></p>
      <p class="mb-1">Desde: {{ resolutionInfo.from }}</p>
      <p class="mb-1">Hasta: {{ resolutionInfo.to }}</p>
      <p class="mb-2"><strong>Fecha Límite de Emisión Vigente:</strong> {{ resolutionInfo.expiry_date }}</p>

      <p class="mb-1">No. Correlativo de la Orden de Compra Exenta:</p>
      <p class="mb-1">No. Correlativo de la Constancia del Reg Exonerado:</p>
      <p class="mb-2">No. Identificativo del Registro SAG:</p>

      <p class="mb-1"><strong>Emisión:</strong> {{ formatDateTime(invoiceData.created_at) }}</p>
      <p class="mb-1"><strong>Entrega:</strong> {{ formatDate(invoiceData.delivery_date || invoiceData.created_at) }}</p>
    </div>

    <!-- Pie de Página -->
    <div class="footer-info text-center mt-4">
      <p class="mb-0"><small>Original: Cliente/Copia: Obligado Tributario Emisor.</small></p>
      <p class="mb-0"><small><strong>¡La Factura es beneficio de todos. Exíjala!</strong></small></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvoicePrint',
  props: {
    invoiceData: {
      type: Object,
      required: true
    },
    companyInfo: {
      type: Object,
      default: () => ({
        name: 'CERAMICAS TERRAZOS Y PULIDOS UNIVERSAL',
        rtn: '01061977002516',
        address: 'Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico. La Ceiba, Atlántida',
        phone: '2440-0037',
        mobile: '9875-2725',
        email: 'mauricio_argenal@hotmail.com'
      })
    },
    resolutionInfo: {
      type: Object,
      default: () => ({
        cai: '2A9170-F8828A-8815E0-63BE03-090956-9D',
        from: '000-002-01-00030001',
        to: '000-002-01-00040000',
        expiry_date: '31/12/2025'
      })
    },
    customerInfo: {
      type: Object,
      default: () => ({
        name: 'CONSUMIDOR FINAL',
        rtn: '00000000000000'
      })
    },
    vendorInfo: {
      type: Object,
      default: () => ({
        name: 'SIN VENDEDOR'
      })
    },
    companyLogo: {
      type: String,
      default: null
    },
    documentType: {
      type: String,
      default: 'FACTURA'
    }
  },
  computed: {
    computedTotal() {
      // Calcular el total correcto
      const subtotal = parseFloat(this.invoiceData.subtotal || 0);
      const tax = parseFloat(this.invoiceData.tax || this.invoiceData.tax_amount || 0);
      const discount = parseFloat(this.invoiceData.discount || this.invoiceData.discount_amount || 0);
      const surcharge = parseFloat(this.invoiceData.surcharge || 0);

      return subtotal + tax + surcharge - discount;
    },
    totalInWords() {
      // Convertir número a letras en español (Honduras)
      return this.numberToWords(this.computedTotal);
    }
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
    },
    formatQuantity(value) {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    },
    getPaymentMethodName(method) {
      const methods = {
        'EFECTIVO': 'Efectivo',
        'TRANSFERENCIA': 'Transferencia',
        'CHEQUE': 'Cheque',
        'TARJ_DEBITO': 'Tarjeta Débito',
        'TARJ_CREDITO': 'Tarjeta Crédito'
      };
      return methods[method] || method;
    },
    numberToWords(num) {
      // Función simplificada para convertir número a palabras
      const value = parseFloat(num) || 0;
      const entero = Math.floor(value);
      const decimales = Math.round((value - entero) * 100);

      // Esta es una versión simplificada. Puedes usar una librería como 'numero-a-letras'
      return `${entero.toLocaleString('es-HN')} LEMPIRAS CON ${decimales}/100`;
    },
    print() {
      window.print();
    }
  }
};
</script>

<style scoped>
@media print {
  @page {
    size: 80mm auto;
    margin: 5mm;
  }

  body {
    margin: 0;
    padding: 0;
  }
}

.invoice-print-wrapper {
  max-width: 80mm;
  margin: 0 auto;
  padding: 10px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  line-height: 1.3;
  color: #000;
  background: #fff;
}

.company-logo img {
  display: block;
  margin: 0 auto;
}

.company-name {
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  margin: 5px 0;
}

.company-details {
  font-size: 10px;
  line-height: 1.4;
}

.cai-info {
  font-size: 10px;
  word-break: break-all;
}

.document-type {
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  margin: 10px 0 5px 0;
}

.invoice-number {
  font-size: 14px;
  font-weight: bold;
}

.transaction-info {
  font-size: 11px;
  text-align: left;
}

.separator {
  border: 0;
  border-top: 1px dashed #000;
  margin: 8px 0;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  margin: 5px 0;
}

.items-table th,
.items-table td {
  padding: 4px 2px;
  text-align: left;
  vertical-align: top;
}

.items-table th {
  border-bottom: 1px dashed #000;
  font-weight: bold;
}

.items-table td {
  border-bottom: 1px dotted #ccc;
}

.text-center {
  text-align: center !important;
}

.text-end {
  text-align: right !important;
}

.totals-section {
  font-size: 10px;
  margin-top: 10px;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
}

.totals-row.total-final {
  font-size: 12px;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid #000;
}

.payments-section {
  font-size: 10px;
}

.payments-section h5 {
  font-size: 12px;
  margin-bottom: 5px;
}

.legal-info {
  font-size: 9px;
  line-height: 1.3;
}

.footer-info {
  font-size: 9px;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #000;
}

.fw-bold {
  font-weight: bold;
}

.mb-0 { margin-bottom: 0 !important; }
.mb-1 { margin-bottom: 0.25rem !important; }
.mb-2 { margin-bottom: 0.5rem !important; }
.mb-3 { margin-bottom: 1rem !important; }
.mb-4 { margin-bottom: 1.5rem !important; }
.mt-2 { margin-top: 0.5rem !important; }
.mt-3 { margin-top: 1rem !important; }
.mt-4 { margin-top: 1.5rem !important; }

@media print {
  .invoice-print-wrapper {
    padding: 0;
    max-width: none;
  }

  /* Ocultar todo excepto la factura */
  body * {
    visibility: hidden;
  }

  .invoice-print-wrapper,
  .invoice-print-wrapper * {
    visibility: visible;
  }

  .invoice-print-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
