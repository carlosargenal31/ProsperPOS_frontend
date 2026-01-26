<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Arqueo de Caja</h4>
            <h6>Gestión completa de apertura, cierre y control de caja</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadSessions">
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Colapsar" id="collapse-header" @click="toggleHeader">
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
      </div>

      <!-- Estadísticas -->
      <div class="row mb-4" v-if="stats">
        <div class="col-md-3">
          <div class="card bg-success-light">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <p class="text-muted mb-1">Cajas Abiertas</p>
                  <h3 class="mb-0">{{ stats.open_sessions || 0 }}</h3>
                </div>
                <div class="avatar avatar-lg bg-success">
                  <i class="ti ti-lock-open fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-primary-light">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <p class="text-muted mb-1">Total Efectivo</p>
                  <h3 class="mb-0">L {{ formatCurrency(stats.total_cash) }}</h3>
                </div>
                <div class="avatar avatar-lg bg-primary">
                  <i class="ti ti-cash fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info-light">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <p class="text-muted mb-1">Total Tarjeta</p>
                  <h3 class="mb-0">L {{ formatCurrency(stats.total_card) }}</h3>
                </div>
                <div class="avatar avatar-lg bg-info">
                  <i class="ti ti-credit-card fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning-light">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <p class="text-muted mb-1">Diferencia Total</p>
                  <h3 class="mb-0 text-danger">L {{ formatCurrency(stats.total_difference) }}</h3>
                </div>
                <div class="avatar avatar-lg bg-warning">
                  <i class="ti ti-calculator fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de arqueos -->
      <div class="card table-list-card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <div class="search-set">
            <div class="search-input">
              <a href="javascript:void(0);" class="btn-searchset">
                <i class="ti ti-search fs-14 feather-search"></i>
              </a>
              <input type="search" class="form-control form-control-sm" placeholder="Buscar..." v-model="searchQuery" @input="onSearch" />
            </div>
          </div>
          <div class="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
            <div class="dropdown">
              <a href="javascript:void(0);" class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
                {{ getSelectedStatusText() }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end p-3">
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('')">Todos</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('ABIERTA')">Abiertas</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('CERRADA')">Cerradas</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('REVISADO')">Revisadas</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('CANCELADA')">Canceladas</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
          </div>
          <div v-else class="table-responsive">
            <table class="table datanew">
              <thead>
                <tr>
                  <th>Consecutivo</th>
                  <th>Tipo</th>
                  <th>Usuario</th>
                  <th>Agencia</th>
                  <th>Fecha/Hora Inicio</th>
                  <th>Fecha/Hora Fin</th>
                  <th>Monto Apertura</th>
                  <th>Total Final</th>
                  <th>Diferencia</th>
                  <th>Estado</th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="sessions.length === 0">
                  <td colspan="11" class="text-center text-muted py-4">
                    <i class="ti ti-cash-off fs-48 mb-2 d-block"></i>
                    No hay arqueos registrados
                  </td>
                </tr>
                <tr v-for="session in sessions" :key="session.id">
                  <td class="fw-medium">{{ session.consecutive }}</td>
                  <td>
                    <span class="badge" :class="session.session_type === 'APERTURA' ? 'badge-soft-success' : 'badge-soft-primary'">
                      {{ session.session_type }}
                    </span>
                  </td>
                  <td>{{ session.user_name || 'N/A' }}</td>
                  <td>{{ session.agency || session.branch_name || 'N/A' }}</td>
                  <td>{{ formatDateTime(session.date_from, session.time_from) }}</td>
                  <td>{{ session.date_to ? formatDateTime(session.date_to, session.time_to) : 'En proceso' }}</td>
                  <td>L {{ formatCurrency(session.opening_amount) }}</td>
                  <td class="fw-medium">L {{ formatCurrency(session.final_total) }}</td>
                  <td :class="session.difference !== 0 ? 'text-danger fw-bold' : 'text-success'">
                    L {{ formatCurrency(session.difference) }}
                  </td>
                  <td>
                    <span class="badge" :class="getStatusBadgeClass(session.status)">
                      {{ session.status }}
                    </span>
                  </td>
                  <td>
                    <div class="action-table-data">
                      <div class="edit-delete-action">
                        <a
                          class="me-2 p-2"
                          href="#"
                          @click.prevent="editSession(session)"
                          title="Editar">
                          <i class="ti ti-edit"></i>
                        </a>
                        <a
                          class="me-2 p-2"
                          href="#"
                          @click.prevent="printSession(session)"
                          title="Imprimir">
                          <i class="ti ti-printer"></i>
                        </a>
                        <a
                          v-if="session.status === 'ABIERTA' || session.status === 'REVISADO'"
                          class="me-2 p-2 text-info"
                          href="#"
                          @click.prevent="closeSession(session)"
                          title="Cerrar Caja">
                          <i class="ti ti-lock"></i>
                        </a>
                        <a
                          v-if="session.status !== 'CERRADA' && session.status !== 'REVISADO'"
                          class="p-2 text-danger"
                          href="#"
                          @click.prevent="deleteSession(session)"
                          title="Eliminar">
                          <i class="ti ti-trash"></i>
                        </a>
                      </div>
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

  <!-- Modal de Edición -->
  <EditArqueoModal
    v-if="showEditModal && selectedSession && !showExportModal"
    :session="selectedSession"
    @close="handleEditClose"
    @success="handleEditSuccess"
    @delete="handleDeleteFromModal"
  />

  <!-- Modal de Exportación -->
  <ExportArqueoModal
    v-if="showExportModal && selectedSession"
    @close="handleExportClose"
    @export="handleExport"
  />
</template>

<script>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import Swal from 'sweetalert2';
import EditArqueoModal from './components/EditArqueoModal.vue';
import ExportArqueoModal from './components/ExportArqueoModal.vue';

export default {
  name: 'CashRegisterList',
  components: {
    EditArqueoModal,
    ExportArqueoModal
  },
  setup() {
    const toast = useToast();
    const loading = ref(false);
    const sessions = ref([]);
    const stats = ref(null);
    const searchQuery = ref('');
    const selectedStatus = ref('');
    const showEditModal = ref(false);
    const showExportModal = ref(false);
    const selectedSession = ref(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    // Cargar sesiones de caja
    const loadSessions = async () => {
      loading.value = true;
      try {
        const token = localStorage.getItem('token');
        const params = {
          search: searchQuery.value,
          status: selectedStatus.value
        };

        const response = await axios.get(`${API_URL}/cash-register/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        });

        if (response.data.success) {
          sessions.value = response.data.data || [];
        }
      } catch (error) {
        console.error('Error al cargar sesiones:', error);
        toast.error('Error al cargar sesiones de caja');
      } finally {
        loading.value = false;
      }
    };

    // Cargar estadísticas
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const today = new Date().toISOString().split('T')[0];

        const response = await axios.get(`${API_URL}/cash-register/summary`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            date_from: today,
            date_to: today
          }
        });

        if (response.data.success) {
          stats.value = response.data.data;
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };

    // Editar sesión - Mostrar modal con formulario de edición
    const editSession = async (session) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/cash-register/sessions/${session.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          selectedSession.value = response.data.data;
          showEditModal.value = true;
        }
      } catch (error) {
        console.error('Error al cargar sesión:', error);
        toast.error(error.response?.data?.message || 'Error al cargar el arqueo');
      }
    };

    const handleEditSuccess = () => {
      showEditModal.value = false;
      loadSessions();
      loadStats();
    };

    const handleEditClose = () => {
      showEditModal.value = false;
      selectedSession.value = null;
    };

    // Imprimir sesión - Abrir modal de exportación
    const printSession = async (session) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/cash-register/sessions/${session.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          selectedSession.value = response.data.data;
          showExportModal.value = true;
        }
      } catch (error) {
        console.error('Error al cargar sesión:', error);
        toast.error(error.response?.data?.message || 'Error al cargar el arqueo');
      }
    };

    // Manejar cierre del modal de exportación
    const handleExportClose = () => {
      showExportModal.value = false;
      selectedSession.value = null;
    };

    // Manejar exportación
    const handleExport = async (format) => {
      const sessionId = selectedSession.value.id;
      showExportModal.value = false;

      // Abrir la página de impresión en una nueva pestaña
      const printUrl = `/vue/template/cash-register/print/${sessionId}?format=${format}`;
      window.open(printUrl, '_blank');
    };

    // Cerrar sesión - Cambiar estado a CERRADA
    const closeSession = async (session) => {
      const result = await Swal.fire({
        title: '¿Cerrar caja?',
        text: `¿Está seguro de cerrar el arqueo ${session.consecutive}? Esto establecerá la fecha y hora de cierre.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');

          // Datos para el cierre - ahora incluye la fecha y hora final
          const now = new Date();
          const closeData = {
            date_to: now.toISOString().split('T')[0],
            time_to: now.toTimeString().split(' ')[0].substring(0, 5),
            status: 'CERRADA'
          };

          const response = await axios.put(
            `${API_URL}/cash-register/sessions/${session.id}`,
            closeData,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            toast.success('Caja cerrada exitosamente');
            loadSessions();
            loadStats();
          }
        } catch (error) {
          console.error('Error al cerrar caja:', error);
          toast.error(error.response?.data?.message || 'Error al cerrar la caja');
        }
      }
    };

    // Marcar como revisado - Cambiar estado a REVISADO
    const markAsReviewed = async (session) => {
      const result = await Swal.fire({
        title: '¿Marcar como revisado?',
        text: `¿Confirmar que el arqueo ${session.consecutive} ha sido revisado?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, marcar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');

          const response = await axios.put(
            `${API_URL}/cash-register/sessions/${session.id}`,
            { status: 'REVISADO' },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            toast.success('Arqueo marcado como revisado');
            loadSessions();
            loadStats();
          }
        } catch (error) {
          console.error('Error al marcar como revisado:', error);
          toast.error(error.response?.data?.message || 'Error al actualizar el estado');
        }
      }
    };

    // Eliminar sesión
    const deleteSession = async (session) => {
      const result = await Swal.fire({
        title: '¿Eliminar arqueo de caja?',
        text: `¿Está seguro de eliminar el arqueo ${session.consecutive}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.delete(
            `${API_URL}/cash-register/sessions/${session.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            toast.success('Arqueo eliminado exitosamente');
            loadSessions();
            loadStats();
          }
        } catch (error) {
          console.error('Error al eliminar sesión:', error);
          toast.error(error.response?.data?.message || 'Error al eliminar arqueo');
        }
      }
    };

    // Filtros
    const filterByStatus = (status) => {
      selectedStatus.value = status;
      loadSessions();
    };

    const onSearch = () => {
      loadSessions();
    };

    // Utilidades
    const formatCurrency = (value) => {
      if (!value && value !== 0) return '0.00';
      return parseFloat(value).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDateTime = (date, time) => {
      if (!date) return 'N/A';
      const dateStr = new Date(date).toLocaleDateString('es-HN');
      return time ? `${dateStr} ${time}` : dateStr;
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        'ABIERTA': 'badge-soft-success',
        'CERRADA': 'badge-soft-info',
        'REVISADO': 'badge-soft-primary',
        'CANCELADA': 'badge-soft-danger'
      };
      return classes[status] || 'badge-soft-secondary';
    };

    const getSelectedStatusText = () => {
      if (!selectedStatus.value) return 'Todos los Estados';
      const statusMap = {
        'ABIERTA': 'Abiertas',
        'CERRADA': 'Cerradas',
        'REVISADO': 'Revisadas',
        'CANCELADA': 'Canceladas'
      };
      return statusMap[selectedStatus.value] || 'Todos los Estados';
    };

    const handleDeleteFromModal = (session) => {
      showEditModal.value = false;
      deleteSession(session);
    };

    const toggleHeader = () => {
      document.getElementById('collapse-header').classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    };

    onMounted(() => {
      loadSessions();
      loadStats();
    });

    return {
      loading,
      sessions,
      stats,
      searchQuery,
      selectedStatus,
      showEditModal,
      showExportModal,
      selectedSession,
      loadSessions,
      editSession,
      handleEditSuccess,
      handleEditClose,
      handleExportClose,
      handleExport,
      handleDeleteFromModal,
      printSession,
      closeSession,
      markAsReviewed,
      deleteSession,
      filterByStatus,
      onSearch,
      formatCurrency,
      formatDateTime,
      getStatusBadgeClass,
      getSelectedStatusText,
      toggleHeader
    };
  }
};
</script>

<style scoped>
.badge-soft-success {
  background-color: #d4edda;
  color: #155724;
}

.badge-soft-primary {
  background-color: #cfe2ff;
  color: #084298;
}

.badge-soft-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.badge-soft-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.badge-soft-secondary {
  background-color: #e2e3e5;
  color: #383d41;
}

.bg-success-light,
.bg-primary-light,
.bg-info-light,
.bg-warning-light {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
</style>
