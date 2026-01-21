<template>
  <div class="opiniones-online-container">
    <!-- Estadísticas -->
    <div class="row mb-4">
      <div class="col-lg-4 col-sm-6">
        <div class="card bg-primary-light">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-2">Total Opiniones</h6>
                <h3 class="mb-0">{{ stats?.total || 0 }}</h3>
              </div>
              <div class="avatar avatar-lg bg-primary">
                <i class="ti ti-message-2 fs-24"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-sm-6">
        <div class="card bg-warning-light">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-2">Pendientes</h6>
                <h3 class="mb-0">{{ stats?.pendientes || 0 }}</h3>
              </div>
              <div class="avatar avatar-lg bg-warning">
                <i class="ti ti-clock fs-24"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-sm-6">
        <div class="card bg-success-light">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-2">Respondidas</h6>
                <h3 class="mb-0">{{ stats?.respondidas || 0 }}</h3>
              </div>
              <div class="avatar avatar-lg bg-success">
                <i class="ti ti-check fs-24"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-lg-3">
            <label class="form-label">Estado</label>
            <select v-model="filters.status" @change="loadOpinions" class="form-select">
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="respondido">Respondido</option>
            </select>
          </div>

          <div class="col-lg-6">
            <label class="form-label">Buscar</label>
            <input
              v-model="filters.search"
              @input="searchOpinions"
              type="text"
              class="form-control"
              placeholder="Nombre, email, tipo de consulta...">
          </div>

          <div class="col-lg-3">
            <label class="form-label">&nbsp;</label>
            <button
              @click="clearFilters"
              class="btn btn-outline-secondary w-100">
              <i class="ti ti-refresh me-1"></i>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Opiniones -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <div v-else-if="filteredOpinions.length === 0" class="text-center py-5">
          <i class="ti ti-message-off fs-48 text-muted mb-3"></i>
          <h5>No hay opiniones</h5>
          <p class="text-muted">No se encontraron opiniones con los filtros aplicados</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Tipo de Consulta</th>
                <th>Mensaje</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="opinion in paginatedOpinions" :key="opinion.id">
                <td>
                  <div><strong>{{ opinion.name }} {{ opinion.lastname }}</strong></div>
                  <small class="text-muted">{{ opinion.email }}</small>
                </td>
                <td>
                  <span class="badge bg-info">{{ opinion.inquiry_type }}</span>
                </td>
                <td>
                  <div class="text-truncate" style="max-width: 250px;">
                    {{ opinion.message }}
                  </div>
                </td>
                <td>{{ formatDate(opinion.created_at) }}</td>
                <td>
                  <span :class="getStatusClass(opinion.status)" class="badge">
                    {{ getStatusText(opinion.status) }}
                  </span>
                </td>
                <td>
                  <button
                    @click="viewOpinion(opinion)"
                    class="btn btn-sm btn-info me-2"
                    title="Ver Detalles">
                    <i class="ti ti-eye"></i>
                  </button>
                  <button
                    v-if="opinion.status === 'pendiente'"
                    @click="respondOpinion(opinion)"
                    class="btn btn-sm btn-primary me-2"
                    title="Responder">
                    <i class="ti ti-mail"></i>
                  </button>
                  <button
                    @click="deleteOpinion(opinion)"
                    class="btn btn-sm btn-danger"
                    title="Eliminar">
                    <i class="ti ti-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted">
            Mostrando {{ startItem }} - {{ endItem }} de {{ filteredOpinions.length }} opiniones
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" @click.prevent="currentPage = 1" href="#">
                  <i class="ti ti-chevrons-left"></i>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" @click.prevent="currentPage--" href="#">
                  <i class="ti ti-chevron-left"></i>
                </a>
              </li>
              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }">
                <a class="page-link" @click.prevent="currentPage = page" href="#">
                  {{ page }}
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" @click.prevent="currentPage++" href="#">
                  <i class="ti ti-chevron-right"></i>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" @click.prevent="currentPage = totalPages" href="#">
                  <i class="ti ti-chevrons-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles de Opinión -->
    <div
      class="modal fade"
      id="opinionDetailModal"
      tabindex="-1"
      ref="opinionDetailModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalle de la Opinión</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedOpinion">
            <!-- Información del Cliente -->
            <div class="row mb-4">
              <div class="col-md-6">
                <h6>Información del Cliente</h6>
                <p class="mb-1"><strong>Nombre:</strong> {{ selectedOpinion.name }} {{ selectedOpinion.lastname }}</p>
                <p class="mb-1"><strong>Email:</strong> {{ selectedOpinion.email }}</p>
              </div>
              <div class="col-md-6">
                <h6>Información de la Consulta</h6>
                <p class="mb-1"><strong>Tipo:</strong> <span class="badge bg-info">{{ selectedOpinion.inquiry_type }}</span></p>
                <p class="mb-1"><strong>Fecha:</strong> {{ formatDate(selectedOpinion.created_at) }}</p>
                <p class="mb-1">
                  <strong>Estado:</strong>
                  <span :class="getStatusClass(selectedOpinion.status)" class="badge">
                    {{ getStatusText(selectedOpinion.status) }}
                  </span>
                </p>
              </div>
            </div>

            <!-- Mensaje -->
            <div class="mb-4">
              <h6>Mensaje del Cliente</h6>
              <div class="alert alert-light">
                {{ selectedOpinion.message }}
              </div>
            </div>

            <!-- Respuesta (si existe) -->
            <div v-if="selectedOpinion.admin_response" class="mb-4">
              <h6>Respuesta del Administrador</h6>
              <div class="alert alert-success">
                {{ selectedOpinion.admin_response }}
              </div>
              <p class="text-muted mb-0">
                <small>Respondido por: {{ selectedOpinion.admin_name || 'Administrador' }} el {{ formatDate(selectedOpinion.responded_at) }}</small>
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button
              v-if="selectedOpinion && selectedOpinion.status === 'pendiente'"
              type="button"
              class="btn btn-primary"
              @click="showRespondModal">
              <i class="ti ti-mail me-1"></i>
              Responder
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Responder -->
    <div
      class="modal fade"
      id="respondModal"
      tabindex="-1"
      ref="respondModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Responder Opinión</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Cliente</label>
              <input
                type="text"
                class="form-control"
                :value="selectedOpinion ? `${selectedOpinion.name} ${selectedOpinion.lastname}` : ''"
                readonly>
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input
                type="text"
                class="form-control"
                :value="selectedOpinion?.email"
                readonly>
            </div>

            <div class="mb-3">
              <label class="form-label">Mensaje Original</label>
              <textarea
                class="form-control"
                rows="3"
                :value="selectedOpinion?.message"
                readonly></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Tu Respuesta *</label>
              <textarea
                v-model="responseText"
                class="form-control"
                rows="5"
                placeholder="Escribe tu respuesta aquí..."
                required></textarea>
              <small class="form-text text-muted">
                Esta respuesta se enviará automáticamente al correo del cliente.
              </small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="sendResponse"
              :disabled="!responseText || savingResponse">
              <span v-if="savingResponse">
                <span class="spinner-border spinner-border-sm me-1"></span>
                Enviando...
              </span>
              <span v-else>
                <i class="ti ti-send me-1"></i>
                Enviar Respuesta
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/axios'
import { Modal } from 'bootstrap'

export default {
  name: 'OpinionesClientes',
  data() {
    return {
      opinions: [],
      filteredOpinions: [],
      stats: {
        total: 0,
        pendientes: 0,
        respondidas: 0
      },
      loading: false,
      filters: {
        status: '',
        search: ''
      },
      selectedOpinion: null,
      responseText: '',
      savingResponse: false,
      searchTimeout: null,
      // Paginación
      currentPage: 1,
      itemsPerPage: 10
    }
  },
  computed: {
    paginatedOpinions() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredOpinions.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredOpinions.length / this.itemsPerPage)
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },
    endItem() {
      const end = this.currentPage * this.itemsPerPage
      return end > this.filteredOpinions.length ? this.filteredOpinions.length : end
    },
    visiblePages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        }
      }

      return pages
    }
  },
  mounted() {
    this.loadOpinions()
    this.loadStats()
  },
  methods: {
    async loadOpinions() {
      this.loading = true
      try {
        const params = new URLSearchParams()

        if (this.filters.status) params.append('status', this.filters.status)
        params.append('limit', 1000) // Cargar todas para filtrar en cliente

        const response = await api.get(`/opinions?${params.toString()}`)

        if (response.data.success) {
          this.opinions = response.data.data
          this.applyFilters()
        }
      } catch (error) {
        console.error('Error al cargar opiniones:', error)
        this.$toast?.error?.('Error al cargar las opiniones')
      } finally {
        this.loading = false
      }
    },

    async loadStats() {
      try {
        const response = await api.get('/opinions/stats')
        if (response.data.success) {
          this.stats = response.data.data.summary
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      }
    },

    applyFilters() {
      let filtered = [...this.opinions]

      // Filtrar por búsqueda
      if (this.filters.search) {
        const query = this.filters.search.toLowerCase()
        filtered = filtered.filter(o =>
          o.name.toLowerCase().includes(query) ||
          o.lastname.toLowerCase().includes(query) ||
          o.email.toLowerCase().includes(query) ||
          o.inquiry_type.toLowerCase().includes(query) ||
          o.message.toLowerCase().includes(query)
        )
      }

      this.filteredOpinions = filtered
      this.currentPage = 1 // Reset página al filtrar
    },

    searchOpinions() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.applyFilters()
      }, 500)
    },

    clearFilters() {
      this.filters = {
        status: '',
        search: ''
      }
      this.loadOpinions()
    },

    viewOpinion(opinion) {
      this.selectedOpinion = opinion
      const modal = new Modal(this.$refs.opinionDetailModal)
      modal.show()
    },

    respondOpinion(opinion) {
      this.selectedOpinion = opinion
      this.responseText = ''
      const modal = new Modal(this.$refs.respondModal)
      modal.show()
    },

    showRespondModal() {
      // Cerrar modal de detalle
      const detailModal = Modal.getInstance(this.$refs.opinionDetailModal)
      if (detailModal) {
        detailModal.hide()
      }

      // Abrir modal de respuesta
      this.responseText = ''
      const respondModal = new Modal(this.$refs.respondModal)
      respondModal.show()
    },

    async sendResponse() {
      if (!this.responseText) {
        this.$toast?.warning?.('Escribe una respuesta')
        return
      }

      this.savingResponse = true
      try {
        const response = await api.post(
          `/opinions/${this.selectedOpinion.id}/respond`,
          {
            admin_response: this.responseText
          }
        )

        if (response.data.success) {
          this.$toast?.success?.('Respuesta enviada exitosamente')

          // Cerrar modal
          const modal = Modal.getInstance(this.$refs.respondModal)
          if (modal) {
            modal.hide()
          }

          // Recargar datos
          await this.loadOpinions()
          await this.loadStats()

          this.responseText = ''
        }
      } catch (error) {
        console.error('Error al responder:', error)
        this.$toast?.error?.(error?.response?.data?.message || 'Error al enviar la respuesta')
      } finally {
        this.savingResponse = false
      }
    },

    async deleteOpinion(opinion) {
      if (!confirm(`¿Estás seguro de eliminar esta opinión de ${opinion.name} ${opinion.lastname}?`)) {
        return
      }

      try {
        const response = await api.delete(`/opinions/${opinion.id}`)

        if (response.data.success) {
          this.$toast?.success?.('Opinión eliminada exitosamente')
          await this.loadOpinions()
          await this.loadStats()
        }
      } catch (error) {
        console.error('Error al eliminar:', error)
        this.$toast?.error?.('Error al eliminar la opinión')
      }
    },

    formatDate(dateString) {
      if (!dateString) return ''

      const parts = dateString.replace('T', ' ').replace('Z', '').split(/[- :]/)
      const year = parseInt(parts[0])
      const month = parseInt(parts[1])
      const day = parseInt(parts[2])
      const hours = parseInt(parts[3])
      const minutes = parseInt(parts[4])

      const monthStr = String(month).padStart(2, '0')
      const dayStr = String(day).padStart(2, '0')
      const hoursStr = String(hours).padStart(2, '0')
      const minutesStr = String(minutes).padStart(2, '0')

      return `${dayStr}/${monthStr}/${year}, ${hoursStr}:${minutesStr}`
    },

    getStatusClass(status) {
      const classes = {
        'pendiente': 'bg-warning',
        'respondido': 'bg-success'
      }
      return classes[status] || 'bg-secondary'
    },

    getStatusText(status) {
      const texts = {
        'pendiente': 'Pendiente',
        'respondido': 'Respondido'
      }
      return texts[status] || status
    }
  }
}
</script>

<style scoped>
.opiniones-online-container {
  padding: 1rem;
}

.bg-primary-light {
  background-color: #e7f3ff !important;
}

.bg-warning-light {
  background-color: #fff3e0 !important;
}

.bg-success-light {
  background-color: #e8f5e9 !important;
}

.avatar {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.avatar i {
  color: white;
}

.table thead th {
  font-weight: 600;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
