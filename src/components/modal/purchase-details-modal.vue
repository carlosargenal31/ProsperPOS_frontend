<template>
  <div class="modal fade" :class="{ show: isOpen }" :style="{ display: isOpen ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ti ti-eye me-2"></i>Detalles de Factura de Compra
          </h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>

        <div class="modal-body" v-if="purchase">
          <!-- Header Info -->
          <div class="row mb-4">
            <div class="col-md-6">
              <h6 class="fw-bold mb-3">Información del Proveedor</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td class="fw-semibold" style="width: 40%;">Proveedor:</td>
                    <td>{{ purchase.supplier_name }}</td>
                  </tr>
                  <tr>
                    <td class="fw-semibold">RTN/ID:</td>
                    <td>{{ purchase.supplier_id_number || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-md-6">
              <h6 class="fw-bold mb-3">Información de la Factura</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td class="fw-semibold" style="width: 40%;">N° Factura:</td>
                    <td>{{ purchase.invoice_number || purchase.purchase_number }}</td>
                  </tr>
                  <tr>
                    <td class="fw-semibold">Fecha:</td>
                    <td>{{ formatDate(purchase.purchase_date) }}</td>
                  </tr>
                  <tr>
                    <td class="fw-semibold">Estado de Pago:</td>
                    <td>
                      <span :class="getPaymentStatusClass(purchase.payment_status)">
                        {{ getPaymentStatusText(purchase.payment_status) }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="fw-semibold">Creado por:</td>
                    <td>{{ purchase.created_by_name || 'Sistema' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Invoice Image -->
          <div v-if="purchase.invoice_image" class="row mb-4">
            <div class="col-12">
              <h6 class="fw-bold mb-3">Imagen de la Factura</h6>
              <div class="text-center">
                <img :src="`/api/purchases/invoice-image/${purchase.invoice_image}`" alt="Factura" class="img-fluid" style="max-height: 400px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="row mb-4" v-if="purchase.items && purchase.items.length > 0">
            <div class="col-12">
              <h6 class="fw-bold mb-3">Productos/Servicios</h6>
              <div class="table-responsive">
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th>#</th>
                      <th>Descripción</th>
                      <th class="text-end">Cantidad</th>
                      <th class="text-end">Precio Unit.</th>
                      <th class="text-end">Descuento</th>
                      <th class="text-end">Impuesto</th>
                      <th class="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in purchase.items" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ item.product_name }}</td>
                      <td class="text-end">{{ item.quantity }}</td>
                      <td class="text-end">L {{ formatCurrency(item.unit_price) }}</td>
                      <td class="text-end">L {{ formatCurrency(item.discount_amount) }}</td>
                      <td class="text-end">L {{ formatCurrency(item.tax_amount) }}</td>
                      <td class="text-end fw-bold">L {{ formatCurrency(item.total) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Totals -->
          <div class="row">
            <div class="col-md-6 offset-md-6">
              <div class="card border">
                <div class="card-body">
                  <h6 class="fw-bold mb-3">Resumen de Totales</h6>
                  <table class="table table-sm mb-0">
                    <tbody>
                      <tr>
                        <td class="fw-semibold text-end" style="width: 50%;">Subtotal:</td>
                        <td class="text-end">L {{ formatCurrency(purchase.net_amount) }}</td>
                      </tr>
                      <tr>
                        <td class="fw-semibold text-end">ISV (15%):</td>
                        <td class="text-end">L {{ formatCurrency(purchase.tax_amount) }}</td>
                      </tr>
                      <tr class="border-top">
                        <td class="fw-semibold text-end">Descuento:</td>
                        <td class="text-end" :class="purchase.discount_amount > 0 ? 'text-danger fw-bold' : 'text-muted'">
                          <span v-if="purchase.discount_amount > 0">-L {{ formatCurrency(purchase.discount_amount) }}</span>
                          <span v-else>L 0.00</span>
                        </td>
                      </tr>
                      <tr>
                        <td class="fw-semibold text-end">Recargo:</td>
                        <td class="text-end" :class="purchase.surcharge_amount > 0 ? 'text-success fw-bold' : 'text-muted'">
                          <span v-if="purchase.surcharge_amount > 0">+L {{ formatCurrency(purchase.surcharge_amount) }}</span>
                          <span v-else>L 0.00</span>
                        </td>
                      </tr>
                      <tr class="table-active border-top border-2">
                        <td class="fw-bold text-end fs-16">TOTAL A PAGAR:</td>
                        <td class="fw-bold text-end fs-16 text-primary">L {{ formatCurrency(purchase.total_amount) }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="mt-3 p-2 bg-light rounded" v-if="purchase.discount_amount > 0 || purchase.surcharge_amount > 0">
                    <small class="text-muted d-block">
                      <i class="ti ti-info-circle me-1"></i>
                      <span v-if="purchase.discount_amount > 0">Se aplicó un descuento de L {{ formatCurrency(purchase.discount_amount) }}. </span>
                      <span v-if="purchase.surcharge_amount > 0">Se aplicó un recargo de L {{ formatCurrency(purchase.surcharge_amount) }}.</span>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="purchase.notes" class="row mt-3">
            <div class="col-12">
              <h6 class="fw-bold mb-2">Notas</h6>
              <div class="alert alert-info">
                {{ purchase.notes }}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Cerrar</button>
          <button type="button" class="btn btn-primary" @click="printInvoice">
            <i class="ti ti-printer me-2"></i>Imprimir
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade" :class="{ show: isOpen }" v-if="isOpen"></div>
</template>

<script>
export default {
  name: 'PurchaseDetailsModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    purchase: {
      type: Object,
      default: null
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-HN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    formatCurrency(amount) {
      if (!amount) return '0.00';
      return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    getPaymentStatusClass(status) {
      const classes = {
        'Paid': 'badge bg-success',
        'Unpaid': 'badge bg-danger',
        'Partial': 'badge bg-warning',
        'Overdue': 'badge bg-dark'
      };
      return classes[status] || 'badge bg-secondary';
    },

    getPaymentStatusText(status) {
      const texts = {
        'Paid': 'Pagado',
        'Unpaid': 'Sin Pagar',
        'Partial': 'Parcial',
        'Overdue': 'Vencido'
      };
      return texts[status] || status;
    },

    printInvoice() {
      window.print();
    },

    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal.show {
  display: block !important;
}

.modal-backdrop.show {
  opacity: 0.5;
}

@media print {
  .modal-header,
  .modal-footer {
    display: none !important;
  }
}
</style>
