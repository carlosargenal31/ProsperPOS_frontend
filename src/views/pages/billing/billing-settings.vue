<template>
  <div class="billing-settings">
    <div class="settings-header">
      <h1>
        <i class="ti ti-settings"></i>
        Configuración de Facturación
      </h1>
      <button @click="saveSettings" class="btn-save" :disabled="loading">
        <i class="ti ti-check"></i>
        Guardar Cambios
      </button>
    </div>

    <div v-if="loading && !settings.id" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando configuración...</p>
    </div>

    <div v-else class="settings-content">
      <!-- Company Information -->
      <div class="settings-card">
        <h3>
          <i class="ti ti-building"></i>
          Información de la Empresa
        </h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Nombre de la Empresa <span class="required">*</span></label>
            <input
              type="text"
              v-model="settings.company_name"
              class="form-control"
              placeholder="Ej: Mi Empresa S.A."
              required
            />
          </div>

          <div class="form-group">
            <label>RTN / Tax ID</label>
            <input
              type="text"
              v-model="settings.company_rtn"
              class="form-control"
              placeholder="00000000000000"
              maxlength="14"
            />
          </div>

          <div class="form-group full-width">
            <label>Dirección</label>
            <textarea
              v-model="settings.company_address"
              class="form-control"
              rows="2"
              placeholder="Dirección completa de la empresa"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              v-model="settings.company_phone"
              class="form-control"
              placeholder="0000-0000"
            />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              v-model="settings.company_email"
              class="form-control"
              placeholder="contacto@empresa.com"
            />
          </div>

          <div class="form-group">
            <label>Sitio Web</label>
            <input
              type="url"
              v-model="settings.company_website"
              class="form-control"
              placeholder="https://www.empresa.com"
            />
          </div>
        </div>
      </div>

      <!-- Invoice Numbering -->
      <div class="settings-card">
        <h3>
          <i class="ti ti-hash"></i>
          Numeración de Facturas
        </h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Prefijo de Factura <span class="required">*</span></label>
            <input
              type="text"
              v-model="settings.invoice_prefix"
              class="form-control"
              placeholder="FAC"
              maxlength="10"
              required
            />
          </div>

          <div class="form-group">
            <label>Último Número de Factura</label>
            <input
              type="number"
              v-model.number="settings.last_invoice_number"
              class="form-control"
              min="0"
            />
            <small>Próxima factura será: {{ settings.invoice_prefix }}-{{ String(settings.last_invoice_number + 1).padStart(settings.invoice_number_length, '0') }}</small>
          </div>

          <div class="form-group">
            <label>Longitud del Número</label>
            <input
              type="number"
              v-model.number="settings.invoice_number_length"
              class="form-control"
              min="4"
              max="10"
            />
            <small>Ejemplo: 6 = 000001</small>
          </div>

          <div class="form-group">
            <label>Prefijo Nota de Crédito</label>
            <input
              type="text"
              v-model="settings.credit_note_prefix"
              class="form-control"
              placeholder="NC"
              maxlength="10"
            />
          </div>
        </div>
      </div>

      <!-- Default Settings -->
      <div class="settings-card">
        <h3>
          <i class="ti ti-adjustments"></i>
          Configuración por Defecto
        </h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Términos de Pago (días)</label>
            <input
              type="number"
              v-model.number="settings.default_payment_terms"
              class="form-control"
              min="0"
              placeholder="30"
            />
            <small>Días por defecto para pago a crédito</small>
          </div>

          <div class="form-group">
            <label>Tasa de Impuesto (%)</label>
            <input
              type="number"
              v-model.number="settings.default_tax_rate"
              class="form-control"
              min="0"
              max="100"
              step="0.01"
              placeholder="15.00"
            />
          </div>

          <div class="form-group">
            <label>Moneda</label>
            <select v-model="settings.default_currency" class="form-control">
              <option value="HNL">Lempira (HNL)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Display Options -->
      <div class="settings-card">
        <h3>
          <i class="ti ti-eye"></i>
          Opciones de Visualización
        </h3>
        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="settings.show_company_logo"
              :true-value="1"
              :false-value="0"
            />
            <span>Mostrar logo de la empresa en facturas</span>
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="settings.show_tax_breakdown"
              :true-value="1"
              :false-value="0"
            />
            <span>Mostrar desglose de impuestos</span>
          </label>
        </div>

        <div class="form-group full-width">
          <label>Texto del Pie de Página</label>
          <textarea
            v-model="settings.invoice_footer_text"
            class="form-control"
            rows="3"
            placeholder="Texto que aparecerá al final de cada factura"
          ></textarea>
        </div>

        <div class="form-group full-width">
          <label>Notas por Defecto</label>
          <textarea
            v-model="settings.invoice_notes"
            class="form-control"
            rows="2"
            placeholder="Notas que aparecerán en las facturas por defecto"
          ></textarea>
        </div>
      </div>

      <!-- Email Settings -->
      <div class="settings-card">
        <h3>
          <i class="ti ti-mail"></i>
          Configuración de Email
        </h3>
        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="settings.enable_auto_email"
              :true-value="1"
              :false-value="0"
            />
            <span>Enviar facturas por email automáticamente</span>
          </label>
        </div>

        <div class="form-group full-width">
          <label>Asunto del Email</label>
          <input
            type="text"
            v-model="settings.email_subject"
            class="form-control"
            placeholder="Nueva Factura"
          />
        </div>

        <div class="form-group full-width">
          <label>Cuerpo del Email</label>
          <textarea
            v-model="settings.email_body"
            class="form-control"
            rows="4"
            placeholder="Contenido del email que se enviará con la factura"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const settings = ref({
  company_name: '',
  company_rtn: '',
  company_address: '',
  company_phone: '',
  company_email: '',
  company_website: '',
  invoice_prefix: 'FAC',
  last_invoice_number: 0,
  invoice_number_length: 6,
  credit_note_prefix: 'NC',
  default_payment_terms: 30,
  default_tax_rate: 15.00,
  default_currency: 'HNL',
  show_company_logo: 1,
  show_tax_breakdown: 1,
  invoice_footer_text: '',
  invoice_notes: '',
  enable_auto_email: 0,
  email_subject: 'Nueva Factura',
  email_body: ''
});

const loading = ref(false);

const loadSettings = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/v1/billing/settings');
    settings.value = { ...settings.value, ...response.data.data };
  } catch (error) {
    console.error('Error loading settings:', error);
    Swal.fire('Error', 'Error al cargar la configuración', 'error');
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  loading.value = true;
  try {
    await axios.put('/api/v1/billing/settings', settings.value);
    Swal.fire('¡Éxito!', 'Configuración guardada correctamente', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    Swal.fire('Error', error.response?.data?.message || 'Error al guardar la configuración', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.billing-settings {
  padding: 1.5rem;
  background: #f5f7fa;
  min-height: 100vh;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.settings-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.settings-card h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

small {
  font-size: 0.75rem;
  color: #6b7280;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: #f9fafb;
}

.checkbox-label input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.checkbox-label span {
  font-weight: 500;
  color: #374151;
}
</style>
