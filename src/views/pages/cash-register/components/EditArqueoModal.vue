<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title text-white">
            <i class="ti ti-edit me-2"></i>Arqueo de Caja
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>

        <div class="modal-body">
          <!-- Información básica -->
          <div class="row mb-3">
            <div class="col-md-3">
              <label class="form-label fw-bold">Consecutivo</label>
              <input type="text" class="form-control" :value="formData.consecutive" readonly>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Usuario</label>
              <input type="text" class="form-control" :value="formData.user_name" readonly>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Agencia</label>
              <input type="text" class="form-control" v-model="formData.agency" readonly>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-3">
              <label class="form-label fw-bold">Fecha Desde</label>
              <input type="date" class="form-control" :value="formatDateForInput(formData.date_from)" readonly>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Fecha Hasta</label>
              <input type="date" class="form-control" :value="formatDateForInput(formData.date_to)" readonly>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Hora Desde</label>
              <input type="time" class="form-control" v-model="formData.time_from" readonly>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Hora Hasta</label>
              <input type="time" class="form-control" v-model="formData.time_to" readonly>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-12">
              <label class="form-label fw-bold">Notas</label>
              <textarea class="form-control" rows="2" v-model="formData.notes" placeholder="Notas" readonly></textarea>
            </div>
          </div>

          <!-- Movimientos de Caja -->
          <div class="mb-4">
            <h6 class="fw-bold mb-3">
              <i class="ti ti-cash-register me-2"></i>
              Movimientos de Caja
            </h6>
            <table class="table table-sm table-bordered">
              <thead class="table-light">
                <tr>
                  <th>MOVIMIENTO</th>
                  <th class="text-end">MONTO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><i class="ti ti-wallet me-1 text-success"></i>APERTURA DE CAJA</td>
                  <td class="text-end fw-medium text-success">{{ formatCurrency(formData.opening_amount || 0) }}</td>
                </tr>
                <tr v-if="getTotalEgresos() > 0">
                  <td><i class="ti ti-arrow-down-circle me-1 text-danger"></i>EGRESOS DE CAJA</td>
                  <td class="text-end fw-medium text-danger">{{ formatCurrency(getTotalEgresos()) }}</td>
                </tr>
                <tr v-if="getTotalRetiros() > 0">
                  <td><i class="ti ti-cash-off me-1 text-warning"></i>RETIROS DE CAJA</td>
                  <td class="text-end fw-medium text-warning">{{ formatCurrency(getTotalRetiros()) }}</td>
                </tr>
                <tr v-if="getTotalDevoluciones() > 0">
                  <td><i class="ti ti-arrow-back-up me-1 text-info"></i>DEVOLUCIONES DE DINERO</td>
                  <td class="text-end fw-medium text-info">{{ formatCurrency(getTotalDevoluciones()) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Alerta informativa -->
          <div class="alert alert-info mb-3">
            <i class="ti ti-info-circle me-2"></i>
            <strong>Ventas del día:</strong> Estos totales representan las ventas realizadas desde la apertura de caja hasta ahora.
            {{ formData.status === 'ABIERTA' ? 'Los totales se actualizan en tiempo real.' : '' }}
          </div>

          <!-- Totales por forma de pago (del sistema) - VENTAS DEL DÍA -->
          <div class="mb-4">
            <h6 class="fw-bold mb-3">
              <i class="ti ti-receipt me-2"></i>
              Ventas del Día (Según Sistema)
              <span v-if="formData.status === 'ABIERTA'" class="badge bg-success ms-2">
                <i class="ti ti-refresh"></i> En tiempo real
              </span>
            </h6>
            <table class="table table-sm table-bordered">
              <thead class="table-light">
                <tr>
                  <th>FORMA DE PAGO</th>
                  <th class="text-end">TOTAL VENTAS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="systemTotals.total_card_credit > 0">
                  <td><i class="ti ti-credit-card me-1"></i>TARJETA DE CRÉDITO</td>
                  <td class="text-end fw-medium">{{ formatCurrency(systemTotals.total_card_credit) }}</td>
                </tr>
                <tr v-if="systemTotals.total_card_debit > 0">
                  <td><i class="ti ti-credit-card me-1"></i>TARJETA DE DÉBITO</td>
                  <td class="text-end fw-medium">{{ formatCurrency(systemTotals.total_card_debit) }}</td>
                </tr>
                <tr>
                  <td><i class="ti ti-cash me-1"></i>EFECTIVO</td>
                  <td class="text-end fw-medium">{{ formatCurrency(systemTotals.total_cash_sales || 0) }}</td>
                </tr>
                <tr>
                  <td><i class="ti ti-building-bank me-1"></i>TRANSFERENCIA</td>
                  <td class="text-end fw-medium">{{ formatCurrency(systemTotals.total_transfer) }}</td>
                </tr>
                <tr v-if="systemTotals.total_link_payment > 0">
                  <td><i class="ti ti-link me-1"></i>LINK DE PAGO</td>
                  <td class="text-end fw-medium">{{ formatCurrency(systemTotals.total_link_payment) }}</td>
                </tr>
                <tr v-if="systemTotals.total_credit_note > 0">
                  <td><i class="ti ti-file-text me-1"></i>NOTA DE CRÉDITO</td>
                  <td class="text-end fw-medium">{{ formatCurrency(systemTotals.total_credit_note) }}</td>
                </tr>
                <tr v-if="systemTotals.total_check > 0">
                  <td><i class="ti ti-checkbox me-1"></i>CHEQUE</td>
                  <td class="text-end fw-medium">{{ formatCurrency(systemTotals.total_check) }}</td>
                </tr>
                <tr class="table-secondary fw-bold">
                  <td><i class="ti ti-receipt-2 me-1"></i>TOTAL VENTAS</td>
                  <td class="text-end">{{ formatCurrency(salesTotal) }}</td>
                </tr>
                <tr class="table-success">
                  <td><i class="ti ti-lock-open me-1"></i>APERTURA DE CAJA</td>
                  <td class="text-end">{{ formatCurrency(formData.opening_amount) }}</td>
                </tr>
                <tr v-if="getTotalEgresos() > 0" class="table-danger">
                  <td><i class="ti ti-arrow-down-circle me-1"></i>EGRESOS DE CAJA</td>
                  <td class="text-end text-danger">-{{ formatCurrency(getTotalEgresos()) }}</td>
                </tr>
                <tr v-if="getTotalRetiros() > 0" class="table-warning">
                  <td><i class="ti ti-cash-off me-1"></i>RETIROS DE CAJA</td>
                  <td class="text-end text-warning">-{{ formatCurrency(getTotalRetiros()) }}</td>
                </tr>
                <tr v-if="getTotalDevoluciones() > 0" class="table-info">
                  <td><i class="ti ti-arrow-back-up me-1"></i>DEVOLUCIONES DE DINERO</td>
                  <td class="text-end text-info">-{{ formatCurrency(getTotalDevoluciones()) }}</td>
                </tr>
                <tr class="table-primary fw-bold">
                  <td><i class="ti ti-calculator me-1"></i>TOTAL EN CAJA</td>
                  <td class="text-end">{{ formatCurrency(totalEnCaja) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Formas de pago y denominaciones -->
          <div class="row">
            <!-- Formas de Pago -->
            <div class="col-12 mb-3">
              <label class="form-label fw-bold">Forma de Pago</label>
              <select class="form-select mb-2" v-model="selectedPaymentMethod">
                <option value="">Seleccione una Forma de Pago</option>
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="NOTA DE CREDITO">NOTA DE CREDITO</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="TARJ. DEBITO">TARJ. DEBITO</option>
                <option value="TARJ. CREDITO">TARJ. CREDITO</option>
                <option value="LINK DE PAGO">LINK DE PAGO</option>
              </select>

              <!-- Campos adicionales según forma de pago -->
              <div v-if="selectedPaymentMethod && selectedPaymentMethod !== 'EFECTIVO'">
                <!-- Campo específico para Nota de Crédito -->
                <div v-if="selectedPaymentMethod === 'NOTA DE CREDITO'" class="row mb-2">
                  <div class="col-12">
                    <label class="form-label fw-bold">Tipo de Nota de Crédito</label>
                    <select class="form-select" v-model="creditNoteType">
                      <option value="">Seleccione el tipo</option>
                      <option value="EFECTIVO">EFECTIVO</option>
                      <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                    </select>
                  </div>
                </div>

                <div class="row mb-2">
                  <div class="col-6">
                    <label class="form-label">Moneda</label>
                    <select class="form-select" v-model="paymentCurrency">
                      <option value="LEMPIRA">LEMPIRA</option>
                      <option value="DOLAR">DOLAR</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label">Tasa de Cambio</label>
                    <input type="number" class="form-control" v-model.number="paymentExchangeRate" step="0.01">
                  </div>
                </div>

                <div class="row mb-2">
                  <div class="col-6">
                    <label class="form-label">Banco</label>
                    <input type="text" class="form-control" v-model="paymentBank" placeholder="Banco">
                  </div>
                  <div class="col-6">
                    <label class="form-label">Referencia</label>
                    <input type="text" class="form-control" v-model="paymentReference" placeholder="Referencia">
                  </div>
                </div>

                <div v-if="selectedPaymentMethod !== 'NOTA DE CREDITO'" class="row mb-2">
                  <div class="col-6">
                    <label class="form-label">Comisión del Banco</label>
                    <div class="input-group">
                      <button class="btn btn-outline-secondary" @click="toggleCommissionType">
                        <i class="ti ti-percentage"></i>
                      </button>
                      <input type="number" class="form-control" v-model.number="paymentCommission" step="0.01">
                    </div>
                  </div>
                  <div class="col-6">
                    <label class="form-label">Total</label>
                    <div class="input-group">
                      <input type="number" class="form-control" v-model.number="paymentTotal" step="0.01">
                      <button class="btn btn-success" @click="addPayment">
                        <i class="ti ti-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="row mb-2">
                  <div class="col-12">
                    <label class="form-label">Total</label>
                    <div class="input-group">
                      <input type="number" class="form-control" v-model.number="paymentTotal" step="0.01">
                      <button class="btn btn-success" @click="addPayment">
                        <i class="ti ti-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Tabla de pagos bancarios -->
                <table class="table table-sm table-bordered mt-3">
                  <thead class="table-light">
                    <tr>
                      <th v-if="selectedPaymentMethod === 'NOTA DE CREDITO'">Tipo NC</th>
                      <th>Banco</th>
                      <th>Ref</th>
                      <th>Moneda</th>
                      <th>Total/Ext.</th>
                      <th>Total/Nac.</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(payment, index) in filteredBankPayments" :key="index">
                      <td v-if="selectedPaymentMethod === 'NOTA DE CREDITO'">
                        <span class="badge" :class="payment.credit_note_type === 'EFECTIVO' ? 'bg-warning' : 'bg-info'">
                          {{ payment.credit_note_type || 'N/A' }}
                        </span>
                      </td>
                      <td>{{ payment.bank }}</td>
                      <td>{{ payment.reference }}</td>
                      <td>{{ payment.currency }}</td>
                      <td class="text-end">{{ formatCurrency(payment.total_ext) }}</td>
                      <td class="text-end">{{ formatCurrency(payment.total_local) }}</td>
                      <td>
                        <button class="btn btn-sm btn-danger" @click="removePayment(payment)">
                          <i class="ti ti-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Totales por tipo de pago -->
                <div class="row mt-2">
                  <div class="col-6">
                    <strong>{{ selectedPaymentMethod }}</strong>
                  </div>
                  <div class="col-6 text-end">
                    <strong>{{ formatCurrency(getPaymentMethodTotal) }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Denominaciones (EFECTIVO) -->
          <div class="row" v-if="!selectedPaymentMethod || selectedPaymentMethod === 'EFECTIVO'">
            <div class="col-12 mb-3">
              <label class="form-label fw-bold">Moneda</label>
              <select class="form-select mb-2" v-model="selectedCurrency">
                <option value="">Seleccione una Moneda</option>
                <option value="LEMPIRA">Lempira (L)</option>
                <option value="DOLAR">Dólar ($)</option>
              </select>

              <label class="form-label">Tasa de Cambio</label>
              <input type="number" class="form-control mb-3" v-model.number="formData.exchange_rate" step="0.01">

              <select class="form-select mb-2" v-model="selectedDenomination">
                <option value="">Seleccione una Denominación</option>
                <option value="500">L. 500.00</option>
                <option value="200">L. 200.00</option>
                <option value="100">L. 100.00</option>
                <option value="50">L. 50.00</option>
                <option value="20">L. 20.00</option>
                <option value="10">L. 10.00</option>
                <option value="5">L. 5.00</option>
                <option value="1">L. 1.00</option>
                <option value="0.50">L. 0.50</option>
                <option value="0.20">L. 0.20</option>
                <option value="0.10">L. 0.10</option>
                <option value="0.05">L. 0.05</option>
              </select>

              <div class="input-group mb-2">
                <input type="number" class="form-control" v-model.number="denominationQuantity" placeholder="Cantidad" min="0">
                <input type="number" class="form-control" :value="denominationTotal" readonly placeholder="Total">
                <button class="btn btn-success" @click="addDenomination">
                  <i class="ti ti-plus"></i>
                </button>
              </div>

              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Denominación</th>
                    <th>Moneda</th>
                    <th>Cantidad</th>
                    <th>Total/Ext.</th>
                    <th>Total/Nac.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(denom, index) in formData.denominations" :key="index">
                    <td>{{ getDenominationName(denom.unit_value) }}</td>
                    <td>{{ denom.currency }}</td>
                    <td>{{ denom.quantity }}</td>
                    <td class="text-end">{{ formatCurrency(denom.total_value) }}</td>
                    <td class="text-end">{{ formatCurrency(denom.total_value) }}</td>
                    <td>
                      <button class="btn btn-sm btn-danger" @click="removeDenomination(index)">
                        <i class="ti ti-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div class="row mt-2">
                <div class="col-6">
                  <strong>EFECTIVO</strong>
                </div>
                <div class="col-6 text-end">
                  <strong>{{ formatCurrency(totalEfectivo) }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Subtotales dinámicos por método de pago -->
          <div class="row mt-4 g-3">
            <div class="col-md-3" v-if="subtotals.efectivo > 0">
              <div class="card bg-light">
                <div class="card-body">
                  <label class="form-label fw-bold">EFECTIVO</label>
                  <input type="text" class="form-control form-control-lg text-end fw-bold"
                         :value="formatCurrency(subtotals.efectivo)" readonly>
                </div>
              </div>
            </div>

            <div class="col-md-3" v-if="subtotals.tarjetaCredito > 0">
              <div class="card bg-light">
                <div class="card-body">
                  <label class="form-label fw-bold">TARJ. CRÉDITO</label>
                  <input type="text" class="form-control form-control-lg text-end fw-bold"
                         :value="formatCurrency(subtotals.tarjetaCredito)" readonly>
                </div>
              </div>
            </div>

            <div class="col-md-3" v-if="subtotals.tarjetaDebito > 0">
              <div class="card bg-light">
                <div class="card-body">
                  <label class="form-label fw-bold">TARJ. DÉBITO</label>
                  <input type="text" class="form-control form-control-lg text-end fw-bold"
                         :value="formatCurrency(subtotals.tarjetaDebito)" readonly>
                </div>
              </div>
            </div>

            <div class="col-md-3" v-if="subtotals.transferencia > 0">
              <div class="card bg-light">
                <div class="card-body">
                  <label class="form-label fw-bold">TRANSFERENCIA</label>
                  <input type="text" class="form-control form-control-lg text-end fw-bold"
                         :value="formatCurrency(subtotals.transferencia)" readonly>
                </div>
              </div>
            </div>

            <div class="col-md-3" v-if="subtotals.cheque > 0">
              <div class="card bg-light">
                <div class="card-body">
                  <label class="form-label fw-bold">CHEQUE</label>
                  <input type="text" class="form-control form-control-lg text-end fw-bold"
                         :value="formatCurrency(subtotals.cheque)" readonly>
                </div>
              </div>
            </div>

            <div class="col-md-3" v-if="subtotals.linkPago > 0">
              <div class="card bg-light">
                <div class="card-body">
                  <label class="form-label fw-bold">LINK DE PAGO</label>
                  <input type="text" class="form-control form-control-lg text-end fw-bold"
                         :value="formatCurrency(subtotals.linkPago)" readonly>
                </div>
              </div>
            </div>

            <div class="col-md-3" v-if="subtotals.notaCredito !== 0">
              <div class="card bg-warning bg-opacity-25">
                <div class="card-body">
                  <label class="form-label fw-bold">NOTA DE CRÉDITO (Informativo)</label>
                  <input type="text" class="form-control form-control-lg text-end fw-bold text-warning"
                         :value="formatCurrency(subtotals.notaCredito)" readonly>
                </div>
              </div>
            </div>
          </div>

          <!-- Totales finales -->
          <div class="row mt-4 g-3">
            <div class="col-md-4">
              <div class="card bg-light">
                <div class="card-body">
                  <label class="form-label fw-bold">TOTAL SEGÚN ARQUEO</label>
                  <input type="number" class="form-control form-control-lg text-end fw-bold"
                         v-model.number="formData.total_by_count" step="0.01" readonly>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-light">
                <div class="card-body">
                  <label class="form-label fw-bold">TOTAL SEGÚN SISTEMA</label>
                  <input type="number" class="form-control form-control-lg text-end fw-bold"
                         v-model.number="formData.total_by_system" step="0.01" readonly>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card" :class="differenceClass">
                <div class="card-body">
                  <label class="form-label fw-bold text-white">DIFERENCIA</label>
                  <input type="number" class="form-control form-control-lg text-end fw-bold text-danger"
                         :value="difference" readonly>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            <i class="ti ti-x me-1"></i>CERRAR
          </button>
          <button type="button" class="btn btn-danger" @click="handleDelete" v-if="canDelete">
            <i class="ti ti-trash me-1"></i>ELIMINAR
          </button>
          <button type="button" class="btn btn-warning" @click="handlePrint">
            <i class="ti ti-printer me-1"></i>IMPRIMIR
          </button>
          <button type="button" class="btn btn-success" @click="handleSave" :disabled="saving">
            <i class="ti ti-device-floppy me-1"></i>
            {{ saving ? 'GUARDANDO...' : 'GUARDAR' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
  name: 'EditArqueoModal',
  props: {
    session: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'success', 'delete'],
  setup(props, { emit }) {
    const toast = useToast();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    const saving = ref(false);
    const showDenominations = ref(false);
    const selectedCurrency = ref('LEMPIRA');
    const selectedDenomination = ref('');
    const denominationQuantity = ref(0);
    const selectedPaymentMethod = ref('');
    const paymentBank = ref('');
    const paymentReference = ref('');
    const paymentCurrency = ref('LEMPIRA');
    const paymentExchangeRate = ref(0);
    const paymentCommission = ref(0);
    const paymentTotal = ref(0);
    const commissionIsPercentage = ref(true);
    const creditNoteType = ref('');

    const formData = ref({
      ...props.session,
      denominations: props.session.denominations || [],
      bank_payments: props.session.bank_payments || [],
      transactions: props.session.transactions || []
    });

    const systemTotals = ref(props.session.system_totals || {
      total_cash: 0,
      total_card_credit: 0,
      total_card_debit: 0,
      total_transfer: 0,
      total_credit_note: 0,
      total_check: 0,
      total_link_payment: 0,
      total_general: 0
    });

    // Actualizar total_by_system con los totales del sistema
    formData.value.total_by_system = systemTotals.value.total_general;

    // Calcular total de ventas del día (suma de todos los métodos de pago)
    const salesTotal = computed(() => {
      const total =
        (systemTotals.value.total_cash_sales || 0) +
        (systemTotals.value.total_transfer || 0) +
        (systemTotals.value.total_card_credit || 0) +
        (systemTotals.value.total_card_debit || 0) +
        (systemTotals.value.total_link_payment || 0) +
        (systemTotals.value.total_check || 0) +
        (systemTotals.value.total_credit_note || 0);
      return parseFloat(total.toFixed(2));
    });

    const denominationTotal = computed(() => {
      if (!selectedDenomination.value || !denominationQuantity.value) return 0;
      const total = parseFloat(selectedDenomination.value) * denominationQuantity.value;
      return parseFloat(total.toFixed(2));
    });

    // Total de denominaciones puras (sin notas de crédito)
    const totalDenominaciones = computed(() => {
      const total = formData.value.denominations.reduce((sum, d) => sum + parseFloat(d.total_value || 0), 0);
      return parseFloat(total.toFixed(2));
    });

    // Total efectivo para cálculo del total_by_count (incluye notas de crédito tipo EFECTIVO)
    const totalEfectivo = computed(() => {
      // Sumar todas las denominaciones
      const totalDenominations = totalDenominaciones.value;

      // Sumar las notas de crédito de tipo EFECTIVO (ya están guardadas como negativas)
      const creditNotesInCash = formData.value.bank_payments
        .filter(p => p.payment_method === 'NOTA DE CREDITO' && p.credit_note_type === 'EFECTIVO')
        .reduce((sum, p) => sum + parseFloat(p.total_local || 0), 0);

      const total = totalDenominations + creditNotesInCash; // Sumar (los negativos se restarán automáticamente)
      return parseFloat(total.toFixed(2));
    });

    const filteredBankPayments = computed(() => {
      if (!selectedPaymentMethod.value || selectedPaymentMethod.value === 'EFECTIVO') {
        return [];
      }
      return formData.value.bank_payments.filter(p =>
        p.payment_method === selectedPaymentMethod.value
      );
    });

    const getPaymentMethodTotal = computed(() => {
      const total = filteredBankPayments.value.reduce((sum, p) => sum + parseFloat(p.total_local || 0), 0);
      return parseFloat(total.toFixed(2));
    });

    const difference = computed(() => {
      const diff = (formData.value.total_by_count || 0) - systemTotals.value.total_general;
      return parseFloat(diff.toFixed(2));
    });

    const differenceClass = computed(() => {
      const diff = difference.value;
      if (diff === 0) return 'bg-success';
      if (diff > 0) return 'bg-info';
      return 'bg-danger';
    });

    const canDelete = computed(() => {
      return formData.value.status !== 'CERRADA' && formData.value.status !== 'REVISADO';
    });

    // Funciones para calcular movimientos de caja
    const getTotalEgresos = () => {
      if (!formData.value.transactions) return 0;
      return formData.value.transactions
        .filter(t => t.transaction_type === 'EGRESO')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    };

    const getTotalRetiros = () => {
      if (!formData.value.transactions) return 0;
      return formData.value.transactions
        .filter(t => t.transaction_type === 'RETIRO')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    };

    const getTotalDevoluciones = () => {
      if (!formData.value.transactions) return 0;
      return formData.value.transactions
        .filter(t => t.transaction_type === 'DEVOLUCION')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    };

    // Total real en caja (el backend ya calculó: ventas + apertura - egresos - retiros - devoluciones)
    const totalEnCaja = computed(() => {
      // El backend ya restó los movimientos del total_general, no restar de nuevo
      return parseFloat((systemTotals.value.total_general || 0).toFixed(2));
    });

    // Subtotales dinámicos por método de pago
    const subtotals = computed(() => {
      const totals = {
        efectivo: 0,
        tarjetaCredito: 0,
        tarjetaDebito: 0,
        transferencia: 0,
        cheque: 0,
        linkPago: 0,
        notaCredito: 0
      };

      // Sumar efectivo de denominaciones (solo denominaciones, sin notas de crédito)
      totals.efectivo = totalDenominaciones.value;

      // Sumar otros métodos de pago
      formData.value.bank_payments.forEach(payment => {
        const amount = parseFloat(payment.total_local || 0);

        if (payment.payment_method === 'TARJ. CREDITO') {
          totals.tarjetaCredito += amount;
        } else if (payment.payment_method === 'TARJ. DEBITO') {
          totals.tarjetaDebito += amount;
        } else if (payment.payment_method === 'TRANSFERENCIA') {
          totals.transferencia += amount;
        } else if (payment.payment_method === 'CHEQUE') {
          totals.cheque += amount;
        } else if (payment.payment_method === 'LINK DE PAGO') {
          totals.linkPago += amount;
        } else if (payment.payment_method === 'NOTA DE CREDITO') {
          totals.notaCredito += amount;
        }
      });

      // Redondear todos los totales a 2 decimales
      Object.keys(totals).forEach(key => {
        totals[key] = parseFloat(totals[key].toFixed(2));
      });

      return totals;
    });

    const formatDateForInput = (date) => {
      if (!date) return '';

      // Si es un string de fecha ISO
      if (typeof date === 'string') {
        return date.split('T')[0];
      }

      // Si es un objeto Date
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }

      return '';
    };

    const getDenominationName = (value) => {
      const val = parseFloat(value);
      if (val >= 1) return `Billete ${val.toFixed(2)}`;
      return `Moneda ${val.toFixed(2)}`;
    };

    const addDenomination = () => {
      if (!selectedDenomination.value || denominationQuantity.value <= 0) {
        toast.error('Seleccione una denominación y cantidad válida');
        return;
      }

      formData.value.denominations.push({
        denomination: getDenominationName(selectedDenomination.value),
        currency: selectedCurrency.value,
        quantity: denominationQuantity.value,
        unit_value: parseFloat(selectedDenomination.value),
        total_value: denominationTotal.value
      });

      selectedDenomination.value = '';
      denominationQuantity.value = 0;
      updateTotalByCount();
    };

    const removeDenomination = (index) => {
      formData.value.denominations.splice(index, 1);
      updateTotalByCount();
    };

    const addPayment = () => {
      if (!selectedPaymentMethod.value || paymentTotal.value <= 0) {
        toast.error('Complete los campos requeridos');
        return;
      }

      // Validar tipo de nota de crédito
      if (selectedPaymentMethod.value === 'NOTA DE CREDITO' && !creditNoteType.value) {
        toast.error('Debe seleccionar el tipo de nota de crédito (EFECTIVO o TRANSFERENCIA)');
        return;
      }

      const totalExt = parseFloat(paymentTotal.value.toFixed(2));
      const totalLocal = parseFloat((paymentTotal.value * (paymentExchangeRate.value || 1)).toFixed(2));

      // Las notas de crédito se guardan como positivas (solo para mostrar, no afectan el total)

      formData.value.bank_payments.push({
        payment_method: selectedPaymentMethod.value,
        bank: paymentBank.value,
        reference: paymentReference.value,
        currency: paymentCurrency.value,
        total_ext: totalExt,
        total_local: totalLocal,
        credit_note_type: creditNoteType.value || null
      });

      paymentBank.value = '';
      paymentReference.value = '';
      paymentTotal.value = 0;
      creditNoteType.value = '';
      updateTotalByCount();
    };

    const removePayment = (paymentToRemove) => {
      // Buscar el índice real del pago en el array completo
      const index = formData.value.bank_payments.findIndex(p =>
        p.payment_method === paymentToRemove.payment_method &&
        p.total_local === paymentToRemove.total_local &&
        p.reference === paymentToRemove.reference
      );

      if (index !== -1) {
        formData.value.bank_payments.splice(index, 1);
        updateTotalByCount();
      }
    };

    const toggleCommissionType = () => {
      commissionIsPercentage.value = !commissionIsPercentage.value;
    };

    const updateTotalByCount = () => {
      // Sumar efectivo de denominaciones
      const efectivo = totalDenominaciones.value;

      // Sumar otros métodos de pago (EXCEPTO notas de crédito)
      // Las notas de crédito son ajustes contables que no afectan el efectivo físico en caja
      const otrosPagos = formData.value.bank_payments.reduce((sum, p) => {
        const amount = parseFloat(p.total_local || 0);
        // Excluir notas de crédito del total del arqueo
        if (p.payment_method === 'NOTA DE CREDITO') {
          return sum; // No sumar ni restar
        }
        return sum + amount;
      }, 0);

      // Redondear a 2 decimales
      formData.value.total_by_count = parseFloat((efectivo + otrosPagos).toFixed(2));
    };

    const formatCurrency = (value) => {
      if (!value && value !== 0) return '0.00';
      // Redondear a 2 decimales antes de formatear
      const rounded = parseFloat(parseFloat(value).toFixed(2));
      return rounded.toLocaleString('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    const handleSave = async () => {
      saving.value = true;
      try {
        const token = localStorage.getItem('token');

        // Validar que tenemos un ID válido
        if (!formData.value.id) {
          toast.error('ID de sesión inválido');
          return;
        }

        // Limpiar y preparar datos para envío - convertir todo a string simple sin formato
        const cleanData = {
          // NO llenar date_to ni time_to - se llenan solo al CERRAR desde el listado
          // Total de efectivo con denominaciones (sin formato, string simple)
          total_cash: String(parseFloat(totalEfectivo.value || 0).toFixed(2)),
          // Total final es el TOTAL SEGÚN SISTEMA (lo vendido)
          final_total: String(parseFloat(systemTotals.value.total_general || 0).toFixed(2)),
          // Asegurar que todos los números sean strings simples sin formato locale
          total_card: String(parseFloat(formData.value.total_card || 0).toFixed(2)),
          total_transfer: String(parseFloat(formData.value.total_transfer || 0).toFixed(2)),
          total_sum: String(parseFloat(formData.value.total_sum || 0).toFixed(2)),
          opening_amount: String(parseFloat(formData.value.opening_amount || 0).toFixed(2)),
          currency: formData.value.currency || 'LEMPIRA',
          exchange_rate: String(parseFloat(formData.value.exchange_rate || 0).toFixed(4)),
          bank_commission_percentage: String(parseFloat(formData.value.bank_commission_percentage || 0).toFixed(2)),
          bank_commission_total: String(parseFloat(formData.value.bank_commission_total || 0).toFixed(2)),
          total_by_count: String(parseFloat(formData.value.total_by_count || 0).toFixed(2)),
          total_by_system: String(parseFloat(systemTotals.value.total_general || 0).toFixed(2)),
          difference: String(parseFloat(difference.value || 0).toFixed(2)),
          notes: formData.value.notes || '',
          // Al guardar, cambiar estado a REVISADO
          status: 'REVISADO',
          // Incluir denominaciones limpias
          denominations: formData.value.denominations.map(d => ({
            denomination: d.denomination,
            currency: d.currency || 'LEMPIRA',
            quantity: parseInt(d.quantity || 0),
            unit_value: String(parseFloat(d.unit_value || 0).toFixed(2)),
            total_value: String(parseFloat(d.total_value || 0).toFixed(2))
          })),
          // Incluir pagos bancarios limpios
          bank_payments: formData.value.bank_payments.map(p => ({
            payment_method: p.payment_method,
            bank: p.bank || '',
            reference: p.reference || '',
            currency: p.currency || 'LEMPIRA',
            total_ext: String(parseFloat(p.total_ext || 0).toFixed(2)),
            total_local: String(parseFloat(p.total_local || 0).toFixed(2))
          }))
        };

        console.log('Guardando arqueo con ID:', formData.value.id);
        console.log('Datos limpios:', cleanData);

        const response = await axios.put(
          `${API_URL}/cash-register/sessions/${formData.value.id}`,
          cleanData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          toast.success('Arqueo guardado y marcado como REVISADO');
          emit('success', response.data.data);
          emit('close');
        }
      } catch (error) {
        console.error('Error al guardar:', error);
        console.error('Respuesta del servidor:', error.response?.data);
        toast.error(error.response?.data?.message || 'Error al guardar el arqueo');
      } finally {
        saving.value = false;
      }
    };

    const handleDelete = () => {
      emit('delete', formData.value);
    };

    const handlePrint = () => {
      toast.info('Funcionalidad de impresión en desarrollo');
    };

    return {
      formData,
      systemTotals,
      salesTotal,
      saving,
      showDenominations,
      selectedCurrency,
      selectedDenomination,
      denominationQuantity,
      denominationTotal,
      selectedPaymentMethod,
      paymentBank,
      paymentReference,
      paymentCurrency,
      paymentExchangeRate,
      paymentCommission,
      paymentTotal,
      commissionIsPercentage,
      creditNoteType,
      totalDenominaciones,
      totalEfectivo,
      filteredBankPayments,
      getPaymentMethodTotal,
      difference,
      differenceClass,
      canDelete,
      totalEnCaja,
      subtotals,
      formatDateForInput,
      getDenominationName,
      addDenomination,
      removeDenomination,
      addPayment,
      removePayment,
      toggleCommissionType,
      formatCurrency,
      handleSave,
      handleDelete,
      handlePrint,
      getTotalEgresos,
      getTotalRetiros,
      getTotalDevoluciones
    };
  }
};
</script>

<style scoped>
.modal {
  display: block;
}

.table th, .table td {
  vertical-align: middle;
}

.bg-danger .form-control {
  background-color: rgba(255, 255, 255, 0.9);
}
</style>
