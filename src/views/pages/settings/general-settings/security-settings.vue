<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content settings-content">
      <div class="page-header settings-pg-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Configuración</h4>
            <h6>Administra tu configuración en el portal</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh"><i class="ti ti-refresh"></i></a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Collapse" id="collapse-header" @click="toggleHeader"><i class="ti ti-chevron-up"></i></a>
          </li>
        </ul>
      </div>
      <div class="row">
        <div class="col-xl-12">
            <div class="settings-wrapper d-flex">
            <settings-sidebar></settings-sidebar>
            <div class="card flex-fill mb-0">
              <div class="card-header">
                <h4 class="fs-18 fw-bold">Seguridad</h4>
              </div>
              <div class="card-body">
                <div>
                  <!-- Sección de Cambio de Contraseña -->
                  <div class="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <div class="d-flex align-items-center">
                      <span class="avatar avatar-lg border bg-light fs-24 me-2">
                        <i class="ti ti-lock text-gray-900 fs-18"></i>
                      </span>
                      <div>
                        <h5 class="fs-16 fw-medium mb-1">Contraseña</h5>
                        <p class="fs-16 mb-0">Última modificación: {{ formatDate(userInfo.updated_at || userInfo.created_at) }}</p>
                      </div>
                    </div>
                    <a href="javascript:void(0);" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#change-password">
                      <i class="ti ti-edit me-2"></i>Cambiar Contraseña
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   <div
      class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3"
    >
      <p class="mb-0 text-gray-9">
        {{ new Date().getFullYear() }} &copy; ProsperPOS. Todos los derechos reservados
      </p>
      <p>
        Diseñado &amp Desarrollado Por
        <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a>
      </p>
    </div>
  </div>
  <security-settings-modal></security-settings-modal>
</template>
<script>
import api from '@/api/config';

export default {
  data() {
    return {
      userInfo: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        updated_at: null,
        created_at: null
      },
      isLoading: false
    };
  },
  methods: {
    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },
    formatDate(dateString) {
      if (!dateString) return 'No disponible';

      try {
        const date = new Date(dateString);
        const options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        return date.toLocaleDateString('es-ES', options);
      } catch (error) {
        return 'No disponible';
      }
    },
    async loadUserInfo() {
      try {
        this.isLoading = true;

        const response = await api.get('/auth/me');

        if (response.data && response.data.success) {
          this.userInfo = {
            ...this.userInfo,
            ...response.data.data
          };
        }
      } catch (error) {
        console.error('Error al cargar información del usuario:', error);
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    this.loadUserInfo();
  }
};
</script>
