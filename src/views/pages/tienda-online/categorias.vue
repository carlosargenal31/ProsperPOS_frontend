<template>
  <div>
      <!-- Filtros y búsqueda -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-lg-6 col-sm-6 col-12">
              <div class="input-blocks">
                <i class="ti ti-search"></i>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Buscar categoría..."
                  v-model="searchQuery"
                />
              </div>
            </div>
            <div class="col-lg-6 col-sm-6 col-12 text-end">
              <button class="btn btn-primary" @click="saveChanges" :disabled="saving">
                <i class="ti ti-device-floppy me-2"></i>
                {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Información -->
      <div class="alert alert-info mb-4">
        <i class="ti ti-info-circle me-2"></i>
        Selecciona hasta 4 categorías para mostrar en la página principal de tu tienda online.
        Asegúrate de que tengan imágenes para una mejor presentación.
      </div>

      <!-- Tabla de categorías -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table datanew">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Productos</th>
                  <th>Estado</th>
                  <th>Mostrar en Tienda</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="category in filteredCategories" :key="category.id">
                  <td>
                    <div class="category-image-preview">
                      <img
                        v-if="category.image_url"
                        :src="category.image_url"
                        :alt="category.name"
                        class="category-thumbnail"
                      />
                      <div v-else class="no-image">
                        <i class="ti ti-photo-off"></i>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="fw-bold">{{ category.name }}</span>
                  </td>
                  <td>
                    <span class="badge bg-info">{{ category.products_count || 0 }} productos</span>
                  </td>
                  <td>
                    <span class="badge" :class="category.is_active ? 'bg-success' : 'bg-danger'">
                      {{ category.is_active ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td>
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`show-${category.id}`"
                        v-model="category.show_in_ecommerce"
                        @change="markAsChanged(category.id)"
                      />
                      <label class="form-check-label" :for="`show-${category.id}`">
                        {{ category.show_in_ecommerce ? 'Visible' : 'Oculta' }}
                      </label>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredCategories.length === 0">
                  <td colspan="5" class="text-center py-4">
                    <i class="ti ti-folder-off" style="font-size: 3rem; color: #ccc;"></i>
                    <p class="mt-2 text-muted">No se encontraron categorías</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Categorías seleccionadas para mostrar -->
      <div class="card mt-4" v-if="visibleCategories.length > 0">
        <div class="card-header">
          <h5>
            <i class="ti ti-eye me-2"></i>
            Categorías Visibles en la Tienda ({{ visibleCategories.length }}/4)
          </h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div
              v-for="category in visibleCategories"
              :key="`visible-${category.id}`"
              class="col-md-3"
            >
              <div class="card border">
                <div class="card-body text-center">
                  <div class="category-preview-image mb-2">
                    <img
                      v-if="category.image_url"
                      :src="category.image_url"
                      :alt="category.name"
                      class="img-fluid rounded"
                    />
                    <div v-else class="no-image-large">
                      <i class="ti ti-photo-off"></i>
                      <p class="text-muted small mt-2">Sin imagen</p>
                    </div>
                  </div>
                  <h6>{{ category.name }}</h6>
                  <p class="text-muted small">{{ category.products_count }} productos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import axios from 'axios'

export default {
  name: 'EcommerceCategories',
  setup() {
    const toast = useToast()
    const categories = ref([])
    const searchQuery = ref('')
    const saving = ref(false)
    const changedCategories = ref(new Set())

    const filteredCategories = computed(() => {
      if (!searchQuery.value) return categories.value

      const query = searchQuery.value.toLowerCase()
      return categories.value.filter(cat =>
        cat.name.toLowerCase().includes(query)
      )
    })

    const visibleCategories = computed(() => {
      return categories.value.filter(cat => cat.show_in_ecommerce)
    })

    const markAsChanged = (categoryId) => {
      changedCategories.value.add(categoryId)
    }

    const loadCategories = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/v1/categories', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.success) {
          // Asegurarse de que show_in_ecommerce esté definido
          categories.value = (response.data.data || []).map(cat => ({
            ...cat,
            show_in_ecommerce: cat.show_in_ecommerce === 1 || cat.show_in_ecommerce === true
          }))
        }
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error('Error al cargar las categorías')
      }
    }

    const saveChanges = async () => {
      if (changedCategories.value.size === 0) {
        toast.info('No hay cambios para guardar')
        return
      }

      // Validar que no haya más de 4 categorías visibles
      const visibleCount = categories.value.filter(c => c.show_in_ecommerce).length
      if (visibleCount > 4) {
        toast.warning('Solo puedes mostrar hasta 4 categorías en la tienda')
        return
      }

      saving.value = true

      try {
        const token = localStorage.getItem('token')

        // Actualizar cada categoría modificada
        const promises = Array.from(changedCategories.value).map(async (categoryId) => {
          const category = categories.value.find(c => c.id === categoryId)
          if (!category) return

          await axios.put(`/api/v1/categories/${categoryId}`, {
            show_in_ecommerce: category.show_in_ecommerce
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        })

        await Promise.all(promises)

        toast.success('Cambios guardados exitosamente')
        changedCategories.value.clear()
        await loadCategories()

      } catch (error) {
        console.error('Error saving changes:', error)
        toast.error('Error al guardar los cambios')
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      loadCategories()
    })

    return {
      categories,
      searchQuery,
      saving,
      filteredCategories,
      visibleCategories,
      markAsChanged,
      saveChanges
    }
  }
}
</script>

<style scoped>
.category-image-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.category-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #999;
  font-size: 1.5rem;
}

.category-preview-image {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.category-preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #999;
  font-size: 2rem;
}

.form-check-input:checked {
  background-color: #28a745;
  border-color: #28a745;
}
</style>
