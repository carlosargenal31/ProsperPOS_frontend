<template>
  <div class="pedidos-online-container">
    <!-- Estadísticas -->
    <div class="row mb-4">
      <div class="col-xl col-lg-4 col-sm-6 mb-3">
        <div class="card bg-primary-light">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-2">Total Pedidos</h6>
                <h3 class="mb-0">{{ stats?.total_orders || 0 }}</h3>
              </div>
              <div class="avatar avatar-lg bg-primary">
                <i class="ti ti-shopping-cart fs-24"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl col-lg-4 col-sm-6 mb-3">
        <div class="card bg-warning-light">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-2">Pendientes</h6>
                <h3 class="mb-0">{{ stats?.pendientes || 0 }}</h3>
              </div>
              <div class="avatar avatar-lg bg-warning">
                <i class="ti ti-clock fs-24"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl col-lg-4 col-sm-6 mb-3">
        <div class="card bg-info-light">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-2">Cotizados</h6>
                <h3 class="mb-0">{{ stats?.cotizados || 0 }}</h3>
              </div>
              <div class="avatar avatar-lg bg-info">
                <i class="ti ti-file-invoice fs-24"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl col-lg-4 col-sm-6 mb-3">
        <div class="card bg-success-light">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-2">Cobrados</h6>
                <h3 class="mb-0">{{ stats?.cobrados || 0 }}</h3>
              </div>
              <div class="avatar avatar-lg bg-success">
                <i class="fas fa-check-circle fs-24"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl col-lg-4 col-sm-6 mb-3">
        <div class="card bg-danger-light">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-2">Cancelados</h6>
                <h3 class="mb-0">{{ stats?.cancelados || 0 }}</h3>
              </div>
              <div class="avatar avatar-lg bg-danger">
                <i class="ti ti-x fs-24"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-lg-3">
            <label class="form-label">Estado</label>
            <select v-model="filters.status" @change="loadOrders" class="form-select">
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="cotizado">Cotizado</option>
              <option value="cobrado">Cobrado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div class="col-lg-3">
            <label class="form-label">Buscar</label>
            <input
              v-model="filters.search"
              @input="searchOrders"
              type="text"
              class="form-control"
              placeholder="Número de pedido, cliente...">
          </div>

          <div class="col-lg-3">
            <label class="form-label">Fecha Desde</label>
            <input
              v-model="filters.start_date"
              @change="loadOrders"
              type="date"
              class="form-control">
          </div>

          <div class="col-lg-3">
            <label class="form-label">Fecha Hasta</label>
            <input
              v-model="filters.end_date"
              @change="loadOrders"
              type="date"
              class="form-control">
          </div>

          <div class="col-lg-12">
            <div class="d-flex justify-content-end gap-2">
              <button
                @click="showSaveReportModal = true"
                class="btn btn-primary"
                :disabled="orders.length === 0">
                <i class="ti ti-download me-1"></i>
                Guardar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Pedidos -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-5">
          <i class="ti ti-shopping-cart-off fs-48 text-muted mb-3"></i>
          <h5>No hay pedidos</h5>
          <p class="text-muted">No se encontraron pedidos con los filtros aplicados</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Número de Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td>
                  <strong>{{ order.order_number }}</strong>
                </td>
                <td>
                  <div>{{ order.customer_name }}</div>
                  <small class="text-muted" v-if="order.customer_email">{{ order.customer_email }}</small>
                </td>
                <td>{{ formatDate(order.created_at) }}</td>
                <td>{{ order.items_count }} productos</td>
                <td><strong>{{ formatMoney(order.total_amount) }}</strong></td>
                <td>
                  <span :class="getStatusClass(order.status)" class="badge">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td>
                  <button
                    @click="viewOrder(order)"
                    class="btn btn-sm btn-info me-2"
                    title="Ver Detalles">
                    <i class="ti ti-eye"></i>
                  </button>
                  <button
                    @click="changeStatus(order)"
                    class="btn btn-sm btn-primary me-2"
                    title="Cambiar Estado">
                    <i class="ti ti-edit"></i>
                  </button>
                  <button
                    @click="openSaveModal(order)"
                    class="btn btn-sm btn-success"
                    title="Guardar">
                    <i class="ti ti-download"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles del Pedido -->
    <div
      class="modal fade"
      id="orderDetailModal"
      tabindex="-1"
      ref="orderDetailModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalle del Pedido {{ selectedOrder?.order_number }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedOrder">
            <!-- Información del Cliente -->
            <div class="row mb-4">
              <div class="col-md-6">
                <h6>Información del Cliente</h6>
                <p class="mb-1"><strong>Nombre:</strong> {{ selectedOrder.customer_name }}</p>
                <p class="mb-1" v-if="selectedOrder.customer_email"><strong>Email:</strong> {{ selectedOrder.customer_email }}</p>
                <p class="mb-1" v-if="selectedOrder.customer_phone"><strong>Teléfono:</strong> {{ selectedOrder.customer_phone }}</p>
                <p class="mb-1" v-if="selectedOrder.customer_dni"><strong>DNI:</strong> {{ selectedOrder.customer_dni }}</p>
              </div>
              <div class="col-md-6">
                <h6>Dirección de Entrega</h6>
                <p class="mb-1">{{ selectedOrder.delivery_address }}</p>
                <p class="mb-1" v-if="selectedOrder.delivery_address !== 'Recoger en tienda'">
                  {{ selectedOrder.city }}<span v-if="selectedOrder.department">, {{ selectedOrder.department }}</span>
                </p>
                <template v-if="selectedOrder.delivery_address !== 'Recoger en tienda'">
                  <p class="mb-1" v-if="selectedOrder.receiver_name"><strong>Nombre de la Persona que va a Recibir:</strong> {{ selectedOrder.receiver_name }}</p>
                  <p class="mb-1" v-if="selectedOrder.receiver_phone"><strong>Teléfono de la Persona que va a Recibir:</strong> {{ selectedOrder.receiver_phone }}</p>
                </template>
              </div>
            </div>

            <!-- Información de Facturación y Pago -->
            <div class="row mb-4">
              <div class="col-md-6">
                <h6>Información de Facturación</h6>
                <p class="mb-1"><strong>Tipo:</strong> {{ selectedOrder.invoice_type || 'Consumidor Final' }}</p>
                <p class="mb-1" v-if="selectedOrder.business_name"><strong>Razón Social:</strong> {{ selectedOrder.business_name }}</p>
                <p class="mb-1"><strong>RTN:</strong> {{ selectedOrder.rtn || '00000000000000' }}</p>
              </div>
              <div class="col-md-6">
                <h6>Información de Pago</h6>
                <p class="mb-1"><strong>Método de Pago:</strong> {{ selectedOrder.payment_method || 'Efectivo' }}</p>
              </div>
            </div>

            <!-- Productos -->
            <h6>Productos</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th class="text-end">Cantidad</th>
                    <th class="text-end">Precio Unit.</th>
                    <th class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedOrder.items" :key="item.id">
                    <td>
                      {{ item.product_name }} <strong>{{ item.unit || 'UNIDAD' }}</strong>
                      <small class="text-muted d-block" v-if="item.product_code">{{ item.product_code }}</small>
                    </td>
                    <td class="text-end">{{ item.quantity }}</td>
                    <td class="text-end">{{ formatMoney(item.unit_price) }}</td>
                    <td class="text-end"><strong>{{ formatMoney(item.subtotal) }}</strong></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr v-if="selectedOrder.subtotal_before_discount">
                    <td colspan="3" class="text-end">Subtotal:</td>
                    <td class="text-end">{{ formatMoney(selectedOrder.subtotal_before_discount) }}</td>
                  </tr>
                  <tr v-if="selectedOrder.coupon_discount && selectedOrder.coupon_discount > 0" style="color: #28a745;">
                    <td colspan="3" class="text-end">Descuento Cupón ({{ selectedOrder.coupon_name || selectedOrder.coupon_code }}):</td>
                    <td class="text-end">-{{ formatMoney(selectedOrder.coupon_discount) }}</td>
                  </tr>
                  <tr v-if="selectedOrder.offers_discount && selectedOrder.offers_discount > 0" style="color: #28a745;">
                    <td colspan="3" class="text-end">Descuento Ofertas:</td>
                    <td class="text-end">-{{ formatMoney(selectedOrder.offers_discount) }}</td>
                  </tr>
                  <tr v-if="selectedOrder.subtotal_after_discount && (selectedOrder.coupon_discount > 0 || selectedOrder.offers_discount > 0)">
                    <td colspan="3" class="text-end">Subtotal con descuentos:</td>
                    <td class="text-end">{{ formatMoney(selectedOrder.subtotal_after_discount) }}</td>
                  </tr>
                  <tr v-if="selectedOrder.tax_amount">
                    <td colspan="3" class="text-end">ISV (15%):</td>
                    <td class="text-end">{{ formatMoney(selectedOrder.tax_amount) }}</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-end"><strong>TOTAL:</strong></td>
                    <td class="text-end"><strong>{{ formatMoney(selectedOrder.total_amount) }}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Notas de entrega -->
            <div v-if="selectedOrder.notes" class="alert alert-info mt-3">
              <strong>Notas de entrega:</strong><br>
              {{ selectedOrder.notes }}
            </div>

            <!-- Comentarios Adicionales -->
            <div v-if="selectedOrder.additional_comments" class="alert alert-info mt-3">
              <strong>Comentarios adicionales:</strong><br>
              {{ selectedOrder.additional_comments }}
            </div>

            <!-- Estado Actual -->
            <div class="mt-3">
              <strong>Estado Actual:</strong>
              <span :class="getStatusClass(selectedOrder.status)" class="badge ms-2">
                {{ getStatusText(selectedOrder.status) }}
              </span>
              <button @click="showStatusHistory" class="btn btn-sm btn-outline-primary ms-3">
                <i class="fas fa-history me-1"></i> Ver Historial de Cambios
              </button>
            </div>

            <!-- Información de Cancelación -->
            <div v-if="selectedOrder.status === 'cancelado' && selectedOrder.cancellation_reason" class="alert alert-danger mt-3">
              <h6 class="alert-heading"><i class="fas fa-times-circle me-2"></i>Motivo de Cancelación</h6>
              <p class="mb-2">{{ selectedOrder.cancellation_reason }}</p>
              <hr>
              <small class="text-muted">
                <strong>Cancelado por:</strong> {{ selectedOrder.cancelled_by || 'N/A' }}
                <span v-if="selectedOrder.cancelled_at"> | <strong>Fecha:</strong> {{ formatDate(selectedOrder.cancelled_at) }}</span>
              </small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Cambio de Estado -->
    <div
      class="modal fade"
      id="changeStatusModal"
      tabindex="-1"
      ref="changeStatusModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cambiar Estado del Pedido</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Pedido</label>
              <input
                type="text"
                class="form-control"
                :value="selectedOrder?.order_number"
                readonly>
            </div>

            <div class="mb-3">
              <label class="form-label">Estado Actual</label>
              <input
                type="text"
                class="form-control"
                :value="getStatusText(selectedOrder?.status)"
                readonly>
            </div>

            <div class="mb-3">
              <label class="form-label">Nuevo Estado *</label>
              <select v-model="newStatus" class="form-select" required>
                <option value="">Seleccione un estado</option>
                <option value="pendiente">Pendiente</option>
                <option value="cotizado">Cotizado</option>
                <option value="cobrado">Cobrado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Notas del Proceso</label>
              <textarea
                v-model="statusNotes"
                class="form-control"
                rows="3"
                placeholder="Agregar notas sobre este cambio de estado..."></textarea>
              <small class="form-text text-muted">Estas notas son del proceso interno y aparecerán en el historial de cambios.</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveStatusChange"
              :disabled="!newStatus || savingStatus">
              <span v-if="savingStatus">
                <span class="spinner-border spinner-border-sm me-1"></span>
                Guardando...
              </span>
              <span v-else>Guardar Cambio</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Historial de Cambios -->
    <div
      class="modal fade"
      id="statusHistoryModal"
      tabindex="-1"
      ref="statusHistoryModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Historial de Cambios de Estado</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingHistory" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>

            <div v-else-if="statusHistory.length === 0" class="alert alert-info">
              No hay cambios de estado registrados para este pedido.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Estado Anterior</th>
                    <th>Nuevo Estado</th>
                    <th>Notas del Proceso</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="change in statusHistory" :key="change.id">
                    <td>{{ formatDate(change.changed_at) }}</td>
                    <td>
                      <span :class="getStatusClass(change.previous_status)" class="badge">
                        {{ getStatusText(change.previous_status) }}
                      </span>
                    </td>
                    <td>
                      <span :class="getStatusClass(change.new_status)" class="badge">
                        {{ getStatusText(change.new_status) }}
                      </span>
                    </td>
                    <td>{{ change.notes || '-' }}</td>
                    <td>{{ change.changed_by_name || 'Sistema' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Guardar Pedido -->
    <div
      class="modal fade"
      id="saveOrderModal"
      tabindex="-1"
      ref="saveOrderModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Guardar Pedido {{ selectedOrder?.order_number }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedOrder">
            <!-- Información del Pedido -->
            <div class="row mb-4">
              <div class="col-md-6">
                <p class="mb-2"><strong>Cliente:</strong> {{ selectedOrder.customer_name }}</p>
                <p class="mb-2"><strong>Email:</strong> {{ selectedOrder.customer_email || 'N/A' }}</p>
              </div>
              <div class="col-md-6">
                <p class="mb-2"><strong>Fecha:</strong> {{ formatDate(selectedOrder.created_at) }}</p>
                <p class="mb-2"><strong>Total:</strong> {{ formatMoney(selectedOrder.total_amount) }}</p>
              </div>
            </div>

            <!-- Opciones de Guardado -->
            <div class="row g-3">
              <div class="col-md-6">
                <button
                  @click="exportOrderToExcel(selectedOrder)"
                  class="btn btn-outline-success w-100 d-flex align-items-center justify-content-center py-3">
                  <i class="ti ti-file-spreadsheet fs-24 me-2"></i>
                  <div class="text-start">
                    <div class="fw-bold">Guardar como Excel</div>
                    <small class="text-muted">Formato CSV para edición</small>
                  </div>
                </button>
              </div>

              <div class="col-md-6">
                <button
                  @click="exportOrderToPDF(selectedOrder)"
                  class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center py-3">
                  <i class="ti ti-file-text fs-24 me-2"></i>
                  <div class="text-start">
                    <div class="fw-bold">Guardar como PDF</div>
                    <small class="text-muted">Documento para imprimir</small>
                  </div>
                </button>
              </div>

              <div class="col-md-6">
                <button
                  @click="printOrder(selectedOrder)"
                  class="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center py-3">
                  <i class="ti ti-printer fs-24 me-2"></i>
                  <div class="text-start">
                    <div class="fw-bold">Imprimir</div>
                    <small class="text-muted">Abrir ventana de impresión</small>
                  </div>
                </button>
              </div>

              <div class="col-md-6">
                <button
                  @click="exportOrderAsImage(selectedOrder)"
                  class="btn btn-outline-info w-100 d-flex align-items-center justify-content-center py-3">
                  <i class="ti ti-photo fs-24 me-2"></i>
                  <div class="text-start">
                    <div class="fw-bold">Guardar como Imagen</div>
                    <small class="text-muted">Formato PNG</small>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Guardar Reporte -->
    <div v-if="showSaveReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Guardar Reporte - Pedidos en Línea</h5>
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
              <button class="btn btn-outline-secondary" @click="printReportList">
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
  </div>
</template>

<script>
import api from '@/utils/axios'
import { Modal } from 'bootstrap'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default {
  name: 'PedidosOnline',
  data() {
    // Calcular primer día del mes y día actual
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    return {
      orders: [],
      stats: {
        total_orders: 0,
        pendientes: 0,
        cotizados: 0,
        cobrados: 0,
        total_cobrado: 0
      },
      loading: false,
      filters: {
        status: '',
        search: '',
        start_date: formatDate(firstDay),
        end_date: formatDate(today)
      },
      selectedOrder: null,
      newStatus: '',
      statusNotes: '',
      savingStatus: false,
      statusHistory: [],
      loadingHistory: false,
      searchTimeout: null,
      companyInfo: null,
      showSaveReportModal: false
    }
  },
  mounted() {
    this.loadOrders()
    this.loadStats()
    this.loadCompanyInfo()
  },
  methods: {
    async loadOrders() {
      this.loading = true
      try {
        const params = new URLSearchParams()

        if (this.filters.status) params.append('status', this.filters.status)
        if (this.filters.search) params.append('search', this.filters.search)
        if (this.filters.start_date) params.append('start_date', this.filters.start_date)
        if (this.filters.end_date) params.append('end_date', this.filters.end_date)

        const response = await api.get(`/orders?${params.toString()}`)

        if (response.data.success) {
          this.orders = response.data.data
        }
      } catch (error) {
        console.error('Error al cargar pedidos:', error)
        this.$toast.error('Error al cargar los pedidos')
      } finally {
        this.loading = false
      }
    },

    async loadStats() {
      try {
        const response = await api.get('/orders/stats')
        if (response.data.success) {
          this.stats = response.data.data
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      }
    },

    async loadCompanyInfo() {
      try {
        const response = await api.get('/companies/default')
        if (response.data && response.data.success) {
          this.companyInfo = response.data.data
        } else if (response.data) {
          this.companyInfo = response.data
        }
      } catch (error) {
        console.error('Error al cargar información de la empresa:', error)
        // Fallback: intentar con endpoint público
        try {
          const publicResponse = await api.get('/companies/public/default')
          if (publicResponse.data && publicResponse.data.success) {
            this.companyInfo = publicResponse.data.data
          } else if (publicResponse.data) {
            this.companyInfo = publicResponse.data
          }
        } catch (publicError) {
          console.error('Error al cargar información pública de la empresa:', publicError)
        }
      }
    },

    searchOrders() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.loadOrders()
      }, 500)
    },

    async viewOrder(order) {
      try {
        const response = await api.get(`/orders/${order.id}`)
        if (response.data.success) {
          this.selectedOrder = response.data.data
          const modal = new Modal(this.$refs.orderDetailModal)
          modal.show()
        }
      } catch (error) {
        console.error('Error al cargar detalles del pedido:', error)
        this.$toast.error('Error al cargar los detalles del pedido')
      }
    },

    changeStatus(order) {
      this.selectedOrder = order
      this.newStatus = order.status
      this.statusNotes = ''
      const modal = new Modal(this.$refs.changeStatusModal)
      modal.show()
    },

    async openSaveModal(order) {
      try {
        const response = await api.get(`/orders/${order.id}`)
        if (response.data.success) {
          this.selectedOrder = response.data.data
          const modal = new Modal(this.$refs.saveOrderModal)
          modal.show()
        }
      } catch (error) {
        console.error('Error al cargar pedido:', error)
        this.$toast.error('Error al cargar el pedido')
      }
    },

    async saveStatusChange() {
      if (!this.newStatus) {
        this.$toast.warning('Seleccione un nuevo estado')
        return
      }

      this.savingStatus = true
      try {
        console.log('🔄 Enviando cambio de estado:', {
          orderId: this.selectedOrder.id,
          newStatus: this.newStatus,
          notes: this.statusNotes
        });

        const response = await api.patch(
          `/orders/${this.selectedOrder.id}/status`,
          {
            status: this.newStatus,
            notes: this.statusNotes || null
          }
        )

        console.log('✅ Respuesta del servidor:', response);

        // CÓDIGO ACTUALIZADO - Si llegamos aquí, la petición fue exitosa

        // Actualizar el estado del pedido seleccionado inmediatamente
        if (this.selectedOrder) {
          this.selectedOrder.status = this.newStatus
        }

        // Actualizar también en la lista de pedidos
        const orderIndex = this.orders.findIndex(o => o.id === this.selectedOrder.id)
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = this.newStatus
        }

        // Cerrar modal de cambio de estado
        const statusModal = Modal.getInstance(this.$refs.changeStatusModal)
        if (statusModal) {
          statusModal.hide()
        }

        // Limpiar formulario
        this.statusNotes = ''
        this.newStatus = ''

        // Mostrar notificación de éxito
        this.$toast.success('Estado del pedido actualizado correctamente')

        // Recargar estadísticas
        await this.loadStats()

        // Forzar actualización del DOM
        this.$nextTick(() => {
          this.$forceUpdate()
        })

      } catch (error) {
        console.error('Error al cambiar estado:', error)
        this.$toast.error(error?.response?.data?.message || 'Error al actualizar el estado del pedido')
      } finally {
        this.savingStatus = false
      }
    },

    async showStatusHistory() {
      if (!this.selectedOrder?.id) {
        this.$toast.error('No se ha seleccionado ningún pedido')
        return
      }

      try {
        this.loadingHistory = true
        this.statusHistory = []

        const response = await api.get(`/orders/${this.selectedOrder.id}/status-history`)

        if (response.data.success) {
          this.statusHistory = response.data.data || []
        }

        // Mostrar el modal de historial
        const historyModal = new Modal(this.$refs.statusHistoryModal)
        historyModal.show()

      } catch (error) {
        console.error('Error al cargar historial:', error)
        this.$toast.error('Error al cargar el historial de cambios')
      } finally {
        this.loadingHistory = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';

      // MySQL devuelve la fecha en formato 'YYYY-MM-DD HH:mm:ss' sin zona horaria
      // La parseamos como si fuera hora local directamente
      const parts = dateString.replace('T', ' ').replace('Z', '').split(/[- :]/);
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const day = parseInt(parts[2]);
      const hours = parseInt(parts[3]);
      const minutes = parseInt(parts[4]);

      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const hoursStr = String(hours).padStart(2, '0');
      const minutesStr = String(minutes).padStart(2, '0');

      return `${dayStr}/${monthStr}/${year}, ${hoursStr}:${minutesStr}`;
    },

    formatMoney(amount) {
      if (!amount && amount !== 0) return 'L0.00';
      const formatted = parseFloat(amount).toLocaleString('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `L${formatted}`;
    },

    getStatusClass(status) {
      const classes = {
        'pendiente': 'bg-warning',
        'cotizado': 'bg-info',
        'cobrado': 'bg-success',
        'cancelado': 'bg-danger'
      }
      return classes[status] || 'bg-secondary'
    },

    getStatusText(status) {
      const texts = {
        'pendiente': 'Pendiente',
        'cotizado': 'Cotizado',
        'cobrado': 'Cobrado',
        'cancelado': 'Cancelado'
      }
      return texts[status] || status
    },

    async convertImageToBase64(url) {
      try {
        console.log('→ Iniciando conversión de imagen:', url)

        // Método 1: Intentar con fetch primero (evita problemas de CORS)
        try {
          console.log('→ Método 1: Intentando con fetch...')
          const response = await fetch(url, {
            mode: 'cors',
            cache: 'no-cache'
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const blob = await response.blob()
          console.log('→ Blob obtenido, tamaño:', Math.round(blob.size / 1024), 'KB')

          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              console.log('→ Conversión a base64 exitosa con fetch')
              resolve(reader.result)
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        } catch (fetchError) {
          console.log('→ Fetch falló, intentando método alternativo:', fetchError.message)

          // Método 2: Usar Image con crossOrigin
          console.log('→ Método 2: Intentando con Image...')
          const img = new Image()
          img.crossOrigin = 'anonymous'

          return new Promise((resolve, reject) => {
            img.onload = () => {
              try {
                console.log('→ Imagen cargada exitosamente, dimensiones:', img.width, 'x', img.height)

                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height

                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0)

                const base64 = canvas.toDataURL('image/jpeg', 0.95)
                console.log('→ Conversión a base64 exitosa con Image, tamaño:', Math.round(base64.length / 1024), 'KB')
                resolve(base64)
              } catch (error) {
                console.error('→ Error al convertir imagen a base64:', error)
                reject(error)
              }
            }

            img.onerror = (error) => {
              console.error('→ Error al cargar imagen con Image:', error)
              reject(new Error(`No se pudo cargar la imagen: ${url}`))
            }

            img.src = url
          })
        }
      } catch (error) {
        console.error('→ Error general en convertImageToBase64:', error)
        throw error
      }
    },

    async exportToExcel() {
      try {
        const params = new URLSearchParams()

        if (this.filters.status) params.append('status', this.filters.status)
        if (this.filters.search) params.append('search', this.filters.search)
        if (this.filters.start_date) params.append('start_date', this.filters.start_date)
        if (this.filters.end_date) params.append('end_date', this.filters.end_date)

        const response = await api.get(`/orders/export/excel?${params.toString()}`)

        if (response.data.success) {
          // Crear archivo Excel usando los datos
          const data = response.data.data
          const filename = response.data.filename

          // Crear CSV (alternativa simple a Excel)
          const csv = this.convertToCSV(data)
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = filename.replace('.xlsx', '.csv')
          link.click()

          this.$toast.success('Pedidos exportados exitosamente')
        }
      } catch (error) {
        console.error('Error al exportar:', error)
        this.$toast.error('Error al exportar pedidos')
      }
    },

    convertToCSV(data) {
      if (data.length === 0) return ''

      const headers = Object.keys(data[0])
      const csvRows = []

      // Agregar encabezados
      csvRows.push(headers.join(','))

      // Agregar datos
      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header]
          return `"${value}"`
        })
        csvRows.push(values.join(','))
      }

      return csvRows.join('\n')
    },

    async exportOrderToPDF(order) {
      try {
        console.log('→ Iniciando exportación de PDF para pedido:', order.id)
        const response = await api.get(`/orders/${order.id}`)

        console.log('→ Respuesta del servidor:', response)

        if (response?.data?.success) {
          const orderData = response.data.data
          const fileName = `Pedido_${orderData.order_number}`

          console.log('→ Generando HTML del pedido...')

          // Crear iframe oculto
          const iframe = document.createElement('iframe')
          iframe.style.position = 'absolute'
          iframe.style.left = '-9999px'
          iframe.style.width = '800px'
          iframe.style.height = '600px'
          document.body.appendChild(iframe)

          // Escribir contenido HTML en el iframe (esperar a que se genere con la imagen convertida)
          const htmlContent = await this.generatePrintHTML(orderData)
          iframe.contentDocument.write(htmlContent)
          iframe.contentDocument.close()

          // Esperar a que las imágenes carguen
          await new Promise(resolve => {
            const images = iframe.contentDocument.getElementsByTagName('img')
            if (images.length > 0) {
              let loaded = 0
              const total = images.length

              const checkLoaded = () => {
                loaded++
                if (loaded === total) {
                  setTimeout(resolve, 300)
                }
              }

              for (let i = 0; i < images.length; i++) {
                if (images[i].complete) {
                  checkLoaded()
                } else {
                  images[i].onload = checkLoaded
                  images[i].onerror = checkLoaded
                }
              }
            } else {
              setTimeout(resolve, 500)
            }
          })

          // Capturar el contenido como imagen usando html2canvas
          const element = iframe.contentDocument.body
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 800,
            windowWidth: 800
          })

          // Crear PDF con jsPDF - Manejar múltiples páginas
          const imgData = canvas.toDataURL('image/png')
          const pdf = new jsPDF('p', 'mm', 'letter')
          const imgWidth = 216
          const pageHeight = 279
          const imgHeight = (canvas.height * imgWidth) / canvas.width
          let heightLeft = imgHeight
          let position = 0

          // Agregar primera página
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight

          // Agregar páginas adicionales si es necesario
          while (heightLeft > 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
          }

          console.log('→ Guardando PDF...')
          pdf.save(`${fileName}.pdf`)

          // Limpiar iframe
          document.body.removeChild(iframe)

          console.log('✓ PDF exportado exitosamente')
          if (this.$toast) {
            this.$toast.success('Pedido exportado a PDF exitosamente')
          }
        } else {
          console.error('Error: respuesta inválida del servidor')
          if (this.$toast) {
            this.$toast.error('Error: No se pudo obtener los datos del pedido')
          }
        }
      } catch (error) {
        console.error('Error al exportar PDF:', error)
        if (this.$toast) {
          this.$toast.error('Error al exportar pedido a PDF')
        }
      }
    },

    async generatePrintHTML(order) {
      // Debug: verificar logo
      let logoUrl = ''
      let hasLogo = false

      // Intentar obtener el logo de la base de datos
      if (this.companyInfo?.logo_url) {
        const dbLogoUrl = this.companyInfo.logo_url
        console.log('Logo URL de BD:', dbLogoUrl)

        // Si es una URL externa (Google Cloud Storage), usar proxy del backend
        if (dbLogoUrl.startsWith('http')) {
          try {
            console.log('Obteniendo imagen a través del proxy del backend...')
            const response = await api.get('/image-proxy', {
              params: { url: dbLogoUrl }
            })

            if (response.data.success && response.data.data.base64) {
              logoUrl = response.data.data.base64
              hasLogo = true
              console.log('✓ Imagen obtenida exitosamente del proxy, tamaño:', Math.round(response.data.data.size / 1024), 'KB')
            } else {
              console.error('Error: respuesta inválida del proxy')
              hasLogo = false
            }
          } catch (error) {
            console.error('Error al obtener imagen del proxy:', error)
            hasLogo = false
          }
        } else if (dbLogoUrl.startsWith('data:')) {
          // Si ya es base64
          logoUrl = dbLogoUrl
          hasLogo = true
          console.log('✓ Logo ya está en formato base64')
        }
      } else {
        console.log('No hay logo_url configurado en la empresa')
      }

      console.log('¿Tiene logo?:', hasLogo)
      console.log('Company Info:', this.companyInfo)

      const itemsHTML = order.items.map((item, index) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${index + 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product_code || 'N/A'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product_name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatMoney(item.unit_price)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">${this.formatMoney(item.subtotal)}</td>
        </tr>
      `).join('')

      // Calcular subtotal e impuestos (los precios ya incluyen 15% de impuesto)
      const totalWithTax = order.total_amount || order.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
      const subtotal = totalWithTax / 1.15 // Extraer monto sin impuesto
      const taxAmount = subtotal * 0.15 // Calcular 15% de impuesto

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Pedido ${order.order_number}</title>
          <style>
            @page {
              size: letter;
              margin: 0.5in;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              font-size: 11px;
            }
            .header {
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header-left {
              color: white;
            }
            .header-left h1 {
              margin: 0 0 5px 0;
              font-size: 24px;
            }
            .header-left p {
              margin: 3px 0;
              font-size: 10px;
            }
            .header-right {
              background: white;
              padding: 15px 25px;
              border-radius: 5px;
              text-align: center;
            }
            .header-right h2 {
              margin: 0;
              color: #FF6B35;
              font-size: 14px;
            }
            .header-right .pedido-number {
              font-size: 20px;
              font-weight: bold;
              color: #333;
              margin: 5px 0;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .info-box {
              width: 48%;
              background: #f8f9fa;
              padding: 12px;
              border-radius: 5px;
            }
            .info-box h3 {
              margin: 0 0 10px 0;
              font-size: 12px;
              color: #FF6B35;
              border-bottom: 2px solid #FF6B35;
              padding-bottom: 5px;
            }
            .info-box p {
              margin: 5px 0;
              font-size: 10px;
            }
            .info-box strong {
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            thead {
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
              color: white;
            }
            thead th {
              padding: 10px;
              text-align: left;
              font-size: 11px;
              font-weight: bold;
            }
            tbody td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
              font-size: 10px;
            }
            .totals-section {
              margin-top: 20px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-table {
              width: 350px;
              border: 2px solid #FF6B35;
              border-radius: 5px;
              overflow: hidden;
            }
            .totals-table tr {
              border-bottom: 1px solid #ddd;
            }
            .totals-table tr:last-child {
              border-bottom: none;
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
              color: white;
            }
            .totals-table td {
              padding: 10px 15px;
              font-size: 11px;
            }
            .totals-table tr:last-child td {
              font-size: 14px;
              font-weight: bold;
            }
            .totals-table td:first-child {
              text-align: left;
            }
            .totals-table td:last-child {
              text-align: right;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #FF6B35;
              text-align: center;
              font-size: 9px;
              color: #666;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: bold;
              margin-top: 10px;
            }
            .status-pendiente { background: #ffc107; color: #000; }
            .status-cotizado { background: #17a2b8; color: white; }
            .status-cobrado { background: #28a745; color: white; }
            .status-cancelado { background: #dc3545; color: white; }

            /* Print-specific rules to preserve colors and gradients */
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 20px;">
              <!-- Logo y Info de la Empresa -->
              <div style="flex: 1;">
                ${hasLogo ? `<img src="${logoUrl}" style="max-width: 180px; height: auto; margin-bottom: 8px;" alt="Logo">` : ''}
                <div style="font-size: 11px; line-height: 1.6; color: #333;">
                  <strong style="font-size: 13px;">${this.companyInfo?.commercial_name || this.companyInfo?.name || 'Cerámicas Terrazos y Pulidos'}</strong><br>
                  <strong>RTN:</strong> ${this.companyInfo?.rtn || '01061977002516'}<br>
                  <strong>Dirección:</strong> ${this.companyInfo?.address || 'Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico, La Ceiba, Atlántida'}<br>
                  <strong>Tel:</strong> ${this.companyInfo?.phone || '+504 2440-0037'}${this.companyInfo?.whatsapp ? ' | <strong>Móvil:</strong> ' + this.companyInfo.whatsapp : ''}<br>
                  <strong>Email:</strong> ${this.companyInfo?.email || 'mauricio_argenal@hotmail.com'}
                </div>
              </div>
              <!-- Info del Pedido -->
              <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 15px 25px; border-radius: 8px; text-align: center; min-width: 200px;">
                <h2 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">PEDIDO EN LÍNEA</h2>
                <div style="font-size: 20px; font-weight: bold; margin: 8px 0;">${order.order_number}</div>
                <span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span>
              </div>
            </div>
            <hr style="border: none; border-top: 3px solid #FF6B35; margin: 15px 0;">
          </div>

          <!-- Info Section -->
          <div class="info-section">
            <div class="info-box">
              <h3>Cliente</h3>
              <p><strong>Nombre:</strong> ${order.customer_name}</p>
              <p><strong>Email:</strong> ${order.customer_email || 'N/A'}</p>
              <p><strong>Teléfono:</strong> ${order.customer_phone || 'N/A'}</p>
              <p><strong>DNI:</strong> ${order.customer_dni || 'N/A'}</p>
            </div>
            <div class="info-box">
              <h3>Información de Entrega</h3>
              <p><strong>Dirección:</strong> ${order.delivery_address || 'N/A'}</p>
              <p><strong>Ciudad:</strong> ${order.city || 'N/A'}${order.department ? ', ' + order.department : ''}</p>
              ${order.receiver_name ? `<p><strong>Receptor:</strong> ${order.receiver_name}</p>` : ''}
              ${order.receiver_phone ? `<p><strong>Tel. Receptor:</strong> ${order.receiver_phone}</p>` : ''}
              <p><strong>Fecha:</strong> ${this.formatDate(order.created_at)}</p>
            </div>
          </div>

          <!-- Products Table -->
          <table>
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">NO</th>
                <th style="width: 15%;">CÓDIGO</th>
                <th style="width: 40%;">DESCRIPCIÓN</th>
                <th style="width: 10%; text-align: center;">CANTIDAD</th>
                <th style="width: 15%; text-align: right;">PRECIO</th>
                <th style="width: 15%; text-align: right;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Totals Section -->
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td>Importe Exonerado:</td>
                <td>${this.formatMoney(0)}</td>
              </tr>
              <tr>
                <td>Importe Exento:</td>
                <td>${this.formatMoney(0)}</td>
              </tr>
              <tr>
                <td>Gravado 15%</td>
                <td>${this.formatMoney(subtotal)}</td>
              </tr>
              <tr>
                <td>Gravado 18%</td>
                <td>${this.formatMoney(0)}</td>
              </tr>
              <tr>
                <td>I.S.V 15 15%:</td>
                <td>${this.formatMoney(taxAmount)}</td>
              </tr>
              <tr>
                <td>I.S.V 18 18%:</td>
                <td>${this.formatMoney(0)}</td>
              </tr>
              <tr>
                <td>RECARGOS:</td>
                <td>${this.formatMoney(0)}</td>
              </tr>
              <tr>
                <td>DESCUENTOS Y REBAJAS OTORGADOS:</td>
                <td>${this.formatMoney(0)}</td>
              </tr>
              <tr>
                <td>TOTAL:</td>
                <td>${this.formatMoney(totalWithTax)}</td>
              </tr>
            </table>
          </div>

          ${order.notes ? `
          <div style="margin-top: 20px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
            <strong>Notas de entrega:</strong><br>
            ${order.notes}
          </div>
          ` : ''}

          ${order.additional_comments ? `
          <div style="margin-top: 10px; padding: 10px; background: #d1ecf1; border-left: 4px solid #17a2b8; border-radius: 4px;">
            <strong>Comentarios adicionales:</strong><br>
            ${order.additional_comments}
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <p><strong>Original Cliente - Copia Obligado Tributario Emisor</strong></p>
          </div>
        </body>
        </html>
      `
    },

    async exportOrderToExcel(order) {
      try {
        console.log('→ Iniciando exportación a Excel para pedido:', order.id)
        const response = await api.get(`/orders/${order.id}`)

        if (response?.data?.success) {
          const orderData = response.data.data

          // Calcular subtotal e impuestos (los precios ya incluyen 15% de impuesto)
          const totalWithTax = orderData.total_amount || orderData.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
          const subtotal = totalWithTax / 1.15
          const taxAmount = subtotal * 0.15

          // Crear datos para CSV
          const csvData = []

          // Información de la empresa
          csvData.push([this.companyInfo?.commercial_name || this.companyInfo?.name || 'Cerámicas Terrazos y Pulidos'])
          csvData.push(['RTN:', this.companyInfo?.rtn || '01061977002516'])
          csvData.push(['Dirección:', this.companyInfo?.address || 'Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico, La Ceiba, Atlántida'])
          csvData.push(['Teléfono:', this.companyInfo?.phone || '+504 2440-0037'])
          csvData.push(['Email:', this.companyInfo?.email || 'mauricio_argenal@hotmail.com'])
          csvData.push([])

          // Información del pedido
          csvData.push(['PEDIDO EN LÍNEA'])
          csvData.push(['Número de Pedido:', orderData.order_number])
          csvData.push(['Estado:', this.getStatusText(orderData.status)])
          csvData.push(['Fecha:', this.formatDate(orderData.created_at)])
          csvData.push([])

          // Información del cliente
          csvData.push(['INFORMACIÓN DEL CLIENTE'])
          csvData.push(['Nombre:', orderData.customer_name])
          csvData.push(['Email:', orderData.customer_email || 'N/A'])
          csvData.push(['Teléfono:', orderData.customer_phone || 'N/A'])
          csvData.push(['DNI:', orderData.customer_dni || 'N/A'])
          csvData.push([])

          // Información de entrega
          csvData.push(['INFORMACIÓN DE ENTREGA'])
          csvData.push(['Dirección:', orderData.delivery_address || 'N/A'])
          csvData.push(['Ciudad:', `${orderData.city || 'N/A'}${orderData.department ? ', ' + orderData.department : ''}`])
          if (orderData.receiver_name) {
            csvData.push(['Receptor:', orderData.receiver_name])
          }
          if (orderData.receiver_phone) {
            csvData.push(['Tel. Receptor:', orderData.receiver_phone])
          }
          csvData.push([])

          // Tabla de productos
          csvData.push(['NO', 'CÓDIGO', 'DESCRIPCIÓN', 'CANTIDAD', 'PRECIO', 'TOTAL'])
          orderData.items.forEach((item, index) => {
            csvData.push([
              index + 1,
              item.product_code || 'N/A',
              item.product_name,
              item.quantity,
              this.formatMoney(item.unit_price),
              this.formatMoney(item.subtotal)
            ])
          })

          csvData.push([])

          // Totales
          csvData.push(['', '', '', '', 'Importe Exonerado:', this.formatMoney(0)])
          csvData.push(['', '', '', '', 'Importe Exento:', this.formatMoney(0)])
          csvData.push(['', '', '', '', 'Gravado 15%', this.formatMoney(subtotal)])
          csvData.push(['', '', '', '', 'Gravado 18%', this.formatMoney(0)])
          csvData.push(['', '', '', '', 'I.S.V 15 15%:', this.formatMoney(taxAmount)])
          csvData.push(['', '', '', '', 'I.S.V 18 18%:', this.formatMoney(0)])
          csvData.push(['', '', '', '', 'RECARGOS:', this.formatMoney(0)])
          csvData.push(['', '', '', '', 'DESCUENTOS Y REBAJAS OTORGADOS:', this.formatMoney(0)])
          csvData.push(['', '', '', '', 'TOTAL:', this.formatMoney(totalWithTax)])

          // Notas
          if (orderData.notes) {
            csvData.push([])
            csvData.push(['Notas de entrega:', orderData.notes])
          }
          if (orderData.additional_comments) {
            csvData.push([])
            csvData.push(['Comentarios adicionales:', orderData.additional_comments])
          }

          // Convertir a CSV
          const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
          const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = `Pedido_${orderData.order_number}.csv`
          link.click()

          console.log('✓ Excel exportado exitosamente')
          if (this.$toast) {
            this.$toast.success('Pedido exportado a Excel exitosamente')
          }
        } else {
          console.error('Error: respuesta inválida del servidor')
          if (this.$toast) {
            this.$toast.error('Error: No se pudo obtener los datos del pedido')
          }
        }
      } catch (error) {
        console.error('Error al exportar a Excel:', error)
        if (this.$toast) {
          this.$toast.error('Error al exportar pedido a Excel')
        }
      }
    },

    async printOrder(order) {
      try {
        console.log('→ Iniciando impresión para pedido:', order.id)
        const response = await api.get(`/orders/${order.id}`)

        if (response?.data?.success) {
          const orderData = response.data.data

          console.log('→ Generando HTML para impresión...')
          const printContent = await this.generatePrintHTML(orderData)

          console.log('→ Abriendo ventana de impresión...')
          const printWindow = window.open('', '_blank', 'width=800,height=600')

          if (printWindow) {
            printWindow.document.write(printContent)
            printWindow.document.close()

            // Esperar a que las imágenes carguen antes de imprimir
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print()
                console.log('✓ Diálogo de impresión abierto')
              }, 500)
            }
          } else {
            throw new Error('No se pudo abrir la ventana de impresión')
          }
        } else {
          console.error('Error: respuesta inválida del servidor')
          if (this.$toast) {
            this.$toast.error('Error: No se pudo obtener los datos del pedido')
          }
        }
      } catch (error) {
        console.error('Error al imprimir:', error)
        if (this.$toast) {
          this.$toast.error('Error al imprimir pedido')
        }
      }
    },

    async exportOrderAsImage(order) {
      try {
        console.log('→ Iniciando exportación como imagen para pedido:', order.id)
        const response = await api.get(`/orders/${order.id}`)

        if (response?.data?.success) {
          const orderData = response.data.data
          const fileName = `Pedido_${orderData.order_number}`

          console.log('→ Generando HTML del pedido...')

          // Crear iframe oculto (igual que en PDF)
          const iframe = document.createElement('iframe')
          iframe.style.position = 'absolute'
          iframe.style.left = '-9999px'
          iframe.style.width = '800px'
          iframe.style.height = '600px'
          document.body.appendChild(iframe)

          // Generar HTML con el mismo formato que PDF
          const htmlContent = await this.generatePrintHTML(orderData)
          iframe.contentDocument.write(htmlContent)
          iframe.contentDocument.close()

          // Esperar a que las imágenes carguen
          await new Promise(resolve => {
            const images = iframe.contentDocument.getElementsByTagName('img')
            if (images.length > 0) {
              let loaded = 0
              const total = images.length

              const checkLoaded = () => {
                loaded++
                if (loaded === total) {
                  setTimeout(resolve, 300)
                }
              }

              for (let i = 0; i < images.length; i++) {
                if (images[i].complete) {
                  checkLoaded()
                } else {
                  images[i].onload = checkLoaded
                  images[i].onerror = checkLoaded
                }
              }
            } else {
              setTimeout(resolve, 500)
            }
          })

          console.log('→ Capturando como imagen...')

          // Capturar el contenido como imagen usando html2canvas
          const element = iframe.contentDocument.body
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 800,
            windowWidth: 800
          })

          console.log('→ Convirtiendo a PNG...')

          // Convertir canvas a imagen y descargar
          canvas.toBlob(blob => {
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `${fileName}.png`
            link.click()

            // Limpiar iframe
            document.body.removeChild(iframe)

            console.log('✓ Imagen exportada exitosamente')
            if (this.$toast) {
              this.$toast.success('Pedido guardado como imagen exitosamente')
            }
          })
        } else {
          console.error('Error: respuesta inválida del servidor')
          if (this.$toast) {
            this.$toast.error('Error: No se pudo obtener los datos del pedido')
          }
        }
      } catch (error) {
        console.error('Error al exportar como imagen:', error)
        if (this.$toast) {
          this.$toast.error('Error al exportar pedido como imagen')
        }
      }
    },

    // Métodos para el reporte de lista de pedidos
    async generateReportHTML() {
      // Obtener logo desde la base de datos
      let logoUrl = ''
      let hasLogo = false

      if (this.companyInfo?.logo_url) {
        const dbLogoUrl = this.companyInfo.logo_url
        if (dbLogoUrl.startsWith('http')) {
          try {
            const response = await api.get('/image-proxy', { params: { url: dbLogoUrl } })
            if (response.data.success && response.data.data.base64) {
              logoUrl = response.data.data.base64
              hasLogo = true
            }
          } catch (error) {
            console.error('Error al cargar logo:', error)
          }
        }
      }

      // Calcular totales
      const totalGeneral = this.orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)

      // Obtener rango de fechas
      const fechaDesde = this.filters.start_date || 'Inicio'
      const fechaHasta = this.filters.end_date || 'Hoy'

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Pedidos en Línea</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              font-size: 11px;
              line-height: 1.4;
            }
            .header-section {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 3px solid #FF6B35;
            }
            .company-info {
              flex: 1;
            }
            .company-logo {
              max-width: 180px;
              height: auto;
              margin-bottom: 10px;
            }
            .company-details {
              font-size: 10px;
              line-height: 1.6;
              color: #333;
            }
            .company-name {
              font-size: 14px;
              font-weight: bold;
              color: #000;
              margin-bottom: 5px;
            }
            .report-title {
              text-align: right;
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
              color: white;
              padding: 15px 25px;
              border-radius: 8px;
              min-width: 250px;
            }
            .report-title h2 {
              font-size: 16px;
              margin-bottom: 8px;
            }
            .report-date {
              font-size: 11px;
              opacity: 0.95;
            }
            .filters-info {
              background-color: #f8f9fa;
              padding: 12px 15px;
              border-radius: 5px;
              margin-bottom: 20px;
              font-size: 10px;
            }
            .filters-info strong {
              color: #FF6B35;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            thead {
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
              color: white;
            }
            th {
              padding: 10px 8px;
              text-align: left;
              font-size: 10px;
              font-weight: bold;
            }
            td {
              padding: 8px;
              border-bottom: 1px solid #e0e0e0;
              font-size: 10px;
            }
            tbody tr:hover {
              background-color: #f8f9fa;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 9px;
              font-weight: bold;
            }
            .badge-pendiente {
              background-color: #ffc107;
              color: #000;
            }
            .badge-cotizado {
              background-color: #17a2b8;
              color: white;
            }
            .badge-cobrado {
              background-color: #28a745;
              color: white;
            }
            .badge-cancelado {
              background-color: #dc3545;
              color: white;
            }
            .totals-section {
              margin-top: 20px;
              text-align: right;
            }
            .totals-box {
              display: inline-block;
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
              color: white;
              padding: 15px 25px;
              border-radius: 8px;
              min-width: 300px;
            }
            .totals-box .label {
              font-size: 11px;
              opacity: 0.9;
              margin-bottom: 5px;
            }
            .totals-box .value {
              font-size: 20px;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #e0e0e0;
              text-align: center;
              font-size: 9px;
              color: #666;
            }

            /* Print-specific rules */
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header-section">
            <div class="company-info">
              ${hasLogo ? `<img src="${logoUrl}" class="company-logo" alt="Logo">` : ''}
              <div class="company-name">${this.companyInfo?.commercial_name || this.companyInfo?.name || 'Cerámicas Terrazos y Pulidos'}</div>
              <div class="company-details">
                <strong>RTN:</strong> ${this.companyInfo?.rtn || '01061977002516'}<br>
                <strong>Dirección:</strong> ${this.companyInfo?.address || 'Casa Matriz, Barrio La Merced, La Ceiba, Atlántida'}<br>
                <strong>Tel:</strong> ${this.companyInfo?.phone || '+504 2440-0037'}${this.companyInfo?.whatsapp ? ' | <strong>Móvil:</strong> ' + this.companyInfo.whatsapp : ''}<br>
                <strong>Email:</strong> ${this.companyInfo?.email || 'mauricio_argenal@hotmail.com'}
              </div>
            </div>
            <div class="report-title">
              <h2>PEDIDOS EN LÍNEA</h2>
              <div class="report-date">
                <strong>Desde:</strong> ${fechaDesde}<br>
                <strong>Hasta:</strong> ${fechaHasta}
              </div>
            </div>
          </div>

          <!-- Filtros aplicados -->
          ${this.filters.status || this.filters.search ? `
          <div class="filters-info">
            <strong>Filtros aplicados:</strong>
            ${this.filters.status ? `Estado: <strong>${this.getStatusText(this.filters.status)}</strong>` : ''}
            ${this.filters.search ? `Búsqueda: <strong>${this.filters.search}</strong>` : ''}
          </div>
          ` : ''}

          <!-- Tabla de pedidos -->
          <table>
            <thead>
              <tr>
                <th>Número de Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th class="text-center">Items</th>
                <th class="text-right">Total</th>
                <th class="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${this.orders.map(order => `
                <tr>
                  <td><strong>${order.order_number}</strong></td>
                  <td>
                    ${order.customer_name}<br>
                    <span style="color: #666; font-size: 9px;">${order.customer_email || 'Sin email'}</span>
                  </td>
                  <td>${this.formatDate(order.created_at)}</td>
                  <td class="text-center">${order.items_count}</td>
                  <td class="text-right"><strong>${this.formatMoney(order.total_amount)}</strong></td>
                  <td class="text-center">
                    <span class="badge badge-${order.status}">${this.getStatusText(order.status)}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Totales -->
          <div class="totals-section">
            <div class="totals-box">
              <div class="label">Total de Pedidos: ${this.orders.length}</div>
              <div class="value">${this.formatMoney(totalGeneral)}</div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            Reporte generado el ${new Date().toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </body>
        </html>
      `
    },

    async saveReportAsExcel() {
      this.showSaveReportModal = false
      try {
        const csvData = []

        // Información de la empresa
        csvData.push([this.companyInfo?.commercial_name || this.companyInfo?.name || 'Cerámicas Terrazos y Pulidos'])
        csvData.push(['RTN:', this.companyInfo?.rtn || '01061977002516'])
        csvData.push(['Dirección:', this.companyInfo?.address || 'Casa Matriz, Barrio La Merced, La Ceiba, Atlántida'])
        csvData.push(['Teléfono:', this.companyInfo?.phone || '+504 2440-0037'])
        csvData.push(['Email:', this.companyInfo?.email || 'mauricio_argenal@hotmail.com'])
        csvData.push([])

        // Título del reporte
        csvData.push(['REPORTE DE PEDIDOS EN LÍNEA'])
        csvData.push(['Desde:', this.filters.start_date || 'Inicio', 'Hasta:', this.filters.end_date || 'Hoy'])
        csvData.push([])

        // Encabezados de la tabla
        csvData.push(['Número de Pedido', 'Cliente', 'Email', 'Fecha', 'Items', 'Total', 'Estado'])

        // Datos de los pedidos
        this.orders.forEach(order => {
          csvData.push([
            order.order_number,
            order.customer_name,
            order.customer_email || 'Sin email',
            this.formatDate(order.created_at),
            order.items_count,
            this.formatMoney(order.total_amount),
            this.getStatusText(order.status)
          ])
        })

        csvData.push([])

        // Totales
        const totalGeneral = this.orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)
        csvData.push(['TOTAL DE PEDIDOS:', this.orders.length])
        csvData.push(['TOTAL GENERAL:', this.formatMoney(totalGeneral)])

        // Convertir a CSV
        const csv = csvData.map(row =>
          row.map(cell => `"${cell || ''}"`).join(',')
        ).join('\n')

        // Descargar
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `Pedidos_${this.filters.start_date || 'Inicio'}_${this.filters.end_date || 'Hoy'}.csv`
        link.click()

        if (this.$toast) {
          this.$toast.success('Reporte exportado a Excel exitosamente')
        }
      } catch (error) {
        console.error('Error al exportar a Excel:', error)
        if (this.$toast) {
          this.$toast.error('Error al exportar reporte')
        }
      }
    },

    async saveReportAsPDF() {
      this.showSaveReportModal = false
      try {
        // Crear iframe oculto
        const iframe = document.createElement('iframe')
        iframe.style.position = 'absolute'
        iframe.style.left = '-9999px'
        iframe.style.width = '1000px'
        iframe.style.height = '800px'
        document.body.appendChild(iframe)

        // Generar y escribir el HTML
        const htmlContent = await this.generateReportHTML()
        iframe.contentDocument.write(htmlContent)
        iframe.contentDocument.close()

        // Esperar a que las imágenes carguen
        await new Promise(resolve => {
          const images = iframe.contentDocument.getElementsByTagName('img')
          if (images.length > 0) {
            let loaded = 0
            const total = images.length

            const checkLoaded = () => {
              loaded++
              if (loaded === total) {
                setTimeout(resolve, 300)
              }
            }

            for (let i = 0; i < images.length; i++) {
              if (images[i].complete) {
                checkLoaded()
              } else {
                images[i].onload = checkLoaded
                images[i].onerror = checkLoaded
              }
            }
          } else {
            setTimeout(resolve, 300)
          }
        })

        // Capturar con html2canvas
        const element = iframe.contentDocument.body
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        })

        // Crear PDF
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'letter')

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const canvasWidth = canvas.width
        const canvasHeight = canvas.height
        const ratio = canvasWidth / canvasHeight
        const width = pdfWidth
        const height = width / ratio

        if (height > pdfHeight) {
          // Contenido muy largo - dividir en páginas
          let position = 0
          const pageCanvas = document.createElement('canvas')
          const pageContext = pageCanvas.getContext('2d')
          pageCanvas.width = canvasWidth
          const pageHeight = (pdfHeight / pdfWidth) * canvasWidth

          while (position < canvasHeight) {
            pageCanvas.height = Math.min(pageHeight, canvasHeight - position)
            pageContext.drawImage(canvas, 0, position, canvasWidth, pageCanvas.height, 0, 0, canvasWidth, pageCanvas.height)

            const pageImgData = pageCanvas.toDataURL('image/png')
            if (position > 0) pdf.addPage()
            pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, (pageCanvas.height / canvasWidth) * pdfWidth)

            position += pageHeight
          }
        } else {
          pdf.addImage(imgData, 'PNG', 0, 0, width, height)
        }

        // Descargar
        const fileName = `Pedidos_${this.filters.start_date || 'Inicio'}_${this.filters.end_date || 'Hoy'}.pdf`
        pdf.save(fileName)

        // Limpiar
        document.body.removeChild(iframe)

        if (this.$toast) {
          this.$toast.success('Reporte guardado como PDF exitosamente')
        }
      } catch (error) {
        console.error('Error al guardar como PDF:', error)
        if (this.$toast) {
          this.$toast.error('Error al generar PDF')
        }
      }
    },

    async saveReportAsImage() {
      this.showSaveReportModal = false
      try {
        // Crear iframe oculto
        const iframe = document.createElement('iframe')
        iframe.style.position = 'absolute'
        iframe.style.left = '-9999px'
        iframe.style.width = '1000px'
        iframe.style.height = '800px'
        document.body.appendChild(iframe)

        // Generar y escribir el HTML
        const htmlContent = await this.generateReportHTML()
        iframe.contentDocument.write(htmlContent)
        iframe.contentDocument.close()

        // Esperar a que las imágenes carguen
        await new Promise(resolve => {
          const images = iframe.contentDocument.getElementsByTagName('img')
          if (images.length > 0) {
            let loaded = 0
            const total = images.length

            const checkLoaded = () => {
              loaded++
              if (loaded === total) {
                setTimeout(resolve, 300)
              }
            }

            for (let i = 0; i < images.length; i++) {
              if (images[i].complete) {
                checkLoaded()
              } else {
                images[i].onload = checkLoaded
                images[i].onerror = checkLoaded
              }
            }
          } else {
            setTimeout(resolve, 300)
          }
        })

        // Capturar con html2canvas
        const element = iframe.contentDocument.body
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        })

        // Descargar como imagen
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `Pedidos_${this.filters.start_date || 'Inicio'}_${this.filters.end_date || 'Hoy'}.png`
          link.click()
          URL.revokeObjectURL(url)

          // Limpiar
          document.body.removeChild(iframe)

          if (this.$toast) {
            this.$toast.success('Reporte guardado como imagen exitosamente')
          }
        })
      } catch (error) {
        console.error('Error al guardar como imagen:', error)
        if (this.$toast) {
          this.$toast.error('Error al generar imagen')
        }
      }
    },

    async printReportList() {
      this.showSaveReportModal = false
      try {
        const printContent = await this.generateReportHTML()
        const printWindow = window.open('', '_blank', 'width=1000,height=800')

        if (printWindow) {
          printWindow.document.write(printContent)
          printWindow.document.close()

          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print()
            }, 500)
          }
        }
      } catch (error) {
        console.error('Error al imprimir:', error)
        if (this.$toast) {
          this.$toast.error('Error al imprimir reporte')
        }
      }
    }
  }
}
</script>

<style scoped>
.pedidos-online-container {
  padding: 1rem;
}

.bg-primary-light {
  background-color: #e7f3ff !important;
}

.bg-warning-light {
  background-color: #fff3e0 !important;
}

.bg-info-light {
  background-color: #e0f7fa !important;
}

.bg-success-light {
  background-color: #e8f5e9 !important;
}

.bg-danger-light {
  background-color: #ffebee !important;
}

.avatar {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.avatar-lg {
  width: 50px;
  height: 50px;
}

.avatar-md {
  width: 40px;
  height: 40px;
}

.avatar i {
  color: white;
}

.fs-12 {
  font-size: 0.75rem;
}

.fs-20 {
  font-size: 1.25rem;
}

.table thead th {
  font-weight: 600;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}
</style>

