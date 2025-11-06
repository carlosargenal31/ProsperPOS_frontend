<!-- ===================================================================
     PROSPERPOS - MODAL DE USUARIOS (VERSIÓN CORREGIDA FINAL)
     =================================================================== -->

<template>
  <!-- Modal de Agregar/Editar Usuario -->
  <div class="modal fade" :id="editMode ? 'edit-user' : 'add-user'" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="userModalLabel">
            <i :class="editMode ? 'ti ti-edit' : 'ti ti-user-plus'" class="me-2"></i>
            {{ editMode ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" id="userForm">
            <div class="row">
              <!-- Nombre -->
              <div class="col-md-6 mb-3">
                <label class="form-label">
                  Nombre <span class="text-danger">*</span>
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.first_name" 
                  placeholder="Ingrese el nombre"
                  required 
                />
              </div>

              <!-- Apellido -->
              <div class="col-md-6 mb-3">
                <label class="form-label">
                  Apellido <span class="text-danger">*</span>
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.last_name" 
                  placeholder="Ingrese el apellido"
                  required 
                />
              </div>

              <!-- Email -->
              <div class="col-md-6 mb-3">
                <label class="form-label">
                  Correo Electrónico <span class="text-danger">*</span>
                </label>
                <input 
                  type="email" 
                  class="form-control" 
                  v-model="form.email" 
                  placeholder="usuario@ejemplo.com"
                  required 
                />
              </div>

              <!-- Teléfono -->
              <div class="col-md-6 mb-3">
                <label class="form-label">
                  Teléfono
                </label>
                <input 
                  type="tel" 
                  class="form-control" 
                  v-model="form.phone" 
                  placeholder="9999-9999"
                />
              </div>

              <!-- Rol -->
              <div class="col-md-6 mb-3">
                <label class="form-label">
                  Rol <span class="text-danger">*</span>
                </label>
                <select 
                  class="form-select" 
                  v-model="form.role_id" 
                  required
                >
                  <option value="">Seleccionar rol</option>
                  <option 
                    v-for="role in roles" 
                    :key="role.id" 
                    :value="role.id"
                  >
                    {{ role.name }}
                  </option>
                </select>
              </div>

              <!-- Tienda (opcional) -->
              <div class="col-md-6 mb-3">
                <label class="form-label">
                  Tienda
                </label>
                <select 
                  class="form-select" 
                  v-model="form.store_id"
                >
                  <option value="">Sin asignar</option>
                  <!-- Aquí puedes agregar las tiendas dinámicamente -->
                </select>
              </div>

              <!-- Contraseña (solo para nuevo usuario) -->
              <div class="col-md-6 mb-3" v-if="!editMode">
                <label class="form-label">
                  Contraseña <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control" 
                    v-model="form.password" 
                    placeholder="Mínimo 8 caracteres"
                    :required="!editMode"
                    minlength="8"
                  />
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    @click="showPassword = !showPassword"
                  >
                    <i :class="showPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
                  </button>
                </div>
                <small class="text-muted">La contraseña debe tener al menos 8 caracteres</small>
              </div>

              <!-- Confirmar Contraseña (solo para nuevo usuario) -->
              <div class="col-md-6 mb-3" v-if="!editMode">
                <label class="form-label">
                  Confirmar Contraseña <span class="text-danger">*</span>
                </label>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control" 
                  v-model="form.confirm_password" 
                  placeholder="Repetir contraseña"
                  :required="!editMode"
                />
              </div>

              <!-- Estado (solo para edición) -->
              <div class="col-md-6 mb-3" v-if="editMode">
                <label class="form-label">
                  Estado <span class="text-danger">*</span>
                </label>
                <select 
                  class="form-select" 
                  v-model="form.status"
                  required
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>
            </div>

            <!-- Mensaje de error -->
            <div v-if="formError" class="alert alert-danger alert-dismissible fade show" role="alert">
              <i class="ti ti-alert-circle me-2"></i>
              {{ formError }}
              <button type="button" class="btn-close" @click="formError = ''"></button>
            </div>

            <!-- Mensaje de validación de contraseñas -->
            <div v-if="!editMode && form.password && form.confirm_password && form.password !== form.confirm_password" class="alert alert-warning">
              <i class="ti ti-alert-triangle me-2"></i>
              Las contraseñas no coinciden
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            data-bs-dismiss="modal"
            @click="resetForm"
          >
            <i class="ti ti-x me-1"></i>
            Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleSubmit"
            :disabled="isSaving || (!editMode && form.password !== form.confirm_password)"
          >
            <span v-if="isSaving">
              <span class="spinner-border spinner-border-sm me-1" role="status"></span>
              Guardando...
            </span>
            <span v-else>
              <i class="ti ti-check me-1"></i>
              {{ editMode ? 'Actualizar' : 'Guardar' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userService } from '@/services/api.service';
import { Modal } from 'bootstrap';

export default {
  name: 'UsersListModal',
  
  // ✅ Declarar eventos emitidos
  emits: ['userSaved', 'deleteConfirmed'],
  
  props: {
    editMode: {
      type: Boolean,
      default: false
    },
    userData: {
      type: Object,
      default: null
    },
    roles: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role_id: '',
        store_id: '',
        password: '',
        confirm_password: '',
        status: 'active'
      },
      showPassword: false,
      isSaving: false,
      formError: ''
    };
  },
  
  watch: {
    userData: {
      immediate: true,
      handler(newVal) {
        if (newVal && this.editMode) {
          this.form = {
            first_name: newVal.first_name || '',
            last_name: newVal.last_name || '',
            email: newVal.email || '',
            phone: newVal.phone || '',
            role_id: newVal.role_id || '',
            store_id: newVal.store_id || '',
            status: newVal.status || 'active',
            password: '',
            confirm_password: ''
          };
        }
      }
    },
    
    editMode(newVal) {
      if (!newVal) {
        this.resetForm();
      }
    }
  },
  
  methods: {
    async handleSubmit() {
      // Validar contraseñas para nuevo usuario
      if (!this.editMode && this.form.password !== this.form.confirm_password) {
        this.formError = 'Las contraseñas no coinciden';
        return;
      }

      // Validar longitud de contraseña
      if (!this.editMode && this.form.password.length < 8) {
        this.formError = 'La contraseña debe tener al menos 8 caracteres';
        return;
      }

      this.isSaving = true;
      this.formError = '';

      try {
        let response;
        
        if (this.editMode) {
          // Actualizar usuario existente
          const updateData = {
            first_name: this.form.first_name,
            last_name: this.form.last_name,
            email: this.form.email,
            phone: this.form.phone,
            role_id: parseInt(this.form.role_id),
            store_id: this.form.store_id ? parseInt(this.form.store_id) : null,
            status: this.form.status
          };
          
          response = await userService.updateUser(this.userData.id, updateData);
        } else {
          // Crear nuevo usuario
          const newUserData = {
            first_name: this.form.first_name,
            last_name: this.form.last_name,
            email: this.form.email,
            phone: this.form.phone,
            role_id: parseInt(this.form.role_id),
            store_id: this.form.store_id ? parseInt(this.form.store_id) : null,
            password: this.form.password
          };
          
          response = await userService.createUser(newUserData);
        }

        if (response.success) {
          // Emitir evento de éxito
          this.$emit('userSaved');

          // Cerrar modal
          const modalElement = document.getElementById(this.editMode ? 'edit-user' : 'add-user');
          if (modalElement) {
            const modal = Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }

          // Resetear formulario
          this.resetForm();

          // Mostrar mensaje de éxito (opcional)
          console.log('Usuario guardado exitosamente');
        }
      } catch (error) {
        console.error('Error al guardar usuario:', error);
        this.formError = error.response?.data?.message || 'Error al guardar el usuario';
      } finally {
        this.isSaving = false;
      }
    },
    
    resetForm() {
      this.form = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role_id: '',
        store_id: '',
        password: '',
        confirm_password: '',
        status: 'active'
      };
      this.showPassword = false;
      this.formError = '';
    }
  }
};
</script>

<style scoped>
.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header .btn-close {
  filter: brightness(0) invert(1);
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.alert {
  border-radius: 0.5rem;
}
</style>