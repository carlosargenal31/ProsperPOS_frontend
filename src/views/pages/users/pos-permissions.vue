<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Permisos</h4>
            <h6>Administra los permisos del rol</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="PDF"><img src="@/assets/img/icons/pdf.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel"><img src="@/assets/img/icons/excel.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadData"><i class="ti ti-refresh"></i></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Contraer" id="collapse-header" @click="toggleHeader"><i class="ti ti-chevron-up"></i></a></li>
          <li>
            <div class="page-btn">
              <router-link to="/users/roles-permissions" class="btn btn-primary">
                <i data-feather="arrow-left" class="me-2"></i> Volver a Roles
              </router-link>
            </div>
          </li>
        </ul>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="table-top mb-0">
            <div class="search-set">
              <div class="search-input">
                <a href="javascript:void(0);" class="btn-searchset"><i class="ti ti-search fs-14 feather-search"></i></a>
                <input type="search" class="form-control form-control-sm" placeholder="Buscar" v-model="searchQuery" />
              </div>
            </div>
            <div class="d-flex align-items-center">
              <p class="mb-0 fw-medium text-gray-9 me-1">Rol:</p>
              <p>{{ currentRole?.role_name || 'Cargando...' }}</p>
            </div>
          </div>
        </div>
        <div class="card-body p-0">
          <div v-if="loading" class="text-center p-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>
          <div v-else-if="error" class="alert alert-danger m-3">{{ error }}</div>
          <div v-else class="table-responsive">
            <table class="table datatable">
              <thead class="thead-light">
                <tr>
                  <th class="no-sort">Módulos</th>
                  <th>Permitir Todo</th>
                  <th>Leer</th>
                  <th>Escribir</th>
                  <th>Crear</th>
                  <th>Eliminar</th>
                  <th>Importar</th>
                  <th>Exportar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="module in filteredModules" :key="module.name">
                  <td class="text-gray-9">{{ module.display_name }}</td>
                  <td class="py-3">
                    <div class="form-check form-check-md">
                      <input class="form-check-input" type="checkbox" @change="toggleAll(module)" :checked="isAllChecked(module)" />
                    </div>
                  </td>
                  <td class="py-3" v-for="action in actions" :key="action">
                    <div class="form-check form-check-md">
                      <input class="form-check-input" type="checkbox" :checked="hasPermission(module.name, action)" @change="togglePermission(module.name, action)" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer text-end">
          <button type="button" class="btn btn-secondary me-2" @click="$router.push('/users/roles-permissions')">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="savePermissions" :disabled="isSaving">
            <span v-if="isSaving"><span class="spinner-border spinner-border-sm me-1"></span>Guardando...</span>
            <span v-else>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>
    <div class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
      <p class="mb-0 text-gray-9">{{ new Date().getFullYear() }} &copy; ProsperPOS. Todos los derechos reservados</p>
      <p>Diseñado &amp; Desarrollado Por <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a></p>
    </div>
  </div>
</template>

<script>
import { roleService } from '@/services/api.service';
import feather from 'feather-icons';

export default {
  data() {
    return {
      currentRole: null,
      modules: [],
      selectedPermissions: [],
      actions: ['read', 'write', 'create', 'delete', 'import', 'export'],
      loading: false,
      isSaving: false,
      error: null,
      searchQuery: '',
    };
  },
  computed: {
    filteredModules() {
      if (!this.searchQuery) return this.modules;
      const query = this.searchQuery.toLowerCase();
      return this.modules.filter(m => m.display_name.toLowerCase().includes(query));
    },
  },
  mounted() {
    this.loadData();
    this.$nextTick(() => feather.replace());
  },
  methods: {
    async loadData() {
      const roleId = this.$route.params.roleId;
      if (!roleId) {
        this.$router.push('/users/roles-permissions');
        return;
      }
      this.loading = true;
      try {
        const [roleResponse, modulesResponse] = await Promise.all([
          roleService.getRoleById(roleId),
          roleService.getModulesWithPermissions(roleId)
        ]);
        if (roleResponse.success) this.currentRole = roleResponse.data;
        if (modulesResponse.success) {
          this.modules = modulesResponse.data.modules || [];
          this.selectedPermissions = modulesResponse.data.assigned_permissions || [];
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar datos';
      } finally {
        this.loading = false;
      }
    },
    hasPermission(moduleName, action) {
      const permissionKey = `${moduleName}.${action}`;
      return this.selectedPermissions.includes(permissionKey);
    },
    togglePermission(moduleName, action) {
      const permissionKey = `${moduleName}.${action}`;
      const index = this.selectedPermissions.indexOf(permissionKey);
      if (index > -1) {
        this.selectedPermissions.splice(index, 1);
      } else {
        this.selectedPermissions.push(permissionKey);
      }
    },
    isAllChecked(module) {
      return this.actions.every(action => this.hasPermission(module.name, action));
    },
    toggleAll(module) {
      const allChecked = this.isAllChecked(module);
      this.actions.forEach(action => {
        const permissionKey = `${module.name}.${action}`;
        const index = this.selectedPermissions.indexOf(permissionKey);
        if (allChecked && index > -1) {
          this.selectedPermissions.splice(index, 1);
        } else if (!allChecked && index === -1) {
          this.selectedPermissions.push(permissionKey);
        }
      });
    },
    async savePermissions() {
      this.isSaving = true;
      try {
        const response = await roleService.assignPermissions(this.currentRole.id, this.selectedPermissions);
        if (response.success) {
          alert('Permisos guardados correctamente');
          this.$router.push('/users/roles-permissions');
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Error al guardar permisos');
      } finally {
        this.isSaving = false;
      }
    },
    toggleHeader() {
      document.getElementById('collapse-header').classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    },
  },
};
</script>