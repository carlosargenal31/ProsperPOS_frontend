<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <i class="ti ti-cash"></i>
          Procesar Pago
        </h3>
        <button class="btn-close" @click="$emit('close')">
          <i class="ti ti-x"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="payment-info">
          <div class="info-row">
            <span class="label">Total a Pagar:</span>
            <span class="value total">L {{ formatPrice(total) }}</span>
          </div>
        </div>

        <div class="payment-input-section">
          <label>Monto Recibido</label>
          <div class="amount-input-wrapper">
            <span class="currency">L</span>
            <input
              ref="amountInput"
              type="number"
              v-model.number="amountReceived"
              @input="calculateChange"
              class="amount-input"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>

          <div v-if="change >= 0" class="change-display" :class="{ positive: change > 0 }">
            <span class="label">Cambio:</span>
            <span class="value">L {{ formatPrice(change) }}</span>
          </div>

          <div v-else class="change-display insufficient">
            <span class="label">Falta:</span>
            <span class="value">L {{ formatPrice(Math.abs(change)) }}</span>
          </div>
        </div>

        <div class="quick-amounts">
          <span class="quick-label">Montos Rápidos:</span>
          <div class="quick-buttons">
            <button
              v-for="amount in quickAmounts"
              :key="amount"
              @click="setAmount(amount)"
              class="quick-btn"
            >
              L {{ amount }}
            </button>
            <button @click="setExactAmount" class="quick-btn exact">
              Exacto
            </button>
          </div>
        </div>

        <div class="payment-method-info">
          <i class="ti ti-info-circle"></i>
          <span>Método de pago: <strong>{{ paymentMethodLabel }}</strong></span>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">
          <i class="ti ti-x"></i>
          Cancelar
        </button>
        <button
          @click="confirmPayment"
          :disabled="!canConfirm"
          class="btn-primary"
        >
          <i class="ti ti-check"></i>
          Confirmar Pago
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'cash'
  }
});

const emit = defineEmits(['close', 'confirm']);

const amountReceived = ref(0);
const amountInput = ref(null);

const quickAmounts = computed(() => {
  const amounts = [50, 100, 200, 500, 1000];
  return amounts.filter(amount => amount >= Math.ceil(props.total));
});

const change = computed(() => {
  return amountReceived.value - props.total;
});

const canConfirm = computed(() => {
  return amountReceived.value >= props.total;
});

const paymentMethodLabel = computed(() => {
  const methods = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    credit: 'Crédito'
  };
  return methods[props.paymentMethod] || 'Efectivo';
});

const calculateChange = () => {
  // Computed property handles this
};

const setAmount = (amount) => {
  amountReceived.value = amount;
};

const setExactAmount = () => {
  amountReceived.value = props.total;
};

const confirmPayment = () => {
  if (canConfirm.value) {
    emit('confirm', {
      amount: amountReceived.value,
      change: change.value
    });
  }
};

const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2);
};

onMounted(() => {
  amountInput.value?.focus();
  setExactAmount();
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
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
  padding: 1.5rem;
}

.payment-info {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.125rem;
}

.label {
  color: #6b7280;
  font-weight: 500;
}

.value {
  font-weight: 700;
  color: #1f2937;
}

.value.total {
  font-size: 1.5rem;
  color: #3b82f6;
}

.payment-input-section {
  margin-bottom: 1.5rem;
}

.payment-input-section label {
  display: block;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency {
  position: absolute;
  left: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #6b7280;
}

.amount-input {
  width: 100%;
  padding: 1rem 1rem 1rem 2.5rem;
  font-size: 2rem;
  font-weight: 700;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s;
  text-align: right;
}

.amount-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.change-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 12px;
  font-size: 1.25rem;
  font-weight: 600;
}

.change-display.positive {
  background: #d1fae5;
  color: #065f46;
}

.change-display.insufficient {
  background: #fee2e2;
  color: #991b1b;
}

.quick-amounts {
  margin-bottom: 1.5rem;
}

.quick-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.quick-btn {
  padding: 0.75rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #4b5563;
}

.quick-btn:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.quick-btn.exact {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.quick-btn.exact:hover {
  background: #2563eb;
}

.payment-method-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #eff6ff;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e40af;
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
  font-size: 1rem;
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
  border: none;
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
</style>
