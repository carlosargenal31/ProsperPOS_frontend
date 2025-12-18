<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Ajuste De Inventario</h4>
            <h6>Gestionar ajustes de inventario</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadAdjustments">
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Collapse" @click="toggleHeader">
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
        <div class="page-btn">
          <button class="btn btn-added" @click="showModal = true">
            <i class="ti ti-plus me-2"></i>Añadir Ajuste de Inventario
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="card mb-0">
        <div class="card-body">
          <div class="row">
            <div class="col-lg-3 col-md-6">
              <label class="form-label">Buscar por</label>
              <select class="form-select" v-model="searchBy">
                <option value="name">Nombre</option>
                <option value="document">Documento</option>
              </select>
            </div>
            <div class="col-lg-9 col-md-6">
              <label class="form-label">&nbsp;</label>
              <div class="input-group">
                <span class="input-group-text"><i class="ti ti-search"></i></span>
                <input
                  type="text"
                  class="form-control"
                  v-model="searchTerm"
                  placeholder="Buscar..."
                  @input="debouncedSearch"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Adjustments Table -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th class="sortable" @click="sortBy('emision')">
                    Emisión
                    <i class="ti" :class="getSortIcon('emision')"></i>
                  </th>
                  <th class="sortable" @click="sortBy('documento')">
                    Documento
                    <i class="ti" :class="getSortIcon('documento')"></i>
                  </th>
                  <th class="sortable" @click="sortBy('concepto')">
                    Concepto
                    <i class="ti" :class="getSortIcon('concepto')"></i>
                  </th>
                  <th class="sortable" @click="sortBy('emisor')">
                    Emisor
                    <i class="ti" :class="getSortIcon('emisor')"></i>
                  </th>
                  <th class="sortable" @click="sortBy('estatus')">
                    Estatus
                    <i class="ti" :class="getSortIcon('estatus')"></i>
                  </th>
                  <th class="text-center" style="width: 80px;">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="adjustment in sortedAdjustments" :key="adjustment.id">
                  <td>{{ formatDate(adjustment.emision) }}</td>
                  <td>{{ adjustment.documento }}</td>
                  <td>{{ adjustment.concepto }}</td>
                  <td>{{ adjustment.emisor }}</td>
                  <td>
                    <span class="badge" :class="getStatusBadge(adjustment.estatus)">
                      {{ getStatusLabel(adjustment.estatus) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="action-table-data">
                      <div class="edit-delete-action">
                        <a
                          class="me-2 p-2"
                          href="javascript:void(0);"
                          @click="viewDetails(adjustment)"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Ver detalles"
                        >
                          <i class="ti ti-eye text-primary" style="font-size: 18px;"></i>
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr v-if="adjustments.length === 0 && !loading">
                  <td colspan="6" class="text-center py-4">
                    <i class="ti ti-inbox" style="font-size: 48px; color: #ccc;"></i>
                    <p class="mt-2 text-muted">No hay ajustes de inventario</p>
                  </td>
                </tr>
                <tr v-if="loading">
                  <td colspan="6" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando ajustes...</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="row mt-3" v-if="pagination.totalPages > 1">
            <div class="col-12">
              <nav>
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                    <a class="page-link" href="#" @click.prevent="changePage(pagination.page - 1)">Anterior</a>
                  </li>
                  <li
                    class="page-item"
                    v-for="page in pagination.totalPages"
                    :key="page"
                    :class="{ active: page === pagination.page }"
                  >
                    <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
                    <a class="page-link" href="#" @click.prevent="changePage(pagination.page + 1)">Siguiente</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <div class="row mt-3" v-if="adjustments.length > 0">
            <div class="col-12 text-center">
              <button class="btn btn-outline-secondary" @click="loadMore" v-if="pagination.page < pagination.totalPages">
                SIGUIENTE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Ajuste de Inventario -->
  <AdjustmentModal
    v-if="showModal"
    @close="showModal = false"
    @saved="onAdjustmentSaved"
  />

  <!-- Modal de Visualización -->
  <ViewModal
    v-if="showViewModal"
    :adjustmentId="selectedAdjustmentId"
    @close="showViewModal = false"
    @applied="onAdjustmentApplied"
  />
</template>

<script>
import api from "@/utils/axios";
import AdjustmentModal from "@/components/modal/stock-adjustment-modal.vue";
import ViewModal from "@/components/modal/stock-adjustment-view-modal.vue";

export default {
  name: 'StockAdjustmentList',
  components: {
    AdjustmentModal,
    ViewModal
  },
  data() {
    return {
      loading: false,
      showModal: false,
      showViewModal: false,
      selectedAdjustmentId: null,
      searchBy: 'name',
      searchTerm: '',
      adjustments: [],
      sortColumn: 'emision',
      sortDirection: 'desc',
      pagination: {
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 0
      },
      debounceTimer: null
    }
  },
  computed: {
    sortedAdjustments() {
      if (!this.adjustments || this.adjustments.length === 0) {
        return [];
      }

      return [...this.adjustments].sort((a, b) => {
        let aVal = a[this.sortColumn];
        let bVal = b[this.sortColumn];

        // Manejar fechas
        if (this.sortColumn === 'emision') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }

        // Manejar strings
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (this.sortDirection === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }
  },
  mounted() {
    this.loadAdjustments();
  },
  methods: {
    async loadAdjustments() {
      this.loading = true;
      try {
        const params = new URLSearchParams({
          page: this.pagination.page,
          limit: this.pagination.limit
        });

        if (this.searchTerm) {
          params.append('search', this.searchTerm);
        }

        const response = await api.get(`/inventory-adjustments?${params.toString()}`);

        if (response.data.success) {
          this.adjustments = response.data.data.data || [];
          this.pagination = response.data.data.pagination || this.pagination;
        }
      } catch (error) {
        console.error('Error al cargar ajustes:', error);
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los ajustes de inventario'
        });
      } finally {
        this.loading = false;
      }
    },
    debouncedSearch() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.pagination.page = 1;
        this.loadAdjustments();
      }, 500);
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.page = page;
        this.loadAdjustments();
      }
    },
    loadMore() {
      if (this.pagination.page < this.pagination.totalPages) {
        this.pagination.page++;
        this.loadAdjustments();
      }
    },
    viewDetails(adjustment) {
      this.selectedAdjustmentId = adjustment.id;
      this.showViewModal = true;
    },
    sortBy(column) {
      if (this.sortColumn === column) {
        // Si ya está ordenado por esta columna, cambiar dirección
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // Nueva columna, ordenar ascendente
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    getSortIcon(column) {
      if (this.sortColumn !== column) {
        return 'ti-selector';
      }
      return this.sortDirection === 'asc' ? 'ti-chevron-up' : 'ti-chevron-down';
    },
    onAdjustmentApplied() {
      this.loadAdjustments();
    },
    onAdjustmentSaved() {
      this.showModal = false;
      this.pagination.page = 1;
      this.loadAdjustments();
      this.$swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Ajuste de inventario guardado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    formatDate(dateString) {
      if (!dateString) return '-';

      // Si viene en formato YYYY-MM-DD, procesamos directamente
      if (dateString.includes('-') && !dateString.includes('T')) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }

      // Para otros formatos, usar Date pero añadiendo 'T00:00:00' para evitar problemas de zona horaria
      const date = new Date(dateString.replace('Z', '') + 'T00:00:00');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },
    getStatusBadge(status) {
      const badges = {
        'pending': 'bg-warning',
        'processed': 'bg-success',
        'cancelled': 'bg-danger'
      };
      return badges[status] || 'bg-secondary';
    },
    getStatusLabel(status) {
      const labels = {
        'pending': 'PENDIENTE',
        'processed': 'PROCESADO',
        'cancelled': 'CANCELADO'
      };
      return labels[status] || status.toUpperCase();
    },
    toggleHeader() {
      const header = document.querySelector('.page-header');
      if (header) {
        header.classList.toggle('collapsed');
      }
    }
  }
}
</script>

<style scoped>
.badge {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 25px;
}

.sortable:hover {
  background-color: #f8f9fa;
}

.sortable i {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
}

.sortable:hover i {
  opacity: 1;
}
</style>
