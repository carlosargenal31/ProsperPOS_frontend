<template>
  <div class="billing-dashboard">
    <div class="dashboard-header">
      <h1>
        <i class="ti ti-chart-bar"></i>
        Dashboard de Facturación
      </h1>
      <div class="date-selector">
        <input type="date" v-model="filters.date_from" @change="loadData" class="date-input" />
        <span>a</span>
        <input type="date" v-model="filters.date_to" @change="loadData" class="date-input" />
        <button @click="setToday" class="btn-today">Hoy</button>
        <button @click="setThisMonth" class="btn-month">Este Mes</button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">
          <i class="ti ti-file-invoice"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.total_invoices || 0 }}</h3>
          <p>Total Facturas</p>
          <span class="stat-detail">L {{ formatPrice(stats.total_amount || 0) }}</span>
        </div>
      </div>

      <div class="stat-card green">
        <div class="stat-icon">
          <i class="ti ti-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.paid_count || 0 }}</h3>
          <p>Facturas Pagadas</p>
          <span class="stat-detail">L {{ formatPrice(stats.total_paid || 0) }}</span>
        </div>
      </div>

      <div class="stat-card orange">
        <div class="stat-icon">
          <i class="ti ti-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.pending_count || 0 }}</h3>
          <p>Pendientes</p>
          <span class="stat-detail">L {{ formatPrice(stats.total_outstanding || 0) }}</span>
        </div>
      </div>

      <div class="stat-card red">
        <div class="stat-icon">
          <i class="ti ti-alert-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.overdue_count || 0 }}</h3>
          <p>Vencidas</p>
          <span class="stat-detail">Requieren atención</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card">
        <h3>Facturas por Estado</h3>
        <div class="coming-soon">
          <i class="ti ti-chart-pie"></i>
          <p>Gráfica de estadísticas próximamente</p>
        </div>
      </div>

      <div class="chart-card">
        <h3>Ingresos del Mes</h3>
        <div class="coming-soon">
          <i class="ti ti-chart-line"></i>
          <p>Gráfica de ingresos próximamente</p>
        </div>
      </div>
    </div>

    <!-- Recent Invoices -->
    <div class="recent-section">
      <div class="section-header">
        <h3>Facturas Recientes</h3>
        <button @click="$router.push('/billing/invoices')" class="btn-view-all">
          Ver Todas
          <i class="ti ti-arrow-right"></i>
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
      </div>

      <table v-else-if="recentInvoices.length > 0" class="recent-table">
        <thead>
          <tr>
            <th>Factura</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in recentInvoices" :key="invoice.id">
            <td><strong>{{ invoice.invoice_number }}</strong></td>
            <td>{{ invoice.customer_name }}</td>
            <td>{{ formatDate(invoice.issue_date) }}</td>
            <td class="amount">L {{ formatPrice(invoice.total) }}</td>
            <td>
              <span :class="getStatusClass(invoice.payment_status)">
                {{ getStatusLabel(invoice.payment_status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <i class="ti ti-file-invoice"></i>
        <p>No hay facturas recientes</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const router = useRouter();

const stats = ref({});
const recentInvoices = ref([]);
const loading = ref(false);

const filters = ref({
  date_from: '',
  date_to: ''
});

const setToday = () => {
  const today = new Date().toISOString().split('T')[0];
  filters.value.date_from = today;
  filters.value.date_to = today;
  loadData();
};

const setThisMonth = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  filters.value.date_from = firstDay;
  filters.value.date_to = lastDay;
  loadData();
};

const loadData = async () => {
  loading.value = true;
  try {
    const [statsResponse, invoicesResponse] = await Promise.all([
      axios.get('/api/v1/billing/statistics', { params: filters.value }),
      axios.get('/api/v1/billing/invoices', { params: { limit: 10, page: 1 } })
    ]);

    stats.value = statsResponse.data.data || {};
    recentInvoices.value = invoicesResponse.data.data || [];
  } catch (error) {
    console.error('Error loading dashboard:', error);
    Swal.fire('Error', 'Error al cargar el dashboard', 'error');
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-HN');
};

const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2);
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

onMounted(() => {
  setThisMonth();
});
</script>

<style scoped>
.billing-dashboard {
  padding: 1.5rem;
  background: #f5f7fa;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.date-input {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
}

.btn-today,
.btn-month {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-today:hover,
.btn-month:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

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

.stat-card.blue .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-card.green .stat-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-card.orange .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-card.red .stat-icon {
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

.stat-detail {
  font-size: 0.875rem;
  color: #3b82f6;
  font-weight: 600;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.coming-soon i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.recent-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.btn-view-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-view-all:hover {
  background: #2563eb;
}

.recent-table {
  width: 100%;
  border-collapse: collapse;
}

.recent-table thead th {
  padding: 0.75rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: left;
}

.recent-table tbody td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #1f2937;
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

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
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
</style>
