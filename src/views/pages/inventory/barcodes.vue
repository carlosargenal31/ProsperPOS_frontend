<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">

      <div>
        <!-- Page Header -->
        <div class="page-header mb-4">
          <div class="add-item d-flex">
            <div class="page-title">
              <h4 class="fw-bold mb-2">Generador de Códigos de Barra</h4>
              <h6 class="text-muted mb-0">Genera e imprime códigos de barra para tus productos</h6>
            </div>
          </div>
          <ul class="table-top-head">
            <li class="me-2">
              <a
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Actualizar"
                class="btn btn-icon btn-light rounded-circle"
                @click="loadData"
              >
                <i class="ti ti-refresh"></i>
              </a>
            </li>
            <li>
              <a
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Colapsar"
                id="collapse-header"
                @click="toggleHeader"
                class="btn btn-icon btn-light rounded-circle"
              >
                <i class="ti ti-chevron-up"></i>
              </a>
            </li>
          </ul>
        </div>

        <!-- Filters Card -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body pb-1">
            <form @submit.prevent="generateBarcodes">
              <!-- Primera fila: Tipo de generación -->
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-medium">Generar Códigos Por</label>
                    <select class="form-select" v-model="generationType" @change="onGenerationTypeChange">
                      <option value="">Seleccione una opción</option>
                      <option value="product">Producto Individual</option>
                      <option value="category">Por Categoría</option>
                      <option value="subcategory">Por Subcategoría</option>
                      <option value="all">Todos los Productos</option>
                    </select>
                  </div>
                </div>

                <!-- Tamaño de etiqueta -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-medium">Tamaño de Etiqueta</label>
                    <select class="form-select" v-model="labelSize">
                      <option value="small">Pequeña (2.5cm x 3.3cm)</option>
                      <option value="medium">Mediana (5cm x 3.3cm)</option>
                      <option value="large">Grande (7.5cm x 5cm)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Segunda fila: Categoría/Subcategoría/Producto (dinámico) -->
              <div class="row" v-if="generationType === 'category'">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label fw-medium">Categoría</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        :value="selectedCategoryName"
                        readonly
                        placeholder="Buscar categoría"
                      />
                      <button class="btn btn-outline-secondary" type="button" @click="showCategorySearch = true">
                        <i class="ti ti-search"></i>
                      </button>
                      <button class="btn btn-outline-danger" type="button" @click="clearCategory">
                        <i class="ti ti-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row" v-if="generationType === 'subcategory'">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-medium">Categoría</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        :value="selectedCategoryName"
                        readonly
                        placeholder="Buscar categoría"
                      />
                      <button class="btn btn-outline-secondary" type="button" @click="showCategorySearch = true">
                        <i class="ti ti-search"></i>
                      </button>
                      <button class="btn btn-outline-danger" type="button" @click="clearCategory">
                        <i class="ti ti-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-medium">Subcategoría</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        :value="selectedSubcategoryName"
                        readonly
                        placeholder="Buscar subcategoría"
                      />
                      <button class="btn btn-outline-secondary" type="button" @click="showSubcategorySearch = true">
                        <i class="ti ti-search"></i>
                      </button>
                      <button class="btn btn-outline-danger" type="button" @click="clearSubcategory">
                        <i class="ti ti-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row" v-if="generationType === 'product'">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label fw-medium">Producto</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        :value="selectedProductName"
                        readonly
                        placeholder="Buscar producto"
                      />
                      <button class="btn btn-outline-secondary" type="button" @click="showProductSearch = true">
                        <i class="ti ti-search"></i>
                      </button>
                      <button class="btn btn-outline-danger" type="button" @click="clearProduct">
                        <i class="ti ti-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tercera fila: Opciones de visualización -->
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label fw-medium">Información Adicional en Etiqueta</label>
                    <div class="d-flex flex-wrap gap-3">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="showName" v-model="showName">
                        <label class="form-check-label" for="showName">
                          Mostrar Nombre
                        </label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="showPrice" v-model="showPrice">
                        <label class="form-check-label" for="showPrice">
                          Mostrar Precio
                        </label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="showSKU" v-model="showSKU">
                        <label class="form-check-label" for="showSKU">
                          Mostrar SKU
                        </label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="showCategory" v-model="showCategory">
                        <label class="form-check-label" for="showCategory">
                          Mostrar Categoría
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cuarta fila: Botón -->
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <button
                      class="btn btn-warning w-100 fw-medium shadow-sm"
                      type="submit"
                      :disabled="loading || !canGenerate"
                      style="background: linear-gradient(135deg, #ff9800 0%, #ff6b00 100%); border: none; color: white;"
                    >
                      <span v-if="loading">
                        <i class="ti ti-loader spin"></i> Cargando...
                      </span>
                      <span v-else>Generar Códigos de Barra</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Results Grid -->
        <div class="card border-0 shadow-sm" v-if="barcodeProducts.length > 0 || loading">
          <div
            class="card-header bg-white d-flex align-items-center justify-content-between flex-wrap row-gap-3 py-3"
          >
            <div>
              <h4 class="mb-0 fw-bold">Códigos de Barra Generados ({{ barcodeProducts.length }})</h4>
            </div>
            <div class="d-flex gap-2">
              <button
                class="btn btn-success"
                @click="downloadAllBarcodes"
                :disabled="barcodeProducts.length === 0"
              >
                <i class="ti ti-download me-1"></i>
                Descargar Todos
              </button>
              <button
                class="btn btn-primary"
                @click="printAllBarcodes"
                :disabled="barcodeProducts.length === 0"
              >
                <i class="ti ti-printer me-1"></i>
                Imprimir Todos
              </button>
            </div>
          </div>
          <div class="card-body p-4">
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-3 text-muted">Generando códigos de barra...</p>
            </div>

            <!-- Barcode Grid -->
            <div v-else class="row g-3">
              <div
                v-for="product in barcodeProducts"
                :key="product.id"
                :class="getGridClass"
              >
                <div class="barcode-card border rounded p-3 text-center">
                  <div class="barcode-container mb-2" :class="labelSizeClass">
                    <svg :data-product-id="product.id" class="barcode-svg"></svg>
                    <div class="barcode-info mt-1" style="font-size: 10px;">
                      <div v-if="showName" class="fw-medium text-truncate">{{ product.name }}</div>
                      <div v-if="showPrice" class="text-success">L {{ formatPrice(product.price) }}</div>
                      <div v-if="showSKU" class="text-muted">{{ product.sku }}</div>
                      <div v-if="showCategory" class="text-muted small">{{ product.category_name }}</div>
                    </div>
                  </div>
                  <div class="d-flex justify-content-center gap-1 mt-2">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="downloadSingleBarcode(product)"
                      title="Descargar"
                    >
                      <i class="ti ti-download"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-info"
                      @click="printSingleBarcode(product)"
                      title="Imprimir"
                    >
                      <i class="ti ti-printer"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="ti ti-barcode" style="font-size: 64px; color: #ccc;"></i>
            <h5 class="mt-4 mb-2">No hay códigos de barra generados</h5>
            <p class="text-muted">Selecciona los filtros y genera códigos de barra para tus productos</p>
          </div>
        </div>
      </div>
    </div>
    <div
      class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3"
    >
      <p class="mb-0 text-gray-9">
        {{ new Date().getFullYear() }} &copy; ProsperPOS. Todos los derechos reservados
      </p>
      <p>
        Diseñado &amp Desarrollado Por
        <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a>
      </p>
    </div>
  </div>

  <!-- Modal de búsqueda de categorías -->
  <div class="modal fade" :class="{ show: showCategorySearch }" :style="{ display: showCategorySearch ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Búsqueda de Categoría</h5>
          <button type="button" class="btn-close btn-close-white" @click="showCategorySearch = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <input
              type="text"
              class="form-control"
              v-model="categorySearch"
              placeholder="Buscar por nombre..."
              @input="filterCategories"
            />
          </div>
          <div class="table-responsive" style="max-height: 400px;">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="category in filteredCategories" :key="category.id">
                  <td>{{ category.label || category.value }}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" @click="selectCategory(category)">
                      Seleccionar
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredCategories.length === 0">
                  <td colspan="2" class="text-center">No se encontraron categorías</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showCategorySearch" @click="showCategorySearch = false"></div>

  <!-- Modal de búsqueda de subcategorías -->
  <div class="modal fade" :class="{ show: showSubcategorySearch }" :style="{ display: showSubcategorySearch ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Búsqueda de Subcategoría</h5>
          <button type="button" class="btn-close btn-close-white" @click="showSubcategorySearch = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <input
              type="text"
              class="form-control"
              v-model="subcategorySearch"
              placeholder="Buscar por nombre..."
              @input="filterSubcategories"
            />
          </div>
          <div class="table-responsive" style="max-height: 400px;">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="subcategory in filteredSubcategories" :key="subcategory.id">
                  <td>{{ subcategory.label || subcategory.value }}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" @click="selectSubcategory(subcategory)">
                      Seleccionar
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredSubcategories.length === 0">
                  <td colspan="2" class="text-center">No se encontraron subcategorías</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showSubcategorySearch" @click="showSubcategorySearch = false"></div>

  <!-- Modal de búsqueda de productos -->
  <div class="modal fade" :class="{ show: showProductSearch }" :style="{ display: showProductSearch ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Búsqueda de Producto</h5>
          <button type="button" class="btn-close btn-close-white" @click="showProductSearch = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <input
              type="text"
              class="form-control"
              v-model="productSearch"
              placeholder="Buscar por nombre o código..."
              @input="filterProducts"
            />
          </div>
          <div class="table-responsive" style="max-height: 400px;">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in filteredProducts" :key="product.id">
                  <td>{{ product.sku || product.code }}</td>
                  <td>{{ product.label || product.value }}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" @click="selectProduct(product)">
                      Seleccionar
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredProducts.length === 0">
                  <td colspan="3" class="text-center">No se encontraron productos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showProductSearch" @click="showProductSearch = false"></div>
</template>

<script>
import { ref, computed, nextTick } from "vue";
import JsBarcode from "jsbarcode";
import { barcodeService, stockHistoryService } from "@/api/config";
import { message } from "ant-design-vue";
import html2canvas from 'html2canvas';

export default {
  data() {
    return {
      loading: false,
      generationType: "",
      labelSize: "medium",
      selectedCategory: null,
      selectedSubcategory: null,
      selectedProduct: null,
      categories: [],
      subcategories: [],
      products: [],
      filteredCategories: [],
      filteredSubcategories: [],
      filteredProducts: [],
      barcodeProducts: [],
      showCategorySearch: false,
      showSubcategorySearch: false,
      showProductSearch: false,
      categorySearch: "",
      subcategorySearch: "",
      productSearch: "",
      showName: true,
      showPrice: true,
      showSKU: false,
      showCategory: false,
      barcodeRefs: {},
    };
  },
  computed: {
    selectedCategoryName() {
      if (!this.selectedCategory) return "";
      return this.selectedCategory.label || this.selectedCategory.value || "";
    },
    selectedSubcategoryName() {
      if (!this.selectedSubcategory) return "";
      return this.selectedSubcategory.label || this.selectedSubcategory.value || "";
    },
    selectedProductName() {
      if (!this.selectedProduct) return "";
      return this.selectedProduct.label || this.selectedProduct.value || "";
    },
    canGenerate() {
      if (this.generationType === 'all') return true;
      if (this.generationType === 'product') return !!this.selectedProduct;
      if (this.generationType === 'category') return !!this.selectedCategory;
      if (this.generationType === 'subcategory') return !!this.selectedSubcategory;
      return false;
    },
    labelSizeClass() {
      return `barcode-${this.labelSize}`;
    },
    getGridClass() {
      if (this.labelSize === 'small') return 'col-md-2 col-sm-3 col-6';
      if (this.labelSize === 'medium') return 'col-md-3 col-sm-4 col-6';
      return 'col-md-4 col-sm-6 col-12';
    }
  },
  mounted() {
    this.loadCategories();
    this.loadSubcategories();
    this.loadProducts();
  },
  methods: {
    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },

    onGenerationTypeChange() {
      this.clearCategory();
      this.clearSubcategory();
      this.clearProduct();
      this.barcodeProducts = [];
    },

    async loadCategories() {
      try {
        const response = await barcodeService.getCategories();
        this.categories = response.data.data || [];
        this.filteredCategories = this.categories;
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        message.error("Error al cargar categorías");
      }
    },

    async loadSubcategories() {
      try {
        const response = await barcodeService.getSubcategories();
        this.subcategories = response.data.data || [];
        this.filteredSubcategories = this.subcategories;
      } catch (error) {
        console.error("Error al cargar subcategorías:", error);
        message.error("Error al cargar subcategorías");
      }
    },

    async loadProducts(categoryId = null, subcategoryId = null) {
      try {
        const response = await barcodeService.getProducts(categoryId, subcategoryId);
        this.products = response.data.data || [];
        this.filteredProducts = this.products;
      } catch (error) {
        console.error("Error al cargar productos:", error);
        message.error("Error al cargar productos");
      }
    },

    filterCategories() {
      if (!this.categorySearch) {
        this.filteredCategories = this.categories;
        return;
      }
      const search = this.categorySearch.toLowerCase();
      this.filteredCategories = this.categories.filter(cat =>
        (cat.label && cat.label.toLowerCase().includes(search)) ||
        (cat.value && cat.value.toLowerCase().includes(search))
      );
    },

    selectCategory(category) {
      this.selectedCategory = category;
      this.showCategorySearch = false;
      this.selectedSubcategory = null;
      this.selectedProduct = null;

      if (category && category.id) {
        this.filteredSubcategories = this.subcategories.filter(sub =>
          sub.category_id === category.id || sub.categoria_id === category.id
        );
        this.loadProducts(category.id);
      } else {
        this.filteredSubcategories = this.subcategories;
        this.loadProducts();
      }
    },

    clearCategory() {
      this.selectedCategory = null;
      this.selectedSubcategory = null;
      this.selectedProduct = null;
      this.filteredSubcategories = this.subcategories;
      this.loadProducts();
    },

    filterSubcategories() {
      let baseSubcategories = this.subcategories;

      if (this.selectedCategory && this.selectedCategory.id) {
        baseSubcategories = this.subcategories.filter(sub =>
          sub.category_id === this.selectedCategory.id ||
          sub.categoria_id === this.selectedCategory.id
        );
      }

      if (!this.subcategorySearch) {
        this.filteredSubcategories = baseSubcategories;
        return;
      }

      const search = this.subcategorySearch.toLowerCase();
      this.filteredSubcategories = baseSubcategories.filter(sub =>
        (sub.label && sub.label.toLowerCase().includes(search)) ||
        (sub.value && sub.value.toLowerCase().includes(search))
      );
    },

    selectSubcategory(subcategory) {
      this.selectedSubcategory = subcategory;
      this.showSubcategorySearch = false;
      this.selectedProduct = null;

      if (subcategory && subcategory.id) {
        this.loadProducts(this.selectedCategory?.id, subcategory.id);
      }
    },

    clearSubcategory() {
      this.selectedSubcategory = null;
      this.selectedProduct = null;

      if (this.selectedCategory && this.selectedCategory.id) {
        this.loadProducts(this.selectedCategory.id);
      } else {
        this.loadProducts();
      }
    },

    filterProducts() {
      if (!this.productSearch) {
        this.filteredProducts = this.products;
        return;
      }
      const search = this.productSearch.toLowerCase();
      this.filteredProducts = this.products.filter(prod =>
        (prod.label && prod.label.toLowerCase().includes(search)) ||
        (prod.value && prod.value.toLowerCase().includes(search)) ||
        (prod.sku && prod.sku.toLowerCase().includes(search)) ||
        (prod.code && prod.code.toLowerCase().includes(search))
      );
    },

    selectProduct(product) {
      this.selectedProduct = product;
      this.showProductSearch = false;
    },

    clearProduct() {
      this.selectedProduct = null;
    },

    async generateBarcodes() {
      try {
        this.loading = true;
        this.barcodeProducts = [];

        const params = {};

        if (this.generationType === 'product' && this.selectedProduct) {
          params.product_id = this.selectedProduct.id;
        } else if (this.generationType === 'category' && this.selectedCategory) {
          params.category_id = this.selectedCategory.id;
        } else if (this.generationType === 'subcategory' && this.selectedSubcategory) {
          params.subcategory_id = this.selectedSubcategory.id;
        }

        const response = await barcodeService.getProducts(params.category_id, params.subcategory_id);
        let productsData = response.data.data || [];

        if (this.generationType === 'product' && params.product_id) {
          productsData = productsData.filter(p => p.id === params.product_id);
        }

        this.barcodeProducts = productsData.map(p => ({
          id: p.id,
          name: p.label || p.value || p.name,
          sku: p.sku || p.code || '',
          price: p.price || p.selling_price || 0,
          category_name: p.category_name || ''
        }));

        if (this.barcodeProducts.length === 0) {
          message.info("No se encontraron productos para generar códigos de barra");
        } else {
          message.success(`Se generaron ${this.barcodeProducts.length} códigos de barra`);
          // Esperar a que Vue renderice el DOM completamente
          await nextTick();
          await this.$nextTick();
          // Pequeño delay adicional para asegurar que el DOM esté listo
          setTimeout(() => {
            this.renderAllBarcodes();
          }, 100);
        }
      } catch (error) {
        console.error("Error al generar códigos de barra:", error);
        message.error("Error al generar códigos de barra");
      } finally {
        this.loading = false;
      }
    },

    setBarcodeRef(el, id) {
      if (el) {
        this.barcodeRefs[id] = el;
      }
    },

    renderAllBarcodes() {
      console.log('=== INICIANDO RENDERIZADO DE CÓDIGOS DE BARRA ===');
      console.log('Total productos:', this.barcodeProducts.length);

      // Verificar cuántos SVGs existen en el DOM
      const allSvgs = document.querySelectorAll('svg.barcode-svg');
      console.log('SVGs encontrados en el DOM:', allSvgs.length);

      this.barcodeProducts.forEach(product => {
        const svg = document.querySelector(`svg[data-product-id="${product.id}"]`);
        console.log(`Producto ID ${product.id}:`, {
          nombre: product.name,
          sku: product.sku,
          svgEncontrado: !!svg
        });

        if (svg && product.sku) {
          try {
            JsBarcode(svg, product.sku, {
              format: "CODE128",
              width: this.labelSize === 'small' ? 1 : this.labelSize === 'medium' ? 2 : 3,
              height: this.labelSize === 'small' ? 40 : this.labelSize === 'medium' ? 50 : 70,
              displayValue: true,
              fontSize: this.labelSize === 'small' ? 10 : this.labelSize === 'medium' ? 12 : 14,
              margin: 5
            });
            console.log(`✓ Código de barra generado exitosamente para ${product.sku}`);

            // Guardar referencia para descargas e impresiones
            this.barcodeRefs[product.id] = svg;
          } catch (error) {
            console.error(`✗ Error al generar código de barra para ${product.sku}:`, error);
          }
        } else {
          console.warn(`✗ No se pudo generar código de barra - SVG: ${!!svg}, SKU: ${product.sku}`);
        }
      });

      console.log('=== FIN RENDERIZADO ===');
    },

    async downloadSingleBarcode(product) {
      try {
        const svg = document.querySelector(`svg[data-product-id="${product.id}"]`);
        const barcodeCard = svg?.closest('.barcode-card');
        if (!barcodeCard) return;

        const canvas = await html2canvas(barcodeCard, {
          scale: 2,
          backgroundColor: '#ffffff'
        });

        const link = document.createElement('a');
        link.download = `barcode-${product.sku}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        message.success('Código de barra descargado');
      } catch (error) {
        console.error('Error al descargar código de barra:', error);
        message.error('Error al descargar código de barra');
      }
    },

    async printSingleBarcode(product) {
      try {
        const svg = document.querySelector(`svg[data-product-id="${product.id}"]`);
        const barcodeCard = svg?.closest('.barcode-card');
        if (!barcodeCard) return;

        const canvas = await html2canvas(barcodeCard, {
          scale: 2,
          backgroundColor: '#ffffff'
        });

        const printWindow = window.open('', '', 'width=600,height=400');
        printWindow.document.write('<html><head><title>Imprimir Código de Barra</title></head><body>');
        printWindow.document.write('<img src="' + canvas.toDataURL('image/png') + '" style="width: 100%;">');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      } catch (error) {
        console.error('Error al imprimir código de barra:', error);
        message.error('Error al imprimir código de barra');
      }
    },

    async downloadAllBarcodes() {
      try {
        message.loading('Generando archivo PDF...');

        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();

        let x = 10;
        let y = 10;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const itemWidth = this.labelSize === 'small' ? 50 : this.labelSize === 'medium' ? 70 : 90;
        const itemHeight = this.labelSize === 'small' ? 30 : this.labelSize === 'medium' ? 40 : 60;

        for (const product of this.barcodeProducts) {
          const svg = document.querySelector(`svg[data-product-id="${product.id}"]`);
          const barcodeCard = svg?.closest('.barcode-card');
          if (!barcodeCard) continue;

          const canvas = await html2canvas(barcodeCard, {
            scale: 2,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');

          if (y + itemHeight > pageHeight - 10) {
            pdf.addPage();
            y = 10;
            x = 10;
          }

          pdf.addImage(imgData, 'PNG', x, y, itemWidth, itemHeight);

          x += itemWidth + 10;
          if (x + itemWidth > pageWidth - 10) {
            x = 10;
            y += itemHeight + 10;
          }
        }

        pdf.save(`codigos-barra-${new Date().toISOString().split('T')[0]}.pdf`);
        message.success('Códigos de barra descargados');
      } catch (error) {
        console.error('Error al descargar todos los códigos:', error);
        message.error('Error al descargar los códigos de barra');
      }
    },

    async printAllBarcodes() {
      try {
        const printContent = document.createElement('div');
        printContent.style.display = 'flex';
        printContent.style.flexWrap = 'wrap';
        printContent.style.gap = '10px';
        printContent.style.padding = '20px';

        for (const product of this.barcodeProducts) {
          const svg = document.querySelector(`svg[data-product-id="${product.id}"]`);
          const barcodeCard = svg?.closest('.barcode-card');
          if (!barcodeCard) continue;

          const canvas = await html2canvas(barcodeCard, {
            scale: 2,
            backgroundColor: '#ffffff'
          });

          const img = document.createElement('img');
          img.src = canvas.toDataURL('image/png');
          img.style.width = this.labelSize === 'small' ? '150px' : this.labelSize === 'medium' ? '200px' : '250px';
          printContent.appendChild(img);
        }

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Imprimir Códigos de Barra</title>');
        printWindow.document.write('<style>body { margin: 0; padding: 20px; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      } catch (error) {
        console.error('Error al imprimir códigos:', error);
        message.error('Error al imprimir los códigos de barra');
      }
    },

    async loadData() {
      if (this.barcodeProducts.length > 0) {
        await this.generateBarcodes();
      }
    },

    formatPrice(price) {
      if (!price) return "0.00";
      return parseFloat(price).toFixed(2);
    }
  },
};
</script>

<style scoped>
.barcode-card {
  background: white;
  transition: all 0.3s ease;
}

.barcode-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.barcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.barcode-small svg {
  max-width: 100px;
}

.barcode-medium svg {
  max-width: 150px;
}

.barcode-large svg {
  max-width: 200px;
}

.barcode-info {
  line-height: 1.3;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.form-check-input:checked {
  background-color: #ff9800;
  border-color: #ff9800;
}

.btn-outline-primary:hover,
.btn-outline-info:hover {
  transform: scale(1.05);
}
</style>
