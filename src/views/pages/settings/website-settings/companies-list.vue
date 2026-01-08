<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content settings-content">
      <div class="page-header settings-pg-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Ajustes</h4>
            <h6>Administra las empresas del sistema</h6>
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
            <a @click="loadCompanies" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
            <div class="card flex-fill mb-0">
              <div class="card-header d-flex align-items-center justify-content-between">
                <h4>Empresas</h4>
                <div class="page-btn">
                  <a
                    href="#"
                    class="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add-company"
                    @click="openAddModal"
                    ><i class="ti ti-circle-plus me-1"></i>Agregar Nueva Empresa</a
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
                        <th>Logo</th>
                        <th>Empresa</th>
                        <th>RTN</th>
                        <th>Ciudad</th>
                        <th>Teléfono</th>
                        <th>Estatus</th>
                        <th>Predeterminada</th>
                        <th class="no-sort text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="companies.length === 0">
                        <td colspan="8" class="text-center">No hay empresas registradas</td>
                      </tr>
                      <tr v-for="company in companies" :key="company.id">
                        <td>
                          <img
                            v-if="company.logo_url"
                            :src="company.logo_url"
                            alt="Logo"
                            style="width: 40px; height: 40px; object-fit: contain;"
                          />
                          <span v-else class="badge bg-secondary">Sin logo</span>
                        </td>
                        <td>
                          <div>
                            <strong>{{ company.name }}</strong>
                            <br />
                            <small class="text-muted">{{ company.commercial_name }}</small>
                          </div>
                        </td>
                        <td>{{ company.rtn || 'N/A' }}</td>
                        <td>{{ company.city }}, {{ company.state }}</td>
                        <td>{{ company.phone || 'N/A' }}</td>
                        <td>
                          <span :class="company.is_active ? 'badge bg-success' : 'badge bg-danger'">
                            {{ company.is_active ? 'ACTIVO' : 'INACTIVO' }}
                          </span>
                        </td>
                        <td>
                          <span v-if="company.is_default" class="badge bg-primary">
                            <i class="ti ti-star me-1"></i>PREDETERMINADA
                          </span>
                          <a
                            v-else
                            href="#"
                            @click.prevent="setAsDefault(company)"
                            class="badge bg-outline-primary"
                            style="cursor: pointer;"
                          >
                            Establecer como predeterminada
                          </a>
                        </td>
                        <td class="action-table-data justify-content-end">
                          <div class="edit-delete-action">
                            <a
                              class="me-2 p-2"
                              href="#"
                              @click.prevent="openViewModal(company)"
                              data-bs-toggle="modal"
                              data-bs-target="#view-company"
                            >
                              <i data-feather="eye" class="feather-eye"></i>
                            </a>
                            <a
                              class="me-2 p-2"
                              href="#"
                              @click.prevent="openEditModal(company)"
                              data-bs-toggle="modal"
                              data-bs-target="#edit-company"
                            >
                              <i data-feather="edit" class="feather-edit"></i>
                            </a>
                            <a
                              v-if="!company.is_default"
                              class="confirm-text p-2"
                              href="#"
                              @click.prevent="openDeleteModal(company)"
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
  <company-modal
    :company="selectedCompany"
    :is-edit="isEditMode"
    @company-saved="onCompanySaved"
    @company-deleted="onCompanyDeleted"
  ></company-modal>
</template>

<script>
import api from '@/api/config';
import Swal from 'sweetalert2';
import CompanyModal from '@/components/modal/company-modal.vue';
import { exportToPDF as exportPDF, exportToExcel as exportExcel } from '@/utils/exportUtils';

export default {
  components: {
    CompanyModal
  },
  data() {
    return {
      companies: [],
      selectedCompany: null,
      isEditMode: false,
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadCompanies();
  },
  methods: {
    async loadCompanies() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/companies');
        this.companies = response.data.data || response.data || [];
      } catch (error) {
        console.error('Error loading companies:', error);
        this.error = 'Error al cargar las empresas';
        Swal.fire('Error', 'Error al cargar las empresas', 'error');
      } finally {
        this.loading = false;
      }
    },
    openAddModal() {
      this.isEditMode = false;
      this.selectedCompany = {
        name: '',
        commercial_name: '',
        rtn: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        country: 'Honduras',
        state: '',
        city: '',
        facebook: '',
        instagram: '',
        whatsapp: '',
        tiktok: '',
        logo_url: '',
        timezone: 'America/Tegucigalpa',
        date_format: 'DD/MM/YYYY',
        time_format: '12',
        financial_year: new Date().getFullYear(),
        starting_month: 1,
        is_active: true
      };
    },
    openEditModal(company) {
      this.isEditMode = true;
      this.selectedCompany = { ...company };
    },
    openViewModal(company) {
      this.selectedCompany = { ...company };
    },
    openDeleteModal(company) {
      this.selectedCompany = { ...company };
    },
    async setAsDefault(company) {
      try {
        const result = await Swal.fire({
          title: '¿Establecer como predeterminada?',
          text: `La empresa "${company.name}" será la empresa predeterminada del sistema`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, establecer',
          cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
          await api.put(`/companies/${company.id}/set-default`);
          Swal.fire('¡Listo!', 'Empresa establecida como predeterminada', 'success');
          this.loadCompanies();
        }
      } catch (error) {
        console.error('Error setting default company:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al establecer empresa predeterminada', 'error');
      }
    },
    onCompanySaved() {
      this.loadCompanies();
    },
    onCompanyDeleted() {
      this.loadCompanies();
    },
    toggleHeader() {
      const header = document.querySelector('.settings-pg-header');
      if (header) {
        header.classList.toggle('collapsed');
      }
    },
    exportToPDF() {
      const headers = ['Empresa', 'RTN', 'Ciudad', 'Teléfono', 'Estado'];
      const data = this.companies.map(c => [
        c.name,
        c.rtn || 'N/A',
        `${c.city}, ${c.state}`,
        c.phone || 'N/A',
        c.is_active ? 'ACTIVO' : 'INACTIVO'
      ]);
      exportPDF('Empresas', headers, data);
    },
    exportToExcel() {
      const headers = ['Empresa', 'Nombre Comercial', 'RTN', 'Dirección', 'Ciudad', 'Estado', 'Teléfono', 'Email', 'Estado'];
      const data = this.companies.map(c => [
        c.name,
        c.commercial_name || '',
        c.rtn || '',
        c.address || '',
        c.city || '',
        c.state || '',
        c.phone || '',
        c.email || '',
        c.is_active ? 'ACTIVO' : 'INACTIVO'
      ]);
      exportExcel('Empresas', headers, data);
    }
  }
};
</script>

<style scoped>
.settings-pg-header.collapsed {
  display: none;
}
</style>
