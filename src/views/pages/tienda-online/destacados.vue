<template>
  <div>
    <!-- Información -->
    <div class="alert alert-info mb-4">
      <i class="ti ti-info-circle me-2"></i>
      Selecciona hasta 10 productos destacados que se mostrarán en la página principal de tu tienda online.
    </div>

    <!-- Estadísticas -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <i class="ti ti-star text-warning" style="font-size: 2rem;"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <h6 class="mb-0 text-muted">Destacados</h6>
                <h3 class="mb-0">{{ featuredProducts.length }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <i class="ti ti-package text-primary" style="font-size: 2rem;"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <h6 class="mb-0 text-muted">Disponibles</h6>
                <h3 class="mb-0">{{ totalProducts }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <i class="ti ti-photo text-success" style="font-size: 2rem;"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <h6 class="mb-0 text-muted">Con Imagen</h6>
                <h3 class="mb-0">{{ productsWithImage }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <i class="ti ti-tag text-info" style="font-size: 2rem;"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <h6 class="mb-0 text-muted">Precio Promedio</h6>
                <h3 class="mb-0">L {{ averagePrice }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Productos Destacados Actuales -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="ti ti-star me-2"></i>
          Productos Destacados Actuales
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <div v-else-if="featuredProducts.length === 0" class="text-center py-5">
          <i class="ti ti-star-off" style="font-size: 3rem; color: #ccc;"></i>
          <p class="text-muted mt-3">No hay productos destacados aún</p>
          <button class="btn btn-primary" @click="showAddModal = true">
            <i class="ti ti-plus me-2"></i>
            Agregar Productos
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th style="width: 80px;">Imagen</th>
                <th>Producto</th>
                <th>Código</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th style="width: 100px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in featuredProducts" :key="product.id">
                <td>
                  <img
                    v-if="product.image"
                    :src="product.image"
                    :alt="product.name"
                    class="rounded"
                    style="width: 60px; height: 60px; object-fit: cover;"
                  />
                  <div v-else class="bg-light rounded d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                    <i class="ti ti-photo-off text-muted"></i>
                  </div>
                </td>
                <td>
                  <div class="fw-bold">{{ product.name }}</div>
                  <small class="text-muted">{{ product.brand_name || 'Sin marca' }}</small>
                </td>
                <td><code>{{ product.code }}</code></td>
                <td>
                  <span class="badge bg-primary">{{ product.category_name || 'Sin categoría' }}</span>
                </td>
                <td class="fw-bold">L {{ formatPrice(product.price_1) }}</td>
                <td>
                  <button
                    class="btn btn-sm btn-danger"
                    @click="toggleFeatured(product.id, false)"
                    :disabled="saving"
                    title="Quitar de destacados"
                  >
                    <i class="ti ti-star-off"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="featuredProducts.length > 0" class="mt-3">
          <button class="btn btn-primary" @click="showAddModal = true">
            <i class="ti ti-plus me-2"></i>
            Agregar Más Productos
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para Agregar Productos -->
    <div class="modal fade" :class="{ 'show d-block': showAddModal }" tabindex="-1" v-if="showAddModal">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="ti ti-star me-2"></i>
              Seleccionar Productos Destacados
            </h5>
            <button type="button" class="btn-close" @click="showAddModal = false"></button>
          </div>
          <div class="modal-body">
            <!-- Búsqueda -->
            <div class="mb-3">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="ti ti-search"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  v-model="searchQuery"
                  placeholder="Buscar productos..."
                  @input="searchProducts"
                />
              </div>
            </div>

            <!-- Lista de productos -->
            <div v-if="loadingProducts" class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th style="width: 80px;">Imagen</th>
                    <th>Producto</th>
                    <th>Código</th>
                    <th>Precio</th>
                    <th style="width: 100px;">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in availableProducts" :key="product.id">
                    <td>
                      <img
                        v-if="product.image"
                        :src="product.image"
                        :alt="product.name"
                        class="rounded"
                        style="width: 50px; height: 50px; object-fit: cover;"
                      />
                      <div v-else class="bg-light rounded d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                        <i class="ti ti-photo-off text-muted"></i>
                      </div>
                    </td>
                    <td>
                      <div>{{ product.name }}</div>
                      <small class="text-muted">{{ product.category_name }}</small>
                    </td>
                    <td><code>{{ product.code }}</code></td>
                    <td class="fw-bold">L {{ formatPrice(product.price_1) }}</td>
                    <td>
                      <button
                        class="btn btn-sm btn-success"
                        @click="toggleFeatured(product.id, true)"
                        :disabled="saving || featuredProducts.length >= 10"
                        title="Marcar como destacado"
                      >
                        <i class="ti ti-star"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div v-if="availableProducts.length === 0" class="text-center py-4">
                <p class="text-muted">No se encontraron productos</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAddModal = false">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': showAddModal }" v-if="showAddModal"></div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DestacadosPage',
  data() {
    return {
      featuredProducts: [],
      availableProducts: [],
      allProducts: [],
      totalActiveProducts: 0,
      loading: false,
      loadingProducts: false,
      saving: false,
      showAddModal: false,
      searchQuery: '',
      searchTimeout: null
    }
  },
  computed: {
    totalProducts() {
      // Total de productos activos menos los destacados
      return this.totalActiveProducts - this.featuredProducts.length
    },
    productsWithImage() {
      return this.featuredProducts.filter(p => p.image).length
    },
    averagePrice() {
      if (this.featuredProducts.length === 0) return 0
      const sum = this.featuredProducts.reduce((acc, p) => acc + parseFloat(p.price_1 || 0), 0)
      return (sum / this.featuredProducts.length).toLocaleString('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  },
  mounted() {
    this.loadFeaturedProducts()
    this.loadAllProducts()
  },
  methods: {
    async loadFeaturedProducts() {
      try {
        this.loading = true
        const token = localStorage.getItem('token')

        // Obtener todos los productos y filtrar los destacados
        const response = await axios.get('/api/v1/products', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 1000 }
        })

        this.featuredProducts = response.data.data.products.filter(p => p.is_featured === 1)
      } catch (error) {
        console.error('Error loading featured products:', error)
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos destacados'
        })
      } finally {
        this.loading = false
      }
    },

    async loadAllProducts() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/v1/products', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 10000 } // Aumentar límite para obtener todos
        })

        this.allProducts = response.data.data.products
        // Contar solo productos activos
        this.totalActiveProducts = response.data.data.products.filter(p => p.is_active === 1).length
        this.updateAvailableProducts()
      } catch (error) {
        console.error('Error loading products:', error)
      }
    },

    updateAvailableProducts() {
      const featuredIds = this.featuredProducts.map(p => p.id)
      this.availableProducts = this.allProducts
        .filter(p => !featuredIds.includes(p.id) && p.is_active === 1)
        .slice(0, 50)
    },

    searchProducts() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        const query = this.searchQuery.toLowerCase()
        if (query) {
          this.availableProducts = this.allProducts
            .filter(p => {
              const isNotFeatured = !this.featuredProducts.find(fp => fp.id === p.id)
              const matchesSearch = p.name.toLowerCase().includes(query) ||
                                   p.code.toLowerCase().includes(query)
              return isNotFeatured && matchesSearch && p.is_active === 1
            })
            .slice(0, 50)
        } else {
          this.updateAvailableProducts()
        }
      }, 300)
    },

    async toggleFeatured(productId, isFeatured) {
      try {
        this.saving = true
        const token = localStorage.getItem('token')

        await axios.patch(
          `/api/v1/products/${productId}/featured`,
          { is_featured: isFeatured },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        this.$swal({
          icon: 'success',
          title: 'Éxito',
          text: `Producto ${isFeatured ? 'agregado a' : 'removido de'} destacados`,
          timer: 2000,
          showConfirmButton: false
        })

        // Recargar productos
        await this.loadFeaturedProducts()
        await this.loadAllProducts()

      } catch (error) {
        console.error('Error toggling featured:', error)
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el producto'
        })
      } finally {
        this.saving = false
      }
    },

    formatPrice(price) {
      return parseFloat(price || 0).toLocaleString('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style scoped>
.modal.show {
  background: rgba(0, 0, 0, 0.5);
}

.table > :not(caption) > * > * {
  padding: 0.75rem;
}
</style>
