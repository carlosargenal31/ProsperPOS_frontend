<template>
  <div class="main-wrapper">
    <!-- Header -->
    <layouts-header></layouts-header>

    <!-- Sidebar de Tienda Online -->
    <div class="sidebar" id="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <router-link to="/dashboard/" class="logo logo-normal">
          <img src="@/assets/img/logo.png" alt="Logo" />
        </router-link>
        <router-link to="/dashboard/" class="logo logo-white">
          <img src="@/assets/img/logo-white.png" alt="Logo" />
        </router-link>
        <router-link to="/dashboard/" class="logo-small">
          <img src="@/assets/img/logo-small.png" alt="Logo" />
        </router-link>
        <a id="toggle_btn" href="javascript:void(0);" @click="toggleSidebar">
          <i class="ti ti-chevrons-left"></i>
        </a>
      </div>

      <!-- Sidebar Content -->
      <div class="sidebar-inner slimscroll">
        <div id="sidebar-menu" class="sidebar-menu">
          <tienda-online-sidebar></tienda-online-sidebar>
        </div>
      </div>
    </div>

    <!-- Page Wrapper -->
    <div class="page-wrapper">
      <div class="content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="add-item d-flex">
            <div class="page-title">
              <h4>{{ pageTitle }}</h4>
              <h6>{{ pageSubtitle }}</h6>
            </div>
          </div>
        </div>

        <!-- Contenido dinámico -->
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import TiendaOnlineSidebar from '@/views/layouts/tienda-online-sidebar.vue'
import LayoutsHeader from '@/views/layouts/layouts-header.vue'

export default {
  name: 'TiendaOnlineLayout',
  components: {
    TiendaOnlineSidebar,
    LayoutsHeader
  },
  computed: {
    pageTitle() {
      const titles = {
        '/tienda-online/categorias': 'Categorías Visibles',
        '/tienda-online/banner': 'Banner Principal',
        '/tienda-online/destacados': 'Productos Destacados',
        '/tienda-online/pedidos': 'Pedidos en Línea',
        '/tienda-online/configuracion': 'Configuración de Tienda'
      }
      return titles[this.$route.path] || 'Tienda en Línea'
    },
    pageSubtitle() {
      const subtitles = {
        '/tienda-online/categorias': 'Gestiona qué categorías se muestran en tu tienda',
        '/tienda-online/banner': 'Configura las imágenes del banner principal',
        '/tienda-online/destacados': 'Selecciona los productos destacados',
        '/tienda-online/pedidos': 'Gestiona los pedidos realizados en la tienda online',
        '/tienda-online/configuracion': 'Configuración general de la tienda'
      }
      return subtitles[this.$route.path] || 'Gestiona tu tienda online'
    }
  },
  methods: {
    toggleSidebar() {
      const sidebar = document.getElementById('sidebar')
      if (sidebar) {
        sidebar.classList.toggle('mini-sidebar')
      }
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s;
}

.sidebar-logo {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo img {
  max-height: 40px;
}

.logo-small {
  display: none;
}

.sidebar-inner {
  height: calc(100vh - 70px);
  overflow-y: auto;
}

.page-wrapper {
  margin-left: 260px;
  padding-top: 60px;
  min-height: 100vh;
}

.content {
  padding: 20px;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.page-title h4 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.page-title h6 {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

/* Mini sidebar */
.sidebar.mini-sidebar {
  width: 60px;
}

.sidebar.mini-sidebar + .page-wrapper {
  margin-left: 60px;
}

.sidebar.mini-sidebar .logo-normal,
.sidebar.mini-sidebar .logo-white {
  display: none;
}

.sidebar.mini-sidebar .logo-small {
  display: block;
}
</style>
