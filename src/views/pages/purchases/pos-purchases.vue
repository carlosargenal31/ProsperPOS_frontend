<template>
  <div class="main-wrapper">
    <layout-header></layout-header>
    <layout-sidebar></layout-sidebar>

    <div class="page-wrapper">
      <div class="content">
        <div class="page-header">
          <div class="add-item d-flex">
            <div class="page-title">
              <h4>📄 Documentos Compras</h4>
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
                  <label>Proveedor</label>
                  <select class="form-select" v-model="filters.supplier_id" @change="loadPurchases">
                    <option value="">Todos los proveedores</option>
                    <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.nombre">
                      {{ supplier.nombre }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-lg-3 col-sm-6">
                <div class="input-blocks">
                  <label>Buscar</label>
                  <input type="text" class="form-control" v-model="filters.search" @input="debouncedSearch" placeholder="Proveedor, N° Factura...">
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
                    <th style="width: 12%;">Fecha</th>
                    <th style="width: 20%;">N° Factura</th>
                    <th style="width: 25%;">Proveedor</th>
                    <th class="text-end" style="width: 12%;">Subtotal</th>
                    <th class="text-end" style="width: 10%;">ISV</th>
                    <th class="text-end" style="width: 12%;">Total</th>
                    <th class="text-center" style="width: 12%;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="purchase in purchases" :key="purchase.id" style="height: 70px;">
                    <td class="align-middle">
                      <span class="text-muted">{{ formatDate(purchase.purchase_date) }}</span>
                    </td>
                    <td class="align-middle">
                      <span class="fw-semibold">{{ purchase.invoice_number || purchase.purchase_number }}</span>
                    </td>
                    <td class="align-middle">
                      <div class="productimgname">
                        <span class="text-dark fw-medium">{{ purchase.supplier_name }}</span>
                      </div>
                    </td>
                    <td class="text-end align-middle">L {{ formatCurrency(purchase.net_amount) }}</td>
                    <td class="text-end text-info align-middle">L {{ formatCurrency(purchase.tax_amount) }}</td>
                    <td class="text-end fw-bold text-primary align-middle">L {{ formatCurrency(purchase.total_amount) }}</td>
                    <td class="align-middle">
                      <div class="d-flex justify-content-center">
                        <div class="edit-delete-action d-flex align-items-center">
                          <a class="me-2 p-2 d-flex align-items-center border rounded" href="javascript:void(0);" @click="viewPurchaseDocument(purchase)" title="Ver Documento">
                            <i class="ti ti-eye"></i>
                          </a>
                          <a class="me-2 p-2 d-flex align-items-center border rounded" href="javascript:void(0);" @click="editPurchase(purchase)" title="Editar">
                            <i class="ti ti-edit"></i>
                          </a>
                          <a class="p-2 d-flex align-items-center border rounded" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete-modal" @click="selectPurchaseForDelete(purchase)" title="Eliminar">
                            <i class="ti ti-trash text-danger"></i>
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="purchases.length === 0">
                    <td colspan="7" class="text-center py-5">
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

    <!-- Modal de Visualización de Documento de Compra -->
    <div class="modal fade" :class="{ show: showDocumentsModal }" :style="{ display: showDocumentsModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-md">
        <div class="modal-content">
          <div class="modal-header bg-white py-3">
            <h5 class="modal-title mb-0">Detalles de Factura de Compra</h5>
            <button type="button" class="btn-close" @click="closeDocumentsModal"></button>
          </div>

          <div class="modal-body py-3 px-4">
            <div v-if="selectedPurchase">
              <!-- Información del Documento -->
              <div class="mb-4">
                <div class="row mb-2">
                  <div class="col-6">
                    <label class="text-muted small mb-1">N° Factura</label>
                    <div class="fw-semibold">{{ selectedPurchase.invoice_number || selectedPurchase.purchase_number }}</div>
                  </div>
                  <div class="col-6 text-end">
                    <label class="text-muted small mb-1">Fecha</label>
                    <div class="fw-semibold">{{ formatDate(selectedPurchase.purchase_date) }}</div>
                  </div>
                </div>
              </div>

              <!-- Información del Proveedor -->
              <div class="mb-4">
                <label class="text-muted small mb-1">Proveedor</label>
                <div class="fw-semibold mb-1">{{ selectedPurchase.supplier_name }}</div>
                <div class="text-muted small" v-if="selectedPurchase.supplier_id_number">
                  RTN/ID: {{ selectedPurchase.supplier_id_number }}
                </div>
              </div>

              <!-- Totales -->
              <div class="border-top pt-3">
                <div class="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span class="fw-semibold">L {{ formatCurrency(selectedPurchase.net_amount) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>ISV 15%:</span>
                  <span class="fw-semibold">L {{ formatCurrency(selectedPurchase.tax_amount) }}</span>
                </div>
                <div class="d-flex justify-content-between border-top pt-2 mt-2">
                  <span class="h5 mb-0">TOTAL:</span>
                  <span class="h5 mb-0 text-primary">L {{ formatCurrency(selectedPurchase.total_amount) }}</span>
                </div>
              </div>

              <!-- Notas -->
              <div v-if="selectedPurchase.notes" class="mt-4 p-3 bg-light rounded">
                <label class="text-muted small mb-1">Notas</label>
                <div>{{ selectedPurchase.notes }}</div>
              </div>
            </div>
          </div>

          <div class="modal-footer py-2">
            <button type="button" class="btn btn-secondary" @click="closeDocumentsModal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDocumentsModal" @click="closeDocumentsModal"></div>

    <!-- Modal de confirmación de eliminación -->
    <div
      class="modal fade"
      id="delete-modal"
      tabindex="-1"
      aria-labelledby="deleteModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body text-center">
            <div class="avatar avatar-xl bg-danger-transparent rounded-circle mb-3 mx-auto">
              <i class="ti ti-trash text-danger" style="font-size: 2rem;"></i>
            </div>
            <h5 class="modal-title mb-2" id="deleteModalLabel">
              ¿Confirmar eliminación?
            </h5>
            <p class="text-muted mb-0" v-if="purchaseToDelete">
              ¿Estás seguro que deseas eliminar la factura
              <strong>"{{ purchaseToDelete.invoice_number || purchaseToDelete.purchase_number }}"</strong>?
            </p>
            <p class="text-muted small mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div class="modal-footer border-0 justify-content-center">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deletePurchase"
              :disabled="deleting"
            >
              <span v-if="deleting">
                <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                Eliminando...
              </span>
              <span v-else>
                <i class="ti ti-trash me-1"></i>
                Sí, eliminar
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import PurchaseInvoiceModal from '@/components/modal/purchase-invoice-modal.vue';
import InvoiceImageModal from '@/components/modal/invoice-image-modal.vue';
import PurchaseDetailsModal from '@/components/modal/purchase-details-modal.vue';

// Configurar interceptor de axios para agregar token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  name: 'PosPurchases',
  components: {
    PurchaseInvoiceModal,
    InvoiceImageModal,
    PurchaseDetailsModal
  },
  data() {
    return {
      purchases: [],
      suppliers: [],
      loading: false,
      filters: {
        search: '',
        supplier_id: '',
        date_from: '2025-11-01',
        date_to: '2025-11-30',
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
      showDocumentsModal: false,
      selectedPurchase: null,
      selectedImageUrl: '',
      searchTimeout: null,
      purchaseToDelete: null,
      deleting: false
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
    this.loadSuppliers();
    this.initializeTooltips();
  },
  methods: {
    async loadPurchases() {
      this.loading = true;
      try {
        const response = await axios.get('/api/v1/purchases', {
          params: this.filters
        });

        // Handle different response structures
        let purchasesData = [];

        // Check if response.data.data is an array (direct data)
        if (Array.isArray(response.data.data)) {
          purchasesData = response.data.data;
        }
        // Check if response.data.data.data exists (paginated data)
        else if (response.data.data && Array.isArray(response.data.data.data)) {
          purchasesData = response.data.data.data;
        }
        // Fallback to empty array
        else {
          purchasesData = [];
        }

        // Filter out any null or invalid purchases
        this.purchases = purchasesData.filter(p => p && p.id);
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
        const response = await axios.get('/api/v1/purchases/reports/purchase-book', {
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

    async loadSuppliers() {
      try {
        const response = await axios.get('/api/v1/suppliers');
        this.suppliers = response.data.data || [];
      } catch (error) {
        console.error('Error loading suppliers:', error);
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

    editPurchase(purchase) {
      this.selectedPurchase = purchase;
      this.showPurchaseModal = true;
    },

    viewPurchaseDocument(purchase) {
      this.selectedPurchase = purchase;
      this.showDocumentsModal = true;
    },

    closeDocumentsModal() {
      this.showDocumentsModal = false;
      this.selectedPurchase = null;
    },

    selectPurchaseForDelete(purchase) {
      this.purchaseToDelete = purchase;
    },

    async deletePurchase() {
      if (!this.purchaseToDelete) return;

      this.deleting = true;
      try {
        await axios.delete(`/api/v1/purchases/${this.purchaseToDelete.id}`);

        // Cerrar el modal completamente y eliminar TODOS los backdrops
        const modal = document.getElementById('delete-modal');

        if (modal) {
          modal.classList.remove('show');
          modal.style.display = 'none';
          modal.setAttribute('aria-hidden', 'true');
          modal.removeAttribute('aria-modal');
        }

        // Eliminar TODOS los backdrops que puedan existir
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // Limpiar clases y estilos del body
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');

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
      } finally {
        this.deleting = false;
        this.purchaseToDelete = null;
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
      // Extract date parts directly from the string to avoid timezone issues
      const datePart = dateString.split('T')[0]; // Get YYYY-MM-DD part
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    },

    formatCurrency(amount) {
      if (!amount) return '0.00';
      return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
      this.$nextTick(() => {
        // Bootstrap tooltips are already initialized globally
        // No need to manually initialize if bootstrap is properly loaded
        // This method can be left empty or removed
      });
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
