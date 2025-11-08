<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Unidades</h4>
            <h6>Administra tus unidades de medida</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="PDF"><img src="@/assets/img/icons/pdf.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel"><img src="@/assets/img/icons/excel.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadUnits"><i class="ti ti-refresh"></i></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Contraer" id="collapse-header" @click="toggleHeader"><i class="ti ti-chevron-up"></i></a></li>
        </ul>
        <div class="page-btn">
          <a href="#" class="btn btn-primary btn-md d-inline-flex align-items-center" data-bs-toggle="modal" data-bs-target="#add-unit">
            <i class="ti ti-circle-plus me-1"></i>Agregar Unidad
          </a>
        </div>
      </div>

      <!-- Lista de unidades -->
      <div class="card table-list-card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <div class="search-set">
            <div class="search-input">
              <a href="javascript:void(0);" class="btn-searchset"><i class="ti ti-search fs-14 feather-search"></i></a>
              <input type="search" class="form-control form-control-sm" placeholder="Buscar por nombre" v-model="searchQuery" @input="handleSearch" />
            </div>
          </div>
          <div class="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
            <div class="dropdown me-2">
              <a href="javascript:void(0);" class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">{{ selectedStatusLabel }}</a>
              <ul class="dropdown-menu dropdown-menu-end p-3">
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus(true)">Activo</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus(false)">Inactivo</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus(null)">Todos</a></li>
              </ul>
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
              :data-source="units"
              :row-selection="rowSelection"
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
                  <a href="javascript:void(0);">{{ record.name }}</a>
                </template>

                <template v-else-if="column.key === 'description'">
                  {{ record.description || '-' }}
                </template>

                <template v-else-if="column.key === 'products_count'">
                  <div class="text-center">
                    <span class="badge bg-info">{{ record.products_count || 0 }}</span>
                  </div>
                </template>

                <template v-else-if="column.key === 'created_at'">
                  {{ formatDate(record.created_at) }}
                </template>

                <template v-else-if="column.key === 'is_active'">
                  <span :class="['badge d-inline-flex align-items-center badge-xs', record.is_active ? 'badge-success' : 'badge-danger']">
                    <i class="ti ti-point-filled me-1"></i>{{ record.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </template>

                <template v-else-if="column.key === 'action'">
                  <div class="action-icon d-inline-flex">
                    <a href="#" class="me-2 d-flex align-items-center p-2 border rounded" data-bs-toggle="modal" data-bs-target="#edit-unit" @click="editUnit(record)" title="Editar">
                      <i class="ti ti-edit"></i>
                    </a>
                    <a href="#" data-bs-toggle="modal" data-bs-target="#delete-unit-modal" class="d-flex align-items-center p-2 border rounded" @click="confirmDelete(record)" title="Eliminar">
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
  <units-modal
    :unit="selectedUnit"
    :unitToDelete="unitToDelete"
    @saved="onUnitSaved"
    @deleted="onUnitDeleted"
  ></units-modal>
</template>

<script>
import { unitService } from '@/services/api.service';

const columns = [
  { title: 'Código', dataIndex: 'id', key: 'id', sorter: true, width: 120 },
  { title: 'Unidad', dataIndex: 'name', key: 'name', sorter: true },
  { title: 'Descripción', dataIndex: 'description', key: 'description', sorter: false },
  { title: 'Productos', dataIndex: 'products_count', key: 'products_count', sorter: true, width: 100 },
  { title: 'Fecha de Creación', dataIndex: 'created_at', key: 'created_at', sorter: true, width: 150 },
  { title: 'Estado', dataIndex: 'is_active', key: 'is_active', sorter: true, width: 100 },
  { title: '', key: 'action', sorter: false, width: 100 },
];

export default {
  data() {
    return {
      units: [],
      columns,
      loading: false,
      error: null,
      searchQuery: '',
      selectedStatus: null,
      selectedStatusLabel: 'Estado',
      selectedUnit: null,
      unitToDelete: null,
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
      rowSelection: {
        onChange: () => {},
        onSelect: () => {},
        onSelectAll: () => {}
      },
    };
  },
  mounted() {
    this.loadUnits();
  },
  methods: {
    async loadUnits() {
      this.loading = true;
      this.error = null;
      try {
        const params = {
          page: this.paginationConfig.current,
          limit: this.paginationConfig.pageSize
        };
        if (this.searchQuery) params.search = this.searchQuery;
        if (this.selectedStatus !== null) params.is_active = this.selectedStatus;

        const response = await unitService.getUnits(params);
        if (response.success) {
          this.units = Array.isArray(response.data) ? response.data : [];
          this.paginationConfig.total = this.units.length;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar unidades';
        console.error('Error al cargar unidades:', error);
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.paginationConfig.current = 1;
        this.loadUnits();
      }, 500);
    },
    filterByStatus(status) {
      this.selectedStatus = status;
      this.selectedStatusLabel = status === null ? 'Estado' : (status ? 'Activo' : 'Inactivo');
      this.paginationConfig.current = 1;
      this.loadUnits();
    },
    handleTableChange(pagination, filters, sorter) {
      this.paginationConfig.current = pagination.current;
      this.paginationConfig.pageSize = pagination.pageSize;
      this.loadUnits();
    },
    editUnit(unit) {
      this.selectedUnit = unit;
    },
    confirmDelete(unit) {
      this.unitToDelete = unit;
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
      document.getElementById('collapse-header')?.classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    },
    onUnitSaved() {
      this.loadUnits();
      this.selectedUnit = null;
    },
    onUnitDeleted() {
      this.loadUnits();
      this.unitToDelete = null;
    }
  }
};
</script>
