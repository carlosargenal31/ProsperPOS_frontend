<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Roles y Permisos</h4>
            <h6>Administra tus roles</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="PDF"><img src="@/assets/img/icons/pdf.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel"><img src="@/assets/img/icons/excel.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadRoles"><i class="ti ti-refresh"></i></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Contraer" id="collapse-header" @click="toggleHeader"><i class="ti ti-chevron-up"></i></a></li>
        </ul>
        <div class="page-btn" v-if="canCreateRoles">
          <a href="#" class="btn btn-primary btn-md d-inline-flex align-items-center" data-bs-toggle="modal" data-bs-target="#add-units" @click="prepareAddRole">
            <i class="ti ti-circle-plus me-1"></i>Agregar Rol
          </a>
        </div>
      </div>
      <div class="card table-list-card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <div class="search-set">
            <div class="search-input">
              <a href="javascript:void(0);" class="btn-searchset"><i class="ti ti-search fs-14 feather-search"></i></a>
              <input type="search" class="form-control form-control-sm" placeholder="Buscar" v-model="searchQuery" @input="handleSearch" />
            </div>
          </div>
          <div class="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
            <div class="dropdown me-2">
              <a href="javascript:void(0);" class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">{{ selectedStatusLabel }}</a>
              <ul class="dropdown-menu dropdown-menu-end p-3">
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus(true)">Activo</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus(false)">Inactivo</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus(null)">Todos</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div v-if="loading" class="text-center p-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>
          <div v-else-if="error" class="alert alert-danger m-3">{{ error }}</div>
          <div v-else class="custom-datatable-filter table-responsive">
            <a-table class="table datatable thead-light" :columns="columns" :data-source="roles" :row-selection="rowSelection" :pagination="paginationConfig" @change="handleTableChange">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'"><div>{{ record.name }}</div></template>
                <template v-else-if="column.key === 'created_at'"><div>{{ formatDate(record.created_at) }}</div></template>
                <template v-else-if="column.key === 'is_active'">
                  <span :class="['badge d-inline-flex align-items-center badge-xs', record.is_active ? 'badge-success' : 'badge-danger']">
                    <i class="ti ti-point-filled me-1"></i>{{ record.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </template>
                <template v-else-if="column.key === 'action'">
                  <div class="action-icon d-inline-flex">
                    <a v-if="canManagePermissions" href="#" class="me-2 d-flex align-items-center p-2 border rounded" data-bs-toggle="modal" data-bs-target="#permissions_modal" @click="managePermissions(record)" title="Gestionar Permisos"><i class="ti ti-shield"></i></a>
                    <a v-if="canEditRoles" href="#" class="me-2 d-flex align-items-center p-2 border rounded" data-bs-toggle="modal" data-bs-target="#edit_role" @click="editRole(record)" title="Editar"><i class="ti ti-edit"></i></a>
                    <a v-if="canDeleteRoles" href="#" data-bs-toggle="modal" data-bs-target="#delete_modal" class="d-flex align-items-center p-2 border rounded" @click="confirmDelete(record)" title="Eliminar"><i class="ti ti-trash"></i></a>
                  </div>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </div>
    <div class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
      <p class="mb-0 text-gray-9">{{ new Date().getFullYear() }} &copy; ProsperPOS. Todos los derechos reservados</p>
      <p>Diseñado &amp; Desarrollado Por <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a></p>
    </div>
  </div>
  <roles-permissions-modal :edit-mode="editMode" :role-data="selectedRole" @role-saved="handleRoleSaved" @delete-confirmed="deleteRole"></roles-permissions-modal>
  <permissions-modal :role-data="selectedRoleForPermissions" @permissions-saved="handlePermissionsSaved"></permissions-modal>
</template>

<script>
import { roleService } from '@/services/api.service';
import PermissionsModal from '@/components/modal/permissions-modal.vue';
import { hasPermission } from '@/utils/permissions';

const columns = [
  { title: 'Rol', dataIndex: 'name', key: 'name', sorter: true },
  { title: 'Fecha de Creación', dataIndex: 'created_at', key: 'created_at', sorter: true },
  { title: 'Estado', dataIndex: 'is_active', key: 'is_active', sorter: true },
  { title: '', key: 'action', sorter: false },
];

export default {
  components: {
    PermissionsModal
  },
  computed: {
    canCreateRoles() {
      return hasPermission('roles.create');
    },
    canEditRoles() {
      return hasPermission('roles.update');
    },
    canDeleteRoles() {
      return hasPermission('roles.delete');
    },
    canManagePermissions() {
      return hasPermission('roles.assign_permissions') || hasPermission('roles.update');
    }
  },
  data() {
    return {
      roles: [],
      columns,
      loading: false,
      error: null,
      searchQuery: '',
      selectedStatus: null,
      selectedStatusLabel: 'Estado',
      editMode: false,
      selectedRole: null,
      roleToDelete: null,
      selectedRoleForPermissions: null,
      paginationConfig: { current: 1, pageSize: 10, total: 0, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] },
      rowSelection: { onChange: () => {}, onSelect: () => {}, onSelectAll: () => {} },
    };
  },
  mounted() {
    this.loadRoles();
  },
  methods: {
    async loadRoles() {
      this.loading = true;
      this.error = null;
      try {
        const params = { page: this.paginationConfig.current, limit: this.paginationConfig.pageSize };
        if (this.searchQuery) params.search = this.searchQuery;
        if (this.selectedStatus !== null) params.is_active = this.selectedStatus;
        const response = await roleService.getRoles(params);
        if (response.success) {
          // La estructura de respuesta es: { success, message, data: { data, pagination } }
          this.roles = response.data.data || response.data.roles || [];
          this.paginationConfig.total = response.data.pagination?.totalItems || response.data.pagination?.total || 0;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar roles';
        console.error('Error al cargar roles:', error);
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.paginationConfig.current = 1;
        this.loadRoles();
      }, 500);
    },
    filterByStatus(status) {
      this.selectedStatus = status;
      this.selectedStatusLabel = status === null ? 'Estado' : (status ? 'Activo' : 'Inactivo');
      this.paginationConfig.current = 1;
      this.loadRoles();
    },
    handleTableChange(pagination) {
      this.paginationConfig.current = pagination.current;
      this.paginationConfig.pageSize = pagination.pageSize;
      this.loadRoles();
    },
    prepareAddRole() {
      // Limpiar cualquier backdrop residual antes de abrir
      this.cleanupModals();
      this.editMode = false;
      this.selectedRole = null;
    },
    editRole(role) {
      // Limpiar cualquier backdrop residual antes de abrir
      this.cleanupModals();
      this.editMode = true;
      this.selectedRole = { ...role };
    },
    managePermissions(role) {
      this.selectedRoleForPermissions = { ...role };
    },
    confirmDelete(role) {
      this.roleToDelete = role;
    },
    async deleteRole() {
      if (!this.roleToDelete) return;
      try {
        const response = await roleService.deleteRole(this.roleToDelete.id);
        if (response.success) this.loadRoles();
      } catch (error) {
        console.error('Error al eliminar rol:', error);
      }
    },
    handleRoleSaved() {
      this.editMode = false;
      this.selectedRole = null;
      this.loadRoles();
    },
    handlePermissionsSaved() {
      this.selectedRoleForPermissions = null;
      this.loadRoles();
    },
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('es-HN', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    toggleHeader() {
      document.getElementById('collapse-header').classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    },
    cleanupModals() {
      // Remover todos los backdrops residuales
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());

      // Asegurar que el body no tenga clases de modal
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    },
  },
  beforeUnmount() {
    // Limpiar al desmontar el componente
    this.cleanupModals();
  },
};
</script>