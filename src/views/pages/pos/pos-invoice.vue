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
          <button class="btn btn-outline-primary btn-sm" @click="toggleDocumentType" :title="'Cambiar documento (' + (keyboardShortcuts.changeDocument?.keys || 'Alt+D') + ')'">
            <i class="ti ti-file-invoice me-1"></i>{{ documentType }} <small>({{ keyboardShortcuts.changeDocument?.keys || 'Alt+D' }})</small>
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
                    <label class="form-label fw-bold">Cliente <small class="text-muted">({{ keyboardShortcuts.searchClients?.keys || 'Alt+F1' }})</small></label>
                    <div class="input-group">
                      <button class="btn btn-info" @click="showCustomerModal = true" :title="'Buscar cliente (' + (keyboardShortcuts.searchClients?.keys || 'Alt+F1') + ')'">
                        <i class="ti ti-search"></i>
                      </button>
                      <input type="text" class="form-control" :value="customerInfo.code" readonly style="max-width: 80px;">
                      <input type="text" class="form-control" :value="customerInfo.name" readonly>
                      <button class="btn btn-success" @click="openAddCustomerModal">
                        <i class="ti ti-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Bodega <small class="text-muted">(Alt+B)</small></label>
                    <select class="form-select" v-model="invoice.warehouse_id" ref="warehouseSelect" :title="'Cambiar bodega (Alt+B)'">
                      <option v-for="w in warehouses" :key="w.value" :value="w.value">{{ w.label }}</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-bold">Vendedor <small class="text-muted">({{ keyboardShortcuts.searchSeller?.keys || 'Alt+F3' }})</small></label>
                    <div class="input-group">
                      <button class="btn btn-info" @click="showVendorModal = true" :title="'Buscar vendedor (' + (keyboardShortcuts.searchSeller?.keys || 'Alt+F3') + ')'">
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
                    <label class="form-label fw-bold">Código de Producto <small class="text-muted">(Ctrl+2)</small></label>
                    <div class="input-group">
                      <button class="btn btn-info" @click="showProductModal = true" title="Buscar producto (Ctrl+2)">
                        <i class="ti ti-search"></i>
                      </button>
                      <button
                        class="btn btn-secondary"
                        @click="toggleBarcodeScanner"
                        title="Escanear código de barras">
                        <i class="ti ti-barcode"></i>
                      </button>
                      <input
                        type="text"
                        class="form-control"
                        v-model="currentProduct.code"
                        @keypress.enter="searchProductByCode"
                        placeholder="Código"
                        ref="productCodeInput">
                      <button class="btn btn-success" @click="showNewProductModal = true" title="Registro rápido de producto">
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
                    <input type="number" class="form-control text-center" v-model.number="currentProduct.quantity" step="0.01" min="0.01" @keydown.enter="addProductAndBlur">
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-primary w-100" @click="addProduct" title="Adicionar producto (Enter)" style="height: 62px;">
                      <div style="font-size: 1.1rem; font-weight: bold; line-height: 1.2;">ADICIONAR</div>
                      <small style="font-size: 0.7rem;">Enter</small>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Options Row -->
            <div class="card mb-2 flex-shrink-0">
              <div class="card-body p-2">
                <div class="d-flex justify-content-end gap-2">
                  <button class="btn btn-outline-secondary btn-sm" @click="showAdditionalOptions = !showAdditionalOptions" :title="'Opciones Adicionales (' + (keyboardShortcuts.additionalOptions?.keys || 'Alt+P') + ')'">
                    <i class="ti ti-settings me-1"></i>Opciones <small>({{ keyboardShortcuts.additionalOptions?.keys || 'Alt+P' }})</small>
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" @click="showAdditionalFields = !showAdditionalFields" :title="'Campos Adicionales (' + (keyboardShortcuts.additionalFields?.keys || 'Alt+M') + ')'">
                    <i class="ti ti-forms me-1"></i>Campos <small>({{ keyboardShortcuts.additionalFields?.keys || 'Alt+M' }})</small>
                  </button>

                  <!-- Import Document Dropdown -->
                  <div class="dropdown" :class="{ show: showImportDropdown }" style="position: relative; z-index: 1000;">
                    <button class="btn btn-purple btn-sm dropdown-toggle" type="button" @click="showImportDropdown = !showImportDropdown" :title="'Importar Documento (' + (keyboardShortcuts.importDocument?.keys || 'Alt+I') + ')'">
                      <i class="ti ti-file-import me-1"></i>Importar <small>({{ keyboardShortcuts.importDocument?.keys || 'Alt+I' }})</small>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" :class="{ show: showImportDropdown }" style="z-index: 1001;">
                      <li><a class="dropdown-item" href="#" @click.prevent="openImportModal('pending-invoice')">
                        <i class="ti ti-clock me-2"></i>Operación en Espera <small class="text-muted">(Alt+1)</small>
                      </a></li>
                      <li><a class="dropdown-item" href="#" @click.prevent="openImportModal('quote')">
                        <i class="ti ti-file-invoice me-2"></i>Cotización <small class="text-muted">(Alt+2)</small>
                      </a></li>
                      <li><a class="dropdown-item" href="#" @click.prevent="openImportModal('online-order')">
                        <i class="ti ti-shopping-cart me-2"></i>Pedidos en Línea <small class="text-muted">(Alt+3)</small>
                      </a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Products List - Diseño Vertical -->
            <div class="card products-list-card flex-grow-1" style="position: relative; z-index: 1;">
              <div class="card-body p-2 h-100">
                <div class="products-vertical-list">
                  <!-- Item Header (Solo se muestra cuando hay productos) -->
                  <div v-if="invoice.items.length > 0" class="list-header d-flex align-items-center px-3 py-2 bg-light border-bottom fw-bold text-uppercase" style="font-size: 0.8rem; gap: 30px; position: relative; z-index: 1;">
                    <div style="width: 170px;">BODEGA</div>
                    <div style="width: 120px;" class="text-center">P.UNIT.</div>
                    <div style="width: 120px;" class="text-center">DESC.UNIT.</div>
                    <div style="width: 120px;" class="text-center">CANTIDAD</div>
                    <div style="width: 120px;" class="text-center">IMPUESTOS</div>
                    <div class="flex-grow-1 text-end">TOTAL</div>
                  </div>

                  <!-- Lista de Productos -->
                  <div class="products-scroll-area">
                    <div v-for="(item, index) in invoice.items" :key="index"
                         class="product-item-compact mb-2 border-bottom pb-2"
                         :class="{ 'selected-product-row': selectedProductRow === index }"
                         @click="selectedProductRow = index"
                         style="cursor: pointer;">
                      <!-- Código, Imagen y Nombre del Producto -->
                      <div class="d-flex align-items-center mb-1">
                        <!-- Botón Info -->
                        <div style="flex: 0 0 70px;">
                          <button class="btn btn-sm btn-outline-primary" @click="showProductInfo(item)" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;">
                            + INFO
                          </button>
                        </div>

                        <!-- Imagen del Producto -->
                        <div style="flex: 0 0 50px;" class="mx-2">
                          <img
                            :src="item.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22%3E%3Crect width=%2250%22 height=%2250%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%228%22 fill=%22%23999%22%3ESIN IMAGEN%3C/text%3E%3C/svg%3E'"
                            :alt="item.name"
                            style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;"
                            @error="handleImageError"
                          >
                        </div>

                        <!-- Código -->
                        <div style="flex: 0 0 80px;">
                          <span class="badge bg-dark" style="font-size: 0.7rem;">{{ item.code || 'N/A' }}</span>
                        </div>

                        <!-- Nombre -->
                        <div class="flex-grow-1 px-2">
                          <div class="fw-semibold text-truncate" style="font-size: 0.85rem;">{{ item.name }}</div>
                        </div>

                        <!-- Botón Eliminar -->
                        <div style="flex: 0 0 30px;" class="text-end">
                          <button class="btn btn-link text-danger p-0" @click="removeProduct(index)" title="Eliminar">
                            <i class="ti ti-x"></i>
                          </button>
                        </div>
                      </div>

                      <!-- Fila de datos siguiendo orden: BODEGA, P.UNIT, DESC.UNIT, CANTIDAD, IMPUESTOS, TOTAL -->
                      <div class="d-flex align-items-center px-3" style="gap: 30px;">
                        <!-- BODEGA - Seleccionable -->
                        <div style="width: 170px;">
                          <select class="form-select form-select-sm" v-model="item.warehouse_id" @change="onWarehouseChange(index)" style="font-size: 0.7rem; height: 28px; padding: 0.25rem 0.5rem;">
                            <option v-for="warehouse in warehouses" :key="warehouse.value" :value="warehouse.value">
                              {{ warehouse.label }}
                            </option>
                          </select>
                        </div>

                        <!-- P.UNIT. - Editable -->
                        <div style="width: 120px;">
                          <input type="number" class="form-control form-control-sm text-center" v-model.number="item.price" @input="calculateItemTotal(index)" step="0.01" min="0" style="font-size: 0.75rem; height: 28px;">
                        </div>

                        <!-- DESC.UNIT. - Solo lectura -->
                        <div style="width: 120px;" class="text-center">
                          <span class="badge bg-secondary" style="font-size: 0.75rem;">{{ item.discount_percent }}%</span>
                        </div>

                        <!-- CANTIDAD -->
                        <div style="width: 120px;">
                          <input type="number" class="form-control form-control-sm text-center" v-model.number="item.quantity" @input="calculateItemTotal(index)" step="0.01" min="0.01" style="font-size: 0.75rem; height: 28px;">
                        </div>

                        <!-- IMPUESTOS -->
                        <div style="width: 120px;" class="text-center">
                          <span class="badge bg-info" style="font-size: 0.75rem;">{{ item.tax_percent }}%</span>
                        </div>

                        <!-- TOTAL -->
                        <div class="flex-grow-1 text-end">
                          <strong class="text-primary" style="font-size: 0.9rem;">L {{ formatCurrency(item.total) }}</strong>
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
                  <strong>{{ totals.itemCount }}</strong>
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
                <!-- Cupones Aplicados -->
                <div v-for="coupon in appliedCoupons" :key="coupon.code" class="total-row text-success">
                  <span>
                    <i class="ti ti-discount-check me-1"></i>
                    Cupón {{ coupon.code }}
                  </span>
                  <strong>- L {{ formatCurrency(coupon.discount_amount) }}</strong>
                </div>
                <!-- Ofertas Aplicadas -->
                <div v-if="totalOffersDiscount > 0" class="total-row text-success">
                  <span>
                    <i class="ti ti-tag me-1"></i>
                    Descuento Ofertas
                  </span>
                  <strong>- L {{ formatCurrency(totalOffersDiscount) }}</strong>
                </div>
                <div class="total-row align-items-center">
                  <span>RECARGOS: <small class="text-muted">(Alt+R)</small></span>
                  <div class="input-group input-group-sm" style="width: 130px;">
                    <span class="input-group-text py-0">L</span>
                    <input type="number" class="form-control py-0 text-end" v-model.number="invoice.shipping_cost" min="0" step="0.01" ref="shippingCostInput" :title="'Editar recargos (Alt+R)'">
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
                  <button class="btn btn-danger btn-lg" @click="clearInvoice" :title="'Eliminar transacción (' + (keyboardShortcuts.deleteTransaction?.keys || 'Alt+F8') + ')'">
                    <i class="ti ti-trash me-2"></i>ELIMINAR <small>({{ keyboardShortcuts.deleteTransaction?.keys || 'Alt+F8' }})</small>
                  </button>

                  <!-- Botones para COTIZACIÓN -->
                  <template v-if="documentType === 'COTIZACION'">
                    <button class="btn btn-info btn-lg" @click="saveAsQuote" :disabled="invoice.items.length === 0" :title="'Guardar cotización (' + (keyboardShortcuts.saveQuote?.keys || 'Alt+F6') + ')'">
                      <i class="ti ti-file-invoice me-2"></i>Guardar Cotización <small>({{ keyboardShortcuts.saveQuote?.keys || 'Alt+F6' }})</small>
                    </button>
                    <button class="btn btn-warning btn-lg" @click="saveAsPendingInvoice" :disabled="invoice.items.length === 0" :title="'Guardar en espera (' + (keyboardShortcuts.savePending?.keys || 'Alt+F7') + ')'">
                      <i class="ti ti-device-floppy me-2"></i>Guardar Op. Espera <small>({{ keyboardShortcuts.savePending?.keys || 'Alt+F7' }})</small>
                    </button>
                  </template>

                  <!-- Botones para FACTURA -->
                  <template v-else>
                    <!-- Mostrar botones solo si hay resolución activa -->
                    <template v-if="!resolutionExpired">
                      <button class="btn btn-warning btn-lg" @click="saveAsDraft" :disabled="invoice.items.length === 0" :title="'Guardar transacción (' + (keyboardShortcuts.saveTransaction?.keys || 'Alt+F5') + ')'">
                        <i class="ti ti-device-floppy me-2"></i>GUARDAR <small>({{ keyboardShortcuts.saveTransaction?.keys || 'Alt+F5' }})</small>
                      </button>
                      <button class="btn btn-success btn-lg" @click="showQuickPaymentModal = true" :disabled="invoice.items.length === 0" :title="'Cobro rápido (' + (keyboardShortcuts.fastPayment?.keys || 'Alt+F9') + ')'">
                        <i class="ti ti-currency-dollar me-2"></i>COBRO RÁPIDO <small>({{ keyboardShortcuts.fastPayment?.keys || 'Alt+F9' }})</small>
                      </button>
                      <button class="btn btn-info btn-lg" @click="showDetailedPaymentModal = true" :disabled="invoice.items.length === 0" :title="'Cobro detallado (' + (keyboardShortcuts.detailedPayment?.keys || 'Alt+F10') + ')'">
                        <i class="ti ti-receipt-2 me-2"></i>COBRO DETALLADO <small>({{ keyboardShortcuts.detailedPayment?.keys || 'Alt+F10' }})</small>
                      </button>
                    </template>
                    <!-- Mostrar mensaje cuando no hay resolución activa -->
                    <div v-else class="alert alert-danger" role="alert">
                      <i class="ti ti-alert-triangle me-2"></i>
                      <strong>No se puede facturar</strong>
                      <p class="mb-2 mt-2">No hay una resolución SAR activa.</p>
                      <button class="btn btn-sm btn-primary mt-2" @click="redirectToResolutions">
                        <i class="ti ti-settings me-1"></i>Configurar Resolución
                      </button>
                    </div>
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
              <button type="button" class="btn btn-success" @click="openAddCustomerModal">
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

    <!-- Modal: Registro Rápido de Cliente -->
    <div v-if="showAddCustomerModal" class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title text-white">
              <i class="ti ti-user-plus me-2"></i>Registro Rápido de Cliente
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeAddCustomerModal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <!-- Código (Auto-incremental, no editable) -->
              <div class="col-md-12">
                <label class="form-label fw-bold">Código <span class="text-muted">(Autogenerado)</span></label>
                <input
                  type="text"
                  class="form-control bg-light"
                  v-model="nextCustomerCode"
                  readonly
                  placeholder="Cargando...">
              </div>

              <!-- Nombre / Razón Social -->
              <div class="col-md-12">
                <label class="form-label fw-bold">Nombre / Razón Social <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newCustomer.razon_social"
                  placeholder="Nombre del cliente o razón social"
                  required
                  ref="customerNameInput">
              </div>

              <!-- RTN -->
              <div class="col-md-12">
                <label class="form-label fw-bold">RTN <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newCustomer.cedula"
                  @input="formatRTN"
                  placeholder="0000-0000-000000"
                  maxlength="16"
                  required>
                <small class="text-muted">Formato: 0000-0000-000000 (14 dígitos)</small>
              </div>

              <!-- Mensaje informativo -->
              <div class="col-md-12">
                <div class="alert alert-info mb-0">
                  <i class="ti ti-info-circle me-2"></i>
                  <small>Para un registro completo del cliente, utilice el módulo de Clientes en el menú principal.</small>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAddCustomerModal">
              <i class="ti ti-x me-1"></i>CERRAR
            </button>
            <button type="button" class="btn btn-success" @click="saveNewCustomer" :disabled="savingCustomer">
              <span v-if="savingCustomer" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="ti ti-device-floppy me-1"></i>
              {{ savingCustomer ? 'GUARDANDO...' : 'GUARDAR' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Registro Rápido de Producto -->
    <div v-if="showNewProductModal" class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title text-white">
              <i class="ti ti-plus me-2"></i>Registro Rápido de Producto
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeNewProductModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveNewProduct">
              <div class="row">
                <!-- Código -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Código <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="newProductForm.code"
                      required
                      placeholder="Código del producto"
                      ref="newProductCodeInput">
                  </div>
                </div>

                <!-- Nombre -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Nombre <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="newProductForm.name"
                      required
                      placeholder="Nombre del producto">
                  </div>
                </div>

                <!-- Unidades -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Unidades <span class="text-danger">*</span></label>
                    <select class="form-select" v-model="newProductForm.unit_id" required>
                      <option value="">Seleccione una unidad</option>
                      <option v-for="unit in units" :key="unit.id" :value="unit.id">
                        {{ unit.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Categoría -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Categoría <span class="text-danger">*</span></label>
                    <select class="form-select" v-model="newProductForm.category_id" @change="loadNewProductSubcategories" required>
                      <option value="">Seleccione una categoría</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Subcategoría -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Subcategoría</label>
                    <select class="form-select" v-model="newProductForm.subcategory_id" :disabled="!newProductForm.category_id">
                      <option value="">Seleccione una subcategoría</option>
                      <option v-for="sub in newProductSubcategories" :key="sub.id" :value="sub.id">
                        {{ sub.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Impuesto -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Impuesto <span class="text-danger">*</span></label>
                    <select class="form-select" v-model="newProductForm.tax_id" required>
                      <option value="">Seleccione un impuesto</option>
                      <option v-for="tax in taxRates" :key="tax.id" :value="tax.id">
                        {{ tax.name }} ({{ tax.rate }}%)
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Costo -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Costo</label>
                    <div class="input-group">
                      <span class="input-group-text">L</span>
                      <input
                        type="number"
                        step="0.01"
                        class="form-control"
                        v-model="newProductForm.cost"
                        placeholder="0.00">
                    </div>
                  </div>
                </div>

                <!-- Utilidad (%) -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Utilidad (%)</label>
                    <div class="input-group">
                      <input
                        type="number"
                        step="0.01"
                        class="form-control"
                        v-model="newProductForm.profit_margin"
                        @input="calculatePriceFromProfit"
                        placeholder="0">
                      <span class="input-group-text">%</span>
                    </div>
                  </div>
                </div>

                <!-- Precio -->
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label">Precio <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">L</span>
                      <input
                        type="number"
                        step="0.01"
                        class="form-control"
                        v-model="newProductForm.price"
                        required
                        @input="calculateProfitFromPrice"
                        placeholder="0.00">
                    </div>
                  </div>
                </div>

                <!-- Imagen del Producto -->
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label">Imagen del Producto</label>
                    <input
                      type="file"
                      class="form-control"
                      @change="handleNewProductImageUpload"
                      accept="image/jpeg,image/png,image/gif">
                    <small class="text-muted">Formatos: JPG, PNG, GIF (Máx. 5MB)</small>
                  </div>
                </div>
              </div>

              <div v-if="newProductError" class="alert alert-danger">
                <i class="ti ti-alert-circle me-2"></i>{{ newProductError }}
              </div>
              <div v-if="newProductSuccess" class="alert alert-success">
                <i class="ti ti-check me-2"></i>{{ newProductSuccess }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeNewProductModal">
              <i class="ti ti-x me-1"></i>CERRAR
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="saveNewProduct"
              :disabled="savingNewProduct">
              <span v-if="savingNewProduct" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="ti ti-check me-1"></i>
              {{ savingNewProduct ? 'GUARDANDO...' : 'GUARDAR' }}
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
      @show-info="showProductInfoFromSearch"
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
              <button class="btn btn-success btn-lg" @click="showAperturaCajaModal = true; showAdditionalOptions = false"><i class="ti ti-cash-register me-2"></i>APERTURA DE CAJA</button>
              <button class="btn btn-warning btn-lg" @click="showEgresoCajaModal = true; showAdditionalOptions = false"><i class="ti ti-cash me-2"></i>EGRESO DE CAJA</button>
              <button class="btn btn-info btn-lg" @click="showRetiroEfectivoModal = true; showAdditionalOptions = false"><i class="ti ti-coins me-2"></i>RETIRAR EFECTIVO</button>
              <button class="btn btn-info btn-lg" @click="openTaxExemptionModal" :title="'Exoneración ISV (' + (keyboardShortcuts.taxExemption?.keys || 'Alt+F11') + ')'"><i class="ti ti-file-certificate me-2"></i>EXONERACIÓN ISV <small>({{ keyboardShortcuts.taxExemption?.keys || 'Alt+F11' }})</small></button>
              <button class="btn btn-info btn-lg" @click="showCouponModal = true; showAdditionalOptions = false" :title="'Aplicar cupón (' + (keyboardShortcuts.applyCoupon?.keys || 'Alt+C') + ')'"><i class="ti ti-ticket me-2"></i>APLICAR CUPÓN <small>({{ keyboardShortcuts.applyCoupon?.keys || 'Alt+C' }})</small></button>
              <button class="btn btn-info btn-lg" @click="showOffersModal = true; showAdditionalOptions = false" :title="'Ver ofertas (' + (keyboardShortcuts.viewOffers?.keys || 'Alt+O') + ')'"><i class="ti ti-tag me-2"></i>VER OFERTAS <small>({{ keyboardShortcuts.viewOffers?.keys || 'Alt+O' }})</small></button>
              <button class="btn btn-outline-secondary btn-lg" @click="showKeyboardShortcutsModal = true; showAdditionalOptions = false"><i class="ti ti-keyboard me-2"></i>ATAJOS DE TECLADO</button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAdditionalOptions = false">CERRAR</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Exoneración ISV -->
    <div v-if="showTaxExemptionModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Exoneración ISV</h5>
            <button type="button" class="btn btn-danger btn-sm rounded-circle" @click="showTaxExemptionModal = false" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
              <i class="ti ti-x" style="font-size: 1.2rem; color: white;"></i>
            </button>
          </div>
          <div class="modal-body">
            <table class="table table-sm table-bordered">
              <thead class="table-light">
                <tr>
                  <th style="width: 100px;">Código</th>
                  <th style="width: 80px;" class="text-center">Ventas</th>
                  <th>Impuesto</th>
                  <th style="width: 80px;" class="text-center">%</th>
                  <th style="width: 100px;" class="text-end">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tax in availableTaxes" :key="tax.code">
                  <td>{{ tax.code }}</td>
                  <td class="text-center">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="'tax-' + tax.code"
                      :value="tax.code"
                      v-model="selectedTaxesForExemption"
                      style="cursor: pointer; width: 20px; height: 20px; border: 2px solid #000;">
                  </td>
                  <td>{{ tax.name }}</td>
                  <td class="text-center">{{ tax.rate.toFixed(2) }}</td>
                  <td class="text-end">{{ formatCurrency(calculateTaxAmount(tax.rate)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showTaxExemptionModal = false">CANCELAR</button>
            <button type="button" class="btn btn-success" @click="applyTaxExemption">APLICAR</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showCustomerModal || showAddCustomerModal || showCustomerInfoModal || showProductModal || showVendorModal || showAdditionalFields || showAdditionalOptions || showTaxExemptionModal || showAperturaCajaModal || showEgresoCajaModal || showRetiroEfectivoModal"
         class="modal-backdrop fade show"
         @click="closeAllModals">
    </div>

    <!-- Modales de Arqueo de Caja -->
    <AperturaCajaModal
      v-if="showAperturaCajaModal"
      @close="showAperturaCajaModal = false"
      @success="handleCashRegisterSuccess" />

    <EgresoCajaModal
      v-if="showEgresoCajaModal"
      @close="showEgresoCajaModal = false"
      @success="handleCashRegisterSuccess" />

    <RetiroEfectivoModal
      v-if="showRetiroEfectivoModal"
      @close="showRetiroEfectivoModal = false"
      @success="handleCashRegisterSuccess" />

  </div>

    <!-- Modal: Config. Atajos de Teclado -->
    <div v-if="showKeyboardShortcutsModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white"><i class="ti ti-keyboard me-2"></i>Configuración de Atajos de Teclado</h5>
            <button type="button" class="btn-close btn-close-white" @click="showKeyboardShortcutsModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <!-- Columna Izquierda -->
              <div class="col-md-6">
                <h6 class="text-muted mb-3 border-bottom pb-2">Búsquedas</h6>
                <!-- Búsqueda de Clientes -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-users me-1 text-primary"></i>Búsqueda de Clientes
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.searchClients.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'client-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Búsqueda de Productos -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-box me-1 text-primary"></i>Búsqueda de Productos
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.searchProducts.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'prod-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Búsqueda de Vendedor -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-user-check me-1 text-primary"></i>Búsqueda de Vendedor
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.searchSeller.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'seller-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <h6 class="text-muted mb-3 mt-3 border-bottom pb-2">Acciones de Factura</h6>
                <!-- Guardar Transacción -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-device-floppy me-1 text-warning"></i>Guardar Transacción
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.saveTransaction.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'save-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Guardar Cotización -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-file-invoice me-1 text-info"></i>Guardar Cotización
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.saveQuote.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'quote-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Guardar Op. en Espera -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-clock me-1 text-secondary"></i>Guardar Op. en Espera
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.savePending.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'pending-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Eliminar Transacción -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-trash me-1 text-danger"></i>Eliminar Transacción
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.deleteTransaction.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'delete-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Adicionar Producto -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-plus me-1 text-success"></i>Adicionar Producto
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.addProduct.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'add-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Columna Derecha -->
              <div class="col-md-6">
                <h6 class="text-muted mb-3 border-bottom pb-2">Cobros y Descuentos</h6>
                <!-- Cobro Rápido -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-currency-dollar me-1 text-success"></i>Cobro Rápido
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.fastPayment.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'fast-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Cobro Detallado -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-receipt-2 me-1 text-info"></i>Cobro Detallado
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.detailedPayment.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'detail-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Exoneración ISV -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-discount-check me-1 text-purple"></i>Exoneración ISV
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.taxExemption.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'tax-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Aplicar Cupón -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-ticket me-1 text-orange"></i>Aplicar Cupón
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.applyCoupon.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'coupon-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Ver Ofertas -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-tag me-1 text-success"></i>Ver Ofertas
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.viewOffers.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'offers-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <h6 class="text-muted mb-3 mt-3 border-bottom pb-2">Configuración</h6>
                <!-- Cambiar Documento -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-switch-horizontal me-1 text-primary"></i>Cambiar Documento
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.changeDocument.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'doc-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Importar Documento -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-file-import me-1 text-purple"></i>Importar Documento
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.importDocument.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'import-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Opciones Adicionales -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-settings me-1 text-secondary"></i>Opciones Adicionales
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.additionalOptions.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'options-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Campos Adicionales -->
                <div class="shortcut-item mb-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <label class="form-label mb-0 small">
                      <i class="ti ti-forms me-1 text-secondary"></i>Campos Adicionales
                    </label>
                    <select class="form-select form-select-sm" style="width: 150px;" v-model="keyboardShortcuts.additionalFields.keys">
                      <option value="">Sin asignar</option>
                      <option v-for="opt in availableShortcutOptions" :key="'fields-'+opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Nota informativa -->
            <div class="alert alert-info mt-3 mb-0">
              <i class="ti ti-info-circle me-2"></i>
              <small>Seleccione la combinación de teclas deseada para cada acción. Los atajos funcionan cuando no hay un campo de texto activo.</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="resetKeyboardShortcuts">
              <i class="ti ti-refresh me-1"></i>Restaurar por Defecto
            </button>
            <button type="button" class="btn btn-secondary" @click="showKeyboardShortcutsModal = false">CERRAR</button>
            <button type="button" class="btn btn-success" @click="saveKeyboardShortcuts">
              <i class="ti ti-check me-1"></i>GUARDAR
            </button>
          </div>
        </div>
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
                    TRANSFERENCIA<br><small>(1)</small>
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="quickPayment.method === 'CHEQUE' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="quickPayment.method = 'CHEQUE'">
                    CHEQUE<br><small>(2)</small>
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="quickPayment.method === 'TARJ_DEBITO' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="quickPayment.method = 'TARJ_DEBITO'">
                    TARJ. DÉBITO<br><small>(3)</small>
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="quickPayment.method === 'TARJ_CREDITO' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="quickPayment.method = 'TARJ_CREDITO'">
                    TARJ. CRÉDITO<br><small>(4)</small>
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="quickPayment.method === 'EFECTIVO' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="quickPayment.method = 'EFECTIVO'">
                    EFECTIVO<br><small>(5)</small>
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="quickPayment.method === 'LINK_PAGO' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="quickPayment.method = 'LINK_PAGO'">
                    LINK DE PAGO<br><small>(6)</small>
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
              Cancelar <small>(Esc)</small>
            </button>
            <button type="button" class="btn btn-info" @click="switchToDetailedPayment">
              Cobro Detallado <small>(D)</small>
            </button>
            <button type="button" class="btn btn-primary" @click="processQuickPayment">
              <i class="ti ti-check"></i> Procesar Pago <small>(Enter)</small>
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

    <!-- Modal: Resolución Vencida -->
    <div v-if="showExpiredResolutionModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.7); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-danger">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="ti ti-alert-triangle me-2"></i>Resolución Vencida
            </h5>
          </div>
          <div class="modal-body text-center py-4">
            <div class="mb-4">
              <i class="ti ti-alert-circle text-danger" style="font-size: 4rem;"></i>
            </div>
            <h4 class="text-danger mb-3">No se puede facturar</h4>
            <p class="mb-2" v-if="resolutionInfo">La resolución SAR activa ha vencido y no es posible generar facturas.</p>
            <p class="mb-2" v-else>No hay una resolución SAR activa. No es posible generar facturas.</p>
            <div v-if="resolutionInfo" class="alert alert-warning mt-3">
              <p class="mb-1"><strong>Resolución:</strong> {{ resolutionInfo.numero_resolucion }}</p>
              <p class="mb-0"><strong>Fecha de vencimiento:</strong> {{ formatDate(resolutionInfo.fecha_fin) }}</p>
            </div>
            <div v-else class="alert alert-warning mt-3">
              <p class="mb-0">No se encontró ninguna resolución activa en el sistema.</p>
            </div>
            <p class="text-muted mt-3">Por favor, cree una nueva resolución para poder continuar facturando.</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button type="button" class="btn btn-secondary" @click="showExpiredResolutionModal = false">
              Cancelar
            </button>
            <button type="button" class="btn btn-primary" @click="redirectToResolutions">
              <i class="ti ti-settings me-1"></i>Ir a Configuración de Resoluciones
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
              Cerrar <small>(Esc)</small>
            </button>
            <div class="btn-group" style="position: relative;">
              <button type="button" class="btn btn-success dropdown-toggle" @click="showQuoteOptionsDropdown = !showQuoteOptionsDropdown">
                <i class="ti ti-file-export me-1"></i>Otras Opciones <small>(Alt+O)</small>
              </button>
              <ul class="dropdown-menu" :class="{ show: showQuoteOptionsDropdown }" style="position: absolute; bottom: 100%; left: 0; margin-bottom: 5px;">
                <li><a class="dropdown-item" href="#" @click.prevent="exportQuoteToPDF(); showQuoteOptionsDropdown = false"><i class="ti ti-file-type-pdf me-2"></i>Exportar a PDF <small class="text-muted">(Alt+1)</small></a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="exportQuoteToExcel(); showQuoteOptionsDropdown = false"><i class="ti ti-file-type-xls me-2"></i>Exportar a Excel <small class="text-muted">(Alt+2)</small></a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="saveQuoteAsImage(); showQuoteOptionsDropdown = false"><i class="ti ti-photo me-2"></i>Guardar como Imagen <small class="text-muted">(Alt+3)</small></a></li>
              </ul>
            </div>
            <button type="button" class="btn btn-warning" @click="printQuotePreview">
              <i class="ti ti-printer me-1"></i>Imprimir <small>(Alt+P)</small>
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
            <h5 class="modal-title text-white mb-0">
              Búsqueda de datos -
              <span v-if="importDocumentType === 'pending-invoice'">Operación en Espera</span>
              <span v-else-if="importDocumentType === 'quote'">Cotización</span>
              <span v-else-if="importDocumentType === 'online-order'">Pedidos en Línea</span>
            </h5>
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
                  <input type="text" class="form-control" v-model="couponCode" placeholder="Ingrese el código del cupón" @keypress.enter="applyCoupon" :disabled="isValidatingCoupon">
                  <button class="btn btn-primary" @click="applyCoupon" :disabled="!couponCode.trim() || isValidatingCoupon">
                    <i class="ti ti-check me-1"></i>{{ isValidatingCoupon ? 'VALIDANDO...' : 'APLICAR' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Error de cupón -->
            <div v-if="couponError" class="alert alert-danger">
              <i class="ti ti-alert-circle me-1"></i>
              {{ couponError }}
            </div>

            <!-- Cupones Aplicados -->
            <div v-if="appliedCoupons.length > 0" class="mb-3">
              <h6 class="fw-bold mb-2">Cupones Aplicados</h6>
              <div v-for="coupon in appliedCoupons" :key="coupon.code" class="alert alert-success d-flex justify-content-between align-items-center">
                <div>
                  <p class="mb-1"><strong>Código:</strong> {{ coupon.code }} - {{ coupon.name }}</p>
                  <p class="mb-0"><strong>Descuento:</strong> L {{ coupon.discount_amount.toFixed(2) }}</p>
                </div>
                <button class="btn btn-sm btn-danger" @click="removeCoupon(coupon.code)">
                  <i class="ti ti-x"></i>
                </button>
              </div>
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
                    <td>{{ coupon.codigo }}</td>
                    <td>{{ coupon.tipo_descuento === 'porcentaje' ? coupon.valor_descuento + '%' : 'L ' + parseFloat(coupon.valor_descuento).toFixed(2) }}</td>
                    <td>{{ coupon.fecha_hasta ? formatDate(coupon.fecha_hasta) : 'Sin límite' }}</td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-success me-1" @click="viewCouponDetails(coupon)">
                        <i class="ti ti-eye"></i>
                      </button>
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

    <!-- Modal: Detalles del Cupón -->
    <div v-if="showCouponDetailsModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Detalles del cupón</h5>
            <button type="button" class="btn-close btn-close-white" @click="showCouponDetailsModal = false"></button>
          </div>
          <div class="modal-body" v-if="selectedCouponDetails">
            <div class="row">
              <div class="col-lg-3 mb-3">
                <label class="form-label fw-bold">Código:</label>
                <p class="form-control-plaintext">{{ selectedCouponDetails.codigo }}</p>
              </div>
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Nombre:</label>
                <p class="form-control-plaintext">{{ selectedCouponDetails.nombre }}</p>
              </div>
              <div class="col-lg-3 mb-3">
                <label class="form-label fw-bold">Agencia:</label>
                <p class="form-control-plaintext">{{ selectedCouponDetails.agencia_nombre || 'Todas las agencias' }}</p>
              </div>
            </div>

            <!-- Para cupones de tipo grupo o producto único -->
            <div v-if="selectedCouponDetails.tipo_aplicacion !== 'multiple'" class="row">
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Categoría:</label>
                <p class="form-control-plaintext">{{ selectedCouponDetails.categoria_nombre || 'N/A' }}</p>
              </div>
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Subcategoría:</label>
                <p class="form-control-plaintext">{{ selectedCouponDetails.subcategoria_nombre || 'N/A' }}</p>
              </div>
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Producto:</label>
                <p class="form-control-plaintext">{{ selectedCouponDetails.producto_nombre || 'N/A' }}</p>
              </div>
            </div>

            <!-- Para cupones de tipo múltiple: mostrar lista de productos -->
            <div v-if="selectedCouponDetails.tipo_aplicacion === 'multiple' && selectedCouponDetails.items && selectedCouponDetails.items.length > 0" class="row">
              <div class="col-12 mb-3">
                <label class="form-label fw-bold">Productos Incluidos ({{ selectedCouponDetails.items.length }}):</label>
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
                      <tr v-for="item in selectedCouponDetails.items" :key="item.id">
                        <td>{{ item.product_code }}</td>
                        <td>{{ item.product_name }}</td>
                        <td>{{ item.descuento_porcentaje }}%</td>
                        <td>L {{ parseFloat(item.descuento_monto).toFixed(2) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Tipo de Descuento:</label>
                <p class="form-control-plaintext">{{ selectedCouponDetails.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto' }}</p>
              </div>
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Valor:</label>
                <p class="form-control-plaintext">{{ parseFloat(selectedCouponDetails.valor_descuento).toFixed(2) }}{{ selectedCouponDetails.tipo_descuento === 'porcentaje' ? '%' : '' }}</p>
              </div>
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Estado:</label>
                <p class="form-control-plaintext">
                  <span :class="selectedCouponDetails.is_active ? 'badge bg-success' : 'badge bg-danger'">
                    {{ selectedCouponDetails.is_active ? 'ACTIVO' : 'INACTIVO' }}
                  </span>
                </p>
              </div>
            </div>

            <div v-if="selectedCouponDetails.limitar_fecha" class="row">
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Fecha Desde:</label>
                <p class="form-control-plaintext">{{ selectedCouponDetails.fecha_desde || 'N/A' }}</p>
              </div>
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Fecha Hasta:</label>
                <p class="form-control-plaintext">{{ selectedCouponDetails.fecha_hasta || 'N/A' }}</p>
              </div>
            </div>

            <div class="row">
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Suspendida:</label>
                <p class="form-control-plaintext">
                  <span :class="selectedCouponDetails.suspendida ? 'badge bg-warning' : 'badge bg-success'">
                    {{ selectedCouponDetails.suspendida ? 'SÍ' : 'NO' }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-dark" @click="showCouponDetailsModal = false">Cerrar</button>
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
            <!-- Ofertas Activas Aplicadas -->
            <div v-if="activeOffers.length > 0" class="mb-4">
              <h6 class="fw-bold mb-2 text-success">
                <i class="ti ti-tag me-1"></i>
                Ofertas Aplicadas Automáticamente
              </h6>
              <div v-for="offer in activeOffers" :key="offer.id" class="alert alert-success d-flex justify-content-between align-items-center">
                <div>
                  <p class="mb-1"><strong>{{ offer.name }}</strong></p>
                  <p class="mb-0">Descuento: L {{ offer.discount_amount.toFixed(2) }}</p>
                </div>
                <span class="badge bg-success">APLICADA</span>
              </div>
            </div>

            <hr v-if="activeOffers.length > 0">

            <h6 class="fw-bold mb-3">Todas las Ofertas Disponibles</h6>

            <div class="row mb-3">
              <div class="col-md-6">
                <input type="text" class="form-control" v-model="offersSearch" placeholder="Buscar ofertas...">
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="offersTypeFilter">
                  <option value="">Todos los tipos</option>
                  <option value="porcentaje">Porcentaje</option>
                  <option value="monto">Monto fijo</option>
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
                    <th>Código</th>
                    <th>Oferta</th>
                    <th>Tipo Descuento</th>
                    <th>Valor</th>
                    <th>Aplicación</th>
                    <th>Agencia</th>
                    <th class="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="offer in filteredOffers" :key="offer.id">
                    <td>{{ offer.codigo }}</td>
                    <td>
                      <strong>{{ offer.nombre }}</strong>
                      <br>
                      <small class="text-muted" v-if="offer.categoria_nombre">
                        Categoría: {{ offer.categoria_nombre }}
                      </small>
                      <small class="text-muted" v-if="offer.subcategoria_nombre">
                        <br>Subcategoría: {{ offer.subcategoria_nombre }}
                      </small>
                      <small class="text-muted" v-if="offer.producto_nombre">
                        <br>Producto: {{ offer.producto_nombre }}
                      </small>
                    </td>
                    <td>
                      <span class="badge" :class="offer.tipo_descuento === 'porcentaje' ? 'bg-info' : 'bg-success'">
                        {{ offer.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo' }}
                      </span>
                    </td>
                    <td>
                      <strong>{{ offer.tipo_descuento === 'porcentaje' ? offer.valor_descuento + '%' : 'L ' + parseFloat(offer.valor_descuento).toFixed(2) }}</strong>
                    </td>
                    <td>
                      <small>{{ offer.tipo_aplicacion === 'grupo' ? 'Grupo' : 'Múltiple' }}</small>
                      <br>
                      <small class="text-muted" v-if="offer.items_count > 0">{{ offer.items_count }} producto(s)</small>
                    </td>
                    <td>{{ offer.agencia_nombre || 'Todas' }}</td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-success" @click="viewOfferDetails(offer)">
                        <i class="ti ti-eye me-1"></i>Ver
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredOffers.length === 0">
                    <td colspan="7" class="text-center text-muted py-3">No hay ofertas disponibles</td>
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

    <!-- Modal: Detalles de la Oferta -->
    <div v-if="showOfferDetailsModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Detalles de la Oferta</h5>
            <button type="button" class="btn-close btn-close-white" @click="showOfferDetailsModal = false"></button>
          </div>
          <div class="modal-body" v-if="selectedOfferDetails">
            <div class="row">
              <div class="col-lg-3 mb-3">
                <label class="form-label fw-bold">Código:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.codigo }}</p>
              </div>
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Nombre:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.nombre }}</p>
              </div>
              <div class="col-lg-3 mb-3">
                <label class="form-label fw-bold">Agencia:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.agencia_nombre || 'Agencia Principal' }}</p>
              </div>
            </div>

            <!-- Para ofertas de tipo grupo o producto único -->
            <div v-if="selectedOfferDetails.tipo_aplicacion !== 'multiple'" class="row">
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Categoría:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.categoria_nombre || 'N/A' }}</p>
              </div>
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Subcategoría:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.subcategoria_nombre || 'N/A' }}</p>
              </div>
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Producto:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.producto_nombre || 'N/A' }}</p>
              </div>
            </div>

            <!-- Para ofertas de tipo múltiple: mostrar lista de productos -->
            <div v-if="selectedOfferDetails.tipo_aplicacion === 'multiple' && selectedOfferDetails.items && selectedOfferDetails.items.length > 0" class="row">
              <div class="col-12 mb-3">
                <label class="form-label fw-bold">Productos Incluidos ({{ selectedOfferDetails.items.length }}):</label>
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
                      <tr v-for="item in selectedOfferDetails.items" :key="item.id">
                        <td>{{ item.product_code }}</td>
                        <td>{{ item.product_name }}</td>
                        <td>{{ item.descuento_porcentaje }}%</td>
                        <td>L {{ parseFloat(item.descuento_monto).toFixed(2) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Tipo de Descuento:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto' }}</p>
              </div>
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Valor:</label>
                <p class="form-control-plaintext">{{ parseFloat(selectedOfferDetails.valor_descuento).toFixed(2) }}{{ selectedOfferDetails.tipo_descuento === 'porcentaje' ? '%' : '' }}</p>
              </div>
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Estado:</label>
                <p class="form-control-plaintext">
                  <span :class="selectedOfferDetails.is_active ? 'badge bg-success' : 'badge bg-danger'">
                    {{ selectedOfferDetails.is_active ? 'ACTIVO' : 'INACTIVO' }}
                  </span>
                </p>
              </div>
            </div>

            <div v-if="selectedOfferDetails.limitar_fecha" class="row">
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Fecha Desde:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.fecha_desde || 'N/A' }}</p>
              </div>
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Fecha Hasta:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.fecha_hasta || 'N/A' }}</p>
              </div>
            </div>

            <div v-if="selectedOfferDetails.limitar_hora" class="row">
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Hora Desde:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.hora_desde || 'N/A' }}</p>
              </div>
              <div class="col-lg-6 mb-3">
                <label class="form-label fw-bold">Hora Hasta:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.hora_hasta || 'N/A' }}</p>
              </div>
            </div>

            <!-- Días de aplicación -->
            <div class="row">
              <div class="col-12 mb-3">
                <label class="form-label fw-bold">Días de Aplicación:</label>
                <div class="d-flex gap-2 flex-wrap">
                  <span v-if="selectedOfferDetails.aplica_lunes" class="badge bg-warning">Lunes</span>
                  <span v-else class="badge bg-secondary">Lunes</span>

                  <span v-if="selectedOfferDetails.aplica_martes" class="badge bg-warning">Martes</span>
                  <span v-else class="badge bg-secondary">Martes</span>

                  <span v-if="selectedOfferDetails.aplica_miercoles" class="badge bg-warning">Miércoles</span>
                  <span v-else class="badge bg-secondary">Miércoles</span>

                  <span v-if="selectedOfferDetails.aplica_jueves" class="badge bg-warning">Jueves</span>
                  <span v-else class="badge bg-secondary">Jueves</span>

                  <span v-if="selectedOfferDetails.aplica_viernes" class="badge bg-warning">Viernes</span>
                  <span v-else class="badge bg-secondary">Viernes</span>

                  <span v-if="selectedOfferDetails.aplica_sabado" class="badge bg-warning">Sábado</span>
                  <span v-else class="badge bg-secondary">Sábado</span>

                  <span v-if="selectedOfferDetails.aplica_domingo" class="badge bg-warning">Domingo</span>
                  <span v-else class="badge bg-secondary">Domingo</span>
                </div>
              </div>
            </div>

            <!-- Condiciones de aplicación -->
            <div class="row">
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Aplica Para:</label>
                <p class="form-control-plaintext">
                  {{ selectedOfferDetails.aplica_para === 'todos' ? 'Todos' : selectedOfferDetails.aplica_para === 'compras_mayores' ? 'Compras Mayores' : 'Cantidades Mayores' }}
                </p>
              </div>
              <div class="col-lg-4 mb-3" v-if="selectedOfferDetails.aplica_para === 'compras_mayores'">
                <label class="form-label fw-bold">Monto Mínimo:</label>
                <p class="form-control-plaintext">L {{ parseFloat(selectedOfferDetails.monto_minimo || 0).toFixed(2) }}</p>
              </div>
              <div class="col-lg-4 mb-3" v-if="selectedOfferDetails.aplica_para === 'cantidades_mayores'">
                <label class="form-label fw-bold">Cantidad Mínima:</label>
                <p class="form-control-plaintext">{{ selectedOfferDetails.cantidad_minima }}</p>
              </div>
              <div class="col-lg-4 mb-3">
                <label class="form-label fw-bold">Suspendida:</label>
                <p class="form-control-plaintext">
                  <span :class="selectedOfferDetails.suspendida ? 'badge bg-warning' : 'badge bg-success'">
                    {{ selectedOfferDetails.suspendida ? 'SÍ' : 'NO' }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-dark" @click="showOfferDetailsModal = false">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Información del Producto -->
    <div v-if="showProductInfoModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title text-white">Información del Producto</h5>
            <button type="button" class="btn btn-danger btn-sm rounded-circle" @click="closeProductInfoModal" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
              <i class="ti ti-x" style="font-size: 1.2rem; color: white;"></i>
            </button>
          </div>
          <div class="modal-body" v-if="selectedProductInfo">
            <!-- Información Principal -->
            <div class="row mb-4">
              <!-- Imagen -->
              <div class="col-md-3">
                <img
                  :src="selectedProductInfo.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect width=%22300%22 height=%22300%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%23999%22%3ESIN IMAGEN%3C/text%3E%3C/svg%3E'"
                  :alt="selectedProductInfo.name"
                  class="img-fluid rounded border"
                  style="width: 100%; height: auto; object-fit: cover;"
                  @error="handleImageError"
                >
              </div>

              <!-- Datos del Producto -->
              <div class="col-md-9">
                <table class="table table-sm table-bordered">
                  <tbody>
                    <tr>
                      <th style="width: 30%;">Código</th>
                      <td>{{ selectedProductInfo.code }}</td>
                    </tr>
                    <tr>
                      <th>Nombre</th>
                      <td>{{ selectedProductInfo.name }}</td>
                    </tr>
                    <tr>
                      <th>Categoría/Subcategoría</th>
                      <td>
                        <span class="badge bg-warning text-dark">{{ selectedProductInfo.category_name || 'N/A' }}</span>
                        <span class="badge bg-info ms-2">{{ selectedProductInfo.subcategory_name || 'N/A' }}</span>
                      </td>
                    </tr>
                    <tr v-if="selectedProductInfo.description">
                      <th>Descripción</th>
                      <td>{{ selectedProductInfo.description }}</td>
                    </tr>
                    <tr v-if="selectedProductInfo.brand_name">
                      <th>Marca</th>
                      <td>{{ selectedProductInfo.brand_name }}</td>
                    </tr>
                    <tr v-if="selectedProductInfo.model">
                      <th>Modelo</th>
                      <td>{{ selectedProductInfo.model }}</td>
                    </tr>
                    <tr v-if="selectedProductInfo.weight">
                      <th>Peso</th>
                      <td>{{ selectedProductInfo.weight }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tabla de Precios -->
            <div class="mb-4">
              <h6 class="fw-bold mb-2">Lista de Precios</h6>
              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Nivel</th>
                    <th>% Utilidad</th>
                    <th>Bruto</th>
                    <th>Total Venta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="price in selectedProductInfo.prices" :key="price.type">
                    <td><strong>{{ price.label }}</strong></td>
                    <td>{{ price.utilidad }} %</td>
                    <td>L {{ formatCurrency(price.bruto) }}</td>
                    <td><strong>L {{ formatCurrency(price.total_venta) }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Tabla de Existencias por Bodega -->
            <div class="mb-4">
              <h6 class="fw-bold mb-2">Control de Existencias por Bodega</h6>
              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Bodega</th>
                    <th>Existencia Actual</th>
                    <th>Mínimo</th>
                    <th>Máximo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="stock in selectedProductInfo.stock" :key="stock.bodega">
                    <td><strong>{{ stock.bodega }}</strong></td>
                    <td><strong>{{ stock.existencia_actual }}</strong></td>
                    <td>{{ stock.minimo }}</td>
                    <td>{{ stock.maximo }}</td>
                  </tr>
                  <tr class="table-secondary fw-bold">
                    <td>TOTAL</td>
                    <td>{{ selectedProductInfo.total_existencias }}</td>
                    <td>{{ selectedProductInfo.total_minimo }}</td>
                    <td>{{ selectedProductInfo.total_maximo }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeProductInfoModal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Escáner de Código de Barras con Cámara -->
    <div v-if="showBarcodeScannerModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.8);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">
              <i class="ti ti-camera me-2"></i>Escanear Código de Barras
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeBarcodeScanner"></button>
          </div>
          <div class="modal-body text-center p-0">
            <div class="position-relative" style="background: #000;">
              <video ref="barcodeScannerVideo" style="width: 100%; max-height: 500px; display: block;"></video>
              <div v-if="scannerLoading" class="position-absolute top-50 start-50 translate-middle">
                <div class="spinner-border text-light" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="text-white mt-2">Iniciando cámara...</p>
              </div>
              <div v-if="scannerError" class="position-absolute top-50 start-50 translate-middle text-center">
                <i class="ti ti-camera-off fs-1 text-danger"></i>
                <p class="text-white mt-2">{{ scannerError }}</p>
              </div>
            </div>
            <div class="p-3 bg-light">
              <p class="mb-2">
                <i class="ti ti-info-circle me-1"></i>
                Apunte la cámara hacia el código de barras
              </p>
              <p class="text-muted small mb-0">El escáner detectará automáticamente el código</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeBarcodeScanner">
              <i class="ti ti-x me-1"></i>Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
</template>




<script>
import api from '@/api/config';
import axios from 'axios';
import Swal from 'sweetalert2';
import ProductModal from '@/components/pos/ProductModal.vue';
import InvoicePrint from '@/components/InvoicePrint.vue';
import { LOGO_BASE64 } from '@/assets/img/logo.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import AperturaCajaModal from './components/AperturaCajaModal.vue';
import EgresoCajaModal from './components/EgresoCajaModal.vue';
import RetiroEfectivoModal from './components/RetiroEfectivoModal.vue';

export default {
  name: 'POSInvoice',
  components: {
    ProductModal,
    InvoicePrint,
    AperturaCajaModal,
    EgresoCajaModal,
    RetiroEfectivoModal
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
        tax_percent: 15,
        product_id: null,
        category_id: null,
        subcategory_id: null,
        image: null
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
      showAperturaCajaModal: false,
      showEgresoCajaModal: false,
      showRetiroEfectivoModal: false,
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
      nextCustomerCode: '',
      savingCustomer: false,
      // Modales de pago
      showQuickPaymentModal: false,
      showDetailedPaymentModal: false,
      showPrintModal: false,
      showExportMenu: false,
      createdInvoiceData: null,
      // Selección de fila de producto para Delete
      selectedProductRow: -1,
      // Selección en modales de búsqueda
      selectedSearchIndex: 0,
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
      importDocumentType: '', // 'pending-invoice', 'quote', or 'online-order'
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
        type: null, // 'pending-invoice', 'quote', or 'online-order'
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
      showCouponDetailsModal: false,
      selectedCouponDetails: null,
      couponCode: '',
      appliedCoupons: [], // Cambiado a array para soportar múltiples cupones como en ecommerce
      availableCoupons: [],
      isValidatingCoupon: false,
      couponError: '',
      // Modal de Ofertas
      showOffersModal: false,
      showOfferDetailsModal: false,
      selectedOfferDetails: null,
      offersSearch: '',
      offersTypeFilter: '',
      offersStatusFilter: 'active',
      activeOffers: [], // Ofertas aplicadas automáticamente
      availableOffers: [],
      // Quote Preview Modal
      showQuotePreview: false,
      quotePreviewHTML: '',
      companyInfo: {},
      bankAccounts: [],
      lastQuoteNumber: null,
      lastQuoteConsecutive: null,
      showQuoteOptionsDropdown: false,
      // Resolución vencida
      showExpiredResolutionModal: false,
      resolutionExpired: false,
      resolutionInfo: null,
      // Modal de información del producto
      showProductInfoModal: false,
      selectedProductInfo: null,
      // Escáner de código de barras
      barcodeScannerActive: false,
      showBarcodeScannerModal: false,
      codeReader: null,
      videoStream: null,
      scannerLoading: false,
      scannerError: null,
      isProcessingBarcode: false,
      scannerStopped: false,
      currentScanSessionId: 0,
      // Modal de Exoneración ISV
      showTaxExemptionModal: false,
      selectedTaxesForExemption: [],
      // Modal de Atajos de Teclado
      showKeyboardShortcutsModal: false,
      recordingShortcut: null,
      keyboardShortcuts: {
        searchClients: { name: 'Búsqueda de Clientes', keys: 'Alt+F1', action: 'openCustomerSearch' },
        searchProducts: { name: 'Búsqueda de Productos', keys: 'Alt+F2', action: 'openProductSearch' },
        searchSeller: { name: 'Búsqueda de Vendedor', keys: 'Alt+F3', action: 'openSellerSearch' },
        saveTransaction: { name: 'Guardar Transacción', keys: 'Alt+F5', action: 'saveInvoice' },
        saveQuote: { name: 'Guardar Cotización', keys: 'Alt+F6', action: 'saveQuote' },
        savePending: { name: 'Guardar Op. en Espera', keys: 'Alt+F7', action: 'savePending' },
        deleteTransaction: { name: 'Eliminar Transacción', keys: 'Alt+F8', action: 'clearInvoice' },
        addProduct: { name: 'Adicionar Producto', keys: 'Alt+A', action: 'addProduct' },
        fastPayment: { name: 'Cobro Rápido', keys: 'Alt+F9', action: 'quickCheckout' },
        detailedPayment: { name: 'Cobro Detallado', keys: 'Alt+F10', action: 'openCheckout' },
        taxExemption: { name: 'Exoneración ISV', keys: 'Alt+F11', action: 'openTaxExemption' },
        applyCoupon: { name: 'Aplicar Cupón', keys: 'Alt+C', action: 'openCouponModal' },
        viewOffers: { name: 'Ver Ofertas', keys: 'Alt+O', action: 'openOffersModal' },
        changeDocument: { name: 'Cambiar Documento', keys: 'Alt+D', action: 'toggleDocumentType' },
        changeWarehouse: { name: 'Cambiar Bodega', keys: 'Alt+B', action: 'focusWarehouse' },
        editShipping: { name: 'Editar Recargos', keys: 'Alt+R', action: 'focusShippingCost' },
        importDocument: { name: 'Importar Documento', keys: 'Alt+I', action: 'toggleImportDropdown' },
        additionalOptions: { name: 'Opciones Adicionales', keys: 'Alt+P', action: 'toggleAdditionalOptions' },
        additionalFields: { name: 'Campos Adicionales', keys: 'Alt+M', action: 'toggleAdditionalFields' }
      },
      // Registro Rápido de Producto
      newProductForm: {
        code: '',
        name: '',
        unit_id: '',
        category_id: '',
        subcategory_id: '',
        tax_id: '',
        cost: 0,
        profit_margin: 0,
        price: 0,
        image: null
      },
      newProductSubcategories: [],
      savingNewProduct: false,
      newProductError: null,
      newProductSuccess: null,
      categories: [],
      units: [],
      taxRates: []
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
          (o.codigo || '').toLowerCase().includes(search) ||
          (o.nombre || '').toLowerCase().includes(search)
        );
      }

      // Filtrar por tipo
      if (this.offersTypeFilter) {
        filtered = filtered.filter(o => o.tipo_descuento === this.offersTypeFilter);
      }

      // Filtrar por estado
      if (this.offersStatusFilter === 'active') {
        const now = new Date();
        filtered = filtered.filter(o => {
          if (!o.is_active) return false;
          if (!o.limitar_fecha || !o.fecha_hasta) return true; // Si no tiene límite de fecha, está activa
          const validUntil = new Date(o.fecha_hasta);
          return validUntil >= now;
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
      const taxRate = this.invoice.tax_rate !== undefined && this.invoice.tax_rate !== null ? this.invoice.tax_rate : 15;
      return this.subtotal * (taxRate / 100);
    },
    totalWithTax() {
      // Calcular total con tax y descuentos de cupones y ofertas
      const couponsDiscount = this.totalCouponsDiscount;
      const offersDiscount = this.totalOffersDiscount;
      return this.subtotal + this.taxAmount - couponsDiscount - offersDiscount;
    },
    // Descuentos de cupones
    totalCouponsDiscount() {
      return this.appliedCoupons.reduce((sum, coupon) => sum + (coupon.discount_amount || 0), 0);
    },
    // Descuentos de ofertas
    totalOffersDiscount() {
      return this.activeOffers.reduce((sum, offer) => sum + (offer.discount_amount || 0), 0);
    },
    totals() {
      let itemCount = 0;
      let gross = 0;
      let subtotal = 0;

      this.invoice.items.forEach(item => {
        itemCount += item.quantity;
        const itemGross = item.price * item.quantity;
        const itemDiscount = itemGross * (item.discount_percent / 100);
        const itemSubtotal = itemGross - itemDiscount;

        gross += itemGross;
        subtotal += itemSubtotal;
      });

      // Aplicar descuentos de cupones y ofertas ANTES del impuesto
      const couponsDiscount = this.totalCouponsDiscount;
      const offersDiscount = this.totalOffersDiscount;
      const subtotalAfterDiscounts = subtotal - couponsDiscount - offersDiscount;

      // Calcular impuesto sobre el subtotal después de descuentos
      // Si tax_rate es undefined o null, usar 15, pero si es 0 (exonerado), respetar el 0
      const taxRate = this.invoice.tax_rate !== undefined && this.invoice.tax_rate !== null ? this.invoice.tax_rate : 15;
      const tax = subtotalAfterDiscounts * (taxRate / 100);

      const shipping = parseFloat(this.invoice.shipping_cost) || 0;
      const total = subtotalAfterDiscounts + tax + shipping;

      return { itemCount, gross, subtotal, tax, total };
    },
    // Opciones disponibles para atajos de teclado
    availableShortcutOptions() {
      const options = [];
      // Teclas de función con modificadores
      const modifiers = ['Alt+', 'Ctrl+', 'Shift+', 'Alt+Shift+', 'Ctrl+Shift+', 'Ctrl+Alt+'];
      const fKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];

      modifiers.forEach(mod => {
        fKeys.forEach(fKey => {
          options.push(mod + fKey);
        });
      });

      // También agregar algunas combinaciones con números
      const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
      ['Alt+', 'Ctrl+', 'Alt+Shift+', 'Ctrl+Shift+'].forEach(mod => {
        numbers.forEach(num => {
          options.push(mod + num);
        });
      });

      return options;
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
    },
    // Impuestos disponibles para exoneración
    availableTaxes() {
      const taxes = [];

      // ISV 15%
      taxes.push({
        code: '001',
        name: 'I.S.V 15',
        rate: 15.00
      });

      // ISV 18%
      taxes.push({
        code: '002',
        name: 'I.S.V 18',
        rate: 18.00
      });

      // Exento
      taxes.push({
        code: '003',
        name: 'EXENTO',
        rate: 0.00
      });

      return taxes;
    }
  },
  watch: {
    // Observar cambios en los items para actualizar ofertas y revalidar cupones
    'invoice.items': {
      async handler(newItems, oldItems) {
        // Recargar ofertas activas cuando cambian los items
        this.loadActiveOffers();

        // Revalidar cupones aplicados cuando cambian los items
        if (this.appliedCoupons.length > 0 && newItems.length > 0) {
          await this.revalidateCoupons();
        } else if (newItems.length === 0) {
          // Si no hay items, limpiar cupones
          this.appliedCoupons = [];
          this.couponError = '';
        }
      },
      deep: true
    }
  },
  mounted() {
    this.loadInitialData();
    this.focusProductInput();
    this.loadKeyboardShortcuts();
    // Event listener para cerrar dropdown al hacer click fuera
    document.addEventListener('click', this.handleClickOutside);
    // Event listener para atajos de teclado
    document.addEventListener('keydown', this.handleGlobalKeydown);
  },
  beforeUnmount() {
    // Remover event listener al destruir el componente
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleGlobalKeydown);

    // Detener el escáner de código de barras si está activo
    if (this.videoStream) {
      const tracks = this.videoStream.getTracks();
      tracks.forEach(track => track.stop());
      this.videoStream = null;
    }
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
        this.loadActiveOffers(), // Cargar ofertas activas inicialmente
        this.loadResolutionCurrent(),
        this.loadCompanyInfo(),
        this.loadBankAccounts(),
        this.loadCategories(),
        this.loadUnits(),
        this.loadTaxRates()
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
        console.log('🔍 Cargando resolución activa...');
        const response = await api.get('/resolutions/active', {
          params: { store_id: 1 }
        });

        console.log('📡 Respuesta del servidor:', response.data);

        if (response.data?.success && response.data.data) {
          const activeResolution = response.data.data;

          // Guardar información completa de la resolución
          this.resolutionInfo = activeResolution;

          // Verificar si la resolución está vencida
          if (activeResolution.is_expired) {
            this.resolutionExpired = true;
            console.warn('⚠️ Resolución vencida detectada, mostrando modal...');
            console.log('Estado antes de mostrar modal:', {
              resolutionExpired: this.resolutionExpired,
              showExpiredResolutionModal: this.showExpiredResolutionModal
            });

            // Usar nextTick para asegurar que Vue actualice el DOM
            this.$nextTick(() => {
              this.showExpiredResolutionModal = true;
              console.log('✅ Modal activado:', this.showExpiredResolutionModal);
            });

            console.warn('⚠️ Resolución vencida:', {
              numero_resolucion: activeResolution.numero_resolucion,
              fecha_fin: activeResolution.fecha_fin
            });
            return;
          }

          // Actualizar toda la información de la resolución
          this.resolution.id = activeResolution.id;
          this.resolution.cai = activeResolution.numero_resolucion || this.resolution.cai;
          this.resolution.prefix = (activeResolution.prefijo_control || '') +
                                   (activeResolution.sufijo_control || '');
          this.resolution.rangoInicio = activeResolution.nro_inicial_control;
          this.resolution.rangoFin = activeResolution.nro_final_control;
          this.resolution.fechaFin = activeResolution.fecha_fin;
          this.resolution.fecha_fin = activeResolution.fecha_fin;

          // Sincronizar el consecutivo de factura con la resolución activa
          if (activeResolution.nro_actual_control) {
            this.consecutives.invoice = activeResolution.nro_actual_control;
            this.resolution.current = activeResolution.nro_actual_control;
            console.log('📄 Resolución activa cargada:', {
              id: this.resolution.id,
              current: this.resolution.current,
              prefix: this.resolution.prefix,
              cai: this.resolution.cai,
              dias_hasta_vencimiento: activeResolution.days_until_expiration
            });
          }
        }
      } catch (error) {
        console.error('❌ Error loading active resolution:', error);
        console.log('Error status:', error.response?.status);
        console.log('Error message:', error.response?.data?.message);

        // Si no hay resolución activa disponible (404 o cualquier error)
        if (error.response?.status === 404 || error.response?.data?.message?.includes('No hay resolución')) {
          console.warn('⚠️ No hay resolución activa, mostrando modal...');
          this.resolutionExpired = true;

          // Usar nextTick para asegurar que Vue actualice el DOM
          this.$nextTick(() => {
            this.showExpiredResolutionModal = true;
            console.log('✅ Modal activado por falta de resolución:', this.showExpiredResolutionModal);
          });
        }
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
        // Usar el endpoint de búsqueda que incluye stock calculado
        const response = await api.get('/products/search/all', {
          params: {
            status: 'active'
          }
        });

        console.log('Products full response:', response);
        console.log('Products response.data:', response.data);

        let productsData = [];

        // Estructura: { success: true, data: [...] }
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
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
            stock: parseFloat(p.stock) || 0,
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
          console.log('First product with stock:', this.products.find(p => p.stock > 0));
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
        // Validar que la resolución no esté vencida antes de facturar
        if (this.documentType === 'FACTURA' && this.resolutionExpired) {
          this.showQuickPaymentModal = false;
          this.showExpiredResolutionModal = true;
          return;
        }

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
          coupons_discount: this.totalCouponsDiscount,
          offers_discount: this.totalOffersDiscount,
          applied_coupons: this.appliedCoupons.map(c => ({ code: c.code, name: c.name, amount: c.discount_amount })),
          applied_offers: this.activeOffers.map(o => ({ id: o.id, name: o.name, amount: o.discount_amount })),
          shipping_cost: this.invoice.shipping_cost || 0,
          total: this.totals.total,
          status: 'issued',
          payment_status: 'paid',
          payment_method: this.quickPayment.method,
          send_to_dispatch: this.quickPayment.sendToDispatch,
          // Campos adicionales (encabezado)
          orden_compra: this.additionalFields.orden_compra || null,
          constancia_exonerado: this.additionalFields.constancia_exonerado || null,
          registro_sag: this.additionalFields.registro_sag || null
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
          coupons_discount: this.totalCouponsDiscount,
          offers_discount: this.totalOffersDiscount,
          applied_coupons: this.appliedCoupons,
          applied_offers: this.activeOffers,
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
          prefijo_control: this.resolution.prefix,
          nro_inicial_control: this.resolution.rangoInicio || 30001,
          nro_final_control: this.resolution.rangoFin || 40000,
          fecha_fin: '2026-12-28',
          // Campos adicionales
          orden_compra: this.additionalFields.orden_compra || null,
          constancia_exonerado: this.additionalFields.constancia_exonerado || null,
          registro_sag: this.additionalFields.registro_sag || null
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
        // Validar que la resolución no esté vencida antes de facturar
        if (this.documentType === 'FACTURA' && this.resolutionExpired) {
          this.showDetailedPaymentModal = false;
          this.showExpiredResolutionModal = true;
          return;
        }

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
          coupons_discount: this.totalCouponsDiscount,
          offers_discount: this.totalOffersDiscount,
          applied_coupons: this.appliedCoupons.map(c => ({ code: c.code, name: c.name, amount: c.discount_amount })),
          applied_offers: this.activeOffers.map(o => ({ id: o.id, name: o.name, amount: o.discount_amount })),
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
          coupons_discount: this.totalCouponsDiscount,
          offers_discount: this.totalOffersDiscount,
          applied_coupons: this.appliedCoupons,
          applied_offers: this.activeOffers,
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
          prefijo_control: this.resolution.prefix,
          nro_inicial_control: this.resolution.rangoInicio || 30001,
          nro_final_control: this.resolution.rangoFin || 40000,
          fecha_fin: '2026-12-28',
          // Campos adicionales
          orden_compra: this.additionalFields.orden_compra || null,
          constancia_exonerado: this.additionalFields.constancia_exonerado || null,
          registro_sag: this.additionalFields.registro_sag || null
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

      // Agregar descuentos de cupones y ofertas
      const couponsDiscount = this.totalCouponsDiscount;
      const offersDiscount = this.totalOffersDiscount;
      totalDiscount += couponsDiscount + offersDiscount;

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
                  ${this.additionalFields.orden_compra ? `<strong>No. Correlativo de la Orden de Compra Exenta:</strong> ${this.additionalFields.orden_compra}<br>` : ''}
                  ${this.additionalFields.constancia_exonerado ? `<strong>No. Correlativo de la Constancia del Reg Exonerado:</strong> ${this.additionalFields.constancia_exonerado}<br>` : ''}
                  ${this.additionalFields.registro_sag ? `<strong>No. Identificativo del Registro SAG:</strong> ${this.additionalFields.registro_sag}` : ''}
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
          terms_conditions: '',
          // Campos adicionales (encabezado)
          orden_compra: this.additionalFields.orden_compra || null,
          constancia_exonerado: this.additionalFields.constancia_exonerado || null,
          registro_sag: this.additionalFields.registro_sag || null
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
          expires_at: null,
          // Campos adicionales (encabezado)
          orden_compra: this.additionalFields.orden_compra || null,
          constancia_exonerado: this.additionalFields.constancia_exonerado || null,
          registro_sag: this.additionalFields.registro_sag || null
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
        // Validar que la resolución no esté vencida antes de facturar
        if (this.documentType === 'FACTURA' && this.resolutionExpired) {
          this.showExpiredResolutionModal = true;
          return;
        }

        const invoiceData = {
          invoice_number: this.invoiceNumber,
          invoice_type: this.documentType,
          customer_id: this.customerInfo.id,
          customer_name: this.customerInfo.name,
          customer_rtn: this.customerInfo.rtn,
          issue_date: new Date().toISOString().split('T')[0],
          warehouse_id: this.invoice.warehouse_id,
          seller_id: this.currentVendor.id,
          seller_name: this.currentVendor.name,
          payment_status: status,
          paid_amount: status === 'paid' ? this.totals.total : 0,
          shipping_cost: this.invoice.shipping_cost || 0,
          // Campos adicionales (encabezado)
          orden_compra: this.additionalFields.orden_compra || null,
          constancia_exonerado: this.additionalFields.constancia_exonerado || null,
          registro_sag: this.additionalFields.registro_sag || null
        };

        const requestData = {
          invoice_data: invoiceData,
          items: this.invoice.items
        };

        await api.post('/billing/invoices', requestData);

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

      // Limpiar cupones y ofertas aplicados
      this.appliedCoupons = [];
      this.activeOffers = [];
      this.couponCode = '';
      this.couponError = '';

      // Limpiar campos adicionales
      this.additionalFields = {
        orden_compra: '',
        constancia_exonerado: '',
        registro_sag: ''
      };

      this.currentProduct = {
        code: '',
        name: '',
        quantity: 1,
        price: 0,
        discount_percent: 0,
        tax_percent: 15,
        product_id: null,
        category_id: null,
        subcategory_id: null
      };
    },
    focusProductInput() {
      this.$nextTick(() => {
        if (this.$refs.productCodeInput) {
          this.$refs.productCodeInput.focus();
        }
      });
    },
    toggleBarcodeScanner() {
      // DESTRUIR completamente el escáner anterior si existe
      if (this.codeReader) {
        this.codeReader = null;
      }

      // Detener cualquier stream activo
      if (this.videoStream) {
        const tracks = this.videoStream.getTracks();
        tracks.forEach(track => track.stop());
        this.videoStream = null;
      }

      // Incrementar el ID de sesión para invalidar callbacks anteriores
      this.currentScanSessionId++;

      // Resetear todas las banderas
      this.isProcessingBarcode = false;
      this.scannerStopped = false;

      // Abrir el modal de la cámara para escanear
      this.showBarcodeScannerModal = true;
      this.startBarcodeScanner();
    },

    async startBarcodeScanner() {
      this.scannerLoading = true;
      this.scannerError = null;

      try {
        // Inicializar el lector de códigos de barras
        this.codeReader = new BrowserMultiFormatReader();

        // Esperar a que el modal se renderice
        await this.$nextTick();

        // Obtener el elemento de video
        const videoElement = this.$refs.barcodeScannerVideo;

        if (!videoElement) {
          throw new Error('No se pudo encontrar el elemento de video');
        }

        // Obtener dispositivos de video disponibles usando la API de medios
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length === 0) {
          throw new Error('No se encontraron cámaras disponibles');
        }

        // Usar la cámara trasera si está disponible (para móviles)
        let selectedDeviceId = videoDevices[0].deviceId;
        const backCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('trasera') ||
          device.label.toLowerCase().includes('environment')
        );

        if (backCamera) {
          selectedDeviceId = backCamera.deviceId;
        }

        this.scannerLoading = false;

        // Guardar el ID de sesión actual para este escaneo
        const sessionId = this.currentScanSessionId;

        // Iniciar el escaneo continuo y guardar referencia al stream
        const controls = await this.codeReader.decodeFromVideoDevice(selectedDeviceId, videoElement, (result, error) => {
          // IGNORAR si este callback es de una sesión anterior
          if (sessionId !== this.currentScanSessionId) {
            return;
          }

          // DETENER INMEDIATAMENTE si ya procesamos un código o si se detuvo el escáner
          if (this.scannerStopped || this.isProcessingBarcode) {
            return;
          }

          if (result) {
            // MARCAR AMBAS BANDERAS INMEDIATAMENTE
            this.scannerStopped = true;
            this.isProcessingBarcode = true;

            // Código detectado exitosamente
            const barcode = result.getText();

            // Detener el stream INMEDIATAMENTE - método 1
            if (videoElement.srcObject) {
              const stream = videoElement.srcObject;
              const tracks = stream.getTracks();
              tracks.forEach(track => track.stop());
              videoElement.srcObject = null;
            }

            // Detener el stream INMEDIATAMENTE - método 2
            if (this.videoStream) {
              const tracks = this.videoStream.getTracks();
              tracks.forEach(track => track.stop());
              this.videoStream = null;
            }

            // Usar setTimeout para asegurar que el callback no se ejecute más
            setTimeout(() => {
              this.onBarcodeDetected(barcode);
            }, 100);
          }

          if (error && !(error instanceof NotFoundException)) {
            // Silenciar errores si ya estamos detenidos
            if (!this.scannerStopped) {
              console.error('Error al escanear:', error);
            }
          }
        });

        // Guardar el stream de video para poder detenerlo después
        if (videoElement.srcObject) {
          this.videoStream = videoElement.srcObject;
        }

      } catch (error) {
        console.error('Error al iniciar el escáner:', error);
        this.scannerLoading = false;

        if (error.name === 'NotAllowedError') {
          this.scannerError = 'Permiso de cámara denegado. Por favor, permita el acceso a la cámara.';
        } else if (error.name === 'NotFoundError') {
          this.scannerError = 'No se encontró ninguna cámara en este dispositivo.';
        } else {
          this.scannerError = error.message || 'Error al iniciar la cámara';
        }
      }
    },

    onBarcodeDetected(barcode) {
      // Cerrar el modal del escáner
      this.closeBarcodeScanner();

      // Reproducir un sonido de éxito
      const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE9SJ7Z8rdlGAc6j9fy0IEqBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXyz30pBSh8yvLajT4JHGi95+mgUBEMUanj8bVlGghAndfyvmMYCCqM1PLNfC4GKX/M8N+VRAwa');
      beep.play().catch(() => {});

      // Simplemente poner el código en el campo de código de producto
      this.currentProduct.code = barcode;

      // Buscar y seleccionar el producto automáticamente
      this.searchProductByCode();
    },

    closeBarcodeScanner() {
      // Marcar que el escáner está detenido
      this.scannerStopped = true;

      // Detener el stream de video
      if (this.videoStream) {
        const tracks = this.videoStream.getTracks();
        tracks.forEach(track => track.stop());
        this.videoStream = null;
      }

      // Detener el elemento de video
      const videoElement = this.$refs.barcodeScannerVideo;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
      }

      // Limpiar el lector
      this.codeReader = null;

      // Cerrar el modal
      this.showBarcodeScannerModal = false;
      this.scannerLoading = false;
      this.scannerError = null;
    },

    // Métodos para el Registro Rápido de Producto
    async loadNewProductSubcategories() {
      if (!this.newProductForm.category_id) {
        this.newProductSubcategories = [];
        this.newProductForm.subcategory_id = '';
        return;
      }

      try {
        const response = await api.get(`/categories/${this.newProductForm.category_id}/subcategories`);
        if (response.data.success) {
          this.newProductSubcategories = response.data.data;
        }
      } catch (error) {
        console.error('Error cargando subcategorías:', error);
        this.newProductSubcategories = [];
      }
    },

    calculatePriceFromProfit() {
      const cost = parseFloat(this.newProductForm.cost) || 0;
      const profitMargin = parseFloat(this.newProductForm.profit_margin) || 0;

      if (cost > 0 && profitMargin > 0) {
        const price = cost * (1 + profitMargin / 100);
        this.newProductForm.price = parseFloat(price.toFixed(2));
      }
    },

    calculateProfitFromPrice() {
      const cost = parseFloat(this.newProductForm.cost) || 0;
      const price = parseFloat(this.newProductForm.price) || 0;

      if (cost > 0 && price > cost) {
        const profitMargin = ((price - cost) / cost) * 100;
        this.newProductForm.profit_margin = parseFloat(profitMargin.toFixed(2));
      }
    },

    handleNewProductImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.newProductError = 'La imagen no puede superar los 5MB';
          event.target.value = '';
          return;
        }

        // Validar tipo
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          this.newProductError = 'Solo se permiten imágenes JPG, PNG o GIF';
          event.target.value = '';
          return;
        }

        this.newProductForm.image = file;
        this.newProductError = null;
      }
    },

    async saveNewProduct() {
      this.savingNewProduct = true;
      this.newProductError = null;
      this.newProductSuccess = null;

      try {
        // Validar campos requeridos
        if (!this.newProductForm.code || !this.newProductForm.name || !this.newProductForm.unit_id ||
            !this.newProductForm.category_id || !this.newProductForm.tax_id || !this.newProductForm.price) {
          this.newProductError = 'Por favor complete todos los campos obligatorios';
          this.savingNewProduct = false;
          return;
        }

        // Preparar datos del producto (usando objeto en lugar de FormData)
        const productData = {
          code: this.newProductForm.code,
          name: this.newProductForm.name,
          short_name: this.newProductForm.name, // Usar el mismo nombre si no hay nombre corto
          unit_id: parseInt(this.newProductForm.unit_id),
          category_id: parseInt(this.newProductForm.category_id),
          subcategory_id: this.newProductForm.subcategory_id ? parseInt(this.newProductForm.subcategory_id) : null,
          tax_id: parseInt(this.newProductForm.tax_id),
          cost: parseFloat(this.newProductForm.cost) || 0,
          price_1: parseFloat(this.newProductForm.price),
          price_2: 0,
          price_3: 0,
          price_4: 0,
          price_5: 0,
          price_6: 0,
          is_active: 1,
          brand_id: null,
          supplier_id: null,
          description: null,
          weight: null,
          show_in_online_store: 0,
          is_featured: 0,
          image_url: null,
          color: null,
          acabado: null,
          estilo: null
        };

        // Si hay imagen, subirla primero
        if (this.newProductForm.image) {
          // Por ahora, si hay imagen, la omitimos o manejamos después de crear el producto
          // porque el createProduct no maneja upload de archivo directamente
          console.log('Imagen seleccionada, se agregará después de crear el producto');
        }

        // Enviar a la API
        const response = await api.post('/products', productData);

        if (response.data.success) {
          this.newProductSuccess = 'Producto creado exitosamente';

          // Recargar productos
          await this.loadProducts();

          // Cerrar modal después de 1.5 segundos
          setTimeout(() => {
            this.closeNewProductModal();

            // Si el código coincide, seleccionarlo automáticamente
            if (this.currentProduct.code === this.newProductForm.code) {
              this.searchProductByCode();
            }
          }, 1500);
        }
      } catch (error) {
        console.error('Error creando producto:', error);
        this.newProductError = error.response?.data?.message || 'Error al crear el producto';
      } finally {
        this.savingNewProduct = false;
      }
    },

    closeNewProductModal() {
      this.showNewProductModal = false;
      this.newProductForm = {
        code: '',
        name: '',
        unit_id: '',
        category_id: '',
        subcategory_id: '',
        tax_id: '',
        cost: 0,
        profit_margin: 0,
        price: 0,
        image: null
      };
      this.newProductSubcategories = [];
      this.newProductError = null;
      this.newProductSuccess = null;
      this.savingNewProduct = false;
    },

    // Cargar datos para el modal de registro rápido
    async loadCategories() {
      try {
        const response = await api.get('/categories/active');
        if (response.data.success) {
          this.categories = response.data.data;
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    },

    async loadUnits() {
      try {
        const response = await api.get('/units');
        if (response.data.success) {
          this.units = response.data.data;
        }
      } catch (error) {
        console.error('Error cargando unidades:', error);
      }
    },

    async loadTaxRates() {
      try {
        const response = await api.get('/tax-rates');
        if (response.data.success) {
          this.taxRates = response.data.data;
        }
      } catch (error) {
        console.error('Error cargando tasas de impuesto:', error);
      }
    },
    handleImageError(event) {
      // Prevenir bucle infinito: solo intentar una vez
      if (event.target.dataset.errorHandled) {
        return;
      }
      event.target.dataset.errorHandled = 'true';
      // Establecer imagen por defecto SVG inline
      event.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22%3E%3Crect width=%2250%22 height=%2250%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%228%22 fill=%22%23999%22%3ESIN IMAGEN%3C/text%3E%3C/svg%3E';
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
    async openAddCustomerModal() {
      // Cerrar modal de búsqueda de clientes
      this.showCustomerModal = false;

      // Cargar el siguiente código de cliente disponible
      await this.loadNextCustomerCode();

      // Abrir modal de registro rápido
      this.showAddCustomerModal = true;

      // Enfocar el campo de nombre
      this.$nextTick(() => {
        if (this.$refs.customerNameInput) {
          this.$refs.customerNameInput.focus();
        }
      });
    },

    async loadNextCustomerCode() {
      try {
        // Obtener el último cliente creado para generar el siguiente código
        const response = await api.get('/customers', {
          params: {
            limit: 1,
            sort_by: 'id',
            sort_order: 'DESC'
          }
        });

        if (response.data.success && response.data.data.length > 0) {
          const lastCustomer = response.data.data[0];
          const lastCode = lastCustomer.customer_code || '0';

          // Extraer solo números del código
          const match = lastCode.match(/(\d+)/);
          if (match) {
            const nextNumber = parseInt(match[1]) + 1;
            // Asegurar que sea mínimo 4193
            this.nextCustomerCode = String(Math.max(nextNumber, 4193));
          } else {
            this.nextCustomerCode = '4193';
          }
        } else {
          // Si no hay clientes, empezar desde 4193
          this.nextCustomerCode = '4193';
        }
      } catch (error) {
        console.error('Error cargando siguiente código de cliente:', error);
        this.nextCustomerCode = '4193';
      }
    },

    closeAddCustomerModal() {
      this.showAddCustomerModal = false;
      this.showCustomerModal = true;
      this.savingCustomer = false;
      this.nextCustomerCode = '';
      this.newCustomer = {
        code: '',
        razon_social: '',
        nombre_comercial: '',
        beneficiary_type: 'JURIDICA_DOMICILIADA',
        tipo_identificacion: 'RTN',
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
      // Validar campos requeridos
      if (!this.newCustomer.razon_social || !this.newCustomer.cedula) {
        Swal.fire('Error', 'Por favor complete los campos obligatorios (Nombre y RTN)', 'error');
        return;
      }

      // Remover guiones del RTN antes de guardar (guardar solo números)
      const rtnSoloNumeros = this.newCustomer.cedula.replace(/\D/g, '');

      // Validar que tenga 14 dígitos
      if (rtnSoloNumeros.length !== 14) {
        Swal.fire('Error', 'El RTN debe tener 14 dígitos', 'error');
        return;
      }

      this.savingCustomer = true;

      try {
        const customerData = {
          codigo: this.nextCustomerCode,
          nombre: this.newCustomer.razon_social,
          nombre_comercial: this.newCustomer.razon_social, // Usar el mismo nombre
          doc_identificacion: rtnSoloNumeros, // Guardar solo números sin guiones
          tipo_beneficiario: '1', // Por defecto
          codigo_tipo_precio: null,
          fecha_inicio: null,
          telefono: null,
          email: null,
          direccion: null,
          descuento_prc: 0,
          persona_contacto: null,
          is_active: true
        };

        const response = await api.post('/customers', customerData);
        Swal.fire('Éxito', 'Cliente creado exitosamente', 'success');

        // Recargar lista de clientes
        await this.loadCustomers();

        // Seleccionar el nuevo cliente automáticamente
        const newCustomer = this.customers.find(c => c.value === response.data.data.id);
        if (newCustomer) {
          this.selectCustomer(newCustomer);
        }

        this.closeAddCustomerModal();
      } catch (error) {
        console.error('Error guardando cliente:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al guardar cliente', 'error');
      } finally {
        this.savingCustomer = false;
      }
    },

    formatRTN(event) {
      let value = event.target.value;

      // Remover todo lo que no sea número
      value = value.replace(/\D/g, '');

      // Limitar a 14 dígitos
      value = value.substring(0, 14);

      // Aplicar formato: 0000-0000-000000
      if (value.length > 8) {
        value = value.substring(0, 4) + '-' + value.substring(4, 8) + '-' + value.substring(8);
      } else if (value.length > 4) {
        value = value.substring(0, 4) + '-' + value.substring(4);
      }

      // Actualizar el valor
      this.newCustomer.cedula = value;
    },

    selectProduct(product) {
      // Solo llenar el formulario, NO agregar automáticamente
      this.currentProduct.code = product.sku;
      this.currentProduct.name = product.name;
      this.currentProduct.price = product.sale_price || 0;
      this.currentProduct.product_id = product.id;
      this.currentProduct.category_id = product.category_id;
      this.currentProduct.subcategory_id = product.subcategory_id;
      this.currentProduct.image = product.image;
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

    searchProductByCode() {
      const code = this.currentProduct.code.trim();

      if (!code) {
        return;
      }

      // Buscar el producto por código (sku) o código de barras
      const product = this.products.find(p =>
        p.sku === code || p.barcode === code
      );

      if (product) {
        // Producto encontrado, seleccionarlo
        this.selectProduct(product);
      } else {
        // Producto no encontrado
        Swal.fire({
          icon: 'warning',
          title: 'Producto No Encontrado',
          text: `No se encontró ningún producto con el código: ${code}`,
          confirmButtonText: 'OK'
        });

        // Limpiar el código
        this.currentProduct.code = '';
      }
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
        total: itemTotal,
        category_id: this.currentProduct.category_id,
        subcategory_id: this.currentProduct.subcategory_id,
        image: this.currentProduct.image
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
        product_id: null,
        category_id: null,
        subcategory_id: null,
        image: null
      };

      // Quitar el foco del input para que los atajos de teclado funcionen
      if (document.activeElement) {
        document.activeElement.blur();
      }

      console.log('✅ Product added. Total items:', this.invoice.items.length);
    },
    addProductAndBlur() {
      this.addProduct();
      // Asegurarse de quitar el foco
      if (document.activeElement) {
        document.activeElement.blur();
      }
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
        product_id: item.product_id,
        category_id: item.category_id,
        subcategory_id: item.subcategory_id
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
    onWarehouseChange(index) {
      // El cambio de bodega se guarda automáticamente en el v-model
      // Aquí podemos agregar lógica adicional si es necesaria, como verificar stock
      console.log('Bodega cambiada para item', index, 'a', this.invoice.items[index].warehouse_id);
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
      this.showTaxExemptionModal = false;
      this.showAperturaCajaModal = false;
      this.showEgresoCajaModal = false;
      this.showRetiroEfectivoModal = false;
    },
    handleCashRegisterSuccess(data) {
      // Callback cuando se completa una operación de caja exitosamente
      console.log('Operación de caja completada:', data);
      // Aquí puedes agregar lógica adicional si es necesaria
      // Por ejemplo, actualizar algún contador o notificación
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
        prefijo_control: '000-002-01-',
        nro_inicial_control: 40001,
        nro_final_control: 50000,
        fecha_fin: '2026-12-28'
      };

      try {
        const response = await api.get('/resolutions/active');
        if (response.data && response.data.data) {
          resolutionData = response.data.data;
          // FORZAR fecha_fin a string correcto
          if (resolutionData.fecha_fin) {
            const str = String(resolutionData.fecha_fin);
            const match = str.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
              resolutionData.fecha_fin = `${match[1]}-${match[2]}-${match[3]}`;
            }
          }
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
        const unitText = item.product_unit || item.unit || 'UNIDAD';
        tableRows += `
          <tr>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(qty)}</td>
            <td style="padding: 3px; font-size: 13px; line-height: 1.3;">${item.product_name || item.name} <span style="font-weight: 600;">${unitText}</span></td>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(price)}</td>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(itemTotal)}</td>
          </tr>
        `;
      });

      let discount = parseFloat(this.createdInvoiceData.discount || 0);
      // Agregar descuentos de cupones y ofertas
      const couponsDiscount = this.createdInvoiceData.coupons_discount || 0;
      const offersDiscount = this.createdInvoiceData.offers_discount || 0;
      discount += couponsDiscount + offersDiscount;

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
                <tr><td class="total-label">DESCUENTOS Y REBAJAS OTORGADOS:</td><td class="total-value">L ${this.formatCurrency(discount)}</td></tr>
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
              <strong>Desde:</strong> ${resolutionData.prefijo_control}${String(resolutionData.nro_inicial_control).padStart(8, '0')}<br>
              <strong>Hasta:</strong> ${resolutionData.prefijo_control}${String(resolutionData.nro_final_control).padStart(8, '0')}<br>
              <strong>Fecha Limite de Emisión Vigente:</strong> ${(() => {
                const fecha = new Date(resolutionData.fecha_fin);
                fecha.setDate(fecha.getDate() + 1);
                return this.formatDate(fecha.toISOString().split('T')[0]);
              })()}<br>
              <strong>No. Correlativo de la Orden de Compra<br>Exenta:</strong> ${this.createdInvoiceData.orden_compra || ''}<br>
              <strong>No. Correlativo de la Constancia del Reg<br>Exonerado:</strong> ${this.createdInvoiceData.constancia_exonerado || ''}<br>
              <strong>No. Identificativo del Registro SAG:</strong> ${this.createdInvoiceData.registro_sag || ''}<br>
              ${this.formatDateTime(new Date())}
            </div>
            <div class="footer-note">
              <strong>Entrega:</strong> ${this.formatTodayDate()}<br>
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
    // Calcular el monto de impuesto para una tasa específica
    calculateTaxAmount(rate) {
      const subtotal = this.totals.subtotal || 0;
      return (subtotal * rate) / 100;
    },
    // Aplicar exoneración de impuestos seleccionados
    openTaxExemptionModal() {
      // Cerrar el modal de opciones adicionales
      this.showAdditionalOptions = false;

      // Si el impuesto está actualmente exonerado, pre-seleccionar el impuesto original
      if (this.invoice.is_tax_exempt === true && this.invoice.tax_rate === 0 && this.invoice.original_tax_rate !== undefined) {
        // Encontrar el código del impuesto que corresponde a la tasa original
        const originalTax = this.availableTaxes.find(t => t.rate === this.invoice.original_tax_rate);
        if (originalTax) {
          this.selectedTaxesForExemption = [originalTax.code];
        }
      } else {
        // Si no hay exoneración activa, limpiar la selección
        this.selectedTaxesForExemption = [];
      }

      // Abrir el modal
      this.showTaxExemptionModal = true;
    },
    applyTaxExemption() {
      // Si no hay selección y hay una exoneración activa, restaurar el impuesto original
      if (this.selectedTaxesForExemption.length === 0 && this.invoice.is_tax_exempt === true) {
        // Restaurar impuesto original
        if (this.invoice.original_tax_rate !== undefined) {
          this.invoice.tax_rate = this.invoice.original_tax_rate;
          this.invoice.is_tax_exempt = false;
          delete this.invoice.original_tax_rate;

          Swal.fire({
            icon: 'success',
            title: 'Exoneración Removida',
            text: 'Se ha restaurado el impuesto original',
            timer: 2000,
            showConfirmButton: false
          });
        }

        this.showTaxExemptionModal = false;
        return;
      }

      if (this.selectedTaxesForExemption.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'Debe seleccionar al menos un impuesto para exonerar'
        });
        return;
      }

      // Verificar si alguno de los impuestos seleccionados coincide con el actual
      const currentTaxRate = this.invoice.tax_rate !== undefined && this.invoice.tax_rate !== null ? this.invoice.tax_rate : 15;
      const shouldExempt = this.selectedTaxesForExemption.some(taxCode => {
        const tax = this.availableTaxes.find(t => t.code === taxCode);
        return tax && (tax.rate === currentTaxRate || tax.rate === 0);
      });

      if (shouldExempt) {
        // Guardar el impuesto original si aún no está guardado
        if (this.invoice.original_tax_rate === undefined) {
          this.invoice.original_tax_rate = currentTaxRate;
        }

        // Aplicar exoneración (tasa 0%) - En Vue 3 la reactividad es automática
        this.invoice.tax_rate = 0;
        this.invoice.is_tax_exempt = true;

        console.log('Exoneración aplicada - tax_rate:', this.invoice.tax_rate);
        console.log('Totales después de exoneración:', this.totals);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Exoneración Aplicada',
          text: 'El impuesto ha sido exonerado para esta factura (0%)',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // El impuesto seleccionado no coincide con el de la factura
        Swal.fire({
          icon: 'info',
          title: 'Información',
          text: `La factura tiene un impuesto del ${currentTaxRate}%. Seleccione el impuesto correspondiente.`
        });
      }

      // Cerrar modal y limpiar selección
      this.showTaxExemptionModal = false;
      this.selectedTaxesForExemption = [];
    },
    formatDate(dateString) {
      if (!dateString) return '';

      // Si es un objeto Date, formatearlo directamente
      if (dateString instanceof Date) {
        const day = String(dateString.getDate()).padStart(2, '0');
        const month = String(dateString.getMonth() + 1).padStart(2, '0');
        const year = dateString.getFullYear();
        return `${day}/${month}/${year}`;
      }

      // Convertir a string y extraer solo la parte de fecha YYYY-MM-DD usando regex
      const str = String(dateString);
      const match = str.match(/(\d{4})-(\d{2})-(\d{2})/);

      if (!match) return '';

      const [_, year, month, day] = match;
      return `${day}/${month}/${year}`;
    },
    formatTodayDate() {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}/${month}/${year}`;
    },
    redirectToResolutions() {
      this.showExpiredResolutionModal = false;
      this.$router.push('/financial-settings/resolution-settings');
    },
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours24 = date.getHours();
      const ampm = hours24 >= 12 ? 'PM' : 'AM';
      const hours12 = hours24 % 12 || 12; // Convertir a formato 12 horas
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year}\n${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;
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
      this.showExportMenu = false;

      const data = [
        ['FACTURA'],
        [''],
        ['Empresa:', this.companyInfo.company_name || 'EMPRESA'],
        ['Documento:', this.createdInvoiceData.invoice_number],
        ['Cliente:', this.createdInvoiceData.customer_name || 'CONSUMIDOR FINAL'],
        ['Fecha:', this.formatDate(this.createdInvoiceData.issue_date || new Date())],
        [''],
        ['Producto', 'Cantidad', 'Precio Unit.', 'Total']
      ];

      this.createdInvoiceData.items.forEach(item => {
        const unitText = item.product_unit || item.unit || 'UNIDAD';
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price || item.price) || 0;
        const taxRate = parseFloat(item.tax_rate) || 0;
        const itemSubtotal = qty * price;
        const itemTax = itemSubtotal * (taxRate / 100);
        const itemTotal = itemSubtotal + itemTax;

        data.push([
          `${item.product_name || item.name} ${unitText}`,
          qty,
          price,
          itemTotal
        ]);
      });

      data.push(['']);
      data.push(['', '', 'TOTAL:', this.createdInvoiceData.total]);

      const XLSX = await import('xlsx');
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'FACTURA');
      XLSX.writeFile(wb, `FACTURA_${this.createdInvoiceData.invoice_number}.xlsx`);
    },
    async exportToPDF() {
      this.showExportMenu = false;
      try {
        const fileName = `FACTURA_${this.createdInvoiceData.invoice_number}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.$refs.invoiceFrame.contentDocument.documentElement.outerHTML;
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 800,
          windowWidth: 800
        });

        const imgData = canvas.toDataURL('image/png');
        const jsPDF = (await import('jspdf')).default;
        const pdf = new jsPDF('p', 'mm', 'letter');
        const imgWidth = 216;
        const pageHeight = 279;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error al generar el PDF');
      }
    },
    async exportToImage() {
      this.showExportMenu = false;
      try {
        const fileName = `FACTURA_${this.createdInvoiceData.invoice_number}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.$refs.invoiceFrame.contentDocument.documentElement.outerHTML;
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 800,
          windowWidth: 800
        });

        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Error al generar la imagen');
      }
    },
    // ===================================================================
    // MÉTODOS DE ATAJOS DE TECLADO
    // ===================================================================
    loadKeyboardShortcuts() {
      const saved = localStorage.getItem('pos_keyboard_shortcuts');
      if (saved) {
        try {
          const savedShortcuts = JSON.parse(saved);
          // Merge: mantener los valores por defecto y sobrescribir con los guardados
          // Esto asegura que los nuevos atajos existan aunque el usuario tenga una versión antigua guardada
          const defaultShortcuts = {
            searchClients: { name: 'Búsqueda de Clientes', keys: 'Alt+F1', action: 'openCustomerSearch' },
            searchProducts: { name: 'Búsqueda de Productos', keys: 'Alt+F2', action: 'openProductSearch' },
            searchSeller: { name: 'Búsqueda de Vendedor', keys: 'Alt+F3', action: 'openSellerSearch' },
            saveTransaction: { name: 'Guardar Transacción', keys: 'Alt+F5', action: 'saveInvoice' },
            saveQuote: { name: 'Guardar Cotización', keys: 'Alt+F6', action: 'saveQuote' },
            savePending: { name: 'Guardar Op. en Espera', keys: 'Alt+F7', action: 'savePending' },
            deleteTransaction: { name: 'Eliminar Transacción', keys: 'Alt+F8', action: 'clearInvoice' },
            addProduct: { name: 'Adicionar Producto', keys: 'Alt+A', action: 'addProduct' },
            fastPayment: { name: 'Cobro Rápido', keys: 'Alt+F9', action: 'quickCheckout' },
            detailedPayment: { name: 'Cobro Detallado', keys: 'Alt+F10', action: 'openCheckout' },
            taxExemption: { name: 'Exoneración ISV', keys: 'Alt+F11', action: 'openTaxExemption' },
            applyCoupon: { name: 'Aplicar Cupón', keys: 'Alt+C', action: 'openCouponModal' },
            viewOffers: { name: 'Ver Ofertas', keys: 'Alt+O', action: 'openOffersModal' },
            changeDocument: { name: 'Cambiar Documento', keys: 'Alt+D', action: 'toggleDocumentType' },
            changeWarehouse: { name: 'Cambiar Bodega', keys: 'Alt+B', action: 'focusWarehouse' },
            editShipping: { name: 'Editar Recargos', keys: 'Alt+R', action: 'focusShippingCost' },
            importDocument: { name: 'Importar Documento', keys: 'Alt+I', action: 'toggleImportDropdown' },
            additionalOptions: { name: 'Opciones Adicionales', keys: 'Alt+P', action: 'toggleAdditionalOptions' },
            additionalFields: { name: 'Campos Adicionales', keys: 'Alt+M', action: 'toggleAdditionalFields' }
          };
          // Mezclar: por defecto + guardados (los guardados sobrescriben)
          this.keyboardShortcuts = { ...defaultShortcuts };
          for (const key in savedShortcuts) {
            if (this.keyboardShortcuts[key]) {
              this.keyboardShortcuts[key].keys = savedShortcuts[key].keys || this.keyboardShortcuts[key].keys;
            }
          }
        } catch (e) {
          console.error('Error loading keyboard shortcuts:', e);
        }
      }
    },

    saveKeyboardShortcuts() {
      localStorage.setItem('pos_keyboard_shortcuts', JSON.stringify(this.keyboardShortcuts));
      Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: 'Los atajos de teclado han sido guardados correctamente',
        timer: 2000,
        showConfirmButton: false
      });
      this.showKeyboardShortcutsModal = false;
    },

    resetKeyboardShortcuts() {
      // Restaurar valores por defecto
      this.keyboardShortcuts = {
        searchClients: { name: 'Búsqueda de Clientes', keys: 'Alt+F1', action: 'openCustomerSearch' },
        searchProducts: { name: 'Búsqueda de Productos', keys: 'Alt+F2', action: 'openProductSearch' },
        searchSeller: { name: 'Búsqueda de Vendedor', keys: 'Alt+F3', action: 'openSellerSearch' },
        saveTransaction: { name: 'Guardar Transacción', keys: 'Alt+F5', action: 'saveInvoice' },
        saveQuote: { name: 'Guardar Cotización', keys: 'Alt+F6', action: 'saveQuote' },
        savePending: { name: 'Guardar Op. en Espera', keys: 'Alt+F7', action: 'savePending' },
        deleteTransaction: { name: 'Eliminar Transacción', keys: 'Alt+F8', action: 'clearInvoice' },
        addProduct: { name: 'Adicionar Producto', keys: 'Alt+A', action: 'addProduct' },
        fastPayment: { name: 'Cobro Rápido', keys: 'Alt+F9', action: 'quickCheckout' },
        detailedPayment: { name: 'Cobro Detallado', keys: 'Alt+F10', action: 'openCheckout' },
        taxExemption: { name: 'Exoneración ISV', keys: 'Alt+F11', action: 'openTaxExemption' },
        applyCoupon: { name: 'Aplicar Cupón', keys: 'Alt+C', action: 'openCouponModal' },
        viewOffers: { name: 'Ver Ofertas', keys: 'Alt+O', action: 'openOffersModal' },
        changeDocument: { name: 'Cambiar Documento', keys: 'Alt+D', action: 'toggleDocumentType' },
        changeWarehouse: { name: 'Cambiar Bodega', keys: 'Alt+B', action: 'focusWarehouse' },
        editShipping: { name: 'Editar Recargos', keys: 'Alt+R', action: 'focusShippingCost' },
        importDocument: { name: 'Importar Documento', keys: 'Alt+I', action: 'toggleImportDropdown' },
        additionalOptions: { name: 'Opciones Adicionales', keys: 'Alt+P', action: 'toggleAdditionalOptions' },
        additionalFields: { name: 'Campos Adicionales', keys: 'Alt+M', action: 'toggleAdditionalFields' }
      };
      Swal.fire({
        icon: 'info',
        title: 'Restaurado',
        text: 'Los atajos han sido restaurados a sus valores por defecto',
        timer: 2000,
        showConfirmButton: false
      });
    },

    startRecording(shortcutKey) {
      this.recordingShortcut = shortcutKey;
    },

    recordShortcut(event, shortcutKey) {
      event.preventDefault();

      if (this.recordingShortcut !== shortcutKey) return;

      const keys = [];
      if (event.altKey) keys.push('Alt');
      if (event.ctrlKey) keys.push('Ctrl');
      if (event.shiftKey) keys.push('Shift');

      // Agregar la tecla principal
      if (event.key && !['Alt', 'Control', 'Shift'].includes(event.key)) {
        const key = event.key.toUpperCase();
        if (key.startsWith('F') && !isNaN(key.substring(1))) {
          keys.push(key); // F1, F2, etc.
        } else if (key.length === 1) {
          keys.push(key);
        }
      }

      if (keys.length > 1) {
        this.keyboardShortcuts[shortcutKey].keys = keys.join('+');
        this.recordingShortcut = null;
      }
    },

    handleGlobalKeydown(event) {
      const key = event.key;
      const isInInput = event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA';

      // Manejar Escape para cerrar modales
      if (key === 'Escape') {
        if (this.showBarcodeScannerModal) { this.closeBarcodeScanner(); return; }
        if (this.showQuickPaymentModal) { this.showQuickPaymentModal = false; return; }
        if (this.showDetailedPaymentModal) { this.showDetailedPaymentModal = false; return; }
        if (this.showQuotePreview) { this.showQuotePreview = false; return; }
        if (this.showCustomerModal) { this.showCustomerModal = false; return; }
        if (this.showProductModal) { this.showProductModal = false; return; }
        if (this.showVendorModal) { this.showVendorModal = false; return; }
        if (this.showCouponModal) { this.showCouponModal = false; return; }
        if (this.showOffersModal) { this.showOffersModal = false; return; }
        if (this.showTaxExemptionModal) { this.showTaxExemptionModal = false; return; }
        if (this.showAdditionalOptions) { this.showAdditionalOptions = false; return; }
        if (this.showImportDropdown) { this.showImportDropdown = false; return; }
      }

      // Atajos para modal de Cobro Rápido
      if (this.showQuickPaymentModal && !isInInput) {
        if (key === '1') { this.quickPayment.method = 'TRANSFERENCIA'; event.preventDefault(); return; }
        if (key === '2') { this.quickPayment.method = 'CHEQUE'; event.preventDefault(); return; }
        if (key === '3') { this.quickPayment.method = 'TARJ_DEBITO'; event.preventDefault(); return; }
        if (key === '4') { this.quickPayment.method = 'TARJ_CREDITO'; event.preventDefault(); return; }
        if (key === '5') { this.quickPayment.method = 'EFECTIVO'; event.preventDefault(); return; }
        if (key === '6') { this.quickPayment.method = 'LINK_PAGO'; event.preventDefault(); return; }
        if (key === 'Enter') { this.processQuickPayment(); event.preventDefault(); return; }
        if (key.toLowerCase() === 'd') { this.switchToDetailedPayment(); event.preventDefault(); return; }
      }

      // Atajos para modal de Vista Previa Cotización
      if (this.showQuotePreview && !isInInput) {
        if (event.altKey && key === 'p') { this.printQuotePreview(); event.preventDefault(); return; }
        if (event.altKey && key === 'o') { this.showQuoteOptionsDropdown = !this.showQuoteOptionsDropdown; event.preventDefault(); return; }
        if (event.altKey && key === '1') { this.exportQuoteToPDF(); event.preventDefault(); return; }
        if (event.altKey && key === '2') { this.exportQuoteToExcel(); event.preventDefault(); return; }
        if (event.altKey && key === '3') { this.saveQuoteAsImage(); event.preventDefault(); return; }
      }

      // Atajos para importar documento cuando el dropdown está abierto
      if (this.showImportDropdown && event.altKey) {
        if (key === '1') { this.openImportModal('pending-invoice'); this.showImportDropdown = false; event.preventDefault(); return; }
        if (key === '2') { this.openImportModal('quote'); this.showImportDropdown = false; event.preventDefault(); return; }
        if (key === '3') { this.openImportModal('online-order'); this.showImportDropdown = false; event.preventDefault(); return; }
      }

      // Navegación con teclado en modales de búsqueda
      if (this.showCustomerModal || this.showProductModal || this.showVendorModal) {
        const list = this.showCustomerModal ? this.paginatedCustomers :
                     this.showProductModal ? this.paginatedProducts :
                     this.filteredVendors;

        if (key === 'ArrowDown') {
          event.preventDefault();
          this.selectedSearchIndex = Math.min(this.selectedSearchIndex + 1, list.length - 1);
          return;
        }
        if (key === 'ArrowUp') {
          event.preventDefault();
          this.selectedSearchIndex = Math.max(this.selectedSearchIndex - 1, 0);
          return;
        }
        if (key === 'Enter' && list[this.selectedSearchIndex]) {
          event.preventDefault();
          if (this.showCustomerModal) {
            this.selectCustomer(list[this.selectedSearchIndex]);
          } else if (this.showProductModal) {
            this.selectProduct(list[this.selectedSearchIndex]);
          } else if (this.showVendorModal) {
            this.selectVendor(list[this.selectedSearchIndex]);
          }
          return;
        }
      }

      // No procesar atajos generales si estamos en un input/textarea o en modo grabación
      if (isInInput) return;
      if (this.recordingShortcut) return;

      // Enter para adicionar producto (cuando no hay input enfocado)
      if (key === 'Enter') {
        this.addProduct();
        event.preventDefault();
        return;
      }

      // Delete para borrar la fila seleccionada
      if (key === 'Delete' && this.selectedProductRow >= 0 && this.selectedProductRow < this.invoice.items.length) {
        this.removeProduct(this.selectedProductRow);
        this.selectedProductRow = Math.max(0, this.selectedProductRow - 1);
        event.preventDefault();
        return;
      }

      const pressedKeys = [];
      if (event.altKey) pressedKeys.push('Alt');
      if (event.ctrlKey) pressedKeys.push('Ctrl');
      if (event.shiftKey) pressedKeys.push('Shift');

      if (key && !['Alt', 'Control', 'Shift'].includes(key)) {
        const upperKey = key.toUpperCase();
        if (upperKey.startsWith('F') && !isNaN(upperKey.substring(1))) {
          pressedKeys.push(upperKey);
        } else if (upperKey.length === 1) {
          pressedKeys.push(upperKey);
        }
      }

      const pressedCombo = pressedKeys.join('+');

      // Buscar el atajo que coincida
      for (const [k, shortcut] of Object.entries(this.keyboardShortcuts)) {
        if (shortcut.keys === pressedCombo) {
          event.preventDefault();
          this.executeShortcutAction(shortcut.action);
          return;
        }
      }
    },

    executeShortcutAction(action) {
      switch (action) {
        case 'openCustomerSearch':
          this.showCustomerModal = true;
          break;
        case 'openProductSearch':
          this.showProductModal = true;
          break;
        case 'openSellerSearch':
          this.showVendorModal = true;
          break;
        case 'saveInvoice':
          if (this.invoice.items.length > 0) {
            this.saveAsDraft();
          }
          break;
        case 'saveQuote':
          if (this.invoice.items.length > 0) {
            this.saveAsQuote();
          }
          break;
        case 'savePending':
          if (this.invoice.items.length > 0) {
            this.saveAsPendingInvoice();
          }
          break;
        case 'clearInvoice':
          this.clearInvoice();
          break;
        case 'addProduct':
          this.addProduct();
          break;
        case 'quickCheckout':
          if (this.invoice.items.length > 0) {
            this.showQuickPaymentModal = true;
          }
          break;
        case 'openCheckout':
          if (this.invoice.items.length > 0) {
            this.showDetailedPaymentModal = true;
          }
          break;
        case 'openTaxExemption':
          this.showTaxExemptionModal = true;
          break;
        case 'openCouponModal':
          this.showCouponModal = true;
          this.showAdditionalOptions = false;
          break;
        case 'openOffersModal':
          this.showOffersModal = true;
          this.showAdditionalOptions = false;
          break;
        case 'toggleDocumentType':
          this.toggleDocumentType();
          break;
        case 'focusWarehouse':
          this.$nextTick(() => {
            if (this.$refs.warehouseSelect) {
              this.$refs.warehouseSelect.focus();
            }
          });
          break;
        case 'focusShippingCost':
          this.$nextTick(() => {
            if (this.$refs.shippingCostInput) {
              this.$refs.shippingCostInput.focus();
              this.$refs.shippingCostInput.select();
            }
          });
          break;
        case 'toggleImportDropdown':
          this.showImportDropdown = !this.showImportDropdown;
          break;
        case 'toggleAdditionalOptions':
          this.showAdditionalOptions = !this.showAdditionalOptions;
          break;
        case 'toggleAdditionalFields':
          this.showAdditionalFields = !this.showAdditionalFields;
          break;
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
        const unitText = item.product_unit || item.unit || 'UNIDAD';
        tableRows += `
          <tr>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(qty)}</td>
            <td style="padding: 3px; font-size: 13px; line-height: 1.3;">${item.product_name || item.name} <span style="font-weight: 600;">${unitText}</span></td>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(price)}</td>
            <td style="padding: 3px; text-align: right; font-size: 13px;">${this.formatCurrency(itemTotal)}</td>
          </tr>
        `;
      });

      let discount = parseFloat(this.createdInvoiceData.discount || 0);
      // Agregar descuentos de cupones y ofertas
      const couponsDiscount = this.createdInvoiceData.coupons_discount || 0;
      const offersDiscount = this.createdInvoiceData.offers_discount || 0;
      discount += couponsDiscount + offersDiscount;

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
              <tr><td class="total-label">DESCUENTOS Y REBAJAS OTORGADOS:</td><td class="total-value">L ${this.formatCurrency(discount)}</td></tr>
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
            <strong>Desde:</strong> ${this.createdInvoiceData.prefijo_control}${String(this.createdInvoiceData.nro_inicial_control).padStart(8, '0')}<br>
            <strong>Hasta:</strong> ${this.createdInvoiceData.prefijo_control}${String(this.createdInvoiceData.nro_final_control).padStart(8, '0')}<br>
            <strong>Fecha Limite de Emisión Vigente:</strong> ${this.formatDate(this.createdInvoiceData.fecha_fin)}<br>
            <strong>No. Correlativo de la Orden de Compra<br>Exenta:</strong> ${this.createdInvoiceData.orden_compra || ''}<br>
            <strong>No. Correlativo de la Constancia del Reg<br>Exonerado:</strong> ${this.createdInvoiceData.constancia_exonerado || ''}<br>
            <strong>No. Identificativo del Registro SAG:</strong> ${this.createdInvoiceData.registro_sag || ''}<br>
            ${this.formatDateTime(new Date())}
          </div>
          <div class="footer-note">
            <strong>Entrega:</strong> ${this.formatTodayDate()}<br>
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
        let endpoint;
        if (this.importDocumentType === 'pending-invoice') {
          endpoint = '/pending-invoices';
        } else if (this.importDocumentType === 'quote') {
          endpoint = '/quotes';
        } else if (this.importDocumentType === 'online-order') {
          endpoint = '/orders';
        }

        const response = await api.get(endpoint);
        this.documents = response.data.data || [];
      } catch (error) {
        console.error('Error loading documents:', error);
        Swal.fire('Error', 'No se pudieron cargar los documentos', 'error');
      }
    },
    async viewDocumentDetails(doc) {
      try {
        let endpoint;
        if (this.importDocumentType === 'pending-invoice') {
          endpoint = `/pending-invoices/${doc.id}`;
        } else if (this.importDocumentType === 'quote') {
          endpoint = `/quotes/${doc.id}`;
        } else if (this.importDocumentType === 'online-order') {
          endpoint = `/orders/${doc.id}`;
        }

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
          title: docData.document_number || docData.quote_number || docData.order_number,
          html: `
            <div class="text-start">
              <p><strong>Cliente:</strong> ${docData.customer_name}</p>
              <p><strong>Fecha:</strong> ${this.formatDate(docData.created_at)}</p>
              <p><strong>Total:</strong> L ${this.formatCurrency(docData.total || docData.total_amount)}</p>
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
        let endpoint;
        if (this.importDocumentType === 'pending-invoice') {
          endpoint = `/pending-invoices/${this.selectedDocumentId}`;
        } else if (this.importDocumentType === 'quote') {
          endpoint = `/quotes/${this.selectedDocumentId}`;
        } else if (this.importDocumentType === 'online-order') {
          endpoint = `/orders/${this.selectedDocumentId}`;
        }

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
          number: docData.document_number || docData.quote_number || docData.order_number
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
        if (!this.couponCode.trim()) {
          this.couponError = 'Por favor ingresa un código de cupón';
          return;
        }

        if (this.invoice.items.length === 0) {
          this.couponError = 'El carrito está vacío';
          return;
        }

        // Verificar si el cupón ya está aplicado
        const couponCode = this.couponCode.trim().toUpperCase();
        if (this.appliedCoupons.some(c => c.code.toUpperCase() === couponCode)) {
          this.couponError = 'Este cupón ya está aplicado';
          return;
        }

        this.couponError = '';
        this.isValidatingCoupon = true;

        // Preparar datos del carrito en el formato del ecommerce
        const cartData = {
          code: this.couponCode.trim(),
          cart: {
            items: this.invoice.items.map(item => ({
              product_id: item.product_id,
              price: item.price,
              quantity: item.quantity,
              category_id: item.category_id,
              subcategory_id: item.subcategory_id
            }))
          }
        };

        // Usar axios directamente sin interceptores para evitar que se agregue store_id
        const response = await axios.post('http://localhost:3000/api/v1/ecommerce/cart/validate-coupon', cartData);

        if (response.data.success) {
          const newCoupon = response.data.data.coupon;
          this.appliedCoupons.push(newCoupon);
          this.couponCode = '';
          this.couponError = '';

          Swal.fire({
            icon: 'success',
            title: 'Cupón Aplicado',
            text: `¡Cupón "${newCoupon.code}" aplicado! Descuento: L ${newCoupon.discount_amount.toFixed(2)}`,
            timer: 2000
          });
        }
      } catch (error) {
        console.error('Error applying coupon:', error);
        if (error.response?.data?.message) {
          this.couponError = error.response.data.message;
        } else {
          this.couponError = 'Error al validar el cupón. Inténtalo de nuevo.';
        }
      } finally {
        this.isValidatingCoupon = false;
      }
    },

    selectCoupon(coupon) {
      this.couponCode = coupon.code;
      this.applyCoupon();
    },

    removeCoupon(couponCode) {
      this.appliedCoupons = this.appliedCoupons.filter(c => c.code !== couponCode);
      this.couponError = '';

      Swal.fire({
        icon: 'info',
        title: 'Cupón Removido',
        text: 'El cupón ha sido removido',
        timer: 1500
      });
    },

    async revalidateCoupons() {
      // Revalidar todos los cupones aplicados con los items actuales
      const validCoupons = [];
      const invalidCoupons = [];

      for (const coupon of this.appliedCoupons) {
        try {
          const cartData = {
            code: coupon.code,
            cart: {
              items: this.invoice.items.map(item => ({
                product_id: item.product_id,
                price: item.price,
                quantity: item.quantity,
                category_id: item.category_id,
                subcategory_id: item.subcategory_id
              }))
            }
          };

          const response = await axios.post('http://localhost:3000/api/v1/ecommerce/cart/validate-coupon', cartData);

          if (response.data.success) {
            // Cupón aún válido, actualizar descuento
            validCoupons.push(response.data.data.coupon);
          }
        } catch (error) {
          // Cupón ya no es válido
          invalidCoupons.push(coupon);
        }
      }

      // Actualizar lista de cupones aplicados
      this.appliedCoupons = validCoupons;

      // Notificar si se quitaron cupones
      if (invalidCoupons.length > 0) {
        const couponNames = invalidCoupons.map(c => c.code).join(', ');
        Swal.fire({
          icon: 'warning',
          title: 'Cupones Removidos',
          text: `Los siguientes cupones ya no son válidos y fueron removidos: ${couponNames}`,
          timer: 3000
        });
      }
    },

    async viewCouponDetails(coupon) {
      try {
        // Cargar detalles completos del cupón desde el backend
        const response = await api.get(`/coupons/${coupon.id}`);
        this.selectedCouponDetails = response.data.data;
        this.showCouponDetailsModal = true;
      } catch (error) {
        console.error('Error loading coupon details:', error);
        Swal.fire('Error', 'No se pudo cargar los detalles del cupón', 'error');
      }
    },

    closeCouponModal() {
      this.showCouponModal = false;
      this.couponCode = '';
      this.couponError = '';
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

    async loadActiveOffers() {
      if (this.invoice.items.length === 0) {
        this.activeOffers = [];
        return;
      }

      try {
        const cartData = {
          cart: {
            items: this.invoice.items.map(item => ({
              product_id: item.product_id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              category_id: item.category_id,
              subcategory_id: item.subcategory_id
            }))
          }
        };

        // Usar axios directamente sin interceptores para evitar que se agregue store_id
        const response = await axios.post('http://localhost:3000/api/v1/ecommerce/cart/active-offers', cartData);

        if (response.data.success) {
          this.activeOffers = response.data.data.offers || [];
        }
      } catch (error) {
        console.error('Error loading active offers:', error);
        this.activeOffers = [];
      }
    },

    async viewOfferDetails(offer) {
      try {
        // Cargar detalles completos de la oferta desde el backend
        const response = await api.get(`/offers/${offer.id}`);
        this.selectedOfferDetails = response.data.data;
        this.showOfferDetailsModal = true;
      } catch (error) {
        console.error('Error loading offer details:', error);
        Swal.fire('Error', 'No se pudo cargar los detalles de la oferta', 'error');
      }
    },

    closeOffersModal() {
      this.showOffersModal = false;
      this.offersSearch = '';
      this.offersTypeFilter = '';
      this.offersStatusFilter = 'active';
    },

    // ===================================================================
    // MÉTODOS PARA MODAL DE INFORMACIÓN DEL PRODUCTO
    // ===================================================================
    async showProductInfo(item) {
      try {
        // Hacer requests para obtener información completa del producto
        const [productResponse, stockResponse] = await Promise.all([
          api.get(`/products/${item.product_id}`),
          api.get(`/products/stock/current?product_id=${item.product_id}`)
        ]);

        if (productResponse.data.success) {
          const productData = productResponse.data.data;

          // Obtener datos de stock
          let stockData = [];
          if (stockResponse.data.data && stockResponse.data.data.stock) {
            if (Array.isArray(stockResponse.data.data.stock)) {
              stockData = stockResponse.data.data.stock;
            } else if (typeof stockResponse.data.data.stock === 'object') {
              stockData = Object.values(stockResponse.data.data.stock);
            }
          }

          // Formatear precios (6 niveles de precio)
          const prices = [];
          for (let i = 0; i < 6; i++) {
            const priceKey = i === 0 ? 'price_1' : `price_${i + 1}`;
            const net = parseFloat(productData[priceKey]) || 0;
            const cost = parseFloat(productData.cost) || 0;
            const taxRate = parseFloat(productData.tax_rate) || 15;

            // Calcular utilidad
            let profit = 0;
            if (cost > 0 && net > 0) {
              profit = ((net - cost) / cost) * 100;
            }

            // Calcular total con impuesto
            const totalVenta = net * (1 + taxRate / 100);

            prices.push({
              label: `PRECIO #${i + 1}`,
              utilidad: profit.toFixed(2),
              bruto: net,
              total_venta: totalVenta
            });
          }

          // Calcular totales de stock
          const stockTotals = this.calculateStockTotals(stockData);

          // Formatear la información del producto
          this.selectedProductInfo = {
            code: productData.code,
            name: productData.name,
            description: productData.description,
            image: productData.image,
            category_name: productData.category_name,
            subcategory_name: productData.subcategory_name,
            brand_name: productData.brand_name,
            model: productData.model,
            weight: productData.weight,
            prices: prices,
            stock: this.formatStock(stockData),
            total_existencias: stockTotals.total,
            total_minimo: stockTotals.minimo,
            total_maximo: stockTotals.maximo
          };

          this.showProductInfoModal = true;
        }
      } catch (error) {
        console.error('Error loading product info:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del producto'
        });
      }
    },

    closeProductInfoModal() {
      this.showProductInfoModal = false;
      this.selectedProductInfo = null;
    },

    showProductInfoFromSearch(product) {
      // Crear un item temporal con la estructura necesaria
      const tempItem = {
        product_id: product.id
      };
      this.showProductInfo(tempItem);
    },

    formatPrices(prices, taxRate) {
      if (!prices || !Array.isArray(prices)) return [];

      const priceLabels = {
        'sale': 'PRECIO #1',
        'price2': 'PRECIO #2',
        'price3': 'PRECIO #3',
        'price4': 'PRECIO #4',
        'price5': 'PRECIO #5',
        'price6': 'PRECIO #6'
      };

      return prices.map(price => {
        const bruto = parseFloat(price.price) || 0;
        const utilidad = parseFloat(price.profit_margin) || 0;
        const impuesto = parseFloat(taxRate) || 15;
        const total_venta = bruto * (1 + impuesto / 100);

        return {
          type: price.price_type,
          label: priceLabels[price.price_type] || price.price_type.toUpperCase(),
          utilidad: utilidad.toFixed(2),
          bruto: bruto,
          total_venta: total_venta
        };
      });
    },

    formatStock(stockData) {
      if (!stockData || !Array.isArray(stockData)) return [];

      return stockData.map(stock => ({
        bodega: stock.warehouse_name || 'N/A',
        existencia_actual: parseFloat(stock.quantity || 0).toFixed(2),
        minimo: parseFloat(stock.min_stock || 0).toFixed(3),
        maximo: parseFloat(stock.max_stock || 0).toFixed(3)
      }));
    },

    calculateTotalStock(stockData) {
      if (!stockData || !Array.isArray(stockData)) return 0;

      const total = stockData.reduce((sum, stock) => {
        return sum + (parseFloat(stock.quantity) || 0);
      }, 0);

      return total.toFixed(2);
    },

    calculateStockTotals(stockData) {
      if (!stockData || !Array.isArray(stockData)) {
        return {
          total: '0.00',
          minimo: '0.000',
          maximo: '0.000'
        };
      }

      const totals = stockData.reduce((acc, stock) => {
        acc.total += parseFloat(stock.quantity) || 0;
        acc.minimo += parseFloat(stock.min_stock) || 0;
        acc.maximo += parseFloat(stock.max_stock) || 0;
        return acc;
      }, { total: 0, minimo: 0, maximo: 0 });

      return {
        total: totals.total.toFixed(2),
        minimo: totals.minimo.toFixed(3),
        maximo: totals.maximo.toFixed(3)
      };
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
/* Selected product row */
.selected-product-row {
  background-color: #e3f2fd !important;
  border-left: 3px solid #2196F3 !important;
}

.search-row-selected {
  background-color: #e3f2fd !important;
  border-left: 3px solid #2196F3 !important;
}

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
