<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Bodegas</h4>
            <h6>Administra las bodegas del sistema</h6>
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
            <a @click="loadWarehouses" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
            data-bs-target="#add-warehouse"
            @click="openAddModal"
            ><i class="ti ti-circle-plus me-1"></i>Agregar Nueva Bodega</a
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

      <!-- Warehouses Table -->
      <div v-else class="card table-list-card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table datanew">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Encargado</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="warehouses.length === 0">
                  <td colspan="6" class="text-center">No hay bodegas registradas</td>
                </tr>
                <tr v-for="warehouse in warehouses" :key="warehouse.id">
                  <td>{{ warehouse.id }}</td>
                  <td>{{ warehouse.nombre }}</td>
                  <td>{{ warehouse.encargado || '-' }}</td>
                  <td>{{ warehouse.ubicacion || '-' }}</td>
                  <td>
                    <span :class="warehouse.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ warehouse.is_active ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openViewModal(warehouse)"
                        data-bs-toggle="modal"
                        data-bs-target="#view-warehouse"
                        title="Ver detalles"
                      >
                        <i data-feather="eye" class="feather-eye"></i>
                      </a>
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(warehouse)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-warehouse"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(warehouse)"
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
  <warehouse-modal
    :warehouse="selectedWarehouse"
    :is-edit="isEditMode"
    @warehouse-saved="onWarehouseSaved"
    @warehouse-deleted="onWarehouseDeleted"
  ></warehouse-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import { exportToPDF as exportPDF, exportToExcel as exportExcel } from '@/utils/exportUtils';

export default {
  data() {
    return {
      warehouses: [],
      selectedWarehouse: null,
      isEditMode: false,
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadWarehouses();
  },
  methods: {
    async loadWarehouses() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/warehouses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.warehouses = response.data.data || [];
      } catch (error) {
        console.error('Error loading warehouses:', error);
        this.error = 'Error al cargar las bodegas';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedWarehouse = null;
      this.isEditMode = false;
    },

    openEditModal(warehouse) {
      this.selectedWarehouse = { ...warehouse };
      this.isEditMode = true;
    },

    openViewModal(warehouse) {
      this.selectedWarehouse = { ...warehouse };
    },

    openDeleteModal(warehouse) {
      this.selectedWarehouse = warehouse;
    },

    onWarehouseSaved() {
      this.loadWarehouses();
    },

    onWarehouseDeleted() {
      this.loadWarehouses();
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
          { header: 'Encargado', dataKey: 'encargado' },
          { header: 'Ubicación', dataKey: 'ubicacion' },
          { header: 'Estado', dataKey: 'is_active' }
        ];

        const data = this.warehouses.map(warehouse => ({
          ...warehouse,
          is_active: warehouse.is_active ? 'Activo' : 'Inactivo'
        }));

        exportPDF(data, columns, 'bodegas', 'Lista de Bodegas');

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
          { header: 'Encargado', dataKey: 'encargado' },
          { header: 'Ubicación', dataKey: 'ubicacion' },
          { header: 'Estado', dataKey: 'is_active' }
        ];

        const data = this.warehouses.map(warehouse => ({
          ...warehouse,
          is_active: warehouse.is_active ? 'Activo' : 'Inactivo'
        }));

        exportExcel(data, columns, 'bodegas', 'Bodegas');

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
