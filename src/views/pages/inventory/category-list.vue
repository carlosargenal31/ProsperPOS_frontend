<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Categorías</h4>
            <h6>Administra tus categorías</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="PDF"><img src="@/assets/img/icons/pdf.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel"><img src="@/assets/img/icons/excel.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadCategories"><i class="ti ti-refresh"></i></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Contraer" id="collapse-header" @click="toggleHeader"><i class="ti ti-chevron-up"></i></a></li>
        </ul>
        <div class="page-btn" v-if="canCreate">
          <a href="#" class="btn btn-primary btn-md d-inline-flex align-items-center" data-bs-toggle="modal" data-bs-target="#add-category" @click="prepareAdd">
            <i class="ti ti-circle-plus me-1"></i>Agregar Categoría
          </a>
        </div>
      </div>
      <!-- /product list -->
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
          <div v-if="loading" class="text-center p-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>
          <div v-else-if="error" class="alert alert-danger m-3">{{ error }}</div>
          <div v-else class="custom-datatable-filter table-responsive">
            <a-table
              class="table datatable thead-light"
              :columns="columns"
              :data-source="categories"
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
                <template v-else-if="column.key === 'subcategories_count'">
                  <div class="text-center">
                    <span class="badge bg-info">{{ record.subcategories_count || 0 }}</span>
                  </div>
                </template>
                <template v-else-if="column.key === 'is_active'">
                  <span :class="['badge d-inline-flex align-items-center badge-xs', record.is_active ? 'badge-success' : 'badge-danger']">
                    <i class="ti ti-point-filled me-1"></i>{{ record.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </template>
                <template v-else-if="column.key === 'action'">
                  <div class="action-icon d-inline-flex">
                    <a v-if="canEdit" href="#" class="me-2 d-flex align-items-center p-2 border rounded" data-bs-toggle="modal" data-bs-target="#edit-category" @click="editCategory(record)" title="Editar"><i class="ti ti-edit"></i></a>
                    <a v-if="canDelete" href="#" data-bs-toggle="modal" data-bs-target="#delete-category-modal" class="d-flex align-items-center p-2 border rounded" @click="confirmDelete(record)" title="Eliminar"><i class="ti ti-trash"></i></a>
                  </div>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
      <!-- /product list -->
    </div>
  </div>

  <!-- Modales -->
  <CategoryModals
    :edit-mode="editMode"
    :category="selectedCategory"
    :category-to-delete="categoryToDelete"
    @saved="handleCategorySaved"
    @deleted="handleCategoryDeleted"
  />
</template>
<script>
import { categoryService } from '@/services/api.service';
import { hasPermission } from '@/utils/permissions';
import CategoryModals from '@/components/modals/CategoryModals.vue';

const columns = [
  { title: 'Código', dataIndex: 'id', key: 'id', sorter: true, width: 120 },
  { title: 'Categoría', dataIndex: 'name', key: 'name', sorter: true },
  { title: 'Subcategorías', dataIndex: 'subcategories_count', key: 'subcategories_count', sorter: true, width: 120 },
  { title: 'Estado', dataIndex: 'is_active', key: 'is_active', sorter: true, width: 100 },
  { title: '', key: 'action', sorter: false, width: 100 },
];

export default {
  components: {
    CategoryModals
  },
  computed: {
    canCreate() {
      return hasPermission('categories.create');
    },
    canEdit() {
      return hasPermission('categories.update');
    },
    canDelete() {
      return hasPermission('categories.delete');
    }
  },
  data() {
    return {
      categories: [],
      columns,
      loading: false,
      error: null,
      searchQuery: '',
      editMode: false,
      selectedCategory: null,
      categoryToDelete: null,
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
    this.loadCategories();
  },
  methods: {
    async loadCategories() {
      this.loading = true;
      this.error = null;
      try {
        const params = {};
        if (this.searchQuery) params.search = this.searchQuery;

        const response = await categoryService.getCategories(params);
        if (response.success) {
          this.categories = Array.isArray(response.data) ? response.data : [];
          this.paginationConfig.total = this.categories.length;
          this.paginationConfig.current = 1;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar categorías';
        console.error('Error al cargar categorías:', error);
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.paginationConfig.current = 1;
        this.loadCategories();
      }, 500);
    },
    handleTableChange(pagination, filters, sorter) {
      this.paginationConfig.current = pagination.current;
      this.paginationConfig.pageSize = pagination.pageSize;

      if (sorter && sorter.field && sorter.order) {
        const field = sorter.field;
        const order = sorter.order === 'ascend' ? 1 : -1;

        this.categories = [...this.categories].sort((a, b) => {
          let aVal = a[field];
          let bVal = b[field];

          if (aVal === null || aVal === undefined) aVal = '';
          if (bVal === null || bVal === undefined) bVal = '';

          // Ordenamiento numérico para id y subcategories_count
          if (field === 'id' || field === 'subcategories_count') {
            return (Number(aVal) - Number(bVal)) * order;
          }

          // Ordenamiento alfabético para strings
          return String(aVal).localeCompare(String(bVal), 'es') * order;
        });
      } else if (sorter && sorter.field === undefined && sorter.order === undefined) {
        this.loadCategories();
      }
    },
    prepareAdd() {
      this.cleanupModals();
      this.editMode = false;
      this.selectedCategory = null;
    },
    editCategory(category) {
      this.cleanupModals();
      this.editMode = true;
      this.selectedCategory = { ...category };
    },
    confirmDelete(category) {
      this.categoryToDelete = category;
    },
    handleCategorySaved() {
      this.editMode = false;
      this.selectedCategory = null;
      this.loadCategories();
    },
    handleCategoryDeleted() {
      this.categoryToDelete = null;
      this.loadCategories();
    },
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('es-HN', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    toggleHeader() {
      document.getElementById('collapse-header').classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    },
    cleanupModals() {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    },
  },
  beforeUnmount() {
    this.cleanupModals();
  },
};
</script>
