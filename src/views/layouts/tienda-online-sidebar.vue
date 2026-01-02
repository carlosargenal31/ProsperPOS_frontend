<template>
  <ul>
    <li class="submenu-open">
      <h6 class="submenu-hdr">Gestión de Tienda en Línea</h6>
      <ul>
        <li :class="{ 'active': $route.path === '/tienda-online/categorias' }">
          <router-link to="/tienda-online/categorias">
            <i class="ti ti-category-2 fs-16 me-2"></i>
            <span>Categorías Visibles</span>
          </router-link>
        </li>
        <li :class="{ 'active': $route.path === '/tienda-online/banner' }">
          <router-link to="/tienda-online/banner">
            <i class="ti ti-photo fs-16 me-2"></i>
            <span>Banner Principal</span>
          </router-link>
        </li>
        <li :class="{ 'active': $route.path === '/tienda-online/destacados' }">
          <router-link to="/tienda-online/destacados">
            <i class="ti ti-star fs-16 me-2"></i>
            <span>Productos Destacados</span>
          </router-link>
        </li>
        <li :class="{ 'active': $route.path === '/tienda-online/configuracion' }">
          <router-link to="/tienda-online/configuracion">
            <i class="ti ti-settings fs-16 me-2"></i>
            <span>Configuración</span>
          </router-link>
        </li>
      </ul>
    </li>

    <li class="submenu-open">
      <h6 class="submenu-hdr">Acciones</h6>
      <ul>
        <li>
          <a href="/shop/home" target="_blank">
            <i class="ti ti-external-link fs-16 me-2"></i>
            <span>Ver Tienda Online</span>
          </a>
        </li>
        <li>
          <router-link to="/dashboard/admin-dashboard">
            <i class="ti ti-arrow-back fs-16 me-2"></i>
            <span>Volver al Dashboard</span>
          </router-link>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'TiendaOnlineSidebar'
}
</script>

<style scoped>
.submenu-open {
  margin-bottom: 1.5rem;
}

.submenu-hdr {
  padding: 0.75rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6c757d;
  letter-spacing: 0.5px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 0.25rem;
}

li a {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #495057;
  text-decoration: none;
  transition: all 0.3s;
  border-radius: 0;
}

li a:hover,
li.active a {
  background-color: #f8f9fa;
  color: var(--primary-color, #FF9F43);
}

li.active a {
  border-left: 3px solid var(--primary-color, #FF9F43);
}

li a i {
  font-size: 1.25rem;
  width: 24px;
}
</style>
