<template>
  <div class="pos-purchase-wrapper">
    <!-- Mini Header Bar -->
    <div class="mini-header-bar bg-light border-bottom py-1">
      <div class="container-fluid">
        <div class="d-flex align-items-center justify-content-between">
          <router-link to="/dashboard/admin-dashboard" class="btn btn-link text-dark p-0">
            <i class="ti ti-arrow-left fs-3"></i>
          </router-link>
          <span class="fw-bold text-dark">COMPRAS / GASTOS</span>
          <span class="text-muted small">{{ currentDate }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content with Scroll -->
    <div class="pos-content-main pos-scrollable">
      <div class="container-fluid h-100">
        <div class="row g-2 h-100">

          <!-- LEFT COLUMN -->
          <div class="col-lg-8 d-flex flex-column">

            <!-- Purchase Info -->
            <div class="card mb-2 flex-shrink-0">
              <div class="card-body p-3">
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Tipo de Documento</label>
                    <input type="text" class="form-control fw-bold bg-light" value="COMPRAS / GASTOS" readonly>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label fw-bold">#Serie</label>
                    <input type="text" class="form-control" v-model="purchase.serie" placeholder="# Serie">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Nro. Referencia / Factura</label>
                    <input type="text" class="form-control" v-model="purchase.reference_number" placeholder="#Nro. Referencia / Factura">
                  </div>
                  <div class="col-md-2">
                    <label class="form-label fw-bold">Consecutivo</label>
                    <div class="input-group">
                      <span class="input-group-text bg-danger text-white fw-bold">FAC</span>
                      <input type="text" class="form-control fw-bold" v-model="purchase.consecutive" readonly>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label fw-bold">No. Resolución</label>
                    <input type="text" class="form-control" placeholder="" disabled>
                  </div>
                </div>
                <div class="row g-3 mt-1">
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Consecutivo Resolución</label>
                    <input type="text" class="form-control" value="resolucion_no_exist" readonly disabled style="color: red;">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Moneda</label>
                    <div class="d-flex align-items-center gap-2">
                      <input type="checkbox" v-model="onlyCoinCurrency" id="onlyCoinCurrency">
                      <label for="onlyCoinCurrency" class="mb-0">Solo monedas con tasa</label>
                      <select class="form-select" v-model="purchase.currency">
                        <option value="LEMPIRA">LEMPIRA</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label fw-bold">Tasa</label>
                    <input type="number" class="form-control" v-model="purchase.exchange_rate" step="0.01">
                  </div>
                </div>
              </div>
            </div>

            <!-- Client, Warehouse, Vendor Row -->
            <div class="card mb-2 flex-shrink-0">
              <div class="card-body p-3">
                <div class="row g-3">
                  <div class="col-md-5">
                    <label class="form-label fw-bold">Proveedor</label>
                    <div class="input-group">
                      <button class="btn btn-info" @click="showCustomerModal = true">
                        <i class="ti ti-search"></i>
                      </button>
                      <input type="text" class="form-control" :value="supplierInfo.code" readonly style="max-width: 80px;">
                      <input type="text" class="form-control" :value="supplierInfo.name" readonly>
                      <button class="btn btn-success" @click="showNewCustomerModal = true">
                        <i class="ti ti-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Bodega</label>
                    <select class="form-select" v-model="purchase.warehouse_id">
                      <option v-for="w in warehouses" :key="w.value" :value="w.value">{{ w.label }}</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-bold">Comprador</label>
                    <div class="input-group">
                      <button class="btn btn-info" @click="showVendorModal = true">
                        <i class="ti ti-search"></i>
                      </button>
                      <input type="text" class="form-control" :value="currentVendor.name" readonly>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Search -->
            <div class="card mb-2 flex-shrink-0">
              <div class="card-body p-3">
                <div class="row g-2 align-items-end">
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Código de Producto</label>
                    <div class="input-group">
                      <button class="btn btn-info" @click="showProductModal = true">
                        <i class="ti ti-search"></i>
                      </button>
                      <input type="text" class="form-control" v-model="currentProduct.code" @keypress.enter="searchProductByCode" placeholder="Código" ref="productCodeInput">
                      <button class="btn btn-success" @click="showNewProductModal = true">
                        <i class="ti ti-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-bold">Nombre Producto</label>
                    <input type="text" class="form-control" v-model="currentProduct.name" placeholder="Nombre del producto" readonly>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label fw-bold">Cantidad</label>
                    <input type="number" class="form-control text-center" v-model.number="currentProduct.quantity" step="0.01" min="0.01">
                  </div>
                  <div class="col-md-2">
                    <label class="form-label fw-bold">Ordenar</label>
                    <select class="form-select" v-model="productSortOrder">
                      <option value="desc">↓</option>
                      <option value="asc">↑</option>
                    </select>
                  </div>
                  <div class="col-md-1">
                    <button class="btn btn-primary w-100" @click="addProduct">
                      ADICIONAR
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Options Row -->
            <div class="card mb-2 flex-shrink-0">
              <div class="card-body p-2">
                <div class="d-flex justify-content-end gap-2">
                  <button class="btn btn-outline-secondary btn-sm" @click="showAdditionalOptions = !showAdditionalOptions">
                    <i class="ti ti-settings me-1"></i>Opciones Adicionales
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" @click="showAdditionalFields = !showAdditionalFields">
                    <i class="ti ti-forms me-1"></i>Campos Adicionales
                  </button>

                  <!-- Import Document Dropdown -->
                  <div class="dropdown" :class="{ show: showImportDropdown }">
                    <button class="btn btn-purple btn-sm dropdown-toggle" type="button" @click="showImportDropdown = !showImportDropdown">
                      <i class="ti ti-file-import me-1"></i>Importar Documento
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" :class="{ show: showImportDropdown }">
                      <li><a class="dropdown-item" href="#" @click.prevent="openImportModal('pending-purchase')">
                        <i class="ti ti-clock me-2"></i>Operación en Espera
                      </a></li>
                      <li><a class="dropdown-item" href="#" @click.prevent="openImportModal('quote')">
                        <i class="ti ti-file-purchase me-2"></i>Cotización
                      </a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Products List - Diseño Vertical -->
            <div class="card products-list-card flex-grow-1">
              <div class="card-body p-2 h-100">
                <div class="products-vertical-list">
                  <!-- Item Header (Solo se muestra cuando hay productos) -->
                  <div v-if="purchase.items.length > 0" class="list-header d-flex align-items-center px-2 py-1 bg-light border-bottom fw-bold text-uppercase" style="font-size: 0.75rem;">
                    <div style="width: 120px;">ALMACEN</div>
                    <div style="width: 100px;" class="text-end">P.UNIT.</div>
                    <div style="width: 120px;" class="text-end">DESC.UNIT.</div>
                    <div style="width: 100px;" class="text-center">CANTIDAD</div>
                    <div style="width: 100px;" class="text-end">IMPUESTOS</div>
                    <div class="flex-grow-1 text-end">TOTAL</div>
                  </div>

                  <!-- Lista de Productos - Ultra Compacto -->
                  <div class="products-scroll-area">
                    <div v-for="(item, index) in purchase.items" :key="index" class="product-item-compact mb-1">
                      <!-- Línea única por producto -->
                      <div class="d-flex align-items-center">
                        <div style="flex: 0 0 35px;">
                          <span class="badge bg-secondary" style="font-size: 0.6rem;">{{ item.code || 'N/A' }}</span>
                        </div>
                        <div class="flex-grow-1 px-1" style="min-width: 0;">
                          <div class="text-truncate fw-semibold" style="font-size: 0.75rem;">{{ item.name }}</div>
                        </div>
                        <div style="flex: 0 0 60px;" class="text-end">
                          <input type="number" class="form-control form-control-sm text-center py-0" v-model.number="item.quantity" @input="calculateItemTotal(index)" step="0.01" style="font-size: 0.7rem; height: 22px;">
                        </div>
                        <div style="flex: 0 0 70px;" class="text-end px-1">
                          <span style="font-size: 0.7rem;">{{ formatCurrency(item.price) }}</span>
                        </div>
                        <div style="flex: 0 0 45px;" class="text-center">
                          <span class="badge bg-info py-0" style="font-size: 0.6rem;">{{ item.tax_percent }}%</span>
                        </div>
                        <div style="flex: 0 0 80px;" class="text-end">
                          <strong class="text-primary" style="font-size: 0.75rem;">{{ formatCurrency(item.total) }}</strong>
                        </div>
                        <div style="flex: 0 0 30px;" class="text-end">
                          <button class="btn btn-link text-danger p-0" @click="removeProduct(index)" title="Eliminar" style="font-size: 0.8rem;">
                            <i class="ti ti-x"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="purchase.items.length === 0" class="text-center py-3 text-muted">
                      <i class="ti ti-shopping-cart-off fs-4"></i>
                      <p class="mt-1 mb-0 small">No hay productos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN - Totals & Actions -->
          <div class="col-lg-4 d-flex flex-column">

            <!-- Totals Card -->
            <div class="card totals-card mb-2 flex-shrink-0">
              <div class="card-header bg-primary text-white py-2">
                <h6 class="mb-0"><i class="ti ti-calculator me-2"></i>RESUMEN</h6>
              </div>
              <div class="card-body p-3">
                <div class="total-row">
                  <span>CANT. ARTICULOS:</span>
                  <strong>{{ totals.itemCount.toFixed(2) }}</strong>
                </div>
                <div class="total-row">
                  <span>MONTO BRUTO:</span>
                  <strong>L {{ formatCurrency(totals.gross) }}</strong>
                </div>
                <div class="total-row">
                  <span>SUBTOTAL:</span>
                  <strong>L {{ formatCurrency(totals.subtotal) }}</strong>
                </div>
                <div class="total-row">
                  <span>ISV:</span>
                  <strong>L {{ formatCurrency(totals.tax) }}</strong>
                </div>
                <div class="total-row align-items-center">
                  <span>RECARGOS:</span>
                  <div class="input-group input-group-sm" style="width: 130px;">
                    <span class="input-group-text py-0">L</span>
                    <input type="number" class="form-control py-0 text-end" v-model.number="purchase.shipping_cost" min="0" step="0.01">
                  </div>
                </div>
                <hr class="my-2">
                <div class="total-final">
                  <span class="fs-3 fw-bold">TOTAL</span>
                  <span class="fs-2 fw-bold text-danger">L {{ formatCurrency(totals.total) }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="card flex-shrink-0">
              <div class="card-body p-2">
                <div class="d-grid gap-2">
                  <button class="btn btn-danger btn-lg" @click="clearPurchase">
                    <i class="ti ti-trash me-2"></i>ELIMINAR
                  </button>
                  <button class="btn btn-warning btn-lg" @click="saveAsDraft" :disabled="purchase.items.length === 0">
                    <i class="ti ti-device-floppy me-2"></i>GUARDAR
                  </button>
                  <button class="btn btn-success btn-lg" @click="showQuickPaymentModal = true" :disabled="purchase.items.length === 0">
                    <i class="ti ti-calculator me-2"></i>TOTALIZAR
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    
    
    <!-- Modal: Búsqueda de Proveedor -->
    <div v-if="showCustomerModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Búsqueda de datos</h5>
            <button type="button" class="btn-close" @click="showCustomerModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-3">
                <label class="form-label fw-bold">Buscar por:</label>
                <select class="form-select form-select-sm" v-model="supplierSearchBy">
                  <option value="name">Nombre</option>
                  <option value="code">Código</option>
                  <option value="rtn">RTN</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Ordenar Por:</label>
                <select class="form-select form-select-sm" v-model="supplierSortBy">
                  <option value="name">Nombre (A-Z)</option>
                  <option value="code">Código</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">&nbsp;</label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text"><i class="ti ti-search"></i></span>
                  <input type="text" class="form-control" v-model="supplierSearch" placeholder="Buscar..." @input="supplierPage = 1">
                </div>
              </div>
            </div>

            <div class="table-responsive" style="max-height: 400px;">
              <table class="table table-hover table-sm">
                <thead class="table-light sticky-top">
                  <tr>
                    <th style="width: 10%;">Info</th>
                    <th style="width: 15%;">Código</th>
                    <th style="width: 60%;">Nombre</th>
                    <th style="width: 15%;" class="text-center">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="supplier in paginatedCustomers" :key="supplier.value" @click="selectCustomer(supplier)" style="cursor: pointer;">
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-secondary" @click.stop="viewCustomerInfo(supplier)">+ INFO</button>
                    </td>
                    <td>{{ supplier.code }}</td>
                    <td>{{ supplier.label }}</td>
                    <td class="text-center">
                      <span class="badge bg-success">ACTIVO</span>
                    </td>
                  </tr>
                  <tr v-if="filteredCustomers.length === 0">
                    <td colspan="3" class="text-center text-muted py-4">No se encontraron proveedors</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer justify-content-between">
            <div>
              <button type="button" class="btn btn-success" @click="showAddCustomerModal = true; showCustomerModal = false;">
                <i class="ti ti-plus me-1"></i>Nuevo Proveedor
              </button>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="supplierPage--"
                :disabled="supplierPage <= 1">
                <i class="ti ti-chevron-left"></i>
              </button>
              <span class="small">Página {{ supplierPage }} de {{ supplierTotalPages }}</span>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="supplierPage++"
                :disabled="supplierPage >= supplierTotalPages">
                <i class="ti ti-chevron-right"></i>
              </button>
              <button type="button" class="btn btn-secondary" @click="showCustomerModal = false">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Info de Proveedor -->
    <div v-if="showCustomerInfoModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Información del Proveedor</h5>
            <button type="button" class="btn-close" @click="showCustomerInfoModal = false"></button>
          </div>
          <div class="modal-body" v-if="selectedCustomerInfo">
            <div class="row g-3">
              <div class="col-12">
                <p class="mb-2"><strong>Nombre:</strong> {{ selectedCustomerInfo.label }}</p>
              </div>
              <div class="col-12">
                <p class="mb-2"><strong>Código:</strong> {{ selectedCustomerInfo.code || 'N/A' }}</p>
              </div>
              <div class="col-12">
                <p class="mb-2"><strong>Documento:</strong> {{ selectedCustomerInfo.rtn || 'N/A' }}</p>
              </div>
              <div class="col-12">
                <p class="mb-2"><strong>Teléfono:</strong> {{ selectedCustomerInfo.phone || 'N/A' }}</p>
              </div>
              <div class="col-12">
                <p class="mb-2"><strong>Actividad económica:</strong> N/A</p>
              </div>
              <div class="col-12">
                <p class="mb-0"><strong>Tipo Contribuyente:</strong> CONTRIBUYENTE</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCustomerInfoModal = false">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Nuevo Proveedor -->
    <div v-if="showAddCustomerModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Documentos Ventas - Nuevo Proveedor</h5>
            <button type="button" class="btn-close" @click="closeAddCustomerModal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label fw-bold">Código</label>
                <div class="input-group">
                  <input type="text" class="form-control" v-model="newCustomer.code" placeholder="Código">
                  <button class="btn btn-outline-secondary" title="Usar Consecutivos">
                    <input type="checkbox" class="form-check-input" v-model="newCustomer.useConsecutive">
                  </button>
                  <button class="btn btn-outline-secondary" title="Refrescar">
                    <i class="ti ti-refresh"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Razón Social</label>
                <input type="text" class="form-control" v-model="newCustomer.razon_social" placeholder="Razón Social">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Tipo de Beneficiario</label>
                <select class="form-select" v-model="newCustomer.beneficiary_type">
                  <option value="JURIDICA_DOMICILIADA">JURIDICA DOMICILIADA</option>
                  <option value="NATURAL_DOMICILIADA">NATURAL DOMICILIADA</option>
                  <option value="JURIDICA_NO_DOMICILIADA">JURIDICA NO DOMICILIADA</option>
                  <option value="NATURAL_NO_DOMICILIADA">NATURAL NO DOMICILIADA</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Nombre Comercial</label>
                <input type="text" class="form-control" v-model="newCustomer.nombre_comercial" placeholder="Nombre Comercial">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Tipo Identificación</label>
                <select class="form-select" v-model="newCustomer.tipo_identificacion">
                  <option value="CEDULA">CEDULA</option>
                  <option value="RTN">RTN</option>
                  <option value="PASAPORTE">PASAPORTE</option>
                  <option value="SAR">SAR</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">CEDULA</label>
                <input type="text" class="form-control" v-model="newCustomer.cedula" placeholder="CEDULA">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">SAR (ID fiscal #2)</label>
                <input type="text" class="form-control" v-model="newCustomer.sar" placeholder="SAR">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Tipo de Proveedor</label>
                <select class="form-select" v-model="newCustomer.tipo_proveedor">
                  <option value="NACIONAL">NACIONAL</option>
                  <option value="EXTRANJERO">EXTRANJERO</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Tipo de Contribuyente</label>
                <select class="form-select" v-model="newCustomer.tipo_contribuyente">
                  <option value="CONTRIBUYENTE">CONTRIBUYENTE</option>
                  <option value="NO_CONTRIBUYENTE">NO CONTRIBUYENTE</option>
                  <option value="EXONERADO">EXONERADO</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Email</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="ti ti-mail"></i></span>
                  <input type="email" class="form-control" v-model="newCustomer.email" placeholder="Email">
                </div>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Teléfono</label>
                <input type="text" class="form-control" v-model="newCustomer.phone" placeholder="Teléfono">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Teléfono Móvil</label>
                <input type="text" class="form-control" v-model="newCustomer.mobile" placeholder="Teléfono Móvil">
              </div>
              <div class="col-md-12">
                <label class="form-label fw-bold">Dirección</label>
                <textarea class="form-control" rows="2" v-model="newCustomer.address" placeholder="Dirección..."></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAddCustomerModal">CERRAR</button>
            <button type="button" class="btn btn-success" @click="saveNewCustomer">
              <i class="ti ti-device-floppy me-1"></i>GUARDAR
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Búsqueda de Productos -->
    <ProductModal
      :show="showProductModal"
      :products="products"
      @close="showProductModal = false"
      @select="selectProduct"
    />

    <!-- Modal: Búsqueda de Comprador -->
    <div v-if="showVendorModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Búsqueda de datos - Compradores</h5>
            <button type="button" class="btn-close" @click="showVendorModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-12">
                <div class="input-group">
                  <span class="input-group-text"><i class="ti ti-search"></i></span>
                  <input type="text" class="form-control" v-model="buyerSearch" placeholder="Buscar vendedor...">
                </div>
              </div>
            </div>

            <div class="table-responsive" style="max-height: 400px;">
              <table class="table table-hover table-sm">
                <thead class="table-light sticky-top">
                  <tr>
                    <th style="width: 30%;">Código</th>
                    <th style="width: 70%;">Comprador</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="buyer in filteredVendors" :key="buyer.id" @click="selectVendor(buyer)" style="cursor: pointer;">
                    <td>{{ buyer.code }}</td>
                    <td>{{ buyer.name }}</td>
                  </tr>
                  <tr v-if="filteredVendors.length === 0">
                    <td colspan="2" class="text-center text-muted py-4">No se encontraron vendedores</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showVendorModal = false">CERRAR</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Campos Adicionales -->
    <div v-if="showAdditionalFields" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Campos Adicionales (Encabezado)</h5>
            <button type="button" class="btn-close" @click="showAdditionalFields = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-bold">No. Correlativo de la Orden de Compra Exenta</label>
              <input type="text" class="form-control" v-model="additionalFields.orden_compra" placeholder="No. Correlativo de la Orden de Compra Exenta">
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">No. Correlativo de la Constancia del Reg Exonerado</label>
              <input type="text" class="form-control" v-model="additionalFields.constancia_exonerado" placeholder="No. Correlativo de la Constancia del Reg Exonerado">
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">No. Identificativo del Registro SAG</label>
              <input type="text" class="form-control" v-model="additionalFields.registro_sag" placeholder="No. Identificativo del Registro SAG">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAdditionalFields = false">CANCELAR Y LIMPIAR DATOS</button>
            <button type="button" class="btn btn-success" @click="saveAdditionalFields">
              <i class="ti ti-check me-1"></i>GUARDAR
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Opciones Adicionales -->
    <div v-if="showAdditionalOptions" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Opciones Adicionales</h5>
            <button type="button" class="btn-close" @click="showAdditionalOptions = false"></button>
          </div>
          <div class="modal-body">
            <div class="d-grid gap-2">
              <button class="btn btn-info btn-lg"><i class="ti ti-cash-register me-2"></i>APERTURA DE CAJA</button>
              <button class="btn btn-info btn-lg"><i class="ti ti-cash me-2"></i>EGRESO DE CAJA</button>
              <button class="btn btn-info btn-lg"><i class="ti ti-coins me-2"></i>RETIRAR EFECTIVO</button>
              <button class="btn btn-info btn-lg"><i class="ti ti-discount-2 me-2"></i>% DSCTO. GLOBAL</button>
              <button class="btn btn-info btn-lg"><i class="ti ti-file-certificate me-2"></i>EXONERACIÓN ISV</button>
              <button class="btn btn-info btn-lg"><i class="ti ti-percentage me-2"></i>% APLICAR RECARGO</button>
              <button class="btn btn-info btn-lg"><i class="ti ti-coin me-2"></i>% APLICAR PROPINA</button>
              <button class="btn btn-info btn-lg"><i class="ti ti-arrows-split me-2"></i>↔ DIVIDIR/ UNIR CUENTAS</button>
              <button class="btn btn-info btn-lg"><i class="ti ti-ticket me-2"></i>🎫 APLICAR CUPON DE DESCUENTO</button>
              <button class="btn btn-info btn-lg"><i class="ti ti-calculator me-2"></i>√ RECALCULAR TASA DE CAMBIO</button>
              <button class="btn btn-info btn-lg"><i class="ti ti-refresh me-2"></i>🔄 ACTUALIZAR PRECIOS</button>
              <button class="btn btn-outline-secondary btn-lg"><i class="ti ti-keyboard me-2"></i>⌨ ATAJOS DE TECLADO</button>
              <button class="btn btn-outline-secondary btn-lg"><i class="ti ti-settings me-2"></i>🔧 CONFIG. DOCUMENTO</button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAdditionalOptions = false">CERRAR</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showCustomerModal || showAddCustomerModal || showCustomerInfoModal || showProductModal || showVendorModal || showAdditionalFields || showAdditionalOptions"
         class="modal-backdrop fade show"
         @click="closeAllModals">
    </div>

  </div>

    <!-- Modal Totalizar -->
    <div v-if="showQuickPaymentModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title text-white">Totalizar Compra</h5>
            <button type="button" class="btn-close btn-close-white" @click="showQuickPaymentModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-12">
                <h6 class="fw-bold mb-3">Método de Pago</h6>
                <div class="btn-group w-100" role="group">
                  <button
                    type="button"
                    class="btn"
                    :class="quickPayment.method === 'TRANSFERENCIA' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="quickPayment.method = 'TRANSFERENCIA'">
                    TRANSFERENCIA
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="quickPayment.method === 'CHEQUE' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="quickPayment.method = 'CHEQUE'">
                    CHEQUE
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="quickPayment.method === 'TARJ_DEBITO' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="quickPayment.method = 'TARJ_DEBITO'">
                    TARJ. DÉBITO
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="quickPayment.method === 'TARJ_CREDITO' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="quickPayment.method = 'TARJ_CREDITO'">
                    TARJ. CRÉDITO
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="quickPayment.method === 'EFECTIVO' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="quickPayment.method = 'EFECTIVO'">
                    EFECTIVO
                  </button>
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-12">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="sendToDispatch"
                    v-model="quickPayment.sendToDispatch">
                  <label class="form-check-label fw-bold" for="sendToDispatch">
                    Enviar a despacho
                  </label>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <p class="mb-1"><strong>Total a Pagar:</strong></p>
                    <h3 class="text-primary mb-0">L {{ totalWithTax.toFixed(2) }}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <p class="mb-1"><strong>Método:</strong></p>
                    <h5 class="text-success mb-0">{{ quickPayment.method }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showQuickPaymentModal = false">
              Cancelar
            </button>
            <button type="button" class="btn btn-info" @click="switchToDetailedPayment">
              Cobro Detallado
            </button>
            <button type="button" class="btn btn-primary" @click="processQuickPayment">
              <i class="ti ti-check"></i> Procesar Pago
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Cobro Detallado -->
    <div v-if="showDetailedPaymentModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Cobro Detallado</h5>
            <button type="button" class="btn-close" @click="showDetailedPaymentModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <!-- Resumen del documento -->
              <div class="col-md-4">
                <div class="card">
                  <div class="card-header bg-primary text-white">
                    <strong>Resumen del Documento</strong>
                  </div>
                  <div class="card-body">
                    <table class="table table-sm table-borderless">
                      <tbody>
                      <tr>
                        <td><strong>Subtotal:</strong></td>
                        <td class="text-end">L {{ subtotal.toFixed(2) }}</td>
                      </tr>
                      <tr>
                        <td><strong>Descuento:</strong></td>
                        <td class="text-end">L {{ purchase.discount.toFixed(2) }}</td>
                      </tr>
                      <tr>
                        <td><strong>ISV ({{ purchase.tax_rate }}%):</strong></td>
                        <td class="text-end">L {{ taxAmount.toFixed(2) }}</td>
                      </tr>
                      <tr class="border-top">
                        <td><strong>TOTAL:</strong></td>
                        <td class="text-end"><h5 class="text-primary mb-0">L {{ totalWithTax.toFixed(2) }}</h5></td>
                      </tr>
                      </tbody>
                    </table>
                    <hr>
                    <table class="table table-sm table-borderless">
                      <tbody>
                      <tr>
                        <td><strong>Total Pagado:</strong></td>
                        <td class="text-end text-success">L {{ totalPaid.toFixed(2) }}</td>
                      </tr>
                      <tr>
                        <td><strong>Pendiente:</strong></td>
                        <td class="text-end text-danger">L {{ remainingBalance.toFixed(2) }}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Agregar forma de pago -->
              <div class="col-md-8">
                <div class="card mb-3">
                  <div class="card-header bg-secondary text-white">
                    <strong>Agregar Forma de Pago</strong>
                  </div>
                  <div class="card-body">
                    <div class="row g-2 mb-3">
                      <div class="col-md-3">
                        <label class="form-label fw-bold">Método</label>
                        <select class="form-select form-select-sm" v-model="detailedPayment.currentMethod">
                          <option value="EFECTIVO">Efectivo</option>
                          <option value="TRANSFERENCIA">Transferencia</option>
                          <option value="CHEQUE">Cheque</option>
                          <option value="TARJ_DEBITO">Tarjeta Débito</option>
                          <option value="TARJ_CREDITO">Tarjeta Crédito</option>
                        </select>
                      </div>
                      <div class="col-md-3">
                        <label class="form-label fw-bold">Monto</label>
                        <input
                          type="number"
                          class="form-control form-control-sm"
                          v-model.number="detailedPayment.currentAmount"
                          placeholder="0.00"
                          step="0.01">
                      </div>
                      <div class="col-md-3">
                        <label class="form-label fw-bold">Referencia</label>
                        <input
                          type="text"
                          class="form-control form-control-sm"
                          v-model="detailedPayment.currentReference"
                          placeholder="Referencia">
                      </div>
                      <div class="col-md-2">
                        <label class="form-label fw-bold">Fecha</label>
                        <input
                          type="date"
                          class="form-control form-control-sm"
                          v-model="detailedPayment.currentDate">
                      </div>
                      <div class="col-md-1 d-flex align-items-end">
                        <button class="btn btn-success btn-sm w-100" @click="addPaymentMethod">
                          <i class="ti ti-plus"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Lista de formas de pago agregadas -->
                    <div v-if="detailedPayment.paymentMethods.length > 0">
                      <h6 class="fw-bold mb-2">Formas de Pago Agregadas:</h6>
                      <table class="table table-sm table-bordered">
                        <thead class="table-light">
                          <tr>
                            <th>Método</th>
                            <th>Monto</th>
                            <th>Referencia</th>
                            <th>Fecha</th>
                            <th style="width: 50px;"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(payment, index) in detailedPayment.paymentMethods" :key="index">
                            <td>{{ payment.method }}</td>
                            <td>L {{ payment.amount.toFixed(2) }}</td>
                            <td>{{ payment.reference || 'N/A' }}</td>
                            <td>{{ payment.date }}</td>
                            <td>
                              <button class="btn btn-danger btn-sm" @click="removePaymentMethod(index)">
                                <i class="ti ti-trash"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Información del proveedor -->
                <div class="card">
                  <div class="card-header bg-info text-white">
                    <strong>Información del Proveedor</strong>
                  </div>
                  <div class="card-body">
                    <div class="row g-2">
                      <div class="col-md-6">
                        <p class="mb-1"><strong>Nombre:</strong> {{ supplierInfo.name || 'N/A' }}</p>
                        <p class="mb-1"><strong>RTN:</strong> {{ supplierInfo.rtn || 'N/A' }}</p>
                      </div>
                      <div class="col-md-6">
                        <p class="mb-1"><strong>Teléfono:</strong> {{ supplierInfo.phone || 'N/A' }}</p>
                        <p class="mb-1"><strong>Saldo Proveedor:</strong> L {{ detailedPayment.clientBalance.toFixed(2) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDetailedPaymentModal = false">
              Cancelar
            </button>
            <button type="button" class="btn btn-info" @click="switchToQuickPayment">
              Cobro Rápido
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="processDetailedPayment"
              :disabled="remainingBalance > 0.01">
              <i class="ti ti-check"></i> Procesar Pago
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Impresión de Compra -->
    <div v-if="showPrintModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Compra Creada Exitosamente</h5>
            <button type="button" class="btn-close" @click="showPrintModal = false"></button>
          </div>
          <div class="modal-body">
            <InvoicePrint
              v-if="createdPurchaseData"
              :invoiceData="createdPurchaseData"
              :customerInfo="supplierInfo"
              :sellerInfo="currentVendor"
            />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showPrintModal = false">
              Cerrar
            </button>
            <button type="button" class="btn btn-primary" @click="printPurchase">
              <i class="ti ti-printer me-1"></i>Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Importar Documento -->
    <div v-if="showImportModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white py-2">
            <h5 class="modal-title text-white mb-0">Búsqueda de datos</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeImportModal"></button>
          </div>
          <div class="modal-body p-3">
            <!-- Filtros de búsqueda -->
            <div class="row mb-3 align-items-end">
              <div class="col-md-2">
                <label class="form-label fw-bold small">Buscar por:</label>
                <select class="form-select form-select-sm" v-model="importSearchBy">
                  <option value="name">Nombre</option>
                  <option value="number">Número</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label fw-bold small">Ordenar Por:</label>
                <select class="form-select form-select-sm" v-model="importSortBy">
                  <option value="recent">Fecha Más Reciente</option>
                  <option value="oldest">Fecha Más Antigua</option>
                  <option value="number">Número</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label fw-bold small">Desde</label>
                <input type="date" class="form-control form-control-sm" v-model="importDateFrom">
              </div>
              <div class="col-md-2">
                <label class="form-label fw-bold small">Hasta</label>
                <input type="date" class="form-control form-control-sm" v-model="importDateTo">
              </div>
              <div class="col-md-2">
                <label class="form-label fw-bold small">Comprador</label>
                <select class="form-select form-select-sm" v-model="importVendorFilter">
                  <option value="">Seleccione un Comprador</option>
                  <option v-for="buyer in buyers" :key="buyer.value" :value="buyer.value">
                    {{ buyer.label }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <div class="input-group input-group-sm">
                  <span class="input-group-text"><i class="ti ti-search"></i></span>
                  <input type="text" class="form-control" v-model="importSearch" placeholder="Buscar...">
                </div>
              </div>
            </div>

            <!-- Tabla de documentos -->
            <div class="table-responsive" style="max-height: calc(100vh - 280px); overflow-y: auto;">
              <table class="table table-sm table-bordered table-hover">
                <thead class="table-light sticky-top">
                  <tr>
                    <th style="width: 3%;"></th>
                    <th style="width: 10%;">Emisión</th>
                    <th style="width: 10%;">Vence</th>
                    <th style="width: 15%;">Documento</th>
                    <th style="width: 20%;">Proveedor</th>
                    <th style="width: 12%;">Comprador</th>
                    <th style="width: 10%;">Usuario</th>
                    <th style="width: 10%;" class="text-end">Total(L)</th>
                    <th style="width: 10%;" class="text-center">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="doc in paginatedDocuments" :key="doc.id" @click="selectDocument(doc)" style="cursor: pointer;" :class="{ 'table-active': selectedDocumentId === doc.id }">
                    <td class="text-center">
                      <input type="checkbox" :checked="selectedDocumentId === doc.id" @click.stop="selectDocument(doc)">
                    </td>
                    <td class="small">{{ formatDateTime(doc.created_at) }}</td>
                    <td class="small">
                      <span :class="getVenceDaysClass(doc.valid_until || doc.expires_at)">
                        {{ formatVenceDays(doc.valid_until || doc.expires_at) }}
                      </span>
                    </td>
                    <td class="small">
                      <a href="#" @click.prevent="viewDocumentDetails(doc)" class="text-primary text-decoration-none">
                        {{ doc.document_number || doc.quote_number }}
                      </a>
                    </td>
                    <td class="small">{{ doc.supplier_name }}</td>
                    <td class="small">{{ doc.buyer_name || 'N/A' }}</td>
                    <td class="small">{{ doc.first_name || 'N/A' }}</td>
                    <td class="text-end small">{{ formatCurrency(doc.total) }}</td>
                    <td class="text-center">
                      <span class="badge bg-warning small">PENDIENTE</span>
                    </td>
                  </tr>
                  <tr v-if="filteredDocuments.length === 0">
                    <td colspan="9" class="text-center text-muted py-4">
                      <i class="ti ti-inbox fs-2"></i>
                      <p class="mt-2 mb-0">No se encontraron documentos</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Botón Siguiente para paginación -->
            <div class="d-flex justify-content-center mt-3" v-if="filteredDocuments.length > importPerPage">
              <button class="btn btn-outline-primary btn-sm" @click="importPage++" :disabled="importPage >= importTotalPages">
                SIGUIENTE
              </button>
            </div>
          </div>
          <div class="modal-footer py-2">
            <button type="button" class="btn btn-secondary btn-sm" @click="closeImportModal">CERRAR</button>
            <button type="button" class="btn btn-success btn-sm" @click="importDocument" :disabled="!selectedDocumentId">
              PROCESAR
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

 


<script>
import api from '@/api/config';
import Swal from 'sweetalert2';
import ProductModal from '@/components/pos/ProductModal.vue';
import InvoicePrint from '@/components/InvoicePrint.vue';

export default {
  name: 'POSPurchase',
  components: {
    ProductModal,
    InvoicePrint
  },
  data() {
    return {
      documentType: 'COMPRA',
      currentDate: new Date().toLocaleDateString('es-HN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      currentVendor: {
        id: null,
        code: '1',
        name: 'CARLOS ARGEÑAL'
      },
      purchase: {
        consecutive: '0000031836',
        serie: '',
        reference_number: '',
        warehouse_id: null,
        is_delivery: false,
        items: [],
        tax_rate: 15,
        discount: 0,
        shipping_cost: 0,
        currency: 'LEMPIRA',
        exchange_rate: 1.00
      },
      onlyCoinCurrency: false,
      resolution: {
        cai: '2A9170-F8828A-8815E0-63BE03-090956-9D',
        prefix: '000-002-01-',
        current: 31836
      },
      supplierInfo: {
        id: 1,
        code: '000001',
        name: 'CONSUMIDOR FINAL',
        rtn: '',
        phone: ''
      },
      currentProduct: {
        code: '',
        name: '',
        quantity: 1,
        price: 0,
        discount_percent: 0,
        tax_percent: 15
      },
      suppliers: [],
      products: [],
      warehouses: [],
      buyers: [],
      showCustomerModal: false,
      showProductModal: false,
      showVendorModal: false,
      showAdditionalFields: false,
      showAdditionalOptions: false,
      showNewCustomerModal: false,
      showNewProductModal: false,
      productSortOrder: 'desc',
      newCustomer: {
        code: '',
        razon_social: '',
        nombre_comercial: '',
        beneficiary_type: 'JURIDICA_DOMICILIADA',
        tipo_identificacion: 'CEDULA',
        cedula: '',
        sar: '',
        tipo_proveedor: 'NACIONAL',
        tipo_contribuyente: 'CONTRIBUYENTE',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        useConsecutive: true
      },
      additionalFields: {
        orden_compra: '',
        constancia_exonerado: '',
        registro_sag: ''
      },
      supplierSearch: '',
      productSearch: '',
      buyerSearch: '',
      supplierPage: 1,
      supplierPerPage: 10,
      supplierSearchBy: 'name',
      supplierSortBy: 'name',
      productPage: 1,
      productPerPage: 10,
      productSearchBy: 'name',
      productSortBy: 'name',
      productTypeFilter: '',
      productStockFilter: '',
      productGroupFilter: '',
      productBrandFilter: '',
      productModelFilter: '',
      showAddCustomerModal: false,
      showCustomerInfoModal: false,
      selectedCustomerInfo: null,
      // Modales de pago
      showQuickPaymentModal: false,
      showDetailedPaymentModal: false,
      showPrintModal: false,
      createdPurchaseData: null,
      // Cobro rápido
      quickPayment: {
        method: 'EFECTIVO',
        sendToDispatch: false
      },
      // Cobro detallado
      detailedPayment: {
        paymentMethods: [],
        currentMethod: 'EFECTIVO',
        currentAmount: 0,
        currentReference: '',
        currentDate: new Date().toISOString().split('T')[0],
        clientBalance: 0
      },
      documentType: 'ORDEN_COMPRA',
      // Import Document
      showImportDropdown: false,
      showImportModal: false,
      importDocumentType: '', // 'pending-purchase' or 'quote'
      importSearch: '',
      importSearchBy: 'name',
      importSortBy: 'recent',
      importDateFrom: '',
      importDateTo: '',
      importVendorFilter: '',
      importPage: 1,
      importPerPage: 15,
      documents: [],
      selectedDocumentId: null,
      // Tracking del documento importado
      importedDocument: {
        id: null,
        type: null, // 'pending-purchase' or 'quote'
        number: null
      }
    };
  },
  computed: {
    purchaseNumber() {
      return `${this.resolution.prefix}${String(this.resolution.current).padStart(8, '0')}`;
    },
    
    filteredCustomers() {
      if (!Array.isArray(this.suppliers)) return [];
      let filtered = [...this.suppliers];
      if (this.supplierSearch) {
        const search = this.supplierSearch.toLowerCase();
        filtered = filtered.filter(c => {
          if (this.supplierSearchBy === 'name') return (c.label || '').toLowerCase().includes(search);
          if (this.supplierSearchBy === 'code') return (c.code || '').toLowerCase().includes(search);
          if (this.supplierSearchBy === 'rtn') return (c.rtn || '').toLowerCase().includes(search);
          return false;
        });
      }
      if (this.supplierSortBy === 'name') filtered.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
      else if (this.supplierSortBy === 'code') filtered.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
      return filtered;
    },
    paginatedCustomers() {
      const start = (this.supplierPage - 1) * this.supplierPerPage;
      return this.filteredCustomers.slice(start, start + this.supplierPerPage);
    },
    supplierTotalPages() {
      return Math.ceil(this.filteredCustomers.length / this.supplierPerPage);
    },
    filteredProducts() {
      if (!Array.isArray(this.products)) return [];
      let filtered = [...this.products];
      if (this.productSearch) {
        const search = this.productSearch.toLowerCase();
        filtered = filtered.filter(p => {
          if (this.productSearchBy === 'name') return (p.name || '').toLowerCase().includes(search);
          if (this.productSearchBy === 'code') return (p.sku || '').toLowerCase().includes(search);
          return false;
        });
      }
      if (this.productStockFilter === 'in_stock') filtered = filtered.filter(p => (p.stock || 0) > 0);
      else if (this.productStockFilter === 'out_of_stock') filtered = filtered.filter(p => (p.stock || 0) <= 0);
      if (this.productGroupFilter) filtered = filtered.filter(p => p.category_name === this.productGroupFilter);
      if (this.productBrandFilter) filtered = filtered.filter(p => p.brand_name === this.productBrandFilter);
      if (this.productModelFilter) filtered = filtered.filter(p => p.model === this.productModelFilter);
      if (this.productSortBy === 'name') filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      else if (this.productSortBy === 'code') filtered.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
      return filtered;
    },
    paginatedProducts() {
      const start = (this.productPage - 1) * this.productPerPage;
      return this.filteredProducts.slice(start, start + this.productPerPage);
    },
    productTotalPages() {
      return Math.ceil(this.filteredProducts.length / this.productPerPage);
    },
    productGroups() {
      if (!Array.isArray(this.products)) return [];
      const groups = new Set();
      this.products.forEach(p => { if (p.category_name) groups.add(p.category_name); });
      return Array.from(groups).sort();
    },
    productBrands() {
      if (!Array.isArray(this.products)) return [];
      const brands = new Set();
      this.products.forEach(p => { if (p.brand_name) brands.add(p.brand_name); });
      return Array.from(brands).sort();
    },
    productModels() {
      if (!Array.isArray(this.products)) return [];
      const models = new Set();
      this.products.forEach(p => { if (p.model) models.add(p.model); });
      return Array.from(models).sort();
    },
    filteredVendors() {
      if (!Array.isArray(this.buyers)) return [];
      if (!this.buyerSearch) return this.buyers;
      const search = this.buyerSearch.toLowerCase();
      return this.buyers.filter(v => (v.name || '').toLowerCase().includes(search) || (v.code || '').toLowerCase().includes(search));
    },
    totalPaid() {
      return this.detailedPayment.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
    },
    remainingBalance() {
      return Math.max(0, this.totalWithTax - this.totalPaid);
    },
    subtotal() {
      return this.purchase.items.reduce((sum, item) => {
        const itemGross = item.price * item.quantity;
        const itemDiscount = itemGross * ((item.discount_percent || 0) / 100);
        return sum + (itemGross - itemDiscount);
      }, 0);
    },
    taxAmount() {
      const taxRate = this.purchase.tax_rate || 15;
      return this.subtotal * (taxRate / 100);
    },
    totalWithTax() {
      return this.subtotal + this.taxAmount - (this.purchase.discount || 0);
    },
    totals() {
      let itemCount = 0;
      let gross = 0;
      let subtotal = 0;
      let tax = 0;

      this.purchase.items.forEach(item => {
        itemCount += item.quantity;
        const itemGross = item.price * item.quantity;
        const itemDiscount = itemGross * (item.discount_percent / 100);
        const itemSubtotal = itemGross - itemDiscount;
        const itemTax = itemSubtotal * (item.tax_percent / 100);

        gross += itemGross;
        subtotal += itemSubtotal;
        tax += itemTax;
      });

      const shipping = parseFloat(this.purchase.shipping_cost) || 0;
      return { itemCount, gross, subtotal, tax, total: subtotal + tax + shipping };
    },
    filteredDocuments() {
      if (!Array.isArray(this.documents)) return [];
      let filtered = [...this.documents];

      // Filtrar por búsqueda
      if (this.importSearch) {
        const search = this.importSearch.toLowerCase();
        filtered = filtered.filter(doc => {
          if (this.importSearchBy === 'name') {
            return (doc.supplier_name || '').toLowerCase().includes(search);
          } else if (this.importSearchBy === 'number') {
            const docNumber = (doc.document_number || doc.quote_number || '').toLowerCase();
            return docNumber.includes(search);
          }
          return false;
        });
      }

      // Filtrar por fechas
      if (this.importDateFrom) {
        filtered = filtered.filter(doc => {
          const docDate = new Date(doc.created_at);
          const fromDate = new Date(this.importDateFrom);
          return docDate >= fromDate;
        });
      }

      if (this.importDateTo) {
        filtered = filtered.filter(doc => {
          const docDate = new Date(doc.created_at);
          const toDate = new Date(this.importDateTo);
          toDate.setHours(23, 59, 59, 999);
          return docDate <= toDate;
        });
      }

      // Filtrar por vendedor
      if (this.importVendorFilter) {
        filtered = filtered.filter(doc => doc.buyer_id === this.importVendorFilter);
      }

      // Ordenar
      if (this.importSortBy === 'recent') {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (this.importSortBy === 'oldest') {
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } else if (this.importSortBy === 'number') {
        filtered.sort((a, b) => {
          const numA = a.document_number || a.quote_number || '';
          const numB = b.document_number || b.quote_number || '';
          return numA.localeCompare(numB);
        });
      }

      return filtered;
    },
    paginatedDocuments() {
      const start = (this.importPage - 1) * this.importPerPage;
      return this.filteredDocuments.slice(start, start + this.importPerPage);
    },
    importTotalPages() {
      return Math.ceil(this.filteredDocuments.length / this.importPerPage);
    }
  },
  mounted() {
    this.loadInitialData();
    this.focusProductInput();
  },
  methods: {
    async loadInitialData() {
      await Promise.all([
        this.loadCustomers(),
        this.loadProducts(),
        this.loadWarehouses(),
        this.loadVendors()
      ]);
    },
    async loadCustomers() {
      try {
        const response = await api.get('/suppliers', {
          params: { limit: 10000 }
        });

        console.log('Customers response:', response.data);

        const suppliersData = response.data?.data || response.data || [];

        if (Array.isArray(suppliersData)) {
          this.suppliers = suppliersData.map(c => ({
            label: c.nombre || c.name || 'Sin nombre',
            value: c.id,
            code: c.codigo || c.supplier_code || c.code || '',
            rtn: c.doc_identificacion || c.rtn || '',
            phone: c.telefono || c.phone || ''
          }));
          console.log('Customers loaded:', this.suppliers.length);
        } else {
          console.warn('Customers data is not an array:', suppliersData);
          this.suppliers = [];
        }
      } catch (error) {
        console.error('Error loading suppliers:', error);
        this.suppliers = [];
      }
    },
    async loadProducts() {
      try {
        const response = await api.get('/products', {
          params: { limit: 10000 }
        });

        console.log('Products full response:', response);
        console.log('Products response.data:', response.data);

        let productsData = [];

        // Estructura: { success: true, data: { products: [...], pagination: {...} } }
        if (response.data && response.data.data && response.data.data.products && Array.isArray(response.data.data.products)) {
          productsData = response.data.data.products;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          productsData = response.data;
        }

        console.log('Products data extracted:', productsData.length, 'products');

        if (productsData.length > 0) {
          this.products = productsData.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.code || p.sku,
            barcode: p.barcode,
            sale_price: p.price_1 || p.sale_price || 0,
            cost: p.cost || 0,
            stock: p.stock || 0,
            category_id: p.category_id,
            category_name: p.category_name || '',
            subcategory_id: p.subcategory_id,
            subcategory_name: p.subcategory_name || '',
            brand_id: p.brand_id,
            brand_name: p.brand_name || '',
            tax_rate: p.tax_rate || 0,
            unit: p.unit || 'Unidad',
            image: p.image
          }));
          console.log('Products loaded successfully:', this.products.length);
        } else {
          console.warn('No products found in response');
          this.products = [];
        }
      } catch (error) {
        console.error('Error loading products:', error);
        this.products = [];
      }
    },
    async loadWarehouses() {
      try {
        const response = await api.get('/warehouses', {
          params: { limit: 10000 }
        });

        console.log('Warehouses response:', response.data);

        const warehousesData = response.data?.data || response.data || [];

        if (Array.isArray(warehousesData)) {
          this.warehouses = warehousesData.map(w => ({
            label: w.nombre || w.name || w.warehouse_name || 'Sin nombre',
            value: w.id
          }));
          console.log('Warehouses loaded:', this.warehouses.length);

          if (this.warehouses.length > 0) {
            this.purchase.warehouse_id = this.warehouses[0].value;
          }
        } else {
          console.warn('Warehouses data is not an array:', warehousesData);
          this.warehouses = [];
        }
      } catch (error) {
        console.error('Error loading warehouses:', error);
        this.warehouses = [];
      }
    },
    async loadVendors() {
      try {
        console.log('🔍 loadVendors: Iniciando carga de vendedores...');
        const response = await api.get('/users', {
          params: {
            limit: 10000,
            role: 4
          }
        });

        console.log('📦 Vendors full response:', response);
        console.log('📊 Vendors response.data:', response.data);
        console.log('🔍 Checking response structure...');
        console.log('  - response.data exists?', !!response.data);
        console.log('  - response.data.data exists?', !!(response.data && response.data.data));
        console.log('  - response.data.data.users exists?', !!(response.data && response.data.data && response.data.data.users));
        console.log('  - Is users an array?', !!(response.data && response.data.data && response.data.data.users && Array.isArray(response.data.data.users)));

        let usersData = [];

        // Estructura: { success: true, data: { data: [...], pagination: {...} } }
        if (response.data && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          console.log('✅ Found users in response.data.data.data');
          usersData = response.data.data.data;
        } else if (response.data && response.data.data && response.data.data.users && Array.isArray(response.data.data.users)) {
          console.log('✅ Found users in response.data.data.users');
          usersData = response.data.data.users;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log('✅ Found users in response.data.data (as array)');
          usersData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          console.log('✅ Found users in response.data (as array)');
          usersData = response.data;
        } else {
          console.log('❌ Could not find users in any expected structure');
          console.log('Full response.data:', JSON.stringify(response.data, null, 2));
        }

        console.log('👥 Users data extracted:', usersData);
        console.log('👥 Users count:', usersData.length);

        if (usersData.length > 0) {
          this.buyers = usersData.map(u => {
            console.log('Mapping user:', u);
            return {
              id: u.id,
              code: (u.id || '').toString(),
              name: u.first_name && u.last_name
                ? `${u.first_name} ${u.last_name}`
                : u.name || u.username || 'Sin nombre'
            };
          });
          console.log('✅ Vendors loaded successfully:', this.buyers.length, this.buyers);
        } else {
          console.warn('⚠️ No buyers found with role 4');
          this.buyers = [];
        }
      } catch (error) {
        console.error('❌ Error loading buyers:', error);
        console.error('Error details:', error.response || error.message);
        this.buyers = [];
      }
    },
    // ==================== MÉTODOS DE PAGO ====================
    switchToDetailedPayment() {
      this.showQuickPaymentModal = false;
      this.showDetailedPaymentModal = true;
    },
    switchToQuickPayment() {
      this.showDetailedPaymentModal = false;
      this.showQuickPaymentModal = true;
    },

    async processQuickPayment() {
      try {
        // Validar que haya productos
        if (this.purchase.items.length === 0) {
          Swal.fire('Error', 'No hay productos en la compra', 'error');
          return;
        }

        // Validar que haya un método de pago seleccionado
        if (!this.quickPayment.method) {
          Swal.fire('Error', 'Debe seleccionar un método de pago', 'error');
          return;
        }

        // Crear la compra (sin confirmación)
        const items = this.purchase.items.map(item => ({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          discount_percent: item.discount_percent || 0,
          tax_percent: item.tax_percent || 15,
          warehouse_id: item.warehouse_id,
          total: item.total
        }));

        const purchase_data = {
          purchase_number: this.purchaseNumber,
          document_type: this.documentType,
          supplier_id: this.supplierInfo.id,
          supplier_name: this.supplierInfo.name || 'CONSUMIDOR FINAL',
          supplier_rtn: this.supplierInfo.rtn || '00000000000000',
          warehouse_id: this.purchase.warehouse_id,
          buyer_id: this.currentVendor.id || null,
          buyer_name: this.currentVendor.name || 'SIN VENDEDOR',
          subtotal: this.totals.subtotal,
          tax: this.totals.tax,
          discount: this.totals.discount || 0,
          shipping_cost: this.purchase.shipping_cost || 0,
          total: this.totals.total,
          status: 'issued',
          payment_status: 'paid',
          payment_method: this.quickPayment.method,
          send_to_dispatch: this.quickPayment.sendToDispatch
        };

        const requestData = {
          purchase_data,
          items
        };

        console.log('📤 Enviando compra:', requestData);

        const response = await api.post('/billing/purchases', requestData);

        console.log('✅ Respuesta del servidor:', response.data);

        // Guardar datos de la compra creada para impresión
        this.createdPurchaseData = {
          purchase_number: this.purchaseNumber,
          subtotal: this.totals.subtotal,
          tax: this.totals.tax,
          tax_amount: this.totals.tax,
          discount: this.totals.discount || 0,
          discount_amount: this.totals.discount || 0,
          surcharge: this.purchase.shipping_cost || 0,
          total: this.totals.total,
          items: items.map(item => {
            const originalItem = this.purchase.items.find(i => i.product_id === item.product_id);
            return {
              ...item,
              product_name: originalItem?.name || item.product_name,
              price: item.unit_price,
              quantity: item.quantity,
              total: item.total
            };
          }),
          payment_method: this.quickPayment.method,
          payment_terms: 'CONTADO',
          created_at: new Date().toISOString(),
          due_date: new Date().toISOString(),
          delivery_date: new Date().toISOString()
        };

        console.log('📄 Datos de compra para impresión:', this.createdPurchaseData);

        // Si había un documento importado (pending-purchase o quote), eliminarlo
        if (this.importedDocument.id) {
          try {
            if (this.importedDocument.type === 'pending-purchase') {
              await api.delete(`/pending-purchases/${this.importedDocument.id}`);
              console.log('Pending purchase eliminada tras cobro:', this.importedDocument.id);
            } else if (this.importedDocument.type === 'quote') {
              await api.delete(`/quotes/${this.importedDocument.id}`);
              console.log('Quote eliminada tras cobro:', this.importedDocument.id);
            }
          } catch (error) {
            console.error('Error eliminando documento importado:', error);
          }
        }

        // Mostrar modal de impresión
        this.showPrintModal = true;
        this.showQuickPaymentModal = false;

        // Limpiar la compra
        this.clearPurchase();

        // Incrementar el número de compra
        this.resolution.current++;

        // Resetear método de pago
        this.quickPayment.method = 'TRANSFERENCIA';
        this.quickPayment.sendToDispatch = false;

      } catch (error) {
        console.error('❌ Error procesando pago:', error);
        console.error('Error details:', error.response?.data || error.message);
        Swal.fire({
          icon: 'error',
          title: 'Error al Procesar Pago',
          text: error.response?.data?.message || error.message || 'Error desconocido'
        });
      }
    },

    async processDetailedPayment() {
      try {
        // Validar que haya productos
        if (this.purchase.items.length === 0) {
          Swal.fire('Error', 'No hay productos en la compra', 'error');
          return;
        }

        // Validar que el pago esté completo
        if (this.remainingBalance > 0) {
          Swal.fire('Error', 'El pago no está completo', 'warning');
          return;
        }

        // Crear la compra con métodos de pago múltiples (sin confirmación)
        const items = this.purchase.items.map(item => ({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          discount_percent: item.discount_percent || 0,
          tax_percent: item.tax_percent || 15,
          warehouse_id: item.warehouse_id,
          total: item.total
        }));

        const purchase_data = {
          purchase_number: this.purchaseNumber,
          document_type: this.documentType,
          supplier_id: this.supplierInfo.id,
          supplier_name: this.supplierInfo.name || 'CONSUMIDOR FINAL',
          supplier_rtn: this.supplierInfo.rtn || '00000000000000',
          warehouse_id: this.purchase.warehouse_id,
          buyer_id: this.currentVendor.id || null,
          buyer_name: this.currentVendor.name || 'SIN VENDEDOR',
          subtotal: this.totals.subtotal,
          tax: this.totals.tax,
          discount: this.purchase.discount || 0,
          total: this.totals.total,
          status: 'issued',
          payment_status: 'paid',
          payment_methods: this.detailedPayment.methods.filter(m => m.amount > 0),
          notes: this.detailedPayment.notes || ''
        };

        const requestData = {
          purchase_data,
          items
        };

        console.log('📤 Enviando compra detallada:', requestData);

        const response = await api.post('/billing/purchases', requestData);

        console.log('✅ Respuesta del servidor:', response.data);

        // Guardar datos de la compra creada para impresión
        this.createdPurchaseData = {
          purchase_number: this.purchaseNumber,
          subtotal: this.totals.subtotal,
          tax: this.totals.tax,
          tax_amount: this.totals.tax,
          discount: this.purchase.discount || 0,
          discount_amount: this.purchase.discount || 0,
          surcharge: 0,
          total: this.totals.total,
          items: items.map(item => {
            const originalItem = this.purchase.items.find(i => i.product_id === item.product_id);
            return {
              ...item,
              product_name: originalItem?.name || item.product_name,
              price: item.unit_price,
              quantity: item.quantity,
              total: item.total
            };
          }),
          payment_methods: this.detailedPayment.paymentMethods,
          payment_terms: 'CONTADO',
          created_at: new Date().toISOString(),
          due_date: new Date().toISOString(),
          delivery_date: new Date().toISOString()
        };

        console.log('📄 Datos de compra detallada para impresión:', this.createdPurchaseData);

        // Si había un documento importado (pending-purchase o quote), eliminarlo
        if (this.importedDocument.id) {
          try {
            if (this.importedDocument.type === 'pending-purchase') {
              await api.delete(`/pending-purchases/${this.importedDocument.id}`);
              console.log('Pending purchase eliminada tras cobro detallado:', this.importedDocument.id);
            } else if (this.importedDocument.type === 'quote') {
              await api.delete(`/quotes/${this.importedDocument.id}`);
              console.log('Quote eliminada tras cobro detallado:', this.importedDocument.id);
            }
          } catch (error) {
            console.error('Error eliminando documento importado:', error);
          }
        }

        // Mostrar modal de impresión
        this.showPrintModal = true;
        this.showDetailedPaymentModal = false;

        // Limpiar la compra
        this.clearPurchase();

        // Incrementar el número de compra
        this.resolution.current++;

        // Resetear métodos de pago detallados
        this.detailedPayment.methods = [
          { method: 'EFECTIVO', amount: 0 }
        ];
        this.detailedPayment.notes = '';

      } catch (error) {
        console.error('❌ Error procesando pago detallado:', error);
        console.error('Error details:', error.response?.data || error.message);
        Swal.fire({
          icon: 'error',
          title: 'Error al Procesar Pago',
          text: error.response?.data?.message || error.message || 'Error desconocido'
        });
      }
    },

    async saveAsDraft() {
      // If it's a ORDEN_COMPRA (Quote), show confirmation
      if (this.documentType === 'ORDEN_COMPRA') {
        await Swal.fire({
          title: '¿Cómo desea guardar?',
          html: `
            <p>Seleccione el tipo de guardado:</p>
            <div class="d-grid gap-2 mt-3">
              <button id="save-as-quote" class="btn btn-info btn-lg">
                <i class="ti ti-file-purchase me-2"></i>Guardar como Cotización
              </button>
              <button id="save-as-pending" class="btn btn-warning btn-lg">
                <i class="ti ti-device-floppy me-2"></i>Guardar como Operación en Espera
              </button>
            </div>
          `,
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          didOpen: () => {
            document.getElementById('save-as-quote').addEventListener('click', () => {
              Swal.close();
              this.saveAsQuote();
            });
            document.getElementById('save-as-pending').addEventListener('click', () => {
              Swal.close();
              this.saveAsPendingPurchase();
            });
          }
        });
      } else {
        // If it's a COMPRA, save as pending purchase
        await this.saveAsPendingPurchase();
      }
    },
    async saveAsQuote() {
      try {
        const quoteData = {
          supplier_id: this.supplierInfo.id,
          supplier_name: this.supplierInfo.name,
          supplier_rtn: this.supplierInfo.rtn || '',
          supplier_phone: this.supplierInfo.phone || '',
          supplier_email: this.supplierInfo.email || '',
          branch_id: 1, // TODO: Get from current user's branch
          warehouse_id: this.purchase.warehouse_id,
          buyer_id: this.currentVendor.id,
          buyer_name: this.currentVendor.name,
          items: this.purchase.items.map(item => ({
            product_id: item.product_id,
            product_code: item.code,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            discount_value: (item.price * item.quantity * (item.discount_percent / 100)),
            tax_rate: item.tax_percent,
            warehouse_id: item.warehouse_id || this.purchase.warehouse_id
          })),
          subtotal: this.totals.subtotal,
          discount: 0,
          tax: this.totals.tax,
          total: this.totals.total,
          surcharge: this.purchase.shipping_cost || 0,
          quote_date: new Date().toISOString().split('T')[0],
          valid_until: null,
          notes: '',
          terms_conditions: ''
        };

        let response;
        let quoteNumber;

        // Si viene de una importación de quote, actualizar
        if (this.importedDocument.id && this.importedDocument.type === 'quote') {
          response = await api.put(`/quotes/${this.importedDocument.id}`, quoteData);
          quoteNumber = this.importedDocument.number;
        }
        // Si viene de una pending-purchase importada, eliminar la pending-purchase y crear quote
        else if (this.importedDocument.id && this.importedDocument.type === 'pending-purchase') {
          // Eliminar la pending-purchase
          await api.delete(`/pending-purchases/${this.importedDocument.id}`);
          // Crear nueva quote
          response = await api.post('/quotes', quoteData);
          quoteNumber = response.data.data.quote_number;
        }
        // Si no viene de importación, crear nueva
        else {
          response = await api.post('/quotes', quoteData);
          quoteNumber = response.data.data.quote_number;
        }

        Swal.fire({
          icon: 'success',
          title: 'Cotización Guardada',
          html: `<p>Número: ${quoteNumber}</p>`,
          timer: 3000
        });

        this.clearPurchase();
      } catch (error) {
        console.error('Error saving quote:', error);
        Swal.fire('Error', 'Error al guardar la cotización', 'error');
      }
    },
    async saveAsPendingPurchase() {
      try {
        const pendingPurchaseData = {
          supplier_id: this.supplierInfo.id,
          supplier_name: this.supplierInfo.name,
          supplier_rtn: this.supplierInfo.rtn || '',
          supplier_phone: this.supplierInfo.phone || '',
          supplier_email: this.supplierInfo.email || '',
          branch_id: 1, // TODO: Get from current user's branch
          warehouse_id: this.purchase.warehouse_id,
          buyer_id: this.currentVendor.id,
          buyer_name: this.currentVendor.name,
          items: this.purchase.items.map(item => ({
            product_id: item.product_id,
            product_code: item.code,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            discount_value: (item.price * item.quantity * (item.discount_percent / 100)),
            tax_rate: item.tax_percent,
            warehouse_id: item.warehouse_id || this.purchase.warehouse_id
          })),
          subtotal: this.totals.subtotal,
          discount: 0,
          tax: this.totals.tax,
          total: this.totals.total,
          surcharge: this.purchase.shipping_cost || 0,
          notes: '',
          internal_notes: '',
          expires_at: null
        };

        let response;
        let documentNumber;

        // Si viene de una importación de pending-purchase, actualizar
        if (this.importedDocument.id && this.importedDocument.type === 'pending-purchase') {
          response = await api.put(`/pending-purchases/${this.importedDocument.id}`, pendingPurchaseData);
          documentNumber = this.importedDocument.number;
        }
        // Si viene de una cotización importada, eliminar la cotización y crear pending-purchase
        else if (this.importedDocument.id && this.importedDocument.type === 'quote') {
          // Eliminar la cotización
          await api.delete(`/quotes/${this.importedDocument.id}`);
          // Crear nueva pending-purchase
          response = await api.post('/pending-purchases', pendingPurchaseData);
          documentNumber = response.data.data.document_number;
        }
        // Si no viene de importación, crear nueva
        else {
          response = await api.post('/pending-purchases', pendingPurchaseData);
          documentNumber = response.data.data.document_number;
        }

        Swal.fire({
          icon: 'success',
          title: 'Operación Guardada',
          html: `<p>Número: ${documentNumber}</p>`,
          timer: 3000
        });

        this.clearPurchase();
      } catch (error) {
        console.error('Error saving pending purchase:', error);
        Swal.fire('Error', 'Error al guardar la operación en espera', 'error');
      }
    },
    async savePurchase(status = 'paid', amountReceived = 0) {
      try {
        const purchaseData = {
          purchase_number: this.purchaseNumber,
          document_type: this.documentType,
          supplier_id: this.supplierInfo.id,
          warehouse_id: this.purchase.warehouse_id,
          buyer_id: this.currentVendor.id,
          items: this.purchase.items,
          subtotal: this.totals.subtotal,
          tax: this.totals.tax,
          total: this.totals.total,
          status: status
        };

        await api.post('/billing/purchases', purchaseData);

        if (status === 'paid') {
          const change = amountReceived - this.totals.total;
          Swal.fire({
            icon: 'success',
            title: 'Pago Procesado',
            html: `<p>Cambio: L ${this.formatCurrency(change)}</p>`
          });
        } else {
          Swal.fire('Guardado', 'Compra guardada', 'success');
        }

        this.clearPurchase();
        this.resolution.current++;
      } catch (error) {
        Swal.fire('Error', 'Error al guardar la compra', 'error');
      }
    },
    async clearPurchase() {
      // Si hay un documento importado, manejarlo según el tipo actual
      if (this.importedDocument.id) {
        // Si estoy en COMPRA y el documento importado es una pending-purchase, eliminarlo
        if (this.documentType === 'COMPRA' && this.importedDocument.type === 'pending-purchase') {
          try {
            await api.delete(`/pending-purchases/${this.importedDocument.id}`);
            console.log('Pending purchase eliminada:', this.importedDocument.id);
          } catch (error) {
            console.error('Error eliminando pending purchase:', error);
          }
        }
        // Si estoy en COTIZACIÓN y el documento importado es una cotización, NO eliminarlo
        // (las cotizaciones no se eliminan al hacer clic en ELIMINAR)

        // Resetear el tracking
        this.importedDocument = {
          id: null,
          type: null,
          number: null
        };
      }

      this.purchase.items = [];
      this.purchase.shipping_cost = 0; // Resetear recargo
      this.currentProduct = {
        code: '',
        name: '',
        quantity: 1,
        price: 0,
        discount_percent: 0,
        tax_percent: 15
      };
    },
    focusProductInput() {
      this.$nextTick(() => {
        if (this.$refs.productCodeInput) {
          this.$refs.productCodeInput.focus();
        }
      });
    },
    focusWarehouse() {
      if (this.$refs.warehouseSelect) {
        this.$refs.warehouseSelect.focus();
      }
    },
    getWarehouseName(warehouseId) {
      const warehouse = this.warehouses.find(w => w.value === warehouseId);
      return warehouse ? warehouse.label : 'N/A';
    },
    
    selectCustomer(supplier) {
      this.supplierInfo = {
        id: supplier.value,
        code: supplier.code,
        name: supplier.label,
        rtn: supplier.rtn,
        phone: supplier.phone
      };
      this.showCustomerModal = false;
    },
    viewCustomerInfo(supplier) {
      this.selectedCustomerInfo = supplier;
      this.showCustomerInfoModal = true;
    },
    closeAddCustomerModal() {
      this.showAddCustomerModal = false;
      this.showCustomerModal = true;
      this.newCustomer = {
        code: '',
        razon_social: '',
        nombre_comercial: '',
        beneficiary_type: 'JURIDICA_DOMICILIADA',
        tipo_identificacion: 'CEDULA',
        cedula: '',
        sar: '',
        tipo_proveedor: 'NACIONAL',
        tipo_contribuyente: 'CONTRIBUYENTE',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        useConsecutive: true
      };
    },
    async saveNewCustomer() {
      try {
        const supplierData = {
          supplier_code: this.newCustomer.code,
          name: this.newCustomer.razon_social,
          commercial_name: this.newCustomer.nombre_comercial,
          beneficiary_type: this.newCustomer.beneficiary_type,
          identification_type: this.newCustomer.tipo_identificacion,
          rtn: this.newCustomer.cedula,
          sar_id: this.newCustomer.sar,
          supplier_type: this.newCustomer.tipo_proveedor,
          taxpayer_type: this.newCustomer.tipo_contribuyente,
          email: this.newCustomer.email,
          phone: this.newCustomer.phone,
          mobile: this.newCustomer.mobile,
          address: this.newCustomer.address
        };

        const response = await api.post('/suppliers', supplierData);
        Swal.fire('Éxito', 'Proveedor creado exitosamente', 'success');
        await this.loadCustomers();
        const newCustomer = this.suppliers.find(c => c.value === response.data.data.id);
        if (newCustomer) {
          this.selectCustomer(newCustomer);
        }
        this.closeAddCustomerModal();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Error al guardar proveedor', 'error');
      }
    },
    selectProduct(product) {
      // Solo llenar el formulario, NO agregar automáticamente
      this.currentProduct.code = product.sku;
      this.currentProduct.name = product.name;
      this.currentProduct.price = product.sale_price || 0;
      this.currentProduct.product_id = product.id;
      // Mantener la cantidad que el usuario ya había puesto, o 1 por defecto
      if (!this.currentProduct.quantity || this.currentProduct.quantity === 0) {
        this.currentProduct.quantity = 1;
      }
      this.showProductModal = false;

      // Enfocar el campo de cantidad para que el usuario pueda ajustarla
      this.$nextTick(() => {
        const quantityInput = document.querySelector('input[type="number"]');
        if (quantityInput) {
          quantityInput.focus();
          quantityInput.select();
        }
      });
    },
    selectVendor(buyer) {
      this.currentVendor = buyer;
      this.showVendorModal = false;
    },
    // ==================== MÉTODOS DE PRODUCTOS ====================
    addProduct() {
      console.log('🛒 addProduct called');
      console.log('currentProduct:', this.currentProduct);
      console.log('purchase.warehouse_id:', this.purchase.warehouse_id);

      if (!this.currentProduct.code && !this.currentProduct.name) {
        Swal.fire('Error', 'Debe seleccionar un producto', 'error');
        return;
      }

      if (!this.purchase.warehouse_id) {
        Swal.fire('Error', 'Debe seleccionar una bodega', 'error');
        return;
      }

      if (this.currentProduct.quantity <= 0) {
        Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'error');
        return;
      }

      // Calcular el total del item
      const itemGross = this.currentProduct.price * this.currentProduct.quantity;
      const itemDiscount = itemGross * ((this.currentProduct.discount_percent || 0) / 100);
      const itemSubtotal = itemGross - itemDiscount;
      const itemTax = itemSubtotal * ((this.currentProduct.tax_percent || 0) / 100);
      const itemTotal = itemSubtotal + itemTax;

      const newItem = {
        product_id: this.currentProduct.product_id,
        code: this.currentProduct.code,
        name: this.currentProduct.name,
        price: this.currentProduct.price,
        quantity: this.currentProduct.quantity,
        warehouse_id: this.purchase.warehouse_id,
        discount_percent: this.currentProduct.discount_percent || 0,
        tax_percent: this.currentProduct.tax_percent || 15,
        total: itemTotal
      };

      console.log('➕ Adding item to purchase:', newItem);
      this.purchase.items.push(newItem);

      // Limpiar el producto actual
      this.currentProduct = {
        code: '',
        name: '',
        quantity: 1,
        price: 0,
        discount_percent: 0,
        tax_percent: 15,
        product_id: null
      };

      // Enfocar el input de producto
      this.focusProductInput();

      console.log('✅ Product added. Total items:', this.purchase.items.length);
    },
    removeProduct(index) {
      console.log('🗑️ Removing product at index:', index);
      this.purchase.items.splice(index, 1);
    },
    editProduct(index) {
      console.log('✏️ Editing product at index:', index);
      const item = this.purchase.items[index];

      // Cargar el item en el formulario actual
      this.currentProduct = {
        code: item.code,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        discount_percent: item.discount_percent,
        tax_percent: item.tax_percent,
        product_id: item.product_id
      };

      // Seleccionar la bodega
      this.purchase.warehouse_id = item.warehouse_id;

      // Eliminar el item de la lista
      this.purchase.items.splice(index, 1);

      // Enfocar el input de cantidad
      this.$nextTick(() => {
        const quantityInput = document.querySelector('input[type="number"]');
        if (quantityInput) quantityInput.focus();
      });
    },
    calculateItemTotal(index) {
      const item = this.purchase.items[index];
      const itemGross = item.price * item.quantity;
      const itemDiscount = itemGross * ((item.discount_percent || 0) / 100);
      const itemSubtotal = itemGross - itemDiscount;
      const itemTax = itemSubtotal * ((item.tax_percent || 0) / 100);
      item.total = itemSubtotal + itemTax;
    },
    saveAdditionalFields() {
      this.showAdditionalFields = false;
      Swal.fire('Guardado', 'Campos adicionales guardados', 'success');
    },
    closeAllModals() {
      this.showCustomerModal = false;
      this.showAddCustomerModal = false;
      this.showCustomerInfoModal = false;
      this.showProductModal = false;
      this.showVendorModal = false;
      this.showAdditionalFields = false;
      this.showAdditionalOptions = false;
    },
    formatNumber(value) {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
    },
    printPurchase() {
      // Ocultar el modal para la impresión
      const printContent = document.querySelector('.purchase-print-wrapper');
      if (!printContent) {
        console.error('No se encontró el contenedor de impresión');
        return;
      }

      // Crear una nueva ventana para imprimir
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Compra - ${this.createdPurchaseData?.purchase_number}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
              line-height: 1.3;
            }
            .purchase-print-wrapper {
              max-width: 80mm;
              margin: 0 auto;
              padding: 10px;
            }
            .text-center { text-align: center !important; }
            .text-end { text-align: right !important; }
            .fw-bold { font-weight: bold; }
            .mb-0 { margin-bottom: 0 !important; }
            .mb-1 { margin-bottom: 0.25rem !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .mb-3 { margin-bottom: 1rem !important; }
            .mt-2 { margin-top: 0.5rem !important; }
            .mt-3 { margin-top: 1rem !important; }
            .mt-4 { margin-top: 1.5rem !important; }
            .separator {
              border: 0;
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
              margin: 5px 0;
            }
            .items-table th,
            .items-table td {
              padding: 4px 2px;
              text-align: left;
              vertical-align: top;
            }
            .items-table th {
              border-bottom: 1px dashed #000;
              font-weight: bold;
            }
            .items-table td {
              border-bottom: 1px dotted #ccc;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
              font-size: 10px;
            }
            .totals-row.total-final {
              font-size: 12px;
              margin-top: 5px;
              padding-top: 5px;
              border-top: 1px solid #000;
            }
            .company-name {
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              margin: 5px 0;
            }
            .document-type {
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              margin: 10px 0 5px 0;
            }
            .purchase-number {
              font-size: 14px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
    },
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      return `${day}/${month}/${year}\n${hours}:${minutes} ${ampm}`;
    },
    formatVenceDays(dateString) {
      if (!dateString) return '(0) Días';
      const venceDate = new Date(dateString);
      const today = new Date();
      const diffTime = venceDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `(${diffDays}) Días`;
    },
    getVenceDaysClass(dateString) {
      if (!dateString) return 'text-danger';
      const venceDate = new Date(dateString);
      const today = new Date();
      const diffTime = venceDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'text-danger'; // Vencido
      if (diffDays <= 5) return 'text-warning'; // Próximo a vencer
      return 'text-success'; // Vigente
    },
    selectDocument(doc) {
      this.selectedDocumentId = this.selectedDocumentId === doc.id ? null : doc.id;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-HN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    },
    getStatusBadgeClass(status) {
      const classes = {
        pending: 'bg-warning',
        approved: 'bg-success',
        rejected: 'bg-danger',
        converted: 'bg-info'
      };
      return classes[status] || 'bg-secondary';
    },
    openImportModal(type) {
      this.showImportDropdown = false; // Cerrar el dropdown
      this.importDocumentType = type;
      this.showImportModal = true;
      this.selectedDocumentId = null;
      this.importSearch = '';
      this.importDateFrom = '';
      this.importDateTo = '';
      this.loadDocuments();
    },
    closeImportModal() {
      this.showImportModal = false;
      this.documents = [];
      this.selectedDocumentId = null;
      this.importPage = 1;
      this.importSearch = '';
      this.importSearchBy = 'name';
      this.importSortBy = 'recent';
      this.importDateFrom = '';
      this.importDateTo = '';
      this.importVendorFilter = '';
    },
    async loadDocuments() {
      try {
        const endpoint = this.importDocumentType === 'pending-purchase'
          ? '/pending-purchases'
          : '/quotes';

        const response = await api.get(endpoint);
        this.documents = response.data.data || [];
      } catch (error) {
        console.error('Error loading documents:', error);
        Swal.fire('Error', 'No se pudieron cargar los documentos', 'error');
      }
    },
    async viewDocumentDetails(doc) {
      try {
        const endpoint = this.importDocumentType === 'pending-purchase'
          ? `/pending-purchases/${doc.id}`
          : `/quotes/${doc.id}`;

        const response = await api.get(endpoint);
        const docData = response.data.data;

        let itemsHtml = '<table class="table table-sm"><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody>';
        docData.items.forEach(item => {
          itemsHtml += `<tr>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>L ${this.formatCurrency(item.unit_price)}</td>
            <td>L ${this.formatCurrency(item.quantity * item.unit_price)}</td>
          </tr>`;
        });
        itemsHtml += '</tbody></table>';

        Swal.fire({
          title: docData.document_number || docData.quote_number,
          html: `
            <div class="text-start">
              <p><strong>Proveedor:</strong> ${docData.supplier_name}</p>
              <p><strong>Fecha:</strong> ${this.formatDate(docData.created_at)}</p>
              <p><strong>Total:</strong> L ${this.formatCurrency(docData.total)}</p>
              <hr>
              <h6>Productos:</h6>
              ${itemsHtml}
            </div>
          `,
          width: '600px',
          confirmButtonText: 'Cerrar'
        });
      } catch (error) {
        console.error('Error loading document details:', error);
        Swal.fire('Error', 'No se pudo cargar el detalle del documento', 'error');
      }
    },
    async importDocument() {
      if (!this.selectedDocumentId) {
        Swal.fire('Error', 'Seleccione un documento para importar', 'error');
        return;
      }

      try {
        const endpoint = this.importDocumentType === 'pending-purchase'
          ? `/pending-purchases/${this.selectedDocumentId}`
          : `/quotes/${this.selectedDocumentId}`;

        const response = await api.get(endpoint);
        const docData = response.data.data;

        // Clear current purchase
        this.clearPurchase();

        // Set supplier info
        this.supplierInfo = {
          id: docData.supplier_id,
          code: docData.supplier_code || '',
          name: docData.supplier_name,
          rtn: docData.supplier_rtn || '',
          phone: docData.supplier_phone || ''
        };

        // Set warehouse if available
        if (docData.warehouse_id) {
          this.purchase.warehouse_id = docData.warehouse_id;
        }

        // Set buyer if available
        if (docData.buyer_id) {
          this.currentVendor = {
            id: docData.buyer_id,
            code: docData.buyer_code || '',
            name: docData.buyer_name
          };
        }

        // Import items
        if (docData.items && Array.isArray(docData.items)) {
          this.purchase.items = docData.items.map(item => ({
            product_id: item.product_id,
            code: item.product_code,
            name: item.product_name,
            quantity: parseFloat(item.quantity) || 1,
            price: parseFloat(item.unit_price) || 0,
            discount_percent: item.discount_value ? (item.discount_value / item.unit_price * 100) : 0,
            tax_percent: parseFloat(item.tax_rate) || 15,
            warehouse_id: item.warehouse_id || this.purchase.warehouse_id,
            total: 0
          }));

          // Recalculate totals for each item
          this.purchase.items.forEach((item, index) => {
            this.calculateItemTotal(index);
          });
        }

        // Cargar el recargo (surcharge) si existe
        if (docData.surcharge !== undefined && docData.surcharge !== null) {
          this.purchase.shipping_cost = parseFloat(docData.surcharge) || 0;
        }

        // Guardar información del documento importado para tracking
        this.importedDocument = {
          id: docData.id,
          type: this.importDocumentType,
          number: docData.document_number || docData.quote_number
        };

        // Close modal
        this.closeImportModal();

        Swal.fire({
          icon: 'success',
          title: 'Documento Importado',
          text: 'El documento se ha importado exitosamente. Puede continuar con el cobro.',
          timer: 2000,
          showConfirmButton: false
        });

      } catch (error) {
        console.error('Error importing document:', error);
        Swal.fire('Error', 'No se pudo importar el documento', 'error');
      }
    }
  }
};
</script>

<style scoped>
/* Purple button for import */
.btn-purple {
  background-color: #6f42c1;
  border-color: #6f42c1;
  color: white;
}

.btn-purple:hover {
  background-color: #5a32a3;
  border-color: #5a32a3;
  color: white;
}

.btn-purple:focus,
.btn-purple:active {
  background-color: #4e2a8e;
  border-color: #4e2a8e;
  color: white;
  box-shadow: 0 0 0 0.25rem rgba(111, 66, 193, 0.5);
}

.pos-purchase-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow: hidden;
}

.header-pos {
  background: #fff;
  padding: 0.75rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  flex-shrink: 0;
}

.header-pos-compact {
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  flex-shrink: 0;
  border-bottom: 1px solid #e0e4e8;
}

.btn-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.pos-content-main {
  flex: 1;
  overflow: hidden;
  padding: 0.25rem 0;
}

.pos-scrollable {
  overflow-y: auto;
  overflow-x: hidden;
}

.mini-header-bar {
  flex-shrink: 0;
}

.label-tiny {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 0.25rem;
  display: block;
}

.text-sm {
  font-size: 0.85rem;
}

.info-mini {
  background: #fff;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e0e4e8;
}

.badge-sm {
  font-size: 0.65rem;
  padding: 0.25rem 0.4rem;
}

.card {
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border-radius: 8px;
}

.products-list-card {
  min-height: 0;
}

.products-vertical-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.products-scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem;
}

.product-item-card {
  background: #fff;
  border: 1px solid #e0e4e8;
  border-radius: 6px;
  padding: 0.75rem;
  transition: all 0.2s;
}

.product-item-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-color: #5b6cde;
}

.product-item-compact {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 0.35rem 0.5rem;
  transition: all 0.15s;
}

.product-item-compact:hover {
  background: #f8f9fa;
  border-color: #5b6cde;
}

.totals-card .total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

.totals-card .total-final {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
}

.modal.show {
  display: block !important;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.product-img-mini {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}
</style>
