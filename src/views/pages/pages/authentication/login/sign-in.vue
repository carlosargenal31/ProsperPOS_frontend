<template>
  <div class="main-wrapper">
    <div class="account-content">
      <div class="login-wrapper bg-img">
        <div class="login-content authent-content">
          <form @submit.prevent="handleLogin">
            <div class="login-userset">
              <!-- Logo -->
              <div class="login-logo logo-normal">
                <img src="@/assets/img/logo.png" alt="ProsperPOS" />
              </div>
              <router-link to="/dashboard" class="login-logo logo-white">
                <img src="@/assets/img/logo-white.png" alt="ProsperPOS" />
              </router-link>

              <!-- Header -->
              <div class="login-userheading">
                <h3>Iniciar Sesión</h3>
                <h4 class="fs-16">
                  Acceda al panel de ProsperPOS con su usuario y contraseña
                </h4>
              </div>

              <!-- Mensaje de error global -->
              <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ errorMessage }}
                <button type="button" class="btn-close" @click="errorMessage = null"></button>
              </div>

              <!-- Mensaje de éxito -->
              <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                {{ successMessage }}
                <button type="button" class="btn-close" @click="successMessage = null"></button>
              </div>

              <!-- Campo de Email/Usuario -->
              <div class="mb-3">
                <label class="form-label">
                  Email o Usuario <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-user"></i>
                  </span>
                  <input
                    v-model="formData.email"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    placeholder="Ingrese su email o usuario"
                    autocomplete="username"
                    :disabled="loading"
                  />
                </div>
                <div v-if="errors.email" class="invalid-feedback d-block">
                  {{ errors.email }}
                </div>
              </div>

              <!-- Campo de Contraseña -->
              <div class="mb-3">
                <label class="form-label">
                  Contraseña <span class="text-danger">*</span>
                </label>
                <div class="pass-group">
                  <span class="input-group-text">
                    <i class="fas fa-lock"></i>
                  </span>
                  <input
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control pass-input"
                    :class="{ 'is-invalid': errors.password }"
                    placeholder="Ingrese su contraseña"
                    autocomplete="current-password"
                    :disabled="loading"
                  />
                  <span @click="togglePassword" class="toggle-password" style="cursor: pointer;">
                    <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                  </span>
                </div>
                <div v-if="errors.password" class="invalid-feedback d-block">
                  {{ errors.password }}
                </div>
              </div>

              <!-- Recordarme y Olvidé Contraseña -->
              <div class="form-login authentication-check">
                <div class="row">
                  <div class="col-12 d-flex align-items-center justify-content-between">
                    <div class="custom-control custom-checkbox">
                      <label class="checkboxs ps-4 mb-0 pb-0 line-height-1 fs-16 text-gray-6">
                        <input 
                          v-model="formData.remember_me" 
                          type="checkbox" 
                          class="form-control"
                          :disabled="loading"
                        />
                        <span class="checkmarks"></span>
                        Recordarme
                      </label>
                    </div>
                    <div class="text-end">
                      <router-link
                        class="text-orange fs-16 fw-medium"
                        to="/forgot-password"
                      >
                        ¿Olvidaste tu contraseña?
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botón de Login -->
              <div class="form-login">
                <button 
                  type="submit" 
                  class="btn btn-primary w-100"
                  :disabled="loading"
                >
                  <span v-if="loading">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Iniciando sesión...
                  </span>
                  <span v-else>
                    <i class="fas fa-sign-in-alt me-2"></i>
                    Iniciar Sesión
                  </span>
                </button>
              </div>

              <!-- Crear cuenta -->
              <div class="signinform" v-if="allowRegistration">
                <h4>
                  ¿Nuevo en nuestra plataforma?
                  <router-link to="/register" class="hover-a">
                    Crear una cuenta
                  </router-link>
                </h4>
              </div>

              <!-- Credenciales de desarrollo -->
              <div v-if="isDevelopment" class="alert alert-info mt-3">
                <strong>Modo Desarrollo:</strong><br>
                Email: <code>admin@prosperpos.com</code><br>
                Contraseña: <code>admin123</code>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'SignIn',

  setup() {
    const router = useRouter();

    // Estado reactivo
    const loading = ref(false);
    const showPassword = ref(false);
    const errorMessage = ref(null);
    const successMessage = ref(null);
    
    const formData = reactive({
      email: '',
      password: '',
      remember_me: false
    });

    const errors = reactive({
      email: null,
      password: null
    });

    // Computed properties
    const isDevelopment = computed(() => {
      return import.meta.env.MODE === 'development';
    });

    const allowRegistration = computed(() => {
      return import.meta.env.VITE_ALLOW_REGISTRATION === 'true';
    });

    // Configuración de axios
    const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Métodos
    const validateForm = () => {
      let isValid = true;
      errors.email = null;
      errors.password = null;
      errorMessage.value = null;

      // Validar email/usuario
      if (!formData.email || formData.email.trim() === '') {
        errors.email = 'Email o usuario es requerido';
        isValid = false;
      }

      // Validar contraseña
      if (!formData.password || formData.password.trim() === '') {
        errors.password = 'Contraseña es requerida';
        isValid = false;
      } else if (formData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
        isValid = false;
      }

      return isValid;
    };

    const handleLogin = async () => {
      // Validar formulario
      if (!validateForm()) {
        return;
      }

      loading.value = true;
      errorMessage.value = null;
      successMessage.value = null;

      try {
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
          remember_me: formData.remember_me
        });

        if (response.data.success) {
          const { token, user } = response.data.data;

          // Guardar token y datos del usuario
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('store_id', user.store_id);

          // Mostrar mensaje de éxito
          successMessage.value = 'Inicio de sesión exitoso. Redirigiendo...';

          // Redirigir al dashboard después de 1 segundo
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          errorMessage.value = response.data.message || 'Error al iniciar sesión';
        }

      } catch (error) {
        console.error('Login error:', error);

        // Manejar errores específicos
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message;

          switch (status) {
            case 401:
              errorMessage.value = 'Credenciales inválidas. Por favor verifica tu email y contraseña.';
              break;
            case 403:
              errorMessage.value = 'Tu cuenta ha sido desactivada. Contacta al administrador.';
              break;
            case 429:
              errorMessage.value = message || 'Demasiados intentos fallidos. Intenta más tarde.';
              break;
            case 400:
              // Mostrar errores de validación
              if (error.response.data?.errors) {
                const validationErrors = error.response.data.errors;
                validationErrors.forEach(err => {
                  if (err.field === 'email') {
                    errors.email = err.message;
                  } else if (err.field === 'password') {
                    errors.password = err.message;
                  }
                });
                errorMessage.value = 'Por favor corrige los errores en el formulario';
              } else {
                errorMessage.value = message || 'Datos inválidos';
              }
              break;
            default:
              errorMessage.value = message || 'Error al iniciar sesión. Intenta nuevamente.';
          }
        } else if (error.request) {
          errorMessage.value = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else {
          errorMessage.value = 'Error inesperado. Por favor intenta nuevamente.';
        }

      } finally {
        loading.value = false;
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    // Auto-llenar en desarrollo
    if (isDevelopment.value) {
      formData.email = 'admin@prosperpos.com';
      formData.password = 'admin123';
    }

    return {
      loading,
      showPassword,
      errorMessage,
      successMessage,
      formData,
      errors,
      isDevelopment,
      allowRegistration,
      handleLogin,
      togglePassword
    };
  }
};
</script>

<style scoped>
.pass-group {
  position: relative;
  display: flex;
}

.pass-group .input-group-text {
  border-right: 0;
  background: #fff;
}

.pass-group .form-control {
  border-left: 0;
  padding-right: 45px;
}

.toggle-password {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6c757d;
  z-index: 10;
}

.toggle-password:hover {
  color: #007bff;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.alert {
  border-radius: 8px;
}

.alert i {
  font-size: 1.1rem;
}

.input-group-text {
  min-width: 45px;
  justify-content: center;
}

.invalid-feedback {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.login-userheading h3 {
  color: #007bff;
  font-weight: 600;
  margin-bottom: 10px;
}

.login-userheading h4 {
  color: #6c757d;
}

code {
  background-color: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  color: #e83e8c;
}

/* Animación del botón de login */
.btn-primary {
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

/* Animación de entrada */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-userset {
  animation: fadeInUp 0.5s ease;
}
</style>