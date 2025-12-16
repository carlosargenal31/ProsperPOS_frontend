<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>

  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>📚 Libro de Compras</h4>
            <h6>Gestiona tus facturas de compras con tecnología OCR</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Exportar PDF" @click="exportToPDF">
              <img src="@/assets/img/icons/pdf.svg" alt="PDF">
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Exportar Excel" @click="exportToExcel">
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
          <a href="#" class="btn btn-added" @click.prevent="openAddPurchaseModal">
            <i class="ti ti-plus me-2"></i>Nueva Factura de Compra
          </a>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row" v-if="statistics">
        <div class="col-xl-3 col-sm-6 col-12">
          <div class="card color-info bg-primary mb-4">
            <div class="card-body">
              <div class="dash-widget-header">
                <span class="dash-widget-icon">
                  <i class="ti ti-file-invoice"></i>
                </span>
                <div class="dash-count">
                  <div class="dash-title">Total Facturas</div>
                  <div class="dash-counts">
                    <p>{{ statistics.total_documents || 0 }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12">
          <div class="card color-info bg-success mb-4">
            <div class="card-body">
              <div class="dash-widget-header">
                <span class="dash-widget-icon">
                  <i class="ti ti-currency-dollar"></i>
                </span>
                <div class="dash-count">
                  <div class="dash-title">Total Compras</div>
                  <div class="dash-counts">
                    <p>L {{ formatCurrency(statistics.total_amount) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12">
          <div class="card color-info bg-info mb-4">
            <div class="card-body">
              <div class="dash-widget-header">
                <span class="dash-widget-icon">
                  <i class="ti ti-percentage"></i>
                </span>
                <div class="dash-count">
                  <div class="dash-title">ISV Pagado</div>
                  <div class="dash-counts">
                    <p>L {{ formatCurrency(statistics.total_tax) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12">
          <div class="card color-info bg-warning mb-4">
            <div class="card-body">
              <div class="dash-widget-header">
                <span class="dash-widget-icon">
                  <i class="ti ti-clock"></i>
                </span>
                <div class="dash-count">
                  <div class="dash-title">Pendiente Pago</div>
                  <div class="dash-counts">
                    <p>L {{ formatCurrency(statistics.total_pending) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-3">
        <div class="card-body pb-2">
          <div class="row">
            <div class="col-lg-3 col-sm-6">
              <div class="input-blocks">
                <label>Fecha Desde</label>
                <input type="date" class="form-control" v-model="filters.date_from" @change="loadPurchases">
              </div>
            </div>
            <div class="col-lg-3 col-sm-6">
              <div class="input-blocks">
                <label>Fecha Hasta</label>
                <input type="date" class="form-control" v-model="filters.date_to" @change="loadPurchases">
              </div>
            </div>
            <div class="col-lg-3 col-sm-6">
              <div class="input-blocks">
                <label>Buscar</label>
                <input type="text" class="form-control" v-model="filters.search" @input="debouncedSearch" placeholder="Proveedor, N° Factura...">
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

      <!-- Purchase List Table -->
      <div class="card table-list-card">
        <div class="card-body">
          <div class="table-responsive" v-if="!loading">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th style="width: 5%;">
                    <label class="checkboxs">
                      <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                      <span class="checkmarks"></span>
                    </label>
                  </th>
                  <th style="width: 10%;">Fecha</th>
                  <th style="width: 15%;">N° Factura</th>
                  <th style="width: 20%;">Proveedor</th>
                  <th style="width: 12%;">RTN/ID</th>
                  <th class="text-end" style="width: 10%;">Subtotal</th>
                  <th class="text-end" style="width: 8%;">ISV</th>
                  <th class="text-end" style="width: 10%;">Total</th>
                  <th style="width: 10%;">Estado</th>
                  <th class="text-center" style="width: 10%;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="purchase in purchases" :key="purchase.id" :class="{ 'table-active': selectedPurchases.includes(purchase.id) }">
                  <td>
                    <label class="checkboxs">
                      <input type="checkbox" v-model="selectedPurchases" :value="purchase.id">
                      <span class="checkmarks"></span>
                    </label>
                  </td>
                  <td>
                    <span class="text-muted small">{{ formatDate(purchase.purchase_date) }}</span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <i v-if="purchase.invoice_image" class="ti ti-photo text-success me-2" data-bs-toggle="tooltip" title="Tiene imagen"></i>
                      <span class="fw-semibold">{{ purchase.invoice_number || purchase.purchase_number }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="productimgname">
                      <span class="text-dark fw-medium">{{ purchase.supplier_name }}</span>
                    </div>
                  </td>
                  <td><span class="text-muted small">{{ purchase.supplier_id_number || '-' }}</span></td>
                  <td class="text-end">L {{ formatCurrency(purchase.net_amount) }}</td>
                  <td class="text-end text-info">L {{ formatCurrency(purchase.tax_amount) }}</td>
                  <td class="text-end fw-bold text-primary">L {{ formatCurrency(purchase.total_amount) }}</td>
                  <td>
                    <span :class="getPaymentStatusClass(purchase.payment_status)">
                      {{ getPaymentStatusText(purchase.payment_status) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-table-data text-center">
                      <div class="edit-delete-action">
                        <a class="me-2 p-2" href="#" @click.prevent="viewPurchase(purchase)" data-bs-toggle="tooltip" title="Ver Detalles">
                          <i class="ti ti-eye fs-5"></i>
                        </a>
                        <a class="me-2 p-2" href="#" @click.prevent="viewInvoiceImage(purchase)" v-if="purchase.invoice_image" data-bs-toggle="tooltip" title="Ver Factura">
                          <i class="ti ti-file-invoice fs-5 text-primary"></i>
                        </a>
                        <a class="me-2 p-2" href="#" @click.prevent="editPurchase(purchase)" data-bs-toggle="tooltip" title="Editar">
                          <i class="ti ti-edit fs-5 text-info"></i>
                        </a>
                        <a class="p-2 confirm-text" href="#" @click.prevent="confirmDelete(purchase)" data-bs-toggle="tooltip" title="Eliminar">
                          <i class="ti ti-trash fs-5 text-danger"></i>
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr v-if="purchases.length === 0">
                  <td colspan="10" class="text-center py-5">
                    <div class="empty-state">
                      <i class="ti ti-inbox fs-48 text-muted mb-3 d-block"></i>
                      <h5 class="text-muted mb-2">No hay facturas registradas</h5>
                      <p class="text-muted small">Comienza agregando tu primera factura de compra</p>
                      <button class="btn btn-primary mt-3" @click="openAddPurchaseModal">
                        <i class="ti ti-plus me-2"></i>Nueva Factura
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted mt-3">Cargando facturas...</p>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center mt-3" v-if="pagination.totalPages > 1 && !loading">
            <div class="dataTables_info">
              Mostrando {{ (pagination.currentPage - 1) * pagination.perPage + 1 }} a
              {{ Math.min(pagination.currentPage * pagination.perPage, pagination.totalRecords) }}
              de {{ pagination.totalRecords }} registros
            </div>
            <div class="dataTables_paginate">
              <ul class="pagination mb-0">
                <li class="paginate_button page-item" :class="{ disabled: pagination.currentPage === 1 }">
                  <a href="#" class="page-link" @click.prevent="changePage(pagination.currentPage - 1)">
                    <i class="ti ti-chevron-left"></i>
                  </a>
                </li>
                <li v-for="page in visiblePages" :key="page" class="paginate_button page-item" :class="{ active: page === pagination.currentPage }">
                  <a href="#" class="page-link" @click.prevent="page !== '...' && changePage(page)">{{ page }}</a>
                </li>
                <li class="paginate_button page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
                  <a href="#" class="page-link" @click.prevent="changePage(pagination.currentPage + 1)">
                    <i class="ti ti-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <purchase-invoice-modal
    v-if="showPurchaseModal"
    :is-open="showPurchaseModal"
    :purchase="selectedPurchase"
    @close="closePurchaseModal"
    @save="handleSavePurchase"
  />

  <invoice-image-modal
    v-if="showImageModal"
    :is-open="showImageModal"
    :image-url="selectedImageUrl"
    @close="closeImageModal"
  />

  <purchase-details-modal
    v-if="showDetailsModal"
    :is-open="showDetailsModal"
    :purchase="selectedPurchase"
    @close="closeDetailsModal"
  />
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import PurchaseInvoiceModal from '@/components/modal/purchase-invoice-modal.vue';
import InvoiceImageModal from '@/components/modal/invoice-image-modal.vue';
import PurchaseDetailsModal from '@/components/modal/purchase-details-modal.vue';

export default {
  name: 'PurchaseList',
  components: {
    PurchaseInvoiceModal,
    InvoiceImageModal,
    PurchaseDetailsModal
  },
  data() {
    return {
      purchases: [],
      loading: false,
      filters: {
        search: '',
        date_from: '',
        date_to: '',
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
    this.initializeTooltips();
  },
  methods: {
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar las facturas de compras',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
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

    openAddPurchaseModal() {
      this.selectedPurchase = null;
      this.showPurchaseModal = true;
    },

    viewPurchase(purchase) {
      this.selectedPurchase = purchase;
      this.showDetailsModal = true;
    },

    async editPurchase(purchase) {
      try {
        const response = await axios.get(`/api/purchases/${purchase.id}`);
        this.selectedPurchase = response.data.data;
        this.showPurchaseModal = true;
      } catch (error) {
        console.error('Error loading purchase:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar la factura'
        });
      }
    },

    viewInvoiceImage(purchase) {
      if (purchase.invoice_image) {
        this.selectedImageUrl = `/api/purchases/invoice-image/${purchase.invoice_image}`;
        this.showImageModal = true;
      }
    },

    confirmDelete(purchase) {
      Swal.fire({
        title: '¿Estás seguro?',
        html: `¿Deseas eliminar la factura <strong>${purchase.invoice_number || purchase.purchase_number}</strong>?<br><small class="text-muted">Esta acción no se puede deshacer</small>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="ti ti-trash me-1"></i> Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then(async (result) => {
        if (result.isConfirmed) {
          await this.deletePurchase(purchase.id);
        }
      });
    },

    async deletePurchase(id) {
      try {
        await axios.delete(`/api/purchases/${id}`);

        Swal.fire({
          icon: 'success',
          title: '¡Eliminada!',
          text: 'Factura eliminada exitosamente',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });

        this.loadPurchases();
        this.loadStatistics();
      } catch (error) {
        console.error('Error deleting purchase:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar la factura'
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
      document.getElementById('collapse-header')?.classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    },

    async exportToPDF() {
      Swal.fire({
        icon: 'info',
        title: 'Exportar a PDF',
        text: 'Función en desarrollo',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
    },

    async exportToExcel() {
      Swal.fire({
        icon: 'info',
        title: 'Exportar a Excel',
        text: 'Función en desarrollo',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
    },

    initializeTooltips() {
      setTimeout(() => {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new window.bootstrap.Tooltip(tooltipTriggerEl);
        });
      }, 500);
    }
  },
  watch: {
    'filters.date_from'() {
      this.loadStatistics();
    },
    'filters.date_to'() {
      this.loadStatistics();
    }
  }
};
</script>

<style scoped>
.dash-widget-header {
  display: flex;
  align-items: center;
  color: #fff;
}

.dash-widget-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin-right: 15px;
}

.dash-widget-icon i {
  font-size: 24px;
}

.dash-count {
  flex: 1;
}

.dash-title {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 5px;
}

.dash-counts p {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.color-info {
  border-radius: 10px;
  transition: transform 0.2s;
}

.color-info:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.empty-state {
  padding: 40px 20px;
}

.badge {
  font-size: 11px;
  padding: 5px 10px;
  font-weight: 600;
}

.action-table-data a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-table-data a:hover {
  transform: scale(1.1);
}

.input-blocks label {
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 8px;
  font-size: 13px;
}

.thead-light th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 13px;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
  font-size: 14px;
}

.pagination .page-link {
  border-radius: 5px;
  margin: 0 2px;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}
</style>
