<template>
  <!-- Add Currency -->
  <div class="modal fade" id="add-currency">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <div class="page-title">
            <h4>Agregar Moneda</h4>
          </div>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <form @submit.prevent="submitAddForm">
          <div class="modal-body">
            <div class="row">
              <div class="col-lg-6">
                <div class="mb-3">
                  <label class="form-label">Símbolo <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formData.simbolo"
                    placeholder="L"
                    required
                  />
                </div>
              </div>
              <div class="col-lg-6">
                <div class="mb-3">
                  <label class="form-label">Nombre Plural <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formData.plural"
                    placeholder="LEMPIRAS"
                    required
                  />
                </div>
              </div>
              <div class="col-lg-6">
                <div class="mb-3">
                  <label class="form-label">Nombre Singular <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formData.singular"
                    placeholder="LEMPIRA"
                    required
                  />
                </div>
              </div>
              <div class="col-lg-6">
                <div class="mb-3">
                  <label class="form-label">Factor de Cambio</label>
                  <input
                    type="number"
                    step="0.00000001"
                    min="0"
                    class="form-control"
                    v-model="formData.factor_cambio"
                    placeholder="26.28000000"
                  />
                </div>
              </div>
              <div class="col-lg-6">
                <div class="mb-3">
                  <label class="form-label">Operación</label>
                  <select class="form-select" v-model="formData.multiplicar_dividir">
                    <option :value="0">Dividir</option>
                    <option :value="1">Multiplicar</option>
                  </select>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="mb-3 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="add-extranjera"
                    v-model="formData.extranjera"
                  />
                  <label class="form-check-label" for="add-extranjera">
                    Moneda Extranjera
                  </label>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="mb-3 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="add-is-active"
                    v-model="formData.is_active"
                  />
                  <label class="form-check-label" for="add-is-active">
                    Activa
                  </label>
                </div>
              </div>
              <div class="col-lg-12">
                <div class="mb-0 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="add-is-default"
                    v-model="formData.is_default"
                  />
                  <label class="form-check-label" for="add-is-default">
                    Establecer como moneda por defecto
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
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
  <!-- /Add Currency -->

  <!-- Edit Currency -->
  <div class="modal fade" id="edit-currency">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Moneda</h4>
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
                      <label class="form-label">Símbolo <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.simbolo"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Nombre Plural <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.plural"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Nombre Singular <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.singular"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Factor de Cambio</label>
                      <input
                        type="number"
                        step="0.00000001"
                        min="0"
                        class="form-control"
                        v-model="editFormData.factor_cambio"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Operación</label>
                      <select class="form-select" v-model="editFormData.multiplicar_dividir">
                        <option :value="0">Dividir</option>
                        <option :value="1">Multiplicar</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3 form-check">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        id="edit-extranjera"
                        v-model="editFormData.extranjera"
                      />
                      <label class="form-check-label" for="edit-extranjera">
                        Moneda Extranjera
                      </label>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3 form-check">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        id="edit-is-active"
                        v-model="editFormData.is_active"
                      />
                      <label class="form-check-label" for="edit-is-active">
                        Activa
                      </label>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-0 form-check">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        id="edit-is-default"
                        v-model="editFormData.is_default"
                      />
                      <label class="form-check-label" for="edit-is-default">
                        Establecer como moneda por defecto
                      </label>
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
                  <span v-else>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /Edit Currency -->

  <!-- delete modal -->
  <div class="modal fade" id="delete-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"
              ><i class="ti ti-trash fs-24 text-danger"></i
            ></span>
            <h4 class="fs-20 text-gray-9 fw-bold mb-2 mt-1">Eliminar Moneda</h4>
            <p class="text-gray-6 mb-0 fs-16">
              ¿Estás seguro de que deseas eliminar esta moneda?
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
    currency: {
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
        simbolo: '',
        factor_cambio: 0,
        extranjera: false,
        multiplicar_dividir: 0,
        plural: '',
        singular: '',
        is_active: true,
        is_default: false
      },
      editFormData: {
        id: null,
        simbolo: '',
        factor_cambio: 0,
        extranjera: false,
        multiplicar_dividir: 0,
        plural: '',
        singular: '',
        is_active: true,
        is_default: false
      },
      isSubmitting: false
    };
  },
  watch: {
    currency: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            simbolo: newVal.simbolo,
            factor_cambio: newVal.factor_cambio || 0,
            extranjera: Boolean(newVal.extranjera),
            multiplicar_dividir: newVal.multiplicar_dividir || 0,
            plural: newVal.plural,
            singular: newVal.singular,
            is_active: Boolean(newVal.is_active),
            is_default: Boolean(newVal.is_default)
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
        await axios.post('http://localhost:3000/api/v1/currencies', this.formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Limpiar formulario
        this.formData = {
          simbolo: '',
          factor_cambio: 0,
          extranjera: false,
          multiplicar_dividir: 0,
          plural: '',
          singular: '',
          is_active: true,
          is_default: false
        };

        // Emitir evento para recargar datos PRIMERO
        this.$emit('currency-saved');

        // Cerrar modal manualmente
        const modalElement = document.getElementById('add-currency');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito con SweetAlert2
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Moneda creada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating currency:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear la moneda',
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

        await axios.put(`http://localhost:3000/api/v1/currencies/${id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos PRIMERO
        this.$emit('currency-saved');

        // Cerrar modal manualmente
        const modalElement = document.getElementById('edit-currency');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito con SweetAlert2
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Moneda actualizada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating currency:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar la moneda',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete() {
      if (!this.currency || !this.currency.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/currencies/${this.currency.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos PRIMERO
        this.$emit('currency-deleted');

        // Cerrar modal manualmente
        const modalElement = document.getElementById('delete-modal');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito con SweetAlert2
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Eliminada!',
            text: 'Moneda eliminada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting currency:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar la moneda',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  },
};
</script>
