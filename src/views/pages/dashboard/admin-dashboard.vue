<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>

  <div class="page-wrapper">
    <div class="content">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-2">
        <div class="mb-3">
          <h1 class="mb-1">Bienvenido, Admin</h1>

        </div>
        <div class="input-icon-start position-relative mb-3">
          <span class="input-icon-addon fs-16 text-gray-9">
            <i class="ti ti-calendar"></i>
          </span>
          <input
            type="text"
            class="form-control date-range bookingrange"
            ref="dateRangeInput"
            placeholder="Seleccionar Rango de Fechas"
          />
        </div>
      </div>


      <div class="row">
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card bg-primary sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon bg-white text-primary">
                <i class="ti ti-file-text fs-24"></i>
              </span>
              <div class="ms-2">
                <p class="text-white mb-1">Ventas Totales</p>
                <div class="d-inline-flex align-items-center flex-wrap gap-2">
                  <h4 class="text-white">L {{ formatNumber(dashboardStats.sales?.total_amount || 0) }}</h4>
                  <span class="badge badge-soft-primary" v-if="dashboardStats.sales?.change_percentage >= 0">
                    <i class="ti ti-arrow-up me-1"></i>+{{ dashboardStats.sales?.change_percentage || 0 }}%
                  </span>
                  <span class="badge badge-soft-danger" v-else>
                    <i class="ti ti-arrow-down me-1"></i>{{ dashboardStats.sales?.change_percentage || 0 }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card bg-secondary sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon bg-white text-secondary">
                <i class="ti ti-repeat fs-24"></i>
              </span>
              <div class="ms-2">
                <p class="text-white mb-1">Devoluciones de Ventas</p>
                <div class="d-inline-flex align-items-center flex-wrap gap-2">
                  <h4 class="text-white">L {{ formatNumber(dashboardStats.sales_returns?.total_amount || 0) }}</h4>
                  <span class="badge badge-soft-danger">
                    <i class="ti ti-arrow-down me-1"></i>{{ dashboardStats.sales_returns?.total_count || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card bg-teal sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon bg-white text-teal">
                <i class="ti ti-gift fs-24"></i>
              </span>
              <div class="ms-2">
                <p class="text-white mb-1">Compras Totales</p>
                <div class="d-inline-flex align-items-center flex-wrap gap-2">
                  <h4 class="text-white">L {{ formatNumber(dashboardStats.purchases?.total_amount || 0) }}</h4>
                  <span class="badge badge-soft-success">
                    <i class="ti ti-arrow-up me-1"></i>{{ dashboardStats.purchases?.total_count || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-sm-6 col-12 d-flex">
          <div class="card bg-info sale-widget flex-fill">
            <div class="card-body d-flex align-items-center">
              <span class="sale-icon bg-white text-info">
                <i class="ti ti-brand-pocket fs-24"></i>
              </span>
              <div class="ms-2">
                <p class="text-white mb-1">Devoluciones de Compras</p>
                <div class="d-inline-flex align-items-center flex-wrap gap-2">
                  <h4 class="text-white">L {{ formatNumber(dashboardStats.purchase_returns?.total_amount || 0) }}</h4>
                  <span class="badge badge-soft-success">
                    <i class="ti ti-arrow-up me-1"></i>{{ dashboardStats.purchase_returns?.total_count || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Sales & Purchase -->
        <div class="col-xxl-8 col-xl-7 col-sm-12 col-12 d-flex">
          <div class="card flex-fill">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div class="d-inline-flex align-items-center">
                <span class="title-icon bg-soft-primary fs-16 me-2"
                  ><i class="ti ti-shopping-cart"></i
                ></span>
                <h5 class="card-title mb-0">Ventas y Compras</h5>
              </div>
              <ul class="nav btn-group custom-btn-group">
                <a class="btn btn-outline-light" @click="changePeriod('1D')" :class="{ active: selectedPeriod === '1D' }">1D</a>
                <a class="btn btn-outline-light" @click="changePeriod('1S')" :class="{ active: selectedPeriod === '1S' }">1S</a>
                <a class="btn btn-outline-light" @click="changePeriod('1M')" :class="{ active: selectedPeriod === '1M' }">1M</a>
                <a class="btn btn-outline-light" @click="changePeriod('3M')" :class="{ active: selectedPeriod === '3M' }">3M</a>
                <a class="btn btn-outline-light" @click="changePeriod('6M')" :class="{ active: selectedPeriod === '6M' }">6M</a>
                <a class="btn btn-outline-light" @click="changePeriod('1A')" :class="{ active: selectedPeriod === '1A' }">1A</a>
              </ul>
            </div>
            <div class="card-body pb-0">
                <div>
                  <div class="d-flex align-items-center gap-2">
                    <div class="border p-2 br-8">
                      <p class="d-inline-flex align-items-center mb-1"><i class="ti ti-circle-filled fs-8 text-primary-300 me-1"></i>Compras Totales</p>
                      <h4>L {{ formatNumber(getTotalPurchases()) }}</h4>
                    </div>
                    <div class="border p-2 br-8">
                      <p class="d-inline-flex align-items-center mb-1"><i class="ti ti-circle-filled fs-8 text-primary me-1"></i>Ventas Totales</p>
                      <h4>L {{ formatNumber(getTotalSales()) }}</h4>
                    </div>
                  </div>
                  <div id="sales-daychart">
                    <apexchart
                      :key="chartKey"
                      type="bar"
                      height="245"
                      :options="salesDaychart.sline"
                      :series="salesDaychart.series"
                    ></apexchart>
                  </div>
                </div>
            </div>
          </div>
        </div>
        <!-- /Sales & Purchase -->

        <!-- Overall Information -->
        <div class="col-xxl-4 col-xl-5 d-flex">
          <div class="card flex-fill">
            <div class="card-header">
              <div class="d-inline-flex align-items-center">
                <span class="title-icon bg-soft-info fs-16 me-2"
                  ><i class="ti ti-info-circle"></i
                ></span>
                <h5 class="card-title mb-0">Información General</h5>
              </div>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <div class="info-item border bg-light p-3 text-center">
                    <div class="mb-3 text-info fs-24">
                      <i class="ti ti-user-check"></i>
                    </div>
                    <p class="mb-1">Proveedores</p>
                    <h5>{{ overallInfo.suppliers || 0 }}</h5>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="info-item border bg-light p-3 text-center">
                    <div class="mb-3 text-orange fs-24">
                      <i class="ti ti-users"></i>
                    </div>
                    <p class="mb-1">Clientes</p>
                    <h5>{{ overallInfo.customers || 0 }}</h5>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="info-item border bg-light p-3 text-center">
                    <div class="mb-3 text-teal fs-24">
                      <i class="ti ti-shopping-cart"></i>
                    </div>
                    <p class="mb-1">Ventas</p>
                    <h5>{{ overallInfo.sales || 0 }}</h5>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer pb-sm-0">
              <div
                class="d-flex align-items-center justify-content-between flex-wrap gap-3"
              >
                <h6>Resumen de Clientes</h6>
                <div class="dropdown">
                  <a
                    href="javascript:void(0);"
                    class="dropdown-toggle btn btn-sm btn-white"
                    @click="toggleCustomersDropdown"
                    :aria-expanded="showCustomersDropdown"
                  >
                    <i class="ti ti-calendar me-1"></i>{{ customersPeriod === 'today' ? 'Hoy' : customersPeriod === 'week' ? 'Semanal' : 'Mensual' }}
                  </a>
                  <ul class="dropdown-menu p-3" :class="{ 'show': showCustomersDropdown }">
                    <li>
                      <a href="javascript:void(0);" class="dropdown-item" @click="changeCustomersPeriod('today')">Hoy</a>
                    </li>
                    <li>
                      <a href="javascript:void(0);" class="dropdown-item" @click="changeCustomersPeriod('week')">Semanal</a>
                    </li>
                    <li>
                      <a href="javascript:void(0);" class="dropdown-item" @click="changeCustomersPeriod('month')">Mensual</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="row align-items-center">
                <div class="col-sm-5">
                  <div id="customers-overview-chart">
                    <apexchart
                      :key="`customers-${customersOverview.first_time}-${customersOverview.returning}`"
                      type="donut"
                      height="160"
                      :options="customersDonutChart.options"
                      :series="[customersOverview.first_time || 0, customersOverview.returning || 0]"
                    ></apexchart>
                  </div>
                </div>
                <div class="col-sm-7">
                  <div class="row gx-0">
                    <div class="col-sm-6">
                      <div class="text-center border-end">
                        <h2 class="mb-1">{{ formatNumber(customersOverview.first_time || 0) }}</h2>
                        <p class="text-orange mb-2">Primera Vez</p>
                        <span
                          class="badge badge-xs d-inline-flex align-items-center"
                          :class="customersOverview.first_time_percentage >= 0 ? 'badge-success' : 'badge-danger'"
                          ><i class="ti me-1" :class="customersOverview.first_time_percentage >= 0 ? 'ti-arrow-up' : 'ti-arrow-down'"></i>{{ Math.abs(customersOverview.first_time_percentage || 0) }}%</span
                        >
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <div class="text-center">
                        <h2 class="mb-1">{{ formatNumber(customersOverview.returning || 0) }}</h2>
                        <p class="text-teal mb-2">Recurrente</p>
                        <span
                          class="badge badge-xs d-inline-flex align-items-center"
                          :class="customersOverview.returning_percentage >= 0 ? 'badge-success' : 'badge-danger'"
                          ><i class="ti me-1" :class="customersOverview.returning_percentage >= 0 ? 'ti-arrow-up' : 'ti-arrow-down'"></i>{{ Math.abs(customersOverview.returning_percentage || 0) }}%</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- /Overall Information -->
      </div>

      <!-- Top Selling Products -->
      <div class="row">
        <div class="col-xxl-4 col-md-6 d-flex">
          <div class="card flex-fill">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div class="d-inline-flex align-items-center">
                <span class="title-icon bg-soft-pink fs-16 me-2"><i class="ti ti-box"></i></span>
                <h5 class="card-title mb-0">Productos Más Vendidos</h5>
              </div>
              <div class="dropdown">
                <a href="javascript:void(0);" class="dropdown-toggle btn btn-sm btn-white" @click="toggleTopProductsDropdown" :aria-expanded="showTopProductsDropdown">
                  <i class="ti ti-calendar me-1"></i>{{ topProductsPeriod === 'today' ? 'Hoy' : topProductsPeriod === 'week' ? 'Semanal' : 'Mensual' }}
                </a>
                <ul class="dropdown-menu p-3" :class="{ 'show': showTopProductsDropdown }">
                  <li>
                    <a href="javascript:void(0);" class="dropdown-item" @click="changeTopProductsPeriod('today')">Hoy</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);" class="dropdown-item" @click="changeTopProductsPeriod('week')">Semanal</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);" class="dropdown-item" @click="changeTopProductsPeriod('month')">Mensual</a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="card-body sell-product">
              <div v-if="topProducts.length === 0" class="text-center py-4">
                <p class="text-muted">No hay datos disponibles</p>
              </div>
              <div v-else v-for="(product, index) in topProducts" :key="product.id" class="d-flex align-items-center justify-content-between" :class="{ 'border-bottom': index < topProducts.length - 1 }">
                <div class="d-flex align-items-center">
                  <a href="javascript:void(0);" class="avatar avatar-lg">
                    <img :src="getProductImage(product.image)" alt="img" @error="$event.target.src = getProductImage(null)">
                  </a>
                  <div class="ms-2">
                    <h6 class="fw-bold mb-1"><a href="javascript:void(0);">{{ product.name }}</a></h6>
                    <div class="d-flex align-items-center item-list">
                      <p>L {{ formatNumber(product.price) }}</p>
                      <p>{{ product.total_sold }}+ Ventas</p>
                    </div>
                  </div>
                </div>
                <span class="badge bg-outline-success badge-xs d-inline-flex align-items-center"><i class="ti ti-arrow-up-left me-1"></i>Top {{ index + 1 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Customers -->
        <div class="col-xxl-4 col-md-6 d-flex">
          <div class="card flex-fill">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div class="d-inline-flex align-items-center">
                <span class="title-icon bg-soft-orange fs-16 me-2"><i class="ti ti-users"></i></span>
                <h5 class="card-title mb-0">Mejores Clientes</h5>
              </div>
              <router-link to="/finance/account-statement" class="fs-13 fw-medium text-decoration-underline">Ver Todo</router-link>
            </div>
            <div class="card-body">
              <div v-if="topCustomers.length === 0" class="text-center py-4">
                <p class="text-muted">No hay datos disponibles</p>
              </div>
              <div v-else v-for="(customer, index) in topCustomers" :key="customer.id" class="d-flex align-items-center justify-content-between" :class="{ 'border-bottom mb-3 pb-3': index < topCustomers.length - 1 }">
                <div>
                  <h6 class="fs-14 fw-medium mb-1">{{ customer.name }}</h6>
                  <p class="text-muted fs-13 mb-0">{{ customer.total_invoices }} Facturas</p>
                </div>
                <div class="text-end">
                  <h5>L{{ formatNumber(customer.total_spent) }}</h5>
                  <span class="badge bg-outline-orange badge-xs">
                    <i class="ti ti-arrow-up-left me-1"></i>Top {{ index + 1 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Categories -->
        <div class="col-xxl-4 col-md-12 d-flex">
          <div class="card flex-fill">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div class="d-inline-flex align-items-center">
                <span class="title-icon bg-soft-purple fs-16 me-2"><i class="ti ti-category"></i></span>
                <h5 class="card-title mb-0">Categorías Más Vendidas</h5>
              </div>
              <div class="dropdown">
                <a href="javascript:void(0);" class="dropdown-toggle btn btn-sm btn-white" @click="toggleTopCategoriesDropdown" :aria-expanded="showTopCategoriesDropdown">
                  <i class="ti ti-calendar me-1"></i>{{ topCategoriesPeriod === 'today' ? 'Hoy' : topCategoriesPeriod === 'week' ? 'Semanal' : 'Mensual' }}
                </a>
                <ul class="dropdown-menu p-3" :class="{ 'show': showTopCategoriesDropdown }">
                  <li>
                    <a href="javascript:void(0);" class="dropdown-item" @click="changeTopCategoriesPeriod('today')">Hoy</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);" class="dropdown-item" @click="changeTopCategoriesPeriod('week')">Semanal</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);" class="dropdown-item" @click="changeTopCategoriesPeriod('month')">Mensual</a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="card-body">
              <div v-if="topCategories.length === 0" class="text-center py-4">
                <p class="text-muted">No hay datos disponibles</p>
              </div>
              <div v-else v-for="(category, index) in topCategories" :key="category.id" class="d-flex align-items-center justify-content-between" :class="{ 'border-bottom mb-3 pb-3': index < topCategories.length - 1 }">
                <div>
                  <h6 class="fs-14 fw-medium mb-1">{{ category.name }}</h6>
                  <p class="text-muted fs-13 mb-0">{{ category.total_sold }} Productos vendidos</p>
                </div>
                <div class="text-end">
                  <h5>L{{ formatNumber(category.total_revenue) }}</h5>
                  <span class="badge bg-outline-purple badge-xs">
                    <i class="ti ti-arrow-up-left me-1"></i>Top {{ index + 1 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

   <div
      class="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3"
    >
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
import "daterangepicker/daterangepicker.css";
import "daterangepicker/daterangepicker.js";
import { ref, reactive, onMounted } from "vue";
import moment from "moment";
import DateRangePicker from "daterangepicker";
import { customerChart } from "./data";
import DashboardService from "@/services/dashboard.service";

// Configurar moment.js en español manualmente
moment.updateLocale('en', {
  months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
});

export default {
  data() {
    return {
      customerChart: customerChart,
    };
  },
  setup() {
    const dateRangeInput = ref(null);
    const selectedPeriod = ref('1A');
    const chartKey = ref(0); // Key para forzar re-render del gráfico
    const topProductsPeriod = ref('week');
    const topCategoriesPeriod = ref('week');
    const customersPeriod = ref('week');
    const showTopProductsDropdown = ref(false);
    const showTopCategoriesDropdown = ref(false);
    const showCustomersDropdown = ref(false);

    const dashboardStats = reactive({
      sales: {},
      sales_returns: {},
      purchases: {},
      purchase_returns: {}
    });

    const overallInfo = reactive({
      suppliers: 0,
      customers: 0,
      sales: 0
    });

    const chartData = reactive({
      sales: [],
      purchases: []
    });

    const salesDaychart = reactive({
      series: [{
        name: 'Compras',
        data: []
      }, {
        name: 'Ventas',
        data: []
      }],
      sline: {
        chart: {
          height: 245,
          type: 'bar',
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '30%',
            borderRadius: 4
          }
        },
        dataLabels: { enabled: false },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: []
        },
        yaxis: {
          title: { text: 'Monto (L)' },
          labels: {
            formatter: function (value) {
              return 'L ' + new Intl.NumberFormat('es-HN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value);
            }
          }
        },
        fill: { opacity: 1 },
        colors: ['#ffd4b3', '#ff9f43'],
        tooltip: {
          y: {
            formatter: function (value) {
              return 'L ' + new Intl.NumberFormat('es-HN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(value);
            }
          }
        }
      }
    });

    const topProducts = ref([]);
    const topCategories = ref([]);
    const topCustomers = ref([]);
    let dateFrom = ref(null);
    let dateTo = ref(null);

    const customersOverview = reactive({
      first_time: 0,
      returning: 0,
      first_time_percentage: 0,
      returning_percentage: 0,
      first_time_chart_percentage: 0,
      returning_chart_percentage: 0
    });

    const customersDonutChart = reactive({
      options: {
        chart: {
          type: 'donut',
          height: 160,
          toolbar: { show: false }
        },
        labels: ['Primera Vez', 'Recurrente'],
        colors: ['#FF9F43', '#00CFE8'],
        legend: {
          show: false
        },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: false
              }
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: 0
        }
      }
    });

    // Función para formatear números
    const formatNumber = (value) => {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    };

    // Función para formatear fechas
    const formatDate = (date) => {
      return moment(date).format('DD MMM YYYY');
    };

    // Función para obtener imagen del producto
    const getProductImage = (imageUrl) => {
      if (imageUrl && imageUrl.trim() !== '') {
        // Si la imagen es una URL completa (http/https)
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          return imageUrl;
        }
        // Si es una ruta relativa del backend
        return `http://localhost:3000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      // Imagen por defecto
      return new URL('@/assets/img/products/product-01.jpg', import.meta.url).href;
    };

    // Calcular total de ventas del gráfico
    const getTotalSales = () => {
      if (!chartData.sales || chartData.sales.length === 0) return 0;
      return chartData.sales.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    };

    // Calcular total de compras del gráfico
    const getTotalPurchases = () => {
      if (!chartData.purchases || chartData.purchases.length === 0) return 0;
      return chartData.purchases.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    };

    // Cargar estadísticas
    const loadDashboardStats = async () => {
      try {
        const params = {};
        if (dateFrom.value) params.date_from = dateFrom.value;
        if (dateTo.value) params.date_to = dateTo.value;

        const response = await DashboardService.getStats(params);
        if (response.success) {
          Object.assign(dashboardStats, response.data);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };

    // Cargar información general
    const loadOverallInfo = async () => {
      try {
        const response = await DashboardService.getOverallInfo();
        if (response.success) {
          Object.assign(overallInfo, response.data);
        }
      } catch (error) {
        console.error('Error al cargar información general:', error);
      }
    };

    // Cargar datos del gráfico
    const loadChartData = async (period = '1A') => {
      try {
        // Solo enviar el período, dejar que el backend calcule las fechas
        // No enviamos date_from ni date_to para que el backend use las fechas del período
        const params = {
          period
        };

        const response = await DashboardService.getSalesAndPurchasesChart(params);
        console.log('📊 Respuesta del gráfico:', response);

        if (response.success) {
          // Asegurar que sales y purchases sean arrays
          const salesArray = Array.isArray(response.data.sales) ? response.data.sales : [];
          const purchasesArray = Array.isArray(response.data.purchases) ? response.data.purchases : [];

          console.log('📈 Sales array:', salesArray);
          console.log('📦 Purchases array:', purchasesArray);
          console.log('📊 Group by:', response.data.groupBy);

          chartData.sales = salesArray;
          chartData.purchases = purchasesArray;

          // Crear claves únicas para cada punto de datos
          let categories = [];
          let salesMap = {};
          let purchasesMap = {};

          // Determinar cómo formatear las categorías según el período
          const groupBy = response.data.groupBy;

          if (groupBy === 'HOUR') {
            // Por hora: "2 am", "3 am", etc.
            salesArray.forEach(s => {
              const key = `${s.hour}`;
              const label = `${s.hour % 12 || 12} ${s.hour >= 12 ? 'pm' : 'am'}`;
              if (!salesMap[key]) salesMap[key] = { label, amount: 0 };
              salesMap[key].amount += parseFloat(s.amount || 0);
            });

            purchasesArray.forEach(p => {
              const key = `${p.hour}`;
              const label = `${p.hour % 12 || 12} ${p.hour >= 12 ? 'pm' : 'am'}`;
              if (!purchasesMap[key]) purchasesMap[key] = { label, amount: 0 };
              purchasesMap[key].amount += parseFloat(p.amount || 0);
            });

            // Generar todas las horas del día
            for (let h = 0; h < 24; h++) {
              const key = `${h}`;
              const label = `${h % 12 || 12} ${h >= 12 ? 'pm' : 'am'}`;
              categories.push({ key, label });
            }
          } else if (groupBy === 'MONTH') {
            // Por mes: "Nov 2025", "Dic 2025"
            salesArray.forEach(s => {
              const key = `${s.year}-${String(s.month).padStart(2, '0')}`;
              const label = moment(`${s.year}-${s.month}-01`).format('MMM YYYY');
              salesMap[key] = { label, amount: parseFloat(s.amount || 0) };
            });

            purchasesArray.forEach(p => {
              const key = `${p.year}-${String(p.month).padStart(2, '0')}`;
              const label = moment(`${p.year}-${p.month}-01`).format('MMM YYYY');
              purchasesMap[key] = { label, amount: parseFloat(p.amount || 0) };
            });

            // Generar todos los meses según el período
            let numMonths = 12; // Por defecto 1A
            if (period === '3M') numMonths = 3;
            else if (period === '6M') numMonths = 6;

            for (let i = numMonths - 1; i >= 0; i--) {
              const date = moment().subtract(i, 'months');
              const key = date.format('YYYY-MM');
              const label = date.format('MMM YYYY');
              categories.push({ key, label });
            }
          } else {
            // Por día: Para semana usa nombres de días (Dom, Lun, etc.), para mes usa fechas (27 Nov)
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

            salesArray.forEach(s => {
              const key = moment(s.date).format('YYYY-MM-DD');
              let label;
              if (period === '1S') {
                const dayOfWeek = moment(s.date).day();
                label = dayNames[dayOfWeek];
              } else {
                label = moment(s.date).format('DD MMM');
              }
              salesMap[key] = { label, amount: parseFloat(s.amount || 0) };
            });

            purchasesArray.forEach(p => {
              const key = moment(p.date).format('YYYY-MM-DD');
              let label;
              if (period === '1S') {
                const dayOfWeek = moment(p.date).day();
                label = dayNames[dayOfWeek];
              } else {
                label = moment(p.date).format('DD MMM');
              }
              purchasesMap[key] = { label, amount: parseFloat(p.amount || 0) };
            });

            // Generar todos los días según el período
            let numDays = 30; // Por defecto 1M
            if (period === '1S') numDays = 7;

            for (let i = numDays - 1; i >= 0; i--) {
              const date = moment().subtract(i, 'days');
              const key = date.format('YYYY-MM-DD');
              let label;
              if (period === '1S') {
                const dayOfWeek = date.day();
                label = dayNames[dayOfWeek];
              } else {
                label = date.format('DD MMM');
              }
              categories.push({ key, label });
            }
          }

          console.log('📅 Categories:', categories);
          console.log('📅 Categories labels:', categories.map(c => c.label));
          console.log('🗓️  Fecha actual:', moment().format('YYYY-MM-DD'));
          console.log('🗓️  Mes actual:', moment().format('MMM YYYY'));

          // Actualizar gráfico - Crear nuevo objeto xaxis para forzar reactividad
          salesDaychart.sline.xaxis = {
            categories: categories.map(c => c.label)
          };

          salesDaychart.series = [{
            name: 'Compras',
            data: categories.map(cat => purchasesMap[cat.key]?.amount || 0)
          }, {
            name: 'Ventas',
            data: categories.map(cat => salesMap[cat.key]?.amount || 0)
          }];

          // Incrementar key para forzar re-render del componente
          chartKey.value++;

          console.log('📊 Series data:', salesDaychart.series);
          console.log('📊 XAxis categories:', salesDaychart.sline.xaxis.categories);
        }
      } catch (error) {
        console.error('Error al cargar datos del gráfico:', error);
      }
    };

    // Cambiar período del gráfico
    const changePeriod = (period) => {
      selectedPeriod.value = period;
      localStorage.setItem('dashboard_period', period);
      loadChartData(period);
    };

    // Cargar productos más vendidos
    const loadTopProducts = async (period = 'today') => {
      try {
        const response = await DashboardService.getTopSellingProducts({ period, limit: 5 });
        if (response.success) {
          topProducts.value = response.data;
        }
      } catch (error) {
        console.error('Error al cargar productos más vendidos:', error);
      }
    };

    // Toggle dropdown de productos más vendidos
    const toggleTopProductsDropdown = () => {
      showTopProductsDropdown.value = !showTopProductsDropdown.value;
    };

    // Cambiar período de productos más vendidos
    const changeTopProductsPeriod = (period) => {
      topProductsPeriod.value = period;
      localStorage.setItem('dashboard_top_products_period', period);
      loadTopProducts(period);
      showTopProductsDropdown.value = false; // Cerrar dropdown después de seleccionar
    };

    // Cargar categorías más vendidas
    const loadTopCategories = async (period = 'week') => {
      try {
        const response = await DashboardService.getTopCategories({ period, limit: 5 });
        if (response.success) {
          topCategories.value = Array.isArray(response.data) ? response.data : [];
        }
      } catch (error) {
        console.error('Error al cargar categorías más vendidas:', error);
      }
    };

    // Toggle dropdown de categorías
    const toggleTopCategoriesDropdown = () => {
      showTopCategoriesDropdown.value = !showTopCategoriesDropdown.value;
    };

    // Cambiar período de categorías
    const changeTopCategoriesPeriod = (period) => {
      topCategoriesPeriod.value = period;
      localStorage.setItem('dashboard_top_categories_period', period);
      loadTopCategories(period);
      showTopCategoriesDropdown.value = false;
    };


    // Cargar mejores clientes
    const loadTopCustomers = async () => {
      try {
        const params = {
          limit: 5,
          date_from: dateFrom.value,
          date_to: dateTo.value
        };
        const response = await DashboardService.getTopCustomers(params);
        if (response.success) {
          // Asegurar que sea un array
          const customersData = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
          // Filtrar valores null o undefined
          topCustomers.value = customersData.filter(customer => customer !== null && customer !== undefined);
        }
      } catch (error) {
        console.error('Error al cargar mejores clientes:', error);
      }
    };

    // Cargar resumen de clientes
    const loadCustomersOverview = async (period = 'week') => {
      try {
        const response = await DashboardService.getCustomersOverview({ period });
        if (response.success && response.data) {
          customersOverview.first_time = response.data.first_time || 0;
          customersOverview.returning = response.data.returning || 0;
          customersOverview.first_time_percentage = response.data.first_time_percentage || 0;
          customersOverview.returning_percentage = response.data.returning_percentage || 0;
          customersOverview.first_time_chart_percentage = response.data.first_time_chart_percentage || 0;
          customersOverview.returning_chart_percentage = response.data.returning_chart_percentage || 0;
        }
      } catch (error) {
        console.error('Error al cargar resumen de clientes:', error);
      }
    };

    // Toggle dropdown de clientes
    const toggleCustomersDropdown = () => {
      showCustomersDropdown.value = !showCustomersDropdown.value;
    };

    // Cambiar período de resumen de clientes
    const changeCustomersPeriod = (period) => {
      customersPeriod.value = period;
      localStorage.setItem('dashboard_customers_period', period);
      loadCustomersOverview(period);
      showCustomersDropdown.value = false;
    };

    // Configuración del date range picker
    function booking_range(start, end) {
      dateFrom.value = start.format('YYYY-MM-DD');
      dateTo.value = end.format('YYYY-MM-DD');

      // Guardar preferencias en localStorage
      localStorage.setItem('dashboard_date_from', dateFrom.value);
      localStorage.setItem('dashboard_date_to', dateTo.value);

      // Recargar todos los datos del dashboard
      loadDashboardStats();
      loadChartData(selectedPeriod.value);
      loadOverallInfo();
      loadTopProducts(topProductsPeriod.value);
      loadTopCustomers();

      return start.format('DD/MM/YYYY') + " - " + end.format('DD/MM/YYYY');
    }

    onMounted(async () => {
      // Cargar preferencias guardadas o usar valores por defecto
      const savedDateFrom = localStorage.getItem('dashboard_date_from');
      const savedDateTo = localStorage.getItem('dashboard_date_to');
      const savedPeriod = localStorage.getItem('dashboard_period') || '1M';
      const savedTopProductsPeriod = localStorage.getItem('dashboard_top_products_period') || 'week';
      const savedCustomersPeriod = localStorage.getItem('dashboard_customers_period') || 'week';

      // Inicializar fechas por defecto
      const start = savedDateFrom ? moment(savedDateFrom) : moment().startOf("month");
      const end = savedDateTo ? moment(savedDateTo) : moment();
      dateFrom.value = start.format('YYYY-MM-DD');
      dateTo.value = end.format('YYYY-MM-DD');

      // Inicializar date range picker
      if (dateRangeInput.value) {
        new DateRangePicker(
          dateRangeInput.value,
          {
            startDate: start,
            endDate: end,
            ranges: {
              "Hoy": [moment(), moment()],
              "Ayer": [moment().subtract(1, "days"), moment().subtract(1, "days")],
              "Últimos 7 Días": [moment().subtract(6, "days"), moment()],
              "Últimos 30 Días": [moment().subtract(29, "days"), moment()],
              "Este Mes": [moment().startOf("month"), moment()],
              "Mes Anterior": [
                moment().subtract(1, "month").startOf("month"),
                moment().subtract(1, "month").endOf("month"),
              ],
            },
            locale: {
              format: "DD/MM/YYYY",
              separator: " - ",
              applyLabel: "Aplicar",
              cancelLabel: "Cancelar",
              fromLabel: "Desde",
              toLabel: "Hasta",
              customRangeLabel: "Rango Personalizado",
              weekLabel: "S",
              daysOfWeek: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
              monthNames: [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
              ],
              firstDay: 1
            }
          },
          booking_range
        );
      }

      // Restaurar períodos guardados
      selectedPeriod.value = savedPeriod;
      topProductsPeriod.value = savedTopProductsPeriod;
      const savedTopCategoriesPeriod = localStorage.getItem('dashboard_top_categories_period') || 'week';
      topCategoriesPeriod.value = savedTopCategoriesPeriod;
      customersPeriod.value = savedCustomersPeriod;

      // Cargar todos los datos del dashboard
      await Promise.all([
        loadDashboardStats(),
        loadOverallInfo(),
        loadChartData(savedPeriod),
        loadTopProducts(savedTopProductsPeriod),
        loadTopCategories(savedTopCategoriesPeriod),
        loadTopCustomers(),
        loadCustomersOverview(savedCustomersPeriod)
      ]);
    });

    return {
      dateRangeInput,
      selectedPeriod,
      chartKey,
      topProductsPeriod,
      topCategoriesPeriod,
      customersPeriod,
      showTopProductsDropdown,
      showTopCategoriesDropdown,
      showCustomersDropdown,
      dashboardStats,
      overallInfo,
      chartData,
      salesDaychart,
      topProducts,
      topCategories,
      topCustomers,
      customersOverview,
      customersDonutChart,
      formatNumber,
      formatDate,
      getProductImage,
      getTotalSales,
      getTotalPurchases,
      changePeriod,
      toggleTopProductsDropdown,
      changeTopProductsPeriod,
      toggleTopCategoriesDropdown,
      changeTopCategoriesPeriod,
      toggleCustomersDropdown,
      changeCustomersPeriod
    };
  },
};
</script>
