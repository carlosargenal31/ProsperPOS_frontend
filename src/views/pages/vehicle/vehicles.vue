<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Vehículos</h4>
            <h6>Administra los vehículos del sistema</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="loadVehicles" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
            data-bs-target="#add-vehicle"
            @click="openAddModal"
            ><i class="ti ti-circle-plus me-1"></i>Agregar Nuevo Vehículo</a
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

      <!-- Vehicles Table -->
      <div v-else class="card table-list-card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table datanew">
              <thead>
                <tr>
                  <th @click="sortBy('id')" style="cursor: pointer;">
                    ID <i :class="getSortIcon('id')"></i>
                  </th>
                  <th @click="sortBy('placa')" style="cursor: pointer;">
                    Placa <i :class="getSortIcon('placa')"></i>
                  </th>
                  <th @click="sortBy('marca')" style="cursor: pointer;">
                    Marca <i :class="getSortIcon('marca')"></i>
                  </th>
                  <th @click="sortBy('modelo')" style="cursor: pointer;">
                    Modelo <i :class="getSortIcon('modelo')"></i>
                  </th>
                  <th @click="sortBy('color')" style="cursor: pointer;">
                    Color <i :class="getSortIcon('color')"></i>
                  </th>
                  <th @click="sortBy('is_active')" style="cursor: pointer;">
                    Estado <i :class="getSortIcon('is_active')"></i>
                  </th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="sortedVehicles.length === 0">
                  <td colspan="7" class="text-center">No hay vehículos registrados</td>
                </tr>
                <tr v-for="vehicle in sortedVehicles" :key="vehicle.id">
                  <td>{{ vehicle.id }}</td>
                  <td>{{ vehicle.placa }}</td>
                  <td>{{ vehicle.marca }}</td>
                  <td>{{ vehicle.modelo }}</td>
                  <td>{{ vehicle.color }}</td>
                  <td>
                    <span :class="vehicle.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ vehicle.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(vehicle)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-vehicle"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(vehicle)"
                        data-bs-toggle="modal"
                        data-bs-target="#delete-modal"
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
  <vehicle-modal
    :vehicle="selectedVehicle"
    :is-edit="isEditMode"
    @vehicle-saved="onVehicleSaved"
    @vehicle-deleted="onVehicleDeleted"
  ></vehicle-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      vehicles: [],
      selectedVehicle: null,
      isEditMode: false,
      loading: false,
      error: null,
      sortColumn: 'id',
      sortDirection: 'asc'
    };
  },
  computed: {
    sortedVehicles() {
      if (!this.vehicles || !Array.isArray(this.vehicles) || this.vehicles.length === 0) return [];

      const sorted = [...this.vehicles].sort((a, b) => {
        let aVal = a[this.sortColumn];
        let bVal = b[this.sortColumn];

        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      return sorted;
    }
  },
  mounted() {
    this.loadVehicles();
  },
  methods: {
    sortBy(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    getSortIcon(column) {
      if (this.sortColumn !== column) return 'ti ti-selector';
      return this.sortDirection === 'asc' ? 'ti ti-sort-ascending' : 'ti ti-sort-descending';
    },
    async loadVehicles() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/vehicles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Response from API:', response.data);

        // Asegurarse que vehicles sea un array
        if (response.data && response.data.data) {
          // Si data es un objeto, convertirlo en array con un elemento
          if (Array.isArray(response.data.data)) {
            this.vehicles = response.data.data;
          } else if (typeof response.data.data === 'object') {
            this.vehicles = [response.data.data];
          } else {
            this.vehicles = [];
          }
        } else {
          this.vehicles = [];
        }

        console.log('Vehicles loaded:', this.vehicles);
      } catch (error) {
        console.error('Error loading vehicles:', error);
        this.error = 'Error al cargar los vehículos';
        this.vehicles = [];
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedVehicle = null;
      this.isEditMode = false;
    },

    openEditModal(vehicle) {
      this.selectedVehicle = { ...vehicle };
      this.isEditMode = true;
    },

    openDeleteModal(vehicle) {
      this.selectedVehicle = vehicle;
    },

    onVehicleSaved() {
      this.loadVehicles();
    },

    onVehicleDeleted() {
      this.loadVehicles();
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },
  },
};
</script>
