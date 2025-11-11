<template>
  <!-- Add Branch -->
  <div class="modal fade" id="add-branch">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Agregar Sucursal</h4>
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
                      <label class="form-label">Nombre <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.nombre"
                        placeholder="Ej: Agencia Principal"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Ciudad</label>
                      <select class="form-select" v-model="formData.city_id">
                        <option value="">Seleccionar ciudad</option>
                        <option v-for="city in cities" :key="city.id" :value="city.id">
                          {{ city.nombre }} - {{ city.state_name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Dirección</label>
                      <textarea
                        class="form-control"
                        v-model="formData.direccion"
                        rows="2"
                        placeholder="Dirección completa de la sucursal"
                      ></textarea>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Teléfono</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.telefono"
                        placeholder="Ej: 9875-2725"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Correo Electrónico</label>
                      <input
                        type="email"
                        class="form-control"
                        v-model="formData.correo"
                        placeholder="Ej: sucursal@ejemplo.com"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Gerente</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.gerente"
                        placeholder="Nombre del gerente"
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
                        id="add-branch-status"
                        class="check"
                        v-model="formData.is_active"
                      />
                      <label for="add-branch-status" class="checktoggle mb-0"></label>
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

  <!-- Edit Branch -->
  <div class="modal fade" id="edit-branch">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Sucursal</h4>
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
                      <label class="form-label">Nombre <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.nombre"
                        placeholder="Ej: Agencia Principal"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Ciudad</label>
                      <select class="form-select" v-model="editFormData.city_id">
                        <option value="">Seleccionar ciudad</option>
                        <option v-for="city in cities" :key="city.id" :value="city.id">
                          {{ city.nombre }} - {{ city.state_name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Dirección</label>
                      <textarea
                        class="form-control"
                        v-model="editFormData.direccion"
                        rows="2"
                        placeholder="Dirección completa de la sucursal"
                      ></textarea>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Teléfono</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.telefono"
                        placeholder="Ej: 9875-2725"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Correo Electrónico</label>
                      <input
                        type="email"
                        class="form-control"
                        v-model="editFormData.correo"
                        placeholder="Ej: sucursal@ejemplo.com"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Gerente</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.gerente"
                        placeholder="Nombre del gerente"
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
                        id="edit-branch-status"
                        class="check"
                        v-model="editFormData.is_active"
                      />
                      <label for="edit-branch-status" class="checktoggle mb-0"></label>
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
                  <p>¿Deseas eliminar esta sucursal?</p>
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
    branch: {
      type: Object,
      default: null
    }
  },
  emits: ['branch-saved', 'branch-deleted'],
  data() {
    return {
      formData: {
        nombre: '',
        direccion: '',
        city_id: '',
        telefono: '',
        correo: '',
        gerente: '',
        is_active: true
      },
      editFormData: {
        id: null,
        nombre: '',
        direccion: '',
        city_id: '',
        telefono: '',
        correo: '',
        gerente: '',
        is_active: true
      },
      cities: [],
      isSubmitting: false
    };
  },
  watch: {
    branch: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            nombre: newVal.nombre || '',
            direccion: newVal.direccion || '',
            city_id: newVal.city_id || '',
            telefono: newVal.telefono || '',
            correo: newVal.correo || '',
            gerente: newVal.gerente || '',
            is_active: newVal.is_active === 1 || newVal.is_active === true
          };
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.loadCities();
  },
  methods: {
    async loadCities() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/cities/active', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.cities = response.data.data || [];
      } catch (error) {
        console.error('Error loading cities:', error);
      }
    },

    async submitAddForm() {
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');

        await axios.post('http://localhost:3000/api/v1/branches', this.formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('branch-saved');

        // Cerrar modal
        const modalElement = document.getElementById('add-branch');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Limpiar formulario
        this.formData = {
          nombre: '',
          direccion: '',
          city_id: '',
          telefono: '',
          correo: '',
          gerente: '',
          is_active: true
        };

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Sucursal creada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating branch:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear la sucursal',
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

        await axios.put(`http://localhost:3000/api/v1/branches/${id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('branch-saved');

        // Cerrar modal
        const modalElement = document.getElementById('edit-branch');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Sucursal actualizada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating branch:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar la sucursal',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete() {
      if (!this.branch || !this.branch.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/branches/${this.branch.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('branch-deleted');

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
            text: 'Sucursal eliminada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting branch:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar la sucursal',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>
