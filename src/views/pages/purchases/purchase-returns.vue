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
              @click="switchDocument('return')"
            >
              <i class="ti ti-file-text me-1"></i>DEVOLUCIÓN
            </button>
            <button
              type="button"
              class="btn btn-sm"
              :class="currentDocument === 'credit_note' ? 'btn-danger' : 'btn-outline-danger'"
              @click="switchDocument('credit_note')"
            >
              <i class="ti ti-file-invoice me-1"></i>NOTA DE CRÉDITO
            </button>
          </div>
        </div>

        <div class="modal-body py-2 px-3" v-if="selectedReturnDetails">
          <!-- Preview del documento -->
          <iframe ref="documentPreview" style="width: 100%; height: 500px; border: 1px solid #ddd;"></iframe>
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
import { LOGO_BASE64 } from '@/assets/img/logo.js';

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

      // Cargar el preview en el iframe después de que el modal esté visible
      this.$nextTick(() => {
        this.loadDocumentPreview();
      });
    },

    loadDocumentPreview() {
      const iframe = this.$refs.documentPreview;
      if (iframe) {
        const htmlContent = this.generateProfessionalReport();
        iframe.contentDocument.open();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();
      }
    },

    switchDocument(docType) {
      this.currentDocument = docType;
      this.$nextTick(() => {
        this.loadDocumentPreview();
      });
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
      const reportHTML = this.generateProfessionalReport();
      const printWindow = window.open('', '_blank');
      printWindow.document.write(reportHTML);
      printWindow.document.close();

      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
      };
    },

    generateProfessionalReport() {
      const docType = this.currentDocument === 'return' ? 'DEVOLUCIÓN COMPRA' : 'NOTA DE CRÉDITO DEL PROVEEDOR';
      const docColor = this.currentDocument === 'return' ? '#28a745' : '#dc3545';
      const ret = this.selectedReturnDetails;

      const LOGO_BASE64 = 'data:image/png;base64,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';

      const totalAmount = parseFloat(ret?.total || 0);
      const taxableAmount = parseFloat(ret?.subtotal || 0);
      const taxAmount = parseFloat(ret?.tax || 0);

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${docType}</title>
          <style>
            @page { size: letter; margin: 15mm; }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #000;
            }
            .invoice-container {
              max-width: 21cm;
              margin: 0 auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 25px;
              padding-bottom: 20px;
              border-bottom: 3px solid ${docColor};
            }
            .company-logo {
              flex: 1;
            }
            .company-name {
              font-size: 11px;
              font-weight: 700;
              color: #000;
              margin-bottom: 6px;
              line-height: 1.5;
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
              border-radius: 8px;
              min-width: 280px;
            }
            .invoice-title {
              font-size: 22px;
              font-weight: 700;
              margin-bottom: 10px;
              letter-spacing: 0.5px;
            }
            .invoice-info {
              font-size: 11px;
              line-height: 1.6;
            }
            .client-info {
              background: #f8f9fa;
              padding: 18px;
              border-left: 4px solid ${docColor};
              margin-bottom: 25px;
              font-size: 12px;
              line-height: 1.8;
            }
            .totals-section {
              display: flex;
              justify-content: space-between;
              margin-top: 25px;
            }
            .totals-left {
              flex: 1;
              padding-right: 30px;
            }
            .totals-box {
              background: #f8f9fa;
              border: 2px solid ${docColor};
              border-radius: 8px;
              padding: 15px;
              min-width: 320px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 11px;
            }
            .grand-total {
              margin-top: 8px;
              padding-top: 8px;
              border-top: 2px solid ${docColor};
              font-size: 13px;
              background: ${docColor};
              color: white;
              margin: 8px -15px -15px -15px;
              padding: 12px 15px;
              border-radius: 0 0 6px 6px;
            }
            body, p, div, span, td, th, strong, b, label {
              color: #000 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .invoice-header, .invoice-header *,
            .invoice-title, .invoice-title *,
            .invoice-info, .invoice-info *,
            .grand-total, .grand-total * {
              color: white !important;
            }
            @media print {
              body { padding: 0; color: #000 !important; }
              * { color: #000 !important; }
              .invoice-header, .invoice-header *,
              .invoice-title, .invoice-title *,
              .invoice-info, .invoice-info *,
              .grand-total, .grand-total * {
                color: white !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-logo">
                <img src="${LOGO_BASE64}" alt="Logo" style="max-width: 180px; height: auto; margin-bottom: 15px;">
                <div class="company-name">${this.companyInfo.company_name || 'EMPRESA'}</div>
                <div class="company-details">
                  <strong>RTN:</strong> ${this.companyInfo.rtn || '00000000000000'}<br>
                  <strong>Dirección:</strong> ${this.companyInfo.direccion || 'Sin dirección'}<br>
                  <strong>Teléfono:</strong> ${this.companyInfo.telefono || 'N/A'}${this.companyInfo.telefono_movil ? '<br><strong>Teléfono Móvil:</strong> ' + this.companyInfo.telefono_movil : ''}<br>
                  <strong>Email:</strong> ${this.companyInfo.email || 'info@empresa.com'}
                </div>
              </div>
              <div class="invoice-header">
                <div class="invoice-title">${docType}</div>
                <div class="invoice-info">
                  <strong>#Control Interno:</strong> ${ret?.correlative || 'N/A'}<br>
                  ${this.currentDocument === 'return' ? `<strong>Doc/Devuelto:</strong> ${ret?.purchase_number || 'N/A'}<br>` : ''}
                  ${this.currentDocument === 'credit_note' ? `<strong>Nota de Crédito:</strong> ${ret?.credit_note_number || 'N/A'}<br><strong>Compra Original:</strong> ${ret?.purchase_number || 'N/A'}<br>` : ''}
                  <strong>Emisión:</strong> ${this.formatDate(ret?.emission_date || ret?.credit_note_date)}<br>
                  <strong>Condiciones de la Transacción:</strong> Contado<br>
                  <strong>Entrega:</strong> ${this.formatDate(ret?.emission_date || ret?.credit_note_date)}
                </div>
              </div>
            </div>
            <div class="client-info">
              <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1;">
                  <strong>Proveedor:</strong> ${ret?.supplier_name || 'N/A'}<br>
                  <strong>RTN:</strong> ${ret?.supplier_rtn || '00000000000000'}
                </div>
              </div>
            </div>
            <div class="totals-section">
              <div class="totals-left">
                <div style="margin-bottom: 15px;">
                  <strong>TOTAL:</strong> ${this.numberToWords(totalAmount).toUpperCase()} LEMPIRAS ${String(Math.floor((totalAmount % 1) * 100)).padStart(2, '0')}/100
                </div>
                <div style="margin-top: auto; padding-top: 40px; text-align: center;">
                  <div style="border-top: 2px solid #000; width: 250px; margin: 0 auto 10px;"></div>
                  <div style="margin-bottom: 8px;"><strong>Original Proveedor</strong></div>
                  <div><strong>Copia Obligado Tributario Emisor</strong></div>
                </div>
                ${ret?.notes || ret?.credit_note_notes ? `
                <div style="margin-top: 30px; text-align: left; font-size: 12px;">
                  <strong>Notas:</strong> ${ret?.notes || ret?.credit_note_notes || ''}
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
                  <span class="value">L ${this.formatCurrency(taxableAmount)}</span>
                </div>
                <div class="total-row">
                  <span class="label">Gravado 18%</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row">
                  <span class="label">I.S.V 15 15%:</span>
                  <span class="value">L ${this.formatCurrency(taxAmount)}</span>
                </div>
                <div class="total-row">
                  <span class="label">I.S.V 18 18%:</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row">
                  <span class="label">RECARGOS:</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row">
                  <span class="label">DESCUENTOS Y REBAJAS OTORGADOS:</span>
                  <span class="value">L 0.00</span>
                </div>
                <div class="total-row grand-total">
                  <span class="label"><strong>TOTAL:</strong></span>
                  <span class="value"><strong>L ${this.formatCurrency(totalAmount)}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      return html;
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
          const reportHTML = this.generateProfessionalReport();
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = reportHTML;
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.width = '800px';
          tempDiv.style.backgroundColor = '#ffffff';
          tempDiv.style.padding = '20px';
          document.body.appendChild(tempDiv);

          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });

          document.body.removeChild(tempDiv);

          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const fileName = this.currentDocument === 'return'
              ? 'devolucion_' + this.selectedReturnDetails?.correlative + '.png'
              : 'nota_credito_' + (this.selectedReturnDetails?.credit_note_number || 'pendiente') + '.png';
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
          const reportHTML = this.generateProfessionalReport();
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = reportHTML;
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.width = '800px';
          tempDiv.style.backgroundColor = '#ffffff';
          tempDiv.style.padding = '20px';
          document.body.appendChild(tempDiv);

          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });

          document.body.removeChild(tempDiv);

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'letter');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = pdfWidth - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 10;

          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }

          const fileName = this.currentDocument === 'return'
            ? 'devolucion_' + this.selectedReturnDetails?.correlative + '.pdf'
            : 'nota_credito_' + (this.selectedReturnDetails?.credit_note_number || 'pendiente') + '.pdf';
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
    },

    numberToWords(num) {
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
        const remainder = integer % 100;
        let result = integer === 100 ? 'CIEN' : hundreds[hundred];
        if (remainder > 0) {
          if (remainder < 10) result += ' ' + units[remainder];
          else if (remainder < 20) result += ' ' + teens[remainder - 10];
          else {
            const ten = Math.floor(remainder / 10);
            const unit = remainder % 10;
            result += ' ' + tens[ten] + (unit ? ' Y ' + units[unit] : '');
          }
        }
        return result;
      }
      if (integer < 1000000) {
        const thousands = Math.floor(integer / 1000);
        const remainder = integer % 1000;
        let result = thousands === 1 ? 'MIL' : this.numberToWords(thousands) + ' MIL';
        if (remainder > 0) {
          result += ' ' + this.numberToWords(remainder);
        }
        return result;
      }
      if (integer < 1000000000) {
        const millions = Math.floor(integer / 1000000);
        const remainder = integer % 1000000;
        let result = millions === 1 ? 'UN MILLÓN' : this.numberToWords(millions) + ' MILLONES';
        if (remainder > 0) {
          result += ' ' + this.numberToWords(remainder);
        }
        return result;
      }
      return 'NÚMERO DEMASIADO GRANDE';
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
