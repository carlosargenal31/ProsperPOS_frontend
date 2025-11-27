<template>
  <!-- View Customer -->
  <div class="modal fade" id="view-customer" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Detalles del Cliente</h4>
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
              <div class="row" v-if="customer">
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Código:</label>
                  <p class="form-control-plaintext">{{ customer.codigo || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Nombre:</label>
                  <p class="form-control-plaintext">{{ customer.nombre || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Nombre Comercial:</label>
                  <p class="form-control-plaintext">{{ customer.nombre_comercial || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Código Tipo Precio:</label>
                  <p class="form-control-plaintext">{{ customer.codigo_tipo_precio || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Doc. Identificación:</label>
                  <p class="form-control-plaintext">{{ customer.doc_identificacion || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Teléfono:</label>
                  <p class="form-control-plaintext">{{ customer.telefono || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Email:</label>
                  <p class="form-control-plaintext">{{ customer.email || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Fecha de Inicio:</label>
                  <p class="form-control-plaintext">{{ customer.fecha_inicio || '-' }}</p>
                </div>
                <div class="col-lg-12 mb-3">
                  <label class="form-label fw-bold">Dirección:</label>
                  <p class="form-control-plaintext">{{ customer.direccion || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Descuento (%):</label>
                  <p class="form-control-plaintext">{{ customer.descuento_prc || '0.00' }}%</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Persona de Contacto:</label>
                  <p class="form-control-plaintext">{{ customer.persona_contacto || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Tipo Beneficiario:</label>
                  <p class="form-control-plaintext">{{ customer.tipo_beneficiario || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Estado:</label>
                  <p class="form-control-plaintext">
                    <span :class="customer.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ customer.is_active ? 'Activo' : 'Inactivo' }}
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
  <!-- /View Customer -->

  <!-- Add Customer -->
  <div class="modal fade" id="add-customer" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Agregar Cliente</h4>
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
                      <label class="form-label">Código <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.codigo"
                        placeholder="Ej: 000001"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Nombre <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.nombre"
                        placeholder="Nombre del cliente"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Nombre Comercial</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.nombre_comercial"
                        placeholder="Nombre comercial"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Código Tipo Precio</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.codigo_tipo_precio"
                        placeholder="Código tipo de precio"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Documento de Identificación (RTN/DNI)</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.doc_identificacion"
                        placeholder="RTN o DNI"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Teléfono</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.telefono"
                        placeholder="Número de teléfono"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Email</label>
                      <input
                        type="email"
                        class="form-control"
                        v-model="formData.email"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Fecha de Inicio</label>
                      <input
                        type="date"
                        class="form-control"
                        v-model="formData.fecha_inicio"
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Dirección</label>
                      <textarea
                        class="form-control"
                        v-model="formData.direccion"
                        placeholder="Dirección completa"
                        rows="2"
                      ></textarea>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Descuento (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        max="100"
                        min="0"
                        class="form-control"
                        v-model="formData.descuento_prc"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Persona de Contacto</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.persona_contacto"
                        placeholder="Nombre del contacto"
                      />
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
  <!-- /Add Customer -->

  <!-- Edit Customer -->
  <div class="modal fade" id="edit-customer" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Cliente</h4>
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
                      <label class="form-label">Código <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.codigo"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
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
                      <label class="form-label">Nombre Comercial</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.nombre_comercial"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Código Tipo Precio</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.codigo_tipo_precio"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Documento de Identificación (RTN/DNI)</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.doc_identificacion"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Teléfono</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.telefono"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Email</label>
                      <input
                        type="email"
                        class="form-control"
                        v-model="editFormData.email"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Fecha de Inicio</label>
                      <input
                        type="date"
                        class="form-control"
                        v-model="editFormData.fecha_inicio"
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Dirección</label>
                      <textarea
                        class="form-control"
                        v-model="editFormData.direccion"
                        rows="2"
                      ></textarea>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Descuento (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        max="100"
                        min="0"
                        class="form-control"
                        v-model="editFormData.descuento_prc"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Persona de Contacto</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.persona_contacto"
                      />
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
  <!-- /Edit Customer -->

  <!-- delete modal -->
  <div class="modal fade" id="delete-customer-modal" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"
              ><i class="ti ti-trash fs-24 text-danger"></i
            ></span>
            <h4 class="fs-20 text-gray-9 fw-bold mb-2 mt-1">Eliminar Cliente</h4>
            <p class="text-gray-6 mb-0 fs-16">
              ¿Estás seguro de que deseas eliminar este cliente?
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
    customer: {
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
        codigo: '',
        nombre: '',
        nombre_comercial: '',
        codigo_tipo_precio: '',
        fecha_inicio: null,
        doc_identificacion: '',
        telefono: '',
        email: '',
        direccion: '',
        descuento_prc: 0,
        persona_contacto: '',
        tipo_beneficiario: '1',
        is_active: true
      },
      editFormData: {
        id: null,
        codigo: '',
        nombre: '',
        nombre_comercial: '',
        codigo_tipo_precio: '',
        fecha_inicio: null,
        doc_identificacion: '',
        telefono: '',
        email: '',
        direccion: '',
        descuento_prc: 0,
        persona_contacto: '',
        tipo_beneficiario: '1',
        is_active: true
      },
      isSubmitting: false
    };
  },
  watch: {
    customer: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            codigo: newVal.codigo || '',
            nombre: newVal.nombre || '',
            nombre_comercial: newVal.nombre_comercial || '',
            codigo_tipo_precio: newVal.codigo_tipo_precio || '',
            fecha_inicio: newVal.fecha_inicio || null,
            doc_identificacion: newVal.doc_identificacion || '',
            telefono: newVal.telefono || '',
            email: newVal.email || '',
            direccion: newVal.direccion || '',
            descuento_prc: newVal.descuento_prc || 0,
            persona_contacto: newVal.persona_contacto || '',
            tipo_beneficiario: newVal.tipo_beneficiario || '1',
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
        await axios.post('http://localhost:3000/api/v1/customers', this.formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Limpiar formulario
        this.formData = {
          codigo: '',
          nombre: '',
          nombre_comercial: '',
          codigo_tipo_precio: '',
          fecha_inicio: null,
          doc_identificacion: '',
          telefono: '',
          email: '',
          direccion: '',
          descuento_prc: 0,
          persona_contacto: '',
          tipo_beneficiario: '1',
          is_active: true
        };

        // Emitir evento para recargar datos
        this.$emit('customer-saved');

        // Cerrar modal
        const modalElement = document.getElementById('add-customer');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Cliente creado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating customer:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear el cliente',
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

        await axios.put(`http://localhost:3000/api/v1/customers/${id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('customer-saved');

        // Cerrar modal
        const modalElement = document.getElementById('edit-customer');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Cliente actualizado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating customer:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar el cliente',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete() {
      if (!this.customer || !this.customer.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/customers/${this.customer.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Emitir evento para recargar datos
        this.$emit('customer-deleted');

        // Cerrar modal
        const modalElement = document.getElementById('delete-customer-modal');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        // Mostrar mensaje de éxito
        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'Cliente eliminado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting customer:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar el cliente',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  },
};
</script>
