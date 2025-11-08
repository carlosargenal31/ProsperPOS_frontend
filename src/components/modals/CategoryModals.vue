<template>
  <div>
    <!-- Modal Agregar Categoría -->
    <div class="modal fade" id="add-category" tabindex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addModalLabel">Nueva Categoría</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCategory">
              <div class="mb-3">
                <label class="form-label">Nombre <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.name"
                  required
                  placeholder="Ej: PORCELANATO, PAREDES, FACHALETAS"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Imagen</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.image_url"
                  placeholder="Nombre del archivo (ej: porcelanato.jpg)"
                />
                <small class="text-muted">Solo el nombre del archivo, sin ruta completa</small>
              </div>

              <div class="mb-3">
                <div class="status-toggle modal-status d-flex justify-content-between align-items-center">
                  <span class="status-label">Estado</span>
                  <input type="checkbox" id="category-add-status" class="check" v-model="form.is_active" />
                  <label for="category-add-status" class="checktoggle"></label>
                </div>
              </div>

              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <div v-if="success" class="alert alert-success">{{ success }}</div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="saveCategory" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Guardando...' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editar Categoría -->
    <div class="modal fade" id="edit-category" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editModalLabel">Editar Categoría</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCategory">
              <div class="mb-3">
                <label class="form-label">Nombre <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formEdit.name"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Imagen</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formEdit.image_url"
                  placeholder="Nombre del archivo (ej: porcelanato.jpg)"
                />
                <small class="text-muted">Solo el nombre del archivo, sin ruta completa</small>
              </div>

              <div class="mb-3">
                <div class="status-toggle modal-status d-flex justify-content-between align-items-center">
                  <span class="status-label">Estado</span>
                  <input type="checkbox" id="category-edit-status" class="check" v-model="formEdit.is_active" />
                  <label for="category-edit-status" class="checktoggle"></label>
                </div>
              </div>

              <div v-if="errorEdit" class="alert alert-danger">{{ errorEdit }}</div>
              <div v-if="successEdit" class="alert alert-success">{{ successEdit }}</div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="updateCategory" :disabled="savingEdit">
              <span v-if="savingEdit" class="spinner-border spinner-border-sm me-2"></span>
              {{ savingEdit ? 'Guardando...' : 'Actualizar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Eliminar Categoría -->
    <div class="modal fade" id="delete-category-modal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Eliminar Categoría</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">¿Estás seguro de que deseas eliminar la categoría <strong>{{ categoryToDelete?.name }}</strong>?</p>
            <p class="text-muted mt-2 mb-0">
              <small>Esta acción no se puede deshacer.</small>
            </p>
            <div v-if="deleteError" class="alert alert-danger mt-3">{{ deleteError }}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" @click="deleteCategory" :disabled="deleting">
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
import { categoryService } from '@/services/api.service';

export default {
  emits: ['saved', 'deleted'],
  props: {
    category: {
      type: Object,
      default: null
    },
    categoryToDelete: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // Formulario para agregar
      form: {
        name: '',
        image_url: '',
        is_active: true
      },
      // Formulario para editar
      formEdit: {
        name: '',
        image_url: '',
        is_active: true
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
    category: {
      handler(newVal) {
        if (newVal) {
          this.formEdit = {
            name: newVal.name || '',
            image_url: newVal.image_url || '',
            is_active: newVal.is_active !== undefined ? Boolean(newVal.is_active) : true
          };
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // Crear nueva categoría
    async saveCategory() {
      this.saving = true;
      this.error = null;
      this.success = null;

      try {
        const payload = {
          name: this.form.name,
          image_url: this.form.image_url || null,
          is_active: this.form.is_active === 1 || this.form.is_active === true
        };

        await categoryService.createCategory(payload);

        // Cerrar modal inmediatamente
        this.$emit('saved');
        this.closeModalAdd();

      } catch (err) {
        this.error = err.response?.data?.message || 'Error al crear la categoría';
      } finally {
        this.saving = false;
      }
    },

    // Actualizar categoría existente
    async updateCategory() {
      if (!this.category) return;

      this.savingEdit = true;
      this.errorEdit = null;
      this.successEdit = null;

      try {
        const payload = {
          name: this.formEdit.name,
          image_url: this.formEdit.image_url || null,
          is_active: this.formEdit.is_active === 1 || this.formEdit.is_active === true
        };

        await categoryService.updateCategory(this.category.id, payload);

        // Cerrar modal inmediatamente
        this.$emit('saved');
        this.closeModalEdit();

      } catch (err) {
        this.errorEdit = err.response?.data?.message || 'Error al actualizar la categoría';
      } finally {
        this.savingEdit = false;
      }
    },

    async deleteCategory() {
      if (!this.categoryToDelete) return;

      this.deleting = true;
      this.deleteError = null;

      try {
        await categoryService.deleteCategory(this.categoryToDelete.id);

        // Cerrar modal inmediatamente
        this.$emit('deleted');
        this.closeModalDelete();

      } catch (err) {
        this.deleteError = err.response?.data?.message || 'Error al eliminar la categoría';
      } finally {
        this.deleting = false;
      }
    },

    closeModalAdd() {
      this.cleanupModal('add-category');
      this.resetFormAdd();
    },

    closeModalEdit() {
      this.cleanupModal('edit-category');
      this.resetFormEdit();
    },

    closeModalDelete() {
      this.cleanupModal('delete-category-modal');
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
        } else {
          // Cerrar todos los modales abiertos
          const modalElements = document.querySelectorAll('.modal.show');
          modalElements.forEach(modalElement => {
            let modal = window.bootstrap.Modal.getInstance(modalElement);
            if (!modal) {
              modal = new window.bootstrap.Modal(modalElement);
            }
            modal.hide();
          });
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
        image_url: '',
        is_active: true
      };
      this.error = null;
      this.success = null;
    },

    resetFormEdit() {
      this.formEdit = {
        name: '',
        image_url: '',
        is_active: true
      };
      this.errorEdit = null;
      this.successEdit = null;
    }
  }
};
</script>
