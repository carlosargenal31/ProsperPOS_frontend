<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Devolución de Compras</h4>
            <h6>Gestionar devoluciones de mercancía a proveedores</h6>
          </div>
        </div>
      </div>

      <!-- Search Purchase Card -->
      <div class="card border-0" v-if="!selectedPurchase">
        <div class="card-body">
          <div class="row">
            <div class="col-md-10">
              <label class="form-label">Compra a devolver</label>
              <div class="input-group">
                <button class="btn btn-info" @click="openPurchaseModal">
                  <i class="ti ti-search"></i>
                </button>
                <input
                  type="text"
                  class="form-control form-control-lg text-danger fw-bold"
                  :value="purchaseNumber"
                  readonly
                  placeholder="Buscar compra..."
                />
              </div>
            </div>
            <div class="col-md-2" v-if="selectedPurchase">
              <label class="form-label">Proveedor</label>
              <input
                type="text"
                class="form-control"
                :value="selectedPurchase.supplier_name"
                readonly
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Returns History Table -->
      <div class="card table-list-card" v-if="!selectedPurchase">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h4>Historial de Devoluciones de Compras</h4>
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
                  <th>Compra</th>
                  <th>Proveedor</th>
                  <th>Fecha</th>
                  <th>NC Proveedor</th>
                  <th class="text-end">Total</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ret in returns" :key="ret.id">
                  <td><span class="badge bg-info">{{ ret.correlative }}</span></td>
                  <td>{{ ret.purchase_number }}</td>
                  <td>{{ ret.supplier_name }}</td>
                  <td>{{ formatDate(ret.emission_date) }}</td>
                  <td>
                    <span v-if="ret.credit_note_received" class="badge bg-success">
                      {{ ret.credit_note_number }}
                    </span>
                    <button
                      v-else
                      class="btn btn-sm btn-warning"
                      @click="openCreditNoteModal(ret)"
                      title="Registrar NC del Proveedor"
                    >
                      <i class="ti ti-file-plus"></i> Registrar NC
                    </button>
                  </td>
                  <td class="text-end">L {{ formatCurrency(ret.total) }}</td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-primary" @click="viewReturnDetails(ret)" title="Ver Detalles">
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
      <div v-if="selectedPurchase">
        <div class="card border-0">
          <div class="card-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <h5>Compra: {{ selectedPurchase.purchase_number || selectedPurchase.invoice_number }}</h5>
                <p class="text-muted mb-0">Proveedor: {{ selectedPurchase.supplier_name }}</p>
              </div>
              <div class="col-md-6 text-end">
                <button class="btn btn-secondary" @click="clearSelection">
                  <i class="ti ti-x me-1"></i> Nueva Búsqueda
                </button>
              </div>
            </div>

            <div class="row">
              <div class="col-md-3">
                <label class="form-label">Tipo de Devolución:</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      v-model="returnType"
                      value="total"
                      id="total"
                      @change="updateReturnAmount"
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

              <div class="col-md-3">
                <label class="form-label">Fecha de Devolución</label>
                <input
                  type="datetime-local"
                  class="form-control"
                  v-model="emissionDate"
                />
              </div>

              <div class="col-md-3">
                <label class="form-label">Monto Total de la Compra</label>
                <input
                  type="text"
                  class="form-control"
                  :value="'L ' + formatCurrency(selectedPurchase.grand_total || selectedPurchase.total_amount || 0)"
                  readonly
                />
              </div>

              <div class="col-md-3">
                <label class="form-label">Monto a Devolver</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="returnAmount"
                  :max="selectedPurchase.grand_total || selectedPurchase.total_amount || 0"
                  :disabled="returnType === 'total'"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div class="row mt-4">
              <div class="col-md-8">
                <label class="form-label">Observaciones / Notas</label>
                <textarea
                  class="form-control"
                  v-model="notes"
                  rows="4"
                  placeholder="Motivo de la devolución, observaciones adicionales..."
                ></textarea>
              </div>

              <div class="col-md-4">
                <div class="card border-info">
                  <div class="card-body">
                    <h5 class="card-title text-info">Totales</h5>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <strong>L {{ formatCurrency(returnSubtotal) }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Impuesto (15%):</span>
                      <strong>L {{ formatCurrency(returnTax) }}</strong>
                    </div>
                    <hr />
                    <div class="d-flex justify-content-between">
                      <span class="fs-4"><strong>TOTAL:</strong></span>
                      <strong class="text-danger fs-2">L {{ formatCurrency(returnAmount) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="row mt-4">
              <div class="col-12 text-end">
                <button class="btn btn-secondary me-2" @click="clearSelection">
                  <i class="ti ti-x me-1"></i> Cancelar
                </button>
                <button class="btn btn-success" @click="processReturn" :disabled="processing || returnAmount <= 0">
                  <i class="ti ti-device-floppy me-1"></i>
                  {{ processing ? 'Procesando...' : 'Procesar Devolución' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal: Buscar Compra -->
  <div class="modal fade" :class="{ show: showPurchaseModal }" :style="{ display: showPurchaseModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Buscar Compra</h5>
          <button type="button" class="btn-close" @click="showPurchaseModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <input
              type="text"
              class="form-control"
              v-model="purchaseSearchTerm"
              @input="searchPurchases"
              placeholder="Buscar por número de documento, proveedor..."
            />
          </div>
          <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="table table-hover">
              <thead class="table-light sticky-top">
                <tr>
                  <th>Número</th>
                  <th>Proveedor</th>
                  <th>Fecha</th>
                  <th class="text-end">Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="purchase in purchasesList" :key="purchase.id">
                  <td>{{ purchase.purchase_number || purchase.invoice_number }}</td>
                  <td>{{ purchase.supplier_name }}</td>
                  <td>{{ formatDate(purchase.purchase_date) }}</td>
                  <td class="text-end">L {{ formatCurrency(purchase.grand_total || purchase.total_amount || purchase.net_amount || purchase.total || 0) }}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" @click="selectPurchase(purchase)">
                      <i class="ti ti-check"></i> Seleccionar
                    </button>
                  </td>
                </tr>
                <tr v-if="purchasesList.length === 0">
                  <td colspan="5" class="text-center text-muted">No se encontraron compras</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade" :class="{ show: showPurchaseModal }" v-if="showPurchaseModal"></div>

  <!-- Modal: Registrar Nota de Crédito del Proveedor -->
  <div class="modal fade" :class="{ show: showCreditNoteModal }" :style="{ display: showCreditNoteModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-warning text-dark">
          <h5 class="modal-title">
            <i class="ti ti-file-invoice me-2"></i>
            Registrar Nota de Crédito del Proveedor
          </h5>
          <button type="button" class="btn-close" @click="closeCreditNoteModal"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            <i class="ti ti-info-circle me-2"></i>
            <strong>Importante:</strong> Ingrese los datos de la Nota de Crédito que el proveedor le ha proporcionado externamente.
          </div>

          <form @submit.prevent="submitCreditNote">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">
                  <span class="text-danger">*</span> Número de Nota de Crédito
                </label>
                <input
                  type="text"
                  class="form-control"
                  v-model="creditNoteData.credit_note_number"
                  required
                  placeholder="Ej: NC-001234"
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">
                  <span class="text-danger">*</span> Fecha de Emisión
                </label>
                <input
                  type="date"
                  class="form-control"
                  v-model="creditNoteData.credit_note_date"
                  required
                />
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">CAI / Número de Resolución</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="creditNoteData.credit_note_cai"
                  placeholder="Código de autorización"
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Número de Autorización</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="creditNoteData.credit_note_authorization"
                  placeholder="Número de autorización"
                />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Factura de Compra Original</label>
              <input
                type="text"
                class="form-control"
                v-model="creditNoteData.original_purchase_invoice"
                placeholder="Número de factura de compra que se está anulando"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Notas / Observaciones</label>
              <textarea
                class="form-control"
                v-model="creditNoteData.credit_note_notes"
                rows="3"
                placeholder="Observaciones adicionales sobre la NC del proveedor"
              ></textarea>
            </div>

            <div class="alert alert-warning">
              <strong>Devolución:</strong> {{ selectedReturnForCN?.correlative }}<br />
              <strong>Total de la devolución:</strong> L {{ formatCurrency(selectedReturnForCN?.total || 0) }}
            </div>

            <div class="text-end">
              <button type="button" class="btn btn-secondary me-2" @click="closeCreditNoteModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-success" :disabled="processingCN">
                <i class="ti ti-check me-1"></i>
                {{ processingCN ? 'Guardando...' : 'Guardar Nota de Crédito' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade" :class="{ show: showCreditNoteModal }" v-if="showCreditNoteModal"></div>

  <!-- Modal: Documento de Devolución de Compra - DISEÑO FORMAL -->
  <div class="modal fade" :class="{ show: showDetailsModal }" :style="{ display: showDetailsModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-white py-2">
          <h6 class="modal-title mb-0">Imprimir Documento</h6>
          <button type="button" class="btn-close" @click="closeDetailsModal"></button>
        </div>

        <!-- Selector de Documento -->
        <div class="px-3 pt-2 pb-1">
          <div class="btn-group w-100" role="group">
            <button
              type="button"
              class="btn btn-sm"
              :class="currentDocument === 'return' ? 'btn-primary' : 'btn-outline-primary'"
              @click="currentDocument = 'return'"
            >
              <i class="ti ti-file-text me-1"></i>DEVOLUCIÓN
            </button>
            <button
              type="button"
              class="btn btn-sm"
              :class="currentDocument === 'credit_note' ? 'btn-danger' : 'btn-outline-danger'"
              @click="currentDocument = 'credit_note'"
            >
              <i class="ti ti-file-invoice me-1"></i>NOTA DE CRÉDITO
            </button>
          </div>
        </div>

        <div class="modal-body py-2 px-3" v-if="selectedReturnDetails">
          <!-- Preview del documento -->
          <div ref="documentContent" class="border p-3 bg-white document-preview" style="max-height: 500px; overflow-y: auto;">

            <!-- DOCUMENTO: DEVOLUCIÓN -->
            <div v-if="currentDocument === 'return'" id="returnContent">
              <!-- Encabezado de la Empresa -->
              <div class="text-center mb-3">
                <strong style="font-size: 14px;">{{ companyInfo.company_name || 'PROSPERPOS' }}</strong><br>
                <small style="font-size: 10px;">{{ companyInfo.direccion || 'Sistema de Punto de Venta' }}</small><br>
                <small style="font-size: 10px;">Tel: {{ companyInfo.telefono || 'N/A' }}</small>
              </div>

              <h6 class="text-primary text-center mb-3" style="font-size: 15px; border-top: 2px solid #dee2e6; border-bottom: 2px solid #dee2e6; padding: 8px 0;">
                DEVOLUCIÓN DE COMPRA
              </h6>

              <!-- Información del Documento -->
              <div class="row mb-3" style="font-size: 11px;">
                <div class="col-6">
                  <div class="border p-2">
                    <strong>Correlativo:</strong><br>
                    <span class="text-danger" style="font-size: 18px; font-weight: bold;">{{ selectedReturnDetails.correlative }}</span>
                  </div>
                </div>
                <div class="col-6">
                  <div class="border p-2">
                    <strong>Fecha Devolución:</strong><br>
                    {{ formatDate(selectedReturnDetails.emission_date) }}
                  </div>
                </div>
              </div>

            <div class="row mb-3" style="font-size: 11px;">
              <div class="col-6">
                <div class="border p-2">
                  <strong>Compra Original:</strong><br>
                  {{ selectedReturnDetails.purchase_number }}
                </div>
              </div>
              <div class="col-6">
                <div class="border p-2">
                  <strong>Tipo Devolución:</strong><br>
                  <span class="badge" :class="selectedReturnDetails.return_type === 'total' ? 'bg-danger' : 'bg-warning'">
                    {{ selectedReturnDetails.return_type === 'total' ? 'TOTAL' : 'PARCIAL' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Información del Proveedor -->
            <div class="border p-2 mb-3" style="font-size: 11px; background-color: #f8f9fa;">
              <strong>PROVEEDOR</strong><br>
              <strong>Nombre:</strong> {{ selectedReturnDetails.supplier_name }}<br>
              <strong>RTN:</strong> {{ selectedReturnDetails.supplier_rtn || '00000000000000' }}
            </div>

            <!-- Desglose de Totales -->
            <table class="table table-sm table-bordered mb-3" style="font-size: 11px;">
              <tbody>
                <tr>
                  <td style="padding: 6px;" class="bg-light"><strong>Importe Exonerado:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                  <td style="padding: 6px;" class="bg-light"><strong>Gravado 15%:</strong></td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(selectedReturnDetails.subtotal) }}</td>
                </tr>
                <tr>
                  <td style="padding: 6px;" class="bg-light"><strong>Importe Exento:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                  <td style="padding: 6px;" class="bg-light"><strong>I.S.V 15%:</strong></td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(selectedReturnDetails.tax) }}</td>
                </tr>
                <tr>
                  <td style="padding: 6px;" class="bg-light"><strong>Gravado 18%:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                  <td style="padding: 6px;" class="bg-light"><strong>RECARGOS:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                </tr>
                <tr>
                  <td style="padding: 6px;" class="bg-light"><strong>I.S.V 18%:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                  <td style="padding: 6px;" class="bg-light"><strong>DESC. Y REBAJAS:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                </tr>
                <tr class="table-active">
                  <td colspan="3" class="text-end" style="padding: 8px;"><strong style="font-size: 14px;">TOTAL:</strong></td>
                  <td class="text-end" style="padding: 8px;"><strong style="font-size: 14px;" class="text-danger">L {{ formatCurrency(selectedReturnDetails.total) }}</strong></td>
                </tr>
              </tbody>
            </table>

            <!-- Observaciones -->
            <div v-if="selectedReturnDetails.notes" class="border p-2 mb-3" style="font-size: 10px; background-color: #fff3cd;">
              <strong>OBSERVACIONES:</strong><br>
              {{ selectedReturnDetails.notes }}
            </div>

            <!-- Estado de Nota de Crédito -->
            <div class="border p-2 mb-2" style="font-size: 10px;" :class="selectedReturnDetails.credit_note_received ? 'bg-success-subtle' : 'bg-warning-subtle'">
              <strong v-if="selectedReturnDetails.credit_note_received" class="text-success">
                <i class="ti ti-check-circle me-1"></i>NOTA DE CRÉDITO REGISTRADA
              </strong>
              <strong v-else class="text-warning">
                <i class="ti ti-alert-circle me-1"></i>NOTA DE CRÉDITO PENDIENTE
              </strong>

              <div v-if="selectedReturnDetails.credit_note_received" class="mt-2" style="font-size: 10px;">
                <strong>Número NC:</strong> {{ selectedReturnDetails.credit_note_number }}<br>
                <strong>Fecha NC:</strong> {{ formatDate(selectedReturnDetails.credit_note_date) }}<br>
                <strong>CAI:</strong> {{ selectedReturnDetails.credit_note_cai || 'N/A' }}
              </div>
            </div>

            <!-- Pie de página -->
            <div class="text-center mt-3" style="font-size: 9px; color: #6c757d;">
              <p class="mb-0">Original: Archivo | Copia: Proveedor</p>
              <p class="mb-0">Este documento es una constancia interna de devolución</p>
            </div>
          </div>

          <!-- DOCUMENTO: NOTA DE CRÉDITO -->
          <div v-if="currentDocument === 'credit_note'" id="creditNoteContent">
            <!-- Encabezado de la Empresa -->
            <div class="text-center mb-3">
              <strong style="font-size: 14px;">{{ companyInfo.company_name || 'PROSPERPOS' }}</strong><br>
              <small style="font-size: 10px;">{{ companyInfo.direccion || 'Sistema de Punto de Venta' }}</small><br>
              <small style="font-size: 10px;">Tel: {{ companyInfo.telefono || 'N/A' }}</small>
            </div>

            <h6 class="text-danger text-center mb-3" style="font-size: 15px; border-top: 2px solid #dee2e6; border-bottom: 2px solid #dee2e6; padding: 8px 0;">
              NOTA DE CRÉDITO DEL PROVEEDOR
            </h6>

            <!-- Información del Documento -->
            <div class="row mb-3" style="font-size: 11px;">
              <div class="col-6">
                <div class="border p-2">
                  <strong>Número NC:</strong><br>
                  <span class="text-danger" style="font-size: 18px; font-weight: bold;">{{ selectedReturnDetails.credit_note_number || 'PENDIENTE' }}</span>
                </div>
              </div>
              <div class="col-6">
                <div class="border p-2">
                  <strong>Fecha NC:</strong><br>
                  {{ selectedReturnDetails.credit_note_date ? formatDate(selectedReturnDetails.credit_note_date) : 'N/A' }}
                </div>
              </div>
            </div>

            <div class="row mb-3" style="font-size: 11px;">
              <div class="col-6">
                <div class="border p-2">
                  <strong>Devolución Interna:</strong><br>
                  {{ selectedReturnDetails.correlative }}
                </div>
              </div>
              <div class="col-6">
                <div class="border p-2">
                  <strong>Compra Original:</strong><br>
                  {{ selectedReturnDetails.purchase_number }}
                </div>
              </div>
            </div>

            <!-- Información del Proveedor -->
            <div class="border p-2 mb-3" style="font-size: 11px; background-color: #f8f9fa;">
              <strong>PROVEEDOR</strong><br>
              <strong>Nombre:</strong> {{ selectedReturnDetails.supplier_name }}<br>
              <strong>RTN:</strong> {{ selectedReturnDetails.supplier_rtn || '00000000000000' }}
            </div>

            <!-- Información de Autorización (si existe) -->
            <div v-if="selectedReturnDetails.credit_note_received && selectedReturnDetails.credit_note_cai" class="border p-2 mb-3" style="font-size: 10px; background-color: #e7f3ff;">
              <strong>AUTORIZACIÓN</strong><br>
              <strong>CAI / Resolución:</strong> {{ selectedReturnDetails.credit_note_cai }}<br>
              <strong>Número Autorización:</strong> {{ selectedReturnDetails.credit_note_authorization || 'N/A' }}
            </div>

            <!-- Desglose de Totales -->
            <table class="table table-sm table-bordered mb-3" style="font-size: 11px;">
              <tbody>
                <tr>
                  <td style="padding: 6px;" class="bg-light"><strong>Importe Exonerado:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                  <td style="padding: 6px;" class="bg-light"><strong>Gravado 15%:</strong></td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(selectedReturnDetails.subtotal) }}</td>
                </tr>
                <tr>
                  <td style="padding: 6px;" class="bg-light"><strong>Importe Exento:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                  <td style="padding: 6px;" class="bg-light"><strong>I.S.V 15%:</strong></td>
                  <td class="text-end" style="padding: 6px;">L {{ formatCurrency(selectedReturnDetails.tax) }}</td>
                </tr>
                <tr>
                  <td style="padding: 6px;" class="bg-light"><strong>Gravado 18%:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                  <td style="padding: 6px;" class="bg-light"><strong>RECARGOS:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                </tr>
                <tr>
                  <td style="padding: 6px;" class="bg-light"><strong>I.S.V 18%:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                  <td style="padding: 6px;" class="bg-light"><strong>DESC. Y REBAJAS:</strong></td>
                  <td class="text-end" style="padding: 6px;">L 0.00</td>
                </tr>
                <tr class="table-active">
                  <td colspan="3" class="text-end" style="padding: 8px;"><strong style="font-size: 14px;">TOTAL:</strong></td>
                  <td class="text-end" style="padding: 8px;"><strong style="font-size: 14px;" class="text-danger">L {{ formatCurrency(selectedReturnDetails.total) }}</strong></td>
                </tr>
              </tbody>
            </table>

            <!-- Observaciones de la NC -->
            <div v-if="selectedReturnDetails.credit_note_notes" class="border p-2 mb-3" style="font-size: 10px; background-color: #fff3cd;">
              <strong>OBSERVACIONES DE LA NC:</strong><br>
              {{ selectedReturnDetails.credit_note_notes }}
            </div>

            <!-- Pie de página -->
            <div class="text-center mt-3" style="font-size: 9px; color: #6c757d;">
              <p class="mb-0">Original: Contabilidad | Copia: Archivo</p>
              <p class="mb-0">Nota de Crédito recibida del proveedor</p>
            </div>
          </div>

          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="modal-footer py-2">
          <button type="button" class="btn btn-sm btn-secondary" @click="closeDetailsModal">
            <i class="ti ti-x me-1"></i>CERRAR
          </button>
          <div class="dropdown ms-2" :class="{ show: showExportDropdown }">
            <button class="btn btn-sm btn-warning dropdown-toggle" type="button" @click="showExportDropdown = !showExportDropdown">
              OTRAS OPCIONES
            </button>
            <ul class="dropdown-menu" :class="{ show: showExportDropdown }">
              <li><a class="dropdown-item" href="#" @click.prevent="exportCurrentDocument('excel')"><i class="ti ti-file-spreadsheet me-2"></i>GUARDAR EXCEL</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="exportCurrentDocument('pdf')"><i class="ti ti-file-type-pdf me-2"></i>GUARDAR PDF</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="exportCurrentDocument('image')"><i class="ti ti-photo me-2"></i>GUARDAR IMAGEN</a></li>
            </ul>
          </div>
          <button type="button" class="btn btn-sm btn-info ms-auto" @click="printReturn">
            <i class="ti ti-printer me-1"></i> IMPRIMIR
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade" :class="{ show: showDetailsModal }" v-if="showDetailsModal"></div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default {
  name: 'PurchaseReturns',
  data() {
    return {
      // Purchase selection
      selectedPurchase: null,
      purchaseNumber: '',
      showPurchaseModal: false,
      purchaseSearchTerm: '',
      purchasesList: [],

      // Return data
      returnType: 'partial',
      returnItems: [],
      emissionDate: '',
      notes: '',
      warehouses: [],
      returnAmount: 0, // Monto a devolver

      // Returns history
      returns: [],

      // Credit Note Modal
      showCreditNoteModal: false,
      selectedReturnForCN: null,
      creditNoteData: {
        credit_note_number: '',
        credit_note_date: '',
        credit_note_cai: '',
        credit_note_authorization: '',
        original_purchase_invoice: '',
        credit_note_notes: ''
      },

      // Details Modal
      showDetailsModal: false,
      selectedReturnDetails: null,
      currentDocument: 'return', // 'return' o 'credit_note'
      showExportDropdown: false,

      // Company Info
      companyInfo: {},

      // State
      processing: false,
      processingCN: false
    };
  },
  computed: {
    returnSubtotal() {
      // Calcular subtotal sin impuestos (asumiendo 15% de ISV)
      return this.returnAmount / 1.15;
    },
    returnTax() {
      // Calcular impuesto (15% ISV)
      return this.returnAmount - this.returnSubtotal;
    }
  },
  watch: {
    returnType(newVal) {
      this.updateReturnAmount();
    }
  },
  mounted() {
    this.loadWarehouses();
    this.loadReturns();
    this.setDefaultEmissionDate();
    this.loadCompanyInfo();
  },
  methods: {
    setDefaultEmissionDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.emissionDate = `${year}-${month}-${day}T${hours}:${minutes}`;
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

    async loadReturns() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/purchase-returns', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          this.returns = response.data.data;
        }
      } catch (error) {
        console.error('Error loading purchase returns:', error);
        Swal.fire('Error', 'Error al cargar el historial de devoluciones', 'error');
      }
    },

    openPurchaseModal() {
      this.showPurchaseModal = true;
      this.searchPurchases(); // Cargar todas las compras al abrir el modal
    },

    async searchPurchases() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/purchases', {
          params: {
            search: this.purchaseSearchTerm,
            limit: 100
          },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          // response.data.data contiene { data: [...purchases...], pagination: {...} }
          this.purchasesList = response.data.data.data || [];
        }
      } catch (error) {
        console.error('Error searching purchases:', error);
      }
    },

    async selectPurchase(purchase) {
      try {
        this.selectedPurchase = purchase;
        this.purchaseNumber = purchase.purchase_number || purchase.invoice_number;
        this.returnAmount = 0;
        this.showPurchaseModal = false;
      } catch (error) {
        console.error('Error selecting purchase:', error);
        Swal.fire('Error', 'Error al seleccionar la compra', 'error');
      }
    },

    updateReturnAmount() {
      if (this.returnType === 'total' && this.selectedPurchase) {
        this.returnAmount = this.selectedPurchase.grand_total || this.selectedPurchase.total_amount || 0;
      } else {
        this.returnAmount = 0;
      }
    },

    async processReturn() {
      // Validation
      if (this.returnAmount <= 0) {
        Swal.fire('Error', 'Debe especificar un monto válido a devolver', 'error');
        return;
      }

      if (this.returnAmount > (this.selectedPurchase.grand_total || this.selectedPurchase.total_amount || 0)) {
        Swal.fire('Error', 'El monto a devolver no puede ser mayor al total de la compra', 'error');
        return;
      }

      // Confirm
      const result = await Swal.fire({
        title: '¿Procesar devolución?',
        html: `
          <div class="text-start">
            <p><strong>Compra:</strong> ${this.selectedPurchase.purchase_number || this.selectedPurchase.invoice_number}</p>
            <p><strong>Proveedor:</strong> ${this.selectedPurchase.supplier_name}</p>
            <p><strong>Tipo:</strong> ${this.returnType === 'total' ? 'Total' : 'Parcial'}</p>
            <p><strong>Monto a devolver:</strong> L ${this.formatCurrency(this.returnAmount)}</p>
            <hr>
            <p class="text-warning"><strong>Importante:</strong> Esta acción ajustará automáticamente:</p>
            <ul class="text-start">
              <li>La cuenta por pagar al proveedor</li>
              <li>El crédito fiscal/IVA</li>
            </ul>
            <p class="text-info">Deberá registrar la Nota de Crédito del proveedor posteriormente.</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, procesar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) return;

      this.processing = true;

      try {
        const payload = {
          purchase_id: this.selectedPurchase.id,
          return_type: this.returnType,
          emission_date: this.emissionDate,
          notes: this.notes,
          return_amount: this.returnAmount,
          subtotal: this.returnSubtotal,
          tax: this.returnTax
        };

        const token = localStorage.getItem('token');
        const response = await axios.post('/api/v1/purchase-returns', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          Swal.fire({
            title: 'Éxito',
            html: `
              <p>Devolución procesada exitosamente</p>
              <p><strong>Correlativo:</strong> ${response.data.data.correlative}</p>
              <p class="text-warning mt-3">
                <i class="ti ti-alert-circle"></i>
                Recuerde registrar la Nota de Crédito del proveedor cuando la reciba.
              </p>
            `,
            icon: 'success'
          });

          this.clearSelection();
          this.loadReturns();
        }
      } catch (error) {
        console.error('Error processing return:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al procesar la devolución', 'error');
      } finally {
        this.processing = false;
      }
    },

    openCreditNoteModal(returnRecord) {
      this.selectedReturnForCN = returnRecord;
      this.creditNoteData = {
        credit_note_number: '',
        credit_note_date: '',
        credit_note_cai: '',
        credit_note_authorization: '',
        original_purchase_invoice: returnRecord.purchase_number,
        credit_note_notes: ''
      };
      this.showCreditNoteModal = true;
    },

    closeCreditNoteModal() {
      this.showCreditNoteModal = false;
      this.selectedReturnForCN = null;
      this.creditNoteData = {
        credit_note_number: '',
        credit_note_date: '',
        credit_note_cai: '',
        credit_note_authorization: '',
        original_purchase_invoice: '',
        credit_note_notes: ''
      };
    },

    async submitCreditNote() {
      if (!this.creditNoteData.credit_note_number || !this.creditNoteData.credit_note_date) {
        Swal.fire('Error', 'Número y fecha de NC son requeridos', 'error');
        return;
      }

      this.processingCN = true;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `/api/v1/purchase-returns/${this.selectedReturnForCN.id}/credit-note`,
          this.creditNoteData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          Swal.fire('Éxito', 'Nota de Crédito del proveedor registrada exitosamente', 'success');
          this.closeCreditNoteModal();
          this.loadReturns();
        }
      } catch (error) {
        console.error('Error registering credit note:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al registrar la NC', 'error');
      } finally {
        this.processingCN = false;
      }
    },

    viewReturnDetails(returnRecord) {
      this.selectedReturnDetails = returnRecord;
      this.currentDocument = 'return'; // Siempre iniciar con DEVOLUCIÓN
      this.showDetailsModal = true;
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedReturnDetails = null;
      this.currentDocument = 'return';
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
          direccion: 'Sin dirección',
          telefono: 'N/A',
          rtn: '00000000000000'
        };
      }
    },

    printReturn() {
      window.print();
    },

    async exportCurrentDocument(format) {
      const contentId = this.currentDocument === 'return' ? 'returnContent' : 'creditNoteContent';
      const element = document.getElementById(contentId);

      if (!element) {
        Swal.fire('Error', 'No se pudo encontrar el contenido del documento', 'error');
        return;
      }

      this.showExportDropdown = false;

      if (format === 'image') {
        try {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
          });

          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const fileName = this.currentDocument === 'return'
              ? `devolucion_${this.selectedReturnDetails?.correlative}.png`
              : `nota_credito_${this.selectedReturnDetails?.credit_note_number || 'pendiente'}.png`;
            link.download = fileName;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          });
        } catch (error) {
          console.error('Error al generar imagen:', error);
          Swal.fire('Error', 'Error al generar la imagen', 'error');
        }
      } else if (format === 'pdf') {
        try {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
          });

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'letter');
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          const fileName = this.currentDocument === 'return'
            ? `devolucion_${this.selectedReturnDetails?.correlative}.pdf`
            : `nota_credito_${this.selectedReturnDetails?.credit_note_number || 'pendiente'}.pdf`;
          pdf.save(fileName);
        } catch (error) {
          console.error('Error al generar PDF:', error);
          Swal.fire('Error', 'Error al generar el PDF', 'error');
        }
      } else if (format === 'excel') {
        try {
          const data = [];
          const docType = this.currentDocument === 'return' ? 'DEVOLUCIÓN DE COMPRA' : 'NOTA DE CRÉDITO DEL PROVEEDOR';

          data.push([this.companyInfo.company_name || 'PROSPERPOS']);
          data.push([this.companyInfo.direccion || 'Sin dirección']);
          data.push([`Tel: ${this.companyInfo.telefono || 'N/A'}`]);
          data.push([]);
          data.push([docType]);
          data.push([]);

          if (this.currentDocument === 'return') {
            data.push(['Correlativo:', this.selectedReturnDetails?.correlative]);
            data.push(['Fecha Devolución:', this.formatDate(this.selectedReturnDetails?.emission_date)]);
            data.push(['Compra Original:', this.selectedReturnDetails?.purchase_number]);
            data.push(['Tipo:', this.selectedReturnDetails?.return_type === 'total' ? 'TOTAL' : 'PARCIAL']);
          } else {
            data.push(['Número NC:', this.selectedReturnDetails?.credit_note_number || 'PENDIENTE']);
            data.push(['Fecha NC:', this.selectedReturnDetails?.credit_note_date ? this.formatDate(this.selectedReturnDetails?.credit_note_date) : 'N/A']);
            data.push(['Devolución Interna:', this.selectedReturnDetails?.correlative]);
            data.push(['Compra Original:', this.selectedReturnDetails?.purchase_number]);
          }

          data.push([]);
          data.push(['PROVEEDOR']);
          data.push(['Nombre:', this.selectedReturnDetails?.supplier_name]);
          data.push(['RTN:', this.selectedReturnDetails?.supplier_rtn || '00000000000000']);
          data.push([]);

          data.push(['TOTALES']);
          data.push(['Importe Exonerado:', 'L 0.00', 'Gravado 15%:', `L ${this.formatCurrency(this.selectedReturnDetails?.subtotal)}`]);
          data.push(['Importe Exento:', 'L 0.00', 'I.S.V 15%:', `L ${this.formatCurrency(this.selectedReturnDetails?.tax)}`]);
          data.push(['Gravado 18%:', 'L 0.00', 'RECARGOS:', 'L 0.00']);
          data.push(['I.S.V 18%:', 'L 0.00', 'DESC. Y REBAJAS:', 'L 0.00']);
          data.push([]);
          data.push(['TOTAL:', `L ${this.formatCurrency(this.selectedReturnDetails?.total)}`]);

          if (this.selectedReturnDetails?.notes || this.selectedReturnDetails?.credit_note_notes) {
            data.push([]);
            data.push(['OBSERVACIONES:', this.selectedReturnDetails?.notes || this.selectedReturnDetails?.credit_note_notes]);
          }

          const ws = XLSX.utils.aoa_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, docType.substring(0, 31));

          const fileName = this.currentDocument === 'return'
            ? `devolucion_${this.selectedReturnDetails?.correlative}.xlsx`
            : `nota_credito_${this.selectedReturnDetails?.credit_note_number || 'pendiente'}.xlsx`;
          XLSX.writeFile(wb, fileName);
        } catch (error) {
          console.error('Error al generar Excel:', error);
          Swal.fire('Error', 'Error al generar el Excel', 'error');
        }
      }
    },

    clearSelection() {
      this.selectedPurchase = null;
      this.purchaseNumber = '';
      this.returnAmount = 0;
      this.notes = '';
      this.returnType = 'partial';
      this.setDefaultEmissionDate();
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-HN');
    },

    formatCurrency(value) {
      if (!value) return '0.00';
      return parseFloat(value).toLocaleString('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }
};
</script>

<style scoped>
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
