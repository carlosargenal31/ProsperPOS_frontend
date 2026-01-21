<template>
  <div>
    <!-- Información -->
    <div class="alert alert-info mb-4">
      <i class="ti ti-info-circle me-2"></i>
      Configura las opciones generales de tu tienda en línea. Estos ajustes afectan cómo se comporta tu tienda para los clientes.
    </div>

    <!-- Configuración de Stock -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="ti ti-package me-2"></i>
          Configuración de Inventario
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <div v-else>
          <!-- Opción: Permitir pedidos sin stock -->
          <div class="mb-4">
            <div class="d-flex align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-2">Permitir Pedidos sin Importar Stock</h6>
                <p class="text-muted mb-3" style="font-size: 0.875rem;">
                  Cuando está activado, los clientes podrán realizar pedidos de productos incluso si no hay stock disponible.
                  Todos los productos con "Mostrar en tienda en línea" activado estarán disponibles para compra, sin mostrar "Agotado".
                </p>
                <div class="alert alert-warning" style="font-size: 0.875rem;">
                  <i class="ti ti-alert-triangle me-2"></i>
                  <strong>Importante:</strong> Con esta opción activada, deberás gestionar manualmente los pedidos que excedan tu inventario real.
                </div>
              </div>
              <div class="flex-shrink-0 ms-3">
                <div class="form-check form-switch" style="font-size: 1.5rem;">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="allowOrderWithoutStock"
                    v-model="config.allow_order_without_stock"
                    @change="handleConfigChange"
                    :disabled="saving"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Estado Actual -->
          <div class="card bg-light">
            <div class="card-body">
              <h6 class="mb-3">
                <i class="ti ti-info-circle me-2"></i>
                Estado Actual
              </h6>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-2">
                    <strong>Pedidos sin stock:</strong>
                    <span :class="config.allow_order_without_stock ? 'text-success' : 'text-danger'" class="ms-2">
                      <i :class="config.allow_order_without_stock ? 'ti ti-check' : 'ti ti-x'"></i>
                      {{ config.allow_order_without_stock ? 'Activado' : 'Desactivado' }}
                    </span>
                  </div>
                  <div class="mb-0">
                    <strong>Comportamiento:</strong>
                    <span class="ms-2 text-muted">
                      {{ config.allow_order_without_stock
                        ? 'Los productos siempre están disponibles para compra'
                        : 'Solo productos con stock disponible pueden comprarse'
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje de éxito/error -->
          <div v-if="successMessage" class="alert alert-success mt-3">
            <i class="ti ti-check me-2"></i>
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="alert alert-danger mt-3">
            <i class="ti ti-x me-2"></i>
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'ConfiguracionPage',

  data() {
    return {
      loading: true,
      saving: false,
      config: {
        allow_order_without_stock: false
      },
      successMessage: '',
      errorMessage: ''
    }
  },

  mounted() {
    this.loadConfig()
  },

  methods: {
    async loadConfig() {
      try {
        this.loading = true
        const response = await axios.get('/companies/ecommerce/config')

        if (response.data.success) {
          // Convertir el valor a booleano
          this.config.allow_order_without_stock = response.data.data.allow_order_without_stock === 1
        }
      } catch (error) {
        console.error('Error al cargar configuración:', error)
        this.errorMessage = 'Error al cargar la configuración'
      } finally {
        this.loading = false
      }
    },

    async handleConfigChange() {
      try {
        this.saving = true
        this.successMessage = ''
        this.errorMessage = ''

        const response = await axios.put('/companies/ecommerce/config', {
          allow_order_without_stock: this.config.allow_order_without_stock ? 1 : 0
        })

        if (response.data.success) {
          this.successMessage = 'Configuración actualizada exitosamente'

          // Limpiar mensaje después de 3 segundos
          setTimeout(() => {
            this.successMessage = ''
          }, 3000)
        }
      } catch (error) {
        console.error('Error al actualizar configuración:', error)
        this.errorMessage = error.response?.data?.message || 'Error al actualizar la configuración'

        // Revertir el cambio en caso de error
        this.config.allow_order_without_stock = !this.config.allow_order_without_stock
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.form-check-input {
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #28a745;
  border-color: #28a745;
}

.card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
</style>
