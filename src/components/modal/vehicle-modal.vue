<template>
  <!-- Add Vehicle -->
  <div class="modal fade" id="add-vehicle">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Agregar Vehículo</h4>
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
                      <label class="form-label">Placa <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.placa"
                        placeholder="Ej: HDZ-3014"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Marca <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.marca"
                        placeholder="Ej: Toyota"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Modelo <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.modelo"
                        placeholder="Ej: Hilux 2020"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Color <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.color"
                        placeholder="Ej: Blanco"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div
                      class="status-toggle modal-status d-flex justify-content-between align-items-center mb-3"
                    >
                      <span class="status-label">Estado</span>
                      <input
                        type="checkbox"
                        id="add-vehicle-status"
                        class="check"
                        v-model="formData.is_active"
                      />
                      <label for="add-vehicle-status" class="checktoggle mb-0"></label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-cancel" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-submit" :disabled="isSubmitting">
                  {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Vehicle -->
  <div class="modal fade" id="edit-vehicle">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Vehículo</h4>
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
                      <label class="form-label">Placa <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.placa"
                        placeholder="Ej: HDZ-3014"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Marca <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.marca"
                        placeholder="Ej: Toyota"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Modelo <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.modelo"
                        placeholder="Ej: Hilux 2020"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Color <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.color"
                        placeholder="Ej: Blanco"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div
                      class="status-toggle modal-status d-flex justify-content-between align-items-center mb-3"
                    >
                      <span class="status-label">Estado</span>
                      <input
                        type="checkbox"
                        id="edit-vehicle-status"
                        class="check"
                        v-model="editFormData.is_active"
                      />
                      <label for="edit-vehicle-status" class="checktoggle mb-0"></label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-cancel" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-submit" :disabled="isSubmitting">
                  {{ isSubmitting ? 'Actualizando...' : 'Actualizar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div class="modal fade" id="delete-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-body">
              <div class="delete-action">
                <div class="delete-heads">
                  <h4>¿Estás seguro?</h4>
                  <p>¿Deseas eliminar este vehículo?</p>
                </div>
                <div class="modal-footer justify-content-center">
                  <button
                    type="button"
                    class="btn btn-cancel me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger"
                    @click="confirmDelete"
                    :disabled="isSubmitting"
                  >
                    {{ isSubmitting ? 'Eliminando...' : 'Sí, Eliminar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  props: {
    vehicle: {
      type: Object,
      default: null
    }
  },
  emits: ['vehicle-saved', 'vehicle-deleted'],
  data() {
    return {
      formData: {
        placa: '',
        marca: '',
        modelo: '',
        color: '',
        is_active: true
      },
      editFormData: {
        id: null,
        placa: '',
        marca: '',
        modelo: '',
        color: '',
        is_active: true
      },
      isSubmitting: false
    };
  },
  watch: {
    vehicle: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            placa: newVal.placa || '',
            marca: newVal.marca || '',
            modelo: newVal.modelo || '',
            color: newVal.color || '',
            is_active: newVal.is_active === 1 || newVal.is_active === true
          };
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async submitAddForm() {
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');

        await axios.post('http://localhost:3000/api/v1/vehicles', this.formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('vehicle-saved');

        // Cerrar modal
        const modalElement = document.getElementById('add-vehicle');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Limpiar formulario
        this.formData = {
          placa: '',
          marca: '',
          modelo: '',
          color: '',
          is_active: true
        };

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Vehículo creado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating vehicle:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear el vehículo',
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

        await axios.put(`http://localhost:3000/api/v1/vehicles/${id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('vehicle-saved');

        // Cerrar modal
        const modalElement = document.getElementById('edit-vehicle');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Vehículo actualizado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating vehicle:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar el vehículo',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete() {
      if (!this.vehicle || !this.vehicle.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/vehicles/${this.vehicle.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('vehicle-deleted');

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
            title: '¡Éxito!',
            text: 'Vehículo eliminado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar el vehículo',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>
