<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content large">
      <div class="modal-header">
        <h3>
          <i class="ti ti-file-invoice"></i>
          Detalle de Factura
        </h3>
        <button class="btn-close" @click="$emit('close')">
          <i class="ti ti-x"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando factura...</p>
        </div>

        <div v-else-if="invoice" class="invoice-detail">
          <!-- Header Info -->
          <div class="detail-header">
            <div class="header-left">
              <h2>{{ invoice.invoice_number }}</h2>
              <span :class="['status-badge', getStatusClass(invoice.payment_status)]">
                {{ getStatusLabel(invoice.payment_status) }}
              </span>
            </div>
            <div class="header-right">
              <div class="info-row">
                <span class="label">Fecha Emisión:</span>
                <span class="value">{{ formatDate(invoice.issue_date) }}</span>
              </div>
              <div v-if="invoice.due_date" class="info-row">
                <span class="label">Fecha Vencimiento:</span>
                <span class="value">{{ formatDate(invoice.due_date) }}</span>
              </div>
            </div>
          </div>

          <!-- Customer & Warehouse Info -->
          <div class="info-grid">
            <div class="info-card">
              <h4>
                <i class="ti ti-user"></i>
                Cliente
              </h4>
              <div class="info-content">
                <p class="name">{{ invoice.customer_name }}</p>
                <p v-if="invoice.customer_rtn" class="detail">RTN: {{ invoice.customer_rtn }}</p>
                <p v-if="invoice.customer_phone" class="detail">
                  <i class="ti ti-phone"></i>
                  {{ invoice.customer_phone }}
                </p>
                <p v-if="invoice.customer_email" class="detail">
                  <i class="ti ti-mail"></i>
                  {{ invoice.customer_email }}
                </p>
                <p v-if="invoice.customer_address" class="detail">
                  <i class="ti ti-map-pin"></i>
                  {{ invoice.customer_address }}
                </p>
              </div>
            </div>

            <div class="info-card">
              <h4>
                <i class="ti ti-building-store"></i>
                Almacén
              </h4>
              <div class="info-content">
                <p class="name">{{ invoice.warehouse_name || 'N/A' }}</p>
                <p class="detail">Creado por: {{ invoice.created_by_username }}</p>
                <p class="detail">{{ formatDateTime(invoice.created_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="section">
            <h4>Artículos</h4>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Descuento</th>
                  <th>ISV</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in invoice.items" :key="item.id">
                  <td>
                    <div class="product-cell">
                      <strong>{{ item.product_name }}</strong>
                      <span class="sku">{{ item.product_sku }}</span>
                    </div>
                  </td>
                  <td>{{ item.quantity }}</td>
                  <td class="amount">L {{ formatPrice(item.unit_price) }}</td>
                  <td class="amount">
                    <span v-if="item.discount_amount > 0">- L {{ formatPrice(item.discount_amount) }}</span>
                    <span v-else>-</span>
                  </td>
                  <td class="amount">L {{ formatPrice(item.tax_amount) }}</td>
                  <td class="amount strong">L {{ formatPrice(item.line_total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="totals-section">
            <div class="totals-grid">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>L {{ formatPrice(invoice.subtotal) }}</span>
              </div>
              <div v-if="invoice.discount_amount > 0" class="total-row">
                <span>Descuento:</span>
                <span class="discount">- L {{ formatPrice(invoice.discount_amount) }}</span>
              </div>
              <div class="total-row">
                <span>ISV ({{ invoice.tax_rate }}%):</span>
                <span>L {{ formatPrice(invoice.tax_amount) }}</span>
              </div>
              <div v-if="invoice.shipping_cost > 0" class="total-row">
                <span>Envío:</span>
                <span>L {{ formatPrice(invoice.shipping_cost) }}</span>
              </div>
              <div class="total-row grand">
                <span>Total:</span>
                <span>L {{ formatPrice(invoice.total) }}</span>
              </div>
              <div class="total-row paid">
                <span>Pagado:</span>
                <span>L {{ formatPrice(invoice.paid_amount) }}</span>
              </div>
              <div v-if="invoice.balance_due > 0" class="total-row balance">
                <span>Pendiente:</span>
                <span>L {{ formatPrice(invoice.balance_due) }}</span>
              </div>
            </div>
          </div>

          <!-- Payments History -->
          <div v-if="invoice.payments && invoice.payments.length > 0" class="section">
            <h4>Historial de Pagos</h4>
            <table class="payments-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Referencia</th>
                  <th>Registrado por</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in invoice.payments" :key="payment.id">
                  <td>{{ formatDateTime(payment.payment_date) }}</td>
                  <td class="amount">L {{ formatPrice(payment.amount) }}</td>
                  <td>
                    <span class="payment-method">{{ payment.payment_method }}</span>
                  </td>
                  <td>{{ payment.reference_number || '-' }}</td>
                  <td>{{ payment.created_by_username }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Credit Notes -->
          <div v-if="invoice.credit_notes && invoice.credit_notes.length > 0" class="section">
            <h4>Notas de Crédito</h4>
            <table class="credit-notes-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Razón</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cn in invoice.credit_notes" :key="cn.id">
                  <td><strong>{{ cn.credit_note_number }}</strong></td>
                  <td>{{ formatDate(cn.created_at) }}</td>
                  <td>{{ cn.reason }}</td>
                  <td class="amount">L {{ formatPrice(cn.total) }}</td>
                  <td>
                    <span class="badge">{{ cn.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Notes -->
          <div v-if="invoice.notes" class="section">
            <h4>Notas</h4>
            <p class="notes-text">{{ invoice.notes }}</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">
          <i class="ti ti-x"></i>
          Cerrar
        </button>

        <button v-if="invoice && invoice.payment_status !== 'paid'" @click="openPaymentModal" class="btn-success">
          <i class="ti ti-cash"></i>
          Registrar Pago
        </button>

        <button @click="printInvoice" class="btn-print">
          <i class="ti ti-printer"></i>
          Imprimir
        </button>

        <button @click="downloadPDF" class="btn-primary">
          <i class="ti ti-download"></i>
          Descargar PDF
        </button>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentRecordModal
      v-if="showPaymentModal"
      :invoice="invoice"
      @close="showPaymentModal = false"
      @payment-saved="handlePaymentSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import PaymentRecordModal from './PaymentRecordModal.vue';

const props = defineProps({
  invoiceId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close', 'payment-recorded']);

const invoice = ref(null);
const loading = ref(false);
const showPaymentModal = ref(false);

const loadInvoice = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/v1/billing/invoices/${props.invoiceId}`);
    invoice.value = response.data.data;
  } catch (error) {
    console.error('Error loading invoice:', error);
    Swal.fire('Error', 'Error al cargar la factura', 'error');
    emit('close');
  } finally {
    loading.value = false;
  }
};

const openPaymentModal = () => {
  showPaymentModal.value = true;
};

const handlePaymentSaved = () => {
  showPaymentModal.value = false;
  loadInvoice();
  emit('payment-recorded');
};

const printInvoice = () => {
  window.print();
};

const downloadPDF = async () => {
  try {
    Swal.fire({
      title: 'Generando PDF...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Implement PDF generation
    const response = await axios.get(`/api/v1/billing/invoices/${props.invoiceId}/print`);

    Swal.close();
    Swal.fire('¡Éxito!', 'PDF generado correctamente', 'success');
  } catch (error) {
    Swal.fire('Error', 'Error al generar el PDF', 'error');
  }
};

const getStatusLabel = (status) => {
  const statuses = {
    paid: 'Pagado',
    pending: 'Pendiente',
    partial: 'Parcial',
    overdue: 'Vencido',
    cancelled: 'Cancelado'
  };
  return statuses[status] || status;
};

const getStatusClass = (status) => {
  return `status-${status}`;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2);
};

onMounted(() => {
  loadInvoice();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

.modal-content.large {
  max-width: 1200px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.invoice-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.header-left h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
}

.status-badge.status-paid {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.status-partial {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.status-overdue {
  background: #fee2e2;
  color: #991b1b;
}

.header-right {
  text-align: right;
}

.info-row {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.info-row .label {
  color: #6b7280;
  font-size: 0.875rem;
}

.info-row .value {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.info-card h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.info-content .name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.info-content .detail {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section {
  margin-top: 1rem;
}

.section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.items-table,
.payments-table,
.credit-notes-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.items-table thead th,
.payments-table thead th,
.credit-notes-table thead th {
  padding: 0.75rem;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  font-size: 0.875rem;
  color: #4b5563;
  text-align: left;
}

.items-table tbody td,
.payments-table tbody td,
.credit-notes-table tbody td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #1f2937;
}

.items-table tbody tr:last-child td,
.payments-table tbody tr:last-child td,
.credit-notes-table tbody tr:last-child td {
  border-bottom: none;
}

.product-cell strong {
  display: block;
  margin-bottom: 0.25rem;
}

.product-cell .sku {
  font-size: 0.75rem;
  color: #9ca3af;
}

.amount {
  text-align: right;
}

.amount.strong {
  font-weight: 700;
}

.payment-method {
  padding: 0.25rem 0.75rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.totals-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
}

.totals-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
  margin-left: auto;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #4b5563;
}

.total-row span:last-child {
  font-weight: 600;
  color: #1f2937;
}

.total-row.grand {
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 2px solid #e5e7eb;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.total-row.paid span:last-child {
  color: #10b981;
}

.total-row.balance span:last-child {
  color: #ef4444;
  font-weight: 700;
}

.total-row .discount {
  color: #10b981;
}

.notes-text {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.6;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary,
.btn-success,
.btn-print,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
}

.btn-secondary {
  background: white;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-print {
  background: #f59e0b;
  color: white;
}

.btn-print:hover {
  background: #d97706;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.badge {
  padding: 0.25rem 0.75rem;
  background: #e5e7eb;
  color: #4b5563;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
