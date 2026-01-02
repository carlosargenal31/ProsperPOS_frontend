<template>
  <!-- Modal Agregar Marca -->
  <div class="modal fade" id="add-brand">
    <div class="modal-dialog modal-dialog-centered custom-modal-two">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header border-0 custom-modal-header">
              <div class="page-title">
                <h4>Agregar Marca</h4>
              </div>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body custom-modal-body">
              <div v-if="errorAdd" class="alert alert-danger">{{ errorAdd }}</div>
              <div v-if="successAdd" class="alert alert-success">{{ successAdd }}</div>

              <form @submit.prevent="saveBrand">
                <div class="mb-3">
                  <label class="form-label">Nombre de la Marca <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="formAdd.name" required placeholder="Ej: GALA, SAN LORENZO, CERA" />
                </div>

                <div class="mb-3">
                  <label class="form-label">Logo</label>
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
                  <div class="status-toggle modal-status d-flex justify-content-between align-items-center">
                    <span class="status-label">Estado</span>
                    <input type="checkbox" id="brand-add-status" class="check" v-model="formAdd.is_active" />
                    <label for="brand-add-status" class="checktoggle"></label>
                  </div>
                </div>

                <div class="modal-footer-btn">
                  <button type="button" class="btn btn-cancel me-2" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-submit" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                    {{ saving ? 'Guardando...' : 'Crear Marca' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Editar Marca -->
  <div class="modal fade" id="edit-brand">
    <div class="modal-dialog modal-dialog-centered custom-modal-two">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header border-0 custom-modal-header">
              <div class="page-title">
                <h4>Editar Marca</h4>
              </div>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body custom-modal-body">
              <div v-if="errorEdit" class="alert alert-danger">{{ errorEdit }}</div>
              <div v-if="successEdit" class="alert alert-success">{{ successEdit }}</div>

              <form @submit.prevent="updateBrand">
                <div class="mb-3">
                  <label class="form-label">Nombre de la Marca <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="formEdit.name" required />
                </div>

                <div class="mb-3">
                  <label class="form-label">Logo</label>

                  <!-- Logo actual -->
                  <div v-if="formEdit.current_logo_url && !imagePreviewEdit" class="mb-2">
                    <img :src="formEdit.current_logo_url" alt="Logo actual" class="img-thumbnail" style="max-width: 200px; max-height: 200px;" />
                    <button type="button" class="btn btn-sm btn-danger ms-2" @click="deleteCurrentLogo">
                      <i class="ti ti-trash"></i> Eliminar logo actual
                    </button>
                  </div>

                  <!-- Subir nuevo logo -->
                  <input
                    type="file"
                    class="form-control"
                    @change="handleImageSelectEdit"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                  />
                  <small class="text-muted">Formatos permitidos: JPEG, PNG, WEBP (Máx. 5MB)</small>

                  <!-- Vista previa de nuevo logo -->
                  <div v-if="imagePreviewEdit" class="mt-2">
                    <img :src="imagePreviewEdit" alt="Vista previa" class="img-thumbnail" style="max-width: 200px; max-height: 200px;" />
                    <button type="button" class="btn btn-sm btn-danger ms-2" @click="clearImageEdit">
                      <i class="ti ti-x"></i> Cancelar
                    </button>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="status-toggle modal-status d-flex justify-content-between align-items-center">
                    <span class="status-label">Estado</span>
                    <input type="checkbox" id="brand-edit-status" class="check" v-model="formEdit.is_active" />
                    <label for="brand-edit-status" class="checktoggle"></label>
                  </div>
                </div>

                <div class="modal-footer-btn">
                  <button type="button" class="btn btn-cancel me-2" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-submit" :disabled="updating">
                    <span v-if="updating" class="spinner-border spinner-border-sm me-1"></span>
                    {{ updating ? 'Actualizando...' : 'Actualizar Marca' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Visualizar Marca -->
  <div class="modal fade" id="view-brand">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Detalles de la Marca</h4>
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
              <div class="row" v-if="brand">
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">ID:</label>
                  <p class="form-control-plaintext">{{ brand.id || '-' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Nombre:</label>
                  <p class="form-control-plaintext">{{ brand.name || '-' }}</p>
                </div>
                <div class="col-lg-12 mb-3" v-if="brand.logo_url">
                  <label class="form-label fw-bold">Logo:</label>
                  <div>
                    <img :src="brand.logo_url" alt="Logo de marca" class="img-thumbnail" style="max-width: 300px; max-height: 300px;" />
                  </div>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Productos:</label>
                  <p class="form-control-plaintext">{{ brand.products_count || 0 }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Estado:</label>
                  <p class="form-control-plaintext">
                    <span :class="brand.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ brand.is_active ? 'Activo' : 'Inactivo' }}
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
  <!-- /Modal Visualizar Marca -->

  <!-- Modal Eliminar Marca -->
  <div class="modal fade" id="delete_modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
              <i class="ti ti-trash fs-24 text-danger"></i>
            </span>
            <h4 class="fs-20 fw-bold mb-2 mt-1">Eliminar Marca</h4>
            <p class="mb-0 fs-16" v-if="brandToDelete">
              ¿Estás seguro de eliminar la marca <strong>{{ brandToDelete.name }}</strong>?
            </p>

            <div v-if="deleteError" class="alert alert-danger mt-3">{{ deleteError }}</div>

            <div class="modal-footer-btn mt-3 d-flex justify-content-center">
              <button type="button" class="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="button" class="btn btn-primary fs-13 fw-medium p-2 px-3" @click="deleteBrand" :disabled="deleting">
                <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
                {{ deleting ? 'Eliminando...' : 'Sí, Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { brandService } from '@/services/api.service';

export default {
  emits: ['saved', 'deleted'],
  props: {
    brand: {
      type: Object,
      default: null
    },
    brandToDelete: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      formAdd: {
        name: '',
        is_active: true
      },
      formEdit: {
        id: null,
        name: '',
        is_active: true,
        current_logo_url: null
      },
      // Imágenes
      selectedImage: null,
      imagePreview: null,
      selectedImageEdit: null,
      imagePreviewEdit: null,
      // Estados
      saving: false,
      updating: false,
      deleting: false,
      errorAdd: null,
      successAdd: null,
      errorEdit: null,
      successEdit: null,
      deleteError: null
    };
  },
  watch: {
    brand: {
      handler(newBrand) {
        if (newBrand) {
          this.formEdit = {
            id: newBrand.id,
            name: newBrand.name || '',
            is_active: newBrand.is_active !== undefined ? Boolean(newBrand.is_active) : true,
            current_logo_url: newBrand.logo_url || null
          };
          this.selectedImageEdit = null;
          this.imagePreviewEdit = null;
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async saveBrand() {
      this.saving = true;
      this.errorAdd = null;
      this.successAdd = null;

      try {
        const payload = {
          name: this.formAdd.name,
          is_active: this.formAdd.is_active
        };

        const response = await brandService.createBrand(payload);
        const brandId = response.data.id;

        // Si hay imagen, subirla
        if (this.selectedImage && brandId) {
          await brandService.uploadBrandLogo(brandId, this.selectedImage);
        }

        this.successAdd = `La marca "${this.formAdd.name}" ha sido creada exitosamente`;

        setTimeout(() => {
          this.$emit('saved');
          this.closeModalAdd();
        }, 1500);

      } catch (err) {
        this.errorAdd = err.response?.data?.message || 'Error al crear la marca';
      } finally {
        this.saving = false;
      }
    },

    async updateBrand() {
      this.updating = true;
      this.errorEdit = null;
      this.successEdit = null;

      try {
        const payload = {
          name: this.formEdit.name,
          is_active: this.formEdit.is_active,
          logo_url: this.formEdit.current_logo_url
        };

        await brandService.updateBrand(this.formEdit.id, payload);

        // Si hay nueva imagen, subirla
        if (this.selectedImageEdit) {
          await brandService.uploadBrandLogo(this.formEdit.id, this.selectedImageEdit);
        }

        this.successEdit = `La marca "${this.formEdit.name}" ha sido actualizada exitosamente`;

        setTimeout(() => {
          this.$emit('saved');
          this.closeModalEdit();
        }, 1500);

      } catch (err) {
        this.errorEdit = err.response?.data?.message || 'Error al actualizar la marca';
      } finally {
        this.updating = false;
      }
    },

    async deleteBrand() {
      if (!this.brandToDelete) return;

      this.deleting = true;
      this.deleteError = null;

      try {
        await brandService.deleteBrand(this.brandToDelete.id);

        this.$emit('deleted');
        this.closeModalDelete();

      } catch (err) {
        this.deleteError = err.response?.data?.message || 'Error al eliminar la marca';
      } finally {
        this.deleting = false;
      }
    },

    // Manejar selección de imagen (crear)
    handleImageSelect(event) {
      const file = event.target.files[0];
      if (file) {
        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.errorAdd = 'La imagen no puede superar los 5MB';
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
      const fileInput = document.querySelector('#add-brand input[type="file"]');
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
      const fileInput = document.querySelector('#edit-brand input[type="file"]');
      if (fileInput) fileInput.value = '';
    },

    // Eliminar logo actual
    async deleteCurrentLogo() {
      if (!this.brand) return;

      try {
        await brandService.deleteBrandLogo(this.brand.id);
        this.formEdit.current_logo_url = null;
        this.successEdit = 'Logo eliminado exitosamente';
        setTimeout(() => this.successEdit = null, 3000);
      } catch (err) {
        this.errorEdit = err.response?.data?.message || 'Error al eliminar el logo';
      }
    },

    closeModalAdd() {
      this.cleanupModal('add-brand');
      this.resetFormAdd();
    },

    closeModalEdit() {
      this.cleanupModal('edit-brand');
      this.resetFormEdit();
    },

    closeModalDelete() {
      this.cleanupModal('delete_modal');
      this.deleteError = null;
    },

    cleanupModal(modalId = null) {
      if (!modalId) return;

      const modalElement = document.getElementById(modalId);
      if (!modalElement) return;

      // Método 1: Intentar con jQuery si está disponible
      if (typeof window !== 'undefined' && window.$ && window.$.fn && window.$.fn.modal) {
        try {
          window.$(`#${modalId}`).modal('hide');
        } catch (e) {
          console.log('jQuery modal hide failed, trying Bootstrap');
        }
      }

      // Método 2: Bootstrap 5 nativo
      if (typeof window !== 'undefined' && window.bootstrap) {
        try {
          const bsModal = window.bootstrap.Modal.getInstance(modalElement) ||
                         new window.bootstrap.Modal(modalElement);
          bsModal.hide();
        } catch (e) {
          console.log('Bootstrap modal hide failed');
        }
      }

      // Método 3: Manipulación directa del DOM (fallback agresivo)
      setTimeout(() => {
        // Remover clases del modal
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');

        // Limpiar todos los backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
          backdrop.remove();
        });

        // Limpiar el body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.removeAttribute('data-bs-overflow');
        document.body.removeAttribute('data-bs-padding-right');
      }, 100);
    },

    resetFormAdd() {
      this.formAdd = {
        name: '',
        is_active: true
      };
      this.clearImage();
      this.errorAdd = null;
      this.successAdd = null;
    },

    resetFormEdit() {
      this.formEdit = {
        id: null,
        name: '',
        is_active: true,
        current_logo_url: null
      };
      this.clearImageEdit();
      this.errorEdit = null;
      this.successEdit = null;
    }
  }
};
</script>
