<template>
  <div>
    <!-- Modal Agregar Subcategoría -->
    <div class="modal fade" id="add-subcategory" tabindex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="page-wrapper-new p-0">
            <div class="content">
              <div class="modal-header">
                <div class="page-title">
                  <h4>Nueva Subcategoría</h4>
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
                  type="file"
                  class="form-control"
                  @change="handleImageSelect"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                />
                <small class="text-muted">Formatos permitidos: JPEG, PNG, WEBP (Máx. 5MB)</small>

                <!-- Vista previa -->
                <div v-if="imagePreview" class="mt-2">
                  <img :src="imagePreview" alt="Vista previa" class="img-thumbnail" style="max-width: 200px; max-height: 200px;" />
                  <button type="button" class="btn btn-sm btn-danger ms-2" @click="clearImage">
                    <i class="ti ti-x"></i> Eliminar
                  </button>
                </div>
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

                <!-- Imagen actual -->
                <div v-if="formEdit.current_image_url && !imagePreviewEdit" class="mb-2">
                  <img :src="formEdit.current_image_url" alt="Imagen actual" class="img-thumbnail" style="max-width: 200px; max-height: 200px;" />
                  <button type="button" class="btn btn-sm btn-danger ms-2" @click="deleteCurrentImage">
                    <i class="ti ti-trash"></i> Eliminar imagen actual
                  </button>
                </div>

                <!-- Subir nueva imagen -->
                <input
                  type="file"
                  class="form-control"
                  @change="handleImageSelectEdit"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                />
                <small class="text-muted">Formatos permitidos: JPEG, PNG, WEBP (Máx. 5MB)</small>

                <!-- Vista previa de nueva imagen -->
                <div v-if="imagePreviewEdit" class="mt-2">
                  <img :src="imagePreviewEdit" alt="Vista previa" class="img-thumbnail" style="max-width: 200px; max-height: 200px;" />
                  <button type="button" class="btn btn-sm btn-danger ms-2" @click="clearImageEdit">
                    <i class="ti ti-x"></i> Cancelar
                  </button>
                </div>
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

    <!-- Modal Ver Subcategoría -->
    <div class="modal fade" id="view-subcategory" tabindex="-1" aria-labelledby="viewModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalles de la Subcategoría</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row" v-if="subcategory">
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">ID:</label>
                <p class="form-control-plaintext">{{ subcategory.id || '-' }}</p>
              </div>
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Nombre:</label>
                <p class="form-control-plaintext">{{ subcategory.name || '-' }}</p>
              </div>
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Categoría Padre:</label>
                <p class="form-control-plaintext">{{ subcategory.category_name || '-' }}</p>
              </div>
              <div class="col-lg-12 mb-3" v-if="subcategory.image_url">
                <label class="form-label fw-bold">Imagen:</label>
                <div>
                  <img :src="subcategory.image_url" alt="Subcategoría" class="img-thumbnail" style="max-width: 300px; max-height: 300px;" />
                </div>
              </div>
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Productos:</label>
                <p class="form-control-plaintext">{{ subcategory.products_count || 0 }}</p>
              </div>
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Estado:</label>
                <p class="form-control-plaintext">
                  <span :class="subcategory.is_active ? 'badge bg-success' : 'badge bg-danger'">
                    {{ subcategory.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
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
        is_active: 1
      },
      // Formulario para editar
      formEdit: {
        name: '',
        category_id: '',
        is_active: 1,
        current_image_url: null
      },
      // Imágenes
      selectedImage: null,
      imagePreview: null,
      selectedImageEdit: null,
      imagePreviewEdit: null,
      // Estados
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
            is_active: newVal.is_active !== undefined ? Number(newVal.is_active) : 1,
            current_image_url: newVal.image_url || null
          };
          this.selectedImageEdit = null;
          this.imagePreviewEdit = null;
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.loadCategories();
  },
  methods: {
    async loadCategories() {
      try {
        const response = await categoryService.getActiveCategories();
        if (response.success) {
          this.categories = response.data || [];
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    },

    // Manejar selección de imagen (crear)
    handleImageSelect(event) {
      const file = event.target.files[0];
      if (file) {
        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.error = 'La imagen no puede superar los 5MB';
          event.target.value = '';
          return;
        }

        this.selectedImage = file;

        // Crear vista previa
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    // Limpiar imagen seleccionada (crear)
    clearImage() {
      this.selectedImage = null;
      this.imagePreview = null;
      const fileInput = document.querySelector('#add-subcategory input[type="file"]');
      if (fileInput) fileInput.value = '';
    },

    // Manejar selección de imagen (editar)
    handleImageSelectEdit(event) {
      const file = event.target.files[0];
      if (file) {
        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.errorEdit = 'La imagen no puede superar los 5MB';
          event.target.value = '';
          return;
        }

        this.selectedImageEdit = file;

        // Crear vista previa
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviewEdit = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    // Limpiar imagen seleccionada (editar)
    clearImageEdit() {
      this.selectedImageEdit = null;
      this.imagePreviewEdit = null;
      const fileInput = document.querySelector('#edit-subcategory input[type="file"]');
      if (fileInput) fileInput.value = '';
    },

    // Eliminar imagen actual
    async deleteCurrentImage() {
      if (!this.subcategory) return;

      try {
        await subcategoryService.deleteSubcategoryImage(this.subcategory.id);
        this.formEdit.current_image_url = null;
        this.successEdit = 'Imagen eliminada exitosamente';
        setTimeout(() => this.successEdit = null, 3000);
      } catch (err) {
        this.errorEdit = err.response?.data?.message || 'Error al eliminar la imagen';
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
          is_active: Number(this.form.is_active)
        };

        const response = await subcategoryService.createSubcategory(payload);
        const subcategoryId = response.data.id;

        // Si hay imagen, subirla
        if (this.selectedImage && subcategoryId) {
          await subcategoryService.uploadSubcategoryImage(subcategoryId, this.selectedImage);
        }

        // Cerrar modal inmediatamente
        this.$emit('success');
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
          is_active: Number(this.formEdit.is_active),
          // Preservar la imagen actual si no hay una nueva
          image_url: this.formEdit.current_image_url
        };

        await subcategoryService.updateSubcategory(this.subcategory.id, payload);

        // Si hay nueva imagen, subirla
        if (this.selectedImageEdit) {
          await subcategoryService.uploadSubcategoryImage(this.subcategory.id, this.selectedImageEdit);
        }

        // Cerrar modal inmediatamente
        this.$emit('success');
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
        category_id: '',
        is_active: 1
      };
      this.clearImage();
      this.error = null;
      this.success = null;
    },

    resetFormEdit() {
      this.formEdit = {
        name: '',
        category_id: '',
        is_active: 1,
        current_image_url: null
      };
      this.clearImageEdit();
      this.errorEdit = null;
      this.successEdit = null;
    }
  }
};
</script>
