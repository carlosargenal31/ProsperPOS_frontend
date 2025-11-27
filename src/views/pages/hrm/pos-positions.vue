<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Cargos/Puestos</h4>
            <h6>Administra los cargos del sistema</h6>
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
            <a @click="loadPositions" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
            data-bs-target="#add-position"
            @click="openAddModal"
            ><i class="ti ti-circle-plus me-1"></i>Agregar Nuevo Cargo</a
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

      <!-- Positions Table -->
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
                  <th @click="sortBy('department_name')" style="cursor: pointer">
                    Departamento <i :class="getSortIcon('department_name')"></i>
                  </th>
                  <th @click="sortBy('descripcion')" style="cursor: pointer">
                    Descripción <i :class="getSortIcon('descripcion')"></i>
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
                <tr v-if="positions.length === 0">
                  <td colspan="7" class="text-center">No hay cargos registrados</td>
                </tr>
                <tr v-for="position in positions" :key="position.id">
                  <td>{{ position.id }}</td>
                  <td>{{ position.nombre }}</td>
                  <td>{{ position.department_name || '-' }}</td>
                  <td>{{ position.descripcion || '-' }}</td>
                  <td>{{ position.employees_count || 0 }}</td>
                  <td>
                    <span :class="position.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ position.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openViewModal(position)"
                        data-bs-toggle="modal"
                        data-bs-target="#view-position"
                        title="Ver detalles"
                      >
                        <i data-feather="eye" class="feather-eye"></i>
                      </a>
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(position)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-position"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(position)"
                        data-bs-toggle="modal"
                        data-bs-target="#delete-position-modal"
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
  <position-modal
    :position="selectedPosition"
    :is-edit="isEditMode"
    @position-saved="onPositionSaved"
    @position-deleted="onPositionDeleted"
  ></position-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import { exportToPDF as exportPDF, exportToExcel as exportExcel } from '@/utils/exportUtils';

export default {
  data() {
    return {
      positions: [],
      selectedPosition: null,
      isEditMode: false,
      loading: false,
      error: null,
      sortColumn: null,
      sortDirection: 'asc'
    };
  },
  mounted() {
    this.loadPositions();
  },
  methods: {
    async loadPositions() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/positions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.positions = response.data.data || [];
      } catch (error) {
        console.error('Error loading positions:', error);
        this.error = 'Error al cargar los cargos';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedPosition = null;
      this.isEditMode = false;
    },

    openEditModal(position) {
      this.selectedPosition = { ...position };
      this.isEditMode = true;
    },

    openViewModal(position) {
      this.selectedPosition = { ...position };
    },

    openDeleteModal(position) {
      this.selectedPosition = position;
    },

    onPositionSaved() {
      this.loadPositions();
    },

    onPositionDeleted() {
      this.loadPositions();
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

      this.positions.sort((a, b) => {
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

    exportToPDF() {
      try {
        const columns = [
          { header: 'ID', dataKey: 'id' },
          { header: 'Nombre', dataKey: 'nombre' },
          { header: 'Departamento', dataKey: 'department_name' },
          { header: 'Estado', dataKey: 'is_active' }
        ];

        const data = this.positions.map(position => ({
          ...position,
          is_active: position.is_active ? 'Activo' : 'Inactivo'
        }));

        exportPDF(data, columns, 'cargos', 'Lista de Cargos');

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
          { header: 'Departamento', dataKey: 'department_name' },
          { header: 'Estado', dataKey: 'is_active' }
        ];

        const data = this.positions.map(position => ({
          ...position,
          is_active: position.is_active ? 'Activo' : 'Inactivo'
        }));

        exportExcel(data, columns, 'cargos', 'Cargos');

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
