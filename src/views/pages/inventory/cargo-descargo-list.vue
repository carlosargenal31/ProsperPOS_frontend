<template>
  <div class="container-fluid">
    <!-- Encabezado -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-0">Gestión de Cargo/Descargo</h4>
            <p class="text-muted mb-0">Administración de documentos de cargo y descargo</p>
          </div>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="ti ti-plus me-1"></i>Nuevo Documento
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-2">
            <label class="form-label">Tipo Documento</label>
            <select class="form-select form-select-sm" v-model="filters.document_type" @change="loadDocuments">
              <option value="">Todos</option>
              <option value="CARGO">CARGO</option>
              <option value="DESCARGO">DESCARGO</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Bodega</label>
            <select class="form-select form-select-sm" v-model="filters.warehouse_id" @change="loadDocuments">
              <option value="">Todas</option>
              <option v-for="w in warehouses" :key="w.value" :value="w.value">{{ w.label }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Estado</label>
            <select class="form-select form-select-sm" v-model="filters.status" @change="loadDocuments">
              <option value="">Todos</option>
              <option value="BORRADOR">BORRADOR</option>
              <option value="PROCESADO">PROCESADO</option>
              <option value="CANCELADO">CANCELADO</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Desde</label>
            <input type="date" class="form-control form-control-sm" v-model="filters.date_from" @change="loadDocuments">
          </div>
          <div class="col-md-2">
            <label class="form-label">Hasta</label>
            <input type="date" class="form-control form-control-sm" v-model="filters.date_to" @change="loadDocuments">
          </div>
          <div class="col-md-2">
            <label class="form-label">Buscar</label>
            <input type="text" class="form-control form-control-sm" v-model="searchQuery" placeholder="Buscar...">
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de documentos -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <a-table
            :columns="columns"
            :data-source="filteredDocuments"
            :loading="loading"
            :pagination="pagination"
            @change="handleTableChange"
            row-key="id"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'document_type'">
                <span :class="record.document_type === 'CARGO' ? 'badge bg-success' : 'badge bg-warning'">
                  {{ record.document_type }}
                </span>
              </template>

              <template v-if="column.key === 'movement_type'">
                <span class="badge bg-info">{{ record.movement_type }}</span>
              </template>

              <template v-if="column.key === 'status'">
                <span :class="{
                  'badge bg-secondary': record.status === 'BORRADOR',
                  'badge bg-primary': record.status === 'PROCESADO',
                  'badge bg-danger': record.status === 'CANCELADO'
                }">
                  {{ record.status }}
                </span>
              </template>

              <template v-if="column.key === 'total_amount'">
                <span class="fw-bold">{{ formatMoney(record.total_amount) }}</span>
              </template>

              <template v-if="column.key === 'actions'">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-info" @click="viewDocument(record)" title="Ver">
                    <i class="ti ti-eye"></i>
                  </button>
                  <button
                    v-if="record.status === 'BORRADOR'"
                    class="btn btn-warning"
                    @click="editDocument(record)"
                    title="Editar">
                    <i class="ti ti-edit"></i>
                  </button>
                  <button
                    v-if="record.status === 'BORRADOR'"
                    class="btn btn-success"
                    @click="processDocument(record.id)"
                    title="Procesar">
                    <i class="ti ti-check"></i>
                  </button>
                  <button
                    v-if="record.status === 'BORRADOR' || record.status === 'CANCELADO'"
                    class="btn btn-danger"
                    @click="deleteDocument(record.id)"
                    title="Eliminar">
                    <i class="ti ti-trash"></i>
                  </button>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- Modal: Crear/Editar Documento -->
    <div v-if="showModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title text-white">{{ modalTitle }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <!-- Información del Documento -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0">Información del Documento</h6>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label fw-bold">Tipo de Documento *</label>
                    <select class="form-select" v-model="form.document_type" :disabled="isEdit">
                      <option value="CARGO">CARGO</option>
                      <option value="DESCARGO">DESCARGO</option>
                    </select>
                  </div>

                  <div class="col-md-3">
                    <label class="form-label fw-bold">Tipo de Movimiento *</label>
                    <select class="form-select" v-model="form.movement_type">
                      <option value="ENTRADA">ENTRADA</option>
                      <option value="SALIDA">SALIDA</option>
                      <option value="AJUSTE">AJUSTE</option>
                      <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                    </select>
                  </div>

                  <div class="col-md-3">
                    <label class="form-label fw-bold">Bodega Origen *</label>
                    <select class="form-select" v-model="form.warehouse_id">
                      <option :value="null">Seleccione...</option>
                      <option v-for="w in warehouses" :key="w.value" :value="w.value">{{ w.label }}</option>
                    </select>
                  </div>

                  <div class="col-md-3" v-if="form.movement_type === 'TRANSFERENCIA'">
                    <label class="form-label fw-bold">Bodega Destino</label>
                    <select class="form-select" v-model="form.warehouse_to_id">
                      <option :value="null">Seleccione...</option>
                      <option v-for="w in warehouses" :key="w.value" :value="w.value">{{ w.label }}</option>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label fw-bold">Emisor *</label>
                    <input type="text" class="form-control" v-model="form.issuer" placeholder="Nombre del emisor">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label fw-bold">Fecha de Registro *</label>
                    <input type="date" class="form-control" v-model="form.registration_date">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label fw-bold">Concepto</label>
                    <input type="text" class="form-control" v-model="form.concept" placeholder="Concepto del documento">
                  </div>
                </div>
              </div>
            </div>

            <!-- Productos -->
            <div class="card mb-3">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Productos</h6>
                <button class="btn btn-info btn-sm" @click="openProductModal">
                  <i class="ti ti-search me-1"></i>Buscar Productos
                </button>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th width="100">Código</th>
                        <th>Producto</th>
                        <th width="100" class="text-center">Cantidad</th>
                        <th width="120" class="text-end">Costo Unit.</th>
                        <th width="120" class="text-end">Total</th>
                        <th width="150">Ubicación</th>
                        <th width="80">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="selectedProducts.length === 0">
                        <td colspan="7" class="text-center text-muted">No hay productos agregados</td>
                      </tr>
                      <tr v-for="(product, index) in selectedProducts" :key="index">
                        <td>{{ product.product_code }}</td>
                        <td>{{ product.product_name }}</td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm text-center"
                            v-model.number="product.quantity"
                            @input="calculateProductTotal(index)"
                            min="0.01"
                            step="0.01">
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm text-end"
                            v-model.number="product.unit_cost"
                            @input="calculateProductTotal(index)"
                            min="0"
                            step="0.01">
                        </td>
                        <td class="text-end fw-bold">{{ formatMoney(product.total_cost) }}</td>
                        <td>
                          <input
                            type="text"
                            class="form-control form-control-sm"
                            v-model="product.warehouse_location"
                            placeholder="Ubicación">
                        </td>
                        <td class="text-center">
                          <button class="btn btn-danger btn-sm" @click="removeProduct(index)">
                            <i class="ti ti-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light fw-bold">
                      <tr>
                        <td colspan="4" class="text-end">SUBTOTAL:</td>
                        <td class="text-end">{{ formatMoney(subtotal) }}</td>
                        <td colspan="2"></td>
                      </tr>
                      <tr>
                        <td colspan="4" class="text-end">IMPUESTO (15%):</td>
                        <td class="text-end">{{ formatMoney(tax) }}</td>
                        <td colspan="2"></td>
                      </tr>
                      <tr>
                        <td colspan="4" class="text-end">TOTAL:</td>
                        <td class="text-end text-primary fs-5">{{ formatMoney(total) }}</td>
                        <td colspan="2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="saveDocument">
              <i class="ti ti-device-floppy me-1"></i>Guardar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Búsqueda de Productos (Estilo POS) -->
    <div v-if="showProductModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white">Búsqueda de datos - Productos</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeProductModal"></button>
          </div>
          <div class="modal-body">
            <!-- Filtros -->
            <div class="row mb-3">
              <div class="col-md-2">
                <label class="form-label fw-bold">Buscar por:</label>
                <select class="form-select form-select-sm" v-model="productSearchBy">
                  <option value="name">Nombre</option>
                  <option value="code">Código</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label fw-bold">Ordenar por:</label>
                <select class="form-select form-select-sm" v-model="productSortBy">
                  <option value="name">Nombre (A-Z)</option>
                  <option value="code">Código</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">&nbsp;</label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text"><i class="ti ti-search"></i></span>
                  <input
                    type="text"
                    class="form-control"
                    v-model="productSearchTerm"
                    placeholder="Buscar producto..."
                    @input="searchProducts">
                </div>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold">Existencias</label>
                <select class="form-select form-select-sm" v-model="stockFilter" @change="searchProducts">
                  <option value="">Todos</option>
                  <option value="in_stock">Con Stock</option>
                  <option value="out_of_stock">Sin Stock</option>
                </select>
              </div>
            </div>

            <!-- Tabla de productos -->
            <div class="table-responsive" style="max-height: 450px;">
              <table class="table table-hover table-sm table-bordered">
                <thead class="table-light sticky-top">
                  <tr>
                    <th style="width: 5%;">
                      <input type="checkbox" @change="toggleSelectAll" v-model="selectAll" />
                    </th>
                    <th style="width: 10%;">Código</th>
                    <th style="width: 35%;">Producto</th>
                    <th style="width: 15%;">Categoría</th>
                    <th style="width: 10%;" class="text-center">Stock</th>
                    <th style="width: 12%;" class="text-end">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="paginatedProducts.length === 0">
                    <td colspan="6" class="text-center text-muted py-4">
                      No se encontraron productos
                    </td>
                  </tr>
                  <tr
                    v-for="product in paginatedProducts"
                    :key="product.id"
                    @click="toggleProductSelection(product)"
                    style="cursor: pointer;"
                    :class="{ 'table-active': isProductSelected(product.id) }">
                    <td @click.stop>
                      <input
                        type="checkbox"
                        :checked="isProductSelected(product.id)"
                        @change="toggleProductSelection(product)" />
                    </td>
                    <td>{{ product.sku || product.code }}</td>
                    <td>{{ product.name }}</td>
                    <td>
                      <small class="text-primary">{{ product.category_name || 'GENERAL' }}</small>
                    </td>
                    <td class="text-center">
                      <span :class="product.stock > 0 ? 'text-success fw-bold' : 'text-danger'">
                        {{ formatNumber(product.stock || 0) }}
                      </span>
                    </td>
                    <td class="text-end fw-bold">{{ formatMoney(product.sale_price || product.price || 0) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="productCurrentPage--"
                :disabled="productCurrentPage <= 1">
                <i class="ti ti-chevron-left"></i>
              </button>
              <span class="small">Página {{ productCurrentPage }} de {{ totalProductPages }}</span>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="productCurrentPage++"
                :disabled="productCurrentPage >= totalProductPages">
                <i class="ti ti-chevron-right"></i>
              </button>
            </div>
            <div>
              <button
                class="btn btn-success me-2"
                @click="addSelectedProducts"
                :disabled="selectedProductsIds.length === 0">
                <i class="ti ti-check me-1"></i>
                Agregar {{ selectedProductsIds.length }} producto(s)
              </button>
              <button type="button" class="btn btn-secondary" @click="closeProductModal">CERRAR</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div
      v-if="showModal || showProductModal"
      class="modal-backdrop fade show"
      @click="closeModal">
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default {
  data() {
    return {
      documents: [],
      warehouses: [],
      allProducts: [],
      loading: false,
      searchQuery: '',
      showModal: false,
      showProductModal: false,
      modalTitle: 'Nuevo Documento',
      isEdit: false,
      editingId: null,

      // Formulario del documento
      form: {
        document_type: 'CARGO',
        movement_type: 'ENTRADA',
        warehouse_id: null,
        warehouse_to_id: null,
        issuer: '',
        concept: '',
        registration_date: ''
      },

      // Modal de productos
      productSearchBy: 'name',
      productSortBy: 'name',
      productSearchTerm: '',
      stockFilter: '',
      filteredProductsForSelection: [],
      selectedProductsIds: [],
      selectAll: false,
      productCurrentPage: 1,
      productPerPage: 10,

      // Productos seleccionados en el documento
      selectedProducts: [],

      filters: {
        document_type: '',
        warehouse_id: '',
        status: '',
        date_from: '',
        date_to: ''
      },
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      columns: [
        { title: 'Emisión', dataIndex: 'registration_date', key: 'registration_date', width: 100 },
        { title: 'Documento', dataIndex: 'document_number', key: 'document_number', width: 130 },
        { title: 'Tipo', dataIndex: 'document_type', key: 'document_type', width: 90 },
        { title: 'Emisor', dataIndex: 'issuer', key: 'issuer', width: 150 },
        { title: 'Concepto', dataIndex: 'concept', key: 'concept' },
        { title: 'Bodega', dataIndex: 'warehouse_name', key: 'warehouse_name', width: 130 },
        { title: 'Proceso', dataIndex: 'movement_type', key: 'movement_type', width: 110 },
        { title: 'Estado', dataIndex: 'status', key: 'status', width: 100 },
        { title: 'Total', dataIndex: 'total_amount', key: 'total_amount', width: 100, align: 'right' },
        { title: 'Acciones', key: 'actions', width: 120, fixed: 'right' }
      ]
    };
  },
  computed: {
    filteredDocuments() {
      if (!this.searchQuery) return this.documents;

      const query = this.searchQuery.toLowerCase();
      return this.documents.filter(doc =>
        doc.document_number?.toLowerCase().includes(query) ||
        doc.issuer?.toLowerCase().includes(query) ||
        doc.concept?.toLowerCase().includes(query) ||
        doc.warehouse_name?.toLowerCase().includes(query)
      );
    },
    subtotal() {
      return this.selectedProducts.reduce((sum, p) => sum + (p.quantity * p.unit_cost), 0);
    },
    tax() {
      return this.subtotal * 0.15;
    },
    total() {
      return this.subtotal + this.tax;
    },
    paginatedProducts() {
      const start = (this.productCurrentPage - 1) * this.productPerPage;
      return this.filteredProductsForSelection.slice(start, start + this.productPerPage);
    },
    totalProductPages() {
      return Math.ceil(this.filteredProductsForSelection.length / this.productPerPage);
    }
  },
  async mounted() {
    await this.loadWarehouses();
    await this.loadProducts();
    await this.loadDocuments();
  },
  methods: {
    // ========== UTILIDADES ==========
    getHondurasDate() {
      const now = new Date();
      // Honduras está en GMT-6
      const hondurasOffset = -6 * 60; // en minutos
      const localOffset = now.getTimezoneOffset();
      const diff = localOffset - hondurasOffset;

      const hondurasTime = new Date(now.getTime() - (diff * 60 * 1000));
      return hondurasTime.toISOString().split('T')[0];
    },

    getCurrentUserName() {
      try {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Usuario';
        }
      } catch (e) {
        console.error('Error getting user:', e);
      }
      return 'Usuario';
    },

    formatMoney(value) {
      return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL'
      }).format(value || 0);
    },

    formatNumber(value) {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
    },

    // ========== CARGAR DATOS ==========
    async loadWarehouses() {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${API_URL}/warehouses`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 10000 }
        });

        console.log('Warehouses response:', response.data);

        const warehousesData = response.data?.data || response.data || [];

        if (Array.isArray(warehousesData)) {
          this.warehouses = warehousesData.map(w => ({
            label: w.nombre || w.name || w.warehouse_name || 'Sin nombre',
            value: w.id
          }));
          console.log('Warehouses loaded:', this.warehouses.length);
        } else {
          console.warn('Warehouses data is not an array:', warehousesData);
          this.warehouses = [];
        }
      } catch (error) {
        console.error('Error loading warehouses:', error);
        this.warehouses = [];
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las bodegas'
        });
      }
    },

    async loadProducts() {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 10000 }
        });

        if (response.data.success) {
          this.allProducts = response.data.data || [];
          this.filteredProductsForSelection = this.allProducts;
        }
      } catch (error) {
        console.error('Error loading products:', error);
        this.allProducts = [];
      }
    },

    async loadDocuments() {
      try {
        this.loading = true;
        const token = sessionStorage.getItem('token');

        const params = {
          limit: this.pagination.pageSize,
          offset: (this.pagination.current - 1) * this.pagination.pageSize,
          ...this.filters
        };

        const response = await axios.get(`${API_URL}/cargo-descargo`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        });

        if (response.data.success) {
          this.documents = response.data.data || [];
          this.pagination.total = response.data.total || this.documents.length;
        }
      } catch (error) {
        console.error('Error loading documents:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los documentos'
        });
      } finally {
        this.loading = false;
      }
    },

    handleTableChange(pagination) {
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;
      this.loadDocuments();
    },

    // ========== MODAL DOCUMENTO ==========
    openCreateModal() {
      this.isEdit = false;
      this.editingId = null;
      this.modalTitle = 'Nuevo Documento';
      this.form = {
        document_type: 'CARGO',
        movement_type: 'ENTRADA',
        warehouse_id: this.warehouses.length > 0 ? this.warehouses[0].value : null,
        warehouse_to_id: null,
        issuer: this.getCurrentUserName(),
        concept: '',
        registration_date: this.getHondurasDate()
      };
      this.selectedProducts = [];
      this.showModal = true;
    },

    async editDocument(record) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${API_URL}/cargo-descargo/${record.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const doc = response.data.data;
          this.isEdit = true;
          this.editingId = doc.id;
          this.modalTitle = `Editar Documento ${doc.document_number}`;

          this.form = {
            document_type: doc.document_type,
            movement_type: doc.movement_type,
            warehouse_id: doc.warehouse_id,
            warehouse_to_id: doc.warehouse_to_id,
            issuer: doc.issuer,
            concept: doc.concept,
            registration_date: doc.registration_date
          };

          this.selectedProducts = doc.details.map(d => ({
            product_id: d.product_id,
            product_code: d.product_code,
            product_name: d.product_name,
            quantity: d.quantity,
            unit_cost: d.unit_cost,
            total_cost: d.total_cost,
            warehouse_location: d.warehouse_location || '',
            sub_warehouse: d.sub_warehouse || '',
            current_stock: d.current_stock || 0,
            notes: d.notes || ''
          }));

          this.showModal = true;
        }
      } catch (error) {
        console.error('Error loading document:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el documento'
        });
      }
    },

    async viewDocument(record) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${API_URL}/cargo-descargo/${record.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const doc = response.data.data;

          let detailsHtml = '<div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr><th>Código</th><th>Producto</th><th>Cantidad</th><th>Costo Unit.</th><th>Total</th></tr></thead><tbody>';

          doc.details.forEach(d => {
            detailsHtml += `<tr>
              <td>${d.product_code}</td>
              <td>${d.product_name}</td>
              <td class="text-center">${d.quantity}</td>
              <td class="text-end">${this.formatMoney(d.unit_cost)}</td>
              <td class="text-end">${this.formatMoney(d.total_cost)}</td>
            </tr>`;
          });

          detailsHtml += `</tbody><tfoot class="table-light fw-bold"><tr><td colspan="4" class="text-end">TOTAL:</td><td class="text-end">${this.formatMoney(doc.total_amount)}</td></tr></tfoot></table></div>`;

          Swal.fire({
            title: `Documento ${doc.document_number}`,
            html: `
              <div class="text-start">
                <p><strong>Tipo:</strong> ${doc.document_type} - ${doc.movement_type}</p>
                <p><strong>Emisor:</strong> ${doc.issuer}</p>
                <p><strong>Fecha:</strong> ${doc.registration_date}</p>
                <p><strong>Bodega:</strong> ${doc.warehouse_name}</p>
                <p><strong>Estado:</strong> <span class="badge ${doc.status === 'PROCESADO' ? 'bg-primary' : doc.status === 'BORRADOR' ? 'bg-secondary' : 'bg-danger'}">${doc.status}</span></p>
                <p><strong>Concepto:</strong> ${doc.concept || '-'}</p>
                <hr>
                <h6>Productos:</h6>
                ${detailsHtml}
              </div>
            `,
            width: 800,
            confirmButtonText: 'Cerrar'
          });
        }
      } catch (error) {
        console.error('Error loading document:', error);
      }
    },

    closeModal() {
      this.showModal = false;
      this.showProductModal = false;
      this.isEdit = false;
      this.editingId = null;
    },

    async saveDocument() {
      // Validaciones
      if (!this.form.warehouse_id) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe seleccionar una bodega' });
        return;
      }

      if (!this.form.issuer) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe ingresar el emisor' });
        return;
      }

      if (this.selectedProducts.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe agregar al menos un producto' });
        return;
      }

      try {
        const token = sessionStorage.getItem('token');

        const data = {
          document_data: {
            ...this.form,
            subtotal: this.subtotal,
            tax_amount: this.tax,
            total_amount: this.total,
            status: 'BORRADOR'
          },
          details: this.selectedProducts
        };

        let response;
        if (this.isEdit) {
          response = await axios.put(`${API_URL}/cargo-descargo/${this.editingId}`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          response = await axios.post(`${API_URL}/cargo-descargo`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `Documento ${this.isEdit ? 'actualizado' : 'creado'} correctamente`,
            timer: 1500,
            showConfirmButton: false
          });
          this.closeModal();
          this.loadDocuments();
        }
      } catch (error) {
        console.error('Error saving document:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo guardar el documento'
        });
      }
    },

    async processDocument(id) {
      const result = await Swal.fire({
        title: '¿Procesar documento?',
        text: 'Al procesar, el inventario será actualizado automáticamente. Esta acción no se puede deshacer.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, procesar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          const token = sessionStorage.getItem('token');
          const response = await axios.put(`${API_URL}/cargo-descargo/${id}/process`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Procesado',
              text: 'Documento procesado correctamente',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadDocuments();
          }
        } catch (error) {
          console.error('Error processing document:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'No se pudo procesar el documento'
          });
        }
      }
    },

    async deleteDocument(id) {
      const result = await Swal.fire({
        title: '¿Eliminar documento?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33'
      });

      if (result.isConfirmed) {
        try {
          const token = sessionStorage.getItem('token');
          const response = await axios.delete(`${API_URL}/cargo-descargo/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Documento eliminado correctamente',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadDocuments();
          }
        } catch (error) {
          console.error('Error deleting document:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'No se pudo eliminar el documento'
          });
        }
      }
    },

    // ========== MODAL PRODUCTOS ==========
    openProductModal() {
      this.showProductModal = true;
      this.productSearchTerm = '';
      this.selectedProductsIds = [];
      this.selectAll = false;
      this.productCurrentPage = 1;
      this.filteredProductsForSelection = this.allProducts;
    },

    closeProductModal() {
      this.showProductModal = false;
      this.selectedProductsIds = [];
      this.selectAll = false;
    },

    searchProducts() {
      let filtered = [...this.allProducts];

      // Búsqueda
      if (this.productSearchTerm) {
        const s = this.productSearchTerm.toLowerCase();
        filtered = filtered.filter(p => {
          if (this.productSearchBy === 'name') {
            return (p.name || '').toLowerCase().includes(s);
          } else {
            return (p.sku || p.code || '').toLowerCase().includes(s);
          }
        });
      }

      // Filtro de stock
      if (this.stockFilter === 'in_stock') {
        filtered = filtered.filter(p => (p.stock || 0) > 0);
      } else if (this.stockFilter === 'out_of_stock') {
        filtered = filtered.filter(p => (p.stock || 0) <= 0);
      }

      // Ordenamiento
      if (this.productSortBy === 'name') {
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } else if (this.productSortBy === 'code') {
        filtered.sort((a, b) => (a.sku || a.code || '').localeCompare(b.sku || b.code || ''));
      }

      this.filteredProductsForSelection = filtered;
      this.productCurrentPage = 1;
    },

    toggleProductSelection(product) {
      const index = this.selectedProductsIds.indexOf(product.id);
      if (index > -1) {
        this.selectedProductsIds.splice(index, 1);
      } else {
        this.selectedProductsIds.push(product.id);
      }
    },

    isProductSelected(productId) {
      return this.selectedProductsIds.includes(productId);
    },

    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedProductsIds = this.paginatedProducts.map(p => p.id);
      } else {
        this.selectedProductsIds = [];
      }
    },

    addSelectedProducts() {
      this.selectedProductsIds.forEach(id => {
        const product = this.allProducts.find(p => p.id === id);
        if (product && !this.selectedProducts.find(p => p.product_id === id)) {
          this.selectedProducts.push({
            product_id: product.id,
            product_code: product.sku || product.code,
            product_name: product.name,
            quantity: 1,
            unit_cost: product.cost || 0,
            total_cost: product.cost || 0,
            current_stock: product.stock || 0,
            warehouse_location: '',
            sub_warehouse: '',
            notes: ''
          });
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Productos agregados',
        text: `Se agregaron ${this.selectedProductsIds.length} producto(s)`,
        timer: 1500,
        showConfirmButton: false
      });

      this.closeProductModal();
    },

    // ========== PRODUCTOS EN DOCUMENTO ==========
    calculateProductTotal(index) {
      const product = this.selectedProducts[index];
      product.total_cost = product.quantity * product.unit_cost;
    },

    removeProduct(index) {
      this.selectedProducts.splice(index, 1);
    }
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.table th {
  background-color: #f8f9fa;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
