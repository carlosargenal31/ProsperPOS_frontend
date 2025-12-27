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
                  <Multiselect
                    v-model="formData.category_id"
                    :options="categories"
                    :searchable="true"
                    :create-option="false"
                    valueProp="id"
                    label="name"
                    placeholder="GRUPOS"
                    @change="loadSubcategories"
                  />
                </div>
              </div>

              <!-- SubGrupo -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">SubGrupo</label>
                  <Multiselect
                    v-model="formData.subcategory_id"
                    :options="subcategories"
                    :searchable="true"
                    :create-option="false"
                    valueProp="id"
                    label="name"
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
                  <Multiselect
                    v-model="formData.activeTaxId"
                    :options="taxes"
                    :searchable="true"
                    :create-option="false"
                    valueProp="id"
                    label="name"
                    placeholder="SELECCIONE UN IMPUESTO"
                    @change="handleTaxChange"
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
                      <label class="form-label">Código <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.code"
                        placeholder="Ej: C-0001-9"
                        required
                      >
                    </div>
                  </div>

                  <!-- Unidad -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Unidad <span class="text-danger">*</span></label>
                      <Multiselect
                        v-model="formData.unit_id"
                        :options="units"
                        :searchable="true"
                        :create-option="false"
                        valueProp="id"
                        label="name"
                        placeholder="Seleccione una unidad"
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
                      <div class="d-flex align-items-center gap-3">
                        <div v-if="formData.imagePreview || formData.currentImageUrl" class="position-relative">
                          <img
                            :src="formData.imagePreview || formData.currentImageUrl"
                            alt="Producto"
                            style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 2px solid #dee2e6;"
                          >
                        </div>
                        <div v-else class="d-flex align-items-center justify-content-center bg-light"
                             style="width: 150px; height: 150px; border-radius: 8px; border: 2px dashed #dee2e6;">
                          <i class="ti ti-photo" style="font-size: 48px; color: #adb5bd;"></i>
                        </div>
                        <div class="flex-grow-1">
                          <input
                            type="file"
                            ref="mainImageInput"
                            @change="handleMainImage"
                            accept="image/*"
                            class="d-none"
                            id="mainImageUpload"
                          >
                          <button
                            type="button"
                            class="btn btn-primary"
                            @click="$refs.mainImageInput.click()"
                          >
                            <i class="ti ti-upload me-2"></i>
                            {{ formData.imagePreview || formData.currentImageUrl ? 'Cambiar Imagen' : 'Subir Imagen' }}
                          </button>
                          <button
                            v-if="formData.imagePreview || formData.currentImageUrl"
                            type="button"
                            class="btn btn-danger ms-2"
                            @click="removeMainImage"
                          >
                            <i class="ti ti-trash me-2"></i>Eliminar
                          </button>
                          <div class="mt-2">
                            <small class="text-muted">Formatos: JPG, PNG, GIF (Max. 5MB)</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Categoría -->
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Categoría <span class="text-danger">*</span></label>
                      <Multiselect
                        v-model="formData.category_id"
                        :options="categories"
                        :searchable="true"
                        :create-option="false"
                        valueProp="id"
                        label="name"
                        placeholder="Seleccione categoría"
                        @change="loadSubcategories"
                      />
                    </div>
                  </div>

                  <!-- Subcategoría -->
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Subcategoría</label>
                      <Multiselect
                        v-model="formData.subcategory_id"
                        :options="subcategories"
                        :searchable="true"
                        :create-option="false"
                        valueProp="id"
                        label="name"
                        placeholder="Seleccione subcategoría"
                        :disabled="!formData.category_id"
                      />
                    </div>
                  </div>

                  <!-- Marca -->
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Marca</label>
                      <Multiselect
                        v-model="formData.brand_id"
                        :options="brands"
                        :searchable="true"
                        :create-option="false"
                        valueProp="id"
                        label="name"
                        placeholder="Seleccione marca"
                      />
                    </div>
                  </div>

                  <!-- Proveedor -->
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Proveedor</label>
                      <Multiselect
                        v-model="formData.supplier_id"
                        :options="suppliers"
                        :searchable="true"
                        :create-option="false"
                        valueProp="id"
                        label="nombre"
                        placeholder="Seleccione proveedor"
                      />
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

                  <!-- Peso -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Peso (KG)</label>
                      <div class="input-group">
                        <input
                          type="number"
                          step="0.01"
                          class="form-control"
                          v-model="formData.weight"
                          placeholder="0.00"
                        >
                        <span class="input-group-text">KG</span>
                      </div>
                    </div>
                  </div>

                  <!-- Mostrar en Tienda en Línea -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Mostrar en Tienda en Línea</label>
                      <div class="form-check form-switch" style="margin-top: 10px;">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="showInOnlineStore"
                          v-model="formData.show_in_online_store"
                        >
                        <label class="form-check-label" for="showInOnlineStore">
                          {{ formData.show_in_online_store ? 'Sí' : 'No' }}
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Estado: Activo/Inactivo -->
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Estado del Producto</label>
                      <div class="form-check form-switch" style="margin-top: 10px;">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="isActive"
                          v-model="formData.is_active"
                        >
                        <label class="form-check-label" for="isActive">
                          {{ formData.is_active ? 'Activo' : 'Inactivo' }}
                        </label>
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
                        <small class="ms-3 text-muted">({{ totalStock.current }} unidades × L {{ formData.cost }})</small>
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
                            <th width="150">Existencia Actual</th>
                            <th width="150">Mínimo</th>
                            <th width="150">Máximo</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="warehouse in warehouses" :key="warehouse.id">
                            <td>
                              <strong>{{ warehouse.nombre }}</strong>
                            </td>
                            <td class="text-end">
                              {{ formatQuantity(getWarehouseStock(warehouse.id).current) }}
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
                            <th width="150">% Utilidad</th>
                            <th width="150">Bruto</th>
                            <th width="150">Total Venta</th>
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
                                  :value="formatPrice(formData.prices[i-1].profit_percentage)"
                                  @input="e => updateProfitPercentage(i-1, e.target.value)"
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
                                  :value="formatPrice(formData.prices[i-1].net)"
                                  @input="e => updateBruto(i-1, e.target.value)"
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
                                  :value="formatPrice(formData.prices[i-1].total)"
                                  @input="e => updateTotal(i-1, e.target.value)"
                                >
                              </div>
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
                            <th width="100">Tasa (%)</th>
                            <th width="100" class="text-center">Activo</th>
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
                                  type="radio"
                                  :id="'tax-' + tax.id"
                                  :value="tax.id"
                                  v-model="formData.activeTaxId"
                                  @change="handleTaxChange"
                                >
                              </div>
                            </td>
                            <td class="text-end">
                              L {{ formData.activeTaxId === tax.id ? calculateTaxAmountForDisplay(tax) : '0.00' }}
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
                  class="btn btn-warning me-2"
                  @click="suspendProduct"
                >
                  <i class="ti ti-ban me-2"></i>SUSPENDER
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
import api from '@/utils/axios';
import Swal from 'sweetalert2';
import Multiselect from '@vueform/multiselect';
import '@vueform/multiselect/themes/default.css';

export default {
  name: 'EditProduct',
  components: {
    Multiselect
  },
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
        unit_id: null,
        image: null,
        imagePreview: null,
        currentImageUrl: null,
        category_id: null,
        subcategory_id: null,
        weight: null,
        milligrams: null,
        alcohol_percentage: null,
        warranty_value: null,
        warranty_unit: 'Días',
        brand_id: null,
        supplier_id: null,
        model: '',
        reference: '',
        cost: 0,
        description: '',
        show_in_online_store: false,
        weight: null,
        is_active: true,

        // Existencias por bodega
        warehouseStock: {},

        // Precios
        prices: [
          { profit_percentage: 0, net: 0, total: 0 },
          { profit_percentage: 0, net: 0, total: 0 },
          { profit_percentage: 0, net: 0, total: 0 },
          { profit_percentage: 0, net: 0, total: 0 },
          { profit_percentage: 0, net: 0, total: 0 },
          { profit_percentage: 0, net: 0, total: 0 }
        ],

        // Impuesto activo (solo uno)
        activeTaxId: null,

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
          suspended: false,
          show_in_online_store: false
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
      units: [],
      warrantyUnits: [
        { label: 'Días', value: 'Días' },
        { label: 'Meses', value: 'Meses' },
        { label: 'Años', value: 'Años' }
      ],
      categories: [],
      subcategories: [],
      brands: [],
      suppliers: [],
      warehouses: [],
      taxes: [],
      useConsecutive: false,
      quickProfitPercent: 0,
      usePercentageCalc: true
    };
  },

  computed: {
    valuedInventory() {
      return (this.totalStock.current || 0) * (this.formData.cost || 0);
    },

    totalStock() {
      const totals = {
        current: 0,
        min: 0,
        max: 0
      };

      Object.values(this.formData.warehouseStock).forEach(stock => {
        totals.current += parseFloat(stock.current || 0);
        totals.min += parseFloat(stock.min || 0);
        totals.max += parseFloat(stock.max || 0);
      });

      return totals;
    },

    totalTaxAmount() {
      if (!this.formData.activeTaxId) return 0;

      const activeTax = this.taxes.find(t => t.id === this.formData.activeTaxId);
      if (!activeTax) return 0;

      const brutoPrice = parseFloat(this.formData.prices[0].net) || 0;
      return (brutoPrice * activeTax.rate) / 100;
    }
  },

  async mounted() {
    this.productId = this.$route.params.id;
    await this.loadCatalogs();  // Wait for catalogs (including warehouses) to load first
    this.initializeWarehouses();
    await this.initializeTaxes();
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

        const response = await api.get(`/products/${this.productId}`);
        const product = response.data.data;

        // Cargar datos del producto
        this.formData.code = product.code;
        this.formData.name = product.name;
        this.formData.short_name = product.short_name;
        this.formData.category_id = product.category_id;
        this.formData.subcategory_id = product.subcategory_id;
        this.formData.brand_id = product.brand_id;
        this.formData.supplier_id = product.supplier_id;
        this.formData.cost = product.cost;
        this.formData.description = product.description;
        this.formData.weight = product.weight;
        this.formData.unit_id = product.unit_id;
        this.formData.show_in_online_store = product.show_in_online_store || false;
        this.formData.is_active = product.is_active !== undefined ? Boolean(product.is_active) : true;
        this.formData.currentImageUrl = product.image || null;

        // Cargar precios (el precio en BD es el bruto, sin impuesto)
        for (let i = 0; i < 6; i++) {
          this.formData.prices[i].net = product[`price_${i + 1}`] || 0;

          // Calcular porcentaje de utilidad basado en costo y precio bruto
          const cost = parseFloat(this.formData.cost) || 0;
          const net = parseFloat(this.formData.prices[i].net) || 0;
          if (cost > 0 && net > 0) {
            this.formData.prices[i].profit_percentage = ((net - cost) / cost) * 100;
          } else {
            this.formData.prices[i].profit_percentage = 0;
          }
        }

        // Cargar impuesto activo si existe
        if (product.tax_id) {
          this.formData.activeTaxId = product.tax_id;
        }

        // Recalcular totales con impuesto
        this.recalculateAllPriceTotals();

        // Cargar subcategorías si hay categoría
        if (product.category_id) {
          await this.loadSubcategories();
        }

        // Cargar existencias por bodega desde la tabla stock
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
        // Cargar categorías
        const categoriesRes = await api.get('/categories');
        this.categories = categoriesRes.data.data || [];

        // Cargar marcas
        const brandsRes = await api.get('/brands');
        this.brands = brandsRes.data.data || [];

        // Cargar proveedores
        const suppliersRes = await api.get('/suppliers');
        this.suppliers = suppliersRes.data.data || [];

        // Cargar unidades
        const unitsRes = await api.get('/units');
        this.units = unitsRes.data.data || [];

        // Cargar bodegas desde la base de datos
        const warehousesRes = await api.get('/warehouses');
        this.warehouses = warehousesRes.data.data || [];

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
        const res = await api.get(`/subcategories?category_id=${this.formData.category_id}`);
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
          }
          else if (typeof res.data.data.stock === 'object') {
            stockData = Object.values(res.data.data.stock);
          }
        }

        // Actualizar las existencias de cada bodega
        if (Array.isArray(stockData) && stockData.length > 0) {
          stockData.forEach(stock => {
            if (this.formData.warehouseStock[stock.warehouse_id]) {
              this.formData.warehouseStock[stock.warehouse_id].current = stock.quantity || 0;
              this.formData.warehouseStock[stock.warehouse_id].min = stock.min_stock || 0;
              this.formData.warehouseStock[stock.warehouse_id].max = stock.max_stock || 1000;
            }
          });
        }
      } catch (error) {
        console.error('Error loading warehouse stock:', error);
      }
    },

    initializeWarehouseStock() {
      this.warehouses.forEach(warehouse => {
        if (!this.formData.warehouseStock[warehouse.id]) {
          this.formData.warehouseStock[warehouse.id] = {
            current: 0,
            min: 0,
            max: 1000
          };
        }
      });
    },

    initializeWarehouses() {
      // Ya se inicializan en loadCatalogs
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
      if (!this.formData.warehouseStock[warehouseId]) {
        this.formData.warehouseStock[warehouseId] = {
          current: 0,
          min: 0,
          max: 1000
        };
      }
      return this.formData.warehouseStock[warehouseId];
    },

    // Calcular el monto de impuesto para mostrar en la tabla
    calculateTaxAmountForDisplay(tax) {
      const brutoPrice = parseFloat(this.formData.prices[0].net) || 0;
      const amount = (brutoPrice * tax.rate) / 100;
      return amount.toFixed(2);
    },

    // Cuando cambia el impuesto activo, recalcular todos los totales
    handleTaxChange() {
      this.recalculateAllPriceTotals();
    },

    // Cuando cambia el porcentaje de utilidad, calcular bruto y total
    calculatePriceFromProfit(index) {
      const price = this.formData.prices[index];
      const cost = parseFloat(this.formData.cost) || 0;
      const profit = parseFloat(price.profit_percentage) || 0;

      if (cost <= 0) {
        return;
      }

      // Calcular precio bruto (sin impuesto)
      price.net = cost * (1 + profit / 100);

      // Calcular precio total con impuesto
      const activeTax = this.taxes.find(t => t.id === this.formData.activeTaxId);
      const taxRate = activeTax ? activeTax.rate : 0;
      price.total = price.net * (1 + taxRate / 100);
    },

    // Cuando cambia el precio bruto, calcular porcentaje de utilidad y total
    calculateProfitFromBruto(index) {
      const price = this.formData.prices[index];
      const cost = parseFloat(this.formData.cost) || 0;
      const net = parseFloat(price.net) || 0;

      if (cost > 0 && net > 0) {
        // Calcular porcentaje de utilidad
        price.profit_percentage = ((net - cost) / cost) * 100;
      } else {
        price.profit_percentage = 0;
      }

      // Calcular precio total con impuesto
      const activeTax = this.taxes.find(t => t.id === this.formData.activeTaxId);
      const taxRate = activeTax ? activeTax.rate : 0;
      price.total = net * (1 + taxRate / 100);
    },

    // Cuando cambia el total venta, calcular bruto (quitando impuesto) y porcentaje de utilidad
    calculateFromTotal(index) {
      const price = this.formData.prices[index];
      const cost = parseFloat(this.formData.cost) || 0;
      const total = parseFloat(price.total) || 0;

      // Obtener la tasa de impuesto
      const activeTax = this.taxes.find(t => t.id === this.formData.activeTaxId);
      const taxRate = activeTax ? activeTax.rate : 0;

      // Calcular bruto (precio sin impuesto) = total / (1 + tasa)
      if (taxRate > 0) {
        price.net = total / (1 + taxRate / 100);
      } else {
        price.net = total;
      }

      // Calcular porcentaje de utilidad
      if (cost > 0 && price.net > 0) {
        price.profit_percentage = ((price.net - cost) / cost) * 100;
      } else {
        price.profit_percentage = 0;
      }
    },

    // Wrapper methods para limitar a 2 decimales
    updateProfitPercentage(index, value) {
      const parsed = parseFloat(value) || 0;
      const rounded = Math.round(parsed * 100) / 100;
      this.formData.prices[index].profit_percentage = rounded;
      this.calculatePriceFromProfit(index);
    },

    updateBruto(index, value) {
      const parsed = parseFloat(value) || 0;
      const rounded = Math.round(parsed * 100) / 100;
      this.formData.prices[index].net = rounded;
      this.calculateProfitFromBruto(index);
    },

    updateTotal(index, value) {
      const parsed = parseFloat(value) || 0;
      const rounded = Math.round(parsed * 100) / 100;
      this.formData.prices[index].total = rounded;
      this.calculateFromTotal(index);
    },

    recalculateAllPriceTotals() {
      // Obtener el impuesto activo
      const activeTax = this.taxes.find(t => t.id === this.formData.activeTaxId);
      const taxRate = activeTax ? activeTax.rate : 0;

      // Recalcular el total con impuesto para todos los precios
      this.formData.prices.forEach(price => {
        const net = parseFloat(price.net) || 0;
        price.total = net * (1 + taxRate / 100);
      });
    },

    // Formatear precio a 2 decimales
    formatPrice(value) {
      const num = parseFloat(value);
      if (isNaN(num)) return '0.00';
      return num.toFixed(2);
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

    async loadGalleryImages() {
      try {
        const response = await api.get(`/products/${this.productId}/gallery`);
        const images = response.data.data || [];

        // Convertir las URLs de las imágenes existentes a objetos de galería
        this.formData.gallery = images.map(img => ({
          file: null, // No hay archivo local, es una URL remota
          name: img.image_url.split('/').pop(), // Extraer nombre del archivo de la URL
          preview: img.image_url,
          existing: true, // Marcar como imagen existente
          id: img.id
        }));

      } catch (error) {
        console.error('Error loading gallery images:', error);
        this.formData.gallery = [];
      }
    },

    formatQuantity(value) {
      const num = parseFloat(value);
      if (isNaN(num)) return '0.00';
      // Siempre mostrar 2 decimales
      return num.toFixed(2);
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
        const formDataToSend = new FormData();

        // Datos básicos
        formDataToSend.append('code', this.formData.code);
        formDataToSend.append('name', this.formData.name);
        formDataToSend.append('short_name', this.formData.short_name || '');
        formDataToSend.append('unit_id', this.formData.unit_id || '');
        formDataToSend.append('category_id', this.formData.category_id || '');
        formDataToSend.append('subcategory_id', this.formData.subcategory_id || '');
        formDataToSend.append('brand_id', this.formData.brand_id || '');
        formDataToSend.append('supplier_id', this.formData.supplier_id || '');
        formDataToSend.append('cost', this.formData.cost);
        formDataToSend.append('description', this.formData.description || '');
        formDataToSend.append('weight', this.formData.weight || '');
        formDataToSend.append('show_in_online_store', this.formData.show_in_online_store ? 1 : 0);
        formDataToSend.append('is_active', this.formData.is_active ? 1 : 0);

        // Precios (guardar el bruto, sin impuesto)
        for (let i = 0; i < 6; i++) {
          formDataToSend.append(`price_${i + 1}`, this.formData.prices[i].net || 0);
        }

        // Imagen principal (archivo nuevo)
        if (this.formData.image && this.formData.image instanceof File) {
          formDataToSend.append('image', this.formData.image);
        }

        // Galería de imágenes (archivos nuevos)
        if (this.formData.gallery && this.formData.gallery.length > 0) {
          this.formData.gallery.forEach((item, index) => {
            // item tiene la estructura { file: File, name: string, preview: string }
            if (item.file && item.file instanceof File) {
              formDataToSend.append(`gallery_${index}`, item.file);
            }
          });
        }

        formDataToSend.append('warehouse_stock', JSON.stringify(this.formData.warehouseStock));
        formDataToSend.append('tax_id', this.formData.activeTaxId || '');
        formDataToSend.append('additional_fields', JSON.stringify(this.formData.additionalFields));

        await api.put(`/products/${this.productId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

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
    },

    async suspendProduct() {
      Swal.fire({
        title: '¿Suspender producto?',
        text: 'El producto se marcará como inactivo y no estará disponible para venta',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, suspender',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ffc107',
        cancelButtonColor: '#6c757d'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.put(
              `/products/${this.productId}`,
              { status: 'inactive', is_active: false }
            );

            Swal.fire({
              icon: 'success',
              title: 'Producto Suspendido',
              text: 'El producto ha sido suspendido exitosamente',
              timer: 2000
            });

            setTimeout(() => {
              this.$router.push('/inventory/product-list');
            }, 2000);
          } catch (error) {
            console.error('Error suspending product:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.response?.data?.message || 'Error al suspender el producto'
            });
          }
        }
      });
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
