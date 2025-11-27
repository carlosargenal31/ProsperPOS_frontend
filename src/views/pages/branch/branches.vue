<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Sucursales</h4>
            <h6>Administra las sucursales del sistema</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="exportToPDF" data-bs-toggle="tooltip" data-bs-placement="top" title="PDF">
              <img src="@/assets/img/icons/pdf.svg" alt="img" />
            </a>
          </li>
          <li>
            <a @click="exportToExcel" data-bs-toggle="tooltip" data-bs-placement="top" title="Excel">
              <img src="@/assets/img/icons/excel.svg" alt="img" />
            </a>
          </li>
          <li>
            <a @click="loadBranches" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
            data-bs-target="#add-branch"
            @click="openAddModal"
            ><i class="ti ti-circle-plus me-1"></i>Agregar Nueva Sucursal</a
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

      <!-- Branches Table -->
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
                  <th @click="sortBy('city_name')" style="cursor: pointer;">
                    Ciudad <i :class="getSortIcon('city_name')"></i>
                  </th>
                  <th @click="sortBy('state_name')" style="cursor: pointer;">
                    Departamento <i :class="getSortIcon('state_name')"></i>
                  </th>
                  <th @click="sortBy('gerente')" style="cursor: pointer;">
                    Gerente <i :class="getSortIcon('gerente')"></i>
                  </th>
                  <th @click="sortBy('telefono')" style="cursor: pointer;">
                    Teléfono <i :class="getSortIcon('telefono')"></i>
                  </th>
                  <th @click="sortBy('is_active')" style="cursor: pointer;">
                    Estado <i :class="getSortIcon('is_active')"></i>
                  </th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="sortedBranches.length === 0">
                  <td colspan="8" class="text-center">No hay sucursales registradas</td>
                </tr>
                <tr v-for="branch in sortedBranches" :key="branch.id">
                  <td>{{ branch.id }}</td>
                  <td>{{ branch.nombre }}</td>
                  <td>{{ branch.city_name || '-' }}</td>
                  <td>{{ branch.state_name || '-' }}</td>
                  <td>{{ branch.gerente || '-' }}</td>
                  <td>{{ branch.telefono || '-' }}</td>
                  <td>
                    <span :class="branch.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ branch.is_active ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openViewModal(branch)"
                        data-bs-toggle="modal"
                        data-bs-target="#view-branch"
                        title="Ver detalles"
                      >
                        <i data-feather="eye" class="feather-eye"></i>
                      </a>
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(branch)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-branch"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(branch)"
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
  <branch-modal
    :branch="selectedBranch"
    :is-edit="isEditMode"
    @branch-saved="onBranchSaved"
    @branch-deleted="onBranchDeleted"
  ></branch-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import { exportToPDF as exportPDF, exportToExcel as exportExcel } from '@/utils/exportUtils';

export default {
  data() {
    return {
      branches: [],
      selectedBranch: null,
      isEditMode: false,
      loading: false,
      error: null,
      sortColumn: 'id',
      sortDirection: 'asc'
    };
  },
  computed: {
    sortedBranches() {
      if (!this.branches || !Array.isArray(this.branches) || this.branches.length === 0) return [];

      const sorted = [...this.branches].sort((a, b) => {
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
    this.loadBranches();
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
    async loadBranches() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/branches', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Response from API:', response.data);

        // Asegurarse que branches sea un array
        if (response.data && response.data.data) {
          // Si data es un objeto, convertirlo en array con un elemento
          if (Array.isArray(response.data.data)) {
            this.branches = response.data.data;
          } else if (typeof response.data.data === 'object') {
            this.branches = [response.data.data];
          } else {
            this.branches = [];
          }
        } else {
          this.branches = [];
        }

        console.log('Branches loaded:', this.branches);
      } catch (error) {
        console.error('Error loading branches:', error);
        this.error = 'Error al cargar las sucursales';
        this.branches = [];
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedBranch = null;
      this.isEditMode = false;
    },

    openEditModal(branch) {
      this.selectedBranch = { ...branch };
      this.isEditMode = true;
    },

    openViewModal(branch) {
      this.selectedBranch = { ...branch };
    },

    openDeleteModal(branch) {
      this.selectedBranch = branch;
    },

    onBranchSaved() {
      this.loadBranches();
    },

    onBranchDeleted() {
      this.loadBranches();
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },

    exportToPDF() {
      try {
        const columns = [
          { header: 'ID', dataKey: 'id' },
          { header: 'Nombre', dataKey: 'nombre' },
          { header: 'Ciudad', dataKey: 'city_name' },
          { header: 'Departamento', dataKey: 'state_name' },
          { header: 'Gerente', dataKey: 'gerente' },
          { header: 'Teléfono', dataKey: 'telefono' },
          { header: 'Estado', dataKey: 'is_active' }
        ];

        const data = this.sortedBranches.map(branch => ({
          ...branch,
          is_active: branch.is_active ? 'Activa' : 'Inactiva'
        }));

        exportPDF(data, columns, 'sucursales', 'Lista de Sucursales');

        Swal.fire({
          icon: 'success',
          title: 'PDF Generado',
          text: 'El archivo PDF se ha descargado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al exportar PDF:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el archivo PDF'
        });
      }
    },

    exportToExcel() {
      try {
        const columns = [
          { header: 'ID', dataKey: 'id' },
          { header: 'Nombre', dataKey: 'nombre' },
          { header: 'Ciudad', dataKey: 'city_name' },
          { header: 'Departamento', dataKey: 'state_name' },
          { header: 'Gerente', dataKey: 'gerente' },
          { header: 'Teléfono', dataKey: 'telefono' },
          { header: 'Estado', dataKey: 'is_active' }
        ];

        const data = this.sortedBranches.map(branch => ({
          ...branch,
          is_active: branch.is_active ? 'Activa' : 'Inactiva'
        }));

        exportExcel(data, columns, 'sucursales', 'Sucursales');

        Swal.fire({
          icon: 'success',
          title: 'Excel Generado',
          text: 'El archivo Excel se ha descargado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al exportar Excel:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el archivo Excel'
        });
      }
    },
  },
};
</script>
