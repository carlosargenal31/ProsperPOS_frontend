<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4 class="fw-bold">Estado Cuenta Compras</h4>
            <h6>Reporte consolidado de documentos de compras</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a @click="exportAllToPDF" data-bs-toggle="tooltip" data-bs-placement="top" title="Pdf">
              <img src="@/assets/img/icons/pdf.svg" alt="img" />
            </a>
          </li>
          <li>
            <a @click="exportAllToExcel" data-bs-toggle="tooltip" data-bs-placement="top" title="Excel">
              <img src="@/assets/img/icons/excel.svg" alt="img" />
            </a>
          </li>
          <li>
            <a @click="refreshDocuments" data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh">
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Collapse"
              id="collapse-header"
              @click="toggleHeader"
            >
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
      </div>

      <!-- Filters Card -->
      <div class="card">
        <div class="card-body">
          <div class="row row-gap-2 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Proveedor</label>
              <div class="input-group">
                <button class="btn btn-info btn-sm" @click="showSupplierModal = true">
                  <i class="ti ti-search"></i>
                </button>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :value="selectedSupplierName"
                  readonly
                  placeholder="Nombre Proveedor"
                />
              </div>
            </div>
            <div class="col-md-2">
              <label class="form-label">Tipo de documento</label>
              <select class="form-select form-select-sm" v-model="filters.document_type">
                <option value="">TODOS LOS DOCUMENTOS</option>
                <option value="factura_compra">FACTURA COMPRA</option>
                <option value="">COTIZACIÓN</option>
                <option value="">FACT EN ESPERA</option>
                <option value="">GUÍA DE REMISIÓN</option>
                <option value="devolucion_compra">DEVOLUCIÓN COMPRA</option>
                <option value="nota_credito_compra">NOTA DE CRÉDITO COMPRA</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Estatus</label>
              <select class="form-select form-select-sm" v-model="filters.status">
                <option value="">TODOS LOS ESTATUS</option>
                <option value="paid">COBRADO</option>
                <option value="active">ACTIVO</option>
                <option value="pending">PENDIENTE</option>
                <option value="converted_to_invoice">IMPORTADO</option>
                <option value="overdue">VENCIDO</option>
                <option value="returned">DEVUELTO</option>
                <option value="completed">COMPLETADO</option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary btn-sm w-100" @click="showSaveReportModal = true">
                <i class="ti ti-download me-1"></i> GUARDAR REPORTE
              </button>
            </div>
            <div class="col-md-2">
              <label class="form-label">Agencia</label>
              <select class="form-select form-select-sm" v-model="filters.branch">
                <option value="">TODAS LAS AGENCIAS</option>
                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.nombre }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Usuario</label>
              <select class="form-select form-select-sm" v-model="filters.user">
                <option value="">TODOS LOS VENDEDORES</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Fecha Emisión Desde</label>
              <input type="date" class="form-control form-control-sm" v-model="filters.date_from" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Fecha Hasta</label>
              <input type="date" class="form-control form-control-sm" v-model="filters.date_to" />
            </div>
            <div class="col-md-2">
              <button class="btn btn-secondary btn-sm w-100" @click="clearFilters">
                <i class="ti ti-x me-1"></i> LIMPIAR FILTROS
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents Table -->
      <div class="card table-list-card">
        <div class="card-header">
          <h4>Documentos de Compras ({{ filteredDocuments.length }} registros)</h4>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Emisión</th>
                  <th>Vence</th>
                  <th>Documento</th>
                  <th>Agencia</th>
                  <th>Proveedor</th>
                  <th>Usuario</th>
                  <th>Usuario</th>
                  <th class="text-end">Total(L)</th>
                  <th>Estatus</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in paginatedDocuments" :key="`${doc.type}-${doc.id}`">
                  <td class="p-2">{{ formatDate(doc.emission_date) }}</td>
                  <td class="p-2" :class="getDueDateClass(doc.emission_date, doc.type)">
                    <strong>{{ formatDueDate(doc.emission_date, doc.type) }}</strong>
                  </td>
                  <td class="p-2">
                    <div>
                      <span class="badge" :class="getDocTypeBadgeClass(doc.type, doc.status)">
                        {{ getDocTypeLabel(doc.type, doc.status) }}
                      </span>
                    </div>
                    <a href="#" class="text-primary">
                      {{ doc.type === 'nota_credito_compra' ? (doc.credit_note_number || doc.credit_note_correlative || doc.document_number) : doc.document_number }}
                    </a>
                  </td>
                  <td class="p-2">{{ doc.branch_name || 'AGENCIA PRINCIPAL' }}</td>
                  <td class="p-2">{{ doc.supplier_name }}</td>
                  <td class="p-2">{{ doc.user_name || 'N/A' }}</td>
                  <td class="p-2">{{ doc.created_by_name || 'N/A' }}</td>
                  <td class="p-2 text-end fw-bold">{{ formatCurrency(doc.total) }}</td>
                  <td class="p-2">
                    <div>
                      <span class="badge" :class="getStatusBadgeClass(doc.status)">
                        {{ getStatusLabel(doc.status) }}
                      </span>
                    </div>
                    <div v-if="doc.type === 'devolucion_compra' && (doc.credit_note_number || doc.credit_note_correlative)" class="text-muted small mt-1">
                      NC: {{ doc.credit_note_number || doc.credit_note_correlative }}
                    </div>
                  </td>
                  <td class="p-2 text-center">
                    <button class="btn btn-sm btn-outline-primary" @click="viewDocument(doc)">
                      <i class="ti ti-eye"></i> Visualizar
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredDocuments.length === 0">
                  <td colspan="10" class="text-center text-muted p-4">
                    No hay documentos para mostrar
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="card-footer d-flex justify-content-between align-items-center" v-if="filteredDocuments.length > 0">
          <div>
            Mostrando {{ ((currentPage - 1) * perPage) + 1 }} a {{ Math.min(currentPage * perPage, filteredDocuments.length) }} de {{ filteredDocuments.length }} registros
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary" @click="previousPage" :disabled="currentPage === 1">
              <i class="ti ti-chevron-left"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary" disabled>
              Página {{ currentPage }} de {{ totalPages }}
            </button>
            <button class="btn btn-sm btn-outline-primary" @click="nextPage" :disabled="currentPage === totalPages">
              <i class="ti ti-chevron-right"></i>
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

  <!-- Modal de Búsqueda de Proveedor -->
  <div class="modal fade" :class="{ show: showSupplierModal }" :style="{ display: showSupplierModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Búsqueda de Proveedor</h5>
          <button type="button" class="btn-close btn-close-white" @click="showSupplierModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <input
              type="text"
              class="form-control"
              v-model="supplierSearchQuery"
              placeholder="Buscar proveedor por nombre o RTN..."
              @input="searchSuppliers"
            />
          </div>
          <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="table table-sm table-hover">
              <thead class="table-light sticky-top">
                <tr>
                  <th>Nombre</th>
                  <th>RTN</th>
                  <th>Teléfono</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="supplier in filteredSuppliers" :key="supplier.id">
                  <td>{{ supplier.nombre || supplier.name }}</td>
                  <td>{{ supplier.rtn || 'N/A' }}</td>
                  <td>{{ supplier.telefono || supplier.phone || 'N/A' }}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" @click="selectSupplier(supplier)">
                      Seleccionar
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredSuppliers.length === 0">
                  <td colspan="4" class="text-center text-muted">No se encontraron proveedors</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showSupplierModal" @click="showSupplierModal = false"></div>

  <!-- Modal de Visualización de Documento -->
  <div class="modal fade" :class="{ show: showDocumentModal }" :style="{ display: showDocumentModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-white py-2">
          <h6 class="modal-title mb-0">
            {{ currentDocument && currentDocument.type === 'devolucion_compra' ? 'DEVOLUCIÓN COMPRA' : (currentDocument ? getDocTypeLabel(currentDocument.type) : 'Documento') }} - {{ currentDocument ? (currentDocument.correlative || currentDocument.document_number) : '' }}
          </h6>
          <button type="button" class="btn-close" @click="closeDocumentModal"></button>
        </div>

        <div class="modal-body py-2 px-3">
          <!-- Preview del documento -->
          <div ref="documentContent" class="border p-2 bg-white document-preview" style="max-height: 450px; overflow-y: auto;">
            <div v-if="currentDocument">

              <!-- VISTA PARA GUÍAS DE REMISIÓN -->
              <div v-if="currentDocument.type === ''">
                <!-- Título -->
                <div class="text-center mb-2 p-2 bg-warning text-dark">
                  <strong style="font-size: 13px;">🚚 Detalle de Guía de Remisión #{{ currentDocument.document_number }}</strong>
                </div>

                <!-- Información General -->
                <div class="mb-2 p-2 border-bottom">
                  <div class="d-flex align-items-center mb-1">
                    <i class="ti ti-info-circle me-2 text-primary"></i>
                    <strong style="font-size: 11px;">Información General</strong>
                  </div>
                  <div class="row" style="font-size: 10px;">
                    <div class="col-6"><strong>Número de Guía:</strong> {{ currentDocument.document_number }}</div>
                    <div class="col-6"><strong>Fecha de Emisión:</strong> {{ formatDate(currentDocument.emission_date) }}</div>
                    <div class="col-6"><strong>Estado:</strong> <span class="badge bg-warning">{{ currentDocument.status }}</span></div>
                    <div class="col-6"><strong>Factura Relacionada:</strong> {{ currentDocument.invoice_number || '#N' }}</div>
                  </div>
                </div>

                <!-- Proveedor -->
                <div class="mb-2 p-2 border-bottom">
                  <div class="d-flex align-items-center mb-1">
                    <i class="ti ti-user me-2 text-success"></i>
                    <strong style="font-size: 11px;">Proveedor</strong>
                  </div>
                  <div style="font-size: 10px;">
                    <strong>Nombre:</strong> {{ currentDocument.supplier_name || 'CONSUMIDOR FINAL' }}
                  </div>
                </div>

                <!-- Receptor (si existe) -->
                <div class="mb-2 p-2 border-bottom" v-if="currentDocument.receiver_name">
                  <div class="d-flex align-items-center mb-1">
                    <i class="ti ti-user-check me-2 text-info"></i>
                    <strong style="font-size: 11px;">Receptor</strong>
                  </div>
                  <div class="row" style="font-size: 10px;">
                    <div class="col-6"><strong>Nombre:</strong> {{ currentDocument.receiver_name }}</div>
                    <div class="col-6"><strong>Teléfono:</strong> {{ currentDocument.receiver_phone || 'N/A' }}</div>
                  </div>
                  <div v-if="currentDocument.receiver_alt_name" class="mt-1" style="font-size: 10px;">
                    <strong>Receptor Alternativo:</strong> {{ currentDocument.receiver_alt_name }} - {{ currentDocument.receiver_alt_phone || 'N/A' }}
                  </div>
                </div>

                <!-- Transporte -->
                <div class="mb-2 p-2 border-bottom">
                  <div class="d-flex align-items-center mb-1">
                    <i class="ti ti-truck me-2 text-danger"></i>
                    <strong style="font-size: 11px;">Transporte</strong>
                  </div>
                  <div class="row" style="font-size: 10px;">
                    <div class="col-6"><strong>Conductor:</strong> {{ currentDocument.driver_name || 'N/A' }}</div>
                    <div class="col-6"><strong>Licencia:</strong> {{ currentDocument.driver_license || 'N/A' }}</div>
                    <div class="col-6"><strong>Vehículo:</strong> {{ currentDocument.vehicle_plate || 'N/A' }}</div>
                    <div class="col-6"><strong>Acompañante:</strong> {{ currentDocument.assistant_name || 'N/A' }}</div>
                  </div>
                </div>

                <!-- Origen y Destino -->
                <div class="row mb-2">
                  <div class="col-6 p-2 border-end">
                    <div class="d-flex align-items-center mb-1">
                      <i class="ti ti-map-pin me-2 text-secondary"></i>
                      <strong style="font-size: 11px;">Origen</strong>
                    </div>
                    <div style="font-size: 10px;">
                      <strong>Dirección:</strong> {{ currentDocument.origin_address || 'N/A' }}<br>
                      <strong>Ciudad:</strong> {{ currentDocument.origin_city || 'LA CEIBA' }}, {{ currentDocument.origin_state || 'Atlántida' }}
                    </div>
                  </div>
                  <div class="col-6 p-2">
                    <div class="d-flex align-items-center mb-1">
                      <i class="ti ti-map-pin-filled me-2 text-primary"></i>
                      <strong style="font-size: 11px;">Destino</strong>
                    </div>
                    <div style="font-size: 10px;">
                      <strong>Dirección:</strong> {{ currentDocument.destination_address || 'N/A' }}<br>
                      <strong>Ciudad:</strong> {{ currentDocument.destination_city || 'El Porvenir' }}, {{ currentDocument.destination_state || 'Atlántida' }}
                      <div v-if="currentDocument.destination_reference"><small>{{ currentDocument.destination_reference }}</small></div>
                    </div>
                  </div>
                </div>

                <!-- Observaciones -->
                <div v-if="currentDocument.notes" class="mb-2 p-2 border-top">
                  <div class="d-flex align-items-center mb-1">
                    <i class="ti ti-note me-2"></i>
                    <strong style="font-size: 11px;">Observaciones</strong>
                  </div>
                  <div style="font-size: 10px;">{{ currentDocument.notes }}</div>
                </div>

                <!-- Productos Transportados -->
                <div class="mb-2 p-2 border-top">
                  <div class="d-flex align-items-center mb-2">
                    <i class="ti ti-package me-2 text-success"></i>
                    <strong style="font-size: 11px;">Productos Transportados</strong>
                  </div>
                  <table class="table table-sm table-bordered mb-0" style="font-size: 10px;">
                    <thead class="table-light">
                      <tr>
                        <th style="padding: 3px;">Código</th>
                        <th style="padding: 3px;">Artículo</th>
                        <th class="text-center" style="padding: 3px;">Peso/Unit</th>
                        <th class="text-center" style="padding: 3px;">Cantidad</th>
                        <th class="text-center" style="padding: 3px;">Peso Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in currentDocument.items" :key="item.id">
                        <td style="padding: 3px;">{{ item.product_code || item.codigo || 'N/A' }}</td>
                        <td style="padding: 3px;">{{ item.product_name }}</td>
                        <td class="text-center" style="padding: 3px;">{{ formatWeight(item.weight) }}</td>
                        <td class="text-center" style="padding: 3px;">{{ item.quantity }}</td>
                        <td class="text-center" style="padding: 3px;">{{ formatTotalWeight(item.weight, item.quantity) }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr class="table-active">
                        <td colspan="4" class="text-end" style="padding: 3px;"><strong>PESO TOTAL:</strong></td>
                        <td class="text-center" style="padding: 3px;"><strong>{{ getTotalWeightForDocument(currentDocument.items) }}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <!-- NOTA DE CRÉDITO COMPRA -->
              <div v-else-if="currentDocument.type === 'nota_credito_compra'" id="creditNoteContent">
                <div class="text-center mb-2">
                  <strong style="font-size: 13px;">{{ companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;">{{ companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.telefono || 'N/A' }}</small>
                </div>

                <h6 class="text-danger text-center mb-2" style="font-size: 14px;">NOTA DE CRÉDITO COMPRA</h6>

                <!-- Información de Resolución -->
                <div class="d-flex justify-content-around border p-1 mb-1" style="font-size: 10px;" v-if="currentDocument.cai">
                  <span><strong>Autorización:</strong> {{ currentDocument.cai || currentDocument.numero_resolucion || 'N/A' }}</span>
                  <span><strong>Rango:</strong> {{ currentDocument.nro_inicial_control || '' }} - {{ currentDocument.nro_final_control || '' }}</span>
                </div>

                <!-- Información del Documento -->
                <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
                  <span><strong>Nro. Nota Crédito:</strong> {{ currentDocument.credit_note_number || currentDocument.correlative || currentDocument.document_number || 'N/A' }}</span>
                  <span><strong>Factura Original:</strong> {{ currentDocument.invoice_number }}</span>
                  <span><strong>Fecha:</strong> {{ formatDate(currentDocument.emission_date) }}</span>
                </div>

                <div class="mb-2" style="font-size: 10px;">
                  <strong>Proveedor:</strong> {{ currentDocument.supplier_name }}<br>
                  <strong>RTN Proveedor:</strong> {{ currentDocument.supplier_rtn || '00000000000000' }}
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
                    <tr v-for="item in currentDocument.items" :key="item.id">
                      <td style="padding: 4px;">{{ item.product_code || 'N/A' }}</td>
                      <td style="padding: 4px;">{{ item.product_name }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.quantity) }}</td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(item.unit_price) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.discount_value || 0) }}%</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.tax_rate || 0) }}%</td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(item.total || calculateItemTotal(item)) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="6" class="text-end" style="padding: 4px;"><strong>SUBTOTAL:</strong></td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(currentDocument.subtotal) }}</td>
                    </tr>
                    <tr>
                      <td colspan="6" class="text-end" style="padding: 4px;"><strong>DESCUENTO:</strong></td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(currentDocument.discount) }}</td>
                    </tr>
                    <tr>
                      <td colspan="6" class="text-end" style="padding: 4px;"><strong>ISV 15%:</strong></td>
                      <td class="text-end" style="padding: 4px;">L {{ formatCurrency(currentDocument.tax) }}</td>
                    </tr>
                    <tr class="table-active">
                      <td colspan="6" class="text-end" style="padding: 4px;"><strong>TOTAL:</strong></td>
                      <td class="text-end" style="padding: 4px;"><strong>L {{ formatCurrency(currentDocument.total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>

                <div v-if="currentDocument.notes" class="mb-1" style="font-size: 10px;">
                  <strong>Notas:</strong> {{ currentDocument.notes }}
                </div>

                <div class="text-center mb-0" style="font-size: 9px;">
                  <p class="mb-0">Original: Proveedor | Copia: Archivo</p>
                </div>
              </div>

              <!-- DEVOLUCIÓN COMPRA -->
              <div v-else-if="currentDocument.type === 'devolucion_compra'" id="returnContent">
                <div class="text-center mb-2">
                  <strong style="font-size: 13px;">{{ companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;">{{ companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.telefono || 'N/A' }}</small>
                </div>

                <h6 class="text-primary text-center mb-2" style="font-size: 14px;">DEVOLUCIÓN COMPRA</h6>

                <!-- Información del Documento -->
                <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
                  <span><strong>DEVOLUCIÓN COMPRA:</strong> {{ currentDocument.correlative || currentDocument.document_number }}</span>
                  <span><strong>Doc/Devuelto:</strong> {{ currentDocument.invoice_number }}</span>
                  <span><strong>Fecha:</strong> {{ formatDate(currentDocument.emission_date) }}</span>
                </div>

                <div class="mb-2" style="font-size: 10px;">
                  <strong>Proveedor:</strong> {{ currentDocument.supplier_name }}<br>
                  <strong>RTN:</strong> {{ currentDocument.supplier_rtn || '00000000000000' }}<br>
                  <strong>Condiciones:</strong> Contado | <strong>Entrega:</strong> {{ formatDate(currentDocument.emission_date) }}
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
                    <tr v-for="item in currentDocument.items" :key="item.id">
                      <td style="padding: 4px;">{{ item.product_code || 'N/A' }}</td>
                      <td style="padding: 4px;">{{ item.product_name }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.unit_price) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.quantity) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.discount_value || 0) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(calculateItemTotal(item)) }}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="mb-1" style="font-size: 10px;">
                  <strong>TOTAL:</strong> {{ numberToWords(currentDocument.total) }} L {{ String(Math.floor((currentDocument.total % 1) * 100)).padStart(2, '0') }}/100
                </div>

                <div class="text-center mb-1" style="font-size: 9px;">
                  <p class="mb-0">Original Proveedor | Copia Obligado Tributario Emisor</p>
                </div>
              </div>

              <!-- COTIZACIÓN -->
              <div v-else-if="currentDocument.type === ''" id="quoteContent">
                <div class="text-center mb-2">
                  <strong style="font-size: 13px;">{{ companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;">{{ companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.telefono || 'N/A' }}</small>
                </div>

                <h6 class="text-info text-center mb-2" style="font-size: 14px;">COTIZACIÓN</h6>

                <!-- Información del Documento -->
                <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
                  <span><strong>Documento:</strong> {{ currentDocument.document_number || currentDocument.full_number }}</span>
                  <span><strong>Fecha:</strong> {{ formatDate(currentDocument.emission_date || currentDocument.quote_date) }}</span>
                </div>

                <div class="mb-2" style="font-size: 10px;">
                  <strong>Proveedor:</strong> {{ currentDocument.supplier_name }}<br>
                  <strong>RTN:</strong> {{ currentDocument.supplier_rtn || '00000000000000' }}
                </div>

                <!-- Tabla de Productos -->
                <table class="table table-sm table-bordered mb-2" style="font-size: 10px;">
                  <thead class="table-light">
                    <tr>
                      <th style="padding: 4px;">Código</th>
                      <th style="padding: 4px;">Producto</th>
                      <th class="text-end" style="padding: 4px;">Cant.</th>
                      <th class="text-end" style="padding: 4px;">Precio</th>
                      <th class="text-end" style="padding: 4px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in currentDocument.items" :key="item.id">
                      <td style="padding: 4px;">{{ item.product_code || 'N/A' }}</td>
                      <td style="padding: 4px;">{{ item.product_name }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.quantity) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.unit_price || item.price) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.total || calculateItemTotal(item)) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="table-active">
                      <td colspan="4" class="text-end" style="padding: 4px;"><strong>TOTAL:</strong></td>
                      <td class="text-end" style="padding: 4px;"><strong>L {{ formatCurrency(currentDocument.total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- FACTURA COMPRA / GUIA DE REMISION / FACT EN ESPERA -->
              <div v-else id="genericDocContent">
                <div class="text-center mb-2">
                  <strong style="font-size: 13px;">{{ companyInfo.company_name || 'EMPRESA' }}</strong><br>
                  <small style="font-size: 10px;">{{ companyInfo.direccion || 'Sin dirección' }}</small><br>
                  <small style="font-size: 10px;">Tel: {{ companyInfo.telefono || 'N/A' }}</small>
                </div>

                <h6 class="text-info text-center mb-2" style="font-size: 14px;">{{ getDocTypeLabel(currentDocument.type) }}</h6>

                <!-- Información del Documento -->
                <div class="d-flex justify-content-around border p-1 mb-2" style="font-size: 10px;">
                  <span><strong>Documento:</strong> {{ currentDocument.document_number || currentDocument.full_number }}</span>
                  <span><strong>Fecha:</strong> {{ formatDate(currentDocument.emission_date || currentDocument.issue_date) }}</span>
                </div>

                <div class="mb-2" style="font-size: 10px;">
                  <strong>Proveedor:</strong> {{ currentDocument.supplier_name }}<br>
                  <strong>RTN:</strong> {{ currentDocument.supplier_rtn || '00000000000000' }}
                </div>

                <!-- Tabla de Productos -->
                <table class="table table-sm table-bordered mb-2" style="font-size: 10px;">
                  <thead class="table-light">
                    <tr>
                      <th style="padding: 4px;">Código</th>
                      <th style="padding: 4px;">Producto</th>
                      <th class="text-end" style="padding: 4px;">Cant.</th>
                      <th class="text-end" style="padding: 4px;">Precio</th>
                      <th class="text-end" style="padding: 4px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in currentDocument.items" :key="item.id">
                      <td style="padding: 4px;">{{ item.product_code || 'N/A' }}</td>
                      <td style="padding: 4px;">{{ item.product_name }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.quantity) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.unit_price || item.price) }}</td>
                      <td class="text-end" style="padding: 4px;">{{ formatCurrency(item.total || calculateItemTotal(item)) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="table-active">
                      <td colspan="4" class="text-end" style="padding: 4px;"><strong>TOTAL:</strong></td>
                      <td class="text-end" style="padding: 4px;"><strong>L {{ formatCurrency(currentDocument.total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
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
              <li><a class="dropdown-item" href="#" @click.prevent="exportDocument('excel')"><i class="ti ti-file-spreadsheet me-2"></i>GUARDAR EXCEL</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="exportDocument('pdf')"><i class="ti ti-file-type-pdf me-2"></i>GUARDAR PDF</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="exportDocument('image')"><i class="ti ti-photo me-2"></i>GUARDAR IMAGEN</a></li>
            </ul>
          </div>
          <button type="button" class="btn btn-sm btn-info" @click="printDocument">
            <i class="ti ti-printer me-1"></i> IMPRIMIR
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showDocumentModal" @click="closeDocumentModal"></div>

  <!-- Modal Guardar Reporte -->
  <div v-if="showSaveReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Guardar Reporte - Estado Cuenta Compras</h5>
          <button type="button" class="btn-close" @click="showSaveReportModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-3">Selecciona el formato en el que deseas guardar el reporte:</p>
          <div class="d-grid gap-2">
            <button class="btn btn-outline-success" @click="saveReportAsExcel">
              <i class="ti ti-file-spreadsheet me-2"></i> Guardar como Excel
            </button>
            <button class="btn btn-outline-danger" @click="saveReportAsPDF">
              <i class="ti ti-file-type-pdf me-2"></i> Guardar como PDF
            </button>
            <button class="btn btn-outline-primary" @click="saveReportAsImage">
              <i class="ti ti-photo me-2"></i> Guardar como Imagen
            </button>
            <button class="btn btn-outline-secondary" @click="printReportTable">
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
import { LOGO_BASE64 } from '@/assets/img/logo.js';

export default {
  data() {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      showSupplierModal: false,
      showDocumentModal: false,
      showExportDropdown: false,
      showSaveReportModal: false,
      currentDocument: null,
      documents: [],
      suppliers: [],
      branches: [],
      users: [],
      supplierSearchQuery: '',
      selectedSupplier: null,
      filters: {
        supplier_id: '',
        document_type: '',
        status: '',
        branch: '',
        user: '',
        date_from: `${firstOfMonth.getFullYear()}-${String(firstOfMonth.getMonth() + 1).padStart(2, '0')}-01`,
        date_to: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      },
      companyInfo: {},
      bankAccounts: [],
      currentPage: 1,
      perPage: 10,
      isLoading: false
    };
  },
  computed: {
    selectedSupplierName() {
      return this.selectedSupplier ? (this.selectedSupplier.nombre || this.selectedSupplier.name) : '';
    },
    filteredSuppliers() {
      if (!this.supplierSearchQuery) return this.suppliers;

      const query = this.supplierSearchQuery.toLowerCase();
      return this.suppliers.filter(c => {
        const name = (c.nombre || c.name || '').toLowerCase();
        const rtn = (c.rtn || '').toLowerCase();
        return name.includes(query) || rtn.includes(query);
      });
    },
    filteredDocuments() {
      let docs = [...this.documents];

      // Filtro por proveedor
      if (this.filters.supplier_id) {
        docs = docs.filter(d => d.supplier_id === this.filters.supplier_id);
      }

      // Filtro por tipo de documento
      if (this.filters.document_type) {
        docs = docs.filter(d => d.type === this.filters.document_type);
      }

      // Filtro por estatus
      if (this.filters.status) {
        docs = docs.filter(d => d.status === this.filters.status);
      }

      // Filtro por agencia
      if (this.filters.branch) {
        docs = docs.filter(d => d.branch_id == this.filters.branch);
      }

      // Filtro por usuario
      if (this.filters.user) {
        docs = docs.filter(d => d.user_id == this.filters.user);
      }

      // Ordenamiento por defecto: por fecha de emisión descendente
      docs.sort((a, b) => new Date(b.emission_date) - new Date(a.emission_date));

      return docs;
    },
    paginatedDocuments() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredDocuments.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredDocuments.length / this.perPage);
    }
  },
  watch: {
    'filters.supplier_id'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.document_type'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.status'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.branch'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.user'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.date_from'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    },
    'filters.date_to'() {
      this.currentPage = 1;
      this.loadAllDocuments();
    }
  },
  mounted() {
    this.loadCompanyInfo();
    this.loadSuppliers();
    this.loadBranches();
    this.loadVendors();
    this.loadBankAccounts();
    this.loadAllDocuments();
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
    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
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
        this.companyInfo = {
          company_name: 'ProsperPOS',
          direccion: 'Honduras',
          telefono: 'N/A',
          rtn: 'N/A'
        };
      }
    },
    async loadSuppliers() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/suppliers', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.suppliers = response.data.data.data || response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading suppliers:', error);
      }
    },
    async loadBranches() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/branches', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.branches = response.data.data.data || response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading branches:', error);
      }
    },
    async loadVendors() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            limit: 10000,
            role: 4  // Role de usuario
          }
        });

        console.log('📦 Vendors response:', response.data);

        let usersData = [];

        // Estructura: { success: true, data: { data: [...], pagination: {...} } }
        if (response.data && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          console.log('✅ Found users in response.data.data.data');
          usersData = response.data.data.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log('✅ Found users in response.data.data (as array)');
          usersData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          console.log('✅ Found users in response.data');
          usersData = response.data;
        }

        console.log(`📋 Total usuarioes encontrados: ${usersData.length}`);

        this.users = usersData.map(u => ({
          id: u.id,
          code: u.id,
          name: `${u.first_name} ${u.last_name}`.trim()
        }));

        console.log('✅ Usuarioes cargados:', this.users);
      } catch (error) {
        console.error('❌ Error loading users:', error);
      }
    },
    async loadBankAccounts() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/bank-accounts', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          this.bankAccounts = response.data.data.data || response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading bank accounts:', error);
        this.bankAccounts = [];
      }
    },
    async loadAllDocuments() {
      this.isLoading = true;
      const token = localStorage.getItem('token');

      try {
        // Usar el endpoint consolidado del backend
        const params = {};

        // Agregar filtros opcionales solo si tienen valor
        if (this.filters.date_from) params.date_from = this.filters.date_from;
        if (this.filters.date_to) params.date_to = this.filters.date_to;
        if (this.filters.supplier_id) params.supplier_id = this.filters.supplier_id;
        if (this.filters.branch) params.branch_id = this.filters.branch;
        if (this.filters.user) params.user_id = this.filters.user;
        if (this.filters.document_type) params.document_type = this.filters.document_type;
        if (this.filters.status) params.status = this.filters.status;

        const response = await axios.get('/api/v1/purchase-statement', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });

        if (response.data.success) {
          this.documents = response.data.data || [];
        } else {
          this.documents = [];
        }
      } catch (error) {
        console.error('Error loading documents:', error);
        this.documents = [];
      } finally {
        this.isLoading = false;
      }
    },
    searchSuppliers() {
      // El filtrado se hace automáticamente en el computed property
    },
    selectSupplier(supplier) {
      this.selectedSupplier = supplier;
      this.filters.supplier_id = supplier.id;
      this.showSupplierModal = false;
    },
    clearFilters() {
      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      this.selectedSupplier = null;
      this.filters = {
        supplier_id: '',
        document_type: '',
        status: '',
        branch: '',
        user: '',
        date_from: `${firstOfMonth.getFullYear()}-${String(firstOfMonth.getMonth() + 1).padStart(2, '0')}-01`,
        date_to: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      };
      this.currentPage = 1;
    },
    refreshDocuments() {
      this.loadAllDocuments();
    },
    async viewDocument(doc) {
      // Cargar los detalles completos del documento usando el endpoint consolidado
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(`/api/v1/purchase-statement/${doc.type}/${doc.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response && response.data.success) {
          this.currentDocument = response.data.data;
          this.showDocumentModal = true;
        }
      } catch (error) {
        console.error('Error loading document details:', error);
        // Fallback: usar el documento sin items detallados
        this.currentDocument = { ...doc, items: [] };
        this.showDocumentModal = true;
      }
    },
    closeDocumentModal() {
      this.showDocumentModal = false;
      this.showExportDropdown = false;
      this.currentDocument = null;
    },
    async exportDocument(format) {
      this.showExportDropdown = false;

      if (format === 'excel') {
        await this.exportToExcel();
      } else if (format === 'pdf') {
        await this.exportToPDF();
      } else if (format === 'image') {
        await this.exportToImage();
      }
    },
    async exportToExcel() {
      // Si es devolución, usar formato específico
      if (this.currentDocument.type === 'devolucion_compra') {
        const data = [
          ['DEVOLUCIÓN COMPRA'],
          [''],
          ['Empresa:', this.companyInfo.company_name || 'EMPRESA'],
          ['RTN:', this.companyInfo.rtn || 'N/A'],
          ['Dirección:', this.companyInfo.direccion || 'Sin dirección'],
          ['Teléfono:', this.companyInfo.telefono || 'N/A'],
          [''],
          ['No. Devolución:', this.currentDocument.correlative || this.currentDocument.document_number],
          ['Doc. Devuelto:', this.currentDocument.invoice_number || 'N/A'],
          ['Fecha:', this.formatDate(this.currentDocument.emission_date)],
          ['Sucursal:', this.currentDocument.branch_name || 'N/A'],
          [''],
          ['Proveedor:', this.currentDocument.supplier_name],
          ['RTN Proveedor:', this.currentDocument.supplier_rtn || '00000000000000'],
          [''],
          ['Código', 'Producto', 'Cantidad', 'Precio Unit.', 'Desc %', 'Total']
        ];

        this.currentDocument.items.forEach(item => {
          const qty = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.unit_price || item.price) || 0;
          const discountValue = parseFloat(item.discount_value) || 0;
          const itemTotal = this.calculateItemTotal(item);

          data.push([
            item.product_code || 'N/A',
            item.product_name,
            qty,
            price,
            discountValue,
            itemTotal
          ]);
        });

        data.push(['']);
        data.push(['', '', '', '', 'SUBTOTAL:', this.currentDocument.subtotal || 0]);
        data.push(['', '', '', '', 'DESCUENTO:', this.currentDocument.discount || 0]);
        data.push(['', '', '', '', 'ISV (15%):', this.currentDocument.tax || 0]);
        data.push(['', '', '', '', 'TOTAL:', this.currentDocument.total]);

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Devolución');
        XLSX.writeFile(wb, `DEVOLUCION_${this.currentDocument.correlative || this.currentDocument.document_number}.xlsx`);
        return;
      }

      // Formato normal para otros documentos
      const data = [
        [this.getDocTypeLabel(this.currentDocument.type)],
        [''],
        ['Empresa:', this.companyInfo.company_name || 'EMPRESA'],
        ['Dirección:', this.companyInfo.direccion || 'Sin dirección'],
        ['Teléfono:', this.companyInfo.telefono || 'N/A'],
        [''],
        ['Nro. Documento:', this.currentDocument.document_number],
        ['Fecha Emisión:', this.formatDate(this.currentDocument.emission_date)],
        ['Proveedor:', this.currentDocument.supplier_name],
        ['Usuario:', this.currentDocument.user_name || 'N/A'],
        [''],
        ['Producto', 'Cantidad', 'Precio Unit.', 'Desc %', 'Total']
      ];

      this.currentDocument.items.forEach(item => {
        data.push([
          item.product_name,
          item.quantity,
          item.unit_price || item.price,
          item.discount_value || 0,
          this.calculateItemTotal(item)
        ]);
      });

      data.push(['']);
      data.push(['', '', '', 'SUBTOTAL:', this.currentDocument.subtotal || 0]);
      data.push(['', '', '', 'DESCUENTO:', this.currentDocument.discount || 0]);
      data.push(['', '', '', 'ISV:', this.currentDocument.tax || 0]);
      data.push(['', '', '', 'TOTAL:', this.currentDocument.total]);

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Documento');
      XLSX.writeFile(wb, `${this.getDocTypeLabel(this.currentDocument.type)}_${this.currentDocument.document_number}.xlsx`);
    },
    async exportToPDF() {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildDocumentHTML();
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
        const imgWidth = 216;
        const pageHeight = 279;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${this.getDocTypeLabel(this.currentDocument.type)}_${this.currentDocument.document_number}.pdf`);
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error al generar el PDF');
      }
    },
    async exportToImage() {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildDocumentHTML();
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
        link.download = `${this.getDocTypeLabel(this.currentDocument.type)}_${this.currentDocument.document_number}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Error al generar la imagen');
      }
    },
    printDocument() {
      const printWindow = window.open('', '_blank');
      const html = this.buildDocumentHTML();
      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
      };
    },
    buildDocumentHTML() {
      const docTitle = this.getDocTypeLabel(this.currentDocument.type);
      const docColor = '#FF9800'; // Naranja/Amarillo uniforme

      // Si es GUÍA DE REMISIÓN, usar formato especial
      if (this.currentDocument.type === '') {
        return this.buildShippingGuideHTML();
      }

      // Devoluciones y notas de crédito usan el mismo formato que los demás documentos

      // Construir filas de la tabla según el tipo de documento
      let tableRows = '';
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      this.currentDocument.items.forEach((item, index) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price || item.price) || 0;
        const discountValue = parseFloat(item.discount_value) || 0;
        const taxRate = parseFloat(item.tax_rate) || 0;

        const itemSubtotal = qty * price;
        const itemDiscount = itemSubtotal * (discountValue / 100);
        const itemAfterDiscount = itemSubtotal - itemDiscount;
        const itemTax = itemAfterDiscount * (taxRate / 100);
        const itemTotal = itemAfterDiscount + itemTax;

        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
        totalTax += itemTax;

        tableRows += `
          <tr>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${String(index + 1).padStart(2, '0')}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.product_code || 'N/A'}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${item.product_name}</td>
            <td style="padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 10px;">${this.formatCurrency(qty)}</td>
            <td style="padding: 6px; text-align: right; border-bottom: 1px solid #e0e0e0; font-size: 10px;">L ${this.formatCurrency(price)}</td>
            <td style="padding: 6px; text-align: right; border-bottom: 1px solid #e0e0e0; font-weight: 600; font-size: 10px;">L ${this.formatCurrency(itemTotal)}</td>
          </tr>
        `;
      });

      const documentDiscount = parseFloat(this.currentDocument.discount || this.currentDocument.total_discount) || 0;
      const documentSurcharges = parseFloat(this.currentDocument.surcharges || this.currentDocument.surcharge) || 0;
      const finalDiscount = documentDiscount > 0 ? documentDiscount : totalDiscount;
      const finalSurcharges = documentSurcharges;
      const grandTotal = subtotal - finalDiscount + totalTax + finalSurcharges;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${docTitle} - ${this.currentDocument.document_number || this.currentDocument.correlative}</title>
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
              min-width: 230px;
            }
            .invoice-title {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .invoice-meta {
              font-size: 12px;
              line-height: 1.6;
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
            .footer-signature {
              display: flex;
              justify-content: center;
              margin-bottom: 20px;
            }
            .signature-box { text-align: center; padding: 20px; }
            .signature-line {
              width: 300px;
              height: 1px;
              background: #000;
              margin: 40px auto 10px;
            }
            .signature-box p {
              font-size: 10px;
              color: #000;
              margin: 4px 0;
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
                  <strong>Proveedor:</strong> ${this.currentDocument.supplier_name || 'CONSUMIDOR FINAL'}<br>
                  <strong>RTN:</strong> ${this.currentDocument.supplier_rtn || '00000000000000'}<br>
                  ${this.currentDocument.type !== 'devolucion_compra' && this.currentDocument.type !== 'nota_credito_compra' ? `<strong>Usuario:</strong> ${this.currentDocument.user_name || this.currentDocument.created_by_name || 'N/A'}` : ''}
                </div>
              </div>
              <div class="invoice-header">
                <div class="invoice-title">${docTitle}: ${this.currentDocument.correlative || this.currentDocument.document_number || this.currentDocument.full_number || 'N/A'}</div>
                <div class="invoice-meta">
                  <strong>#Control Interno:</strong> ${(() => {
                    const num = this.currentDocument.correlative || this.currentDocument.document_number || this.currentDocument.full_number || '0';
                    const numStr = String(num);
                    return /^[0-9]+$/.test(numStr) ? numStr.padStart(10, '0') : numStr;
                  })()}<br>
                  ${this.currentDocument.type === 'devolucion_compra' || this.currentDocument.type === 'nota_credito_compra' ? `<strong>Doc/Devuelto:</strong> ${this.currentDocument.invoice_number || 'N/A'}<br>` : ''}
                  <strong>Sucursal:</strong> ${this.currentDocument.branch_name || this.companyInfo.company_name || 'AGENCIA PRINCIPAL'}<br>
                  <strong>Emisión:</strong> ${this.formatDate(this.currentDocument.emission_date || this.currentDocument.issue_date || this.currentDocument.quote_date)}<br>
                  <strong>Condiciones de la Transacción:</strong> ${this.currentDocument.payment_terms || 'Contado'}<br>
                  <strong>Entrega:</strong> ${this.formatDate(this.currentDocument.emission_date || this.currentDocument.issue_date || this.currentDocument.quote_date)}<br>
                  ${this.currentDocument.invoice_number && this.currentDocument.type !== 'devolucion_compra' && this.currentDocument.type !== 'nota_credito_compra' ? `<strong>Factura Orig.:</strong> ${this.currentDocument.invoice_number}<br>` : ''}
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
                  <strong>TOTAL:</strong> ${this.numberToWords(this.currentDocument.total || grandTotal).toUpperCase()} LEMPIRAS ${String(Math.floor(((this.currentDocument.total || grandTotal) % 1) * 100)).padStart(2, '0')}/100
                </div>
                <div style="margin-top: auto; padding-top: 40px; text-align: center;">
                  <div style="border-top: 2px solid #000; width: 250px; margin: 0 auto 10px;"></div>
                  <div style="margin-bottom: 8px;"><strong>Original Proveedor</strong></div>
                  <div><strong>Copia Obligado Tributario Emisor</strong></div>
                </div>
                ${(this.currentDocument.type === 'devolucion_compra' || this.currentDocument.type === 'nota_credito_compra') && this.currentDocument.notes ? `
                <div style="margin-top: 30px; text-align: left; font-size: 12px;">
                  <strong>Notas:</strong> ${this.currentDocument.notes}
                </div>
                ` : ''}
              </div>
              <div class="totals-box">
                <div class="total-row">
                  <span class="label">Importe Exonerado:</span>
                  <span class="value">L ${this.formatCurrency(this.currentDocument.exempt_amount || 0)}</span>
                </div>
                <div class="total-row">
                  <span class="label">Importe Exento:</span>
                  <span class="value">L ${this.formatCurrency(this.currentDocument.tax_exempt_amount || 0)}</span>
                </div>
                <div class="total-row">
                  <span class="label">Gravado 15%</span>
                  <span class="value">L ${this.formatCurrency(subtotal - finalDiscount)}</span>
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
                  <span class="value">L ${this.formatCurrency(finalSurcharges)}</span>
                </div>
                <div class="total-row">
                  <span class="label">DESCUENTOS Y REBAJAS OTORGADOS:</span>
                  <span class="value">L ${this.formatCurrency(finalDiscount)}</span>
                </div>
                <div class="total-row grand-total">
                  <span class="label"><strong>TOTAL:</strong></span>
                  <span class="value"><strong>L ${this.formatCurrency(this.currentDocument.total || grandTotal)}</strong></span>
                </div>
              </div>
            </div>
            ${this.currentDocument.type !== 'devolucion_compra' && this.currentDocument.type !== 'nota_credito_compra' && this.currentDocument.type !== '' ? `
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
            ` : ''}
          </div>
        </body>
        </html>
      `;

      return html;
    },
    buildShippingGuideHTML() {
      const docColor = '#FF9800';
      let tableRows = '';
      this.currentDocument.items.forEach((item, index) => {
        const qty = parseFloat(item.quantity) || 0;
        const weight = parseFloat(item.weight) || 0;
        const totalWeight = qty * weight;
        tableRows += `
          <tr>
            <td style="padding: 6px; text-align: center; border: 1px solid #ddd; font-size: 10px;">${String(index + 1).padStart(2, '0')}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 10px;">${item.product_code || 'N/A'}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 10px;">${item.product_name}</td>
            <td style="padding: 6px; text-align: center; border: 1px solid #ddd; font-size: 10px;">${weight.toFixed(2)}</td>
            <td style="padding: 6px; text-align: center; border: 1px solid #ddd; font-size: 10px;">${this.formatCurrency(qty)}</td>
            <td style="padding: 6px; text-align: center; border: 1px solid #ddd; font-size: 10px;">${totalWeight.toFixed(2)}</td>
          </tr>
        `;
      });

      const defaultConditions = `* Nuestro servicio de flete incluye la descarga del producto al pie del vehículo que entrega.
* Al momento de entregar debe haber una persona responsable encargada de recibir.
* No se aceptan cambios, ni reclamos.
* Una vez firmado el comprobante de entrega o una vez en el piso en su obra, la empresa no se hace responsable de quebraduras o roturas.
* Nuestra responsabilidad termina una vez entregado el producto.`;
      const deliveryConditions = this.currentDocument.delivery_conditions || defaultConditions;

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>GUIA DE REMISION - ${this.currentDocument.shipment_number || this.currentDocument.correlative}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              background: #fff;
              padding: 0;
              margin: 0;
            }
            .guide-container {
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
            .guide-header {
              text-align: right;
              background: ${docColor};
              color: white;
              padding: 15px 18px;
              border-radius: 6px;
              min-width: 280px;
            }
            .guide-title {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .guide-meta {
              font-size: 12px;
              line-height: 1.6;
            }
            .info-section { margin-bottom: 20px; }
            .info-row {
              display: flex;
              gap: 10px;
              margin-bottom: 10px;
            }
            .info-box {
              flex: 1;
              background: #f8f9fa;
              padding: 8px 12px;
              border-radius: 4px;
              border-left: 3px solid ${docColor};
            }
            .info-box h3 {
              font-size: 9px;
              text-transform: uppercase;
              color: ${docColor};
              margin-bottom: 5px;
              letter-spacing: 0.5px;
              font-weight: 700;
            }
            .info-box p {
              font-size: 10px;
              margin: 3px 0;
              color: #333;
              line-height: 1.3;
            }
            .info-box strong {
              font-weight: 600;
              color: #000;
            }
            .section-title {
              background: ${docColor};
              color: white;
              padding: 6px 10px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 8px;
              border-radius: 4px;
            }
            .products-table {
              width: 100%;
              margin-bottom: 10px;
              border-collapse: collapse;
              background: white;
            }
            .products-table thead { background: ${docColor}; }
            .products-table thead th {
              padding: 6px 5px;
              text-align: left;
              font-size: 9px;
              font-weight: 600;
              color: white;
              text-transform: uppercase;
              border: 1px solid #fff;
            }
            .products-table thead th:first-child,
            .products-table thead th:nth-child(4),
            .products-table thead th:nth-child(5),
            .products-table thead th:nth-child(6) { text-align: center; }
            .delivery-conditions {
              background: #f8f9fa;
              padding: 8px 12px;
              border-radius: 4px;
              margin-bottom: 15px;
              margin-top: 10px;
              border-left: 3px solid ${docColor};
            }
            .delivery-conditions h3 {
              font-size: 10px;
              font-weight: 700;
              color: ${docColor};
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .delivery-conditions p {
              font-size: 9px;
              line-height: 1.3;
              color: #333;
              margin: 3px 0;
            }
            .signature-section {
              display: flex;
              justify-content: space-around;
              margin-top: 20px;
              gap: 30px;
            }
            .signature-box {
              flex: 1;
              text-align: center;
            }
            .signature-line {
              width: 100%;
              height: 1px;
              background: #000;
              margin: 30px 0 8px;
            }
            .signature-box p {
              font-size: 10px;
              color: #000;
              font-weight: 600;
              margin: 3px 0;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .guide-container {
                padding: 20px;
                max-width: 100%;
              }
              .header, .products-table, .signature-section {
                page-break-inside: avoid;
              }
              .guide-header, .section-title, .products-table thead {
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
          </style>
        </head>
        <body>
          <div class="guide-container">
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
              <div class="guide-header">
                <div class="guide-title">GUIA DE REMISION</div>
                <div class="guide-meta">
                  <strong>No.:</strong> ${this.currentDocument.correlative || this.currentDocument.shipment_number || 'N/A'}<br>
                  <strong>#Control Interno:</strong> ${(() => {
                    const num = this.currentDocument.correlative || this.currentDocument.shipment_number || '0';
                    const numStr = String(num);
                    return /^[0-9]+$/.test(numStr) ? numStr.padStart(10, '0') : numStr;
                  })()}<br>
                  <strong>Fecha de Emisión:</strong> ${this.formatDate(this.currentDocument.emission_date || this.currentDocument.issue_date)}<br>
                  <strong>Sucursal:</strong> ${this.currentDocument.branch_name || 'AGENCIA PRINCIPAL'}
                </div>
              </div>
            </div>
            <div class="section-title">Datos del Conductor y Vehículo</div>
            <div class="info-row">
              <div class="info-box">
                <p><strong>Conductor:</strong> ${this.currentDocument.driver_name || 'N/A'}</p>
                <p><strong>DNI:</strong> ${this.currentDocument.driver_id || 'N/A'}</p>
                <p><strong>Licencia:</strong> ${this.currentDocument.driver_license || 'N/A'}</p>
                ${this.currentDocument.companion1_name ? `<p><strong>Acompañante 1:</strong> ${this.currentDocument.companion1_name}</p>` : ''}
                ${this.currentDocument.companion2_name ? `<p><strong>Acompañante 2:</strong> ${this.currentDocument.companion2_name}</p>` : ''}
              </div>
              <div class="info-box">
                <p><strong>Vehículo:</strong> ${this.currentDocument.vehicle_brand || 'N/A'} ${this.currentDocument.vehicle_model || ''}</p>
                <p><strong>Placa:</strong> ${this.currentDocument.vehicle_plate || 'N/A'}</p>
              </div>
            </div>
            <div class="section-title">Información de Entrega</div>
            <div class="info-row">
              <div class="info-box">
                <h3>Punto de Partida</h3>
                <p><strong>Dirección:</strong> ${this.currentDocument.origin_address || 'N/A'}</p>
                <p><strong>Ciudad:</strong> ${this.currentDocument.origin_city || 'N/A'}</p>
                <p><strong>Departamento:</strong> ${this.currentDocument.origin_state || 'N/A'}</p>
              </div>
              <div class="info-box">
                <h3>Punto de Llegada</h3>
                <p><strong>Proveedor:</strong> ${this.currentDocument.supplier_name || 'N/A'}</p>
                <p><strong>RTN:</strong> ${this.currentDocument.supplier_rtn || 'N/A'}</p>
                <p><strong>Dirección:</strong> ${this.currentDocument.destination_address || this.currentDocument.supplier_address || 'N/A'}</p>
              </div>
            </div>
            <div class="section-title" style="margin-top: 15px;">Quien Recibe</div>
            <div class="info-row">
              <div class="info-box" style="padding: 6px 10px;">
                <p style="font-size: 10px; margin: 2px 0;"><strong>1.</strong> ${this.currentDocument.receiver_name || 'N/A'} - <strong>DNI:</strong> ${this.currentDocument.receiver_id_document || 'N/A'} - <strong>Tel:</strong> ${this.currentDocument.receiver_phone || 'N/A'}</p>
                ${this.currentDocument.receiver_alt_name ? `<p style="font-size: 10px; margin: 2px 0;"><strong>2.</strong> ${this.currentDocument.receiver_alt_name} - <strong>DNI:</strong> ${this.currentDocument.receiver_alt_id_document || 'N/A'} - <strong>Tel:</strong> ${this.currentDocument.receiver_alt_phone || 'N/A'}</p>` : ''}
                ${this.currentDocument.receiver_alt2_name ? `<p style="font-size: 10px; margin: 2px 0;"><strong>3.</strong> ${this.currentDocument.receiver_alt2_name} - <strong>DNI:</strong> ${this.currentDocument.receiver_alt2_id_document || 'N/A'} - <strong>Tel:</strong> ${this.currentDocument.receiver_alt2_phone || 'N/A'}</p>` : ''}
              </div>
            </div>
            <div class="section-title" style="margin-top: 15px;">Detalle de Artículos</div>
            <table class="products-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Código</th>
                  <th>Artículo</th>
                  <th>Peso/Unit</th>
                  <th>Cantidad</th>
                  <th>Peso/Total</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="delivery-conditions">
              <h3>Condiciones de Entrega</h3>
              <p style="white-space: pre-line; font-size: 10px; line-height: 1.4;">${deliveryConditions}</p>
            </div>
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>Firma del Conductor</p>
                <p>Nombre: _______________________</p>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>Firma y Sello del Proveedor</p>
                <p>Nombre: _______________________</p>
                <p>Fecha de Recepción: ____________</p>
              </div>
            </div>
            <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
              <p><strong>Original Proveedor | Copia Obligado Tributario Emisor</strong></p>
            </div>
          </div>
        </body>
        </html>
      `;
    },
    exportAllToPDF() {
      // Exportar todos los documentos filtrados a PDF
      alert('Función de exportar todos a PDF en desarrollo');
    },
    exportAllToExcel() {
      // Exportar todos los documentos filtrados a Excel
      const data = [
        ['Estado de Cuenta Ventas'],
        ['Fecha Generación:', new Date().toLocaleString()],
        [''],
        ['Emisión', 'Vence', 'Tipo Doc', 'Nro. Documento', 'Proveedor', 'Usuario', 'Total', 'Pagado', 'Pendiente', 'Estatus']
      ];

      this.filteredDocuments.forEach(doc => {
        data.push([
          this.formatDate(doc.emission_date),
          this.formatDate(doc.due_date),
          this.getDocTypeLabel(doc.type),
          doc.document_number,
          doc.supplier_name,
          doc.user_name || 'N/A',
          doc.total,
          doc.paid_amount || 0,
          doc.pending_amount || 0,
          this.getStatusLabel(doc.status)
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Estado Cuenta Compras');
      XLSX.writeFile(wb, `Estado_Cuenta_Ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
    },
    calculateItemTotal(item) {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price || item.price) || 0;
      const discountValue = parseFloat(item.discount_value) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;

      const itemTotal = qty * price;
      const itemDiscount = itemTotal * (discountValue / 100);
      const itemSubtotal = itemTotal - itemDiscount;
      const itemTax = itemSubtotal * (taxRate / 100);

      return itemSubtotal + itemTax;
    },
    formatCurrency(value) {
      const num = parseFloat(value) || 0;
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    },
    formatDateTime(dateStr) {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    },
    formatDueDate(emissionDate, docType) {
      if (!emissionDate) return 'N/A';

      const date = new Date(emissionDate);
      let daysToAdd = 0;

      // Calcular días de vencimiento según tipo
      if (docType === 'factura_compra') {
        daysToAdd = 7; // 7 días
      } else if (docType === '') {
        daysToAdd = 15; // 15 días
      } else if (docType === '') {
        daysToAdd = 0; // Mismo día
      } else if (docType === '') {
        daysToAdd = 0; // Mismo día
      } else {
        return 'N/A';
      }

      const dueDate = new Date(date);
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      // Calcular días restantes
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDateOnly = new Date(dueDate);
      dueDateOnly.setHours(0, 0, 0, 0);

      const diffTime = dueDateOnly - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return `Vencido hace ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'día' : 'días'}`;
      } else if (diffDays === 0) {
        return 'Vence Hoy';
      } else {
        return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
      }
    },
    getDueDateClass(emissionDate, docType) {
      if (!emissionDate) return '';

      const date = new Date(emissionDate);
      let daysToAdd = 0;

      // Calcular días de vencimiento según tipo
      if (docType === 'factura_compra') {
        daysToAdd = 7;
      } else if (docType === '') {
        daysToAdd = 15;
      } else if (docType === '') {
        daysToAdd = 0;
      } else if (docType === '') {
        daysToAdd = 0;
      } else {
        return '';
      }

      const dueDate = new Date(date);
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      // Calcular días restantes
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDateOnly = new Date(dueDate);
      dueDateOnly.setHours(0, 0, 0, 0);

      const diffTime = dueDateOnly - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return 'text-danger'; // Vencido - rojo
      } else if (diffDays === 0) {
        return 'text-warning'; // Vence hoy - amarillo
      } else if (diffDays <= 3) {
        return 'text-warning'; // Próximo a vencer - amarillo
      } else {
        return 'text-success'; // Días restantes - verde
      }
    },
    getDocTypeLabel(type, status = null) {
      const labels = {
        'factura_compra': 'FACTURA COMPRA',
        'nota_credito_compra': 'NOTA DE CRÉDITO COMPRA',
        'devolucion_compra': 'DEVOLUCIÓN COMPRA'
      };
      return labels[type] || type.toUpperCase();
    },
    getDocTypeBadgeClass(type, status = null) {
      const classes = {
        'factura_compra': 'bg-success',
        'nota_credito_compra': 'bg-dark',
        'devolucion_compra': 'bg-danger'
      };
      return classes[type] || 'bg-secondary';
    },
    getDocTypeTitleClass(type) {
      const classes = {
        'factura_compra': 'text-success',
        'nota_credito_compra': 'text-dark',
        'devolucion_compra': 'text-danger'
      };
      return classes[type] || 'text-secondary';
    },
    getStatusLabel(status) {
      const labels = {
        'paid': 'COBRADO',
        'pending': 'PENDIENTE',
        'active': 'ACTIVO',
        'converted_to_invoice': 'IMPORTADO',
        'imported': 'IMPORTADO',
        'overdue': 'VENCIDO',
        'cancelled': 'CANCELADO',
        'returned': 'DEVUELTO',
        'completed': 'COMPLETADO'
      };
      return labels[status] || status?.toUpperCase() || 'N/A';
    },
    getStatusBadgeClass(status) {
      const classes = {
        'paid': 'bg-success',
        'pending': 'bg-warning',
        'partial': 'bg-info',
        'active': 'bg-success',        // ACTIVO en verde
        'overdue': 'bg-danger',         // VENCIDO en rojo
        'imported': 'bg-primary',
        'cancelled': 'bg-secondary',
        'returned': 'bg-danger',
        'completed': 'bg-success'       // COMPLETADO en verde
      };
      return classes[status] || 'bg-secondary';
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    formatWeight(weight) {
      const w = parseFloat(weight) || 0;
      return w.toFixed(2);
    },
    formatTotalWeight(weight, qty) {
      const w = parseFloat(weight) || 0;
      const q = parseFloat(qty) || 0;
      return (w * q).toFixed(2);
    },
    getTotalWeightForDocument() {
      if (!this.currentDocument?.items || this.currentDocument.items.length === 0) return '0.00';
      const total = this.currentDocument.items.reduce((sum, item) => {
        const w = parseFloat(item.weight) || 0;
        const q = parseFloat(item.quantity) || 0;
        return sum + (w * q);
      }, 0);
      return total.toFixed(2);
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

      return integer.toString();
    },
    // Funciones para exportar el reporte completo
    async saveReportAsExcel() {
      this.showSaveReportModal = false;

      try {
        // Crear workbook
        const wb = XLSX.utils.book_new();

        // Datos del encabezado de la empresa (arriba de todo)
        const headerData = [
          [this.companyInfo.company_name || 'PROSPERPOS'],
          [this.companyInfo.direccion || 'Sin dirección'],
          [`Tel: ${this.companyInfo.telefono || 'N/A'}`],
          [''],
          ['ESTADO CUENTA VENTAS'],
          [`Desde: ${this.filters.date_from} | Hasta: ${this.filters.date_to}`],
          [''],
          [''], // Fila vacía adicional antes de los encabezados
        ];

        // Crear worksheet PRIMERO con el encabezado
        const ws = XLSX.utils.aoa_to_sheet(headerData);

        // Preparar datos de los documentos
        const data = this.filteredDocuments.map(doc => ({
          'Fecha': this.formatDate(doc.emission_date),
          'Vence': this.formatDueDate(doc.emission_date, doc.type),
          'Tipo Doc': this.getDocTypeLabel(doc.type, doc.status),
          'Nro Documento': doc.document_number,
          'Agencia': doc.branch_name || 'AGENCIA PRINCIPAL',
          'Proveedor': doc.supplier_name,
          'Usuario': doc.user_name || 'N/A',
          'Usuario': doc.created_by_name || 'N/A',
          'Total': parseFloat(doc.total || 0),
          'Estatus': this.getStatusLabel(doc.status)
        }));

        // Calcular totales
        const totalAmount = this.filteredDocuments.reduce((sum, doc) => sum + parseFloat(doc.total || 0), 0);

        // Agregar fila de totales
        data.push({
          'Fecha': '',
          'Vence': '',
          'Tipo Doc': '',
          'Nro Documento': '',
          'Agencia': '',
          'Proveedor': '',
          'Usuario': '',
          'Usuario': 'TOTAL:',
          'Total': totalAmount,
          'Estatus': ''
        });

        // Agregar fila de resumen
        data.push({
          'Fecha': '',
          'Vence': '',
          'Tipo Doc': '',
          'Nro Documento': '',
          'Agencia': '',
          'Proveedor': '',
          'Usuario': '',
          'Usuario': `Total Registros: ${this.filteredDocuments.length}`,
          'Total': '',
          'Estatus': ''
        });

        // Agregar los datos de los documentos DESPUÉS del encabezado (fila 9)
        XLSX.utils.sheet_add_json(ws, data, { origin: 'A9', skipHeader: false });

        // Agregar al workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Estado Cuenta');

        const fileName = `estado-cuenta-ventas-${this.filters.date_from}-${this.filters.date_to}.xlsx`;
        XLSX.writeFile(wb, fileName);
      } catch (error) {
        console.error('Error al guardar Excel:', error);
        alert('Error al generar el archivo Excel');
      }
    },
    buildReportHTML() {
      // Generar HTML de tabla de documentos
      const totalAmount = this.filteredDocuments.reduce((sum, doc) => sum + parseFloat(doc.total || 0), 0);

      const documentRows = this.filteredDocuments.map(doc => `
        <tr>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${this.formatDate(doc.emission_date)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${this.formatDueDate(doc.emission_date, doc.type)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${this.getDocTypeLabel(doc.type, doc.status)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${doc.document_number}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${doc.branch_name || 'AGENCIA PRINCIPAL'}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${doc.supplier_name.substring(0, 25)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${(doc.user_name || 'N/A').substring(0, 15)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${(doc.created_by_name || 'N/A').substring(0, 15)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 9px;">L ${this.formatCurrency(doc.total)}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${this.getStatusLabel(doc.status)}</td>
        </tr>
      `).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 15px;
              background: white;
              margin: 0;
              width: 800px;
            }
            .header-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              gap: 15px;
            }
            .company-info {
              width: 60%;
              flex-shrink: 0;
            }
            .company-info img {
              max-width: 180px;
              height: auto;
              margin-bottom: 8px;
            }
            .company-details {
              font-size: 11px;
              line-height: 1.5;
            }
            .report-box {
              width: 38%;
              flex-shrink: 0;
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: white;
              padding: 10px;
              border-radius: 8px;
            }
            .report-title {
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .report-details {
              font-size: 10px;
              line-height: 1.6;
            }
            .separator {
              border: none;
              border-top: 3px solid #f97316;
              margin: 15px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9px;
            }
            thead {
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: white;
            }
            th {
              padding: 8px 4px;
              text-align: left;
              border: 1px solid #ddd;
              font-size: 9px;
            }
            td {
              padding: 6px;
              border: 1px solid #ddd;
            }
            .text-right {
              text-align: right;
            }
            tfoot {
              background: #f3f4f6;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-weight: bold;
            }
            tfoot td {
              padding: 8px 4px;
              font-size: 9px;
            }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="company-info">
              <img src="${LOGO_BASE64}" alt="Logo">
              <div class="company-details">
                <strong>${this.companyInfo.business_description || this.companyInfo.description || this.companyInfo.company_name || 'PROSPERPOS'}</strong><br>
                <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                <strong>Dirección:</strong> ${this.companyInfo.direccion || 'Sin dirección'}<br>
                <strong>Tel:</strong> ${this.companyInfo.telefono || 'N/A'} | <strong>Móvil:</strong> ${this.companyInfo.telefono_movil || this.companyInfo.phone_mobile || '+504 9875-2725'}<br>
                <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}
              </div>
            </div>
            <div class="report-box">
              <div class="report-title">ESTADO CUENTA VENTAS</div>
              <div class="report-details">
                <strong>Desde:</strong> ${this.filters.date_from}<br>
                <strong>Hasta:</strong> ${this.filters.date_to}<br>
                <strong>Total Registros:</strong> ${this.filteredDocuments.length}
              </div>
            </div>
          </div>

          <hr class="separator">

          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Vence</th>
                <th>Tipo</th>
                <th>Nro Doc</th>
                <th>Agencia</th>
                <th>Proveedor</th>
                <th>Usuario</th>
                <th>Usuario</th>
                <th class="text-right">Total</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              ${documentRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="8" style="text-align: right; font-weight: bold;">TOTAL:</td>
                <td class="text-right">L ${this.formatCurrency(totalAmount)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;
    },
    async saveReportAsPDF() {
      this.showSaveReportModal = false;

      try {
        const fileName = `estado-cuenta-ventas-${this.filters.date_from}-${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildReportHTML();
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

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft > 0) {
          position = -(imgHeight - heightLeft) + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pdfHeight - 20);
        }

        pdf.save(`${fileName}.pdf`);
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error al guardar PDF:', error);
        alert('Error al generar el archivo PDF');
      }
    },
    async saveReportAsImage() {
      this.showSaveReportModal = false;

      try {
        const fileName = `estado-cuenta-ventas-${this.filters.date_from}-${this.filters.date_to}`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const htmlContent = this.buildReportHTML();
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
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);
      } catch (error) {
        console.error('Error al guardar imagen:', error);
        alert('Error al generar la imagen');
      }
    },
    printReportTable() {
      this.showSaveReportModal = false;

      const printWindow = window.open('', '_blank');
      const html = this.buildReportHTML();
      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
      };
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

.table-hover tbody tr:hover {
  background-color: #f0f8ff;
}
</style>
