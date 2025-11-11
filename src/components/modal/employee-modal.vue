<template>
  <!-- Add Employee -->
  <div class="modal fade" id="add-employee">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Agregar Empleado</h4>
              </div>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form @submit.prevent="submitAddForm">
              <div class="modal-body">
                <div class="row">
                  <div class="col-lg-3">
                    <div class="mb-3">
                      <label class="form-label">Código</label>
                      <input type="text" class="form-control" v-model="formData.codigo" placeholder="EMP001" />
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Nombre <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="formData.nombre" placeholder="Juan" required />
                    </div>
                  </div>
                  <div class="col-lg-5">
                    <div class="mb-3">
                      <label class="form-label">Apellido</label>
                      <input type="text" class="form-control" v-model="formData.apellido" placeholder="Pérez" />
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">DNI / Identidad</label>
                      <input type="text" class="form-control" v-model="formData.dni" placeholder="0801-1990-12345" />
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Email</label>
                      <input type="email" class="form-control" v-model="formData.email" placeholder="juan@example.com" />
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Teléfono</label>
                      <input type="text" class="form-control" v-model="formData.telefono" placeholder="0000-0000" />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Departamento</label>
                      <select class="form-control" v-model="formData.department_id" @change="onDepartmentChange">
                        <option value="">Seleccionar...</option>
                        <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.nombre }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Cargo/Puesto</label>
                      <select class="form-control" v-model="formData.position_id">
                        <option value="">Seleccionar...</option>
                        <option v-for="pos in filteredPositions" :key="pos.id" :value="pos.id">{{ pos.nombre }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Fecha de Ingreso</label>
                      <input type="date" class="form-control" v-model="formData.fecha_ingreso" />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Salario</label>
                      <input type="number" step="0.01" class="form-control" v-model="formData.salario" placeholder="0.00" />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="status-toggle modal-status d-flex justify-content-between align-items-center mb-3">
                      <span class="status-label">Activo</span>
                      <input type="checkbox" id="add-is-active-employee" class="check" v-model="formData.is_active" />
                      <label for="add-is-active-employee" class="checktoggle"></label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting">Guardando...</span>
                  <span v-else>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Employee -->
  <div class="modal fade" id="edit-employee">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Editar Empleado</h4>
              </div>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form @submit.prevent="submitEditForm">
              <div class="modal-body">
                <div class="row">
                  <div class="col-lg-3">
                    <div class="mb-3">
                      <label class="form-label">Código</label>
                      <input type="text" class="form-control" v-model="editFormData.codigo" />
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Nombre <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="editFormData.nombre" required />
                    </div>
                  </div>
                  <div class="col-lg-5">
                    <div class="mb-3">
                      <label class="form-label">Apellido</label>
                      <input type="text" class="form-control" v-model="editFormData.apellido" />
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">DNI / Identidad</label>
                      <input type="text" class="form-control" v-model="editFormData.dni" placeholder="0801-1990-12345" />
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Email</label>
                      <input type="email" class="form-control" v-model="editFormData.email" />
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">Teléfono</label>
                      <input type="text" class="form-control" v-model="editFormData.telefono" />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Departamento</label>
                      <select class="form-control" v-model="editFormData.department_id" @change="onDepartmentChangeEdit">
                        <option value="">Seleccionar...</option>
                        <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.nombre }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Cargo/Puesto</label>
                      <select class="form-control" v-model="editFormData.position_id">
                        <option value="">Seleccionar...</option>
                        <option v-for="pos in filteredPositionsEdit" :key="pos.id" :value="pos.id">{{ pos.nombre }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Fecha de Ingreso</label>
                      <input type="date" class="form-control" v-model="editFormData.fecha_ingreso" />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label">Salario</label>
                      <input type="number" step="0.01" class="form-control" v-model="editFormData.salario" />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="status-toggle modal-status d-flex justify-content-between align-items-center mb-3">
                      <span class="status-label">Activo</span>
                      <input type="checkbox" id="edit-is-active-employee" class="check" v-model="editFormData.is_active" />
                      <label for="edit-is-active-employee" class="checktoggle"></label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting">Guardando...</span>
                  <span v-else>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- delete modal -->
  <div class="modal fade" id="delete-employee-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"
              ><i class="ti ti-trash fs-24 text-danger"></i
            ></span>
            <h4 class="fs-20 text-gray-9 fw-bold mb-2 mt-1">Eliminar Empleado</h4>
            <p class="text-gray-6 mb-0 fs-16">
              ¿Estás seguro de que deseas eliminar este empleado?
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
    employee: { type: Object, default: null },
    isEdit: { type: Boolean, default: false }
  },
  data() {
    return {
      formData: {
        codigo: '',
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        department_id: '',
        position_id: '',
        fecha_ingreso: '',
        salario: '',
        is_active: true
      },
      editFormData: {
        id: null,
        codigo: '',
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        department_id: '',
        position_id: '',
        fecha_ingreso: '',
        salario: '',
        is_active: true
      },
      departments: [],
      positions: [],
      isSubmitting: false
    };
  },
  computed: {
    filteredPositions() {
      if (!this.formData.department_id) return this.positions;
      return this.positions.filter(p => p.department_id == this.formData.department_id);
    },
    filteredPositionsEdit() {
      if (!this.editFormData.department_id) return this.positions;
      return this.positions.filter(p => p.department_id == this.editFormData.department_id);
    }
  },
  mounted() {
    this.fetchDepartments();
    this.fetchPositions();
  },
  watch: {
    employee: {
      handler(newVal) {
        if (newVal) {
          this.editFormData = {
            id: newVal.id,
            codigo: newVal.codigo || '',
            nombre: newVal.nombre,
            apellido: newVal.apellido || '',
            dni: newVal.dni || '',
            email: newVal.email || '',
            telefono: newVal.telefono || '',
            department_id: newVal.department_id || '',
            position_id: newVal.position_id || '',
            fecha_ingreso: newVal.fecha_ingreso ? newVal.fecha_ingreso.split('T')[0] : '',
            salario: newVal.salario || '',
            is_active: Boolean(newVal.is_active)
          };
        }
      },
      immediate: true
    }
  },
  methods: {
    async fetchDepartments() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/departments/active', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.departments = response.data.data || [];
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    },
    async fetchPositions() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/positions/active', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.positions = response.data.data || [];
      } catch (error) {
        console.error('Error fetching positions:', error);
      }
    },
    onDepartmentChange() {
      this.formData.position_id = '';
    },
    onDepartmentChangeEdit() {
      this.editFormData.position_id = '';
    },
    async submitAddForm() {
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3000/api/v1/employees', this.formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        this.formData = {
          codigo: '', nombre: '', apellido: '', dni: '', email: '', telefono: '',
          department_id: '', position_id: '', fecha_ingreso: '', salario: '', is_active: true
        };
        this.$emit('employee-saved');

        const modalElement = document.getElementById('add-employee');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Empleado creado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error creating employee:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear el empleado',
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

        await axios.put(`http://localhost:3000/api/v1/employees/${id}`, updateData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        this.$emit('employee-saved');

        const modalElement = document.getElementById('edit-employee');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Empleado actualizado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error updating employee:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar el empleado',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    async confirmDelete() {
      if (!this.employee || !this.employee.id) return;

      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/employees/${this.employee.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        this.$emit('employee-deleted');

        const modalElement = document.getElementById('delete-employee-modal');
        if (modalElement) {
          const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) closeButton.click();
        }

        this.$nextTick(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'Empleado eliminado exitosamente',
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
          });
        });
      } catch (error) {
        console.error('Error deleting employee:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar el empleado',
          confirmButtonColor: '#dc3545'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>
