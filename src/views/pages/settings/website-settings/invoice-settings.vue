<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content settings-content">
      <div class="page-header settings-pg-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Settings</h4>
            <h6>Manage your settings on portal</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh"
              ><i class="ti ti-refresh"></i
            ></a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Collapse" id="collapse-header" @click="toggleHeader"><i class="ti ti-chevron-up"></i></a>
          </li>
        </ul>
      </div>
      <div class="row">
        <div class="col-xl-12">
          <div class="settings-wrapper d-flex">
            <settings-sidebar></settings-sidebar>
            <div class="card flex-fill mb-0">
              <div class="card-header">
                <h4 class="fs-18 fw-bold">Ajustes de Factura</h4>
              </div>
              <div class="card-body">
                <form @submit.prevent="submitForm">
                  <!-- Company Information -->
                  <div class="border-bottom mb-3">
                    <div class="card-title-head">
                      <h6 class="fs-16 fw-bold mb-2">
                        <span class="fs-16 me-2"><i class="ti ti-building"></i></span>
                        Información de la Empresa
                      </h6>
                    </div>
                    <div class="row">
                      <div class="col-xl-6 col-lg-6 col-md-6">
                        <div class="mb-3">
                          <label class="form-label">
                            Razón Social <span class="text-danger">*</span>
                          </label>
                          <input type="text" class="form-control" v-model="settings.company_name" required />
                        </div>
                      </div>
                      <div class="col-xl-6 col-lg-6 col-md-6">
                        <div class="mb-3">
                          <label class="form-label">Nombre Comercial</label>
                          <input type="text" class="form-control" v-model="settings.commercial_name" />
                        </div>
                      </div>
                      <div class="col-md-12">
                        <div class="mb-3">
                          <label class="form-label">RTN</label>
                          <input type="text" class="form-control" v-model="settings.company_rtn" maxlength="14" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Location -->
                  <div class="border-bottom mb-3 pb-3">
                    <div class="card-title-head">
                      <h6 class="fs-16 fw-bold mb-2">
                        <span class="fs-16 me-2"><i class="ti ti-map-pin"></i></span>
                        Localización
                      </h6>
                    </div>
                    <div class="row">
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">País</label>
                          <vue-select
                            :options="countries"
                            v-model="settings.country"
                            placeholder="Seleccionar"
                          />
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">Estado</label>
                          <input type="text" class="form-control" v-model="settings.state" />
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">Ciudad</label>
                          <input type="text" class="form-control" v-model="settings.city" />
                        </div>
                      </div>
                      <div class="col-md-12">
                        <div class="mb-3">
                          <label class="form-label">Dirección</label>
                          <textarea class="form-control" v-model="settings.company_address" rows="2"></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Contact Information -->
                  <div class="border-bottom mb-3">
                    <div class="card-title-head">
                      <h6 class="fs-16 fw-bold mb-2">
                        <span class="fs-16 me-2"><i class="ti ti-phone"></i></span>
                        Información de Contacto
                      </h6>
                    </div>
                    <div class="row">
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">Facebook</label>
                          <input type="text" class="form-control" v-model="settings.facebook" placeholder="Ceramicasuniversalhn.com" />
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">Instagram</label>
                          <input type="text" class="form-control" v-model="settings.instagram" placeholder="Ceramicasuniversalhn.com" />
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">X (Twitter)</label>
                          <input type="text" class="form-control" v-model="settings.twitter" placeholder="Ceramicasuniversalhn" />
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">
                            Email <span class="text-danger">*</span>
                          </label>
                          <input type="email" class="form-control" v-model="settings.company_email" required />
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">Teléfono</label>
                          <input type="tel" class="form-control" v-model="settings.company_phone" placeholder="+504 2440-0037" />
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">Teléfono Móvil (WhatsApp)</label>
                          <input type="tel" class="form-control" v-model="settings.whatsapp" placeholder="+504 9875-2725" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Regional Settings -->
                  <div class="border-bottom mb-3 pb-3">
                    <div class="card-title-head">
                      <h6 class="fs-16 fw-bold mb-2">
                        <span class="fs-16 me-2"><i class="ti ti-clock"></i></span>
                        Configuración Regional
                      </h6>
                    </div>
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label">Timezone</label>
                          <p class="text-muted small">Select Time zone in website</p>
                          <vue-select
                            :options="timezones"
                            v-model="settings.timezone"
                            placeholder="Seleccionar timezone"
                          />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label">Date format</label>
                          <p class="text-muted small">Select date format to display in website</p>
                          <vue-select
                            :options="dateFormats"
                            v-model="settings.date_format"
                            placeholder="Seleccionar formato"
                          />
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">Time Format</label>
                          <p class="text-muted small">Select time format to display in website</p>
                          <vue-select
                            :options="timeFormats"
                            v-model="settings.time_format"
                            placeholder="Seleccionar"
                          />
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">Financial Year</label>
                          <p class="text-muted small">Select year for finance</p>
                          <input type="number" class="form-control" v-model.number="settings.financial_year" min="2020" max="2030" />
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">Starting Month</label>
                          <p class="text-muted small">Select starting month to display</p>
                          <vue-select
                            :options="months"
                            v-model="settings.starting_month"
                            placeholder="Seleccionar"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Company Logo -->
                  <div class="border-bottom mb-3 pb-3">
                    <div class="card-title-head">
                      <h6 class="fs-16 fw-bold mb-2">
                        <span class="fs-16 me-2"><i class="ti ti-photo"></i></span>
                        Logo de la Empresa
                      </h6>
                    </div>
                    <div class="row align-items-center gy-3">
                      <div class="col-xl-9">
                        <div class="row gy-3 align-items-center">
                          <div class="col-lg-4">
                            <div class="logo-info">
                              <h6 class="fw-medium">Logo de la Empresa</h6>
                              <p>Sube el logo de tu empresa</p>
                            </div>
                          </div>
                          <div class="col-lg-8">
                            <div class="profile-pic-upload mb-0 justify-content-lg-end">
                              <div class="new-employee-field">
                                <div class="mb-0">
                                  <div class="image-upload mb-0">
                                    <input type="file" @change="handleLogoUpload" accept="image/*" />
                                    <div class="image-uploads">
                                      <h4>
                                        <i class="ti ti-upload me-1"></i>Subir Imagen
                                      </h4>
                                    </div>
                                  </div>
                                  <span class="mt-1">Tamaño recomendado 450px x 450px. Max 5mb.</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-xl-3">
                        <div class="new-logo ms-xl-auto">
                          <a href="#" v-if="settings.company_logo_path">
                            <img :src="settings.company_logo_path" alt="Logo" />
                            <span @click.prevent="removeLogo"><i class="ti ti-x"></i></span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Footer Text -->
                  <div class="company-address">
                    <div class="card-title-head">
                      <h6 class="fs-16 fw-bold mb-2">
                        <span class="fs-16 me-2"><i class="ti ti-file-text"></i></span>
                        Texto del Pie de Página
                      </h6>
                    </div>
                    <div class="row">
                      <div class="col-md-12">
                        <div class="mb-3">
                          <label class="form-label">Texto del Pie de Página</label>
                          <textarea class="form-control" v-model="settings.invoice_footer_text" rows="3" placeholder="Original: Cliente/Copia: Obligado Tributario Emisor. ¡La Factura es beneficio de todos Exíjala!"></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="text-end">
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="customizer-links" id="setdata">
      <ul class="sticky-sidebar">
        <li class="sidebar-icons">
          <a
            href="#"
            class="navigation-add"
            data-bs-toggle="tooltip"
            data-bs-placement="left"
            data-bs-original-title="Theme"
          >
            <i class="ti ti-brightness-up"></i>
          </a>
        </li>
        <li class="sidebar-icons">
          <a
            href="#"
            data-bs-toggle="tooltip"
            data-bs-placement="left"
            data-bs-original-title="Settings"
          >
            <i class="ti ti-settings"></i>
          </a>
        </li>
      </ul>
    </div>
    <div class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
      <p class="mb-0 text-gray-9">
        {{ new Date().getFullYear() }} &copy; ProsperPOS. Todos los derechos reservados
      </p>
      <p>
        Diseñado &amp Desarrollado Por
        <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a>
      </p>
    </div>
  </div>
</template>

<script>
import api from '@/api/config';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      loading: false,
      settings: {
        company_name: 'CERAMICAS TERRAZOS Y PULIDOS UNIVERSAL',
        commercial_name: 'Ceramicas Terrazos y Pulidos Universal',
        company_rtn: '01061977002516',
        company_address: 'Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico. La Ceiba, Atlántida',
        company_phone: '+504 2440-0037',
        company_email: 'mauricio_argenal@hotmail.com',
        facebook: 'Ceramicasuniversalhn.com',
        instagram: 'Ceramicasuniversalhn.com',
        twitter: 'Ceramicasuniversalhn',
        whatsapp: '+504 9875-2725',
        country: 'Honduras',
        state: 'Atlántida',
        city: 'La Ceiba',
        invoice_footer_text: 'Original: Cliente/Copia: Obligado Tributario Emisor. ¡La Factura es beneficio de todos Exíjala!',
        company_logo_path: '/img/logo_ceramicasuniversal.png',
        timezone: 'America/Tegucigalpa',
        date_format: 'DD/MM/YYYY',
        time_format: '12',
        financial_year: 2025,
        starting_month: 1
      },
      countries: [
        { label: "Honduras", value: "Honduras" },
        { label: "Guatemala", value: "Guatemala" },
        { label: "El Salvador", value: "El Salvador" },
        { label: "Nicaragua", value: "Nicaragua" },
        { label: "Costa Rica", value: "Costa Rica" }
      ],
      timezones: [
        { label: "UTC -6:00 (America/Tegucigalpa)", value: "America/Tegucigalpa" },
        { label: "UTC -5:00 (America/New_York)", value: "America/New_York" },
        { label: "UTC -6:00 (America/Chicago)", value: "America/Chicago" },
        { label: "UTC -7:00 (America/Denver)", value: "America/Denver" },
        { label: "UTC -8:00 (America/Los_Angeles)", value: "America/Los_Angeles" }
      ],
      dateFormats: [
        { label: "Jul 22 2025", value: "MMM DD YYYY" },
        { label: "22/07/2025", value: "DD/MM/YYYY" },
        { label: "07/22/2025", value: "MM/DD/YYYY" },
        { label: "2025-07-22", value: "YYYY-MM-DD" }
      ],
      timeFormats: [
        { label: "12 Hours", value: "12" },
        { label: "24 Hours", value: "24" }
      ],
      months: [
        { label: "Enero", value: 1 },
        { label: "Febrero", value: 2 },
        { label: "Marzo", value: 3 },
        { label: "Abril", value: 4 },
        { label: "May", value: 5 },
        { label: "June", value: 6 },
        { label: "July", value: 7 },
        { label: "August", value: 8 },
        { label: "September", value: 9 },
        { label: "October", value: 10 },
        { label: "Noviembre", value: 11 },
        { label: "Diciembre", value: 12 }
      ]
    };
  },
  mounted() {
    this.loadSettings();
  },
  methods: {
    async loadSettings() {
      this.loading = true;
      try {
        const response = await api.get('/billing/settings');
        if (response.data && response.data.data) {
          // Merge con los datos por defecto para mantener valores si algo falla
          this.settings = { ...this.settings, ...response.data.data };
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // No mostrar error, usar datos por defecto
      } finally {
        this.loading = false;
      }
    },
    async submitForm() {
      this.loading = true;
      try {
        await api.put('/billing/settings', this.settings);
        Swal.fire('¡Éxito!', 'Configuración guardada correctamente', 'success');
      } catch (error) {
        console.error('Error saving settings:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al guardar la configuración', 'error');
      } finally {
        this.loading = false;
      }
    },
    handleLogoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.settings.company_logo_path = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    removeLogo() {
      this.settings.company_logo_path = '';
    },
    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    }
  }
};
</script>
