<template>
  <div class="print-container">
    <!-- Botones de exportación (solo en pantalla, no se imprimen) -->
    <div class="export-buttons no-print">
      <button @click="exportToPDF" class="btn btn-danger">
        <i class="ti ti-file-type-pdf"></i> Guardar PDF
      </button>
      <button @click="exportToImage" class="btn btn-info">
        <i class="ti ti-photo"></i> Guardar Imagen
      </button>
      <button @click="printDocument" class="btn btn-success">
        <i class="ti ti-printer"></i> Imprimir
      </button>
    </div>

    <div class="print-content" v-if="shipment && billingSettings">
      <!-- Company Header -->
      <div class="company-header">
        <h1 class="company-name">{{ billingSettings.company_name || 'Ceramicas Terrazos y Pulidos Universal' }}</h1>
        <div class="company-details">
          <p><strong>Cedula:</strong> {{ billingSettings.company_rtn || '0106197700251' }}</p>
          <p><strong>Sucursal:</strong> {{ billingSettings.commercial_name || 'SUCURSAL PRINCIPAL' }}</p>
          <p><strong>Teléfono:</strong> {{ billingSettings.company_phone || '+504 2440-0037' }} <strong>Email:</strong> {{ billingSettings.company_email || 'mauricio_argenal@hotmail.com' }}</p>
          <p><strong>Dirección:</strong> {{ billingSettings.company_address || 'Casa Matriz, Barrio La Merced, Avenida 14 de Julio entre 15 y 16 calle frente a Repuestos del Atlántico, La Ceiba, Atlántida' }}</p>
        </div>
      </div>

      <!-- Document Title -->
      <div class="doc-title">
        <h2>GUÍA DE REMISIÓN: <span class="guide-number">{{ shipment.shipment_number }}</span></h2>
      </div>

      <!-- Emission Info -->
      <div class="emission-info">
        <div class="info-row">
          <div class="info-item">
            <strong>Emisión:</strong> {{ formatDateTime(shipment.created_at) }}
          </div>
          <div class="info-item" v-if="shipment.estimated_delivery_date">
            <strong>Vence:</strong> {{ formatDate(shipment.estimated_delivery_date) }}
          </div>
        </div>
      </div>

      <!-- Driver and Vehicle Section -->
      <div class="section">
        <div class="section-header">Datos del Conductor y Vehículo</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>#Licencia</th>
              <th>Placa</th>
              <th>Vehículo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ shipment.driver_id || 'N/A' }}</td>
              <td>{{ shipment.driver_name || 'N/A' }}</td>
              <td>{{ shipment.driver_license || 'N/A' }}</td>
              <td>{{ shipment.vehicle_plate || 'N/A' }}</td>
              <td>{{ getVehicleInfo() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Departure and Arrival Points -->
      <div class="points-container">
        <div class="point-box">
          <strong>Punto de partida:</strong>
          <p>{{ shipment.origin_address }}</p>
        </div>
        <div class="point-box">
          <strong>Punto de llegada:</strong>
          <p>{{ shipment.destination_address }}</p>
        </div>
      </div>

      <!-- Involved Documents -->
      <div class="section">
        <div class="section-header">Documentos Involucrados</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#Doc</th>
              <th>Cliente</th>
              <th>Artículo(s)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ getDocumentNumber() }}</td>
              <td>{{ shipment.customer_name }}</td>
              <td>{{ getTotalQuantity() }}</td>
            </tr>
            <tr>
              <td colspan="3"><strong>({{ getItemsCount() }}) Registros</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Articles Detail -->
      <div class="section">
        <div class="section-header">Detalle de Artículos</div>
        <table class="articles-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Artículo</th>
              <th>Peso/Unit</th>
              <th>Cantidad</th>
              <th>PesoTotal</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="shipment.items && shipment.items.length > 0">
              <tr v-for="(item, index) in shipment.items" :key="index">
                <td class="text-center">{{ item.product_code || item.code || 'N/A' }}</td>
                <td>{{ item.product_name || item.name || item.description || 'N/A' }}</td>
                <td class="text-right">{{ formatWeight(item.weight) }}</td>
                <td class="text-right">{{ formatQuantity(item.quantity) }}</td>
                <td class="text-right">{{ formatTotalWeight(item.weight, item.quantity) }}</td>
              </tr>
              <!-- Totals Row -->
              <tr class="totals-row">
                <td colspan="4" class="text-right"><strong>Total Artículos: {{ shipment.items.length }}</strong></td>
                <td class="text-right"><strong>{{ getTotalWeight() }}</strong></td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="5" class="text-center">Sin artículos registrados</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Notes -->
      <div class="notes-section" v-if="shipment.notes || shipment.assistant_name">
        <strong>Notas:</strong> {{ shipment.notes || '' }} {{ shipment.assistant_name ? shipment.assistant_name + ' ' + (shipment.assistant_phone || '') : '' }}
      </div>

      <!-- Delivery Conditions -->
      <div class="conditions">
        <h4>Condiciones de entrega</h4>
        <ul>
          <li>* Nuestro servicio de fleta incluye la descarga del producto al <strong>pie del vehículo</strong> que entrega.</li>
          <li>* Al momento de entregar debe haber una persona responsable encargada de recibir.</li>
          <li>* No se aceptan cambios, ni reclamos.</li>
          <li>* Una vez firmado el comprobante de entrega o una vez en el <strong>piso en su obra</strong>, la empresa no se hace responsable de quebraduras o roturas.</li>
          <li>* Nuestra Responsabilidad termina una vez entregado el producto.</li>
        </ul>
      </div>

      <!-- Signatures -->
      <div class="signatures">
        <div class="signature-line">
          <p>Firma del Motorista (Empleado que entrega)</p>
          <div class="line">_________________________________________</div>
          <p class="small">Nombre: {{ shipment.driver_name || '_____________________' }}</p>
        </div>
        <div class="signature-line">
          <p>Recibí Cliente</p>
          <div class="line">_________________________________________</div>
          <p class="small">Nombre: _____________________</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading">
      <p>Cargando guía de remisión...</p>
    </div>
  </div>
</template>

<script>
import api from '@/api/config';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default {
  name: 'PrintShipment',
  data() {
    return {
      shipment: null,
      billingSettings: null
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const shipmentId = this.$route.params.id;

        // Load shipment and billing settings in parallel
        const [shipmentResponse, billingResponse] = await Promise.all([
          api.get(`/shipments/${shipmentId}`),
          api.get('/billing/settings')
        ]);

        this.shipment = shipmentResponse.data?.data;
        this.billingSettings = billingResponse.data?.data;

        console.log('Shipment loaded:', this.shipment);
        console.log('Items:', this.shipment?.items);
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Error al cargar la guía de remisión');
      }
    },

    printDocument() {
      window.print();
    },

    async exportToPDF() {
      try {
        const element = document.querySelector('.print-content');
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'letter');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`guia_remision_${this.shipment.shipment_number}.pdf`);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error al generar el PDF');
      }
    },

    async exportToImage() {
      try {
        const element = document.querySelector('.print-content');
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `guia_remision_${this.shipment.shipment_number}.png`;
          a.click();
          URL.revokeObjectURL(url);
        });
      } catch (error) {
        console.error('Error exporting image:', error);
        alert('Error al generar la imagen');
      }
    },

    formatDate(date) {
      if (!date) return 'N/A';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },

    formatDateTime(datetime) {
      if (!datetime) return 'N/A';
      const d = new Date(datetime);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} / ${hours}:${minutes}:${seconds} AM`;
    },

    getVehicleInfo() {
      if (!this.shipment) return 'N/A';
      const parts = [];
      if (this.shipment.vehicle_brand) parts.push(this.shipment.vehicle_brand);
      if (this.shipment.vehicle_model) parts.push(this.shipment.vehicle_model);
      if (this.shipment.vehicle_type) parts.push(`(${this.shipment.vehicle_type})`);
      return parts.length > 0 ? parts.join(' ') : 'N/A';
    },

    getDocumentNumber() {
      if (this.shipment?.invoice_id) {
        return `DOC-${this.shipment.invoice_id}`;
      }
      return '000-002-01-00031863';
    },

    getTotalQuantity() {
      if (!this.shipment?.items || this.shipment.items.length === 0) return '0.00';
      const total = this.shipment.items.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity) || 0);
      }, 0);
      return total.toFixed(2);
    },

    getItemsCount() {
      return this.shipment?.items?.length || 0;
    },

    formatWeight(weight) {
      const w = parseFloat(weight) || 0;
      return w.toFixed(2);
    },

    formatQuantity(qty) {
      const q = parseFloat(qty) || 0;
      return q.toFixed(2);
    },

    formatTotalWeight(weight, qty) {
      const w = parseFloat(weight) || 0;
      const q = parseFloat(qty) || 0;
      return (w * q).toFixed(2);
    },

    getTotalWeight() {
      if (!this.shipment?.items || this.shipment.items.length === 0) return '0.00';
      const total = this.shipment.items.reduce((sum, item) => {
        const w = parseFloat(item.weight) || 0;
        const q = parseFloat(item.quantity) || 0;
        return sum + (w * q);
      }, 0);
      return total.toFixed(2);
    }
  }
};
</script>

<style scoped>
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.print-container {
  width: 21.59cm;
  min-height: 27.94cm;
  margin: 0 auto;
  padding: 1cm;
  background: white;
  font-family: Arial, sans-serif;
  font-size: 10pt;
  color: #000;
}

.print-content {
  width: 100%;
}

/* Company Header */
.company-header {
  text-align: center;
  margin-bottom: 15px;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}

.company-name {
  font-size: 16pt;
  font-weight: bold;
  margin: 0;
  color: #000;
}

.company-subtitle {
  font-size: 12pt;
  margin: 5px 0;
}

.company-details {
  font-size: 9pt;
  margin-top: 8px;
}

.company-details p {
  margin: 2px 0;
}

/* Document Title */
.doc-title {
  text-align: center;
  margin: 15px 0;
}

.doc-title h2 {
  font-size: 14pt;
  font-weight: bold;
  margin: 0;
}

.guide-number {
  color: #c00000;
}

/* Emission Info */
.emission-info {
  margin: 15px 0;
  border: 1px solid #000;
  padding: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

.info-item {
  flex: 1;
}

/* Section Styles */
.section {
  margin: 15px 0;
}

.section-header {
  background-color: #4472c4;
  color: white;
  padding: 6px;
  font-weight: bold;
  text-align: center;
  font-size: 11pt;
}

/* Tables */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
}

.data-table th,
.data-table td {
  border: 1px solid #000;
  padding: 5px;
  font-size: 9pt;
}

.data-table th {
  background-color: #d9e1f2;
  font-weight: bold;
  text-align: center;
}

.data-table td {
  text-align: center;
}

/* Articles Table */
.articles-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
}

.articles-table th,
.articles-table td {
  border: 1px solid #000;
  padding: 5px;
  font-size: 9pt;
}

.articles-table th {
  background-color: #d9e1f2;
  font-weight: bold;
  text-align: center;
}

.articles-table td {
  vertical-align: top;
}

.articles-table td:nth-child(1) {
  width: 12%;
  text-align: center;
}

.articles-table td:nth-child(2) {
  width: 40%;
  text-align: left;
}

.articles-table td:nth-child(3),
.articles-table td:nth-child(4),
.articles-table td:nth-child(5) {
  width: 16%;
  text-align: right;
}

.totals-row {
  font-weight: bold;
  background-color: #f0f0f0;
}

/* Points Container */
.points-container {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.point-box {
  flex: 1;
  border: 1px solid #000;
  padding: 8px;
  font-size: 9pt;
}

.point-box strong {
  display: block;
  margin-bottom: 5px;
}

.point-box p {
  margin: 0;
}

/* Notes */
.notes-section {
  margin: 15px 0;
  padding: 8px;
  border: 1px solid #000;
  font-size: 9pt;
}

/* Conditions */
.conditions {
  margin: 15px 0;
  page-break-inside: avoid;
}

.conditions h4 {
  font-size: 11pt;
  margin-bottom: 8px;
  font-weight: bold;
}

.conditions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.conditions li {
  margin: 4px 0;
  font-size: 9pt;
  line-height: 1.4;
}

/* Signatures */
.signatures {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  page-break-inside: avoid;
}

.signature-line {
  flex: 1;
  text-align: center;
  margin: 0 10px;
}

.signature-line p {
  margin: 5px 0;
  font-size: 9pt;
  font-weight: bold;
}

.signature-line .line {
  margin: 20px 0 10px 0;
  border-bottom: 1px solid #000;
  width: 100%;
}

.signature-line .small {
  font-size: 8pt;
  font-weight: normal;
}

/* Utility Classes */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

/* Loading State */
.loading {
  text-align: center;
  padding: 50px;
  font-size: 14pt;
}

/* Print Styles */
@media print {
  @page {
    size: letter;
    margin: 0.5cm;
  }

  body {
    margin: 0;
    padding: 0;
  }

  .print-container {
    width: 100%;
    margin: 0;
    padding: 0.5cm;
    box-shadow: none;
  }

  .section-header {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }

  .data-table th,
  .articles-table th {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }

  .totals-row {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
}

/* Screen Preview */
@media screen {
  .print-container {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    margin: 20px auto;
  }
}

/* Export Buttons */
.export-buttons {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 1000;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.export-buttons .btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.export-buttons .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.export-buttons .btn-danger {
  background-color: #dc3545;
}

.export-buttons .btn-info {
  background-color: #17a2b8;
}

.export-buttons .btn-success {
  background-color: #28a745;
}

.no-print {
  display: block;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
