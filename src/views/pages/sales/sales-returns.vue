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
        <div class="page-btn d-flex gap-2" v-if="!selectedInvoice">
          <button class="btn btn-success" @click="showSaveReportModal = true">
            <i class="ti ti-download me-1"></i>Guardar Reporte
          </button>
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
                    <div class="col-6"><span>Monto Bruto</span></div>
                    <div class="col-6 text-end"><strong>L {{ formatCurrency(totals.grossAmount) }}</strong></div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-6"><span>Descuento</span></div>
                    <div class="col-6 text-end"><strong class="text-danger">- L {{ formatCurrency(totals.discount) }}</strong></div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-6"><span>Subtotal</span></div>
                    <div class="col-6 text-end"><strong>L {{ formatCurrency(totals.subtotal) }}</strong></div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-6"><span>ISV</span></div>
                    <div class="col-6 text-end"><strong>L {{ formatCurrency(totals.tax) }}</strong></div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-6"><span>Recargo</span></div>
                    <div class="col-6 text-end"><strong>L {{ formatCurrency(totals.surcharge) }}</strong></div>
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
              <span>Monto Bruto</span>
              <strong>L {{ formatCurrency(totals.grossAmount) }}</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Descuento</span>
              <strong class="text-danger">- L {{ formatCurrency(totals.discount) }}</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <strong>L {{ formatCurrency(totals.subtotal) }}</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>ISV</span>
              <strong>L {{ formatCurrency(totals.tax) }}</strong>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Recargo</span>
              <strong>L {{ formatCurrency(totals.surcharge) }}</strong>
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
              <strong style="font-size: 13px;">{{ companyInfo.commercial_name || companyInfo.company_name || 'EMPRESA' }}</strong><br>
              <small style="font-size: 10px;">{{ companyInfo.address || companyInfo.direccion || 'Sin dirección' }}</small><br>
              <small style="font-size: 10px;">Tel: {{ companyInfo.phone || companyInfo.telefono || 'N/A' }} | Móvil: {{ companyInfo.whatsapp || 'N/A' }}</small>
            </div>

            <h6 class="text-danger text-center mb-2" style="font-size: 14px;">NOTA DE CRÉDITO</h6>

            <!-- Información de Resolución -->
            <div class="d-flex justify-content-around border p-1 mb-1" style="font-size: 10px;" v-if="processedReturn.resolution_data">
              <span><strong>Autorización:</strong> {{ processedReturn.resolution_data.cai || processedReturn.resolution_data.numero_resolucion || 'N/A' }}</span>
              <span><strong>Rango:</strong> {{ processedReturn.resolution_data.nro_inicial_control || '' }} - {{ processedReturn.resolution_data.nro_final_control || '' }}</span>
            </div>

            <!-- Información del Documento -->
            <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
              <span><strong>Nro. Nota Crédito:</strong> {{ processedReturn.credit_note_number || processedReturn.credit_note_correlative || 'N/A' }}</span>
              <span><strong>Factura Original:</strong> {{ processedReturn.invoice_number }}</span>
              <span><strong>Fecha:</strong> {{ formatDatePlusOne(processedReturn.emission_date) }}</span>
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
              <strong style="font-size: 13px;">{{ companyInfo.commercial_name || companyInfo.company_name || 'EMPRESA' }}</strong><br>
              <small style="font-size: 10px;">{{ companyInfo.address || companyInfo.direccion || 'Sin dirección' }}</small><br>
              <small style="font-size: 10px;">Tel: {{ companyInfo.phone || companyInfo.telefono || 'N/A' }} | Móvil: {{ companyInfo.whatsapp || 'N/A' }}</small>
            </div>

            <h6 class="text-primary text-center mb-2" style="font-size: 14px;">DEVOLUCIÓN</h6>

            <!-- Información del Documento -->
            <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
              <span><strong>DEVOLUCIÓN:</strong> {{ processedReturn.return_correlative }}</span>
              <span><strong>Doc/Devuelto:</strong> {{ processedReturn.invoice_number }}</span>
              <span><strong>Fecha:</strong> {{ formatDatePlusOne(processedReturn.emission_date) }}</span>
            </div>

            <div class="mb-2" style="font-size: 10px;">
              <strong>Cliente:</strong> {{ processedReturn.customer_name }}<br>
              <strong>RTN:</strong> {{ processedReturn.customer_rtn || '00000000000000' }}<br>
              <strong>Condiciones:</strong> Contado | <strong>Entrega:</strong> {{ formatDatePlusOne(processedReturn.emission_date) }}
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

<!-- Modal Guardar Reporte -->
<div v-if="showSaveReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Guardar Reporte - Devoluciones</h5>
        <button type="button" class="btn-close" @click="showSaveReportModal = false"></button>
      </div>
      <div class="modal-body">
        <p class="mb-3">Selecciona el formato en el que deseas guardar el reporte:</p>
        <div class="d-grid gap-2">
          <button class="btn btn-outline-success" @click="saveReturnsAsExcel">
            <i class="ti ti-file-spreadsheet me-2"></i> Guardar como Excel
          </button>
          <button class="btn btn-outline-danger" @click="saveReturnsAsPDF">
            <i class="ti ti-file-type-pdf me-2"></i> Guardar como PDF
          </button>
          <button class="btn btn-outline-primary" @click="saveReturnsAsImage">
            <i class="ti ti-photo me-2"></i> Guardar como Imagen
          </button>
          <button class="btn btn-outline-secondary" @click="printReturnsList">
            <i class="ti ti-printer me-2"></i> Imprimir
          </button>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="showSaveReportModal = false">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</div>

</template>

<script>
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import api from '@/utils/axios';

export default {
  data() {
    return {
      showInvoiceModal: false,
      showReturnModal: false,
      showDocumentsModal: false,
      showExportDropdown: false,
      showSaveReportModal: false,
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
      let grossAmount = 0; // Monto bruto (precio * cantidad)
      let taxRate = 15; // Tasa de impuesto por defecto

      this.returnItems.forEach(item => {
        const qty = parseFloat(item.return_quantity) || 0;
        const price = parseFloat(item.unit_price) || 0;

        // Calcular el monto bruto del item (precio * cantidad)
        const itemGross = qty * price;
        grossAmount += itemGross;

        // Obtener tasa de impuesto del primer item
        if (item.tax_rate) {
          taxRate = parseFloat(item.tax_rate) || 15;
        }
      });

      // Obtener recargo y descuento de la factura original
      // shipping_cost es el RECARGO en la base de datos
      // discount_amount es el DESCUENTO total de la factura
      const invoiceSurcharge = parseFloat(this.selectedInvoice?.shipping_cost || 0);
      const invoiceDiscount = parseFloat(this.selectedInvoice?.discount_amount || 0);

      // Subtotal = monto bruto - descuento
      const subtotal = grossAmount - invoiceDiscount;

      // ISV se calcula sobre el subtotal (después del descuento)
      const tax = subtotal * (taxRate / 100);

      // Total = subtotal + ISV + recargo
      const total = subtotal + tax + invoiceSurcharge;

      return {
        grossAmount: grossAmount,   // Monto bruto
        discount: invoiceDiscount,  // Descuento
        subtotal: subtotal,         // Subtotal (con descuento)
        tax: tax,                   // ISV (sobre subtotal)
        surcharge: invoiceSurcharge, // Recargo
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
      this.showInvoiceModal = false;

      // Load invoice details with items
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/v1/invoices-sales/${invoice.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const invoiceData = response.data.data;
          // Guardar todos los datos de la factura incluyendo shipping_cost y discount_amount
          this.selectedInvoice = {
            ...invoice,
            ...invoiceData
          };
          this.returnItems = (invoiceData.items || []).map(item => ({
            ...item,
            return_quantity: this.returnType === 'total' ? item.quantity : 0,
            returned_quantity: item.returned_quantity || 0,
            warehouse_id: item.warehouse_id || (this.warehouses.length > 0 ? this.warehouses[0].id : null),
            warehouse_name: item.warehouse_name || 'BODEGA 101 TIENDA'
          }));
        } else {
          this.selectedInvoice = invoice;
        }
      } catch (error) {
        console.error('Error loading invoice details:', error);
        this.selectedInvoice = invoice;
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

      // Subtotal del item
      const itemTotal = qty * price;

      // Descuento
      const itemDiscount = itemTotal * (discountValue / 100);

      // Subtotal después del descuento (SIN impuesto)
      const itemSubtotal = itemTotal - itemDiscount;

      // Retornar subtotal SIN impuesto
      return itemSubtotal;
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
            customer_rtn: this.selectedInvoice.customer_rtn || '00000000000000',
            emission_date: this.returnForm.emission_date,
            notes: this.returnForm.notes,
            items: this.returnItems.filter(item => item.return_quantity > 0),
            totals: { ...this.totals },
            resolution_data: returnData.resolution_data,
            // Recargo y descuento de la factura original
            shipping_cost: this.selectedInvoice.shipping_cost || 0,
            discount_amount: this.selectedInvoice.discount_amount || 0
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
        const response = await api.get('/companies/default');
        if (response.data && response.data.success) {
          this.companyInfo = response.data.data;
        }
      } catch (error) {
        console.error('Error al cargar información de empresa:', error);
        try {
          const publicResponse = await api.get('/companies/public/default');
          if (publicResponse.data && publicResponse.data.success) {
            this.companyInfo = publicResponse.data.data;
          }
        } catch (publicError) {
          this.companyInfo = {
            company_name: 'ProsperPOS',
            commercial_name: 'ProsperPOS',
            rtn: 'N/A',
            address: 'Sin dirección',
            phone: 'N/A',
            whatsapp: 'N/A',
            email: 'N/A'
          };
        }
      }
    },
    async getCompanyLogo() {
      if (!this.companyInfo?.logo_url) return '';
      const dbLogoUrl = this.companyInfo.logo_url;
      if (!dbLogoUrl.startsWith('http')) return '';

      try {
        const response = await api.get('/image-proxy', { params: { url: dbLogoUrl } });
        if (response.data.success && response.data.data.base64) {
          return response.data.data.base64;
        }
      } catch (error) {
        console.error('Error al cargar logo:', error);
      }
      return '';
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
            customer_rtn: invoiceData ? invoiceData.customer_rtn : '00000000000000',
            // Recargo y descuento de la factura original
            shipping_cost: invoiceData ? parseFloat(invoiceData.shipping_cost || 0) : 0,
            discount_amount: invoiceData ? parseFloat(invoiceData.discount_amount || 0) : 0
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
    async generatePrintableDocument() {
      const printWindow = window.open('', '_blank');
      const html = await this.buildDocumentHTML();
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
      // Retornar el correlativo interno NC-000001, NC-000002, etc.
      if (this.processedReturn.credit_note_correlative) {
        return this.processedReturn.credit_note_correlative;
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
    formatDatePlusOne(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      date.setDate(date.getDate() + 1); // Sumar un día
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    },
    async exportToExcel() {
      this.showExportDropdown = false;

      const data = [
        ['NOTA DE CRÉDITO'],
        [''],
        ['Empresa:', this.companyInfo.commercial_name || this.companyInfo.company_name || 'EMPRESA'],
        ['Dirección:', this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'],
        ['Teléfono:', this.companyInfo.phone || this.companyInfo.telefono || 'N/A'],
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

        const htmlContent = await this.buildDocumentHTML();
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

        const htmlContent = await this.buildDocumentHTML();
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
    async buildDocumentHTML() {
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';
      const docTitle = this.currentDocument === 'credit_note' ? 'NOTA DE CRÉDITO' : 'DEVOLUCIÓN';
      const docColor = '#FF9800'; // Color naranja uniforme

      // Construir filas de la tabla
      let tableRows = '';
      let grossAmount = 0; // Monto bruto (sin impuesto)
      let taxRate = 15;

      this.processedReturn.items.forEach((item, index) => {
        const qty = parseFloat(item.return_quantity) || 0;
        const price = parseFloat(item.unit_price) || 0;

        // Total del item SIN impuesto
        const itemTotal = qty * price;
        grossAmount += itemTotal;

        // Obtener tasa de impuesto
        if (item.tax_rate) {
          taxRate = parseFloat(item.tax_rate) || 15;
        }

        // Obtener unidad del producto - buscar en múltiples campos posibles
        const productUnit = item.product_unit || item.unit || item.unit_name || item.unidad || '';

        tableRows += `
          <tr>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${String(index + 1).padStart(2, '0')}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.product_code || item.codigo || 'N/A'}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.product_name}${productUnit ? ' <strong>' + productUnit + '</strong>' : ''}</td>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${this.formatCurrency(qty)}</td>
            <td style="padding: 6px; text-align: right; border-bottom: 1px solid #e0e0e0; font-size: 10px;">L ${this.formatCurrency(price)}</td>
            <td style="padding: 6px; text-align: right; border-bottom: 1px solid #e0e0e0; font-weight: 600; font-size: 10px;">L ${this.formatCurrency(itemTotal)}</td>
          </tr>
        `;
      });

      // Obtener recargo y descuento de la factura
      const invoiceSurcharge = parseFloat(this.processedReturn.shipping_cost || this.processedReturn.surcharge || 0);
      const invoiceDiscount = parseFloat(this.processedReturn.discount_amount || 0);

      // Subtotal = monto bruto - descuento
      const subtotalAfterDiscount = grossAmount - invoiceDiscount;

      // ISV se calcula sobre el subtotal (después del descuento)
      const totalTax = subtotalAfterDiscount * (taxRate / 100);

      // Total = subtotal + ISV + recargo
      const grandTotal = subtotalAfterDiscount + totalTax + invoiceSurcharge;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${docTitle} - ${this.currentDocument === 'credit_note' ? this.getCreditNoteNumber() : this.processedReturn.return_correlative}</title>
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
              min-width: 280px;
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
              .header, .products-table, .totals-section {
                page-break-inside: avoid;
              }
              .invoice-header, .products-table thead {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                background: #FF9800 !important;
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
                ${hasLogo ? `<img src="${logoUrl}" style="max-width: 180px; height: auto; margin-bottom: 8px;" alt="Logo">` : ''}
                <div class="company-name" style="font-size: 14px; font-weight: 700; color: #000; margin-bottom: 4px;">${this.companyInfo.commercial_name || this.companyInfo.company_name || 'PROSPERPOS'}</div>
                <div class="company-details">
                  <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                  <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'}<br>
                  <strong>Tel:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'} | <strong>Móvil:</strong> ${this.companyInfo.whatsapp || 'N/A'}<br>
                  <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}
                </div>
              </div>
              <div style="flex: 1; margin-left: 20px;">
                <div style="font-size: 11px; color: #333;">
                  <strong>Cliente:</strong> ${this.processedReturn.customer_name || 'CONSUMIDOR FINAL'}<br>
                  <strong>RTN:</strong> ${this.processedReturn.customer_rtn || '00000000000000'}
                </div>
              </div>
              <div class="invoice-header">
                <div class="invoice-title">${docTitle}: ${this.currentDocument === 'credit_note' ? this.getCreditNoteNumber() : this.processedReturn.return_correlative}</div>
                <div class="invoice-meta">
                  <strong>#Control Interno:</strong> ${(() => {
                    const num = this.currentDocument === 'credit_note' ? this.getCreditNoteNumber() : (this.processedReturn.return_correlative || '0');
                    const numStr = String(num);
                    return /^[0-9]+$/.test(numStr) ? numStr.padStart(10, '0') : numStr;
                  })()}<br>
                  <strong>Doc/Devuelto:</strong> ${this.processedReturn.invoice_number || 'N/A'}<br>
                  <strong>Sucursal:</strong> Agencia Principal<br>
                  <strong>Emisión:</strong> ${this.formatDatePlusOne(this.processedReturn.emission_date)}<br>
                  <strong>Condiciones de la Transacción:</strong> Contado<br>
                  <strong>Entrega:</strong> ${this.formatDatePlusOne(this.processedReturn.emission_date)}<br>
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
                  <strong>TOTAL:</strong> ${this.numberToWords(Math.floor(grandTotal)).toUpperCase()} LEMPIRAS ${Math.round((grandTotal % 1) * 100).toString().padStart(2, '0')}/100
                </div>
                <div style="margin-top: auto; padding-top: 40px; text-align: center;">
                  <div style="border-top: 2px solid #000; width: 250px; margin: 0 auto 10px;"></div>
                  <div style="margin-bottom: 8px;"><strong>Original Cliente</strong></div>
                  <div><strong>Copia Obligado Tributario Emisor</strong></div>
                </div>
                ${this.processedReturn.notes ? `
                <div style="margin-top: 30px; text-align: left; font-size: 12px;">
                  <strong>Notas:</strong> ${this.processedReturn.notes}
                </div>
                ` : ''}
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
                  <span class="value">L ${this.formatCurrency(subtotalAfterDiscount)}</span>
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
                  <span class="value">L ${this.formatCurrency(invoiceSurcharge)}</span>
                </div>
                <div class="total-row">
                  <span class="label">DESCUENTOS Y REBAJAS OTORGADOS:</span>
                  <span class="value">L ${this.formatCurrency(invoiceDiscount)}</span>
                </div>
                <div class="total-row grand-total">
                  <span class="label"><strong>TOTAL:</strong></span>
                  <span class="value"><strong>L ${this.formatCurrency(grandTotal)}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      return html;
    },
    // Export methods for Returns History Report
    async saveReturnsAsExcel() {
      try {
        const wb = XLSX.utils.book_new();

        // Header info
        const headerData = [
          ['REPORTE DE DEVOLUCIONES DE VENTAS'],
          [''],
          ['Empresa:', this.companyInfo.commercial_name || this.companyInfo.company_name || 'EMPRESA'],
          ['Dirección:', this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'],
          ['Teléfono:', this.companyInfo.phone || this.companyInfo.telefono || 'N/A'],
          ['Email:', this.companyInfo.email || 'N/A'],
          [''],
          ['Generado:', `${new Date().toLocaleDateString('es-HN')} - ${new Date().toLocaleTimeString('es-HN')}`],
          [''],
          ['Correlativo', 'Factura', 'Cliente', 'Fecha', 'Nota Crédito', 'Total']
        ];

        // Data rows
        const dataRows = this.returns.map(ret => [
          ret.correlative,
          ret.invoice_number,
          ret.customer_name,
          this.formatDate(ret.emission_date),
          ret.credit_note_correlative || '-',
          parseFloat(ret.total || 0).toFixed(2)
        ]);

        // Calculate total
        const total = this.returns.reduce((sum, ret) => sum + parseFloat(ret.total || 0), 0);
        dataRows.push(['', '', '', '', 'TOTAL:', total.toFixed(2)]);

        const allData = [...headerData, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(allData);

        // Column widths
        ws['!cols'] = [
          { wch: 15 }, // Correlativo
          { wch: 15 }, // Factura
          { wch: 30 }, // Cliente
          { wch: 12 }, // Fecha
          { wch: 15 }, // Nota Crédito
          { wch: 12 }  // Total
        ];

        // Merge cells for title
        ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Devoluciones');
        XLSX.writeFile(wb, `Reporte_Devoluciones_${new Date().toLocaleDateString('es-HN').replace(/\//g, '-')}.xlsx`);
        this.showSaveReportModal = false;
      } catch (error) {
        console.error('Error generating Excel:', error);
        alert('Error al generar el archivo Excel');
      }
    },
    async saveReturnsAsPDF() {
      try {
        const htmlContent = await this.buildReturnsReportHTML();

        // Create hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        document.body.appendChild(iframe);

        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

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
        const imgWidth = 210;
        const pageHeight = 279;
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

        pdf.save(`Reporte_Devoluciones_${new Date().toLocaleDateString('es-HN').replace(/\//g, '-')}.pdf`);
        document.body.removeChild(iframe);
        this.showSaveReportModal = false;
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error al generar el PDF');
      }
    },
    async saveReturnsAsImage() {
      try {
        const htmlContent = await this.buildReturnsReportHTML();

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        document.body.appendChild(iframe);

        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

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
        link.download = `Reporte_Devoluciones_${new Date().toLocaleDateString('es-HN').replace(/\//g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);
        this.showSaveReportModal = false;
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Error al generar la imagen');
      }
    },
    async printReturnsList() {
      try {
        const htmlContent = await this.buildReturnsReportHTML();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        printWindow.print();
        this.showSaveReportModal = false;
      } catch (error) {
        console.error('Error printing:', error);
        alert('Error al imprimir');
      }
    },
    async buildReturnsReportHTML() {
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

      let tableRows = '';
      let totalAmount = 0;

      this.returns.forEach((ret, index) => {
        const total = parseFloat(ret.total || 0);
        totalAmount += total;

        tableRows += `
          <tr>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px; text-align: center;">${index + 1}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${ret.correlative}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${ret.invoice_number}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${ret.customer_name}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px; text-align: center;">${this.formatDate(ret.emission_date)}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px; text-align: center;">${ret.credit_note_correlative || '-'}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px; text-align: right;">L ${this.formatCurrency(total)}</td>
          </tr>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Devoluciones</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 15px; background: white; margin: 0; width: 800px; }
            .header-section { display: flex; justify-content: space-between; margin-bottom: 15px; gap: 15px; }
            .company-info { width: 60%; flex-shrink: 0; }
            .company-info img { max-width: 180px; height: auto; margin-bottom: 8px; }
            .company-details { font-size: 11px; line-height: 1.5; }
            .report-box { width: 38%; flex-shrink: 0; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                          -webkit-print-color-adjust: exact; print-color-adjust: exact;
                          color: white; padding: 10px; border-radius: 8px; }
            .report-title { font-size: 13px; font-weight: bold; margin-bottom: 8px; }
            .report-details { font-size: 10px; line-height: 1.6; }
            .separator { border: none; border-top: 3px solid #f97316; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; }
            thead { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                    -webkit-print-color-adjust: exact; print-color-adjust: exact; color: white; }
            th { padding: 8px 4px; text-align: left; border: 1px solid #ddd; font-size: 9px; }
            td { padding: 6px; border: 1px solid #ddd; }
            .total-row { background-color: #FFF3E0; font-weight: bold; }
            .total-row td { border-top: 2px solid #f97316; }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="company-info">
              ${hasLogo ? `<img src="${logoUrl}" alt="Logo">` : ''}
              <div class="company-details">
                <strong>${this.companyInfo.commercial_name || this.companyInfo.company_name || 'PROSPERPOS'}</strong><br>
                <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'}<br>
                <strong>Tel:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'} | <strong>Móvil:</strong> ${this.companyInfo.whatsapp || 'N/A'}<br>
                <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}
              </div>
            </div>
            <div class="report-box">
              <div class="report-title">REPORTE DE DEVOLUCIONES</div>
              <div class="report-details">
                <strong>Generado:</strong> ${new Date().toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' })} - ${new Date().toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <hr class="separator">

          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th>Correlativo</th>
                <th>Factura</th>
                <th>Cliente</th>
                <th style="text-align: center;">Fecha</th>
                <th style="text-align: center;">Nota Crédito</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td colspan="6" style="text-align: right; padding: 6px;"><strong>TOTAL:</strong></td>
                <td style="text-align: right; padding: 6px;"><strong>L ${this.formatCurrency(totalAmount)}</strong></td>
              </tr>
            </tbody>
          </table>
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

