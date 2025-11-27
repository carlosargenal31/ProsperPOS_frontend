<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content settings-content">
      <div class="page-header settings-pg-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Ajustes</h4>
            <h6>Administra los tipos de beneficiarios del sistema</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="exportToPDF" data-bs-toggle="tooltip" data-bs-placement="top" title="PDF">
              <img src="@/assets/img/icons/pdf.svg" alt="PDF" />
            </a>
          </li>
          <li>
            <a @click="exportToExcel" data-bs-toggle="tooltip" data-bs-placement="top" title="Excel">
              <img src="@/assets/img/icons/excel.svg" alt="Excel" />
            </a>
          </li>
          <li>
            <a @click="loadBeneficiaryTypes" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
              ><i class="ti ti-refresh"></i
            ></a>
          </li>
          <li>
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Colapsar"
              id="collapse-header"
              @click="toggleHeader"
              ><i class="ti ti-chevron-up"></i
            ></a>
          </li>
        </ul>
      </div>
      <div class="row">
        <div class="col-xl-12">
          <div class="settings-wrapper d-flex">
            <settings-sidebar></settings-sidebar>
            <div class="card flex-fill mb-0 w-50">
              <div class="card-header d-flex align-items-center justify-content-between">
                <h4>Tipos de Beneficiarios</h4>
                <div class="page-btn">
                  <a
                    href="#"
                    class="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add-beneficiary-type"
                    @click="openAddModal"
                    ><i class="ti ti-circle-plus me-1"></i>Agregar Nuevo Tipo</a
                  >
                </div>
              </div>
              <div class="card-body">
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

                <!-- Table -->
                <div v-else class="table-responsive">
                  <table class="table border">
                    <thead class="thead-light">
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th class="no-sort text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="beneficiaryTypes.length === 0">
                        <td colspan="4" class="text-center">No hay tipos de beneficiarios registrados</td>
                      </tr>
                      <tr v-for="type in beneficiaryTypes" :key="type.id">
                        <td>{{ type.id }}</td>
                        <td>{{ type.nombre }}</td>
                        <td>
                          <span :class="type.is_active ? 'badge bg-success' : 'badge bg-danger'">
                            {{ type.is_active ? 'Activo' : 'Inactivo' }}
                          </span>
                        </td>
                        <td class="action-table-data justify-content-end">
                          <div class="edit-delete-action">
                            <a
                              class="me-2 p-2"
                              href="#"
                              @click.prevent="openViewModal(type)"
                              data-bs-toggle="modal"
                              data-bs-target="#view-beneficiary-type"
                              title="Ver detalles"
                            >
                              <i data-feather="eye" class="feather-eye"></i>
                            </a>
                            <a
                              class="me-2 p-2"
                              href="#"
                              @click.prevent="openEditModal(type)"
                              data-bs-toggle="modal"
                              data-bs-target="#edit-beneficiary-type"
                            >
                              <i data-feather="edit" class="feather-edit"></i>
                            </a>
                            <a
                              class="p-2"
                              href="javascript:void(0);"
                              @click.prevent="openDeleteModal(type)"
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
      </div>
    </div>
    <div
      class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3"
    >
      <p class="mb-0 text-gray-9">
        {{ new Date().getFullYear() }} &copy; ProsperPOS. Todos los derechos reservados
      </p>
      <p>
        Diseñado &amp Desarrollado Por
        <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a>
      </p>
    </div>
  </div>
  <beneficiary-type-settings-modal
    :beneficiary-type="selectedBeneficiaryType"
    :is-edit="isEditMode"
    @beneficiary-type-saved="onBeneficiaryTypeSaved"
    @beneficiary-type-deleted="onBeneficiaryTypeDeleted"
  ></beneficiary-type-settings-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import { exportToPDF as exportPDF, exportToExcel as exportExcel } from '@/utils/exportUtils';

export default {
  data() {
    return {
      beneficiaryTypes: [],
      selectedBeneficiaryType: null,
      isEditMode: false,
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadBeneficiaryTypes();
  },
  methods: {
    async loadBeneficiaryTypes() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/beneficiary-types', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.beneficiaryTypes = response.data.data || [];
      } catch (error) {
        console.error('Error loading beneficiary types:', error);
        this.error = 'Error al cargar los tipos de beneficiarios';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedBeneficiaryType = null;
      this.isEditMode = false;
    },

    openEditModal(type) {
      this.selectedBeneficiaryType = { ...type };
      this.isEditMode = true;
    },

    openViewModal(type) {
      this.selectedBeneficiaryType = { ...type };
    },

    openDeleteModal(type) {
      this.selectedBeneficiaryType = type;
    },

    onBeneficiaryTypeSaved() {
      this.loadBeneficiaryTypes();
    },

    onBeneficiaryTypeDeleted() {
      this.loadBeneficiaryTypes();
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },

    exportToPDF() {
      if (!this.beneficiaryTypes || this.beneficiaryTypes.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin datos',
          text: 'No hay datos para exportar',
          confirmButtonColor: '#667eea'
        });
        return;
      }

      const exportData = this.beneficiaryTypes.map(item => ({
        'ID': item.id || '',
        'Nombre': item.nombre || '',
        'Estado': item.is_active ? 'Activo' : 'Inactivo'
      }));

      exportPDF(exportData, 'tipos-beneficiarios', 'Lista de Tipos de Beneficiarios');
    },

    exportToExcel() {
      if (!this.beneficiaryTypes || this.beneficiaryTypes.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin datos',
          text: 'No hay datos para exportar',
          confirmButtonColor: '#667eea'
        });
        return;
      }

      const exportData = this.beneficiaryTypes.map(item => ({
        'ID': item.id || '',
        'Nombre': item.nombre || '',
        'Estado': item.is_active ? 'Activo' : 'Inactivo'
      }));

      exportExcel(exportData, 'tipos-beneficiarios');
    },
  },
};
</script>
