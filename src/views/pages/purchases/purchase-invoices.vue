<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>

  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Libro de Compras</h4>
            <h6>Gestiona tus facturas de compras</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="PDF" @click="exportToPDF">
              <img src="@/assets/img/icons/pdf.svg" alt="PDF">
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel" @click="exportToExcel">
              <img src="@/assets/img/icons/excel.svg" alt="Excel">
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadPurchases">
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Colapsar" id="collapse-header" @click="toggleHeader">
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
        <div class="page-btn">
          <a href="#" class="btn btn-added" data-bs-toggle="modal" data-bs-target="#add-purchase-modal">
            <i class="ti ti-plus me-2"></i>Nueva Factura de Compra
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-0">
        <div class="card-body pb-1">
          <div class="row">
            <div class="col-lg-3 col-sm-6">
              <div class="input-blocks">
                <label>Fecha Desde</label>
                <div class="input-groupicon calender-input">
                  <input type="date" class="form-control" v-model="filters.date_from" @change="loadPurchases">
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-sm-6">
              <div class="input-blocks">
                <label>Fecha Hasta</label>
                <div class="input-groupicon calender-input">
                  <input type="date" class="form-control" v-model="filters.date_to" @change="loadPurchases">
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-sm-6">
              <div class="input-blocks">
                <label>Proveedor</label>
                <input type="text" class="form-control" v-model="filters.search" @input="debouncedSearch" placeholder="Buscar proveedor...">
              </div>
            </div>
            <div class="col-lg-3 col-sm-6">
              <div class="input-blocks">
                <label>Estado de Pago</label>
                <select class="form-select" v-model="filters.payment_status" @change="loadPurchases">
                  <option value="">Todos</option>
                  <option value="Paid">Pagado</option>
                  <option value="Unpaid">Sin Pagar</option>
                  <option value="Partial">Parcial</option>
                  <option value="Overdue">Vencido</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Purchase Statistics -->
      <div class="row" v-if="statistics">
        <div class="col-xl-3 col-sm-6">
          <div class="card mb-3">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="avatar avatar-lg bg-primary-transparent rounded-circle">
                  <i class="ti ti-file-invoice fs-24 text-primary"></i>
                </div>
                <div class="ms-3 flex-fill">
                  <h6 class="mb-1">Total Facturas</h6>
                  <h4 class="mb-0">{{ statistics.total_documents || 0 }}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6">
          <div class="card mb-3">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="avatar avatar-lg bg-success-transparent rounded-circle">
                  <i class="ti ti-currency-dollar fs-24 text-success"></i>
                </div>
                <div class="ms-3 flex-fill">
                  <h6 class="mb-1">Total Compras</h6>
                  <h4 class="mb-0">L {{ formatCurrency(statistics.total_amount) }}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6">
          <div class="card mb-3">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="avatar avatar-lg bg-info-transparent rounded-circle">
                  <i class="ti ti-percentage fs-24 text-info"></i>
                </div>
                <div class="ms-3 flex-fill">
                  <h6 class="mb-1">ISV Pagado</h6>
                  <h4 class="mb-0">L {{ formatCurrency(statistics.total_tax) }}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6">
          <div class="card mb-3">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="avatar avatar-lg bg-warning-transparent rounded-circle">
                  <i class="ti ti-clock fs-24 text-warning"></i>
                </div>
                <div class="ms-3 flex-fill">
                  <h6 class="mb-1">Pendiente</h6>
                  <h4 class="mb-0">L {{ formatCurrency(statistics.total_pending) }}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Purchase List -->
      <div class="card table-list-card">
        <div class="card-body">
          <div class="table-top">
            <div class="search-set">
              <div class="search-input">
                <a href="#" class="btn btn-searchset">
                  <i class="ti ti-search"></i>
                </a>
                <input type="search" class="form-control" v-model="filters.search" @input="debouncedSearch" placeholder="Buscar...">
              </div>
            </div>
          </div>

          <div class="table-responsive" v-if="!loading">
            <table class="table datanew">
              <thead>
                <tr>
                  <th>
                    <label class="checkboxs">
                      <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                      <span class="checkmarks"></span>
                    </label>
                  </th>
                  <th>Fecha</th>
                  <th>N° Factura</th>
                  <th>Proveedor</th>
                  <th>RTN/ID</th>
                  <th>Subtotal</th>
                  <th>ISV</th>
                  <th>Total</th>
                  <th>Estado Pago</th>
                  <th>Imagen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="purchase in purchases" :key="purchase.id">
                  <td>
                    <label class="checkboxs">
                      <input type="checkbox" v-model="selectedPurchases" :value="purchase.id">
                      <span class="checkmarks"></span>
                    </label>
                  </td>
                  <td>{{ formatDate(purchase.purchase_date) }}</td>
                  <td>
                    <span class="fw-bold">{{ purchase.invoice_number || purchase.purchase_number }}</span>
                  </td>
                  <td>{{ purchase.supplier_name }}</td>
                  <td>{{ purchase.supplier_id_number || '-' }}</td>
                  <td>L {{ formatCurrency(purchase.net_amount) }}</td>
                  <td>L {{ formatCurrency(purchase.tax_amount) }}</td>
                  <td class="fw-bold">L {{ formatCurrency(purchase.total_amount) }}</td>
                  <td>
                    <span :class="getPaymentStatusClass(purchase.payment_status)">
                      {{ getPaymentStatusText(purchase.payment_status) }}
                    </span>
                  </td>
                  <td>
                    <span v-if="purchase.invoice_image" class="badge bg-success">
                      <i class="ti ti-photo"></i>
                    </span>
                    <span v-else class="badge bg-secondary">
                      <i class="ti ti-photo-off"></i>
                    </span>
                  </td>
                  <td>
                    <div class="action-table-data">
                      <div class="edit-delete-action">
                        <a class="me-2 p-2" href="#" @click.prevent="viewPurchase(purchase)" data-bs-toggle="tooltip" title="Ver Detalles">
                          <i class="ti ti-eye"></i>
                        </a>
                        <a class="me-2 p-2" href="#" @click.prevent="viewInvoiceImage(purchase)" v-if="purchase.invoice_image" data-bs-toggle="tooltip" title="Ver Factura">
                          <i class="ti ti-file-invoice"></i>
                        </a>
                        <a class="me-2 p-2" href="#" @click.prevent="editPurchase(purchase)" data-bs-toggle="tooltip" title="Editar">
                          <i class="ti ti-edit"></i>
                        </a>
                        <a class="p-2 confirm-text" href="#" @click.prevent="confirmDelete(purchase)" data-bs-toggle="tooltip" title="Eliminar">
                          <i class="ti ti-trash"></i>
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr v-if="purchases.length === 0">
                  <td colspan="11" class="text-center py-4">
                    <div class="text-muted">
                      <i class="ti ti-inbox fs-48 mb-2"></i>
                      <p class="mb-0">No se encontraron facturas de compras</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center mt-3" v-if="pagination.totalPages > 1">
            <div class="dataTables_info">
              Mostrando {{ (pagination.currentPage - 1) * pagination.perPage + 1 }} a
              {{ Math.min(pagination.currentPage * pagination.perPage, pagination.totalRecords) }}
              de {{ pagination.totalRecords }} registros
            </div>
            <div class="dataTables_paginate">
              <ul class="pagination">
                <li class="paginate_button page-item" :class="{ disabled: pagination.currentPage === 1 }">
                  <a href="#" class="page-link" @click.prevent="changePage(pagination.currentPage - 1)">Anterior</a>
                </li>
                <li v-for="page in visiblePages" :key="page" class="paginate_button page-item" :class="{ active: page === pagination.currentPage }">
                  <a href="#" class="page-link" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                <li class="paginate_button page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
                  <a href="#" class="page-link" @click.prevent="changePage(pagination.currentPage + 1)">Siguiente</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add/Edit Purchase Modal -->
  <purchase-invoice-modal
    :is-open="showPurchaseModal"
    :purchase="selectedPurchase"
    @close="closePurchaseModal"
    @save="handleSavePurchase"
  ></purchase-invoice-modal>

  <!-- View Invoice Image Modal -->
  <invoice-image-modal
    :is-open="showImageModal"
    :image-url="selectedImageUrl"
    @close="closeImageModal"
  ></invoice-image-modal>

  <!-- View Purchase Details Modal -->
  <purchase-details-modal
    :is-open="showDetailsModal"
    :purchase="selectedPurchase"
    @close="closeDetailsModal"
  ></purchase-details-modal>
</template>

<script>
import axios from 'axios';
import PurchaseInvoiceModal from '@/components/modal/purchase-invoice-modal.vue';
import InvoiceImageModal from '@/components/modal/invoice-image-modal.vue';
import PurchaseDetailsModal from '@/components/modal/purchase-details-modal.vue';

export default {
  name: 'PurchaseInvoices',
  components: {
    PurchaseInvoiceModal,
    InvoiceImageModal,
    PurchaseDetailsModal
  },
  data() {
    // Calculate dates inline to avoid calling methods before they're initialized
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const dateFrom = firstDay.toISOString().split('T')[0];
    const dateTo = now.toISOString().split('T')[0];

    return {
      purchases: [],
      loading: false,
      filters: {
        search: '',
        date_from: dateFrom,
        date_to: dateTo,
        payment_status: '',
        page: 1,
        limit: 50
      },
      pagination: {
        currentPage: 1,
        perPage: 50,
        totalRecords: 0,
        totalPages: 1
      },
      statistics: null,
      selectedPurchases: [],
      selectAll: false,
      showPurchaseModal: false,
      showImageModal: false,
      showDetailsModal: false,
      selectedPurchase: null,
      selectedImageUrl: '',
      searchTimeout: null
    };
  },
  computed: {
    visiblePages() {
      const pages = [];
      const total = this.pagination.totalPages;
      const current = this.pagination.currentPage;
      const delta = 2;

      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        pages.push(i);
      }

      if (current - delta > 2) {
        pages.unshift('...');
      }
      if (current + delta < total - 1) {
        pages.push('...');
      }

      pages.unshift(1);
      if (total > 1) {
        pages.push(total);
      }

      return pages.filter((p, idx, arr) => arr.indexOf(p) === idx);
    }
  },
  mounted() {
    this.loadPurchases();
    this.loadStatistics();
  },
  methods: {
    getFirstDayOfMonth() {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return firstDay.toISOString().split('T')[0];
    },

    getCurrentDate() {
      const now = new Date();
      return now.toISOString().split('T')[0];
    },

    async loadPurchases() {
      this.loading = true;
      try {
        const response = await axios.get('/api/purchases', {
          params: this.filters
        });

        this.purchases = response.data.data.data || [];
        this.pagination = response.data.data.pagination || {};
      } catch (error) {
        console.error('Error loading purchases:', error);
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar las facturas de compras'
        });
      } finally {
        this.loading = false;
      }
    },

    async loadStatistics() {
      try {
        const response = await axios.get('/api/purchases/reports/purchase-book', {
          params: {
            date_from: this.filters.date_from,
            date_to: this.filters.date_to
          }
        });

        this.statistics = response.data.data.totals || {};
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.loadPurchases();
      }, 500);
    },

    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.filters.page = page;
        this.loadPurchases();
      }
    },

    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedPurchases = this.purchases.map(p => p.id);
      } else {
        this.selectedPurchases = [];
      }
    },

    async viewPurchase(purchase) {
      try {
        // Obtener los detalles completos de la compra desde el backend
        const response = await axios.get(`/api/purchases/${purchase.id}`);
        this.selectedPurchase = response.data.data;
        this.showDetailsModal = true;
      } catch (error) {
        console.error('Error loading purchase details:', error);
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los detalles de la compra'
        });
      }
    },

    editPurchase(purchase) {
      this.selectedPurchase = purchase;
      this.showPurchaseModal = true;
    },

    viewInvoiceImage(purchase) {
      if (purchase.invoice_image) {
        this.selectedImageUrl = `/api/purchases/invoice-image/${purchase.invoice_image}`;
        this.showImageModal = true;
      }
    },

    confirmDelete(purchase) {
      this.$swal({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await this.deletePurchase(purchase.id);
        }
      });
    },

    async deletePurchase(id) {
      try {
        await axios.delete(`/api/purchases/${id}`);

        this.$swal({
          icon: 'success',
          title: 'Eliminado',
          text: 'Factura de compra eliminada exitosamente',
          timer: 2000
        });

        this.loadPurchases();
        this.loadStatistics();
      } catch (error) {
        console.error('Error deleting purchase:', error);
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar la factura de compra'
        });
      }
    },

    closePurchaseModal() {
      this.showPurchaseModal = false;
      this.selectedPurchase = null;
    },

    closeImageModal() {
      this.showImageModal = false;
      this.selectedImageUrl = '';
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedPurchase = null;
    },

    async handleSavePurchase() {
      this.closePurchaseModal();
      await this.loadPurchases();
      await this.loadStatistics();
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },

    formatCurrency(amount) {
      if (!amount) return '0.00';
      return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    getPaymentStatusClass(status) {
      const classes = {
        'Paid': 'badge bg-success',
        'Unpaid': 'badge bg-danger',
        'Partial': 'badge bg-warning',
        'Overdue': 'badge bg-dark'
      };
      return classes[status] || 'badge bg-secondary';
    },

    getPaymentStatusText(status) {
      const texts = {
        'Paid': 'Pagado',
        'Unpaid': 'Sin Pagar',
        'Partial': 'Parcial',
        'Overdue': 'Vencido'
      };
      return texts[status] || status;
    },

    toggleHeader() {
      document.getElementById('collapse-header').classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    },

    async exportToPDF() {
      // TODO: Implement PDF export
      this.$swal({
        icon: 'info',
        title: 'Exportar a PDF',
        text: 'Función en desarrollo'
      });
    },

    async exportToExcel() {
      // TODO: Implement Excel export
      this.$swal({
        icon: 'info',
        title: 'Exportar a Excel',
        text: 'Función en desarrollo'
      });
    }
  }
};
</script>

<style scoped>
.badge {
  font-size: 11px;
  padding: 4px 8px;
}

.action-table-data a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.table-responsive {
  min-height: 300px;
}
</style>
