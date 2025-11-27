<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <i class="ti ti-users"></i>
          Seleccionar Cliente
        </h3>
        <button class="btn-close" @click="$emit('close')">
          <i class="ti ti-x"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Search -->
        <div class="search-box">
          <i class="ti ti-search"></i>
          <input
            ref="searchInput"
            type="text"
            v-model="searchQuery"
            @input="searchCustomers"
            placeholder="Buscar por nombre, RTN o teléfono..."
            class="search-input"
          />
        </div>

        <!-- Quick Select -->
        <div class="quick-select">
          <button
            @click="selectConsumidorFinal"
            class="customer-card default"
          >
            <div class="customer-avatar">
              <i class="ti ti-user"></i>
            </div>
            <div class="customer-details">
              <h4>CONSUMIDOR FINAL</h4>
              <p>Cliente genérico</p>
            </div>
            <i class="ti ti-check" v-if="!selectedCustomer"></i>
          </button>
        </div>

        <!-- Customer List -->
        <div class="customer-list">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando clientes...</p>
          </div>

          <div v-else-if="customers.length === 0" class="empty-state">
            <i class="ti ti-user-off"></i>
            <p>{{ searchQuery ? 'No se encontraron clientes' : 'No hay clientes registrados' }}</p>
            <button @click="showNewCustomerForm" class="btn-new">
              <i class="ti ti-plus"></i>
              Nuevo Cliente
            </button>
          </div>

          <div v-else class="customers-grid">
            <button
              v-for="customer in customers"
              :key="customer.id"
              @click="$emit('select', customer)"
              :class="['customer-card', { selected: selectedCustomer?.id === customer.id }]"
            >
              <div class="customer-avatar">
                {{ customer.name.charAt(0).toUpperCase() }}
              </div>
              <div class="customer-details">
                <h4>{{ customer.name }}</h4>
                <p v-if="customer.rtn">RTN: {{ customer.rtn }}</p>
                <p v-if="customer.phone">
                  <i class="ti ti-phone"></i>
                  {{ customer.phone }}
                </p>
              </div>
              <i class="ti ti-check" v-if="selectedCustomer?.id === customer.id"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="showNewCustomerForm" class="btn-secondary">
          <i class="ti ti-plus"></i>
          Nuevo Cliente
        </button>
        <button @click="$emit('close')" class="btn-primary">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const props = defineProps({
  selectedCustomer: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'select']);

const searchQuery = ref('');
const searchInput = ref(null);
const customers = ref([]);
const loading = ref(false);

const searchCustomers = async () => {
  if (searchQuery.value.length < 2) {
    loadCustomers();
    return;
  }

  loading.value = true;
  try {
    const response = await axios.get('/api/v1/customers', {
      params: {
        search: searchQuery.value,
        limit: 20
      }
    });

    customers.value = response.data.data || [];
  } catch (error) {
    console.error('Error searching customers:', error);
    Swal.fire('Error', 'Error al buscar clientes', 'error');
  } finally {
    loading.value = false;
  }
};

const loadCustomers = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/v1/customers', {
      params: {
        limit: 20,
        page: 1
      }
    });

    customers.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading customers:', error);
  } finally {
    loading.value = false;
  }
};

const selectConsumidorFinal = () => {
  emit('select', null);
};

const showNewCustomerForm = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'Nuevo Cliente',
    html: `
      <input id="swal-name" class="swal2-input" placeholder="Nombre *" required>
      <input id="swal-rtn" class="swal2-input" placeholder="RTN (opcional)">
      <input id="swal-phone" class="swal2-input" placeholder="Teléfono">
      <input id="swal-email" class="swal2-input" type="email" placeholder="Email">
      <textarea id="swal-address" class="swal2-textarea" placeholder="Dirección"></textarea>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Crear',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const name = document.getElementById('swal-name').value;
      if (!name) {
        Swal.showValidationMessage('El nombre es requerido');
        return false;
      }

      return {
        name,
        rtn: document.getElementById('swal-rtn').value,
        phone: document.getElementById('swal-phone').value,
        email: document.getElementById('swal-email').value,
        address: document.getElementById('swal-address').value
      };
    }
  });

  if (formValues) {
    try {
      const response = await axios.post('/api/v1/customers', formValues);
      Swal.fire('¡Éxito!', 'Cliente creado exitosamente', 'success');

      const newCustomer = response.data.data;
      customers.value.unshift(newCustomer);
      emit('select', newCustomer);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al crear el cliente', 'error');
    }
  }
};

onMounted(() => {
  loadCustomers();
  searchInput.value?.focus();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #3b82f6;
  background: white;
}

.search-box i {
  font-size: 1.25rem;
  color: #9ca3af;
  margin-right: 0.75rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  outline: none;
}

.quick-select {
  margin-bottom: 1rem;
}

.customer-list {
  min-height: 300px;
}

.customers-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.customer-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.customer-card:hover {
  border-color: #3b82f6;
  background: #f9fafb;
}

.customer-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.customer-card.default {
  border-color: #10b981;
  background: #d1fae5;
}

.customer-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.customer-card.default .customer-avatar {
  background: #10b981;
}

.customer-details {
  flex: 1;
  min-width: 0;
}

.customer-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-details p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.customer-card .ti-check {
  font-size: 1.5rem;
  color: #3b82f6;
  flex-shrink: 0;
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
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.btn-new {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-new:hover {
  background: #2563eb;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary {
  background: white;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-primary {
  background: #3b82f6;
  border: none;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
