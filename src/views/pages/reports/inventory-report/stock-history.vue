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
              <h4 class="fw-bold mb-2">Historial de Existencias</h4>
              <h6 class="text-muted mb-0">Ver Reportes del Historial de Existencias</h6>
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
            <form @submit.prevent="generateReport">
              <!-- Primera fila: Fecha, Categoría, Subcategoría -->
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-medium">Seleccionar Fecha</label>
                    <div class="input-icon-start position-relative">
                      <input
                        type="text"
                        class="form-control date-range bookingrange"
                        placeholder="dd/mm/yyyy - dd/mm/yyyy"
                        ref="dateRangeInput"
                        v-model="dateRangeDisplay"
                      />
                      <span class="input-icon-left">
                        <i class="ti ti-calendar"></i>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
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
                <div class="col-md-4">
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

              <!-- Segunda fila: Producto y Botón -->
              <div class="row align-items-end">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-medium">Productos</label>
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
                <div class="col-md-6">
                  <div class="mb-3">
                    <button
                      class="btn btn-warning w-100 fw-medium shadow-sm"
                      type="submit"
                      :disabled="loading"
                      style="background: linear-gradient(135deg, #ff9800 0%, #ff6b00 100%); border: none; color: white;"
                    >
                      <span v-if="loading">
                        <i class="ti ti-loader spin"></i> Cargando...
                      </span>
                      <span v-else>Generar Reporte</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <!-- Results Table -->
        <div class="card border-0 shadow-sm" v-if="stockData.length > 0 || loading">
          <div
            class="card-header bg-white d-flex align-items-center justify-content-between flex-wrap row-gap-3 py-3"
          >
            <div>
              <h4 class="mb-0 fw-bold">Reporte de Historial</h4>
            </div>
            <button
              class="btn btn-success"
              @click="showSaveReportModal = true"
              :disabled="stockData.length === 0"
            >
              <i class="ti ti-download me-1"></i>
              Guardar Reporte
            </button>
          </div>
          <div class="card-body p-0">
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-3 text-muted">Cargando datos...</p>
            </div>

            <!-- Table Data -->
            <div v-else class="table-responsive">
              <table class="table datatable mb-0">
                <thead style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                  <tr>
                    <th class="fw-semibold py-3 px-4">Código</th>
                    <th class="fw-semibold py-3">Nombre del Producto</th>
                    <th class="fw-semibold py-3 text-center">Cant. Inicial</th>
                    <th class="fw-semibold py-3 text-center">Cargos</th>
                    <th class="fw-semibold py-3 text-center">Descargos</th>
                    <th class="fw-semibold py-3 text-center">Ventas</th>
                    <th class="fw-semibold py-3 text-center">Stock Final</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- No hay datos -->
                  <tr v-if="stockData.length === 0">
                    <td colspan="7" class="text-center py-5">
                      <i class="ti ti-package-off" style="font-size: 48px; color: #ccc;"></i>
                      <p class="mt-3 text-muted">No se encontraron datos para los filtros seleccionados</p>
                    </td>
                  </tr>

                  <!-- Filas de datos -->
                  <tr
                    v-for="item in stockData"
                    :key="item.id"
                    style="border-bottom: 1px solid #f0f0f0;"
                  >
                    <td class="px-4 py-3">
                      <span class="badge bg-light text-dark fw-medium">{{ item.sku }}</span>
                    </td>
                    <td class="py-3">
                      <div class="d-flex align-items-center">
                        <a
                          v-if="item.image"
                          class="avatar avatar-md"
                          style="width: 40px; height: 40px;"
                        >
                          <img
                            :src="getImageUrl(item.image)"
                            class="img-fluid rounded"
                            :alt="item.product_name"
                            style="object-fit: cover;"
                            @error="onImageError"
                          />
                        </a>
                        <div
                          class="avatar avatar-md bg-light text-muted"
                          v-else
                          style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;"
                        >
                          <i class="ti ti-package"></i>
                        </div>
                        <div class="ms-3">
                          <p class="text-dark mb-0 fw-medium">
                            {{ item.product_name }}
                          </p>
                          <small v-if="item.category_name" class="text-muted">
                            {{ item.category_name }}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td class="text-center py-3">
                      <span class="text-muted">{{ formatNumber(item.initial_quantity) }}</span>
                    </td>
                    <td class="text-center py-3">
                      <span class="text-success fw-medium">{{ formatNumber(item.added_quantity) }}</span>
                    </td>
                    <td class="text-center py-3">
                      <span class="text-danger fw-medium">{{ formatNumber(item.defective_quantity) }}</span>
                    </td>
                    <td class="text-center py-3">
                      <span class="text-primary fw-medium">{{ formatNumber(item.sold_quantity) }}</span>
                    </td>
                    <td class="text-center py-3">
                      <span class="fw-bold">{{ formatNumber(item.final_quantity) }}</span>
                    </td>
                  </tr>

                  <!-- Fila de totales -->
                  <tr
                    v-if="totals"
                    style="background-color: #f8f9fa; font-weight: bold; border-top: 2px solid #dee2e6;"
                  >
                    <td colspan="2" class="px-4 py-3">
                      <span class="fw-bold">TOTALES</span>
                    </td>
                    <td class="text-center py-3">
                      <span class="text-muted fw-bold">{{ formatNumber(totals.initial_quantity) }}</span>
                    </td>
                    <td class="text-center py-3">
                      <span class="text-success fw-bold">{{ formatNumber(totals.added_quantity) }}</span>
                    </td>
                    <td class="text-center py-3">
                      <span class="text-danger fw-bold">{{ formatNumber(totals.defective_quantity) }}</span>
                    </td>
                    <td class="text-center py-3">
                      <span class="text-primary fw-bold">{{ formatNumber(totals.sold_quantity) }}</span>
                    </td>
                    <td class="text-center py-3">
                      <span class="fw-bold">{{ formatNumber(totals.final_quantity) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="ti ti-clipboard-list" style="font-size: 64px; color: #ccc;"></i>
            <h5 class="mt-4 mb-2">No hay datos para mostrar</h5>
            <p class="text-muted">Selecciona los filtros y genera un reporte para ver los datos</p>
          </div>
        </div>
        <!-- /product list -->
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

  <!-- Modal Guardar Reporte -->
  <div v-if="showSaveReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Guardar Reporte - Historial de Existencias</h5>
          <button type="button" class="btn-close" @click="showSaveReportModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-3">Selecciona el formato en el que deseas guardar el reporte:</p>
          <div class="d-grid gap-2">
            <button class="btn btn-outline-success" @click="saveAsExcel">
              <i class="ti ti-file-spreadsheet me-2"></i> Guardar como Excel
            </button>
            <button class="btn btn-outline-danger" @click="saveAsPDF">
              <i class="ti ti-file-type-pdf me-2"></i> Guardar como PDF
            </button>
            <button class="btn btn-outline-primary" @click="saveAsImage">
              <i class="ti ti-photo me-2"></i> Guardar como Imagen
            </button>
            <button class="btn btn-outline-secondary" @click="printReport">
              <i class="ti ti-printer me-2"></i> Imprimir
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showSaveReportModal = false">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import "daterangepicker/daterangepicker.css";
import "daterangepicker/daterangepicker.js";
import { ref, onMounted } from "vue";
import moment from "moment";
import DateRangePicker from "daterangepicker";
import { stockHistoryService } from "@/api/config";
import { message } from "ant-design-vue";
import $ from "jquery";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { LOGO_BASE64 } from '@/assets/img/logo.js';

export default {
  data() {
    return {
      loading: false,
      loadingProducts: false,
      selectedCategory: null,
      selectedSubcategory: null,
      selectedProduct: null,
      categories: [],
      subcategories: [],
      products: [],
      filteredCategories: [],
      filteredSubcategories: [],
      filteredProducts: [],
      stockData: [],
      totals: null,
      dateFrom: moment().startOf("month").format("YYYY-MM-DD"),
      dateTo: moment().endOf("month").format("YYYY-MM-DD"),
      dateRangeDisplay: "",
      showCategorySearch: false,
      showSubcategorySearch: false,
      showProductSearch: false,
      showSaveReportModal: false,
      categorySearch: "",
      subcategorySearch: "",
      productSearch: "",
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
  },
  setup() {
    const dateRangeInput = ref(null);

    function booking_range(start, end) {
      return start.format("DD/MM/YYYY") + " - " + end.format("DD/MM/YYYY");
    }

    onMounted(() => {
      if (dateRangeInput.value) {
        const start = moment().startOf("month");
        const end = moment().endOf("month");

        new DateRangePicker(
          dateRangeInput.value,
          {
            startDate: start,
            endDate: end,
            ranges: {
              Hoy: [moment(), moment()],
              Ayer: [moment().subtract(1, "days"), moment().subtract(1, "days")],
              "Últimos 7 Días": [moment().subtract(6, "days"), moment()],
              "Últimos 30 Días": [moment().subtract(29, "days"), moment()],
              "Este Mes": [moment().startOf("month"), moment().endOf("month")],
              "Mes Pasado": [
                moment().subtract(1, "month").startOf("month"),
                moment().subtract(1, "month").endOf("month"),
              ],
            },
            locale: {
              format: "DD/MM/YYYY",
              separator: " - ",
              applyLabel: "Aplicar",
              cancelLabel: "Cancelar",
              fromLabel: "Desde",
              toLabel: "Hasta",
              customRangeLabel: "Personalizado",
              daysOfWeek: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
              monthNames: [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
              ],
            },
          },
          booking_range
        );

        booking_range(start, end);
      }
    });

    return {
      dateRangeInput,
    };
  },
  mounted() {
    this.loadCategories();
    this.loadSubcategories();
    this.loadProducts();
    this.setupDateRangeListener();

    // Inicializar el display de fecha con el mes actual
    const startDate = moment().startOf("month");
    const endDate = moment().endOf("month");
    this.dateRangeDisplay = startDate.format("DD/MM/YYYY") + " - " + endDate.format("DD/MM/YYYY");
  },
  methods: {
    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },

    setupDateRangeListener() {
      if (this.$refs.dateRangeInput) {
        $(this.$refs.dateRangeInput).on("apply.daterangepicker", (_ev, picker) => {
          this.dateFrom = picker.startDate.format("YYYY-MM-DD");
          this.dateTo = picker.endDate.format("YYYY-MM-DD");
          this.dateRangeDisplay = picker.startDate.format("DD/MM/YYYY") + " - " + picker.endDate.format("DD/MM/YYYY");
        });
      }
    },

    async loadCategories() {
      try {
        const response = await stockHistoryService.getCategories();
        this.categories = response.data.data || [];
        this.filteredCategories = this.categories;
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        message.error("Error al cargar categorías");
      }
    },

    async loadProducts(categoryId = null, subcategoryId = null) {
      try {
        this.loadingProducts = true;
        console.log('=== DEBUG loadProducts ===');
        console.log('categoryId:', categoryId);
        console.log('subcategoryId:', subcategoryId);

        const response = await stockHistoryService.getProducts(categoryId, subcategoryId);
        this.products = response.data.data || [];
        this.filteredProducts = this.products;

        console.log('Productos cargados:', this.products.length);
        console.log('Primeros 3 productos:', this.products.slice(0, 3));
      } catch (error) {
        console.error("Error al cargar productos:", error);
        message.error("Error al cargar productos");
      } finally {
        this.loadingProducts = false;
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

      // Filtrar subcategorías por esta categoría
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

    async loadSubcategories() {
      try {
        const response = await stockHistoryService.getSubcategories();
        this.subcategories = response.data.data || [];
        this.filteredSubcategories = this.subcategories;
      } catch (error) {
        console.error("Error al cargar subcategorías:", error);
        message.error("Error al cargar subcategorías");
      }
    },

    filterSubcategories() {
      let baseSubcategories = this.subcategories;

      // Filtrar por categoría si está seleccionada
      if (this.selectedCategory && this.selectedCategory.id) {
        baseSubcategories = this.subcategories.filter(sub =>
          sub.category_id === this.selectedCategory.id ||
          sub.categoria_id === this.selectedCategory.id
        );
      }

      // Aplicar búsqueda por texto
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

      // Cargar productos de esta subcategoría
      if (subcategory && subcategory.id) {
        this.loadProducts(this.selectedCategory?.id, subcategory.id);
      }
    },

    clearSubcategory() {
      this.selectedSubcategory = null;
      this.selectedProduct = null;

      // Recargar productos según categoría seleccionada
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

    async generateReport() {
      try {
        this.loading = true;

        const params = {
          date_from: this.dateFrom,
          date_to: this.dateTo,
        };

        if (this.selectedCategory && this.selectedCategory.id) {
          params.category_id = this.selectedCategory.id;
        }

        if (this.selectedSubcategory && this.selectedSubcategory.id) {
          params.subcategory_id = this.selectedSubcategory.id;
        }

        if (this.selectedProduct && this.selectedProduct.id) {
          params.product_id = this.selectedProduct.id;
        }

        const response = await stockHistoryService.getStockHistory(params);

        if (response.data.success) {
          this.stockData = response.data.data.data || [];
          this.totals = response.data.data.totals || null;

          if (this.stockData.length === 0) {
            message.info("No se encontraron datos para los filtros seleccionados");
          } else {
            message.success(`Se cargaron ${this.stockData.length} productos`);
          }
        }
      } catch (error) {
        console.error("Error al generar reporte:", error);
        message.error("Error al generar el reporte");
      } finally {
        this.loading = false;
      }
    },

    async loadData() {
      await this.generateReport();
    },

    async exportReport(format) {
      try {
        message.loading("Exportando reporte...");

        const params = {
          date_from: this.dateFrom,
          date_to: this.dateTo,
          format,
        };

        if (this.selectedCategory && this.selectedCategory.id) {
          params.category_id = this.selectedCategory.id;
        }

        if (this.selectedSubcategory && this.selectedSubcategory.id) {
          params.subcategory_id = this.selectedSubcategory.id;
        }

        if (this.selectedProduct && this.selectedProduct.id) {
          params.product_id = this.selectedProduct.id;
        }

        const response = await stockHistoryService.exportStockHistory(params);

        // Crear blob y descargar
        const blob = new Blob([response.data], {
          type: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `historial-existencias-${moment().format("YYYY-MM-DD")}.${format === "pdf" ? "pdf" : "xlsx"}`;
        link.click();

        message.success("Reporte exportado exitosamente");
      } catch (error) {
        console.error("Error al exportar reporte:", error);
        message.error("Error al exportar el reporte");
      }
    },

    buildStockHistoryHTML() {
      const dateGenerated = new Date().toLocaleString('es-NI', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      let stockRows = '';

      // Generar filas de productos
      this.stockData.forEach(item => {
        stockRows += `
          <tr>
            <td>${item.sku || ''}</td>
            <td>${item.product_name || ''}</td>
            <td class="text-right">${this.formatNumber(item.initial_quantity)}</td>
            <td class="text-right" style="color: #16a34a;">${this.formatNumber(item.added_quantity)}</td>
            <td class="text-right" style="color: #dc2626;">${this.formatNumber(item.defective_quantity)}</td>
            <td class="text-right" style="color: #2563eb;">${this.formatNumber(item.sold_quantity)}</td>
            <td class="text-right"><strong>${this.formatNumber(item.final_quantity)}</strong></td>
          </tr>
        `;
      });

      // Fila de totales
      if (this.totals) {
        stockRows += `
          <tr style="background: #f3f4f6; font-weight: bold;">
            <td colspan="2" style="text-align: right;">TOTALES:</td>
            <td class="text-right">${this.formatNumber(this.totals.initial_quantity)}</td>
            <td class="text-right" style="color: #16a34a;">${this.formatNumber(this.totals.added_quantity)}</td>
            <td class="text-right" style="color: #dc2626;">${this.formatNumber(this.totals.defective_quantity)}</td>
            <td class="text-right" style="color: #2563eb;">${this.formatNumber(this.totals.sold_quantity)}</td>
            <td class="text-right"><strong>${this.formatNumber(this.totals.final_quantity)}</strong></td>
          </tr>
        `;
      }

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 15px;
              background: white;
              margin: 0;
              width: 800px;
            }
            .header-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              gap: 15px;
            }
            .company-info {
              width: 60%;
              flex-shrink: 0;
            }
            .company-details {
              font-size: 11px;
              line-height: 1.5;
            }
            .report-box {
              width: 38%;
              flex-shrink: 0;
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: white;
              padding: 10px;
              border-radius: 8px;
            }
            .report-title {
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .report-details {
              font-size: 10px;
              line-height: 1.6;
            }
            .separator {
              border: none;
              border-top: 3px solid #f97316;
              margin: 15px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9px;
            }
            thead {
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: white;
            }
            th {
              padding: 8px 4px;
              text-align: left;
              border: 1px solid #ddd;
              font-size: 9px;
            }
            td {
              padding: 6px;
              border: 1px solid #ddd;
            }
            .text-right {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="company-info">
              <img src="${LOGO_BASE64}" alt="Logo" style="max-width: 180px; height: auto; margin-bottom: 8px;">
              <div class="company-details">
                Cerámicas Terrazos y Pulidos<br>
                <strong>RTN:</strong> 01061977002516<br>
                <strong>Dirección:</strong> Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico. La Ceiba, Atlántida<br>
                <strong>Tel:</strong> +504 2440-0037 | <strong>Móvil:</strong> +504 9875-2725<br>
                <strong>Email:</strong> mauricio_argenal@hotmail.com
              </div>
            </div>
            <div class="report-box">
              <div class="report-title">HISTORIAL DE EXISTENCIAS</div>
              <div class="report-details">
                <strong>Generado:</strong> ${dateGenerated}<br>
                <strong>Periodo:</strong> ${this.dateRangeDisplay}<br>
                <strong>Productos:</strong> ${this.stockData.length}
              </div>
            </div>
          </div>

          <hr class="separator">

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Producto</th>
                <th class="text-right">Cant. Inicial</th>
                <th class="text-right">Cargos</th>
                <th class="text-right">Descargos</th>
                <th class="text-right">Ventas</th>
                <th class="text-right">Stock Final</th>
              </tr>
            </thead>
            <tbody>
              ${stockRows}
            </tbody>
          </table>
        </body>
        </html>
      `;
    },

    saveAsExcel() {
      this.showSaveReportModal = false;

      try {
        const wb = XLSX.utils.book_new();

        const headerData = [
          ['Cerámicas Terrazos y Pulidos'],
          ['RTN: 01061977002516'],
          ['Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico. La Ceiba, Atlántida'],
          ['Tel: +504 2440-0037 | Móvil: +504 9875-2725'],
          ['Email: mauricio_argenal@hotmail.com'],
          [''],
          ['REPORTE DE HISTORIAL DE EXISTENCIAS'],
          [`Periodo: ${this.dateRangeDisplay}`],
          [`Generado: ${new Date().toLocaleString('es-NI')}`],
          ['']
        ];

        const ws = XLSX.utils.aoa_to_sheet(headerData);

        const data = [];
        this.stockData.forEach(item => {
          data.push({
            codigo: item.sku || '',
            nombre: item.product_name || '',
            cant_inicial: parseFloat(item.initial_quantity || 0),
            cargos: parseFloat(item.added_quantity || 0),
            descargos: parseFloat(item.defective_quantity || 0),
            ventas: parseFloat(item.sold_quantity || 0),
            stock_final: parseFloat(item.final_quantity || 0)
          });
        });

        // Agregar totales
        if (this.totals) {
          data.push({
            codigo: '',
            nombre: 'TOTALES',
            cant_inicial: parseFloat(this.totals.initial_quantity || 0),
            cargos: parseFloat(this.totals.added_quantity || 0),
            descargos: parseFloat(this.totals.defective_quantity || 0),
            ventas: parseFloat(this.totals.sold_quantity || 0),
            stock_final: parseFloat(this.totals.final_quantity || 0)
          });
        }

        XLSX.utils.sheet_add_json(ws, data, { origin: 'A12', skipHeader: false });

        XLSX.utils.book_append_sheet(wb, ws, 'Historial Existencias');

        const fileName = `historial-existencias-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        message.success('Reporte exportado como Excel exitosamente');
      } catch (error) {
        console.error('Error al guardar Excel:', error);
        message.error('Error al generar el archivo Excel');
      }
    },

    async saveAsPDF() {
      this.showSaveReportModal = false;

      try {
        const fileName = `historial-existencias-${new Date().toISOString().split('T')[0]}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildStockHistoryHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 800,
          windowWidth: 800
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const pageHeight = 277;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);

        while (heightLeft > 0) {
          position = -(imgHeight - heightLeft) + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pageHeight - 20);
        }

        pdf.save(`${fileName}.pdf`);
        document.body.removeChild(iframe);

        message.success('Reporte exportado como PDF exitosamente');
      } catch (error) {
        console.error('Error al guardar PDF:', error);
        message.error('Error al generar el archivo PDF');
      }
    },

    async saveAsImage() {
      this.showSaveReportModal = false;

      try {
        const fileName = `historial-existencias-${new Date().toISOString().split('T')[0]}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildStockHistoryHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 800,
          windowWidth: 800
        });

        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);

        message.success('Reporte exportado como imagen exitosamente');
      } catch (error) {
        console.error('Error al guardar imagen:', error);
        message.error('Error al generar la imagen');
      }
    },

    async printReport() {
      this.showSaveReportModal = false;

      try {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildStockHistoryHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        iframe.contentWindow.print();

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (error) {
        console.error('Error al imprimir:', error);
        message.error('Error al imprimir el reporte');
      }
    },

    formatNumber(value) {
      if (value === null || value === undefined) return "0";
      return parseFloat(value).toLocaleString("es-NI");
    },

    getImageUrl(image) {
      if (!image) return "";
      // Si la imagen ya tiene la URL completa
      if (image.startsWith("http")) return image;
      // Si es una ruta relativa
      return `${import.meta.env.VITE_API_URL}/uploads/products/${image}`;
    },

    onImageError(event) {
      event.target.src = "@/assets/img/products/product-placeholder.png";
    }
  },
};
</script>

<style scoped>
.nav-pills .nav-link {
  color: #6c757d;
  transition: all 0.3s ease;
}

.nav-pills .nav-link:hover {
  color: #ff9800;
  background-color: rgba(255, 152, 0, 0.1);
}

.nav-pills .nav-link.router-link-active {
  background-color: #ff9800;
  color: white;
  font-weight: 500;
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-warning:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3);
  transition: all 0.3s ease;
}

.card {
  transition: all 0.3s ease;
}

.shadow-sm {
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.075) !important;
}

.badge {
  padding: 0.4em 0.8em;
  font-size: 0.85rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media print {
  .page-header,
  .table-tab,
  .card:first-child,
  .footer,
  .table-top-head {
    display: none !important;
  }
}
</style>
