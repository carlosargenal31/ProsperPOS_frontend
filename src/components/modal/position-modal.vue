<template>
  <!-- View Position -->
  <div class="modal fade" id="view-position" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Detalles del Cargo</h4>
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
              <div class="row" v-if="position">
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">ID:</label>
                  <p class="form-control-plaintext">{{ position.id || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Nombre:</label>
                  <p class="form-control-plaintext">{{ position.nombre || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Departamento:</label>
                  <p class="form-control-plaintext">{{ position.department_name || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Estado:</label>
                  <p class="form-control-plaintext">
                    <span :class="position.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ position.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </p>
                </div>
                <div class="col-lg-12 mb-3">
                  <label class="form-label fw-bold">Descripción:</label>
                  <p class="form-control-plaintext">{{ position.descripcion || '-' }}</p>
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
  <!-- /View Position -->

  <!-- Add Position -->
  <div class="modal fade" id="add-position" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Agregar Cargo/Puesto</h4>
              </div>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form @submit.prevent="submitAddForm">
              <div class="modal-body">
                <div class="row">
                  <div class="col-lg-8">
                    <div class="mb-3">
                      <label class="form-label">Nombre <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="formData.nombre" placeholder="Ej: Gerente General" required />
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Departamento</label>
                      <select class="form-control" v-model="formData.department_id">
                        <option value="">Seleccionar...</option>
                        <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.nombre }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Descripción</label>
                      <textarea class="form-control" v-model="formData.descripcion" placeholder="Descripción del cargo" rows="3"></textarea>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="status-toggle modal-status d-flex justify-content-between align-items-center mb-3">
                      <span class="status-label">Activo</span>
                      <input type="checkbox" id="add-is-active-position" class="check" v-model="formData.is_active" />
                      <label for="add-is-active-position" class="checktoggle"></label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
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

  <!-- Edit Position -->
  <div class="modal fade" id="edit-position" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Cargo/Puesto</h4>
              </div>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form @submit.prevent="submitEditForm">
              <div class="modal-body">
                <div class="row">
                  <div class="col-lg-8">
                    <div class="mb-3">
                      <label class="form-label">Nombre <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="editFormData.nombre" required />
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Departamento</label>
                      <select class="form-control" v-model="editFormData.department_id">
                        <option value="">Seleccionar...</option>
                        <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.nombre }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Descripción</label>
                      <textarea class="form-control" v-model="editFormData.descripcion" rows="3"></textarea>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="status-toggle modal-status d-flex justify-content-between align-items-center mb-3">
                      <span class="status-label">Activo</span>
                      <input type="checkbox" id="edit-is-active-position" class="check" v-model="editFormData.is_active" />
                      <label for="edit-is-active-position" class="checktoggle"></label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
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

  <!-- delete modal -->
  <div class="modal fade" id="delete-position-modal" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"
              ><i class="ti ti-trash fs-24 text-danger"></i
            ></span>
            <h4 class="fs-20 text-gray-9 fw-bold mb-2 mt-1">Eliminar Cargo</h4>
            <p class="text-gray-6 mb-0 fs-16">
              ¿Estás seguro de que deseas eliminar este cargo?
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
    position: { type: Object, default: null },
    isEdit: { type: Boolean, default: false }
  },
  data() {
    return {
      formData: { nombre: '', descripcion: '', department_id: '', is_active: true },
      editFormData: { id: null, nombre: '', descripcion: '', department_id: '', is_active: true },
      departments: [],
      isSubmitting: false
    };
  },
  mounted() {
    this.fetchDepartments();
  },
  watch: {
    position: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            nombre: newVal.nombre,
            descripcion: newVal.descripcion || '',
            department_id: newVal.department_id || '',
            is_active: Boolean(newVal.is_active)
          };
        }
      },
      immediate: true
    }
  },
  methods: {
    async fetchDepartments() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/departments/active', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.departments = response.data.data || [];
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    },
    async submitAddForm() {
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3000/api/v1/positions', this.formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        this.formData = { nombre: '', descripcion: '', department_id: '', is_active: true };
        this.$emit('position-saved');

        const modalElement = document.getElementById('add-position');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Cargo creado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating position:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear el cargo',
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

        await axios.put(`http://localhost:3000/api/v1/positions/${id}`, updateData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        this.$emit('position-saved');

        const modalElement = document.getElementById('edit-position');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Cargo actualizado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating position:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar el cargo',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    async confirmDelete() {
      if (!this.position || !this.position.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/positions/${this.position.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        this.$emit('position-deleted');

        const modalElement = document.getElementById('delete-position-modal');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'Cargo eliminado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting position:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar el cargo',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>
