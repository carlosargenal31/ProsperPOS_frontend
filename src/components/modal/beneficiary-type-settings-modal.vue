<template>
  <!-- Add Beneficiary Type -->
  <div class="modal fade" id="add-beneficiary-type">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <div class="page-title">
            <h4>Agregar Tipo de Beneficiario</h4>
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
                    v-model="formData.nombre"
                    placeholder="JURIDICA DOMICILIADA"
                    required
                  />
                </div>
              </div>
              <div class="col-lg-12">
                <div class="mb-0 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="add-is-active"
                    v-model="formData.is_active"
                  />
                  <label class="form-check-label" for="add-is-active">
                    Activo
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
  <!-- /Add Beneficiary Type -->

  <!-- Edit Beneficiary Type -->
  <div class="modal fade" id="edit-beneficiary-type">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Tipo de Beneficiario</h4>
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
                        v-model="editFormData.nombre"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-0 form-check">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        id="edit-is-active"
                        v-model="editFormData.is_active"
                      />
                      <label class="form-check-label" for="edit-is-active">
                        Activo
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
  <!-- /Edit Beneficiary Type -->

  <!-- View Beneficiary Type -->
  <div class="modal fade" id="view-beneficiary-type">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Detalles del Tipo de Beneficiario</h4>
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
                    {{ beneficiaryType?.id || '-' }}
                  </p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Estado</label>
                  <p class="form-control-plaintext">
                    <span :class="beneficiaryType?.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                      {{ beneficiaryType?.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </p>
                </div>
                <div class="col-lg-12 mb-3">
                  <label class="form-label fw-bold">Nombre</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ beneficiaryType?.nombre || '-' }}
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
  <!-- /View Beneficiary Type -->

  <!-- delete modal -->
  <div class="modal fade" id="delete-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"
              ><i class="ti ti-trash fs-24 text-danger"></i
            ></span>
            <h4 class="fs-20 text-gray-9 fw-bold mb-2 mt-1">Eliminar Tipo de Beneficiario</h4>
            <p class="text-gray-6 mb-0 fs-16">
              ¿Estás seguro de que deseas eliminar este tipo de beneficiario?
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
    beneficiaryType: {
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
        nombre: '',
        is_active: true
      },
      editFormData: {
        id: null,
        nombre: '',
        is_active: true
      },
      isSubmitting: false
    };
  },
  watch: {
    beneficiaryType: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            nombre: newVal.nombre || '',
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
        await axios.post('http://localhost:3000/api/v1/beneficiary-types', this.formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Limpiar formulario
        this.formData = {
          nombre: '',
          is_active: true
        };

        // Emitir evento para recargar datos PRIMERO
        this.$emit('beneficiary-type-saved');

        // Cerrar modal manualmente
        const modalElement = document.getElementById('add-beneficiary-type');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito con SweetAlert2
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Tipo de beneficiario creado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating beneficiary type:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear el tipo de beneficiario',
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

        await axios.put(`http://localhost:3000/api/v1/beneficiary-types/${id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos PRIMERO
        this.$emit('beneficiary-type-saved');

        // Cerrar modal manualmente
        const modalElement = document.getElementById('edit-beneficiary-type');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito con SweetAlert2
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Tipo de beneficiario actualizado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating beneficiary type:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar el tipo de beneficiario',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete() {
      if (!this.beneficiaryType || !this.beneficiaryType.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/beneficiary-types/${this.beneficiaryType.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos PRIMERO
        this.$emit('beneficiary-type-deleted');

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
            title: '¡Eliminado!',
            text: 'Tipo de beneficiario eliminado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting beneficiary type:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar el tipo de beneficiario',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  },
};
</script>
