<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-warning text-dark">
          <h5 class="modal-title">
            <i class="ti ti-cash me-2"></i>Egreso de Caja
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- Seleccionar Sesión de Caja -->
            <div class="mb-3">
              <label class="form-label fw-bold">Sesión de Caja <span class="text-danger">*</span></label>
              <select class="form-select" v-model="formData.session_id" required @change="loadSessionDetails">
                <option value="">Seleccione una sesión abierta...</option>
                <option v-for="session in openSessions" :key="session.id" :value="session.id">
                  {{ session.consecutive }} - {{ session.user_name }} - {{ session.agency || 'Sin agencia' }}
                  (Apertura: L {{ formatNumber(session.opening_amount) }})
                </option>
              </select>
              <small class="text-muted">Solo se muestran sesiones abiertas</small>
            </div>

            <!-- Información de la Sesión Seleccionada -->
            <div v-if="selectedSession" class="alert alert-info mb-3">
              <div class="row">
                <div class="col-6">
                  <small class="text-muted">Consecutivo:</small>
                  <div class="fw-bold">{{ selectedSession.consecutive }}</div>
                </div>
                <div class="col-6">
                  <small class="text-muted">Monto Inicial:</small>
                  <div class="fw-bold">L {{ formatNumber(selectedSession.opening_amount) }}</div>
                </div>
              </div>
            </div>

            <!-- Monto del Egreso -->
            <div class="mb-3">
              <label class="form-label fw-bold">Monto del Egreso <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text">L</span>
                <input
                  type="number"
                  class="form-control text-end fw-bold fs-4"
                  v-model.number="formData.amount"
                  step="0.01"
                  min="0.01"
                  required
                  ref="amountInput">
              </div>
              <small class="text-muted">Monto de dinero que sale de la caja</small>
            </div>

            <!-- Descripción/Motivo -->
            <div class="mb-3">
              <label class="form-label fw-bold">Descripción/Motivo del Egreso <span class="text-danger">*</span></label>
              <textarea
                class="form-control"
                v-model="formData.description"
                rows="3"
                required
                placeholder="Ej: Compra de suministros de oficina, Pago a proveedor, etc."></textarea>
            </div>

            <!-- Beneficiario -->
            <div class="row mb-3">
              <div class="col-md-8">
                <label class="form-label fw-bold">Beneficiario <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formData.beneficiary"
                  required
                  placeholder="Nombre de la persona o empresa que recibe el pago">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-bold">Tipo</label>
                <select class="form-select" v-model="formData.beneficiary_type">
                  <option value="">Seleccionar...</option>
                  <option value="PERSONA">Persona</option>
                  <option value="EMPRESA">Empresa</option>
                  <option value="PROVEEDOR">Proveedor</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
            </div>

            <!-- Forma de Pago -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label fw-bold">Forma de Pago <span class="text-danger">*</span></label>
                <select class="form-select" v-model="formData.payment_method" required>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA">Tarjeta</option>
                </select>
              </div>
              <div class="col-md-6" v-if="formData.payment_method !== 'EFECTIVO'">
                <label class="form-label fw-bold">Banco</label>
                <input type="text" class="form-control" v-model="formData.bank" placeholder="Nombre del banco">
              </div>
            </div>

            <!-- Referencia (para pagos electrónicos) -->
            <div class="mb-3" v-if="formData.payment_method !== 'EFECTIVO'">
              <label class="form-label fw-bold">Referencia/No. de Documento</label>
              <input
                type="text"
                class="form-control"
                v-model="formData.reference"
                placeholder="Número de cheque, referencia de transferencia, etc.">
            </div>

            <!-- Alert de error -->
            <div v-if="error" class="alert alert-danger" role="alert">
              <i class="ti ti-alert-circle me-2"></i>{{ error }}
            </div>

            <!-- Alert de éxito -->
            <div v-if="success" class="alert alert-success" role="alert">
              <i class="ti ti-check me-2"></i>{{ success }}
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')" :disabled="loading">
            <i class="ti ti-x me-1"></i>Cancelar
          </button>
          <button type="button" class="btn btn-warning" @click="handleSubmit" :disabled="loading || !formData.session_id">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="ti ti-check me-1"></i>
            {{ loading ? 'Guardando...' : 'Registrar Egreso' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'EgresoCajaModal',
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

    const formData = ref({
      session_id: '',
      transaction_type: 'EGRESO',
      amount: 0,
      description: '',
      payment_method: 'EFECTIVO',
      bank: '',
      reference: '',
      beneficiary: '',
      beneficiary_type: ''
    });

    const openSessions = ref([]);
    const selectedSession = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const success = ref(null);
    const amountInput = ref(null);

    const formatNumber = (value) => {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
    };

    const loadOpenSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/cash-register/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'ABIERTA' }
        });

        if (response.data.success) {
          openSessions.value = response.data.data || [];

          if (openSessions.value.length === 0) {
            error.value = 'No hay sesiones de caja abiertas. Debe abrir una caja primero.';
          }
        }
      } catch (err) {
        console.error('Error al cargar sesiones:', err);
        error.value = 'Error al cargar las sesiones de caja abiertas';
      }
    };

    const loadSessionDetails = async () => {
      if (!formData.value.session_id) {
        selectedSession.value = null;
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/cash-register/sessions/${formData.value.session_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          selectedSession.value = response.data.data;
        }
      } catch (err) {
        console.error('Error al cargar detalles de sesión:', err);
      }
    };

    onMounted(async () => {
      await loadOpenSessions();

      // Auto-seleccionar si solo hay una sesión abierta
      if (openSessions.value.length === 1) {
        formData.value.session_id = openSessions.value[0].id;
        await loadSessionDetails();
      }
    });

    const handleSubmit = async () => {
      error.value = null;
      success.value = null;

      // Validaciones
      if (!formData.value.session_id) {
        error.value = 'Debe seleccionar una sesión de caja';
        return;
      }

      if (formData.value.amount <= 0) {
        error.value = 'El monto debe ser mayor a cero';
        return;
      }

      if (!formData.value.description || !formData.value.beneficiary) {
        error.value = 'La descripción y el beneficiario son requeridos';
        return;
      }

      loading.value = true;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_URL}/cash-register/transactions`,
          formData.value,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          success.value = 'Egreso registrado exitosamente';

          // Mostrar confirmación con SweetAlert
          await Swal.fire({
            icon: 'success',
            title: 'Egreso Registrado',
            html: `
              <p class="mb-2"><strong>Monto:</strong> L ${formData.value.amount.toFixed(2)}</p>
              <p class="mb-2"><strong>Beneficiario:</strong> ${formData.value.beneficiary}</p>
              <p class="mb-0 text-muted">${formData.value.description}</p>
            `,
            timer: 3000,
            showConfirmButton: false
          });

          emit('success', response.data.data);
          emit('close');
        }
      } catch (err) {
        console.error('Error al registrar egreso:', err);
        error.value = err.response?.data?.message || 'Error al registrar el egreso de caja';

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.value,
          confirmButtonText: 'Entendido'
        });
      } finally {
        loading.value = false;
      }
    };

    return {
      formData,
      openSessions,
      selectedSession,
      loading,
      error,
      success,
      amountInput,
      formatNumber,
      loadSessionDetails,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.modal {
  z-index: 1055;
}
</style>
