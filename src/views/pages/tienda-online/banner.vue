<template>
  <div>
    <!-- Información -->
    <div class="alert alert-info mb-4">
      <i class="ti ti-info-circle me-2"></i>
      Sube hasta 3 imágenes para el carousel principal de tu tienda. Las imágenes se guardan en Google Cloud Storage.
    </div>

    <!-- Grid de banners -->
    <div class="row g-4">
      <div v-for="(banner, index) in banners" :key="index" class="col-lg-4 col-md-6">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Banner {{ index + 1 }}</h5>
            <span class="badge" :class="banner.image_url ? 'bg-success' : 'bg-secondary'">
              {{ banner.image_url ? 'Activo' : 'Sin imagen' }}
            </span>
          </div>
          <div class="card-body">
            <!-- Preview de la imagen -->
            <div class="banner-preview mb-3">
              <img
                v-if="banner.image_url"
                :src="banner.image_url"
                :alt="`Banner ${index + 1}`"
                class="img-fluid rounded"
              />
              <div v-else class="no-image-banner">
                <i class="ti ti-photo-off"></i>
                <p class="text-muted small mt-2">Sin imagen</p>
              </div>
            </div>

            <!-- Campos de texto -->
            <div class="mb-3">
              <label class="form-label">Título</label>
              <input
                type="text"
                class="form-control"
                v-model="banner.title"
                placeholder="Ej: VANGUARDISTAS"
                maxlength="100"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Subtítulo</label>
              <input
                type="text"
                class="form-control"
                v-model="banner.subtitle"
                placeholder="Ej: DE LAS TENDENCIAS EN ESTILOS Y DISEÑOS"
                maxlength="200"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Texto del Botón</label>
              <input
                type="text"
                class="form-control"
                v-model="banner.button_text"
                placeholder="Ej: EXPLORAR AHORA"
                maxlength="50"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Enlace del Botón</label>
              <input
                type="text"
                class="form-control"
                v-model="banner.button_link"
                placeholder="Ej: /shop/catalog"
              />
            </div>

            <!-- Acciones -->
            <div class="d-flex gap-2">
              <label class="btn btn-primary flex-fill" :for="`file-${index}`">
                <i class="ti ti-upload me-2"></i>
                {{ banner.image_url ? 'Cambiar Imagen' : 'Subir Imagen' }}
              </label>
              <input
                :id="`file-${index}`"
                type="file"
                class="d-none"
                accept="image/*"
                @change="(e) => handleFileSelect(e, index)"
              />

              <button
                v-if="banner.image_url"
                class="btn btn-danger"
                @click="deleteImage(index)"
                :disabled="deleting[index]"
              >
                <i class="ti ti-trash"></i>
              </button>
            </div>

            <!-- Progress bar -->
            <div v-if="uploading[index]" class="progress mt-3">
              <div
                class="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                :style="{ width: uploadProgress[index] + '%' }"
              >
                {{ uploadProgress[index] }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón guardar global -->
    <div class="card mt-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1">Guardar Configuración</h6>
            <p class="text-muted small mb-0">
              Los cambios en títulos y enlaces se guardarán en la base de datos
            </p>
          </div>
          <button
            class="btn btn-success"
            @click="saveConfiguration"
            :disabled="saving"
          >
            <i class="ti ti-device-floppy me-2"></i>
            {{ saving ? 'Guardando...' : 'Guardar Todo' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Preview del carousel -->
    <div class="card mt-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="ti ti-eye me-2"></i>
          Vista Previa
        </h5>
      </div>
      <div class="card-body">
        <div class="carousel-preview">
          <div
            v-for="(banner, index) in activeBanners"
            :key="`preview-${index}`"
            class="preview-slide"
            :class="{ active: currentPreview === index }"
            :style="{ backgroundImage: banner.image_url ? `url(${banner.image_url})` : 'none' }"
          >
            <div class="preview-content">
              <div class="preview-text">
                <h1>{{ banner.title || 'Título del Banner' }}</h1>
                <p>{{ banner.subtitle || 'Subtítulo del banner' }}</p>
                <button class="preview-btn">
                  {{ banner.button_text || 'BOTÓN' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Controles del preview -->
          <div v-if="activeBanners.length > 1" class="preview-controls">
            <button
              v-for="(_, index) in activeBanners"
              :key="`dot-${index}`"
              class="preview-dot"
              :class="{ active: currentPreview === index }"
              @click="currentPreview = index"
            ></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { bannerService } from '@/services/api.service'

export default {
  name: 'BannerPage',
  setup() {
    const toast = useToast()
    const banners = ref([
      {
        id: 1,
        title: '',
        subtitle: '',
        button_text: '',
        button_link: '/shop/catalog',
        image_url: null,
        is_active: true,
        sort_order: 1
      },
      {
        id: 2,
        title: '',
        subtitle: '',
        button_text: '',
        button_link: '/shop/catalog',
        image_url: null,
        is_active: true,
        sort_order: 2
      },
      {
        id: 3,
        title: '',
        subtitle: '',
        button_text: '',
        button_link: '/shop/catalog',
        image_url: null,
        is_active: true,
        sort_order: 3
      }
    ])

    const uploading = ref([false, false, false])
    const uploadProgress = ref([0, 0, 0])
    const deleting = ref([false, false, false])
    const saving = ref(false)
    const currentPreview = ref(0)
    let previewInterval = null

    const activeBanners = computed(() => {
      return banners.value.filter(b => b.image_url)
    })

    const loadBanners = async () => {
      try {
        const response = await bannerService.getBanners()

        if (response.success && response.data && Array.isArray(response.data)) {
          // Cargar banners existentes
          response.data.forEach((banner, index) => {
            if (index < 3) {
              banners.value[index] = {
                ...banners.value[index],
                ...banner
              }
            }
          })
        }
      } catch (error) {
        console.error('Error loading banners:', error)
        // No mostrar error si no hay banners (primera vez)
      }
    }

    const handleFileSelect = async (event, index) => {
      const file = event.target.files[0]
      if (!file) return

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida')
        return
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB')
        return
      }

      await uploadImage(file, index)
    }

    const uploadImage = async (file, index) => {
      uploading.value[index] = true
      uploadProgress.value[index] = 0

      try {
        const response = await bannerService.uploadBannerImage(banners.value[index].id, file)

        if (response.success) {
          banners.value[index].image_url = response.data.url
          toast.success(`Banner ${index + 1} subido correctamente`)
        } else {
          toast.error(response.message || 'Error al subir la imagen')
        }

      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error(error.response?.data?.message || 'Error al subir la imagen')
      } finally {
        uploading.value[index] = false
        uploadProgress.value[index] = 0
      }
    }

    const deleteImage = async (index) => {
      if (!confirm(`¿Estás seguro de eliminar el Banner ${index + 1}?`)) return

      deleting.value[index] = true

      try {
        const response = await bannerService.deleteBannerImage(banners.value[index].id)

        if (response.success) {
          banners.value[index].image_url = null
          toast.success(`Banner ${index + 1} eliminado`)
        } else {
          toast.error(response.message || 'Error al eliminar la imagen')
        }
      } catch (error) {
        console.error('Error deleting image:', error)
        toast.error(error.response?.data?.message || 'Error al eliminar la imagen')
      } finally {
        deleting.value[index] = false
      }
    }

    const saveConfiguration = async () => {
      saving.value = true

      try {
        const response = await bannerService.updateBanners(banners.value)

        if (response.success) {
          toast.success('Configuración guardada exitosamente')
        } else {
          toast.error(response.message || 'Error al guardar la configuración')
        }
      } catch (error) {
        console.error('Error saving configuration:', error)
        toast.error(error.response?.data?.message || 'Error al guardar la configuración')
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      loadBanners()

      // Auto-advance preview
      previewInterval = setInterval(() => {
        if (activeBanners.value.length > 1) {
          currentPreview.value = (currentPreview.value + 1) % activeBanners.value.length
        }
      }, 3000)
    })

    onUnmounted(() => {
      if (previewInterval) {
        clearInterval(previewInterval)
      }
    })

    return {
      banners,
      uploading,
      uploadProgress,
      deleting,
      saving,
      currentPreview,
      activeBanners,
      handleFileSelect,
      deleteImage,
      saveConfiguration
    }
  }
}
</script>

<style scoped>
.banner-preview {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.no-image-banner i {
  font-size: 3rem;
}

/* Preview Carousel */
.carousel-preview {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background: #ddd;
}

.preview-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.preview-slide.active {
  opacity: 1;
}

.preview-slide::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.preview-content {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 3rem;
  z-index: 2;
}

.preview-text {
  max-width: 600px;
  color: white;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
}

.preview-text h1 {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  letter-spacing: 1px;
  color: white;
}

.preview-text p {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: white;
}

.preview-btn {
  background: white;
  color: #333;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  border: 3px solid white;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
}

.preview-btn:hover {
  background: #FF9F43;
  color: white;
  border-color: #FF9F43;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.preview-image {
  display: none;
}

.preview-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.preview-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-dot.active {
  background: white;
  transform: scale(1.3);
}

.preview-dot:hover {
  background: rgba(255,255,255,0.8);
}

@media (max-width: 768px) {
  .preview-content {
    flex-direction: column;
    padding: 2rem;
  }

  .preview-text h1 {
    font-size: 1.8rem;
  }

  .preview-text p {
    font-size: 1rem;
  }
}
</style>
