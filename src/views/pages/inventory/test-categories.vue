<template>
  <div class="p-4">
    <h2>Test - Categorías Debug</h2>

    <button @click="testAPI" class="btn btn-primary mb-3">Probar API</button>

    <div v-if="loading" class="alert alert-info">Cargando...</div>

    <div v-if="error" class="alert alert-danger">
      <strong>Error:</strong> {{ error }}
    </div>

    <div v-if="rawResponse" class="mb-4">
      <h4>Respuesta Raw del Backend:</h4>
      <pre class="bg-light p-3">{{ JSON.stringify(rawResponse, null, 2) }}</pre>
    </div>

    <div v-if="categories.length > 0">
      <h4>Categorías procesadas ({{ categories.length }}):</h4>
      <ul>
        <li v-for="cat in categories" :key="cat.id">
          <strong>{{ cat.name }}</strong> - {{ cat.slug }} - Activo: {{ cat.is_active }}
        </li>
      </ul>
    </div>

    <div v-else-if="!loading">
      <div class="alert alert-warning">
        No hay categorías (array vacío)
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
      rawResponse: null,
      loading: false,
      error: null
    };
  },
  methods: {
    async testAPI() {
      this.loading = true;
      this.error = null;
      this.rawResponse = null;
      this.categories = [];

      try {
        console.log('🔍 Llamando a categoryService.getCategories()...');

        const response = await categoryService.getCategories({ page: 1, limit: 10 });

        console.log('✅ Respuesta recibida:', response);
        this.rawResponse = response;

        // El backend devuelve { success: true, message: "...", data: [...] }
        if (response && response.success && response.data) {
          console.log('✅ response.data:', response.data);
          console.log('✅ Array.isArray(response.data):', Array.isArray(response.data));

          this.categories = Array.isArray(response.data) ? response.data : [];

          console.log('✅ Categorías asignadas:', this.categories.length);
        } else {
          console.warn('⚠️ Formato inesperado de respuesta');
          this.error = 'Formato de respuesta inesperado';
        }

      } catch (err) {
        console.error('❌ Error:', err);
        this.error = err.response?.data?.message || err.message || 'Error desconocido';
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    console.log('🚀 Componente Test montado');
    this.testAPI();
  }
};
</script>

<style scoped>
pre {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
