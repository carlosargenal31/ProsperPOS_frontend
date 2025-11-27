<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Subcategorías</h4>
            <h6>Administra tus subcategorías</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="PDF"><img src="@/assets/img/icons/pdf.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel"><img src="@/assets/img/icons/excel.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadSubcategories"><i class="ti ti-refresh"></i></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Contraer" id="collapse-header" @click="toggleHeader"><i class="ti ti-chevron-up"></i></a></li>
        </ul>
        <div class="page-btn">
          <a href="#" class="btn btn-primary btn-md d-inline-flex align-items-center" data-bs-toggle="modal" data-bs-target="#add-subcategory">
            <i class="ti ti-circle-plus me-1"></i>Agregar Subcategoría
          </a>
        </div>
      </div>

      <!-- Lista de subcategorías -->
      <div class="card table-list-card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <div class="search-set">
            <div class="search-input">
              <a href="javascript:void(0);" class="btn-searchset"><i class="ti ti-search fs-14 feather-search"></i></a>
              <input type="search" class="form-control form-control-sm" placeholder="Buscar" v-model="searchQuery" @input="handleSearch" />
            </div>
          </div>
          <div class="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
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
            <a-table class="table datatable thead-light" :columns="columns" :data-source="subcategories" :row-selection="rowSelection" :pagination="paginationConfig" @change="handleTableChange">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'id'">
                  <span class="badge bg-light text-dark">{{ record.id }}</span>
                </template>

                <template v-else-if="column.key === 'image_url'">
                  <a v-if="record.image_url" class="avatar avatar-md me-2">
                    <img :src="record.image_url" alt="subcategoria" @error="handleImageError">
                  </a>
                  <div v-else class="avatar avatar-md bg-light-900 me-2 d-flex align-items-center justify-content-center">
                    <i class="ti ti-category-2 fs-20 text-muted"></i>
                  </div>
                </template>

                <template v-else-if="column.key === 'name'">
                  {{ record.name }}
                </template>

                <template v-else-if="column.key === 'category_name'">
                  <span class="badge bg-primary-light">{{ record.category_name || 'Sin categoría' }}</span>
                </template>

                <template v-else-if="column.key === 'products_count'">
                  <span class="badge bg-info">{{ record.products_count || 0 }}</span>
                </template>

                <template v-else-if="column.key === 'is_active'">
                  <span :class="['badge d-inline-flex align-items-center badge-xs', record.is_active ? 'badge-success' : 'badge-danger']">
                    <i class="ti ti-point-filled me-1"></i>{{ record.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </template>

                <template v-else-if="column.key === 'action'">
                  <div class="action-icon d-inline-flex">
                    <a href="#" class="me-2 d-flex align-items-center p-2 border rounded" data-bs-toggle="modal" data-bs-target="#view-subcategory" @click="viewSubcategory(record)" title="Ver detalles">
                      <i class="ti ti-eye"></i>
                    </a>
                    <a href="#" class="me-2 d-flex align-items-center p-2 border rounded" data-bs-toggle="modal" data-bs-target="#edit-subcategory" @click="editSubcategory(record)" title="Editar">
                      <i class="ti ti-edit"></i>
                    </a>
                    <a href="#" data-bs-toggle="modal" data-bs-target="#delete-subcategory-modal" class="d-flex align-items-center p-2 border rounded" @click="confirmDelete(record)" title="Eliminar">
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
  <sub-categories-modal
    :subcategory="selectedSubcategory"
    :subcategoryToDelete="subcategoryToDelete"
    @saved="onSubcategorySaved"
    @deleted="onSubcategoryDeleted"
  ></sub-categories-modal>
</template>

<script>
import { subcategoryService, categoryService } from '@/services/api.service';
import { hasPermission } from '@/utils/permissions';

const columns = [
  { title: 'Código', dataIndex: 'id', key: 'id', sorter: true, width: 100 },
  { title: 'Imagen', dataIndex: 'image_url', key: 'image_url', sorter: true, width: 80 },
  { title: 'Subcategoría', dataIndex: 'name', key: 'name', sorter: true },
  { title: 'Categoría Padre', dataIndex: 'category_name', key: 'category_name', sorter: true, width: 200 },
  { title: 'Productos', dataIndex: 'products_count', key: 'products_count', sorter: true, width: 120 },
  { title: 'Estado', dataIndex: 'is_active', key: 'is_active', sorter: true, width: 120 },
  { title: '', key: 'action', sorter: false, width: 100 },
];

export default {
  computed: {
    canCreate() {
      return hasPermission('subcategory.create');
    },
    canEdit() {
      return hasPermission('subcategory.update');
    },
    canDelete() {
      return hasPermission('subcategory.delete');
    }
  },
  data() {
    return {
      subcategories: [],
      categories: [],
      columns,
      loading: false,
      error: null,
      searchQuery: '',
      selectedCategory: null,
      selectedCategoryLabel: 'Categoría',
      selectedStatus: null,
      selectedStatusLabel: 'Estado',
      editMode: false,
      selectedSubcategory: null,
      subcategoryToDelete: null,
      paginationConfig: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100']
      },
      rowSelection: {
        onChange: () => {},
        onSelect: () => {},
        onSelectAll: () => {}
      },
    };
  },
  mounted() {
    this.loadCategories();
    this.loadSubcategories();
  },
  methods: {
    async loadCategories() {
      try {
        const response = await categoryService.getActiveCategories();
        if (response.success) {
          this.categories = Array.isArray(response.data) ? response.data : [];
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    },
    async loadSubcategories() {
      this.loading = true;
      this.error = null;
      try {
        const params = {
          page: this.paginationConfig.current,
          limit: this.paginationConfig.pageSize
        };
        if (this.searchQuery) params.search = this.searchQuery;
        if (this.selectedStatus !== null) params.is_active = this.selectedStatus;
        if (this.selectedCategory) params.category_id = this.selectedCategory;

        const response = await subcategoryService.getSubcategories(params);
        console.log('📊 Respuesta de subcategorías:', response);
        if (response.success) {
          // Convertir los datos a objetos planos para evitar problemas con Proxies
          this.subcategories = Array.isArray(response.data)
            ? response.data.map(item => ({...item}))
            : [];
          console.log('📋 Subcategorías cargadas:', this.subcategories);
          if (this.subcategories.length > 0) {
            console.log('🔍 Primera subcategoría:', this.subcategories[0]);
            console.log('🔍 category_name de primera:', this.subcategories[0].category_name);
          }
          this.paginationConfig.total = this.subcategories.length;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar subcategorías';
        console.error('Error al cargar subcategorías:', error);
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.paginationConfig.current = 1;
        this.loadSubcategories();
      }, 500);
    },
    filterByCategory(categoryId) {
      this.selectedCategory = categoryId;
      if (categoryId === null) {
        this.selectedCategoryLabel = 'Categoría';
      } else {
        const category = this.categories.find(c => c.id === categoryId);
        this.selectedCategoryLabel = category ? category.name : 'Categoría';
      }
      this.paginationConfig.current = 1;
      this.loadSubcategories();
    },
    filterByStatus(status) {
      this.selectedStatus = status;
      this.selectedStatusLabel = status === null ? 'Estado' : (status ? 'Activo' : 'Inactivo');
      this.paginationConfig.current = 1;
      this.loadSubcategories();
    },
    handleTableChange(pagination, filters, sorter) {
      this.paginationConfig.current = pagination.current;
      this.paginationConfig.pageSize = pagination.pageSize;
      this.loadSubcategories();
    },
    viewSubcategory(subcategory) {
      this.selectedSubcategory = { ...subcategory };
    },
    editSubcategory(subcategory) {
      this.selectedSubcategory = subcategory;
      this.editMode = true;
    },
    confirmDelete(subcategory) {
      this.subcategoryToDelete = subcategory;
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
    onSubcategorySaved() {
      this.loadSubcategories();
      this.selectedSubcategory = null;
    },
    onSubcategoryDeleted() {
      this.loadSubcategories();
      this.subcategoryToDelete = null;
    }
  }
};
</script>
