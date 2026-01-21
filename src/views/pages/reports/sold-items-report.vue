<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Productos Vendidos</h4>
            <h6>Reporte detallado de productos vendidos con filtros avanzados</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li class="me-2">
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Refresh"
              @click="loadSoldItems"
              ><i class="ti ti-refresh"></i
            ></a>
          </li>
          <li class="me-2">
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Collapse"
              id="collapse-header"
              @click="toggleHeader"
              ><i class="ti ti-chevron-up"></i
            ></a>
          </li>
        </ul>
      </div>

      <!-- Summary Cards -->
      <div class="row gx-3 mb-3">
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-primary sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-primary text-white">
                <i class="ti ti-package"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Total Productos</p>
                <h3 class="summary-value-md mb-0">{{ totals.total_cantidad.toFixed(2) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-success sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-success text-white">
                <i class="ti ti-currency-dollar"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Total Ventas</p>
                <h3 class="summary-value-md mb-0">L {{ formatCurrency(totals.total_final) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-info sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-info text-white">
                <i class="ti ti-receipt-tax"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Total Impuestos</p>
                <h3 class="summary-value-md mb-0">L {{ formatCurrency(totals.total_impuesto) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-warning sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-warning text-white">
                <i class="ti ti-chart-line"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Productos Únicos</p>
                <h3 class="summary-value-md mb-0">{{ soldItems.length }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="card-body pb-1">
          <form @submit.prevent="loadSoldItems">
            <!-- Fila 1: Fechas -->
            <div class="row mb-3">
              <div class="col-lg-6 col-md-6">
                <label class="form-label">Fecha Desde</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="filters.date_from"
                />
              </div>
              <div class="col-lg-6 col-md-6">
                <label class="form-label">Fecha Hasta</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="filters.date_to"
                />
              </div>
            </div>

            <!-- Fila 2: Cliente, Vendedor -->
            <div class="row mb-3">
              <div class="col-lg-6 col-md-6">
                <label class="form-label">Cliente</label>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    :value="selectedCustomerName"
                    readonly
                    placeholder="Buscar cliente"
                  />
                  <button class="btn btn-outline-secondary" type="button" @click="showCustomerModal = true">
                    <i class="ti ti-search"></i>
                  </button>
                  <button class="btn btn-outline-danger" type="button" @click="clearCustomer">
                    <i class="ti ti-x"></i>
                  </button>
                </div>
              </div>
              <div class="col-lg-6 col-md-6">
                <label class="form-label">Vendedor</label>
                <select class="form-select" v-model="filters.seller_id">
                  <option value="">TODOS LOS VENDEDORES</option>
                  <option v-for="seller in sellers" :key="seller.id" :value="seller.id">
                    {{ seller.first_name }} {{ seller.last_name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Fila 3: Categoría, Subcategoría, Producto, Sucursal -->
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
                <label class="form-label">Sucursal</label>
                <select class="form-select" v-model="filters.branch_id">
                  <option value="">TODOS</option>
                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name || branch.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Fila 4: Marca -->
            <div class="row mb-3">
              <div class="col-lg-12 col-md-12">
                <label class="form-label">Marca</label>
                <select class="form-select" v-model="filters.brand_id">
                  <option value="">TODOS</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                    {{ brand.name || brand.nombre }}
                  </option>
                </select>
              </div>
            </div>


            <!-- Checkboxes -->
            <div class="row mb-3">
              <div class="col-lg-3 col-md-6">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="filters.include_categories"
                    id="includeCategories"
                  />
                  <label class="form-check-label" for="includeCategories">
                    Incluir: Categorías
                  </label>
                </div>
              </div>
              <div class="col-lg-3 col-md-6">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="filters.include_subcategories"
                    id="includeSubcategories"
                  />
                  <label class="form-check-label" for="includeSubcategories">
                    Subcategorías
                  </label>
                </div>
              </div>
              <div class="col-lg-3 col-md-6">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="filters.include_brands"
                    id="includeBrands"
                  />
                  <label class="form-check-label" for="includeBrands">
                    Marcas
                  </label>
                </div>
              </div>
              <div class="col-lg-3 col-md-6">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="filters.show_costs"
                    id="showCosts"
                  />
                  <label class="form-check-label" for="showCosts">
                    Mostrar Costos
                  </label>
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-lg-3 col-md-6">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="filters.show_utility"
                    id="showUtility"
                  />
                  <label class="form-check-label" for="showUtility">
                    Mostrar Utilidad
                  </label>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="row">
              <div class="col-12 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="clearFilters">
                  <i class="ti ti-x me-1"></i> Cerrar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <i class="ti ti-search me-1"></i>
                  {{ loading ? "Generando..." : "Generar Reporte" }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Results Table -->
      <div class="card table-list-card" v-if="soldItems.length > 0">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap">
          <div>
            <h4>Productos Vendidos</h4>
            <p class="text-muted mb-0">{{ soldItems.length }} registros encontrados</p>
          </div>
          <div>
            <button class="btn btn-sm btn-primary" @click="showSaveReportModal = true">
              <i class="ti ti-download me-1"></i> Guardar Reporte
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="thead-light">
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th v-if="filters.include_categories">Categoría</th>
                  <th v-if="filters.include_subcategories">Subcategoría</th>
                  <th v-if="filters.include_brands">Marca</th>
                  <th class="text-end">Cantidad</th>
                  <th class="text-end">Precio</th>
                  <th v-if="filters.show_costs" class="text-end">Costo Unit.</th>
                  <th class="text-end">Total Neto</th>
                  <th class="text-end">Impuesto</th>
                  <th class="text-end">Total Final</th>
                  <th v-if="filters.show_costs" class="text-end">Costo Total</th>
                  <th v-if="filters.show_utility" class="text-end">Utilidad</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in soldItems" :key="item.codigo">
                  <td>{{ item.codigo }}</td>
                  <td>{{ item.producto }}</td>
                  <td v-if="filters.include_categories">{{ item.categoria || '-' }}</td>
                  <td v-if="filters.include_subcategories">{{ item.subcategoria || '-' }}</td>
                  <td v-if="filters.include_brands">{{ item.marca || '-' }}</td>
                  <td class="text-end">{{ parseFloat(item.cantidad).toFixed(2) }}</td>
                  <td class="text-end">L {{ formatCurrency(item.precio) }}</td>
                  <td v-if="filters.show_costs" class="text-end">L {{ formatCurrency(item.costo) }}</td>
                  <td class="text-end">L {{ formatCurrency(item.total_neto) }}</td>
                  <td class="text-end">L {{ formatCurrency(item.impuesto) }}</td>
                  <td class="text-end">L {{ formatCurrency(item.total_final) }}</td>
                  <td v-if="filters.show_costs" class="text-end">L {{ formatCurrency(item.total_costo) }}</td>
                  <td v-if="filters.show_utility" class="text-end">L {{ formatCurrency(item.utilidad) }}</td>
                </tr>
              </tbody>
              <tfoot class="table-light">
                <tr>
                  <th :colspan="totalColspan" class="text-end">TOTALES:</th>
                  <th class="text-end">{{ totals.total_cantidad.toFixed(2) }}</th>
                  <th></th>
                  <th v-if="filters.show_costs"></th>
                  <th class="text-end">L {{ formatCurrency(totals.total_neto) }}</th>
                  <th class="text-end">L {{ formatCurrency(totals.total_impuesto) }}</th>
                  <th class="text-end">L {{ formatCurrency(totals.total_final) }}</th>
                  <th v-if="filters.show_costs" class="text-end">L {{ formatCurrency(totals.total_costo) }}</th>
                  <th v-if="filters.show_utility" class="text-end">L {{ formatCurrency(totals.total_utilidad) }}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div class="card" v-else-if="!loading && searchPerformed">
        <div class="card-body text-center py-5">
          <i class="ti ti-folder-off" style="font-size: 48px; color: #ccc"></i>
          <h5 class="mt-3">No se encontraron resultados</h5>
          <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
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
                  <td>{{ category.name || category.nombre }}</td>
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
                  <td>{{ subcategory.name || subcategory.nombre }}</td>
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
                  <td>{{ product.code || product.codigo }}</td>
                  <td>{{ product.name || product.nombre }}</td>
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

  <!-- Modal de Búsqueda de Cliente -->
  <div class="modal fade" :class="{ show: showCustomerModal }" :style="{ display: showCustomerModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Búsqueda de Cliente</h5>
          <button type="button" class="btn-close btn-close-white" @click="showCustomerModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <input
              type="text"
              class="form-control"
              v-model="customerSearch"
              placeholder="Buscar por nombre, RTN o código..."
              @input="searchCustomers"
            />
          </div>
          <div class="table-responsive" style="max-height: 400px;">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>RTN</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in filteredCustomers" :key="customer.id">
                  <td>{{ customer.codigo || customer.code }}</td>
                  <td>{{ customer.nombre || customer.name }}</td>
                  <td>{{ customer.doc_identificacion || customer.rtn || 'N/A' }}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" @click="selectCustomer(customer)">
                      Seleccionar
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredCustomers.length === 0">
                  <td colspan="4" class="text-center">No se encontraron clientes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showCustomerModal" @click="showCustomerModal = false"></div>

  <!-- Modal Guardar Reporte -->
  <div v-if="showSaveReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Guardar Reporte - Productos Vendidos</h5>
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
import axios from "axios";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import api from '@/utils/axios';

export default {
  name: "SoldItemsReport",
  data() {
    return {
      soldItems: [],
      loading: false,
      searchPerformed: false,
      categories: [],
      subcategories: [],
      products: [],
      brands: [],
      branches: [],
      sellers: [],
      customers: [],
      filteredCustomers: [],
      filteredCategories: [],
      filteredSubcategories: [],
      filteredProducts: [],
      selectedCustomer: null,
      selectedCategory: null,
      selectedSubcategory: null,
      selectedProduct: null,
      showCustomerModal: false,
      showCategorySearch: false,
      showSubcategorySearch: false,
      showProductSearch: false,
      showSaveReportModal: false,
      companyInfo: {},
      customerSearch: "",
      categorySearch: "",
      subcategorySearch: "",
      productSearch: "",
      filters: {
        date_from: "",
        date_to: "",
        customer_id: "",
        seller_id: "",
        category_id: "",
        subcategory_id: "",
        product_id: "",
        branch_id: "",
        brand_id: "",
        include_categories: false,
        include_subcategories: false,
        include_brands: false,
        show_costs: false,
        show_utility: false,
      },
      totals: {
        total_cantidad: 0,
        total_neto: 0,
        total_impuesto: 0,
        total_final: 0,
        total_costo: 0,
        total_utilidad: 0,
      },
    };
  },
  computed: {
    selectedCustomerName() {
      if (!this.selectedCustomer) return "";
      return this.selectedCustomer.nombre || this.selectedCustomer.name || "";
    },
    selectedCategoryName() {
      if (!this.selectedCategory) return "";
      return this.selectedCategory.nombre || this.selectedCategory.name || "";
    },
    selectedSubcategoryName() {
      if (!this.selectedSubcategory) return "";
      return this.selectedSubcategory.nombre || this.selectedSubcategory.name || "";
    },
    selectedProductName() {
      if (!this.selectedProduct) return "";
      return this.selectedProduct.nombre || this.selectedProduct.name || "";
    },
    totalColspan() {
      let count = 2; // Código + Producto
      if (this.filters.include_categories) count++;
      if (this.filters.include_subcategories) count++;
      if (this.filters.include_brands) count++;
      return count;
    },
  },
  mounted() {
    // Set default dates (today)
    const today = new Date().toISOString().split("T")[0];
    this.filters.date_from = today;
    this.filters.date_to = today;

    // Load filter data
    this.loadCategories();
    this.loadSubcategories();
    this.loadProducts();
    this.loadBrands();
    this.loadBranches();
    this.loadSellers();
    this.loadCustomers();
    this.loadCompanyInfo();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("token");
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    },
    async loadSoldItems() {
      try {
        this.loading = true;
        this.searchPerformed = true;

        const params = new URLSearchParams();

        // Add all filters to params
        Object.keys(this.filters).forEach((key) => {
          if (this.filters[key] !== "" && this.filters[key] !== null) {
            if (Array.isArray(this.filters[key])) {
              this.filters[key].forEach((val) => params.append(key, val));
            } else {
              params.append(key, this.filters[key]);
            }
          }
        });

        const response = await axios.get(
          `/api/v1/sold-items?${params.toString()}`,
          this.getAuthHeaders()
        );

        if (response.data.success) {
          this.soldItems = response.data.data.items || [];
          this.totals = response.data.data.totals || this.totals;
        }
      } catch (error) {
        console.error("Error loading sold items:", error);
        if (this.$toast && this.$toast.error) {
          this.$toast.error("Error al cargar productos vendidos");
        }
      } finally {
        this.loading = false;
      }
    },
    clearFilters() {
      const today = new Date().toISOString().split("T")[0];
      this.filters = {
        date_from: today,
        date_to: today,
        customer_id: "",
        seller_id: "",
        category_id: "",
        subcategory_id: "",
        product_id: "",
        branch_id: "",
        brand_id: "",
        include_categories: false,
        include_subcategories: false,
        include_brands: false,
        show_costs: false,
        show_utility: false,
      };
      this.selectedCustomer = null;
      this.soldItems = [];
      this.searchPerformed = false;
    },
    async loadCategories() {
      try {
        const response = await axios.get("/api/v1/categories", this.getAuthHeaders());
        if (response.data.success) {
          this.categories = response.data.data;
          this.filteredCategories = this.categories;
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    },
    async loadSubcategories() {
      try {
        const response = await axios.get("/api/v1/subcategories", this.getAuthHeaders());
        if (response.data.success) {
          this.subcategories = response.data.data;
          this.filteredSubcategories = this.subcategories;
        }
      } catch (error) {
        console.error("Error loading subcategories:", error);
      }
    },
    async loadProducts() {
      try {
        console.log("Cargando productos...");
        const response = await axios.get("/api/v1/products?limit=9999", this.getAuthHeaders());
        console.log("Respuesta productos completa:", JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.data) {
          // El servicio devuelve { products: [...], pagination: {...} }
          if (response.data.data.products && Array.isArray(response.data.data.products)) {
            this.products = response.data.data.products;
            console.log("✓ Productos cargados desde response.data.data.products:", this.products.length);
          }
          // Fallback: Si data.data es un objeto con propiedad data
          else if (response.data.data.data && Array.isArray(response.data.data.data)) {
            this.products = response.data.data.data;
            console.log("✓ Productos cargados desde response.data.data.data:", this.products.length);
          }
          // Fallback: Si data.data es directamente un array
          else if (Array.isArray(response.data.data)) {
            this.products = response.data.data;
            console.log("✓ Productos cargados desde response.data.data:", this.products.length);
          }
          else {
            console.warn("⚠️ Formato inesperado. Estructura de data:", Object.keys(response.data.data));
            this.products = [];
          }
        } else {
          console.warn("⚠️ Respuesta sin success o data");
          this.products = [];
        }

        this.filteredProducts = this.products;
        console.log("✓ Total productos disponibles:", this.products.length);
        if (this.products.length > 0) {
          console.log("Primer producto:", JSON.stringify(this.products[0], null, 2));
        }
      } catch (error) {
        console.error("❌ Error loading products:", error);
        console.error("Response:", error.response?.data);
        this.products = [];
      }
    },
    async loadBrands() {
      try {
        const response = await axios.get("/api/v1/brands", this.getAuthHeaders());
        if (response.data.success) {
          this.brands = response.data.data;
        }
      } catch (error) {
        console.error("Error loading brands:", error);
      }
    },
    async loadBranches() {
      try {
        const response = await axios.get("/api/v1/branches", this.getAuthHeaders());
        if (response.data.success) {
          this.branches = response.data.data;
        }
      } catch (error) {
        console.error("Error loading branches:", error);
      }
    },
    async loadSellers() {
      try {
        const response = await axios.get("/api/v1/users", this.getAuthHeaders());

        if (response.data.success) {
          // Handle nested paginated response: {success, data: {data: [...], pagination: ...}}
          const responseData = response.data.data;
          let allUsers = [];

          if (Array.isArray(responseData)) {
            allUsers = responseData;
          } else if (responseData && Array.isArray(responseData.data)) {
            // Nested structure from user controller
            allUsers = responseData.data;
          } else if (responseData && responseData.users) {
            allUsers = responseData.users;
          } else if (responseData && responseData.rows) {
            allUsers = responseData.rows;
          }

          // Filter only active users with vendor/seller role
          this.sellers = allUsers.filter(user => {
            // First check if user is active
            if (user.is_active === false) return false;

            // Check if user has vendor/seller role
            if (user.roles && Array.isArray(user.roles)) {
              return user.roles.some(role =>
                role.name?.toLowerCase().includes('vendedor') ||
                role.name?.toLowerCase().includes('seller') ||
                role.name?.toLowerCase().includes('sales')
              );
            }

            // Check role_name field
            if (user.role_name) {
              return user.role_name.toLowerCase().includes('vendedor') ||
                     user.role_name.toLowerCase().includes('seller') ||
                     user.role_name.toLowerCase().includes('sales');
            }

            // If no role info, include all active users
            return true;
          });

          console.log("✓ Vendedores cargados:", this.sellers.length);
        }
      } catch (error) {
        console.error("❌ Error loading sellers:", error);
      }
    },
    async loadCustomers() {
      try {
        const response = await axios.get("/api/v1/customers", this.getAuthHeaders());
        if (response.data.success) {
          this.customers = response.data.data;
          this.filteredCustomers = this.customers;
        }
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    },
    searchCustomers() {
      if (!this.customerSearch) {
        this.filteredCustomers = this.customers;
        return;
      }

      const search = this.customerSearch.toLowerCase();
      this.filteredCustomers = this.customers.filter(
        (customer) =>
          (customer.nombre && customer.nombre.toLowerCase().includes(search)) ||
          (customer.name && customer.name.toLowerCase().includes(search)) ||
          (customer.codigo && customer.codigo.toLowerCase().includes(search)) ||
          (customer.code && customer.code.toLowerCase().includes(search)) ||
          (customer.doc_identificacion && customer.doc_identificacion.toLowerCase().includes(search)) ||
          (customer.rtn && customer.rtn.toLowerCase().includes(search))
      );
    },
    selectCustomer(customer) {
      this.selectedCustomer = customer;
      this.filters.customer_id = customer.id;
      this.showCustomerModal = false;
    },
    clearCustomer() {
      this.selectedCustomer = null;
      this.filters.customer_id = "";
    },
    filterCategories() {
      if (!this.categorySearch) {
        this.filteredCategories = this.categories;
        return;
      }
      const search = this.categorySearch.toLowerCase();
      this.filteredCategories = this.categories.filter(cat =>
        (cat.name && cat.name.toLowerCase().includes(search)) ||
        (cat.nombre && cat.nombre.toLowerCase().includes(search))
      );
    },
    selectCategory(category) {
      this.selectedCategory = category;
      this.filters.category_id = category.id;
      this.showCategorySearch = false;

      // Filtrar subcategorías por esta categoría
      this.filteredSubcategories = this.subcategories.filter(sub =>
        sub.category_id === category.id || sub.categoria_id === category.id
      );

      // Limpiar subcategoría y producto seleccionados
      this.selectedSubcategory = null;
      this.filters.subcategory_id = "";
      this.selectedProduct = null;
      this.filters.product_id = "";

      // Filtrar productos por esta categoría
      this.filterProductsByFilters();
    },
    clearCategory() {
      this.selectedCategory = null;
      this.filters.category_id = "";

      // Restaurar todas las subcategorías
      this.filteredSubcategories = this.subcategories;

      // Limpiar subcategoría y producto
      this.selectedSubcategory = null;
      this.filters.subcategory_id = "";
      this.selectedProduct = null;
      this.filters.product_id = "";

      // Restaurar todos los productos
      this.filteredProducts = this.products;
    },
    filterSubcategories() {
      // Primero filtrar por categoría si existe
      let baseSubcategories = this.subcategories;
      if (this.filters.category_id) {
        baseSubcategories = this.subcategories.filter(sub =>
          sub.category_id === this.filters.category_id || sub.categoria_id === this.filters.category_id
        );
      }

      // Luego aplicar búsqueda por término
      if (!this.subcategorySearch) {
        this.filteredSubcategories = baseSubcategories;
        return;
      }

      const search = this.subcategorySearch.toLowerCase();
      this.filteredSubcategories = baseSubcategories.filter(sub =>
        (sub.name && sub.name.toLowerCase().includes(search)) ||
        (sub.nombre && sub.nombre.toLowerCase().includes(search))
      );
    },
    selectSubcategory(subcategory) {
      this.selectedSubcategory = subcategory;
      this.filters.subcategory_id = subcategory.id;
      this.showSubcategorySearch = false;

      // Limpiar producto seleccionado
      this.selectedProduct = null;
      this.filters.product_id = "";

      // Filtrar productos por categoría y subcategoría
      this.filterProductsByFilters();
    },
    clearSubcategory() {
      this.selectedSubcategory = null;
      this.filters.subcategory_id = "";

      // Limpiar producto
      this.selectedProduct = null;
      this.filters.product_id = "";

      // Filtrar productos solo por categoría si existe
      this.filterProductsByFilters();
    },
    filterProductsByFilters() {
      // Filtrar productos según categoría y subcategoría seleccionadas
      let baseProducts = Array.isArray(this.products) ? this.products : [];

      const categoryId = this.filters.category_id ? parseInt(this.filters.category_id) : null;
      const subcategoryId = this.filters.subcategory_id ? parseInt(this.filters.subcategory_id) : null;

      if (categoryId) {
        baseProducts = baseProducts.filter(prod => {
          const prodCategoryId = prod.category_id || prod.categoria_id;
          return prodCategoryId === categoryId;
        });

        if (subcategoryId) {
          baseProducts = baseProducts.filter(prod => {
            const prodSubcategoryId = prod.subcategory_id || prod.subcategoria_id;
            return prodSubcategoryId === subcategoryId;
          });
        }
      }

      this.filteredProducts = baseProducts;
    },
    filterProducts() {
      // Primero obtener productos base según categoría/subcategoría
      let baseProducts = Array.isArray(this.products) ? this.products : [];

      const categoryId = this.filters.category_id ? parseInt(this.filters.category_id) : null;
      const subcategoryId = this.filters.subcategory_id ? parseInt(this.filters.subcategory_id) : null;

      if (categoryId) {
        baseProducts = baseProducts.filter(prod => {
          const prodCategoryId = prod.category_id || prod.categoria_id;
          return prodCategoryId === categoryId;
        });

        if (subcategoryId) {
          baseProducts = baseProducts.filter(prod => {
            const prodSubcategoryId = prod.subcategory_id || prod.subcategoria_id;
            return prodSubcategoryId === subcategoryId;
          });
        }
      }

      // Luego aplicar búsqueda por término
      if (!this.productSearch) {
        this.filteredProducts = baseProducts;
        return;
      }

      const search = this.productSearch.toLowerCase();
      this.filteredProducts = baseProducts.filter(prod =>
        (prod.name && prod.name.toLowerCase().includes(search)) ||
        (prod.nombre && prod.nombre.toLowerCase().includes(search)) ||
        (prod.code && prod.code.toLowerCase().includes(search)) ||
        (prod.codigo && prod.codigo.toLowerCase().includes(search))
      );
    },
    selectProduct(product) {
      this.selectedProduct = product;
      this.filters.product_id = product.id;
      this.showProductSearch = false;
    },
    clearProduct() {
      this.selectedProduct = null;
      this.filters.product_id = "";
    },
    async getCompanyLogo() {
      if (!this.companyInfo?.logo_url) {
        return '';
      }

      const dbLogoUrl = this.companyInfo.logo_url;
      if (!dbLogoUrl.startsWith('http')) {
        return '';
      }

      try {
        const response = await api.get('/image-proxy', { params: { url: dbLogoUrl } });
        if (response.data.success && response.data.data.base64) {
          return response.data.data.base64;
        }
      } catch (error) {
        console.error('Error al cargar logo:', error);
      }

      return '';
    },
    async loadCompanyInfo() {
      try {
        const response = await api.get('/companies/default');
        if (response.data && response.data.success) {
          this.companyInfo = response.data.data;
        }
      } catch (error) {
        console.error('Error loading company info:', error);
        // Fallback: intentar con endpoint público
        try {
          const publicResponse = await api.get('/companies/public/default');
          if (publicResponse.data && publicResponse.data.success) {
            this.companyInfo = publicResponse.data.data;
          }
        } catch (publicError) {
          console.error('Error loading public company info:', publicError);
          this.companyInfo = {
            company_name: 'ProsperPOS',
            commercial_name: 'ProsperPOS',
            direccion: 'Honduras',
            address: 'Honduras',
            telefono: 'N/A',
            phone: 'N/A',
            rtn: 'N/A',
            email: 'info@prosperpos.com'
          };
        }
      }
    },
    async buildSoldItemsHTML() {
      // Obtener logo desde la base de datos
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

      // Generar HTML de tabla de productos vendidos
      const itemRows = this.soldItems.map(item => {
        let row = `
          <tr>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${item.codigo || ''}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${item.producto}</td>`;

        if (this.filters.include_categories) {
          row += `<td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${item.categoria || '-'}</td>`;
        }
        if (this.filters.include_subcategories) {
          row += `<td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${item.subcategoria || '-'}</td>`;
        }
        if (this.filters.include_brands) {
          row += `<td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${item.marca || '-'}</td>`;
        }

        row += `
            <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">${parseFloat(item.cantidad).toFixed(2)}</td>
            <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">L ${this.formatCurrency(item.precio)}</td>`;

        if (this.filters.show_costs) {
          row += `<td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">L ${this.formatCurrency(item.costo)}</td>`;
        }

        row += `
            <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">L ${this.formatCurrency(item.total_neto)}</td>
            <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">L ${this.formatCurrency(item.impuesto)}</td>
            <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">L ${this.formatCurrency(item.total_final)}</td>`;

        if (this.filters.show_costs) {
          row += `<td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">L ${this.formatCurrency(item.total_costo)}</td>`;
        }
        if (this.filters.show_utility) {
          row += `<td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">L ${this.formatCurrency(item.utilidad)}</td>`;
        }

        row += `</tr>`;
        return row;
      }).join('');

      // Construir encabezados
      let headers = `
        <th style="padding: 8px; font-size: 9px;">Código</th>
        <th style="padding: 8px; font-size: 9px;">Producto</th>`;

      if (this.filters.include_categories) headers += `<th style="padding: 8px; font-size: 9px;">Categoría</th>`;
      if (this.filters.include_subcategories) headers += `<th style="padding: 8px; font-size: 9px;">Subcategoría</th>`;
      if (this.filters.include_brands) headers += `<th style="padding: 8px; font-size: 9px;">Marca</th>`;

      headers += `
        <th style="padding: 8px; font-size: 9px; text-align: right;">Cantidad</th>
        <th style="padding: 8px; font-size: 9px; text-align: right;">Precio</th>`;

      if (this.filters.show_costs) headers += `<th style="padding: 8px; font-size: 9px; text-align: right;">Costo Unit.</th>`;

      headers += `
        <th style="padding: 8px; font-size: 9px; text-align: right;">Total Neto</th>
        <th style="padding: 8px; font-size: 9px; text-align: right;">Impuesto</th>
        <th style="padding: 8px; font-size: 9px; text-align: right;">Total Final</th>`;

      if (this.filters.show_costs) headers += `<th style="padding: 8px; font-size: 9px; text-align: right;">Costo Total</th>`;
      if (this.filters.show_utility) headers += `<th style="padding: 8px; font-size: 9px; text-align: right;">Utilidad</th>`;

      // Construir footer
      let totalColspan = 2;
      if (this.filters.include_categories) totalColspan++;
      if (this.filters.include_subcategories) totalColspan++;
      if (this.filters.include_brands) totalColspan++;

      let footerCells = `
        <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 9px;">${this.totals.total_cantidad.toFixed(2)}</td>
        <td style="padding: 8px; font-size: 9px;"></td>`;

      if (this.filters.show_costs) footerCells += `<td style="padding: 8px; font-size: 9px;"></td>`;

      footerCells += `
        <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 9px;">L ${this.formatCurrency(this.totals.total_neto)}</td>
        <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 9px;">L ${this.formatCurrency(this.totals.total_impuesto)}</td>
        <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 9px;">L ${this.formatCurrency(this.totals.total_final)}</td>`;

      if (this.filters.show_costs) footerCells += `<td style="padding: 8px; text-align: right; font-weight: bold; font-size: 9px;">L ${this.formatCurrency(this.totals.total_costo)}</td>`;
      if (this.filters.show_utility) footerCells += `<td style="padding: 8px; text-align: right; font-weight: bold; font-size: 9px;">L ${this.formatCurrency(this.totals.total_utilidad)}</td>`;

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
              width: 1000px;
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
            .company-info img {
              max-width: 180px;
              height: auto;
              margin-bottom: 8px;
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
              font-size: 8px;
            }
            thead {
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: white;
            }
            th {
              padding: 6px 3px;
              text-align: left;
              border: 1px solid #ddd;
              font-size: 8px;
            }
            td {
              padding: 4px 3px;
              border: 1px solid #ddd;
              font-size: 8px;
            }
            .text-right {
              text-align: right;
            }
            tfoot {
              background: #f3f4f6;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-weight: bold;
            }
            tfoot td {
              padding: 6px 3px;
              font-size: 8px;
            }

            @media print {
              body {
                padding: 10px;
              }
              .report-box,
              thead {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: linear-gradient(135deg, #f97316 0%, #fb923c 100%) !important;
                color: white !important;
              }
              @page {
                size: landscape;
                margin: 15mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="company-info">
              ${hasLogo ? `<img src="${logoUrl}" style="max-width: 180px; height: auto; margin-bottom: 8px;" alt="Logo">` : ''}
              <div class="company-details">
                <strong>${this.companyInfo.commercial_name || this.companyInfo.company_name || 'EMPRESA'}</strong><br>
                <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'}<br>
                <strong>Tel:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'}${this.companyInfo.whatsapp ? ` | <strong>Móvil:</strong> ${this.companyInfo.whatsapp}` : ''}<br>
                <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}
              </div>
            </div>
            <div class="report-box">
              <div class="report-title">PRODUCTOS VENDIDOS</div>
              <div class="report-details">
                <strong>Desde:</strong> ${this.filters.date_from}<br>
                <strong>Hasta:</strong> ${this.filters.date_to}<br>
                <strong>Productos:</strong> ${this.soldItems.length}
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
            <tfoot>
              <tr>
                <td colspan="${totalColspan}" style="text-align: right; font-weight: bold;">TOTALES:</td>
                ${footerCells}
              </tr>
            </tfoot>
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
          [this.companyInfo.company_name || 'PROSPERPOS'],
          [this.companyInfo.direccion || 'Sin dirección'],
          [`Tel: ${this.companyInfo.telefono || 'N/A'}`],
          [''],
          ['PRODUCTOS VENDIDOS'],
          [`Desde: ${this.filters.date_from} | Hasta: ${this.filters.date_to}`],
          [''],
          [''],
        ];

        const ws = XLSX.utils.aoa_to_sheet(headerData);

        const data = this.soldItems.map(item => {
          const row = {
            'Código': item.codigo || '',
            'Producto': item.producto
          };

          if (this.filters.include_categories) row['Categoría'] = item.categoria || '-';
          if (this.filters.include_subcategories) row['Subcategoría'] = item.subcategoria || '-';
          if (this.filters.include_brands) row['Marca'] = item.marca || '-';

          row['Cantidad'] = parseFloat(item.cantidad || 0);
          row['Precio'] = parseFloat(item.precio || 0);

          if (this.filters.show_costs) row['Costo Unit.'] = parseFloat(item.costo || 0);

          row['Total Neto'] = parseFloat(item.total_neto || 0);
          row['Impuesto'] = parseFloat(item.impuesto || 0);
          row['Total Final'] = parseFloat(item.total_final || 0);

          if (this.filters.show_costs) row['Costo Total'] = parseFloat(item.total_costo || 0);
          if (this.filters.show_utility) row['Utilidad'] = parseFloat(item.utilidad || 0);

          return row;
        });

        // Agregar totales
        const totalsRow = { 'Código': '', 'Producto': 'TOTALES' };
        if (this.filters.include_categories) totalsRow['Categoría'] = '';
        if (this.filters.include_subcategories) totalsRow['Subcategoría'] = '';
        if (this.filters.include_brands) totalsRow['Marca'] = '';
        totalsRow['Cantidad'] = this.totals.total_cantidad;
        totalsRow['Precio'] = '';
        if (this.filters.show_costs) totalsRow['Costo Unit.'] = '';
        totalsRow['Total Neto'] = this.totals.total_neto;
        totalsRow['Impuesto'] = this.totals.total_impuesto;
        totalsRow['Total Final'] = this.totals.total_final;
        if (this.filters.show_costs) totalsRow['Costo Total'] = this.totals.total_costo;
        if (this.filters.show_utility) totalsRow['Utilidad'] = this.totals.total_utilidad;

        data.push(totalsRow);

        XLSX.utils.sheet_add_json(ws, data, { origin: 'A9', skipHeader: false });
        XLSX.utils.book_append_sheet(wb, ws, 'Productos Vendidos');

        const fileName = `productos-vendidos-${this.filters.date_from}-${this.filters.date_to}.xlsx`;
        XLSX.writeFile(wb, fileName);
      } catch (error) {
        console.error('Error al guardar Excel:', error);
        alert('Error al generar el archivo Excel');
      }
    },
    async saveAsPDF() {
      this.showSaveReportModal = false;
      try {
        const fileName = `productos-vendidos-${this.filters.date_from}-${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '1000px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildSoldItemsHTML();
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
        alert('Error al generar el archivo PDF');
      }
    },
    async saveAsImage() {
      this.showSaveReportModal = false;
      try {
        const fileName = `productos-vendidos-${this.filters.date_from}-${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '1000px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = await this.buildSoldItemsHTML();
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
        alert('Error al generar la imagen');
      }
    },
    async printReport() {
      this.showSaveReportModal = false;
      const printWindow = window.open('', '_blank');
      const html = await this.buildSoldItemsHTML();

      const printHtml = html.replace('</body>', `
        <script>
          window.onload = function() {
            const images = document.getElementsByTagName('img');
            if (images.length > 0) {
              let loaded = 0;
              const total = images.length;

              function checkLoaded() {
                loaded++;
                if (loaded === total) {
                  setTimeout(function() { window.print(); }, 300);
                }
              }

              for (let i = 0; i < images.length; i++) {
                if (images[i].complete) { checkLoaded(); }
                else {
                  images[i].onload = checkLoaded;
                  images[i].onerror = checkLoaded;
                }
              }
            } else { window.print(); }
          };
        </scr` + `ipt>
        </body>
      `);

      printWindow.document.write(printHtml);
      printWindow.document.close();
    },
    formatCurrency(value) {
      if (!value) return "0.00";
      return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    },
  },
};
</script>

<style scoped>
.summary-label-md {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.summary-value-md {
  font-size: 1.5rem;
  font-weight: 600;
}

.sale-icon-md {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 24px;
}

.border-purple {
  border-color: #6f42c1 !important;
}

.bg-purple {
  background-color: #6f42c1 !important;
}

.sale-widget {
  transition: all 0.3s ease;
}

.sale-widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
