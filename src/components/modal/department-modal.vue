<template>
  <!-- View Department -->
  <div class="modal fade" id="view-department" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Detalles del Departamento</h4>
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
              <div class="row" v-if="department">
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">ID:</label>
                  <p class="form-control-plaintext">{{ department.id || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Nombre:</label>
                  <p class="form-control-plaintext">{{ department.nombre || '-' }}</p>
                </div>
                <div class="col-lg-12 mb-3">
                  <label class="form-label fw-bold">Descripción:</label>
                  <p class="form-control-plaintext">{{ department.descripcion || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Estado:</label>
                  <p class="form-control-plaintext">
                    <span :class="department.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ department.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
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
  <!-- /View Department -->

  <!-- Add Department -->
  <div class="modal fade" id="add-department" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Agregar Departamento</h4>
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
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Nombre <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.nombre"
                        placeholder="Ej: Recursos Humanos"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Descripción</label>
                      <textarea
                        class="form-control"
                        v-model="formData.descripcion"
                        placeholder="Descripción del departamento"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div
                      class="status-toggle modal-status d-flex justify-content-between align-items-center mb-3"
                    >
                      <span class="status-label">Activo</span>
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
  <!-- /Add Department -->

  <!-- Edit Department -->
  <div class="modal fade" id="edit-department" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Departamento</h4>
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
                    <div class="mb-3">
                      <label class="form-label">Descripción</label>
                      <textarea
                        class="form-control"
                        v-model="editFormData.descripcion"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div
                      class="status-toggle modal-status d-flex justify-content-between align-items-center mb-3"
                    >
                      <span class="status-label">Activo</span>
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
                  <span v-else>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /Edit Department -->

  <!-- delete modal -->
  <div class="modal fade" id="delete-modal" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"
              ><i class="ti ti-trash fs-24 text-danger"></i
            ></span>
            <h4 class="fs-20 text-gray-9 fw-bold mb-2 mt-1">Eliminar Departamento</h4>
            <p class="text-gray-6 mb-0 fs-16">
              ¿Estás seguro de que deseas eliminar este departamento?
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
    department: {
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
        descripcion: '',
        is_active: true
      },
      editFormData: {
        id: null,
        nombre: '',
        descripcion: '',
        is_active: true
      },
      isSubmitting: false
    };
  },
  watch: {
    department: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            nombre: newVal.nombre,
            descripcion: newVal.descripcion || '',
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
        await axios.post('http://localhost:3000/api/v1/departments', this.formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Limpiar formulario
        this.formData = {
          nombre: '',
          descripcion: '',
          is_active: true
        };

        // Emitir evento para recargar datos
        this.$emit('department-saved');

        // Cerrar modal
        const modalElement = document.getElementById('add-department');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Departamento creado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating department:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear el departamento',
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

        await axios.put(`http://localhost:3000/api/v1/departments/${id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('department-saved');

        // Cerrar modal
        const modalElement = document.getElementById('edit-department');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Departamento actualizado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating department:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar el departamento',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete() {
      if (!this.department || !this.department.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/departments/${this.department.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('department-deleted');

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
            title: '¡Eliminado!',
            text: 'Departamento eliminado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting department:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar el departamento',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  },
};
</script>
