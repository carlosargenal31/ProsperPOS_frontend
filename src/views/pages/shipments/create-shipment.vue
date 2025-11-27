<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <!-- Header -->
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>{{ isEdit ? 'Editar Envío' : 'Nueva Guía de Remisión' }}</h4>
            <h6>Complete todos los datos del envío</h6>
          </div>
        </div>
        <div class="page-btn d-flex align-items-center">
          <router-link to="/shipments" class="btn btn-secondary me-2">
            <i class="ti ti-arrow-left me-1"></i> Volver
          </router-link>
          <button @click="saveShipment" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-device-floppy me-1"></i>
            {{ saving ? 'Guardando...' : 'Guardar Envío' }}
          </button>
        </div>
      </div>

      <form @submit.prevent="saveShipment">
        <div class="row">
          <div class="col-lg-12">

            <!-- Información del Documento -->
            <div class="card mb-3">
              <div class="card-header">
                <h5 class="card-title mb-0"><i class="ti ti-file-text me-2"></i>Información del Documento</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Número de Guía <span class="text-danger">*</span></label>
                      <input type="text" class="form-control form-control-lg fw-bold text-primary" v-model="form.shipment_number" readonly>
                      <small class="text-muted">Se genera automáticamente al guardar</small>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Fecha de Emisión <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" v-model="form.emission_date" required>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tipo de Entrega -->
            <div class="card mb-3">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-12">
                    <label class="form-label fw-bold">Tipo de Entrega <span class="text-danger">*</span></label>
                    <div class="btn-group w-100" role="group">
                      <input type="radio" class="btn-check" id="delivery-enviar" v-model="deliveryType" value="enviar">
                      <label class="btn btn-outline-primary" for="delivery-enviar">
                        <i class="ti ti-truck-delivery me-2"></i>Para Enviar
                      </label>
                      <input type="radio" class="btn-check" id="delivery-recoger" v-model="deliveryType" value="recoger">
                      <label class="btn btn-outline-success" for="delivery-recoger">
                        <i class="ti ti-package me-2"></i>Para Recoger
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cliente y Factura -->
            <div class="card mb-3 border-primary">
              <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0"><i class="ti ti-user me-2"></i>Cliente y Factura</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label fw-bold">1. Seleccionar Cliente <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <button class="btn btn-info" @click="showCustomerModal = true">
                          <i class="ti ti-search"></i>
                        </button>
                        <input type="text" class="form-control form-control-lg" :value="form.customer_name" readonly placeholder="Buscar cliente..." required>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row" v-if="form.customer_id">
                  <div class="col-md-12">
                    <div class="alert alert-info">
                      <strong>Cliente:</strong> {{ form.customer_name }} | <strong>Teléfono:</strong> {{ form.customer_phone }}
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label fw-bold">2. Seleccionar Factura <span class="text-danger">*</span></label>
                      <select class="form-select form-select-lg" v-model="form.invoice_id" @change="onInvoiceChange" required>
                        <option value="">-- Seleccione la factura que se va a enviar --</option>
                        <option v-for="invoice in filteredInvoices" :key="invoice.id" :value="invoice.id">
                          Factura #{{ invoice.invoice_number }} - L {{ parseFloat(invoice.total || 0).toFixed(2) }} - {{ formatDate(invoice.created_at) }}
                        </option>
                      </select>
                      <small v-if="filteredInvoices.length === 0" class="text-danger">Este cliente no tiene facturas registradas</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Receptor Principal -->
            <div class="card mb-3 border-primary">
              <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0"><i class="ti ti-user-check me-2"></i>Receptor Principal - Quien Recibe</h5>
              </div>
              <div class="card-body">
                <div class="alert alert-info">
                  <i class="ti ti-info-circle me-2"></i>
                  <strong>Importante:</strong> Persona que recibirá el envío. Estos datos son obligatorios.
                </div>
                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Nombre Completo <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="form.receiver_name" required placeholder="Ej: María López">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Teléfono/Celular <span class="text-danger">*</span></label>
                      <input type="tel" class="form-control" v-model="form.receiver_phone" required placeholder="Ej: 9999-9999">
                      <small class="text-muted">Para contactar al momento de entregar</small>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Documento de Identidad</label>
                      <input type="text" class="form-control" v-model="form.receiver_id_document" placeholder="Ej: 0801-1990-12345">
                      <small class="text-muted">Cédula o pasaporte</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Receptor Alternativo 1 -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <div class="d-flex align-items-center justify-content-between">
                  <h6 class="mb-0"><i class="ti ti-users me-2"></i>Receptor Alternativo 1 (Opcional)</h6>
                  <span class="badge bg-warning">Opcional</span>
                </div>
              </div>
              <div class="card-body">
                <div class="alert alert-warning">
                  <i class="ti ti-alert-circle me-2"></i>
                  Contacto de respaldo si no se encuentra al receptor principal
                </div>
                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Nombre Alternativo</label>
                      <input type="text" class="form-control" v-model="form.receiver_alt_name" placeholder="Ej: Pedro Martínez">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Teléfono Alternativo</label>
                      <input type="tel" class="form-control" v-model="form.receiver_alt_phone" placeholder="Ej: 8888-8888">
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
              <div class="card-header bg-light">
                <div class="d-flex align-items-center justify-content-between">
                  <h6 class="mb-0"><i class="ti ti-users me-2"></i>Receptor Alternativo 2 (Opcional)</h6>
                  <span class="badge bg-warning">Opcional</span>
                </div>
              </div>
              <div class="card-body">
                <div class="alert alert-warning">
                  <i class="ti ti-alert-circle me-2"></i>
                  Tercer contacto de respaldo
                </div>
                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Nombre Alternativo 2</label>
                      <input type="text" class="form-control" v-model="form.receiver_alt2_name" placeholder="Ej: Ana García">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Teléfono Alternativo 2</label>
                      <input type="tel" class="form-control" v-model="form.receiver_alt2_phone" placeholder="Ej: 7777-7777">
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

          </div>
        </div>

        <!-- Sección de Ubicaciones -->
        <div class="row">
          <div class="col-lg-6">
            <!-- Lugar de Partida -->
            <div class="card mb-3">
              <div class="card-header">
                <h5 class="card-title mb-0"><i class="ti ti-map-pin me-2 text-success"></i>Lugar de Partida (Origen)</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Bodega de Origen</label>
                      <select class="form-select" v-model="form.origin_warehouse_id" @change="onWarehouseChange">
                        <option value="">Seleccionar bodega...</option>
                        <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                          {{ warehouse.nombre || warehouse.name }}
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
                          {{ branch.nombre || branch.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Dirección de Partida Completa <span class="text-danger">*</span></label>
                      <textarea class="form-control" rows="2" v-model="form.origin_address" required placeholder="Ej: Bodega Central, Col. Kennedy, Blvd. Suyapa, Tegucigalpa"></textarea>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Ciudad</label>
                      <input type="text" class="form-control" v-model="form.origin_city" placeholder="Ej: Tegucigalpa">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Departamento</label>
                      <input type="text" class="form-control" v-model="form.origin_state" placeholder="Ej: Francisco Morazán">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <!-- Lugar de Destino -->
            <div class="card mb-3">
              <div class="card-header">
                <h5 class="card-title mb-0"><i class="ti ti-map-pin-filled me-2 text-danger"></i>Lugar de Destino</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Dirección de Destino Completa <span class="text-danger">*</span></label>
                      <textarea class="form-control" rows="2" v-model="form.destination_address" required placeholder="Ej: Barrio La Granja, 2 cuadras al norte del parque central"></textarea>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Referencias del Lugar</label>
                      <textarea class="form-control" rows="2" v-model="form.destination_reference" placeholder="Ej: Casa #45, color amarillo, portón azul, frente a pulpería Rosita"></textarea>
                      <small class="text-muted">Detalles que ayuden al conductor a encontrar el lugar</small>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Departamento</label>
                      <select class="form-select" v-model="form.destination_state">
                        <option value="">-- Seleccione departamento --</option>
                        <option v-for="state in states" :key="state.id" :value="state.nombre || state.name">
                          {{ state.nombre || state.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Ciudad de Destino</label>
                      <select class="form-select" v-model="form.destination_city">
                        <option value="">-- Seleccione ciudad --</option>
                        <option v-for="city in filteredCities" :key="city.id" :value="city.nombre || city.name">
                          {{ city.nombre || city.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Conductor y Vehículo (Para Enviar) -->
        <div class="row" v-if="deliveryType === 'enviar'">
          <div class="col-lg-12">
            <div class="card mb-3 border-info">
              <div class="card-header bg-info text-white">
                <h5 class="card-title mb-0"><i class="ti ti-truck me-2"></i>Conductor y Vehículo</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3">
                    <div class="mb-3">
                      <label class="form-label">Conductor <span class="text-danger">*</span></label>
                      <select class="form-select form-select-lg" v-model="form.driver_employee_id" @change="onDriverChange" required>
                        <option value="">-- Seleccione el conductor --</option>
                        <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
                          {{ driver.nombre }} {{ driver.apellido || '' }} - Cédula: {{ driver.dni || 'N/A' }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="mb-3">
                      <label class="form-label">Licencia</label>
                      <input type="text" class="form-control" v-model="form.driver_license" readonly placeholder="Auto">
                      <small class="text-muted">Auto-completa</small>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="mb-3">
                      <label class="form-label">Acompañante (Personal de Entrega)</label>
                      <select class="form-select" v-model="form.assistant_employee_id" @change="onAssistantChange">
                        <option value="">-- Opcional --</option>
                        <option v-for="emp in deliveryStaff" :key="emp.id" :value="emp.id">
                          {{ emp.nombre }} {{ emp.apellido || '' }}
                        </option>
                      </select>
                      <small class="text-muted">Personal de Inventario que acompaña</small>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Vehículo</label>
                      <select class="form-select" v-model="form.vehicle_id" @change="onVehicleChange">
                        <option value="">Seleccionar...</option>
                        <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                          {{ vehicle.placa || vehicle.license_plate }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal de Bodega (Para Recoger) -->
        <div class="row" v-if="deliveryType === 'recoger'">
          <div class="col-lg-12">
            <div class="card mb-3 border-success">
              <div class="card-header bg-success text-white">
                <h5 class="card-title mb-0"><i class="ti ti-package me-2"></i>Personal de Bodega</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Encargado de Bodega <span class="text-danger">*</span></label>
                      <select class="form-select form-select-lg" v-model="form.driver_employee_id" @change="onDriverChange" required>
                        <option value="">-- Seleccione el encargado --</option>
                        <option v-for="staff in warehouseStaff" :key="staff.id" :value="staff.id">
                          {{ staff.nombre }} {{ staff.apellido || '' }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Bodega</label>
                      <select class="form-select" v-model="form.origin_warehouse_id" @change="onWarehouseChange">
                        <option value="">Seleccionar bodega...</option>
                        <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                          {{ warehouse.nombre || warehouse.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información Adicional -->
        <div class="row">
          <div class="col-lg-12">
            <div class="card mb-3">
              <div class="card-header">
                <h5 class="card-title mb-0"><i class="ti ti-notes me-2"></i>Observaciones</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label class="form-label">Notas</label>
                      <textarea class="form-control" rows="3" v-model="form.notes" placeholder="Observaciones o notas adicionales sobre el envío..."></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body text-end">
                <router-link to="/shipments" class="btn btn-outline-secondary me-2">
                  <i class="ti ti-x me-1"></i>Cancelar
                </router-link>
                <button type="submit" class="btn btn-primary btn-lg" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="ti ti-device-floppy me-1"></i>
                  {{ saving ? 'Guardando...' : 'Guardar Guía de Remisión' }}
                </button>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>

    <div class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
      <p class="mb-0 text-gray-9">{{ new Date().getFullYear() }} &copy; ProsperPOS. All Rights Reserved</p>
      <p>Diseñado & Desarrollado Por; <a href="javascript:void(0);" class="text-primary">Carlos Argeñal</a></p>
    </div>

    <!-- Modal de Búsqueda de Clientes -->
    <div v-if="showCustomerModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="ti ti-users me-2"></i>Buscar Cliente</h5>
            <button type="button" class="btn-close" @click="showCustomerModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <div class="input-group">
                <span class="input-group-text"><i class="ti ti-search"></i></span>
                <input
                  type="text"
                  class="form-control form-control-lg"
                  v-model="customerSearch"
                  placeholder="Buscar por nombre, teléfono o código..."
                  autofocus
                >
              </div>
            </div>
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
              <table class="table table-hover">
                <thead class="sticky-top bg-white">
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="customer in filteredCustomers" :key="customer.id" @click="selectCustomer(customer)" style="cursor: pointer;">
                    <td>{{ customer.codigo || customer.code || 'N/A' }}</td>
                    <td>{{ customer.nombre || customer.name }}</td>
                    <td>{{ customer.telefono || customer.phone || 'N/A' }}</td>
                    <td>
                      <button class="btn btn-sm btn-primary" @click="selectCustomer(customer)">
                        <i class="ti ti-check"></i> Seleccionar
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredCustomers.length === 0">
                    <td colspan="4" class="text-center text-muted">
                      <i class="ti ti-search-off me-2"></i>No se encontraron clientes
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCustomerModal = false">
              <i class="ti ti-x me-1"></i>Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import api from '@/api/config';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      form: {
        shipment_number: 'Generando...',
        invoice_id: '',
        sale_id: '',
        document_type: 'guia_remision',
        status: 'pendiente',
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
        driver_employee_id: '',
        driver_name: '',
        driver_phone: '',
        driver_id: '',
        driver_license: '',
        assistant_employee_id: '',
        assistant_name: '',
        assistant_phone: '',
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
        special_instructions: '',
        items: [] // Artículos de la factura
      },
      customers: [],
      warehouses: [],
      branches: [],
      vehicles: [],
      invoices: [],
      employees: [],
      cities: [],
      states: [],
      billingSettings: null,
      showCustomerModal: false,
      customerSearch: '',
      deliveryType: 'enviar', // 'enviar' o 'recoger'
      saving: false
    };
  },
  computed: {
    isEdit() {
      return !!this.$route.params.id;
    },
    filteredInvoices() {
      if (!this.form.customer_id) return [];
      console.log('Filtering invoices for customer:', this.form.customer_id);
      console.log('All invoices:', this.invoices.map(i => ({ id: i.id, customer_id: i.customer_id, invoice_number: i.invoice_number })));
      const filtered = this.invoices.filter(inv => inv.customer_id == this.form.customer_id);
      console.log('Filtered invoices:', filtered);
      return filtered;
    },
    drivers() {
      return this.employees.filter(emp => emp.position_name && emp.position_name.toLowerCase().includes('conductor'));
    },
    warehouseStaff() {
      return this.employees.filter(emp => emp.position_name && emp.position_name.toLowerCase().includes('bodega'));
    },
    filteredCustomers() {
      if (!this.customerSearch) return this.customers;
      const search = this.customerSearch.toLowerCase();
      return this.customers.filter(c =>
        (c.nombre || c.name || '').toLowerCase().includes(search) ||
        (c.telefono || c.phone || '').toLowerCase().includes(search) ||
        (c.codigo || c.code || '').toLowerCase().includes(search)
      );
    },
    filteredCities() {
      if (!this.form.destination_state) return this.cities;
      return this.cities.filter(city => {
        const cityState = city.state_id || city.departamento_id || city.state || city.departamento;
        const selectedState = this.states.find(s => (s.nombre || s.name) === this.form.destination_state);
        if (!selectedState) return true;
        return cityState == selectedState.id;
      });
    },
    deliveryStaff() {
      // Filtrar solo empleados del departamento de Inventario (ID 3) que NO sean el conductor seleccionado
      return this.employees.filter(emp =>
        (emp.department_id == 3 || emp.department_name?.toLowerCase().includes('inventario')) &&
        emp.id != this.form.driver_employee_id
      );
    }
  },
  async mounted() {
    await this.loadData();
    if (this.isEdit) {
      await this.loadShipment();
    } else {
      // Generar número para preview (se volverá a generar al guardar)
      await this.generateNumber();
    }
  },
  methods: {
    async loadData() {
      try {
        const [customersRes, warehousesRes, branchesRes, vehiclesRes, invoicesRes, employeesRes, citiesRes, statesRes, billingRes] = await Promise.all([
          api.get('/customers'),
          api.get('/warehouses'),
          api.get('/branches'),
          api.get('/vehicles'),
          api.get('/invoices-sales'),
          api.get('/employees'),
          api.get('/cities'),
          api.get('/states'),
          api.get('/billing/settings')
        ]);

        this.customers = customersRes.data?.data || [];
        this.warehouses = warehousesRes.data?.data || [];
        this.branches = branchesRes.data?.data || [];
        this.vehicles = vehiclesRes.data?.data || [];
        // Filtrar solo facturas cobradas completamente (paid) y que NO sean devueltas
        const allInvoices = invoicesRes.data?.data || [];
        this.invoices = allInvoices.filter(inv => {
          // Solo facturas con payment_status = 'paid'
          const isPaid = inv.payment_status === 'paid';
          // No devueltas (returned = 0 o null) y no canceladas
          const notReturned = !inv.returned || inv.returned === 0 || inv.returned === '0';
          const notCancelled = inv.status !== 'cancelled' && inv.status !== 'void' && inv.status !== 'returned';

          return isPaid && notReturned && notCancelled;
        });
        console.log('Loaded invoices:', this.invoices.length);
        console.log('Sample invoice structure:', this.invoices[0]);
        if (this.invoices.length > 0) {
          console.log('Invoice customer_id examples:', this.invoices.slice(0, 3).map(i => ({ id: i.id, invoice_number: i.invoice_number, customer_id: i.customer_id, customer_name: i.customer_name })));
        }
        this.employees = employeesRes.data?.data || [];
        this.cities = citiesRes.data?.data || [];
        this.states = statesRes.data?.data || [];
        this.billingSettings = billingRes.data?.data || null;

        // Prellenar datos de origen
        if (!this.isEdit) {
          this.form.origin_address = 'Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle, local amarillo, frente a Repuestos del Atlantico';
          this.form.origin_city = 'La Ceiba';
          this.form.origin_state = 'Atlantida';

          // Buscar bodega 101 y sucursal principal
          const warehouse101 = this.warehouses.find(w => w.codigo === '101' || w.nombre?.includes('101'));
          if (warehouse101) {
            this.form.origin_warehouse_id = warehouse101.id;
            this.form.origin_warehouse_name = warehouse101.nombre || warehouse101.name;
          }

          const mainBranch = this.branches.find(b =>
            b.nombre?.toLowerCase().includes('principal') ||
            b.name?.toLowerCase().includes('principal')
          );
          if (mainBranch) {
            this.form.origin_branch_id = mainBranch.id;
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    },

    selectCustomer(customer) {
      this.form.customer_id = customer.id;
      this.onCustomerChange();
      this.showCustomerModal = false;
      this.customerSearch = '';
    },

    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('es-HN');
    },

    async loadShipment() {
      try {
        const response = await api.get(`/shipments/${this.$route.params.id}`);
        if (response.data?.data) {
          const shipmentData = response.data.data;

          // Convertir fechas ISO a formato yyyy-MM-dd para inputs tipo date
          if (shipmentData.emission_date) {
            shipmentData.emission_date = shipmentData.emission_date.split('T')[0];
          }
          if (shipmentData.estimated_delivery_date) {
            shipmentData.estimated_delivery_date = shipmentData.estimated_delivery_date.split('T')[0];
          }
          if (shipmentData.actual_delivery_date) {
            shipmentData.actual_delivery_date = shipmentData.actual_delivery_date.split('T')[0];
          }

          this.form = { ...shipmentData };

          // Si hay invoice_id, cargar los datos de la factura
          if (this.form.invoice_id) {
            await this.onInvoiceChange();
          }
        }
      } catch (error) {
        console.error('Error loading shipment:', error);
        Swal.fire('Error', 'No se pudo cargar el envío', 'error');
        this.$router.push('/shipments');
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

    async onInvoiceChange() {
      const invoice = this.invoices.find(i => i.id == this.form.invoice_id);
      if (invoice) {
        // Pre-llenar receptor con datos de la factura solo si está vacío
        if (!this.form.receiver_name) {
          this.form.receiver_name = invoice.customer_name || '';
        }
        if (!this.form.receiver_phone) {
          this.form.receiver_phone = invoice.customer_phone || '';
        }
        if (!this.form.destination_address) {
          this.form.destination_address = invoice.customer_address || '';
        }

        // Cargar los items de la factura
        try {
          const response = await api.get(`/invoices-sales/${this.form.invoice_id}`);
          if (response.data && response.data.success && response.data.data) {
            const invoiceData = response.data.data;
            // Mapear los items de la factura a items de guía
            if (invoiceData.items && Array.isArray(invoiceData.items)) {
              this.form.items = invoiceData.items.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name || item.name || item.description,
                product_code: item.product_code || item.code,
                quantity: item.quantity || 1,
                unit: item.unit || 'unidad',
                weight: item.weight || 0,
                description: item.description || item.product_name
              }));
              console.log('Items cargados de la factura:', this.form.items);
            }
          }
        } catch (error) {
          console.error('Error al cargar items de la factura:', error);
        }
      }
    },

    onDriverChange() {
      if (!this.form.driver_employee_id) {
        this.form.driver_name = '';
        this.form.driver_phone = '';
        this.form.driver_id = '';
        this.form.driver_license = '';
        return;
      }
      const employee = this.employees.find(e => e.id == this.form.driver_employee_id);
      if (employee) {
        this.form.driver_name = `${employee.nombre} ${employee.apellido || ''}`.trim();
        this.form.driver_phone = employee.telefono || '';
        this.form.driver_id = employee.dni || '';
        this.form.driver_license = employee.licencia || '';
      }
    },

    onAssistantChange() {
      if (!this.form.assistant_employee_id) {
        this.form.assistant_name = '';
        this.form.assistant_phone = '';
        return;
      }
      const employee = this.employees.find(e => e.id == this.form.assistant_employee_id);
      if (employee) {
        this.form.assistant_name = `${employee.nombre} ${employee.apellido || ''}`.trim();
        this.form.assistant_phone = employee.telefono || '';
      }
    },

    onCustomerChange() {
      const customer = this.customers.find(c => c.id == this.form.customer_id);
      if (customer) {
        this.form.customer_name = customer.nombre || customer.name;
        this.form.customer_phone = customer.telefono || customer.phone;
        this.form.customer_document = customer.doc_identificacion || customer.tax_id || customer.id_number;
      }
    },

    onWarehouseChange() {
      const warehouse = this.warehouses.find(w => w.id == this.form.origin_warehouse_id);
      if (warehouse) {
        this.form.origin_warehouse_name = warehouse.nombre || warehouse.name;
        if (warehouse.direccion || warehouse.address) this.form.origin_address = warehouse.direccion || warehouse.address;
        if (warehouse.city) this.form.origin_city = warehouse.city;
      }
    },

    onBranchChange() {
      const branch = this.branches.find(b => b.id == this.form.origin_branch_id);
      if (branch) {
        if (branch.ubicacion || branch.address) {
          this.form.origin_address = branch.ubicacion || branch.address;
        }
      }
    },

    onVehicleChange() {
      const vehicle = this.vehicles.find(v => v.id == this.form.vehicle_id);
      if (vehicle) {
        this.form.vehicle_plate = vehicle.placa || vehicle.license_plate;
        this.form.vehicle_brand = vehicle.marca || vehicle.make;
        this.form.vehicle_model = vehicle.modelo || vehicle.model;
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
          response = await api.put(`/shipments/${this.$route.params.id}`, this.form);
        } else {
          response = await api.post('/shipments', this.form);
        }

        if (response.data.success) {
          const shipmentId = response.data.data?.id || response.data.data;

          // Redirigir a imprimir la guía directamente sin notificación
          if (shipmentId) {
            window.open(`/shipments/print/${shipmentId}`, '_blank');
          }

          this.$router.push('/shipments');
        }
      } catch (error) {
        console.error('Error saving shipment:', error);
        Swal.fire('Error', error.response?.data?.message || 'No se pudo guardar el envío', 'error');
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.card-header {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.sticky-top {
  position: sticky;
}
</style>
