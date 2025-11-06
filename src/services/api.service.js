// ===================================================================
// PROSPERPOS - SERVICIO DE API
// ===================================================================

import axios from 'axios';

// Configuración base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// ===================================================================
// INTERCEPTORES
// ===================================================================

// Interceptor de request - agregar token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response - manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Error del servidor
      if (error.response.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else if (error.request) {
      // Error de red
      console.error('Error de red:', error.message);
    }
    return Promise.reject(error);
  }
);

// ===================================================================
// SERVICIO DE AUTENTICACIÓN
// ===================================================================

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/', { email, password });
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword
    });
    return response.data;
  }
};

// ===================================================================
// SERVICIO DE USUARIOS
// ===================================================================

export const userService = {
  async getUsers(params = {}) {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  async getUserById(id, params = {}) {
    const response = await apiClient.get(`/users/${id}`, { params });
    return response.data;
  },

  async createUser(userData) {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  async changeStatus(id, status) {
    const response = await apiClient.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  async changePassword(id, newPassword, confirmPassword) {
    const response = await apiClient.patch(`/users/${id}/password`, {
      new_password: newPassword,
      confirm_password: confirmPassword
    });
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/users/stats');
    return response.data;
  },

  async getMyProfile() {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  async updateMyProfile(userData) {
    const response = await apiClient.put('/users/me', userData);
    return response.data;
  }
};

// ===================================================================
// SERVICIO DE ROLES
// ===================================================================

export const roleService = {
  async getRoles(params = {}) {
    const response = await apiClient.get('/roles', { params });
    return response.data;
  },

  async getActiveRoles() {
    const response = await apiClient.get('/roles/active');
    return response.data;
  },

  async getRoleById(id, params = {}) {
    const response = await apiClient.get(`/roles/${id}`, { params });
    return response.data;
  },

  async createRole(roleData) {
    const response = await apiClient.post('/roles', roleData);
    return response.data;
  },

  async updateRole(id, roleData) {
    const response = await apiClient.put(`/roles/${id}`, roleData);
    return response.data;
  },

  async deleteRole(id) {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },

  async getRolePermissions(id) {
    const response = await apiClient.get(`/roles/${id}/permissions`);
    return response.data;
  },

  async assignPermissions(id, permissionIds) {
    const response = await apiClient.put(`/roles/${id}/permissions`, {
      permission_ids: permissionIds
    });
    return response.data;
  },

  async getModulesWithPermissions(id) {
    const response = await apiClient.get(`/roles/${id}/modules`);
    return response.data;
  },

  async getRoleUsers(id, params = {}) {
    const response = await apiClient.get(`/roles/${id}/users`, { params });
    return response.data;
  },

  async duplicateRole(id, newName, newSlug) {
    const response = await apiClient.post(`/roles/${id}/duplicate`, {
      name: newName,
      slug: newSlug
    });
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/roles/stats');
    return response.data;
  }
};

// ===================================================================
// SERVICIO DE PERMISOS
// ===================================================================

export const permissionService = {
  async getPermissions(params = {}) {
    const response = await apiClient.get('/permissions', { params });
    return response.data;
  },

  async getActivePermissions() {
    const response = await apiClient.get('/permissions/active');
    return response.data;
  },

  async getPermissionsGrouped() {
    const response = await apiClient.get('/permissions/grouped');
    return response.data;
  },

  async getModules() {
    const response = await apiClient.get('/permissions/modules');
    return response.data;
  },

  async getPermissionById(id, params = {}) {
    const response = await apiClient.get(`/permissions/${id}`, { params });
    return response.data;
  },

  async createPermission(permissionData) {
    const response = await apiClient.post('/permissions', permissionData);
    return response.data;
  },

  async updatePermission(id, permissionData) {
    const response = await apiClient.put(`/permissions/${id}`, permissionData);
    return response.data;
  },

  async deletePermission(id) {
    const response = await apiClient.delete(`/permissions/${id}`);
    return response.data;
  },

  async getPermissionRoles(id, params = {}) {
    const response = await apiClient.get(`/permissions/${id}/roles`, { params });
    return response.data;
  },

  async getPermissionsByModule(module) {
    const response = await apiClient.get(`/permissions/module/${module}`);
    return response.data;
  },

  async importPermissions(permissions) {
    const response = await apiClient.post('/permissions/import', { permissions });
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/permissions/stats');
    return response.data;
  }
};

// ===================================================================
// SERVICIO DE CATEGORÍAS
// ===================================================================

export const categoryService = {
  async getCategories(params = {}) {
    const response = await apiClient.get('/categories', { params });
    return response.data;
  },

  async getActiveCategories() {
    const response = await apiClient.get('/categories/active');
    return response.data;
  },

  async getCategoryById(id, params = {}) {
    const response = await apiClient.get(`/categories/${id}`, { params });
    return response.data;
  },

  async createCategory(categoryData) {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  },

  async updateCategory(id, categoryData) {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/categories/stats');
    return response.data;
  }
};

// ===================================================================
// SERVICIO DE SUBCATEGORÍAS
// ===================================================================

export const subcategoryService = {
  async getSubcategories(params = {}) {
    const response = await apiClient.get('/subcategories', { params });
    return response.data;
  },

  async getActiveSubcategories(categoryId = null) {
    const params = categoryId ? { category_id: categoryId } : {};
    const response = await apiClient.get('/subcategories/active', { params });
    return response.data;
  },

  async getSubcategoryById(id, params = {}) {
    const response = await apiClient.get(`/subcategories/${id}`, { params });
    return response.data;
  },

  async createSubcategory(subcategoryData) {
    const response = await apiClient.post('/subcategories', subcategoryData);
    return response.data;
  },

  async updateSubcategory(id, subcategoryData) {
    const response = await apiClient.put(`/subcategories/${id}`, subcategoryData);
    return response.data;
  },

  async deleteSubcategory(id) {
    const response = await apiClient.delete(`/subcategories/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/subcategories/stats');
    return response.data;
  }
};

// ===================================================================
// SERVICIO DE MARCAS
// ===================================================================

export const brandService = {
  async getBrands(params = {}) {
    const response = await apiClient.get('/brands', { params });
    return response.data;
  },

  async getActiveBrands() {
    const response = await apiClient.get('/brands/active');
    return response.data;
  },

  async getBrandById(id, params = {}) {
    const response = await apiClient.get(`/brands/${id}`, { params });
    return response.data;
  },

  async createBrand(brandData) {
    const response = await apiClient.post('/brands', brandData);
    return response.data;
  },

  async updateBrand(id, brandData) {
    const response = await apiClient.put(`/brands/${id}`, brandData);
    return response.data;
  },

  async deleteBrand(id) {
    const response = await apiClient.delete(`/brands/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/brands/stats');
    return response.data;
  }
};

// ===================================================================
// EXPORTAR API CLIENT
// ===================================================================

export default apiClient;