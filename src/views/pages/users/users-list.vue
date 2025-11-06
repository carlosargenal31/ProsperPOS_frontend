<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4 class="fw-bold">Usuarios</h4>
            <h6>Administra tus usuarios</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="PDF">
              <img src="@/assets/img/icons/pdf.svg" alt="img" />
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel">
              <img src="@/assets/img/icons/excel.svg" alt="img" />
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadUsers">
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Contraer" id="collapse-header" @click="toggleHeader">
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
        <div class="page-btn" v-if="canCreateUsers">
          <a href="#" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-user" @click="prepareAddUser">
            <i class="ti ti-circle-plus me-1"></i>Agregar Usuario
          </a>
        </div>
      </div>

      <div class="card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <div class="search-set">
            <div class="search-input">
              <a href="javascript:void(0);" class="btn-searchset">
                <i class="ti ti-search fs-14 feather-search"></i>
              </a>
              <input 
                type="search" 
                class="form-control form-control-sm" 
                placeholder="Buscar por nombre, email..." 
                v-model="searchQuery" 
                @input="handleSearch" 
              />
            </div>
          </div>
          <div class="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
            <div class="dropdown">
              <a href="javascript:void(0);" class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
                {{ selectedStatusLabel }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end p-3">
                <li>
                  <a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('active')">
                    <i class="ti ti-check-circle text-success me-2"></i>Activo
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('inactive')">
                    <i class="ti ti-x-circle text-danger me-2"></i>Inactivo
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('')">
                    <i class="ti ti-list me-2"></i>Todos
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="card-body p-0">
          <!-- Loading -->
          <div v-if="loading" class="text-center p-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando usuarios...</p>
          </div>
          
          <!-- Error -->
          <div v-else-if="error" class="alert alert-danger m-3">
            <i class="ti ti-alert-circle me-2"></i>
            {{ error }}
          </div>
          
          <!-- Tabla -->
          <div v-else class="table-responsive">
            <a-table 
              :columns="columns" 
              :data-source="users" 
              :row-selection="rowSelection" 
              :pagination="paginationConfig" 
              @change="handleTableChange" 
              class="table datatable thead-light"
              :loading="loading"
            >
              <template #bodyCell="{ column, record }">
                <!-- Nombre completo con avatar -->
                <template v-if="column.key === 'full_name'">
                  <div class="d-flex align-items-center">
                    <a href="javascript:void(0);" class="avatar avatar-md me-2">
                      <img 
                        :src="record.avatar || 'https://ui-avatars.com/api/?name=' + record.full_name + '&background=667eea&color=fff'" 
                        alt="usuario" 
                        class="rounded-circle"
                      />
                    </a>
                    <div>
                      <a href="javascript:void(0);" class="fw-semibold">{{ record.full_name }}</a>
                      <p class="text-muted small mb-0">{{ record.email }}</p>
                    </div>
                  </div>
                </template>
                
                <!-- Rol -->
                <template v-else-if="column.key === 'role'">
                  <span class="badge bg-info text-white">
                    {{ record.role_name || 'Sin rol' }}
                  </span>
                </template>
                
                <!-- Estado -->
                <template v-else-if="column.key === 'status'">
                  <span 
                    :class="[
                      'd-inline-flex align-items-center p-1 pe-2 rounded-1 text-white fs-10', 
                      record.status === 'active' ? 'bg-success' : 
                      record.status === 'suspended' ? 'bg-warning' : 'bg-danger'
                    ]"
                  >
                    <i class="ti ti-point-filled me-1 fs-11"></i>
                    {{ 
                      record.status === 'active' ? 'Activo' : 
                      record.status === 'suspended' ? 'Suspendido' : 'Inactivo' 
                    }}
                  </span>
                </template>
                
                <!-- Acciones -->
                <template v-else-if="column.key === 'action'">
                  <div class="action-table-data">
                    <div class="edit-delete-action">
                      <a
                        v-if="canViewUsers"
                        class="me-2 p-2 mb-0"
                        href="javascript:void(0);"
                        @click="viewUser(record)"
                        data-bs-toggle="tooltip"
                        title="Ver detalles"
                      >
                        <i data-feather="eye" class="action-eye"></i>
                      </a>
                      <a
                        v-if="canEditUsers"
                        class="me-2 p-2 mb-0"
                        href="javascript:void(0);"
                        @click="editUser(record)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-user"
                        title="Editar"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        v-if="canDeleteUsers"
                        class="p-2 mb-0 confirm-text"
                        href="javascript:void(0);"
                        @click="confirmDelete(record)"
                        title="Eliminar"
                      >
                        <i data-feather="trash-2" class="feather-trash-2"></i>
                      </a>
                    </div>
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
  
  <!-- Modal de Usuario -->
  <users-list-modal 
    :edit-mode="editMode" 
    :user-data="selectedUser" 
    :roles="activeRoles" 
    @userSaved="handleUserSaved"
  />

  <!-- Modal de Visualización de Usuario -->
  <div class="modal fade" id="view-user-modal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ti ti-user me-2"></i>Detalles del Usuario
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" v-if="selectedUser">
          <div class="row">
            <div class="col-12 mb-3 text-center">
              <div class="avatar avatar-xxl rounded-circle bg-primary-light mx-auto mb-2">
                <span class="fs-24 text-primary fw-semibold">
                  {{ selectedUser.first_name?.charAt(0) }}{{ selectedUser.last_name?.charAt(0) }}
                </span>
              </div>
              <h5>{{ selectedUser.full_name || selectedUser.first_name + ' ' + selectedUser.last_name }}</h5>
              <span class="badge" :class="{
                'bg-success': selectedUser.status === 'active',
                'bg-danger': selectedUser.status === 'inactive',
                'bg-warning': selectedUser.status === 'suspended'
              }">
                {{ selectedUser.status === 'active' ? 'Activo' : selectedUser.status === 'inactive' ? 'Inactivo' : 'Suspendido' }}
              </span>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label text-muted fw-semibold">Email</label>
              <p class="mb-0">{{ selectedUser.email }}</p>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label text-muted fw-semibold">Teléfono</label>
              <p class="mb-0">{{ selectedUser.phone || 'N/A' }}</p>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label text-muted fw-semibold">Rol</label>
              <p class="mb-0">{{ selectedUser.role_name || 'N/A' }}</p>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label text-muted fw-semibold">Tienda</label>
              <p class="mb-0">{{ selectedUser.store_name || 'N/A' }}</p>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label text-muted fw-semibold">Último login</label>
              <p class="mb-0">{{ selectedUser.last_login || 'Nunca' }}</p>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label text-muted fw-semibold">Fecha de creación</label>
              <p class="mb-0">{{ selectedUser.created_at || 'N/A' }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="ti ti-x me-1"></i>Cerrar
          </button>
          <button type="button" class="btn btn-primary" @click="editUser(selectedUser)" data-bs-dismiss="modal">
            <i class="ti ti-edit me-1"></i>Editar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Confirmación de Eliminación -->
  <div class="modal fade" id="delete-user-modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body text-center">
          <div class="avatar avatar-xl bg-danger-light rounded-circle mb-3 mx-auto">
            <i class="ti ti-trash fs-36 text-danger"></i>
          </div>
          <h5>¿Eliminar Usuario?</h5>
          <p class="text-muted">
            ¿Está seguro que desea eliminar a <strong>{{ userToDelete?.full_name }}</strong>?
            <br>Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="modal-footer justify-content-center border-0 pt-0">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="ti ti-x me-1"></i>Cancelar
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click="deleteUser"
            data-bs-dismiss="modal"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting">
              <span class="spinner-border spinner-border-sm me-1"></span>
              Eliminando...
            </span>
            <span v-else>
              <i class="ti ti-trash me-1"></i>Eliminar
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userService, roleService } from '@/services/api.service';
import feather from 'feather-icons';
import UsersListModal from '@/components/modal/users-list-modal.vue';
import { Modal } from 'bootstrap';
import { hasPermission } from '@/utils/permissions';

const columns = [
  { title: 'Usuario', dataIndex: 'full_name', key: 'full_name', sorter: true, width: 300 },
  { title: 'Teléfono', dataIndex: 'phone', sorter: false },
  { title: 'Rol', dataIndex: 'role_name', key: 'role', sorter: true },
  { title: 'Estado', dataIndex: 'status', key: 'status', sorter: true },
  { title: 'Acciones', key: 'action', sorter: false, width: 150 },
];

export default {
  name: 'UsersList',

  components: {
    UsersListModal
  },

  computed: {
    canCreateUsers() {
      return hasPermission('users.create');
    },
    canViewUsers() {
      return hasPermission('users.read') || hasPermission('users.view');
    },
    canEditUsers() {
      return hasPermission('users.update');
    },
    canDeleteUsers() {
      return hasPermission('users.delete');
    }
  },

  data() {
    return {
      users: [],
      activeRoles: [],
      columns,
      loading: false,
      isDeleting: false,
      error: null,
      searchQuery: '',
      selectedStatus: '',
      selectedStatusLabel: 'Estado',
      editMode: false,
      selectedUser: null,
      userToDelete: null,
      paginationConfig: { 
        current: 1, 
        pageSize: 10, 
        total: 0, 
        showSizeChanger: true, 
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} usuarios`
      },
      rowSelection: { 
        onChange: (selectedRowKeys, selectedRows) => {
          console.log('Filas seleccionadas:', selectedRows);
        }
      },
    };
  },
  
  mounted() {
    this.loadUsers();
    this.loadActiveRoles();
    this.$nextTick(() => {
      feather.replace();
      this.initTooltips();
    });
  },
  
  updated() {
    this.$nextTick(() => feather.replace());
  },
  
  methods: {
    async loadUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        const params = { 
          page: this.paginationConfig.current, 
          limit: this.paginationConfig.pageSize 
        };
        
        if (this.searchQuery) {
          params.search = this.searchQuery;
        }
        
        if (this.selectedStatus) {
          params.status = this.selectedStatus;
        }
        
        console.log('Cargando usuarios con params:', params);
        
        const response = await userService.getUsers(params);
        console.log('Respuesta completa del servidor:', response);
        
        if (response.success) {
          // ✅ Manejar la estructura de respuesta del backend
          // El backend devuelve: { success: true, data: { data: [...], pagination: {...} } }
          this.users = response.data.data || [];
          
          const pagination = response.data.pagination || {};
          this.paginationConfig.total = pagination.totalItems || 0;
          this.paginationConfig.current = pagination.currentPage || 1;
          
          console.log('Usuarios cargados:', this.users.length);
        } else {
          this.error = response.message || 'Error al cargar usuarios';
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        this.error = error.response?.data?.message || 'Error al cargar usuarios. Por favor, intente nuevamente.';
      } finally {
        this.loading = false;
      }
    },
    
    async loadActiveRoles() {
      try {
        console.log('Cargando roles activos...');
        const response = await roleService.getActiveRoles();
        console.log('Respuesta de roles:', response);
        
        if (response.success) {
          this.activeRoles = response.data || [];
          console.log('Roles cargados:', this.activeRoles.length);
        }
      } catch (error) {
        console.error('Error al cargar roles:', error);
        // No mostramos error al usuario para roles, solo en consola
      }
    },
    
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.paginationConfig.current = 1;
        this.loadUsers();
      }, 500);
    },
    
    filterByStatus(status) {
      this.selectedStatus = status;
      this.selectedStatusLabel = status === '' ? 'Estado' : 
                                 status === 'active' ? 'Activo' : 
                                 status === 'suspended' ? 'Suspendido' : 'Inactivo';
      this.paginationConfig.current = 1;
      this.loadUsers();
    },
    
    handleTableChange(pagination, filters, sorter) {
      console.log('Cambio en tabla:', { pagination, filters, sorter });
      this.paginationConfig.current = pagination.current;
      this.paginationConfig.pageSize = pagination.pageSize;
      this.loadUsers();
    },
    
    prepareAddUser() {
      this.editMode = false;
      this.selectedUser = null;
    },
    
    viewUser(user) {
      console.log('Ver detalles del usuario:', user);
      this.selectedUser = { ...user };

      // Abrir modal de visualización
      this.$nextTick(() => {
        const modalElement = document.getElementById('view-user-modal');
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
        }
      });
    },
    
    editUser(user) {
      console.log('Editar usuario:', user);
      this.editMode = true;
      this.selectedUser = { ...user };

      // Abrir modal de edición
      this.$nextTick(() => {
        const modalElement = document.getElementById('edit-user');
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
        }
      });
    },
    
    confirmDelete(user) {
      this.userToDelete = user;
      const modalElement = document.getElementById('delete-user-modal');
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    },
    
    async deleteUser() {
      if (!this.userToDelete) return;
      
      this.isDeleting = true;
      
      try {
        const response = await userService.deleteUser(this.userToDelete.id);
        
        if (response.success) {
          console.log('Usuario eliminado exitosamente');
          this.loadUsers();
          this.userToDelete = null;
          
          // Mostrar notificación de éxito (opcional)
          this.showNotification('Usuario eliminado exitosamente', 'success');
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        this.showNotification(
          error.response?.data?.message || 'Error al eliminar el usuario', 
          'error'
        );
      } finally {
        this.isDeleting = false;
      }
    },
    
    handleUserSaved() {
      console.log('Usuario guardado, recargando lista...');
      this.editMode = false;
      this.selectedUser = null;
      this.loadUsers();
      this.showNotification('Usuario guardado exitosamente', 'success');
    },
    
    toggleHeader() {
      document.getElementById('collapse-header')?.classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    },
    
    initTooltips() {
  // ✅ Verificar que Bootstrap esté disponible
  if (typeof window.bootstrap === 'undefined') {
    console.warn('Bootstrap no está disponible todavía, saltando tooltips');
    return;
  }

  try {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    
    // ✅ Usar forEach en lugar de map
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  } catch (error) {
    console.error('Error inicializando tooltips:', error);
  }
},
    
    showNotification(message, type = 'success') {
      // Implementar sistema de notificaciones toast
      console.log(`[${type.toUpperCase()}]: ${message}`);
      // Aquí puedes integrar una librería de notificaciones como vue-toastification
    }
  },
};
</script>

<style scoped>
.search-input input {
  border-radius: 20px;
}

.avatar img {
  object-fit: cover;
}

.action-table-data a {
  transition: all 0.3s ease;
}

.action-table-data a:hover {
  transform: scale(1.1);
}

.badge {
  padding: 0.375rem 0.75rem;
  font-weight: 500;
}

.spinner-border {
  vertical-align: middle;
}
</style>