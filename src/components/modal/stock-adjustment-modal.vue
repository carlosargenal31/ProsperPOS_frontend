<template>
  <div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-dark text-white">
          <h5 class="modal-title">
            <i class="ti ti-menu-2 me-2"></i>Ajuste de Inventario
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <!-- Formulario Principal -->
          <div class="row mb-3">
            <div class="col-lg-6 col-md-6">
              <label class="form-label">Consecutivo</label>
              <input
                type="text"
                class="form-control bg-light text-danger fw-bold"
                v-model="adjustment.consecutive"
                readonly
              />
            </div>
            <div class="col-lg-6 col-md-6">
              <label class="form-label">Fecha de Emisión</label>
              <input
                type="datetime-local"
                class="form-control bg-light"
                v-model="adjustment.issue_date"
                readonly
              />
            </div>
          </div>

          <!-- Fila 2: Producto, Categoría, Subcategoría -->
          <div class="row mb-3">
            <div class="col-lg-4 col-md-4">
              <label class="form-label">Producto</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  :value="selectedProductName"
                  placeholder="Seleccione Producto"
                  readonly
                />
                <button class="btn btn-primary" type="button" @click="showProductModal = true">
                  <i class="ti ti-search"></i>
                </button>
                <button class="btn btn-danger" type="button" @click="clearProduct" v-if="filters.product_id">
                  <i class="ti ti-x"></i>
                </button>
              </div>
            </div>
            <div class="col-lg-4 col-md-4">
              <label class="form-label">Categoría</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  :value="selectedCategoryName"
                  placeholder="Seleccione Categoría"
                  readonly
                />
                <button class="btn btn-primary" type="button" @click="showCategoryModal = true">
                  <i class="ti ti-search"></i>
                </button>
                <button class="btn btn-danger" type="button" @click="clearCategory" v-if="filters.category_id">
                  <i class="ti ti-x"></i>
                </button>
              </div>
            </div>
            <div class="col-lg-4 col-md-4">
              <label class="form-label">Subcategoría</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  :value="selectedSubcategoryName"
                  placeholder="Seleccione Subcategoría"
                  readonly
                />
                <button class="btn btn-primary" type="button" @click="showSubcategoryModal = true">
                  <i class="ti ti-search"></i>
                </button>
                <button class="btn btn-danger" type="button" @click="clearSubcategory" v-if="filters.subcategory_id">
                  <i class="ti ti-x"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Fila 3: Bodega -->
          <div class="row mb-3">
            <div class="col-lg-12 col-md-12">
              <label class="form-label">Bodega <span class="text-danger">*</span></label>
              <vue-select
                :options="warehouseOptions"
                v-model="selectedWarehouse"
                placeholder="Seleccione Bodega"
              />
            </div>
          </div>

          <!-- Concepto -->
          <div class="row mb-3">
            <div class="col-12">
              <label class="form-label">Concepto</label>
              <input
                type="text"
                class="form-control"
                v-model="adjustment.concept"
                placeholder="Ajuste de inventario del 2025-12-16"
              />
            </div>
          </div>

          <!-- Filtrar por -->
          <div class="row mb-3">
            <div class="col-12">
              <div class="d-flex align-items-center gap-3">
                <label class="form-label mb-0">Filtrar por:</label>
                <select class="form-select w-auto" v-model="filters.filter_by">
                  <option value="name">Nombre</option>
                  <option value="code">Código</option>
                  <option value="category">Categoría</option>
                </select>
                <div class="input-group" style="max-width: 400px;">
                  <span class="input-group-text"><i class="ti ti-search"></i></span>
                  <input
                    type="text"
                    class="form-control"
                    v-model="searchTerm"
                    placeholder="Buscar..."
                  />
                </div>
                <button
                  type="button"
                  class="btn btn-danger ms-auto"
                  @click="setAllToZero"
                  :disabled="inventoryItems.length === 0"
                >
                  <i class="ti ti-circle-off me-1"></i>
                  EXISTENCIAS CERO
                </button>
              </div>
            </div>
          </div>

          <p class="text-danger small">
            Llevar a cero las existencias de los productos mostrados en pantalla.
          </p>

          <!-- Tabla de Inventario -->
          <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
            <table class="table table-bordered">
              <thead class="table-light sticky-top">
                <tr>
                  <th style="width: 10%;">Código</th>
                  <th style="width: 35%;">Nombre</th>
                  <th style="width: 20%;">Bodega</th>
                  <th style="width: 11%;" class="text-center">Exist.<br>Teórica</th>
                  <th style="width: 12%;" class="text-center">Exist.<br>Física</th>
                  <th style="width: 12%;" class="text-center">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredItems" :key="index" style="height: 60px;">
                  <td style="vertical-align: middle;">{{ item.codigo }}</td>
                  <td style="vertical-align: middle; white-space: normal; word-wrap: break-word;">
                    {{ item.producto }}
                  </td>
                  <td style="vertical-align: middle; white-space: normal; word-wrap: break-word;">
                    {{ item.bodega }}
                  </td>
                  <td class="text-end" style="vertical-align: middle;">
                    <strong>{{ item.exist_teorica }}</strong>
                  </td>
                  <td class="text-end" style="vertical-align: middle;">
                    <input
                      type="number"
                      class="form-control text-end"
                      v-model.number="item.exist_fisica"
                      @input="updateFromFisica(item)"
                      step="1"
                      min="0"
                      style="font-size: 0.95rem; padding: 0.4rem;"
                    />
                  </td>
                  <td class="text-end" style="vertical-align: middle;">
                    <input
                      type="number"
                      class="form-control text-end"
                      v-model.number="item.diferencia"
                      @input="updateFromDiferencia(item)"
                      step="1"
                      :class="{ 'text-danger fw-bold': item.diferencia < 0, 'text-success fw-bold': item.diferencia > 0 }"
                      style="font-size: 0.95rem; padding: 0.4rem;"
                    />
                  </td>
                </tr>
                <tr v-if="filteredItems.length === 0">
                  <td colspan="6" class="text-center py-4">
                    <i class="ti ti-inbox" style="font-size: 32px; color: #ccc;"></i>
                    <p class="mb-0 text-muted">No hay productos para mostrar</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            CERRAR
          </button>
          <button type="button" class="btn btn-success" @click="saveAdjustment" :disabled="saving || !canSave">
            {{ saving ? 'GUARDANDO...' : 'APLICAR AJUSTES' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Selección de Producto -->
  <div class="modal fade show" v-if="showProductModal" style="display: block; background: rgba(0,0,0,0.5);" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Seleccionar Producto</h5>
          <button type="button" class="btn-close" @click="showProductModal = false"></button>
        </div>
        <div class="modal-body">
          <input type="text" class="form-control mb-3" v-model="productSearch" placeholder="Buscar producto..."/>
          <div class="list-group" style="max-height: 400px; overflow-y: auto;">
            <button
              type="button"
              class="list-group-item list-group-item-action"
              v-for="product in filteredProducts"
              :key="product.id"
              :class="{ active: filters.product_id === product.id }"
              @click="selectProduct(product)"
            >
              {{ product.code }} - {{ product.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Selección de Categoría -->
  <div class="modal fade show" v-if="showCategoryModal" style="display: block; background: rgba(0,0,0,0.5);" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Seleccionar Categoría</h5>
          <button type="button" class="btn-close" @click="showCategoryModal = false"></button>
        </div>
        <div class="modal-body">
          <input type="text" class="form-control mb-3" v-model="categorySearch" placeholder="Buscar categoría..."/>
          <div class="list-group">
            <button
              type="button"
              class="list-group-item list-group-item-action"
              v-for="category in filteredCategories"
              :key="category.id"
              :class="{ active: filters.category_id === category.id }"
              @click="selectCategory(category)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Selección de Subcategoría -->
  <div class="modal fade show" v-if="showSubcategoryModal" style="display: block; background: rgba(0,0,0,0.5);" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Seleccionar Subcategoría</h5>
          <button type="button" class="btn-close" @click="showSubcategoryModal = false"></button>
        </div>
        <div class="modal-body">
          <input type="text" class="form-control mb-3" v-model="subcategorySearch" placeholder="Buscar subcategoría..."/>
          <div class="list-group">
            <button
              type="button"
              class="list-group-item list-group-item-action"
              v-for="subcategory in filteredSubcategories"
              :key="subcategory.id"
              :class="{ active: filters.subcategory_id === subcategory.id }"
              @click="selectSubcategory(subcategory)"
            >
              {{ subcategory.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/utils/axios";

export default {
  name: 'StockAdjustmentModal',
  emits: ['close', 'saved'],
  data() {
    return {
      loading: false,
      saving: false,
      adjustment: {
        consecutive: '',
        issue_date: this.getCurrentDateTime(),
        issuer: '',
        warehouse_id: '',
        concept: `Ajuste de inventario del ${this.getCurrentDate()}`
      },
      filters: {
        product_id: null,
        category_id: null,
        subcategory_id: null,
        filter_by: 'name'
      },
      searchTerm: '',
      inventoryItems: [],
      warehouses: [],
      products: [],
      categories: [],
      subcategories: [],
      selectedWarehouse: null,
      showProductModal: false,
      showCategoryModal: false,
      showSubcategoryModal: false,
      productSearch: '',
      categorySearch: '',
      subcategorySearch: ''
    }
  },
  computed: {
    warehouseOptions() {
      if (!Array.isArray(this.warehouses)) return [];
      return this.warehouses.map(w => ({
        value: w.id,
        label: w.nombre
      }));
    },
    productOptions() {
      if (!Array.isArray(this.products)) return [];
      return this.products.map(p => ({
        value: p.id,
        label: `${p.code} - ${p.name}`
      }));
    },
    categoryOptions() {
      if (!Array.isArray(this.categories)) return [];
      return this.categories.map(c => ({
        value: c.id,
        label: c.name
      }));
    },
    subcategoryOptions() {
      if (!Array.isArray(this.subcategories)) return [];
      return this.subcategories.map(sc => ({
        value: sc.id,
        label: sc.name
      }));
    },
    selectedProductName() {
      if (!Array.isArray(this.products)) return '';
      const product = this.products.find(p => p.id === this.filters.product_id);
      return product ? `${product.code} - ${product.name}` : '';
    },
    selectedCategoryName() {
      if (!Array.isArray(this.categories)) return '';
      const category = this.categories.find(c => c.id === this.filters.category_id);
      return category ? category.name : '';
    },
    selectedSubcategoryName() {
      if (!Array.isArray(this.subcategories)) return '';
      const subcategory = this.subcategories.find(sc => sc.id === this.filters.subcategory_id);
      return subcategory ? subcategory.name : '';
    },
    filteredProducts() {
      if (!Array.isArray(this.products)) return [];
      if (!this.productSearch) return this.products;
      const term = this.productSearch.toLowerCase();
      return this.products.filter(p =>
        p.code.toLowerCase().includes(term) ||
        p.name.toLowerCase().includes(term)
      );
    },
    filteredCategories() {
      if (!Array.isArray(this.categories)) return [];
      if (!this.categorySearch) return this.categories;
      const term = this.categorySearch.toLowerCase();
      return this.categories.filter(c => c.name.toLowerCase().includes(term));
    },
    filteredSubcategories() {
      if (!Array.isArray(this.subcategories)) return [];
      if (!this.subcategorySearch) return this.subcategories;
      const term = this.subcategorySearch.toLowerCase();
      return this.subcategories.filter(sc => sc.name.toLowerCase().includes(term));
    },
    filteredItems() {
      if (!this.searchTerm) return this.inventoryItems;

      const term = this.searchTerm.toLowerCase();
      return this.inventoryItems.filter(item => {
        if (this.filters.filter_by === 'code') {
          return item.codigo.toLowerCase().includes(term);
        } else if (this.filters.filter_by === 'name') {
          return item.producto.toLowerCase().includes(term);
        }
        return true;
      });
    },
    canSave() {
      return this.adjustment.warehouse_id &&
             this.adjustment.issuer &&
             this.inventoryItems.length > 0;
    }
  },
  watch: {
    selectedWarehouse(newValue) {
      console.log('selectedWarehouse changed:', newValue);
      console.log('selectedWarehouse type:', typeof newValue);

      // Si newValue es un número o string directamente (el ID)
      if (newValue) {
        // Si es un objeto con value, usar value, sino usar directamente el valor
        this.adjustment.warehouse_id = (typeof newValue === 'object' && newValue.value) ? newValue.value : newValue;
        console.log('Warehouse ID set to:', this.adjustment.warehouse_id);
        this.loadInventory();
      }
    }
  },
  mounted() {
    this.loadCatalogs();
    this.loadNextConsecutive();
    this.loadUserInfo();
  },
  methods: {
    getCurrentDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
    getCurrentDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    async loadCatalogs() {
      try {
        const [warehousesRes, productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
          api.get('/warehouses'),
          api.get('/products?limit=1000'),
          api.get('/categories'),
          api.get('/subcategories')
        ]);

        console.log('Products response:', productsRes.data);

        if (warehousesRes.data.success) {
          this.warehouses = warehousesRes.data.data || [];
        }
        if (productsRes.data.success) {
          // El API devuelve { products: [...], pagination: {...} }
          const data = productsRes.data.data || {};
          this.products = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
          console.log('Products loaded:', this.products.length, this.products);
        }
        if (categoriesRes.data.success) {
          this.categories = categoriesRes.data.data || [];
        }
        if (subcategoriesRes.data.success) {
          this.subcategories = subcategoriesRes.data.data || [];
        }
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        this.products = [];
        this.categories = [];
        this.subcategories = [];
      }
    },
    async loadNextConsecutive() {
      try {
        const response = await api.get('/inventory-adjustments/next-consecutive');
        if (response.data.success) {
          this.adjustment.consecutive = response.data.data.consecutive;
        }
      } catch (error) {
        console.error('Error al obtener consecutivo:', error);
      }
    },
    loadUserInfo() {
      try {
        // Obtener información del usuario desde localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          // Establecer el emisor con el nombre completo del usuario
          this.adjustment.issuer = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email;
        }
      } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        // Si hay error, usar un valor por defecto
        this.adjustment.issuer = 'Usuario';
      }
    },
    selectProduct(product) {
      this.filters.product_id = product.id;
      this.showProductModal = false;
      this.productSearch = '';
      this.loadInventory();
    },
    selectCategory(category) {
      this.filters.category_id = category.id;
      this.showCategoryModal = false;
      this.categorySearch = '';
      this.loadInventory();
    },
    selectSubcategory(subcategory) {
      this.filters.subcategory_id = subcategory.id;
      this.showSubcategoryModal = false;
      this.subcategorySearch = '';
      this.loadInventory();
    },
    clearProduct() {
      this.filters.product_id = null;
      this.loadInventory();
    },
    clearCategory() {
      this.filters.category_id = null;
      this.loadInventory();
    },
    clearSubcategory() {
      this.filters.subcategory_id = null;
      this.loadInventory();
    },
    async loadInventory() {
      console.log('loadInventory called, warehouse_id:', this.adjustment.warehouse_id);
      if (!this.adjustment.warehouse_id) {
        console.log('No warehouse_id, returning');
        return;
      }

      this.loading = true;
      try {
        const params = new URLSearchParams({
          warehouse_id: this.adjustment.warehouse_id,
          existence_filter: 'all'
        });

        // Obtener store_id del usuario
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.store_id) {
            params.append('store_id', user.store_id);
          }
        }

        console.log('Loading inventory with params:', params.toString());

        if (this.filters.product_id) {
          params.append('product_id', this.filters.product_id);
        }
        if (this.filters.category_id) {
          params.append('category_id', this.filters.category_id);
        }
        if (this.filters.subcategory_id) {
          params.append('subcategory_id', this.filters.subcategory_id);
        }

        const response = await api.get(`/inventory-adjustments/inventory?${params.toString()}`);

        console.log('Inventory response:', response.data);

        if (response.data.success) {
          this.inventoryItems = response.data.data.map(item => {
            const existTeorica = parseFloat(item.exist_teorica || 0);
            return {
              id: item.id,
              codigo: item.codigo,
              producto: item.producto,
              bodega: item.bodega,
              exist_teorica: existTeorica,
              exist_fisica: existTeorica, // Inicialmente igual a exist_teorica
              diferencia: 0, // Inicialmente no hay diferencia
              costo_unit: parseFloat(item.costo_unit || 0)
            };
          });
          console.log('Inventory items loaded:', this.inventoryItems.length);
        }
      } catch (error) {
        console.error('Error al cargar inventario:', error);
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el inventario'
        });
      } finally {
        this.loading = false;
      }
    },
    updateFromFisica(item) {
      // Cuando se edita Exist. Física, recalcular Diferencia
      // Diferencia = Exist. Física - Exist. Teórica
      item.diferencia = item.exist_fisica - item.exist_teorica;
    },
    updateFromDiferencia(item) {
      // Cuando se edita Diferencia, recalcular Exist. Física
      // Exist. Física = Exist. Teórica + Diferencia
      item.exist_fisica = item.exist_teorica + item.diferencia;
    },
    setAllToZero() {
      this.$swal.fire({
        title: '¿Está seguro?',
        text: 'Esto llevará a cero todas las existencias físicas mostradas',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.filteredItems.forEach(item => {
            item.exist_fisica = 0;
            item.diferencia = -item.exist_teorica; // 0 - exist_teorica
          });
        }
      });
    },
    async saveAdjustment() {
      if (!this.canSave) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'Complete todos los campos requeridos'
        });
        return;
      }

      // Filtrar solo productos con diferencia != 0 (que fueron modificados)
      const modifiedItems = this.inventoryItems.filter(item => item.diferencia !== 0);

      if (modifiedItems.length === 0) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'No hay productos con cambios para ajustar'
        });
        return;
      }

      this.saving = true;
      try {
        const data = {
          ...this.adjustment,
          items: modifiedItems.map(item => ({
            product_id: item.id,
            exist_teorica: item.exist_teorica,
            exist_fisica: item.exist_fisica,
            diferencia: item.diferencia
          }))
        };

        const response = await api.post('/inventory-adjustments', data);

        if (response.data.success) {
          // Aplicar automáticamente
          await api.post(`/inventory-adjustments/${response.data.data.id}/apply`);
          this.$emit('saved');
        }
      } catch (error) {
        console.error('Error al guardar ajuste:', error);
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo guardar el ajuste'
        });
      } finally {
        this.saving = false;
      }
    },
    exportToExcel() {
      this.$swal.fire({
        icon: 'info',
        title: 'Próximamente',
        text: 'La exportación a Excel estará disponible pronto'
      });
    }
  }
}
</script>

<style scoped>
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8f9fa;
}

.input-group-text.bg-primary {
  background-color: #0d6efd !important;
  border-color: #0d6efd !important;
}
</style>
