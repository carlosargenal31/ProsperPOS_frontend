<template>
  <!-- Modal Agregar Rol -->
  <div class="modal fade" id="add-units">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <div class="page-title"><h4>Crear Rol</h4></div>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nombre del Rol<span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="formData.name" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" rows="3" v-model="formData.description"></textarea>
            </div>
            <div class="d-flex align-items-center justify-content-between">
              <label class="form-label">Estado</label>
              <label class="switch">
                <input type="checkbox" v-model="formData.is_active" />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting"><span class="spinner-border spinner-border-sm me-1"></span>Guardando...</span>
              <span v-else>Crear Rol</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal Editar Rol -->
  <div class="modal fade" id="edit_role">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <div class="page-title"><h4>Editar Rol</h4></div>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>
        <form @submit.prevent="handleUpdate">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nombre del Rol<span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="editFormData.name" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" rows="3" v-model="editFormData.description"></textarea>
            </div>
            <div class="d-flex align-items-center justify-content-between">
              <label class="form-label">Estado</label>
              <label class="switch">
                <input type="checkbox" v-model="editFormData.is_active" />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting"><span class="spinner-border spinner-border-sm me-1"></span>Guardando...</span>
              <span v-else>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal Eliminar -->
  <div class="modal fade modal-default" id="delete_modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body p-0">
          <div class="success-wrap text-center">
            <form @submit.prevent="handleDelete">
              <div class="icon-success bg-danger-transparent text-danger mb-2"><i class="ti ti-trash"></i></div>
              <h3 class="mb-2">Eliminar Rol</h3>
              <p class="fs-16 mb-3">¿Está seguro que desea eliminar este rol?</p>
              <div class="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                <button type="button" class="btn btn-md btn-secondary" data-bs-dismiss="modal">No, Cancelar</button>
                <button type="submit" class="btn btn-md btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting"><span class="spinner-border spinner-border-sm me-1"></span>Eliminando...</span>
                  <span v-else>Sí, Eliminar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { roleService } from '@/services/api.service';
import { Modal } from 'bootstrap';

export default {
  // Declarar eventos emitidos
  emits: ['roleSaved', 'deleteConfirmed'],

  props: {
    editMode: { type: Boolean, default: false },
    roleData: { type: Object, default: null },
  },
  data() {
    return {
      formData: { name: '', description: '', is_active: true },
      editFormData: { name: '', description: '', is_active: true },
      isSubmitting: false,
    };
  },
  watch: {
    roleData: {
      handler(newVal) {
        if (newVal && this.editMode) {
          this.editFormData = { ...newVal };
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    generateSlug(name) {
      return name
        .toLowerCase()
        .trim()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '_')
        .replace(/-+/g, '_');
    },
    async handleSubmit() {
      this.isSubmitting = true;
      try {
        // Generar slug automáticamente desde el nombre
        const slug = this.generateSlug(this.formData.name);
        const dataToSend = {
          ...this.formData,
          slug: slug
        };

        const response = await roleService.createRole(dataToSend);
        if (response.success) {
          // Cerrar modal primero
          const modalElement = document.getElementById('add-units');
          const modal = Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }

          // Limpiar después de un pequeño delay
          setTimeout(() => {
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
          }, 300);

          this.resetForm();
          this.$emit('roleSaved');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al crear rol';
        alert(errorMessage);
      } finally {
        this.isSubmitting = false;
      }
    },
    async handleUpdate() {
      this.isSubmitting = true;
      try {
        // Generar slug automáticamente si el nombre cambió
        const slug = this.generateSlug(this.editFormData.name);
        const dataToSend = {
          ...this.editFormData,
          slug: slug
        };

        const response = await roleService.updateRole(this.editFormData.id, dataToSend);
        if (response.success) {
          // Cerrar modal primero
          const modalElement = document.getElementById('edit_role');
          const modal = Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }

          // Limpiar después de un pequeño delay
          setTimeout(() => {
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
          }, 300);

          this.$emit('roleSaved');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al actualizar rol';
        alert(errorMessage);
      } finally {
        this.isSubmitting = false;
      }
    },
    async handleDelete() {
      this.isSubmitting = true;
      try {
        // Cerrar modal primero
        const modalElement = document.getElementById('delete_modal');
        const modal = Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }

        // Limpiar después de un pequeño delay
        setTimeout(() => {
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach(backdrop => backdrop.remove());
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        }, 300);

        this.$emit('deleteConfirmed');
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.formData = { name: '', description: '', is_active: true };
    },
  },
};
</script>