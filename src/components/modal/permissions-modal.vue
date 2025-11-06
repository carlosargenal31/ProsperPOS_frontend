<template>
  <!-- Modal de Gestión de Permisos -->
  <div class="modal fade" id="permissions_modal" tabindex="-1" aria-labelledby="permissionsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="permissionsModalLabel">
            <i class="ti ti-shield me-2"></i>
            Permisos del Rol: <strong>{{ roleData?.name || '' }}</strong>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center p-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando permisos...</span>
            </div>
            <p class="mt-2">Cargando permisos...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="alert alert-danger">
            <i class="ti ti-alert-circle me-2"></i>
            {{ error }}
          </div>

          <!-- Permissions Content -->
          <div v-else>
            <!-- Search and Select All -->
            <div class="row mb-3">
              <div class="col-md-6">
                <input
                  type="text"
                  class="form-control"
                  v-model="searchQuery"
                  placeholder="Buscar permisos..."
                >
              </div>
              <div class="col-md-6 text-end">
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm me-2"
                  @click="selectAll"
                >
                  <i class="ti ti-check-all me-1"></i>
                  Seleccionar Todos
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  @click="deselectAll"
                >
                  <i class="ti ti-x me-1"></i>
                  Deseleccionar Todos
                </button>
              </div>
            </div>

            <!-- Permissions by Module -->
            <div class="accordion" id="permissionsAccordion">
              <div
                v-for="(module, index) in filteredModules"
                :key="module.module"
                class="accordion-item"
              >
                <h2 class="accordion-header" :id="'heading' + index">
                  <button
                    class="accordion-button"
                    :class="{ collapsed: index !== 0 }"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="'#collapse' + index"
                    :aria-expanded="index === 0 ? 'true' : 'false'"
                    :aria-controls="'collapse' + index"
                  >
                    <i class="ti ti-folder me-2"></i>
                    <strong>{{ translateModuleName(module.module) }}</strong>
                    <span class="badge bg-primary ms-2">
                      {{ getSelectedCount(module.permissions) }} / {{ module.permissions.length }}
                    </span>
                  </button>
                </h2>
                <div
                  :id="'collapse' + index"
                  class="accordion-collapse collapse"
                  :class="{ show: index === 0 }"
                  :aria-labelledby="'heading' + index"
                  data-bs-parent="#permissionsAccordion"
                >
                  <div class="accordion-body">
                    <div class="row">
                      <div
                        v-for="permission in module.permissions"
                        :key="permission.id"
                        class="col-md-6 col-lg-4 mb-2"
                      >
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :id="'perm-' + permission.id"
                            :value="permission.id"
                            v-model="selectedPermissions"
                          >
                          <label class="form-check-label" :for="'perm-' + permission.id">
                            <strong>{{ translatePermissionName(permission.name) }}</strong>
                            <small class="d-block text-muted">{{ permission.description }}</small>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No permissions found -->
            <div v-if="filteredModules.length === 0" class="alert alert-info text-center">
              <i class="ti ti-info-circle me-2"></i>
              No se encontraron permisos que coincidan con tu búsqueda.
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <span class="me-auto text-muted">
            <strong>{{ selectedPermissions.length }}</strong> permisos seleccionados
          </span>
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
            @click="resetModal"
          >
            <i class="ti ti-x me-1"></i>
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="savePermissions"
            :disabled="isSaving"
          >
            <span v-if="isSaving">
              <span class="spinner-border spinner-border-sm me-1" role="status"></span>
              Guardando...
            </span>
            <span v-else>
              <i class="ti ti-check me-1"></i>
              Guardar Permisos
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { roleService } from '@/services/api.service';
import { Modal } from 'bootstrap';

export default {
  name: 'PermissionsModal',

  emits: ['permissionsSaved'],

  props: {
    roleData: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      loading: false,
      isSaving: false,
      error: null,
      modules: [],
      selectedPermissions: [],
      searchQuery: ''
    };
  },

  computed: {
    filteredModules() {
      if (!this.searchQuery) return this.modules;

      const query = this.searchQuery.toLowerCase();
      return this.modules.map(module => ({
        ...module,
        permissions: module.permissions.filter(perm =>
          perm.name.toLowerCase().includes(query) ||
          perm.description.toLowerCase().includes(query)
        )
      })).filter(module => module.permissions.length > 0);
    }
  },

  watch: {
    roleData: {
      handler(newVal) {
        if (newVal && newVal.id) {
          this.loadPermissions();
        }
      },
      immediate: true
    }
  },

  methods: {
    async loadPermissions() {
      if (!this.roleData || !this.roleData.id) return;

      this.loading = true;
      this.error = null;

      try {
        // Obtener módulos con permisos y cuáles están asignados al rol
        const response = await roleService.getModulesWithPermissions(this.roleData.id);

        if (response.success) {
          this.modules = response.data || [];

          // Preseleccionar permisos ya asignados
          this.selectedPermissions = [];
          this.modules.forEach(module => {
            module.permissions.forEach(perm => {
              if (perm.is_assigned) {
                this.selectedPermissions.push(perm.id);
              }
            });
          });
        }
      } catch (error) {
        console.error('Error al cargar permisos:', error);
        this.error = error.response?.data?.message || 'Error al cargar los permisos';
      } finally {
        this.loading = false;
      }
    },

    async savePermissions() {
      if (!this.roleData || !this.roleData.id) return;

      this.isSaving = true;
      this.error = null;

      try {
        const response = await roleService.assignPermissions(
          this.roleData.id,
          this.selectedPermissions
        );

        if (response.success) {
          // Cerrar modal primero
          const modalElement = document.getElementById('permissions_modal');
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

          this.$emit('permissionsSaved');
        }
      } catch (error) {
        console.error('Error al guardar permisos:', error);
        this.error = error.response?.data?.message || 'Error al guardar los permisos';
      } finally {
        this.isSaving = false;
      }
    },

    selectAll() {
      this.selectedPermissions = [];
      this.modules.forEach(module => {
        module.permissions.forEach(perm => {
          this.selectedPermissions.push(perm.id);
        });
      });
    },

    deselectAll() {
      this.selectedPermissions = [];
    },

    getSelectedCount(permissions) {
      return permissions.filter(perm =>
        this.selectedPermissions.includes(perm.id)
      ).length;
    },

    resetModal() {
      this.searchQuery = '';
      this.error = null;
    },

    translateModuleName(moduleName) {
      const translations = {
        'users': 'Usuarios',
        'roles': 'Roles',
        'permissions': 'Permisos',
        'products': 'Productos',
        'categories': 'Categorías',
        'brands': 'Marcas',
        'sales': 'Ventas',
        'purchases': 'Compras',
        'customers': 'Clientes',
        'suppliers': 'Proveedores',
        'stores': 'Tiendas',
        'inventory': 'Inventario',
        'reports': 'Reportes',
        'settings': 'Configuración',
        'dashboard': 'Panel de Control',
        'warehouses': 'Almacenes',
        'expenses': 'Gastos',
        'income': 'Ingresos',
        'transfers': 'Transferencias',
        'returns': 'Devoluciones',
        'quotations': 'Cotizaciones',
        'employees': 'Empleados',
        'payroll': 'Nómina',
        'attendances': 'Asistencias',
        'leaves': 'Permisos'
      };

      return translations[moduleName.toLowerCase()] || moduleName;
    },

    translatePermissionName(name) {
      // Traducciones de permisos
      const translations = {
        // CRUD operations
        'create': 'Crear',
        'read': 'Ver/Leer',
        'update': 'Actualizar',
        'delete': 'Eliminar',
        'view': 'Ver',
        'list': 'Listar',
        'manage': 'Gestionar',
        'assign_permissions': 'Asignar Permisos',
        'assign': 'Asignar',
        'export': 'Exportar',
        'import': 'Importar',
        'approve': 'Aprobar',
        'reject': 'Rechazar'
      };

      // Dividir por punto y traducir cada parte
      const parts = name.split('.');
      const translatedParts = parts.map(part => translations[part.toLowerCase()] || part);

      // Retornar solo la operación (no el módulo)
      return translatedParts.length > 1 ? translatedParts[1] : translatedParts[0];
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

.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
  color: #495057;
}

.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

.form-check-label {
  cursor: pointer;
}

.form-check-label small {
  font-size: 0.85rem;
}
</style>
