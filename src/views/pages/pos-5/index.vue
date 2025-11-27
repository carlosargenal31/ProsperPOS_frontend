<template>
  <div class="modern-pos-wrapper">
    <!-- Header -->
    <div class="pos-header">
      <div class="header-left">
        <h1 class="pos-title">
          <i class="ti ti-shopping-cart"></i>
          Punto de Venta
        </h1>
        <div class="header-info">
          <span class="warehouse-badge">
            <i class="ti ti-building-store"></i>
            {{ selectedWarehouse || 'Almacén Principal' }}
          </span>
          <span class="user-badge">
            <i class="ti ti-user"></i>
            {{ userName }}
          </span>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-icon" @click="openSettings" title="Configuración">
          <i class="ti ti-settings"></i>
        </button>
        <button class="btn-icon" @click="viewInvoices" title="Ver Facturas">
          <i class="ti ti-file-invoice"></i>
        </button>
        <button class="btn-icon" @click="showShortcuts" title="Atajos">
          <i class="ti ti-keyboard"></i>
        </button>
      </div>
    </div>

    <div class="pos-container">
      <!-- Left Panel - Products -->
      <div class="pos-left">
        <!-- Search Bar -->
        <div class="search-section">
          <div class="search-box">
            <i class="ti ti-search"></i>
            <input
              ref="searchInput"
              type="text"
              v-model="searchQuery"
              @input="searchProducts"
              @keydown.enter="selectFirstProduct"
              placeholder="Buscar producto por nombre, SKU o código de barras..."
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="btn-clear">
              <i class="ti ti-x"></i>
            </button>
          </div>

          <!-- Quick Filters -->
          <div class="quick-filters">
            <button
              v-for="category in quickCategories"
              :key="category.id"
              :class="['filter-btn', { active: selectedCategory === category.id }]"
              @click="filterByCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="products-grid" v-if="filteredProducts.length > 0">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            :class="['product-card', { 'out-of-stock': product.stock <= 0 }]"
            @click="addToCart(product)"
          >
            <div class="product-image">
              <img :src="getProductImage(product)" :alt="product.name" />
              <div v-if="product.stock <= 0" class="stock-badge out">Agotado</div>
              <div v-else-if="product.stock < 10" class="stock-badge low">Bajo Stock</div>
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <p class="product-sku">{{ product.sku }}</p>
              <div class="product-footer">
                <span class="product-price">L {{ formatPrice(product.sale_price) }}</span>
                <span class="product-stock">Stock: {{ product.stock }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <i class="ti ti-package"></i>
          <p>{{ searchQuery ? 'No se encontraron productos' : 'Busca un producto para empezar' }}</p>
        </div>
      </div>

      <!-- Right Panel - Cart -->
      <div class="pos-right">
        <!-- Customer Selection -->
        <div class="customer-section">
          <button class="customer-selector" @click="openCustomerModal">
            <div class="customer-info">
              <i class="ti ti-user-circle"></i>
              <div>
                <span class="customer-label">Cliente</span>
                <span class="customer-name">{{ selectedCustomer?.name || 'CONSUMIDOR FINAL' }}</span>
              </div>
            </div>
            <i class="ti ti-chevron-down"></i>
          </button>
        </div>

        <!-- Cart Items -->
        <div class="cart-items">
          <div v-if="cartItems.length === 0" class="empty-cart">
            <i class="ti ti-shopping-cart-off"></i>
            <p>El carrito está vacío</p>
          </div>

          <div v-else class="cart-list">
            <div
              v-for="(item, index) in cartItems"
              :key="index"
              class="cart-item"
            >
              <div class="item-details">
                <h5>{{ item.product_name }}</h5>
                <span class="item-sku">{{ item.product_sku }}</span>
              </div>

              <div class="item-actions">
                <div class="quantity-control">
                  <button @click="decreaseQuantity(index)" class="btn-qty">
                    <i class="ti ti-minus"></i>
                  </button>
                  <input
                    type="number"
                    v-model.number="item.quantity"
                    @change="updateQuantity(index)"
                    class="qty-input"
                    min="1"
                  />
                  <button @click="increaseQuantity(index)" class="btn-qty">
                    <i class="ti ti-plus"></i>
                  </button>
                </div>

                <div class="item-price">
                  <span class="unit-price">L {{ formatPrice(item.unit_price) }}</span>
                  <span class="line-total">L {{ formatPrice(item.quantity * item.unit_price) }}</span>
                </div>

                <button @click="removeItem(index)" class="btn-remove">
                  <i class="ti ti-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span class="amount">L {{ formatPrice(cartSubtotal) }}</span>
          </div>

          <div class="summary-row">
            <span>Descuento</span>
            <div class="discount-control">
              <input
                type="number"
                v-model.number="discountValue"
                @input="calculateTotals"
                class="discount-input"
                min="0"
                placeholder="0"
              />
              <select v-model="discountType" @change="calculateTotals" class="discount-type">
                <option value="fixed">L</option>
                <option value="percentage">%</option>
              </select>
            </div>
          </div>

          <div class="summary-row">
            <span>ISV ({{ taxRate }}%)</span>
            <span class="amount">L {{ formatPrice(cartTax) }}</span>
          </div>

          <div class="summary-row total">
            <span>Total</span>
            <span class="amount">L {{ formatPrice(cartTotal) }}</span>
          </div>

          <div class="payment-method-selector">
            <label>Método de Pago</label>
            <select v-model="paymentMethod" class="payment-select">
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
              <option value="credit">Crédito</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="cart-actions">
          <button
            @click="processPayment"
            :disabled="cartItems.length === 0"
            class="btn-process"
          >
            <i class="ti ti-check"></i>
            Cobrar (F9)
          </button>

          <div class="secondary-actions">
            <button @click="holdSale" :disabled="cartItems.length === 0" class="btn-hold">
              <i class="ti ti-clock"></i>
              En Espera
            </button>
            <button @click="clearCart" :disabled="cartItems.length === 0" class="btn-clear-cart">
              <i class="ti ti-x"></i>
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      v-if="showPaymentModal"
      :total="cartTotal"
      :payment-method="paymentMethod"
      @close="showPaymentModal = false"
      @confirm="confirmPayment"
    />

    <!-- Customer Modal -->
    <CustomerModal
      v-if="showCustomerModal"
      :selected-customer="selectedCustomer"
      @close="showCustomerModal = false"
      @select="selectCustomer"
    />

    <!-- Invoice Preview Modal -->
    <InvoicePreviewModal
      v-if="showInvoiceModal"
      :invoice="completedInvoice"
      @close="closeInvoiceModal"
      @print="printInvoice"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import PaymentModal from './PaymentModal.vue';
import CustomerModal from './CustomerModal.vue';
import InvoicePreviewModal from './InvoicePreviewModal.vue';

const router = useRouter();

// State
const searchQuery = ref('');
const searchInput = ref(null);
const products = ref([]);
const filteredProducts = ref([]);
const quickCategories = ref([]);
const selectedCategory = ref(null);

const cartItems = ref([]);
const selectedCustomer = ref(null);
const selectedWarehouse = ref('Almacén Principal');
const userName = ref('Usuario');

const discountType = ref('fixed');
const discountValue = ref(0);
const taxRate = ref(15);
const paymentMethod = ref('cash');

const showPaymentModal = ref(false);
const showCustomerModal = ref(false);
const showInvoiceModal = ref(false);
const completedInvoice = ref(null);

// Computed
const cartSubtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
});

const discountAmount = computed(() => {
  if (discountType.value === 'percentage') {
    return (cartSubtotal.value * discountValue.value) / 100;
  }
  return discountValue.value || 0;
});

const cartTax = computed(() => {
  const subtotalAfterDiscount = cartSubtotal.value - discountAmount.value;
  return (subtotalAfterDiscount * taxRate.value) / 100;
});

const cartTotal = computed(() => {
  return cartSubtotal.value - discountAmount.value + cartTax.value;
});

// Methods
const searchProducts = async () => {
  if (searchQuery.value.length < 2) {
    filteredProducts.value = [];
    return;
  }

  try {
    const response = await axios.get('/api/v1/pos/products/search', {
      params: {
        q: searchQuery.value,
        limit: 20
      }
    });

    filteredProducts.value = response.data.data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    Swal.fire('Error', 'Error al buscar productos', 'error');
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  filteredProducts.value = [];
  searchInput.value?.focus();
};

const selectFirstProduct = () => {
  if (filteredProducts.value.length > 0) {
    addToCart(filteredProducts.value[0]);
  }
};

const filterByCategory = async (categoryId) => {
  selectedCategory.value = categoryId;
  // Implement category filtering
};

const addToCart = (product) => {
  if (product.stock <= 0) {
    Swal.fire('Aviso', 'Este producto no tiene stock disponible', 'warning');
    return;
  }

  const existingItem = cartItems.value.find(item => item.product_id === product.id);

  if (existingItem) {
    if (existingItem.quantity < product.stock) {
      existingItem.quantity++;
    } else {
      Swal.fire('Aviso', 'No hay suficiente stock disponible', 'warning');
    }
  } else {
    cartItems.value.push({
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      unit_price: product.sale_price,
      quantity: 1,
      max_stock: product.stock,
      tax_rate: taxRate.value
    });
  }

  calculateTotals();
  clearSearch();
};

const increaseQuantity = (index) => {
  const item = cartItems.value[index];
  if (item.quantity < item.max_stock) {
    item.quantity++;
    calculateTotals();
  } else {
    Swal.fire('Aviso', 'No hay suficiente stock disponible', 'warning');
  }
};

const decreaseQuantity = (index) => {
  const item = cartItems.value[index];
  if (item.quantity > 1) {
    item.quantity--;
    calculateTotals();
  }
};

const updateQuantity = (index) => {
  const item = cartItems.value[index];
  if (item.quantity < 1) {
    item.quantity = 1;
  }
  if (item.quantity > item.max_stock) {
    item.quantity = item.max_stock;
    Swal.fire('Aviso', 'Cantidad ajustada al stock disponible', 'warning');
  }
  calculateTotals();
};

const removeItem = (index) => {
  cartItems.value.splice(index, 1);
  calculateTotals();
};

const clearCart = () => {
  Swal.fire({
    title: '¿Limpiar carrito?',
    text: 'Se perderán todos los artículos del carrito',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, limpiar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      cartItems.value = [];
      discountValue.value = 0;
      calculateTotals();
    }
  });
};

const calculateTotals = () => {
  // Computed properties will handle this
};

const processPayment = () => {
  if (cartItems.value.length === 0) {
    return;
  }

  if (paymentMethod.value === 'cash') {
    showPaymentModal.value = true;
  } else {
    confirmPayment({ amount: cartTotal.value });
  }
};

const confirmPayment = async (paymentData) => {
  try {
    const loading = Swal.fire({
      title: 'Procesando venta...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Create invoice
    const invoiceData = {
      invoice_type: 'factura',
      customer_id: selectedCustomer.value?.id || null,
      customer_name: selectedCustomer.value?.name || 'CONSUMIDOR FINAL',
      customer_rtn: selectedCustomer.value?.rtn || null,
      customer_phone: selectedCustomer.value?.phone || null,
      customer_email: selectedCustomer.value?.email || null,
      issue_date: new Date().toISOString(),
      warehouse_id: 1,
      discount_type: discountType.value,
      discount_value: discountValue.value,
      tax_rate: taxRate.value,
      payment_status: 'paid',
      paid_amount: paymentData.amount,
      is_credit: paymentMethod.value === 'credit' ? 1 : 0,
      payment_terms_days: paymentMethod.value === 'credit' ? 30 : 0,
      status: 'issued'
    };

    const response = await axios.post('/api/v1/billing/invoices', {
      invoice_data: invoiceData,
      items: cartItems.value
    });

    loading.close();

    completedInvoice.value = response.data.data;
    showPaymentModal.value = false;
    showInvoiceModal.value = true;

    // Clear cart
    cartItems.value = [];
    discountValue.value = 0;
    selectedCustomer.value = null;

    Swal.fire('¡Éxito!', 'Venta procesada correctamente', 'success');
  } catch (error) {
    console.error('Error processing payment:', error);
    Swal.fire('Error', error.response?.data?.message || 'Error al procesar la venta', 'error');
  }
};

const holdSale = () => {
  Swal.fire('En desarrollo', 'Función de venta en espera próximamente', 'info');
};

const openCustomerModal = () => {
  showCustomerModal.value = true;
};

const selectCustomer = (customer) => {
  selectedCustomer.value = customer;
  showCustomerModal.value = false;
};

const openSettings = () => {
  router.push('/billing/settings');
};

const viewInvoices = () => {
  router.push('/billing/invoices');
};

const showShortcuts = () => {
  Swal.fire({
    title: 'Atajos de Teclado',
    html: `
      <div style="text-align: left;">
        <p><strong>F9:</strong> Cobrar</p>
        <p><strong>F8:</strong> En espera</p>
        <p><strong>F7:</strong> Limpiar carrito</p>
        <p><strong>F5:</strong> Ver facturas</p>
        <p><strong>F2:</strong> Buscar producto</p>
      </div>
    `,
    icon: 'info'
  });
};

const closeInvoiceModal = () => {
  showInvoiceModal.value = false;
  completedInvoice.value = null;
};

const printInvoice = () => {
  // Implement print functionality
  window.print();
};

const getProductImage = (product) => {
  return product.image || '/assets/img/product-default.png';
};

const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2);
};

// Keyboard shortcuts
const handleKeyPress = (e) => {
  if (e.key === 'F9') {
    e.preventDefault();
    processPayment();
  } else if (e.key === 'F8') {
    e.preventDefault();
    holdSale();
  } else if (e.key === 'F7') {
    e.preventDefault();
    clearCart();
  } else if (e.key === 'F5') {
    e.preventDefault();
    viewInvoices();
  } else if (e.key === 'F2') {
    e.preventDefault();
    searchInput.value?.focus();
  }
};

// Load quick categories
const loadQuickCategories = async () => {
  try {
    const response = await axios.get('/api/v1/categories', {
      params: { limit: 6 }
    });
    quickCategories.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

// Lifecycle
onMounted(() => {
  loadQuickCategories();
  document.addEventListener('keydown', handleKeyPress);
  searchInput.value?.focus();

  // Get user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  userName.value = user.username || 'Usuario';
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress);
});
</script>

<style scoped>
.modern-pos-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* Header */
.pos-header {
  background: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.pos-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-info {
  display: flex;
  gap: 0.75rem;
}

.warehouse-badge,
.user-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #4b5563;
}

.header-right {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.25rem;
  color: #6b7280;
}

.btn-icon:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #1f2937;
}

/* Container */
.pos-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1rem;
  padding: 1rem;
}

/* Left Panel */
.pos-left {
  flex: 2;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-section {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #3b82f6;
  background: white;
}

.search-box i {
  font-size: 1.25rem;
  color: #9ca3af;
  margin-right: 0.75rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  outline: none;
  color: #1f2937;
}

.btn-clear {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #9ca3af;
  font-size: 1.25rem;
}

.quick-filters {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: #4b5563;
}

.filter-btn:hover {
  background: #e5e7eb;
}

.filter-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

/* Products Grid */
.products-grid {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  align-content: start;
}

.product-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-card.out-of-stock {
  opacity: 0.6;
  cursor: not-allowed;
}

.product-image {
  position: relative;
  padding-top: 100%;
  background: #f9fafb;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stock-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.stock-badge.out {
  background: #ef4444;
}

.stock-badge.low {
  background: #f59e0b;
}

.product-info {
  padding: 0.75rem;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-sku {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0 0 0.5rem 0;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1rem;
  font-weight: 700;
  color: #3b82f6;
}

.product-stock {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Right Panel */
.pos-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 450px;
}

.customer-section {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.customer-selector {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.customer-selector:hover {
  background: #f3f4f6;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.customer-info i {
  font-size: 2rem;
  color: #3b82f6;
}

.customer-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
}

.customer-name {
  display: block;
  font-weight: 600;
  color: #1f2937;
}

/* Cart Items */
.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.empty-cart i {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cart-item {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
}

.item-details h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.item-sku {
  font-size: 0.75rem;
  color: #9ca3af;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-qty {
  width: 2rem;
  height: 2rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-qty:hover {
  background: #f3f4f6;
}

.qty-input {
  width: 3rem;
  text-align: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 0.25rem;
  font-weight: 600;
}

.item-price {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.unit-price {
  font-size: 0.75rem;
  color: #6b7280;
}

.line-total {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.btn-remove {
  width: 2rem;
  height: 2rem;
  border: 1px solid #fca5a5;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fca5a5;
  color: white;
}

/* Cart Summary */
.cart-summary {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #4b5563;
}

.summary-row.total {
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 2px solid #e5e7eb;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.amount {
  font-weight: 600;
  color: #1f2937;
}

.discount-control {
  display: flex;
  gap: 0.5rem;
}

.discount-input {
  width: 5rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: right;
}

.discount-type {
  padding: 0.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.payment-method-selector {
  margin-top: 1rem;
}

.payment-method-selector label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.payment-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

/* Action Buttons */
.cart-actions {
  padding: 1rem;
}

.btn-process {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-process:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-process:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-hold,
.btn-clear-cart {
  flex: 1;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-hold:hover:not(:disabled),
.btn-clear-cart:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-hold:disabled,
.btn-clear-cart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
