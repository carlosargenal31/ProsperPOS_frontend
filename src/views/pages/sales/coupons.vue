<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Lista de Cupones</h4>
            <h6>Administra tus cupones de descuento</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="loadCoupons" data-bs-toggle="tooltip" data-bs-placement="top" title="Refrescar"
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
            data-bs-target="#add-coupon"
            @click="openAddModal"
            ><i class="ti ti-circle-plus me-1"></i>Agregar Cupón</a
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
                    Nombre <i :class="getSortIcon('nombre')"></i>
                  </th>
                  <th @click="sortBy('aplicar_a')\" style="cursor: pointer;">
                    Oferta <i :class="getSortIcon('aplicar_a')"></i>
                  </th>
                  <th @click="sortBy('tipo_descuento')" style="cursor: pointer;">
                    Tipo <i :class="getSortIcon('tipo_descuento')"></i>
                  </th>
                  <th @click="sortBy('valor_descuento')" style="cursor: pointer;">
                    Valor <i :class="getSortIcon('valor_descuento')"></i>
                  </th>
                  <th @click="sortBy('fecha_desde')" style="cursor: pointer;">
                    Fecha Desde <i :class="getSortIcon('fecha_desde')"></i>
                  </th>
                  <th @click="sortBy('fecha_hasta')" style="cursor: pointer;">
                    Fecha Hasta <i :class="getSortIcon('fecha_hasta')"></i>
                  </th>
                  <th @click="sortBy('suspendido')" style="cursor: pointer;">
                    Estado <i :class="getSortIcon('suspendido')"></i>
                  </th>
                  <th class="no-sort">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="sortedCoupons.length === 0">
                  <td colspan="9" class="text-center">No hay cupones registrados</td>
                </tr>
                <tr v-for="coupon in sortedCoupons" :key="coupon.id">
                  <td>{{ coupon.codigo }}</td>
                  <td>{{ coupon.nombre }}</td>
                  <td>
                    <span class="badge bg-info">{{ formatAplicarA(coupon) }}</span>
                  </td>
                  <td>
                    <span :class="coupon.tipo_descuento === 'porcentaje' ? 'badge bg-warning' : 'badge bg-success'">
                      {{ coupon.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo' }}
                    </span>
                  </td>
                  <td>
                    {{ coupon.tipo_descuento === 'porcentaje' ? `%${coupon.valor_descuento}` : `L ${formatCurrency(coupon.valor_descuento)}` }}
                  </td>
                  <td>{{ formatDate(coupon.fecha_desde) }}</td>
                  <td>{{ formatDate(coupon.fecha_hasta) }}</td>
                  <td>
                    <span :class="!coupon.suspendido ? 'badge bg-success' : 'badge bg-danger'">
                      {{ !coupon.suspendido ? 'Activo' : 'Suspendido' }}
                    </span>
                  </td>
                  <td class="action-table-data justify-content-end">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 p-2"
                        href="#"
                        @click.prevent="openEditModal(coupon)"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-coupon"
                      >
                        <i data-feather="edit" class="feather-edit"></i>
                      </a>
                      <a
                        class="confirm-text p-2"
                        href="#"
                        @click.prevent="openDeleteModal(coupon)"
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
  <coupon-modal
    :coupon="selectedCoupon"
    :is-edit="isEditMode"
    @coupon-saved="onCouponSaved"
    @coupon-deleted="onCouponDeleted"
  ></coupon-modal>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      coupons: [],
      selectedCoupon: null,
      isEditMode: false,
      loading: false,
      error: null,
      sortColumn: 'codigo',
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

    formatAplicarA(coupon) {
      switch (coupon.aplicar_a) {
        case 'grupo':
          return coupon.grupo_nombre || 'Grupo';
        case 'subgrupo':
          return coupon.subgrupo_nombre || 'Subgrupo';
        case 'articulo':
          return coupon.articulo_nombre || 'Artículo';
        case 'multiples_articulos':
          return 'Múltiples Artículos';
        default:
          return '-';
      }
    },

    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('es-HN');
    },

    formatCurrency(value) {
      return parseFloat(value).toFixed(2);
    },

    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },
  },
};
</script>
