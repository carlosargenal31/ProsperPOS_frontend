<template>
  <!-- Add Supplier -->
  <div class="modal fade" id="add-supplier">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Agregar Proveedor</h4>
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
                        placeholder="Ej: PEGADURO DE CENTRO AMERICA SRL"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Tipo de Proveedor</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.tipo_proveedor"
                        placeholder="Ej: Nacional (opcional)"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Doc. Identificación</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.doc_identificacion"
                        placeholder="RTN/DNI (opcional)"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Tipo Beneficiario</label>
                      <select v-model="formData.tipo_beneficiario" class="form-select">
                        <option value="">Seleccionar...</option>
                        <option v-for="type in beneficiaryTypes" :key="type.id" :value="type.id">
                          {{ type.nombre }}
                        </option>
                      </select>
                    </div>
                  </div>                  <div class="col-lg-6">
                    <div class="mb-3">
                      <div
                        class="status-toggle modal-status d-flex justify-content-between align-items-center"
                      >
                        <span class="status-label">Usa Crédito</span>
                        <input type="checkbox" id="add-usa-credito" class="check" v-model="formData.usa_credito" />
                        <label for="add-usa-credito" class="checktoggle"></label>
                      </div>
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
  <!-- /Add Supplier -->

  <!-- Edit Supplier -->
  <div class="modal fade" id="edit-supplier">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Proveedor</h4>
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
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Tipo de Proveedor</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.tipo_proveedor"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Doc. Identificación</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.doc_identificacion"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Tipo Beneficiario</label>
                      <select v-model="editFormData.tipo_beneficiario" class="form-select">
                        <option value="">Seleccionar...</option>
                        <option v-for="type in beneficiaryTypes" :key="type.id" :value="type.id">
                          {{ type.nombre }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <div
                        class="status-toggle modal-status d-flex justify-content-between align-items-center"
                      >
                        <span class="status-label">Usa Crédito</span>
                        <input type="checkbox" id="edit-usa-credito" class="check" v-model="editFormData.usa_credito" />
                        <label for="edit-usa-credito" class="checktoggle"></label>
                      </div>
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
  <!-- /Edit Supplier -->

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
                  <p>¿Deseas eliminar este proveedor?</p>
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
    supplier: {
      type: Object,
      default: null
    }
  },
  emits: ['supplier-saved', 'supplier-deleted'],
  data() {
    return {
      formData: {
        nombre: '',
        tipo_proveedor: '',
        doc_identificacion: '',
        usa_credito: false,
        tipo_beneficiario: '',
        is_active: true
      },
      editFormData: {
        id: null,
        nombre: '',
        tipo_proveedor: '',
        doc_identificacion: '',
        usa_credito: false,
        tipo_beneficiario: '',
        is_active: true
      },
      beneficiaryTypes: [],
      isSubmitting: false
    };
  },
  mounted() {
    this.loadBeneficiaryTypes();
  },
  watch: {
    supplier: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            nombre: newVal.nombre || '',
            tipo_proveedor: newVal.tipo_proveedor || '',
            doc_identificacion: newVal.doc_identificacion || '',
            usa_credito: newVal.usa_credito === 1 || newVal.usa_credito === true,
            tipo_beneficiario: newVal.tipo_beneficiario || '1',
            is_active: newVal.is_active === 1 || newVal.is_active === true
          };
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async loadBeneficiaryTypes() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/beneficiary-types/active', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.beneficiaryTypes = response.data.data || [];
      } catch (error) {
        console.error('Error loading beneficiary types:', error);
      }
    },
    async submitAddForm() {
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');

        await axios.post('http://localhost:3000/api/v1/suppliers', this.formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('supplier-saved');

        // Cerrar modal
        const modalElement = document.getElementById('add-supplier');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Limpiar formulario
        this.formData = {
          nombre: '',
          tipo_proveedor: '',
          doc_identificacion: '',
          usa_credito: false,
          tipo_beneficiario: '1',
          is_active: true
        };

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Proveedor creado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating supplier:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear el proveedor',
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

        await axios.put(`http://localhost:3000/api/v1/suppliers/${id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('supplier-saved');

        // Cerrar modal
        const modalElement = document.getElementById('edit-supplier');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Proveedor actualizado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating supplier:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar el proveedor',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete() {
      if (!this.supplier || !this.supplier.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/suppliers/${this.supplier.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('supplier-deleted');

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
            text: 'Proveedor eliminado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting supplier:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar el proveedor',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  },
};
</script>
