<template>
  <ul>
    <li class="submenu-open" v-for="item in side_bar_data" :key="item.tittle">
        <h6 class="submenu-hdr">{{ item.tittle }}</h6> <!-- Correct typo if needed -->
        <ul>
            <template v-for="menu in item.menu" :key="menu.menuValue">
                <li v-if="!menu.hasSubRoute" :class="{ 'active': isMenuActive(menu) }">
                    <router-link v-if="menu.route" :to="menu.route">
                        <i :class="menu.icon" class="fs-16 me-2"></i>
                        <span>{{ menu.menuValue }}</span>
                    </router-link>
                </li>
                <li v-else class="submenu">
                    <a href="javascript:void(0);" @click="expandSubMenus(menu)" 
                    :class="{ subdrop: menu.showSubRoute && !openMenuItem, 'active': isActive(menu) }">
                        <i :class="menu.icon" class="fs-16 me-2"></i>
                        <span>{{ menu.menuValue }}</span>
                        <span class="menu-arrow"></span>
                    </a>
                    <ul :class="menu.showSubRoute ? 'd-block' : 'd-none'">
                        <li v-for="(subMenu, index) in menu.subMenus" :key="index">
                            <!-- Add v-if to check subMenu.route -->
                            <router-link v-if="subMenu.route" :to="subMenu.route">{{ subMenu.menuValue }}</router-link>
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
import { canAccessModule } from '@/utils/permissions';

export default {
  data() {
      return {
          side_bar_data: this.filterSidebarByPermissions(side_bar_data),
          openMenuItem: null,
          openSubmenuOneItem: null,
      }
  },
  computed: {
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
          this.side_bar_data.forEach((item) => {
              item.menu.forEach((subMenu) => {
                  if (subMenu !== menu) {
                      subMenu.showSubRoute = false;
                  }
              });
          });
          menu.showSubRoute = !menu.showSubRoute;
      },
      OpenMenu(menu) {
          this.side_bar_data.forEach((item) => {
              item.menu.forEach((subMenu) => {
                  subMenu.showSubRoute = false;
              });
          });
          this.openMenuItem = this.openMenuItem === menu ? null : menu;
      },
      openSubmenuOne(subMenus) {
          this.openSubmenuOneItem = this.openSubmenuOneItem === subMenus ? null : subMenus;
      },

      /**
       * Mapa de rutas a módulos de permisos
       */
      getModuleForRoute(route) {
          const moduleMapping = {
              '/users/users-list': 'users',
              '/users/roles-permissions': 'roles',
              '/users/delete-account': 'users',
              '/inventory/product-list': 'products',
              '/inventory/category-list': 'categories',
              '/inventory/sub-categories': 'categories',
              '/inventory/brand-list': 'brands',
              '/inventory/units': 'products',
              '/inventory/barcode': 'products',
              '/ecommerce/customers': 'customers',
              '/people/suppliers': 'suppliers',
              '/people/store-list': 'stores',
              '/people/warehouse': 'warehouses',
              '/sales': 'sales',
              '/sales/sales-returns': 'sales',
              '/sales/pos-orders': 'sales',
              '/sales/online-orders': 'sales',
              '/sales/quotation-list': 'quotations',
              '/purchases/purchase-list': 'purchases',
              '/purchases/purchase-returns': 'purchases',
              '/reports/purchase-report': 'purchases',
              '/reports/invoice-report': 'reports',
              '/sales-report/sales-report': 'reports',
              '/sales-report/best-sellers': 'reports',
              '/supplier-report/supplier-report': 'reports',
              '/customer-report/customer-report': 'reports',
              '/reports/profit-and-loss': 'reports',
              '/reports/annual-report': 'reports',
              '/stock/manage-stocks': 'inventory',
              '/stock/stock-adjustment': 'inventory',
              '/inventory-report/inventory-report': 'inventory',
              '/inventory-report/stock-history': 'inventory',
              '/inventory-report/sold-stock': 'inventory',
              '/hrm/employees-grid': 'employees',
              '/hrm/department-grid': 'employees',
              '/hrm/designation': 'employees',
              '/coupons': 'sales',
              '/discount/discount-list': 'sales',
              '/pos/pos-5': 'sales',
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