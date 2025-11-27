<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Devolución Ventas</h4>
            <h6>Gestionar devoluciones de facturas</h6>
          </div>
        </div>
      </div>

      <!-- Search Invoice Card -->
      <div class="card border-0" v-if="!selectedInvoice">
        <div class="card-body">
          <div class="row">
            <div class="col-md-10">
              <label class="form-label">Factura a devolver</label>
              <div class="input-group">
                <button class="btn btn-info" @click="showInvoiceModal = true">
                  <i class="ti ti-search"></i>
                </button>
                <input
                  type="text"
                  class="form-control form-control-lg text-danger fw-bold"
                  :value="invoiceNumber"
                  readonly
                  placeholder="Buscar factura..."
                />
              </div>
            </div>
            <div class="col-md-2" v-if="selectedInvoice">
              <label class="form-label">Cliente</label>
              <input
                type="text"
                class="form-control"
                :value="selectedInvoice.customer_name"
                readonly
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Returns History Table -->
      <div class="card table-list-card" v-if="!selectedInvoice">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h4>Historial de Devoluciones</h4>
          <button class="btn btn-sm btn-primary" @click="loadReturns">
            <i class="ti ti-refresh me-1"></i> Actualizar
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Correlativo</th>
                  <th>Factura</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Nota Crédito</th>
                  <th class="text-end">Total</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ret in returns" :key="ret.id">
                  <td><span class="badge bg-info">{{ ret.correlative }}</span></td>
                  <td>{{ ret.invoice_number }}</td>
                  <td>{{ ret.customer_name }}</td>
                  <td>{{ formatDate(ret.emission_date) }}</td>
                  <td>
                    <span v-if="ret.credit_note_correlative" class="badge bg-danger">{{ ret.credit_note_correlative }}</span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td class="text-end">L {{ formatCurrency(ret.total) }}</td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-primary" @click="viewReturnDocuments(ret)" title="Ver Documentos">
                      <i class="ti ti-eye"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="returns.length === 0">
                  <td colspan="7" class="text-center text-muted">No hay devoluciones registradas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Return Form -->
      <div v-if="selectedInvoice">
        <!-- Return Type Selection -->
        <div class="card border-0 mb-3">
          <div class="card-body">
            <div class="row align-items-end">
              <div class="col-md-6">
                <label class="form-label">Tipo de Devolución:</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      v-model="returnType"
                      value="total"
                      id="total"
                    />
                    <label class="form-check-label" for="total">
                      Total
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      v-model="returnType"
                      value="partial"
                      id="partial"
                    />
                    <label class="form-check-label" for="partial">
                      Parcial
                    </label>
                  </div>
                </div>
              </div>
              <div class="col-md-6 text-end">
                <button class="btn btn-secondary" @click="clearSelection">
                  <i class="ti ti-x me-1"></i> Nueva Búsqueda
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div class="card table-list-card">
          <div class="card-header">
            <h5>Factura: {{ selectedInvoice.invoice_number }}</h5>
            <span class="text-muted">Cliente: {{ selectedInvoice.customer_name }}</span>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-bordered table-sm">
                <thead class="table-light">
                  <tr>
                    <th>ALMACEN</th>
                    <th>P.UNIT.</th>
                    <th>DESC.UNIT.</th>
                    <th>CANTIDAD</th>
                    <th>CANT.FACTURADA</th>
                    <th>IMPUESTOS</th>
                    <th class="text-end">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(item, index) in returnItems" :key="index">
                    <tr class="bg-light">
                      <td colspan="7">
                        <strong>{{ item.product_name || 'Producto sin nombre' }}</strong>
                        <span v-if="item.product_sku" class="text-muted ms-2">({{ item.product_sku }})</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <select
                          class="form-select form-select-sm"
                          v-model="item.warehouse_id"
                          @change="updateWarehouseName(index)"
                        >
                          <option
                            v-for="wh in warehouses"
                            :key="wh.id"
                            :value="wh.id"
                          >
                            {{ wh.nombre }}
                          </option>
                        </select>
                      </td>
                      <td>{{ formatCurrency(item.unit_price) }}</td>
                      <td>{{ item.discount_value || 0 }}%</td>
                      <td>
                        <input
                          type="number"
                          class="form-control form-control-sm text-center"
                          v-model.number="item.return_quantity"
                          :max="item.quantity"
                          :disabled="returnType === 'total'"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td>{{ item.tax_rate }}%</td>
                      <td class="text-end">{{ formatCurrency(calculateItemTotal(item)) }}</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

            <!-- Totals Summary -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="bg-dark text-white p-4 rounded">
                  <div class="row mb-2">
                    <div class="col-6"><span>Cant. Artículos</span></div>
                    <div class="col-6 text-end"><strong>{{ totalQuantity.toFixed(2) }}</strong></div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-6"><span>Subtotal</span></div>
                    <div class="col-6 text-end"><strong>L {{ formatCurrency(totals.subtotal) }}</strong></div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-6"><span>Recargo</span></div>
                    <div class="col-6 text-end"><strong>L {{ formatCurrency(totals.surcharge) }}</strong></div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-6"><span>Propina</span></div>
                    <div class="col-6 text-end"><strong>L {{ formatCurrency(totals.tip) }}</strong></div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-6"><span>Descuento</span></div>
                    <div class="col-6 text-end"><strong>L {{ formatCurrency(totals.discount) }}</strong></div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-6"><span>ISV</span></div>
                    <div class="col-6 text-end"><strong>L {{ formatCurrency(totals.tax) }}</strong></div>
                  </div>
                  <div class="row border-top pt-3">
                    <div class="col-6"><h3 class="text-danger mb-0">TOTAL</h3></div>
                    <div class="col-6 text-end"><h3 class="text-danger mb-0">L {{ formatCurrency(totals.total) }}</h3></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Process Return Button -->
        <div class="card border-0">
          <div class="card-body">
            <button
              class="btn btn-success btn-lg w-100"
              @click="showReturnModal = true"
              :disabled="totalQuantity === 0"
            >
              <i class="ti ti-check me-2"></i> PROCESAR DEVOLUCIÓN
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
        Diseñado &amp Desarrollado Por
        <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a>
      </p>
    </div>
  </div>

  <!-- Invoice Search Modal -->
  <div class="modal fade" :class="{ show: showInvoiceModal }" :style="{ display: showInvoiceModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Búsqueda de datos</h5>
          <button type="button" class="btn-close btn-close-white" @click="showInvoiceModal = false"></button>
        </div>
        <div class="modal-body">
          <!-- Search Filters -->
          <div class="row mb-3">
            <div class="col-md-2">
              <label class="form-label">Buscar por:</label>
              <select class="form-select" v-model="searchBy">
                <option value="nombre">Nombre</option>
                <option value="fecha">Fecha</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Ordenar Por:</label>
              <select class="form-select" v-model="sortBy">
                <option value="fecha_reciente">Fecha Más Reciente</option>
                <option value="fecha_antigua">Fecha Más Antigua</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label d-flex align-items-center">
                <input type="checkbox" v-model="showImported" class="form-check-input me-2" />
                Ver Doc. Importados
              </label>
            </div>
            <div class="col-md-3">
              <label class="form-label">Desde</label>
              <input type="date" class="form-control" v-model="filters.date_from" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Hasta</label>
              <input type="date" class="form-control" v-model="filters.date_to" />
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-10">
              <input
                type="text"
                class="form-control"
                v-model="searchQuery"
                placeholder="Buscar..."
                @input="searchInvoices"
              />
            </div>
            <div class="col-md-2">
              <select class="form-select" v-model="filters.vendor">
                <option value="">Seleccione un Vendedor</option>
                <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                  {{ vendor.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Invoices Table -->
          <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="table table-sm table-hover">
              <thead class="table-light sticky-top">
                <tr>
                  <th>Emisión</th>
                  <th>Vence</th>
                  <th>Documento</th>
                  <th>Agencia</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Usuario</th>
                  <th class="text-end">Total(L)</th>
                  <th>Estatus</th>
                  <th>Firma Cliente</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="invoice in filteredInvoices"
                  :key="invoice.id"
                  @click="selectInvoice(invoice)"
                  style="cursor: pointer;"
                  class="hover-row"
                >
                  <td>{{ formatDateTime(invoice.issue_date) }}</td>
                  <td>{{ invoice.payment_terms_days ? invoice.payment_terms_days + ' días' : 'N/A' }}</td>
                  <td>
                    <a href="#" class="text-primary">
                      {{ invoice.invoice_number }}
                    </a>
                  </td>
                  <td>{{ invoice.branch_name || 'AGENCIA PRINCIPAL' }}</td>
                  <td>{{ invoice.customer_name }}</td>
                  <td>{{ invoice.seller_name || 'N/A' }}</td>
                  <td>{{ invoice.created_by_name || 'N/A' }}</td>
                  <td class="text-end">{{ formatCurrency(invoice.total) }}</td>
                  <td>
                    <span :class="getStatusBadgeClass(invoice.payment_status)">
                      {{ getStatusLabel(invoice.payment_status) }}
                    </span>
                  </td>
                  <td>N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showInvoiceModal" @click="showInvoiceModal = false"></div>

  <!-- Return Process Modal -->
  <div class="modal fade" :class="{ show: showReturnModal }" :style="{ display: showReturnModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-white">
          <h5 class="modal-title">Procesar Devolución</h5>
          <button type="button" class="btn-close" @click="showReturnModal = false"></button>
        </div>
        <div class="modal-body">
          <!-- Totals Summary -->
          <div class="bg-dark text-white p-3 rounded mb-3">
            <div class="d-flex justify-content-between mb-2">
              <span>Cant. Artículos</span>
              <strong>{{ totalQuantity }}</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <strong>L {{ formatCurrency(totals.subtotal) }}</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Recargo</span>
              <strong>L {{ formatCurrency(totals.surcharge) }}</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Propina</span>
              <strong>L {{ formatCurrency(totals.tip) }}</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Descuento</span>
              <strong>L {{ formatCurrency(totals.discount) }}</strong>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>ISV</span>
              <strong>L {{ formatCurrency(totals.tax) }}</strong>
            </div>
            <div class="d-flex justify-content-between border-top pt-3 mt-2">
              <strong class="h2 text-danger">TOTAL</strong>
              <strong class="h2 text-danger">L {{ formatCurrency(totals.total) }}</strong>
            </div>
          </div>

          <!-- Return Details Form -->
          <div class="mb-3">
            <label class="form-label">Nro./Correlativo</label>
            <input type="text" class="form-control" v-model="returnForm.correlative" readonly disabled />
            <small class="text-muted">Se genera automáticamente</small>
          </div>

          <div class="mb-3">
            <label class="form-label">Emisión</label>
            <input type="date" class="form-control" v-model="returnForm.emission_date" />
          </div>

          <div class="mb-3">
            <label class="form-label">Notas</label>
            <textarea class="form-control" v-model="returnForm.notes" rows="3"></textarea>
          </div>

          <div class="form-check mb-2">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="returnForm.return_money"
              id="returnMoney"
            />
            <label class="form-check-label" for="returnMoney">
              Devolver Dinero
            </label>
          </div>

          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="returnForm.affect_sales_book"
              id="affectSalesBook"
            />
            <label class="form-check-label" for="affectSalesBook">
              Afecta Libro de Ventas
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showReturnModal = false">
            CERRAR
          </button>
          <button type="button" class="btn btn-success" @click="processReturn">
            <i class="ti ti-check me-1"></i> PROCESAR
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showReturnModal" @click="showReturnModal = false"></div>

  <!-- Modal de Documentos de Devolución - NUEVO DISEÑO PROFESIONAL -->
<div class="modal fade" :class="{ show: showDocumentsModal }" :style="{ display: showDocumentsModal ? 'block' : 'none' }" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-white py-2">
        <h6 class="modal-title mb-0">Imprimir Documento</h6>
        <button type="button" class="btn-close" @click="closeDocumentsModal"></button>
      </div>

      <!-- Selector de Documento -->
      <div class="px-3 pt-2 pb-1">
        <div class="btn-group w-100" role="group">
          <button
            type="button"
            class="btn btn-sm"
            :class="currentDocument === 'credit_note' ? 'btn-danger' : 'btn-outline-danger'"
            @click="currentDocument = 'credit_note'"
          >
            <i class="ti ti-file-invoice me-1"></i>NOTA DE CRÉDITO
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="currentDocument === 'return' ? 'btn-primary' : 'btn-outline-primary'"
            @click="currentDocument = 'return'"
          >
            <i class="ti ti-file-text me-1"></i>DEVOLUCIÓN
          </button>
        </div>
      </div>

      <div class="modal-body py-2 px-3">
        <!-- Preview del documento -->
        <div ref="documentContent" class="border p-2 bg-white document-preview" style="max-height: 350px; overflow-y: auto; max-width: 100%; overflow-x: auto;">

          <!-- NOTA DE CRÉDITO -->
          <div v-if="currentDocument === 'credit_note'" id="creditNoteContent">
            <div class="text-center mb-2">
              <strong style="font-size: 13px;">{{ companyInfo.company_name || 'EMPRESA' }}</strong><br>
              <small style="font-size: 10px;">{{ companyInfo.direccion || 'Sin dirección' }}</small><br>
              <small style="font-size: 10px;">Tel: {{ companyInfo.telefono || 'N/A' }}</small>
            </div>

            <h6 class="text-danger text-center mb-2" style="font-size: 14px;">NOTA DE CRÉDITO</h6>

            <!-- Información de Resolución -->
            <div class="d-flex justify-content-around border p-1 mb-1" style="font-size: 10px;" v-if="processedReturn.resolution_data">
              <span><strong>Autorización:</strong> {{ processedReturn.resolution_data.cai || processedReturn.resolution_data.numero_resolucion || 'N/A' }}</span>
              <span><strong>Rango:</strong> {{ processedReturn.resolution_data.nro_inicial_control || '' }} - {{ processedReturn.resolution_data.nro_final_control || '' }}</span>
            </div>

            <!-- Información del Documento -->
            <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
              <span><strong>Nro. Nota Crédito:</strong> {{ processedReturn.credit_note_number || 'N/A' }}</span>
              <span><strong>Factura Original:</strong> {{ processedReturn.invoice_number }}</span>
              <span><strong>Fecha:</strong> {{ formatDate(processedReturn.emission_date) }}</span>
            </div>

            <div class="mb-2" style="font-size: 10px;">
              <strong>Cliente:</strong> {{ processedReturn.customer_name }}<br>
              <strong>RTN Cliente:</strong> {{ processedReturn.customer_rtn || '00000000000000' }}
            </div>

            <!-- Tabla de Productos -->
            <table class="table table-sm table-bordered mb-2" style="font-size: 10px;">
              <thead class="table-light">
                <tr>
                  <th style="padding: 4px;">Código</th>
                  <th style="padding: 4px;">Producto</th>
                  <th class="text-end" style="padding: 4px;">Cant.</th>
                  <th class="text-end" style="padding: 4px;">Precio Unit.</th>
                  <th class="text-end" style="padding: 4px;">Desc %</th>
                  <th class="text-end" style="padding: 4px;">ISV %</th>
                  <th class="text-end" style="padding: 4px;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in processedReturn.items" :key="item.id">
                  <td style="padding: 4px;">{{ item.product_code || item.codigo || 'N/A' }}</td>
                  <td style="padding: 4px;">{{ item.product_name }}</td>
                  <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.return_quantity) }}</td>
                  <td class="text-end" style="padding: 4px;">L {{ formatCurrency(item.unit_price) }}</td>
                  <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.discount_value || 0) }}%</td>
                  <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.tax_rate || 0) }}%</td>
                  <td class="text-end" style="padding: 4px;">L {{ formatCurrency(calculateItemTotal(item)) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-end" style="padding: 4px;"><strong>SUBTOTAL:</strong></td>
                  <td class="text-end" style="padding: 4px;">L {{ formatCurrency(processedReturn.totals.subtotal) }}</td>
                </tr>
                <tr>
                  <td colspan="6" class="text-end" style="padding: 4px;"><strong>DESCUENTO:</strong></td>
                  <td class="text-end" style="padding: 4px;">L {{ formatCurrency(processedReturn.totals.discount) }}</td>
                </tr>
                <tr>
                  <td colspan="6" class="text-end" style="padding: 4px;"><strong>ISV 15%:</strong></td>
                  <td class="text-end" style="padding: 4px;">L {{ formatCurrency(processedReturn.totals.tax) }}</td>
                </tr>
                <tr class="table-active">
                  <td colspan="6" class="text-end" style="padding: 4px;"><strong>TOTAL:</strong></td>
                  <td class="text-end" style="padding: 4px;"><strong>L {{ formatCurrency(processedReturn.totals.total) }}</strong></td>
                </tr>
              </tfoot>
            </table>

            <div v-if="processedReturn.notes" class="mb-1" style="font-size: 10px;">
              <strong>Notas:</strong> {{ processedReturn.notes }}
            </div>

            <div class="text-center mb-0" style="font-size: 9px;">
              <p class="mb-0">Original: Cliente | Copia: Archivo</p>
            </div>
          </div>

          <!-- DEVOLUCIÓN -->
          <div v-if="currentDocument === 'return'" id="returnContent">
            <div class="text-center mb-2">
              <strong style="font-size: 13px;">{{ companyInfo.company_name || 'EMPRESA' }}</strong><br>
              <small style="font-size: 10px;">{{ companyInfo.direccion || 'Sin dirección' }}</small><br>
              <small style="font-size: 10px;">Tel: {{ companyInfo.telefono || 'N/A' }}</small>
            </div>

            <h6 class="text-primary text-center mb-2" style="font-size: 14px;">DEVOLUCIÓN</h6>

            <!-- Información del Documento -->
            <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
              <span><strong>DEVOLUCIÓN:</strong> {{ processedReturn.return_correlative }}</span>
              <span><strong>Doc/Devuelto:</strong> {{ processedReturn.invoice_number }}</span>
              <span><strong>Fecha:</strong> {{ formatDate(processedReturn.emission_date) }}</span>
            </div>

            <div class="mb-2" style="font-size: 10px;">
              <strong>Cliente:</strong> {{ processedReturn.customer_name }}<br>
              <strong>RTN:</strong> {{ processedReturn.customer_rtn || '00000000000000' }}<br>
              <strong>Condiciones:</strong> Contado | <strong>Entrega:</strong> {{ formatDate(processedReturn.emission_date) }}
            </div>

            <!-- Tabla de Productos -->
            <table class="table table-sm table-bordered mb-2" style="font-size: 10px;">
              <thead class="table-light">
                <tr>
                  <th style="padding: 4px;">Código</th>
                  <th style="padding: 4px;">Nombre</th>
                  <th class="text-end" style="padding: 4px;">Precio Unit.</th>
                  <th class="text-end" style="padding: 4px;">Cant.</th>
                  <th class="text-end" style="padding: 4px;">Dscto</th>
                  <th class="text-end" style="padding: 4px;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in processedReturn.items" :key="item.id">
                  <td style="padding: 4px;">{{ item.product_code || 'N/A' }}</td>
                  <td style="padding: 4px;">{{ item.product_name }}</td>
                  <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.unit_price) }}</td>
                  <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.return_quantity) }}</td>
                  <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.discount_value || 0) }}</td>
                  <td class="text-end" style="padding: 4px;">{{ formatCurrency(calculateItemTotal(item)) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="mb-1" style="font-size: 10px;">
              <strong>TOTAL:</strong> {{ numberToWords(processedReturn.totals.total) }} L {{ String(Math.floor((processedReturn.totals.total % 1) * 100)).padStart(2, '0') }}/100
            </div>

            <div class="text-center mb-1" style="font-size: 9px;">
              <p class="mb-0">Original Cliente | Copia Obligado Tributario Emisor</p>
            </div>

            <!-- Desglose de Totales -->
            <table class="table table-sm table-bordered mb-1" style="font-size: 9px;">
              <tr>
                <td style="padding: 3px;"><strong>Importe Exonerado:</strong></td>
                <td class="text-end" style="padding: 3px;">L 0.00</td>
                <td style="padding: 3px;"><strong>Gravado 15%:</strong></td>
                <td class="text-end" style="padding: 3px;">L {{ formatCurrency(processedReturn.totals.subtotal) }}</td>
              </tr>
              <tr>
                <td style="padding: 3px;"><strong>Importe Exento:</strong></td>
                <td class="text-end" style="padding: 3px;">L 0.00</td>
                <td style="padding: 3px;"><strong>I.S.V 15%:</strong></td>
                <td class="text-end" style="padding: 3px;">L {{ formatCurrency(processedReturn.totals.tax) }}</td>
              </tr>
              <tr>
                <td style="padding: 3px;"><strong>Gravado 18%:</strong></td>
                <td class="text-end" style="padding: 3px;">L 0.00</td>
                <td style="padding: 3px;"><strong>RECARGOS:</strong></td>
                <td class="text-end" style="padding: 3px;">L 0.00</td>
              </tr>
              <tr>
                <td style="padding: 3px;"><strong>I.S.V 18%:</strong></td>
                <td class="text-end" style="padding: 3px;">L 0.00</td>
                <td style="padding: 3px;"><strong>DESC. Y REBAJAS:</strong></td>
                <td class="text-end" style="padding: 3px;">L {{ formatCurrency(processedReturn.totals.discount) }}</td>
              </tr>
              <tr class="table-active">
                <td colspan="3" class="text-end" style="padding: 3px;"><strong>TOTAL:</strong></td>
                <td class="text-end" style="padding: 3px;"><strong>L {{ formatCurrency(processedReturn.totals.total) }}</strong></td>
              </tr>
            </table>

            <div v-if="processedReturn.notes" class="mb-0" style="font-size: 10px;">
              <strong>Notas:</strong> {{ processedReturn.notes }}
            </div>
          </div>

        </div>
      </div>

      <div class="modal-footer py-2">
        <div class="dropdown me-auto" :class="{ show: showExportDropdown }">
          <button class="btn btn-sm btn-warning dropdown-toggle" type="button" @click="showExportDropdown = !showExportDropdown">
            OTRAS OPCIONES
          </button>
          <ul class="dropdown-menu" :class="{ show: showExportDropdown }">
            <li><a class="dropdown-item" href="#" @click.prevent="exportCurrentDocument('excel')"><i class="ti ti-file-spreadsheet me-2"></i>GUARDAR EXCEL</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="exportCurrentDocument('pdf')"><i class="ti ti-file-type-pdf me-2"></i>GUARDAR PDF</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="exportCurrentDocument('image')"><i class="ti ti-photo me-2"></i>GUARDAR IMAGEN</a></li>
          </ul>
        </div>
        <button type="button" class="btn btn-sm btn-info" @click="printCurrentDocument">
          <i class="ti ti-printer me-1"></i> IMPRIMIR
        </button>
      </div>
    </div>
  </div>
</div>
<div class="modal-backdrop fade show" v-if="showDocumentsModal" @click="closeDocumentsModal"></div>

</template>

<script>
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      showInvoiceModal: false,
      showReturnModal: false,
      showDocumentsModal: false,
      showExportDropdown: false,
      currentDocument: 'credit_note', // 'credit_note' o 'return'
      selectedInvoice: null,
      processedReturn: {
        return_id: null,
        return_correlative: '',
        credit_note_id: null,
        credit_note_correlative: '',
        credit_note_number: '',
        invoice_number: '',
        customer_name: '',
        emission_date: '',
        notes: '',
        items: [],
        totals: {
          subtotal: 0,
          discount: 0,
          tax: 0,
          total: 0
        },
        resolution_data: null
      },
      returnType: 'total',
      searchBy: 'nombre',
      sortBy: 'fecha_reciente',
      showImported: false,
      searchQuery: '',
      filters: {
        date_from: this.getFirstDayOfMonth(),
        date_to: this.getTodayDate(),
        vendor: ''
      },
      invoices: [],
      returns: [],
      returnItems: [],
      vendors: [],
      warehouses: [],
      creditResolutions: [],
      returnForm: {
        correlative: 'Generando...',
        emission_date: this.getTodayDate(),
        notes: '',
        return_money: true,
        affect_sales_book: true
      },
      companyInfo: {}
    };
  },
  computed: {
    invoiceNumber() {
      return this.selectedInvoice ? this.selectedInvoice.invoice_number : '';
    },
    filteredInvoices() {
      let filtered = this.invoices;

      if (this.searchQuery) {
        filtered = filtered.filter(inv =>
          inv.invoice_number.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          inv.customer_name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      if (this.filters.vendor) {
        filtered = filtered.filter(inv => inv.seller_id == this.filters.vendor);
      }

      return filtered;
    },
    totalQuantity() {
      return this.returnItems.reduce((sum, item) => sum + parseFloat(item.return_quantity || 0), 0);
    },
    totals() {
      let subtotal = 0;
      let totalDiscount = 0;
      let tax = 0;

      this.returnItems.forEach(item => {
        const qty = parseFloat(item.return_quantity) || 0;
        const price = parseFloat(item.unit_price) || 0;
        const discountValue = parseFloat(item.discount_value) || 0;
        const taxRate = parseFloat(item.tax_rate) || 0;

        // Calcular el subtotal del item (precio * cantidad)
        const itemTotal = qty * price;

        // Calcular el descuento del item
        const itemDiscount = itemTotal * (discountValue / 100);

        // Subtotal después del descuento
        const itemSubtotal = itemTotal - itemDiscount;

        // Calcular el impuesto sobre el subtotal
        const itemTax = itemSubtotal * (taxRate / 100);

        subtotal += itemTotal;
        totalDiscount += itemDiscount;
        tax += itemTax;
      });

      const total = (subtotal - totalDiscount) + tax;

      return {
        subtotal: subtotal - totalDiscount,  // Subtotal ya con descuento aplicado
        surcharge: 0,
        tip: 0,
        discount: totalDiscount,
        tax: tax,
        total: total
      };
    }
  },
  mounted() {
    this.loadInvoices();
    this.loadVendors();
    this.loadResolutions();
    this.loadWarehouses();
    this.generateCorrelative();
    this.loadCompanyInfo();
    this.loadReturns();
  },
  methods: {
    getTodayDate() {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    getFirstDayOfMonth() {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    },
    async loadInvoices() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/invoices-sales', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            date_from: this.filters.date_from,
            date_to: this.filters.date_to,
            payment_status: 'paid'
          }
        });

        if (response.data.success) {
          this.invoices = response.data.data.data || response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading invoices:', error);
      }
    },
    async loadVendors() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const users = response.data.data.data || response.data.data || [];

          // Filter only users with vendedor/seller role
          const vendorUsers = users.filter(user => {
            if (user.roles && Array.isArray(user.roles)) {
              return user.roles.some(role =>
                role.name?.toLowerCase().includes('vendedor') ||
                role.name?.toLowerCase().includes('seller') ||
                role.name?.toLowerCase().includes('sales')
              );
            }
            if (user.role_name) {
              const roleName = user.role_name.toLowerCase();
              return roleName.includes('vendedor') ||
                     roleName.includes('seller') ||
                     roleName.includes('sales');
            }
            return false;
          });

          this.vendors = vendorUsers.map(u => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`
          }));
        }
      } catch (error) {
        console.error('Error loading vendors:', error);
      }
    },
    async loadResolutions() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/resolutions', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const resolutions = response.data.data.data || response.data.data || [];

          // Filter active resolutions for credit notes
          this.creditResolutions = resolutions.filter(r =>
            r.document_type?.toLowerCase().includes('credito') ||
            r.document_type?.toLowerCase().includes('credit') ||
            r.document_type?.toLowerCase() === 'nc'
          );
        }
      } catch (error) {
        console.error('Error loading resolutions:', error);
      }
    },
    async loadWarehouses() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/warehouses', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.warehouses = response.data.data.data || response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading warehouses:', error);
      }
    },
    updateWarehouseName(index) {
      const item = this.returnItems[index];
      const warehouse = this.warehouses.find(w => w.id === item.warehouse_id);
      if (warehouse) {
        item.warehouse_name = warehouse.nombre;
      }
    },
    async generateCorrelative() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/sales-returns', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const returns = response.data.data || [];
          const nextNumber = returns.length + 1;
          this.returnForm.correlative = `DEV-${String(nextNumber).padStart(6, '0')}`;
        } else {
          this.returnForm.correlative = 'DEV-000001';
        }
      } catch (error) {
        console.error('Error generating correlative:', error);
        this.returnForm.correlative = 'DEV-000001';
      }
    },
    async selectInvoice(invoice) {
      this.selectedInvoice = invoice;
      this.showInvoiceModal = false;

      // Load invoice details with items
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/v1/invoices-sales/${invoice.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const invoiceData = response.data.data;
          this.returnItems = (invoiceData.items || []).map(item => ({
            ...item,
            return_quantity: this.returnType === 'total' ? item.quantity : 0,
            returned_quantity: item.returned_quantity || 0,
            warehouse_id: item.warehouse_id || (this.warehouses.length > 0 ? this.warehouses[0].id : null),
            warehouse_name: item.warehouse_name || 'BODEGA 101 TIENDA'
          }));
        }
      } catch (error) {
        console.error('Error loading invoice details:', error);
      }
    },
    selectAllProducts() {
      this.returnItems.forEach(item => {
        item.return_quantity = item.quantity - item.returned_quantity;
      });
    },
    calculateItemTotal(item) {
      const qty = parseFloat(item.return_quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const discountValue = parseFloat(item.discount_value) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;

      // Subtotal del item
      const itemTotal = qty * price;

      // Descuento
      const itemDiscount = itemTotal * (discountValue / 100);

      // Subtotal después del descuento
      const itemSubtotal = itemTotal - itemDiscount;

      // Impuesto
      const itemTax = itemSubtotal * (taxRate / 100);

      // Total del item
      return itemSubtotal + itemTax;
    },
    clearSelection() {
      this.selectedInvoice = null;
      this.returnItems = [];
      this.returnType = 'total';
    },
    searchInvoices() {
      // Search is handled by computed property
    },
    async processReturn() {
      try {
        const token = localStorage.getItem('token');

        const payload = {
          invoice_id: this.selectedInvoice.id,
          return_type: this.returnType,
          items: this.returnItems.filter(item => item.return_quantity > 0).map(item => ({
            product_id: item.product_id,
            product_code: item.product_code || item.codigo || '',
            product_name: item.product_name,
            return_quantity: item.return_quantity,
            unit_price: item.unit_price,
            discount_value: item.discount_value || 0,
            tax_rate: item.tax_rate || 0,
            warehouse_id: item.warehouse_id
          })),
          ...this.returnForm,
          totals: this.totals
        };

        const response = await axios.post('/api/v1/sales-returns', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const returnData = response.data.data;

          // Guardar los datos de la devolución procesada con toda la info del backend
          this.processedReturn = {
            return_id: returnData.return_id,
            return_correlative: returnData.return_correlative,
            credit_note_id: returnData.credit_note_id,
            credit_note_correlative: returnData.credit_note_correlative,
            credit_note_number: returnData.credit_note_number,
            invoice_number: this.selectedInvoice.invoice_number,
            customer_name: this.selectedInvoice.customer_name,
            emission_date: this.returnForm.emission_date,
            notes: this.returnForm.notes,
            items: this.returnItems.filter(item => item.return_quantity > 0),
            totals: { ...this.totals },
            resolution_data: returnData.resolution_data
          };

          // Cerrar modal de devolución y abrir modal de documentos
          this.showReturnModal = false;
          this.currentDocument = 'credit_note'; // Mostrar primero la nota de crédito
          this.showDocumentsModal = true;

          // Limpiar selección y recargar
          this.clearSelection();
          this.loadInvoices();
        }
      } catch (error) {
        console.error('Error processing return:', error);
        alert('Error al procesar la devolución: ' + (error.response?.data?.message || error.message));
      }
    },
    formatCurrency(value) {
      const num = parseFloat(value) || 0;
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} PM`;
    },
    getStatusBadgeClass(status) {
      const statusMap = {
        'paid': 'badge bg-success',
        'pending': 'badge bg-warning',
        'partial': 'badge bg-info',
        'overdue': 'badge bg-danger',
        'cancelled': 'badge bg-secondary',
        'returned': 'badge bg-dark'
      };
      return statusMap[status] || 'badge bg-secondary';
    },
    getStatusLabel(status) {
      const labelMap = {
        'paid': 'COBRADO',
        'pending': 'PENDIENTE',
        'partial': 'PARCIAL',
        'overdue': 'VENCIDO',
        'cancelled': 'CANCELADO',
        'returned': 'DEVUELTO'
      };
      return labelMap[status] || status?.toUpperCase();
    },
    formatDaysUntil(dateStr) {
      if (!dateStr) return '';
      const due = new Date(dateStr);
      const now = new Date();
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} (${diffDays}) Días`;
    },
    async loadCompanyInfo() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/reports/company-info', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.companyInfo = response.data.data;
        }
      } catch (error) {
        console.error('Error loading company info:', error);
        // Datos por defecto en caso de error
        this.companyInfo = {
          company_name: 'ProsperPOS',
          direccion: 'Honduras',
          telefono: 'N/A',
          rtn: 'N/A'
        };
      }
    },
    async loadReturns() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/sales-returns', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.returns = response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading returns:', error);
        this.returns = [];
      }
    },
    async viewReturnDocuments(returnRecord) {
      try {
        const token = localStorage.getItem('token');

        // Cargar los detalles completos de la devolución con sus items
        const response = await axios.get(`/api/v1/sales-returns/${returnRecord.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const returnData = response.data.data;

          // Cargar también los datos de la factura original para tener customer_rtn
          // pero sin modificar selectedInvoice para mantener la vista en historial
          const invoiceResponse = await axios.get(`/api/v1/invoices-sales/${returnData.invoice_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          let invoiceData = null;
          if (invoiceResponse.data.success) {
            invoiceData = invoiceResponse.data.data;
          }

          // Poblar processedReturn con todos los datos
          this.processedReturn = {
            return_id: returnData.id,
            return_correlative: returnData.correlative,
            credit_note_id: returnData.credit_note_id,
            credit_note_correlative: returnData.credit_note_correlative,
            credit_note_number: returnData.credit_note_number,
            invoice_number: returnData.invoice_number,
            customer_name: returnData.customer_name,
            emission_date: returnData.emission_date,
            notes: returnData.notes || '',
            items: returnData.items || [],
            totals: {
              subtotal: parseFloat(returnData.subtotal || 0),
              discount: parseFloat(returnData.discount || 0),
              tax: parseFloat(returnData.tax || 0),
              total: parseFloat(returnData.total || 0)
            },
            resolution_data: returnData.resolution_data || null,
            // Guardar customer_rtn directamente en processedReturn
            customer_rtn: invoiceData ? invoiceData.customer_rtn : '00000000000000'
          };

          // Abrir modal de documentos
          this.currentDocument = 'credit_note';
          this.showDocumentsModal = true;
        }
      } catch (error) {
        console.error('Error loading return documents:', error);
        alert('Error al cargar los documentos de la devolución');
      }
    },
    printCurrentDocument() {
      // Generar documento limpio en nueva ventana para imprimir
      this.generatePrintableDocument();
    },
    closeDocumentsModal() {
      this.showDocumentsModal = false;
      this.showExportDropdown = false;
      this.currentDocument = 'credit_note';
    },
    generatePrintableDocument() {
      const printWindow = window.open('', '_blank');
      const html = this.buildDocumentHTML();
      printWindow.document.write(html);
      printWindow.document.close();

      // Esperar a que cargue el contenido y luego imprimir
      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
      };

      // NO cerrar el modal para permitir otras acciones
    },
    async exportCurrentDocument(format) {
      if (format === 'excel') {
        await this.exportToExcel();
      } else if (format === 'pdf') {
        await this.exportToPDF();
      } else if (format === 'image') {
        await this.exportToImage();
      }
    },
    getCreditNoteNumber() {
      // Usar el número de nota de crédito del backend
      if (this.processedReturn.credit_note_number) {
        return this.processedReturn.credit_note_number;
      }
      // Fallback a resoluciones
      if (this.creditResolutions.length > 0) {
        const res = this.creditResolutions[0];
        return `${res.prefijo_control || ''}${res.nro_actual_control || ''}${res.sufijo_control || ''}`;
      }
      return 'N/A';
    },
    numberToWords(num) {
      // Función simple para convertir número a palabras (en español)
      const units = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
      const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
      const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
      const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

      const integer = Math.floor(num);

      if (integer === 0) return 'CERO';
      if (integer < 10) return units[integer];
      if (integer < 20) return teens[integer - 10];
      if (integer < 100) {
        const ten = Math.floor(integer / 10);
        const unit = integer % 10;
        return tens[ten] + (unit ? ' Y ' + units[unit] : '');
      }
      if (integer < 1000) {
        const hundred = Math.floor(integer / 100);
        const rest = integer % 100;
        return (hundred === 1 && rest === 0 ? 'CIEN' : hundreds[hundred]) + (rest ? ' ' + this.numberToWords(rest) : '');
      }
      if (integer < 1000000) {
        const thousand = Math.floor(integer / 1000);
        const rest = integer % 1000;
        return (thousand === 1 ? 'MIL' : this.numberToWords(thousand) + ' MIL') + (rest ? ' ' + this.numberToWords(rest) : '');
      }
      return integer.toString(); // Fallback para números muy grandes
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    },
    async exportToExcel() {
      this.showExportDropdown = false;

      const data = [
        ['NOTA DE CRÉDITO'],
        [''],
        ['Empresa:', this.companyInfo.company_name || 'EMPRESA'],
        ['Dirección:', this.companyInfo.direccion || 'Sin dirección'],
        ['Teléfono:', this.companyInfo.telefono || 'N/A'],
        ['RTN:', this.companyInfo.rtn || 'N/A'],
        [''],
        ['Nro. Nota Crédito:', this.getCreditNoteNumber()],
        ['Factura Original:', this.processedReturn.invoice_number],
        ['Cliente:', this.processedReturn.customer_name],
        ['Fecha Emisión:', this.formatDate(this.processedReturn.emission_date)],
        ['Correlativo:', this.processedReturn.correlative],
        [''],
        ['Producto', 'Cantidad', 'Precio Unit.', 'Desc %', 'ISV %', 'Total']
      ];

      this.processedReturn.items.forEach(item => {
        data.push([
          item.product_name,
          item.return_quantity,
          item.unit_price,
          item.discount_value || 0,
          item.tax_rate || 0,
          this.calculateItemTotal(item)
        ]);
      });

      data.push(['']);
      data.push(['', '', '', '', 'SUBTOTAL:', this.processedReturn.totals.subtotal]);
      data.push(['', '', '', '', 'DESCUENTO:', this.processedReturn.totals.discount]);
      data.push(['', '', '', '', 'ISV:', this.processedReturn.totals.tax]);
      data.push(['', '', '', '', 'TOTAL:', this.processedReturn.totals.total]);

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Nota de Crédito');
      XLSX.writeFile(wb, `Nota_Credito_${this.processedReturn.correlative}.xlsx`);
    },
    async exportToPDF() {
      this.showExportDropdown = false;
      try {
        const fileName = this.currentDocument === 'credit_note'
          ? `Nota_Credito_${this.processedReturn.credit_note_correlative}`
          : `Devolucion_${this.processedReturn.return_correlative}`;

        // Crear iframe oculto con HTML limpio
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildDocumentHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        // Esperar a que se cargue el contenido
        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 800,
          windowWidth: 800
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'letter');
        const imgWidth = 216; // Letter width in mm (8.5 inches)
        const pageHeight = 279; // Letter height in mm (11 inches)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${fileName}.pdf`);
        document.body.removeChild(iframe);
        // NO cerrar el modal para permitir otras acciones
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error al generar el PDF');
      }
    },
    async exportToImage() {
      this.showExportDropdown = false;
      try {
        const fileName = this.currentDocument === 'credit_note'
          ? `Nota_Credito_${this.processedReturn.credit_note_correlative}`
          : `Devolucion_${this.processedReturn.return_correlative}`;

        // Crear iframe oculto con HTML limpio
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildDocumentHTML();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        // Esperar a que se cargue el contenido
        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
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
        // NO cerrar el modal para permitir otras acciones
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Error al generar la imagen');
      }
    },
    buildDocumentHTML() {
      const docTitle = this.currentDocument === 'credit_note' ? 'NOTA DE CRÉDITO' : 'DEVOLUCIÓN';
      const docTitleColor = this.currentDocument === 'credit_note' ? '#cc0000' : '#0066cc';

      // Construir filas de items
      let tableRows = '';
      this.processedReturn.items.forEach(item => {
        const total = this.calculateItemTotal(item);
        tableRows += `
          <tr>
            <td>${item.product_code || item.codigo || 'N/A'}</td>
            <td>${item.product_name}</td>
            <td style="text-align: right;">${this.formatCurrency(item.return_quantity)}</td>
            <td style="text-align: right;">${this.formatCurrency(item.unit_price)}</td>
            <td style="text-align: right;">${this.formatCurrency(item.discount_value || 0)}</td>
            <td style="text-align: right;">${this.formatCurrency(item.tax_rate || 0)}</td>
            <td style="text-align: right;">${this.formatCurrency(total)}</td>
          </tr>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${docTitle} - ${this.formatDate(this.processedReturn.emission_date)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .company-info { color: #0066cc; font-size: 12px; }
            .company-info strong { font-size: 14px; color: black; }
            .doc-title { color: ${docTitleColor}; font-weight: bold; margin: 20px 0 10px 0; text-align: center; font-size: 18px; }
            .info-section { display: flex; border: 1px solid #ccc; margin-bottom: 10px; }
            .info-section div { padding: 5px 10px; border-right: 1px solid #ccc; }
            .info-section div:last-child { border-right: none; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ccc; }
            td { padding: 8px; border: 1px solid #ccc; }
            tfoot td { background: #f0f0f0; font-weight: bold; }
            @media print { body { margin: 0; } @page { size: letter; margin: 10mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <strong>${this.companyInfo.company_name || 'EMPRESA'}</strong><br>
              <strong>Cedula:</strong> ${this.companyInfo.cedula || 'N/A'}<br>
              <strong>Sucursal:</strong> SUCURSAL PRINCIPAL<br>
              <strong>Teléfono:</strong> ${this.companyInfo.telefono || 'N/A'} <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}<br>
              <strong>Direccion:</strong> ${this.companyInfo.direccion || 'N/A'}
            </div>
          </div>

          <div class="doc-title">${docTitle}</div>

          <div class="info-section">
            <div><strong>${this.currentDocument === 'credit_note' ? 'Nro. Nota Crédito:' : 'DEVOLUCIÓN:'}</strong> ${this.currentDocument === 'credit_note' ? (this.processedReturn.credit_note_number || this.processedReturn.credit_note_correlative || 'N/A') : this.processedReturn.return_correlative}</div>
            <div><strong>Factura:</strong> ${this.processedReturn.invoice_number}</div>
            <div><strong>Fecha:</strong> ${this.formatDate(this.processedReturn.emission_date)}</div>
          </div>

          <div style="margin-bottom: 15px; font-size: 12px;">
            <strong>Cliente:</strong> ${this.processedReturn.customer_name}<br>
            <strong>RTN:</strong> ${this.processedReturn.customer_rtn || '00000000000000'}
          </div>

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th style="text-align: right;">Cant.</th>
                <th style="text-align: right;">Precio</th>
                <th style="text-align: right;">Desc</th>
                <th style="text-align: right;">ISV</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="text-align: right;">SUBTOTAL</td>
                <td style="text-align: right;">${this.formatCurrency(this.processedReturn.totals.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="6" style="text-align: right;">DESCUENTO</td>
                <td style="text-align: right;">${this.formatCurrency(this.processedReturn.totals.discount)}</td>
              </tr>
              <tr>
                <td colspan="6" style="text-align: right;">ISV 15%</td>
                <td style="text-align: right;">${this.formatCurrency(this.processedReturn.totals.tax)}</td>
              </tr>
              <tr>
                <td colspan="6" style="text-align: right;"><strong>TOTAL</strong></td>
                <td style="text-align: right;"><strong>${this.formatCurrency(this.processedReturn.totals.total)}</strong></td>
              </tr>
            </tfoot>
          </table>

          ${this.processedReturn.notes ? `<div style="margin-top: 15px; font-size: 11px;"><strong>Notas:</strong> ${this.processedReturn.notes}</div>` : ''}
        </body>
        </html>
      `;

      return html;
    }
  },
  watch: {
    returnType(newType) {
      if (newType === 'total') {
        this.selectAllProducts();
      } else {
        this.returnItems.forEach(item => {
          item.return_quantity = 0;
        });
      }
    }
  }
};
</script>

<style scoped>
.hover-row:hover {
  background-color: #f0f8ff;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Estilos del modal compacto */
.document-preview {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.document-preview::-webkit-scrollbar {
  width: 8px;
}

.document-preview::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.document-preview::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.document-preview::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Estilos para impresión de documentos */
@media print {
  /* Ocultar todo excepto el contenido del documento actual */
  body * {
    visibility: hidden;
  }

  #creditNoteContent,
  #creditNoteContent *,
  #returnContent,
  #returnContent * {
    visibility: visible;
  }

  #creditNoteContent,
  #returnContent {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  /* Ocultar controles del modal */
  .modal-header,
  .modal-footer,
  .btn-close,
  .btn-group,
  button {
    display: none !important;
  }

  /* Ajustes de página para impresión */
  @page {
    margin: 1cm;
  }
}
</style>

