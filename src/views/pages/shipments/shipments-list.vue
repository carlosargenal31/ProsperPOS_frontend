<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Envíos y Guías de Remisión</h4>
            <h6>Gestión completa de envíos y despachos</h6>
          </div>
        </div>
        <ul class="table-top-head">
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar" @click="loadShipments">
              <i class="ti ti-refresh"></i>
            </a>
          </li>
          <li>
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Colapsar" id="collapse-header" @click="toggleHeader">
              <i class="ti ti-chevron-up"></i>
            </a>
          </li>
        </ul>
        <div class="page-btn d-flex gap-2">
          <router-link to="/shipments/create" class="btn btn-primary btn-md d-inline-flex align-items-center">
            <vue-feather type="plus-circle" class="me-2"></vue-feather> Nueva Guía de Remisión
          </router-link>
          <button class="btn btn-success btn-md d-inline-flex align-items-center" @click="showSaveReportModal = true">
            <i class="ti ti-download me-2"></i> Guardar Reporte
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="row mb-4" v-if="stats">
        <div class="col-md-3">
          <div class="card bg-info-light">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <p class="text-muted mb-1">Total Envíos</p>
                  <h3 class="mb-0">{{ stats.total || 0 }}</h3>
                </div>
                <div class="avatar avatar-lg bg-info">
                  <i class="ti ti-package fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning-light">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <p class="text-muted mb-1">Pendientes</p>
                  <h3 class="mb-0">{{ stats.pendiente || 0 }}</h3>
                </div>
                <div class="avatar avatar-lg bg-warning">
                  <i class="ti ti-clock fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-primary-light">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <p class="text-muted mb-1">En Camino</p>
                  <h3 class="mb-0">{{ stats.en_camino || 0 }}</h3>
                </div>
                <div class="avatar avatar-lg bg-primary">
                  <i class="ti ti-truck-delivery fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success-light">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <p class="text-muted mb-1">Entregados</p>
                  <h3 class="mb-0">{{ stats.entregado || 0 }}</h3>
                </div>
                <div class="avatar avatar-lg bg-success">
                  <i class="ti ti-check fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de envíos -->
      <div class="card table-list-card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <div class="search-set">
            <div class="search-input">
              <a href="javascript:void(0);" class="btn-searchset">
                <i class="ti ti-search fs-14 feather-search"></i>
              </a>
              <input type="search" class="form-control form-control-sm" placeholder="Buscar..." v-model="searchQuery" @input="onSearch" />
            </div>
          </div>
          <div class="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
            <div class="dropdown me-2">
              <a href="javascript:void(0);" class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
                {{ getSelectedStatusText() }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end p-3">
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('')">Todos</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('pendiente')">Pendientes</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('en_camino')">En Camino</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('entregado')">Entregados</a></li>
                <li><a href="javascript:void(0);" class="dropdown-item rounded-1" @click="filterByStatus('cancelado')">Cancelados</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
          </div>
          <div v-else class="table-responsive">
            <table class="table datanew">
              <thead>
                <tr>
                  <th>N° Guía</th>
                  <th>Cliente</th>
                  <th>Receptor</th>
                  <th>Destino</th>
                  <th>Fecha Emisión</th>
                  <th>Estado Actual</th>
                  <th>Conductor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="shipments.length === 0">
                  <td colspan="8" class="text-center text-muted py-4">
                    <i class="ti ti-package fs-48 mb-2 d-block"></i>
                    No hay envíos registrados
                  </td>
                </tr>
                <tr v-for="ship in shipments" :key="ship.id">
                  <td>
                    <span class="fw-bold text-primary">{{ ship.shipment_number }}</span><br/>
                    <small class="text-muted">{{ formatDate(ship.emission_date) }}</small>
                  </td>
                  <td>
                    <span class="fw-medium">{{ ship.customer_name }}</span><br/>
                    <small class="text-muted" v-if="ship.customer_phone">{{ ship.customer_phone }}</small>
                  </td>
                  <td>
                    <span class="fw-medium">{{ ship.receiver_name }}</span><br/>
                    <small class="text-muted">{{ ship.receiver_phone }}</small>
                  </td>
                  <td>
                    <span class="text-muted">{{ truncate(ship.destination_address, 30) }}</span><br/>
                    <small v-if="ship.destination_city" class="badge bg-light text-dark">{{ ship.destination_city }}</small>
                  </td>
                  <td>{{ formatDate(ship.emission_date) }}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <span :class="getStatusClass(ship.status)">{{ getStatusText(ship.status) }}</span>
                      <button class="btn btn-sm btn-outline-primary" @click="openChangeStatusModal(ship)" v-if="ship.status !== 'entregado'">
                        <i class="ti ti-exchange"></i>
                      </button>
                    </div>
                  </td>
                  <td>
                    <span v-if="ship.driver_name">{{ ship.driver_name }}</span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="action-table-data">
                      <div class="edit-delete-action">
                        <a class="me-2 p-2" href="javascript:void(0);" @click="viewShipment(ship)" title="Ver Detalles">
                          <i class="ti ti-eye text-info"></i>
                        </a>
                        <a class="me-2 p-2" href="javascript:void(0);" @click="editShipment(ship)" title="Editar">
                          <i class="ti ti-edit text-primary"></i>
                        </a>
                        <a class="p-2" href="javascript:void(0);" @click="openExportModal(ship)" title="Exportar">
                          <i class="ti ti-file-export text-success"></i>
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
      <p class="mb-0 text-gray-9">{{ new Date().getFullYear() }} &copy; ProsperPOS. All Rights Reserved</p>
      <p>Diseñado & Desarrollado Por; <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a></p>
    </div>
  </div>

  <!-- Modal de Visualización -->
  <div class="modal fade" id="viewShipmentModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title"><i class="ti ti-package me-2"></i>Detalle de Guía de Remisión #{{ selectedShipment?.shipment_number }}</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" v-if="selectedShipment">
          <div class="row">
            <!-- Información General -->
            <div class="col-md-6">
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0"><i class="ti ti-info-circle me-2"></i>Información General</h6>
                </div>
                <div class="card-body">
                  <table class="table table-borderless table-sm">
                    <tr>
                      <td class="fw-bold" width="40%">Número de Guía:</td>
                      <td>{{ selectedShipment.shipment_number }}</td>
                    </tr>
                    <tr>
                      <td class="fw-bold">Fecha de Emisión:</td>
                      <td>{{ formatDate(selectedShipment.emission_date) }}</td>
                    </tr>
                    <tr>
                      <td class="fw-bold">Estado:</td>
                      <td><span :class="getStatusClass(selectedShipment.status)">{{ getStatusText(selectedShipment.status) }}</span></td>
                    </tr>
                    <tr v-if="selectedShipment.invoice_id">
                      <td class="fw-bold">Factura Relacionada:</td>
                      <td>#{{ selectedShipment.invoice_id }}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Cliente -->
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0"><i class="ti ti-user me-2"></i>Cliente</h6>
                </div>
                <div class="card-body">
                  <table class="table table-borderless table-sm">
                    <tr>
                      <td class="fw-bold" width="40%">Nombre:</td>
                      <td>{{ selectedShipment.customer_name }}</td>
                    </tr>
                    <tr v-if="selectedShipment.customer_phone">
                      <td class="fw-bold">Teléfono:</td>
                      <td>{{ selectedShipment.customer_phone }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <!-- Receptor -->
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0"><i class="ti ti-user-check me-2"></i>Receptor</h6>
                </div>
                <div class="card-body">
                  <table class="table table-borderless table-sm">
                    <tr>
                      <td class="fw-bold" width="40%">Nombre:</td>
                      <td>{{ selectedShipment.receiver_name }}</td>
                    </tr>
                    <tr>
                      <td class="fw-bold">Teléfono:</td>
                      <td>{{ selectedShipment.receiver_phone }}</td>
                    </tr>
                    <tr v-if="selectedShipment.receiver_id_document">
                      <td class="fw-bold">Documento:</td>
                      <td>{{ selectedShipment.receiver_id_document }}</td>
                    </tr>
                  </table>
                  <div v-if="selectedShipment.receiver_alt_name" class="mt-2 pt-2 border-top">
                    <strong>Receptor Alternativo:</strong>
                    <p class="mb-0">{{ selectedShipment.receiver_alt_name }} - {{ selectedShipment.receiver_alt_phone }}</p>
                  </div>
                </div>
              </div>

              <!-- Conductor/Vehículo -->
              <div class="card mb-3" v-if="selectedShipment.driver_name">
                <div class="card-header bg-light">
                  <h6 class="mb-0"><i class="ti ti-truck me-2"></i>Transporte</h6>
                </div>
                <div class="card-body">
                  <table class="table table-borderless table-sm">
                    <tr>
                      <td class="fw-bold" width="40%">Conductor:</td>
                      <td>{{ selectedShipment.driver_name }}</td>
                    </tr>
                    <tr v-if="selectedShipment.driver_license">
                      <td class="fw-bold">Licencia:</td>
                      <td>{{ selectedShipment.driver_license }}</td>
                    </tr>
                    <tr v-if="selectedShipment.vehicle_plate">
                      <td class="fw-bold">Vehículo:</td>
                      <td>{{ selectedShipment.vehicle_plate }}</td>
                    </tr>
                    <tr v-if="selectedShipment.assistant_name">
                      <td class="fw-bold">Acompañante:</td>
                      <td>{{ selectedShipment.assistant_name }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Origen y Destino -->
          <div class="row">
            <div class="col-md-6">
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0"><i class="ti ti-map-pin me-2"></i>Origen</h6>
                </div>
                <div class="card-body">
                  <p class="mb-1"><strong>Dirección:</strong> {{ selectedShipment.origin_address }}</p>
                  <p class="mb-0"><strong>Ciudad:</strong> {{ selectedShipment.origin_city }}, {{ selectedShipment.origin_state }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0"><i class="ti ti-map-pin-filled me-2"></i>Destino</h6>
                </div>
                <div class="card-body">
                  <p class="mb-1"><strong>Dirección:</strong> {{ selectedShipment.destination_address }}</p>
                  <p class="mb-0"><strong>Ciudad:</strong> {{ selectedShipment.destination_city }}, {{ selectedShipment.destination_state }}</p>
                  <p v-if="selectedShipment.destination_reference" class="mb-0 text-muted"><em>{{ selectedShipment.destination_reference }}</em></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="card" v-if="selectedShipment.notes">
            <div class="card-header bg-light">
              <h6 class="mb-0"><i class="ti ti-notes me-2"></i>Observaciones</h6>
            </div>
            <div class="card-body">
              <p class="mb-0">{{ selectedShipment.notes }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Cambio de Estado -->
  <div class="modal fade" id="changeStatusModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-warning text-white">
          <h5 class="modal-title"><i class="ti ti-exchange me-2"></i>Cambiar Estado de Guía</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" v-if="shipmentToChangeStatus">
          <div class="mb-3">
            <p><strong>Guía de Remisión:</strong> {{ shipmentToChangeStatus.shipment_number }}</p>
            <p><strong>Cliente:</strong> {{ shipmentToChangeStatus.customer_name }}</p>
            <p class="mb-3"><strong>Estado Actual:</strong> <span :class="getStatusClass(shipmentToChangeStatus.status)">{{ getStatusText(shipmentToChangeStatus.status) }}</span></p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Nuevo Estado:</label>
            <select class="form-select" v-model="newStatus">
              <option value="">-- Seleccione --</option>
              <option value="pendiente" v-if="shipmentToChangeStatus.status !== 'pendiente'">Pendiente</option>
              <option value="en_camino" v-if="shipmentToChangeStatus.status !== 'en_camino'">En Camino</option>
              <option value="entregado" v-if="shipmentToChangeStatus.status !== 'entregado'">Entregado</option>
              <option value="cancelado" v-if="shipmentToChangeStatus.status !== 'cancelado'">Cancelado</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="confirmChangeStatus" :disabled="!newStatus">
            <i class="ti ti-check me-2"></i>Cambiar Estado
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Exportación -->
  <div class="modal fade" id="exportModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title"><i class="ti ti-file-export me-2"></i>Exportar Guía de Remisión</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" v-if="shipmentToExport">
          <p class="mb-4"><strong>Guía:</strong> {{ shipmentToExport.shipment_number }}</p>
          <div class="d-grid gap-3">
            <button class="btn btn-outline-success btn-lg" @click="exportShipment('print')">
              <i class="ti ti-printer me-2"></i>Abrir Vista de Impresión
              <small class="d-block text-muted mt-1">Podrás guardar como PDF, Imagen o Imprimir</small>
            </button>
            <button class="btn btn-outline-primary btn-lg" @click="exportShipment('excel')">
              <i class="ti ti-file-spreadsheet me-2"></i>Guardar como Excel
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Guardar Reporte -->
  <div v-if="showSaveReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Guardar Reporte - Guías de Remisión</h5>
          <button type="button" class="btn-close" @click="showSaveReportModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-3">Selecciona el formato en el que deseas guardar el reporte:</p>
          <div class="d-grid gap-2">
            <button class="btn btn-outline-success" @click="saveShipmentsAsExcel">
              <i class="ti ti-file-spreadsheet me-2"></i> Guardar como Excel
            </button>
            <button class="btn btn-outline-danger" @click="saveShipmentsAsPDF">
              <i class="ti ti-file-type-pdf me-2"></i> Guardar como PDF
            </button>
            <button class="btn btn-outline-primary" @click="saveShipmentsAsImage">
              <i class="ti ti-photo me-2"></i> Guardar como Imagen
            </button>
            <button class="btn btn-outline-secondary" @click="printShipmentsList">
              <i class="ti ti-printer me-2"></i> Imprimir
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showSaveReportModal = false">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import api from '@/api/config';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import apiAxios from '@/utils/axios';

export default {
  data() {
    return {
      shipments: [],
      stats: null,
      loading: false,
      searchQuery: '',
      selectedStatus: '',
      selectedShipment: null,
      shipmentToChangeStatus: null,
      newStatus: '',
      shipmentToExport: null,
      showSaveReportModal: false,
      companyInfo: {}
    };
  },
  mounted() {
    this.loadShipments();
    this.loadStatistics();
    this.loadCompanyInfo();
  },
  methods: {
    async loadShipments() {
      try {
        this.loading = true;
        const params = {};

        if (this.searchQuery) params.search = this.searchQuery;
        if (this.selectedStatus) params.status = this.selectedStatus;

        const response = await api.get('/shipments', { params });

        console.log('Response:', response.data);

        if (response.data && response.data.success) {
          const data = response.data.data;
          console.log('Shipments data:', data);
          this.shipments = Array.isArray(data) ? data.filter(s => s && s.id) : [];
          console.log('Filtered shipments:', this.shipments);
        } else {
          this.shipments = [];
        }
      } catch (error) {
        console.error('Error loading shipments:', error);
        Swal.fire('Error', 'No se pudieron cargar los envíos', 'error');
      } finally {
        this.loading = false;
      }
    },

    async loadStatistics() {
      try {
        const response = await api.get('/shipments/statistics');
        if (response.data && response.data.success && response.data.data) {
          this.stats = response.data.data;
        }
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    },

    openChangeStatusModal(shipment) {
      this.shipmentToChangeStatus = shipment;
      this.newStatus = '';
      const modal = new Modal(document.getElementById('changeStatusModal'));
      modal.show();
    },

    async confirmChangeStatus() {
      try {
        if (!this.newStatus) {
          Swal.fire('Atención', 'Debe seleccionar un nuevo estado', 'warning');
          return;
        }

        await api.patch(`/shipments/${this.shipmentToChangeStatus.id}/status`, { status: this.newStatus });

        // Cerrar modal sin notificación
        const modal = Modal.getInstance(document.getElementById('changeStatusModal'));
        modal.hide();

        // Recargar datos
        this.loadShipments();
        this.loadStatistics();
      } catch (error) {
        console.error('Error updating status:', error);
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
      }
    },

    async deleteShipment(id) {
      try {
        const result = await Swal.fire({
          title: '¿Eliminar envío?',
          text: 'Esta acción no se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
          await api.delete(`/shipments/${id}`);
          Swal.fire('¡Eliminado!', 'El envío ha sido eliminado', 'success');
          this.loadShipments();
          this.loadStatistics();
        }
      } catch (error) {
        console.error('Error deleting shipment:', error);
        Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar el envío', 'error');
      }
    },

    async viewShipment(shipment) {
      try {
        const response = await api.get(`/shipments/${shipment.id}`);
        this.selectedShipment = response.data?.data;
        const modal = new Modal(document.getElementById('viewShipmentModal'));
        modal.show();
      } catch (error) {
        console.error('Error loading shipment details:', error);
        Swal.fire('Error', 'No se pudo cargar el detalle del envío', 'error');
      }
    },

    editShipment(shipment) {
      this.$router.push(`/shipments/edit/${shipment.id}`);
    },

    openExportModal(shipment) {
      this.shipmentToExport = shipment;
      const modal = new Modal(document.getElementById('exportModal'));
      modal.show();
    },

    async exportShipment(format) {
      try {
        // Cerrar modal
        const modal = Modal.getInstance(document.getElementById('exportModal'));
        if (modal) modal.hide();

        if (format === 'excel') {
          await this.exportToExcel();
        } else if (format === 'print') {
          // Abrir en nueva ventana para imprimir o capturar
          window.open(`/shipments/print/${this.shipmentToExport.id}`, '_blank');
        }
      } catch (error) {
        console.error('Error exporting:', error);
        Swal.fire('Error', 'No se pudo exportar el documento', 'error');
      }
    },

    async exportToExcel() {
      try {
        const ship = this.shipmentToExport;
        const data = [
          ['GUÍA DE REMISIÓN'],
          [''],
          ['Número de Guía:', ship.shipment_number],
          ['Fecha Emisión:', this.formatDate(ship.emission_date)],
          ['Cliente:', ship.customer_name],
          ['Teléfono Cliente:', ship.customer_phone || 'N/A'],
          [''],
          ['RECEPTOR'],
          ['Nombre:', ship.receiver_name],
          ['Teléfono:', ship.receiver_phone],
          ['Documento:', ship.receiver_id_document || 'N/A'],
          [''],
          ['ORIGEN'],
          ['Dirección:', ship.origin_address],
          ['Ciudad:', ship.origin_city || 'N/A'],
          [''],
          ['DESTINO'],
          ['Dirección:', ship.destination_address],
          ['Ciudad:', ship.destination_city || 'N/A'],
          ['Referencias:', ship.destination_reference || 'N/A'],
          [''],
          ['CONDUCTOR Y VEHÍCULO'],
          ['Conductor:', ship.driver_name || 'N/A'],
          ['Cédula:', ship.driver_id || 'N/A'],
          ['Licencia:', ship.driver_license || 'N/A'],
          ['Vehículo:', ship.vehicle_plate || 'N/A'],
          [''],
          ['Estado:', this.getStatusText(ship.status)],
          ['Notas:', ship.notes || 'N/A']
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Guía de Remisión');

        XLSX.writeFile(wb, `guia_remision_${ship.shipment_number}.xlsx`);
        Swal.fire('Éxito', 'Excel guardado correctamente', 'success');
      } catch (error) {
        console.error('Error exporting Excel:', error);
        Swal.fire('Error', 'No se pudo generar el Excel', 'error');
      }
    },

    printShipment(shipment) {
      this.$router.push(`/shipments/print/${shipment.id}`);
    },

    onSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.loadShipments();
      }, 500);
    },

    filterByStatus(status) {
      this.selectedStatus = status;
      this.loadShipments();
    },

    toggleHeader() {
      const header = document.querySelector('.page-header');
      header.classList.toggle('collapsed');
    },

    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },

    truncate(text, length) {
      if (!text) return '-';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },

    getStatusClass(status) {
      const classes = {
        'pendiente': 'badge bg-warning',
        'en_camino': 'badge bg-primary',
        'entregado': 'badge bg-success',
        'cancelado': 'badge bg-danger'
      };
      return classes[status] || 'badge bg-secondary';
    },

    getStatusSelectClass(status) {
      const classes = {
        'pendiente': 'border-warning text-warning',
        'en_camino': 'border-primary text-primary',
        'entregado': 'border-success text-success',
        'cancelado': 'border-danger text-danger'
      };
      return classes[status] || '';
    },

    getStatusText(status) {
      const texts = {
        'pendiente': 'Pendiente',
        'en_camino': 'En Camino',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
      };
      return texts[status] || status;
    },

    getDocumentTypeText(type) {
      const texts = {
        'guia_remision': 'Guía de Remisión',
        'comprobante_entrega': 'Comprobante de Entrega',
        'despacho': 'Despacho'
      };
      return texts[type] || type;
    },

    getSelectedStatusText() {
      if (!this.selectedStatus) return 'Todos los Estados';
      const texts = {
        'pendiente': 'Pendientes',
        'en_camino': 'En Camino',
        'entregado': 'Entregados',
        'cancelado': 'Cancelados'
      };
      return texts[this.selectedStatus] || 'Todos los Estados';
    },

    // Company info methods
    async loadCompanyInfo() {
      try {
        const response = await apiAxios.get('/companies/default');
        if (response.data && response.data.success) {
          this.companyInfo = response.data.data;
        }
      } catch (error) {
        console.error('Error al cargar información de empresa:', error);
        try {
          const publicResponse = await apiAxios.get('/companies/public/default');
          if (publicResponse.data && publicResponse.data.success) {
            this.companyInfo = publicResponse.data.data;
          }
        } catch (publicError) {
          this.companyInfo = {
            company_name: 'ProsperPOS',
            commercial_name: 'ProsperPOS',
            rtn: 'N/A',
            address: 'Sin dirección',
            phone: 'N/A',
            whatsapp: 'N/A',
            email: 'N/A'
          };
        }
      }
    },

    async getCompanyLogo() {
      if (!this.companyInfo?.logo_url) return '';
      const dbLogoUrl = this.companyInfo.logo_url;
      if (!dbLogoUrl.startsWith('http')) return '';

      try {
        const response = await apiAxios.get('/image-proxy', { params: { url: dbLogoUrl } });
        if (response.data.success && response.data.data.base64) {
          return response.data.data.base64;
        }
      } catch (error) {
        console.error('Error al cargar logo:', error);
      }
      return '';
    },

    // Export methods for Shipments Report
    async saveShipmentsAsExcel() {
      try {
        const wb = XLSX.utils.book_new();

        // Header info
        const headerData = [
          ['REPORTE DE GUÍAS DE REMISIÓN'],
          [''],
          ['Empresa:', this.companyInfo.commercial_name || this.companyInfo.company_name || 'EMPRESA'],
          ['Dirección:', this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'],
          ['Teléfono:', this.companyInfo.phone || this.companyInfo.telefono || 'N/A'],
          ['Email:', this.companyInfo.email || 'N/A'],
          [''],
          ['Generado:', `${new Date().toLocaleDateString('es-HN')} - ${new Date().toLocaleTimeString('es-HN')}`],
          [''],
          ['N° Guía', 'Cliente', 'Receptor', 'Destino', 'Fecha Emisión', 'Estado', 'Conductor']
        ];

        // Data rows
        const dataRows = this.shipments.map(ship => [
          ship.shipment_number,
          ship.customer_name,
          ship.receiver_name,
          ship.destination_address,
          this.formatDate(ship.emission_date),
          this.getStatusText(ship.status),
          ship.driver_name || '-'
        ]);

        const allData = [...headerData, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(allData);

        // Column widths
        ws['!cols'] = [
          { wch: 18 }, // N° Guía
          { wch: 25 }, // Cliente
          { wch: 25 }, // Receptor
          { wch: 35 }, // Destino
          { wch: 15 }, // Fecha
          { wch: 12 }, // Estado
          { wch: 20 }  // Conductor
        ];

        // Merge cells for title
        ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Guías de Remisión');
        XLSX.writeFile(wb, `Reporte_Guias_Remision_${new Date().toLocaleDateString('es-HN').replace(/\//g, '-')}.xlsx`);
        this.showSaveReportModal = false;
      } catch (error) {
        console.error('Error generating Excel:', error);
        Swal.fire('Error', 'Error al generar el archivo Excel', 'error');
      }
    },

    async saveShipmentsAsPDF() {
      try {
        const htmlContent = await this.buildShipmentsReportHTML();

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '900px';
        document.body.appendChild(iframe);

        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 900,
          windowWidth: 900
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'letter'); // landscape
        const imgWidth = 279;
        const pageHeight = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`Reporte_Guias_Remision_${new Date().toLocaleDateString('es-HN').replace(/\//g, '-')}.pdf`);
        document.body.removeChild(iframe);
        this.showSaveReportModal = false;
      } catch (error) {
        console.error('Error generating PDF:', error);
        Swal.fire('Error', 'Error al generar el PDF', 'error');
      }
    },

    async saveShipmentsAsImage() {
      try {
        const htmlContent = await this.buildShipmentsReportHTML();

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '900px';
        document.body.appendChild(iframe);

        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        const element = iframe.contentDocument.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 900,
          windowWidth: 900
        });

        const link = document.createElement('a');
        link.download = `Reporte_Guias_Remision_${new Date().toLocaleDateString('es-HN').replace(/\//g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);
        this.showSaveReportModal = false;
      } catch (error) {
        console.error('Error generating image:', error);
        Swal.fire('Error', 'Error al generar la imagen', 'error');
      }
    },

    async printShipmentsList() {
      try {
        const htmlContent = await this.buildShipmentsReportHTML();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        await new Promise(resolve => setTimeout(resolve, 500));

        printWindow.print();
        this.showSaveReportModal = false;
      } catch (error) {
        console.error('Error printing:', error);
        Swal.fire('Error', 'Error al imprimir', 'error');
      }
    },

    async buildShipmentsReportHTML() {
      const logoUrl = await this.getCompanyLogo();
      const hasLogo = logoUrl !== '';

      let tableRows = '';

      this.shipments.forEach((ship, index) => {
        const statusClass = ship.status === 'entregado' ? '#4CAF50' : ship.status === 'en_camino' ? '#2196F3' : ship.status === 'cancelado' ? '#F44336' : '#FF9800';

        tableRows += `
          <tr>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px; text-align: center;">${index + 1}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${ship.shipment_number}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${ship.customer_name}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${ship.receiver_name}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${this.truncate(ship.destination_address, 35)}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px; text-align: center;">${this.formatDate(ship.emission_date)}</td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px; text-align: center;">
              <span style="background-color: ${statusClass}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 8px; font-weight: 600;">
                ${this.getStatusText(ship.status)}
              </span>
            </td>
            <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">${ship.driver_name || '-'}</td>
          </tr>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Guías de Remisión</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 15px; background: white; margin: 0; width: 900px; }
            .header-section { display: flex; justify-content: space-between; margin-bottom: 15px; gap: 15px; }
            .company-info { width: 60%; flex-shrink: 0; }
            .company-info img { max-width: 180px; height: auto; margin-bottom: 8px; }
            .company-details { font-size: 11px; line-height: 1.5; }
            .report-box { width: 38%; flex-shrink: 0; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                          -webkit-print-color-adjust: exact; print-color-adjust: exact;
                          color: white; padding: 10px; border-radius: 8px; }
            .report-title { font-size: 13px; font-weight: bold; margin-bottom: 8px; }
            .report-details { font-size: 10px; line-height: 1.6; }
            .separator { border: none; border-top: 3px solid #f97316; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; }
            thead { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                    -webkit-print-color-adjust: exact; print-color-adjust: exact; color: white; }
            th { padding: 8px 4px; text-align: left; border: 1px solid #ddd; font-size: 9px; }
            td { padding: 6px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="company-info">
              ${hasLogo ? `<img src="${logoUrl}" alt="Logo">` : ''}
              <div class="company-details">
                <strong>${this.companyInfo.commercial_name || this.companyInfo.company_name || 'PROSPERPOS'}</strong><br>
                <strong>RTN:</strong> ${this.companyInfo.rtn || 'N/A'}<br>
                <strong>Dirección:</strong> ${this.companyInfo.address || this.companyInfo.direccion || 'Sin dirección'}<br>
                <strong>Tel:</strong> ${this.companyInfo.phone || this.companyInfo.telefono || 'N/A'} | <strong>Móvil:</strong> ${this.companyInfo.whatsapp || 'N/A'}<br>
                <strong>Email:</strong> ${this.companyInfo.email || 'N/A'}
              </div>
            </div>
            <div class="report-box">
              <div class="report-title">REPORTE DE GUÍAS DE REMISIÓN</div>
              <div class="report-details">
                <strong>Generado:</strong> ${new Date().toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' })} - ${new Date().toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })}<br>
                <strong>Total de Guías:</strong> ${this.shipments.length}
              </div>
            </div>
          </div>
          <hr class="separator">

          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th>N° Guía</th>
                <th>Cliente</th>
                <th>Receptor</th>
                <th>Destino</th>
                <th style="text-align: center;">Fecha</th>
                <th style="text-align: center;">Estado</th>
                <th>Conductor</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
        </html>
      `;

      return html;
    }
  }
};
</script>

<style scoped>
.bg-info-light {
  background-color: #e7f3ff !important;
}
.bg-warning-light {
  background-color: #fff8e1 !important;
}
.bg-primary-light {
  background-color: #e8f0fe !important;
}
.bg-success-light {
  background-color: #e8f5e9 !important;
}
</style>
