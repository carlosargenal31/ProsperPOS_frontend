<template>
  <!-- Change Password -->
  <div class="modal fade" id="change-password">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <div class="page-title">
            <h4>Cambiar Contraseña</h4>
          </div>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <!-- Mensajes de error/éxito -->
          <div v-if="passwordError" class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="ti ti-alert-circle me-2"></i>{{ passwordError }}
            <button type="button" class="btn-close" @click="passwordError = ''"></button>
          </div>
          <div v-if="passwordSuccess" class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="ti ti-check me-2"></i>{{ passwordSuccess }}
            <button type="button" class="btn-close" @click="passwordSuccess = ''"></button>
          </div>

          <div class="row">
            <div class="col-lg-12">
              <div class="input-blocks">
                <label class="fw-medium"
                  >Contraseña Actual <span class="text-danger">*</span></label
                >
                <div class="pass-group">
                  <input
                    v-model="passwordForm.currentPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    class="form-control settings-pass-input"
                    :disabled="isLoadingPassword"
                  />
                  <span
                    class="toggle-password"
                    :class="showCurrentPassword ? 'ti ti-eye' : 'ti ti-eye-off'"
                    @click="showCurrentPassword = !showCurrentPassword"
                    style="cursor: pointer;"
                  ></span>
                </div>
              </div>
            </div>
            <div class="col-lg-12">
              <div class="input-blocks">
                <label class="fw-medium"
                  >Nueva Contraseña <span class="text-danger">*</span></label
                >
                <div class="pass-group" id="passwordInput">
                  <input
                    v-model="passwordForm.newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    class="form-control settings-pass-inputs"
                    :disabled="isLoadingPassword"
                    @input="checkPasswordStrength"
                  />
                  <span
                    class="toggle-passwords"
                    :class="showNewPassword ? 'ti ti-eye' : 'ti ti-eye-off'"
                    @click="showNewPassword = !showNewPassword"
                    style="cursor: pointer;"
                  ></span>
                </div>
                <!-- Indicador de fuerza de contraseña -->
                <div v-if="passwordForm.newPassword" class="password-strength mt-2" id="passwordStrength">
                  <div class="d-flex gap-1 mb-2">
                    <span class="strength-bar" :class="passwordStrength >= 1 ? 'active-' + getStrengthClass() : ''"></span>
                    <span class="strength-bar" :class="passwordStrength >= 2 ? 'active-' + getStrengthClass() : ''"></span>
                    <span class="strength-bar" :class="passwordStrength >= 3 ? 'active-' + getStrengthClass() : ''"></span>
                    <span class="strength-bar" :class="passwordStrength >= 4 ? 'active-' + getStrengthClass() : ''"></span>
                  </div>
                  <p class="mb-2 text-sm" :class="'text-' + getStrengthClass()">
                    Seguridad: {{ getStrengthText() }}
                  </p>
                  <!-- Requisitos de contraseña -->
                  <div class="password-requirements">
                    <small class="d-block" :class="passwordForm.newPassword.length >= 6 ? 'text-success' : 'text-muted'">
                      <i :class="passwordForm.newPassword.length >= 6 ? 'ti ti-check' : 'ti ti-circle'"></i>
                      Mínimo 6 caracteres
                    </small>
                    <small class="d-block" :class="/[A-Z]/.test(passwordForm.newPassword) ? 'text-success' : 'text-muted'">
                      <i :class="/[A-Z]/.test(passwordForm.newPassword) ? 'ti ti-check' : 'ti ti-circle'"></i>
                      Al menos una letra mayúscula
                    </small>
                    <small class="d-block" :class="/[a-z]/.test(passwordForm.newPassword) ? 'text-success' : 'text-muted'">
                      <i :class="/[a-z]/.test(passwordForm.newPassword) ? 'ti ti-check' : 'ti ti-circle'"></i>
                      Al menos una letra minúscula
                    </small>
                    <small class="d-block" :class="/\d/.test(passwordForm.newPassword) ? 'text-success' : 'text-muted'">
                      <i :class="/\d/.test(passwordForm.newPassword) ? 'ti ti-check' : 'ti ti-circle'"></i>
                      Al menos un número
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-12">
              <div class="input-blocks mb-0">
                <label class="fw-medium"
                  >Confirmar Contraseña <span class="text-danger">*</span></label
                >
                <div class="pass-group">
                  <input
                    v-model="passwordForm.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-control settings-pass-inputa"
                    :disabled="isLoadingPassword"
                  />
                  <span
                    class="toggle-passworda"
                    :class="showConfirmPassword ? 'ti ti-eye' : 'ti ti-eye-off'"
                    @click="showConfirmPassword = !showConfirmPassword"
                    style="cursor: pointer;"
                  ></span>
                </div>
                <small v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="text-danger">
                  Las contraseñas no coinciden
                </small>
                <small v-else-if="passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword" class="text-success">
                  <i class="ti ti-check"></i> Las contraseñas coinciden
                </small>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary me-2"
            data-bs-dismiss="modal"
            :disabled="isLoadingPassword"
            @click="resetPasswordForm"
            >Cancelar</button
          >
          <button
            type="button"
            class="btn btn-primary"
            @click="handleChangePassword"
            :disabled="!isPasswordFormValid || isLoadingPassword"
          >
            <span v-if="isLoadingPassword" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoadingPassword ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- /Change Password -->
</template>

<script>
import api from '@/api/config';

export default {
  name: 'SecuritySettingsModal',
  data() {
    return {
      // Password Form
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      isLoadingPassword: false,
      passwordError: '',
      passwordSuccess: '',
      passwordStrength: 0
    };
  },
  computed: {
    isPasswordFormValid() {
      return (
        this.passwordForm.currentPassword.length > 0 &&
        this.passwordForm.newPassword.length >= 6 &&
        this.passwordForm.newPassword === this.passwordForm.confirmPassword
      );
    }
  },
  methods: {
    checkPasswordStrength() {
      const password = this.passwordForm.newPassword;
      let strength = 0;

      if (password.length >= 6) strength++;
      if (password.length >= 10) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[^a-zA-Z\d]/.test(password)) strength++;

      this.passwordStrength = Math.min(strength, 4);
    },
    getStrengthClass() {
      switch (this.passwordStrength) {
        case 1:
          return 'danger';
        case 2:
          return 'warning';
        case 3:
          return 'info';
        case 4:
          return 'success';
        default:
          return 'secondary';
      }
    },
    getStrengthText() {
      switch (this.passwordStrength) {
        case 1:
          return 'Muy débil';
        case 2:
          return 'Débil';
        case 3:
          return 'Buena';
        case 4:
          return 'Fuerte';
        default:
          return '';
      }
    },
    async handleChangePassword() {
      this.passwordError = '';
      this.passwordSuccess = '';

      // Validaciones
      if (!this.passwordForm.currentPassword) {
        this.passwordError = 'Por favor ingresa tu contraseña actual';
        return;
      }

      if (this.passwordForm.newPassword.length < 6) {
        this.passwordError = 'La nueva contraseña debe tener al menos 6 caracteres';
        return;
      }

      // Validar que contenga mayúscula, minúscula y número
      if (!/[A-Z]/.test(this.passwordForm.newPassword)) {
        this.passwordError = 'La contraseña debe contener al menos una letra mayúscula';
        return;
      }

      if (!/[a-z]/.test(this.passwordForm.newPassword)) {
        this.passwordError = 'La contraseña debe contener al menos una letra minúscula';
        return;
      }

      if (!/\d/.test(this.passwordForm.newPassword)) {
        this.passwordError = 'La contraseña debe contener al menos un número';
        return;
      }

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = 'Las contraseñas no coinciden';
        return;
      }

      if (this.passwordForm.currentPassword === this.passwordForm.newPassword) {
        this.passwordError = 'La nueva contraseña debe ser diferente a la actual';
        return;
      }

      try {
        this.isLoadingPassword = true;

        // Hacer la petición al backend usando el servicio de API configurado
        const response = await api.post(
          '/auth/change-password',
          {
            current_password: this.passwordForm.currentPassword,
            new_password: this.passwordForm.newPassword
          }
        );

        if (response.data && response.data.success) {
          this.passwordSuccess = 'Contraseña cambiada exitosamente';

          // Cerrar modal después de 2 segundos
          setTimeout(() => {
            const modalElement = document.getElementById('change-password');

            // Usar Bootstrap 5 para cerrar el modal correctamente
            const bsModal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            bsModal.hide();

            // Limpiar backdrop manualmente
            setTimeout(() => {
              const backdrop = document.querySelector('.modal-backdrop');
              if (backdrop) {
                backdrop.remove();
              }
              document.body.classList.remove('modal-open');
              document.body.style.overflow = '';
              document.body.style.paddingRight = '';

              // Limpiar formulario
              this.resetPasswordForm();
            }, 300);
          }, 2000);
        }
      } catch (error) {
        console.error('Error al cambiar contraseña:', error);

        if (error.response?.status === 400) {
          // Manejar errores de validación
          if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
            // Si hay múltiples errores de validación, mostrar el primero
            const firstError = error.response.data.errors[0];
            this.passwordError = firstError.message || 'Error de validación';
          } else if (error.response.data?.message) {
            this.passwordError = error.response.data.message;
          } else {
            this.passwordError = 'Datos inválidos. Por favor verifica tu información.';
          }
        } else if (error.response?.status === 401) {
          this.passwordError = 'Contraseña actual incorrecta';
        } else if (error.response?.data?.message) {
          this.passwordError = error.response.data.message;
        } else {
          this.passwordError = 'Error al cambiar la contraseña. Por favor intenta nuevamente.';
        }
      } finally {
        this.isLoadingPassword = false;
      }
    },
    resetPasswordForm() {
      this.passwordForm.currentPassword = '';
      this.passwordForm.newPassword = '';
      this.passwordForm.confirmPassword = '';
      this.showCurrentPassword = false;
      this.showNewPassword = false;
      this.showConfirmPassword = false;
      this.passwordError = '';
      this.passwordSuccess = '';
      this.passwordStrength = 0;
    }
  },
  mounted() {
    // Limpiar el formulario cuando se cierra el modal
    const modalElement = document.getElementById('change-password');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.resetPasswordForm();
      });
    }
  }
};
</script>

<style scoped>
.strength-bar {
  height: 4px;
  flex: 1;
  background-color: #e0e0e0;
  border-radius: 2px;
  transition: background-color 0.3s ease;
}

.strength-bar.active-danger {
  background-color: #dc3545;
}

.strength-bar.active-warning {
  background-color: #ffc107;
}

.strength-bar.active-info {
  background-color: #17a2b8;
}

.strength-bar.active-success {
  background-color: #28a745;
}

.text-sm {
  font-size: 0.875rem;
}

.password-requirements {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.password-requirements small {
  font-size: 0.8rem;
  line-height: 1.8;
  transition: color 0.2s ease;
}

.password-requirements i {
  font-size: 0.7rem;
  margin-right: 0.25rem;
}
</style>
