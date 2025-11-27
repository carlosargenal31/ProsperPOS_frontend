<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div class="header-left">
        <h1>
          <i class="ti ti-file-purchase"></i>
          Compras
        </h1>
        <p class="subtitle">Gestión de compras y documentos de compra</p>
      </div>
      <div class="header-actions">
        <button @click="refreshList" class="btn-icon" title="Actualizar">
          <i class="ti ti-refresh"></i>
        </button>
        <button @click="$router.push('/pos-5')" class="btn-primary">
          <i class="ti ti-plus"></i>
          Nueva Compra
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <i class="ti ti-file-purchase"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.total_purchases || 0 }}</h3>
          <p>Total Compras</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <i class="ti ti-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.paid_count || 0 }}</h3>
          <p>Pagadas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <i class="ti ti-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.pending_count || 0 }}</h3>
          <p>Pendientes</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red">
          <i class="ti ti-alert-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.overdue_count || 0 }}</h3>
          <p>Vencidas</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="search-box">
          <i class="ti ti-search"></i>
          <input
            type="text"
            v-model="filters.search"
            @input="searchPurchases"
            placeholder="Buscar por número de compra o proveedor..."
          />
        </div>

        <select v-model="filters.payment_status" @change="loadPurchases" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="paid">Pagado</option>
          <option value="pending">Pendiente</option>
          <option value="partial">Pago Parcial</option>
          <option value="overdue">Vencido</option>
          <option value="cancelled">Cancelado</option>
        </select>

        <select v-model="filters.purchase_type" @change="loadPurchases" class="filter-select">
          <option value="">Todos los tipos</option>
          <option value="compra">Compra</option>
          <option value="cotizacion">Cotización</option>
          <option value="compra_en_espera">Compra en Espera</option>
          <option value="pedido">Pedido</option>
        </select>

        <div class="date-filters">
          <input
            type="date"
            v-model="filters.date_from"
            @change="loadPurchases"
            class="date-input"
            placeholder="Desde"
          />
          <input
            type="date"
            v-model="filters.date_to"
            @change="loadPurchases"
            class="date-input"
            placeholder="Hasta"
          />
        </div>

        <button @click="clearFilters" class="btn-secondary">
          <i class="ti ti-x"></i>
          Limpiar
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando compras...</p>
      </div>

      <div v-else-if="purchases.length === 0" class="empty-state">
        <i class="ti ti-file-purchase"></i>
        <p>No se encontraron compras</p>
        <button @click="$router.push('/pos-5')" class="btn-primary">
          <i class="ti ti-plus"></i>
          Crear Primera Compra
        </button>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>No. Compra</th>
            <th>Proveedor</th>
            <th>Fecha</th>
            <th>Vencimiento</th>
            <th>Total</th>
            <th>Pagado</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="purchase in purchases" :key="purchase.id">
            <td>
              <span class="purchase-number">{{ purchase.purchase_number }}</span>
              <span class="purchase-type">{{ getTypeLabel(purchase.purchase_type) }}</span>
            </td>
            <td>
              <div class="supplier-cell">
                <strong>{{ purchase.supplier_name }}</strong>
                <span v-if="purchase.supplier_rtn" class="small">RTN: {{ purchase.supplier_rtn }}</span>
              </div>
            </td>
            <td>{{ formatDate(purchase.issue_date) }}</td>
            <td>
              <span v-if="purchase.due_date" :class="getDueDateClass(purchase)">
                {{ formatDate(purchase.due_date) }}
                <span v-if="purchase.days_overdue > 0" class="overdue-badge">
                  +{{ purchase.days_overdue }}d
                </span>
              </span>
              <span v-else class="text-muted">N/A</span>
            </td>
            <td class="amount">L {{ formatPrice(purchase.total) }}</td>
            <td class="amount">L {{ formatPrice(purchase.paid_amount) }}</td>
            <td>
              <span :class="getStatusClass(purchase.payment_status)">
                {{ getStatusLabel(purchase.payment_status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="viewPurchase(purchase)" class="btn-action" title="Ver">
                  <i class="ti ti-eye"></i>
                </button>
                <button v-if="purchase.payment_status !== 'paid'" @click="recordPayment(purchase)" class="btn-action green" title="Registrar Pago">
                  <i class="ti ti-cash"></i>
                </button>
                <button @click="printPurchase(purchase)" class="btn-action orange" title="Imprimir">
                  <i class="ti ti-printer"></i>
                </button>
                <button v-if="purchase.payment_status === 'pending' && purchase.paid_amount === 0" @click="deletePurchase(purchase)" class="btn-action red" title="Eliminar">
                  <i class="ti ti-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="pagination">
      <button
        @click="changePage(pagination.currentPage - 1)"
        :disabled="!pagination.hasPrevPage"
        class="btn-page"
      >
        <i class="ti ti-chevron-left"></i>
        Anterior
      </button>

      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="['btn-page-number', { active: page === pagination.currentPage }]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="changePage(pagination.currentPage + 1)"
        :disabled="!pagination.hasNextPage"
        class="btn-page"
      >
        Siguiente
        <i class="ti ti-chevron-right"></i>
      </button>
    </div>

    <!-- Modals -->
    <PurchaseDetailModal
      v-if="showDetailModal"
      :purchase-id="selectedPurchaseId"
      @close="showDetailModal = false"
      @payment-recorded="handlePaymentRecorded"
    />

    <PaymentRecordModal
      v-if="showPaymentModal"
      :purchase="selectedPurchase"
      @close="showPaymentModal = false"
      @payment-saved="handlePaymentSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import PurchaseDetailModal from './PurchaseDetailModal.vue';
import PaymentRecordModal from './PaymentRecordModal.vue';

const router = useRouter();

// State
const purchases = ref([]);
const stats = ref({});
const loading = ref(false);
const filters = ref({
  search: '',
  payment_status: '',
  purchase_type: '',
  date_from: '',
  date_to: '',
  page: 1,
  limit: 20
});

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  hasNextPage: false,
  hasPrevPage: false
});

const showDetailModal = ref(false);
const selectedPurchaseId = ref(null);

const showPaymentModal = ref(false);
const selectedPurchase = ref(null);

// Computed
const visiblePages = computed(() => {
  const pages = [];
  const current = pagination.value.currentPage;
  const total = pagination.value.totalPages;

  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Methods
const loadPurchases = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/v1/billing/purchases', {
      params: filters.value
    });

    purchases.value = response.data.data || [];
    pagination.value = response.data.pagination || {};
  } catch (error) {
    console.error('Error loading purchases:', error);
    Swal.fire('Error', 'Error al cargar las compras', 'error');
  } finally {
    loading.value = false;
  }
};

const loadStatistics = async () => {
  try {
    const response = await axios.get('/api/v1/billing/statistics', {
      params: {
        date_from: filters.value.date_from,
        date_to: filters.value.date_to
      }
    });

    stats.value = response.data.data || {};
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
};

const searchPurchases = () => {
  filters.value.page = 1;
  loadPurchases();
};

const clearFilters = () => {
  filters.value = {
    search: '',
    payment_status: '',
    purchase_type: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 20
  };
  loadPurchases();
  loadStatistics();
};

const changePage = (page) => {
  filters.value.page = page;
  loadPurchases();
};

const refreshList = () => {
  loadPurchases();
  loadStatistics();
};

const viewPurchase = (purchase) => {
  selectedPurchaseId.value = purchase.id;
  showDetailModal.value = true;
};

const recordPayment = (purchase) => {
  selectedPurchase.value = purchase;
  showPaymentModal.value = true;
};

const printPurchase = async (purchase) => {
  try {
    const response = await axios.get(`/api/v1/billing/purchases/${purchase.id}/print`);
    // Open print window or generate PDF
    window.open(`/print-purchase/${purchase.id}`, '_blank');
  } catch (error) {
    Swal.fire('Error', 'Error al preparar la compra para imprimir', 'error');
  }
};

const deletePurchase = async (purchase) => {
  const result = await Swal.fire({
    title: '¿Eliminar compra?',
    text: `Se eliminará la compra ${purchase.purchase_number}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/v1/billing/purchases/${purchase.id}`);
      Swal.fire('¡Eliminado!', 'Compra eliminada exitosamente', 'success');
      loadPurchases();
      loadStatistics();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al eliminar la compra', 'error');
    }
  }
};

const handlePaymentRecorded = () => {
  showDetailModal.value = false;
  loadPurchases();
  loadStatistics();
};

const handlePaymentSaved = () => {
  showPaymentModal.value = false;
  loadPurchases();
  loadStatistics();
};

const getTypeLabel = (type) => {
  const types = {
    compra: 'Compra',
    cotizacion: 'Cotización',
    compra_en_espera: 'En Espera',
    pedido: 'Pedido',
    operacion_en_espera: 'Operación en Espera'
  };
  return types[type] || type;
};

const getStatusLabel = (status) => {
  const statuses = {
    paid: 'Pagado',
    pending: 'Pendiente',
    partial: 'Parcial',
    overdue: 'Vencido',
    cancelled: 'Cancelado'
  };
  return statuses[status] || status;
};

const getStatusClass = (status) => {
  return `badge badge-${status}`;
};

const getDueDateClass = (purchase) => {
  if (purchase.days_overdue > 0) {
    return 'due-date overdue';
  } else if (purchase.days_overdue >= -7) {
    return 'due-date soon';
  }
  return 'due-date';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2);
};

// Lifecycle
onMounted(() => {
  loadPurchases();
  loadStatistics();
});
</script>

<style scoped>
.page-wrapper {
  padding: 1.5rem;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-left h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-icon,
.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
}

.btn-icon {
  padding: 0.75rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: white;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.btn-secondary:hover {
  background: #f9fafb;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-icon.green {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.red {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Filters */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.search-box i {
  color: #9ca3af;
  margin-right: 0.75rem;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
}

.filter-select,
.date-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  outline: none;
}

.date-filters {
  display: flex;
  gap: 0.5rem;
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead th {
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: left;
}

.data-table tbody td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #1f2937;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.purchase-number {
  display: block;
  font-weight: 600;
  color: #3b82f6;
}

.purchase-type {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.supplier-cell strong {
  display: block;
}

.supplier-cell .small {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.amount {
  font-weight: 600;
  text-align: right;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.badge-paid {
  background: #d1fae5;
  color: #065f46;
}

.badge-pending {
  background: #fef3c7;
  color: #92400e;
}

.badge-partial {
  background: #dbeafe;
  color: #1e40af;
}

.badge-overdue {
  background: #fee2e2;
  color: #991b1b;
}

.badge-cancelled {
  background: #f3f4f6;
  color: #4b5563;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.due-date.overdue {
  color: #dc2626;
  font-weight: 600;
}

.due-date.soon {
  color: #f59e0b;
}

.overdue-badge {
  padding: 0.125rem 0.5rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 2rem;
  height: 2rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 1rem;
  color: #6b7280;
}

.btn-action:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-action.green:hover {
  border-color: #10b981;
  color: #10b981;
}

.btn-action.orange:hover {
  border-color: #f59e0b;
  color: #f59e0b;
}

.btn-action.red:hover {
  border-color: #ef4444;
  color: #ef4444;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.btn-page,
.btn-page-number {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-page:hover:not(:disabled),
.btn-page-number:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-page-number.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.text-muted {
  color: #9ca3af;
}
</style>
