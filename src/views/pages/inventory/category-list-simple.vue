<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Categorías (Versión Simple)</h4>
            <h6>Administra tus categorías</h6>
          </div>
        </div>
        <button @click="loadCategories" class="btn btn-primary">Recargar</button>
      </div>

      <div class="card">
        <div class="card-body">
          <!-- Estados de carga -->
          <div v-if="loading" class="text-center p-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>

          <div v-else-if="error" class="alert alert-danger m-3">
            {{ error }}
          </div>

          <!-- Información de debug -->
          <div v-else>
            <div class="alert alert-info mb-3">
              <strong>Debug:</strong> Se encontraron {{ categories.length }} categorías
            </div>

            <!-- Tabla simple HTML -->
            <div v-if="categories.length > 0" class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Slug</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cat in categories" :key="cat.id">
                    <td>
                      <small class="text-muted">{{ cat.id.substring(0, 8) }}...</small>
                    </td>
                    <td><strong>{{ cat.name }}</strong></td>
                    <td>{{ cat.slug }}</td>
                    <td>{{ cat.description || '-' }}</td>
                    <td>
                      <span :class="['badge', cat.is_active ? 'bg-success' : 'bg-danger']">
                        {{ cat.is_active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- No hay datos -->
            <div v-else class="alert alert-warning">
              No se encontraron categorías.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { categoryService } from '@/services/api.service';

export default {
  data() {
    return {
      categories: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    console.log('🚀 Componente Category List Simple montado');
    this.loadCategories();
  },
  methods: {
    async loadCategories() {
      this.loading = true;
      this.error = null;

      try {
        console.log('🔍 Cargando categorías...');

        const response = await categoryService.getCategories({
          page: 1,
          limit: 100
        });

        console.log('✅ Respuesta completa:', response);

        if (response && response.success && response.data) {
          this.categories = Array.isArray(response.data) ? response.data : [];
          console.log(`✅ ${this.categories.length} categorías cargadas`);
        } else {
          console.warn('⚠️ Formato de respuesta inesperado:', response);
          this.error = 'Formato de respuesta inesperado';
        }

      } catch (err) {
        console.error('❌ Error al cargar categorías:', err);
        this.error = err.response?.data?.message || err.message || 'Error al cargar categorías';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.table-responsive {
  max-height: 600px;
  overflow-y: auto;
}
</style>
