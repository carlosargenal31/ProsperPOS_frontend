<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content invoice-modal">
      <div class="modal-header">
        <h3>
          <i class="ti ti-file-invoice"></i>
          Factura Generada
        </h3>
        <button class="btn-close" @click="$emit('close')">
          <i class="ti ti-x"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="success-banner">
          <div class="success-icon">
            <i class="ti ti-check"></i>
          </div>
          <div class="success-text">
            <h4>¡Venta Exitosa!</h4>
            <p>Factura No. <strong>{{ invoice?.invoice_number || 'N/A' }}</strong></p>
          </div>
        </div>

        <div class="invoice-preview" id="invoice-print-area">
          <div class="invoice-header-section">
            <div class="company-info">
              <h2>ProsperPOS</h2>
              <p>Sistema de Punto de Venta</p>
            </div>
            <div class="invoice-meta">
              <div class="meta-row">
                <span class="label">Factura:</span>
                <span class="value">{{ invoice?.invoice_number }}</span>
              </div>
              <div class="meta-row">
                <span class="label">Fecha:</span>
                <span class="value">{{ formatDate(invoice?.issue_date) }}</span>
              </div>
              <div class="meta-row">
                <span class="label">Hora:</span>
                <span class="value">{{ formatTime(invoice?.issue_date) }}</span>
              </div>
            </div>
          </div>

          <div class="customer-info-section">
            <h5>Cliente</h5>
            <p class="customer-name">{{ invoice?.customer_name || 'CONSUMIDOR FINAL' }}</p>
            <p v-if="invoice?.customer_rtn" class="customer-detail">RTN: {{ invoice.customer_rtn }}</p>
            <p v-if="invoice?.customer_phone" class="customer-detail">
              <i class="ti ti-phone"></i>
              {{ invoice.customer_phone }}
            </p>
          </div>

          <div class="invoice-table">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in invoice?.items || []" :key="item.id">
                  <td>{{ item.product_name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>L {{ formatPrice(item.unit_price) }}</td>
                  <td>L {{ formatPrice(item.line_total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="invoice-totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>L {{ formatPrice(invoice?.subtotal) }}</span>
            </div>
            <div class="total-row" v-if="invoice?.discount_amount > 0">
              <span>Descuento:</span>
              <span>- L {{ formatPrice(invoice?.discount_amount) }}</span>
            </div>
            <div class="total-row">
              <span>ISV ({{ invoice?.tax_rate || 15 }}%):</span>
              <span>L {{ formatPrice(invoice?.tax_amount) }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>L {{ formatPrice(invoice?.total) }}</span>
            </div>
          </div>

          <div class="invoice-footer">
            <p>¡Gracias por su compra!</p>
            <p class="small">Este documento es una representación impresa de la factura electrónica</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">
          <i class="ti ti-x"></i>
          Cerrar
        </button>
        <button @click="printInvoice" class="btn-print">
          <i class="ti ti-printer"></i>
          Imprimir
        </button>
        <button @click="$emit('close')" class="btn-primary">
          <i class="ti ti-check"></i>
          Nueva Venta
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  invoice: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'print']);

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('es-HN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2);
};

const printInvoice = () => {
  window.print();
  emit('print');
};
</script>

<style scoped>
.invoice-modal {
  max-width: 800px;
}

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
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
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

.success-banner {
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.success-text h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.success-text p {
  margin: 0;
  opacity: 0.9;
}

.invoice-preview {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
}

.invoice-header-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.company-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
}

.company-info p {
  margin: 0;
  color: #6b7280;
}

.invoice-meta {
  text-align: right;
}

.meta-row {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.meta-row .label {
  color: #6b7280;
}

.meta-row .value {
  font-weight: 600;
  color: #1f2937;
}

.customer-info-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.customer-info-section h5 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.customer-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.customer-detail {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.invoice-table {
  margin-bottom: 1.5rem;
}

.invoice-table table {
  width: 100%;
  border-collapse: collapse;
}

.invoice-table thead th {
  padding: 0.75rem;
  background: #f3f4f6;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  font-size: 0.875rem;
  color: #4b5563;
  text-align: left;
}

.invoice-table tbody td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #1f2937;
}

.invoice-table tbody tr:last-child td {
  border-bottom: none;
}

.invoice-totals {
  border-top: 2px solid #e5e7eb;
  padding-top: 1rem;
  margin-bottom: 1.5rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #4b5563;
}

.total-row.grand-total {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 2px solid #e5e7eb;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.invoice-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.invoice-footer p {
  margin: 0.5rem 0;
  color: #6b7280;
}

.invoice-footer .small {
  font-size: 0.75rem;
  color: #9ca3af;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary,
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
}

.btn-secondary {
  background: white;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-print {
  background: #f59e0b;
  color: white;
}

.btn-print:hover {
  background: #d97706;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover {
  background: #059669;
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

/* Print styles */
@media print {
  .modal-overlay {
    position: static;
    background: none;
  }

  .modal-content {
    box-shadow: none;
    max-height: none;
  }

  .modal-header,
  .modal-footer,
  .success-banner {
    display: none !important;
  }

  .invoice-preview {
    border: none;
  }
}
</style>
