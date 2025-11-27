<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="ti ti-package me-2"></i>
            {{ isEdit ? 'Editar Envío' : 'Crear Nuevo Envío' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveShipment">
            <!-- Información del Documento -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="ti ti-file-text me-2"></i>Información del Documento</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Número de Guía <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <input type="text" class="form-control" v-model="form.shipment_number" readonly>
                        <button type="button" class="btn btn-outline-primary" @click="generateNumber">
                          <i class="ti ti-refresh"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Tipo de Documento</label>
                      <select class="form-select" v-model="form.document_type">
                        <option value="guia_remision">Guía de Remisión</option>
                        <option value="comprobante_entrega">Comprobante de Entrega</option>
                        <option value="despacho">Despacho</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Fecha de Emisión <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" v-model="form.emission_date" required>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información del Cliente -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="ti ti-user me-2"></i>Información del Cliente</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Cliente <span class="text-danger">*</span></label>
                      <select class="form-select" v-model="form.customer_id" @change="onCustomerChange">
                        <option value="">Seleccionar cliente...</option>
                        <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                          {{ customer.name }} - {{ customer.phone }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Nombre del Cliente <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="form.customer_name" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Teléfono del Cliente</label>
                      <input type="tel" class="form-control" v-model="form.customer_phone">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Documento/RTN del Cliente</label>
                      <input type="text" class="form-control" v-model="form.customer_document">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información del Receptor Principal -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="ti ti-user-check me-2"></i>Receptor Principal (Quien Recibe)</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Nombre Completo <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="form.receiver_name" required placeholder="Nombre de quien recibe">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Teléfono/Celular <span class="text-danger">*</span></label>
                      <input type="tel" class="form-control" v-model="form.receiver_phone" required placeholder="Número de contacto">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Documento de Identidad</label>
                      <input type="text" class="form-control" v-model="form.receiver_id_document" placeholder="Cédula/Pasaporte">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Receptor Alternativo 1 -->
            <div class="card mb-3">
              <div class="card-header bg-light d-flex align-items-center justify-content-between">
                <h6 class="mb-0"><i class="ti ti-users me-2"></i>Receptor Alternativo 1 (Opcional)</h6>
                <small class="text-muted">En caso de no encontrar al receptor principal</small>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Nombre Alternativo</label>
                      <input type="text" class="form-control" v-model="form.receiver_alt_name" placeholder="Nombre del segundo receptor">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Teléfono Alternativo</label>
                      <input type="tel" class="form-control" v-model="form.receiver_alt_phone" placeholder="Número alternativo">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Documento Alternativo</label>
                      <input type="text" class="form-control" v-model="form.receiver_alt_id_document" placeholder="Cédula/Pasaporte">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Receptor Alternativo 2 -->
            <div class="card mb-3">
              <div class="card-header bg-light d-flex align-items-center justify-content-between">
                <h6 class="mb-0"><i class="ti ti-users me-2"></i>Receptor Alternativo 2 (Opcional)</h6>
                <small class="text-muted">Tercer contacto de respaldo</small>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Nombre Alternativo 2</label>
                      <input type="text" class="form-control" v-model="form.receiver_alt2_name" placeholder="Nombre del tercer receptor">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Teléfono Alternativo 2</label>
                      <input type="tel" class="form-control" v-model="form.receiver_alt2_phone" placeholder="Tercer número">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Documento Alternativo 2</label>
                      <input type="text" class="form-control" v-model="form.receiver_alt2_id_document" placeholder="Cédula/Pasaporte">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lugar de Partida/Origen -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="ti ti-map-pin me-2"></i>Lugar de Partida (Origen)</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Bodega de Origen</label>
                      <select class="form-select" v-model="form.origin_warehouse_id" @change="onWarehouseChange">
                        <option value="">Seleccionar bodega...</option>
                        <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                          {{ warehouse.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Sucursal de Origen</label>
                      <select class="form-select" v-model="form.origin_branch_id" @change="onBranchChange">
                        <option value="">Seleccionar sucursal...</option>
                        <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                          {{ branch.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Dirección de Partida Completa <span class="text-danger">*</span></label>
                      <textarea class="form-control" rows="2" v-model="form.origin_address" required placeholder="Dirección completa del lugar de partida"></textarea>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Ciudad de Origen</label>
                      <input type="text" class="form-control" v-model="form.origin_city" placeholder="Ej: Tegucigalpa">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Departamento de Origen</label>
                      <input type="text" class="form-control" v-model="form.origin_state" placeholder="Ej: Francisco Morazán">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">País de Origen</label>
                      <input type="text" class="form-control" v-model="form.origin_country" value="Honduras">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lugar de Destino -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="ti ti-map-pin-filled me-2"></i>Lugar de Destino</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Dirección de Destino Completa <span class="text-danger">*</span></label>
                      <textarea class="form-control" rows="2" v-model="form.destination_address" required placeholder="Dirección completa del lugar de entrega"></textarea>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Referencias Adicionales del Lugar</label>
                      <textarea class="form-control" rows="2" v-model="form.destination_reference" placeholder="Ej: Casa color azul, portón negro, frente al parque..."></textarea>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Ciudad de Destino</label>
                      <input type="text" class="form-control" v-model="form.destination_city" placeholder="Ej: San Pedro Sula">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Departamento de Destino</label>
                      <input type="text" class="form-control" v-model="form.destination_state" placeholder="Ej: Cortés">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">País de Destino</label>
                      <input type="text" class="form-control" v-model="form.destination_country" value="Honduras">
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Coordenadas GPS (Opcional)</label>
                      <input type="text" class="form-control" v-model="form.destination_coordinates" placeholder="Ej: 14.0723, -87.1921">
                      <small class="text-muted">Puede ayudar al conductor a ubicar la dirección</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información del Conductor y Vehículo -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="ti ti-truck me-2"></i>Conductor y Vehículo</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Vehículo</label>
                      <select class="form-select" v-model="form.vehicle_id" @change="onVehicleChange">
                        <option value="">Seleccionar vehículo...</option>
                        <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                          {{ vehicle.license_plate }} - {{ vehicle.make }} {{ vehicle.model }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Placa del Vehículo</label>
                      <input type="text" class="form-control" v-model="form.vehicle_plate" placeholder="Ej: HJI-1234">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Nombre del Conductor</label>
                      <input type="text" class="form-control" v-model="form.driver_name" placeholder="Nombre completo del conductor">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Teléfono del Conductor</label>
                      <input type="tel" class="form-control" v-model="form.driver_phone" placeholder="Número de contacto">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Cédula del Conductor</label>
                      <input type="text" class="form-control" v-model="form.driver_id" placeholder="Número de identidad">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Licencia de Conducir</label>
                      <input type="text" class="form-control" v-model="form.driver_license" placeholder="Número de licencia">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fechas y Tiempos -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="ti ti-calendar me-2"></i>Fechas y Tiempos</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Fecha Estimada de Entrega</label>
                      <input type="date" class="form-control" v-model="form.estimated_delivery_date">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Hora de Salida</label>
                      <input type="time" class="form-control" v-model="form.departure_time">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Cantidad de Paquetes</label>
                      <input type="number" class="form-control" v-model="form.package_quantity" min="1" value="1">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notas e Instrucciones -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="ti ti-notes me-2"></i>Notas e Instrucciones Especiales</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Notas Generales</label>
                      <textarea class="form-control" rows="3" v-model="form.notes" placeholder="Notas adicionales sobre el envío..."></textarea>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Instrucciones Especiales</label>
                      <textarea class="form-control" rows="3" v-model="form.special_instructions" placeholder="Instrucciones específicas de manejo, entrega, etc..."></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">
            <i class="ti ti-x me-1"></i>Cancelar
          </button>
          <button type="submit" class="btn btn-primary" @click="saveShipment" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-device-floppy me-1"></i>
            {{ saving ? 'Guardando...' : 'Guardar Envío' }}
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
    shipment: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        shipment_number: '',
        document_type: 'guia_remision',
        emission_date: new Date().toISOString().split('T')[0],
        customer_id: '',
        customer_name: '',
        customer_phone: '',
        customer_document: '',
        receiver_name: '',
        receiver_phone: '',
        receiver_id_document: '',
        receiver_alt_name: '',
        receiver_alt_phone: '',
        receiver_alt_id_document: '',
        receiver_alt2_name: '',
        receiver_alt2_phone: '',
        receiver_alt2_id_document: '',
        origin_warehouse_id: '',
        origin_warehouse_name: '',
        origin_branch_id: '',
        origin_address: '',
        origin_city: '',
        origin_state: '',
        origin_country: 'Honduras',
        destination_address: '',
        destination_reference: '',
        destination_city: '',
        destination_state: '',
        destination_country: 'Honduras',
        destination_coordinates: '',
        driver_name: '',
        driver_phone: '',
        driver_id: '',
        driver_license: '',
        vehicle_id: '',
        vehicle_plate: '',
        vehicle_type: '',
        vehicle_brand: '',
        vehicle_model: '',
        estimated_delivery_date: '',
        departure_time: '',
        package_quantity: 1,
        total_weight: '',
        declared_value: '',
        notes: '',
        special_instructions: ''
      },
      customers: [],
      warehouses: [],
      branches: [],
      vehicles: [],
      saving: false
    };
  },
  computed: {
    isEdit() {
      return !!this.shipment;
    }
  },
  async mounted() {
    await this.loadData();
    if (this.shipment) {
      this.form = { ...this.shipment };
    } else {
      await this.generateNumber();
    }
  },
  methods: {
    async loadData() {
      try {
        const [customersRes, warehousesRes, branchesRes, vehiclesRes] = await Promise.all([
          api.get('/customers'),
          api.get('/warehouses'),
          api.get('/branches'),
          api.get('/vehicles')
        ]);

        this.customers = customersRes.data?.data || [];
        this.warehouses = warehousesRes.data?.data || [];
        this.branches = branchesRes.data?.data || [];
        this.vehicles = vehiclesRes.data?.data || [];
      } catch (error) {
        console.error('Error loading data:', error);
      }
    },

    async generateNumber() {
      try {
        const response = await api.get('/shipments/generate-number');
        if (response.data?.data?.shipment_number) {
          this.form.shipment_number = response.data.data.shipment_number;
        }
      } catch (error) {
        console.error('Error generating shipment number:', error);
      }
    },

    onCustomerChange() {
      const customer = this.customers.find(c => c.id == this.form.customer_id);
      if (customer) {
        this.form.customer_name = customer.name;
        this.form.customer_phone = customer.phone;
        this.form.customer_document = customer.tax_id || customer.id_number;
      }
    },

    onWarehouseChange() {
      const warehouse = this.warehouses.find(w => w.id == this.form.origin_warehouse_id);
      if (warehouse) {
        this.form.origin_warehouse_name = warehouse.name;
        if (warehouse.address) this.form.origin_address = warehouse.address;
        if (warehouse.city) this.form.origin_city = warehouse.city;
      }
    },

    onBranchChange() {
      const branch = this.branches.find(b => b.id == this.form.origin_branch_id);
      if (branch && branch.address) {
        this.form.origin_address = branch.address;
      }
    },

    onVehicleChange() {
      const vehicle = this.vehicles.find(v => v.id == this.form.vehicle_id);
      if (vehicle) {
        this.form.vehicle_plate = vehicle.license_plate;
        this.form.vehicle_brand = vehicle.make;
        this.form.vehicle_model = vehicle.model;
        this.form.vehicle_type = vehicle.type;
      }
    },

    async saveShipment() {
      try {
        this.saving = true;

        // Validaciones
        if (!this.form.customer_name) {
          Swal.fire('Error', 'El nombre del cliente es requerido', 'error');
          return;
        }

        if (!this.form.receiver_name || !this.form.receiver_phone) {
          Swal.fire('Error', 'Los datos del receptor principal son requeridos', 'error');
          return;
        }

        if (!this.form.origin_address || !this.form.destination_address) {
          Swal.fire('Error', 'Las direcciones de origen y destino son requeridas', 'error');
          return;
        }

        let response;
        if (this.isEdit) {
          response = await api.put(`/shipments/${this.shipment.id}`, this.form);
        } else {
          response = await api.post('/shipments', this.form);
        }

        if (response.data.success) {
          Swal.fire('¡Éxito!', this.isEdit ? 'Envío actualizado correctamente' : 'Envío creado correctamente', 'success');
          this.$emit('saved', response.data.data);
        }
      } catch (error) {
        console.error('Error saving shipment:', error);
        Swal.fire('Error', error.response?.data?.message || 'No se pudo guardar el envío', 'error');
      } finally {
        this.saving = false;
      }
    },

    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal {
  display: block;
}
.modal-dialog {
  margin-top: 2rem;
}
.card-header {
  border-bottom: 2px solid #e9ecef;
}
</style>
