<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Marcas</h4>
            <h6>Administra tus marcas</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="PDF"><img src="@/assets/img/icons/pdf.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel"><img src="@/assets/img/icons/excel.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadBrands"><i class="ti ti-refresh"></i></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Contraer" id="collapse-header" @click="toggleHeader"><i class="ti ti-chevron-up"></i></a></li>
        </ul>
        <div class="page-btn">
          <a href="#" class="btn btn-primary btn-md d-inline-flex align-items-center" data-bs-toggle="modal" data-bs-target="#add-brand">
            <i class="ti ti-circle-plus me-1"></i>Agregar Marca
          </a>
        </div>
      </div>

      <!-- Lista de marcas -->
      <div class="card table-list-card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <div class="search-set">
            <div class="search-input">
              <a href="javascript:void(0);" class="btn-searchset"><i class="ti ti-search fs-14 feather-search"></i></a>
              <input type="search" class="form-control form-control-sm" placeholder="Buscar por nombre" v-model="searchQuery" @input="handleSearch" />
            </div>
          </div>
        </div>

        <div class="card-body">
          <div v-if="loading" class="text-center p-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          <div v-else-if="error" class="alert alert-danger m-3">{{ error }}</div>
          <div v-else class="custom-datatable-filter table-responsive">
            <a-table
              class="table datatable thead-light"
              :columns="columns"
              :data-source="brands"
              :pagination="{
                current: paginationConfig.current,
                pageSize: paginationConfig.pageSize,
                total: paginationConfig.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `Mostrando ${range[0]}-${range[1]} de ${total} resultados`,
                pageSizeOptions: ['10', '20', '50', '100'],
                position: ['bottomCenter']
              }"
              @change="handleTableChange">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'id'">
                  <span class="badge bg-light text-dark">{{ record.id }}</span>
                </template>
                <template v-else-if="column.key === 'name'">
                  <div class="d-flex align-items-center">
                    <a v-if="record.logo_url" href="javascript:void(0);" class="avatar avatar-md bg-light-900 p-1 me-2">
                      <img class="object-fit-contain" :src="record.logo_url" alt="logo" @error="handleImageError">
                    </a>
                    <div v-else class="avatar avatar-md bg-light-900 p-1 me-2 d-flex align-items-center justify-content-center">
                      <i class="ti ti-brand-abstract fs-20 text-muted"></i>
                    </div>
                    <a href="javascript:void(0);">{{ record.name }}</a>
                  </div>
                </template>
                <template v-else-if="column.key === 'products_count'">
                  <div class="text-center">
                    <span class="badge bg-info">{{ record.products_count || 0 }}</span>
                  </div>
                </template>
                <template v-else-if="column.key === 'created_at'">
                  <div>{{ formatDate(record.created_at) }}</div>
                </template>
                <template v-else-if="column.key === 'is_active'">
                  <span :class="['badge d-inline-flex align-items-center badge-xs', record.is_active ? 'badge-success' : 'badge-danger']">
                    <i class="ti ti-point-filled me-1"></i>{{ record.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </template>
                <template v-else-if="column.key === 'action'">
                  <div class="action-icon d-inline-flex">
                    <a href="#" class="me-2 d-flex align-items-center p-2 border rounded" data-bs-toggle="modal" data-bs-target="#edit-brand" @click="editBrand(record)" title="Editar">
                      <i class="ti ti-edit"></i>
                    </a>
                    <a href="#" data-bs-toggle="modal" data-bs-target="#delete_modal" class="d-flex align-items-center p-2 border rounded" @click="confirmDelete(record)" title="Eliminar">
                      <i class="ti ti-trash"></i>
                    </a>
                  </div>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <brand-list-modal
    :brand="selectedBrand"
    :brandToDelete="brandToDelete"
    @saved="onBrandSaved"
    @deleted="onBrandDeleted"
  ></brand-list-modal>
</template>

<script>
import { brandService } from '@/services/api.service';
import { hasPermission } from '@/utils/permissions';

const columns = [
  { title: 'Código', dataIndex: 'id', key: 'id', sorter: true, width: 120 },
  { title: 'Marca', dataIndex: 'name', key: 'name', sorter: true },
  { title: 'Productos', dataIndex: 'products_count', key: 'products_count', sorter: true, width: 100 },
  { title: 'Fecha de Creación', dataIndex: 'created_at', key: 'created_at', sorter: true, width: 150 },
  { title: 'Estado', dataIndex: 'is_active', key: 'is_active', sorter: true, width: 100 },
  { title: '', key: 'action', sorter: false, width: 100 },
];

export default {
  computed: {
    canCreate() {
      return hasPermission('brands.create');
    },
    canEdit() {
      return hasPermission('brands.update');
    },
    canDelete() {
      return hasPermission('brands.delete');
    }
  },
  data() {
    return {
      brands: [],
      columns,
      loading: false,
      error: null,
      searchQuery: '',
      editMode: false,
      selectedBrand: null,
      brandToDelete: null,
      paginationConfig: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `Mostrando ${range[0]}-${range[1]} de ${total} resultados`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter']
      },
    };
  },
  mounted() {
    this.loadBrands();
  },
  methods: {
    async loadBrands() {
      this.loading = true;
      this.error = null;
      try {
        const params = {};
        if (this.searchQuery) params.search = this.searchQuery;

        const response = await brandService.getBrands(params);
        if (response.success) {
          this.brands = Array.isArray(response.data) ? response.data : [];
          // Establecer el total para la paginación
          this.paginationConfig.total = this.brands.length;
          // Resetear a la primera página cuando se cargan nuevos datos
          this.paginationConfig.current = 1;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar marcas';
        console.error('Error al cargar marcas:', error);
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.paginationConfig.current = 1;
        this.loadBrands();
      }, 500);
    },
    handleTableChange(pagination, filters, sorter) {
      // Actualizar la configuración de paginación
      this.paginationConfig.current = pagination.current;
      this.paginationConfig.pageSize = pagination.pageSize;

      // Si hay un ordenamiento aplicado, ordenar localmente
      if (sorter && sorter.field && sorter.order) {
        const field = sorter.field;
        const order = sorter.order === 'ascend' ? 1 : -1;

        this.brands = [...this.brands].sort((a, b) => {
          let aVal = a[field];
          let bVal = b[field];

          // Manejar valores null/undefined
          if (aVal === null || aVal === undefined) aVal = '';
          if (bVal === null || bVal === undefined) bVal = '';

          // Ordenamiento numérico para id y products_count
          if (field === 'id' || field === 'products_count') {
            return (Number(aVal) - Number(bVal)) * order;
          }

          // Ordenamiento de fechas
          if (field === 'created_at') {
            return (new Date(aVal) - new Date(bVal)) * order;
          }

          // Ordenamiento alfabético para strings
          return String(aVal).localeCompare(String(bVal), 'es') * order;
        });
      } else if (sorter && sorter.field === undefined && sorter.order === undefined) {
        // Se quitó el ordenamiento, recargar para obtener el orden por defecto (por ID)
        this.loadBrands();
      }
      // Si no hay cambios en el ordenamiento, solo se cambia de página (no hacer nada más)
    },
    editBrand(brand) {
      this.selectedBrand = brand;
      this.editMode = true;
    },
    confirmDelete(brand) {
      this.brandToDelete = brand;
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
    handleImageError(event) {
      event.target.style.display = 'none';
    },
    toggleHeader() {
      document.getElementById('collapse-header')?.classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    },
    onBrandSaved() {
      this.loadBrands();
      this.selectedBrand = null;
    },
    onBrandDeleted() {
      this.loadBrands();
      this.brandToDelete = null;
    }
  }
};
</script>
