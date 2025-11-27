<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Lista de Proveedores</h4>
            <h6>Administra tus proveedores</h6>
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
            <a @click="loadSuppliers" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
            data-bs-target="#add-supplier"
            @click="openAddModal"
            ><i class="ti ti-circle-plus me-1"></i>Agregar Proveedor</a
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

      <!-- Suppliers Table -->
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
                  <th @click="sortBy('tipo_proveedor')" style="cursor: pointer;">
                    Tipo Proveedor <i :class="getSortIcon('tipo_proveedor')"></i>
                  </th>
                  <th @click="sortBy('doc_identificacion')" style="cursor: pointer;">
                    Doc. Identificación <i :class="getSortIcon('doc_identificacion')"></i>
                  </th>
                  <th @click="sortBy('tipo_beneficiario')" style="cursor: pointer;">
                    Tipo Beneficiario <i :class="getSortIcon('tipo_beneficiario')"></i>
                  </th>
                  <th @click="sortBy('is_active')" style="cursor: pointer;">
                    Estado <i :class="getSortIcon('is_active')"></i>
                  </th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="sortedSuppliers.length === 0">
                  <td colspan="7" class="text-center">No hay proveedores registrados</td>
                </tr>
                <tr v-for="supplier in sortedSuppliers" :key="supplier.id">
                  <td>{{ supplier.id }}</td>
                  <td>{{ supplier.nombre }}</td>
                  <td>{{ supplier.tipo_proveedor || '-' }}</td>
                  <td>{{ supplier.doc_identificacion || '-' }}</td>
                  <td>
                    <span v-if="supplier.beneficiary_type_name" class="badge bg-info">
                      {{ supplier.beneficiary_type_name }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <span :class="supplier.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ supplier.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openViewModal(supplier)"
                        data-bs-toggle="modal"
                        data-bs-target="#view-supplier"
                        title="Ver detalles"
                      >
                        <i data-feather="eye" class="feather-eye"></i>
                      </a>
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(supplier)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-supplier"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(supplier)"
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
  <supplier-modal
    :supplier="selectedSupplier"
    :is-edit="isEditMode"
    @supplier-saved="onSupplierSaved"
    @supplier-deleted="onSupplierDeleted"
  ></supplier-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import { exportToPDF as exportPDF, exportToExcel as exportExcel } from '@/utils/exportUtils';

export default {
  data() {
    return {
      suppliers: [],
      selectedSupplier: null,
      isEditMode: false,
      loading: false,
      error: null,
      sortColumn: 'id',
      sortDirection: 'asc'
    };
  },
  computed: {
    sortedSuppliers() {
      if (!this.suppliers || !Array.isArray(this.suppliers) || this.suppliers.length === 0) return [];

      const sorted = [...this.suppliers].sort((a, b) => {
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
    this.loadSuppliers();
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
    async loadSuppliers() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/suppliers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Response from API:', response.data);

        // Asegurarse que suppliers sea un array
        if (response.data && response.data.data) {
          // Si data es un objeto, convertirlo en array con un elemento
          if (Array.isArray(response.data.data)) {
            this.suppliers = response.data.data;
          } else if (typeof response.data.data === 'object') {
            this.suppliers = [response.data.data];
          } else {
            this.suppliers = [];
          }
        } else {
          this.suppliers = [];
        }

        console.log('Suppliers loaded:', this.suppliers);
      } catch (error) {
        console.error('Error loading suppliers:', error);
        this.error = 'Error al cargar los proveedores';
        this.suppliers = [];
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedSupplier = null;
      this.isEditMode = false;
    },

    openEditModal(supplier) {
      this.selectedSupplier = { ...supplier };
      this.isEditMode = true;
    },

    openViewModal(supplier) {
      this.selectedSupplier = { ...supplier };
    },

    openDeleteModal(supplier) {
      this.selectedSupplier = supplier;
    },

    onSupplierSaved() {
      this.loadSuppliers();
    },

    onSupplierDeleted() {
      this.loadSuppliers();
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
          { header: 'Tipo Proveedor', dataKey: 'tipo_proveedor' },
          { header: 'Doc. Identificación', dataKey: 'doc_identificacion' },
          { header: 'Tipo Beneficiario', dataKey: 'beneficiary_type_name' },
          { header: 'Estado', dataKey: 'is_active' }
        ];

        const data = this.sortedSuppliers.map(supplier => ({
          ...supplier,
          is_active: supplier.is_active ? 'Activo' : 'Inactivo'
        }));

        exportPDF(data, columns, 'proveedores', 'Lista de Proveedores');

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
          { header: 'Tipo Proveedor', dataKey: 'tipo_proveedor' },
          { header: 'Doc. Identificación', dataKey: 'doc_identificacion' },
          { header: 'Tipo Beneficiario', dataKey: 'beneficiary_type_name' },
          { header: 'Estado', dataKey: 'is_active' }
        ];

        const data = this.sortedSuppliers.map(supplier => ({
          ...supplier,
          is_active: supplier.is_active ? 'Activo' : 'Inactivo'
        }));

        exportExcel(data, columns, 'proveedores', 'Proveedores');

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
