<template>
  <div class="pos-invoice-wrapper">
    <!-- Mini Header Bar -->
    <div class="mini-header-bar bg-light border-bottom py-1">
      <div class="container-fluid">
        <div class="d-flex align-items-center justify-content-between">
          <router-link to="/dashboard/admin-dashboard" class="btn btn-link text-dark p-0">
            <i class="ti ti-arrow-left fs-3"></i>
          </router-link>
          <span class="text-muted small">{{ currentDate }}</span>
          <button class="btn btn-outline-primary btn-sm" @click="toggleDocumentType">
            <i class="ti ti-file-invoice me-1"></i>{{ documentType }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content with Scroll -->
    <div class="pos-content-main pos-scrollable">
      <div class="container-fluid h-100">
        <div class="row g-2 h-100">

          <!-- LEFT COLUMN -->
          <div class="col-lg-8 d-flex flex-column">

            <!-- Invoice Info -->
            <div class="card mb-2 flex-shrink-0">
              <div class="card-body p-3">
                <div class="row g-3">
                  <!-- Consecutivo -->
                  <div :class="documentType === 'COTIZACION' ? 'col-md-6' : 'col-md-3'">
                    <label class="form-label fw-bold">Consecutivo</label>
                    <input type="text" class="form-control fw-bold text-center fs-4" :value="currentConsecutive" readonly>
                  </div>

                  <!-- Campos de Resolución - Solo para FACTURA -->
                  <template v-if="documentType === 'FACTURA'">
                    <div class="col-md-3">
                      <label class="form-label fw-bold">No. Resolución</label>
                      <input type="text" class="form-control" :value="resolution.cai" readonly>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label fw-bold">Consec. Resolución</label>
                      <input type="text" class="form-control text-primary fw-bold" v-model="invoiceNumber" readonly>
                    </div>
                  </template>

                  <!-- Tipo de Documento -->
                  <div :class="documentType === 'COTIZACION' ? 'col-md-6' : 'col-md-3'">
                    <label class="form-label fw-bold">Documento</label>
                    <select class="form-select" v-model="documentType">
                      <option value="FACTURA">FACTURA</option>
                      <option value="COTIZACION">COTIZACION</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Client, Warehouse, Vendor Row -->
            <div class="card mb-2 flex-shrink-0">
              <div class="card-body p-3">
                <div class="row g-3">
                  <div class="col-md-5">
                    <label class="form-label fw-bold">Cliente</label>
                    <div class="input-group">
                      <button class="btn btn-info" @click="showCustomerModal = true">
                        <i class="ti ti-search"></i>
                      </button>
                      <input type="text" class="form-control" :value="customerInfo.code" readonly style="max-width: 80px;">
                      <input type="text" class="form-control" :value="customerInfo.name" readonly>
                      <button class="btn btn-success" @click="showNewCustomerModal = true">
                        <i class="ti ti-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Bodega</label>
                    <select class="form-select" v-model="invoice.warehouse_id">
                      <option v-for="w in warehouses" :key="w.value" :value="w.value">{{ w.label }}</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-bold">Vendedor</label>
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
                      <li><a class="dropdown-item" href="#" @click.prevent="openImportModal('pending-invoice')">
                        <i class="ti ti-clock me-2"></i>Operación en Espera
                      </a></li>
                      <li><a class="dropdown-item" href="#" @click.prevent="openImportModal('quote')">
                        <i class="ti ti-file-invoice me-2"></i>Cotización
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
                  <div v-if="invoice.items.length > 0" class="list-header d-flex align-items-center px-2 py-1 bg-light border-bottom fw-bold text-uppercase" style="font-size: 0.75rem;">
                    <div style="width: 120px;">ALMACEN</div>
                    <div style="width: 100px;" class="text-end">P.UNIT.</div>
                    <div style="width: 120px;" class="text-end">DESC.UNIT.</div>
                    <div style="width: 100px;" class="text-center">CANTIDAD</div>
                    <div style="width: 100px;" class="text-end">IMPUESTOS</div>
                    <div class="flex-grow-1 text-end">TOTAL</div>
                  </div>

                  <!-- Lista de Productos - Ultra Compacto -->
                  <div class="products-scroll-area">
                    <div v-for="(item, index) in invoice.items" :key="index" class="product-item-compact mb-1">
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
                    <div v-if="invoice.items.length === 0" class="text-center py-3 text-muted">
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
                    <input type="number" class="form-control py-0 text-end" v-model.number="invoice.shipping_cost" min="0" step="0.01">
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
                  <button class="btn btn-danger btn-lg" @click="clearInvoice">
                    <i class="ti ti-trash me-2"></i>ELIMINAR
                  </button>

                  <!-- Botones para COTIZACIÓN -->
                  <template v-if="documentType === 'COTIZACION'">
                    <button class="btn btn-info btn-lg" @click="saveAsQuote" :disabled="invoice.items.length === 0">
                      <i class="ti ti-file-invoice me-2"></i>Guardar como Cotización
                    </button>
                    <button class="btn btn-warning btn-lg" @click="saveAsPendingInvoice" :disabled="invoice.items.length === 0">
                      <i class="ti ti-device-floppy me-2"></i>Guardar como Operación en Espera
                    </button>
                  </template>

                  <!-- Botones para FACTURA -->
                  <template v-else>
                    <button class="btn btn-warning btn-lg" @click="saveAsDraft" :disabled="invoice.items.length === 0">
                      <i class="ti ti-device-floppy me-2"></i>GUARDAR
                    </button>
                    <button class="btn btn-success btn-lg" @click="showQuickPaymentModal = true" :disabled="invoice.items.length === 0">
                      <i class="ti ti-currency-dollar me-2"></i>COBRO RÁPIDO
                    </button>
                    <button class="btn btn-info btn-lg" @click="showDetailedPaymentModal = true" :disabled="invoice.items.length === 0">
                      <i class="ti ti-receipt-2 me-2"></i>COBRO DETALLADO
                    </button>
                  </template>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    
    
    <!-- Modal: Búsqueda de Cliente -->
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
                <select class="form-select form-select-sm" v-model="customerSearchBy">
                  <option value="name">Nombre</option>
                  <option value="code">Código</option>
                  <option value="rtn">RTN</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Ordenar Por:</label>
                <select class="form-select form-select-sm" v-model="customerSortBy">
                  <option value="name">Nombre (A-Z)</option>
                  <option value="code">Código</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">&nbsp;</label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text"><i class="ti ti-search"></i></span>
                  <input type="text" class="form-control" v-model="customerSearch" placeholder="Buscar..." @input="customerPage = 1">
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
                  <tr v-for="customer in paginatedCustomers" :key="customer.value" @click="selectCustomer(customer)" style="cursor: pointer;">
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-secondary" @click.stop="viewCustomerInfo(customer)">+ INFO</button>
                    </td>
                    <td>{{ customer.code }}</td>
                    <td>{{ customer.label }}</td>
                    <td class="text-center">
                      <span class="badge bg-success">ACTIVO</span>
                    </td>
                  </tr>
                  <tr v-if="filteredCustomers.length === 0">
                    <td colspan="3" class="text-center text-muted py-4">No se encontraron clientes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer justify-content-between">
            <div>
              <button type="button" class="btn btn-success" @click="showAddCustomerModal = true; showCustomerModal = false;">
                <i class="ti ti-plus me-1"></i>Nuevo Cliente
              </button>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="customerPage--"
                :disabled="customerPage <= 1">
                <i class="ti ti-chevron-left"></i>
              </button>
              <span class="small">Página {{ customerPage }} de {{ customerTotalPages }}</span>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="customerPage++"
                :disabled="customerPage >= customerTotalPages">
                <i class="ti ti-chevron-right"></i>
              </button>
              <button type="button" class="btn btn-secondary" @click="showCustomerModal = false">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Info de Cliente -->
    <div v-if="showCustomerInfoModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Información del Cliente</h5>
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

    <!-- Modal: Nuevo Cliente -->
    <div v-if="showAddCustomerModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Documentos Ventas - Nuevo Cliente</h5>
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
                <label class="form-label fw-bold">Tipo de Cliente</label>
                <select class="form-select" v-model="newCustomer.tipo_cliente">
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

    <!-- Modal: Búsqueda de Vendedor -->
    <div v-if="showVendorModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Búsqueda de datos - Vendedores</h5>
            <button type="button" class="btn-close" @click="showVendorModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-12">
                <div class="input-group">
                  <span class="input-group-text"><i class="ti ti-search"></i></span>
                  <input type="text" class="form-control" v-model="vendorSearch" placeholder="Buscar vendedor...">
                </div>
              </div>
            </div>

            <div class="table-responsive" style="max-height: 400px;">
              <table class="table table-hover table-sm">
                <thead class="table-light sticky-top">
                  <tr>
                    <th style="width: 30%;">Código</th>
                    <th style="width: 70%;">Vendedor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="vendor in filteredVendors" :key="vendor.id" @click="selectVendor(vendor)" style="cursor: pointer;">
                    <td>{{ vendor.code }}</td>
                    <td>{{ vendor.name }}</td>
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
              <button class="btn btn-info btn-lg"><i class="ti ti-file-certificate me-2"></i>EXONERACIÓN ISV</button>
              <button class="btn btn-info btn-lg" @click="showCouponModal = true; showAdditionalOptions = false"><i class="ti ti-ticket me-2"></i>APLICAR CUPÓN DE DESCUENTO</button>
              <button class="btn btn-info btn-lg" @click="showOffersModal = true; showAdditionalOptions = false"><i class="ti ti-tag me-2"></i>VER OFERTAS DISPONIBLES</button>
              <button class="btn btn-info btn-lg"><i class="ti ti-calculator me-2"></i>RECALCULAR TASA DE CAMBIO</button>
              <button class="btn btn-outline-secondary btn-lg"><i class="ti ti-keyboard me-2"></i>ATAJOS DE TECLADO</button>
              <button class="btn btn-outline-secondary btn-lg"><i class="ti ti-settings me-2"></i>CONFIG. DOCUMENTO</button>
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

    <!-- Modal Cobro Rápido -->
    <div v-if="showQuickPaymentModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Cobro Rápido</h5>
            <button type="button" class="btn-close" @click="showQuickPaymentModal = false"></button>
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
                        <td class="text-end">L {{ invoice.discount.toFixed(2) }}</td>
                      </tr>
                      <tr>
                        <td><strong>ISV ({{ invoice.tax_rate }}%):</strong></td>
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

                <!-- Información del cliente -->
                <div class="card">
                  <div class="card-header bg-info text-white">
                    <strong>Información del Cliente</strong>
                  </div>
                  <div class="card-body">
                    <div class="row g-2">
                      <div class="col-md-6">
                        <p class="mb-1"><strong>Nombre:</strong> {{ customerInfo.name || 'N/A' }}</p>
                        <p class="mb-1"><strong>RTN:</strong> {{ customerInfo.rtn || 'N/A' }}</p>
                      </div>
                      <div class="col-md-6">
                        <p class="mb-1"><strong>Teléfono:</strong> {{ customerInfo.phone || 'N/A' }}</p>
                        <p class="mb-1"><strong>Saldo Cliente:</strong> L {{ detailedPayment.clientBalance.toFixed(2) }}</p>
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

    <!-- Modal de Impresión de Factura -->
    <div v-if="showPrintModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;">
      <div class="modal-dialog modal-lg" style="max-width: 600px; margin: 30px auto;">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Factura Creada Exitosamente</h5>
            <button type="button" class="btn-close" @click="showPrintModal = false"></button>
          </div>
          <div class="modal-body" style="background: #f5f5f5; padding: 0; max-height: calc(100vh - 200px); overflow: hidden;">
            <iframe
              v-if="createdInvoiceData"
              ref="invoiceFrame"
              :srcdoc="buildInvoicePreview()"
              style="width: 100%; height: calc(100vh - 200px); border: none; background: white; display: block;"
              @load="onIframeLoad">
            </iframe>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showPrintModal = false">
              Cerrar
            </button>
            <div class="btn-group" style="position: relative;">
              <button type="button" class="btn btn-success dropdown-toggle" @click="showExportMenu = !showExportMenu">
                <i class="ti ti-download me-1"></i>Otras Opciones
              </button>
              <ul class="dropdown-menu" :class="{ show: showExportMenu }" style="position: absolute; bottom: 100%; left: 0; margin-bottom: 5px;">
                <li><a class="dropdown-item" href="#" @click.prevent="exportToExcel(); showExportMenu = false"><i class="ti ti-file-spreadsheet me-2"></i>Exportar a Excel</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="exportToPDF(); showExportMenu = false"><i class="ti ti-file-type-pdf me-2"></i>Exportar a PDF</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="exportToImage(); showExportMenu = false"><i class="ti ti-photo me-2"></i>Guardar como Imagen</a></li>
              </ul>
            </div>
            <button type="button" class="btn btn-primary" @click="printInvoice">
              <i class="ti ti-printer me-1"></i>Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Quote Preview -->
    <div v-if="showQuotePreview" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;">
      <div class="modal-dialog modal-xl" style="max-width: 900px; margin: 30px auto;">
        <div class="modal-content">
          <div class="modal-header" style="background: #FF9800; color: white;">
            <h5 class="modal-title text-white">Vista Previa - Cotización</h5>
            <button type="button" class="btn-close btn-close-white" @click="showQuotePreview = false"></button>
          </div>
          <div class="modal-body" style="background: #f5f5f5; padding: 0; max-height: calc(100vh - 200px); overflow: auto;">
            <iframe
              v-if="quotePreviewHTML"
              :srcdoc="quotePreviewHTML"
              style="width: 100%; height: calc(100vh - 200px); border: none; background: white; display: block;">
            </iframe>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeQuotePreview">
              Cerrar
            </button>
            <div class="btn-group" style="position: relative;">
              <button type="button" class="btn btn-success dropdown-toggle" @click="showQuoteOptionsDropdown = !showQuoteOptionsDropdown">
                <i class="ti ti-file-export me-1"></i>Otras Opciones
              </button>
              <ul class="dropdown-menu" :class="{ show: showQuoteOptionsDropdown }" style="position: absolute; bottom: 100%; left: 0; margin-bottom: 5px;">
                <li><a class="dropdown-item" href="#" @click.prevent="exportQuoteToPDF(); showQuoteOptionsDropdown = false"><i class="ti ti-file-type-pdf me-2"></i>Exportar a PDF</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="exportQuoteToExcel(); showQuoteOptionsDropdown = false"><i class="ti ti-file-type-xls me-2"></i>Exportar a Excel</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="saveQuoteAsImage(); showQuoteOptionsDropdown = false"><i class="ti ti-photo me-2"></i>Guardar como Imagen</a></li>
              </ul>
            </div>
            <button type="button" class="btn btn-warning" @click="printQuotePreview">
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
                <label class="form-label fw-bold small">Vendedor</label>
                <select class="form-select form-select-sm" v-model="importVendorFilter">
                  <option value="">Seleccione un Vendedor</option>
                  <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                    {{ vendor.name }}
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
                    <th style="width: 20%;">Cliente</th>
                    <th style="width: 12%;">Vendedor</th>
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
                    <td class="small">{{ doc.customer_name }}</td>
                    <td class="small">{{ doc.seller_name || 'N/A' }}</td>
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

    <!-- Modal: Aplicar Cupón -->
    <div v-if="showCouponModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Aplicar Cupón de Descuento</h5>
            <button type="button" class="btn-close" @click="closeCouponModal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-12">
                <label class="form-label fw-bold">Código del Cupón</label>
                <div class="input-group">
                  <input type="text" class="form-control" v-model="couponCode" placeholder="Ingrese el código del cupón" @keypress.enter="applyCoupon">
                  <button class="btn btn-primary" @click="applyCoupon">
                    <i class="ti ti-check me-1"></i>APLICAR
                  </button>
                </div>
              </div>
            </div>

            <div v-if="appliedCoupon" class="alert alert-success">
              <h6 class="fw-bold mb-2">Cupón Aplicado</h6>
              <p class="mb-1"><strong>Código:</strong> {{ appliedCoupon.code }}</p>
              <p class="mb-1"><strong>Descuento:</strong> {{ appliedCoupon.discount_type === 'percentage' ? appliedCoupon.discount_value + '%' : 'L ' + appliedCoupon.discount_value }}</p>
              <button class="btn btn-sm btn-danger mt-2" @click="removeCoupon">
                <i class="ti ti-x me-1"></i>Remover Cupón
              </button>
            </div>

            <hr>

            <h6 class="fw-bold mb-3">Cupones Disponibles</h6>
            <div class="table-responsive" style="max-height: 300px;">
              <table class="table table-sm table-hover">
                <thead class="table-light sticky-top">
                  <tr>
                    <th>Código</th>
                    <th>Descuento</th>
                    <th>Válido Hasta</th>
                    <th class="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="coupon in availableCoupons" :key="coupon.id">
                    <td>{{ coupon.code }}</td>
                    <td>{{ coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : 'L ' + coupon.discount_value }}</td>
                    <td>{{ formatDate(coupon.valid_until) }}</td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-primary" @click="selectCoupon(coupon)">
                        Aplicar
                      </button>
                    </td>
                  </tr>
                  <tr v-if="availableCoupons.length === 0">
                    <td colspan="4" class="text-center text-muted py-3">No hay cupones disponibles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCouponModal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Ver Ofertas -->
    <div v-if="showOffersModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Ofertas Disponibles</h5>
            <button type="button" class="btn-close" @click="closeOffersModal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <input type="text" class="form-control" v-model="offersSearch" placeholder="Buscar ofertas...">
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="offersTypeFilter">
                  <option value="">Todos los tipos</option>
                  <option value="percentage">Porcentaje</option>
                  <option value="fixed">Monto fijo</option>
                  <option value="2x1">2x1</option>
                  <option value="3x2">3x2</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="offersStatusFilter">
                  <option value="active">Solo activas</option>
                  <option value="all">Todas</option>
                </select>
              </div>
            </div>

            <div class="table-responsive" style="max-height: 400px;">
              <table class="table table-sm table-hover">
                <thead class="table-light sticky-top">
                  <tr>
                    <th>Oferta</th>
                    <th>Tipo</th>
                    <th>Descuento</th>
                    <th>Productos</th>
                    <th>Válido Hasta</th>
                    <th class="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="offer in filteredOffers" :key="offer.id">
                    <td>
                      <strong>{{ offer.name }}</strong>
                      <br>
                      <small class="text-muted">{{ offer.description }}</small>
                    </td>
                    <td>
                      <span class="badge bg-info">{{ offer.offer_type }}</span>
                    </td>
                    <td>{{ offer.discount_type === 'percentage' ? offer.discount_value + '%' : 'L ' + offer.discount_value }}</td>
                    <td>
                      <small>{{ offer.applies_to === 'all' ? 'Todos los productos' : offer.product_count + ' productos' }}</small>
                    </td>
                    <td>{{ formatDate(offer.valid_until) }}</td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-success" @click="viewOfferDetails(offer)">
                        <i class="ti ti-eye me-1"></i>Ver
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredOffers.length === 0">
                    <td colspan="6" class="text-center text-muted py-3">No hay ofertas disponibles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeOffersModal">Cerrar</button>
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
import { LOGO_BASE64 } from '@/assets/img/logo.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default {
  name: 'POSInvoice',
  components: {
    ProductModal,
    InvoicePrint
  },
  data() {
    return {
      documentType: 'FACTURA',
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
      invoice: {
        consecutive: '0000031837',
        warehouse_id: null,
        is_delivery: false,
        items: [],
        tax_rate: 15,
        discount: 0,
        shipping_cost: 0
      },
      resolution: {
        id: 1, // ID de la resolución activa
        cai: '2A9170-F8828A-8815E0-63BE03-090956-9D',
        prefix: '000-002-01-',
        current: 31838 // Actualizado al siguiente disponible
      },
      customerInfo: {
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
      customers: [],
      products: [],
      warehouses: [],
      vendors: [],
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
        tipo_cliente: 'NACIONAL',
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
      customerSearch: '',
      productSearch: '',
      vendorSearch: '',
      customerPage: 1,
      customerPerPage: 10,
      customerSearchBy: 'name',
      customerSortBy: 'name',
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
      showExportMenu: false,
      createdInvoiceData: null,
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
      documentType: 'COTIZACION',
      // Import Document
      showImportDropdown: false,
      showImportModal: false,
      importDocumentType: '', // 'pending-invoice' or 'quote'
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
        type: null, // 'pending-invoice' or 'quote'
        number: null
      },
      // Consecutivos numéricos por tipo de documento
      consecutives: {
        quote: 1,      // Consecutivo para cotizaciones
        invoice: 31837,    // Consecutivo para facturas - sincronizado con resolución
        pending: 1     // Consecutivo para facturas en espera
      },
      // Modal de Cupones
      showCouponModal: false,
      couponCode: '',
      appliedCoupon: null,
      availableCoupons: [],
      // Modal de Ofertas
      showOffersModal: false,
      offersSearch: '',
      offersTypeFilter: '',
      offersStatusFilter: 'active',
      availableOffers: [],
      // Quote Preview Modal
      showQuotePreview: false,
      quotePreviewHTML: '',
      companyInfo: {},
      bankAccounts: [],
      lastQuoteNumber: null,
      lastQuoteConsecutive: null,
      showQuoteOptionsDropdown: false
    };
  },
  computed: {
    // Consecutivo actual según el tipo de documento
    currentConsecutive() {
      if (this.documentType === 'FACTURA') {
        // Para facturas, el consecutivo debe coincidir con la resolución
        return String(this.resolution.current).padStart(8, '0');
      } else if (this.documentType === 'COTIZACION') {
        return String(this.consecutives.quote).padStart(10, '0');
      } else if (this.documentType === 'PENDING') {
        return String(this.consecutives.pending).padStart(10, '0');
      }
      return '0000000001';
    },

    invoiceNumber() {
      return `${this.resolution.prefix}${String(this.resolution.current).padStart(8, '0')}`;
    },

    // Ofertas filtradas
    filteredOffers() {
      if (!Array.isArray(this.availableOffers)) return [];
      let filtered = [...this.availableOffers];

      // Filtrar por búsqueda
      if (this.offersSearch) {
        const search = this.offersSearch.toLowerCase();
        filtered = filtered.filter(o =>
          (o.name || '').toLowerCase().includes(search) ||
          (o.description || '').toLowerCase().includes(search)
        );
      }

      // Filtrar por tipo
      if (this.offersTypeFilter) {
        filtered = filtered.filter(o => o.offer_type === this.offersTypeFilter);
      }

      // Filtrar por estado
      if (this.offersStatusFilter === 'active') {
        const now = new Date();
        filtered = filtered.filter(o => {
          const validUntil = new Date(o.valid_until);
          return o.is_active && validUntil >= now;
        });
      }

      return filtered;
    },
    
    filteredCustomers() {
      if (!Array.isArray(this.customers)) return [];
      let filtered = [...this.customers];
      if (this.customerSearch) {
        const search = this.customerSearch.toLowerCase();
        filtered = filtered.filter(c => {
          if (this.customerSearchBy === 'name') return (c.label || '').toLowerCase().includes(search);
          if (this.customerSearchBy === 'code') return (c.code || '').toLowerCase().includes(search);
          if (this.customerSearchBy === 'rtn') return (c.rtn || '').toLowerCase().includes(search);
          return false;
        });
      }
      if (this.customerSortBy === 'name') filtered.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
      else if (this.customerSortBy === 'code') filtered.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
      return filtered;
    },
    paginatedCustomers() {
      const start = (this.customerPage - 1) * this.customerPerPage;
      return this.filteredCustomers.slice(start, start + this.customerPerPage);
    },
    customerTotalPages() {
      return Math.ceil(this.filteredCustomers.length / this.customerPerPage);
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
      if (!Array.isArray(this.vendors)) return [];
      if (!this.vendorSearch) return this.vendors;
      const search = this.vendorSearch.toLowerCase();
      return this.vendors.filter(v => (v.name || '').toLowerCase().includes(search) || (v.code || '').toLowerCase().includes(search));
    },
    totalPaid() {
      return this.detailedPayment.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
    },
    remainingBalance() {
      return Math.max(0, this.totalWithTax - this.totalPaid);
    },
    subtotal() {
      return this.invoice.items.reduce((sum, item) => {
        const itemGross = item.price * item.quantity;
        const itemDiscount = itemGross * ((item.discount_percent || 0) / 100);
        return sum + (itemGross - itemDiscount);
      }, 0);
    },
    taxAmount() {
      const taxRate = this.invoice.tax_rate || 15;
      return this.subtotal * (taxRate / 100);
    },
    totalWithTax() {
      return this.subtotal + this.taxAmount - (this.invoice.discount || 0);
    },
    totals() {
      let itemCount = 0;
      let gross = 0;
      let subtotal = 0;
      let tax = 0;

      this.invoice.items.forEach(item => {
        itemCount += item.quantity;
        const itemGross = item.price * item.quantity;
        const itemDiscount = itemGross * (item.discount_percent / 100);
        const itemSubtotal = itemGross - itemDiscount;
        const itemTax = itemSubtotal * (item.tax_percent / 100);

        gross += itemGross;
        subtotal += itemSubtotal;
        tax += itemTax;
      });

      const shipping = parseFloat(this.invoice.shipping_cost) || 0;
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
            return (doc.customer_name || '').toLowerCase().includes(search);
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
        filtered = filtered.filter(doc => doc.seller_id === this.importVendorFilter);
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
    // Event listener para cerrar dropdown al hacer click fuera
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    // Remover event listener al destruir el componente
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    toggleDocumentType() {
      this.documentType = this.documentType === 'FACTURA' ? 'COTIZACION' : 'FACTURA';
    },
    async loadInitialData() {
      await Promise.all([
        this.loadConsecutives(),
        this.loadCustomers(),
        this.loadProducts(),
        this.loadWarehouses(),
        this.loadVendors(),
        this.loadAvailableCoupons(),
        this.loadAvailableOffers(),
        this.loadResolutionCurrent(),
        this.loadCompanyInfo(),
        this.loadBankAccounts()
      ]);
    },

    async loadConsecutives() {
      try {
        // Cargar TODOS los consecutivos desde la base de datos
        const response = await api.get('/consecutives');

        if (response.data?.success && response.data.data) {
          const consecutivesArray = response.data.data;

          // Mapear los consecutivos por tipo
          consecutivesArray.forEach(consecutive => {
            if (consecutive.document_type === 'quote') {
              this.consecutives.quote = consecutive.current_number;
            } else if (consecutive.document_type === 'pending_invoice') {
              this.consecutives.pending = consecutive.current_number;
            } else if (consecutive.document_type === 'invoice') {
              this.consecutives.invoice = consecutive.current_number;
            }
          });

          console.log('📊 Consecutivos cargados desde BD:', this.consecutives);
        }
      } catch (error) {
        console.error('Error cargando consecutivos desde BD:', error);
        // Si falla, usar valores por defecto
        this.consecutives = {
          quote: 1,
          invoice: 31839,
          pending: 1
        };
      }
    },

    async loadResolutionCurrent() {
      try {
        const response = await api.get('/resolutions/active');

        if (response.data?.success && response.data.data) {
          const activeResolution = response.data.data;

          // Actualizar toda la información de la resolución
          this.resolution.id = activeResolution.id;
          this.resolution.cai = activeResolution.numero_resolucion || this.resolution.cai;
          this.resolution.prefix = (activeResolution.prefijo_control || '') +
                                   (activeResolution.sufijo_control || '');

          // Sincronizar el consecutivo de factura con la resolución activa
          if (activeResolution.nro_actual_control) {
            this.consecutives.invoice = activeResolution.nro_actual_control;
            this.resolution.current = activeResolution.nro_actual_control;
            console.log('📄 Resolución activa cargada:', {
              id: this.resolution.id,
              current: this.resolution.current,
              prefix: this.resolution.prefix,
              cai: this.resolution.cai
            });
          }
        }
      } catch (error) {
        console.error('Error loading active resolution:', error);
      }
    },
    async loadCustomers() {
      try {
        const response = await api.get('/customers', {
          params: { limit: 10000 }
        });

        console.log('Customers response:', response.data);

        const customersData = response.data?.data || response.data || [];

        if (Array.isArray(customersData)) {
          this.customers = customersData.map(c => ({
            label: c.nombre || c.name || 'Sin nombre',
            value: c.id,
            code: c.codigo || c.customer_code || c.code || '',
            rtn: c.doc_identificacion || c.rtn || '',
            phone: c.telefono || c.phone || ''
          }));
          console.log('Customers loaded:', this.customers.length);
        } else {
          console.warn('Customers data is not an array:', customersData);
          this.customers = [];
        }
      } catch (error) {
        console.error('Error loading customers:', error);
        this.customers = [];
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
            this.invoice.warehouse_id = this.warehouses[0].value;
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
          this.vendors = usersData.map(u => {
            console.log('Mapping user:', u);
            return {
              id: u.id,
              code: (u.id || '').toString(),
              name: u.first_name && u.last_name
                ? `${u.first_name} ${u.last_name}`
                : u.name || u.username || 'Sin nombre'
            };
          });
          console.log('✅ Vendors loaded successfully:', this.vendors.length, this.vendors);
        } else {
          console.warn('⚠️ No vendors found with role 4');
          this.vendors = [];
        }
      } catch (error) {
        console.error('❌ Error loading vendors:', error);
        console.error('Error details:', error.response || error.message);
        this.vendors = [];
      }
    },
    async loadCompanyInfo() {
      try {
        const response = await api.get('/reports/company-info');
        if (response.data.success) {
          this.companyInfo = response.data.data;
        }
      } catch (error) {
        console.error('Error loading company info:', error);
        this.companyInfo = {
          company_name: 'ProsperPOS',
          direccion: 'Honduras',
          telefono: 'N/A',
          email: 'info@prosperpos.com',
          rtn: 'N/A'
        };
      }
    },
    async loadBankAccounts() {
      try {
        const response = await api.get('/bank-accounts');
        if (response.data.success) {
          this.bankAccounts = response.data.data.data || response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading bank accounts:', error);
        this.bankAccounts = [];
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
        if (this.invoice.items.length === 0) {
          Swal.fire('Error', 'No hay productos en la factura', 'error');
          return;
        }

        // Validar que haya un método de pago seleccionado
        if (!this.quickPayment.method) {
          Swal.fire('Error', 'Debe seleccionar un método de pago', 'error');
          return;
        }

        // Crear la factura (sin confirmación)
        const items = this.invoice.items.map(item => ({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          discount_percent: item.discount_percent || 0,
          tax_percent: item.tax_percent || 15,
          warehouse_id: item.warehouse_id,
          total: item.total
        }));

        const invoice_data = {
          invoice_number: this.invoiceNumber,
          document_type: this.documentType,
          customer_id: this.customerInfo.id,
          customer_name: this.customerInfo.name || 'CONSUMIDOR FINAL',
          customer_rtn: this.customerInfo.rtn || '00000000000000',
          warehouse_id: this.invoice.warehouse_id,
          seller_id: this.currentVendor.id || null,
          seller_name: this.currentVendor.name || 'SIN VENDEDOR',
          subtotal: this.totals.subtotal,
          tax: this.totals.tax,
          discount: this.totals.discount || 0,
          shipping_cost: this.invoice.shipping_cost || 0,
          total: this.totals.total,
          status: 'issued',
          payment_status: 'paid',
          payment_method: this.quickPayment.method,
          send_to_dispatch: this.quickPayment.sendToDispatch
        };

        const requestData = {
          invoice_data,
          items
        };

        console.log('📤 Enviando factura:', requestData);

        const response = await api.post('/billing/invoices', requestData);

        console.log('✅ Respuesta del servidor:', response.data);

        // Guardar datos de la factura creada para impresión
        this.createdInvoiceData = {
          invoice_number: this.invoiceNumber,
          subtotal: this.totals.subtotal,
          tax: this.totals.tax,
          tax_amount: this.totals.tax,
          discount: this.totals.discount || 0,
          discount_amount: this.totals.discount || 0,
          surcharge: this.invoice.shipping_cost || 0,
          total: this.totals.total,
          items: items.map(item => {
            const originalItem = this.invoice.items.find(i => i.product_id === item.product_id);
            return {
              ...item,
              product_name: originalItem?.name || item.product_name,
              price: item.unit_price,
              quantity: item.quantity,
              total: item.total,
              tax_rate: item.tax_percent || 15
            };
          }),
          payment_method: this.quickPayment.method,
          payment_terms: 'CONTADO',
          created_at: new Date().toISOString(),
          due_date: new Date().toISOString(),
          delivery_date: new Date().toISOString(),
          vendor_name: this.currentVendor?.name || 'VENDEDOR',
          cai: this.resolution.cai,
          prefijo_control: this.resolution.prefix.replace(/-$/, ''),
          nro_inicial_control: 30001,
          nro_final_control: 40000,
          fecha_fin: '2025-12-30'
        };

        console.log('📄 Datos de factura para impresión:', this.createdInvoiceData);

        // Actualizar el estado de documentos importados
        if (this.importedDocument.id) {
          try {
            if (this.importedDocument.type === 'quote') {
              // Actualizar estado de cotización a convertida en factura
              await api.put(`/quotes/${this.importedDocument.id}`, {
                status: 'converted_to_invoice',
                converted_to_type: 'invoice',
                converted_to_id: response.data.data.id || null,
                converted_to_number: this.invoiceNumber,
                original_consecutive: this.importedDocument.number,
                converted_at: new Date().toISOString()
              });
              console.log('Quote marcada como convertida a factura:', this.importedDocument.id);
            } else if (this.importedDocument.type === 'pending-invoice') {
              // Actualizar estado de factura en espera a convertida en factura
              await api.put(`/pending-invoices/${this.importedDocument.id}`, {
                status: 'converted_to_invoice',
                converted_to_type: 'invoice',
                converted_to_id: response.data.data.id || null,
                converted_to_number: this.invoiceNumber,
                original_consecutive: this.importedDocument.number,
                converted_at: new Date().toISOString()
              });
              console.log('Pending invoice marcada como convertida a factura:', this.importedDocument.id);
            }
          } catch (error) {
            console.error('Error actualizando estado de documento importado:', error);
          }
        }

        // Mostrar modal de impresión
        this.showPrintModal = true;
        this.showQuickPaymentModal = false;

        // Limpiar la factura
        this.clearInvoice();

        // Incrementar el número de factura y el consecutivo
        this.resolution.current++;
        this.incrementConsecutive();

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
        if (this.invoice.items.length === 0) {
          Swal.fire('Error', 'No hay productos en la factura', 'error');
          return;
        }

        // Validar que el pago esté completo
        if (this.remainingBalance > 0) {
          Swal.fire('Error', 'El pago no está completo', 'warning');
          return;
        }

        // Crear la factura con métodos de pago múltiples (sin confirmación)
        const items = this.invoice.items.map(item => ({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          discount_percent: item.discount_percent || 0,
          tax_percent: item.tax_percent || 15,
          warehouse_id: item.warehouse_id,
          total: item.total
        }));

        const invoice_data = {
          invoice_number: this.invoiceNumber,
          document_type: this.documentType,
          customer_id: this.customerInfo.id,
          customer_name: this.customerInfo.name || 'CONSUMIDOR FINAL',
          customer_rtn: this.customerInfo.rtn || '00000000000000',
          warehouse_id: this.invoice.warehouse_id,
          seller_id: this.currentVendor.id || null,
          seller_name: this.currentVendor.name || 'SIN VENDEDOR',
          subtotal: this.totals.subtotal,
          tax: this.totals.tax,
          discount: this.invoice.discount || 0,
          total: this.totals.total,
          status: 'issued',
          payment_status: 'paid',
          payment_methods: this.detailedPayment.methods.filter(m => m.amount > 0),
          notes: this.detailedPayment.notes || ''
        };

        const requestData = {
          invoice_data,
          items
        };

        console.log('📤 Enviando factura detallada:', requestData);

        const response = await api.post('/billing/invoices', requestData);

        console.log('✅ Respuesta del servidor:', response.data);

        // Guardar datos de la factura creada para impresión
        this.createdInvoiceData = {
          invoice_number: this.invoiceNumber,
          subtotal: this.totals.subtotal,
          tax: this.totals.tax,
          tax_amount: this.totals.tax,
          discount: this.invoice.discount || 0,
          discount_amount: this.invoice.discount || 0,
          surcharge: 0,
          total: this.totals.total,
          items: items.map(item => {
            const originalItem = this.invoice.items.find(i => i.product_id === item.product_id);
            return {
              ...item,
              product_name: originalItem?.name || item.product_name,
              price: item.unit_price,
              quantity: item.quantity,
              total: item.total,
              tax_rate: item.tax_percent || 15
            };
          }),
          payment_methods: this.detailedPayment.paymentMethods,
          payment_terms: 'CONTADO',
          created_at: new Date().toISOString(),
          due_date: new Date().toISOString(),
          delivery_date: new Date().toISOString(),
          vendor_name: this.currentVendor?.name || 'VENDEDOR',
          cai: this.resolution.cai,
          prefijo_control: this.resolution.prefix.replace(/-$/, ''),
          nro_inicial_control: 30001,
          nro_final_control: 40000,
          fecha_fin: '2025-12-30'
        };

        console.log('📄 Datos de factura detallada para impresión:', this.createdInvoiceData);

        // Actualizar el estado de documentos importados
        if (this.importedDocument.id) {
          try {
            if (this.importedDocument.type === 'quote') {
              // Actualizar estado de cotización a convertida en factura
              await api.put(`/quotes/${this.importedDocument.id}`, {
                status: 'converted_to_invoice',
                converted_to_type: 'invoice',
                converted_to_id: response.data.data.id || null,
                converted_to_number: this.invoiceNumber,
                original_consecutive: this.importedDocument.number,
                converted_at: new Date().toISOString()
              });
              console.log('Quote marcada como convertida a factura (pago detallado):', this.importedDocument.id);
            } else if (this.importedDocument.type === 'pending-invoice') {
              // Actualizar estado de factura en espera a convertida en factura
              await api.put(`/pending-invoices/${this.importedDocument.id}`, {
                status: 'converted_to_invoice',
                converted_to_type: 'invoice',
                converted_to_id: response.data.data.id || null,
                converted_to_number: this.invoiceNumber,
                original_consecutive: this.importedDocument.number,
                converted_at: new Date().toISOString()
              });
              console.log('Pending invoice marcada como convertida a factura (pago detallado):', this.importedDocument.id);
            }
          } catch (error) {
            console.error('Error actualizando estado de documento importado:', error);
          }
        }

        // Mostrar modal de impresión
        this.showPrintModal = true;
        this.showDetailedPaymentModal = false;

        // Limpiar la factura
        this.clearInvoice();

        // Incrementar el número de factura y el consecutivo
        this.resolution.current++;
        this.incrementConsecutive();

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
      // If it's a COTIZACION (Quote), show confirmation
      if (this.documentType === 'COTIZACION') {
        await Swal.fire({
          title: '¿Cómo desea guardar?',
          html: `
            <p>Seleccione el tipo de guardado:</p>
            <div class="d-grid gap-2 mt-3">
              <button id="save-as-quote" class="btn btn-info btn-lg">
                <i class="ti ti-file-invoice me-2"></i>Guardar como Cotización
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
              this.saveAsPendingInvoice();
            });
          }
        });
      } else {
        // If it's a FACTURA, save as pending invoice
        await this.saveAsPendingInvoice();
      }
    },

    // ==================== QUOTE PREVIEW METHODS ====================
    buildQuotePreviewHTML() {
      const docTitle = 'COTIZACION';
      const docColor = '#FF9800'; // Orange color for quotes

      // Calculate expiry date (15 days from today)
      const today = new Date();
      const expiryDate = new Date(today);
      expiryDate.setDate(expiryDate.getDate() + 15);

      const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('es-HN', { year: 'numeric', month: '2-digit', day: '2-digit' });
      };

      // Build table rows
      let tableRows = '';
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      this.invoice.items.forEach((item, index) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const discountPercent = parseFloat(item.discount_percent) || 0;
        const taxRate = parseFloat(item.tax_percent) || 0;

        const itemSubtotal = qty * price;
        const itemDiscount = itemSubtotal * (discountPercent / 100);
        const itemAfterDiscount = itemSubtotal - itemDiscount;
        const itemTax = itemAfterDiscount * (taxRate / 100);
        const itemTotal = itemAfterDiscount + itemTax;

        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
        totalTax += itemTax;

        tableRows += `
          <tr>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${String(index + 1).padStart(2, '0')}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.code || 'N/A'}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.name}</td>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${this.formatCurrency(qty)}</td>
            <td style="padding: 6px; text-align: right; border-bottom: 1px solid #e0e0e0; font-size: 10px;">L ${this.formatCurrency(price)}</td>
            <td style="padding: 6px; text-align: right; border-bottom: 1px solid #e0e0e0; font-weight: 600; font-size: 10px;">L ${this.formatCurrency(itemTotal)}</td>
          </tr>
        `;
      });

      const surcharge = parseFloat(this.invoice.shipping_cost) || 0;
      const grandTotal = subtotal - totalDiscount + totalTax + surcharge;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${docTitle} - ${this.currentConsecutive}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              background: #fff;
              padding: 0;
              margin: 0;
            }
            .invoice-container {
              max-width: 850px;
              margin: 0 auto;
              background: white;
              padding: 40px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 3px solid ${docColor};
            }
            .company-logo { flex: 1; }
            .company-name {
              font-size: 26px;
              font-weight: 700;
              color: ${docColor};
              margin-bottom: 6px;
              letter-spacing: -0.5px;
            }
            .company-details {
              font-size: 11px;
              color: #000;
              line-height: 1.5;
            }
            .invoice-header {
              text-align: right;
              background: ${docColor};
              color: white;
              padding: 15px 18px;
              border-radius: 6px;
              min-width: 320px;
            }
            .invoice-title {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .invoice-meta {
              font-size: 11px;
              line-height: 1.5;
              text-align: right;
            }
            .invoice-meta strong { font-weight: 600; }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              gap: 20px;
            }
            .info-box {
              flex: 1;
              background: #fff;
              padding: 8px 12px;
              border-radius: 4px;
              border: 1px solid #e0e0e0;
              border-left: 3px solid ${docColor};
            }
            .info-box h3 {
              font-size: 9px;
              text-transform: uppercase;
              color: #000;
              margin-bottom: 6px;
              letter-spacing: 0.5px;
              font-weight: 600;
            }
            .info-box p {
              font-size: 12px;
              margin: 3px 0;
              color: #000;
              line-height: 1.3;
            }
            .info-box .highlight {
              font-weight: 700;
              color: #000;
              font-size: 13px;
            }
            .products-table {
              width: 100%;
              margin-bottom: 20px;
              border-collapse: collapse;
              background: white;
            }
            .products-table thead { background: ${docColor}; }
            .products-table thead th {
              padding: 8px 6px;
              text-align: left;
              font-size: 10px;
              font-weight: 600;
              color: white;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .products-table thead th:first-child { text-align: center; }
            .products-table thead th:nth-child(4),
            .products-table thead th:nth-child(5),
            .products-table thead th:nth-child(6) { text-align: right; }
            .products-table tbody tr:hover { background: #fffbf0; }
            .totals-section {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
              gap: 20px;
            }
            .totals-left {
              flex: 1;
              font-size: 12px;
              color: #000;
              padding: 10px;
              border: 1px solid #e0e0e0;
              border-radius: 4px;
              display: flex;
              flex-direction: column;
            }
            .totals-box {
              min-width: 350px;
              border: 1px solid #e0e0e0;
              border-radius: 4px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 15px;
              font-size: 11px;
              border-bottom: 1px solid #e0e0e0;
            }
            .total-row:last-child { border-bottom: none; }
            .total-row.grand-total {
              background: #f8f9fa;
              font-size: 13px;
              font-weight: 700;
              border-top: 2px solid ${docColor};
            }
            .total-row .label {
              font-weight: 400;
              color: #000;
            }
            .total-row .value {
              font-weight: 600;
              color: #000;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
            }
            .footer-note {
              font-size: 10px;
              color: #000;
              margin-top: 20px;
              text-align: center;
              line-height: 1.6;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .invoice-container {
                padding: 20px;
                max-width: 100%;
              }
              .header, .products-table, .totals-section, .footer-note {
                page-break-inside: avoid;
              }
              .invoice-header {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                background: ${docColor} !important;
                color: white !important;
              }
              @page {
                size: letter;
                margin: 15mm;
              }
            }
            @page {
              size: letter;
              margin: 15mm;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-logo">
                <img src="${LOGO_BASE64}" style="max-width: 180px; height: auto; margin-bottom: 8px;" alt="Logo">
                <div class="company-name" style="font-size: 14px; font-weight: 700; color: #000; margin-bottom: 4px;">${this.companyInfo.company_name || 'PROSPERPOS'}</div>
                <div class="company-details">
                  <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                  <strong>Dirección:</strong> ${this.companyInfo.direccion || 'Sin dirección'}<br>
                  <strong>Teléfono:</strong> ${this.companyInfo.telefono || 'N/A'}<br>
                  <strong>Teléfono Móvil:</strong> +504 9875-2725<br>
                  <strong>Email:</strong> ${this.companyInfo.email || 'info@prosperpos.com'}
                </div>
              </div>
              <div style="flex: 1; margin-left: 20px;">
                <div style="font-size: 11px; color: #333;">
                  <strong>Cliente:</strong> ${this.customerInfo.name || 'CONSUMIDOR FINAL'}<br>
                  <strong>RTN:</strong> ${this.customerInfo.rtn || '00000000000000'}<br>
                  <strong>Vendedor:</strong> ${this.currentVendor.name || 'N/A'}
                </div>
              </div>
              <div class="invoice-header">
                <div class="invoice-title">${docTitle}: ${this.currentConsecutive}</div>
                <div class="invoice-meta">
                  <strong>#Control Interno:</strong> ${this.currentConsecutive}<br>
                  <strong>Sucursal:</strong> Agencia Principal<br>
                  <strong>Emisión:</strong> ${formatDate(today)}<br>
                  <strong>Condiciones de la Transacción:</strong> Contado<br>
                  <strong>Entrega:</strong> ${formatDate(today)}<br>
                  <strong>No. Correlativo de la Orden de Compra Exenta:</strong><br>
                  <strong>No. Correlativo de la Constancia del Reg Exonerado:</strong><br>
                  <strong>No. Identificativo del Registro SAG:</strong>
                </div>
              </div>
            </div>
            <table class="products-table">
              <thead>
                <tr>
                  <th>NO.</th>
                  <th>CÓDIGO</th>
                  <th>DESCRIPCIÓN</th>
                  <th>CANTIDAD</th>
                  <th>PRECIO</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="totals-section">
              <div class="totals-left">
                <div style="margin-bottom: 15px;">
                  <strong>TOTAL:</strong> ${this.numberToWords(grandTotal).toUpperCase()} LEMPIRAS ${String(Math.floor((grandTotal % 1) * 100)).padStart(2, '0')}/100
                </div>
                <div style="margin-top: auto; padding-top: 40px; text-align: center;">
                  <div style="border-top: 2px solid #000; width: 250px; margin: 0 auto 10px;"></div>
                  <div style="margin-bottom: 8px;"><strong>Original Cliente</strong></div>
                  <div><strong>Copia Obligado Tributario Emisor</strong></div>
                </div>
              </div>
              <div class="totals-box">
                <div class="total-row">
                  <span class="label">Importe Exonerado:</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row">
                  <span class="label">Importe Exento:</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row">
                  <span class="label">Gravado 15%</span>
                  <span class="value">L ${this.formatCurrency(subtotal - totalDiscount)}</span>
                </div>
                <div class="total-row">
                  <span class="label">Gravado 18%</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row">
                  <span class="label">I.S.V 15 15%:</span>
                  <span class="value">L ${this.formatCurrency(totalTax)}</span>
                </div>
                <div class="total-row">
                  <span class="label">I.S.V 18 18%:</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row">
                  <span class="label">RECARGOS:</span>
                  <span class="value">L ${this.formatCurrency(surcharge)}</span>
                </div>
                <div class="total-row">
                  <span class="label">DESCUENTOS Y REBAJAS OTORGADOS:</span>
                  <span class="value">L ${this.formatCurrency(totalDiscount)}</span>
                </div>
                <div class="total-row grand-total">
                  <span class="label"><strong>TOTAL:</strong></span>
                  <span class="value"><strong>L ${this.formatCurrency(grandTotal)}</strong></span>
                </div>
              </div>
            </div>
            <div class="footer">
              <div class="footer-note" style="margin-top: 20px; text-align: center; font-size: 14px; line-height: 2;">
                <strong style="font-size: 15px;">Cuentas Bancarias:</strong><br>
                ${this.bankAccounts && this.bankAccounts.length > 0 ? this.bankAccounts.filter(acc => acc.is_active).map(acc => {
                  const bankName = acc.banco || 'Banco';
                  const accountNumber = acc.numero_cuenta || 'N/A';
                  const accountType = acc.tipo_cuenta || '';
                  return `<strong>${bankName}:</strong> ${accountNumber}${accountType ? ` (${accountType})` : ''}`;
                }).join(' | ') : 'No hay cuentas registradas'}
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      return html;
    },

    async showQuotePreviewModal() {
      // Construir el HTML ANTES de limpiar
      this.quotePreviewHTML = this.buildQuotePreviewHTML();

      // Guardar automáticamente la cotización
      await this.performSaveAsQuote();

      // Limpiar inmediatamente después de guardar
      this.clearInvoice();

      // Mostrar el preview
      this.showQuotePreview = true;
    },

    async performSaveAsQuote() {
      try {
        const quoteData = {
          customer_id: this.customerInfo.id,
          customer_name: this.customerInfo.name,
          customer_rtn: this.customerInfo.rtn || '',
          customer_phone: this.customerInfo.phone || '',
          customer_email: this.customerInfo.email || '',
          branch_id: 1, // TODO: Get from current user's branch
          warehouse_id: this.invoice.warehouse_id,
          seller_id: this.currentVendor.id,
          seller_name: this.currentVendor.name,
          items: this.invoice.items.map(item => ({
            product_id: item.product_id,
            product_code: item.code,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            discount_value: (item.price * item.quantity * (item.discount_percent / 100)),
            tax_rate: item.tax_percent,
            warehouse_id: item.warehouse_id || this.invoice.warehouse_id
          })),
          subtotal: this.totals.subtotal,
          discount: 0,
          tax: this.totals.tax,
          total: this.totals.total,
          surcharge: this.invoice.shipping_cost || 0,
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
        // Si viene de una pending-invoice importada, actualizar estado y crear quote
        else if (this.importedDocument.id && this.importedDocument.type === 'pending-invoice') {
          // Crear nueva quote
          response = await api.post('/quotes', quoteData);
          quoteNumber = response.data.data.quote_number;

          // Actualizar el estado de la pending-invoice (NO eliminarla)
          await api.put(`/pending-invoices/${this.importedDocument.id}`, {
            status: 'converted_to_quote',
            converted_to_type: 'quote',
            converted_to_id: response.data.data.id,
            converted_to_number: quoteNumber,
            original_consecutive: this.importedDocument.number,
            converted_at: new Date().toISOString()
          });
        }
        // Si no viene de importación, crear nueva
        else {
          response = await api.post('/quotes', quoteData);
          quoteNumber = response.data.data.quote_number;
        }

        // Guardar el número de cotización para mostrarlo después
        this.lastQuoteNumber = quoteNumber;
        this.lastQuoteConsecutive = this.currentConsecutive;

        // Incrementar el consecutivo de cotizaciones
        this.incrementConsecutive();
      } catch (error) {
        console.error('Error saving quote:', error);
        Swal.fire('Error', 'Error al guardar la cotización', 'error');
      }
    },

    async saveAsQuote() {
      // Show preview modal instead of saving directly
      this.showQuotePreviewModal();
    },

    closeQuotePreview() {
      this.showQuotePreview = false;
      this.showQuoteOptionsDropdown = false;

      // Mostrar mensaje de éxito
      if (this.lastQuoteNumber) {
        Swal.fire({
          icon: 'success',
          title: 'Cotización Guardada',
          html: `<p>Número: ${this.lastQuoteNumber}</p><p>Consecutivo: ${this.lastQuoteConsecutive}</p>`,
          timer: 3000
        });
      }

      // NO limpiar la factura aquí porque ya se limpió al guardar

      // Resetear las variables temporales
      this.lastQuoteNumber = null;
      this.lastQuoteConsecutive = null;
    },

    printQuotePreview() {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(this.quotePreviewHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    },

    async exportQuoteToPDF() {
      this.showQuoteOptionsDropdown = false;
      try {
        const fileName = `COTIZACION_${this.lastQuoteConsecutive || this.currentConsecutive}`;

        // Crear iframe temporal
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '850px';
        iframe.style.height = '1100px';
        document.body.appendChild(iframe);

        // Escribir el HTML de la cotización
        iframe.contentDocument.write(this.quotePreviewHTML);
        iframe.contentDocument.close();

        // Esperar a que se renderice
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capturar como imagen con html2canvas
        const element = iframe.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 850,
          windowWidth: 850
        });

        // Crear PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'letter');
        const imgWidth = 216;
        const pageHeight = 279;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);

        // Limpiar
        document.body.removeChild(iframe);

        Swal.fire({
          icon: 'success',
          title: 'PDF Generado',
          text: 'El PDF se ha descargado exitosamente',
          timer: 2000
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al generar el PDF'
        });
      }
    },

    async exportQuoteToExcel() {
      this.showQuoteOptionsDropdown = false;
      try {
        const fileName = `COTIZACION_${this.lastQuoteConsecutive || this.currentConsecutive}`;

        // Preparar datos para Excel
        const data = [
          ['COTIZACION'],
          [''],
          ['Empresa:', this.companyInfo.company_name || 'PROSPERPOS'],
          ['Número:', this.lastQuoteConsecutive || this.currentConsecutive],
          ['Cliente:', this.customerInfo.name || 'CONSUMIDOR FINAL'],
          ['RTN:', this.customerInfo.rtn || '00000000000000'],
          ['Vendedor:', this.currentVendor.name || 'N/A'],
          ['Fecha:', new Date().toLocaleDateString('es-HN')],
          [''],
          ['NO.', 'CÓDIGO', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'TOTAL']
        ];

        // Agregar items
        this.invoice.items.forEach((item, index) => {
          const qty = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          const discountPercent = parseFloat(item.discount_percent) || 0;
          const taxRate = parseFloat(item.tax_percent) || 0;

          const itemSubtotal = qty * price;
          const itemDiscount = itemSubtotal * (discountPercent / 100);
          const itemAfterDiscount = itemSubtotal - itemDiscount;
          const itemTax = itemAfterDiscount * (taxRate / 100);
          const itemTotal = itemAfterDiscount + itemTax;

          data.push([
            String(index + 1).padStart(2, '0'),
            item.code || 'N/A',
            item.name,
            qty,
            price,
            itemTotal
          ]);
        });

        // Agregar totales
        data.push(['']);
        data.push(['', '', '', '', 'TOTAL:', this.totals.total]);

        // Crear hoja de Excel
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'COTIZACION');

        // Descargar archivo
        XLSX.writeFile(wb, `${fileName}.xlsx`);

        Swal.fire({
          icon: 'success',
          title: 'Excel Generado',
          text: 'El archivo Excel se ha descargado exitosamente',
          timer: 2000
        });
      } catch (error) {
        console.error('Error generating Excel:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al generar el Excel'
        });
      }
    },

    async saveQuoteAsImage() {
      this.showQuoteOptionsDropdown = false;
      try {
        const fileName = `COTIZACION_${this.lastQuoteConsecutive || this.currentConsecutive}`;

        // Crear iframe temporal
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '850px';
        iframe.style.height = '1100px';
        document.body.appendChild(iframe);

        // Escribir el HTML de la cotización
        iframe.contentDocument.write(this.quotePreviewHTML);
        iframe.contentDocument.close();

        // Esperar a que se renderice
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capturar como imagen con html2canvas
        const element = iframe.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 850,
          windowWidth: 850
        });

        // Descargar imagen
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Limpiar
        document.body.removeChild(iframe);

        Swal.fire({
          icon: 'success',
          title: 'Imagen Generada',
          text: 'La imagen se ha descargado exitosamente',
          timer: 2000
        });
      } catch (error) {
        console.error('Error generating image:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al generar la imagen'
        });
      }
    },

    async saveAsPendingInvoice() {
      try {
        const pendingInvoiceData = {
          customer_id: this.customerInfo.id,
          customer_name: this.customerInfo.name,
          customer_rtn: this.customerInfo.rtn || '',
          customer_phone: this.customerInfo.phone || '',
          customer_email: this.customerInfo.email || '',
          branch_id: 1, // TODO: Get from current user's branch
          warehouse_id: this.invoice.warehouse_id,
          seller_id: this.currentVendor.id,
          seller_name: this.currentVendor.name,
          items: this.invoice.items.map(item => ({
            product_id: item.product_id,
            product_code: item.code,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            discount_value: (item.price * item.quantity * (item.discount_percent / 100)),
            tax_rate: item.tax_percent,
            warehouse_id: item.warehouse_id || this.invoice.warehouse_id
          })),
          subtotal: this.totals.subtotal,
          discount: 0,
          tax: this.totals.tax,
          total: this.totals.total,
          surcharge: this.invoice.shipping_cost || 0,
          notes: '',
          internal_notes: '',
          expires_at: null
        };

        let response;
        let documentNumber;

        // Si viene de una importación de pending-invoice, actualizar
        if (this.importedDocument.id && this.importedDocument.type === 'pending-invoice') {
          response = await api.put(`/pending-invoices/${this.importedDocument.id}`, pendingInvoiceData);
          documentNumber = this.importedDocument.number;
        }
        // Si viene de una cotización importada, actualizar estado de cotización y crear pending-invoice
        else if (this.importedDocument.id && this.importedDocument.type === 'quote') {
          // Crear nueva pending-invoice
          response = await api.post('/pending-invoices', pendingInvoiceData);
          documentNumber = response.data.data.document_number;

          // Actualizar el estado de la cotización (NO eliminarla)
          await api.put(`/quotes/${this.importedDocument.id}`, {
            status: 'converted_to_pending',
            converted_to_type: 'pending_invoice',
            converted_to_id: response.data.data.id,
            converted_to_number: documentNumber,
            original_consecutive: this.importedDocument.number,
            converted_at: new Date().toISOString()
          });
        }
        // Si no viene de importación, crear nueva
        else {
          response = await api.post('/pending-invoices', pendingInvoiceData);
          documentNumber = response.data.data.document_number;
        }

        Swal.fire({
          icon: 'success',
          title: 'Operación Guardada',
          html: `<p>Número: ${documentNumber}</p>`,
          timer: 3000
        });

        // NO incrementar el consecutivo cuando se guarda como operación en espera
        // El consecutivo se mantiene igual para poder continuar con la misma numeración

        this.clearInvoice();
      } catch (error) {
        console.error('Error saving pending invoice:', error);
        Swal.fire('Error', 'Error al guardar la operación en espera', 'error');
      }
    },
    async saveInvoice(status = 'paid', amountReceived = 0) {
      try {
        const invoiceData = {
          invoice_number: this.invoiceNumber,
          document_type: this.documentType,
          customer_id: this.customerInfo.id,
          warehouse_id: this.invoice.warehouse_id,
          seller_id: this.currentVendor.id,
          items: this.invoice.items,
          subtotal: this.totals.subtotal,
          tax: this.totals.tax,
          total: this.totals.total,
          status: status
        };

        await api.post('/billing/invoices', invoiceData);

        if (status === 'paid') {
          const change = amountReceived - this.totals.total;
          Swal.fire({
            icon: 'success',
            title: 'Pago Procesado',
            html: `<p>Consecutivo: ${this.currentConsecutive}</p><p>Cambio: L ${this.formatCurrency(change)}</p>`
          });
        } else {
          Swal.fire('Guardado', `Factura guardada con consecutivo: ${this.currentConsecutive}`, 'success');
        }

        // Incrementar el consecutivo de facturas
        this.incrementConsecutive();
        this.resolution.current++;

        this.clearInvoice();
      } catch (error) {
        Swal.fire('Error', 'Error al guardar la factura', 'error');
      }
    },
    async clearInvoice() {
      // Si hay un documento importado, solo resetear el tracking
      // IMPORTANTE: NO eliminamos pending-invoices ni cotizaciones
      // Solo limpiamos la referencia del documento importado
      if (this.importedDocument.id) {
        // Resetear el tracking sin eliminar documentos
        this.importedDocument = {
          id: null,
          type: null,
          number: null
        };
      }

      this.invoice.items = [];
      this.invoice.shipping_cost = 0; // Resetear recargo
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
    
    selectCustomer(customer) {
      this.customerInfo = {
        id: customer.value,
        code: customer.code,
        name: customer.label,
        rtn: customer.rtn,
        phone: customer.phone
      };
      this.showCustomerModal = false;
    },
    viewCustomerInfo(customer) {
      this.selectedCustomerInfo = customer;
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
        tipo_cliente: 'NACIONAL',
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
        const customerData = {
          customer_code: this.newCustomer.code,
          name: this.newCustomer.razon_social,
          commercial_name: this.newCustomer.nombre_comercial,
          beneficiary_type: this.newCustomer.beneficiary_type,
          identification_type: this.newCustomer.tipo_identificacion,
          rtn: this.newCustomer.cedula,
          sar_id: this.newCustomer.sar,
          customer_type: this.newCustomer.tipo_cliente,
          taxpayer_type: this.newCustomer.tipo_contribuyente,
          email: this.newCustomer.email,
          phone: this.newCustomer.phone,
          mobile: this.newCustomer.mobile,
          address: this.newCustomer.address
        };

        const response = await api.post('/customers', customerData);
        Swal.fire('Éxito', 'Cliente creado exitosamente', 'success');
        await this.loadCustomers();
        const newCustomer = this.customers.find(c => c.value === response.data.data.id);
        if (newCustomer) {
          this.selectCustomer(newCustomer);
        }
        this.closeAddCustomerModal();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Error al guardar cliente', 'error');
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
    selectVendor(vendor) {
      this.currentVendor = vendor;
      this.showVendorModal = false;
    },
    // ==================== MÉTODOS DE PRODUCTOS ====================
    addProduct() {
      console.log('🛒 addProduct called');
      console.log('currentProduct:', this.currentProduct);
      console.log('invoice.warehouse_id:', this.invoice.warehouse_id);

      if (!this.currentProduct.code && !this.currentProduct.name) {
        Swal.fire('Error', 'Debe seleccionar un producto', 'error');
        return;
      }

      if (!this.invoice.warehouse_id) {
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
        warehouse_id: this.invoice.warehouse_id,
        discount_percent: this.currentProduct.discount_percent || 0,
        tax_percent: this.currentProduct.tax_percent || 15,
        total: itemTotal
      };

      console.log('➕ Adding item to invoice:', newItem);
      this.invoice.items.push(newItem);

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

      console.log('✅ Product added. Total items:', this.invoice.items.length);
    },
    removeProduct(index) {
      console.log('🗑️ Removing product at index:', index);
      this.invoice.items.splice(index, 1);
    },
    editProduct(index) {
      console.log('✏️ Editing product at index:', index);
      const item = this.invoice.items[index];

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
      this.invoice.warehouse_id = item.warehouse_id;

      // Eliminar el item de la lista
      this.invoice.items.splice(index, 1);

      // Enfocar el input de cantidad
      this.$nextTick(() => {
        const quantityInput = document.querySelector('input[type="number"]');
        if (quantityInput) quantityInput.focus();
      });
    },
    calculateItemTotal(index) {
      const item = this.invoice.items[index];
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
    async printInvoice() {
      if (!this.createdInvoiceData) {
        console.error('No hay datos de factura para imprimir');
        return;
      }

      let resolutionData = {
        cai: '2A9170-F8828A-8815E0-63BE03-090956-9D',
        prefijo_control: '000-002-01',
        nro_inicial_control: 30001,
        nro_final_control: 40000,
        fecha_fin: '2025-12-30'
      };

      try {
        const response = await api.get('/resolutions/active');
        if (response.data && response.data.data) {
          resolutionData = response.data.data;
        }
      } catch (error) {
        console.warn('No se pudo obtener la resolución activa');
      }

      let tableRows = '';
      let subtotal = 0;
      let totalTax = 0;
      let taxableAmount = 0;

      this.createdInvoiceData.items.forEach((item) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price || item.price) || 0;
        const taxRate = parseFloat(item.tax_rate) || 0;
        const itemSubtotal = qty * price;
        const itemTax = itemSubtotal * (taxRate / 100);
        const itemTotal = itemSubtotal + itemTax;
        if (taxRate > 0) {
          taxableAmount += itemSubtotal;
          totalTax += itemTax;
        }
        subtotal += itemSubtotal;
        tableRows += `
          <tr>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(qty)}</td>
            <td style="padding: 3px; font-size: 13px; line-height: 1.3;">${item.product_name || item.name}</td>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(price)}</td>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(itemTotal)}</td>
          </tr>
        `;
      });

      const discount = parseFloat(this.createdInvoiceData.discount || 0);
      const surcharge = parseFloat(this.createdInvoiceData.surcharge || 0);
      const grandTotal = this.createdInvoiceData.total || (subtotal + totalTax + surcharge - discount);

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>FACTURA - ${this.createdInvoiceData.invoice_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #000; background: #fff; padding: 0; margin: 0; font-size: 14px; }
            .invoice-container { max-width: 80mm; margin: 0 auto; background: white; padding: 12px 18px; }
            .header { text-align: center; margin-bottom: 2px; }
            .company-logo { margin-bottom: 8px; }
            .company-logo img { max-width: 120px; height: auto; }
            .company-name { font-size: 13px; font-weight: 700; color: #000; margin: 5px 0; text-transform: uppercase; line-height: 1.3; }
            .company-details { font-size: 13px; color: #000; line-height: 1.2; }
            .doc-title { font-size: 17px; font-weight: 700; text-align: center; margin: 2px 0; padding: 2px; color: #000; text-transform: uppercase; }
            .info-section { font-size: 14px; line-height: 1.2; margin: 2px 0; padding: 0; text-align: center; }
            .info-section strong { font-weight: 700; }
            .products-table { width: 100%; margin: 2px 0; border-collapse: collapse; font-size: 13px; }
            .products-table thead { background: none; }
            .products-table thead th { padding: 5px 4px; text-align: left; font-size: 13px; font-weight: 700; color: #000; border: none; }
            .products-table tbody td { padding: 5px 4px; font-size: 13px; vertical-align: top; border: none; }
            .totals-section { margin-top: 8px; padding-top: 0; }
            .totals-table { width: 100%; font-size: 13px; border-collapse: collapse; }
            .totals-table td { padding: 1px 4px; line-height: 1.1; }
            .totals-table .total-label { text-align: left; font-weight: 700; padding-right: 10px; }
            .totals-table .total-value { text-align: right; font-weight: 400; width: 90px; }
            .totals-table .grand-total { font-weight: 700; font-size: 15px; }
            .totals-table .grand-total td { padding-top: 4px; padding-bottom: 4px; }
            .payment-section { margin-top: 6px; font-size: 12px; line-height: 1.1; padding-top: 4px; text-align: center; }
            .payment-section strong { font-weight: 700; }
            .payment-section div { margin: 1px 0; }
            .footer-note { font-size: 12px; text-align: center; margin-top: 2px; line-height: 1.1; padding-top: 2px; }
            @media print { body { margin: 0; padding: 0; } .invoice-container { padding: 5px; } @page { size: 80mm auto; margin: 2mm; } }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-logo"><img src="${LOGO_BASE64}" alt="Logo"></div>
              <div class="company-name">CERAMICAS TERRAZOS Y PULIDOS<br>UNIVERSAL</div>
              <div class="company-details">
                <strong>RTN:</strong> 01061977002516<br>
                <strong>Dirección:</strong> Casa Matriz, Barrio La Merced,<br>
                Avenida 14 de Julio entre 15 y 16 calle frente a<br>
                Repuestos del Atlántico, La Ceiba, Atlántida<br>
                <strong>Teléfono de Empresa:</strong> 2440-0037<br>
                <strong>Teléfono Móvil:</strong> 9875-2725<br>
                mauricio_argenal@hotmail.com<br>
                <strong>CAI:</strong> ${resolutionData.cai || 'N/A'}
              </div>
            </div>
            <div class="doc-title">FACTURA</div>
            <div class="info-section">
              ${this.createdInvoiceData.invoice_number || '000-002-01-00000000'}<br>
              <strong>Condiciones de la Transacción:</strong> CONTADO<br>
              <strong>Cliente:</strong> ${this.customerInfo?.name || 'CONSUMIDOR FINAL'}<br>
              <strong>RTN:</strong> ${this.customerInfo?.rtn || '00000000000000'}<br>
              <strong>Vendedor:</strong> ${this.createdInvoiceData.vendor_name || 'VENDEDOR'}
            </div>
            <table class="products-table">
              <thead>
                <tr><td colspan="4" style="text-align: center; padding: 0; font-size: 12px; border: none;">.......................................................................................</td></tr>
                <tr>
                  <th style="width: 35px; text-align: center;">Cant</th>
                  <th>Producto</th>
                  <th style="width: 60px; text-align: right;">P/Unit</th>
                  <th style="width: 65px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
            <div class="totals-section">
              <table class="totals-table">
                <tr><td class="total-label">Importe Exonerado:</td><td class="total-value">L 0.00</td></tr>
                <tr><td class="total-label">Importe Exento:</td><td class="total-value">L 0.00</td></tr>
                <tr><td class="total-label">Gravado 15%</td><td class="total-value">L ${this.formatCurrency(taxableAmount)}</td></tr>
                <tr><td class="total-label">Gravado 18%</td><td class="total-value">L 0.00</td></tr>
                <tr><td class="total-label">I.S.V 15 15%:</td><td class="total-value">L ${this.formatCurrency(totalTax)}</td></tr>
                <tr><td class="total-label">I.S.V 18 18%:</td><td class="total-value">L 0.00</td></tr>
                <tr><td class="total-label">RECARGOS:</td><td class="total-value">L ${this.formatCurrency(surcharge)}</td></tr>
                <tr><td class="total-label">DESCUENTOS Y REBAJAS OTORGADOS:</td><td class="total-value">L 0.00</td></tr>
                <tr class="grand-total"><td class="total-label"><strong>TOTAL A PAGAR:</strong></td><td class="total-value"><strong>L<br>${this.formatCurrency(grandTotal)}</strong></td></tr>
                <tr><td colspan="2" style="text-align: center; padding: 0; font-size: 12px;">.......................................................................................</td></tr>
              </table>
            </div>
            <div class="payment-section">
              <strong>Pagos Recibidos</strong><br>
              <strong>Transferencia:</strong> ${this.formatCurrency(grandTotal)}<br>
              <strong>Valor en letras:</strong> ${(() => {
                const integerPart = Math.floor(grandTotal);
                const cents = String(Math.floor((grandTotal % 1) * 100)).padStart(2, '0');
                return this.numberToWords(integerPart).toUpperCase() + ' LEMPIRAS CON ' + cents + '/100';
              })()}<br>
              <strong>Rango de facturación Vigente:</strong><br>
              <strong>Desde:</strong> ${resolutionData.prefijo_control}-${String(resolutionData.nro_inicial_control).padStart(8, '0')}<br>
              <strong>Hasta:</strong> ${resolutionData.prefijo_control}-${String(resolutionData.nro_final_control).padStart(8, '0')}<br>
              <strong>Fecha Limite de Emisión Vigente:</strong> ${this.formatDate(resolutionData.fecha_fin) || '31/12/2025'}<br>
              <strong>No. Correlativo de la Orden de Compra<br>Exenta:</strong><br>
              <strong>No. Correlativo de la Constancia del Reg<br>Exonerado:</strong><br>
              <strong>No. Identificativo del Registro SAG:</strong><br>
              ${this.formatDateTime(new Date())}
            </div>
            <div class="footer-note">
              <strong>Entrega:</strong> ${this.formatDate(new Date())}<br>
              Original: Cliente/Copia: Obligado Tributario<br>
              <strong>Emisor:</strong> ¡La Factura es beneficio de todos. Exígela!
            </div>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
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
    numberToWords(num) {
      const units = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
      const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
      const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
      const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
      if (num === 0) return 'CERO';
      const integer = Math.floor(num);
      if (integer < 10) return units[integer];
      if (integer < 20) return teens[integer - 10];
      if (integer < 100) {
        const ten = Math.floor(integer / 10);
        const unit = integer % 10;
        return tens[ten] + (unit > 0 ? ' Y ' + units[unit] : '');
      }
      if (integer < 1000) {
        const hundred = Math.floor(integer / 100);
        const remainder = integer % 100;
        let result = hundred === 1 && remainder === 0 ? 'CIEN' : hundreds[hundred];
        if (remainder > 0) result += ' ' + this.numberToWords(remainder);
        return result;
      }
      if (integer < 1000000) {
        const thousands = Math.floor(integer / 1000);
        const remainder = integer % 1000;
        let result = thousands === 1 ? 'MIL' : this.numberToWords(thousands) + ' MIL';
        if (remainder > 0) result += ' ' + this.numberToWords(remainder);
        return result;
      }
      if (integer < 1000000000) {
        const millions = Math.floor(integer / 1000000);
        const remainder = integer % 1000000;
        let result = millions === 1 ? 'UN MILLÓN' : this.numberToWords(millions) + ' MILLONES';
        if (remainder > 0) result += ' ' + this.numberToWords(remainder);
        return result;
      }
      return 'NÚMERO MUY GRANDE';
    },
    async exportToExcel() {
      try {
        const XLSX = await import('xlsx');

        const data = [
          ['CERAMICAS TERRAZOS Y PULIDOS UNIVERSAL'],
          ['FACTURA'],
          [''],
          ['Número de Factura:', this.createdInvoiceData.invoice_number],
          ['Cliente:', this.customerInfo?.name || 'CONSUMIDOR FINAL'],
          ['RTN:', this.customerInfo?.rtn || '00000000000000'],
          ['Vendedor:', this.createdInvoiceData.vendor_name || 'VENDEDOR'],
          [''],
          ['Cant', 'Producto', 'P/Unit', 'Total']
        ];

        this.createdInvoiceData.items.forEach(item => {
          const qty = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.unit_price || item.price) || 0;
          const taxRate = parseFloat(item.tax_rate) || 0;
          const itemSubtotal = qty * price;
          const itemTax = itemSubtotal * (taxRate / 100);
          const itemTotal = itemSubtotal + itemTax;

          data.push([
            qty,
            item.product_name || item.name,
            price.toFixed(2),
            itemTotal.toFixed(2)
          ]);
        });

        data.push(['']);
        data.push(['TOTAL A PAGAR:', 'L ' + this.createdInvoiceData.total.toFixed(2)]);

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Factura');

        XLSX.writeFile(wb, `Factura_${this.createdInvoiceData.invoice_number}.xlsx`);
      } catch (error) {
        console.error('Error al exportar a Excel:', error);
        alert('Error al exportar a Excel');
      }
    },
    async exportToPDF() {
      try {
        const html2pdf = (await import('html2pdf.js')).default;

        const element = this.$refs.invoiceFrame.contentDocument.body;
        const opt = {
          margin: 5,
          filename: `Factura_${this.createdInvoiceData.invoice_number}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: [80, 200], orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error('Error al exportar a PDF:', error);
        alert('Error al exportar a PDF');
      }
    },
    async exportToImage() {
      try {
        const html2canvas = (await import('html2canvas')).default;

        const element = this.$refs.invoiceFrame.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Factura_${this.createdInvoiceData.invoice_number}.png`;
          a.click();
          URL.revokeObjectURL(url);
        });
      } catch (error) {
        console.error('Error al exportar como imagen:', error);
        alert('Error al exportar como imagen');
      }
    },
    handleClickOutside(event) {
      // Cerrar el dropdown si se hace click fuera del botón
      const dropdown = event.target.closest('.btn-group');
      if (!dropdown && this.showExportMenu) {
        this.showExportMenu = false;
      }
    },
    buildInvoicePreview() {
      if (!this.createdInvoiceData) return '';

      let tableRows = '';
      let subtotal = 0;
      let totalTax = 0;
      let taxableAmount = 0;

      this.createdInvoiceData.items.forEach((item) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price || item.price) || 0;
        const taxRate = parseFloat(item.tax_rate) || 0;
        const itemSubtotal = qty * price;
        const itemTax = itemSubtotal * (taxRate / 100);
        const itemTotal = itemSubtotal + itemTax;
        if (taxRate > 0) {
          taxableAmount += itemSubtotal;
          totalTax += itemTax;
        }
        subtotal += itemSubtotal;
        tableRows += `
          <tr>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(qty)}</td>
            <td style="padding: 3px; font-size: 13px; line-height: 1.3;">${item.product_name || item.name}</td>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(price)}</td>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(itemTotal)}</td>
          </tr>
        `;
      });

      const discount = parseFloat(this.createdInvoiceData.discount || 0);
      const surcharge = parseFloat(this.createdInvoiceData.surcharge || 0);
      const grandTotal = this.createdInvoiceData.total || (subtotal + totalTax + surcharge - discount);

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>FACTURA - ${this.createdInvoiceData.invoice_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }

            body {
              font-family: Arial, sans-serif;
              color: #000;
              background: #fff;
              padding: 0;
              margin: 0;
              font-size: 14px;
            }

            .invoice-container {
              max-width: 80mm;
              margin: 0 auto;
              background: white;
              padding: 12px 18px;
            }
            .header {
              text-align: center;
              margin-bottom: 2px;
            }

            .company-logo {
              margin-bottom: 8px;
            }

            .company-logo img {
              max-width: 120px;
              height: auto;
            }

            .company-name {
              font-size: 13px;
              font-weight: 700;
              color: #000;
              margin: 5px 0;
              text-transform: uppercase;
              line-height: 1.3;
            }

            .company-details {
              font-size: 13px;
              color: #000;
              line-height: 1.2;
            }

            .doc-title {
              font-size: 17px;
              font-weight: 700;
              text-align: center;
              margin: 2px 0;
              padding: 2px;
              color: #000;
              text-transform: uppercase;
            }

            .info-section {
              font-size: 14px;
              line-height: 1.2;
              margin: 2px 0;
              padding: 0;
              text-align: center;
            }

            .info-section strong {
              font-weight: 700;
            }

            .products-table {
              width: 100%;
              margin: 2px 0;
              border-collapse: collapse;
              font-size: 13px;
            }

            .products-table thead {
              background: none;
            }

            .products-table thead th {
              padding: 5px 4px;
              text-align: left;
              font-size: 13px;
              font-weight: 700;
              color: #000;
              border: none;
            }

            .products-table tbody td {
              padding: 5px 4px;
              font-size: 13px;
              vertical-align: top;
              border: none;
            }

            .totals-section {
              margin-top: 8px;
              padding-top: 0;
            }

            .totals-table {
              width: 100%;
              font-size: 13px;
              border-collapse: collapse;
            }

            .totals-table td {
              padding: 1px 4px;
              line-height: 1.1;
            }

            .totals-table .total-label {
              text-align: left;
              font-weight: 700;
              padding-right: 10px;
            }

            .totals-table .total-value {
              text-align: right;
              font-weight: 400;
              width: 90px;
            }

            .totals-table .grand-total {
              font-weight: 700;
              font-size: 15px;
            }

            .totals-table .grand-total td {
              padding-top: 4px;
              padding-bottom: 4px;
            }

            .payment-section {
              margin-top: 6px;
              font-size: 12px;
              line-height: 1.1;
              padding-top: 4px;
              text-align: center;
            }

            .payment-section strong {
              font-weight: 700;
            }

            .footer-note {
              font-size: 12px;
              text-align: center;
              margin-top: 2px;
              line-height: 1.1;
              padding-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
          <div class="header">
            <div class="company-logo"><img src="${LOGO_BASE64}" alt="Logo"></div>
            <div class="company-name">CERAMICAS TERRAZOS Y PULIDOS<br>UNIVERSAL</div>
            <div class="company-details">
              <strong>RTN:</strong> 01061977002516<br>
              <strong>Dirección:</strong> Casa Matriz, Barrio La Merced,<br>
              Avenida 14 de Julio entre 15 y 16 calle frente a<br>
              Repuestos del Atlántico, La Ceiba, Atlántida<br>
              <strong>Teléfono de Empresa:</strong> 2440-0037<br>
              <strong>Teléfono Móvil:</strong> 9875-2725<br>
              mauricio_argenal@hotmail.com<br>
              <strong>CAI:</strong> ${this.createdInvoiceData.cai || '2A9170-F8828A-8815E0-63BE03-090956-9D'}
            </div>
          </div>
          <div class="doc-title">FACTURA</div>
          <div class="info-section">
            ${this.createdInvoiceData.invoice_number || '000-002-01-00000000'}<br>
            <strong>Condiciones de la Transacción:</strong> CONTADO<br>
            <strong>Cliente:</strong> ${this.customerInfo?.name || 'CONSUMIDOR FINAL'}<br>
            <strong>RTN:</strong> ${this.customerInfo?.rtn || '00000000000000'}<br>
            <strong>Vendedor:</strong> ${this.createdInvoiceData.vendor_name || 'VENDEDOR'}
          </div>
          <table class="products-table">
            <thead>
              <tr><td colspan="4" style="text-align: center; padding: 0; font-size: 12px; border: none;">.......................................................................................</td></tr>
              <tr>
                <th style="width: 35px; text-align: center;">Cant</th>
                <th>Producto</th>
                <th style="width: 60px; text-align: right;">P/Unit</th>
                <th style="width: 65px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="totals-section">
            <table class="totals-table">
              <tr><td class="total-label">Importe Exonerado:</td><td class="total-value">L 0.00</td></tr>
              <tr><td class="total-label">Importe Exento:</td><td class="total-value">L 0.00</td></tr>
              <tr><td class="total-label">Gravado 15%</td><td class="total-value">L ${this.formatCurrency(taxableAmount)}</td></tr>
              <tr><td class="total-label">Gravado 18%</td><td class="total-value">L 0.00</td></tr>
              <tr><td class="total-label">I.S.V 15 15%:</td><td class="total-value">L ${this.formatCurrency(totalTax)}</td></tr>
              <tr><td class="total-label">I.S.V 18 18%:</td><td class="total-value">L 0.00</td></tr>
              <tr><td class="total-label">RECARGOS:</td><td class="total-value">L ${this.formatCurrency(surcharge)}</td></tr>
              <tr><td class="total-label">DESCUENTOS Y REBAJAS OTORGADOS:</td><td class="total-value">L 0.00</td></tr>
              <tr class="grand-total"><td class="total-label"><strong>TOTAL A PAGAR:</strong></td><td class="total-value"><strong>L<br>${this.formatCurrency(grandTotal)}</strong></td></tr>
              <tr><td colspan="2" style="text-align: center; padding: 0; font-size: 12px;">.......................................................................................</td></tr>
            </table>
          </div>
          <div class="payment-section">
            <strong>Pagos Recibidos</strong><br>
            <strong>Transferencia:</strong> ${this.formatCurrency(grandTotal)}<br>
            <strong>Valor en letras:</strong> ${(() => {
              const integerPart = Math.floor(grandTotal);
              const cents = String(Math.floor((grandTotal % 1) * 100)).padStart(2, '0');
              return this.numberToWords(integerPart).toUpperCase() + ' LEMPIRAS CON ' + cents + '/100';
            })()}<br>
            <strong>Rango de facturación Vigente:</strong><br>
            <strong>Desde:</strong> ${this.createdInvoiceData.prefijo_control}-${String(this.createdInvoiceData.nro_inicial_control).padStart(8, '0')}<br>
            <strong>Hasta:</strong> ${this.createdInvoiceData.prefijo_control}-${String(this.createdInvoiceData.nro_final_control).padStart(8, '0')}<br>
            <strong>Fecha Limite de Emisión Vigente:</strong> ${this.formatDate(this.createdInvoiceData.fecha_fin) || '31/12/2025'}<br>
            <strong>No. Correlativo de la Orden de Compra<br>Exenta:</strong><br>
            <strong>No. Correlativo de la Constancia del Reg<br>Exonerado:</strong><br>
            <strong>No. Identificativo del Registro SAG:</strong><br>
            ${this.formatDateTime(new Date())}
          </div>
          <div class="footer-note">
            <strong>Entrega:</strong> ${this.formatDate(new Date())}<br>
            Original: Cliente/Copia: Obligado Tributario<br>
            <strong>Emisor:</strong> ¡La Factura es beneficio de todos. Exígela!
          </div>
          </div>
        </body>
        </html>
      `;
    },    formatVenceDays(dateString) {
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

      // Dejar fechas vacías para mostrar todos los documentos
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
        const endpoint = this.importDocumentType === 'pending-invoice'
          ? '/pending-invoices'
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
        const endpoint = this.importDocumentType === 'pending-invoice'
          ? `/pending-invoices/${doc.id}`
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
              <p><strong>Cliente:</strong> ${docData.customer_name}</p>
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
        const endpoint = this.importDocumentType === 'pending-invoice'
          ? `/pending-invoices/${this.selectedDocumentId}`
          : `/quotes/${this.selectedDocumentId}`;

        const response = await api.get(endpoint);
        const docData = response.data.data;

        // Clear current invoice
        this.clearInvoice();

        // Set customer info
        this.customerInfo = {
          id: docData.customer_id,
          code: docData.customer_code || '',
          name: docData.customer_name,
          rtn: docData.customer_rtn || '',
          phone: docData.customer_phone || ''
        };

        // Set warehouse if available
        if (docData.warehouse_id) {
          this.invoice.warehouse_id = docData.warehouse_id;
        }

        // Set vendor if available
        if (docData.seller_id) {
          this.currentVendor = {
            id: docData.seller_id,
            code: docData.seller_code || '',
            name: docData.seller_name
          };
        }

        // Import items
        if (docData.items && Array.isArray(docData.items)) {
          this.invoice.items = docData.items.map(item => ({
            product_id: item.product_id,
            code: item.product_code,
            name: item.product_name,
            quantity: parseFloat(item.quantity) || 1,
            price: parseFloat(item.unit_price) || 0,
            discount_percent: item.discount_value ? (item.discount_value / item.unit_price * 100) : 0,
            tax_percent: parseFloat(item.tax_rate) || 15,
            warehouse_id: item.warehouse_id || this.invoice.warehouse_id,
            total: 0
          }));

          // Recalculate totals for each item
          this.invoice.items.forEach((item, index) => {
            this.calculateItemTotal(index);
          });
        }

        // Cargar el recargo (surcharge) si existe
        if (docData.surcharge !== undefined && docData.surcharge !== null) {
          this.invoice.shipping_cost = parseFloat(docData.surcharge) || 0;
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
    },

    // ===================================================================
    // MÉTODOS DE CUPONES
    // ===================================================================
    async loadAvailableCoupons() {
      try {
        const response = await api.get('/coupons?is_active=1');
        if (response.data && response.data.data) {
          this.availableCoupons = response.data.data.coupons || response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading coupons:', error);
        this.availableCoupons = [];
      }
    },

    async applyCoupon() {
      try {
        if (!this.couponCode) {
          Swal.fire('Error', 'Ingrese un código de cupón', 'warning');
          return;
        }

        // Buscar el cupón por código
        const response = await api.get(`/coupons/validate/${this.couponCode}`);
        if (response.data && response.data.data) {
          const coupon = response.data.data;

          // Validar si el cupón es aplicable
          if (!coupon.is_active) {
            Swal.fire('Error', 'Este cupón no está activo', 'error');
            return;
          }

          const now = new Date();
          const validUntil = new Date(coupon.valid_until);
          if (validUntil < now) {
            Swal.fire('Error', 'Este cupón ha expirado', 'error');
            return;
          }

          // Aplicar el cupón
          this.appliedCoupon = coupon;

          // Aplicar descuento según el tipo
          if (coupon.discount_type === 'percentage') {
            // Aplicar descuento porcentual a todos los items
            this.invoice.items.forEach((item, index) => {
              item.discount_percent = parseFloat(coupon.discount_value);
              this.calculateItemTotal(index);
            });
          } else if (coupon.discount_type === 'fixed') {
            // Aplicar descuento fijo al total
            const discountPerItem = parseFloat(coupon.discount_value) / this.invoice.items.length;
            this.invoice.items.forEach((item, index) => {
              const itemTotal = item.price * item.quantity;
              item.discount_percent = (discountPerItem / itemTotal) * 100;
              this.calculateItemTotal(index);
            });
          }

          Swal.fire({
            icon: 'success',
            title: 'Cupón Aplicado',
            text: `Se ha aplicado el cupón ${coupon.code}`,
            timer: 2000
          });

          this.couponCode = '';
        }
      } catch (error) {
        console.error('Error applying coupon:', error);
        Swal.fire('Error', 'Cupón no válido o no encontrado', 'error');
      }
    },

    selectCoupon(coupon) {
      this.couponCode = coupon.code;
      this.applyCoupon();
    },

    removeCoupon() {
      // Remover descuentos aplicados
      this.invoice.items.forEach((item, index) => {
        item.discount_percent = 0;
        this.calculateItemTotal(index);
      });

      this.appliedCoupon = null;
      this.couponCode = '';

      Swal.fire({
        icon: 'info',
        title: 'Cupón Removido',
        text: 'El cupón ha sido removido',
        timer: 1500
      });
    },

    closeCouponModal() {
      this.showCouponModal = false;
      this.couponCode = '';
    },

    // ===================================================================
    // MÉTODOS DE OFERTAS
    // ===================================================================
    async loadAvailableOffers() {
      try {
        const response = await api.get('/offers?is_active=1');
        if (response.data && response.data.data) {
          this.availableOffers = response.data.data.offers || response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading offers:', error);
        this.availableOffers = [];
      }
    },

    viewOfferDetails(offer) {
      let productsHtml = '';

      if (offer.applies_to === 'all') {
        productsHtml = '<p>Esta oferta aplica a todos los productos</p>';
      } else if (offer.products && offer.products.length > 0) {
        productsHtml = '<ul class="text-left">';
        offer.products.forEach(p => {
          productsHtml += `<li>${p.product_name} - ${p.product_code}</li>`;
        });
        productsHtml += '</ul>';
      }

      Swal.fire({
        title: offer.name,
        html: `
          <div class="text-left">
            <p><strong>Descripción:</strong> ${offer.description}</p>
            <p><strong>Tipo:</strong> ${offer.offer_type}</p>
            <p><strong>Descuento:</strong> ${offer.discount_type === 'percentage' ? offer.discount_value + '%' : 'L ' + offer.discount_value}</p>
            <p><strong>Válido hasta:</strong> ${this.formatDate(offer.valid_until)}</p>
            <hr>
            <p><strong>Productos incluidos:</strong></p>
            ${productsHtml}
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
      });
    },

    closeOffersModal() {
      this.showOffersModal = false;
      this.offersSearch = '';
      this.offersTypeFilter = '';
      this.offersStatusFilter = 'active';
    },

    // ===================================================================
    // MÉTODO PARA FORMATEAR FECHA
    // ===================================================================
    formatDate(date) {
      if (!date) return 'N/A';
      const d = new Date(date);
      return d.toLocaleDateString('es-HN');
    },

    // ===================================================================
    // MÉTODO PARA INCREMENTAR CONSECUTIVOS (CONECTADO A BD)
    // ===================================================================
    async incrementConsecutive() {
      try {
        let documentType = '';

        if (this.documentType === 'FACTURA') {
          documentType = 'invoice';
          // Incrementar consecutivo en la tabla consecutives
          const response = await api.post(`/consecutives/${documentType}/increment`);
          if (response.data?.success && response.data.data) {
            this.consecutives.invoice = response.data.data.current_number;
          }

          // También incrementar en la resolución
          await api.patch(`/resolutions/${this.resolution.id}/increment`);
          this.resolution.current = this.consecutives.invoice;

          console.log('➕ Consecutivo FACTURA incrementado en BD:', this.consecutives.invoice);

        } else if (this.documentType === 'COTIZACION') {
          documentType = 'quote';
          // Incrementar consecutivo en la tabla consecutives
          const response = await api.post(`/consecutives/${documentType}/increment`);
          if (response.data?.success && response.data.data) {
            this.consecutives.quote = response.data.data.current_number;
          }

          console.log('➕ Consecutivo COTIZACION incrementado en BD:', this.consecutives.quote);

        } else if (this.documentType === 'PENDING') {
          documentType = 'pending_invoice';
          // Incrementar consecutivo en la tabla consecutives
          const response = await api.post(`/consecutives/${documentType}/increment`);
          if (response.data?.success && response.data.data) {
            this.consecutives.pending = response.data.data.current_number;
          }

          console.log('➕ Consecutivo PENDING incrementado en BD:', this.consecutives.pending);
        }

      } catch (error) {
        console.error('Error incrementando consecutivo en BD:', error);
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

.pos-invoice-wrapper {
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
