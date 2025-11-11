<template>
  <div>
    <!-- Modal Agregar Producto -->
    <div class="modal fade" id="add-product" tabindex="-1" aria-labelledby="addProductLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addProductLabel">Nuevo Producto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProduct">
              <div class="row">
                <!-- Información Básica -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Código <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="form.code" required placeholder="Ej: PROD-001" />
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Código de Barras</label>
                    <input type="text" class="form-control" v-model="form.barcode" placeholder="Código de barras" />
                  </div>
                </div>

                <div class="col-12">
                  <div class="mb-3">
                    <label class="form-label">Nombre <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="form.name" required placeholder="Nombre del producto" />
                  </div>
                </div>

                <div class="col-12">
                  <div class="mb-3">
                    <label class="form-label">Nombre Corto</label>
                    <input type="text" class="form-control" v-model="form.short_name" placeholder="Nombre corto" />
                  </div>
                </div>

                <!-- Categorización -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Categoría</label>
                    <select class="form-select" v-model="form.category_id" @change="loadSubcategories">
                      <option value="">Seleccionar...</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Subcategoría</label>
                    <select class="form-select" v-model="form.subcategory_id" :disabled="!form.category_id">
                      <option value="">Seleccionar...</option>
                      <option v-for="sub in subcategories" :key="sub.id" :value="sub.id">
                        {{ sub.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Marca</label>
                    <select class="form-select" v-model="form.brand_id">
                      <option value="">Seleccionar...</option>
                      <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                        {{ brand.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Precios -->
                <div class="col-12"><hr class="my-3" /><h6>Costos y Precios</h6></div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Costo</label>
                    <input type="number" step="0.01" class="form-control" v-model="form.cost" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 1</label>
                    <input type="number" step="0.01" class="form-control" v-model="form.price_1" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 2</label>
                    <input type="number" step="0.01" class="form-control" v-model="form.price_2" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 3</label>
                    <input type="number" step="0.01" class="form-control" v-model="form.price_3" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 4</label>
                    <input type="number" step="0.01" class="form-control" v-model="form.price_4" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 5</label>
                    <input type="number" step="0.01" class="form-control" v-model="form.price_5" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 6</label>
                    <input type="number" step="0.01" class="form-control" v-model="form.price_6" placeholder="0.00" />
                  </div>
                </div>

                <!-- Inventario -->
                <div class="col-12"><hr class="my-3" /><h6>Inventario</h6></div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Stock</label>
                    <input type="number" step="0.01" class="form-control" v-model="form.stock" placeholder="0" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Fraccionable</label>
                    <select class="form-select" v-model="form.fractional">
                      <option :value="0">No</option>
                      <option :value="1">Sí</option>
                    </select>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Estado</label>
                    <select class="form-select" v-model="form.is_active">
                      <option :value="1">Activo</option>
                      <option :value="0">Inactivo</option>
                    </select>
                  </div>
                </div>

                <!-- Descripción -->
                <div class="col-12">
                  <div class="mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea class="form-control" v-model="form.description" rows="3" placeholder="Descripción del producto"></textarea>
                  </div>
                </div>
              </div>

              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <div v-if="success" class="alert alert-success">{{ success }}</div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="saveProduct" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Guardando...' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editar Producto -->
    <div class="modal fade" id="edit-product" tabindex="-1" aria-labelledby="editProductLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editProductLabel">Editar Producto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateProduct">
              <div class="row">
                <!-- Información Básica -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Código <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="formEdit.code" required placeholder="Ej: PROD-001" disabled />
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Código de Barras</label>
                    <input type="text" class="form-control" v-model="formEdit.barcode" placeholder="Código de barras" />
                  </div>
                </div>

                <div class="col-12">
                  <div class="mb-3">
                    <label class="form-label">Nombre <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="formEdit.name" required placeholder="Nombre del producto" />
                  </div>
                </div>

                <div class="col-12">
                  <div class="mb-3">
                    <label class="form-label">Nombre Corto</label>
                    <input type="text" class="form-control" v-model="formEdit.short_name" placeholder="Nombre corto" />
                  </div>
                </div>

                <!-- Categorización -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Categoría</label>
                    <select class="form-select" v-model="formEdit.category_id" @change="loadSubcategoriesEdit">
                      <option value="">Seleccionar...</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Subcategoría</label>
                    <select class="form-select" v-model="formEdit.subcategory_id" :disabled="!formEdit.category_id">
                      <option value="">Seleccionar...</option>
                      <option v-for="sub in subcategoriesEdit" :key="sub.id" :value="sub.id">
                        {{ sub.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Marca</label>
                    <select class="form-select" v-model="formEdit.brand_id">
                      <option value="">Seleccionar...</option>
                      <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                        {{ brand.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Precios -->
                <div class="col-12"><hr class="my-3" /><h6>Costos y Precios</h6></div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Costo</label>
                    <input type="number" step="0.01" class="form-control" v-model="formEdit.cost" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 1</label>
                    <input type="number" step="0.01" class="form-control" v-model="formEdit.price_1" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 2</label>
                    <input type="number" step="0.01" class="form-control" v-model="formEdit.price_2" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 3</label>
                    <input type="number" step="0.01" class="form-control" v-model="formEdit.price_3" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 4</label>
                    <input type="number" step="0.01" class="form-control" v-model="formEdit.price_4" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 5</label>
                    <input type="number" step="0.01" class="form-control" v-model="formEdit.price_5" placeholder="0.00" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Precio 6</label>
                    <input type="number" step="0.01" class="form-control" v-model="formEdit.price_6" placeholder="0.00" />
                  </div>
                </div>

                <!-- Inventario -->
                <div class="col-12"><hr class="my-3" /><h6>Inventario</h6></div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Stock</label>
                    <input type="number" step="0.01" class="form-control" v-model="formEdit.stock" placeholder="0" />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Fraccionable</label>
                    <select class="form-select" v-model="formEdit.fractional">
                      <option :value="0">No</option>
                      <option :value="1">Sí</option>
                    </select>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Estado</label>
                    <select class="form-select" v-model="formEdit.is_active">
                      <option :value="1">Activo</option>
                      <option :value="0">Inactivo</option>
                    </select>
                  </div>
                </div>

                <!-- Descripción -->
                <div class="col-12">
                  <div class="mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea class="form-control" v-model="formEdit.description" rows="3" placeholder="Descripción del producto"></textarea>
                  </div>
                </div>
              </div>

              <div v-if="errorEdit" class="alert alert-danger">{{ errorEdit }}</div>
              <div v-if="successEdit" class="alert alert-success">{{ successEdit }}</div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="updateProduct" :disabled="savingEdit">
              <span v-if="savingEdit" class="spinner-border spinner-border-sm me-2"></span>
              {{ savingEdit ? 'Guardando...' : 'Actualizar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ver Producto -->
    <div class="modal fade" id="view-product" tabindex="-1" aria-labelledby="viewProductLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="viewProductLabel">Detalles del Producto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="productView" class="row">
              <div class="col-md-6 mb-3">
                <strong>Código:</strong>
                <p class="mb-0">{{ productView.code }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>Código de Barras:</strong>
                <p class="mb-0">{{ productView.barcode || '-' }}</p>
              </div>
              <div class="col-12 mb-3">
                <strong>Nombre:</strong>
                <p class="mb-0">{{ productView.name }}</p>
              </div>
              <div class="col-12 mb-3">
                <strong>Nombre Corto:</strong>
                <p class="mb-0">{{ productView.short_name || '-' }}</p>
              </div>
              <div class="col-md-4 mb-3">
                <strong>Categoría:</strong>
                <p class="mb-0">{{ productView.category_name || '-' }}</p>
              </div>
              <div class="col-md-4 mb-3">
                <strong>Subcategoría:</strong>
                <p class="mb-0">{{ productView.subcategory_name || '-' }}</p>
              </div>
              <div class="col-md-4 mb-3">
                <strong>Marca:</strong>
                <p class="mb-0">{{ productView.brand_name || '-' }}</p>
              </div>

              <div class="col-12"><hr class="my-2" /><h6>Costos y Precios</h6></div>
              <div class="col-md-4 mb-3">
                <strong>Costo:</strong>
                <p class="mb-0">L. {{ formatPrice(productView.cost) }}</p>
              </div>
              <div class="col-md-4 mb-3">
                <strong>Precio 1:</strong>
                <p class="mb-0">L. {{ formatPrice(productView.price_1) }}</p>
              </div>
              <div class="col-md-4 mb-3">
                <strong>Precio 2:</strong>
                <p class="mb-0">L. {{ formatPrice(productView.price_2) }}</p>
              </div>
              <div class="col-md-4 mb-3">
                <strong>Precio 3:</strong>
                <p class="mb-0">L. {{ formatPrice(productView.price_3) }}</p>
              </div>
              <div class="col-md-4 mb-3">
                <strong>Precio 4:</strong>
                <p class="mb-0">L. {{ formatPrice(productView.price_4) }}</p>
              </div>
              <div class="col-md-4 mb-3">
                <strong>Precio 5:</strong>
                <p class="mb-0">L. {{ formatPrice(productView.price_5) }}</p>
              </div>
              <div class="col-md-4 mb-3">
                <strong>Precio 6:</strong>
                <p class="mb-0">L. {{ formatPrice(productView.price_6) }}</p>
              </div>

              <div class="col-12"><hr class="my-2" /><h6>Inventario</h6></div>
              <div class="col-md-4 mb-3">
                <strong>Stock:</strong>
                <p class="mb-0">{{ productView.stock || 0 }}</p>
              </div>
              <div class="col-md-4 mb-3">
                <strong>Fraccionable:</strong>
                <p class="mb-0">{{ productView.fractional ? 'Sí' : 'No' }}</p>
              </div>
              <div class="col-md-4 mb-3">
                <strong>Estado:</strong>
                <span :class="productView.is_active ? 'badge bg-success' : 'badge bg-danger'">
                  {{ productView.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="col-12 mb-3" v-if="productView.description">
                <strong>Descripción:</strong>
                <p class="mb-0">{{ productView.description }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.service';

export default {
  emits: ['saved', 'deleted'],
  props: {
    product: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      categories: [],
      subcategories: [],
      subcategoriesEdit: [],
      brands: [],
      productView: null,

      // Formulario para agregar
      form: {
        code: '',
        barcode: '',
        name: '',
        short_name: '',
        category_id: '',
        subcategory_id: '',
        brand_id: '',
        description: '',
        cost: 0,
        price_1: 0,
        price_2: 0,
        price_3: 0,
        price_4: 0,
        price_5: 0,
        price_6: 0,
        stock: 0,
        fractional: 0,
        tax_rate: 0,
        image_url: '',
        is_active: 1
      },

      // Formulario para editar
      formEdit: {
        code: '',
        barcode: '',
        name: '',
        short_name: '',
        category_id: '',
        subcategory_id: '',
        brand_id: '',
        description: '',
        cost: 0,
        price_1: 0,
        price_2: 0,
        price_3: 0,
        price_4: 0,
        price_5: 0,
        price_6: 0,
        stock: 0,
        fractional: 0,
        tax_rate: 0,
        image_url: '',
        is_active: 1
      },

      saving: false,
      savingEdit: false,
      error: null,
      success: null,
      errorEdit: null,
      successEdit: null
    };
  },
  watch: {
    product: {
      handler(newProduct) {
        if (newProduct) {
          this.formEdit = {
            code: newProduct.code || '',
            barcode: newProduct.barcode || '',
            name: newProduct.name || '',
            short_name: newProduct.short_name || '',
            category_id: newProduct.category_id || '',
            subcategory_id: newProduct.subcategory_id || '',
            brand_id: newProduct.brand_id || '',
            description: newProduct.description || '',
            cost: newProduct.cost || 0,
            price_1: newProduct.price_1 || 0,
            price_2: newProduct.price_2 || 0,
            price_3: newProduct.price_3 || 0,
            price_4: newProduct.price_4 || 0,
            price_5: newProduct.price_5 || 0,
            price_6: newProduct.price_6 || 0,
            stock: newProduct.stock || 0,
            fractional: newProduct.fractional || 0,
            tax_rate: newProduct.tax_rate || 0,
            image_url: newProduct.image_url || '',
            is_active: newProduct.is_active !== undefined ? newProduct.is_active : 1
          };

          if (newProduct.category_id) {
            this.loadSubcategoriesEdit();
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.loadCategories();
    this.loadBrands();
  },
  methods: {
    async loadCategories() {
      try {
        const response = await api.get('/categories/active');
        if (response.data.success) {
          this.categories = response.data.data;
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    },

    async loadSubcategories() {
      if (!this.form.category_id) {
        this.subcategories = [];
        return;
      }

      try {
        const response = await api.get(`/categories/${this.form.category_id}/subcategories`);
        if (response.data.success) {
          this.subcategories = response.data.data;
        }
      } catch (error) {
        console.error('Error cargando subcategorías:', error);
        this.subcategories = [];
      }
    },

    async loadSubcategoriesEdit() {
      if (!this.formEdit.category_id) {
        this.subcategoriesEdit = [];
        return;
      }

      try {
        const response = await api.get(`/categories/${this.formEdit.category_id}/subcategories`);
        if (response.data.success) {
          this.subcategoriesEdit = response.data.data;
        }
      } catch (error) {
        console.error('Error cargando subcategorías:', error);
        this.subcategoriesEdit = [];
      }
    },

    async loadBrands() {
      try {
        const response = await api.get('/brands');
        if (response.data.success) {
          this.brands = response.data.data;
        }
      } catch (error) {
        console.error('Error cargando marcas:', error);
      }
    },

    async saveProduct() {
      this.saving = true;
      this.error = null;
      this.success = null;

      try {
        const response = await api.post('/products', this.form);

        if (response.data.success) {
          this.success = 'Producto creado exitosamente';
          this.$emit('saved');

          setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('add-product'));
            if (modal) modal.hide();
            this.resetForm();
          }, 1500);
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear el producto';
      } finally {
        this.saving = false;
      }
    },

    async updateProduct() {
      this.savingEdit = true;
      this.errorEdit = null;
      this.successEdit = null;

      try {
        const response = await api.put(`/products/${this.product.id}`, this.formEdit);

        if (response.data.success) {
          this.successEdit = 'Producto actualizado exitosamente';
          this.$emit('saved');

          setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('edit-product'));
            if (modal) modal.hide();
          }, 1500);
        }
      } catch (error) {
        this.errorEdit = error.response?.data?.message || 'Error al actualizar el producto';
      } finally {
        this.savingEdit = false;
      }
    },

    setProductView(product) {
      this.productView = product;
    },

    resetForm() {
      this.form = {
        code: '',
        barcode: '',
        name: '',
        short_name: '',
        category_id: '',
        subcategory_id: '',
        brand_id: '',
        description: '',
        cost: 0,
        price_1: 0,
        price_2: 0,
        price_3: 0,
        price_4: 0,
        price_5: 0,
        price_6: 0,
        stock: 0,
        fractional: 0,
        tax_rate: 0,
        image_url: '',
        is_active: 1
      };
      this.error = null;
      this.success = null;
    },

    formatPrice(price) {
      if (!price) return '0.00';
      return parseFloat(price).toFixed(2);
    }
  }
};
</script>
