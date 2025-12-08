// ===================================================================
// PROSPERPOS - SERVICIO DE DASHBOARD
// ===================================================================

import api from '@/utils/axios';

const DashboardService = {
  /**
   * Obtener estadísticas generales del dashboard
   */
  async getStats(params = {}) {
    try {
      const response = await api.get('/dashboard/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  /**
   * Obtener datos del gráfico de ventas y compras
   */
  async getSalesAndPurchasesChart(params = {}) {
    try {
      const response = await api.get('/dashboard/sales-purchases-chart', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos del gráfico:', error);
      throw error;
    }
  },

  /**
   * Obtener información general (proveedores, clientes, pedidos)
   */
  async getOverallInfo() {
    try {
      const response = await api.get('/dashboard/overall-info');
      return response.data;
    } catch (error) {
      console.error('Error al obtener información general:', error);
      throw error;
    }
  },

  /**
   * Obtener productos más vendidos
   */
  async getTopSellingProducts(params = { limit: 5, period: 'today' }) {
    try {
      const response = await api.get('/dashboard/top-selling-products', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos más vendidos:', error);
      throw error;
    }
  },

  /**
   * Obtener productos con bajo stock
   */
  async getLowStockProducts(params = { limit: 5 }) {
    try {
      const response = await api.get('/dashboard/low-stock-products', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos con bajo stock:', error);
      throw error;
    }
  },

  /**
   * Obtener ventas recientes
   */
  async getRecentSales(params = { limit: 5, period: 'week' }) {
    try {
      const response = await api.get('/dashboard/recent-sales', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener ventas recientes:', error);
      throw error;
    }
  },

  /**
   * Obtener mejores clientes
   */
  async getTopCustomers(params = { limit: 5 }) {
    try {
      const response = await api.get('/dashboard/top-customers', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener mejores clientes:', error);
      throw error;
    }
  },

  /**
   * Obtener resumen de clientes (primera vez vs recurrentes)
   */
  async getCustomersOverview(params = { period: 'week' }) {
    try {
      const response = await api.get('/dashboard/customers-overview', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen de clientes:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas por categoría
   */
  async getCategoryStats(params = { period: 'week' }) {
    try {
      const response = await api.get('/dashboard/category-stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de categorías:', error);
      throw error;
    }
  },

  /**
   * Obtener transacciones recientes
   */
  async getRecentTransactions(params = { type: 'sales', limit: 5 }) {
    try {
      const response = await api.get('/dashboard/recent-transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener transacciones recientes:', error);
      throw error;
    }
  }
};

export default DashboardService;
