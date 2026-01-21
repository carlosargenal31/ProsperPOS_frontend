<template>
  <div v-if="show" class="modal fade show" style="display: block;" tabindex="-1">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header bg-dark text-white">
          <h5 class="modal-title text-white">Búsqueda de datos - Productos</h5>
          <button type="button" class="btn btn-danger btn-sm rounded-circle" @click="close" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
            <i class="ti ti-x" style="font-size: 1.2rem; color: white;"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- Filtros -->
          <div class="row mb-3">
            <div class="col-md-2">
              <label class="form-label fw-bold">Buscar por:</label>
              <select class="form-select form-select-sm" v-model="searchBy">
                <option value="name">Nombre</option>
                <option value="code">Código</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label fw-bold">Ordenar por:</label>
              <select class="form-select form-select-sm" v-model="sortBy">
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
                  v-model="search"
                  placeholder="Buscar..."
                  @input="currentPage = 1">
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-bold">Existencias</label>
              <select class="form-select form-select-sm" v-model="stockFilter">
                <option value="">Todos</option>
                <option value="in_stock">Con Stock</option>
                <option value="out_of_stock">Sin Stock</option>
              </select>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-4">
              <label class="form-label fw-bold">Seleccione una Categoría</label>
              <select class="form-select form-select-sm" v-model="categoryFilter">
                <option value="">Todas las Categorías</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Seleccione una Marca</label>
              <select class="form-select form-select-sm" v-model="brandFilter">
                <option value="">Todas las Marcas</option>
                <option v-for="brand in brands" :key="brand" :value="brand">
                  {{ brand }}
                </option>
              </select>
            </div>
          </div>

          <!-- Tabla de productos -->
          <div class="table-responsive" style="max-height: 450px;">
            <table class="table table-hover table-sm table-bordered">
              <thead class="table-light sticky-top">
                <tr>
                  <th style="width: 5%;">Info</th>
                  <th style="width: 8%;">IMG</th>
                  <th style="width: 10%;">Código</th>
                  <th style="width: 30%;">Item</th>
                  <th style="width: 15%;">Categoría/Subcategoría</th>
                  <th style="width: 10%;" class="text-center">Existencias</th>
                  <th style="width: 12%;" class="text-end">Precio Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="product in paginatedProducts"
                  :key="product.id"
                  @dblclick="selectProduct(product)"
                  style="cursor: pointer;">
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary" @click.stop="showProductInfo(product)">
                      + INFO
                    </button>
                  </td>
                  <td class="text-center">
                    <img
                      :src="product.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect width=%2260%22 height=%2260%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2210%22 fill=%22%23999%22%3ESIN IMG%3C/text%3E%3C/svg%3E'"
                      :alt="product.name"
                      style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;"
                      @error="handleImageError"
                    >
                  </td>
                  <td>{{ product.sku }}</td>
                  <td>{{ product.name }}</td>
                  <td>
                    <small class="text-primary">{{ product.category_name || 'GENERAL' }}</small><br>
                    <small class="text-muted">{{ product.subcategory_name || 'N/A' }}</small>
                  </td>
                  <td class="text-center">
                    <span :class="product.stock > 0 ? 'text-success fw-bold' : 'text-danger'">
                      {{ formatNumber(product.stock || 0) }}
                    </span>
                  </td>
                  <td class="text-end fw-bold">{{ formatCurrency(product.sale_price || 0) }}</td>
                </tr>
                <tr v-if="filteredProducts.length === 0">
                  <td colspan="7" class="text-center text-muted py-4">
                    No se encontraron productos
                  </td>
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
              @click="currentPage--"
              :disabled="currentPage <= 1">
              <i class="ti ti-chevron-left"></i>
            </button>
            <span class="small">Página {{ currentPage }} de {{ totalPages }}</span>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary"
              @click="currentPage++"
              :disabled="currentPage >= totalPages">
              <i class="ti ti-chevron-right"></i>
            </button>
          </div>
          <button type="button" class="btn btn-secondary" @click="close">CERRAR</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    products: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      search: '',
      searchBy: 'name',
      sortBy: 'name',
      stockFilter: '',
      categoryFilter: '',
      brandFilter: '',
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  computed: {
    categories() {
      const cats = new Set();
      this.products.forEach(p => {
        if (p.category_name) cats.add(p.category_name);
      });
      return Array.from(cats).sort();
    },
    brands() {
      const brds = new Set();
      this.products.forEach(p => {
        if (p.brand_name) brds.add(p.brand_name);
      });
      return Array.from(brds).sort();
    },
    filteredProducts() {
      let filtered = [...this.products];

      // Búsqueda
      if (this.search) {
        const s = this.search.toLowerCase();
        filtered = filtered.filter(p => {
          if (this.searchBy === 'name') return (p.name || '').toLowerCase().includes(s);
          if (this.searchBy === 'code') return (p.sku || '').toLowerCase().includes(s);
          return false;
        });
      }

      // Filtro de stock
      if (this.stockFilter === 'in_stock') {
        filtered = filtered.filter(p => (p.stock || 0) > 0);
      } else if (this.stockFilter === 'out_of_stock') {
        filtered = filtered.filter(p => (p.stock || 0) <= 0);
      }

      // Filtro de categoría
      if (this.categoryFilter) {
        filtered = filtered.filter(p => p.category_name === this.categoryFilter);
      }

      // Filtro de marca
      if (this.brandFilter) {
        filtered = filtered.filter(p => p.brand_name === this.brandFilter);
      }

      // Ordenamiento
      if (this.sortBy === 'name') {
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } else if (this.sortBy === 'code') {
        filtered.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
      }

      return filtered;
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredProducts.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    }
  },
  methods: {
    handleImageError(event) {
      // Prevenir bucle infinito: solo intentar una vez
      if (event.target.dataset.errorHandled) {
        return;
      }
      event.target.dataset.errorHandled = 'true';
      event.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect width=%2260%22 height=%2260%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2210%22 fill=%22%23999%22%3ESIN IMG%3C/text%3E%3C/svg%3E';
    },
    close() {
      this.$emit('close');
    },
    selectProduct(product) {
      this.$emit('select', product);
      this.close();
    },
    showProductInfo(product) {
      this.$emit('show-info', product);
    },
    formatNumber(value) {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
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
.product-img-mini {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.65rem;
  text-align: center;
}
</style>
