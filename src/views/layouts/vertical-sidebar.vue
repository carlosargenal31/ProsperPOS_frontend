<template>
  <!-- Usar sidebar de ecommerce si estamos en rutas de ecommerce -->
  <ecommerce-sidebar v-if="isEcommercePage"></ecommerce-sidebar>

  <!-- Usar sidebar normal del POS -->
  <ul v-else>
    <li class="submenu-open" v-for="item in filtered_sidebar_data" :key="item.tittle">
        <h6 class="submenu-hdr">{{ item.tittle }}</h6> <!-- Correct typo if needed -->
        <ul>
            <template v-for="menu in item.menu" :key="menu.menuValue">
                <li v-if="!menu.hasSubRoute && shouldShowMenu(menu)" :class="{ 'active': isMenuActive(menu) }">
                    <a v-if="menu.isManual" href="javascript:void(0);" @click="handleManualDownload(menu.manualFile)">
                        <i :class="menu.icon" class="fs-16 me-2"></i>
                        <span>{{ menu.menuValue }}</span>
                    </a>
                    <router-link v-else-if="menu.route" :to="menu.route">
                        <i :class="menu.icon" class="fs-16 me-2"></i>
                        <span>{{ menu.menuValue }}</span>
                    </router-link>
                </li>
                <li v-else-if="menu.hasSubRoute && shouldShowMenu(menu)" class="submenu">
                    <a href="javascript:void(0);" @click="expandSubMenus(menu)"
                    :class="{ subdrop: menu.showSubRoute && !openMenuItem, 'active': isActive(menu) }">
                        <i :class="menu.icon" class="fs-16 me-2"></i>
                        <span>{{ menu.menuValue }}</span>
                        <span class="menu-arrow"></span>
                    </a>
                    <ul :class="menu.showSubRoute ? 'd-block' : 'd-none'">
                        <li v-for="(subMenu, index) in menu.subMenus" :key="index" v-show="isSubmenuAllowed(item.tittle, menu.menuValue, subMenu.menuValue)">
                            <a v-if="subMenu.isManual" href="javascript:void(0);" @click="handleManualDownload(subMenu.manualFile)">{{ subMenu.menuValue }}</a>
                            <router-link v-else-if="subMenu.route" :to="subMenu.route">{{ subMenu.menuValue }}</router-link>
                        </li>
                    </ul>
                </li>
                <li v-if="menu.hasSubRouteTwo" class="submenu">
                    <a href="javascript:void(0);" @click="OpenMenu(menu)"
                    :class="{ subdrop: openMenuItem === menu || isActive(menu), 'active': isActive(menu) }">
                        <i :class="menu.icon" class="fs-16 me-2"></i><span>{{ menu.menuValue }}</span>
                        <span class="menu-arrow"></span>
                    </a>
                    <ul :class="{ 'd-block': openMenuItem === menu, 'd-none': openMenuItem !== menu }">
                        <li v-for="subMenus in menu.subMenus" :key="subMenus.menuValue">
                            <template v-if="!subMenus.customSubmenuTwo">
                                <!-- Add v-if for subMenus.route -->
                                <router-link v-if="subMenus.route" :to="subMenus.route" router-link-active="active">{{ subMenus.menuValue }}</router-link>
                            </template>
                            <template v-else-if="subMenus.customSubmenuTwo">
                                <li class="submenu submenu-two">
                                    <a href="javascript:void(0);" @click="openSubmenuOne(subMenus)"
                                    :class="{ subdrop: openSubmenuOneItem === subMenus || isSubActive(subMenus), 'active': isSubActive(subMenus) }">
                                        {{ subMenus.menuValue }}<span class="menu-arrow inside-submenu"></span>
                                    </a>
                                    <ul :class="{ 'd-block': openSubmenuOneItem === subMenus, 'd-none': openSubmenuOneItem !== subMenus }">
                                        <li v-for="subMenuTwo in subMenus.subMenusTwo" :key="subMenuTwo.menuValue">
                                            <!-- Add v-if for subMenuTwo.route -->
                                            <router-link v-if="subMenuTwo.route" :to="subMenuTwo.route">{{ subMenuTwo.menuValue }}</router-link>
                                        </li>
                                    </ul>
                                </li>
                            </template>
                        </li>                                
                    </ul>
                </li>                    
            </template>							
        </ul>
    </li>
  </ul>
</template>

<script>
import side_bar_data from "@/assets/json/sidebar.json";
import { canAccessModule, getCurrentUser, hasAnyRole } from '@/utils/permissions';
import { downloadManual } from '@/utils/manual-download';
import { canViewSection, canViewSubmenu, canViewSubmenuItem } from '@/utils/sidebar-permissions';
import EcommerceSidebar from './ecommerce-sidebar.vue';

export default {
  components: {
    EcommerceSidebar
  },
  data() {
      return {
          side_bar_data: side_bar_data, // Temporalmente sin filtrar para mostrar todos los menús
          openMenuItem: null,
          openSubmenuOneItem: null,
      }
  },
  computed: {
      isEcommercePage() {
          return this.$route.path.startsWith('/ecommerce');
      },
      filtered_sidebar_data() {
          const user = getCurrentUser();

          // Si no hay usuario, no mostrar nada
          if (!user || !user.roles) {
              console.warn('No user or roles found in sidebar');
              return [];
          }

          // Admins y super admins ven todo
          if (user.roles.includes('admin') || user.roles.includes('super_admin') || user.roles.includes('administrador')) {
              return this.side_bar_data;
          }

          console.log('========================================');
          console.log('FILTERING SIDEBAR FOR ROLES:', user.roles);
          console.log('========================================');

          // Filtrar secciones y submenús según el rol (manteniendo referencias)
          const filtered = this.side_bar_data
              .filter(section => {
                  const canView = canViewSection(user, section.tittle);
                  console.log(`Section "${section.tittle}": ${canView}`);
                  return canView;
              })
              .map(section => {
                  // Mantener referencia al objeto original pero con menú filtrado
                  const filteredMenus = section.menu.filter(menu => {
                      // Si es un manual, verificar roles
                      if (menu.isManual) {
                          return this.shouldShowMenu(menu);
                      }

                      // Si es un item simple sin submenús, mostrarlo
                      if (!menu.hasSubRoute && !menu.hasSubRouteTwo) {
                          return true;
                      }

                      // Si tiene submenús, verificar si tiene al menos uno permitido
                      if (menu.subMenus && menu.subMenus.length > 0) {
                          const hasAllowedSubmenu = menu.subMenus.some(subMenu => {
                              return canViewSubmenuItem(user, section.tittle, menu.menuValue, subMenu.menuValue);
                          });
                          return hasAllowedSubmenu;
                      }

                      return true;
                  });

                  // Retornar el mismo objeto sección pero con menús filtrados
                  return {
                      tittle: section.tittle,
                      showAsTab: section.showAsTab,
                      separateRoute: section.separateRoute,
                      menu: filteredMenus
                  };
              })
              .filter(section => section.menu.length > 0);

          console.log('========================================');
          console.log('FILTERED SIDEBAR RESULT:');
          console.log('  Total sections:', filtered.length);
          filtered.forEach(section => {
              console.log(`  - ${section.tittle} (${section.menu.length} menus)`);
              section.menu.forEach(menu => {
                  const submenuCount = menu.subMenus ? menu.subMenus.length : 0;
                  console.log(`    - ${menu.menuValue} ${submenuCount > 0 ? `(${submenuCount} items)` : ''}`);
              });
          });
          console.log('========================================');
          return filtered;
      },
      isMenuActive() {
          return (menu) => {
              return this.$route.path === menu.route ||
              this.$route.path === menu.active_link ||
              this.$route.path === menu.active_link1 ||
              this.$route.path === menu.active_link2 ||
              this.$route.path === menu.active_link3 ||
              this.$route.path === menu.active_link4 ||
              this.$route.path === menu.active_link5;                
          };
      },
      isActive(){
          return (menu) => {
              let result = this.$route.path.split('/').filter(part => part);
              let base = result[0];
              return base === menu.active_link || 
              base === menu.active_link1 ||
              base === menu.active_link2
          }
      },
      isSubActive(){
          return (menu) => {
              let result = this.$route.path.split('/').filter(part => part);
              let base = result[0];
              return base === menu.active_link
          }
      }
  },
  methods: {
      expandSubMenus(menu) {
          // Simplemente toggle el estado del menú clickeado
          menu.showSubRoute = !menu.showSubRoute;
      },
      OpenMenu(menu) {
          this.openMenuItem = this.openMenuItem === menu ? null : menu;
      },
      openSubmenuOne(subMenus) {
          this.openSubmenuOneItem = this.openSubmenuOneItem === subMenus ? null : subMenus;
      },

      /**
       * Manejar descarga de manuales
       */
      handleManualDownload(manualFile) {
          if (!manualFile) {
              console.error('No se especificó un archivo de manual');
              return;
          }
          downloadManual(manualFile);
      },

      /**
       * Determinar si se debe mostrar un item del menú según su rol
       */
      shouldShowMenu(menu) {
          // Si es un manual, verificar roles requeridos
          if (menu.isManual && menu.requiredRoles) {
              const user = getCurrentUser();
              if (!user || !user.roles) {
                  return false;
              }

              // Verificar si el usuario tiene alguno de los roles requeridos
              return hasAnyRole(menu.requiredRoles);
          }

          // Para items normales, mostrar siempre (la lógica de permisos se maneja en otro lado)
          return true;
      },

      /**
       * Verificar si un submenú debe mostrarse según permisos
       */
      isSubmenuAllowed(sectionTitle, menuTitle, submenuTitle) {
          const user = getCurrentUser();
          if (!user || !user.roles) return true; // Si no hay usuario, mostrar (para evitar romper el admin)

          // Admins ven todo
          if (user.roles.includes('admin') || user.roles.includes('super_admin') || user.roles.includes('administrador')) {
              return true;
          }

          // Usar la función de permisos
          return canViewSubmenuItem(user, sectionTitle, menuTitle, submenuTitle);
      },

      /**
       * Mapa de rutas a módulos de permisos
       */
      getModuleForRoute(route) {
          const moduleMapping = {
              // Usuarios y Roles
              '/users/users-list': 'users',
              '/users/roles-permissions': 'roles',
              '/users/delete-account': 'users',

              // Inventario
              '/inventory/product-list': 'products',
              '/inventory/category-list': 'categories',
              '/inventory/sub-categories': 'categories',
              '/inventory/brand-list': 'brands',
              '/inventory/units': 'products',
              '/inventory/barcode': 'products',
              '/inventory/cargo-descargo': 'inventory',
              '/stock/manage-stocks': 'inventory',
              '/stock/stock-adjustment': 'inventory',

              // Personas
              '/ecommerce/customers': 'customers',
              '/people/suppliers': 'suppliers',
              '/people/store-list': 'stores',
              '/people/warehouse': 'warehouses',

              // Ubicaciones
              '/location/countries': 'locations',
              '/location/states': 'locations',
              '/location/cities': 'locations',

              // Ventas
              '/sales': 'sales',
              '/sales/sales-returns': 'sales',
              '/sales/pos-orders': 'sales',
              '/sales/online-orders': 'sales',
              '/sales/quotation-list': 'quotations',
              '/coupons': 'coupons',
              '/discount/discount-list': 'discounts',
              '/pos-invoice': 'sales',
              '/shipments': 'shipments',

              // Compras
              '/purchases/purchase-list': 'purchases',
              '/purchase-returns': 'purchases',

              // Recursos Humanos
              '/hrm/employees-grid': 'employees',
              '/hrm/department-grid': 'departments',
              '/hrm/designation': 'designations',
              '/hrm/vehicles': 'vehicles',

              // Reportes
              '/reports/purchase-report': 'reports',
              '/reports/invoice-report': 'reports',
              '/sales-report/sales-report': 'reports',
              '/sales-report/best-sellers': 'reports',
              '/supplier-report/supplier-report': 'reports',
              '/customer-report/customer-report': 'reports',
              '/reports/profit-and-loss': 'reports',
              '/reports/annual-report': 'reports',
              '/inventory-report/inventory-report': 'reports',
              '/inventory-report/stock-history': 'reports',
              '/inventory-report/sold-stock': 'reports',
              '/price-list/price-list': 'sales',
              '/inventory/barcode': 'inventory',
          };

          return moduleMapping[route] || null;
      },

      /**
       * Filtrar sidebar basado en permisos del usuario
       */
      filterSidebarByPermissions(sidebarData) {
          return sidebarData.map(section => {
              // Filtrar menús de cada sección
              const filteredMenu = section.menu.filter(menu => {
                  // Si no tiene ruta y no tiene submenús, mostrar por defecto (Dashboard, Ajustes, etc.)
                  if (!menu.route && !menu.subMenus) {
                      return true;
                  }

                  // Si tiene ruta directa, verificar permiso
                  if (menu.route && !menu.hasSubRoute) {
                      const module = this.getModuleForRoute(menu.route);
                      // Si no hay módulo definido, mostrar por defecto (páginas sin permisos)
                      if (!module) return true;
                      return canAccessModule(module);
                  }

                  // Si tiene submenús, filtrar los submenús
                  if (menu.subMenus && menu.subMenus.length > 0) {
                      menu.subMenus = menu.subMenus.filter(subMenu => {
                          if (!subMenu.route) return true;

                          const module = this.getModuleForRoute(subMenu.route);
                          if (!module) return true;
                          return canAccessModule(module);
                      });

                      // Solo mostrar el menú padre si tiene al menos un submenú visible
                      return menu.subMenus.length > 0;
                  }

                  return true;
              });

              return {
                  ...section,
                  menu: filteredMenu
              };
          }).filter(section => section.menu.length > 0); // Remover secciones vacías
      }
  }
}
</script>