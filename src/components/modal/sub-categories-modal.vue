<template>
  <div>
    <!-- Modal Agregar Subcategoría -->
    <div class="modal fade" id="add-subcategory" tabindex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addModalLabel">Nueva Subcategoría</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSubcategory">
              <div class="mb-3">
                <label class="form-label">Categoría Padre <span class="text-danger">*</span></label>
                <select class="form-select" v-model="form.category_id" required>
                  <option value="">Seleccionar categoría...</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Nombre <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.name"
                  required
                  placeholder="Ej: Laptops"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Imagen</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.image_url"
                  placeholder="Nombre del archivo (ej: laptops.jpg)"
                />
                <small class="text-muted">Solo el nombre del archivo, sin ruta completa</small>
              </div>

              <div class="mb-3">
                <label class="form-label">Estado</label>
                <select class="form-select" v-model="form.is_active">
                  <option :value="1">Activo</option>
                  <option :value="0">Inactivo</option>
                </select>
              </div>

              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <div v-if="success" class="alert alert-success">{{ success }}</div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="saveSubcategory" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Guardando...' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editar Subcategoría -->
    <div class="modal fade" id="edit-subcategory" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editModalLabel">Editar Subcategoría</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateSubcategory">
              <div class="mb-3">
                <label class="form-label">Categoría Padre <span class="text-danger">*</span></label>
                <select class="form-select" v-model="formEdit.category_id" required>
                  <option value="">Seleccionar categoría...</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Nombre <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formEdit.name"
                  required
                  placeholder="Ej: Laptops"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Imagen</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formEdit.image_url"
                  placeholder="Nombre del archivo (ej: laptops.jpg)"
                />
                <small class="text-muted">Solo el nombre del archivo, sin ruta completa</small>
              </div>

              <div class="mb-3">
                <label class="form-label">Estado</label>
                <select class="form-select" v-model="formEdit.is_active">
                  <option :value="1">Activo</option>
                  <option :value="0">Inactivo</option>
                </select>
              </div>

              <div v-if="errorEdit" class="alert alert-danger">{{ errorEdit }}</div>
              <div v-if="successEdit" class="alert alert-success">{{ successEdit }}</div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="updateSubcategory" :disabled="savingEdit">
              <span v-if="savingEdit" class="spinner-border spinner-border-sm me-2"></span>
              {{ savingEdit ? 'Guardando...' : 'Actualizar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Eliminar Subcategoría -->
    <div class="modal fade" id="delete-subcategory-modal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Eliminar Subcategoría</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">¿Estás seguro de que deseas eliminar la subcategoría <strong>{{ subcategoryToDelete?.name }}</strong>?</p>
            <p class="text-muted mt-2 mb-0">
              <small>Esta acción no se puede deshacer.</small>
            </p>
            <div v-if="deleteError" class="alert alert-danger mt-3">{{ deleteError }}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" @click="deleteSubcategory" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              {{ deleting ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { subcategoryService, categoryService } from '@/services/api.service';

export default {
  emits: ['saved', 'deleted'],
  props: {
    subcategory: {
      type: Object,
      default: null
    },
    subcategoryToDelete: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      categories: [],
      // Formulario para agregar
      form: {
        name: '',
        category_id: '',
        image_url: '',
        is_active: 1
      },
      // Formulario para editar
      formEdit: {
        name: '',
        category_id: '',
        image_url: '',
        is_active: 1
      },
      saving: false,
      savingEdit: false,
      deleting: false,
      error: null,
      success: null,
      errorEdit: null,
      successEdit: null,
      deleteError: null
    };
  },
  watch: {
    subcategory: {
      handler(newVal) {
        if (newVal) {
          this.formEdit = {
            name: newVal.name || '',
            category_id: newVal.category_id || '',
            image_url: newVal.image_url || '',
            is_active: newVal.is_active ? 1 : 0
          };
        }
      },
      immediate: true,
      deep: true
    }
  },
  async mounted() {
    await this.loadCategories();
  },
  methods: {
    async loadCategories() {
      try {
        const response = await categoryService.getActiveCategories();
        this.categories = response.data || response;
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    },

    // Crear nueva subcategoría
    async saveSubcategory() {
      this.saving = true;
      this.error = null;
      this.success = null;

      try {
        const payload = {
          name: this.form.name,
          category_id: this.form.category_id,
          image_url: this.form.image_url || null,
          is_active: this.form.is_active === 1 || this.form.is_active === true
        };

        await subcategoryService.createSubcategory(payload);

        // Cerrar modal inmediatamente
        this.$emit('saved');
        this.closeModalAdd();

      } catch (err) {
        this.error = err.response?.data?.message || 'Error al crear la subcategoría';
      } finally {
        this.saving = false;
      }
    },

    // Actualizar subcategoría existente
    async updateSubcategory() {
      if (!this.subcategory) return;

      this.savingEdit = true;
      this.errorEdit = null;
      this.successEdit = null;

      try {
        const payload = {
          name: this.formEdit.name,
          category_id: this.formEdit.category_id,
          image_url: this.formEdit.image_url || null,
          is_active: this.formEdit.is_active === 1 || this.formEdit.is_active === true
        };

        await subcategoryService.updateSubcategory(this.subcategory.id, payload);

        // Cerrar modal inmediatamente
        this.$emit('saved');
        this.closeModalEdit();

      } catch (err) {
        this.errorEdit = err.response?.data?.message || 'Error al actualizar la subcategoría';
      } finally {
        this.savingEdit = false;
      }
    },

    async deleteSubcategory() {
      if (!this.subcategoryToDelete) return;

      this.deleting = true;
      this.deleteError = null;

      try {
        await subcategoryService.deleteSubcategory(this.subcategoryToDelete.id);

        // Cerrar modal inmediatamente
        this.$emit('deleted');
        this.closeModalDelete();

      } catch (err) {
        this.deleteError = err.response?.data?.message || 'Error al eliminar la subcategoría';
      } finally {
        this.deleting = false;
      }
    },

    closeModalAdd() {
      this.cleanupModal('add-subcategory');
      this.resetFormAdd();
    },

    closeModalEdit() {
      this.cleanupModal('edit-subcategory');
      this.resetFormEdit();
    },

    closeModalDelete() {
      this.cleanupModal('delete-subcategory-modal');
      this.deleteError = null;
    },

    cleanupModal(modalId = null) {
      // Importar Bootstrap dinámicamente
      if (typeof window !== 'undefined' && window.bootstrap) {
        if (modalId) {
          const modalElement = document.getElementById(modalId);
          if (modalElement) {
            // Intentar obtener instancia existente o crear una nueva
            let modal = window.bootstrap.Modal.getInstance(modalElement);
            if (!modal) {
              modal = new window.bootstrap.Modal(modalElement);
            }
            modal.hide();
          }
        }
      }

      // Esperar un poco antes de limpiar (para que Bootstrap termine su animación)
      setTimeout(() => {
        // Limpiar backdrop manualmente si quedó
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // Remover clase del body
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
      }, 300);
    },

    resetFormAdd() {
      this.form = {
        name: '',
        description: '',
        category_id: '',
        image_url: '',
        is_active: 1
      };
      this.error = null;
      this.success = null;
    },

    resetFormEdit() {
      this.formEdit = {
        name: '',
        description: '',
        category_id: '',
        image_url: '',
        is_active: 1
      };
      this.errorEdit = null;
      this.successEdit = null;
    }
  }
};
</script>
