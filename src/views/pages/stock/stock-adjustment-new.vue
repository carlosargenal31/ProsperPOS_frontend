<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Ajuste de Inventario</h4>
            <h6>Realizar ajustes de inventario físico</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadData">
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Collapse" @click="toggleHeader">
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
      </div>

      <!-- Formulario Principal -->
      <div class="card">
        <div class="card-body">
          <form @submit.prevent="saveAdjustment">
            <!-- Fila 1: Consecutivo, Fecha, Emisor -->
            <div class="row mb-3">
              <div class="col-lg-4 col-md-6">
                <label class="form-label">Consecutivo</label>
                <input
                  type="text"
                  class="form-control bg-light"
                  v-model="adjustment.consecutive"
                  readonly
                />
              </div>
              <div class="col-lg-4 col-md-6">
                <label class="form-label">Fecha de Emisión <span class="text-danger">*</span></label>
                <input
                  type="date"
                  class="form-control"
                  v-model="adjustment.issue_date"
                  required
                />
              </div>
              <div class="col-lg-4 col-md-6">
                <label class="form-label">Emisor <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="adjustment.issuer"
                  placeholder="Nombre del emisor"
                  required
                />
              </div>
            </div>

            <!-- Fila 2: Bodega -->
            <div class="row mb-3">
              <div class="col-lg-6 col-md-6">
                <label class="form-label">Bodega <span class="text-danger">*</span></label>
                <select class="form-select" v-model="adjustment.warehouse_id" required @change="onWarehouseChange">
                  <option value="">Seleccione una bodega</option>
                  <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                    {{ warehouse.nombre }}
                  </option>
                </select>
              </div>
              <div class="col-lg-6 col-md-6">
                <label class="form-label">Concepto</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="adjustment.concept"
                  placeholder="Concepto o motivo del ajuste"
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Filtros de Búsqueda -->
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">
            <i class="ti ti-filter me-2"></i>Filtros de Búsqueda
          </h5>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-lg-3 col-md-6">
              <label class="form-label">Código de Producto</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  v-model="filters.product_code"
                  placeholder="Buscar por código"
                />
                <button class="btn btn-primary" type="button" @click="searchInventory">
                  <i class="ti ti-search"></i>
                </button>
              </div>
            </div>
            <div class="col-lg-3 col-md-6">
              <label class="form-label">Nombre de Producto</label>
              <input
                type="text"
                class="form-control"
                v-model="filters.product_name"
                placeholder="Buscar por nombre"
              />
            </div>
            <div class="col-lg-2 col-md-4">
              <label class="form-label">Categoría</label>
              <select class="form-select" v-model="filters.category_id">
                <option value="">Todos</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="col-lg-2 col-md-4">
              <label class="form-label">Subcategoría</label>
              <select class="form-select" v-model="filters.subcategory_id">
                <option value="">Todos</option>
                <option v-for="subcat in subcategories" :key="subcat.id" :value="subcat.id">
                  {{ subcat.name }}
                </option>
              </select>
            </div>
            <div class="col-lg-2 col-md-4">
              <label class="form-label">Filtrar por</label>
              <select class="form-select" v-model="filters.existence_filter">
                <option value="all">Código</option>
                <option value="with_stock">Con Existencias</option>
                <option value="without_stock">Sin Existencias</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-primary" @click="searchInventory" :disabled="!adjustment.warehouse_id || loading">
                  <i class="ti ti-search me-1"></i>
                  {{ loading ? 'Buscando...' : 'Buscar' }}
                </button>
                <button type="button" class="btn btn-secondary" @click="clearFilters">
                  <i class="ti ti-x me-1"></i>
                  Limpiar
                </button>
                <button
                  type="button"
                  class="btn btn-danger ms-auto"
                  @click="setAllToZero"
                  :disabled="inventoryItems.length === 0"
                >
                  <i class="ti ti-circle-off me-1"></i>
                  Llevar a cero las existencias de los productos mostrados en pantalla
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Inventario -->
      <div class="card" v-if="inventoryItems.length > 0">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-bordered table-hover table-sm">
              <thead class="table-light">
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Bodega</th>
                  <th>Exist. Teórica</th>
                  <th>Exist. Física</th>
                  <th>Exist. Nueva</th>
                  <th>Diferencia</th>
                  <th>Costo Unit</th>
                  <th>Costo Anterior</th>
                  <th>Costo Actual</th>
                  <th>Costo Nuevo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in inventoryItems" :key="index">
                  <td>{{ item.codigo }}</td>
                  <td>{{ item.producto }}</td>
                  <td>{{ item.bodega }}</td>
                  <td class="text-end">{{ item.exist_teorica }}</td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      class="form-control form-control-sm text-end"
                      v-model.number="item.exist_fisica"
                      @input="calculateRow(item)"
                    />
                  </td>
                  <td class="text-end">{{ parseFloat(item.exist_nueva || 0).toFixed(2) }}</td>
                  <td class="text-end" :class="getDifferenceClass(item.diferencia)">
                    {{ parseFloat(item.diferencia || 0).toFixed(2) }}
                  </td>
                  <td class="text-end">L {{ formatCurrency(item.costo_unit) }}</td>
                  <td class="text-end">L {{ formatCurrency(item.costo_anterior) }}</td>
                  <td class="text-end">L {{ formatCurrency(item.costo_actual) }}</td>
                  <td class="text-end">L {{ formatCurrency(item.costo_nuevo) }}</td>
                </tr>
              </tbody>
              <tfoot class="table-secondary fw-bold">
                <tr>
                  <td colspan="7">TOTALES</td>
                  <td class="text-end"></td>
                  <td class="text-end">L {{ formatCurrency(totals.costo_anterior) }}</td>
                  <td class="text-end">L {{ formatCurrency(totals.costo_actual) }}</td>
                  <td class="text-end">L {{ formatCurrency(totals.costo_nuevo) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="row mt-3">
            <div class="col-12">
              <div class="d-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-success" @click="saveAdjustment" :disabled="saving || inventoryItems.length === 0">
                  <i class="ti ti-device-floppy me-1"></i>
                  {{ saving ? 'Guardando...' : 'Guardar Ajuste' }}
                </button>
                <button type="button" class="btn btn-warning" @click="exportToExcel" :disabled="inventoryItems.length === 0">
                  <i class="ti ti-file-spreadsheet me-1"></i>
                  Exportar a 1 Sub Hoja
                </button>
                <button type="button" class="btn btn-secondary" @click="cancel">
                  <i class="ti ti-x me-1"></i>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin Datos -->
      <div class="card" v-else-if="!loading && adjustment.warehouse_id">
        <div class="card-body text-center py-5">
          <i class="ti ti-inbox" style="font-size: 64px; color: #ccc;"></i>
          <p class="mt-3 text-muted">No hay productos para mostrar. Realice una búsqueda con los filtros.</p>
        </div>
      </div>

      <!-- Mensaje inicial -->
      <div class="card" v-else-if="!adjustment.warehouse_id">
        <div class="card-body text-center py-5">
          <i class="ti ti-warehouse" style="font-size: 64px; color: #ccc;"></i>
          <p class="mt-3 text-muted">Por favor seleccione una bodega para comenzar.</p>
        </div>
      </div>

      <!-- Loading -->
      <div class="card" v-if="loading">
        <div class="card-body text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-3">Cargando inventario...</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import api from "@/utils/axios";

export default {
  name: 'StockAdjustmentNew',
  data() {
    return {
      loading: false,
      saving: false,
      adjustment: {
        consecutive: '',
        issue_date: new Date().toISOString().split('T')[0],
        issuer: '',
        warehouse_id: '',
        concept: ''
      },
      filters: {
        product_code: '',
        product_name: '',
        category_id: '',
        subcategory_id: '',
        existence_filter: 'all'
      },
      inventoryItems: [],
      warehouses: [],
      categories: [],
      subcategories: []
    }
  },
  computed: {
    totals() {
      return this.inventoryItems.reduce((acc, item) => {
        acc.costo_anterior += parseFloat(item.costo_anterior || 0);
        acc.costo_actual += parseFloat(item.costo_actual || 0);
        acc.costo_nuevo += parseFloat(item.costo_nuevo || 0);
        return acc;
      }, { costo_anterior: 0, costo_actual: 0, costo_nuevo: 0 });
    }
  },
  mounted() {
    this.loadCatalogs();
    this.loadNextConsecutive();
  },
  methods: {
    async loadCatalogs() {
      try {
        const [warehousesRes, categoriesRes, subcategoriesRes] = await Promise.all([
          api.get('/warehouses'),
          api.get('/categories'),
          api.get('/subcategories')
        ]);

        if (warehousesRes.data.success) {
          this.warehouses = warehousesRes.data.data || [];
        }
        if (categoriesRes.data.success) {
          this.categories = categoriesRes.data.data || [];
        }
        if (subcategoriesRes.data.success) {
          this.subcategories = subcategoriesRes.data.data || [];
        }
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los catálogos'
        });
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
    async searchInventory() {
      if (!this.adjustment.warehouse_id) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'Debe seleccionar un almacén primero'
        });
        return;
      }

      this.loading = true;
      try {
        const params = new URLSearchParams({
          warehouse_id: this.adjustment.warehouse_id,
          ...this.filters
        });

        const response = await api.get(`/inventory-adjustments/inventory?${params.toString()}`);

        if (response.data.success) {
          this.inventoryItems = response.data.data.map(item => ({
            ...item,
            exist_fisica: 0,
            exist_nueva: item.exist_teorica,
            diferencia: 0,
            costo_anterior: item.costo_unit * item.exist_teorica,
            costo_actual: 0,
            costo_nuevo: item.costo_unit * item.exist_teorica
          }));
        }
      } catch (error) {
        console.error('Error al buscar inventario:', error);
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el inventario'
        });
      } finally {
        this.loading = false;
      }
    },
    calculateRow(item) {
      const fisica = parseFloat(item.exist_fisica) || 0;
      const teorica = parseFloat(item.exist_teorica) || 0;
      const costoUnit = parseFloat(item.costo_unit) || 0;

      item.exist_nueva = fisica;
      item.diferencia = fisica - teorica;
      item.costo_actual = costoUnit * fisica;
      item.costo_nuevo = costoUnit * fisica;
    },
    getDifferenceClass(difference) {
      if (difference > 0) return 'text-success fw-bold';
      if (difference < 0) return 'text-danger fw-bold';
      return '';
    },
    setAllToZero() {
      this.$swal.fire({
        title: '¿Está seguro?',
        text: 'Esto llevará a cero todas las existencias físicas mostradas en pantalla',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.inventoryItems.forEach(item => {
            item.exist_fisica = 0;
            this.calculateRow(item);
          });
        }
      });
    },
    async saveAdjustment() {
      if (!this.adjustment.warehouse_id) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'Debe seleccionar un almacén'
        });
        return;
      }

      if (!this.adjustment.issuer) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'Debe ingresar el nombre del emisor'
        });
        return;
      }

      if (this.inventoryItems.length === 0) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'Debe buscar artículos para ajustar'
        });
        return;
      }

      // Filtrar solo items con cambios
      const itemsWithChanges = this.inventoryItems.filter(item => item.diferencia !== 0);

      if (itemsWithChanges.length === 0) {
        this.$swal.fire({
          icon: 'info',
          title: 'Sin Cambios',
          text: 'No hay artículos con diferencias para ajustar'
        });
        return;
      }

      this.saving = true;
      try {
        const data = {
          ...this.adjustment,
          items: itemsWithChanges.map(item => ({
            product_id: item.id,
            exist_teorica: item.exist_teorica,
            exist_fisica: item.exist_fisica,
            exist_nueva: item.exist_nueva,
            diferencia: item.diferencia,
            costo_unit: item.costo_unit,
            costo_anterior: item.costo_anterior,
            costo_actual: item.costo_actual,
            costo_nuevo: item.costo_nuevo
          }))
        };

        const response = await api.post('/inventory-adjustments', data);

        if (response.data.success) {
          this.$swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Ajuste de inventario guardado correctamente',
            showCancelButton: true,
            confirmButtonText: 'Aplicar al Inventario',
            cancelButtonText: 'Solo Guardar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.applyAdjustment(response.data.data.id);
            } else {
              this.$router.push('/stock/stock-adjustment');
            }
          });
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
    async applyAdjustment(adjustmentId) {
      try {
        const response = await api.post(`/inventory-adjustments/${adjustmentId}/apply`);

        if (response.data.success) {
          this.$swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Ajuste aplicado al inventario correctamente'
          });
          this.$router.push('/stock/stock-adjustment');
        }
      } catch (error) {
        console.error('Error al aplicar ajuste:', error);
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo aplicar el ajuste al inventario'
        });
      }
    },
    exportToExcel() {
      // TODO: Implementar exportación a Excel
      this.$swal.fire({
        icon: 'info',
        title: 'Próximamente',
        text: 'La exportación a Excel estará disponible pronto'
      });
    },
    clearFilters() {
      this.filters = {
        product_code: '',
        product_name: '',
        category_id: '',
        subcategory_id: '',
        existence_filter: 'all'
      };
      this.inventoryItems = [];
    },
    onWarehouseChange() {
      this.inventoryItems = [];
    },
    cancel() {
      this.$router.push('/stock/stock-adjustment');
    },
    loadData() {
      this.loadCatalogs();
      this.loadNextConsecutive();
    },
    toggleHeader() {
      const header = document.querySelector('.page-header');
      if (header) {
        header.classList.toggle('collapsed');
      }
    },
    formatCurrency(value) {
      if (!value) return '0.00';
      return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
}
</script>

<style scoped>
.table-sm th,
.table-sm td {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.form-control-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

@media print {
  .page-header,
  .card-header,
  button,
  .table-top-head {
    display: none !important;
  }
}
</style>
