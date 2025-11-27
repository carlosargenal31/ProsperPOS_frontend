<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content settings-content">
      <div class="page-header settings-pg-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Ajustes</h4>
            <h6>Administra las monedas del sistema</h6>
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
            <a @click="loadCurrencies" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
                <h4>Monedas</h4>
                <div class="page-btn">
                  <a
                    href="#"
                    class="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add-currency"
                    @click="openAddModal"
                    ><i class="ti ti-circle-plus me-1"></i>Agregar Nueva Moneda</a
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
                        <th>Símbolo</th>
                        <th>Nombre</th>
                        <th>Factor Cambio</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th class="no-sort text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="currencies.length === 0">
                        <td colspan="7" class="text-center">No hay monedas registradas</td>
                      </tr>
                      <tr v-for="currency in currencies" :key="currency.id">
                        <td>
                          {{ currency.id }}
                          <span v-if="currency.is_default" class="badge bg-success ms-2">Por defecto</span>
                        </td>
                        <td>{{ currency.simbolo }}</td>
                        <td>{{ currency.plural }}</td>
                        <td>{{ formatFactor(currency.factor_cambio) }}</td>
                        <td>
                          <span :class="currency.extranjera ? 'badge bg-info' : 'badge bg-secondary'">
                            {{ currency.extranjera ? 'Extranjera' : 'Local' }}
                          </span>
                        </td>
                        <td>
                          <span :class="currency.is_active ? 'badge bg-success' : 'badge bg-danger'">
                            {{ currency.is_active ? 'Activa' : 'Inactiva' }}
                          </span>
                        </td>
                        <td class="action-table-data justify-content-end">
                          <div class="edit-delete-action">
                            <a
                              class="me-2 p-2"
                              href="#"
                              @click.prevent="openViewModal(currency)"
                              data-bs-toggle="modal"
                              data-bs-target="#view-currency"
                              title="Ver detalles"
                            >
                              <i data-feather="eye" class="feather-eye"></i>
                            </a>
                            <a
                              class="me-2 p-2"
                              href="#"
                              @click.prevent="openEditModal(currency)"
                              data-bs-toggle="modal"
                              data-bs-target="#edit-currency"
                            >
                              <i data-feather="edit" class="feather-edit"></i>
                            </a>
                            <a
                              class="p-2"
                              href="javascript:void(0);"
                              @click.prevent="openDeleteModal(currency)"
                              data-bs-toggle="modal"
                              data-bs-target="#delete-modal"
                              :class="{ 'disabled': currency.is_default }"
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
  <currency-settings-modal
    :currency="selectedCurrency"
    :is-edit="isEditMode"
    @currency-saved="onCurrencySaved"
    @currency-deleted="onCurrencyDeleted"
  ></currency-settings-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import { exportToPDF as exportPDF, exportToExcel as exportExcel } from '@/utils/exportUtils';

export default {
  data() {
    return {
      currencies: [],
      selectedCurrency: null,
      isEditMode: false,
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadCurrencies();
  },
  methods: {
    async loadCurrencies() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/currencies', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.currencies = response.data.data || [];
      } catch (error) {
        console.error('Error loading currencies:', error);
        this.error = 'Error al cargar las monedas';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedCurrency = null;
      this.isEditMode = false;
    },

    openEditModal(currency) {
      this.selectedCurrency = { ...currency };
      this.isEditMode = true;
    },

    openViewModal(currency) {
      this.selectedCurrency = { ...currency };
    },

    openDeleteModal(currency) {
      if (currency.is_default) {
        Swal.fire({
          icon: 'warning',
          title: 'No se puede eliminar',
          text: 'No se puede eliminar la moneda por defecto',
          confirmButtonColor: '#ffc107'
        });
        return;
      }
      this.selectedCurrency = currency;
    },

    onCurrencySaved() {
      this.loadCurrencies();
    },

    onCurrencyDeleted() {
      this.loadCurrencies();
    },

    formatFactor(factor) {
      if (!factor || factor == 0) return '-';
      return parseFloat(factor).toFixed(8);
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },

    exportToPDF() {
      if (!this.currencies || this.currencies.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin datos',
          text: 'No hay datos para exportar',
          confirmButtonColor: '#667eea'
        });
        return;
      }

      const exportData = this.currencies.map(item => ({
        'ID': item.id || '',
        'Símbolo': item.simbolo || '',
        'Nombre': item.plural || '',
        'Factor de Cambio': this.formatFactor(item.factor_cambio),
        'Tipo': item.extranjera ? 'Extranjera' : 'Local',
        'Estado': item.is_active ? 'Activa' : 'Inactiva',
        'Por Defecto': item.is_default ? 'Sí' : 'No'
      }));

      exportPDF(exportData, 'monedas', 'Lista de Monedas');
    },

    exportToExcel() {
      if (!this.currencies || this.currencies.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin datos',
          text: 'No hay datos para exportar',
          confirmButtonColor: '#667eea'
        });
        return;
      }

      const exportData = this.currencies.map(item => ({
        'ID': item.id || '',
        'Símbolo': item.simbolo || '',
        'Nombre': item.plural || '',
        'Factor de Cambio': this.formatFactor(item.factor_cambio),
        'Tipo': item.extranjera ? 'Extranjera' : 'Local',
        'Estado': item.is_active ? 'Activa' : 'Inactiva',
        'Por Defecto': item.is_default ? 'Sí' : 'No'
      }));

      exportExcel(exportData, 'monedas');
    },
  },
};
</script>
