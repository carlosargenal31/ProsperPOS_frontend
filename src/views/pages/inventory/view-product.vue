<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4 class="fw-bold">Ver Producto</h4>
            <h6>Información detallada del producto</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a
              href="javascript:void(0);"
              @click="refreshData"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Refrescar"
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
        <div class="page-btn d-flex gap-2">
          <router-link to="/inventory/product-list" class="btn btn-secondary">
            <i class="ti ti-arrow-left me-2"></i>Volver a Productos
          </router-link>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div v-else class="card">
        <div class="card-body">
          <!-- Tabs Navigation -->
          <ul class="nav nav-tabs nav-tabs-bottom nav-justified mb-4" role="tablist">
            <li class="nav-item" role="presentation">
              <a
                class="nav-link active"
                id="tab-general"
                data-bs-toggle="tab"
                href="#general"
                role="tab"
                aria-controls="general"
                aria-selected="true"
              >
                <i class="ti ti-info-circle me-2"></i>Datos Generales
              </a>
            </li>
            <li class="nav-item" role="presentation">
              <a
                class="nav-link"
                id="tab-existencias"
                data-bs-toggle="tab"
                href="#existencias"
                role="tab"
                aria-controls="existencias"
                aria-selected="false"
              >
                <i class="ti ti-package me-2"></i>Existencias
              </a>
            </li>
            <li class="nav-item" role="presentation">
              <a
                class="nav-link"
                id="tab-precios"
                data-bs-toggle="tab"
                href="#precios"
                role="tab"
                aria-controls="precios"
                aria-selected="false"
              >
                <i class="ti ti-currency-dollar me-2"></i>Precios
              </a>
            </li>
            <li class="nav-item" role="presentation">
              <a
                class="nav-link"
                id="tab-impuestos"
                data-bs-toggle="tab"
                href="#impuestos"
                role="tab"
                aria-controls="impuestos"
                aria-selected="false"
              >
                <i class="ti ti-receipt-tax me-2"></i>Impuestos
              </a>
            </li>
            <li class="nav-item" role="presentation">
              <a
                class="nav-link"
                id="tab-imagenes"
                data-bs-toggle="tab"
                href="#imagenes"
                role="tab"
                aria-controls="imagenes"
                aria-selected="false"
              >
                <i class="ti ti-photo me-2"></i>Imágenes
              </a>
            </li>
          </ul>

          <!-- Tabs Content -->
          <div class="tab-content">
            <!-- TAB 1: DATOS GENERALES -->
            <div class="tab-pane fade show active" id="general" role="tabpanel" aria-labelledby="tab-general">
              <div class="row">
                <!-- Código -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Código</label>
                    <input
                      type="text"
                      class="form-control bg-light"
                      v-model="productData.code"
                      readonly
                    >
                  </div>
                </div>

                <!-- Unidad -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Unidad</label>
                    <input
                      type="text"
                      class="form-control bg-light"
                      :value="getUnitName(productData.unit_id)"
                      readonly
                    >
                  </div>
                </div>

                <!-- Nombre -->
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Nombre</label>
                    <input
                      type="text"
                      class="form-control bg-light"
                      v-model="productData.name"
                      readonly
                    >
                  </div>
                </div>

                <!-- Nombre Corto -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Nombre Corto</label>
                    <input
                      type="text"
                      class="form-control bg-light"
                      v-model="productData.short_name"
                      readonly
                    >
                  </div>
                </div>

                <!-- Imagen -->
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Imagen Principal</label>
                    <div class="d-flex align-items-center gap-3">
                      <div v-if="productData.currentImageUrl" class="position-relative">
                        <img
                          :src="productData.currentImageUrl"
                          alt="Producto"
                          style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 2px solid #dee2e6;"
                        >
                      </div>
                      <div v-else class="d-flex align-items-center justify-content-center bg-light"
                           style="width: 150px; height: 150px; border-radius: 8px; border: 2px dashed #dee2e6;">
                        <i class="ti ti-photo" style="font-size: 48px; color: #adb5bd;"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Categoría -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Categoría</label>
                    <input
                      type="text"
                      class="form-control bg-light"
                      :value="getCategoryName(productData.category_id)"
                      readonly
                    >
                  </div>
                </div>

                <!-- Subcategoría -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Subcategoría</label>
                    <input
                      type="text"
                      class="form-control bg-light"
                      :value="getSubcategoryName(productData.subcategory_id)"
                      readonly
                    >
                  </div>
                </div>

                <!-- Marca -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Marca</label>
                    <input
                      type="text"
                      class="form-control bg-light"
                      :value="getBrandName(productData.brand_id)"
                      readonly
                    >
                  </div>
                </div>

                <!-- Proveedor -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Proveedor</label>
                    <input
                      type="text"
                      class="form-control bg-light"
                      :value="getSupplierName(productData.supplier_id)"
                      readonly
                    >
                  </div>
                </div>

                <!-- Costo Actual -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Costo Actual</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">L</span>
                      <input
                        type="text"
                        class="form-control bg-light text-end"
                        :value="formatCurrency(productData.cost)"
                        readonly
                      >
                    </div>
                  </div>
                </div>

                <!-- Peso -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Peso (KG)</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control bg-light text-end"
                        :value="formatNumber(productData.weight)"
                        readonly
                      >
                      <span class="input-group-text bg-light">KG</span>
                    </div>
                  </div>
                </div>

                <!-- Mostrar en Tienda en Línea -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Mostrar en Tienda en Línea</label>
                    <div class="form-check form-switch" style="margin-top: 10px;">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="showInOnlineStore"
                        v-model="productData.show_in_online_store"
                        disabled
                      >
                      <label class="form-check-label" for="showInOnlineStore">
                        {{ productData.show_in_online_store ? 'Sí' : 'No' }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Estado: Activo/Inactivo -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Estado del Producto</label>
                    <div class="form-check form-switch" style="margin-top: 10px;">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="isActive"
                        v-model="productData.is_active"
                        disabled
                      >
                      <label class="form-check-label" for="isActive">
                        {{ productData.is_active ? 'Activo' : 'Inactivo' }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Inventario Valorizado (Calculado) -->
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Inventario Valorizado</label>
                    <div class="alert alert-info d-flex align-items-center">
                      <i class="ti ti-calculator me-2"></i>
                      <span>L {{ valuedInventory.toFixed(2) }}</span>
                      <small class="ms-3 text-muted">({{ totalStock.current }} unidades × L {{ productData.cost }})</small>
                    </div>
                  </div>
                </div>

                <!-- Detalles/Descripción -->
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Detalles / Descripción</label>
                    <textarea
                      class="form-control bg-light"
                      rows="4"
                      v-model="productData.description"
                      readonly
                    ></textarea>
                  </div>
                </div>

                <!-- Sección de Atributos del Producto -->
                <div class="col-md-12">
                  <hr class="my-4">
                  <h5 class="mb-3">
                    <i class="ti ti-palette me-2"></i>Atributos del Producto
                  </h5>
                </div>

                <!-- Color -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Color</label>
                    <div class="color-selector d-flex flex-wrap gap-2 mt-2">
                      <div
                        v-for="colorOption in colorOptions"
                        :key="colorOption.value"
                        class="color-option"
                        :class="{ 'selected': productData.color === colorOption.value }"
                        :style="{ backgroundColor: colorOption.hex }"
                        :title="colorOption.label"
                      >
                        <i v-if="productData.color === colorOption.value" class="ti ti-check"></i>
                      </div>
                    </div>
                    <small class="text-muted d-block mt-2" v-if="productData.color">
                      Seleccionado: {{ getColorLabel(productData.color) }}
                    </small>
                  </div>
                </div>

                <!-- Acabado -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Acabado</label>
                    <input
                      type="text"
                      class="form-control bg-light"
                      :value="getAcabadoLabel(productData.acabado)"
                      readonly
                    >
                  </div>
                </div>

                <!-- Estilo (múltiple selección) -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Estilo / Tipología</label>
                    <div class="d-flex flex-wrap gap-2 mt-2">
                      <span
                        v-for="estilo in productData.estilo"
                        :key="estilo"
                        class="badge bg-primary"
                      >
                        {{ getEstiloLabel(estilo) }}
                      </span>
                      <span v-if="!productData.estilo || productData.estilo.length === 0" class="text-muted">
                        Sin estilos asignados
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 2: EXISTENCIAS -->
            <div class="tab-pane fade" id="existencias" role="tabpanel" aria-labelledby="tab-existencias">
              <div class="row">
                <div class="col-md-12">
                  <h5 class="mb-3">Control de Existencias por Bodega</h5>
                  <div class="table-responsive">
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th>Bodega</th>
                          <th width="150" class="text-end">Existencia Actual</th>
                          <th width="150" class="text-end">Mínimo</th>
                          <th width="150" class="text-end">Máximo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="warehouse in warehouses" :key="warehouse.id">
                          <td>
                            <strong>{{ warehouse.nombre }}</strong>
                          </td>
                          <td class="text-end bg-light">
                            {{ formatQuantity(getWarehouseStock(warehouse.id).current) }}
                          </td>
                          <td class="text-end bg-light">
                            {{ formatQuantity(getWarehouseStock(warehouse.id).min) }}
                          </td>
                          <td class="text-end bg-light">
                            {{ formatQuantity(getWarehouseStock(warehouse.id).max) }}
                          </td>
                        </tr>
                        <tr class="table-active fw-bold">
                          <td>TOTAL</td>
                          <td class="text-end">{{ formatQuantity(totalStock.current) }}</td>
                          <td class="text-end">{{ formatQuantity(totalStock.min) }}</td>
                          <td class="text-end">{{ formatQuantity(totalStock.max) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 3: PRECIOS -->
            <div class="tab-pane fade" id="precios" role="tabpanel" aria-labelledby="tab-precios">
              <div class="row">
                <div class="col-md-12">
                  <h5 class="mb-3">Lista de Precios</h5>

                  <div class="table-responsive">
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th>Nivel</th>
                          <th width="150" class="text-end">% Utilidad</th>
                          <th width="150" class="text-end">Bruto</th>
                          <th width="150" class="text-end">Total Venta</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="i in 6" :key="i">
                          <td><strong>PRECIO #{{ i }}</strong></td>
                          <td class="text-end bg-light">
                            {{ formatNumber(productData.prices[i-1].profit_percentage) }}%
                          </td>
                          <td class="text-end bg-light">
                            L {{ formatCurrency(productData.prices[i-1].net) }}
                          </td>
                          <td class="text-end bg-light">
                            L {{ formatCurrency(productData.prices[i-1].total) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 4: IMPUESTOS -->
            <div class="tab-pane fade" id="impuestos" role="tabpanel" aria-labelledby="tab-impuestos">
              <div class="row">
                <div class="col-md-12">
                  <h5 class="mb-3">Configuración de Impuestos</h5>
                  <div class="table-responsive">
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th>Impuesto</th>
                          <th width="100" class="text-end">Tasa (%)</th>
                          <th width="100" class="text-center">Activo</th>
                          <th width="150" class="text-end">Monto (L)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="tax in taxes" :key="tax.id">
                          <td><strong>{{ tax.name }}</strong></td>
                          <td class="text-end bg-light">{{ tax.rate }}%</td>
                          <td class="text-center bg-light">
                            <div class="form-check d-flex justify-content-center">
                              <input
                                class="form-check-input"
                                type="radio"
                                :id="'tax-' + tax.id"
                                :value="tax.id"
                                v-model="productData.activeTaxId"
                                disabled
                              >
                            </div>
                          </td>
                          <td class="text-end bg-light">
                            L {{ productData.activeTaxId === tax.id ? calculateTaxAmountForDisplay(tax) : '0.00' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="alert alert-success mt-3">
                    <strong>Total Impuestos:</strong> L {{ totalTaxAmount.toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 5: IMÁGENES -->
            <div class="tab-pane fade" id="imagenes" role="tabpanel" aria-labelledby="tab-imagenes">
              <div class="row">
                <div class="col-md-12">
                  <h5 class="mb-3">Galería de Imágenes del Producto</h5>

                  <div v-if="productData.gallery.length > 0" class="row">
                    <div
                      v-for="(image, index) in productData.gallery"
                      :key="index"
                      class="col-md-3 col-sm-6 mb-3"
                    >
                      <div class="card">
                        <div class="position-relative">
                          <img
                            :src="image.preview"
                            class="card-img-top"
                            alt="Product Image"
                            style="height: 200px; object-fit: cover;"
                          >
                        </div>
                        <div class="card-body p-2">
                          <small class="text-muted">{{ image.name }}</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="alert alert-info text-center">
                    <i class="ti ti-info-circle me-2"></i>
                    No hay imágenes en la galería.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="card mt-3">
        <div class="card-body">
          <div class="d-flex justify-content-center align-items-center">
            <button
              type="button"
              class="btn btn-secondary"
              @click="$router.push('/inventory/product-list')"
            >
              <i class="ti ti-x me-2"></i>CERRAR
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
      <p class="mb-0 text-gray-9">
        {{ new Date().getFullYear() }} &copy; ProsperPOS. Todos los derechos reservados
      </p>
      <p>
        Diseñado &amp; Desarrollado Por;
        <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a>
      </p>
    </div>
  </div>
</template>

<script>
import api from '@/utils/axios';
import Swal from 'sweetalert2';

export default {
  name: 'ViewProduct',
  data() {
    return {
      productId: null,
      isLoading: true,
      productData: {
        code: '',
        name: '',
        short_name: '',
        unit_id: null,
        currentImageUrl: null,
        category_id: null,
        subcategory_id: null,
        brand_id: null,
        supplier_id: null,
        cost: 0,
        weight: null,
        show_in_online_store: false,
        is_active: true,
        description: '',
        color: '',
        acabado: '',
        estilo: [],
        warehouseStock: {},
        prices: [
          { profit_percentage: 0, net: 0, total: 0 },
          { profit_percentage: 0, net: 0, total: 0 },
          { profit_percentage: 0, net: 0, total: 0 },
          { profit_percentage: 0, net: 0, total: 0 },
          { profit_percentage: 0, net: 0, total: 0 },
          { profit_percentage: 0, net: 0, total: 0 }
        ],
        activeTaxId: null,
        gallery: []
      },

      // Catálogos
      units: [],
      categories: [],
      subcategories: [],
      brands: [],
      suppliers: [],
      warehouses: [],
      taxes: [],

      // Opciones de colores con sus códigos hexadecimales
      colorOptions: [
        { value: 'azul', label: 'Azul', hex: '#2563eb' },
        { value: 'beige', label: 'Beige', hex: '#d4b896' },
        { value: 'blanco', label: 'Blanco', hex: '#ffffff' },
        { value: 'cafe', label: 'Café', hex: '#6b3410' },
        { value: 'gris', label: 'Gris', hex: '#6b7280' },
        { value: 'gris_claro', label: 'Gris Claro', hex: '#d1d5db' },
        { value: 'marron', label: 'Marrón', hex: '#92400e' },
        { value: 'negro', label: 'Negro', hex: '#000000' },
        { value: 'verde', label: 'Verde', hex: '#059669' },
        { value: 'dorado', label: 'Dorado', hex: '#ffd700' }
      ],

      // Opciones para el campo de estilos
      estilosOptions: [
        { value: 'marmoleado', label: 'Marmoleado' },
        { value: 'piedra', label: 'Piedra' },
        { value: 'madera', label: 'Madera' },
        { value: 'geometrico', label: 'Geométrico' }
      ]
    };
  },

  computed: {
    valuedInventory() {
      return (this.totalStock.current || 0) * (this.productData.cost || 0);
    },

    totalStock() {
      const totals = {
        current: 0,
        min: 0,
        max: 0
      };

      Object.values(this.productData.warehouseStock).forEach(stock => {
        totals.current += parseFloat(stock.current || 0);
        totals.min += parseFloat(stock.min || 0);
        totals.max += parseFloat(stock.max || 0);
      });

      return totals;
    },

    totalTaxAmount() {
      if (!this.productData.activeTaxId) return 0;

      const activeTax = this.taxes.find(t => t.id === this.productData.activeTaxId);
      if (!activeTax) return 0;

      const brutoPrice = parseFloat(this.productData.prices[0].net) || 0;
      return (brutoPrice * activeTax.rate) / 100;
    }
  },

  async mounted() {
    this.productId = this.$route.params.id;
    await this.loadCatalogs();
    await this.initializeTaxes();
    await this.loadProductData();
  },

  methods: {
    async loadProductData() {
      if (!this.productId) {
        this.$router.push('/inventory/product-list');
        return;
      }

      try {
        this.isLoading = true;

        const response = await api.get(`/products/${this.productId}`);
        const product = response.data.data;

        // Cargar datos del producto
        this.productData.code = product.code;
        this.productData.name = product.name;
        this.productData.short_name = product.short_name;
        this.productData.category_id = product.category_id;
        this.productData.subcategory_id = product.subcategory_id;
        this.productData.brand_id = product.brand_id;
        this.productData.supplier_id = product.supplier_id;
        this.productData.cost = product.cost;
        this.productData.description = product.description;
        this.productData.weight = product.weight;
        this.productData.unit_id = product.unit_id;
        this.productData.show_in_online_store = product.show_in_online_store || false;
        this.productData.is_active = product.is_active !== undefined ? Boolean(product.is_active) : true;
        this.productData.currentImageUrl = product.image ? `${product.image}?t=${Date.now()}` : null;

        // Cargar nuevos atributos del producto
        this.productData.color = product.color || '';
        this.productData.acabado = product.acabado || '';
        this.productData.estilo = product.estilo ? (Array.isArray(product.estilo) ? product.estilo : JSON.parse(product.estilo || '[]')) : [];

        // Cargar precios
        for (let i = 0; i < 6; i++) {
          this.productData.prices[i].net = product[`price_${i + 1}`] || 0;

          const cost = parseFloat(this.productData.cost) || 0;
          const net = parseFloat(this.productData.prices[i].net) || 0;
          if (cost > 0 && net > 0) {
            this.productData.prices[i].profit_percentage = ((net - cost) / cost) * 100;
          } else {
            this.productData.prices[i].profit_percentage = 0;
          }
        }

        // Cargar impuesto activo
        if (product.tax_id) {
          this.productData.activeTaxId = product.tax_id;
        }

        // Recalcular totales con impuesto
        this.recalculateAllPriceTotals();

        // Cargar subcategorías si hay categoría
        if (product.category_id) {
          await this.loadSubcategories(product.category_id);
        }

        // Cargar existencias por bodega
        await this.loadWarehouseStock();

        // Cargar imágenes de galería
        await this.loadGalleryImages();

        this.isLoading = false;
      } catch (error) {
        console.error('Error loading product:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el producto'
        });
        this.$router.push('/inventory/product-list');
      }
    },

    async loadCatalogs() {
      try {
        const [categoriesRes, brandsRes, suppliersRes, unitsRes, warehousesRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
          api.get('/suppliers'),
          api.get('/units'),
          api.get('/warehouses')
        ]);

        this.categories = categoriesRes.data.data || [];
        this.brands = brandsRes.data.data || [];
        this.suppliers = suppliersRes.data.data || [];
        this.units = unitsRes.data.data || [];
        this.warehouses = warehousesRes.data.data || [];

        this.initializeWarehouseStock();
      } catch (error) {
        console.error('Error loading catalogs:', error);
      }
    },

    async loadSubcategories(categoryId) {
      if (!categoryId) {
        this.subcategories = [];
        return;
      }

      try {
        const res = await api.get(`/subcategories?category_id=${categoryId}`);
        this.subcategories = res.data.data || [];
      } catch (error) {
        console.error('Error loading subcategories:', error);
        this.subcategories = [];
      }
    },

    async loadWarehouseStock() {
      try {
        const res = await api.get(`/products/stock/current?product_id=${this.productId}`);

        let stockData = [];

        if (res.data.data && res.data.data.stock) {
          if (Array.isArray(res.data.data.stock)) {
            stockData = res.data.data.stock;
          } else if (typeof res.data.data.stock === 'object') {
            stockData = Object.values(res.data.data.stock);
          }
        }

        if (Array.isArray(stockData) && stockData.length > 0) {
          stockData.forEach(stock => {
            if (this.productData.warehouseStock[stock.warehouse_id]) {
              this.productData.warehouseStock[stock.warehouse_id].current = stock.quantity || 0;
              this.productData.warehouseStock[stock.warehouse_id].min = stock.min_stock || 0;
              this.productData.warehouseStock[stock.warehouse_id].max = stock.max_stock || 1000;
            }
          });
        }
      } catch (error) {
        console.error('Error loading warehouse stock:', error);
      }
    },

    initializeWarehouseStock() {
      this.warehouses.forEach(warehouse => {
        if (!this.productData.warehouseStock[warehouse.id]) {
          this.productData.warehouseStock[warehouse.id] = {
            current: 0,
            min: 0,
            max: 1000
          };
        }
      });
    },

    async initializeTaxes() {
      try {
        const res = await api.get('/tax-rates');
        this.taxes = res.data.data || [];
      } catch (error) {
        console.error('Error loading taxes:', error);
        this.taxes = [];
      }
    },

    getWarehouseStock(warehouseId) {
      if (!this.productData.warehouseStock[warehouseId]) {
        this.productData.warehouseStock[warehouseId] = {
          current: 0,
          min: 0,
          max: 1000
        };
      }
      return this.productData.warehouseStock[warehouseId];
    },

    calculateTaxAmountForDisplay(tax) {
      const brutoPrice = parseFloat(this.productData.prices[0].net) || 0;
      const amount = (brutoPrice * tax.rate) / 100;
      return amount.toFixed(2);
    },

    recalculateAllPriceTotals() {
      const activeTax = this.taxes.find(t => t.id === this.productData.activeTaxId);
      const taxRate = activeTax ? activeTax.rate : 0;

      this.productData.prices.forEach(price => {
        const net = parseFloat(price.net) || 0;
        price.total = Math.round(net * (1 + taxRate / 100) * 100) / 100;
      });
    },

    async loadGalleryImages() {
      try {
        const response = await api.get(`/products/${this.productId}/gallery`);

        let images = response.data.data || [];

        if (!Array.isArray(images)) {
          images = [];
        }

        this.productData.gallery = images.map(img => ({
          file: null,
          name: img.image_url.split('/').pop(),
          preview: img.image_url,
          existing: true,
          id: img.id
        }));
      } catch (error) {
        console.error('Error loading gallery images:', error);
        this.productData.gallery = [];
      }
    },

    formatQuantity(value) {
      const num = parseFloat(value);
      if (isNaN(num)) return '0.00';
      return num.toFixed(2);
    },

    formatCurrency(value) {
      const num = parseFloat(value);
      if (isNaN(num)) return '0.00';
      return num.toFixed(2);
    },

    formatNumber(value) {
      const num = parseFloat(value);
      if (isNaN(num)) return '0.00';
      return num.toFixed(2);
    },

    getColorLabel(colorValue) {
      const color = this.colorOptions.find(c => c.value === colorValue);
      return color ? color.label : '';
    },

    getAcabadoLabel(acabado) {
      const acabados = {
        'mate': 'Mate',
        'rustico': 'Rústico',
        'brillante': 'Brillante'
      };
      return acabados[acabado] || acabado || 'Sin especificar';
    },

    getEstiloLabel(estilo) {
      const estiloOption = this.estilosOptions.find(e => e.value === estilo);
      return estiloOption ? estiloOption.label : estilo;
    },

    getUnitName(unitId) {
      const unit = this.units.find(u => u.id === unitId);
      return unit ? unit.name : 'N/A';
    },

    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.name : 'N/A';
    },

    getSubcategoryName(subcategoryId) {
      const subcategory = this.subcategories.find(s => s.id === subcategoryId);
      return subcategory ? subcategory.name : 'N/A';
    },

    getBrandName(brandId) {
      const brand = this.brands.find(b => b.id === brandId);
      return brand ? brand.name : 'N/A';
    },

    getSupplierName(supplierId) {
      const supplier = this.suppliers.find(s => s.id === supplierId);
      return supplier ? supplier.nombre : 'N/A';
    },

    async refreshData() {
      await this.loadProductData();
      Swal.fire({
        icon: 'success',
        title: 'Datos actualizados',
        timer: 1500,
        showConfirmButton: false
      });
    },

    toggleHeader() {
      document.getElementById('collapse-header').classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    }
  }
};
</script>

<style scoped>
.nav-tabs-bottom {
  border-bottom: 2px solid #dee2e6;
}

.nav-tabs-bottom .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  font-weight: 500;
  padding: 12px 20px;
}

.nav-tabs-bottom .nav-link:hover {
  border-bottom-color: #dee2e6;
  color: #495057;
}

.nav-tabs-bottom .nav-link.active {
  border-bottom-color: #007bff;
  color: #007bff;
  background-color: transparent;
}

.table-responsive {
  overflow-x: auto;
}

.form-check-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card {
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

/* Estilos para el selector de colores */
.color-selector {
  min-height: 50px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: default;
  border: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-option.selected {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.color-option i {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.color-option[style*="#ffffff"] i {
  color: #000;
  text-shadow: none;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.badge {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}
</style>
