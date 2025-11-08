<template>
  <!-- Modal Agregar Unidad -->
  <div class="modal fade" id="add-unit">
    <div class="modal-dialog modal-dialog-centered custom-modal-two">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header border-0 custom-modal-header">
              <div class="page-title">
                <h4>Agregar Unidad</h4>
              </div>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body custom-modal-body">
              <div v-if="errorAdd" class="alert alert-danger">{{ errorAdd }}</div>
              <div v-if="successAdd" class="alert alert-success">{{ successAdd }}</div>

              <form @submit.prevent="saveUnit">
                <div class="mb-3">
                  <label class="form-label">Nombre de la Unidad <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="formAdd.name" required placeholder="Ej: UNIDAD, CAJA, METRO CUADRADO" />
                </div>

                <div class="mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea class="form-control" v-model="formAdd.description" rows="3" placeholder="Descripción de la unidad"></textarea>
                </div>

                <div class="mb-3">
                  <div class="status-toggle modal-status d-flex justify-content-between align-items-center">
                    <span class="status-label">Estado</span>
                    <input type="checkbox" id="unit-add-status" class="check" v-model="formAdd.is_active" />
                    <label for="unit-add-status" class="checktoggle"></label>
                  </div>
                </div>

                <div class="modal-footer-btn">
                  <button type="button" class="btn btn-cancel me-2" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-submit" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                    {{ saving ? 'Guardando...' : 'Crear Unidad' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Editar Unidad -->
  <div class="modal fade" id="edit-unit">
    <div class="modal-dialog modal-dialog-centered custom-modal-two">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header border-0 custom-modal-header">
              <div class="page-title">
                <h4>Editar Unidad</h4>
              </div>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body custom-modal-body">
              <div v-if="errorEdit" class="alert alert-danger">{{ errorEdit }}</div>
              <div v-if="successEdit" class="alert alert-success">{{ successEdit }}</div>

              <form @submit.prevent="updateUnit">
                <div class="mb-3">
                  <label class="form-label">Nombre de la Unidad <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="formEdit.name" required />
                </div>

                <div class="mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea class="form-control" v-model="formEdit.description" rows="3"></textarea>
                </div>

                <div class="mb-3">
                  <div class="status-toggle modal-status d-flex justify-content-between align-items-center">
                    <span class="status-label">Estado</span>
                    <input type="checkbox" id="unit-edit-status" class="check" v-model="formEdit.is_active" />
                    <label for="unit-edit-status" class="checktoggle"></label>
                  </div>
                </div>

                <div class="modal-footer-btn">
                  <button type="button" class="btn btn-cancel me-2" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-submit" :disabled="updating">
                    <span v-if="updating" class="spinner-border spinner-border-sm me-1"></span>
                    {{ updating ? 'Actualizando...' : 'Actualizar Unidad' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Eliminar Unidad -->
  <div class="modal fade" id="delete-unit-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
              <i class="ti ti-trash fs-24 text-danger"></i>
            </span>
            <h4 class="fs-20 fw-bold mb-2 mt-1">Eliminar Unidad</h4>
            <p class="mb-0 fs-16" v-if="unitToDelete">
              ¿Estás seguro de eliminar la unidad <strong>{{ unitToDelete.name }}</strong>?
            </p>

            <div v-if="deleteError" class="alert alert-danger mt-3">{{ deleteError }}</div>

            <div class="modal-footer-btn mt-3 d-flex justify-content-center">
              <button type="button" class="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="button" class="btn btn-primary fs-13 fw-medium p-2 px-3" @click="deleteUnit" :disabled="deleting">
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
import { unitService } from '@/services/api.service';

export default {
  emits: ['saved', 'deleted'],
  props: {
    unit: {
      type: Object,
      default: null
    },
    unitToDelete: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      formAdd: {
        name: '',
        description: '',
        is_active: true
      },
      formEdit: {
        id: null,
        name: '',
        description: '',
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
    unit: {
      handler(newUnit) {
        if (newUnit) {
          this.formEdit = {
            id: newUnit.id,
            name: newUnit.name || '',
            description: newUnit.description || '',
            is_active: newUnit.is_active !== undefined ? Boolean(newUnit.is_active) : true
          };
        }
      },
      immediate: true
    }
  },
  methods: {
    async saveUnit() {
      this.saving = true;
      this.errorAdd = null;
      this.successAdd = null;

      try {
        await unitService.createUnit(this.formAdd);
        this.successAdd = 'Unidad creada exitosamente';

        setTimeout(() => {
          this.$emit('saved');
          this.closeModalAdd();
        }, 1000);

      } catch (err) {
        this.errorAdd = err.response?.data?.message || 'Error al crear la unidad';
      } finally {
        this.saving = false;
      }
    },

    async updateUnit() {
      this.updating = true;
      this.errorEdit = null;
      this.successEdit = null;

      try {
        await unitService.updateUnit(this.formEdit.id, this.formEdit);
        this.successEdit = 'Unidad actualizada exitosamente';

        setTimeout(() => {
          this.$emit('saved');
          this.closeModalEdit();
        }, 1000);

      } catch (err) {
        this.errorEdit = err.response?.data?.message || 'Error al actualizar la unidad';
      } finally {
        this.updating = false;
      }
    },

    async deleteUnit() {
      if (!this.unitToDelete) return;

      this.deleting = true;
      this.deleteError = null;

      try {
        await unitService.deleteUnit(this.unitToDelete.id);

        this.$emit('deleted');
        this.closeModalDelete();

      } catch (err) {
        this.deleteError = err.response?.data?.message || 'Error al eliminar la unidad';
      } finally {
        this.deleting = false;
      }
    },

    closeModalAdd() {
      this.cleanupModal('add-unit');
      this.resetFormAdd();
    },

    closeModalEdit() {
      this.cleanupModal('edit-unit');
      this.resetFormEdit();
    },

    closeModalDelete() {
      this.cleanupModal('delete-unit-modal');
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
        description: '',
        is_active: true
      };
      this.errorAdd = null;
      this.successAdd = null;
    },

    resetFormEdit() {
      this.formEdit = {
        id: null,
        name: '',
        description: '',
        is_active: true
      };
      this.errorEdit = null;
      this.successEdit = null;
    }
  }
};
</script>
