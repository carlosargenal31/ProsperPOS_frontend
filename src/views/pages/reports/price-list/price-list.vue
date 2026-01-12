<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div>
        <div class="page-header">
          <div class="add-item d-flex">
            <div class="page-title">
              <h4>Lista de Precios</h4>
              <h6>Ver Lista de Precios de Productos</h6>
            </div>
          </div>
          <ul class="table-top-head">
            <li class="me-2">
              <a data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh" @click="loadProducts">
                <i class="ti ti-refresh"></i>
              </a>
            </li>
            <li>
              <a data-bs-toggle="tooltip" data-bs-placement="top" title="Collapse" id="collapse-header" @click="toggleHeader">
                <i class="ti ti-chevron-up"></i>
              </a>
            </li>
          </ul>
        </div>

        <!-- Filtros -->
        <div class="card border-0">
          <div class="card-body pb-1">
            <form @submit.prevent="generateReport">
              <!-- Fila 1: Categoría, Subcategoría, Producto -->
              <div class="row mb-3">
                <div class="col-lg-3 col-md-6">
                  <label class="form-label">Categoría</label>
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
                <div class="col-lg-3 col-md-6">
                  <label class="form-label">Subcategoría</label>
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
                <div class="col-lg-3 col-md-6">
                  <label class="form-label">Producto</label>
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
                <div class="col-lg-3 col-md-6">
                  <label class="form-label">Marca</label>
                  <select class="form-select" v-model="filters.brand_id">
                    <option value="">TODAS</option>
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                      {{ brand.name || brand.nombre }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Opciones de inclusión -->
              <div class="row">
                <div class="col-md-12">
                  <div class="row">
                    <div class="col-md-3">
                      <div class="form-check mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="includeOptions.images"
                          id="includeImages"
                        />
                        <label class="form-check-label" for="includeImages">
                          Incluir Imágenes
                        </label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-check mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="includeOptions.codes"
                          id="includeCodes"
                        />
                        <label class="form-check-label" for="includeCodes">
                          Incluir Códigos
                        </label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-check mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="includeOptions.suspended"
                          id="includeSuspended"
                        />
                        <label class="form-check-label" for="includeSuspended">
                          Incluir Productos Suspendidos
                        </label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-check mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="includeOptions.onlyWithStock"
                          id="onlyWithStock"
                        />
                        <label class="form-check-label" for="onlyWithStock">
                          Solo Productos con Existencia Mayor a Cero
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Opciones adicionales -->
              <div class="row">
                <div class="col-md-12">
                  <div class="row">
                    <div class="col-md-3">
                      <div class="form-check mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="includeOptions.showStock"
                          id="showStock"
                        />
                        <label class="form-check-label" for="showStock">
                          Ver Existencias
                        </label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-check mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="includeOptions.showCosts"
                          id="showCosts"
                        />
                        <label class="form-check-label" for="showCosts">
                          Incluir Costos
                        </label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-check mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="includeOptions.showTaxList"
                          id="showTaxList"
                        />
                        <label class="form-check-label" for="showTaxList">
                          Incluir Lista de Impuestos
                        </label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-check mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="includeOptions.showPricesWithTax"
                          id="showPricesWithTax"
                        />
                        <label class="form-check-label" for="showPricesWithTax">
                          Ver Precios + Impuestos
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Opciones de orden -->
              <div class="row mb-3">
                <div class="col-md-3">
                  <label class="form-label">Ordenar Por</label>
                  <select class="form-select" v-model="filters.sortBy">
                    <option value="name">Nombre</option>
                    <option value="code">Código</option>
                    <option value="category">Categoría</option>
                    <option value="brand">Marca</option>
                    <option value="price">Precio</option>
                  </select>
                </div>
                <div class="col-md-9 d-flex align-items-end">
                  <button class="btn btn-primary" type="submit">
                    <i class="ti ti-search me-2"></i>Generar Reporte
                  </button>
                </div>
              </div>

              <!-- Selección de tipos de precio -->
              <div class="row">
                <div class="col-md-12">
                  <label class="form-label">Tipos de Precio a Incluir</label>
                  <div class="row">
                    <div class="col-md-2" v-for="(priceType, index) in priceTypes" :key="index">
                      <div class="form-check mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="priceType.selected"
                          :id="'priceType' + index"
                        />
                        <label class="form-check-label" :for="'priceType' + index">
                          {{ priceType.label }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Tabla de productos -->
        <div class="card table-list-card no-search" v-if="products.length > 0">
          <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <div>
              <h4>Lista de Precios</h4>
              <p class="text-muted mb-0">{{ filteredProducts.length }} productos encontrados</p>
            </div>
            <div>
              <button class="btn btn-sm btn-primary" @click="showSaveReportModal = true">
                <i class="ti ti-download me-1"></i> Guardar Reporte
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table datatable" id="priceListTable">
                <thead class="thead-light">
                  <tr>
                    <th v-if="includeOptions.codes">Código</th>
                    <th v-if="includeOptions.images">Imagen</th>
                    <th>Nombre del Producto</th>
                    <th>Categoría</th>
                    <th>Subcategoría</th>
                    <th>Marca</th>
                    <th v-if="includeOptions.showStock">Existencias</th>
                    <th v-if="includeOptions.showCosts">Costo</th>
                    <th v-if="includeOptions.showTaxList">Impuesto</th>
                    <th v-for="priceType in selectedPriceTypes" :key="priceType.value">
                      {{ priceType.label }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in filteredProducts" :key="product.id">
                    <td v-if="includeOptions.codes">{{ product.code }}</td>
                    <td v-if="includeOptions.images">
                      <div class="d-flex align-items-center">
                        <a class="avatar avatar-md">
                          <img
                            :src="getProductImage(product)"
                            class="img-fluid"
                            alt="img"
                            @error="handleImageError"
                          />
                        </a>
                      </div>
                    </td>
                    <td>
                      <p class="text-dark mb-0">{{ product.name }}</p>
                    </td>
                    <td>{{ product.category }}</td>
                    <td>{{ product.subcategory }}</td>
                    <td>{{ product.brand }}</td>
                    <td v-if="includeOptions.showStock">{{ product.stock }}</td>
                    <td v-if="includeOptions.showCosts">L {{ formatNumber(product.cost) }}</td>
                    <td v-if="includeOptions.showTaxList">
                      {{ product.tax_rate ? product.tax_rate + '%' : '0%' }}
                    </td>
                    <td v-for="priceType in selectedPriceTypes" :key="priceType.value">
                      L {{ formatNumber(getPriceValue(product, priceType.value)) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay productos -->
        <div class="card" v-else>
          <div class="card-body text-center py-5">
            <i class="ti ti-file-x" style="font-size: 48px; color: #ccc;"></i>
            <p class="mt-3 text-muted">No se encontraron productos. Utilice los filtros y haga clic en "Generar Reporte".</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de búsqueda de categorías -->
    <div class="modal fade" :class="{ show: showCategorySearch, 'd-block': showCategorySearch }" tabindex="-1" v-if="showCategorySearch" @click.self="showCategorySearch = false">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Buscar Categoría</h5>
            <button type="button" class="btn-close" @click="showCategorySearch = false"></button>
          </div>
          <div class="modal-body">
            <input
              type="text"
              class="form-control mb-3"
              v-model="categorySearchTerm"
              placeholder="Buscar categoría..."
            />
            <div class="list-group" style="max-height: 400px; overflow-y: auto;">
              <button
                type="button"
                class="list-group-item list-group-item-action"
                v-for="category in filteredCategories"
                :key="category.id"
                @click="selectCategory(category)"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de búsqueda de subcategorías -->
    <div class="modal fade" :class="{ show: showSubcategorySearch, 'd-block': showSubcategorySearch }" tabindex="-1" v-if="showSubcategorySearch" @click.self="showSubcategorySearch = false">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Buscar Subcategoría</h5>
            <button type="button" class="btn-close" @click="showSubcategorySearch = false"></button>
          </div>
          <div class="modal-body">
            <input
              type="text"
              class="form-control mb-3"
              v-model="subcategorySearchTerm"
              placeholder="Buscar subcategoría..."
            />
            <div class="list-group" style="max-height: 400px; overflow-y: auto;">
              <button
                type="button"
                class="list-group-item list-group-item-action"
                v-for="subcategory in filteredSubcategories"
                :key="subcategory.id"
                @click="selectSubcategory(subcategory)"
              >
                {{ subcategory.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de búsqueda de productos -->
    <div class="modal fade" :class="{ show: showProductSearch, 'd-block': showProductSearch }" tabindex="-1" v-if="showProductSearch" @click.self="showProductSearch = false">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Buscar Producto</h5>
            <button type="button" class="btn-close" @click="showProductSearch = false"></button>
          </div>
          <div class="modal-body">
            <input
              type="text"
              class="form-control mb-3"
              v-model="productSearchTerm"
              placeholder="Buscar producto..."
            />
            <div class="list-group" style="max-height: 400px; overflow-y: auto;">
              <button
                type="button"
                class="list-group-item list-group-item-action"
                v-for="product in filteredProductsForSearch"
                :key="product.id"
                @click="selectProduct(product)"
              >
                {{ product.name }} - {{ product.code }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
      <p class="mb-0 text-gray-9">
        {{ new Date().getFullYear() }} &copy; ProsperPOS. Todos los derechos reservados
      </p>
      <p>
        Diseñado &amp; Desarrollado Por
        <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a>
      </p>
    </div>
  </div>

  <!-- Modal Guardar Reporte -->
  <div v-if="showSaveReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Guardar Reporte - Lista de Precios</h5>
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
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { LOGO_BASE64 } from '@/assets/img/logo.js';

const API_URL = 'http://localhost:3000/api/v1';

export default {
  name: 'PriceList',
  setup() {
    // Filtros
    const filters = ref({
      category_id: '',
      subcategory_id: '',
      product_id: '',
      brand_id: '',
      sortBy: 'name'
    });

    // Opciones de inclusión
    const includeOptions = ref({
      images: false,
      codes: true,
      suspended: false,
      onlyWithStock: false,
      showStock: true,
      showCosts: false,
      showTaxList: false,
      showPricesWithTax: false
    });

    // Tipos de precio
    const priceTypes = ref([
      { label: 'PRECIO #1', value: 'price1', selected: true },
      { label: 'PRECIO #2', value: 'price2', selected: false },
      { label: 'PRECIO #3', value: 'price3', selected: false },
      { label: 'PRECIO #4', value: 'price4', selected: false },
      { label: 'PRECIO #5', value: 'price5', selected: false },
      { label: 'PRECIO #6', value: 'price6', selected: false }
    ]);

    // Datos
    const products = ref([]);
    const allProducts = ref([]);
    const categories = ref([]);
    const subcategories = ref([]);
    const brands = ref([]);

    // Modales de búsqueda
    const showCategorySearch = ref(false);
    const showSubcategorySearch = ref(false);
    const showProductSearch = ref(false);
    const showSaveReportModal = ref(false);

    // Términos de búsqueda
    const categorySearchTerm = ref('');
    const subcategorySearchTerm = ref('');
    const productSearchTerm = ref('');

    // Nombres seleccionados
    const selectedCategoryName = ref('');
    const selectedSubcategoryName = ref('');
    const selectedProductName = ref('');

    // Información de empresa
    const companyInfo = ref({});

    // Computed
    const selectedPriceTypes = computed(() => {
      return priceTypes.value.filter(pt => pt.selected);
    });

    const filteredCategories = computed(() => {
      if (!categorySearchTerm.value) return categories.value;
      return categories.value.filter(c =>
        c.name.toLowerCase().includes(categorySearchTerm.value.toLowerCase())
      );
    });

    const filteredSubcategories = computed(() => {
      // Primero filtrar por categoría si existe
      let baseSubcategories = subcategories.value;
      if (filters.value.category_id) {
        baseSubcategories = subcategories.value.filter(sub =>
          sub.category_id === filters.value.category_id || sub.categoria_id === filters.value.category_id
        );
      }

      // Luego aplicar búsqueda por término
      if (!subcategorySearchTerm.value) return baseSubcategories;

      return baseSubcategories.filter(s =>
        (s.name && s.name.toLowerCase().includes(subcategorySearchTerm.value.toLowerCase())) ||
        (s.nombre && s.nombre.toLowerCase().includes(subcategorySearchTerm.value.toLowerCase()))
      );
    });

    const filteredProductsForSearch = computed(() => {
      // Primero filtrar por categoría y subcategoría si existen
      let baseProducts = allProducts.value;

      if (filters.value.category_id) {
        baseProducts = baseProducts.filter(p =>
          p.category_id === filters.value.category_id
        );

        if (filters.value.subcategory_id) {
          baseProducts = baseProducts.filter(p =>
            p.subcategory_id === filters.value.subcategory_id
          );
        }
      }

      // Luego aplicar búsqueda por término
      if (!productSearchTerm.value) return baseProducts;

      return baseProducts.filter(p =>
        p.name.toLowerCase().includes(productSearchTerm.value.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(productSearchTerm.value.toLowerCase()))
      );
    });

    const filteredProducts = computed(() => {
      let result = [...products.value];

      // Aplicar filtros
      if (filters.value.category_id) {
        result = result.filter(p => p.category_id === filters.value.category_id);
      }

      if (filters.value.subcategory_id) {
        result = result.filter(p => p.subcategory_id === filters.value.subcategory_id);
      }

      if (filters.value.product_id) {
        result = result.filter(p => p.id === filters.value.product_id);
      }

      if (filters.value.brand_id) {
        result = result.filter(p => p.brand_id === filters.value.brand_id);
      }

      // Filtro de productos activos/suspendidos
      // Por defecto solo mostrar productos activos (is_active = 1)
      // Solo incluir suspendidos (is_active = 0) si el checkbox está marcado
      if (!includeOptions.value.suspended) {
        result = result.filter(p => p.is_active === 1);
      }

      // Filtro de solo con stock
      if (includeOptions.value.onlyWithStock) {
        result = result.filter(p => p.stock > 0);
      }

      // Ordenar
      const sortBy = filters.value.sortBy;
      result.sort((a, b) => {
        if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '');
        } else if (sortBy === 'code') {
          return (a.code || '').localeCompare(b.code || '');
        } else if (sortBy === 'category') {
          return (a.category || '').localeCompare(b.category || '');
        } else if (sortBy === 'brand') {
          return (a.brand || '').localeCompare(b.brand || '');
        } else if (sortBy === 'price') {
          return (a.price || 0) - (b.price || 0);
        }
        return 0;
      });

      return result;
    });

    // Métodos
    const getAuthHeaders = () => {
      const token = localStorage.getItem('token');
      return {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
    };

    const loadCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`, getAuthHeaders());
        if (response.data && response.data.data) {
          categories.value = response.data.data;
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        if (error.response?.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Sesión Expirada',
            text: 'Por favor, inicia sesión nuevamente'
          });
        }
      }
    };

    const loadSubcategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/subcategories`, getAuthHeaders());
        if (response.data && response.data.data) {
          subcategories.value = response.data.data;
        }
      } catch (error) {
        console.error('Error loading subcategories:', error);
        if (error.response?.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Sesión Expirada',
            text: 'Por favor, inicia sesión nuevamente'
          });
        }
      }
    };

    const loadBrands = async () => {
      try {
        const response = await axios.get(`${API_URL}/brands`, getAuthHeaders());
        if (response.data && response.data.data) {
          brands.value = response.data.data;
        }
      } catch (error) {
        console.error('Error loading brands:', error);
        if (error.response?.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Sesión Expirada',
            text: 'Por favor, inicia sesión nuevamente'
          });
        }
      }
    };

    const loadProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products?limit=9999&includeStock=true`, getAuthHeaders());

        let productsData = [];

        if (response.data && response.data.success && response.data.data) {
          // El servicio puede devolver { products: [...], pagination: {...} }
          if (response.data.data.products && Array.isArray(response.data.data.products)) {
            productsData = response.data.data.products;
          }
          // O puede devolver directamente un array
          else if (Array.isArray(response.data.data)) {
            productsData = response.data.data;
          }
          // O puede tener una propiedad data anidada
          else if (response.data.data.data && Array.isArray(response.data.data.data)) {
            productsData = response.data.data.data;
          }
        }

        allProducts.value = productsData.map(product => ({
          id: product.id,
          code: product.sku || product.code,
          name: product.name,
          category: product.category_name || 'Sin categoría',
          category_id: product.category_id,
          subcategory: product.subcategory_name || 'Sin subcategoría',
          subcategory_id: product.subcategory_id,
          brand: product.brand_name || 'Sin marca',
          brand_id: product.brand_id,
          stock: parseFloat(product.stock) || 0,
          cost: parseFloat(product.cost) || 0,
          price: parseFloat(product.price_1 || product.price) || 0,
          price1: parseFloat(product.price_1 || product.price) || 0,
          price2: parseFloat(product.price_2) || 0,
          price3: parseFloat(product.price_3) || 0,
          price4: parseFloat(product.price_4) || 0,
          price5: parseFloat(product.price_5) || 0,
          price6: parseFloat(product.price_6) || 0,
          tax_id: product.tax_id,
          tax_rate: parseFloat(product.tax_rate) || 0,
          image: product.image,
          status: product.status,
          is_active: product.is_active
        }));

        console.log(`✓ Productos cargados: ${allProducts.value.length}`);
        if (allProducts.value.length > 0) {
          console.log('Ejemplo de producto:', allProducts.value[0]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        if (error.response?.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Sesión Expirada',
            text: 'Por favor, inicia sesión nuevamente'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los productos'
          });
        }
      }
    };

    const generateReport = () => {
      products.value = [...allProducts.value];
    };

    const selectCategory = (category) => {
      filters.value.category_id = category.id;
      selectedCategoryName.value = category.name;
      showCategorySearch.value = false;
      categorySearchTerm.value = '';

      // Limpiar subcategoría y producto
      filters.value.subcategory_id = '';
      selectedSubcategoryName.value = '';
      filters.value.product_id = '';
      selectedProductName.value = '';
    };

    const selectSubcategory = (subcategory) => {
      filters.value.subcategory_id = subcategory.id;
      selectedSubcategoryName.value = subcategory.name;
      showSubcategorySearch.value = false;
      subcategorySearchTerm.value = '';

      // Limpiar producto
      filters.value.product_id = '';
      selectedProductName.value = '';
    };

    const selectProduct = (product) => {
      filters.value.product_id = product.id;
      selectedProductName.value = product.name;
      showProductSearch.value = false;
      productSearchTerm.value = '';
    };

    const clearCategory = () => {
      filters.value.category_id = '';
      selectedCategoryName.value = '';

      // También limpiar subcategoría y producto
      filters.value.subcategory_id = '';
      selectedSubcategoryName.value = '';
      filters.value.product_id = '';
      selectedProductName.value = '';
    };

    const clearSubcategory = () => {
      filters.value.subcategory_id = '';
      selectedSubcategoryName.value = '';

      // También limpiar producto
      filters.value.product_id = '';
      selectedProductName.value = '';
    };

    const clearProduct = () => {
      filters.value.product_id = '';
      selectedProductName.value = '';
    };

    const getPriceValue = (product, priceType) => {
      const basePrice = product[priceType] || 0;

      // Si se debe mostrar precio con impuestos
      if (includeOptions.value.showPricesWithTax && product.tax_rate) {
        const taxAmount = basePrice * (product.tax_rate / 100);
        return basePrice + taxAmount;
      }

      return basePrice;
    };

    const formatNumber = (number) => {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(number || 0);
    };

    const getProductImage = (product) => {
      // Si el producto tiene imagen, devolverla
      if (product.image && product.image.trim() !== '') {
        return product.image;
      }
      // Si no tiene imagen, usar placeholder
      return new URL('@/assets/img/products/pos-product-01.png', import.meta.url).href;
    };

    const handleImageError = (event) => {
      // Si falla la carga de la imagen, usar el placeholder
      event.target.src = new URL('@/assets/img/products/pos-product-01.png', import.meta.url).href;
    };

    const toggleHeader = () => {
      document.getElementById('collapse-header')?.classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    };

    const buildPriceListHTML = () => {
      // Generar HTML para la lista de precios
      const itemRows = filteredProducts.value.map(product => {
        let row = '<tr>';

        if (includeOptions.value.codes) {
          row += `<td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; font-size: 8px;">${product.code || ''}</td>`;
        }

        row += `<td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; font-size: 8px;">${product.name}</td>`;
        row += `<td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; font-size: 8px;">${product.category}</td>`;
        row += `<td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; font-size: 8px;">${product.subcategory}</td>`;
        row += `<td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; font-size: 8px;">${product.brand}</td>`;

        if (includeOptions.value.showStock) {
          row += `<td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; font-size: 8px; text-align: right;">${product.stock}</td>`;
        }

        if (includeOptions.value.showCosts) {
          row += `<td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; font-size: 8px; text-align: right;">L ${formatNumber(product.cost)}</td>`;
        }

        if (includeOptions.value.showTaxList) {
          row += `<td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; font-size: 8px; text-align: center;">${product.tax_rate ? product.tax_rate + '%' : '0%'}</td>`;
        }

        selectedPriceTypes.value.forEach(priceType => {
          const priceValue = getPriceValue(product, priceType.value);
          row += `<td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; font-size: 8px; text-align: right;">L ${formatNumber(priceValue)}</td>`;
        });

        row += '</tr>';
        return row;
      }).join('');

      // Generar headers
      let headers = '';
      if (includeOptions.value.codes) headers += '<th style="padding: 8px 6px; font-size: 9px; font-weight: 600; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.3);">Código</th>';
      headers += '<th style="padding: 8px 6px; font-size: 9px; font-weight: 600; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.3);">Producto</th>';
      headers += '<th style="padding: 8px 6px; font-size: 9px; font-weight: 600; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.3);">Categoría</th>';
      headers += '<th style="padding: 8px 6px; font-size: 9px; font-weight: 600; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.3);">Subcategoría</th>';
      headers += '<th style="padding: 8px 6px; font-size: 9px; font-weight: 600; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.3);">Marca</th>';
      if (includeOptions.value.showStock) headers += '<th style="padding: 8px 6px; font-size: 9px; font-weight: 600; text-align: right; border-bottom: 2px solid rgba(255,255,255,0.3);">Existencias</th>';
      if (includeOptions.value.showCosts) headers += '<th style="padding: 8px 6px; font-size: 9px; font-weight: 600; text-align: right; border-bottom: 2px solid rgba(255,255,255,0.3);">Costo</th>';
      if (includeOptions.value.showTaxList) headers += '<th style="padding: 8px 6px; font-size: 9px; font-weight: 600; text-align: center; border-bottom: 2px solid rgba(255,255,255,0.3);">Impuesto</th>';
      selectedPriceTypes.value.forEach(priceType => {
        headers += `<th style="padding: 8px 6px; font-size: 9px; font-weight: 600; text-align: right; border-bottom: 2px solid rgba(255,255,255,0.3);">${priceType.label}</th>`;
      });

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
              width: 1000px;
              background: white;
            }

            .header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 15px;
              margin-bottom: 10px;
            }

            .company-info {
              width: 60%;
              flex-shrink: 0;
            }

            .company-info img {
              max-width: 180px;
              height: auto;
              display: block;
              margin-bottom: 8px;
            }

            .company-name {
              font-size: 14px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 6px;
            }

            .company-detail {
              font-size: 10px;
              color: #4b5563;
              line-height: 1.5;
              margin: 2px 0;
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
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .report-title {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }

            .report-info {
              font-size: 10px;
              line-height: 1.6;
            }

            .report-info-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              padding: 2px 0;
              border-bottom: 1px solid rgba(255,255,255,0.2);
            }

            .report-info-row:last-child {
              border-bottom: none;
            }

            .report-info-label {
              font-weight: 600;
            }

            .separator {
              border: none;
              border-top: 3px solid #f97316;
              margin: 15px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 8px;
              margin-top: 10px;
            }

            thead {
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: white;
            }

            th {
              padding: 8px 6px;
              font-size: 9px;
              font-weight: 600;
              text-align: left;
              border-bottom: 2px solid rgba(255,255,255,0.3);
            }

            td {
              padding: 4px 6px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 8px;
            }

            tbody tr:nth-child(even) {
              background-color: #fef3f2;
            }

            tbody tr:hover {
              background-color: #ffedd5;
            }

            @media print {
              body {
                padding: 10px;
                width: 100%;
              }

              .report-box,
              thead {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              tbody tr:nth-child(even) {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="company-info">
              <img src="${LOGO_BASE64}" alt="Logo">
              <div class="company-name">${companyInfo.value.company_name || 'Cerámicas Terrazos y Pulidos Universal'}</div>
              <div class="company-detail"><strong>RTN:</strong> ${companyInfo.value.rtn || '01061977002516'}</div>
              <div class="company-detail"><strong>Dirección:</strong> ${companyInfo.value.direccion || 'Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico, La Ceiba, Atlántida'}</div>
              <div class="company-detail"><strong>Tel:</strong> ${companyInfo.value.telefono || '+504 2440-0037'} | <strong>Móvil:</strong> ${companyInfo.value.celular || '+504 9875-2725'}</div>
              <div class="company-detail"><strong>Email:</strong> ${companyInfo.value.email || 'mauricio_argenal@hotmail.com'}</div>
            </div>
            <div class="report-box">
              <div class="report-title">LISTA DE PRECIOS</div>
              <div class="report-info">
                <div class="report-info-row">
                  <span class="report-info-label">Fecha:</span>
                  <span>${new Date().toLocaleDateString('es-HN')}</span>
                </div>
                <div class="report-info-row">
                  <span class="report-info-label">Hora:</span>
                  <span>${new Date().toLocaleTimeString('es-HN')}</span>
                </div>
                <div class="report-info-row">
                  <span class="report-info-label">Total Productos:</span>
                  <span>${filteredProducts.value.length}</span>
                </div>
              </div>
            </div>
          </div>

          <hr class="separator">

          <table>
            <thead>
              <tr>${headers}</tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
        </body>
        </html>
      `;
    };

    const saveAsExcel = () => {
      showSaveReportModal.value = false;
      try {
        const wb = XLSX.utils.book_new();

        const headerData = [
          [companyInfo.value.company_name || 'PROSPERPOS'],
          [companyInfo.value.direccion || 'Sin dirección'],
          [`Tel: ${companyInfo.value.telefono || 'N/A'}`],
          [''],
          ['LISTA DE PRECIOS'],
          [`Fecha: ${new Date().toLocaleDateString()}`],
          [''],
          [''],
        ];

        const ws = XLSX.utils.aoa_to_sheet(headerData);

        const data = filteredProducts.value.map(product => {
          const row = {};

          if (includeOptions.value.codes) row['Código'] = product.code || '';
          row['Producto'] = product.name;
          row['Categoría'] = product.category || '-';
          row['Subcategoría'] = product.subcategory || '-';
          row['Marca'] = product.brand || '-';

          if (includeOptions.value.showStock) row['Existencias'] = parseFloat(product.stock || 0);
          if (includeOptions.value.showCosts) row['Costo'] = parseFloat(product.cost || 0);
          if (includeOptions.value.showTaxList) row['Impuesto'] = product.tax_rate ? product.tax_rate + '%' : '0%';

          selectedPriceTypes.value.forEach(priceType => {
            row[priceType.label] = parseFloat(getPriceValue(product, priceType.value));
          });

          return row;
        });

        XLSX.utils.sheet_add_json(ws, data, { origin: 'A9', skipHeader: false });
        XLSX.utils.book_append_sheet(wb, ws, 'Lista de Precios');

        const fileName = `lista-precios-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
      } catch (error) {
        console.error('Error al guardar Excel:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al generar el archivo Excel'
        });
      }
    };

    const saveAsPDF = async () => {
      showSaveReportModal.value = false;
      try {
        const fileName = `lista-precios-${new Date().toISOString().split('T')[0]}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '1000px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = buildPriceListHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 1000,
          windowWidth: 1000
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'letter');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft > 0) {
          position = -(imgHeight - heightLeft) + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pdfHeight - 20);
        }

        pdf.save(`${fileName}.pdf`);
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error al guardar PDF:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al generar el archivo PDF'
        });
      }
    };

    const saveAsImage = async () => {
      showSaveReportModal.value = false;
      try {
        const fileName = `lista-precios-${new Date().toISOString().split('T')[0]}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '1000px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = buildPriceListHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 1000,
          windowWidth: 1000
        });

        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error al guardar imagen:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al generar la imagen'
        });
      }
    };

    const printReport = () => {
      showSaveReportModal.value = false;
      const printWindow = window.open('', '_blank');
      const html = buildPriceListHTML();

      const printHtml = html.replace('</body>', `
        <script>
          window.onload = function() {
            const images = document.getElementsByTagName('img');
            if (images.length > 0) {
              let loadedImages = 0;
              for (let img of images) {
                img.onload = function() {
                  loadedImages++;
                  if (loadedImages === images.length) {
                    window.print();
                    setTimeout(() => window.close(), 500);
                  }
                };
                if (img.complete) {
                  img.onload();
                }
              }
            } else {
              window.print();
              setTimeout(() => window.close(), 500);
            }
          };
        <\/script>
      </body>
      `);

      printWindow.document.write(printHtml);
      printWindow.document.close();
    };

    const loadCompanyInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/company`, getAuthHeaders());
        if (response.data && response.data.success && response.data.data) {
          companyInfo.value = response.data.data;
        }
      } catch (error) {
        console.error('Error loading company info:', error);
      }
    };

    // Lifecycle
    onMounted(() => {
      loadCategories();
      loadSubcategories();
      loadBrands();
      loadProducts();
      loadCompanyInfo();
    });

    return {
      filters,
      includeOptions,
      priceTypes,
      products,
      allProducts,
      categories,
      subcategories,
      brands,
      showCategorySearch,
      showSubcategorySearch,
      showProductSearch,
      categorySearchTerm,
      subcategorySearchTerm,
      productSearchTerm,
      selectedCategoryName,
      selectedSubcategoryName,
      selectedProductName,
      selectedPriceTypes,
      filteredCategories,
      filteredSubcategories,
      filteredProductsForSearch,
      filteredProducts,
      loadProducts,
      generateReport,
      selectCategory,
      selectSubcategory,
      selectProduct,
      clearCategory,
      clearSubcategory,
      clearProduct,
      getPriceValue,
      formatNumber,
      getProductImage,
      handleImageError,
      toggleHeader,
      showSaveReportModal,
      saveAsExcel,
      saveAsPDF,
      saveAsImage,
      printReport
    };
  }
};
</script>

<style scoped>
.form-check-label {
  font-size: 14px;
  cursor: pointer;
}

.form-check-input {
  cursor: pointer;
}

.table td, .table th {
  vertical-align: middle;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

@media print {
  .page-header,
  .card.border-0,
  .table-top-head,
  .footer {
    display: none !important;
  }

  .card-header {
    background-color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
