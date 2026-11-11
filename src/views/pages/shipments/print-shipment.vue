<template>
  <div class="gr-page">
    <!-- Botones (solo en pantalla) -->
    <div class="gr-actions no-print">
      <button @click="printDocument" class="btn btn-success" :disabled="!html">
        <i class="ti ti-printer"></i> Imprimir
      </button>
      <button @click="exportToPDF" class="btn btn-danger" :disabled="!html">
        <i class="ti ti-file-type-pdf"></i> Guardar PDF
      </button>
      <button @click="exportToImage" class="btn btn-info" :disabled="!html">
        <i class="ti ti-photo"></i> Guardar Imagen
      </button>
    </div>

    <div v-if="html" ref="ticket" class="gr-preview" v-html="html"></div>
    <div v-else-if="error" class="gr-loading text-danger">{{ error }}</div>
    <div v-else class="gr-loading">Cargando guía de remisión...</div>
  </div>
</template>

<script>
import api from '@/api/config';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatDateOnly } from '@/utils/date';

const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Estilos del ticket (mismo formato que Reimpresiones de Ventas, 80 mm)
const TICKET_CSS = `
  .gr-ticket { font-family: Arial, sans-serif; color: #000; background: #fff; max-width: 80mm; margin: 0 auto; padding: 12px 18px; font-size: 13px; }
  .gr-ticket * { box-sizing: border-box; }
  .gr-header { text-align: center; margin-bottom: 2px; }
  .gr-logo img { max-width: 120px; height: auto; margin-bottom: 6px; }
  .gr-company { font-size: 13px; font-weight: 700; text-transform: uppercase; line-height: 1.3; margin: 4px 0; }
  .gr-details { font-size: 12px; line-height: 1.25; }
  .gr-title { font-size: 16px; font-weight: 700; text-align: center; margin: 6px 0 2px; text-transform: uppercase; }
  .gr-number { text-align: center; font-size: 14px; font-weight: 700; }
  .gr-badge { text-align: center; font-size: 13px; font-weight: 700; margin: 4px 0; padding: 2px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; }
  .gr-info { font-size: 13px; line-height: 1.3; margin: 4px 0; }
  .gr-info strong { font-weight: 700; }
  .gr-section { font-size: 13px; font-weight: 700; text-align: center; margin: 6px 0 2px; text-transform: uppercase; }
  .gr-dots { text-align: center; font-size: 12px; overflow: hidden; white-space: nowrap; }
  .gr-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .gr-table th { text-align: left; font-weight: 700; padding: 4px 3px; }
  .gr-table td { padding: 3px; vertical-align: top; }
  .gr-table .c { text-align: center; width: 40px; }
  .gr-conditions { font-size: 11px; line-height: 1.25; margin-top: 6px; }
  .gr-sign { margin-top: 26px; text-align: center; font-size: 12px; }
  .gr-sign .line { border-top: 1px solid #000; margin: 0 10px 2px; }
  .gr-footer { text-align: center; font-size: 11px; margin-top: 10px; }
`;

export default {
  name: 'PrintShipment',
  data() {
    return {
      shipment: null,
      company: {},
      logo: '',
      html: '',
      error: ''
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const id = this.$route.params.id;
        const [shipmentRes, billingRes, companyRes] = await Promise.allSettled([
          api.get(`/shipments/${id}`),
          api.get('/billing/settings'),
          api.get('/companies/default')
        ]);

        if (shipmentRes.status !== 'fulfilled' || !shipmentRes.value.data?.data) {
          throw new Error('No se encontró la guía de remisión');
        }
        this.shipment = shipmentRes.value.data.data;

        const billing = billingRes.status === 'fulfilled' ? (billingRes.value.data?.data || {}) : {};
        const company = companyRes.status === 'fulfilled' ? (companyRes.value.data?.data || companyRes.value.data || {}) : {};
        this.company = {
          name: company.commercial_name || company.company_name || billing.company_name || 'EMPRESA',
          rtn: company.rtn || billing.company_rtn || '',
          address: company.address || company.direccion || billing.company_address || '',
          phone: company.phone || company.telefono || billing.company_phone || '',
          whatsapp: company.whatsapp || '',
          email: company.email || billing.company_email || '',
          logo_url: company.logo_url || ''
        };

        this.logo = await this.loadLogo(this.company.logo_url);
        this.html = this.buildHTML();
      } catch (err) {
        console.error('Error loading shipment:', err);
        this.error = err.message || 'Error al cargar la guía de remisión';
      }
    },

    async loadLogo(url) {
      if (!url || !url.startsWith('http')) return '';
      try {
        const res = await api.get('/image-proxy', { params: { url } });
        return res.data?.success ? (res.data.data?.base64 || '') : '';
      } catch {
        return '';
      }
    },

    isPickup() {
      return this.shipment?.delivery_type === 'recoger';
    },

    formatTime(value) {
      if (!value) return '';
      const d = new Date(value);
      if (isNaN(d)) return '';
      return d.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', hour12: true });
    },

    formatQty(q) {
      const n = parseFloat(q || 0);
      return Number.isInteger(n) ? String(n) : n.toFixed(2);
    },

    receiverBlock(name, phone, doc) {
      if (!name) return '';
      return `${esc(name)}${phone ? `<br>Tel: ${esc(phone)}` : ''}${doc ? `<br>ID: ${esc(doc)}` : ''}`;
    },

    buildHTML() {
      const s = this.shipment;
      const c = this.company;
      const pickup = this.isPickup();
      const items = Array.isArray(s.items) ? s.items : [];
      const dots = '.'.repeat(90);

      const rows = items.length
        ? items.map(i => `
            <tr>
              <td class="c">${esc(this.formatQty(i.quantity))}</td>
              <td>${esc(i.product_name || i.description || '')}${i.product_code ? `<br><small>Cód: ${esc(i.product_code)}</small>` : ''}${i.unit ? ` <small>${esc(i.unit)}</small>` : ''}</td>
            </tr>`).join('')
        : '<tr><td colspan="2" style="text-align:center">Sin artículos registrados</td></tr>';

      const totalQty = items.reduce((sum, i) => sum + parseFloat(i.quantity || 0), 0);

      const alternates = [
        this.receiverBlock(s.receiver_alt_name, s.receiver_alt_phone, s.receiver_alt_id_document),
        this.receiverBlock(s.receiver_alt2_name, s.receiver_alt2_phone, s.receiver_alt2_id_document)
      ].filter(Boolean);

      const placeBlock = pickup
        ? `
          <div class="gr-section">Lugar de retiro</div>
          <div class="gr-info">
            ${esc(s.origin_address)}${s.origin_city ? `<br>${esc(s.origin_city)}${s.origin_state ? ', ' + esc(s.origin_state) : ''}` : ''}
            ${s.driver_name ? `<br><strong>Entrega en bodega:</strong> ${esc(s.driver_name)}` : ''}
          </div>`
        : `
          <div class="gr-section">Punto de partida</div>
          <div class="gr-info">
            ${esc(s.origin_address)}${s.origin_city ? `<br>${esc(s.origin_city)}${s.origin_state ? ', ' + esc(s.origin_state) : ''}` : ''}
          </div>
          <div class="gr-section">Punto de llegada</div>
          <div class="gr-info">
            ${esc(s.destination_address)}${s.destination_city ? `<br>${esc(s.destination_city)}${s.destination_state ? ', ' + esc(s.destination_state) : ''}` : ''}
            ${s.destination_reference ? `<br><strong>Referencia:</strong> ${esc(s.destination_reference)}` : ''}
          </div>
          <div class="gr-section">Transporte</div>
          <div class="gr-info">
            <strong>Conductor:</strong> ${esc(s.driver_name || 'N/A')}${s.driver_id ? ` (ID ${esc(s.driver_id)})` : ''}<br>
            ${s.driver_license ? `<strong>Licencia:</strong> ${esc(s.driver_license)}<br>` : ''}
            <strong>Vehículo:</strong> ${esc(s.vehicle_plate || 'N/A')}${s.vehicle_brand ? ' ' + esc(s.vehicle_brand) : ''}${s.vehicle_model ? ' ' + esc(s.vehicle_model) : ''}
            ${s.assistant_name ? `<br><strong>Acompañante:</strong> ${esc(s.assistant_name)}` : ''}
          </div>`;

      const conditions = pickup
        ? `
          <div>* El cliente o la persona autorizada debe presentar identificación al retirar.</div>
          <div>* Revise su producto antes de retirarse; no se aceptan cambios ni reclamos posteriores.</div>
          <div>* Una vez retirado, la empresa no se hace responsable por quebraduras o roturas.</div>`
        : `
          <div>* El servicio de flete incluye la descarga al pie del vehículo que entrega.</div>
          <div>* Debe haber una persona responsable para recibir.</div>
          <div>* No se aceptan cambios ni reclamos.</div>
          <div>* Una vez firmado el comprobante de entrega, la empresa no se hace responsable de quebraduras o roturas.</div>`;

      const signatures = pickup
        ? `
          <div class="gr-sign"><div class="line"></div>Entregado por (Bodega)<br>${esc(s.driver_name || '')}</div>
          <div class="gr-sign"><div class="line"></div>Retiré conforme (Cliente)</div>`
        : `
          <div class="gr-sign"><div class="line"></div>Entregado por<br>${esc(s.driver_name || '')}</div>
          <div class="gr-sign"><div class="line"></div>Recibí conforme (Cliente)</div>`;

      return `
        <style>${TICKET_CSS}</style>
        <div class="gr-ticket">
          <div class="gr-header">
            ${this.logo ? `<div class="gr-logo"><img src="${this.logo}" alt="Logo"></div>` : ''}
            <div class="gr-company">${esc(c.name)}</div>
            <div class="gr-details">
              ${c.rtn ? `<strong>RTN:</strong> ${esc(c.rtn)}<br>` : ''}
              ${c.address ? `<strong>Dirección:</strong> ${esc(c.address)}<br>` : ''}
              ${c.phone ? `<strong>Teléfono:</strong> ${esc(c.phone)}` : ''}${c.whatsapp ? `<br><strong>Móvil:</strong> ${esc(c.whatsapp)}` : ''}
              ${c.email ? `<br>${esc(c.email)}` : ''}
            </div>
          </div>

          <div class="gr-title">Guía de Remisión</div>
          <div class="gr-number">${esc(s.shipment_number)}</div>
          <div class="gr-badge">${pickup ? 'PARA RECOGER' : 'PARA ENVIAR'}</div>

          <div class="gr-info">
            <strong>Fecha:</strong> ${formatDateOnly(s.emission_date)} ${this.formatTime(s.created_at)}<br>
            ${s.invoice_number ? `<strong>Factura:</strong> ${esc(s.invoice_number)}<br>` : ''}
            <strong>Cliente:</strong> ${esc(s.customer_name || 'CONSUMIDOR FINAL')}<br>
            ${s.customer_document ? `<strong>RTN/ID:</strong> ${esc(s.customer_document)}<br>` : ''}
            <strong>${pickup ? 'Retira' : 'Recibe'}:</strong> ${this.receiverBlock(s.receiver_name, s.receiver_phone, s.receiver_id_document)}
            ${alternates.length ? `<br><strong>Autorizados:</strong><br>${alternates.join('<br>')}` : ''}
          </div>

          ${placeBlock}

          <table class="gr-table">
            <thead>
              <tr><td colspan="2" class="gr-dots">${dots}</td></tr>
              <tr><th class="c">Cant</th><th>Producto</th></tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr><td colspan="2" class="gr-dots">${dots}</td></tr>
              <tr><td class="c"><strong>${esc(this.formatQty(totalQty))}</strong></td><td><strong>Total artículos (${items.length})</strong></td></tr>
            </tfoot>
          </table>

          ${s.notes ? `<div class="gr-info"><strong>Notas:</strong> ${esc(s.notes)}</div>` : ''}

          <div class="gr-conditions">${conditions}</div>

          ${signatures}

          <div class="gr-footer">Documento no fiscal · Control de entrega</div>
        </div>`;
    },

    printDocument() {
      const w = window.open('', '_blank');
      if (!w) {
        alert('Permita las ventanas emergentes para imprimir.');
        return;
      }
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Guía ${esc(this.shipment.shipment_number)}</title>
        <style>
          body { margin: 0; padding: 0; background: #fff; }
          @media print { @page { size: 80mm auto; margin: 2mm; } .gr-ticket { padding: 5px; } }
        </style></head><body>${this.html}</body></html>`);
      w.document.close();
      w.onload = () => { w.focus(); w.print(); };
    },

    async renderCanvas() {
      const el = this.$refs.ticket?.querySelector('.gr-ticket');
      return html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
    },

    async exportToPDF() {
      try {
        const canvas = await this.renderCanvas();
        const widthMm = 80;
        const heightMm = (canvas.height * widthMm) / canvas.width;
        const pdf = new jsPDF('p', 'mm', [widthMm, heightMm]);
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, widthMm, heightMm);
        pdf.save(`guia_remision_${this.shipment.shipment_number}.pdf`);
      } catch (err) {
        console.error('Error exporting PDF:', err);
        alert('Error al generar el PDF');
      }
    },

    async exportToImage() {
      try {
        const canvas = await this.renderCanvas();
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `guia_remision_${this.shipment.shipment_number}.png`;
          a.click();
          URL.revokeObjectURL(url);
        });
      } catch (err) {
        console.error('Error exporting image:', err);
        alert('Error al generar la imagen');
      }
    }
  }
};
</script>

<style scoped>
.gr-page { background: #f2f2f2; min-height: 100vh; padding: 20px 10px; }
.gr-actions { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; flex-wrap: wrap; }
.gr-preview { background: #fff; max-width: 80mm; margin: 0 auto; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12); }
.gr-loading { text-align: center; padding: 40px; }
@media print {
  .no-print { display: none !important; }
  .gr-page { background: #fff; padding: 0; }
  .gr-preview { box-shadow: none; }
}
</style>
