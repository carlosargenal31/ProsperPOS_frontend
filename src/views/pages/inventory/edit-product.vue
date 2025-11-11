<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4 class="fw-bold">Editar Producto</h4>
            <h6>Modificar información del producto</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a
              href="javascript:void(0);"
              @click="refreshForm"
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
          <div class="dropdown">
            <button
              class="btn btn-primary dropdown-toggle"
              type="button"
              id="dropdownNuevo"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="ti ti-plus me-2"></i>NUEVO
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownNuevo">
              <li>
                <a class="dropdown-item" href="javascript:void(0);" @click="setFormMode('full')">
                  <i class="ti ti-file-plus me-2"></i>Nuevo
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="javascript:void(0);" @click="setFormMode('quick')">
                  <i class="ti ti-bolt me-2"></i>Registro Rápido
                </a>
              </li>
            </ul>
          </div>
          <router-link to="/inventory/product-list" class="btn btn-secondary">
            <i class="ti ti-arrow-left me-2"></i>Volver a Productos
          </router-link>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="add-product-form">
        <!-- Registro Rápido -->
        <div v-if="formMode === 'quick'" class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="ti ti-bolt me-2"></i>Registro Rápido de Artículo</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <!-- Código -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Código</label>
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.code"
                      placeholder="Código"
                    >
                    <div class="form-check d-flex align-items-center ms-2">
                      <input class="form-check-input mt-0" type="checkbox" id="useConsecutive" v-model="useConsecutive">
                      <label class="form-check-label ms-2" for="useConsecutive">
                        Usar Consecutivos
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Nombre -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Nombre <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formData.name"
                    placeholder="Nombre"
                    required
                  >
                </div>
              </div>

              <!-- Grupo -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Grupo <span class="text-danger">*</span></label>
                  <vue-select
                    :options="categories"
                    v-model="formData.category_id"
                    label="name"
                    :reduce="cat => cat.id"
                    placeholder="GRUPOS"
                  />
                </div>
              </div>

              <!-- SubGrupo -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">SubGrupo</label>
                  <vue-select
                    :options="subcategories"
                    v-model="formData.subcategory_id"
                    label="name"
                    :reduce="sub => sub.id"
                    placeholder="SUBGRUPOS"
                    :disabled="!formData.category_id"
                  />
                </div>
              </div>

              <!-- Costo -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Costo</label>
                  <div class="input-group">
                    <input
                      type="number"
                      step="0.01"
                      class="form-control text-end"
                      v-model="formData.cost"
                      placeholder="Costo"
                    >
                    <span class="input-group-text">L</span>
                  </div>
                </div>
              </div>

              <!-- Utilidad % -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Utilidad</label>
                  <div class="input-group">
                    <input
                      type="number"
                      step="0.01"
                      class="form-control text-end"
                      v-model="quickProfitPercent"
                      @input="calculateQuickPrice"
                      placeholder="Utilidad"
                    >
                    <span class="input-group-text">
                      <i class="ti ti-percentage" style="cursor: pointer;" @click="toggleQuickPriceCalc"></i>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Precio -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Precio</label>
                  <div class="input-group">
                    <input
                      type="number"
                      step="0.01"
                      class="form-control text-end"
                      v-model="formData.prices[0].total"
                      placeholder="Precio Neto"
                    >
                    <span class="input-group-text">L</span>
                  </div>
                </div>
              </div>

              <!-- Impuesto -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Impuesto <span class="text-danger">*</span></label>
                  <vue-select
                    :options="taxes"
                    v-model="selectedQuickTax"
                    label="name"
                    :reduce="tax => tax.id"
                    placeholder="SELECCIONE UN IMPUESTO"
                  />
                </div>
              </div>
            </div>

            <!-- Botones -->
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-secondary" @click="$router.push('/inventory/product-list')">
                CERRAR
              </button>
              <button type="submit" class="btn btn-success" :disabled="isSaving">
                <i class="ti ti-device-floppy me-2"></i>{{ isSaving ? 'GUARDANDO...' : 'GUARDAR' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Formulario Completo -->
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
                  id="tab-campos"
                  data-bs-toggle="tab"
                  href="#campos"
                  role="tab"
                  aria-controls="campos"
                  aria-selected="false"
                >
                  <i class="ti ti-list-check me-2"></i>Campos Adicionales
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
                    <div class="mb-3 position-relative">
                      <label class="form-label">Código <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.code"
                        placeholder="Ej: C-0001-9"
                        required
                      >
                      <button
                        type="button"
                        class="btn btn-sm btn-primary position-absolute"
                        style="right: 10px; top: 32px;"
                        @click="generateCode"
                      >
                        Generar
                      </button>
                    </div>
                  </div>

                  <!-- Tipo de Item -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Tipo de Item <span class="text-danger">*</span></label>
                      <vue-select
                        :options="itemTypes"
                        v-model="formData.item_type"
                        placeholder="Seleccione"
                      />
                    </div>
                  </div>

                  <!-- Unidad -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Unidad <span class="text-danger">*</span></label>
                      <vue-select
                        :options="units"
                        v-model="formData.unit"
                        placeholder="Seleccione"
                      />
                    </div>
                  </div>

                  <!-- Nombre -->
                  <div class="col-md-8">
                    <div class="mb-3">
                      <label class="form-label">Nombre <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.name"
                        placeholder="Nombre completo del producto"
                        required
                      >
                    </div>
                  </div>

                  <!-- Nombre Corto -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Nombre Corto</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.short_name"
                        placeholder="Nombre abreviado"
                      >
                    </div>
                  </div>

                  <!-- Imagen -->
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Imagen Principal</label>
                      <div class="image-upload">
                        <input
                          type="file"
                          ref="mainImageInput"
                          @change="handleMainImage"
                          accept="image/*"
                        >
                        <div class="image-uploads" v-if="!formData.imagePreview">
                          <i class="ti ti-upload me-2"></i>
                          <h6>Subir Imagen</h6>
                        </div>
                        <div v-else class="position-relative d-inline-block">
                          <img :src="formData.imagePreview" alt="Preview" style="max-height: 150px;">
                          <button
                            type="button"
                            class="btn btn-sm btn-danger position-absolute"
                            style="top: 5px; right: 5px;"
                            @click="removeMainImage"
                          >
                            <i class="ti ti-x"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Grupo (Categoría) -->
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Grupo (Categoría) <span class="text-danger">*</span></label>
                      <vue-select
                        :options="categories"
                        v-model="formData.category_id"
                        label="name"
                        :reduce="cat => cat.id"
                        placeholder="Seleccione categoría"
                        @input="loadSubcategories"
                      />
                    </div>
                  </div>

                  <!-- Subgrupo (Subcategoría) -->
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Subgrupo (Subcategoría)</label>
                      <vue-select
                        :options="subcategories"
                        v-model="formData.subcategory_id"
                        label="name"
                        :reduce="sub => sub.id"
                        placeholder="Seleccione subcategoría"
                        :disabled="!formData.category_id"
                      />
                    </div>
                  </div>

                  <!-- Peso -->
                  <div class="col-md-3">
                    <div class="mb-3">
                      <label class="form-label">Peso (kg)</label>
                      <input
                        type="number"
                        step="0.001"
                        class="form-control"
                        v-model="formData.weight"
                        placeholder="0.000"
                      >
                    </div>
                  </div>

                  <!-- Miligramos -->
                  <div class="col-md-3">
                    <div class="mb-3">
                      <label class="form-label">Miligramos (mg)</label>
                      <input
                        type="number"
                        step="0.1"
                        class="form-control"
                        v-model="formData.milligrams"
                        placeholder="0.0"
                      >
                    </div>
                  </div>

                  <!-- Grados de Alcohol -->
                  <div class="col-md-3">
                    <div class="mb-3">
                      <label class="form-label">Grados de Alcohol (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        class="form-control"
                        v-model="formData.alcohol_percentage"
                        placeholder="0.0"
                      >
                    </div>
                  </div>

                  <!-- Garantía -->
                  <div class="col-md-3">
                    <div class="mb-3">
                      <label class="form-label">Garantía</label>
                      <div class="input-group">
                        <input
                          type="number"
                          class="form-control"
                          v-model="formData.warranty_value"
                          placeholder="0"
                        >
                        <vue-select
                          :options="warrantyUnits"
                          v-model="formData.warranty_unit"
                          class="flex-grow-1"
                          style="min-width: 100px;"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Marca -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Marca</label>
                      <vue-select
                        :options="brands"
                        v-model="formData.brand_id"
                        label="name"
                        :reduce="brand => brand.id"
                        placeholder="Seleccione marca"
                      />
                    </div>
                  </div>

                  <!-- Modelo -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Modelo</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.model"
                        placeholder="Modelo del producto"
                      >
                    </div>
                  </div>

                  <!-- Referencia -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Referencia</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.reference"
                        placeholder="Referencia"
                      >
                    </div>
                  </div>

                  <!-- Costo Actual -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Costo Actual <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <span class="input-group-text">L</span>
                        <input
                          type="number"
                          step="0.01"
                          class="form-control"
                          v-model="formData.cost"
                          placeholder="0.00"
                          required
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Costo Anterior -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Costo Anterior</label>
                      <div class="input-group">
                        <span class="input-group-text">L</span>
                        <input
                          type="number"
                          step="0.01"
                          class="form-control"
                          v-model="formData.previous_cost"
                          placeholder="0.00"
                          readonly
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Costo Promedio -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Costo Promedio</label>
                      <div class="input-group">
                        <span class="input-group-text">L</span>
                        <input
                          type="number"
                          step="0.01"
                          class="form-control"
                          v-model="formData.average_cost"
                          placeholder="0.00"
                          readonly
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Inventario Valorizado (Calculado) -->
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Inventario Valorizado</label>
                      <div class="alert alert-info d-flex align-items-center">
                        <i class="ti ti-calculator me-2"></i>
                        <span>L {{ valuedInventory.toFixed(2) }}</span>
                        <small class="ms-3 text-muted">({{ formData.stock }} unidades × L {{ formData.cost }})</small>
                      </div>
                    </div>
                  </div>

                  <!-- Detalles/Descripción -->
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Detalles / Descripción</label>
                      <textarea
                        class="form-control"
                        rows="4"
                        v-model="formData.description"
                        placeholder="Descripción detallada del producto"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Hashtags -->
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Hashtags</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.hashtags"
                        placeholder="#etiqueta1 #etiqueta2 #etiqueta3"
                      >
                      <small class="text-muted">Separar con espacios o comas</small>
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
                            <th width="120">Existencia Actual</th>
                            <th width="120">Mínimo</th>
                            <th width="120">Máximo</th>
                            <th width="120">Comprometido</th>
                            <th width="120">Disponible</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="warehouse in warehouses" :key="warehouse.id">
                            <td>
                              <strong>{{ warehouse.code }}</strong> - {{ warehouse.name }}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                class="form-control form-control-sm text-end"
                                v-model="getWarehouseStock(warehouse.id).current"
                                @input="calculateAvailable(warehouse.id)"
                              >
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                class="form-control form-control-sm text-end"
                                v-model="getWarehouseStock(warehouse.id).min"
                              >
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                class="form-control form-control-sm text-end"
                                v-model="getWarehouseStock(warehouse.id).max"
                              >
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                class="form-control form-control-sm text-end"
                                v-model="getWarehouseStock(warehouse.id).committed"
                                @input="calculateAvailable(warehouse.id)"
                              >
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                class="form-control form-control-sm text-end bg-light"
                                :value="getWarehouseStock(warehouse.id).available"
                                readonly
                              >
                            </td>
                          </tr>
                          <tr class="table-active fw-bold">
                            <td>TOTAL</td>
                            <td class="text-end">{{ totalStock.current }}</td>
                            <td class="text-end">{{ totalStock.min }}</td>
                            <td class="text-end">{{ totalStock.max }}</td>
                            <td class="text-end">{{ totalStock.committed }}</td>
                            <td class="text-end">{{ totalStock.available }}</td>
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
                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="usePercentageProfit"
                          v-model="formData.use_percentage_profit"
                        >
                        <label class="form-check-label" for="usePercentageProfit">
                          Usar porcentaje de utilidad para calcular precios automáticamente
                        </label>
                      </div>
                    </div>

                    <div class="table-responsive">
                      <table class="table table-bordered">
                        <thead>
                          <tr>
                            <th>Nivel</th>
                            <th width="150">% Utilidad</th>
                            <th width="150">Neto</th>
                            <th width="150">Total (Venta)</th>
                            <th width="150">% Comisión</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="i in 6" :key="i">
                            <td><strong>PRECIO #{{ i }}</strong></td>
                            <td>
                              <div class="input-group input-group-sm">
                                <input
                                  type="number"
                                  step="0.01"
                                  class="form-control text-end"
                                  v-model="formData.prices[i-1].profit_percentage"
                                  @input="calculatePrice(i-1)"
                                  :disabled="!formData.use_percentage_profit"
                                >
                                <span class="input-group-text">%</span>
                              </div>
                            </td>
                            <td>
                              <div class="input-group input-group-sm">
                                <span class="input-group-text">L</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  class="form-control text-end"
                                  v-model="formData.prices[i-1].net"
                                  readonly
                                >
                              </div>
                            </td>
                            <td>
                              <div class="input-group input-group-sm">
                                <span class="input-group-text">L</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  class="form-control text-end"
                                  v-model="formData.prices[i-1].total"
                                  @input="calculateProfitFromPrice(i-1)"
                                  :readonly="formData.use_percentage_profit"
                                >
                              </div>
                            </td>
                            <td>
                              <div class="input-group input-group-sm">
                                <input
                                  type="number"
                                  step="0.01"
                                  class="form-control text-end"
                                  v-model="formData.prices[i-1].commission"
                                >
                                <span class="input-group-text">%</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div class="alert alert-info mt-3">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="groupCommission"
                          v-model="formData.use_group_commission"
                        >
                        <label class="form-check-label" for="groupCommission">
                          Usar comisión grupal (aplicar el mismo % a todos los niveles)
                        </label>
                      </div>
                      <div v-if="formData.use_group_commission" class="mt-2">
                        <label class="form-label">% Comisión Grupal</label>
                        <div class="input-group" style="max-width: 200px;">
                          <input
                            type="number"
                            step="0.01"
                            class="form-control"
                            v-model="formData.group_commission"
                            @input="applyGroupCommission"
                          >
                          <span class="input-group-text">%</span>
                        </div>
                      </div>
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
                            <th width="100">Tasa (%)</th>
                            <th width="100" class="text-center">Ventas</th>
                            <th width="100" class="text-center">Compras</th>
                            <th width="150">Monto (L)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="tax in taxes" :key="tax.id">
                            <td><strong>{{ tax.name }}</strong></td>
                            <td class="text-end">{{ tax.rate }}%</td>
                            <td class="text-center">
                              <div class="form-check d-flex justify-content-center">
                                <input
                                  class="form-check-input"
                                  type="checkbox"
                                  :id="'tax-sales-' + tax.id"
                                  v-model="getTaxConfig(tax.id).applies_to_sales"
                                  @change="calculateTaxAmount(tax.id)"
                                >
                              </div>
                            </td>
                            <td class="text-center">
                              <div class="form-check d-flex justify-content-center">
                                <input
                                  class="form-check-input"
                                  type="checkbox"
                                  :id="'tax-purchases-' + tax.id"
                                  v-model="getTaxConfig(tax.id).applies_to_purchases"
                                  @change="calculateTaxAmount(tax.id)"
                                >
                              </div>
                            </td>
                            <td class="text-end">
                              L {{ getTaxConfig(tax.id).amount.toFixed(2) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="alert alert-success mt-3">
                      <strong>Total Impuestos:</strong> L {{ totalTaxes.toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB 5: CAMPOS ADICIONALES -->
              <div class="tab-pane fade" id="campos" role="tabpanel" aria-labelledby="tab-campos">
                <div class="row">
                  <div class="col-md-12">
                    <h5 class="mb-3">Opciones y Configuraciones Adicionales</h5>
                  </div>

                  <div class="col-md-4">
                    <div class="card bg-light mb-3">
                      <div class="card-body">
                        <h6 class="card-title">Control de Inventario</h6>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="usesStock" v-model="formData.additionalFields.uses_stock">
                          <label class="form-check-label" for="usesStock">Usa Existencias</label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="fractional" v-model="formData.additionalFields.fractional">
                          <label class="form-check-label" for="fractional">Fraccionable</label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="usesLots" v-model="formData.additionalFields.uses_lots">
                          <label class="form-check-label" for="usesLots">Usa Lotes</label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="usesExpiration" v-model="formData.additionalFields.uses_expiration">
                          <label class="form-check-label" for="usesExpiration">Es Vencimientos</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="usesSerials" v-model="formData.additionalFields.uses_serials">
                          <label class="form-check-label" for="usesSerials">Usa Seriales</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="card bg-light mb-3">
                      <div class="card-body">
                        <h6 class="card-title">Tipo de Producto</h6>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="integrated" v-model="formData.additionalFields.is_integrated">
                          <label class="form-check-label" for="integrated">Es Integrado</label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="grouped" v-model="formData.additionalFields.is_grouped">
                          <label class="form-check-label" for="grouped">Es Agrupado</label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="usesBarcode" v-model="formData.additionalFields.uses_barcode">
                          <label class="form-check-label" for="usesBarcode">Usa Código de Barra</label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="usesProduction" v-model="formData.additionalFields.uses_production">
                          <label class="form-check-label" for="usesProduction">Usa Producción</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="usesSizesColors" v-model="formData.additionalFields.uses_sizes_colors">
                          <label class="form-check-label" for="usesSizesColors">Usa Tallas y Colores</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="card bg-light mb-3">
                      <div class="card-body">
                        <h6 class="card-title">Ventas y E-Commerce</h6>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="multiVendors" v-model="formData.additionalFields.uses_multi_vendors">
                          <label class="form-check-label" for="multiVendors">Usa Múltiples Vendedores</label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="onDiscount" v-model="formData.additionalFields.on_discount">
                          <label class="form-check-label" for="onDiscount">En Descuento</label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="giftCard" v-model="formData.additionalFields.gift_card">
                          <label class="form-check-label" for="giftCard">Tarjeta Regalo</label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="onlineOrder" v-model="formData.additionalFields.is_online_order">
                          <label class="form-check-label" for="onlineOrder">Es Pedido en Línea</label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="hideEshop" v-model="formData.additionalFields.hide_from_eshop">
                          <label class="form-check-label" for="hideEshop">No mostrar en E-SHOP</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="featuredEshop" v-model="formData.additionalFields.featured_eshop">
                          <label class="form-check-label" for="featuredEshop">Destacar en E-SHOP</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="card bg-light mb-3">
                      <div class="card-body">
                        <h6 class="card-title">Recordatorio</h6>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="usesReminder" v-model="formData.additionalFields.uses_reminder">
                          <label class="form-check-label" for="usesReminder">Usa Recordatorio</label>
                        </div>
                        <div v-if="formData.additionalFields.uses_reminder" class="mt-2">
                          <label class="form-label">Días de Recordatorio</label>
                          <input
                            type="number"
                            class="form-control"
                            v-model="formData.additionalFields.reminder_days"
                            placeholder="Días"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="card bg-light mb-3">
                      <div class="card-body">
                        <h6 class="card-title">Estado</h6>
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="suspended" v-model="formData.additionalFields.suspended">
                          <label class="form-check-label" for="suspended">
                            <span class="text-danger">Suspendido</span>
                          </label>
                        </div>
                        <small class="text-muted">El producto no estará disponible para venta si está suspendido</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB 6: IMÁGENES -->
              <div class="tab-pane fade" id="imagenes" role="tabpanel" aria-labelledby="tab-imagenes">
                <div class="row">
                  <div class="col-md-12">
                    <h5 class="mb-3">Galería de Imágenes del Producto</h5>

                    <div class="mb-4">
                      <div class="image-upload-box border border-2 border-dashed rounded p-4 text-center" style="min-height: 200px;">
                        <input
                          type="file"
                          ref="galleryInput"
                          @change="handleGalleryImages"
                          accept="image/*"
                          multiple
                          class="d-none"
                          id="galleryUpload"
                        >
                        <label for="galleryUpload" class="cursor-pointer">
                          <i class="ti ti-cloud-upload" style="font-size: 48px; color: #6c757d;"></i>
                          <h6 class="mt-3">Haz clic o arrastra imágenes aquí</h6>
                          <p class="text-muted">Soporta: JPG, PNG, GIF (Max: 5MB por imagen)</p>
                          <button type="button" class="btn btn-primary mt-2" @click="$refs.galleryInput.click()">
                            <i class="ti ti-photo-plus me-2"></i>Seleccionar Imágenes
                          </button>
                        </label>
                      </div>
                    </div>

                    <div v-if="formData.gallery.length > 0" class="row">
                      <div
                        v-for="(image, index) in formData.gallery"
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
                            <button
                              type="button"
                              class="btn btn-danger btn-sm position-absolute"
                              style="top: 10px; right: 10px;"
                              @click="removeGalleryImage(index)"
                            >
                              <i class="ti ti-trash"></i>
                            </button>
                          </div>
                          <div class="card-body p-2">
                            <small class="text-muted">{{ image.name }}</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-else class="alert alert-info text-center">
                      <i class="ti ti-info-circle me-2"></i>
                      No hay imágenes en la galería. Sube algunas imágenes para mostrar tu producto.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de Acción (Solo formulario completo) -->
        <div class="card mt-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <button
                type="button"
                class="btn btn-secondary"
                @click="$router.push('/inventory/product-list')"
              >
                <i class="ti ti-x me-2"></i>CERRAR
              </button>

              <div>
                <button
                  type="button"
                  class="btn btn-danger me-2"
                  @click="clearForm"
                >
                  <i class="ti ti-trash me-2"></i>ELIMINAR
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSaving"
                >
                  <i class="ti ti-device-floppy me-2"></i>
                  {{ isSaving ? 'GUARDANDO...' : 'GUARDAR' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
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
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'EditProduct',
  data() {
    return {
      productId: null,
      formMode: 'full', // 'full' o 'quick'
      isSaving: false,
      isLoading: true,
      formData: {
        code: '',
        name: '',
        short_name: '',
        item_type: null,
        unit: 'Unidad',
        image: null,
        imagePreview: null,
        category_id: null,
        subcategory_id: null,
        weight: null,
        milligrams: null,
        alcohol_percentage: null,
        warranty_value: null,
        warranty_unit: 'Días',
        brand_id: null,
        model: '',
        reference: '',
        cost: 0,
        previous_cost: 0,
        average_cost: 0,
        stock: 0,
        description: '',
        hashtags: '',

        // Existencias por bodega
        warehouseStock: {},

        // Precios
        use_percentage_profit: false,
        use_group_commission: false,
        group_commission: 0,
        prices: [
          { profit_percentage: 0, net: 0, total: 0, commission: 0 },
          { profit_percentage: 0, net: 0, total: 0, commission: 0 },
          { profit_percentage: 0, net: 0, total: 0, commission: 0 },
          { profit_percentage: 0, net: 0, total: 0, commission: 0 },
          { profit_percentage: 0, net: 0, total: 0, commission: 0 },
          { profit_percentage: 0, net: 0, total: 0, commission: 0 }
        ],

        // Impuestos
        taxConfig: {},

        // Campos Adicionales
        additionalFields: {
          uses_stock: true,
          fractional: false,
          is_integrated: false,
          is_grouped: false,
          uses_barcode: false,
          uses_lots: false,
          uses_expiration: false,
          uses_production: false,
          uses_sizes_colors: false,
          uses_multi_vendors: false,
          on_discount: false,
          gift_card: false,
          uses_serials: false,
          is_online_order: false,
          hide_from_eshop: false,
          featured_eshop: false,
          uses_reminder: false,
          reminder_days: 0,
          suspended: false
        },

        // Galería
        gallery: []
      },

      // Catálogos
      itemTypes: [
        { label: 'Producto', value: 'product' },
        { label: 'Servicio', value: 'service' },
        { label: 'Combo', value: 'combo' }
      ],
      units: [
        { label: 'Unidad', value: 'Unidad' },
        { label: 'Caja', value: 'Caja' },
        { label: 'Kilogramo', value: 'Kilogramo' },
        { label: 'Gramo', value: 'Gramo' },
        { label: 'Litro', value: 'Litro' },
        { label: 'Mililitro', value: 'Mililitro' },
        { label: 'Metro', value: 'Metro' },
        { label: 'Centímetro', value: 'Centímetro' }
      ],
      warrantyUnits: [
        { label: 'Días', value: 'Días' },
        { label: 'Meses', value: 'Meses' },
        { label: 'Años', value: 'Años' }
      ],
      categories: [],
      subcategories: [],
      brands: [],
      warehouses: [],
      taxes: [],
      useConsecutive: false,
      quickProfitPercent: 0,
      selectedQuickTax: null,
      usePercentageCalc: true
    };
  },

  computed: {
    valuedInventory() {
      return (this.formData.stock || 0) * (this.formData.cost || 0);
    },

    totalStock() {
      const totals = {
        current: 0,
        min: 0,
        max: 0,
        committed: 0,
        available: 0
      };

      Object.values(this.formData.warehouseStock).forEach(stock => {
        totals.current += parseFloat(stock.current || 0);
        totals.min += parseFloat(stock.min || 0);
        totals.max += parseFloat(stock.max || 0);
        totals.committed += parseFloat(stock.committed || 0);
        totals.available += parseFloat(stock.available || 0);
      });

      return totals;
    },

    totalTaxes() {
      let total = 0;
      Object.values(this.formData.taxConfig).forEach(taxConf => {
        if (taxConf.applies_to_sales) {
          total += parseFloat(taxConf.amount || 0);
        }
      });
      return total;
    }
  },

  mounted() {
    this.productId = this.$route.params.id;
    this.loadCatalogs();
    this.initializeWarehouses();
    this.initializeTaxes();
    this.loadProductData();
  },

  methods: {
    async loadProductData() {
      if (!this.productId) {
        this.$router.push('/inventory/product-list');
        return;
      }

      try {
        this.isLoading = true;
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`http://localhost:3000/api/v1/products/${this.productId}`, { headers });
        const product = response.data.data;

        // Cargar datos del producto
        this.formData.code = product.code;
        this.formData.name = product.name;
        this.formData.short_name = product.short_name;
        this.formData.category_id = product.category_id;
        this.formData.subcategory_id = product.subcategory_id;
        this.formData.brand_id = product.brand_id;
        this.formData.cost = product.cost;
        this.formData.description = product.description;
        this.formData.weight = product.weight;
        this.formData.unit = product.unit || 'Unidad';
        this.formData.stock = product.stock;

        // Cargar precios
        for (let i = 0; i < 6; i++) {
          this.formData.prices[i].total = product[`price_${i + 1}`] || 0;
        }

        // Cargar subcategorías si hay categoría
        if (product.category_id) {
          await this.loadSubcategories();
        }

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
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Cargar categorías
        const categoriesRes = await axios.get('http://localhost:3000/api/v1/categories', { headers });
        this.categories = categoriesRes.data.data || [];

        // Cargar marcas
        const brandsRes = await axios.get('http://localhost:3000/api/v1/brands', { headers });
        this.brands = brandsRes.data.data || [];

        // Cargar bodegas (warehouses)
        this.warehouses = [
          { id: 1, code: 'BODEGA 101', name: 'TIENDA' },
          { id: 2, code: 'BODEGA 102', name: '14 CALLE' },
          { id: 3, code: 'BODEGA 103', name: 'AVENIDA RAMON ROSA' },
          { id: 4, code: 'BODEGA 104', name: '15 CALLE ESQUINA' }
        ];

        this.initializeWarehouseStock();
      } catch (error) {
        console.error('Error loading catalogs:', error);
        // Silenciosamente continuar si falla (por autenticación)
      }
    },

    async loadSubcategories() {
      if (!this.formData.category_id) {
        this.subcategories = [];
        this.formData.subcategory_id = null;
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`http://localhost:3000/api/v1/subcategories?category_id=${this.formData.category_id}`, { headers });
        this.subcategories = res.data.data || [];
      } catch (error) {
        console.error('Error loading subcategories:', error);
        this.subcategories = [];
      }
    },

    initializeWarehouseStock() {
      this.warehouses.forEach(warehouse => {
        this.formData.warehouseStock[warehouse.id] = {
          current: 0,
          min: 0,
          max: 1000,
          committed: 0,
          available: 0
        };
      });
    },

    initializeWarehouses() {
      // Ya se inicializan en loadCatalogs
    },

    initializeTaxes() {
      this.taxes = [
        { id: 1, name: 'EXENTO', rate: 0 },
        { id: 2, name: 'I.S.V 18', rate: 18 },
        { id: 3, name: 'I.S.V 15', rate: 15 }
      ];

      this.taxes.forEach(tax => {
        this.formData.taxConfig[tax.id] = {
          applies_to_sales: false,
          applies_to_purchases: false,
          amount: 0
        };
      });
    },

    getWarehouseStock(warehouseId) {
      if (!this.formData.warehouseStock[warehouseId]) {
        this.formData.warehouseStock[warehouseId] = {
          current: 0,
          min: 0,
          max: 1000,
          committed: 0,
          available: 0
        };
      }
      return this.formData.warehouseStock[warehouseId];
    },

    calculateAvailable(warehouseId) {
      const stock = this.getWarehouseStock(warehouseId);
      stock.available = (parseFloat(stock.current) || 0) - (parseFloat(stock.committed) || 0);
    },

    getTaxConfig(taxId) {
      if (!this.formData.taxConfig[taxId]) {
        this.formData.taxConfig[taxId] = {
          applies_to_sales: false,
          applies_to_purchases: false,
          amount: 0
        };
      }
      return this.formData.taxConfig[taxId];
    },

    calculateTaxAmount(taxId) {
      const tax = this.taxes.find(t => t.id === taxId);
      const config = this.getTaxConfig(taxId);

      if (config.applies_to_sales && this.formData.prices[0].total > 0) {
        config.amount = (this.formData.prices[0].total * tax.rate) / 100;
      } else {
        config.amount = 0;
      }
    },

    calculatePrice(index) {
      if (!this.formData.use_percentage_profit) return;

      const price = this.formData.prices[index];
      const cost = parseFloat(this.formData.cost) || 0;
      const profit = parseFloat(price.profit_percentage) || 0;

      price.net = cost * (1 + profit / 100);
      price.total = price.net;

      // Recalcular impuestos si es el primer precio
      if (index === 0) {
        this.taxes.forEach(tax => {
          this.calculateTaxAmount(tax.id);
        });
      }
    },

    calculateProfitFromPrice(index) {
      if (this.formData.use_percentage_profit) return;

      const price = this.formData.prices[index];
      const cost = parseFloat(this.formData.cost) || 0;
      const total = parseFloat(price.total) || 0;

      if (cost > 0) {
        price.profit_percentage = ((total - cost) / cost) * 100;
        price.net = total;
      }

      // Recalcular impuestos si es el primer precio
      if (index === 0) {
        this.taxes.forEach(tax => {
          this.calculateTaxAmount(tax.id);
        });
      }
    },

    applyGroupCommission() {
      const commission = parseFloat(this.formData.group_commission) || 0;
      this.formData.prices.forEach(price => {
        price.commission = commission;
      });
    },

    handleMainImage(event) {
      const file = event.target.files[0];
      if (file) {
        this.formData.image = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.formData.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    removeMainImage() {
      this.formData.image = null;
      this.formData.imagePreview = null;
      this.$refs.mainImageInput.value = '';
    },

    handleGalleryImages(event) {
      const files = Array.from(event.target.files);

      files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire({
            icon: 'warning',
            title: 'Archivo muy grande',
            text: `${file.name} excede el tamaño máximo de 5MB`
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          this.formData.gallery.push({
            file: file,
            name: file.name,
            preview: e.target.result
          });
        };
        reader.readAsDataURL(file);
      });
    },

    removeGalleryImage(index) {
      this.formData.gallery.splice(index, 1);
    },

    async generateCode() {
      try {
        // Generar código automático basado en categoría
        const category = this.categories.find(c => c.id === this.formData.category_id);
        let prefix = 'PRD';

        if (category) {
          prefix = category.name.substring(0, 3).toUpperCase();
        }

        // Generar número aleatorio
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.formData.code = `${prefix}-${random}-9`;
      } catch (error) {
        console.error('Error generating code:', error);
      }
    },

    async submitForm() {
      // Validaciones básicas
      if (!this.formData.code || !this.formData.name || !this.formData.cost) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos requeridos',
          text: 'Por favor completa todos los campos obligatorios'
        });
        return;
      }

      this.isSaving = true;

      try {
        const token = localStorage.getItem('token');
        const formDataToSend = new FormData();

        // Datos básicos
        formDataToSend.append('code', this.formData.code);
        formDataToSend.append('name', this.formData.name);
        formDataToSend.append('short_name', this.formData.short_name || '');
        formDataToSend.append('unit', this.formData.unit);
        formDataToSend.append('category_id', this.formData.category_id || '');
        formDataToSend.append('subcategory_id', this.formData.subcategory_id || '');
        formDataToSend.append('brand_id', this.formData.brand_id || '');
        formDataToSend.append('cost', this.formData.cost);
        formDataToSend.append('description', this.formData.description || '');
        formDataToSend.append('weight', this.formData.weight || '');
        formDataToSend.append('fractional', this.formData.additionalFields.fractional ? 1 : 0);

        // Precios
        for (let i = 0; i < 6; i++) {
          formDataToSend.append(`price_${i + 1}`, this.formData.prices[i].total || 0);
        }

        // Stock total
        formDataToSend.append('stock', this.totalStock.current);
        formDataToSend.append('min_stock', this.totalStock.min);
        formDataToSend.append('max_stock', this.totalStock.max);

        // Imagen principal
        if (this.formData.image) {
          formDataToSend.append('image', this.formData.image);
        }

        // Galería (guardar como JSON por ahora)
        formDataToSend.append('gallery', JSON.stringify(this.formData.gallery.map(img => img.name)));
        formDataToSend.append('warehouse_stock', JSON.stringify(this.formData.warehouseStock));
        formDataToSend.append('tax_config', JSON.stringify(this.formData.taxConfig));
        formDataToSend.append('additional_fields', JSON.stringify(this.formData.additionalFields));

        const headers = {
          'Content-Type': 'multipart/form-data'
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        await axios.put(`http://localhost:3000/api/v1/products/${this.productId}`, formDataToSend, { headers });

        Swal.fire({
          icon: 'success',
          title: 'Producto Actualizado',
          text: 'El producto se ha actualizado exitosamente',
          timer: 2000
        });

        setTimeout(() => {
          this.$router.push('/inventory/product-list');
        }, 2000);

      } catch (error) {
        console.error('Error saving product:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al guardar el producto'
        });
      } finally {
        this.isSaving = false;
      }
    },

    clearForm() {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Se perderán todos los datos ingresados',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.$router.go(0); // Recargar la página
        }
      });
    },

    refreshForm() {
      this.loadCatalogs();
    },

    toggleHeader() {
      document.getElementById('collapse-header').classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    },

    setFormMode(mode) {
      this.formMode = mode;
    },

    calculateQuickPrice() {
      if (this.usePercentageCalc && this.formData.cost > 0) {
        const cost = parseFloat(this.formData.cost) || 0;
        const profit = parseFloat(this.quickProfitPercent) || 0;
        this.formData.prices[0].total = cost * (1 + profit / 100);
      }
    },

    toggleQuickPriceCalc() {
      this.usePercentageCalc = !this.usePercentageCalc;
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

.image-upload {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.image-upload:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.image-upload input[type="file"] {
  display: none;
}

.image-uploads {
  cursor: pointer;
}

.cursor-pointer {
  cursor: pointer;
}

.table-responsive {
  overflow-x: auto;
}

.form-check-input:checked {
  background-color: #007bff;
  border-color: #007bff;
}

.card {
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.btn-primaryadd {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
}
</style>
