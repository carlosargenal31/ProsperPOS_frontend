<template>
  <div class="pedidos-online-container">
    <!-- Estadísticas -->
    <div class="row mb-4">
      <div class="col-lg-3 col-sm-6">
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

      <div class="col-lg-3 col-sm-6">
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

      <div class="col-lg-3 col-sm-6">
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

      <div class="col-lg-3 col-sm-6">
        <div class="card bg-success-light">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-2">Cobrados</h6>
                <h3 class="mb-0">{{ stats?.cobrados || 0 }}</h3>
              </div>
              <div class="avatar avatar-lg bg-success">
                <i class="ti ti-check-circle fs-24"></i>
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
                @click="exportToExcel"
                class="btn btn-success"
                :disabled="orders.length === 0">
                <i class="ti ti-file-spreadsheet me-1"></i>
                Exportar a Excel
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
                <td><strong>L{{ parseFloat(order.total_amount).toFixed(2) }}</strong></td>
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
                    @click="exportOrderToPDF(order)"
                    class="btn btn-sm btn-success"
                    title="Exportar a PDF">
                    <i class="ti ti-file-text"></i>
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
                      {{ item.product_name }}
                      <small class="text-muted d-block" v-if="item.product_code">{{ item.product_code }}</small>
                    </td>
                    <td class="text-end">{{ item.quantity }}</td>
                    <td class="text-end">L{{ parseFloat(item.unit_price).toFixed(2) }}</td>
                    <td class="text-end"><strong>L{{ parseFloat(item.subtotal).toFixed(2) }}</strong></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-end"><strong>TOTAL:</strong></td>
                    <td class="text-end"><strong>L{{ parseFloat(selectedOrder.total_amount).toFixed(2) }}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Notas -->
            <div v-if="selectedOrder.notes" class="alert alert-info mt-3">
              <strong>Notas del cliente:</strong><br>
              {{ selectedOrder.notes }}
            </div>

            <!-- Estado Actual -->
            <div class="mt-3">
              <strong>Estado Actual:</strong>
              <span :class="getStatusClass(selectedOrder.status)" class="badge ms-2">
                {{ getStatusText(selectedOrder.status) }}
              </span>
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
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Notas Adicionales</label>
              <textarea
                v-model="statusNotes"
                class="form-control"
                rows="3"
                placeholder="Agregar notas sobre el cambio de estado..."></textarea>
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
  </div>
</template>

<script>
import api from '@/utils/axios'
import { Modal } from 'bootstrap'

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
      searchTimeout: null
    }
  },
  mounted() {
    this.loadOrders()
    this.loadStats()
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

    async saveStatusChange() {
      if (!this.newStatus) {
        this.$toast.warning('Seleccione un nuevo estado')
        return
      }

      this.savingStatus = true
      try {
        const response = await api.patch(
          `/orders/${this.selectedOrder.id}/status`,
          {
            status: this.newStatus,
            notes: this.statusNotes || null
          }
        )

        if (response.data.success) {
          this.$toast.success('Estado del pedido actualizado')

          // Cerrar modal
          const modal = Modal.getInstance(this.$refs.changeStatusModal)
          modal.hide()

          // Recargar datos
          await this.loadOrders()
          await this.loadStats()
        }
      } catch (error) {
        console.error('Error al cambiar estado:', error)
        this.$toast.error('Error al actualizar el estado del pedido')
      } finally {
        this.savingStatus = false
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusClass(status) {
      const classes = {
        'pendiente': 'bg-warning',
        'cotizado': 'bg-info',
        'cobrado': 'bg-success'
      }
      return classes[status] || 'bg-secondary'
    },

    getStatusText(status) {
      const texts = {
        'pendiente': 'Pendiente',
        'cotizado': 'Cotizado',
        'cobrado': 'Cobrado'
      }
      return texts[status] || status
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
        const response = await api.get(`/orders/${order.id}/export/pdf`)

        if (response.data.success) {
          const pdfData = response.data.data

          // Crear contenido HTML para imprimir
          const printContent = this.generatePrintHTML(pdfData)

          // Abrir ventana de impresión
          const printWindow = window.open('', '', 'width=800,height=600')
          printWindow.document.write(printContent)
          printWindow.document.close()
          printWindow.print()
        }
      } catch (error) {
        console.error('Error al exportar PDF:', error)
        this.$toast.error('Error al exportar pedido a PDF')
      }
    },

    generatePrintHTML(order) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Pedido ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
            .info { margin: 20px 0; }
            .info-row { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #667eea; color: white; }
            .total { text-align: right; font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <h1>Pedido ${order.order_number}</h1>

          <div class="info">
            <h2>Información del Cliente</h2>
            <div class="info-row"><strong>Nombre:</strong> ${order.customer_name}</div>
            <div class="info-row"><strong>Email:</strong> ${order.customer_email || 'No proporcionado'}</div>
            <div class="info-row"><strong>Teléfono:</strong> ${order.customer_phone || 'No proporcionado'}</div>
            <div class="info-row"><strong>Dirección:</strong> ${order.delivery_address}</div>
            <div class="info-row"><strong>Ciudad:</strong> ${order.city}${order.department ? ', ' + order.department : ''}</div>
          </div>

          <div class="info">
            <h2>Productos</h2>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.product_name}</td>
                    <td>${item.product_code || '-'}</td>
                    <td>${item.quantity}</td>
                    <td>L${item.unit_price}</td>
                    <td>L${item.subtotal}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">TOTAL: L${order.total_amount}</div>
          </div>

          <div class="info">
            <div class="info-row"><strong>Estado:</strong> ${this.getStatusText(order.status)}</div>
            <div class="info-row"><strong>Fecha:</strong> ${order.created_at}</div>
            ${order.notes ? `<div class="info-row"><strong>Notas:</strong> ${order.notes}</div>` : ''}
          </div>
        </body>
        </html>
      `
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

.avatar {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.avatar i {
  color: white;
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
