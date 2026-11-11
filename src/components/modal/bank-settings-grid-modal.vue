<template>
  <!-- Add Bank Account -->
  <div class="modal fade" id="add-account">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Agregar Cuenta Bancaria</h4>
              </div>
              <button
                type="button"
                class="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form @submit.prevent="submitAddForm">
              <div class="modal-body">
                <div class="row">
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Banco <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.banco"
                        placeholder="Ej: Banco Atlántida"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Tipo de Cuenta <span class="text-danger">*</span></label>
                      <select class="form-select" v-model="formData.tipo_cuenta" required>
                        <option value="">Seleccione...</option>
                        <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                        <option value="Cuenta de Cheques">Cuenta de Cheques</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Moneda <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.moneda"
                        placeholder="Ej: Lempiras"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Número de Cuenta <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.numero_cuenta"
                        placeholder="Ej: 3200898785"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Titular <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.titular"
                        placeholder="Nombre completo del titular"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Imagen del Banco (URL)</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.imagen_banco"
                        placeholder="URL de la imagen (opcional)"
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div
                      class="status-toggle modal-status d-flex justify-content-between align-items-center mb-3"
                    >
                      <span class="status-label">Activa</span>
                      <input type="checkbox" id="add-is-active" class="check" v-model="formData.is_active" />
                      <label for="add-is-active" class="checktoggle"></label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary me-2"
                  data-bs-dismiss="modal"
                >
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting">Guardando...</span>
                  <span v-else>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /Add Bank Account -->

  <!-- Edit Bank Account -->
  <div class="modal fade" id="edit-account">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Cuenta Bancaria</h4>
              </div>
              <button
                type="button"
                class="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form @submit.prevent="submitEditForm">
              <div class="modal-body">
                <div class="row">
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Banco <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.banco"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Tipo de Cuenta <span class="text-danger">*</span></label>
                      <select class="form-select" v-model="editFormData.tipo_cuenta" required>
                        <option value="">Seleccione...</option>
                        <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                        <option value="Cuenta de Cheques">Cuenta de Cheques</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Moneda <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.moneda"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Número de Cuenta <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.numero_cuenta"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Titular <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.titular"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Imagen del Banco (URL)</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.imagen_banco"
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div
                      class="status-toggle modal-status d-flex justify-content-between align-items-center mb-3"
                    >
                      <span class="status-label">Activa</span>
                      <input type="checkbox" id="edit-is-active" class="check" v-model="editFormData.is_active" />
                      <label for="edit-is-active" class="checktoggle"></label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary me-2"
                  data-bs-dismiss="modal"
                >
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting">Guardando...</span>
                  <span v-else">Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /Edit Bank Account -->

  <!-- delete modal -->
  <div class="modal fade" id="delete-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"
              ><i class="ti ti-trash fs-24 text-danger"></i
            ></span>
            <h4 class="fs-20 text-gray-9 fw-bold mb-2 mt-1">Eliminar Cuenta Bancaria</h4>
            <p class="text-gray-6 mb-0 fs-16">
              ¿Estás seguro de que deseas eliminar esta cuenta bancaria?
            </p>
            <div class="modal-footer-btn mt-3 d-flex justify-content-center">
              <button
                type="button"
                class="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-danger fs-13 fw-medium p-2 px-3"
                @click="confirmDelete"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Eliminando...</span>
                <span v-else>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /delete modal -->
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  props: {
    account: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {
        banco: '',
        tipo_cuenta: '',
        moneda: '',
        numero_cuenta: '',
        titular: '',
        imagen_banco: '',
        is_active: true
      },
      editFormData: {
        id: null,
        banco: '',
        tipo_cuenta: '',
        moneda: '',
        numero_cuenta: '',
        titular: '',
        imagen_banco: '',
        is_active: true
      },
      isSubmitting: false
    };
  },
  watch: {
    account: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            banco: newVal.banco,
            tipo_cuenta: newVal.tipo_cuenta,
            moneda: newVal.moneda,
            numero_cuenta: newVal.numero_cuenta,
            titular: newVal.titular,
            imagen_banco: newVal.imagen_banco || '',
            is_active: Boolean(newVal.is_active)
          };
        }
      },
      immediate: true
    }
  },
  methods: {
    async submitAddForm() {
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.post('/api/v1/bank-accounts', this.formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Limpiar formulario
        this.formData = {
          banco: '',
          tipo_cuenta: '',
          moneda: '',
          numero_cuenta: '',
          titular: '',
          imagen_banco: '',
          is_active: true
        };

        // Emitir evento para recargar datos
        this.$emit('account-saved');

        // Cerrar modal
        const modalElement = document.getElementById('add-account');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Cuenta bancaria creada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating bank account:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear la cuenta bancaria',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async submitEditForm() {
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        const { id, ...updateData } = this.editFormData;

        await axios.put(`/api/v1/bank-accounts/${id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('account-saved');

        // Cerrar modal
        const modalElement = document.getElementById('edit-account');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Cuenta bancaria actualizada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating bank account:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar la cuenta bancaria',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete() {
      if (!this.account || !this.account.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/v1/bank-accounts/${this.account.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('account-deleted');

        // Cerrar modal
        const modalElement = document.getElementById('delete-modal');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Eliminada!',
            text: 'Cuenta bancaria eliminada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting bank account:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar la cuenta bancaria',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  },
};
</script>
