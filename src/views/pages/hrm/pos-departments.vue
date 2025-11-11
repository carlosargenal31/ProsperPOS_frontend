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
            <a @click="loadDepartments" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
            data-bs-target="#add-department"
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

      <!-- Departments Table -->
      <div v-else class="card table-list-card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table datanew">
              <thead>
                <tr>
                  <th @click="sortBy('id')" style="cursor: pointer">
                    ID <i :class="getSortIcon('id')"></i>
                  </th>
                  <th @click="sortBy('nombre')" style="cursor: pointer">
                    Nombre <i :class="getSortIcon('nombre')"></i>
                  </th>
                  <th @click="sortBy('descripcion')" style="cursor: pointer">
                    Descripción <i :class="getSortIcon('descripcion')"></i>
                  </th>
                  <th @click="sortBy('positions_count')" style="cursor: pointer">
                    Cargos <i :class="getSortIcon('positions_count')"></i>
                  </th>
                  <th @click="sortBy('employees_count')" style="cursor: pointer">
                    Empleados <i :class="getSortIcon('employees_count')"></i>
                  </th>
                  <th @click="sortBy('is_active')" style="cursor: pointer">
                    Estado <i :class="getSortIcon('is_active')"></i>
                  </th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="departments.length === 0">
                  <td colspan="7" class="text-center">No hay departamentos registrados</td>
                </tr>
                <tr v-for="department in departments" :key="department.id">
                  <td>{{ department.id }}</td>
                  <td>{{ department.nombre }}</td>
                  <td>{{ department.descripcion || '-' }}</td>
                  <td>{{ department.positions_count || 0 }}</td>
                  <td>{{ department.employees_count || 0 }}</td>
                  <td>
                    <span :class="department.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ department.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(department)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-department"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(department)"
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
  <department-modal
    :department="selectedDepartment"
    :is-edit="isEditMode"
    @department-saved="onDepartmentSaved"
    @department-deleted="onDepartmentDeleted"
  ></department-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      departments: [],
      selectedDepartment: null,
      isEditMode: false,
      loading: false,
      error: null,
      sortColumn: null,
      sortDirection: 'asc'
    };
  },
  mounted() {
    this.loadDepartments();
  },
  methods: {
    async loadDepartments() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/departments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.departments = response.data.data || [];
      } catch (error) {
        console.error('Error loading departments:', error);
        this.error = 'Error al cargar los departamentos';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedDepartment = null;
      this.isEditMode = false;
    },

    openEditModal(department) {
      this.selectedDepartment = { ...department };
      this.isEditMode = true;
    },

    openDeleteModal(department) {
      this.selectedDepartment = department;
    },

    onDepartmentSaved() {
      this.loadDepartments();
    },

    onDepartmentDeleted() {
      this.loadDepartments();
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

      this.departments.sort((a, b) => {
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
