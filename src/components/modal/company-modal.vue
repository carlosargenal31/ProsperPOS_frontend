<template>
  <!-- Add Company -->
  <div class="modal fade" id="add-company">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">{{ isEdit ? 'Editar Empresa' : 'Nueva Empresa' }}</h4>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <!-- Tabs -->
            <ul class="nav nav-tabs mb-3" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link active"
                  id="company-info-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#company-info"
                  type="button"
                  role="tab"
                >
                  INFORMACIÓN GENERAL
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  id="company-location-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#company-location"
                  type="button"
                  role="tab"
                >
                  UBICACIÓN
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  id="company-social-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#company-social"
                  type="button"
                  role="tab"
                >
                  REDES SOCIALES
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  id="company-regional-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#company-regional"
                  type="button"
                  role="tab"
                >
                  CONFIGURACIÓN REGIONAL
                </button>
              </li>
            </ul>

            <!-- Tab Content -->
            <div class="tab-content">
              <!-- INFORMACIÓN GENERAL -->
              <div class="tab-pane fade show active" id="company-info" role="tabpanel">
                <div class="row">
                  <!-- Nombre -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Nombre de la Empresa <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.name"
                      placeholder="CERAMICAS TERRAZOS Y PULIDOS UNIVERSAL"
                      required
                    />
                  </div>

                  <!-- Nombre Comercial -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Nombre Comercial</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.commercial_name"
                      placeholder="Ceramicas Universal"
                    />
                  </div>

                  <!-- RTN -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">RTN/NIT</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.rtn"
                      placeholder="01061977002516"
                    />
                  </div>

                  <!-- Teléfono -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Teléfono</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.phone"
                      placeholder="+504 2440-0037"
                    />
                  </div>

                  <!-- Email -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      v-model="formData.email"
                      placeholder="contacto@empresa.com"
                    />
                  </div>

                  <!-- Sitio Web -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Sitio Web</label>
                    <input
                      type="url"
                      class="form-control"
                      v-model="formData.website"
                      placeholder="https://www.empresa.com"
                    />
                  </div>

                  <!-- Dirección -->
                  <div class="col-lg-12 mb-3">
                    <label class="form-label">Dirección</label>
                    <textarea
                      class="form-control"
                      v-model="formData.address"
                      rows="2"
                      placeholder="Dirección completa de la empresa"
                    ></textarea>
                  </div>

                  <!-- Logo -->
                  <div class="col-lg-12 mb-3">
                    <label class="form-label">Logo de la Empresa</label>
                    <div class="d-flex align-items-center gap-3">
                      <div v-if="formData.logo_url" class="border p-2 rounded">
                        <img :src="formData.logo_url" alt="Logo" style="max-width: 100px; max-height: 100px;" />
                      </div>
                      <div class="flex-grow-1">
                        <input
                          type="file"
                          class="form-control"
                          @change="handleLogoUpload"
                          accept="image/*"
                        />
                        <small class="text-muted">Tamaño recomendado: 450px x 450px. Máximo 5MB</small>
                      </div>
                      <button
                        v-if="formData.logo_url"
                        type="button"
                        class="btn btn-danger"
                        @click="removeLogo"
                      >
                        <i class="ti ti-trash"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Estado Activo -->
                  <div class="col-lg-12 mb-3">
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="company-is-active"
                        v-model="formData.is_active"
                      />
                      <label class="form-check-label" for="company-is-active">
                        Empresa Activa
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- UBICACIÓN -->
              <div class="tab-pane fade" id="company-location" role="tabpanel">
                <div class="row">
                  <!-- País -->
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">País</label>
                    <select class="form-control" v-model="formData.country">
                      <option value="Honduras">Honduras</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="El Salvador">El Salvador</option>
                      <option value="Nicaragua">Nicaragua</option>
                      <option value="Costa Rica">Costa Rica</option>
                    </select>
                  </div>

                  <!-- Estado/Departamento -->
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">Estado/Departamento</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.state"
                      placeholder="Atlántida"
                    />
                  </div>

                  <!-- Ciudad -->
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">Ciudad</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.city"
                      placeholder="La Ceiba"
                    />
                  </div>
                </div>
              </div>

              <!-- REDES SOCIALES -->
              <div class="tab-pane fade" id="company-social" role="tabpanel">
                <div class="row">
                  <!-- Facebook -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Facebook</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="ti ti-brand-facebook"></i></span>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.facebook"
                        placeholder="https://facebook.com/empresa"
                      />
                    </div>
                  </div>

                  <!-- Instagram -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Instagram</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="ti ti-brand-instagram"></i></span>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.instagram"
                        placeholder="https://instagram.com/empresa"
                      />
                    </div>
                  </div>

                  <!-- TikTok -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">TikTok</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="ti ti-brand-tiktok"></i></span>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.tiktok"
                        placeholder="https://tiktok.com/@empresa"
                      />
                    </div>
                  </div>

                  <!-- WhatsApp -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">WhatsApp</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="ti ti-brand-whatsapp"></i></span>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.whatsapp"
                        placeholder="+504 9875-2725"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- CONFIGURACIÓN REGIONAL -->
              <div class="tab-pane fade" id="company-regional" role="tabpanel">
                <div class="row">
                  <!-- Timezone -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Zona Horaria</label>
                    <select class="form-control" v-model="formData.timezone">
                      <option value="America/Tegucigalpa">UTC -6:00 (America/Tegucigalpa)</option>
                      <option value="America/New_York">UTC -5:00 (America/New_York)</option>
                      <option value="America/Chicago">UTC -6:00 (America/Chicago)</option>
                      <option value="America/Denver">UTC -7:00 (America/Denver)</option>
                      <option value="America/Los_Angeles">UTC -8:00 (America/Los_Angeles)</option>
                    </select>
                  </div>

                  <!-- Date Format -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Formato de Fecha</label>
                    <select class="form-control" v-model="formData.date_format">
                      <option value="DD/MM/YYYY">DD/MM/YYYY (22/07/2025)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (07/22/2025)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2025-07-22)</option>
                      <option value="MMM DD YYYY">MMM DD YYYY (Jul 22 2025)</option>
                    </select>
                  </div>

                  <!-- Time Format -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Formato de Hora</label>
                    <select class="form-control" v-model="formData.time_format">
                      <option value="12">12 Horas</option>
                      <option value="24">24 Horas</option>
                    </select>
                  </div>

                  <!-- Financial Year -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Año Fiscal</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="formData.financial_year"
                      :min="2020"
                      :max="2030"
                    />
                  </div>

                  <!-- Starting Month -->
                  <div class="col-lg-12 mb-3">
                    <label class="form-label">Mes de Inicio del Año Fiscal</label>
                    <select class="form-control" v-model.number="formData.starting_month">
                      <option :value="1">Enero</option>
                      <option :value="2">Febrero</option>
                      <option :value="3">Marzo</option>
                      <option :value="4">Abril</option>
                      <option :value="5">Mayo</option>
                      <option :value="6">Junio</option>
                      <option :value="7">Julio</option>
                      <option :value="8">Agosto</option>
                      <option :value="9">Septiembre</option>
                      <option :value="10">Octubre</option>
                      <option :value="11">Noviembre</option>
                      <option :value="12">Diciembre</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEdit ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Edit Company (mismo modal pero con id diferente) -->
  <div class="modal fade" id="edit-company">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Editar Empresa</h4>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <!-- Mismo contenido que el modal de agregar -->
            <ul class="nav nav-tabs mb-3" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link active"
                  id="edit-company-info-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#edit-company-info"
                  type="button"
                  role="tab"
                >
                  INFORMACIÓN GENERAL
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  id="edit-company-location-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#edit-company-location"
                  type="button"
                  role="tab"
                >
                  UBICACIÓN
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  id="edit-company-social-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#edit-company-social"
                  type="button"
                  role="tab"
                >
                  REDES SOCIALES
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  id="edit-company-regional-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#edit-company-regional"
                  type="button"
                  role="tab"
                >
                  CONFIGURACIÓN REGIONAL
                </button>
              </li>
            </ul>

            <div class="tab-content">
              <!-- INFORMACIÓN GENERAL -->
              <div class="tab-pane fade show active" id="edit-company-info" role="tabpanel">
                <div class="row">
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Nombre de la Empresa <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.name"
                      required
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Nombre Comercial</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.commercial_name"
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">RTN/NIT</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.rtn"
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Teléfono</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.phone"
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      v-model="formData.email"
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Sitio Web</label>
                    <input
                      type="url"
                      class="form-control"
                      v-model="formData.website"
                    />
                  </div>
                  <div class="col-lg-12 mb-3">
                    <label class="form-label">Dirección</label>
                    <textarea
                      class="form-control"
                      v-model="formData.address"
                      rows="2"
                    ></textarea>
                  </div>
                  <div class="col-lg-12 mb-3">
                    <label class="form-label">Logo de la Empresa</label>
                    <div class="d-flex align-items-center gap-3">
                      <div v-if="formData.logo_url" class="border p-2 rounded">
                        <img :src="formData.logo_url" alt="Logo" style="max-width: 100px; max-height: 100px;" />
                      </div>
                      <div class="flex-grow-1">
                        <input
                          type="file"
                          class="form-control"
                          @change="handleLogoUpload"
                          accept="image/*"
                        />
                        <small class="text-muted">Tamaño recomendado: 450px x 450px. Máximo 5MB</small>
                      </div>
                      <button
                        v-if="formData.logo_url"
                        type="button"
                        class="btn btn-danger"
                        @click="removeLogo"
                      >
                        <i class="ti ti-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-lg-12 mb-3">
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="edit-company-is-active"
                        v-model="formData.is_active"
                      />
                      <label class="form-check-label" for="edit-company-is-active">
                        Empresa Activa
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- UBICACIÓN -->
              <div class="tab-pane fade" id="edit-company-location" role="tabpanel">
                <div class="row">
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">País</label>
                    <select class="form-control" v-model="formData.country">
                      <option value="Honduras">Honduras</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="El Salvador">El Salvador</option>
                      <option value="Nicaragua">Nicaragua</option>
                      <option value="Costa Rica">Costa Rica</option>
                    </select>
                  </div>
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">Estado/Departamento</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.state"
                    />
                  </div>
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">Ciudad</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.city"
                    />
                  </div>
                </div>
              </div>

              <!-- REDES SOCIALES -->
              <div class="tab-pane fade" id="edit-company-social" role="tabpanel">
                <div class="row">
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Facebook</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="ti ti-brand-facebook"></i></span>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.facebook"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Instagram</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="ti ti-brand-instagram"></i></span>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.instagram"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">TikTok</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="ti ti-brand-tiktok"></i></span>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.tiktok"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">WhatsApp</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="ti ti-brand-whatsapp"></i></span>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.whatsapp"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- CONFIGURACIÓN REGIONAL -->
              <div class="tab-pane fade" id="edit-company-regional" role="tabpanel">
                <div class="row">
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Zona Horaria</label>
                    <select class="form-control" v-model="formData.timezone">
                      <option value="America/Tegucigalpa">UTC -6:00 (America/Tegucigalpa)</option>
                      <option value="America/New_York">UTC -5:00 (America/New_York)</option>
                      <option value="America/Chicago">UTC -6:00 (America/Chicago)</option>
                      <option value="America/Denver">UTC -7:00 (America/Denver)</option>
                      <option value="America/Los_Angeles">UTC -8:00 (America/Los_Angeles)</option>
                    </select>
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Formato de Fecha</label>
                    <select class="form-control" v-model="formData.date_format">
                      <option value="DD/MM/YYYY">DD/MM/YYYY (22/07/2025)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (07/22/2025)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2025-07-22)</option>
                      <option value="MMM DD YYYY">MMM DD YYYY (Jul 22 2025)</option>
                    </select>
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Formato de Hora</label>
                    <select class="form-control" v-model="formData.time_format">
                      <option value="12">12 Horas</option>
                      <option value="24">24 Horas</option>
                    </select>
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Año Fiscal</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="formData.financial_year"
                      :min="2020"
                      :max="2030"
                    />
                  </div>
                  <div class="col-lg-12 mb-3">
                    <label class="form-label">Mes de Inicio del Año Fiscal</label>
                    <select class="form-control" v-model.number="formData.starting_month">
                      <option :value="1">Enero</option>
                      <option :value="2">Febrero</option>
                      <option :value="3">Marzo</option>
                      <option :value="4">Abril</option>
                      <option :value="5">Mayo</option>
                      <option :value="6">Junio</option>
                      <option :value="7">Julio</option>
                      <option :value="8">Agosto</option>
                      <option :value="9">Septiembre</option>
                      <option :value="10">Octubre</option>
                      <option :value="11">Noviembre</option>
                      <option :value="12">Diciembre</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- View Company -->
  <div class="modal fade" id="view-company">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Detalles de la Empresa</h4>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="row" v-if="company">
            <div class="col-12 text-center mb-3" v-if="company.logo_url">
              <img :src="company.logo_url" alt="Logo" style="max-width: 150px; max-height: 150px;" />
            </div>
            <div class="col-lg-6 mb-2">
              <strong>Nombre:</strong> {{ company.name }}
            </div>
            <div class="col-lg-6 mb-2">
              <strong>Nombre Comercial:</strong> {{ company.commercial_name || 'N/A' }}
            </div>
            <div class="col-lg-6 mb-2">
              <strong>RTN:</strong> {{ company.rtn || 'N/A' }}
            </div>
            <div class="col-lg-6 mb-2">
              <strong>Teléfono:</strong> {{ company.phone || 'N/A' }}
            </div>
            <div class="col-lg-6 mb-2">
              <strong>Email:</strong> {{ company.email || 'N/A' }}
            </div>
            <div class="col-lg-6 mb-2">
              <strong>Sitio Web:</strong> <a :href="company.website" target="_blank">{{ company.website || 'N/A' }}</a>
            </div>
            <div class="col-12 mb-2">
              <strong>Dirección:</strong> {{ company.address || 'N/A' }}
            </div>
            <div class="col-lg-4 mb-2">
              <strong>País:</strong> {{ company.country }}
            </div>
            <div class="col-lg-4 mb-2">
              <strong>Estado:</strong> {{ company.state || 'N/A' }}
            </div>
            <div class="col-lg-4 mb-2">
              <strong>Ciudad:</strong> {{ company.city || 'N/A' }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Modal -->
  <div class="modal fade" id="delete-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Eliminar Empresa</h4>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p>¿Está seguro que desea eliminar la empresa <strong>{{ company?.name }}</strong>?</p>
          <p class="text-danger"><small>Esta acción no se puede deshacer.</small></p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-danger" @click="deleteCompany" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/config';
import Swal from 'sweetalert2';

export default {
  props: {
    company: Object,
    isEdit: Boolean
  },
  data() {
    return {
      formData: {
        name: '',
        commercial_name: '',
        rtn: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        country: 'Honduras',
        state: '',
        city: '',
        facebook: '',
        instagram: '',
        whatsapp: '',
        tiktok: '',
        logo_url: '',
        timezone: 'America/Tegucigalpa',
        date_format: 'DD/MM/YYYY',
        time_format: '12',
        financial_year: new Date().getFullYear(),
        starting_month: 1,
        is_active: true
      },
      loading: false
    };
  },
  watch: {
    company: {
      handler(newCompany) {
        if (newCompany) {
          this.formData = { ...newCompany };
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async handleLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        Swal.fire('Error', 'Por favor seleccione un archivo de imagen válido', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'La imagen no debe superar los 5MB', 'error');
        return;
      }

      this.loading = true;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'companylogos');

        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        this.formData.logo_url = response.data.data.url;
        Swal.fire('¡Éxito!', 'Logo subido correctamente', 'success');
      } catch (error) {
        console.error('Error uploading logo:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al subir el logo', 'error');
      } finally {
        this.loading = false;
      }
    },
    removeLogo() {
      Swal.fire({
        title: '¿Eliminar logo?',
        text: 'Se eliminará el logo de la empresa',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.formData.logo_url = '';
        }
      });
    },
    async submitForm() {
      this.loading = true;

      try {
        if (this.isEdit) {
          await api.put(`/companies/${this.formData.id}`, this.formData);
          Swal.fire('¡Éxito!', 'Empresa actualizada correctamente', 'success');
        } else {
          await api.post('/companies', this.formData);
          Swal.fire('¡Éxito!', 'Empresa creada correctamente', 'success');
        }

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById(this.isEdit ? 'edit-company' : 'add-company')
        );
        if (modal) modal.hide();

        this.$emit('company-saved');
      } catch (error) {
        console.error('Error saving company:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al guardar la empresa', 'error');
      } finally {
        this.loading = false;
      }
    },
    async deleteCompany() {
      this.loading = true;

      try {
        await api.delete(`/companies/${this.company.id}`);

        const modal = bootstrap.Modal.getInstance(document.getElementById('delete-modal'));
        if (modal) modal.hide();

        Swal.fire('¡Eliminada!', 'La empresa ha sido eliminada', 'success');
        this.$emit('company-deleted');
      } catch (error) {
        console.error('Error deleting company:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al eliminar la empresa', 'error');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
