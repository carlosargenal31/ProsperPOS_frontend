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
          <li>
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Actualizar"
              @click="loadSubcategories"
            >
              <i class="ti ti-refresh"></i>
            </a>
          </li>
        </ul>
        <div class="page-btn">
          <a
            href="javascript:void(0);"
            class="btn btn-added"
            data-bs-toggle="modal"
            data-bs-target="#add-subcategory"
          >
            <i class="ti ti-plus me-2"></i>Agregar Subcategoría
          </a>
        </div>
      </div>

      <div class="card table-list-card">
        <div class="card-body">
          <!-- Filtros -->
          <div class="table-top">
            <div class="search-set w-100">
              <div class="row g-3">
                <div class="col-12 col-md-4">
                  <input
                    type="text"
                    v-model="filters.search"
                    @input="debounceSearch"
                    placeholder="Buscar subcategoría..."
                    class="form-control"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <select
                    v-model="filters.category_id"
                    @change="applyFilters"
                    class="form-select"
                  >
                    <option value="">Todas las categorías</option>
                    <option
                      v-for="cat in categories"
                      :key="cat.id"
                      :value="cat.id"
                    >
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
                <div class="col-12 col-md-3">
                  <select
                    v-model="filters.is_active"
                    @change="applyFilters"
                    class="form-select"
                  >
                    <option value="">Todos los estados</option>
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
                <div class="col-12 col-md-2">
                  <button
                    @click="clearFilters"
                    class="btn btn-secondary w-100"
                  >
                    <i class="ti ti-filter-off me-1"></i>Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabla -->
          <div class="table-responsive custom-datatable-filter mt-3">
            <a-table
              :columns="columns"
              :data-source="subcategories"
              :pagination="false"
              :loading="loading"
              :scroll="{ x: false }"
              @change="handleTableChange"
              class="table datanew table-hover table-center mb-0"
            >
              <template #bodyCell="{ column, record }">
                <!-- Columna ID -->
                <template v-if="column.key === 'id'">
                  <span class="fw-bold">{{ record.id }}</span>
                </template>

                <!-- Columna Imagen -->
                <template v-else-if="column.key === 'image_url'">
                  <div class="text-center">
                    <img
                      v-if="record.image_url"
                      :src="record.image_url"
                      alt="Subcategoría"
                      class="img-thumbnail"
                      style="width: 50px; height: 50px; object-fit: cover;"
                    />
                    <span v-else class="text-muted">
                      <i class="ti ti-photo-off"></i>
                    </span>
                  </div>
                </template>

                <!-- Columna Nombre -->
                <template v-else-if="column.key === 'name'">
                  <span class="fw-semibold">{{ record.name }}</span>
                </template>

                <!-- Columna Categoría Padre -->
                <template v-else-if="column.key === 'category_name'">
                  <span class="badge bg-primary-light" style="background-color: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px;">
                    {{ record.category_name || 'Sin categoría' }}
                  </span>
                </template>

                <!-- Columna Productos -->
                <template v-else-if="column.key === 'products_count'">
                  <span class="badge bg-info">
                    {{ record.products_count || 0 }}
                  </span>
                </template>

                <!-- Columna Estado -->
                <template v-else-if="column.key === 'is_active'">
                  <span
                    class="badge"
                    :style="{
                      backgroundColor: (record.is_active === 1 || record.is_active === true) ? '#d4edda' : '#f8d7da',
                      color: (record.is_active === 1 || record.is_active === true) ? '#155724' : '#721c24',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }"
                  >
                    {{ (record.is_active === 1 || record.is_active === true) ? 'Activo' : 'Inactivo' }}
                  </span>
                </template>

                <!-- Columna Acciones -->
                <template v-else-if="column.key === 'action'">
                  <div class="action-table-data">
                    <a
                      href="javascript:void(0);"
                      class="me-2 p-2"
                      data-bs-toggle="modal"
                      data-bs-target="#view-subcategory"
                      @click="selectSubcategory(record)"
                      title="Ver"
                    >
                      <i class="ti ti-eye"></i>
                    </a>
                    <a
                      href="javascript:void(0);"
                      class="me-2 p-2"
                      data-bs-toggle="modal"
                      data-bs-target="#edit-subcategory"
                      @click="selectSubcategory(record)"
                      title="Editar"
                    >
                      <i class="ti ti-edit"></i>
                    </a>
                    <a
                      href="javascript:void(0);"
                      class="me-2 p-2"
                      @click="confirmDelete(record)"
                      title="Eliminar"
                    >
                      <i class="ti ti-trash text-danger"></i>
                    </a>
                  </div>
                </template>
              </template>
            </a-table>
          </div>

          <!-- Paginación personalizada -->
          <div class="row align-items-center mt-3" v-if="pagination.total > 0">
            <div class="col-md-6">
              <div class="datatable-length">
                <label>
                  Mostrar
                  <select
                    v-model="pagination.limit"
                    @change="changeLimit"
                    class="form-select form-select-sm"
                    style="width: 80px; display: inline-block; margin: 0 5px;"
                  >
                    <option :value="10">10</option>
                    <option :value="15">15</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                  </select>
                  registros
                </label>
              </div>
            </div>
            <div class="col-md-6">
              <div class="datatable-paginate">
                <ul class="pagination justify-content-end">
                  <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                    <a
                      class="page-link"
                      href="javascript:void(0);"
                      @click="changePage(pagination.page - 1)"
                    >
                      <i class="ti ti-chevron-left"></i>
                    </a>
                  </li>
                  <li
                    v-for="page in visiblePages"
                    :key="page"
                    class="page-item"
                    :class="{ active: pagination.page === page }"
                  >
                    <a
                      class="page-link"
                      href="javascript:void(0);"
                      @click="changePage(page)"
                    >
                      {{ page }}
                    </a>
                  </li>
                  <li
                    class="page-item"
                    :class="{ disabled: pagination.page === pagination.pages }"
                  >
                    <a
                      class="page-link"
                      href="javascript:void(0);"
                      @click="changePage(pagination.page + 1)"
                    >
                      <i class="ti ti-chevron-right"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Component -->
  <SubCategoriesModal
    :subcategory="selectedSubcategory"
    :categories="categories"
    @success="handleSuccess"
  />
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { categoryService, subcategoryService } from '@/services/api.service';
import SubCategoriesModal from '@/components/modal/sub-categories-modal.vue';

export default {
  name: 'SubCategories',
  components: {
    SubCategoriesModal
  },
  setup() {
    // Estados reactivos
    const subcategories = ref([]);
    const categories = ref([]);
    const loading = ref(false);
    const selectedSubcategory = ref(null);

    // Filtros
    const filters = reactive({
      search: '',
      category_id: '',
      is_active: '',
      sort_by: 'id',
      sort_order: 'ASC',
      page: 1,
      limit: 15
    });

    // Paginación
    const pagination = reactive({
      page: 1,
      limit: 15,
      total: 0,
      pages: 0
    });

    // Estado del ordenamiento para la tabla
    const tableSorter = ref({
      columnKey: null,
      order: null
    });

    // Definición de columnas con server-side sorting
    const columns = computed(() => [
      {
        title: 'Código',
        dataIndex: 'id',
        key: 'id',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        showSorterTooltip: false,
        sortOrder: tableSorter.value.columnKey === 'id' ? tableSorter.value.order : null,
        width: '100px'
      },
      {
        title: 'Imagen',
        dataIndex: 'image_url',
        key: 'image_url',
        width: '100px'
      },
      {
        title: 'Nombre',
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        showSorterTooltip: false,
        sortOrder: tableSorter.value.columnKey === 'name' ? tableSorter.value.order : null
      },
      {
        title: 'Categoría Padre',
        dataIndex: 'category_name',
        key: 'category_name',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        showSorterTooltip: false,
        sortOrder: tableSorter.value.columnKey === 'category_name' ? tableSorter.value.order : null,
        width: '180px'
      },
      {
        title: 'Productos',
        dataIndex: 'products_count',
        key: 'products_count',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        showSorterTooltip: false,
        sortOrder: tableSorter.value.columnKey === 'products_count' ? tableSorter.value.order : null,
        width: '100px'
      },
      {
        title: 'Estado',
        dataIndex: 'is_active',
        key: 'is_active',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        showSorterTooltip: false,
        sortOrder: tableSorter.value.columnKey === 'is_active' ? tableSorter.value.order : null,
        width: '100px'
      },
      {
        title: 'Acciones',
        key: 'action',
        width: '120px'
      }
    ]);

    // Páginas visibles para la paginación
    const visiblePages = computed(() => {
      const pages = [];
      const total = pagination.pages;
      const current = pagination.page;
      const maxVisible = 5;

      if (total <= maxVisible) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        let start = Math.max(1, current - Math.floor(maxVisible / 2));
        let end = Math.min(total, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
          start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }

      return pages;
    });

    // Métodos
    const handleTableChange = (paginationInfo, tableFilters, sorter) => {
      console.log('Sorter:', sorter);

      // Actualizar el estado del ordenamiento
      tableSorter.value = {
        columnKey: sorter.columnKey,
        order: sorter.order
      };

      // Si se canceló el ordenamiento, volver al orden por defecto
      if (sorter.column !== undefined && !sorter.order) {
        filters.sort_by = 'id';
        filters.sort_order = 'ASC';
        filters.page = 1;
        loadSubcategories();
      } else if (sorter.field && sorter.order) {
        // Mapear el campo de la columna al campo de la base de datos
        const fieldMap = {
          id: 'id',
          name: 'name',
          category_name: 'category_name',
          products_count: 'products_count',
          is_active: 'is_active'
        };

        filters.sort_by = fieldMap[sorter.field] || 'id';
        filters.sort_order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
        filters.page = 1;
        loadSubcategories();
      }
    };

    const loadSubcategories = async () => {
      loading.value = true;
      try {
        const params = {
          search: filters.search || undefined,
          category_id: filters.category_id || undefined,
          is_active: filters.is_active !== '' ? filters.is_active : undefined,
          sort_by: filters.sort_by,
          sort_order: filters.sort_order,
          page: filters.page,
          limit: filters.limit
        };

        const response = await subcategoryService.getSubcategories(params);

        if (response.success) {
          subcategories.value = response.data || [];

          // Actualizar paginación si existe
          if (response.pagination) {
            pagination.page = response.pagination.page;
            pagination.limit = response.pagination.limit;
            pagination.total = response.pagination.total;
            pagination.pages = response.pagination.pages;
          } else {
            // Si no hay paginación del servidor, calcular localmente
            pagination.total = subcategories.value.length;
            pagination.pages = Math.ceil(pagination.total / pagination.limit);
          }
        }
      } catch (error) {
        console.error('Error loading subcategories:', error);
        if (error.response?.status !== 401) {
          message.error('Error al cargar subcategorías');
        }
      } finally {
        loading.value = false;
      }
    };

    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response.success) {
          categories.value = response.data || [];
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    let searchTimeout;
    const debounceSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        filters.page = 1;
        loadSubcategories();
      }, 500);
    };

    const applyFilters = () => {
      filters.page = 1;
      loadSubcategories();
    };

    const clearFilters = () => {
      filters.search = '';
      filters.category_id = '';
      filters.is_active = '';
      filters.sort_by = 'id';
      filters.sort_order = 'ASC';
      filters.page = 1;
      tableSorter.value = { columnKey: null, order: null };
      loadSubcategories();
    };

    const changePage = (page) => {
      if (page < 1 || page > pagination.pages) return;
      filters.page = page;
      pagination.page = page;
      loadSubcategories();
    };

    const changeLimit = () => {
      filters.limit = pagination.limit;
      filters.page = 1;
      pagination.page = 1;
      loadSubcategories();
    };

    const selectSubcategory = (subcategory) => {
      selectedSubcategory.value = subcategory;
    };

    const handleSuccess = () => {
      selectedSubcategory.value = null;
      loadSubcategories();
    };

    const confirmDelete = (subcategory) => {
      Modal.confirm({
        title: '¿Eliminar subcategoría?',
        content: `¿Estás seguro de que deseas eliminar la subcategoría "${subcategory.name}"?`,
        okText: 'Eliminar',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk: () => deleteSubcategory(subcategory.id)
      });
    };

    const deleteSubcategory = async (id) => {
      try {
        await subcategoryService.deleteSubcategory(id);
        message.success('Subcategoría eliminada correctamente');
        loadSubcategories();
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        message.error(error.response?.data?.message || 'Error al eliminar subcategoría');
      }
    };

    // Lifecycle
    onMounted(() => {
      loadCategories();
      loadSubcategories();
    });

    return {
      subcategories,
      categories,
      loading,
      selectedSubcategory,
      filters,
      pagination,
      columns,
      tableSorter,
      visiblePages,
      handleTableChange,
      loadSubcategories,
      debounceSearch,
      applyFilters,
      clearFilters,
      changePage,
      changeLimit,
      selectSubcategory,
      handleSuccess,
      confirmDelete,
      deleteSubcategory
    };
  }
};
</script>

<style scoped>
.badge-primary-light {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
}

.custom-datatable-filter .ant-table-thead > tr > th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.custom-datatable-filter .ant-table-tbody > tr:hover {
  background-color: #f8f9fa;
}

.action-table-data a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.25rem;
  transition: all 0.3s;
}

.action-table-data a:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
}

.action-table-data a i {
  font-size: 16px;
}
</style>
