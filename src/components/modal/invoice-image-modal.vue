<template>
  <div class="modal fade" :class="{ show: isOpen }" :style="{ display: isOpen ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ti ti-file-invoice me-2"></i>Imagen de Factura
          </h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>

        <div class="modal-body text-center">
          <img v-if="imageUrl" :src="imageUrl" alt="Factura" class="img-fluid" style="max-height: 70vh;">
          <p v-else class="text-muted">No hay imagen disponible</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Cerrar</button>
          <a v-if="imageUrl" :href="imageUrl" :download="`factura-${Date.now()}.jpg`" class="btn btn-primary">
            <i class="ti ti-download me-2"></i>Descargar
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade" :class="{ show: isOpen }" v-if="isOpen"></div>
</template>

<script>
export default {
  name: 'InvoiceImageModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal.show {
  display: block !important;
}

.modal-backdrop.show {
  opacity: 0.5;
}
</style>
