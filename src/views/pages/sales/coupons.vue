<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Cupones</h4>
            <h6>Administra los cupones del sistema</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="loadCoupons" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar">
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Colapsar" id="collapse-header" @click="toggleHeader">
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
        <div class="page-btn">
          <a
            href="#"
            class="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#add-coupon"
            @click="openAddModal"
          >
            <i class="ti ti-circle-plus me-1"></i>Agregar Nuevo Cupón
          </a>
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

      <!-- Coupons Table -->
      <div v-else class="card table-list-card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table datanew">
              <thead>
                <tr>
                  <th @click="sortBy('codigo')" style="cursor: pointer;">
                    Código <i :class="getSortIcon('codigo')"></i>
                  </th>
                  <th @click="sortBy('nombre')" style="cursor: pointer;">
                    Cupón <i :class="getSortIcon('nombre')"></i>
                  </th>
                  <th @click="sortBy('tipo_descuento')" style="cursor: pointer;">
                    Porcentaje <i :class="getSortIcon('tipo_descuento')"></i>
                  </th>
                  <th @click="sortBy('valor_descuento')" style="cursor: pointer;">
                    Monto <i :class="getSortIcon('valor_descuento')"></i>
                  </th>
                  <th @click="sortBy('agencia_nombre')" style="cursor: pointer;">
                    Agencia <i :class="getSortIcon('agencia_nombre')"></i>
                  </th>
                  <th @click="sortBy('is_active')" style="cursor: pointer;">
                    Estatus <i :class="getSortIcon('is_active')"></i>
                  </th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="sortedCoupons.length === 0">
                  <td colspan="7" class="text-center">No hay cupones registrados</td>
                </tr>
                <tr v-for="coupon in sortedCoupons" :key="coupon.id">
                  <td>{{ coupon.codigo }}</td>
                  <td>
                    <strong>{{ coupon.nombre }}</strong><br>
                    <small class="text-muted" v-if="coupon.tipo_aplicacion === 'multiple'">
                      <i class="ti ti-package"></i> {{ coupon.items ? coupon.items.length : 0 }} productos incluidos
                    </small>
                    <small class="text-muted" v-else>
                      Categoría: {{ coupon.categoria_nombre || '-' }}<br>
                      Subcategoría: {{ coupon.subcategoria_nombre || '-' }}
                    </small>
                  </td>
                  <td>
                    <span v-if="coupon.tipo_descuento === 'porcentaje'">
                      {{ formatNumber(coupon.valor_descuento) }}%
                    </span>
                    <span v-else>0.00</span>
                  </td>
                  <td>
                    <span v-if="coupon.tipo_descuento === 'monto'">
                      {{ formatMoney(coupon.valor_descuento) }}
                    </span>
                    <span v-else>{{ formatMoney(0) }}</span>
                  </td>
                  <td>{{ coupon.agencia_nombre || 'AGENCIA PRINCIPAL' }}</td>
                  <td>
                    <span :class="getStatusClass(coupon)">
                      {{ getStatusText(coupon) }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openViewModal(coupon)"
                        data-bs-toggle="modal"
                        data-bs-target="#view-coupon"
                      >
                        <i data-feather="eye" class="feather-eye"></i>
                      </a>
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(coupon)"
                        data-bs-toggle="modal"
                        data-bs-target="#add-coupon"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(coupon)"
                        data-bs-toggle="modal"
                        data-bs-target="#delete-coupon-modal"
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
  <coupon-modal
    :coupon="selectedCoupon"
    @coupon-saved="onCouponSaved"
    @coupon-deleted="onCouponDeleted"
  ></coupon-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import CouponModal from '@/components/modal/coupon-modal.vue';

export default {
  components: {
    CouponModal
  },
  data() {
    return {
      coupons: [],
      selectedCoupon: null,
      isEditMode: false,
      loading: false,
      error: null,
      sortColumn: 'id',
      sortDirection: 'asc'
    };
  },
  computed: {
    sortedCoupons() {
      if (!this.coupons || !Array.isArray(this.coupons) || this.coupons.length === 0) return [];

      const sorted = [...this.coupons].sort((a, b) => {
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
    this.loadCoupons();
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
    async loadCoupons() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/coupons', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.coupons = response.data.data || [];
      } catch (error) {
        console.error('Error loading coupons:', error);
        this.error = 'Error al cargar los cupones';
        this.coupons = [];
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.selectedCoupon = null;
      this.isEditMode = false;
    },

    openViewModal(coupon) {
      this.selectedCoupon = { ...coupon };
    },

    openEditModal(coupon) {
      this.selectedCoupon = { ...coupon };
      this.isEditMode = true;
    },

    openDeleteModal(coupon) {
      this.selectedCoupon = coupon;
    },

    onCouponSaved() {
      this.loadCoupons();
    },

    onCouponDeleted() {
      this.loadCoupons();
    },

    getStatusClass(coupon) {
      if (coupon.suspendida) return 'badge bg-danger';
      if (!coupon.is_active) return 'badge bg-warning';

      // Verificar fechas
      if (coupon.limitar_fecha) {
        const now = new Date();
        const desde = new Date(coupon.fecha_desde);
        const hasta = new Date(coupon.fecha_hasta);

        if (now < desde || now > hasta) {
          return 'badge bg-secondary';
        }
      }

      return 'badge bg-success';
    },

    getStatusText(coupon) {
      if (coupon.suspendida) return 'SUSPENDIDO';
      if (!coupon.is_active) return 'INACTIVO';

      // Verificar fechas
      if (coupon.limitar_fecha) {
        const now = new Date();
        const desde = new Date(coupon.fecha_desde);
        const hasta = new Date(coupon.fecha_hasta);

        if (now < desde) return 'PROGRAMADO';
        if (now > hasta) return 'EXPIRADO';
      }

      return 'ACTIVO';
    },

    formatNumber(value) {
      return parseFloat(value || 0).toFixed(2);
    },

    formatMoney(value) {
      return `L ${parseFloat(value || 0).toFixed(2)}`;
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    }
  }
};
</script>
