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
            <a data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh"><i class="ti ti-refresh"></i></a>
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
                <h4 class="fs-18 fw-bold">Plantilla de Factura</h4>
              </div>
              <div class="card-body">
                <!-- Format Selection -->
                <div class="border-bottom mb-3 pb-3">
                  <div class="card-title-head">
                    <h6 class="fs-16 fw-bold mb-2">
                      <span class="fs-16 me-2"><i class="ti ti-layout"></i></span>
                      Formato de Impresión
                    </h6>
                  </div>
                  <div class="row">
                    <div class="col-md-4 mb-3" v-for="format in formats" :key="format.id">
                      <div class="card template-card" :class="{ 'selected': selectedFormat === format.id }" @click="selectFormat(format.id)">
                        <div class="card-body text-center">
                          <i :class="format.icon" class="template-icon"></i>
                          <h6 class="mt-2">{{ format.name }}</h6>
                          <p class="text-muted small">{{ format.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Preview Button -->
                <div class="text-end mt-3">
                  <button type="button" class="btn btn-primary" @click="showPreview">
                    <i class="ti ti-eye me-1"></i>
                    Vista Previa de Factura
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div class="modal fade" id="invoicePreviewModal" tabindex="-1">
      <div class="modal-dialog" :class="getModalSize()">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Vista Previa - {{ getCurrentFormatName() }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <!-- Ticket Format -->
            <div v-if="selectedFormat === 'ticket'" class="invoice-preview ticket-format">
              <div style="width: 80mm; margin: 0 auto; font-family: monospace; font-size: 12px;">
                <div style="text-align: center; margin-bottom: 10px;">
                  <img src="https://via.placeholder.com/150x50/0052A3/FFFFFF?text=UNIVERSAL" alt="Logo" style="max-width: 120px;">
                </div>
                <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
                  <strong>CERAMICAS TERRAZOS Y PULIDOS UNIVERSAL</strong><br>
                  RTN: 01061977002516<br>
                  Casa Matriz, Barrio La Merced<br>
                  La Ceiba, Atlántida<br>
                  Tel: +504 2440-0037<br>
                  Móvil: +504 9875-2725<br>
                  mauricio_argenal@hotmail.com
                </div>

                <div style="border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
                  <strong>FACTURA: 000-002-01-00031792</strong><br>
                  CAI: 2A9170-F8828A-8815E0-63BE03-090956-9D<br>
                  Fecha: 05/11/2025 02:43 PM<br>
                  Cliente: CONSUMIDOR FINAL<br>
                  Vendedor: DANIEL ARGEÑAL
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
                  <thead style="border-bottom: 1px dashed #000;">
                    <tr>
                      <th style="text-align: left; padding: 4px 0;">Cant</th>
                      <th style="text-align: left; padding: 4px 0;">Artículo</th>
                      <th style="text-align: right; padding: 4px 0;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding: 4px 0;">12.96</td>
                      <td style="padding: 4px 0;">PORCELANATO PISATO<br>60X120CM</td>
                      <td style="text-align: right; padding: 4px 0;">9,007.20</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0;">4.00</td>
                      <td style="padding: 4px 0;">PERFIL METALICO PLATA</td>
                      <td style="text-align: right; padding: 4px 0;">1,180.00</td>
                    </tr>
                  </tbody>
                </table>

                <div style="border-top: 1px dashed #000; padding-top: 8px;">
                  <div style="display: flex; justify-content: space-between; margin: 2px 0;">
                    <span>SUB TOTAL:</span>
                    <span>L 10,382.20</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 2px 0;">
                    <span>I.S.V 15%:</span>
                    <span>L 1,557.33</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold; font-size: 14px;">
                    <span>TOTAL A PAGAR:</span>
                    <span>L 12,839.53</span>
                  </div>
                </div>

                <div style="border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; text-align: center; font-size: 10px;">
                  Rango: 000-002-01-00030001 A 000-002-01-00040000<br>
                  Fecha Límite: 31/12/2025<br><br>
                  Original: Cliente/Copia: Obligado Tributario Emisor.<br>
                  ¡La Factura es beneficio de todos. Exíjala!
                </div>
              </div>
            </div>

            <!-- Standard Format (Full Page) -->
            <div v-if="selectedFormat === 'standard'" class="invoice-preview standard-format">
              <div style="width: 21cm; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; font-size: 11px;">
                <table style="width: 100%; margin-bottom: 20px;">
                  <tr>
                    <td style="width: 30%;">
                      <img src="https://via.placeholder.com/200x80/0052A3/FFFFFF?text=UNIVERSAL" alt="Logo" style="max-width: 180px;">
                    </td>
                    <td style="width: 70%; text-align: right;">
                      <h3 style="margin: 0; color: #0052A3;">FACTURA</h3>
                      <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">000-002-01-00031792</p>
                    </td>
                  </tr>
                </table>

                <table style="width: 100%; border: 2px solid #0052A3; margin-bottom: 20px;">
                  <tr>
                    <td style="width: 60%; padding: 10px; vertical-align: top;">
                      <strong style="color: #0052A3;">CERAMICAS TERRAZOS Y PULIDOS UNIVERSAL</strong><br>
                      RTN: 01061977002516<br>
                      Casa Matriz, Barrio La Merced, Avenida 14 de Julio<br>
                      entre 15 y 16 calle frente a Repuestos del Atlántico<br>
                      La Ceiba, Atlántida<br>
                      Tel: +504 2440-0037 | Móvil: +504 9875-2725<br>
                      mauricio_argenal@hotmail.com
                    </td>
                    <td style="width: 40%; padding: 10px; vertical-align: top; border-left: 2px solid #0052A3;">
                      <strong>Cliente:</strong> CONSUMIDOR FINAL<br>
                      <strong>RTN:</strong> 00000000000000<br>
                      <strong>Fecha:</strong> 05/11/2025<br>
                      <strong>Vencimiento:</strong> 12/11/2025<br>
                      <strong>Vendedor:</strong> DANIEL ARGEÑAL<br>
                      <strong>Condición:</strong> CONTADO
                    </td>
                  </tr>
                </table>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <thead style="background-color: #0052A3; color: white;">
                    <tr>
                      <th style="border: 1px solid #0052A3; padding: 8px; text-align: left;">Código</th>
                      <th style="border: 1px solid #0052A3; padding: 8px; text-align: left;">Nombre</th>
                      <th style="border: 1px solid #0052A3; padding: 8px; text-align: right;">P.Unitario</th>
                      <th style="border: 1px solid #0052A3; padding: 8px; text-align: center;">Cantidad</th>
                      <th style="border: 1px solid #0052A3; padding: 8px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">C-0286-9</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">PORCELANATO PISATO NATURAL 60X120CM (1.44MT2-2PZS)</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">695.00</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">12.96</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">9,007.20</td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">C-0263-9</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">PERFIL METALICO PLATA BRILLANTE</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">295.00</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">4.00</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">1,180.00</td>
                    </tr>
                  </tbody>
                </table>

                <table style="width: 100%;">
                  <tr>
                    <td style="width: 60%; vertical-align: top;">
                      <div style="border: 1px solid #ddd; padding: 10px; min-height: 100px;">
                        <strong>CAI:</strong> 2A9170-F8828A-8815E0-63BE03-090956-9D<br>
                        <strong>Rango Autorizado:</strong> 000-002-01-00030001 A 000-002-01-00040000<br>
                        <strong>Fecha Límite de Emisión:</strong> 31/12/2025
                      </div>
                    </td>
                    <td style="width: 40%; padding-left: 10px; vertical-align: top;">
                      <table style="width: 100%;">
                        <tr>
                          <td style="padding: 5px 0;">SUB TOTAL:</td>
                          <td style="text-align: right; padding: 5px 0;">L 10,382.20</td>
                        </tr>
                        <tr>
                          <td style="padding: 5px 0;">I.S.V 15%:</td>
                          <td style="text-align: right; padding: 5px 0;">L 1,557.33</td>
                        </tr>
                        <tr style="border-top: 2px solid #0052A3;">
                          <td style="padding: 8px 0; font-weight: bold; font-size: 14px;">TOTAL A PAGAR:</td>
                          <td style="text-align: right; padding: 8px 0; font-weight: bold; font-size: 14px;">L 12,839.53</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <div style="margin-top: 30px; text-align: center; font-size: 10px; border-top: 1px solid #ddd; padding-top: 10px;">
                  Original: Cliente/Copia: Obligado Tributario Emisor. ¡La Factura es beneficio de todos. Exíjala!
                </div>
              </div>
            </div>

            <!-- Half Page Format -->
            <div v-if="selectedFormat === 'half-page'" class="invoice-preview half-page-format">
              <div style="width: 21cm; margin: 0 auto; padding: 15px; font-family: Arial, sans-serif; font-size: 10px;">
                <table style="width: 100%; margin-bottom: 10px;">
                  <tr>
                    <td style="width: 40%;">
                      <img src="https://via.placeholder.com/150x60/0052A3/FFFFFF?text=UNIVERSAL" alt="Logo" style="max-width: 140px;">
                    </td>
                    <td style="width: 60%; text-align: right;">
                      <strong style="font-size: 12px;">CERAMICAS TERRAZOS Y PULIDOS UNIVERSAL</strong><br>
                      RTN: 01061977002516<br>
                      La Ceiba, Atlántida<br>
                      Tel: +504 2440-0037
                    </td>
                  </tr>
                </table>

                <table style="width: 100%; border: 1px solid #000; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 8px; width: 50%; border-right: 1px solid #000;">
                      <strong>FACTURA:</strong> 000-002-01-00031792<br>
                      <strong>Fecha:</strong> 05/11/2025<br>
                      <strong>Cliente:</strong> CONSUMIDOR FINAL
                    </td>
                    <td style="padding: 8px; width: 50%;">
                      <strong>Vendedor:</strong> DANIEL ARGEÑAL<br>
                      <strong>Condición:</strong> CONTADO
                    </td>
                  </tr>
                </table>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px;">
                  <thead style="background-color: #0052A3; color: white;">
                    <tr>
                      <th style="border: 1px solid #000; padding: 5px; text-align: left;">Artículo</th>
                      <th style="border: 1px solid #000; padding: 5px; text-align: center;">Cant</th>
                      <th style="border: 1px solid #000; padding: 5px; text-align: right;">P.Unit</th>
                      <th style="border: 1px solid #000; padding: 5px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 5px;">PORCELANATO PISATO 60X120CM</td>
                      <td style="border: 1px solid #ddd; padding: 5px; text-align: center;">12.96</td>
                      <td style="border: 1px solid #ddd; padding: 5px; text-align: right;">695.00</td>
                      <td style="border: 1px solid #ddd; padding: 5px; text-align: right;">9,007.20</td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 5px;">PERFIL METALICO PLATA</td>
                      <td style="border: 1px solid #ddd; padding: 5px; text-align: center;">4.00</td>
                      <td style="border: 1px solid #ddd; padding: 5px; text-align: right;">295.00</td>
                      <td style="border: 1px solid #ddd; padding: 5px; text-align: right;">1,180.00</td>
                    </tr>
                  </tbody>
                </table>

                <table style="width: 100%; margin-bottom: 10px;">
                  <tr>
                    <td style="width: 50%; vertical-align: top; font-size: 8px;">
                      CAI: 2A9170-F8828A-8815E0-63BE03-090956-9D<br>
                      Rango: 30001-40000 | Vence: 31/12/2025
                    </td>
                    <td style="width: 50%; text-align: right;">
                      <table style="width: 100%; font-size: 10px;">
                        <tr>
                          <td>Subtotal:</td>
                          <td style="text-align: right;">L 10,382.20</td>
                        </tr>
                        <tr>
                          <td>ISV 15%:</td>
                          <td style="text-align: right;">L 1,557.33</td>
                        </tr>
                        <tr style="border-top: 1px solid #000; font-weight: bold;">
                          <td>TOTAL:</td>
                          <td style="text-align: right;">L 12,839.53</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <div style="text-align: center; font-size: 8px; border-top: 1px solid #000; padding-top: 5px;">
                  Original: Cliente/Copia: Obligado Tributario Emisor. ¡La Factura es beneficio de todos. Exíjala!
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-primary" @click="printInvoice">
              <i class="ti ti-printer me-1"></i>
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="customizer-links" id="setdata">
      <ul class="sticky-sidebar">
        <li class="sidebar-icons">
          <a href="#" class="navigation-add" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-original-title="Theme">
            <i class="ti ti-brightness-up"></i>
          </a>
        </li>
        <li class="sidebar-icons">
          <a href="#" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-original-title="Settings">
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
export default {
  data() {
    return {
      selectedFormat: 'ticket',
      formats: [
        {
          id: 'ticket',
          name: 'Formato Ticket',
          description: 'Para impresoras de tickets (80mm)',
          icon: 'ti ti-receipt fs-1 text-primary'
        },
        {
          id: 'standard',
          name: 'Formato Estándar',
          description: 'Página completa (carta/A4)',
          icon: 'ti ti-file-invoice fs-1 text-success'
        },
        {
          id: 'half-page',
          name: 'Media Página',
          description: 'Formato media carta',
          icon: 'ti ti-file-text fs-1 text-info'
        }
      ]
    };
  },
  methods: {
    selectFormat(formatId) {
      this.selectedFormat = formatId;
    },
    getCurrentFormatName() {
      const format = this.formats.find(f => f.id === this.selectedFormat);
      return format ? format.name : '';
    },
    getModalSize() {
      if (this.selectedFormat === 'ticket') return 'modal-sm';
      if (this.selectedFormat === 'standard') return 'modal-xl';
      return 'modal-lg';
    },
    showPreview() {
      const modal = new bootstrap.Modal(document.getElementById('invoicePreviewModal'));
      modal.show();
    },
    printInvoice() {
      const printContent = document.querySelector('.invoice-preview').innerHTML;
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write('<html><head><title>Factura</title>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    },
    toggleHeader() {
      document.getElementById("collapse-header").classList.toggle("active");
      document.body.classList.toggle("header-collapse");
    }
  }
};
</script>

<style scoped>
.template-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-card.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.template-icon {
  font-size: 3rem;
}

.invoice-preview {
  background: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
</style>
