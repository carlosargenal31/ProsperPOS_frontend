<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Países</h4>
            <h6>Administra los países del sistema</h6>
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
            <a @click="loadCountries" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
            data-bs-target="#add-country"
            @click="openAddModal"
            ><i class="ti ti-circle-plus me-1"></i>Agregar Nuevo País</a
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

      <!-- Countries Table -->
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
                  <th @click="sortBy('codigo_iso')" style="cursor: pointer;">
                    Código ISO <i :class="getSortIcon('codigo_iso')"></i>
                  </th>
                  <th @click="sortBy('states_count')" style="cursor: pointer;">
                    Departamentos <i :class="getSortIcon('states_count')"></i>
                  </th>
                  <th @click="sortBy('is_active')" style="cursor: pointer;">
                    Estado <i :class="getSortIcon('is_active')"></i>
                  </th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="sortedCountries.length === 0">
                  <td colspan="6" class="text-center">No hay países registrados</td>
                </tr>
                <tr v-for="country in sortedCountries" :key="country.id">
                  <td>{{ country.id }}</td>
                  <td>{{ country.nombre }}</td>
                  <td>{{ country.codigo_iso || '-' }}</td>
                  <td>{{ country.states_count || 0 }}</td>
                  <td>
                    <span :class="country.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ country.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openViewModal(country)"
                        data-bs-toggle="modal"
                        data-bs-target="#view-country"
                        title="Ver detalles"
                      >
                        <i data-feather="eye" class="feather-eye"></i>
                      </a>
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(country)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-country"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(country)"
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
  <country-modal
    :country="selectedCountry"
    :is-edit="isEditMode"
    @country-saved="onCountrySaved"
    @country-deleted="onCountryDeleted"
  ></country-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import { exportToPDF as exportPDF, exportToExcel as exportExcel } from '@/utils/exportUtils';

export default {
  data() {
    return {
      countries: [],
      selectedCountry: null,
      isEditMode: false,
      loading: false,
      error: null,
      sortColumn: 'id',
      sortDirection: 'asc'
    };
  },
  computed: {
    sortedCountries() {
      if (!this.countries || this.countries.length === 0) return [];

      const sorted = [...this.countries].sort((a, b) => {
        let aVal = a[this.sortColumn];
        let bVal = b[this.sortColumn];

        // Handle null values
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';

        // Convert to string for comparison if needed
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
    this.loadCountries();
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
    async loadCountries() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/countries', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.countries = response.data.data || [];
      } catch (error) {
        console.error('Error loading countries:', error);
        this.error = 'Error al cargar los países';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedCountry = null;
      this.isEditMode = false;
    },

    openEditModal(country) {
      this.selectedCountry = { ...country };
      this.isEditMode = true;
    },

    openViewModal(country) {
      this.selectedCountry = { ...country };
    },

    openDeleteModal(country) {
      this.selectedCountry = country;
    },

    onCountrySaved() {
      this.loadCountries();
    },

    onCountryDeleted() {
      this.loadCountries();
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
          { header: 'Código ISO', dataKey: 'codigo_iso' },
          { header: 'Estado', dataKey: 'is_active' }
        ];

        const data = this.sortedCountries.map(country => ({
          ...country,
          is_active: country.is_active ? 'Activo' : 'Inactivo'
        }));

        exportPDF(data, columns, 'paises', 'Lista de Países');

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
          { header: 'Código ISO', dataKey: 'codigo_iso' },
          { header: 'Estado', dataKey: 'is_active' }
        ];

        const data = this.sortedCountries.map(country => ({
          ...country,
          is_active: country.is_active ? 'Activo' : 'Inactivo'
        }));

        exportExcel(data, columns, 'paises', 'Países');

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
