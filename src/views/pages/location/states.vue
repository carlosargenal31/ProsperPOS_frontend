<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Departamentos</h4>
            <h6>Administra los departamentos del sistema</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="loadStates" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
            data-bs-target="#add-state"
            @click="openAddModal"
            ><i class="ti ti-circle-plus me-1"></i>Agregar Nuevo Departamento</a
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

      <!-- States Table -->
      <div v-else class="card table-list-card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table datanew">
              <thead>
                <tr>
                  <th @click="sortBy('id')" style="cursor: pointer;">
                    ID <i :class="getSortIcon('id')"></i>
                  </th>
                  <th @click="sortBy('nombre')" style="cursor: pointer;">
                    Nombre <i :class="getSortIcon('nombre')"></i>
                  </th>
                  <th @click="sortBy('country_name')" style="cursor: pointer;">
                    País <i :class="getSortIcon('country_name')"></i>
                  </th>
                  <th @click="sortBy('is_active')" style="cursor: pointer;">
                    Estado <i :class="getSortIcon('is_active')"></i>
                  </th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="sortedStates.length === 0">
                  <td colspan="5" class="text-center">No hay departamentos registrados</td>
                </tr>
                <tr v-for="state in sortedStates" :key="state.id">
                  <td>{{ state.id }}</td>
                  <td>{{ state.nombre }}</td>
                  <td>{{ state.country_name || '-' }}</td>
                  <td>
                    <span :class="state.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ state.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(state)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-state"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(state)"
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
  <state-modal
    :state="selectedState"
    :is-edit="isEditMode"
    @state-saved="onStateSaved"
    @state-deleted="onStateDeleted"
  ></state-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      states: [],
      selectedState: null,
      isEditMode: false,
      loading: false,
      error: null,
      sortColumn: 'id',
      sortDirection: 'asc'
    };
  },
  computed: {
    sortedStates() {
      if (!this.states || this.states.length === 0) return [];

      const sorted = [...this.states].sort((a, b) => {
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
    this.loadStates();
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
    async loadStates() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/states', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.states = response.data.data || [];
      } catch (error) {
        console.error('Error loading states:', error);
        this.error = 'Error al cargar los departamentos';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedState = null;
      this.isEditMode = false;
    },

    openEditModal(state) {
      this.selectedState = { ...state };
      this.isEditMode = true;
    },

    openDeleteModal(state) {
      this.selectedState = state;
    },

    onStateSaved() {
      this.loadStates();
    },

    onStateDeleted() {
      this.loadStates();
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },
  },
};
</script>
