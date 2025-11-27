<template>
  <!-- Add Tax Rates -->
  <div class="modal fade" id="add-tax">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <div class="page-title">
            <h4>Agregar Tasa de Impuesto</h4>
          </div>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <form @submit.prevent="submitAddForm">
          <div class="modal-body">
            <div class="row">
              <div class="col-lg-12">
                <div class="mb-3">
                  <label class="form-label">Nombre <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formData.name"
                    placeholder="Ej: ISV 15%"
                    required
                  />
                </div>
              </div>
              <div class="col-lg-12">
                <div class="mb-3">
                  <label class="form-label">Tasa (%) <span class="text-danger">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    class="form-control"
                    v-model="formData.rate"
                    placeholder="15.00"
                    required
                  />
                </div>
              </div>
              <div class="col-lg-12">
                <div class="mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea
                    class="form-control"
                    v-model="formData.description"
                    rows="2"
                    placeholder="Descripción opcional"
                  ></textarea>
                </div>
              </div>
              <div class="col-lg-12">
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
                    Establecer como tasa por defecto
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
  <!-- /Add Tax Rates -->

  <!-- Edit Tax Rates -->
  <div class="modal fade" id="edit-tax">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Tasa de Impuesto</h4>
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
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Nombre <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.name"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Tasa (%) <span class="text-danger">*</span></label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        class="form-control"
                        v-model="editFormData.rate"
                        required
                      />
                      <small class="text-muted" v-if="editFormData.products_count > 0">
                        Nota: Al cambiar la tasa, se actualizará automáticamente en {{ editFormData.products_count }} producto(s)
                      </small>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Descripción</label>
                      <textarea
                        class="form-control"
                        v-model="editFormData.description"
                        rows="2"
                      ></textarea>
                    </div>
                  </div>
                  <div class="col-lg-12">
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
                        Establecer como tasa por defecto
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
                  <span v-else">Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /Edit Tax Rates -->

  <!-- View Tax Rate -->
  <div class="modal fade" id="view-tax">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Detalles de la Tasa de Impuesto</h4>
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
            <div class="modal-body">
              <div class="row">
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">ID</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ taxRate?.id || '-' }}
                  </p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Estado</label>
                  <p class="form-control-plaintext">
                    <span :class="taxRate?.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                      {{ taxRate?.is_active ? 'Activa' : 'Inactiva' }}
                    </span>
                  </p>
                </div>
                <div class="col-lg-12 mb-3">
                  <label class="form-label fw-bold">Nombre</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ taxRate?.name || '-' }}
                  </p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Tasa (%)</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ taxRate?.rate || 0 }}%
                  </p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Productos</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ taxRate?.products_count || 0 }}
                  </p>
                </div>
                <div class="col-lg-12 mb-3">
                  <label class="form-label fw-bold">Descripción</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light" style="min-height: 60px;">
                    {{ taxRate?.description || 'Sin descripción' }}
                  </p>
                </div>
                <div class="col-lg-12 mb-3">
                  <label class="form-label fw-bold">Por Defecto</label>
                  <p class="form-control-plaintext">
                    <span :class="taxRate?.is_default ? 'badge bg-primary' : 'badge bg-secondary'">
                      {{ taxRate?.is_default ? 'Sí' : 'No' }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary fs-13 fw-medium p-2 px-3"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /View Tax Rate -->

  <!-- delete modal -->
  <div class="modal fade" id="delete-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"
              ><i class="ti ti-trash fs-24 text-danger"></i
            ></span>
            <h4 class="fs-20 text-gray-9 fw-bold mb-2 mt-1">Eliminar Tasa de Impuesto</h4>
            <p class="text-gray-6 mb-0 fs-16">
              ¿Estás seguro de que deseas eliminar esta tasa de impuesto?
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
    taxRate: {
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
        name: '',
        rate: 0,
        description: '',
        is_active: true,
        is_default: false
      },
      editFormData: {
        id: null,
        name: '',
        rate: 0,
        description: '',
        is_active: true,
        is_default: false,
        products_count: 0
      },
      isSubmitting: false
    };
  },
  watch: {
    taxRate: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            name: newVal.name,
            rate: newVal.rate,
            description: newVal.description || '',
            is_active: Boolean(newVal.is_active),
            is_default: Boolean(newVal.is_default),
            products_count: newVal.products_count || 0
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
        await axios.post('http://localhost:3000/api/v1/tax-rates', this.formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Limpiar formulario
        this.formData = {
          name: '',
          rate: 0,
          description: '',
          is_active: true,
          is_default: false
        };

        // Emitir evento para recargar datos PRIMERO
        this.$emit('tax-rate-saved');

        // Cerrar modal manualmente
        const modalElement = document.getElementById('add-tax');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito con SweetAlert2
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Tasa de impuesto creada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating tax rate:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear la tasa de impuesto',
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

        await axios.put(`http://localhost:3000/api/v1/tax-rates/${id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos PRIMERO
        this.$emit('tax-rate-saved');

        // Cerrar modal manualmente
        const modalElement = document.getElementById('edit-tax');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito con SweetAlert2
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Tasa de impuesto actualizada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating tax rate:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar la tasa de impuesto',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete() {
      if (!this.taxRate || !this.taxRate.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/tax-rates/${this.taxRate.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos PRIMERO
        this.$emit('tax-rate-deleted');

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
            text: 'Tasa de impuesto eliminada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting tax rate:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar la tasa de impuesto',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  },
};
</script>
