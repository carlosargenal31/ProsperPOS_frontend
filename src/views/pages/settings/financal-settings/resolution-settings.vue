<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content settings-content">
      <div class="page-header settings-pg-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Ajustes</h4>
            <h6>Administra las resoluciones de facturación</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="loadResolutions" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
              ><i class="ti ti-refresh"></i
            ></a>
          </li>
          <li>
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Colapsar"
              id="collapse-header"
              @click="toggleHeader"
              ><i class="ti ti-chevron-up"></i
            ></a>
          </li>
        </ul>
      </div>
      <div class="row">
        <div class="col-xl-12">
          <div class="settings-wrapper d-flex">
            <settings-sidebar></settings-sidebar>
            <div class="card flex-fill mb-0">
              <div class="card-header d-flex align-items-center justify-content-between">
                <h4>Resoluciones de Facturación</h4>
                <div class="page-btn">
                  <a
                    href="#"
                    class="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add-resolution"
                    @click="openAddModal"
                    ><i class="ti ti-circle-plus me-1"></i>Agregar Nueva Resolución</a
                  >
                </div>
              </div>
              <div class="card-body">
                <!-- Loading -->
                <div v-if="loading" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                </div>

                <!-- Error -->
                <div v-else-if="error" class="alert alert-danger" role="alert">
                  {{ error }}
                </div>

                <!-- Table -->
                <div v-else class="table-responsive">
                  <table class="table border">
                    <thead class="thead-light">
                      <tr>
                        <th>Resolución</th>
                        <th>Prefijo</th>
                        <th>Inicio</th>
                        <th>Vence</th>
                        <th>Estatus</th>
                        <th class="no-sort text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="resolutions.length === 0">
                        <td colspan="6" class="text-center">No hay resoluciones registradas</td>
                      </tr>
                      <tr v-for="resolution in resolutions" :key="resolution.id">
                        <td>{{ resolution.numero_resolucion }}</td>
                        <td>{{ resolution.prefijo_control || '0' }}</td>
                        <td>{{ formatDateShort(resolution.fecha_inicio) }}</td>
                        <td>{{ formatDateShort(resolution.fecha_fin) }}</td>
                        <td>
                          <span :class="resolution.is_active ? 'badge bg-success' : 'badge bg-danger'">
                            {{ resolution.is_active ? 'ACTIVO' : 'INACTIVO' }}
                          </span>
                        </td>
                        <td class="action-table-data justify-content-end">
                          <div class="edit-delete-action">
                            <a
                              class="me-2 p-2"
                              href="#"
                              @click.prevent="openViewModal(resolution)"
                              data-bs-toggle="modal"
                              data-bs-target="#view-resolution"
                            >
                              <i data-feather="eye" class="feather-eye"></i>
                            </a>
                            <a
                              class="me-2 p-2"
                              href="#"
                              @click.prevent="openEditModal(resolution)"
                              data-bs-toggle="modal"
                              data-bs-target="#edit-resolution"
                            >
                              <i data-feather="edit" class="feather-edit"></i>
                            </a>
                            <a
                              class="confirm-text p-2"
                              href="#"
                              @click.prevent="openDeleteModal(resolution)"
                              data-bs-toggle="modal"
                              data-bs-target="#delete-modal"
                            >
                              <i data-feather="trash-2" class="feather-trash-2"></i>
                            </a>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
  <resolution-settings-modal
    :resolution="selectedResolution"
    :is-edit="isEditMode"
    @resolution-saved="onResolutionSaved"
    @resolution-deleted="onResolutionDeleted"
  ></resolution-settings-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import ResolutionSettingsModal from '@/components/modal/resolution-settings-modal.vue';

export default {
  components: {
    ResolutionSettingsModal
  },
  data() {
    return {
      resolutions: [],
      selectedResolution: null,
      isEditMode: false,
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadResolutions();
  },
  methods: {
    async loadResolutions() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/resolutions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // La respuesta viene en response.data.data
        this.resolutions = response.data.data || response.data || [];
      } catch (error) {
        console.error('Error loading resolutions:', error);
        this.error = 'Error al cargar las resoluciones';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedResolution = null;
      this.isEditMode = false;
    },

    openViewModal(resolution) {
      this.selectedResolution = { ...resolution };
      this.isEditMode = false;
    },

    openEditModal(resolution) {
      this.selectedResolution = { ...resolution };
      this.isEditMode = true;
    },

    openDeleteModal(resolution) {
      this.selectedResolution = resolution;
    },

    onResolutionSaved() {
      this.loadResolutions();
    },

    onResolutionDeleted() {
      this.loadResolutions();
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    formatDateShort(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      // Ajustar por zona horaria
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    },

    getDocumentTypes(resolution) {
      if (!resolution.tipos_documento) return [];
      try {
        const types = typeof resolution.tipos_documento === 'string'
          ? JSON.parse(resolution.tipos_documento)
          : resolution.tipos_documento;
        return Array.isArray(types) ? types : [];
      } catch {
        return [];
      }
    },

    getDocumentTypesString(resolution) {
      const types = this.getDocumentTypes(resolution);
      if (types.length === 0) return '';

      // Mostrar solo el primero o los primeros dos separados por coma
      if (types.length === 1) {
        return types[0];
      } else if (types.length === 2) {
        return types.join(', ');
      } else {
        return `${types[0]}, ${types[1]}`;
      }
    },

    getVigenciaText(resolution) {
      const hoy = new Date();
      const inicio = new Date(resolution.fecha_aprobacion);
      const fin = new Date(resolution.fecha_vencimiento);

      hoy.setHours(0, 0, 0, 0);
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(0, 0, 0, 0);

      if (hoy < inicio) return 'Por iniciar';
      if (hoy > fin) return 'Vencida';
      return 'Vigente';
    },

    getVigenciaClass(resolution) {
      const text = this.getVigenciaText(resolution);
      if (text === 'Vigente') return 'badge bg-success-light';
      if (text === 'Por iniciar') return 'badge bg-warning-light';
      return 'badge bg-danger-light';
    }
  },
};
</script>

<style scoped>
.bg-success-light {
  background-color: #d4edda;
  color: #155724;
}

.bg-warning-light {
  background-color: #fff3cd;
  color: #856404;
}

.bg-danger-light {
  background-color: #f8d7da;
  color: #721c24;
}

.table td small {
  font-size: 0.75rem;
}
</style>
