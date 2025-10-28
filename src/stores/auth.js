// src/stores/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    userRoles: (state) => state.user?.roles || [],
    userPermissions: (state) => state.user?.permissions || [],
    hasPermission: (state) => (permission) => {
      return state.user?.permissions?.includes(permission) || false;
    },
    hasRole: (state) => (role) => {
      return state.user?.roles?.includes(role) || false;
    },
  },

  actions: {
    // Inicializar desde localStorage
    initialize() {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token && user) {
        this.accessToken = token;
        this.user = JSON.parse(user);
        this.refreshToken = refreshToken;
        this.isAuthenticated = true;
        
        // Configurar header de autorización
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    },

    // Login
    async login(username, password, rememberMe = false) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          username,
          password,
        });

        if (response.data.success) {
          const { user, accessToken, refreshToken } = response.data.data;

          // Guardar en el store
          this.user = user;
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;
          this.isAuthenticated = true;

          // Guardar en localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('user', JSON.stringify(user));

          if (rememberMe) {
            localStorage.setItem('refreshToken', refreshToken);
          }

          // Configurar axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          return { success: true, user };
        } else {
          throw new Error(response.data.message || 'Error al iniciar sesión');
        }
      } catch (error) {
        this.error = this.handleError(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Logout
    async logout() {
      this.loading = true;

      try {
        // Llamar al endpoint de logout
        await axios.post(`${API_BASE_URL}/auth/logout`, {
          refreshToken: this.refreshToken,
        });
      } catch (error) {
        console.error('Error en logout:', error);
      } finally {
        // Limpiar estado
        this.clearAuth();
        this.loading = false;
      }
    },

    // Refresh token
    async refreshAccessToken() {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        this.clearAuth();
        throw new Error('No hay refresh token');
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        if (response.data.success) {
          const { accessToken } = response.data.data;
          
          this.accessToken = accessToken;
          localStorage.setItem('accessToken', accessToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          return accessToken;
        }
      } catch (error) {
        this.clearAuth();
        throw error;
      }
    },

    // Obtener información del usuario actual
    async fetchCurrentUser() {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`);
        
        if (response.data.success) {
          this.user = response.data.data;
          localStorage.setItem('user', JSON.stringify(this.user));
          return this.user;
        }
      } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        throw error;
      }
    },

    // Cambiar contraseña
    async changePassword(currentPassword, newPassword, confirmPassword) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/change-password`, {
          currentPassword,
          newPassword,
          confirmPassword,
        });

        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    },

    // Limpiar autenticación
    clearAuth() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      delete axios.defaults.headers.common['Authorization'];
    },

    // Manejar errores
    handleError(error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Error desconocido';

        switch (status) {
          case 401:
            return 'Credenciales inválidas';
          case 403:
            return 'Cuenta inactiva o suspendida';
          case 429:
            return 'Demasiados intentos. Espera unos minutos';
          default:
            return message;
        }
      } else if (error.request) {
        return 'No se pudo conectar con el servidor';
      } else {
        return error.message || 'Error inesperado';
      }
    },
  },
});