<template>
  <div class="modal fade" :class="{ show: isOpen }" :style="{ display: isOpen ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ti ti-file-invoice me-2"></i>
            {{ purchase ? 'Editar' : 'Nueva' }} Factura de Compra
          </h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>

        <div class="modal-body">
          <!-- Mode Selection -->
          <div class="row mb-4" v-if="!purchase">
            <div class="col-12">
              <div class="btn-group w-100" role="group">
                <button type="button" class="btn" :class="inputMode === 'manual' ? 'btn-primary' : 'btn-outline-primary'" @click="setInputMode('manual')">
                  <i class="ti ti-edit me-2"></i>Entrada Manual
                </button>
                <button type="button" class="btn" :class="inputMode === 'scan' ? 'btn-primary' : 'btn-outline-primary'" @click="setInputMode('scan')">
                  <i class="ti ti-scan me-2"></i>Escanear Factura
                </button>
              </div>
            </div>
          </div>

          <!-- Scan Mode -->
          <div v-if="inputMode === 'scan' && !purchase" class="mb-4">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="mb-3">
                  <i class="ti ti-camera me-2"></i>Escanear Factura con OCR
                </h6>

                <!-- Upload Options -->
                <div class="row mb-3">
                  <div class="col-6">
                    <button type="button" class="btn btn-outline-primary w-100" @click="triggerFileInput">
                      <i class="ti ti-upload me-2"></i>Seleccionar Archivo
                    </button>
                  </div>
                  <div class="col-6">
                    <button type="button" class="btn btn-outline-primary w-100" @click="openCamera">
                      <i class="ti ti-camera me-2"></i>Abrir Cámara
                    </button>
                  </div>
                </div>

                <!-- Camera Capture -->
                <div v-if="cameraActive" class="camera-container mb-3">
                  <video ref="videoElement" autoplay playsinline class="w-100 rounded"></video>
                  <div class="camera-controls mt-2 text-center">
                    <button type="button" class="btn btn-success me-2" @click="capturePhoto">
                      <i class="ti ti-camera me-1"></i>Capturar
                    </button>
                    <button type="button" class="btn btn-danger" @click="closeCamera">
                      <i class="ti ti-x me-1"></i>Cerrar Cámara
                    </button>
                  </div>
                </div>

                <!-- Upload Area -->
                <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop" v-if="!cameraActive">
                  <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display: none;">

                  <div v-if="!uploadedImage" class="upload-placeholder">
                    <i class="ti ti-cloud-upload fs-48 text-primary mb-3"></i>
                    <h5>Arrastra tu factura aquí o haz clic para seleccionar</h5>
                    <p class="text-muted">Formatos soportados: JPG, PNG, GIF, BMP, TIFF (Máx. 10MB)</p>
                  </div>

                  <div v-else class="upload-preview">
                    <img :src="uploadedImage" alt="Factura" class="img-fluid">
                    <button type="button" class="btn btn-danger btn-sm mt-2" @click.stop="clearImage">
                      <i class="ti ti-trash me-1"></i>Eliminar Imagen
                    </button>
                  </div>
                </div>

                <!-- Canvas for photo capture (hidden) -->
                <canvas ref="canvasElement" style="display: none;"></canvas>

                <!-- OCR Progress -->
                <div v-if="processingOCR" class="text-center mt-3">
                  <div class="progress mb-2" style="height: 25px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                         :style="{width: ocrProgress + '%'}"
                         :aria-valuenow="ocrProgress"
                         aria-valuemin="0"
                         aria-valuemax="100">
                      {{ ocrProgress }}%
                    </div>
                  </div>
                  <p class="text-muted">
                    <i class="ti ti-scan me-1"></i>
                    Procesando factura con OCR... Por favor espera
                  </p>
                </div>

                <!-- Process Button -->
                <button v-if="uploadedImage && !processingOCR && !ocrProcessed" type="button" class="btn btn-primary w-100 mt-3" @click="processInvoiceOCR">
                  <i class="ti ti-scan me-2"></i>Procesar Factura
                </button>

                <!-- OCR Results -->
                <div v-if="ocrProcessed && ocrData" class="mt-3">
                  <div class="alert alert-success">
                    <i class="ti ti-check me-2"></i>Factura procesada exitosamente
                  </div>

                  <div v-if="ocrValidation && ocrValidation.warnings.length > 0" class="alert alert-warning">
                    <h6>Advertencias:</h6>
                    <ul class="mb-0">
                      <li v-for="(warning, index) in ocrValidation.warnings" :key="index">{{ warning }}</li>
                    </ul>
                    <p class="mb-0 mt-2"><small>Por favor verifica y completa los datos manualmente si es necesario.</small></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitForm">
            <div class="row">
              <!-- Supplier Information -->
              <div class="col-12">
                <h6 class="mb-3 fw-bold">Información del Proveedor</h6>
              </div>

              <div class="col-md-8">
                <div class="mb-3">
                  <label class="form-label">Nombre del Proveedor <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <select class="form-select" v-model="selectedSupplierId" @change="onSupplierChange" :disabled="supplierLoading">
                      <option value="">{{ supplierLoading ? 'Cargando proveedores...' : `-- Seleccionar Proveedor (${suppliers.length} disponibles) --` }}</option>
                      <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                        {{ supplier.nombre }}{{ supplier.doc_identificacion ? ' - RTN: ' + supplier.doc_identificacion : '' }}
                      </option>
                    </select>
                    <button type="button" class="btn btn-outline-primary" @click="showAddSupplierModal = true">
                      <i class="ti ti-plus"></i>
                    </button>
                  </div>
                  <small v-if="!selectedSupplierId" class="text-muted">
                    {{ supplierLoading ? 'Cargando...' : suppliers.length > 0 ? `${suppliers.length} proveedores disponibles` : '⚠️ No hay proveedores - Agrega uno nuevo' }}
                  </small>
                </div>
              </div>

              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label">RTN del Proveedor</label>
                  <input type="text" class="form-control" v-model="formData.supplier_id_number" readonly>
                </div>
              </div>

              <!-- Invoice Information -->
              <div class="col-12 mt-3">
                <h6 class="mb-3 fw-bold">Información de la Factura</h6>
              </div>

              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Número de Factura</label>
                  <input type="text" class="form-control" v-model="formData.invoice_number">
                </div>
              </div>

              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Fecha de Emisión <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" v-model="formData.purchase_date" :max="new Date().toISOString().split('T')[0]" required>
                  <small class="text-muted">Solo fechas de hoy o anteriores</small>
                </div>
              </div>

              <!-- Amounts -->
              <div class="col-12 mt-3">
                <h6 class="mb-3 fw-bold">Montos</h6>
              </div>

              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label">Subtotal <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text">L</span>
                    <input type="number" step="0.01" class="form-control" v-model.number="formData.net_amount" @input="calculateTotal" required>
                  </div>
                </div>
              </div>

              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label">ISV (15%)</label>
                  <div class="input-group">
                    <span class="input-group-text">L</span>
                    <input type="number" step="0.01" class="form-control" v-model.number="formData.tax_amount" @input="calculateTotal">
                  </div>
                </div>
              </div>

              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label">Descuento</label>
                  <div class="input-group">
                    <span class="input-group-text">L</span>
                    <input type="number" step="0.01" class="form-control" v-model.number="formData.discount_amount" @input="calculateTotal">
                  </div>
                  <small class="text-muted">Se resta del subtotal</small>
                </div>
              </div>

              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label">Recargo</label>
                  <div class="input-group">
                    <span class="input-group-text">L</span>
                    <input type="number" step="0.01" class="form-control" v-model.number="formData.surcharge_amount" @input="calculateTotal">
                  </div>
                  <small class="text-muted">Se suma al subtotal</small>
                </div>
              </div>

              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label fw-bold">Total <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-success text-white">L</span>
                    <input type="number" step="0.01" class="form-control fw-bold" v-model.number="formData.total_amount" @input="calculateFromTotal" required>
                  </div>
                  <small class="text-muted">Subtotal + ISV + Recargo - Descuento</small>
                </div>
              </div>

              <div class="col-md-12">
                <div class="mb-3">
                  <label class="form-label">Notas</label>
                  <textarea class="form-control" rows="2" v-model="formData.notes"></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-secondary" @click="close">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="ti ti-device-floppy me-2"></i>
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Supplier Modal -->
  <div class="modal fade" :class="{ show: showAddSupplierModal }" :style="{ display: showAddSupplierModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ti ti-user-plus me-2"></i>Agregar Nuevo Proveedor
          </h5>
          <button type="button" class="btn-close" @click="showAddSupplierModal = false"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveNewSupplier">
            <div class="mb-3">
              <label class="form-label">Nombre del Proveedor <span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="newSupplier.name" required>
            </div>
            <div class="mb-3">
              <label class="form-label">RTN</label>
              <input type="text" class="form-control" v-model="newSupplier.rtn">
            </div>
            <div class="mb-3">
              <label class="form-label">Teléfono</label>
              <input type="text" class="form-control" v-model="newSupplier.phone">
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="newSupplier.email">
            </div>
            <div class="mb-3">
              <label class="form-label">Dirección</label>
              <textarea class="form-control" rows="2" v-model="newSupplier.address"></textarea>
            </div>
            <div class="text-end">
              <button type="button" class="btn btn-secondary me-2" @click="showAddSupplierModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="savingSupplier">
                <span v-if="savingSupplier" class="spinner-border spinner-border-sm me-2"></span>
                {{ savingSupplier ? 'Guardando...' : 'Guardar Proveedor' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div v-if="isOpen || showAddSupplierModal" class="modal-backdrop fade show"></div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

// Configure axios interceptor to add token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default {
  name: 'PurchaseInvoiceModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    purchase: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      inputMode: 'manual', // 'manual' or 'scan'
      uploadedImage: null,
      uploadedFile: null,
      processingOCR: false,
      ocrProgress: 0,
      ocrProcessed: false,
      ocrData: null,
      ocrValidation: null,
      saving: false,
      cameraActive: false,
      videoStream: null,

      // Suppliers
      suppliers: [],
      selectedSupplierId: '',
      supplierLoading: false,
      showAddSupplierModal: false,
      savingSupplier: false,
      newSupplier: {
        name: '',
        rtn: '',
        phone: '',
        email: '',
        address: ''
      },

      formData: {
        supplier_name: '',
        supplier_id_number: '',
        invoice_number: '',
        purchase_date: new Date().toISOString().split('T')[0],
        net_amount: 0,
        tax_amount: 0,
        discount_amount: 0,
        surcharge_amount: 0,
        total_amount: 0,
        notes: '',
        document_type: 'FACTURA',
        status: 'Completed'
      },

      items: []
    };
  },
  mounted() {
    console.log('🎬 PurchaseInvoiceModal mounted! Loading suppliers immediately...');
    this.loadSuppliers();
  },
  watch: {
    isOpen(newVal) {
      console.log('🚪 Modal opened:', newVal);
      if (newVal) {
        console.log('📞 Calling loadSuppliers...');
        // Si NO hay purchase, resetear formulario inmediatamente
        if (!this.purchase) {
          this.resetForm();
        }
        // Cargar suppliers - cuando terminen de cargar, el watch de suppliers
        // llamará a loadPurchaseData() si es necesario
        this.loadSuppliers();
      } else {
        // Close camera if open
        if (this.cameraActive) {
          this.closeCamera();
        }
      }
    },
    suppliers(newVal) {
      console.log('🔄 Suppliers array changed:', newVal.length, 'suppliers', newVal);

      // AHORA SÍ: cuando los suppliers terminen de cargar, cargar los datos de compra
      if (this.purchase && newVal.length > 0) {
        console.log('📝 Suppliers cargados, ahora cargar datos de compra...');
        this.loadPurchaseData();
      }
    }
  },
  methods: {
    async loadSuppliers() {
      try {
        this.supplierLoading = true;
        const response = await axios.get('/api/v1/suppliers', {
          params: {
            limit: 10000 // Cargar todos los proveedores
          }
        });

        // Usar el MISMO patrón que en pos-invoice.vue para customers
        const suppliersData = response.data?.data || response.data || [];

        console.log('📊 Suppliers response:', {
          responseData: response.data,
          suppliersData: suppliersData,
          isArray: Array.isArray(suppliersData),
          length: Array.isArray(suppliersData) ? suppliersData.length : 0
        });

        if (Array.isArray(suppliersData)) {
          this.suppliers = suppliersData;
        } else {
          console.error('❌ suppliersData is not an array:', suppliersData);
          this.suppliers = [];
        }

        console.log('✅ Suppliers loaded:', {
          total: this.suppliers.length,
          suppliers: this.suppliers
        });

        if (this.suppliers.length === 0) {
          console.warn('⚠️ No suppliers found in database');
        }
      } catch (error) {
        console.error('❌ Error loading suppliers:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar proveedores',
          text: error.response?.data?.message || 'No se pudieron cargar los proveedores',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } finally {
        this.supplierLoading = false;
      }
    },

    onSupplierChange() {
      const supplier = this.suppliers.find(s => s.id == this.selectedSupplierId);
      if (supplier) {
        this.formData.supplier_name = supplier.nombre;
        this.formData.supplier_id_number = supplier.doc_identificacion || '';
      }
    },

    async saveNewSupplier() {
      try {
        this.savingSupplier = true;
        const response = await axios.post('/api/v1/suppliers', this.newSupplier);

        Swal.fire('Éxito', 'Proveedor agregado exitosamente', 'success');

        // Reload suppliers
        await this.loadSuppliers();

        // Select the new supplier
        const newSupplierId = response.data.data.id || response.data.data.supplier_id;
        this.selectedSupplierId = newSupplierId;
        this.onSupplierChange();

        // Close modal and reset
        this.showAddSupplierModal = false;
        this.newSupplier = { name: '', rtn: '', phone: '', email: '', address: '' };
      } catch (error) {
        console.error('Error saving supplier:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al guardar proveedor', 'error');
      } finally {
        this.savingSupplier = false;
      }
    },

    setInputMode(mode) {
      this.inputMode = mode;
      if (mode === 'manual') {
        this.clearImage();
        this.ocrProcessed = false;
        if (this.cameraActive) {
          this.closeCamera();
        }
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.processFile(file);
      }
    },

    handleFileDrop(event) {
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.processFile(file);
      }
    },

    processFile(file) {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire('Error', 'El archivo es demasiado grande. Máximo 10MB', 'error');
        return;
      }

      this.uploadedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    clearImage() {
      this.uploadedImage = null;
      this.uploadedFile = null;
      this.ocrProcessed = false;
      this.ocrProgress = 0;
      this.ocrData = null;
      this.ocrValidation = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    async openCamera() {
      try {
        this.cameraActive = true;
        this.videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Use back camera on mobile
        });

        this.$nextTick(() => {
          if (this.$refs.videoElement) {
            this.$refs.videoElement.srcObject = this.videoStream;
          }
        });
      } catch (error) {
        console.error('Error accessing camera:', error);
        Swal.fire('Error', 'No se pudo acceder a la cámara. Verifica los permisos.', 'error');
        this.cameraActive = false;
      }
    },

    closeCamera() {
      if (this.videoStream) {
        this.videoStream.getTracks().forEach(track => track.stop());
        this.videoStream = null;
      }
      this.cameraActive = false;
    },

    capturePhoto() {
      const video = this.$refs.videoElement;
      const canvas = this.$refs.canvasElement;

      if (video && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          // Create file from blob
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          this.processFile(file);
          this.closeCamera();
        }, 'image/jpeg', 0.95);
      }
    },

    async processInvoiceOCR() {
      if (!this.uploadedFile) {
        Swal.fire('Error', 'No se ha seleccionado ninguna imagen', 'error');
        return;
      }

      try {
        this.processingOCR = true;
        this.ocrProgress = 0;

        // Simulate progress while OCR is processing
        const progressInterval = setInterval(() => {
          if (this.ocrProgress < 90) {
            this.ocrProgress += Math.random() * 10;
            if (this.ocrProgress > 90) this.ocrProgress = 90;
          }
        }, 500);

        const formData = new FormData();
        formData.append('invoice', this.uploadedFile);

        const response = await axios.post('/api/v1/purchases/ocr/process', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Complete progress
        clearInterval(progressInterval);
        this.ocrProgress = 100;

        this.ocrData = response.data.data.data;
        this.ocrValidation = response.data.data.validation;
        this.ocrProcessed = true;

        // Fill form with OCR data
        if (this.ocrData) {
          this.formData.invoice_number = this.ocrData.invoice_number || '';
          this.formData.purchase_date = this.ocrData.invoice_date || new Date().toISOString().split('T')[0];
          this.formData.supplier_name = this.ocrData.supplier_name || '';
          this.formData.supplier_id_number = this.ocrData.supplier_id || '';
          this.formData.net_amount = this.ocrData.subtotal || 0;
          this.formData.tax_amount = this.ocrData.tax || 0;
          this.formData.discount_amount = this.ocrData.discount || 0;
          this.formData.total_amount = this.ocrData.total || 0;

          // Fill items if available
          if (this.ocrData.items && this.ocrData.items.length > 0) {
            this.items = this.ocrData.items.map(item => ({
              product_name: item.product_name || '',
              quantity: item.quantity || 1,
              unit_price: item.unit_price || 0,
              total: item.total || 0
            }));
          }

          // Auto-select supplier by RTN if found, otherwise show modal to create new one
          if (this.ocrData.supplier_id) {
            const supplierByRTN = this.suppliers.find(s =>
              s.doc_identificacion && s.doc_identificacion === this.ocrData.supplier_id
            );

            if (supplierByRTN) {
              // RTN found - auto-select the supplier
              this.selectedSupplierId = supplierByRTN.id;
              this.onSupplierChange();

              Swal.fire({
                icon: 'success',
                title: 'Proveedor detectado',
                text: `Proveedor "${supplierByRTN.nombre}" seleccionado automáticamente`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
              });
            } else {
              // RTN not found - offer to create new supplier
              this.newSupplier.name = this.ocrData.supplier_name || '';
              this.newSupplier.rtn = this.ocrData.supplier_id || '';

              Swal.fire({
                title: 'Proveedor no encontrado',
                html: `El RTN <strong>${this.ocrData.supplier_id}</strong> no está registrado en la base de datos.<br>¿Deseas agregar este proveedor?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, agregar proveedor',
                cancelButtonText: 'No, continuar sin agregar'
              }).then((result) => {
                if (result.isConfirmed) {
                  this.showAddSupplierModal = true;
                }
              });
            }
          }
        }

        Swal.fire('Éxito', 'Factura procesada. Verifica los datos extraídos.', 'success');
      } catch (error) {
        console.error('Error processing OCR:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al procesar la factura', 'error');
      } finally {
        this.processingOCR = false;
      }
    },

    calculateTotal() {
      const net = parseFloat(this.formData.net_amount) || 0;
      const tax = parseFloat(this.formData.tax_amount) || 0;
      const discount = parseFloat(this.formData.discount_amount) || 0;
      const surcharge = parseFloat(this.formData.surcharge_amount) || 0;
      // Total = Subtotal + ISV + Recargo - Descuento
      this.formData.total_amount = parseFloat((net + tax + surcharge - discount).toFixed(2));
    },

    calculateFromTotal() {
      // Calcula el subtotal e ISV cuando el usuario ingresa el total
      const total = parseFloat(this.formData.total_amount) || 0;

      // Total = Subtotal + ISV(15%)
      // Total = Subtotal + (Subtotal * 0.15)
      // Total = Subtotal * 1.15
      // Subtotal = Total / 1.15

      const subtotal = total / 1.15;
      const isv = subtotal * 0.15;

      this.formData.net_amount = parseFloat(subtotal.toFixed(2));
      this.formData.tax_amount = parseFloat(isv.toFixed(2));

      console.log('🧮 Calculado desde total:', {
        total: total,
        subtotal: this.formData.net_amount,
        isv: this.formData.tax_amount
      });
    },

    addItem() {
      this.items.push({
        product_name: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      });
    },

    removeItem(index) {
      this.items.splice(index, 1);
    },

    calculateItemTotal(index) {
      const item = this.items[index];
      item.total = (item.quantity || 0) * (item.unit_price || 0);
    },

    async submitForm() {
      // Validate supplier
      if (!this.selectedSupplierId && !this.formData.supplier_name) {
        Swal.fire('Error', 'Debes seleccionar un proveedor', 'error');
        return;
      }

      try {
        this.saving = true;

        // Get user ID from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id || user.userId || null;

        const data = {
          ...this.formData,
          supplier_id: this.selectedSupplierId || null,
          created_by: userId,
          items: this.items.filter(item => item.product_name && item.quantity > 0)
        };

        let response;
        if (this.purchase) {
          response = await axios.put(`/api/v1/purchases/${this.purchase.id}`, data);
        } else {
          response = await axios.post('/api/v1/purchases', data);
        }

        Swal.fire('Éxito', `Compra ${this.purchase ? 'actualizada' : 'creada'} exitosamente`, 'success');
        this.$emit('save', response.data.data);
        this.close();
      } catch (error) {
        console.error('Error saving purchase:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al guardar la compra', 'error');
      } finally {
        this.saving = false;
      }
    },

    loadPurchaseData() {
      if (this.purchase) {
        console.log('📝 Loading purchase data:', this.purchase);

        // Cargar datos del formulario
        this.formData = {
          supplier_name: this.purchase.supplier_name || '',
          supplier_id_number: this.purchase.supplier_id_number || '',
          invoice_number: this.purchase.invoice_number || '',
          purchase_date: this.purchase.purchase_date ? this.purchase.purchase_date.split('T')[0].split(' ')[0] : new Date().toISOString().split('T')[0],
          net_amount: parseFloat(this.purchase.net_amount) || 0,
          tax_amount: parseFloat(this.purchase.tax_amount) || 0,
          discount_amount: parseFloat(this.purchase.discount_amount) || 0,
          surcharge_amount: parseFloat(this.purchase.surcharge_amount) || 0,
          total_amount: parseFloat(this.purchase.total_amount) || 0,
          notes: this.purchase.notes || '',
          document_type: this.purchase.document_type || 'FACTURA',
          status: this.purchase.status || 'Completed'
        };

        // Buscar el proveedor por nombre en la lista de proveedores
        console.log('🔍 Buscando proveedor:', this.purchase.supplier_name);
        console.log('📋 Proveedores disponibles:', this.suppliers.length);

        const supplier = this.suppliers.find(s => s.nombre === this.purchase.supplier_name);
        if (supplier) {
          console.log('✅ Proveedor encontrado:', supplier);
          this.selectedSupplierId = supplier.id;
        } else {
          console.warn('⚠️ Proveedor no encontrado en la lista:', this.purchase.supplier_name);
          this.selectedSupplierId = '';
        }

        this.items = this.purchase.items || [];

        console.log('✅ Purchase data loaded. Selected supplier ID:', this.selectedSupplierId);
      }
    },

    resetForm() {
      this.inputMode = 'manual';
      this.selectedSupplierId = '';
      this.formData = {
        supplier_name: '',
        supplier_id_number: '',
        invoice_number: '',
        purchase_date: new Date().toISOString().split('T')[0],
        net_amount: 0,
        tax_amount: 0,
        discount_amount: 0,
        surcharge_amount: 0,
        total_amount: 0,
        notes: '',
        document_type: 'FACTURA',
        status: 'Completed'
      };
      this.items = [];
      this.clearImage();
    },

    close() {
      if (this.cameraActive) {
        this.closeCamera();
      }
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #0d6efd;
  background-color: #f8f9fa;
}

.upload-placeholder i {
  font-size: 48px;
}

.upload-preview img {
  max-height: 400px;
  border-radius: 8px;
}

.fs-48 {
  font-size: 48px;
}

.camera-container video {
  max-height: 400px;
  background-color: #000;
}

.camera-controls {
  margin-top: 10px;
}
</style>
