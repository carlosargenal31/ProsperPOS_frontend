<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title text-white">
            <i class="ti ti-cash-register me-2"></i>Apertura de Caja
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- Fecha y Hora -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label fw-bold">Fecha de Apertura <span class="text-danger">*</span></label>
                <input type="date" class="form-control" v-model="formData.date_from" required>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Hora de Apertura <span class="text-danger">*</span></label>
                <input type="time" class="form-control" v-model="formData.time_from" required>
              </div>
            </div>

            <!-- Monto de Apertura -->
            <div class="mb-3">
              <label class="form-label fw-bold">Monto de Apertura (Efectivo Inicial) <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text">L</span>
                <input
                  type="number"
                  class="form-control text-end fw-bold fs-4"
                  v-model.number="formData.opening_amount"
                  step="0.01"
                  min="0"
                  required
                  ref="openingAmountInput">
              </div>
              <small class="text-muted">Ingrese el monto de efectivo con el que abre la caja</small>
            </div>

            <!-- Agencia/Sucursal -->
            <div class="mb-3">
              <label class="form-label fw-bold">Agencia/Sucursal</label>
              <input type="text" class="form-control" v-model="formData.agency" placeholder="Ej: Agencia Principal">
            </div>

            <!-- Notas -->
            <div class="mb-3">
              <label class="form-label fw-bold">Notas</label>
              <textarea
                class="form-control"
                v-model="formData.notes"
                rows="3"
                placeholder="Observaciones adicionales (opcional)"></textarea>
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
          <button type="button" class="btn btn-success" @click="handleSubmit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="ti ti-check me-1"></i>
            {{ loading ? 'Guardando...' : 'Registrar Apertura' }}
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
  name: 'AperturaCajaModal',
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

    const formData = ref({
      session_type: 'APERTURA',
      date_from: new Date().toISOString().split('T')[0],
      time_from: new Date().toTimeString().split(' ')[0].substring(0, 5),
      opening_amount: 0,
      agency: '',
      notes: '',
      status: 'ABIERTA'
    });

    const loading = ref(false);
    const error = ref(null);
    const success = ref(null);
    const openingAmountInput = ref(null);

    onMounted(() => {
      // Auto-focus en el campo de monto
      setTimeout(() => {
        if (openingAmountInput.value) {
          openingAmountInput.value.focus();
          openingAmountInput.value.select();
        }
      }, 300);
    });

    const handleSubmit = async () => {
      error.value = null;
      success.value = null;

      // Validaciones
      if (!formData.value.date_from || !formData.value.time_from) {
        error.value = 'La fecha y hora son requeridas';
        return;
      }

      if (formData.value.opening_amount <= 0) {
        error.value = 'El monto de apertura debe ser mayor a cero';
        return;
      }

      loading.value = true;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_URL}/cash-register/sessions`,
          formData.value,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          success.value = 'Apertura de caja registrada exitosamente';

          // Mostrar confirmación con SweetAlert
          await Swal.fire({
            icon: 'success',
            title: 'Apertura Exitosa',
            html: `
              <p class="mb-2"><strong>Consecutivo:</strong> ${response.data.data.consecutive}</p>
              <p class="mb-2"><strong>Monto Inicial:</strong> L ${formData.value.opening_amount.toFixed(2)}</p>
              <p class="mb-0 text-muted">La caja ha sido abierta correctamente</p>
            `,
            timer: 3000,
            showConfirmButton: false
          });

          emit('success', response.data.data);
          emit('close');
        }
      } catch (err) {
        console.error('Error al registrar apertura:', err);
        error.value = err.response?.data?.message || 'Error al registrar la apertura de caja';

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
      loading,
      error,
      success,
      openingAmountInput,
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
