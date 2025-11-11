<template>
  <!-- Add Coupon -->
  <div class="modal fade" id="add-coupon">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Registro de Cupones</h4>
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
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Código <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <input
                          type="text"
                          class="form-control"
                          v-model="formData.codigo"
                          placeholder="000001"
                          required
                        />
                        <button class="btn btn-outline-secondary" type="button" title="Usar Consecutivos">
                          <input type="checkbox" v-model="formData.usar_consecutivos" class="form-check-input me-1" />
                          Consecutivo
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-8">
                    <div class="mb-3">
                      <label class="form-label">Nombre del Cupón <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.nombre"
                        placeholder="FACHALETAS"
                        required
                      />
                    </div>
                  </div>

                  <!-- Aplicar a -->
                  <div class="col-lg-12 mb-3">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="form-check">
                          <input class="form-check-input" type="radio" v-model="formData.aplicar_a" value="grupo" id="add-aplicar-grupo" />
                          <label class="form-check-label" for="add-aplicar-grupo">
                            Seleccionar un grupo y/o artículo en específico
                          </label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-check">
                          <input class="form-check-input" type="radio" v-model="formData.aplicar_a" value="multiples_articulos" id="add-aplicar-multiples" />
                          <label class="form-check-label" for="add-aplicar-multiples">
                            Seleccionar múltiples Artículos
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Campos condicionales -->
                  <div v-if="formData.aplicar_a !== 'multiples_articulos'" class="col-lg-12">
                    <div class="row">
                      <div class="col-lg-4">
                        <div class="mb-3">
                          <label class="form-label">Grupo</label>
                          <select v-model="formData.grupo_id" @change="onGrupoChange" class="form-select">
                            <option value="">Seleccionar...</option>
                            <option v-for="grupo in grupos" :key="grupo.id" :value="grupo.id">
                              {{ grupo.nombre }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-lg-4">
                        <div class="mb-3">
                          <label class="form-label">Subgrupo</label>
                          <select v-model="formData.subgrupo_id" @change="onSubgrupoChange" class="form-select" :disabled="!formData.grupo_id">
                            <option value="">Seleccionar...</option>
                            <option v-for="subgrupo in filteredSubgrupos" :key="subgrupo.id" :value="subgrupo.id">
                              {{ subgrupo.nombre }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-lg-4">
                        <div class="mb-3">
                          <label class="form-label">Artículo</label>
                          <select v-model="formData.articulo_id" class="form-select" :disabled="!formData.grupo_id">
                            <option value="">Seleccionar...</option>
                            <option v-for="articulo in filteredArticulos" :key="articulo.id" :value="articulo.id">
                              {{ articulo.nombre }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Múltiples artículos -->
                  <div v-else class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Seleccionar Artículos</label>
                      <select v-model="formData.productos" multiple class="form-select" style="height: 150px;">
                        <option v-for="articulo in articulos" :key="articulo.id" :value="articulo.id">
                          {{ articulo.nombre }}
                        </option>
                      </select>
                      <small class="text-muted">Mantén Ctrl para seleccionar múltiples artículos</small>
                    </div>
                  </div>

                  <!-- Fechas -->
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Fecha Desde <span class="text-danger">*</span></label>
                      <input
                        type="date"
                        class="form-control"
                        v-model="formData.fecha_desde"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Fecha Hasta <span class="text-danger">*</span></label>
                      <input
                        type="date"
                        class="form-control"
                        v-model="formData.fecha_hasta"
                        required
                      />
                    </div>
                  </div>

                  <!-- Descuento -->
                  <div class="col-lg-6 mb-3">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="form-check">
                          <input class="form-check-input" type="radio" v-model="formData.tipo_descuento" value="porcentaje" id="add-tipo-porcentaje" />
                          <label class="form-check-label" for="add-tipo-porcentaje">
                            Porcentaje
                          </label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-check">
                          <input class="form-check-input" type="radio" v-model="formData.tipo_descuento" value="monto" id="add-tipo-monto" />
                          <label class="form-check-label" for="add-tipo-monto">
                            Monto
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Valor <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <span class="input-group-text">{{ formData.tipo_descuento === 'porcentaje' ? '%' : 'L' }}</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          class="form-control"
                          v-model="formData.valor_descuento"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Estado -->
                  <div class="col-lg-12">
                    <div class="mb-3 form-check">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        id="add-suspendido"
                        v-model="formData.suspendido"
                      />
                      <label class="form-check-label" for="add-suspendido">
                        Suspender
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
                  Cerrar
                </button>
                <button type="button" class="btn btn-danger me-2" @click="clearForm">
                  Eliminar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting">Guardando...</span>
                  <span v-else">Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /Add Coupon -->

  <!-- Edit Coupon -->
  <div class="modal fade" id="edit-coupon">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Cupón</h4>
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
                  <div class="col-lg-4">
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
                  <div class="col-lg-8">
                    <div class="mb-3">
                      <label class="form-label">Nombre del Cupón <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.nombre"
                        required
                      />
                    </div>
                  </div>

                  <!-- Similar structure to add modal but with editFormData -->
                  <div class="col-lg-12 mb-3">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="form-check">
                          <input class="form-check-input" type="radio" v-model="editFormData.aplicar_a" value="grupo" id="edit-aplicar-grupo" />
                          <label class="form-check-label" for="edit-aplicar-grupo">
                            Seleccionar un grupo y/o artículo en específico
                          </label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-check">
                          <input class="form-check-input" type="radio" v-model="editFormData.aplicar_a" value="multiples_articulos" id="edit-aplicar-multiples" />
                          <label class="form-check-label" for="edit-aplicar-multiples">
                            Seleccionar múltiples Artículos
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="editFormData.aplicar_a !== 'multiples_articulos'" class="col-lg-12">
                    <div class="row">
                      <div class="col-lg-4">
                        <div class="mb-3">
                          <label class="form-label">Grupo</label>
                          <select v-model="editFormData.grupo_id" @change="onGrupoChangeEdit" class="form-select">
                            <option value="">Seleccionar...</option>
                            <option v-for="grupo in grupos" :key="grupo.id" :value="grupo.id">
                              {{ grupo.nombre }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-lg-4">
                        <div class="mb-3">
                          <label class="form-label">Subgrupo</label>
                          <select v-model="editFormData.subgrupo_id" @change="onSubgrupoChangeEdit" class="form-select" :disabled="!editFormData.grupo_id">
                            <option value="">Seleccionar...</option>
                            <option v-for="subgrupo in filteredSubgruposEdit" :key="subgrupo.id" :value="subgrupo.id">
                              {{ subgrupo.nombre }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-lg-4">
                        <div class="mb-3">
                          <label class="form-label">Artículo</label>
                          <select v-model="editFormData.articulo_id" class="form-select" :disabled="!editFormData.grupo_id">
                            <option value="">Seleccionar...</option>
                            <option v-for="articulo in filteredArticulosEdit" :key="articulo.id" :value="articulo.id">
                              {{ articulo.nombre }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label">Seleccionar Artículos</label>
                      <select v-model="editFormData.productos" multiple class="form-select" style="height: 150px;">
                        <option v-for="articulo in articulos" :key="articulo.id" :value="articulo.id">
                          {{ articulo.nombre }}
                        </option>
                      </select>
                      <small class="text-muted">Mantén Ctrl para seleccionar múltiples artículos</small>
                    </div>
                  </div>

                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Fecha Desde <span class="text-danger">*</span></label>
                      <input
                        type="date"
                        class="form-control"
                        v-model="editFormData.fecha_desde"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Fecha Hasta <span class="text-danger">*</span></label>
                      <input
                        type="date"
                        class="form-control"
                        v-model="editFormData.fecha_hasta"
                        required
                      />
                    </div>
                  </div>

                  <div class="col-lg-6 mb-3">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="form-check">
                          <input class="form-check-input" type="radio" v-model="editFormData.tipo_descuento" value="porcentaje" id="edit-tipo-porcentaje" />
                          <label class="form-check-label" for="edit-tipo-porcentaje">
                            Porcentaje
                          </label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-check">
                          <input class="form-check-input" type="radio" v-model="editFormData.tipo_descuento" value="monto" id="edit-tipo-monto" />
                          <label class="form-check-label" for="edit-tipo-monto">
                            Monto
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Valor <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <span class="input-group-text">{{ editFormData.tipo_descuento === 'porcentaje' ? '%' : 'L' }}</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          class="form-control"
                          v-model="editFormData.valor_descuento"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div class="col-lg-12">
                    <div class="mb-3 form-check">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        id="edit-suspendido"
                        v-model="editFormData.suspendido"
                      />
                      <label class="form-check-label" for="edit-suspendido">
                        Suspender
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
  <!-- /Edit Coupon -->

  <!-- Delete modal -->
  <div class="modal fade" id="delete-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"
              ><i class="ti ti-trash fs-24 text-danger"></i
            ></span>
            <h4 class="fs-20 text-gray-9 fw-bold mb-2 mt-1">Eliminar Cupón</h4>
            <p class="text-gray-6 mb-0 fs-16">
              ¿Estás seguro de que deseas eliminar este cupón?
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
    coupon: {
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
        tipo_descuento: 'porcentaje',
        valor_descuento: 0,
        fecha_desde: '',
        fecha_hasta: '',
        aplicar_a: 'grupo',
        grupo_id: '',
        subgrupo_id: '',
        articulo_id: '',
        productos: [],
        suspendido: false,
        usar_consecutivos: false
      },
      editFormData: {
        id: null,
        codigo: '',
        nombre: '',
        tipo_descuento: 'porcentaje',
        valor_descuento: 0,
        fecha_desde: '',
        fecha_hasta: '',
        aplicar_a: 'grupo',
        grupo_id: '',
        subgrupo_id: '',
        articulo_id: '',
        productos: [],
        suspendido: false
      },
      grupos: [],
      subgrupos: [],
      articulos: [],
      isSubmitting: false
    };
  },
  computed: {
    filteredSubgrupos() {
      if (!this.formData.grupo_id) return [];
      return this.subgrupos.filter(s => s.category_id == this.formData.grupo_id);
    },
    filteredArticulos() {
      if (this.formData.subgrupo_id) {
        return this.articulos.filter(a => a.subcategory_id == this.formData.subgrupo_id);
      } else if (this.formData.grupo_id) {
        return this.articulos.filter(a => a.category_id == this.formData.grupo_id);
      }
      return this.articulos;
    },
    filteredSubgruposEdit() {
      if (!this.editFormData.grupo_id) return [];
      return this.subgrupos.filter(s => s.category_id == this.editFormData.grupo_id);
    },
    filteredArticulosEdit() {
      if (this.editFormData.subgrupo_id) {
        return this.articulos.filter(a => a.subcategory_id == this.editFormData.subgrupo_id);
      } else if (this.editFormData.grupo_id) {
        return this.articulos.filter(a => a.category_id == this.editFormData.grupo_id);
      }
      return this.articulos;
    }
  },
  mounted() {
    this.loadGrupos();
    this.loadSubgrupos();
    this.loadArticulos();
  },
  watch: {
    coupon: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            codigo: newVal.codigo || '',
            nombre: newVal.nombre || '',
            tipo_descuento: newVal.tipo_descuento || 'porcentaje',
            valor_descuento: newVal.valor_descuento || 0,
            fecha_desde: newVal.fecha_desde || '',
            fecha_hasta: newVal.fecha_hasta || '',
            aplicar_a: newVal.aplicar_a || 'grupo',
            grupo_id: newVal.grupo_id || '',
            subgrupo_id: newVal.subgrupo_id || '',
            articulo_id: newVal.articulo_id || '',
            productos: newVal.productos ? newVal.productos.map(p => p.id) : [],
            suspendido: Boolean(newVal.suspendido)
          };
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async loadGrupos() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/categories/active', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.grupos = response.data.data || [];
      } catch (error) {
        console.error('Error loading grupos:', error);
      }
    },
    async loadSubgrupos() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/subcategories/active', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.subgrupos = response.data.data || [];
      } catch (error) {
        console.error('Error loading subgrupos:', error);
      }
    },
    async loadArticulos() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.articulos = response.data.data || [];
      } catch (error) {
        console.error('Error loading articulos:', error);
      }
    },
    onGrupoChange() {
      this.formData.subgrupo_id = '';
      this.formData.articulo_id = '';
    },
    onSubgrupoChange() {
      this.formData.articulo_id = '';
    },
    onGrupoChangeEdit() {
      this.editFormData.subgrupo_id = '';
      this.editFormData.articulo_id = '';
    },
    onSubgrupoChangeEdit() {
      this.editFormData.articulo_id = '';
    },
    clearForm() {
      this.formData = {
        codigo: '',
        nombre: '',
        tipo_descuento: 'porcentaje',
        valor_descuento: 0,
        fecha_desde: '',
        fecha_hasta: '',
        aplicar_a: 'grupo',
        grupo_id: '',
        subgrupo_id: '',
        articulo_id: '',
        productos: [],
        suspendido: false,
        usar_consecutivos: false
      };
    },
    async submitAddForm() {
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3000/api/v1/coupons', this.formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        this.clearForm();
        this.$emit('coupon-saved');

        const modalElement = document.getElementById('add-coupon');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Cupón creado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating coupon:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear el cupón',
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

        await axios.put(`http://localhost:3000/api/v1/coupons/${id}`, updateData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        this.$emit('coupon-saved');

        const modalElement = document.getElementById('edit-coupon');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Cupón actualizado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating coupon:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar el cupón',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    async confirmDelete() {
      if (!this.coupon || !this.coupon.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/coupons/${this.coupon.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        this.$emit('coupon-deleted');

        const modalElement = document.getElementById('delete-modal');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'Cupón eliminado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting coupon:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar el cupón',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  },
};
</script>
