<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Clientes</h4>
            <h6>Administra los clientes del sistema</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="loadCustomers" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
              ><i class="ti ti-refresh"></i
            ></a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Colapsar" id="collapse-header" @click="toggleHeader"><i class="ti ti-chevron-up"></i></a>
          </li>
        </ul>
        <div class="page-btn">
          <a
            href="#"
            class="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#add-customer"
            @click="openAddModal"
            ><i class="ti ti-circle-plus me-1"></i>Agregar Nuevo Cliente</a
          >
        </div>
      </div>

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

      <!-- Customers Table -->
      <div v-else class="card table-list-card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table datanew">
              <thead>
                <tr>
                  <th @click="sortBy('codigo')" style="cursor: pointer">
                    Código <i :class="getSortIcon('codigo')"></i>
                  </th>
                  <th @click="sortBy('nombre')" style="cursor: pointer">
                    Nombre <i :class="getSortIcon('nombre')"></i>
                  </th>
                  <th @click="sortBy('is_active')" style="cursor: pointer">
                    Estado <i :class="getSortIcon('is_active')"></i>
                  </th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="customers.length === 0">
                  <td colspan="4" class="text-center">No hay clientes registrados</td>
                </tr>
                <tr v-for="customer in customers" :key="customer.id">
                  <td>{{ customer.codigo || '-' }}</td>
                  <td>{{ customer.nombre || '-' }}</td>
                  <td>
                    <span :class="customer.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ customer.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openViewModal(customer)"
                        data-bs-toggle="modal"
                        data-bs-target="#view-customer"
                        title="Ver detalles"
                      >
                        <i data-feather="eye" class="feather-eye"></i>
                      </a>
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(customer)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-customer"
                        title="Editar"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(customer)"
                        data-bs-toggle="modal"
                        data-bs-target="#delete-customer-modal"
                        title="Eliminar"
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
  <customer-modal
    :customer="selectedCustomer"
    :is-edit="isEditMode"
    @customer-saved="onCustomerSaved"
    @customer-deleted="onCustomerDeleted"
  ></customer-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      customers: [],
      selectedCustomer: null,
      isEditMode: false,
      loading: false,
      error: null,
      sortColumn: null,
      sortDirection: 'asc'
    };
  },
  mounted() {
    this.loadCustomers();
  },
  methods: {
    async loadCustomers() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/customers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // La respuesta viene en response.data.data
        this.customers = Array.isArray(response.data.data) ? response.data.data : [];
      } catch (error) {
        console.error('Error loading customers:', error);
        this.error = 'Error al cargar los clientes';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedCustomer = null;
      this.isEditMode = false;
    },

    openViewModal(customer) {
      this.selectedCustomer = { ...customer };
    },

    openEditModal(customer) {
      this.selectedCustomer = { ...customer };
      this.isEditMode = true;
    },

    openDeleteModal(customer) {
      this.selectedCustomer = customer;
    },

    onCustomerSaved() {
      this.loadCustomers();
    },

    onCustomerDeleted() {
      this.loadCustomers();
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },

    sortBy(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }

      this.customers.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];

        // Handle null/undefined values
        if (valueA === null || valueA === undefined) valueA = '';
        if (valueB === null || valueB === undefined) valueB = '';

        // Convert to lowercase for string comparison
        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();

        if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    },

    getSortIcon(column) {
      if (this.sortColumn !== column) {
        return 'ti ti-selector';
      }
      return this.sortDirection === 'asc' ? 'ti ti-arrow-up' : 'ti ti-arrow-down';
    },
  },
};
</script>
