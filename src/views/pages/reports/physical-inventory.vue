<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Lista de Inventario Físico</h4>
            <h6>Reporte detallado de inventario con múltiples opciones de filtrado</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li class="me-2">
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Actualizar"
              @click="loadInventory"
            >
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li class="me-2">
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Imprimir"
              @click="printReport"
            >
              <i class="ti ti-printer"></i>
            </a>
          </li>
          <li class="me-2">
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Collapse"
              id="collapse-header"
              @click="toggleHeader"
            >
              <i class="ti ti-chevron-up"></i>
            </a>
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
                <p class="summary-label-md mb-1">Total Registros</p>
                <h3 class="summary-value-md mb-0">{{ totals.total_registros }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card border border-success sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-success text-white">
                <i class="ti ti-box"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Cantidad Total</p>
                <h3 class="summary-value-md mb-0">{{ totals.cantidad_total.toFixed(2) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex" v-if="filters.include_cost">
          <div class="card border border-info sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-info text-white">
                <i class="ti ti-currency-dollar"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Costo Total</p>
                <h3 class="summary-value-md mb-0">L {{ formatCurrency(totals.costo_total) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex" v-if="filters.include_prices">
          <div class="card border border-warning sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon-md bg-warning text-white">
                <i class="ti ti-cash"></i>
              </span>
              <div class="ms-3">
                <p class="summary-label-md mb-1">Precio Total</p>
                <h3 class="summary-value-md mb-0">L {{ formatCurrency(totals.precio_total || 0) }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Panel -->
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">
            <i class="ti ti-filter me-2"></i>Filtros de Búsqueda
          </h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="loadInventory">
            <!-- Fila 1: Producto, Categoría, Subcategoría -->
            <div class="row mb-3">
              <div class="col-lg-4 col-md-6">
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
              <div class="col-lg-4 col-md-6">
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
              <div class="col-lg-4 col-md-6">
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
            </div>

            <!-- Fila 2: Bodega, Marca, Filtro de Existencias -->
            <div class="row mb-3">
              <div class="col-lg-4 col-md-6">
                <label class="form-label">Bodega</label>
                <select class="form-select" v-model="filters.warehouse_id">
                  <option value="">Todas</option>
                  <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                    {{ warehouse.nombre }}
                  </option>
                </select>
              </div>
              <div class="col-lg-4 col-md-6">
                <label class="form-label">Marca</label>
                <select class="form-select" v-model="filters.brand_id">
                  <option value="">Todas</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                    {{ brand.name }}
                  </option>
                </select>
              </div>
              <div class="col-lg-4 col-md-6">
                <label class="form-label">Filtro de Existencias</label>
                <select class="form-select" v-model="filters.existence_filter">
                  <option value="all">Todos Los Productos</option>
                  <option value="with_stock">Con Stock</option>
                  <option value="without_stock">Sin Stock</option>
                </select>
              </div>
            </div>

            <!-- Opciones de Inclusión -->
            <div class="row mb-3">
              <div class="col-12">
                <label class="form-label d-block mb-2">Opciones de Inclusión</label>
                <div class="row">
                  <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="filters.include_cost"
                        id="includeCost"
                      />
                      <label class="form-check-label" for="includeCost">
                        Incluir Costo
                      </label>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="filters.include_prices"
                        id="includePrices"
                      />
                      <label class="form-check-label" for="includePrices">
                        Incluir Precios
                      </label>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="filters.include_codes"
                        id="includeCodes"
                      />
                      <label class="form-check-label" for="includeCodes">
                        Incluir Códigos
                      </label>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="filters.include_unit"
                        id="includeUnit"
                      />
                      <label class="form-check-label" for="includeUnit">
                        Incluir Unidad de Medida
                      </label>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="filters.include_brand"
                        id="includeBrand"
                      />
                      <label class="form-check-label" for="includeBrand">
                        Incluir Marca
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Opciones de Agrupación -->
            <div class="row mb-3">
              <div class="col-12">
                <label class="form-label d-block mb-2">Opciones de Agrupación</label>
                <div class="row">
                  <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="filters.group_by_groups"
                        id="groupByGroups"
                      />
                      <label class="form-check-label" for="groupByGroups">
                        Agrupar por Categorías
                      </label>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="filters.group_by_warehouses"
                        id="groupByWarehouses"
                      />
                      <label class="form-check-label" for="groupByWarehouses">
                        Agrupar por Bodegas
                      </label>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="filters.group_by_articles"
                        id="groupByArticles"
                      />
                      <label class="form-check-label" for="groupByArticles">
                        Agrupar por Subcategoría
                      </label>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="filters.include_suspended"
                        id="includeSuspended"
                      />
                      <label class="form-check-label" for="includeSuspended">
                        Incluir Suspendidos
                      </label>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="filters.is_for_inventory_taking"
                        id="isForInventory"
                      />
                      <label class="form-check-label" for="isForInventory">
                        Es para toma de inventario
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="row">
              <div class="col-12">
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <i class="ti ti-search me-1"></i>
                    {{ loading ? "Generando..." : "Generar Reporte" }}
                  </button>
                  <button type="button" class="btn btn-secondary" @click="clearFilters">
                    CERRAR
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card" v-if="inventoryData.length > 0">
        <div class="card-body">
          <div v-if="filters.group_by_warehouses">
            <!-- Grouped by Warehouse -->
            <div v-for="warehouse in inventoryData" :key="warehouse.warehouse_id" class="mb-4">
              <h5 class="text-primary mb-3">
                <i class="ti ti-archive me-2"></i>Bodega: {{ warehouse.almacen }}
              </h5>

              <!-- Si también está agrupado por categorías, mostrar sub-agrupación -->
              <template v-if="filters.group_by_groups">
                <div v-for="(categoryGroup, catIndex) in groupByCategory(warehouse.items)" :key="catIndex" class="mb-3">
                  <h6 class="text-secondary mb-2 ms-3">
                    <i class="ti ti-folder me-2"></i>{{ categoryGroup.categoria || 'Sin Categoría' }}
                  </h6>
                  <div class="table-responsive ms-4">
                    <table class="table table-bordered table-striped table-sm">
                      <thead class="table-light">
                        <tr>
                          <th v-if="filters.include_codes" class="sortable" @click="sortBy('codigo')">
                            Código
                            <i class="ti" :class="getSortIcon('codigo')"></i>
                          </th>
                          <th class="sortable" @click="sortBy('nombre')">
                            Nombre
                            <i class="ti" :class="getSortIcon('nombre')"></i>
                          </th>
                          <th class="sortable" @click="sortBy('subcategoria')">
                            Subcategoría
                            <i class="ti" :class="getSortIcon('subcategoria')"></i>
                          </th>
                          <th v-if="filters.include_brand" class="sortable" @click="sortBy('marca')">
                            Marca
                            <i class="ti" :class="getSortIcon('marca')"></i>
                          </th>
                          <th v-if="filters.include_unit" class="sortable" @click="sortBy('unidad_medida')">
                            Unidad
                            <i class="ti" :class="getSortIcon('unidad_medida')"></i>
                          </th>
                          <th class="text-center sortable" @click="sortBy('cantidad')">
                            Cantidad
                            <i class="ti" :class="getSortIcon('cantidad')"></i>
                          </th>
                          <th v-if="filters.is_for_inventory_taking" class="text-center" style="min-width: 100px;">
                            Toma de Inv.
                          </th>
                          <th v-if="filters.include_cost" class="text-end sortable" @click="sortBy('costo_unit')">
                            Costo Unit.
                            <i class="ti" :class="getSortIcon('costo_unit')"></i>
                          </th>
                          <th v-if="filters.include_cost" class="text-end sortable" @click="sortBy('costo_total')">
                            Costo Total
                            <i class="ti" :class="getSortIcon('costo_total')"></i>
                          </th>
                          <th v-if="filters.include_prices" class="text-end sortable" @click="sortBy('precio_unit')">
                            Precio Unit.
                            <i class="ti" :class="getSortIcon('precio_unit')"></i>
                          </th>
                          <th v-if="filters.include_prices" class="text-end sortable" @click="sortBy('precio_total')">
                            Precio Total
                            <i class="ti" :class="getSortIcon('precio_total')"></i>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in getSortedItems(categoryGroup.items)" :key="index">
                          <td v-if="filters.include_codes">{{ item.codigo || '-' }}</td>
                          <td>{{ item.nombre }}</td>
                          <td>{{ item.subcategoria || '-' }}</td>
                          <td v-if="filters.include_brand">{{ item.marca || '-' }}</td>
                          <td v-if="filters.include_unit">{{ item.unidad_medida || '-' }}</td>
                          <td class="text-end">{{ parseFloat(item.cantidad || 0).toFixed(2) }}</td>
                          <td v-if="filters.is_for_inventory_taking" class="text-center"></td>
                          <td v-if="filters.include_cost" class="text-end">{{ formatCurrency(item.costo_unit || 0) }}</td>
                          <td v-if="filters.include_cost" class="text-end">{{ formatCurrency(item.costo_total || 0) }}</td>
                          <td v-if="filters.include_prices" class="text-end">{{ formatCurrency(item.precio_unit || 0) }}</td>
                          <td v-if="filters.include_prices" class="text-end">{{ formatCurrency(item.precio_total || 0) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>

              <!-- Si también está agrupado por subcategorías, mostrar sub-agrupación -->
              <template v-else-if="filters.group_by_articles">
                <div v-for="(subcategoryGroup, subIndex) in groupBySubcategory(warehouse.items)" :key="subIndex" class="mb-3">
                  <h6 class="text-secondary mb-2 ms-3">
                    <i class="ti ti-tag me-2"></i>{{ subcategoryGroup.subcategoria || 'Sin Subcategoría' }}
                  </h6>
                  <div class="table-responsive ms-4">
                    <table class="table table-bordered table-striped table-sm">
                      <thead class="table-light">
                        <tr>
                          <th v-if="filters.include_codes" class="sortable" @click="sortBy('codigo')">
                            Código
                            <i class="ti" :class="getSortIcon('codigo')"></i>
                          </th>
                          <th class="sortable" @click="sortBy('nombre')">
                            Nombre
                            <i class="ti" :class="getSortIcon('nombre')"></i>
                          </th>
                          <th class="sortable" @click="sortBy('categoria')">
                            Categoría
                            <i class="ti" :class="getSortIcon('categoria')"></i>
                          </th>
                          <th v-if="filters.include_brand" class="sortable" @click="sortBy('marca')">
                            Marca
                            <i class="ti" :class="getSortIcon('marca')"></i>
                          </th>
                          <th v-if="filters.include_unit" class="sortable" @click="sortBy('unidad_medida')">
                            Unidad
                            <i class="ti" :class="getSortIcon('unidad_medida')"></i>
                          </th>
                          <th class="text-center sortable" @click="sortBy('cantidad')">
                            Cantidad
                            <i class="ti" :class="getSortIcon('cantidad')"></i>
                          </th>
                          <th v-if="filters.is_for_inventory_taking" class="text-center" style="min-width: 100px;">
                            Toma de Inv.
                          </th>
                          <th v-if="filters.include_cost" class="text-end sortable" @click="sortBy('costo_unit')">
                            Costo Unit.
                            <i class="ti" :class="getSortIcon('costo_unit')"></i>
                          </th>
                          <th v-if="filters.include_cost" class="text-end sortable" @click="sortBy('costo_total')">
                            Costo Total
                            <i class="ti" :class="getSortIcon('costo_total')"></i>
                          </th>
                          <th v-if="filters.include_prices" class="text-end sortable" @click="sortBy('precio_unit')">
                            Precio Unit.
                            <i class="ti" :class="getSortIcon('precio_unit')"></i>
                          </th>
                          <th v-if="filters.include_prices" class="text-end sortable" @click="sortBy('precio_total')">
                            Precio Total
                            <i class="ti" :class="getSortIcon('precio_total')"></i>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in getSortedItems(subcategoryGroup.items)" :key="index">
                          <td v-if="filters.include_codes">{{ item.codigo || '-' }}</td>
                          <td>{{ item.nombre }}</td>
                          <td>{{ item.categoria || '-' }}</td>
                          <td v-if="filters.include_brand">{{ item.marca || '-' }}</td>
                          <td v-if="filters.include_unit">{{ item.unidad_medida || '-' }}</td>
                          <td class="text-end">{{ parseFloat(item.cantidad || 0).toFixed(2) }}</td>
                          <td v-if="filters.is_for_inventory_taking" class="text-center"></td>
                          <td v-if="filters.include_cost" class="text-end">{{ formatCurrency(item.costo_unit || 0) }}</td>
                          <td v-if="filters.include_cost" class="text-end">{{ formatCurrency(item.costo_total || 0) }}</td>
                          <td v-if="filters.include_prices" class="text-end">{{ formatCurrency(item.precio_unit || 0) }}</td>
                          <td v-if="filters.include_prices" class="text-end">{{ formatCurrency(item.precio_total || 0) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>

              <!-- Sin agrupación por categorías ni subcategorías -->
              <div v-else class="table-responsive">
                <table class="table table-bordered table-striped table-sm">
                  <thead class="table-light">
                    <tr>
                      <th v-if="filters.include_codes" class="sortable" @click="sortBy('codigo')">
                        Código
                        <i class="ti" :class="getSortIcon('codigo')"></i>
                      </th>
                      <th class="sortable" @click="sortBy('nombre')">
                        Nombre
                        <i class="ti" :class="getSortIcon('nombre')"></i>
                      </th>
                      <th class="sortable" @click="sortBy('categoria')">
                        Categoría
                        <i class="ti" :class="getSortIcon('categoria')"></i>
                      </th>
                      <th class="sortable" @click="sortBy('subcategoria')">
                        Subcategoría
                        <i class="ti" :class="getSortIcon('subcategoria')"></i>
                      </th>
                      <th v-if="filters.include_brand" class="sortable" @click="sortBy('marca')">
                        Marca
                        <i class="ti" :class="getSortIcon('marca')"></i>
                      </th>
                      <th v-if="filters.include_unit" class="sortable" @click="sortBy('unidad_medida')">
                        Unidad
                        <i class="ti" :class="getSortIcon('unidad_medida')"></i>
                      </th>
                      <th class="text-center sortable" @click="sortBy('cantidad')">
                        Cantidad
                        <i class="ti" :class="getSortIcon('cantidad')"></i>
                      </th>
                      <th v-if="filters.is_for_inventory_taking" class="text-center" style="min-width: 100px;">
                        Toma de Inv.
                      </th>
                      <th v-if="filters.include_cost" class="text-end sortable" @click="sortBy('costo_unit')">
                        Costo Unit.
                        <i class="ti" :class="getSortIcon('costo_unit')"></i>
                      </th>
                      <th v-if="filters.include_cost" class="text-end sortable" @click="sortBy('costo_total')">
                        Costo Total
                        <i class="ti" :class="getSortIcon('costo_total')"></i>
                      </th>
                      <th v-if="filters.include_prices" class="text-end sortable" @click="sortBy('precio_unit')">
                        Precio Unit.
                        <i class="ti" :class="getSortIcon('precio_unit')"></i>
                      </th>
                      <th v-if="filters.include_prices" class="text-end sortable" @click="sortBy('precio_total')">
                        Precio Total
                        <i class="ti" :class="getSortIcon('precio_total')"></i>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in getSortedItems(warehouse.items)" :key="index">
                      <td v-if="filters.include_codes">{{ item.codigo || '-' }}</td>
                      <td>{{ item.nombre }}</td>
                      <td>{{ item.categoria || '-' }}</td>
                      <td>{{ item.subcategoria || '-' }}</td>
                      <td v-if="filters.include_brand">{{ item.marca || '-' }}</td>
                      <td v-if="filters.include_unit">{{ item.unidad_medida || '-' }}</td>
                      <td class="text-end">{{ parseFloat(item.cantidad || 0).toFixed(2) }}</td>
                      <td v-if="filters.is_for_inventory_taking" class="text-center"></td>
                      <td v-if="filters.include_cost" class="text-end">{{ formatCurrency(item.costo_unit || 0) }}</td>
                      <td v-if="filters.include_cost" class="text-end">{{ formatCurrency(item.costo_total || 0) }}</td>
                      <td v-if="filters.include_prices" class="text-end">{{ formatCurrency(item.precio_unit || 0) }}</td>
                      <td v-if="filters.include_prices" class="text-end">{{ formatCurrency(item.precio_total || 0) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="table-secondary fw-bold">
                    <tr>
                      <td :colspan="getColspanCount()" class="text-end">TOTALES - {{ warehouse.almacen }}</td>
                      <td class="text-end">{{ warehouse.totals.cantidad.toFixed(2) }}</td>
                      <td v-if="filters.include_cost" class="text-end"></td>
                      <td v-if="filters.include_cost" class="text-end">{{ formatCurrency(warehouse.totals.costo_total || 0) }}</td>
                      <td v-if="filters.include_prices" class="text-end"></td>
                      <td v-if="filters.include_prices" class="text-end">{{ formatCurrency(warehouse.totals.precio_total || 0) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div v-else>
            <!-- Not Grouped -->
            <div class="table-responsive">
              <table class="table table-bordered table-striped table-sm">
                <thead class="table-light">
                  <tr>
                    <th v-if="filters.include_codes" class="sortable" @click="sortBy('codigo')">
                      Código
                      <i class="ti" :class="getSortIcon('codigo')"></i>
                    </th>
                    <th class="sortable" @click="sortBy('nombre')">
                      Nombre
                      <i class="ti" :class="getSortIcon('nombre')"></i>
                    </th>
                    <th class="sortable" @click="sortBy('categoria')">
                      Categoría
                      <i class="ti" :class="getSortIcon('categoria')"></i>
                    </th>
                    <th class="sortable" @click="sortBy('subcategoria')">
                      Subcategoría
                      <i class="ti" :class="getSortIcon('subcategoria')"></i>
                    </th>
                    <th v-if="filters.include_brand" class="sortable" @click="sortBy('marca')">
                      Marca
                      <i class="ti" :class="getSortIcon('marca')"></i>
                    </th>
                    <th v-if="filters.include_unit" class="sortable" @click="sortBy('unidad_medida')">
                      Unidad
                      <i class="ti" :class="getSortIcon('unidad_medida')"></i>
                    </th>
                    <th class="sortable" @click="sortBy('almacen')">
                      Bodega
                      <i class="ti" :class="getSortIcon('almacen')"></i>
                    </th>
                    <th class="text-center sortable" @click="sortBy('cantidad')">
                      Cantidad
                      <i class="ti" :class="getSortIcon('cantidad')"></i>
                    </th>
                    <th v-if="filters.is_for_inventory_taking" class="text-center" style="min-width: 100px;">
                      Toma de Inv.
                    </th>
                    <th v-if="filters.include_cost" class="text-end sortable" @click="sortBy('costo_unit')">
                      Costo Unit.
                      <i class="ti" :class="getSortIcon('costo_unit')"></i>
                    </th>
                    <th v-if="filters.include_cost" class="text-end sortable" @click="sortBy('costo_total')">
                      Costo Total
                      <i class="ti" :class="getSortIcon('costo_total')"></i>
                    </th>
                    <th v-if="filters.include_prices" class="text-end sortable" @click="sortBy('precio_unit')">
                      Precio Unit.
                      <i class="ti" :class="getSortIcon('precio_unit')"></i>
                    </th>
                    <th v-if="filters.include_prices" class="text-end sortable" @click="sortBy('precio_total')">
                      Precio Total
                      <i class="ti" :class="getSortIcon('precio_total')"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in getSortedItems(inventoryData)" :key="index">
                    <td v-if="filters.include_codes">{{ item.codigo || '-' }}</td>
                    <td>{{ item.nombre }}</td>
                    <td>{{ item.categoria || '-' }}</td>
                    <td>{{ item.subcategoria || '-' }}</td>
                    <td v-if="filters.include_brand">{{ item.marca || '-' }}</td>
                    <td v-if="filters.include_unit">{{ item.unidad_medida || '-' }}</td>
                    <td>{{ item.almacen || '-' }}</td>
                    <td class="text-end">{{ parseFloat(item.cantidad || 0).toFixed(2) }}</td>
                    <td v-if="filters.is_for_inventory_taking" class="text-center"></td>
                    <td v-if="filters.include_cost" class="text-end">{{ formatCurrency(item.costo_unit || 0) }}</td>
                    <td v-if="filters.include_cost" class="text-end">{{ formatCurrency(item.costo_total || 0) }}</td>
                    <td v-if="filters.include_prices" class="text-end">{{ formatCurrency(item.precio_unit || 0) }}</td>
                    <td v-if="filters.include_prices" class="text-end">{{ formatCurrency(item.precio_total || 0) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data -->
      <div class="card" v-else-if="!loading">
        <div class="card-body text-center py-5">
          <i class="ti ti-package-off" style="font-size: 64px; color: #ccc;"></i>
          <p class="mt-3 text-muted">No hay datos para mostrar con los filtros seleccionados</p>
          <button class="btn btn-primary mt-2" @click="clearFilters">
            <i class="ti ti-refresh me-2"></i>Limpiar Filtros
          </button>
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
              placeholder="Buscar categoría..."
              @input="searchCategories"
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
                  <td>{{ category.name }}</td>
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
              placeholder="Buscar subcategoría..."
              @input="searchSubcategories"
            />
          </div>
          <div class="table-responsive" style="max-height: 400px;">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="subcategory in filteredSubcategories" :key="subcategory.id">
                  <td>{{ subcategory.name }}</td>
                  <td>{{ subcategory.category_name || '-' }}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" @click="selectSubcategory(subcategory)">
                      Seleccionar
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredSubcategories.length === 0">
                  <td colspan="3" class="text-center">No se encontraron subcategorías</td>
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
              placeholder="Buscar producto por nombre o código..."
              @input="searchProducts"
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
                  <td>{{ product.code }}</td>
                  <td>{{ product.name }}</td>
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
import api from "@/utils/axios";

export default {
  name: 'PhysicalInventory',
  data() {
    return {
      loading: false,
      inventoryData: [],
      totals: {
        total_registros: 0,
        cantidad_total: 0,
        apartadas_total: 0,
        costo_total: 0
      },
      filters: {
        product_id: '',
        article_name: '',
        category_id: '',
        subcategory_id: '',
        warehouse_id: '',
        brand_id: '',
        existence_filter: 'all',
        include_cost: false,
        include_prices: false,
        include_codes: false,
        include_unit: false,
        include_brand: false,
        group_by_warehouses: true,
        group_by_groups: false,
        group_by_articles: false,
        include_suspended: false,
        is_for_inventory_taking: false
      },
      groups: [],
      subgroups: [],
      warehouses: [],
      brands: [],
      products: [],
      // Búsqueda
      showCategorySearch: false,
      showSubcategorySearch: false,
      showProductSearch: false,
      categorySearch: '',
      subcategorySearch: '',
      productSearch: '',
      filteredCategories: [],
      filteredSubcategories: [],
      filteredProducts: [],
      selectedCategory: null,
      selectedSubcategory: null,
      selectedProduct: null,
      // Ordenamiento
      sortField: null,
      sortDirection: 'asc'
    }
  },
  computed: {
    selectedCategoryName() {
      return this.selectedCategory ? this.selectedCategory.name : ''
    },
    selectedSubcategoryName() {
      return this.selectedSubcategory ? this.selectedSubcategory.name : ''
    },
    selectedProductName() {
      return this.selectedProduct ? this.selectedProduct.name : ''
    }
  },
  mounted() {
    this.loadCatalogs()
  },
  methods: {
    async loadCatalogs() {
      try {
        const [categoriesRes, subcategoriesRes, warehousesRes, brandsRes, productsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/subcategories'),
          api.get('/warehouses'),
          api.get('/brands'),
          api.get('/products/search/all', { params: { status: 'active' } })
        ])

        if (categoriesRes.data.success) {
          this.groups = categoriesRes.data.data || []
        }
        if (subcategoriesRes.data.success) {
          this.subgroups = subcategoriesRes.data.data || []
        }
        if (warehousesRes.data.success) {
          this.warehouses = warehousesRes.data.data || []
        }
        if (brandsRes.data.success) {
          this.brands = brandsRes.data.data || []
        }
        if (productsRes.data.success) {
          this.products = productsRes.data.data || []
          this.filteredProducts = this.products
          console.log(`Productos cargados: ${this.products.length}`)
        }

        this.filteredCategories = this.groups
        this.filteredSubcategories = this.subgroups
      } catch (error) {
        console.error('Error al cargar catálogos:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los catálogos'
        })
      }
    },
    async loadInventory() {
      this.loading = true
      try {
        const queryParams = new URLSearchParams()

        // Enviar TODOS los parámetros, incluyendo false y valores vacíos
        Object.keys(this.filters).forEach(key => {
          const value = this.filters[key]
          // Solo excluir valores null o undefined
          if (value !== null && value !== undefined) {
            queryParams.append(key, value)
          }
        })

        console.log('Cargando inventario con parámetros:', queryParams.toString())

        const response = await api.get(`/physical-inventory?${queryParams.toString()}`)

        console.log('Respuesta del servidor:', response.data)

        // La respuesta viene envuelta: response.data.data contiene el objeto con data, totals, filters, metadata
        const result = response.data.data || {}

        this.inventoryData = result.data || []
        this.totals = result.totals || {
          total_registros: 0,
          cantidad_total: 0,
          apartadas_total: 0,
          costo_total: 0
        }

        console.log('inventoryData asignado:', this.inventoryData)
        console.log('inventoryData.length:', this.inventoryData.length)
        console.log('totals:', this.totals)
      } catch (error) {
        console.error('Error al cargar inventario:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo cargar el inventario físico'
        })
      } finally {
        this.loading = false
      }
    },
    searchCategories() {
      if (!this.categorySearch) {
        this.filteredCategories = this.groups
      } else {
        this.filteredCategories = this.groups.filter(cat =>
          cat.name.toLowerCase().includes(this.categorySearch.toLowerCase())
        )
      }
    },
    searchSubcategories() {
      if (!this.subcategorySearch) {
        this.filteredSubcategories = this.subgroups
      } else {
        this.filteredSubcategories = this.subgroups.filter(subcat =>
          subcat.name.toLowerCase().includes(this.subcategorySearch.toLowerCase())
        )
      }
    },
    searchProducts() {
      if (!this.productSearch) {
        this.filteredProducts = this.products
      } else {
        this.filteredProducts = this.products.filter(prod =>
          prod.name.toLowerCase().includes(this.productSearch.toLowerCase()) ||
          (prod.code && prod.code.toLowerCase().includes(this.productSearch.toLowerCase()))
        )
      }
    },
    selectCategory(category) {
      this.selectedCategory = category
      this.filters.category_id = category.id
      this.showCategorySearch = false
    },
    selectSubcategory(subcategory) {
      this.selectedSubcategory = subcategory
      this.filters.subcategory_id = subcategory.id
      this.showSubcategorySearch = false
    },
    selectProduct(product) {
      this.selectedProduct = product
      this.filters.product_id = product.id
      this.showProductSearch = false
    },
    clearCategory() {
      this.selectedCategory = null
      this.filters.category_id = ''
    },
    clearSubcategory() {
      this.selectedSubcategory = null
      this.filters.subcategory_id = ''
    },
    clearProduct() {
      this.selectedProduct = null
      this.filters.product_id = ''
    },
    clearFilters() {
      this.filters = {
        product_id: '',
        article_name: '',
        category_id: '',
        subcategory_id: '',
        warehouse_id: '',
        brand_id: '',
        existence_filter: 'all',
        include_cost: false,
        include_prices: false,
        include_codes: false,
        include_unit: false,
        include_brand: false,
        group_by_warehouses: true,
        group_by_groups: false,
        group_by_articles: false,
        include_suspended: false,
        is_for_inventory_taking: false
      }
      this.selectedCategory = null
      this.selectedSubcategory = null
      this.selectedProduct = null
      this.inventoryData = []
    },
    formatCurrency(value) {
      if (!value) return '0.00'
      return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    printReport() {
      window.print()
    },
    toggleHeader() {
      const header = document.querySelector('.page-header')
      if (header) {
        header.classList.toggle('collapsed')
      }
    },
    sortBy(field) {
      if (this.sortField === field) {
        // Toggle direction if clicking the same field
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        // New field, default to ascending
        this.sortField = field
        this.sortDirection = 'asc'
      }
    },
    getSortIcon(field) {
      if (this.sortField !== field) {
        return 'ti-selector'
      }
      return this.sortDirection === 'asc' ? 'ti-sort-ascending' : 'ti-sort-descending'
    },
    getSortedItems(items) {
      if (!this.sortField || !items || items.length === 0) {
        return items
      }

      // Create a copy to avoid mutating original array
      return [...items].sort((a, b) => {
        let aVal = a[this.sortField]
        let bVal = b[this.sortField]

        // Handle null/undefined values
        if (aVal === null || aVal === undefined) aVal = ''
        if (bVal === null || bVal === undefined) bVal = ''

        // Handle numeric sorting for numeric fields
        const numericFields = ['cantidad', 'costo_unit', 'costo_total', 'precio_unit', 'precio_total']
        if (numericFields.includes(this.sortField)) {
          aVal = parseFloat(aVal) || 0
          bVal = parseFloat(bVal) || 0
        } else {
          // String sorting for text fields
          aVal = String(aVal).toLowerCase()
          bVal = String(bVal).toLowerCase()
        }

        // Compare values based on sort direction
        if (this.sortDirection === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
        }
      })
    },
    getColspanCount() {
      // Base columns: Nombre, Categoría, Subcategoría
      let count = 3

      // Optional columns
      if (this.filters.include_codes) count++
      if (this.filters.include_brand) count++
      if (this.filters.include_unit) count++

      return count
    },
    groupByCategory(items) {
      // Agrupar items por categoría
      const grouped = {}

      items.forEach(item => {
        const categoryKey = item.categoria || 'Sin Categoría'

        if (!grouped[categoryKey]) {
          grouped[categoryKey] = {
            categoria: categoryKey,
            items: []
          }
        }

        grouped[categoryKey].items.push(item)
      })

      // Convertir a array y ordenar por categoría
      return Object.values(grouped).sort((a, b) => {
        const aName = a.categoria || ''
        const bName = b.categoria || ''
        return aName.localeCompare(bName)
      })
    },
    groupBySubcategory(items) {
      // Agrupar items por subcategoría
      const grouped = {}

      items.forEach(item => {
        const subcategoryKey = item.subcategoria || 'Sin Subcategoría'

        if (!grouped[subcategoryKey]) {
          grouped[subcategoryKey] = {
            subcategoria: subcategoryKey,
            items: []
          }
        }

        grouped[subcategoryKey].items.push(item)
      })

      // Convertir a array y ordenar por subcategoría
      return Object.values(grouped).sort((a, b) => {
        const aName = a.subcategoria || ''
        const bName = b.subcategoria || ''
        return aName.localeCompare(bName)
      })
    }
  }
}
</script>

<style scoped>
.summary-label-md {
  font-size: 0.875rem;
  color: #6c757d;
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

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.sortable i {
  margin-left: 5px;
  font-size: 0.875rem;
  opacity: 0.6;
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
