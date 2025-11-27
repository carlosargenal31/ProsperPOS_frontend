<template>
  <!-- Add Coupon -->
  <div class="modal fade" id="add-coupon" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Registro de Cupones</h4>
              </div>
              <button
                type="button"
                class="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form @submit.prevent="submitAddForm" @keydown.enter="handleEnterKey">
              <div class="modal-body">
                <!-- Main Form Content (hidden when search panels are open) -->
                <div v-if="!showCategorySearch && !showSubcategorySearch && !showProductSearch">
                <!-- Código y Nombre -->
                <div class="row">
                  <div class="col-lg-3">
                    <div class="mb-3">
                      <label class="form-label">Código</label>
                      <input
                        type="text"
                        class="form-control bg-light"
                        v-model="formData.codigo"
                        readonly
                        disabled
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Nombre de Cupón <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.nombre"
                        placeholder="Nombre del cupón"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-lg-3">
                    <div class="mb-3">
                      <label class="form-label">Agencia</label>
                      <select class="form-select" v-model="formData.agencia_id">
                        <option value="">Seleccione una Agencia</option>
                        <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                          {{ branch.nombre }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Tipo de Aplicación -->
                <div class="row">
                  <div class="col-12">
                    <div class="mb-3">
                      <label class="form-label">Seleccionar:</label>
                      <div>
                        <div class="form-check form-check-inline">
                          <input
                            class="form-check-input"
                            type="radio"
                            id="grupo"
                            value="grupo"
                            v-model="formData.tipo_aplicacion"
                          />
                          <label class="form-check-label" for="grupo">
                            Seleccionar una categoría y/o producto en específico
                          </label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input
                            class="form-check-input"
                            type="radio"
                            id="multiple"
                            value="multiple"
                            v-model="formData.tipo_aplicacion"
                          />
                          <label class="form-check-label" for="multiple">
                            Seleccionar múltiples productos
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Categoría/Subcategoría/Producto -->
                <div v-if="formData.tipo_aplicacion === 'grupo'" class="row">
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Categoría</label>
                      <div class="input-group">
                        <input
                          type="text"
                          class="form-control"
                          v-model="formData.categoria_nombre"
                          placeholder="Buscar categoría"
                          readonly
                        />
                        <button class="btn btn-outline-secondary" type="button" @click="openCategorySearch">
                          <i class="ti ti-search"></i>
                        </button>
                        <button class="btn btn-outline-danger" type="button" @click="clearCategory">
                          <i class="ti ti-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Subcategoría</label>
                      <div class="input-group">
                        <input
                          type="text"
                          class="form-control"
                          v-model="formData.subcategoria_nombre"
                          placeholder="Buscar subcategoría"
                          readonly
                        />
                        <button class="btn btn-outline-secondary" type="button" @click="openSubcategorySearch" :disabled="!formData.categoria_id">
                          <i class="ti ti-search"></i>
                        </button>
                        <button class="btn btn-outline-danger" type="button" @click="clearSubcategory">
                          <i class="ti ti-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Producto</label>
                      <div class="input-group">
                        <input
                          type="text"
                          class="form-control"
                          v-model="formData.producto_nombre"
                          placeholder="Buscar producto"
                          readonly
                        />
                        <button class="btn btn-outline-secondary" type="button" @click="openProductSearch">
                          <i class="ti ti-search"></i>
                        </button>
                        <button class="btn btn-outline-danger" type="button" @click="clearProduct">
                          <i class="ti ti-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                <!-- End Main Form Content -->

                <!-- BÚSQUEDA DE CATEGORÍAS (INLINE) -->
                <div v-if="showCategorySearch" class="card border-primary mb-3">
                  <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">Búsqueda de Categorías</h6>
                    <button type="button" class="btn-close btn-close-white" @click="showCategorySearch = false"></button>
                  </div>
                  <div class="card-body">
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label">Buscar por:</label>
                        <select class="form-select form-select-sm" v-model="categorySearchBy">
                          <option value="nombre">Nombre</option>
                          <option value="codigo">Código</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Buscar:</label>
                        <div class="input-group input-group-sm">
                          <input
                            type="text"
                            class="form-control"
                            v-model="categorySearchTerm"
                            placeholder="Buscar..."
                            @keyup.enter="searchCategories"
                          />
                          <button class="btn btn-primary" type="button" @click="searchCategories">
                            <i class="ti ti-search"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                      <table class="table table-sm table-hover">
                        <thead class="table-light" style="position: sticky; top: 0;">
                          <tr>
                            <th>Código</th>
                            <th>Categoría</th>
                            <th>Estatus</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="paginatedCategories.length === 0">
                            <td colspan="3" class="text-center">No se encontraron resultados</td>
                          </tr>
                          <tr
                            v-for="category in paginatedCategories"
                            :key="category.id"
                            @click="selectCategory(category)"
                            style="cursor: pointer;"
                            class="table-row-hover"
                          >
                            <td>{{ category.id }}</td>
                            <td>{{ category.name || category.nombre }}</td>
                            <td>
                              <span class="badge bg-success">ACTIVO</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Paginación -->
                    <div class="d-flex justify-content-between align-items-center mt-2">
                      <small class="text-muted">
                        Mostrando {{ categoryStartIndex + 1 }} a {{ Math.min(categoryEndIndex, filteredCategories.length) }} de {{ filteredCategories.length }}
                      </small>
                      <nav>
                        <ul class="pagination pagination-sm mb-0">
                          <li class="page-item" :class="{ disabled: categoryCurrentPage === 1 }">
                            <a class="page-link" href="#" @click.prevent="categoryCurrentPage > 1 && categoryCurrentPage--">Anterior</a>
                          </li>
                          <li
                            class="page-item"
                            v-for="page in categoryTotalPages"
                            :key="page"
                            :class="{ active: categoryCurrentPage === page }"
                          >
                            <a class="page-link" href="#" @click.prevent="categoryCurrentPage = page">{{ page }}</a>
                          </li>
                          <li class="page-item" :class="{ disabled: categoryCurrentPage === categoryTotalPages }">
                            <a class="page-link" href="#" @click.prevent="categoryCurrentPage < categoryTotalPages && categoryCurrentPage++">Siguiente</a>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>

                <!-- BÚSQUEDA DE SUBCATEGORÍAS (INLINE) -->
                <div v-if="showSubcategorySearch" class="card border-info mb-3">
                  <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">Búsqueda de Subcategorías</h6>
                    <button type="button" class="btn-close btn-close-white" @click="showSubcategorySearch = false"></button>
                  </div>
                  <div class="card-body">
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label">Buscar por:</label>
                        <select class="form-select form-select-sm" v-model="subcategorySearchBy">
                          <option value="nombre">Nombre</option>
                          <option value="codigo">Código</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Buscar:</label>
                        <div class="input-group input-group-sm">
                          <input
                            type="text"
                            class="form-control"
                            v-model="subcategorySearchTerm"
                            placeholder="Buscar..."
                            @keyup.enter="searchSubcategories"
                          />
                          <button class="btn btn-info" type="button" @click="searchSubcategories">
                            <i class="ti ti-search"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                      <table class="table table-sm table-hover">
                        <thead class="table-light" style="position: sticky; top: 0;">
                          <tr>
                            <th>Código</th>
                            <th>Subcategoría</th>
                            <th>Estatus</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="paginatedSubcategories.length === 0">
                            <td colspan="3" class="text-center">No se encontraron resultados</td>
                          </tr>
                          <tr
                            v-for="subcategory in paginatedSubcategories"
                            :key="subcategory.id"
                            @click="selectSubcategory(subcategory)"
                            style="cursor: pointer;"
                            class="table-row-hover"
                          >
                            <td>{{ subcategory.id }}</td>
                            <td>{{ subcategory.name || subcategory.nombre }}</td>
                            <td>
                              <span class="badge bg-success">ACTIVO</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Paginación -->
                    <div class="d-flex justify-content-between align-items-center mt-2">
                      <small class="text-muted">
                        Mostrando {{ subcategoryStartIndex + 1 }} a {{ Math.min(subcategoryEndIndex, filteredSubcategories.length) }} de {{ filteredSubcategories.length }}
                      </small>
                      <nav>
                        <ul class="pagination pagination-sm mb-0">
                          <li class="page-item" :class="{ disabled: subcategoryCurrentPage === 1 }">
                            <a class="page-link" href="#" @click.prevent="subcategoryCurrentPage > 1 && subcategoryCurrentPage--">Anterior</a>
                          </li>
                          <li
                            class="page-item"
                            v-for="page in subcategoryTotalPages"
                            :key="page"
                            :class="{ active: subcategoryCurrentPage === page }"
                          >
                            <a class="page-link" href="#" @click.prevent="subcategoryCurrentPage = page">{{ page }}</a>
                          </li>
                          <li class="page-item" :class="{ disabled: subcategoryCurrentPage === subcategoryTotalPages }">
                            <a class="page-link" href="#" @click.prevent="subcategoryCurrentPage < subcategoryTotalPages && subcategoryCurrentPage++">Siguiente</a>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>

                <!-- BÚSQUEDA DE PRODUCTOS (INLINE) -->
                <div v-if="showProductSearch" class="card border-success mb-3">
                  <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">Búsqueda de Productos</h6>
                    <button type="button" class="btn-close btn-close-white" @click="showProductSearch = false"></button>
                  </div>
                  <div class="card-body">
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label">Buscar por:</label>
                        <select class="form-select form-select-sm" v-model="productSearchBy">
                          <option value="nombre">Nombre</option>
                          <option value="codigo">Código</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Buscar:</label>
                        <div class="input-group input-group-sm">
                          <input
                            type="text"
                            class="form-control"
                            v-model="productSearchTermModal"
                            placeholder="Buscar..."
                            @keyup.enter="searchProductsModal"
                          />
                          <button class="btn btn-success" type="button" @click="searchProductsModal">
                            <i class="ti ti-search"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                      <table class="table table-sm table-hover">
                        <thead class="table-light" style="position: sticky; top: 0;">
                          <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th>Estatus</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="paginatedProducts.length === 0">
                            <td colspan="3" class="text-center">No se encontraron resultados</td>
                          </tr>
                          <tr
                            v-for="product in paginatedProducts"
                            :key="product.id"
                            @click="selectProduct(product)"
                            style="cursor: pointer;"
                            class="table-row-hover"
                          >
                            <td>{{ product.code || product.codigo }}</td>
                            <td>{{ product.name || product.nombre }}</td>
                            <td>
                              <span class="badge bg-success">ACTIVO</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Paginación -->
                    <div class="d-flex justify-content-between align-items-center mt-2">
                      <small class="text-muted">
                        Mostrando {{ productStartIndex + 1 }} a {{ Math.min(productEndIndex, filteredProducts.length) }} de {{ filteredProducts.length }}
                      </small>
                      <nav>
                        <ul class="pagination pagination-sm mb-0">
                          <li class="page-item" :class="{ disabled: productCurrentPage === 1 }">
                            <a class="page-link" href="#" @click.prevent="productCurrentPage > 1 && productCurrentPage--">Anterior</a>
                          </li>
                          <li
                            class="page-item"
                            v-for="page in productTotalPages"
                            :key="page"
                            :class="{ active: productCurrentPage === page }"
                          >
                            <a class="page-link" href="#" @click.prevent="productCurrentPage = page">{{ page }}</a>
                          </li>
                          <li class="page-item" :class="{ disabled: productCurrentPage === productTotalPages }">
                            <a class="page-link" href="#" @click.prevent="productCurrentPage < productTotalPages && productCurrentPage++">Siguiente</a>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>

                <!-- Límites de Fecha -->
                <div class="row">
                  <div class="col-lg-12">
                    <div class="form-check mb-3">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="limitar-fecha"
                        v-model="formData.limitar_fecha"
                      />
                      <label class="form-check-label" for="limitar-fecha">
                        Limitar por rango de fecha
                      </label>
                    </div>
                    <div v-if="formData.limitar_fecha" class="row">
                      <div class="col-6">
                        <div class="mb-3">
                          <label class="form-label">Fecha Desde</label>
                          <input
                            type="date"
                            class="form-control"
                            v-model="formData.fecha_desde"
                          />
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="mb-3">
                          <label class="form-label">Fecha Hasta</label>
                          <input
                            type="date"
                            class="form-control"
                            v-model="formData.fecha_hasta"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tipo de Descuento -->
                <div class="row mt-3">
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Tipo de Descuento</label>
                      <div>
                        <div class="form-check form-check-inline">
                          <input
                            class="form-check-input"
                            type="radio"
                            id="porcentaje"
                            value="porcentaje"
                            v-model="formData.tipo_descuento"
                          />
                          <label class="form-check-label" for="porcentaje">
                            Porcentaje
                          </label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input
                            class="form-check-input"
                            type="radio"
                            id="monto"
                            value="monto"
                            v-model="formData.tipo_descuento"
                          />
                          <label class="form-check-label" for="monto">
                            Monto
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">
                        {{ formData.tipo_descuento === 'porcentaje' ? 'Porcentaje (%)' : 'Monto (L)' }}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        class="form-control"
                        v-model="formData.valor_descuento"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <!-- Suspender -->
                <div class="row mt-3">
                  <div class="col-lg-6">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="suspender"
                        v-model="formData.suspendida"
                      />
                      <label class="form-check-label" for="suspender">
                        Suspender
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Búsqueda de Productos Múltiples -->
                <div v-if="formData.tipo_aplicacion === 'multiple'" class="row mt-4">
                  <div class="col-12">
                    <h5>Producto</h5>
                    <div class="mb-3">
                      <div class="input-group">
                        <input
                          type="text"
                          class="form-control"
                          v-model="productSearch"
                          placeholder="Buscar producto por código o nombre"
                          @keyup.enter="searchProducts"
                        />
                        <button class="btn btn-primary" type="button" @click="searchProducts">
                          <i class="ti ti-search"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Lista de productos buscados -->
                    <div v-if="searchResults.length > 0" class="mb-3">
                      <div class="list-group">
                        <button
                          v-for="product in paginatedSearchResults"
                          :key="product.id"
                          type="button"
                          class="list-group-item list-group-item-action"
                          @click="addProductToCoupon(product)"
                        >
                          <strong>{{ product.code || product.codigo }}</strong> - {{ product.name || product.nombre }}
                        </button>
                      </div>

                      <!-- Paginación de resultados de búsqueda -->
                      <div v-if="searchResultsTotalPages > 1" class="d-flex justify-content-center align-items-center gap-2 mt-3">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-primary"
                          @click="searchResultsCurrentPage = Math.max(1, searchResultsCurrentPage - 1)"
                          :disabled="searchResultsCurrentPage === 1"
                        >
                          <i class="ti ti-chevron-left"></i>
                        </button>
                        <span class="text-muted">
                          Página {{ searchResultsCurrentPage }} de {{ searchResultsTotalPages }}
                        </span>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-primary"
                          @click="searchResultsCurrentPage = Math.min(searchResultsTotalPages, searchResultsCurrentPage + 1)"
                          :disabled="searchResultsCurrentPage === searchResultsTotalPages"
                        >
                          <i class="ti ti-chevron-right"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Tabla de productos agregados -->
                    <div class="alert alert-info" role="alert">
                      <i class="ti ti-info-circle"></i> Para los productos que tengan el descuento en "cero" se tomará el descuento base de la cup�n.
                    </div>

                    <div class="table-responsive">
                      <table class="table table-sm">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th>%Prc</th>
                            <th>Monto</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="formData.items.length === 0">
                            <td colspan="5" class="text-center text-muted">No hay productos agregados</td>
                          </tr>
                          <tr v-for="(item, index) in formData.items" :key="index">
                            <td>{{ item.product_code }}</td>
                            <td>{{ item.product_name }}</td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                class="form-control form-control-sm"
                                v-model="item.descuento_porcentaje"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                class="form-control form-control-sm"
                                v-model="item.descuento_monto"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                class="btn btn-sm btn-danger"
                                @click="removeProductFromCoupon(index)"
                              >
                                <i class="ti ti-trash"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cerrar
                </button>
                <button type="button" class="btn btn-danger" @click="openDeleteModal" v-if="formData.id">
                  Eliminar
                </button>
                <button type="submit" class="btn btn-success" :disabled="isSubmitting">
                  {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- View Coupon Modal -->
  <div class="modal fade" id="view-coupon" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Detalles de la cup�n</h4>
              </div>
              <button
                type="button"
                class="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body" v-if="Coupon">
              <div class="row">
                <div class="col-lg-3 mb-3">
                  <label class="form-label fw-bold">Código:</label>
                  <p class="form-control-plaintext">{{ Coupon.codigo }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Nombre:</label>
                  <p class="form-control-plaintext">{{ Coupon.nombre }}</p>
                </div>
                <div class="col-lg-3 mb-3">
                  <label class="form-label fw-bold">Agencia:</label>
                  <p class="form-control-plaintext">{{ Coupon.agencia_nombre || 'N/A' }}</p>
                </div>
              </div>

              <!-- Para cup�ns de tipo grupo o producto único -->
              <div v-if="Coupon.tipo_aplicacion !== 'multiple'" class="row">
                <div class="col-lg-4 mb-3">
                  <label class="form-label fw-bold">Categoría:</label>
                  <p class="form-control-plaintext">{{ Coupon.categoria_nombre || 'N/A' }}</p>
                </div>
                <div class="col-lg-4 mb-3">
                  <label class="form-label fw-bold">Subcategoría:</label>
                  <p class="form-control-plaintext">{{ Coupon.subcategoria_nombre || 'N/A' }}</p>
                </div>
                <div class="col-lg-4 mb-3">
                  <label class="form-label fw-bold">Producto:</label>
                  <p class="form-control-plaintext">{{ Coupon.producto_nombre || 'N/A' }}</p>
                </div>
              </div>

              <!-- Para cup�ns de tipo múltiple: mostrar lista de productos -->
              <div v-if="Coupon.tipo_aplicacion === 'multiple' && Coupon.items && Coupon.items.length > 0" class="row">
                <div class="col-12 mb-3">
                  <label class="form-label fw-bold">Productos Incluidos ({{ Coupon.items.length }}):</label>
                  <div class="table-responsive">
                    <table class="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Producto</th>
                          <th>% Descuento</th>
                          <th>Monto Descuento</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in Coupon.items" :key="item.id">
                          <td>{{ item.product_code }}</td>
                          <td>{{ item.product_name }}</td>
                          <td>{{ item.descuento_porcentaje }}%</td>
                          <td>L {{ item.descuento_monto }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-lg-4 mb-3">
                  <label class="form-label fw-bold">Tipo de Descuento:</label>
                  <p class="form-control-plaintext">{{ Coupon.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto' }}</p>
                </div>
                <div class="col-lg-4 mb-3">
                  <label class="form-label fw-bold">Valor:</label>
                  <p class="form-control-plaintext">{{ Coupon.valor_descuento }}{{ Coupon.tipo_descuento === 'porcentaje' ? '%' : '' }}</p>
                </div>
                <div class="col-lg-4 mb-3">
                  <label class="form-label fw-bold">Estado:</label>
                  <p class="form-control-plaintext">
                    <span :class="Coupon.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ Coupon.is_active ? 'ACTIVO' : 'INACTIVO' }}
                    </span>
                  </p>
                </div>
              </div>

              <div v-if="Coupon.limitar_fecha" class="row">
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Fecha Desde:</label>
                  <p class="form-control-plaintext">{{ Coupon.fecha_desde || 'N/A' }}</p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Fecha Hasta:</label>
                  <p class="form-control-plaintext">{{ Coupon.fecha_hasta || 'N/A' }}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-4 mb-3">
                  <label class="form-label fw-bold">Suspendida:</label>
                  <p class="form-control-plaintext">
                    <span :class="Coupon.suspendida ? 'badge bg-warning' : 'badge bg-success'">
                      {{ Coupon.suspendida ? 'SÍ' : 'NO' }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div class="modal fade" id="delete-coupon-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-body">
              <div class="delete-action">
                <div class="delete-heads">
                  <h4>¿Estás seguro?</h4>
                  <p>¿Deseas eliminar esta cup�n?</p>
                </div>
                <div class="modal-footer justify-content-center">
                  <button
                    type="button"
                    class="btn btn-cancel me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger"
                    @click="confirmDelete"
                    :disabled="isSubmitting"
                  >
                    {{ isSubmitting ? 'Eliminando...' : 'Sí, Eliminar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  props: {
    coupon: {
      type: Object,
      default: null
    }
  },
  emits: ['couponSaved', 'couponDeleted'],
  data() {
    return {
      branches: [],
      categories: [],
      subcategories: [],
      products: [],
      filteredCategories: [],
      filteredSubcategories: [],
      filteredProducts: [],

      categorySearchBy: 'nombre',
      categorySearchTerm: '',
      subcategorySearchBy: 'nombre',
      subcategorySearchTerm: '',
      productSearchBy: 'nombre',
      productSearchTermModal: '',

      productSearch: '',
      searchResults: [],
      searchResultsCurrentPage: 1,

      // Pagination
      itemsPerPage: 5,
      categoryCurrentPage: 1,
      subcategoryCurrentPage: 1,
      productCurrentPage: 1,

      // Show/hide inline search panels
      showCategorySearch: false,
      showSubcategorySearch: false,
      showProductSearch: false,

      formData: {
        id: null,
        codigo: 'Generando...',
        nombre: '',
        agencia_id: '',
        tipo_aplicacion: 'grupo',
        categoria_id: '',
        categoria_nombre: '',
        subcategoria_id: '',
        subcategoria_nombre: '',
        producto_id: '',
        producto_nombre: '',
        items: [],
        limitar_fecha: false,
        fecha_desde: '',
        fecha_hasta: '',
        limitar_hora: false,
        hora_desde: '',
        hora_hasta: '',
        aplica_lunes: true,
        aplica_martes: true,
        aplica_miercoles: true,
        aplica_jueves: true,
        aplica_viernes: true,
        aplica_sabado: false,
        aplica_domingo: false,
        tipo_descuento: 'monto',
        valor_descuento: 0,
        aplica_para: 'todos',
        monto_minimo: 0,
        cantidad_minima: 0,
        suspendida: false,
        is_active: true
      },
      isSubmitting: false
    };
  },
  computed: {
    // Pagination for Categories
    categoryTotalPages() {
      if (!Array.isArray(this.filteredCategories) || this.filteredCategories.length === 0) return 1;
      const total = Math.ceil(this.filteredCategories.length / this.itemsPerPage);
      return total > 0 ? total : 1;
    },
    categoryStartIndex() {
      return (this.categoryCurrentPage - 1) * this.itemsPerPage;
    },
    categoryEndIndex() {
      return this.categoryCurrentPage * this.itemsPerPage;
    },
    paginatedCategories() {
      if (!Array.isArray(this.filteredCategories)) return [];
      return this.filteredCategories.slice(this.categoryStartIndex, this.categoryEndIndex);
    },

    // Pagination for Subcategories
    subcategoryTotalPages() {
      if (!Array.isArray(this.filteredSubcategories) || this.filteredSubcategories.length === 0) return 1;
      const total = Math.ceil(this.filteredSubcategories.length / this.itemsPerPage);
      return total > 0 ? total : 1;
    },
    subcategoryStartIndex() {
      return (this.subcategoryCurrentPage - 1) * this.itemsPerPage;
    },
    subcategoryEndIndex() {
      return this.subcategoryCurrentPage * this.itemsPerPage;
    },
    paginatedSubcategories() {
      if (!Array.isArray(this.filteredSubcategories)) return [];
      return this.filteredSubcategories.slice(this.subcategoryStartIndex, this.subcategoryEndIndex);
    },

    // Pagination for Products
    productTotalPages() {
      if (!Array.isArray(this.filteredProducts) || this.filteredProducts.length === 0) return 1;
      const total = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
      return total > 0 ? total : 1;
    },
    productStartIndex() {
      return (this.productCurrentPage - 1) * this.itemsPerPage;
    },
    productEndIndex() {
      return this.productCurrentPage * this.itemsPerPage;
    },
    paginatedProducts() {
      if (!Array.isArray(this.filteredProducts)) return [];
      return this.filteredProducts.slice(this.productStartIndex, this.productEndIndex);
    },

    // Pagination for Search Results (Multiple Products)
    searchResultsTotalPages() {
      if (!Array.isArray(this.searchResults) || this.searchResults.length === 0) return 1;
      const total = Math.ceil(this.searchResults.length / 5);
      return total > 0 ? total : 1;
    },
    searchResultsStartIndex() {
      return (this.searchResultsCurrentPage - 1) * 5;
    },
    searchResultsEndIndex() {
      return this.searchResultsCurrentPage * 5;
    },
    paginatedSearchResults() {
      if (!Array.isArray(this.searchResults)) return [];
      return this.searchResults.slice(this.searchResultsStartIndex, this.searchResultsEndIndex);
    }
  },
  watch: {
    coupon: {
      handler(newVal) {
        if (newVal && newVal.id) {
          console.log('Loading Coupon in watch:', newVal);
          console.log('Items from coupon:', newVal.items);

          // Load Coupon data for editing
          this.formData = {
            id: newVal.id,
            codigo: newVal.codigo,
            nombre: newVal.nombre,
            agencia_id: newVal.agencia_id || '',
            tipo_aplicacion: newVal.tipo_aplicacion || 'grupo',
            categoria_id: newVal.categoria_id || '',
            categoria_nombre: newVal.categoria_nombre || '',
            subcategoria_id: newVal.subcategoria_id || '',
            subcategoria_nombre: newVal.subcategoria_nombre || '',
            producto_id: newVal.producto_id || '',
            producto_nombre: newVal.producto_nombre || '',
            items: Array.isArray(newVal.items) ? newVal.items : [],
            limitar_fecha: Boolean(newVal.limitar_fecha),
            fecha_desde: newVal.fecha_desde ? newVal.fecha_desde.split('T')[0] : '',
            fecha_hasta: newVal.fecha_hasta ? newVal.fecha_hasta.split('T')[0] : '',
            limitar_hora: Boolean(newVal.limitar_hora),
            hora_desde: newVal.hora_desde ? newVal.hora_desde.substring(0, 5) : '',
            hora_hasta: newVal.hora_hasta ? newVal.hora_hasta.substring(0, 5) : '',
            aplica_lunes: Boolean(newVal.aplica_lunes),
            aplica_martes: Boolean(newVal.aplica_martes),
            aplica_miercoles: Boolean(newVal.aplica_miercoles),
            aplica_jueves: Boolean(newVal.aplica_jueves),
            aplica_viernes: Boolean(newVal.aplica_viernes),
            aplica_sabado: Boolean(newVal.aplica_sabado),
            aplica_domingo: Boolean(newVal.aplica_domingo),
            tipo_descuento: newVal.tipo_descuento || 'monto',
            valor_descuento: newVal.valor_descuento || 0,
            aplica_para: newVal.aplica_para || 'todos',
            monto_minimo: newVal.monto_minimo || 0,
            cantidad_minima: newVal.cantidad_minima || 0,
            suspendida: Boolean(newVal.suspendida),
            is_active: newVal.is_active !== undefined ? Boolean(newVal.is_active) : true
          };
        } else {
          this.resetForm();
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.loadBranches();
    this.loadCategories();
    this.loadSubcategories();
    this.loadProducts();
    this.generateNextCode();
  },
  methods: {
    async loadBranches() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/branches', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.branches = response.data.data || [];
      } catch (error) {
        console.error('Error loading branches:', error);
      }
    },

    async loadCategories() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.categories = response.data.data || [];
        this.filteredCategories = this.categories;
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    },

    async loadSubcategories() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/subcategories', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.subcategories = response.data.data || [];
      } catch (error) {
        console.error('Error loading subcategories:', error);
      }
    },

    async loadProducts() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/products?limit=1000', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // El API devuelve { products: [...], pagination: {...} }
        const data = response.data.data || {};
        this.products = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
        this.filteredProducts = this.products;
        console.log('Products loaded:', this.products.length);
      } catch (error) {
        console.error('Error loading products:', error);
        this.products = [];
        this.filteredProducts = [];
      }
    },

    async generateNextCode() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/coupons/next-code', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        this.formData.codigo = response.data.data.codigo || '000001';
      } catch (error) {
        console.error('Error generating code:', error);
        this.formData.codigo = '000001';
      }
    },

    searchCategories() {
      this.categoryCurrentPage = 1; // Reset pagination

      if (!this.categorySearchTerm) {
        this.filteredCategories = this.categories;
        return;
      }

      this.filteredCategories = this.categories.filter(cat => {
        const fieldName = this.categorySearchBy === 'nombre' ? (cat.name || cat.nombre) : cat.id;
        const value = String(fieldName) || '';
        return value.toLowerCase().includes(this.categorySearchTerm.toLowerCase());
      });
    },

    selectCategory(category) {
      this.formData.categoria_id = category.id;
      this.formData.categoria_nombre = category.name || category.nombre;

      // Cerrar el panel de búsqueda inline
      this.showCategorySearch = false;

      // Filtrar subcategorías por esta categoría
      this.filteredSubcategories = this.subcategories.filter(sub =>
        sub.category_id === category.id || sub.categoria_id === category.id
      );
      this.subcategoryCurrentPage = 1; // Reset subcategory pagination
    },

    searchSubcategories() {
      this.subcategoryCurrentPage = 1; // Reset pagination

      let baseSubcategories = this.subcategories.filter(sub =>
        sub.category_id === this.formData.categoria_id || sub.categoria_id === this.formData.categoria_id
      );

      if (!this.subcategorySearchTerm) {
        this.filteredSubcategories = baseSubcategories;
        return;
      }

      this.filteredSubcategories = baseSubcategories.filter(sub => {
        const fieldName = this.subcategorySearchBy === 'nombre' ? (sub.name || sub.nombre) : sub.id;
        const value = String(fieldName) || '';
        return value.toLowerCase().includes(this.subcategorySearchTerm.toLowerCase());
      });
    },

    selectSubcategory(subcategory) {
      this.formData.subcategoria_id = subcategory.id;
      this.formData.subcategoria_nombre = subcategory.name || subcategory.nombre;

      // Cerrar el panel de búsqueda inline
      this.showSubcategorySearch = false;
    },

    searchProductsModal() {
      this.productCurrentPage = 1; // Reset pagination

      // Primero filtrar por categoría/subcategoría
      let baseProducts = Array.isArray(this.products) ? this.products : [];

      // Convertir IDs a números para comparación
      const categoryId = this.formData.categoria_id ? parseInt(this.formData.categoria_id) : null;
      const subcategoryId = this.formData.subcategoria_id ? parseInt(this.formData.subcategoria_id) : null;

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
      if (!this.productSearchTermModal) {
        this.filteredProducts = baseProducts;
        return;
      }

      this.filteredProducts = baseProducts.filter(prod => {
        const fieldName = this.productSearchBy === 'nombre' ? (prod.name || prod.nombre) : (prod.code || prod.codigo);
        const value = String(fieldName) || '';
        return value.toLowerCase().includes(this.productSearchTermModal.toLowerCase());
      });
    },

    selectProduct(product) {
      this.formData.producto_id = product.id;
      const productName = product.name || product.nombre;
      const productCode = product.code || product.codigo;
      this.formData.producto_nombre = `${productCode} - ${productName}`;

      // Cerrar el panel de búsqueda inline
      this.showProductSearch = false;
    },

    async searchProducts() {
      if (!this.productSearch.trim()) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/api/v1/products?search=${this.productSearch}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // El API devuelve { products: [...], pagination: {...} }
        const data = response.data.data || {};
        this.searchResults = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
        this.searchResultsCurrentPage = 1; // Reset a la primera página
        console.log('Search results:', this.searchResults.length);
      } catch (error) {
        console.error('Error searching products:', error);
        this.searchResults = [];
        this.searchResultsCurrentPage = 1;
      }
    },

    addProductToCoupon(product) {
      const exists = this.formData.items.find(item => item.product_id === product.id);
      if (exists) {
        Swal.fire('Atención', 'Este producto ya fue agregado', 'warning');
        return;
      }

      const productCode = product.code || product.codigo || '';
      const productName = product.name || product.nombre || '';

      this.formData.items.push({
        product_id: product.id,
        product_code: productCode,
        product_name: productName,
        descuento_porcentaje: 0,
        descuento_monto: 0
      });

      this.productSearch = '';
      this.searchResults = [];
    },

    removeProductFromCoupon(index) {
      this.formData.items.splice(index, 1);
    },

    handleEnterKey(event) {
      // Prevenir el submit del formulario cuando se presiona Enter
      const target = event.target;

      // Permitir Enter solo en campos de búsqueda (que están en .input-group)
      const isSearchInput = target.closest('.input-group') !== null;

      if (!isSearchInput) {
        // Prevenir el submit en todos los demás casos
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    },

    clearCategory() {
      this.formData.categoria_id = '';
      this.formData.categoria_nombre = '';
      this.clearSubcategory();
    },

    clearSubcategory() {
      this.formData.subcategoria_id = '';
      this.formData.subcategoria_nombre = '';
    },

    clearProduct() {
      this.formData.producto_id = '';
      this.formData.producto_nombre = '';
    },

    // Métodos para abrir paneles de búsqueda con inicialización
    openCategorySearch() {
      this.showCategorySearch = true;
      this.categorySearchTerm = '';
      this.filteredCategories = this.categories;
      this.categoryCurrentPage = 1;
    },

    openSubcategorySearch() {
      if (!this.formData.categoria_id) {
        Swal.fire('Atención', 'Debe seleccionar una categoría primero', 'warning');
        return;
      }
      this.showSubcategorySearch = true;
      this.subcategorySearchTerm = '';

      // Convertir a número para comparación
      const categoryId = parseInt(this.formData.categoria_id);

      // CAMBIO RADICAL: Obtener subcategorías que REALMENTE tienen productos en esta categoría
      // basándose en los productos, NO en la tabla subcategories
      const productsInCategory = this.products.filter(prod => {
        const prodCategoryId = prod.category_id || prod.categoria_id;
        return prodCategoryId === categoryId;
      });

      // Obtener IDs únicos de subcategorías de esos productos (excluyendo null/undefined)
      const uniqueSubcategoryIds = [...new Set(productsInCategory.map(prod => prod.subcategory_id || prod.subcategoria_id))].filter(id => id !== undefined && id !== null);

      // Filtrar subcategorías que tienen esos IDs
      this.filteredSubcategories = this.subcategories.filter(sub => {
        return uniqueSubcategoryIds.includes(sub.id);
      });

      console.log('======= SUBCATEGORY SEARCH DEBUG =======');
      console.log('Selected category ID:', categoryId);
      console.log('Total products loaded:', this.products.length);
      console.log('Products in selected category:', productsInCategory.length);
      console.log('Unique subcategory IDs from products:', uniqueSubcategoryIds);
      console.log('Valid subcategory IDs:', uniqueSubcategoryIds);
      console.log('Total subcategories in database:', this.subcategories.length);
      console.log('Filtered subcategories to show:', this.filteredSubcategories.length);
      console.log('ALL filtered subcategories:', this.filteredSubcategories.map(s => ({ id: s.id, name: s.name || s.nombre })));
      console.log('========================================');
      this.subcategoryCurrentPage = 1;
    },

    openProductSearch() {
      this.showProductSearch = true;
      this.productSearchTermModal = '';

      // Asegurar que products sea un array
      let productsToShow = Array.isArray(this.products) ? this.products : [];
      console.log('Opening product search, total products:', productsToShow.length);
      console.log('Selected categoria_id:', this.formData.categoria_id);
      console.log('Selected subcategoria_id:', this.formData.subcategoria_id);

      // Convertir IDs a números para comparación
      const categoryId = this.formData.categoria_id ? parseInt(this.formData.categoria_id) : null;
      const subcategoryId = this.formData.subcategoria_id ? parseInt(this.formData.subcategoria_id) : null;

      // Filtrar productos por categoría y subcategoría si están seleccionadas
      if (categoryId && productsToShow.length > 0) {
        productsToShow = productsToShow.filter(prod => {
          const prodCategoryId = prod.category_id || prod.categoria_id;
          return prodCategoryId === categoryId;
        });
        console.log('After category filter:', productsToShow.length);

        // Si también hay subcategoría, filtrar por ella
        if (subcategoryId) {
          productsToShow = productsToShow.filter(prod => {
            const prodSubcategoryId = prod.subcategory_id || prod.subcategoria_id;
            return prodSubcategoryId === subcategoryId;
          });
          console.log('After subcategory filter:', productsToShow.length);
        }
      }

      this.filteredProducts = productsToShow;
      this.productCurrentPage = 1;
      console.log('Final filtered products:', this.filteredProducts.length);
    },

    toggleAllDays(event) {
      const checked = event.target.checked;
      this.formData.aplica_lunes = checked;
      this.formData.aplica_martes = checked;
      this.formData.aplica_miercoles = checked;
      this.formData.aplica_jueves = checked;
      this.formData.aplica_viernes = checked;
      this.formData.aplica_sabado = checked;
      this.formData.aplica_domingo = checked;
    },

    async submitAddForm() {
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');

        // Preparar datos con los IDs correctos (no nombres)
        const dataToSend = {
          codigo: this.formData.codigo,
          nombre: this.formData.nombre,
          agencia_id: this.formData.agencia_id || null,
          tipo_aplicacion: this.formData.tipo_aplicacion,
          categoria_id: this.formData.categoria_id || null,
          subcategoria_id: this.formData.subcategoria_id || null,
          producto_id: this.formData.producto_id || null,
          limitar_fecha: this.formData.limitar_fecha,
          fecha_desde: this.formData.fecha_desde || null,
          fecha_hasta: this.formData.fecha_hasta || null,
          limitar_hora: this.formData.limitar_hora,
          hora_desde: this.formData.hora_desde || null,
          hora_hasta: this.formData.hora_hasta || null,
          aplica_lunes: this.formData.aplica_lunes,
          aplica_martes: this.formData.aplica_martes,
          aplica_miercoles: this.formData.aplica_miercoles,
          aplica_jueves: this.formData.aplica_jueves,
          aplica_viernes: this.formData.aplica_viernes,
          aplica_sabado: this.formData.aplica_sabado,
          aplica_domingo: this.formData.aplica_domingo,
          tipo_descuento: this.formData.tipo_descuento,
          valor_descuento: this.formData.valor_descuento,
          aplica_para: this.formData.aplica_para,
          monto_minimo: this.formData.monto_minimo || 0,
          cantidad_minima: this.formData.cantidad_minima || 0,
          suspendida: this.formData.suspendida,
          is_active: this.formData.is_active,
          items: this.formData.items.map(item => ({
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            descuento_porcentaje: item.descuento_porcentaje,
            descuento_monto: item.descuento_monto
          }))
        };

        console.log('Datos a enviar:', dataToSend);

        // Determinar si es creación o actualización
        if (this.formData.id) {
          // Actualizar cup�n existente
          await axios.put(`http://localhost:3000/api/v1/coupons/${this.formData.id}`, dataToSend, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          // Crear nueva cup�n
          await axios.post('http://localhost:3000/api/v1/coupons', dataToSend, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }

        this.$emit('couponSaved');

        const modalElement = document.getElementById('add-coupon');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.resetForm();

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: this.formData.id ? 'cup�n actualizada exitosamente' : 'cup�n creada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error saving coupon:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al guardar la cup�n',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    openDeleteModal() {
      const addModal = document.getElementById('add-coupon');
      if (addModal) {
        const closeButton = addModal.querySelector('[data-bs-dismiss="modal"]');
        if (closeButton) closeButton.click();
      }

      setTimeout(() => {
        const deleteModalElement = document.getElementById('delete-coupon-modal');
        const deleteModalButton = document.querySelector('[data-bs-target="#delete-coupon-modal"]');
        if (deleteModalButton) {
          deleteModalButton.click();
        } else {
          // Fallback: mostrar el modal manualmente
          deleteModalElement.classList.add('show');
          deleteModalElement.style.display = 'block';
          document.body.classList.add('modal-open');
        }
      }, 300);
    },

    async confirmDelete() {
      if (!this.Coupon || !this.Coupon.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/coupons/${this.coupon.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        this.$emit('couponDeleted');

        const modalElement = document.getElementById('delete-coupon-modal');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'cup�n eliminada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting coupon:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar la cup�n',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.formData = {
        id: null,
        codigo: 'Generando...',
        nombre: '',
        agencia_id: '',
        tipo_aplicacion: 'grupo',
        categoria_id: '',
        categoria_nombre: '',
        subcategoria_id: '',
        subcategoria_nombre: '',
        producto_id: '',
        producto_nombre: '',
        items: [],
        limitar_fecha: false,
        fecha_desde: '',
        fecha_hasta: '',
        limitar_hora: false,
        hora_desde: '',
        hora_hasta: '',
        aplica_lunes: true,
        aplica_martes: true,
        aplica_miercoles: true,
        aplica_jueves: true,
        aplica_viernes: true,
        aplica_sabado: false,
        aplica_domingo: false,
        tipo_descuento: 'monto',
        valor_descuento: 0,
        aplica_para: 'todos',
        monto_minimo: 0,
        cantidad_minima: 0,
        suspendida: false,
        is_active: true
      };

      // Cerrar paneles de búsqueda
      this.showCategorySearch = false;
      this.showSubcategorySearch = false;
      this.showProductSearch = false;

      // Resetear búsquedas
      this.categorySearchTerm = '';
      this.subcategorySearchTerm = '';
      this.productSearchTermModal = '';

      // Resetear filtros
      this.filteredCategories = this.categories;
      this.filteredSubcategories = [];
      this.filteredProducts = this.products;

      // Resetear paginación
      this.categoryCurrentPage = 1;
      this.subcategoryCurrentPage = 1;
      this.productCurrentPage = 1;

      this.generateNextCode();
      this.searchResults = [];
      this.productSearch = '';
    },

    formatMoney(value) {
      if (!value && value !== 0) return '0.00';
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
  }
};
</script>

<style scoped>
/* Backdrop opaco cuando los paneles de búsqueda están abiertos */
.modal-body {
  position: relative;
}

/* Fondo opaco detrás de los paneles de búsqueda */
.card.border-primary,
.card.border-info,
.card.border-success {
  position: relative;
  z-index: 1050;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

/* Overlay oscuro cuando hay paneles activos */
.modal-body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  display: none;
  pointer-events: none;
}

/* Activar overlay cuando algún panel está visible */
.modal-body:has(.card.border-primary),
.modal-body:has(.card.border-info),
.modal-body:has(.card.border-success) {
  &::before {
    display: block;
  }
}
</style>
