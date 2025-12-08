<script>
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default {
  data() {
    return {
      loading: false,
      isEdit: false,
      documentId: null,
      documentType: 'CARGO',

      // Document form data
      documentData: {
        document_type: 'CARGO',
        movement_type: 'ENTRADA',
        warehouse_id: null,
        warehouse_to_id: null,
        issuer: '',
        concept: '',
        registration_date: new Date().toISOString().split('T')[0],
        tax_amount: 0,
        notes: '',
        status: 'BORRADOR'
      },

      // Product details
      productDetails: [],

      // Catalogs
      warehouses: [],

      // Modal states
      showProductSearchModal: false,
      searchQuery: '',
      products: [],
      selectedProduct: null,
      productQuantity: 1,
      productLocation: '',
      productSubWarehouse: '',

      // Movement types
      movementTypes: {
        CARGO: ['ENTRADA', 'AJUSTE', 'TRANSFERENCIA'],
        DESCARGO: ['SALIDA', 'AJUSTE', 'TRANSFERENCIA']
      }
    };
  },
  computed: {
    availableMovementTypes() {
      return this.movementTypes[this.documentData.document_type] || [];
    },
    subtotal() {
      return this.productDetails.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_cost);
      }, 0);
    },
    totalAmount() {
      return this.subtotal + parseFloat(this.documentData.tax_amount || 0);
    },
    filteredProducts() {
      if (!this.searchQuery) return this.products;

      const query = this.searchQuery.toLowerCase();
      return this.products.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query) ||
        p.barcode?.toLowerCase().includes(query)
      );
    }
  },
  mounted() {
    this.initializeForm();
  },
  methods: {
    async initializeForm() {
      const routeType = this.$route.query.type;
      if (routeType) {
        this.documentData.document_type = routeType;
        this.documentData.movement_type = this.movementTypes[routeType][0];
      }

      this.documentId = this.$route.params.id;
      this.isEdit = !!this.documentId;

      await this.loadWarehouses();

      if (this.isEdit) {
        await this.loadDocument();
      }
    },
    async loadWarehouses() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/warehouses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.warehouses = response.data.data || [];
      } catch (error) {
        console.error('Error loading warehouses:', error);
        useToast().error('Error al cargar almacenes');
      }
    },
    async loadDocument() {
      try {
        this.loading = true;
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/cargo-descargo/${this.documentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const doc = response.data.data;
        this.documentData = {
          document_type: doc.document_type,
          movement_type: doc.movement_type,
          warehouse_id: doc.warehouse_id,
          warehouse_to_id: doc.warehouse_to_id,
          issuer: doc.issuer,
          concept: doc.concept,
          registration_date: doc.registration_date,
          tax_amount: doc.tax_amount,
          notes: doc.notes,
          status: doc.status
        };

        this.productDetails = doc.details || [];
      } catch (error) {
        console.error('Error loading document:', error);
        useToast().error('Error al cargar documento');
      } finally {
        this.loading = false;
      }
    },
    async openProductSearchModal() {
      this.showProductSearchModal = true;
      this.searchQuery = '';
      this.selectedProduct = null;
      this.productQuantity = 1;
      this.productLocation = '';
      this.productSubWarehouse = '';
      await this.loadProducts();
    },
    async loadProducts() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 100 }
        });
        this.products = response.data.data || [];
      } catch (error) {
        console.error('Error loading products:', error);
        useToast().error('Error al cargar productos');
      }
    },
    selectProduct(product) {
      this.selectedProduct = product;
    },
    async getProductStock(productId) {
      if (!this.documentData.warehouse_id) return 0;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/products/${productId}/stock`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { warehouse_id: this.documentData.warehouse_id }
          }
        );
        return response.data.data?.quantity || 0;
      } catch (error) {
        return 0;
      }
    },
    async addProductToDocument() {
      if (!this.selectedProduct) {
        useToast().warning('Seleccione un producto');
        return;
      }

      if (this.productQuantity <= 0) {
        useToast().warning('La cantidad debe ser mayor a 0');
        return;
      }

      // Check if product already exists
      const existingIndex = this.productDetails.findIndex(
        p => p.product_id === this.selectedProduct.id
      );

      const currentStock = await this.getProductStock(this.selectedProduct.id);

      const productDetail = {
        product_id: this.selectedProduct.id,
        product_code: this.selectedProduct.code,
        product_name: this.selectedProduct.name,
        quantity: parseFloat(this.productQuantity),
        unit_cost: parseFloat(this.selectedProduct.price || 0),
        total_cost: parseFloat(this.productQuantity) * parseFloat(this.selectedProduct.price || 0),
        warehouse_location: this.productLocation,
        sub_warehouse: this.productSubWarehouse,
        current_stock: currentStock,
        notes: ''
      };

      if (existingIndex >= 0) {
        // Update existing
        this.productDetails[existingIndex].quantity += productDetail.quantity;
        this.productDetails[existingIndex].total_cost =
          this.productDetails[existingIndex].quantity * this.productDetails[existingIndex].unit_cost;
      } else {
        // Add new
        this.productDetails.push(productDetail);
      }

      this.showProductSearchModal = false;
      useToast().success('Producto agregado');
    },
    removeProduct(index) {
      this.productDetails.splice(index, 1);
      useToast().info('Producto eliminado');
    },
    updateProductQuantity(index, newQuantity) {
      const detail = this.productDetails[index];
      detail.quantity = parseFloat(newQuantity) || 0;
      detail.total_cost = detail.quantity * detail.unit_cost;
    },
    updateProductCost(index, newCost) {
      const detail = this.productDetails[index];
      detail.unit_cost = parseFloat(newCost) || 0;
      detail.total_cost = detail.quantity * detail.unit_cost;
    },
    async saveDocument() {
      // Validations
      if (!this.documentData.warehouse_id) {
        useToast().warning('Seleccione un almacén');
        return;
      }

      if (!this.documentData.issuer) {
        useToast().warning('Ingrese el emisor del documento');
        return;
      }

      if (this.productDetails.length === 0) {
        useToast().warning('Agregue al menos un producto');
        return;
      }

      try {
        this.loading = true;
        const token = localStorage.getItem('token');

        const payload = {
          document_data: {
            ...this.documentData,
            subtotal: this.subtotal,
            total_amount: this.totalAmount
          },
          details: this.productDetails
        };

        if (this.isEdit) {
          await axios.put(`${API_URL}/cargo-descargo/${this.documentId}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
          useToast().success('Documento actualizado exitosamente');
        } else {
          await axios.post(`${API_URL}/cargo-descargo`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
          useToast().success('Documento creado exitosamente');
        }

        this.$router.push({ name: 'cargo-descargo-list' });
      } catch (error) {
        console.error('Error saving document:', error);
        useToast().error('Error al guardar documento');
      } finally {
        this.loading = false;
      }
    },
    cancel() {
      this.$router.push({ name: 'cargo-descargo-list' });
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(amount || 0);
    }
  }
};
</script>

<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>

  <div class="page-wrapper">
    <div class="content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>{{ isEdit ? 'Editar' : 'Nuevo' }} {{ documentData.document_type }}</h4>
            <h6>Complete los datos del documento</h6>
          </div>
        </div>
        <div class="page-btn d-flex gap-2">
          <a @click="cancel" class="btn btn-secondary">
            <vue-feather type="x" class="me-2"></vue-feather>
            Cancelar
          </a>
          <a @click="saveDocument" class="btn btn-primary" :disabled="loading">
            <vue-feather type="save" class="me-2"></vue-feather>
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </a>
        </div>
      </div>

      <!-- Document Information Card -->
      <div class="card mb-3">
        <div class="card-header">
          <h5 class="card-title mb-0">Información del Documento</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <!-- Document Type -->
            <div class="col-md-3">
              <label class="form-label">Tipo de Documento <span class="text-danger">*</span></label>
              <select v-model="documentData.document_type" class="form-select" :disabled="isEdit">
                <option value="CARGO">CARGO / ENTRADA</option>
                <option value="DESCARGO">DESCARGO / SALIDA</option>
              </select>
            </div>

            <!-- Movement Type -->
            <div class="col-md-3">
              <label class="form-label">Tipo Cargo / Descargo <span class="text-danger">*</span></label>
              <select v-model="documentData.movement_type" class="form-select">
                <option v-for="type in availableMovementTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <!-- Date -->
            <div class="col-md-3">
              <label class="form-label">Fecha de Registro <span class="text-danger">*</span></label>
              <input v-model="documentData.registration_date" type="date" class="form-control" />
            </div>

            <!-- Issuer -->
            <div class="col-md-3">
              <label class="form-label">Emitido Por <span class="text-danger">*</span></label>
              <input v-model="documentData.issuer" type="text" class="form-control" placeholder="Nombre del emisor" />
            </div>

            <!-- Warehouse -->
            <div class="col-md-4">
              <label class="form-label">Almacén <span class="text-danger">*</span></label>
              <select v-model="documentData.warehouse_id" class="form-select">
                <option :value="null">Seleccione un almacén</option>
                <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name }}
                </option>
              </select>
            </div>

            <!-- Warehouse To (Optional for transfers) -->
            <div v-if="documentData.movement_type === 'TRANSFERENCIA'" class="col-md-4">
              <label class="form-label">Almacén Destino</label>
              <select v-model="documentData.warehouse_to_id" class="form-select">
                <option :value="null">Seleccione almacén destino</option>
                <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name }}
                </option>
              </select>
            </div>

            <!-- Concept -->
            <div :class="documentData.movement_type === 'TRANSFERENCIA' ? 'col-md-4' : 'col-md-8'">
              <label class="form-label">Concepto</label>
              <input v-model="documentData.concept" type="text" class="form-control" placeholder="Concepto del movimiento" />
            </div>

            <!-- Tax Amount -->
            <div class="col-md-3">
              <label class="form-label">Impuesto</label>
              <input v-model="documentData.tax_amount" type="number" step="0.01" class="form-control" />
            </div>

            <!-- Notes -->
            <div class="col-md-9">
              <label class="form-label">Notas</label>
              <input v-model="documentData.notes" type="text" class="form-control" placeholder="Notas adicionales" />
            </div>
          </div>
        </div>
      </div>

      <!-- Products Card -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Artículos</h5>
          <button @click="openProductSearchModal" class="btn btn-sm btn-primary">
            <vue-feather type="plus" size="16" class="me-1"></vue-feather>
            Buscar Artículo
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-bordered table-sm">
              <thead class="table-light">
                <tr>
                  <th style="width: 100px;">Código</th>
                  <th>Artículo</th>
                  <th style="width: 100px;">Cantidad</th>
                  <th style="width: 120px;">Costo Unit.</th>
                  <th style="width: 120px;">Costo Total</th>
                  <th style="width: 120px;">Almacen</th>
                  <th style="width: 120px;">Subalmacen</th>
                  <th style="width: 100px;">Existencias</th>
                  <th style="width: 80px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="productDetails.length === 0">
                  <td colspan="9" class="text-center text-muted">
                    No hay productos agregados. Haga clic en "Buscar Artículo" para agregar.
                  </td>
                </tr>
                <tr v-for="(detail, index) in productDetails" :key="index">
                  <td>{{ detail.product_code }}</td>
                  <td>{{ detail.product_name }}</td>
                  <td>
                    <input
                      :value="detail.quantity"
                      @input="updateProductQuantity(index, $event.target.value)"
                      type="number"
                      step="0.01"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      :value="detail.unit_cost"
                      @input="updateProductCost(index, $event.target.value)"
                      type="number"
                      step="0.01"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td class="text-end fw-semibold">{{ formatCurrency(detail.total_cost) }}</td>
                  <td>
                    <input
                      v-model="detail.warehouse_location"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Ubicación"
                    />
                  </td>
                  <td>
                    <input
                      v-model="detail.sub_warehouse"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Subalmacén"
                    />
                  </td>
                  <td class="text-end">{{ detail.current_stock }}</td>
                  <td class="text-center">
                    <button @click="removeProduct(index)" class="btn btn-sm btn-danger">
                      <i class="ti ti-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot class="table-light">
                <tr>
                  <td colspan="4" class="text-end fw-bold">Subtotal:</td>
                  <td class="text-end fw-bold">{{ formatCurrency(subtotal) }}</td>
                  <td colspan="4"></td>
                </tr>
                <tr>
                  <td colspan="4" class="text-end fw-bold">Impuesto:</td>
                  <td class="text-end fw-bold">{{ formatCurrency(documentData.tax_amount) }}</td>
                  <td colspan="4"></td>
                </tr>
                <tr>
                  <td colspan="4" class="text-end fw-bold">Total Final:</td>
                  <td class="text-end fw-bold text-primary fs-5">{{ formatCurrency(totalAmount) }}</td>
                  <td colspan="4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Product Search Modal -->
  <a-modal
    v-model:open="showProductSearchModal"
    title="Buscar y Agregar Artículo"
    width="900px"
    :footer="null"
    :maskClosable="false"
  >
    <div class="mb-3">
      <input
        v-model="searchQuery"
        type="text"
        class="form-control"
        placeholder="Buscar por código, nombre o código de barras..."
        autofocus
      />
    </div>

    <div style="max-height: 400px; overflow-y: auto;" class="mb-3">
      <table class="table table-hover table-sm">
        <thead class="table-light sticky-top">
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="4" class="text-center text-muted">No se encontraron productos</td>
          </tr>
          <tr
            v-for="product in filteredProducts"
            :key="product.id"
            :class="{ 'table-active': selectedProduct?.id === product.id }"
            style="cursor: pointer;"
            @click="selectProduct(product)"
          >
            <td>{{ product.code }}</td>
            <td>{{ product.name }}</td>
            <td>{{ formatCurrency(product.price) }}</td>
            <td>
              <button
                @click="selectProduct(product)"
                class="btn btn-sm btn-outline-primary"
              >
                Seleccionar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedProduct" class="border-top pt-3">
      <h6>Producto Seleccionado: <strong>{{ selectedProduct.name }}</strong></h6>

      <div class="row g-3 mt-2">
        <div class="col-md-3">
          <label class="form-label">Cantidad <span class="text-danger">*</span></label>
          <input v-model="productQuantity" type="number" step="0.01" class="form-control" min="0.01" />
        </div>
        <div class="col-md-4">
          <label class="form-label">Ubicación (Almacén)</label>
          <input v-model="productLocation" type="text" class="form-control" placeholder="Ej: BODEGA 101 TIENDA" />
        </div>
        <div class="col-md-5">
          <label class="form-label">Subalmacén (Opcional)</label>
          <input v-model="productSubWarehouse" type="text" class="form-control" placeholder="Seleccione un Subalmacen" />
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-3">
        <button @click="showProductSearchModal = false" class="btn btn-secondary">
          Cancelar
        </button>
        <button @click="addProductToDocument" class="btn btn-success">
          <vue-feather type="plus" size="16" class="me-1"></vue-feather>
          Adicionar
        </button>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8f9fa;
}
</style>
