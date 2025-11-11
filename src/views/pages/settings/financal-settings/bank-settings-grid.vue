<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content settings-content">
      <div class="page-header settings-pg-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Ajustes</h4>
            <h6>Administra las cuentas bancarias del sistema</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="loadBankAccounts" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
              ><i class="ti ti-refresh"></i
            ></a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Colapsar" id="collapse-header" @click="toggleHeader"><i class="ti ti-chevron-up"></i></a>
          </li>
        </ul>
      </div>
      <div class="row">
        <div class="col-xl-12">
          <div class="settings-wrapper d-flex">
            <settings-sidebar></settings-sidebar>
            <div class="card flex-fill mb-0 w-50">
              <div class="card-header d-flex align-items-center justify-content-between">
                <h4>Cuentas Bancarias</h4>
                <div class="page-btn">
                  <a
                    href="#"
                    class="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add-account"
                    @click="openAddModal"
                    ><i class="ti ti-circle-plus me-1"></i>Agregar Nueva Cuenta</a
                  >
                </div>
              </div>
              <div class="card-body pb-0">
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

                <!-- Bank Accounts Grid -->
                <div v-else class="row">
                  <div v-if="bankAccounts.length === 0" class="col-12">
                    <p class="text-center text-muted py-4">No hay cuentas bancarias registradas</p>
                  </div>
                  <div
                    class="col-xxl-4 col-xl-6 col-lg-12 col-sm-6"
                    v-for="account in bankAccounts"
                    :key="account.id"
                  >
                    <div class="card bank-box">
                      <div class="card-body">
                        <div class="mb-4">
                          <div class="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 class="mb-1">{{ account.banco }}</h5>
                              <p class="text-muted mb-1">{{ account.tipo_cuenta }}</p>
                              <p class="mb-0">
                                <strong>{{ account.numero_cuenta }}</strong>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div class="d-flex align-items-center justify-content-between">
                          <div>
                            <span class="text-muted small">Titular</span>
                            <h6 class="mb-1">{{ account.titular }}</h6>
                            <span class="badge" :class="account.is_active ? 'bg-success' : 'bg-danger'">
                              {{ account.is_active ? 'Activa' : 'Inactiva' }}
                            </span>
                          </div>
                          <div class="hstack gap-2 fs-15">
                            <a
                              href="#"
                              class="btn btn-icon btn-sm btn-info-light"
                              data-bs-toggle="modal"
                              data-bs-target="#edit-account"
                              @click.prevent="openEditModal(account)"
                              ><i data-feather="edit" class="feather-edit"></i
                            ></a>
                            <a
                              href="#"
                              class="btn btn-icon btn-sm btn-danger-light"
                              data-bs-toggle="modal"
                              data-bs-target="#delete-modal"
                              @click.prevent="openDeleteModal(account)"
                              ><i data-feather="trash-2" class="feather-trash-2"></i
                            ></a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
  <bank-settings-grid-modal
    :account="selectedAccount"
    :is-edit="isEditMode"
    @account-saved="onAccountSaved"
    @account-deleted="onAccountDeleted"
  ></bank-settings-grid-modal>
</template>
<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      bankAccounts: [],
      selectedAccount: null,
      isEditMode: false,
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadBankAccounts();
  },
  methods: {
    async loadBankAccounts() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/bank-accounts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.bankAccounts = response.data.data || [];
      } catch (error) {
        console.error('Error loading bank accounts:', error);
        this.error = 'Error al cargar las cuentas bancarias';
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedAccount = null;
      this.isEditMode = false;
    },

    openEditModal(account) {
      this.selectedAccount = { ...account };
      this.isEditMode = true;
    },

    openDeleteModal(account) {
      this.selectedAccount = account;
    },

    onAccountSaved() {
      this.loadBankAccounts();
    },

    onAccountDeleted() {
      this.loadBankAccounts();
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },
  },
};
</script>
