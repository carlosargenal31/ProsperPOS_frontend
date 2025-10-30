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
        <div class="page-btn d-flex">
          <router-link to="/inventory/add-product" class="btn btn-primary d-flex align-items-center">
            <vue-feather type="plus-circle" class="me-2"></vue-feather>
            Agregar Producto
          </router-link>
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
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
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
          <div class="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
            <!-- Filtro por Categoría -->
            <div class="dropdown me-2">
              <a 
                href="javascript:void(0);" 
                class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" 
                data-bs-toggle="dropdown"
              >
                {{ filters.category_id ? getCategoryName(filters.category_id) : 'Categoría' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end p-3">
                <li>
                  <a 
                    href="javascript:void(0);" 
                    class="dropdown-item rounded-1"
                    @click="filters.category_id = null; loadProducts()"
                  >
                    Todas las categorías
                  </a>
                </li>
                <li v-for="category in categories" :key="category.id">
                  <a 
                    href="javascript:void(0);" 
                    class="dropdown-item rounded-1"
                    @click="filters.category_id = category.id; loadProducts()"
                  >
                    {{ category.name }}
                  </a>
                </li>
              </ul>
            </div>

            <!-- Filtro por Marca -->
            <div class="dropdown me-2" v-if="brands.length > 0">
              <a 
                href="javascript:void(0);" 
                class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" 
                data-bs-toggle="dropdown"
              >
                {{ filters.brand_id ? getBrandName(filters.brand_id) : 'Marca' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end p-3">
                <li>
                  <a 
                    href="javascript:void(0);" 
                    class="dropdown-item rounded-1"
                    @click="filters.brand_id = null; loadProducts()"
                  >
                    Todas las marcas
                  </a>
                </li>
                <li v-for="brand in brands" :key="brand.id">
                  <a 
                    href="javascript:void(0);" 
                    class="dropdown-item rounded-1"
                    @click="filters.brand_id = brand.id; loadProducts()"
                  >
                    {{ brand.name }}
                  </a>
                </li>
              </ul>
            </div>

            <!-- Filtro por Estado -->
            <div class="dropdown me-2">
              <a 
                href="javascript:void(0);" 
                class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" 
                data-bs-toggle="dropdown"
              >
                {{ getStatusLabel(filters.status) }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end p-3">
                <li>
                  <a 
                    href="javascript:void(0);" 
                    class="dropdown-item rounded-1"
                    @click="filters.status = 'active'; loadProducts()"
                  >
                    Activos
                  </a>
                </li>
                <li>
                  <a 
                    href="javascript:void(0);" 
                    class="dropdown-item rounded-1"
                    @click="filters.status = 'inactive'; loadProducts()"
                  >
                    Inactivos
                  </a>
                </li>
                <li>
                  <a 
                    href="javascript:void(0);" 
                    class="dropdown-item rounded-1"
                    @click="filters.status = null; loadProducts()"
                  >
                    Todos
                  </a>
                </li>
              </ul>
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
          <div v-else class="custom-datatable-filter table-responsive">
            <a-table
              class="table datanew table-hover table-center mb-0"
              :columns="columns"
              :data-source="products"
              :row-selection="{}"
              :pagination="false"
              :loading="loading"
            >
              <template #bodyCell="{ column, record }">
                <!-- Columna de producto con imagen -->
                <template v-if="column.key === 'product'">
                  <div class="productimgname">
                    <a href="javascript:void(0);" class="avatar avatar-md me-2">
                      <img 
                        :src="record.image || getDefaultImage()"
                        alt="producto"
                        @error="handleImageError"
                      />
                    </a>
                    <a href="javascript:void(0);">{{ record.name }}</a>
                  </div>
                </template>

                <!-- Columna de código -->
                <template v-else-if="column.key === 'code'">
                  <span class="badge bg-light text-dark">{{ record.code }}</span>
                </template>

                <!-- Columna de código de barras -->
                <template v-else-if="column.key === 'barcode'">
                  <span v-if="record.barcode">{{ record.barcode }}</span>
                  <span v-else class="text-muted">-</span>
                </template>

                <!-- Columna de categoría -->
                <template v-else-if="column.key === 'category'">
                  <span class="badge bg-info-transparent">
                    {{ record.category_name || 'Sin categoría' }}
                  </span>
                </template>

                <!-- Columna de marca -->
                <template v-else-if="column.key === 'brand'">
                  <span v-if="record.brand_name">{{ record.brand_name }}</span>
                  <span v-else class="text-muted">-</span>
                </template>

                <!-- Columna de precio -->
                <template v-else-if="column.key === 'price'">
                  <span class="fw-bold text-success">
                    L. {{ formatPrice(record.sale_price) }}
                  </span>
                </template>

                <!-- Columna de unidad -->
                <template v-else-if="column.key === 'unit'">
                  {{ record.unit || 'Pc' }}
                </template>

                <!-- Columna de stock -->
                <template v-else-if="column.key === 'stock'">
                  <span 
                    :class="getStockClass(record.current_stock, record.min_stock)"
                    class="badge"
                  >
                    {{ record.current_stock || 0 }}
                  </span>
                </template>

                <!-- Columna de estado -->
                <template v-else-if="column.key === 'status'">
                  <span 
                    :class="record.status === 'active' ? 'badge bg-success' : 'badge bg-danger'"
                  >
                    {{ record.status === 'active' ? 'Activo' : 'Inactivo' }}
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
                        Anterior
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
                        Siguiente
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
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';

// Configuración de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuestas para manejo de errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      message.error('Sesión expirada. Por favor inicia sesión nuevamente.');
      localStorage.removeItem('token');
      setTimeout(() => {
        window.location.href = '/signin';
      }, 1500);
    }
    return Promise.reject(error);
  }
);

export default {
  name: 'ProductList',
  
  setup() {
    // Estado reactivo
    const products = ref([]);
    const categories = ref([]);
    const brands = ref([]);
    const loading = ref(false);
    const deleting = ref(false);
    const error = ref(null);
    const selectedProduct = ref(null);
    
    const filters = reactive({
      page: 1,
      limit: 50,
      search: '',
      category_id: null,
      brand_id: null,
      status: 'active'
    });

    const pagination = reactive({
      page: 1,
      limit: 50,
      total: 0,
      pages: 0
    });

    // Definición de columnas
    const columns = [
      {
        title: 'Código',
        dataIndex: 'code',
        key: 'code',
        width: 100
      },
      {
        title: 'Producto',
        dataIndex: 'name',
        key: 'product',
        width: 250
      },
      {
        title: 'Código de Barras',
        dataIndex: 'barcode',
        key: 'barcode',
        width: 150
      },
      {
        title: 'Categoría',
        dataIndex: 'category_name',
        key: 'category',
        width: 120
      },
      {
        title: 'Marca',
        dataIndex: 'brand_name',
        key: 'brand',
        width: 120
      },
      {
        title: 'Precio',
        dataIndex: 'sale_price',
        key: 'price',
        width: 100
      },
      {
        title: 'Unidad',
        dataIndex: 'unit',
        key: 'unit',
        width: 80
      },
      {
        title: 'Stock',
        dataIndex: 'current_stock',
        key: 'stock',
        width: 80
      },
      {
        title: 'Estado',
        dataIndex: 'status',
        key: 'status',
        width: 100
      },
      {
        title: 'Acciones',
        key: 'action',
        width: 120
      }
    ];

    // Computed properties
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
    const loadProducts = async () => {
      loading.value = true;
      error.value = null;

      try {
        const params = {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
          category_id: filters.category_id || undefined,
          brand_id: filters.brand_id || undefined,
          status: filters.status || undefined
        };

        const response = await api.get('/products', { params });
        
        if (response.data.success) {
          products.value = response.data.data.products;
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

    // Búsqueda con debounce
    let searchTimeout;
    const debounceSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        filters.page = 1;
        loadProducts();
      }, 500);
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
      window.location.href = `/inventory/edit-product?id=${id}`;
    };

    const confirmDelete = (product) => {
      selectedProduct.value = product;
      const deleteModal = new bootstrap.Modal(document.getElementById('delete-modal'));
      deleteModal.show();
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
      return parseFloat(price).toFixed(2);
    };

    const getStockClass = (currentStock, minStock) => {
      const stock = currentStock || 0;
      const min = minStock || 0;

      if (stock === 0) return 'bg-danger';
      if (stock <= min) return 'bg-warning';
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
      return '/src/assets/img/products/default-product.png';
    };

    const handleImageError = (event) => {
      event.target.src = getDefaultImage();
    };

    // Lifecycle hook
    onMounted(() => {
      loadProducts();
      loadCategories();
      loadBrands();
    });

    return {
      products,
      categories,
      brands,
      loading,
      deleting,
      error,
      selectedProduct,
      filters,
      pagination,
      columns,
      visiblePages,
      loadProducts,
      debounceSearch,
      changePage,
      viewProduct,
      editProduct,
      confirmDelete,
      deleteProduct,
      toggleHeader,
      refreshData,
      exportToPDF,
      exportToExcel,
      showImportModal,
      formatPrice,
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
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
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
</style>