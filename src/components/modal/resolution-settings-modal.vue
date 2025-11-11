<template>
  <!-- Add Resolution -->
  <div class="modal fade" id="add-resolution">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Registro de Resoluciones</h4>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <form @submit.prevent="submitAddForm">
          <div class="modal-body">
            <!-- Tabs -->
            <ul class="nav nav-tabs mb-3" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link active"
                  id="add-datos-generales-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#add-datos-generales"
                  type="button"
                  role="tab"
                >
                  DATOS GENERALES
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  id="add-consecutivos-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#add-consecutivos"
                  type="button"
                  role="tab"
                >
                  CONSECUTIVOS
                </button>
              </li>
            </ul>

            <!-- Tab Content -->
            <div class="tab-content">
              <!-- DATOS GENERALES -->
              <div class="tab-pane fade show active" id="add-datos-generales" role="tabpanel">
                <div class="row">
                  <!-- Número de Resolución -->
                  <div class="col-lg-12 mb-3">
                    <label class="form-label">No. Resolución</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.numero_resolucion"
                        placeholder="2A9170-F8828A-8815E0-63BE03-090956-9D"
                        required
                      />
                      <button class="btn btn-primary" type="button">
                        <i class="ti ti-search"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Fecha Inicio y Fin -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Fecha Inicio</label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="formData.fecha_inicio"
                      required
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Fecha Venc.</label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="formData.fecha_fin"
                      required
                    />
                  </div>

                  <!-- Notas -->
                  <div class="col-lg-12 mb-3">
                    <label class="form-label">Notas</label>
                    <textarea
                      class="form-control"
                      v-model="formData.notas"
                      rows="3"
                      placeholder="Notas"
                    ></textarea>
                  </div>

                  <!-- Estado Activo -->
                  <div class="col-lg-12 mb-3">
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="add-is-active"
                        v-model="formData.is_active"
                        :true-value="1"
                        :false-value="0"
                      />
                      <label class="form-check-label" for="add-is-active">
                        Resolución Activa
                      </label>
                    </div>
                  </div>

                  <!-- Alertas -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Nro. Crítico</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="formData.nro_critico"
                      min="0"
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Alertar Días Antes de Venc.</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="formData.alertar_dias_antes"
                      value="6"
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label d-flex align-items-center">
                      Alertar Porcentaje de Uso
                      <span class="ms-2 text-danger">
                        <i class="ti ti-info-circle"></i>
                      </span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text">%</span>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="formData.alertar_porcentaje_uso"
                        value="99"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Alertar En Nro. Control</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="formData.alertar_en_nro_control"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <!-- CONSECUTIVOS -->
              <div class="tab-pane fade" id="add-consecutivos" role="tabpanel">
                <div class="row">
                  <!-- Controles -->
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">Nro. Inicial Control</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="formData.nro_inicial_control"
                      placeholder="00030001"
                    />
                  </div>
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">Nro. Final Control</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="formData.nro_final_control"
                      placeholder="00040000"
                    />
                  </div>
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">Nro. Actual Control</label>
                    <div class="input-group">
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="formData.nro_actual_control"
                        placeholder="31823"
                      />
                      <button class="btn btn-primary" type="button">
                        <i class="ti ti-search"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Prefijos -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Prefijo # Control</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.prefijo_control"
                      placeholder="000"
                      maxlength="10"
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Sufijo # Control</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.sufijo_control"
                      placeholder="002-01"
                      maxlength="10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              CERRAR
            </button>
            <button type="button" class="btn btn-danger" @click="resetForm">
              ELIMINAR
            </button>
            <button type="submit" class="btn btn-success" :disabled="isSubmitting">
              <span v-if="isSubmitting">GUARDANDO...</span>
              <span v-else>GUARDAR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- /Add Resolution -->

  <!-- Edit Resolution -->
  <div class="modal fade" id="edit-resolution">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Registro de Resoluciones</h4>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <form @submit.prevent="submitEditForm">
          <div class="modal-body">
            <!-- Tabs -->
            <ul class="nav nav-tabs mb-3" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link active"
                  id="edit-datos-generales-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#edit-datos-generales"
                  type="button"
                  role="tab"
                >
                  DATOS GENERALES
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  id="edit-consecutivos-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#edit-consecutivos"
                  type="button"
                  role="tab"
                >
                  CONSECUTIVOS
                </button>
              </li>
            </ul>

            <!-- Tab Content -->
            <div class="tab-content">
              <!-- DATOS GENERALES -->
              <div class="tab-pane fade show active" id="edit-datos-generales" role="tabpanel">
                <div class="row">
                  <!-- Número de Resolución -->
                  <div class="col-lg-12 mb-3">
                    <label class="form-label">No. Resolución</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        v-model="editFormData.numero_resolucion"
                        required
                      />
                      <button class="btn btn-primary" type="button">
                        <i class="ti ti-search"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Fecha Inicio y Fin -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Fecha Inicio</label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="editFormData.fecha_inicio"
                      required
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Fecha Venc.</label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="editFormData.fecha_fin"
                      required
                    />
                  </div>

                  <!-- Notas -->
                  <div class="col-lg-12 mb-3">
                    <label class="form-label">Notas</label>
                    <textarea
                      class="form-control"
                      v-model="editFormData.notas"
                      rows="3"
                    ></textarea>
                  </div>

                  <!-- Estado Activo -->
                  <div class="col-lg-12 mb-3">
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="edit-is-active"
                        v-model="editFormData.is_active"
                        :true-value="1"
                        :false-value="0"
                      />
                      <label class="form-check-label" for="edit-is-active">
                        Resolución Activa
                      </label>
                    </div>
                  </div>

                  <!-- Alertas -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Nro. Crítico</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="editFormData.nro_critico"
                      min="0"
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Alertar Días Antes de Venc.</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="editFormData.alertar_dias_antes"
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label d-flex align-items-center">
                      Alertar Porcentaje de Uso
                      <span class="ms-2 text-danger">
                        <i class="ti ti-info-circle"></i>
                      </span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text">%</span>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="editFormData.alertar_porcentaje_uso"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Alertar En Nro. Control</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="editFormData.alertar_en_nro_control"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <!-- CONSECUTIVOS -->
              <div class="tab-pane fade" id="edit-consecutivos" role="tabpanel">
                <div class="row">
                  <!-- Controles -->
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">Nro. Inicial Control</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="editFormData.nro_inicial_control"
                    />
                  </div>
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">Nro. Final Control</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="editFormData.nro_final_control"
                    />
                  </div>
                  <div class="col-lg-4 mb-3">
                    <label class="form-label">Nro. Actual Control</label>
                    <div class="input-group">
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="editFormData.nro_actual_control"
                      />
                      <button class="btn btn-primary" type="button">
                        <i class="ti ti-search"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Prefijos -->
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Prefijo # Control</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="editFormData.prefijo_control"
                      maxlength="10"
                    />
                  </div>
                  <div class="col-lg-6 mb-3">
                    <label class="form-label">Sufijo # Control</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="editFormData.sufijo_control"
                      maxlength="10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              CERRAR
            </button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">
              ELIMINAR
            </button>
            <button type="submit" class="btn btn-success" :disabled="isSubmitting">
              <span v-if="isSubmitting">GUARDANDO...</span>
              <span v-else>GUARDAR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- /Edit Resolution -->

  <!-- View Resolution -->
  <div class="modal fade" id="view-resolution">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Detalles de Resolución</h4>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <!-- Tabs -->
          <ul class="nav nav-tabs mb-3" role="tablist">
            <li class="nav-item" role="presentation">
              <button
                class="nav-link active"
                id="view-datos-generales-tab"
                data-bs-toggle="tab"
                data-bs-target="#view-datos-generales"
                type="button"
                role="tab"
              >
                DATOS GENERALES
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                id="view-consecutivos-tab"
                data-bs-toggle="tab"
                data-bs-target="#view-consecutivos"
                type="button"
                role="tab"
              >
                CONSECUTIVOS
              </button>
            </li>
          </ul>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- DATOS GENERALES -->
            <div class="tab-pane fade show active" id="view-datos-generales" role="tabpanel">
              <div class="row">
                <!-- Número de Resolución -->
                <div class="col-lg-12 mb-3">
                  <label class="form-label fw-bold">No. Resolución</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ resolution?.numero_resolucion || '-' }}
                  </p>
                </div>

                <!-- Fecha Inicio y Fin -->
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Fecha Inicio</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ formatDateForDisplay(resolution?.fecha_inicio) }}
                  </p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Fecha Venc.</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ formatDateForDisplay(resolution?.fecha_fin) }}
                  </p>
                </div>

                <!-- Notas -->
                <div class="col-lg-12 mb-3">
                  <label class="form-label fw-bold">Notas</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light" style="min-height: 80px;">
                    {{ resolution?.notas || 'Sin notas' }}
                  </p>
                </div>

                <!-- Estado Activo -->
                <div class="col-lg-12 mb-3">
                  <label class="form-label fw-bold">Estado</label>
                  <p class="form-control-plaintext">
                    <span :class="resolution?.is_active ? 'badge bg-success' : 'badge bg-danger'">
                      {{ resolution?.is_active ? 'ACTIVA' : 'INACTIVA' }}
                    </span>
                  </p>
                </div>

                <!-- Alertas -->
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Nro. Crítico</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ resolution?.nro_critico || 0 }}
                  </p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Alertar Días Antes de Venc.</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ resolution?.alertar_dias_antes || 6 }}
                  </p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Alertar Porcentaje de Uso</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ resolution?.alertar_porcentaje_uso || 99 }}%
                  </p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Alertar En Nro. Control</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ resolution?.alertar_en_nro_control || 0 }}
                  </p>
                </div>
              </div>
            </div>

            <!-- CONSECUTIVOS -->
            <div class="tab-pane fade" id="view-consecutivos" role="tabpanel">
              <div class="row">
                <!-- Controles -->
                <div class="col-lg-4 mb-3">
                  <label class="form-label fw-bold">Nro. Inicial Control</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ resolution?.nro_inicial_control || 0 }}
                  </p>
                </div>
                <div class="col-lg-4 mb-3">
                  <label class="form-label fw-bold">Nro. Final Control</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ resolution?.nro_final_control || 0 }}
                  </p>
                </div>
                <div class="col-lg-4 mb-3">
                  <label class="form-label fw-bold">Nro. Actual Control</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ resolution?.nro_actual_control || 0 }}
                  </p>
                </div>

                <!-- Prefijos -->
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Prefijo # Control</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ resolution?.prefijo_control || '-' }}
                  </p>
                </div>
                <div class="col-lg-6 mb-3">
                  <label class="form-label fw-bold">Sufijo # Control</label>
                  <p class="form-control-plaintext border rounded px-3 py-2 bg-light">
                    {{ resolution?.sufijo_control || '-' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            CERRAR
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- /View Resolution -->

  <!-- delete modal -->
  <div class="modal fade" id="delete-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"
              ><i class="ti ti-trash fs-24 text-danger"></i
            ></span>
            <h4 class="fs-20 text-gray-9 fw-bold mb-2 mt-1">Eliminar Resolución</h4>
            <p class="text-gray-6 mb-0 fs-16">
              ¿Estás seguro de que deseas eliminar esta resolución de facturación?
            </p>
            <div class="modal-footer-btn mt-3 d-flex justify-content-center">
              <button
                type="button"
                class="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-danger fs-13 fw-medium p-2 px-3"
                @click="confirmDelete"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Eliminando...</span>
                <span v-else>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /delete modal -->
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  props: {
    resolution: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {
        numero_resolucion: '',
        prefijo_control: '',
        fecha_inicio: '',
        fecha_fin: '',
        is_active: 1,
        notas: '',
        nro_critico: 0,
        alertar_dias_antes: 6,
        alertar_porcentaje_uso: 99,
        alertar_en_nro_control: 0,
        nro_inicial_control: 0,
        nro_final_control: 0,
        nro_actual_control: 0,
        sufijo_control: ''
      },
      editFormData: {
        id: null,
        numero_resolucion: '',
        prefijo_control: '',
        fecha_inicio: '',
        fecha_fin: '',
        is_active: 1,
        notas: '',
        nro_critico: 0,
        alertar_dias_antes: 6,
        alertar_porcentaje_uso: 99,
        alertar_en_nro_control: 0,
        nro_inicial_control: 0,
        nro_final_control: 0,
        nro_actual_control: 0,
        sufijo_control: ''
      },
      isSubmitting: false
    };
  },
  watch: {
    resolution: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            numero_resolucion: newVal.numero_resolucion || '',
            prefijo_control: newVal.prefijo_control || '',
            fecha_inicio: this.formatDateForInput(newVal.fecha_inicio),
            fecha_fin: this.formatDateForInput(newVal.fecha_fin),
            is_active: newVal.is_active !== undefined ? newVal.is_active : 1,
            notas: newVal.notas || '',
            nro_critico: newVal.nro_critico || 0,
            alertar_dias_antes: newVal.alertar_dias_antes || 6,
            alertar_porcentaje_uso: newVal.alertar_porcentaje_uso || 99,
            alertar_en_nro_control: newVal.alertar_en_nro_control || 0,
            nro_inicial_control: newVal.nro_inicial_control || 0,
            nro_final_control: newVal.nro_final_control || 0,
            nro_actual_control: newVal.nro_actual_control || 0,
            sufijo_control: newVal.sufijo_control || ''
          };
        }
      },
      immediate: true
    }
  },
  methods: {
    formatDateForInput(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    formatDateForDisplay(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    },

    resetForm() {
      this.formData = {
        numero_resolucion: '',
        prefijo_control: '',
        fecha_inicio: '',
        fecha_fin: '',
        is_active: 1,
        notas: '',
        nro_critico: 0,
        alertar_dias_antes: 6,
        alertar_porcentaje_uso: 99,
        alertar_en_nro_control: 0,
        nro_inicial_control: 0,
        nro_final_control: 0,
        nro_actual_control: 0,
        sufijo_control: ''
      };
    },

    async submitAddForm() {
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');

        await axios.post('http://localhost:3000/api/v1/resolutions', this.formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        this.resetForm();
        this.$emit('resolution-saved');

        const modalElement = document.getElementById('add-resolution');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Resolución creada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating resolution:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear la resolución',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async submitEditForm() {
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        const { id, ...updateData } = this.editFormData;

        await axios.put(`http://localhost:3000/api/v1/resolutions/${id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        this.$emit('resolution-saved');

        const modalElement = document.getElementById('edit-resolution');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Resolución actualizada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating resolution:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar la resolución',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete() {
      if (!this.resolution || !this.resolution.id) {
        const id = this.editFormData.id;
        if (!id) return;

        this.isSubmitting = true;
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:3000/api/v1/resolutions/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          this.$emit('resolution-deleted');

          const modalElement = document.getElementById('edit-resolution');
          if (modalElement) {
            const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
            if (closeButton) closeButton.click();
          }

          this.$nextTick(() => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'Resolución eliminada exitosamente',
              confirmButtonColor: '#28a745',
              timer: 2000,
              showConfirmButton: false
            });
          });
        } catch (error) {
          console.error('Error deleting resolution:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Error al eliminar la resolución',
            confirmButtonColor: '#dc3545'
          });
        } finally {
          this.isSubmitting = false;
        }
        return;
      }

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/resolutions/${this.resolution.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        this.$emit('resolution-deleted');

        const modalElement = document.getElementById('delete-modal');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'Resolución eliminada exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting resolution:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar la resolución',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  },
};
</script>

<style scoped>
.nav-tabs .nav-link {
  color: #6c757d;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid transparent;
}

.nav-tabs .nav-link.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
  background: transparent;
}

.nav-tabs {
  border-bottom: 1px solid #dee2e6;
}
</style>
