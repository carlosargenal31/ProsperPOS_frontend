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
                  <label class="form-label">URL del Logo</label>
                  <input type="url" class="form-control" v-model="formAdd.logo_url" placeholder="https://ejemplo.com/logo.png" />
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
                  <label class="form-label">URL del Logo</label>
                  <input type="url" class="form-control" v-model="formEdit.logo_url" />
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
        logo_url: '',
        is_active: true
      },
      formEdit: {
        id: null,
        name: '',
        logo_url: '',
        is_active: true
      },
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
            logo_url: newBrand.logo_url || '',
            is_active: newBrand.is_active !== undefined ? Boolean(newBrand.is_active) : true
          };
        }
      },
      immediate: true
    }
  },
  methods: {
    async saveBrand() {
      this.saving = true;
      this.errorAdd = null;
      this.successAdd = null;

      try {
        await brandService.createBrand(this.formAdd);
        this.successAdd = 'Marca creada exitosamente';

        setTimeout(() => {
          this.$emit('saved');
          this.closeModalAdd();
        }, 1000);

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
        await brandService.updateBrand(this.formEdit.id, this.formEdit);
        this.successEdit = 'Marca actualizada exitosamente';

        setTimeout(() => {
          this.$emit('saved');
          this.closeModalEdit();
        }, 1000);

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
      if (typeof window !== 'undefined' && window.bootstrap) {
        if (modalId) {
          const modalElement = document.getElementById(modalId);
          if (modalElement) {
            const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
              modalInstance.hide();
            }
          }
        }

        // Limpiar backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    },

    resetFormAdd() {
      this.formAdd = {
        name: '',
        logo_url: '',
        is_active: true
      };
      this.errorAdd = null;
      this.successAdd = null;
    },

    resetFormEdit() {
      this.formEdit = {
        id: null,
        name: '',
        logo_url: '',
        is_active: true
      };
      this.errorEdit = null;
      this.successEdit = null;
    }
  }
};
</script>
