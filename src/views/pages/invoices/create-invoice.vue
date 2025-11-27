<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">

      <!-- Header compacto -->
      <div class="invoice-header-section mb-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-2">
            <div class="form-group mb-0">
              <label class="small text-muted mb-1">Consecutivo</label>
              <div class="d-flex">
                <span class="badge bg-danger me-2">FAC</span>
                <input type="text" class="form-control form-control-sm" v-model="invoice.consecutive" readonly>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group mb-0">
              <label class="small text-muted mb-1">No. Resolución</label>
              <input type="text" class="form-control form-control-sm" v-model="companyInfo.cai" readonly>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label class="small text-muted mb-1">Consecutivo Resolución</label>
              <input type="text" class="form-control form-control-sm bg-light" v-model="invoiceNumber" readonly>
            </div>
          </div>
        </div>
      </div>

      <!-- Cliente Section -->
      <div class="client-section mb-3">
        <div class="row g-2 align-items-end">
          <div class="col-md-2">
            <div class="form-group mb-0">
              <label class="small text-muted mb-1">Cliente</label>
              <div class="input-group input-group-sm">
                <button class="btn btn-sm btn-info" type="button" @click="searchClient">
                  <i class="ti ti-search"></i>
                </button>
                <input type="text" class="form-control form-control-sm" v-model="invoice.customer_code" placeholder="000001">
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group mb-0">
              <label class="small text-muted mb-1">Nombre</label>
              <div class="input-group input-group-sm">
                <input type="text" class="form-control form-control-sm" v-model="selectedCustomer.name" readonly>
                <button class="btn btn-sm btn-success" type="button" @click="showAddCustomer = true">
                  NUEVO <i class="ti ti-chevron-down ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Documento y Almacén -->
      <div class="document-section mb-3">
        <div class="row g-2">
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label class="small text-muted mb-1">Documento a emitir</label>
              <select class="form-select form-select-sm" v-model="invoice.document_type">
                <option value="FACTURA">FACTURA</option>
                <option value="TICKET">TICKET</option>
                <option value="CREDITO">CRÉDITO</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label class="small text-muted mb-1">Almacen</label>
              <select class="form-select form-select-sm" v-model="invoice.warehouse_id">
                <option value="1">BODEGA 101 TIENDA</option>
                <option value="2">BODEGA 102 ALMACEN</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label class="small text-muted mb-1">Vendedor</label>
              <div class="input-group input-group-sm">
                <button class="btn btn-sm btn-info" type="button">
                  <i class="ti ti-search"></i>
                </button>
                <input type="text" class="form-control form-control-sm bg-light" :value="currentUser.name" readonly>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos Section -->
      <div class="products-section mb-3">
        <div class="row g-2 mb-2 align-items-end">
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label class="small text-muted mb-1">Codigo de Articulo</label>
              <div class="input-group input-group-sm">
                <button class="btn btn-sm btn-info" type="button" @click="searchProduct">
                  <i class="ti ti-search"></i>
                </button>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="currentProduct.code"
                  @keypress.enter="searchProductByCode"
                  placeholder="Codigo de Articulo"
                >
                <button class="btn btn-sm btn-success" type="button" @click="showAddProduct = true">
                  NUEVO
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <label class="small text-muted mb-1">Nombre</label>
            <input type="text" class="form-control form-control-sm" v-model="currentProduct.name" placeholder="Nombre Articulo">
          </div>
          <div class="col-md-1">
            <label class="small text-muted mb-1">Cantidad</label>
            <input type="number" class="form-control form-control-sm text-center" v-model.number="currentProduct.quantity" step="0.01">
          </div>
          <div class="col-md-2">
            <div class="d-flex gap-1">
              <select class="form-select form-select-sm" v-model="orderBy" style="flex: 2;">
                <option value="codigo">Ordenar Por</option>
                <option value="nombre">Nombre</option>
                <option value="precio">Precio</option>
              </select>
              <select class="form-select form-select-sm" v-model="orderDirection" style="flex: 1;">
                <option value="asc">↓</option>
                <option value="desc">↑</option>
              </select>
            </div>
          </div>
          <div class="col-md-1">
            <button class="btn btn-sm btn-success w-100" type="button" @click="addProduct">
              <i class="ti ti-plus"></i> ADICIONAR
            </button>
          </div>
        </div>

        <!-- Tabla de productos agregados -->
        <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
          <table class="table table-sm table-bordered mb-0">
            <thead class="table-light sticky-top">
              <tr>
                <th style="width: 5%;" class="text-center">#</th>
                <th style="width: 15%;">Código</th>
                <th style="width: 30%;">Descripción</th>
                <th style="width: 10%;" class="text-end">Precio</th>
                <th style="width: 10%;" class="text-center">Cantidad</th>
                <th style="width: 8%;" class="text-center">Desc %</th>
                <th style="width: 8%;" class="text-center">ISV %</th>
                <th style="width: 12%;" class="text-end">Total</th>
                <th style="width: 2%;" class="text-center">
                  <i class="ti ti-trash text-danger"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in invoice.items" :key="index">
                <td class="text-center align-middle">{{ index + 1 }}</td>
                <td class="align-middle">{{ item.code }}</td>
                <td class="align-middle">{{ item.name }}</td>
                <td class="text-end align-middle">{{ formatCurrency(item.price) }}</td>
                <td class="align-middle">
                  <input
                    type="number"
                    class="form-control form-control-sm text-center"
                    v-model.number="item.quantity"
                    @input="calculateItemTotal(index)"
                    step="0.01"
                  >
                </td>
                <td class="align-middle">
                  <input
                    type="number"
                    class="form-control form-control-sm text-center"
                    v-model.number="item.discount_percent"
                    @input="calculateItemTotal(index)"
                    min="0"
                    max="100"
                  >
                </td>
                <td class="align-middle">
                  <input
                    type="number"
                    class="form-control form-control-sm text-center"
                    v-model.number="item.tax_percent"
                    @input="calculateItemTotal(index)"
                    min="0"
                    max="100"
                  >
                </td>
                <td class="text-end align-middle fw-bold">L {{ formatCurrency(item.total) }}</td>
                <td class="text-center align-middle">
                  <button class="btn btn-sm btn-link text-danger p-0" @click="removeProduct(index)">
                    <i class="ti ti-x"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="invoice.items.length === 0">
                <td colspan="9" class="text-center text-muted py-3">
                  No hay artículos agregados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Opciones y Campos Adicionales -->
      <div class="row g-2 mb-3">
        <div class="col-md-6">
          <div class="btn-group btn-group-sm mb-2" role="group">
            <button type="button" class="btn btn-warning">
              <i class="ti ti-settings"></i> OPCIONES ADICIONALES
            </button>
            <button type="button" class="btn btn-info">
              <i class="ti ti-plus"></i> CAMPOS ADICIONALES
            </button>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" v-model="invoice.is_delivery" id="esParaLlevar">
            <label class="form-check-label" for="esParaLlevar">
              ES PARA LLEVAR
            </label>
          </div>
        </div>
      </div>

      <!-- Totales -->
      <div class="totals-section mb-3">
        <div class="row">
          <div class="col-md-6 offset-md-6">
            <table class="table table-sm table-borderless mb-0">
              <tbody>
                <tr>
                  <td class="text-end"><strong>CANT. ARTICULOS</strong></td>
                  <td class="text-end" style="width: 150px;">{{ totals.itemCount.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td class="text-end"><strong>MONTO BRUTO</strong></td>
                  <td class="text-end">L {{ formatCurrency(totals.gross) }}</td>
                </tr>
                <tr>
                  <td class="text-end"><strong>SUBTOTAL</strong></td>
                  <td class="text-end">L {{ formatCurrency(totals.subtotal) }}</td>
                </tr>
                <tr>
                  <td class="text-end"><strong>ISV</strong></td>
                  <td class="text-end">L {{ formatCurrency(totals.tax) }}</td>
                </tr>
                <tr class="border-top">
                  <td class="text-end"><h5 class="mb-0 text-danger">TOTAL</h5></td>
                  <td class="text-end"><h5 class="mb-0 text-danger">L {{ formatCurrency(totals.total) }}</h5></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="action-buttons">
        <div class="row g-2">
          <div class="col-md-12">
            <div class="d-flex gap-2 flex-wrap">
              <!-- Fila 1 -->
              <button type="button" class="btn btn-danger" @click="clearInvoice">
                <i class="ti ti-trash me-1"></i> ELIMINAR
              </button>
              <button type="button" class="btn btn-warning" @click="saveInvoice">
                <i class="ti ti-device-floppy me-1"></i> GUARDAR
              </button>
              <button type="button" class="btn btn-success" @click="processQuickPayment">
                <i class="ti ti-currency-dollar me-1"></i> $COBRO RÁPIDO
              </button>
              <button type="button" class="btn btn-success" @click="processDetailedPayment">
                <i class="ti ti-receipt me-1"></i> $COBRO DETALLADO
              </button>

              <!-- Fila 2 -->
              <button type="button" class="btn btn-info">
                <i class="ti ti-printer me-1"></i> COMANDA
              </button>
              <button type="button" class="btn btn-info">
                <i class="ti ti-file-text me-1"></i> FRECUENTA
              </button>

              <!-- Checkboxes -->
              <div class="d-flex align-items-center gap-3 ms-auto">
                <div class="form-check mb-0">
                  <input class="form-check-input" type="checkbox" v-model="showLocations" id="verUbicaciones">
                  <label class="form-check-label small" for="verUbicaciones">
                    VER UBICACIONES
                  </label>
                </div>
                <div class="form-check mb-0">
                  <input class="form-check-input" type="checkbox" v-model="addArticleInOtherLine" id="agregarArticulo">
                  <label class="form-check-label small" for="agregarArticulo">
                    AGREGAR ARTÍCULO EN OTRA LÍNEA
                  </label>
                </div>
                <div class="form-check mb-0">
                  <input class="form-check-input" type="checkbox" v-model="touchscreenMode" id="touchscreen">
                  <label class="form-check-label small" for="touchscreen">
                    TOUCHSCREEN
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import api from '@/api/config';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      loading: false,
      invoice: {
        consecutive: '0000031832',
        customer_code: '000001',
        document_type: 'FACTURA',
        warehouse_id: '1',
        is_delivery: false,
        items: []
      },
      currentProduct: {
        code: '',
        name: '',
        quantity: 0.00,
        price: 0,
        discount_percent: 0,
        tax_percent: 15
      },
      selectedCustomer: {
        code: '000001',
        name: 'CONSUMIDOR FINAL',
        rtn: '',
        phone: '',
        address: ''
      },
      currentUser: {
        name: 'CARLOS ARGEÑAL'
      },
      companyInfo: {
        cai: '2A9170-F8828A-8815E0-63BE03-090956-9D',
        range: 'Del 00030001 al 00040000',
        prefix: '000-002-01-'
      },
      invoiceNumber: '000-002-01-00031832',
      orderBy: 'codigo',
      orderDirection: 'asc',
      showLocations: false,
      addArticleInOtherLine: false,
      touchscreenMode: false,
      showAddCustomer: false,
      showAddProduct: false,
      products: [],
      customers: []
    };
  },
  computed: {
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

      const total = subtotal + tax;

      return {
        itemCount,
        gross,
        subtotal,
        tax,
        total
      };
    }
  },
  mounted() {
    this.loadProducts();
    this.loadCustomers();
  },
  methods: {
    async loadProducts() {
      try {
        const response = await api.get('/products');
        this.products = response.data.data || [];
      } catch (error) {
        console.error('Error loading products:', error);
      }
    },
    async loadCustomers() {
      try {
        const response = await api.get('/customers');
        this.customers = response.data.data || [];
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    },
    searchClient() {
      // Implementar búsqueda de cliente
      Swal.fire('Búsqueda', 'Funcionalidad de búsqueda de cliente', 'info');
    },
    searchProduct() {
      // Implementar búsqueda de producto
      Swal.fire('Búsqueda', 'Funcionalidad de búsqueda de producto', 'info');
    },
    async searchProductByCode() {
      if (!this.currentProduct.code) return;

      try {
        const product = this.products.find(p => p.sku === this.currentProduct.code);
        if (product) {
          this.currentProduct.name = product.name;
          this.currentProduct.price = product.sale_price || 0;
          this.currentProduct.quantity = 1;
        } else {
          Swal.fire('No encontrado', 'Producto no encontrado', 'warning');
        }
      } catch (error) {
        console.error('Error searching product:', error);
      }
    },
    addProduct() {
      if (!this.currentProduct.code || !this.currentProduct.name || this.currentProduct.quantity <= 0) {
        Swal.fire('Error', 'Por favor complete los datos del producto', 'error');
        return;
      }

      const itemGross = this.currentProduct.price * this.currentProduct.quantity;
      const itemDiscount = itemGross * (this.currentProduct.discount_percent / 100);
      const itemSubtotal = itemGross - itemDiscount;
      const itemTax = itemSubtotal * (this.currentProduct.tax_percent / 100);
      const total = itemSubtotal + itemTax;

      this.invoice.items.push({
        code: this.currentProduct.code,
        name: this.currentProduct.name,
        price: this.currentProduct.price,
        quantity: this.currentProduct.quantity,
        discount_percent: this.currentProduct.discount_percent,
        tax_percent: this.currentProduct.tax_percent,
        total: total
      });

      // Limpiar campos
      this.currentProduct = {
        code: '',
        name: '',
        quantity: 0.00,
        price: 0,
        discount_percent: 0,
        tax_percent: 15
      };
    },
    removeProduct(index) {
      this.invoice.items.splice(index, 1);
    },
    calculateItemTotal(index) {
      const item = this.invoice.items[index];
      const itemGross = item.price * item.quantity;
      const itemDiscount = itemGross * (item.discount_percent / 100);
      const itemSubtotal = itemGross - itemDiscount;
      const itemTax = itemSubtotal * (item.tax_percent / 100);
      item.total = itemSubtotal + itemTax;
    },
    clearInvoice() {
      Swal.fire({
        title: '¿Eliminar factura?',
        text: 'Se perderán todos los datos',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.invoice.items = [];
          this.currentProduct = {
            code: '',
            name: '',
            quantity: 0.00,
            price: 0,
            discount_percent: 0,
            tax_percent: 15
          };
        }
      });
    },
    async saveInvoice() {
      if (this.invoice.items.length === 0) {
        Swal.fire('Error', 'Debe agregar al menos un producto', 'error');
        return;
      }

      Swal.fire('Guardado', 'Factura guardada como borrador', 'success');
    },
    processQuickPayment() {
      if (this.invoice.items.length === 0) {
        Swal.fire('Error', 'Debe agregar al menos un producto', 'error');
        return;
      }

      Swal.fire({
        title: 'Cobro Rápido',
        html: `
          <div class="text-start">
            <h4 class="text-center mb-3">Total: L ${this.formatCurrency(this.totals.total)}</h4>
            <div class="mb-3">
              <label class="form-label">Monto Recibido</label>
              <input type="number" id="amountReceived" class="form-control" step="0.01" value="${this.totals.total}">
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Procesar Pago',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const amount = document.getElementById('amountReceived').value;
          return { amount: parseFloat(amount) };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const change = result.value.amount - this.totals.total;
          Swal.fire('Pago Procesado', `Cambio: L ${this.formatCurrency(change)}`, 'success');
        }
      });
    },
    processDetailedPayment() {
      if (this.invoice.items.length === 0) {
        Swal.fire('Error', 'Debe agregar al menos un producto', 'error');
        return;
      }

      Swal.fire('Cobro Detallado', 'Funcionalidad de cobro detallado', 'info');
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
    }
  }
};
</script>

<style scoped>
.invoice-header-section,
.client-section,
.document-section,
.products-section {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.form-control-sm,
.form-select-sm {
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

.table-sm th,
.table-sm td {
  padding: 0.4rem;
  font-size: 0.875rem;
}

.table thead.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

.btn-sm {
  font-size: 0.8rem;
  padding: 0.375rem 0.75rem;
}

.action-buttons .btn {
  font-size: 0.875rem;
}

.totals-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.form-check-label.small {
  font-size: 0.8rem;
}
</style>
