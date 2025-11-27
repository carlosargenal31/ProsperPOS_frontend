<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <i class="ti ti-cash"></i>
          Registrar Pago
        </h3>
        <button class="btn-close" @click="$emit('close')">
          <i class="ti ti-x"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Invoice Summary -->
        <div class="invoice-summary">
          <div class="summary-header">
            <h4>{{ invoice.invoice_number }}</h4>
            <span class="customer-name">{{ invoice.customer_name }}</span>
          </div>

          <div class="summary-amounts">
            <div class="amount-row">
              <span class="label">Total Factura:</span>
              <span class="value">L {{ formatPrice(invoice.total) }}</span>
            </div>
            <div class="amount-row paid">
              <span class="label">Pagado:</span>
              <span class="value">L {{ formatPrice(invoice.paid_amount) }}</span>
            </div>
            <div class="amount-row balance">
              <span class="label">Saldo Pendiente:</span>
              <span class="value">L {{ formatPrice(invoice.balance_due) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Form -->
        <form @submit.prevent="savePayment" class="payment-form">
          <div class="form-group">
            <label>Monto a Pagar <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="currency-symbol">L</span>
              <input
                ref="amountInput"
                type="number"
                v-model.number="paymentData.amount"
                step="0.01"
                min="0.01"
                :max="invoice.balance_due"
                class="form-control"
                placeholder="0.00"
                required
              />
            </div>
            <div class="quick-amounts">
              <button
                type="button"
                v-for="percent in [25, 50, 75, 100]"
                :key="percent"
                @click="setAmountByPercent(percent)"
                class="quick-btn"
              >
                {{ percent }}%
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Método de Pago <span class="required">*</span></label>
            <select v-model="paymentData.payment_method" class="form-control" required>
              <option value="">Seleccione un método</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta de Crédito/Débito</option>
              <option value="transfer">Transferencia Bancaria</option>
              <option value="check">Cheque</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div class="form-group" v-if="showReferenceField">
            <label>Número de Referencia</label>
            <input
              type="text"
              v-model="paymentData.reference_number"
              class="form-control"
              placeholder="Ej: Número de cheque, referencia de transferencia..."
            />
          </div>

          <div class="form-group">
            <label>Fecha de Pago <span class="required">*</span></label>
            <input
              type="datetime-local"
              v-model="paymentData.payment_date"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label>Notas (Opcional)</label>
            <textarea
              v-model="paymentData.notes"
              class="form-control"
              rows="3"
              placeholder="Agregar notas adicionales sobre este pago..."
            ></textarea>
          </div>

          <!-- Payment Preview -->
          <div v-if="paymentData.amount > 0" class="payment-preview">
            <h5>Resumen del Pago</h5>
            <div class="preview-content">
              <div class="preview-row">
                <span>Monto a pagar:</span>
                <span class="highlight">L {{ formatPrice(paymentData.amount) }}</span>
              </div>
              <div class="preview-row">
                <span>Saldo restante:</span>
                <span :class="remainingBalance === 0 ? 'success' : ''">
                  L {{ formatPrice(remainingBalance) }}
                </span>
              </div>
              <div v-if="remainingBalance === 0" class="success-message">
                <i class="ti ti-check-circle"></i>
                <span>Esta factura quedará totalmente pagada</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" @click="$emit('close')" class="btn-secondary">
          <i class="ti ti-x"></i>
          Cancelar
        </button>
        <button
          type="button"
          @click="savePayment"
          :disabled="!isValidPayment"
          class="btn-primary"
        >
          <i class="ti ti-check"></i>
          Registrar Pago
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const props = defineProps({
  invoice: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'payment-saved']);

const amountInput = ref(null);
const paymentData = ref({
  amount: 0,
  payment_method: '',
  reference_number: '',
  payment_date: '',
  notes: ''
});

const showReferenceField = computed(() => {
  return ['card', 'transfer', 'check'].includes(paymentData.value.payment_method);
});

const remainingBalance = computed(() => {
  return Math.max(0, props.invoice.balance_due - paymentData.value.amount);
});

const isValidPayment = computed(() => {
  return (
    paymentData.value.amount > 0 &&
    paymentData.value.amount <= props.invoice.balance_due &&
    paymentData.value.payment_method &&
    paymentData.value.payment_date
  );
});

const setAmountByPercent = (percent) => {
  paymentData.value.amount = parseFloat((props.invoice.balance_due * percent / 100).toFixed(2));
};

const savePayment = async () => {
  if (!isValidPayment.value) {
    Swal.fire('Aviso', 'Por favor complete todos los campos requeridos', 'warning');
    return;
  }

  const loading = Swal.fire({
    title: 'Registrando pago...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    await axios.post(`/api/v1/billing/invoices/${props.invoice.id}/payment`, paymentData.value);

    loading.close();

    await Swal.fire({
      icon: 'success',
      title: '¡Pago Registrado!',
      text: `Se ha registrado el pago de L ${formatPrice(paymentData.value.amount)}`,
      confirmButtonText: 'Aceptar'
    });

    emit('payment-saved');
  } catch (error) {
    loading.close();
    console.error('Error recording payment:', error);
    Swal.fire(
      'Error',
      error.response?.data?.message || 'Error al registrar el pago',
      'error'
    );
  }
};

const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2);
};

const initializePaymentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  paymentData.value.payment_date = `${year}-${month}-${day}T${hours}:${minutes}`;
};

onMounted(() => {
  initializePaymentDate();
  setAmountByPercent(100);
  amountInput.value?.focus();
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
  max-width: 600px;
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

.invoice-summary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  margin-bottom: 1.5rem;
}

.summary-header h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.customer-name {
  font-size: 0.875rem;
  opacity: 0.9;
}

.summary-amounts {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.amount-row.balance {
  padding-top: 0.75rem;
  margin-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 1.125rem;
  font-weight: 700;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 1rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #6b7280;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
}

.input-wrapper .form-control {
  padding-left: 2.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

.quick-amounts {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.quick-btn {
  flex: 1;
  padding: 0.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #4b5563;
}

.quick-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.payment-preview {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 0.5rem;
}

.payment-preview h5 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  color: #4b5563;
}

.preview-row span:last-child {
  font-weight: 700;
  color: #1f2937;
}

.preview-row .highlight {
  color: #3b82f6;
  font-size: 1.125rem;
}

.preview-row .success {
  color: #10b981;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #d1fae5;
  border-radius: 8px;
  color: #065f46;
  font-weight: 600;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.success-message i {
  font-size: 1.25rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary,
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

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
