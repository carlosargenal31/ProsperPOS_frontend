<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-info text-white">
          <h5 class="modal-title text-white">
            <i class="ti ti-coins me-2"></i>Retiro de Efectivo
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
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
                  (Efectivo disponible: L {{ formatNumber(session.total_cash || session.opening_amount) }})
                </option>
              </select>
              <small class="text-muted">Solo se muestran sesiones abiertas</small>
            </div>

            <!-- Información de la Sesión Seleccionada -->
            <div v-if="selectedSession" class="alert alert-info mb-3">
              <div class="row">
                <div class="col-4">
                  <small class="text-muted">Consecutivo:</small>
                  <div class="fw-bold">{{ selectedSession.consecutive }}</div>
                </div>
                <div class="col-4">
                  <small class="text-muted">Monto Inicial:</small>
                  <div class="fw-bold">L {{ formatNumber(selectedSession.opening_amount) }}</div>
                </div>
                <div class="col-4">
                  <small class="text-muted">Efectivo en Caja:</small>
                  <div class="fw-bold text-success">L {{ formatNumber(selectedSession.total_cash || selectedSession.opening_amount) }}</div>
                </div>
              </div>
            </div>

            <!-- Monto a Retirar -->
            <div class="mb-3">
              <label class="form-label fw-bold">Monto a Retirar <span class="text-danger">*</span></label>
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
              <small class="text-muted">Monto de efectivo que se retira de la caja</small>
            </div>

            <!-- Motivo del Retiro -->
            <div class="mb-3">
              <label class="form-label fw-bold">Motivo del Retiro <span class="text-danger">*</span></label>
              <select class="form-select mb-2" v-model="selectedReason" @change="updateDescription">
                <option value="">Seleccione un motivo...</option>
                <option value="DEPOSITO_BANCARIO">Depósito Bancario</option>
                <option value="TRASLADO_CAJA_FUERTE">Traslado a Caja Fuerte</option>
                <option value="TRASLADO_BANCA">Traslado a Banca/Otro Cajero</option>
                <option value="CAMBIO_TURNO">Cambio de Turno</option>
                <option value="OTRO">Otro (Especificar)</option>
              </select>
              <textarea
                class="form-control"
                v-model="formData.description"
                rows="3"
                required
                placeholder="Descripción detallada del motivo del retiro"></textarea>
            </div>

            <!-- Responsable del Retiro -->
            <div class="mb-3">
              <label class="form-label fw-bold">Responsable que Recibe el Efectivo <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                v-model="formData.beneficiary"
                required
                placeholder="Nombre de la persona responsable que recibe el dinero">
              <small class="text-muted">Persona encargada de custodiar el efectivo retirado</small>
            </div>

            <!-- Destino del Efectivo -->
            <div class="row mb-3">
              <div class="col-md-8">
                <label class="form-label fw-bold">Destino/Ubicación</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formData.bank"
                  placeholder="Ej: Caja fuerte oficina principal, Banco BAC, etc.">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-bold">Referencia</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formData.reference"
                  placeholder="No. Boleta">
              </div>
            </div>

            <!-- Validación de Monto -->
            <div v-if="formData.amount > 0 && selectedSession && formData.amount > (selectedSession.total_cash || selectedSession.opening_amount)" class="alert alert-warning">
              <i class="ti ti-alert-triangle me-2"></i>
              <strong>Advertencia:</strong> El monto a retirar (L {{ formatNumber(formData.amount) }})
              es mayor al efectivo disponible en caja (L {{ formatNumber(selectedSession.total_cash || selectedSession.opening_amount) }})
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
          <button type="button" class="btn btn-info text-white" @click="handleSubmit" :disabled="loading || !formData.session_id">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="ti ti-check me-1"></i>
            {{ loading ? 'Guardando...' : 'Registrar Retiro' }}
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
  name: 'RetiroEfectivoModal',
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

    const formData = ref({
      session_id: '',
      transaction_type: 'RETIRO',
      amount: 0,
      description: '',
      payment_method: 'EFECTIVO',
      bank: '',
      reference: '',
      beneficiary: '',
      beneficiary_type: 'RESPONSABLE'
    });

    const openSessions = ref([]);
    const selectedSession = ref(null);
    const selectedReason = ref('');
    const loading = ref(false);
    const error = ref(null);
    const success = ref(null);
    const amountInput = ref(null);

    const reasonDescriptions = {
      'DEPOSITO_BANCARIO': 'Retiro de efectivo para realizar depósito bancario',
      'TRASLADO_CAJA_FUERTE': 'Retiro de efectivo para trasladar a caja fuerte por seguridad',
      'TRASLADO_BANCA': 'Retiro de efectivo para traslado a otra banca o cajero',
      'CAMBIO_TURNO': 'Retiro de efectivo por cambio de turno del cajero',
      'OTRO': ''
    };

    const formatNumber = (value) => {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
    };

    const updateDescription = () => {
      if (selectedReason.value && selectedReason.value !== 'OTRO') {
        formData.value.description = reasonDescriptions[selectedReason.value];
      }
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
        error.value = 'La descripción y el responsable son requeridos';
        return;
      }

      // Advertencia si el retiro es mayor al efectivo disponible
      const availableCash = selectedSession.value?.total_cash || selectedSession.value?.opening_amount || 0;
      if (formData.value.amount > availableCash) {
        const confirmResult = await Swal.fire({
          icon: 'warning',
          title: 'Monto Mayor al Disponible',
          html: `
            <p>El monto a retirar <strong>L ${formatNumber(formData.value.amount)}</strong>
            es mayor al efectivo disponible en caja <strong>L ${formatNumber(availableCash)}</strong></p>
            <p class="text-muted">¿Desea continuar de todas formas?</p>
          `,
          showCancelButton: true,
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#f39c12',
          cancelButtonColor: '#6c757d'
        });

        if (!confirmResult.isConfirmed) {
          return;
        }
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
          success.value = 'Retiro de efectivo registrado exitosamente';

          // Mostrar confirmación con SweetAlert
          await Swal.fire({
            icon: 'success',
            title: 'Retiro Registrado',
            html: `
              <p class="mb-2"><strong>Monto Retirado:</strong> L ${formData.value.amount.toFixed(2)}</p>
              <p class="mb-2"><strong>Responsable:</strong> ${formData.value.beneficiary}</p>
              <p class="mb-0 text-muted">${formData.value.description}</p>
            `,
            timer: 3000,
            showConfirmButton: false
          });

          emit('success', response.data.data);
          emit('close');
        }
      } catch (err) {
        console.error('Error al registrar retiro:', err);
        error.value = err.response?.data?.message || 'Error al registrar el retiro de efectivo';

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
      selectedReason,
      loading,
      error,
      success,
      amountInput,
      formatNumber,
      updateDescription,
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
