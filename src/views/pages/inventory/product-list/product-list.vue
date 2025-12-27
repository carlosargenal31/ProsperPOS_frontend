<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <!-- Product Header -->
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4 class="fw-bold">Lista de Productos</h4>
            <h6>Administra tus productos</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a 
              href="javascript:void(0);"
              @click="exportToPDF"
              data-bs-toggle="tooltip" 
              data-bs-placement="top" 
              title="Exportar PDF"
            >
              <img src="@/assets/img/icons/pdf.svg" alt="PDF">
            </a>
          </li>
          <li>
            <a 
              href="javascript:void(0);"
              @click="exportToExcel"
              data-bs-toggle="tooltip" 
              data-bs-placement="top" 
              title="Exportar Excel"
            >
              <img src="@/assets/img/icons/excel.svg" alt="Excel">
            </a>
          </li>
          <li>
            <a 
              href="javascript:void(0);"
              @click="refreshData"
              data-bs-toggle="tooltip" 
              data-bs-placement="top" 
              title="Actualizar"
            >
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a 
              href="javascript:void(0);"
              @click="toggleHeader"
              data-bs-toggle="tooltip" 
              data-bs-placement="top" 
              title="Contraer" 
              id="collapse-header"
            >
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
        <div class="page-btn d-flex position-relative">
          <button
            type="button"
            class="btn btn-primary d-flex align-items-center"
            @click="toggleDropdown"
          >
            <vue-feather type="plus-circle" class="me-2"></vue-feather>
            Agregar Producto
            <i class="ti ti-chevron-down ms-2"></i>
          </button>
          <div
            v-show="showDropdown"
            class="dropdown-menu show position-absolute"
            style="top: 100%; left: 0; margin-top: 0.125rem;"
          >
            <a
              class="dropdown-item"
              href="javascript:void(0);"
              @click="goToNewProduct"
            >
              <i class="ti ti-file-plus me-2"></i>
              Nuevo
            </a>
            <a
              class="dropdown-item"
              href="javascript:void(0);"
              @click="openQuickRegister"
            >
              <i class="ti ti-bolt me-2"></i>
              Registro Rápido
            </a>
          </div>
        </div>
        <div class="page-btn import d-flex">
          <a 
            href="javascript:void(0);"
            @click="showImportModal"
            class="btn btn-secondary color d-flex align-items-center"
          >
            <vue-feather type="download" class="me-2"></vue-feather>
            Importar Productos
          </a>
        </div>
      </div>

      <!-- Lista de productos -->
      <div class="card table-list-card">
        <div class="card-header">
          <div class="row g-2 align-items-center">
            <!-- Búsqueda -->
            <div class="col-12 col-md-3">
              <div class="search-set">
                <div class="search-input">
                  <a href="javascript:void(0);" class="btn-searchset">
                    <i class="ti ti-search fs-14 feather-search"></i>
                  </a>
                  <input
                    type="search"
                    class="form-control form-control-sm"
                    placeholder="Buscar productos..."
                    v-model="filters.search"
                    @input="debounceSearch"
                  >
                </div>
              </div>
            </div>

            <!-- Filtro de Categoría -->
            <div class="col-6 col-md-2">
              <select
                class="form-select form-select-sm"
                v-model="filters.category_id"
                @change="applyFilters"
              >
                <option value="">Todas las categorías</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <!-- Filtro de Subcategoría -->
            <div class="col-6 col-md-2">
              <select
                class="form-select form-select-sm"
                v-model="filters.subcategory_id"
                @change="applyFilters"
              >
                <option value="">Todas las subcategorías</option>
                <option v-for="subcategory in filteredSubcategories" :key="subcategory.id" :value="subcategory.id">
                  {{ subcategory.name }}
                </option>
              </select>
            </div>

            <!-- Filtro de Marca -->
            <div class="col-6 col-md-2">
              <select
                class="form-select form-select-sm"
                v-model="filters.brand_id"
                @change="applyFilters"
              >
                <option value="">Todas las marcas</option>
                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
            </div>

            <!-- Filtro de Existencias -->
            <div class="col-6 col-md-2">
              <select
                class="form-select form-select-sm"
                v-model="filters.stock_filter"
                @change="applyFilters"
              >
                <option value="">Con y sin existencias</option>
                <option value="with_stock">Solo con existencias</option>
                <option value="without_stock">Solo sin existencias</option>
              </select>
            </div>

            <!-- Botón limpiar filtros -->
            <div class="col-12 col-md-1">
              <button
                class="btn btn-sm btn-outline-secondary w-100"
                @click="clearFilters"
                title="Limpiar filtros"
              >
                <i class="ti ti-filter-off"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="card-body">
          <!-- Indicador de carga -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando productos...</p>
          </div>

          <!-- Mensaje de error -->
          <div v-else-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="ti ti-alert-circle me-2"></i>
            {{ error }}
            <button type="button" class="btn-close" @click="error = null"></button>
          </div>

          <!-- Tabla de productos -->
          <div v-else class="custom-datatable-filter">
            <a-table
              class="table datanew table-hover table-center mb-0"
              :columns="columns"
              :data-source="products"
              :pagination="false"
              :loading="loading"
              :scroll="{ x: false }"
              @change="handleTableChange"
            >
              <template #bodyCell="{ column, record }">
                <!-- Columna de imagen -->
                <template v-if="column.key === 'image'">
                  <a href="javascript:void(0);" class="avatar avatar-md">
                    <img
                      :src="record.image || getDefaultImage()"
                      alt="producto"
                      @error="handleImageError"
                    />
                  </a>
                </template>

                <!-- Columna de código -->
                <template v-else-if="column.key === 'code'">
                  <span class="badge bg-light text-dark">{{ record.code || '-' }}</span>
                </template>

                <!-- Columna de nombre (Ítem) -->
                <template v-else-if="column.key === 'name'">
                  <a href="javascript:void(0);" @click="viewProduct(record.id)">{{ record.name }}</a>
                </template>

                <!-- Columna de Categoría/Subcategoría -->
                <template v-else-if="column.key === 'category_subcategory'">
                  <span class="badge bg-info-transparent">
                    {{ record.category_name || '-' }}{{ record.subcategory_name ? ' / ' + record.subcategory_name : '' }}
                  </span>
                </template>

                <!-- Columna de Existencias (stock) -->
                <template v-else-if="column.key === 'stock'">
                  <span
                    :class="getStockClass(record.stock)"
                    class="badge"
                  >
                    {{ formatStock(record.stock) }}
                  </span>
                </template>

                <!-- Columna de Precio Total (price_1) -->
                <template v-else-if="column.key === 'price_1'">
                  <span class="fw-bold text-success">
                    L. {{ formatPrice(record.price_1) }}
                  </span>
                </template>

                <!-- Columna de Estatus (is_active) -->
                <template v-else-if="column.key === 'is_active'">
                  <span
                    :class="record.is_active ? 'badge bg-success' : 'badge bg-danger'"
                  >
                    {{ record.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </template>

                <!-- Columna de acciones -->
                <template v-else-if="column.key === 'action'">
                  <div class="action-table-data">
                    <div class="edit-delete-action">
                      <a
                        class="me-2 edit-icon p-2"
                        href="javascript:void(0);"
                        @click="viewProduct(record.id)"
                        title="Ver detalles"
                      >
                        <vue-feather type="eye" class="action-eye"></vue-feather>
                      </a>
                      <a
                        class="me-2 p-2"
                        href="javascript:void(0);"
                        @click="editProduct(record.id)"
                        title="Editar"
                      >
                        <vue-feather type="edit"></vue-feather>
                      </a>
                      <a
                        class="p-2"
                        href="javascript:void(0);"
                        @click="confirmDelete(record)"
                        title="Eliminar"
                      >
                        <vue-feather type="trash-2"></vue-feather>
                      </a>
                    </div>
                  </div>
                </template>
              </template>
            </a-table>

            <!-- Paginación -->
            <div class="row mt-3" v-if="pagination.total > 0">
              <div class="col-sm-12 col-md-5">
                <div class="dataTables_info">
                  Mostrando {{ ((pagination.page - 1) * pagination.limit) + 1 }} 
                  a {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
                  de {{ pagination.total }} productos
                </div>
              </div>
              <div class="col-sm-12 col-md-7">
                <div class="dataTables_paginate">
                  <ul class="pagination justify-content-end">
                    <li class="paginate_button page-item previous" :class="{ disabled: pagination.page === 1 }">
                      <a
                        href="javascript:void(0);"
                        class="page-link"
                        @click="changePage(pagination.page - 1)"
                      >
                        <i class="ti ti-chevron-left"></i>
                      </a>
                    </li>
                    <li
                      v-for="page in visiblePages"
                      :key="page"
                      class="paginate_button page-item"
                      :class="{ active: page === pagination.page }"
                    >
                      <a
                        href="javascript:void(0);"
                        class="page-link"
                        @click="changePage(page)"
                      >
                        {{ page }}
                      </a>
                    </li>
                    <li class="paginate_button page-item next" :class="{ disabled: pagination.page === pagination.pages }">
                      <a
                        href="javascript:void(0);"
                        class="page-link"
                        @click="changePage(pagination.page + 1)"
                      >
                        <i class="ti ti-chevron-right"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Mensaje cuando no hay productos -->
            <div v-if="!loading && products.length === 0" class="text-center py-5">
              <i class="ti ti-package-off" style="font-size: 48px; color: #ccc;"></i>
              <p class="mt-3 text-muted">No se encontraron productos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Registro Rápido -->
  <div
    class="modal fade"
    id="quick-register-modal"
    tabindex="-1"
    aria-labelledby="quickRegisterModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="quickRegisterModalLabel">
            <i class="ti ti-bolt me-2"></i>
            Registro Rápido de Artículo
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeQuickRegisterModal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveQuickProduct">
            <div class="row g-3">
              <!-- Código -->
              <div class="col-md-6">
                <label class="form-label">Código</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="quickProduct.code"
                  placeholder="Código del producto"
                >
              </div>

              <!-- Nombre -->
              <div class="col-md-6">
                <label class="form-label">Nombre <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="quickProduct.name"
                  placeholder="Nombre del producto"
                  required
                >
              </div>

              <!-- Unidad -->
              <div class="col-md-6">
                <label class="form-label">Unidades <span class="text-danger">*</span></label>
                <select class="form-select" v-model="quickProduct.unit_id" required>
                  <option value="">Seleccione una unidad</option>
                  <option v-for="unit in units" :key="unit.id" :value="unit.id">
                    {{ unit.name }}
                  </option>
                </select>
              </div>

              <!-- Categoría -->
              <div class="col-md-6">
                <label class="form-label">Categoría <span class="text-danger">*</span></label>
                <select class="form-select" v-model="quickProduct.category_id" required @change="onQuickCategoryChange">
                  <option value="">Seleccione una categoría</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- Subcategoría -->
              <div class="col-md-6">
                <label class="form-label">Subcategoría</label>
                <select class="form-select" v-model="quickProduct.subcategory_id">
                  <option value="">Seleccione una subcategoría</option>
                  <option v-for="subcategory in quickFilteredSubcategories" :key="subcategory.id" :value="subcategory.id">
                    {{ subcategory.name }}
                  </option>
                </select>
              </div>

              <!-- Impuesto -->
              <div class="col-md-6">
                <label class="form-label">Impuesto <span class="text-danger">*</span></label>
                <select class="form-select" v-model="quickProduct.tax_id" required>
                  <option value="">Seleccione un impuesto</option>
                  <option v-for="tax in taxRates" :key="tax.id" :value="tax.id">
                    {{ tax.name }} ({{ tax.rate }}%)
                  </option>
                </select>
              </div>

              <!-- Costo -->
              <div class="col-md-4">
                <label class="form-label">Costo</label>
                <div class="input-group">
                  <span class="input-group-text">L</span>
                  <input
                    type="number"
                    class="form-control text-end"
                    v-model.number="quickProduct.cost"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    @input="calculateQuickPrice"
                  >
                </div>
              </div>

              <!-- Utilidad (Porcentaje) -->
              <div class="col-md-4">
                <label class="form-label">Utilidad (%)</label>
                <div class="input-group">
                  <input
                    type="number"
                    class="form-control text-end"
                    v-model.number="quickProduct.utilityPercent"
                    placeholder="0"
                    step="0.01"
                    min="0"
                    max="100"
                    @input="calculateQuickPrice"
                  >
                  <span class="input-group-text">%</span>
                </div>
              </div>

              <!-- Precio -->
              <div class="col-md-4">
                <label class="form-label">Precio</label>
                <div class="input-group">
                  <span class="input-group-text">L</span>
                  <input
                    type="number"
                    class="form-control text-end"
                    v-model.number="quickProduct.price"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    @input="calculateUtilityFromPrice"
                  >
                </div>
              </div>

              <!-- Imagen -->
              <div class="col-12">
                <label class="form-label">Imagen del Producto</label>
                <div class="d-flex align-items-center gap-3">
                  <div v-if="quickProduct.imagePreview" class="position-relative">
                    <img
                      :src="quickProduct.imagePreview"
                      alt="Preview"
                      style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;"
                    >
                    <button
                      type="button"
                      class="btn btn-danger btn-sm position-absolute top-0 end-0"
                      style="margin: -8px;"
                      @click="removeQuickImage"
                    >
                      <i class="ti ti-x"></i>
                    </button>
                  </div>
                  <div class="flex-grow-1">
                    <input
                      type="file"
                      class="form-control"
                      accept="image/*"
                      @change="handleQuickImageUpload"
                      ref="quickImageInput"
                    >
                    <small class="text-muted">Formatos: JPG, PNG, GIF (Max. 5MB)</small>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeQuickRegisterModal"
          >
            <i class="ti ti-x me-1"></i>
            CERRAR
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="saveQuickProduct"
            :disabled="savingQuickProduct"
          >
            <span v-if="savingQuickProduct">
              <span class="spinner-border spinner-border-sm me-1" role="status"></span>
              Guardando...
            </span>
            <span v-else>
              <i class="ti ti-check me-1"></i>
              GUARDAR
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación de eliminación -->
  <div
    class="modal fade"
    id="delete-modal" 
    tabindex="-1" 
    aria-labelledby="deleteModalLabel" 
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <button 
            type="button" 
            class="btn-close" 
            data-bs-dismiss="modal" 
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body text-center">
          <div class="avatar avatar-xl bg-danger-transparent rounded-circle mb-3 mx-auto">
            <i class="ti ti-trash text-danger" style="font-size: 2rem;"></i>
          </div>
          <h5 class="modal-title mb-2" id="deleteModalLabel">
            ¿Confirmar eliminación?
          </h5>
          <p class="text-muted mb-0" v-if="selectedProduct">
            ¿Estás seguro que deseas eliminar el producto 
            <strong>"{{ selectedProduct.name }}"</strong>?
          </p>
          <p class="text-muted small mt-2">
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="modal-footer border-0 justify-content-center">
          <button 
            type="button" 
            class="btn btn-secondary" 
            data-bs-dismiss="modal"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-danger"
            @click="deleteProduct"
            :disabled="deleting"
          >
            <span v-if="deleting">
              <span class="spinner-border spinner-border-sm me-1" role="status"></span>
              Eliminando...
            </span>
            <span v-else>
              <i class="ti ti-trash me-1"></i>
              Sí, eliminar
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/axios';
import { message } from 'ant-design-vue';

export default {
  name: 'ProductList',
  
  setup() {
    // Router
    const router = useRouter();

    // Estado reactivo
    const products = ref([]);
    const categories = ref([]);
    const subcategories = ref([]);
    const brands = ref([]);
    const units = ref([]);
    const taxRates = ref([]);
    const loading = ref(false);
    const deleting = ref(false);
    const error = ref(null);
    const selectedProduct = ref(null);
    const savingQuickProduct = ref(false);
    const showDropdown = ref(false);
    const quickImageInput = ref(null);

    // Estado para el formulario de registro rápido
    const quickProduct = reactive({
      code: '',
      name: '',
      unit_id: '',
      category_id: '',
      subcategory_id: '',
      cost: 0,
      utilityPercent: 0,
      price: 0,
      tax_id: '',
      imageFile: null,
      imagePreview: null
    });

    const filters = reactive({
      page: 1,
      limit: 15,
      search: '',
      category_id: '',
      subcategory_id: '',
      brand_id: '',
      stock_filter: '',
      sort_by: 'id',
      sort_order: 'ASC'
    });

    // Estado del ordenamiento para la tabla
    const tableSorter = ref({
      columnKey: null,
      order: null
    });

    const pagination = reactive({
      page: 1,
      limit: 15,
      total: 0,
      pages: 0
    });

    // Definición de columnas - usando server-side sorting con 3 estados
    const columns = computed(() => [
      {
        title: 'IMG',
        dataIndex: 'image',
        key: 'image',
        width: '90px',
        ellipsis: false
      },
      {
        title: 'Código',
        dataIndex: 'code',
        key: 'code',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        showSorterTooltip: false,
        sortOrder: tableSorter.value.columnKey === 'code' ? tableSorter.value.order : null,
        width: '100px',
        ellipsis: false
      },
      {
        title: 'Nombre',
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        showSorterTooltip: false,
        sortOrder: tableSorter.value.columnKey === 'name' ? tableSorter.value.order : null,
        ellipsis: false
      },
      {
        title: 'Categoría/Subcategoría',
        dataIndex: 'category_subcategory',
        key: 'category_subcategory',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        showSorterTooltip: false,
        sortOrder: tableSorter.value.columnKey === 'category_subcategory' ? tableSorter.value.order : null,
        width: '170px',
        ellipsis: false
      },
      {
        title: 'Stock',
        dataIndex: 'stock',
        key: 'stock',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        showSorterTooltip: false,
        sortOrder: tableSorter.value.columnKey === 'stock' ? tableSorter.value.order : null,
        width: '80px',
        ellipsis: false
      },
      {
        title: 'Precio',
        dataIndex: 'price_1',
        key: 'price_1',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        showSorterTooltip: false,
        sortOrder: tableSorter.value.columnKey === 'price_1' ? tableSorter.value.order : null,
        width: '100px',
        ellipsis: false
      },
      {
        title: 'Estatus',
        dataIndex: 'is_active',
        key: 'is_active',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        showSorterTooltip: false,
        sortOrder: tableSorter.value.columnKey === 'is_active' ? tableSorter.value.order : null,
        width: '90px',
        ellipsis: false
      },
      {
        title: '',
        key: 'action',
        width: '100px',
        ellipsis: false
      }
    ]);

    // Computed properties
    const filteredSubcategories = computed(() => {
      if (!filters.category_id) {
        return subcategories.value;
      }
      return subcategories.value.filter(sc => sc.category_id == filters.category_id);
    });

    const quickFilteredSubcategories = computed(() => {
      if (!quickProduct.category_id) {
        return subcategories.value;
      }
      return subcategories.value.filter(sc => sc.category_id == quickProduct.category_id);
    });

    const visiblePages = computed(() => {
      const pages = [];
      const maxVisible = 5;
      const current = pagination.page;
      const total = pagination.pages;

      if (total <= maxVisible) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        let start = Math.max(1, current - 2);
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
      console.log('Sorter:', sorter); // Debug

      // Actualizar el estado del ordenamiento
      tableSorter.value = {
        columnKey: sorter.columnKey,
        order: sorter.order
      };

      // Si se canceló el ordenamiento (sorter.order es undefined o false), volver al orden por defecto
      if (sorter.column !== undefined && !sorter.order) {
        filters.sort_by = 'id';
        filters.sort_order = 'ASC';
        filters.page = 1;
        loadProducts();
      } else if (sorter.field && sorter.order) {
        // Si hay un campo y orden, aplicar el ordenamiento
        // Mapear category_subcategory a category_name para el backend
        let sortField = sorter.field;
        if (sorter.field === 'category_subcategory') {
          sortField = 'category_name';
        }

        filters.sort_by = sortField;
        filters.sort_order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
        filters.page = 1; // Reset to first page when sorting
        loadProducts();
      }
    };

    const loadProducts = async () => {
      loading.value = true;
      error.value = null;

      try {
        const params = {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
          category_id: filters.category_id || undefined,
          subcategory_id: filters.subcategory_id || undefined,
          brand_id: filters.brand_id || undefined,
          sort_by: filters.sort_by,
          sort_order: filters.sort_order,
          includeStock: true  // Incluir stock total de todas las bodegas
        };

        const response = await api.get('/products', { params });

        if (response.data.success) {
          let productsData = response.data.data.products;

          // Filtrar por stock en el frontend
          if (filters.stock_filter === 'with_stock') {
            productsData = productsData.filter(p => p.stock > 0);
          } else if (filters.stock_filter === 'without_stock') {
            productsData = productsData.filter(p => p.stock <= 0);
          }

          products.value = productsData;
          Object.assign(pagination, response.data.data.pagination);
        } else {
          throw new Error(response.data.message || 'Error al cargar productos');
        }
      } catch (err) {
        console.error('Error loading products:', err);
        error.value = err.response?.data?.message || err.message || 'Error al cargar productos';
        
        // Si es error de autenticación, no mostrar mensaje adicional
        if (err.response?.status !== 401) {
          message.error(error.value);
        }
      } finally {
        loading.value = false;
      }
    };

    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.data.success) {
          categories.value = response.data.data;
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        // No mostrar error si es 401 (se manejará en el interceptor)
        if (err.response?.status !== 401 && err.response?.status !== 404) {
          console.warn('Categorías no disponibles');
        }
      }
    };

    const loadSubcategories = async () => {
      try {
        const response = await api.get('/subcategories');
        if (response.data.success) {
          subcategories.value = response.data.data;
        }
      } catch (err) {
        console.error('Error loading subcategories:', err);
        if (err.response?.status !== 401 && err.response?.status !== 404) {
          console.warn('Subcategorías no disponibles');
        }
      }
    };

    const loadBrands = async () => {
      try {
        const response = await api.get('/brands');
        if (response.data.success) {
          brands.value = response.data.data;
        }
      } catch (err) {
        console.error('Error loading brands:', err);
        // No mostrar error si no existe la ruta de brands
        if (err.response?.status !== 401 && err.response?.status !== 404) {
          console.warn('Marcas no disponibles - ruta no implementada');
        }
      }
    };

    const loadUnits = async () => {
      try {
        const response = await api.get('/units');
        if (response.data.success) {
          units.value = response.data.data;
        }
      } catch (err) {
        console.error('Error loading units:', err);
        if (err.response?.status !== 401 && err.response?.status !== 404) {
          console.warn('Unidades no disponibles');
        }
      }
    };

    const loadTaxRates = async () => {
      try {
        const response = await api.get('/tax-rates');
        if (response.data.success) {
          taxRates.value = response.data.data;
        }
      } catch (err) {
        console.error('Error loading tax rates:', err);
        if (err.response?.status !== 401 && err.response?.status !== 404) {
          console.warn('Tasas de impuesto no disponibles');
        }
      }
    };

    // Búsqueda con debounce
    let searchTimeout;
    const debounceSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        filters.page = 1;
        loadProducts();
      }, 500);
    };

    // Aplicar filtros
    const applyFilters = () => {
      filters.page = 1; // Volver a la primera página al aplicar filtros
      loadProducts();
    };

    // Limpiar filtros
    const clearFilters = () => {
      filters.search = '';
      filters.category_id = '';
      filters.subcategory_id = '';
      filters.brand_id = '';
      filters.stock_filter = '';
      filters.page = 1;
      loadProducts();
    };

    const changePage = (page) => {
      if (page < 1 || page > pagination.pages) return;
      filters.page = page;
      loadProducts();
    };

    const viewProduct = (id) => {
      window.location.href = `/inventory/product-details?id=${id}`;
    };

    const editProduct = (id) => {
      router.push({ name: 'EditProduct', params: { id } });
    };

    const confirmDelete = (product) => {
      selectedProduct.value = product;
      const deleteModal = new bootstrap.Modal(document.getElementById('delete-modal'));
      deleteModal.show();
    };

    // Funciones para el Dropdown
    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const goToNewProduct = () => {
      showDropdown.value = false;
      router.push('/inventory/add-product');
    };

    const openQuickRegister = () => {
      showDropdown.value = false;
      showQuickRegisterModal();
    };

    // Cerrar dropdown al hacer clic fuera
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.page-btn.position-relative');
      if (dropdown && !dropdown.contains(event.target)) {
        showDropdown.value = false;
      }
    };

    // Funciones para Registro Rápido
    const showQuickRegisterModal = () => {
      // Resetear el formulario
      Object.assign(quickProduct, {
        code: '',
        name: '',
        unit_id: '',
        category_id: '',
        subcategory_id: '',
        cost: 0,
        utilityPercent: 0,
        price: 0,
        tax_id: '',
        imageFile: null,
        imagePreview: null
      });

      // Resetear el input de imagen si existe
      if (quickImageInput.value) {
        quickImageInput.value.value = '';
      }

      // Usar jQuery o DOM API directamente para abrir el modal
      const modalElement = document.getElementById('quick-register-modal');
      if (modalElement) {
        // Intentar con Bootstrap si está disponible
        if (typeof window.bootstrap !== 'undefined') {
          const quickModal = new window.bootstrap.Modal(modalElement);
          quickModal.show();
        } else if (typeof $ !== 'undefined') {
          // Fallback a jQuery
          $(modalElement).modal('show');
        } else {
          // Fallback manual
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
          document.body.classList.add('modal-open');

          // Agregar backdrop
          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop fade show';
          backdrop.id = 'quick-modal-backdrop';
          document.body.appendChild(backdrop);
        }
      }
    };

    const onQuickCategoryChange = () => {
      // Resetear subcategoría si la categoría cambia
      quickProduct.subcategory_id = '';
    };

    const calculateQuickPrice = () => {
      // Calcular precio basado en costo + porcentaje de utilidad
      if (quickProduct.cost && quickProduct.utilityPercent) {
        const utilityAmount = quickProduct.cost * (quickProduct.utilityPercent / 100);
        quickProduct.price = parseFloat((quickProduct.cost + utilityAmount).toFixed(2));
      } else if (quickProduct.cost) {
        quickProduct.price = parseFloat(quickProduct.cost.toFixed(2));
      } else {
        quickProduct.price = 0;
      }
    };

    const calculateUtilityFromPrice = () => {
      // Calcular porcentaje de utilidad basado en el precio ingresado
      if (quickProduct.price && quickProduct.cost && quickProduct.cost > 0) {
        const utilityAmount = quickProduct.price - quickProduct.cost;
        quickProduct.utilityPercent = parseFloat(((utilityAmount / quickProduct.cost) * 100).toFixed(2));
      } else {
        quickProduct.utilityPercent = 0;
      }
    };

    const handleQuickImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          message.error('La imagen no debe superar los 5MB');
          event.target.value = '';
          return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          message.error('Por favor seleccione una imagen válida');
          event.target.value = '';
          return;
        }

        quickProduct.imageFile = file;

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
          quickProduct.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const removeQuickImage = () => {
      quickProduct.imageFile = null;
      quickProduct.imagePreview = null;
      if (quickImageInput.value) {
        quickImageInput.value.value = '';
      }
    };

    const closeQuickRegisterModal = () => {
      const modalElement = document.getElementById('quick-register-modal');
      if (modalElement) {
        if (typeof window.bootstrap !== 'undefined') {
          const quickModal = window.bootstrap.Modal.getInstance(modalElement);
          if (quickModal) {
            quickModal.hide();
          }
        } else if (typeof $ !== 'undefined') {
          $(modalElement).modal('hide');
        } else {
          // Manual close
          modalElement.classList.remove('show');
          modalElement.style.display = 'none';
          document.body.classList.remove('modal-open');

          // Remover backdrop
          const backdrop = document.getElementById('quick-modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
        }
      }
    };

    const saveQuickProduct = async () => {
      // Validar campos requeridos
      if (!quickProduct.name) {
        message.error('El nombre es requerido');
        return;
      }
      if (!quickProduct.unit_id) {
        message.error('La unidad es requerida');
        return;
      }
      if (!quickProduct.category_id) {
        message.error('La categoría es requerida');
        return;
      }
      if (!quickProduct.tax_id) {
        message.error('El impuesto es requerido');
        return;
      }

      savingQuickProduct.value = true;
      try {
        // Preparar datos del producto (sin imagen)
        const productData = {
          name: quickProduct.name,
          unit_id: parseInt(quickProduct.unit_id),
          category_id: parseInt(quickProduct.category_id),
          cost: parseFloat(quickProduct.cost) || 0,
          price_1: parseFloat(quickProduct.price) || 0,
          tax_id: parseInt(quickProduct.tax_id),
          status: 'active',
          is_active: true
        };

        // Campos opcionales - enviar null si están vacíos
        productData.code = quickProduct.code?.trim() || null;
        productData.subcategory_id = quickProduct.subcategory_id ? parseInt(quickProduct.subcategory_id) : null;

        // 1. Crear el producto
        const response = await api.post('/products', productData);

        if (response.data.success) {
          const createdProduct = response.data.data;

          // 2. Si hay imagen, subirla
          if (quickProduct.imageFile && createdProduct.id) {
            try {
              const formData = new FormData();
              formData.append('file', quickProduct.imageFile);
              formData.append('productId', createdProduct.id);
              formData.append('imageType', 'main');

              await api.post('/upload/product', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              });
            } catch (uploadErr) {
              console.error('Error uploading image:', uploadErr);
              // No fallar si la imagen no se sube, el producto ya fue creado
              message.warning('Producto creado pero la imagen no se pudo subir');
            }
          }

          message.success('Producto creado exitosamente');

          // Cerrar modal
          closeQuickRegisterModal();

          // Recargar productos
          loadProducts();
        } else {
          throw new Error(response.data.message || 'Error al crear producto');
        }
      } catch (err) {
        console.error('Error saving quick product:', err);

        // Detectar error de código duplicado
        const errorMessage = err.response?.data?.message || err.message || '';
        if (errorMessage.toLowerCase().includes('ya existe') ||
            errorMessage.toLowerCase().includes('duplicado') ||
            errorMessage.toLowerCase().includes('código')) {
          message.error('El código del producto ya existe. Por favor, ingrese un código diferente.');
        } else {
          message.error(errorMessage || 'Error al guardar el producto');
        }
      } finally {
        savingQuickProduct.value = false;
      }
    };

    const deleteProduct = async () => {
      if (!selectedProduct.value) return;

      deleting.value = true;
      try {
        const response = await api.delete(`/products/${selectedProduct.value.id}`);
        
        if (response.data.success) {
          message.success('Producto eliminado correctamente');
          loadProducts();
          
          const deleteModal = bootstrap.Modal.getInstance(document.getElementById('delete-modal'));
          deleteModal?.hide();
        } else {
          throw new Error(response.data.message || 'Error al eliminar producto');
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        message.error(err.response?.data?.message || 'Error al eliminar producto');
      } finally {
        deleting.value = false;
        selectedProduct.value = null;
      }
    };

    // Funciones del header
    const toggleHeader = () => {
      document.getElementById("collapse-header")?.classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    };

    const refreshData = () => {
      message.info('Actualizando datos...');
      loadProducts();
      loadCategories();
      loadSubcategories();
      loadBrands();
    };

    const exportToPDF = () => {
      message.info('Exportación a PDF no implementada aún');
    };

    const exportToExcel = () => {
      message.info('Exportación a Excel no implementada aún');
    };

    const showImportModal = () => {
      message.info('Modal de importación no implementado aún');
    };

    // Utilidades
    const formatPrice = (price) => {
      if (!price) return '0.00';
      const number = parseFloat(price);
      return number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    const formatStock = (stock) => {
      if (!stock) return '0.00';
      const number = parseFloat(stock);
      return number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    const getStockClass = (stock) => {
      const currentStock = parseFloat(stock) || 0;

      if (currentStock === 0) return 'bg-danger';
      if (currentStock <= 10) return 'bg-warning';
      return 'bg-success';
    };

    const getCategoryName = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId);
      return category?.name || 'Categoría';
    };

    const getBrandName = (brandId) => {
      const brand = brands.value.find(b => b.id === brandId);
      return brand?.name || 'Marca';
    };

    const getStatusLabel = (status) => {
      if (status === 'active') return 'Activos';
      if (status === 'inactive') return 'Inactivos';
      return 'Todos los estados';
    };

    const getDefaultImage = () => {
      // Usar un data URL simple como placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMjAgMTBDMTUgMTAgMTEgMTQgMTEgMTlDMTEgMjQgMTUgMjggMjAgMjhDMjUgMjggMjkgMjQgMjkgMTlDMjkgMTQgMjUgMTAgMjAgMTBaTTIwIDI2QzE2IDI2IDEzIDIzIDEzIDE5QzEzIDE1IDE2IDEyIDIwIDEyQzI0IDEyIDI3IDE1IDI3IDE5QzI3IDIzIDI0IDI2IDIwIDI2WiIgZmlsbD0iIzlDQTNCMCIvPjxwYXRoIGQ9Ik0yNyAzMEgxM0MxMiAzMCAxMSAzMSAxMSAzMlYzM0MxMSAzNCAxMiAzNSAxMyAzNUgyN0MyOCAzNSAyOSAzNCAyOSAzM1YzMkMyOSAzMSAyOCAzMCAyNyAzMFoiIGZpbGw9IiM5Q0EzQjAiLz48L3N2Zz4=';
    };

    const handleImageError = (event) => {
      // Prevenir loop infinito: solo intentar una vez
      if (!event.target.dataset.errorHandled) {
        event.target.dataset.errorHandled = 'true';
        event.target.src = getDefaultImage();
      }
    };

    // Watchers
    // Resetear subcategoría cuando cambia la categoría
    watch(() => filters.category_id, (newCategoryId, oldCategoryId) => {
      // Si la categoría cambió y hay una subcategoría seleccionada
      if (newCategoryId !== oldCategoryId && filters.subcategory_id) {
        // Verificar si la subcategoría actual pertenece a la nueva categoría
        const currentSubcategory = subcategories.value.find(sc => sc.id == filters.subcategory_id);
        if (!currentSubcategory || currentSubcategory.category_id != newCategoryId) {
          // Si no pertenece, resetear la subcategoría
          filters.subcategory_id = '';
        }
      }
    });

    // Lifecycle hook
    onMounted(() => {
      loadProducts();
      loadCategories();
      loadSubcategories();
      loadBrands();
      loadUnits();
      loadTaxRates();

      // Agregar listener para cerrar dropdown al hacer clic fuera
      document.addEventListener('click', handleClickOutside);
    });

    // Cleanup
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      products,
      categories,
      subcategories,
      brands,
      units,
      taxRates,
      loading,
      deleting,
      error,
      selectedProduct,
      savingQuickProduct,
      quickProduct,
      showDropdown,
      quickImageInput,
      filters,
      pagination,
      columns,
      tableSorter,
      filteredSubcategories,
      quickFilteredSubcategories,
      visiblePages,
      handleTableChange,
      loadProducts,
      debounceSearch,
      applyFilters,
      clearFilters,
      changePage,
      viewProduct,
      editProduct,
      confirmDelete,
      deleteProduct,
      toggleDropdown,
      goToNewProduct,
      openQuickRegister,
      showQuickRegisterModal,
      closeQuickRegisterModal,
      onQuickCategoryChange,
      calculateQuickPrice,
      calculateUtilityFromPrice,
      handleQuickImageUpload,
      removeQuickImage,
      saveQuickProduct,
      toggleHeader,
      refreshData,
      exportToPDF,
      exportToExcel,
      showImportModal,
      formatPrice,
      formatStock,
      getStockClass,
      getCategoryName,
      getBrandName,
      getStatusLabel,
      getDefaultImage,
      handleImageError
    };
  }
};
</script>

<style scoped>
.spinner-border {
  width: 3rem;
  height: 3rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  white-space: normal;
  word-wrap: break-word;
  display: inline-block;
  max-width: 100%;
}

.productimgname img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.action-table-data a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: all 0.3s ease;
  padding: 0 !important;
}

.action-table-data a:hover {
  background-color: #f0f0f0;
}

.pagination .page-link {
  cursor: pointer;
}

.pagination .disabled .page-link {
  cursor: not-allowed;
}

.bg-info-transparent {
  background-color: rgba(23, 162, 184, 0.1);
  color: #17a2b8;
  white-space: normal;
  word-wrap: break-word;
}

.bg-danger-transparent {
  background-color: rgba(220, 53, 69, 0.1);
}

.avatar-xl {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.alert-dismissible .btn-close {
  padding: 0.75rem 1.25rem;
}

/* Estilos para eliminar scroll horizontal y hacer filas más altas */
.custom-datatable-filter {
  overflow-x: hidden !important;
  width: 100%;
}

:deep(.ant-table) {
  width: 100%;
  table-layout: auto;
}

:deep(.ant-table-wrapper) {
  overflow-x: hidden !important;
  overflow-y: visible;
}

:deep(.ant-table-container) {
  overflow-x: hidden !important;
}

:deep(.ant-table-content) {
  overflow-x: hidden !important;
}

:deep(.ant-table-thead > tr > th) {
  white-space: normal !important;
  word-wrap: break-word;
  padding: 10px 6px !important;
  font-size: 12px;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr > td) {
  white-space: normal !important;
  word-wrap: break-word;
  padding: 12px 6px !important;
  vertical-align: middle;
  min-height: 80px;
  line-height: 1.4;
  font-size: 13px;
}

:deep(.ant-table-tbody > tr) {
  min-height: 80px;
}

/* Asegurar que las imágenes se mantengan en su tamaño y sean cuadradas */
:deep(.avatar) {
  flex-shrink: 0;
  display: inline-block;
  width: 70px;
  height: 70px;
}

:deep(.avatar img) {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  display: block;
}

/* Ajustar el ancho de las columnas de manera responsive */
:deep(.ant-table-cell) {
  overflow-wrap: break-word;
  word-break: break-word;
}

/* Hacer que los badges ocupen el ancho disponible */
:deep(.badge) {
  display: inline-block;
  max-width: 100%;
  white-space: normal;
  word-wrap: break-word;
  text-align: center;
  line-height: 1.4;
}

/* Ajustar acciones para que estén centradas verticalmente */
:deep(.action-table-data) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  overflow: visible !important;
}

:deep(.edit-delete-action) {
  display: flex;
  gap: 2px;
  flex-wrap: nowrap;
}

/* Hacer los iconos de acciones del tamaño adecuado */
:deep(.action-table-data svg) {
  width: 18px;
  height: 18px;
}

/* Ajustar el contenedor de la tabla para que no tenga scroll horizontal */
:deep(.table-responsive) {
  overflow-x: hidden !important;
}

/* Optimizar espacio en badges de código */
:deep(.ant-table-tbody .badge.bg-light) {
  font-size: 11px;
  padding: 0.25rem 0.4rem;
}

/* Optimizar espacio en enlaces de nombre de producto */
:deep(.ant-table-tbody a) {
  font-size: 13px;
  line-height: 1.3;
}

/* Reducir tamaño de badges de categoría */
:deep(.badge.bg-info-transparent) {
  font-size: 11px;
  padding: 0.25rem 0.4rem;
}

/* Reducir tamaño de badges de stock y status */
:deep(.ant-table-tbody .badge.bg-success,
       .ant-table-tbody .badge.bg-warning,
       .ant-table-tbody .badge.bg-danger) {
  font-size: 12px;
  padding: 0.3rem 0.5rem;
  font-weight: 600;
}

/* Optimizar precio */
:deep(.ant-table-tbody .fw-bold.text-success) {
  font-size: 13px;
}

/* Asegurar que los botones de acción no se corten */
:deep(.ant-table-tbody > tr > td:last-child) {
  overflow: visible !important;
}

:deep(.ant-table-cell) {
  overflow: visible !important;
}
</style>