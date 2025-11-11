<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content settings-content">
      <div class="page-header settings-pg-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Ajustes</h4>
            <h6>Administra las tasas de impuesto del sistema</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="loadTaxRates" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
                <h4>Tasas de Impuesto</h4>
                <a
                  href="#"
                  class="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#add-tax"
                  @click="openAddModal"
                  ><i class="ti ti-circle-plus me-1"></i>Agregar Nueva Tasa</a
                >
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
                        <th>Nombre</th>
                        <th>Tasa (%)</th>
                        <th>Descripción</th>
                        <th>Productos</th>
                        <th>Estado</th>
                        <th>Creado</th>
                        <th class="no-sort text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="taxRates.length === 0">
                        <td colspan="7" class="text-center">No hay tasas de impuesto registradas</td>
                      </tr>
                      <tr v-for="taxRate in taxRates" :key="taxRate.id">
                        <td>
                          {{ taxRate.name }}
                          <span v-if="taxRate.is_default" class="badge bg-success ms-2">Por defecto</span>
                        </td>
                        <td>{{ taxRate.rate }}%</td>
                        <td>{{ taxRate.description || '-' }}</td>
                        <td>
                          <span class="badge bg-info">{{ taxRate.products_count || 0 }}</span>
                        </td>
                        <td>
                          <span :class="taxRate.is_active ? 'badge bg-success' : 'badge bg-danger'">
                            {{ taxRate.is_active ? 'Activo' : 'Inactivo' }}
                          </span>
                        </td>
                        <td>{{ formatDate(taxRate.created_at) }}</td>
                        <td class="action-table-data justify-content-end">
                          <div class="edit-delete-action">
                            <a
                              class="me-2 p-2"
                              href="#"
                              @click.prevent="openEditModal(taxRate)"
                              data-bs-toggle="modal"
                              data-bs-target="#edit-tax"
                            >
                              <i data-feather="edit" class="feather-edit"></i>
                            </a>
                            <a
                              class="p-2"
                              href="javascript:void(0);"
                              @click.prevent="openDeleteModal(taxRate)"
                              data-bs-toggle="modal"
                              data-bs-target="#delete-modal"
                              :class="{ 'disabled': taxRate.is_default || taxRate.products_count > 0 }"
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
  <tax-rates-modal
    :tax-rate="selectedTaxRate"
    :is-edit="isEditMode"
    @tax-rate-saved="onTaxRateSaved"
    @tax-rate-deleted="onTaxRateDeleted"
  ></tax-rates-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      taxRates: [],
      selectedTaxRate: null,
      isEditMode: false,
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadTaxRates();
  },
  methods: {
    async loadTaxRates() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/tax-rates', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.taxRates = response.data.data || [];
      } catch (error) {
        console.error('Error loading tax rates:', error);
        this.error = 'Error al cargar las tasas de impuesto';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedTaxRate = null;
      this.isEditMode = false;
    },

    openEditModal(taxRate) {
      this.selectedTaxRate = { ...taxRate };
      this.isEditMode = true;
    },

    openDeleteModal(taxRate) {
      if (taxRate.is_default) {
        Swal.fire({
          icon: 'warning',
          title: 'No se puede eliminar',
          text: 'No se puede eliminar la tasa de impuesto por defecto',
          confirmButtonColor: '#ffc107'
        });
        return;
      }
      if (taxRate.products_count > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No se puede eliminar',
          text: `Esta tasa tiene ${taxRate.products_count} producto(s) asociado(s). Primero debes reasignar esos productos a otra tasa.`,
          confirmButtonColor: '#ffc107'
        });
        return;
      }
      this.selectedTaxRate = taxRate;
    },

    onTaxRateSaved() {
      this.loadTaxRates();
    },

    onTaxRateDeleted() {
      this.loadTaxRates();
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-HN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },
  },
};
</script>
