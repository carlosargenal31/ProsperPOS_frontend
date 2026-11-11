<template>
    <!-- Header -->
    <div class="header">
        <div class="main-header">

            <!-- Logo -->
            <div class="header-left active">
                <router-link :to="homeRoute" class="logo logo-normal">
                    <img src="@/assets/img/logo.png" alt="">
                </router-link>
                <router-link :to="homeRoute" class="logo logo-white">
                    <img src="@/assets/img/logo-white.png" alt="">
                </router-link>
                <router-link :to="homeRoute" class="logo-small">
                    <img src="@/assets/img/logo-small.png" alt="">
                </router-link>
            </div>
            <!-- /Logo -->

            <a id="mobile_btn" class="mobile_btn" href="#" @click="toggleMobileBtn">
                <span class="bar-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </a>

            <!-- Header Menu -->
            <ul class="nav user-menu">

                <!-- Buscador de módulos (usa los enlaces visibles del menú lateral) -->
                <li class="nav-item nav-searchinputs pp-search" ref="searchContainer">
                    <div class="top-nav-search">
                        <div class="searchinputs input-group">
                            <input type="text"
                                   ref="searchInput"
                                   v-model="searchText"
                                   placeholder="Buscar módulo... (Ctrl+K)"
                                   @focus="openSearch"
                                   @keydown.down.prevent="moveSelection(1)"
                                   @keydown.up.prevent="moveSelection(-1)"
                                   @keydown.enter.prevent="goToSelected"
                                   @keydown.esc="closeSearch">
                            <div class="search-addon">
                                <span><i class="ti ti-search"></i></span>
                            </div>
                        </div>
                        <div v-if="searchOpen && searchText" class="dropdown-menu search-dropdown show pp-search__results">
                            <a v-for="(item, i) in searchResults" :key="item.href"
                               href="javascript:void(0);"
                               class="dropdown-item d-flex flex-column"
                               :class="{ active: i === searchIndex }"
                               @mousedown.prevent="goTo(item)">
                                <span>{{ item.label }}</span>
                                <small v-if="item.section" class="text-muted">{{ item.section }}</small>
                            </a>
                            <span v-if="searchResults.length === 0" class="dropdown-item text-muted">Sin resultados</span>
                        </div>
                    </div>
                </li>

                <li v-if="showAddNewButton" class="nav-item dropdown link-nav" ref="dropdownContainer">
                    <a href="javascript:void(0);"
                       class="btn btn-primary btn-md d-inline-flex align-items-center"
                       @click.prevent="toggleDropdown"
                       :aria-expanded="showDropdown">
                        <i class="ti ti-circle-plus me-1"></i>Agregar Nuevo
                    </a>
                    <div class="dropdown-menu dropdown-xl" :class="{ 'show': showDropdown }" style="left: 50%; transform: translateX(-50%);">
                        <div class="row g-2">
                            <div class="col-md-2">
                                <router-link to="/inventory/category-list" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-brand-codepen"></i>
                                    </span>
                                    <p>Categoría</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/inventory/add-product" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-square-plus"></i>
                                    </span>
                                    <p>Producto</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/purchases/purchase-list" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-shopping-bag"></i>
                                    </span>
                                    <p>Compra</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/pos-invoice" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-shopping-cart"></i>
                                    </span>
                                    <p>Venta</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/shipments/create" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-truck"></i>
                                    </span>
                                    <p>Envío</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/pos-invoice" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-device-floppy"></i>
                                    </span>
                                    <p>Cotización</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/sales/sales-returns" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-copy"></i>
                                    </span>
                                    <p>Devolución</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/users/users-list" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-user"></i>
                                    </span>
                                    <p>Usuario</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/ecommerce/customers" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-users"></i>
                                    </span>
                                    <p>Cliente</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/inventory/brand-list" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-shield"></i>
                                    </span>
                                    <p>Marca</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/people/suppliers" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-user-check"></i>
                                    </span>
                                    <p>Proveedor</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/inventory/inventory-management" class="link-item" @click="closeDropdown">
                                    <span class="link-icon">
                                        <i class="ti ti-stack-3"></i>
                                    </span>
                                    <p>Inventario</p>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </li>
                
                <li v-if="showPOSButton" class="nav-item pos-nav">
                    <router-link to="/pos-invoice" class="btn btn-dark btn-md d-inline-flex align-items-center">
                        <i class="ti ti-device-laptop me-1"></i>POS
                    </router-link>
                </li>

                <li class="nav-item nav-item-box">
                    <a href="javascript:void(0);" id="btnFullscreen" @click="initFullScreen">
                        <i class="ti ti-maximize"></i>
                    </a>
                </li>

                <li class="nav-item nav-item-box">
                    <router-link to="/settings/security-settings"><i class="ti ti-settings"></i></router-link>
                </li>
                
            </ul>
            <!-- /Header Menu -->

            <!-- Mobile Menu -->
            <div class="dropdown mobile-user-menu">
                <a href="javascript:void(0);" class="nav-link dropdown-toggle" data-bs-toggle="dropdown"
                    aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>
                <div class="dropdown-menu dropdown-menu-right">
                    <router-link class="dropdown-item" to="/pages/profile">Mi Perfil</router-link>
                    <router-link class="dropdown-item" to="/settings/general-settings">Ajustes</router-link>
                    <router-link class="dropdown-item" to="/">Cerrar sesión</router-link>
                </div>
            </div>
            <!-- /Mobile Menu -->
        </div>
    </div>
    <!-- /Header -->

    <theme-settings></theme-settings>
</template>

<script>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getCurrentUser } from '@/utils/permissions';

export default {
    setup() {
        const route = useRoute();

        const removeSidebarClasses = () => {
            document.querySelector(".main-wrapper")?.classList.remove("slide-nav");
            document.querySelector(".sidebar-overlay")?.classList.remove("opened");
            document.querySelector("html")?.classList.remove("menu-opened");
        };

        // Remove classes when route changes
        watch(
            () => route.path,
            () => {
                removeSidebarClasses();
            }
        );

        // Also remove on first load if needed
        onMounted(() => {
            removeSidebarClasses();
        });
    },
    data() {
        return {
            showDropdown: false,
            currentUser: null,
            searchText: '',
            searchOpen: false,
            searchIndex: 0,
            searchItems: []
        };
    },
    computed: {
        searchResults() {
            const norm = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const q = norm(this.searchText.trim());
            if (!q) return [];
            return this.searchItems
                .filter(i => norm(i.label).includes(q) || norm(i.section).includes(q))
                .slice(0, 12);
        },
        homeRoute() {
            const user = this.currentUser || getCurrentUser();

            // DEBUG: Log para verificar el usuario actual

            if (!user || !user.roles) {
                return '/dashboard/admin-dashboard';
            }

            // Vendedor → Ventas por Vendedor
            if (user.roles.includes('cashier') || user.roles.includes('vendedor')) {
                return '/sales-report/sales-by-seller';
            }

            // Bodega → Inventario
            if (user.roles.includes('warehouse') || user.roles.includes('almacenista') || user.roles.includes('bodega') || user.roles.includes('personal_de_bodega')) {
                return '/inventory/product-list';
            }

            // Admin → Dashboard
            return '/dashboard/admin-dashboard';
        },
        showAddNewButton() {
            const user = getCurrentUser();
            if (!user || !user.roles) {
                return true; // Mostrar por defecto
            }

            // Ocultar para vendedor y bodega
            if (user.roles.includes('cashier') || user.roles.includes('vendedor') ||
                user.roles.includes('warehouse') || user.roles.includes('almacenista') || user.roles.includes('bodega') || user.roles.includes('personal_de_bodega')) {
                return false;
            }

            // Mostrar para admin
            return true;
        },
        showPOSButton() {
            const user = getCurrentUser();
            if (!user || !user.roles) {
                return true; // Mostrar por defecto
            }

            // Ocultar para bodega
            if (user.roles.includes('warehouse') || user.roles.includes('almacenista') || user.roles.includes('bodega') || user.roles.includes('personal_de_bodega')) {
                return false;
            }

            // Mostrar para admin, vendedor y otros
            return true;
        }
    },
    mounted() {
        // Inicializar el usuario actual de forma reactiva
        this.currentUser = getCurrentUser();

        this.initMouseoverListener();
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', this.handleClickOutside);

        // Escuchar cambios en el storage (por si se actualiza en otra pestaña)
        window.addEventListener('storage', this.handleStorageChange);

        // Atajo Ctrl+K / Cmd+K para el buscador
        window.addEventListener('keydown', this.handleSearchShortcut);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('storage', this.handleStorageChange);
        window.removeEventListener('keydown', this.handleSearchShortcut);
    },
    methods: {
        collectSearchItems() {
            // Toma los enlaces del menú lateral (ya filtrados por permisos del usuario)
            const links = document.querySelectorAll('#sidebar-menu a[href], .sidebar a[href]');
            const seen = new Set();
            const items = [];
            const base = this.$router.options.history.base || '';
            links.forEach(a => {
                let href = a.getAttribute('href') || '';
                if (!href || href === '#' || href.startsWith('javascript')) return;
                if (base && href.startsWith(base)) href = href.slice(base.length) || '/';
                const label = (a.textContent || '').replace(/\s+/g, ' ').trim();
                if (!label || seen.has(href)) return;
                seen.add(href);
                const sectionEl = a.closest('li.submenu')?.parentElement?.closest('li.submenu')?.querySelector(':scope > a')
                    || a.closest('ul')?.closest('li')?.querySelector(':scope > a');
                const section = sectionEl && sectionEl !== a ? (sectionEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
                items.push({ href, label, section });
            });
            this.searchItems = items;
        },
        openSearch() {
            this.collectSearchItems();
            this.searchOpen = true;
            this.searchIndex = 0;
        },
        closeSearch() {
            this.searchOpen = false;
            this.$refs.searchInput?.blur();
        },
        moveSelection(step) {
            const n = this.searchResults.length;
            if (!n) return;
            this.searchIndex = (this.searchIndex + step + n) % n;
        },
        goToSelected() {
            const item = this.searchResults[this.searchIndex];
            if (item) this.goTo(item);
        },
        goTo(item) {
            this.searchText = '';
            this.searchOpen = false;
            this.$router.push(item.href);
        },
        handleSearchShortcut(e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.$refs.searchInput?.focus();
            }
        },
        handleStorageChange(event) {
            // Actualizar usuario cuando cambie en localStorage
            if (event.key === 'user') {
                this.currentUser = getCurrentUser();
            }
        },
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        closeDropdown() {
            this.showDropdown = false;
        },
        handleClickOutside(event) {
            const search = this.$refs.searchContainer;
            if (search && !search.contains(event.target)) {
                this.searchOpen = false;
            }
            const dropdown = this.$refs.dropdownContainer;
            if (dropdown && !dropdown.contains(event.target)) {
                this.showDropdown = false;
            }
        },
        toggleMobileBtn() {
            document?.querySelector(".main-wrapper")?.classList?.toggle("slide-nav");
            document?.querySelector(".sidebar-overlay")?.classList?.toggle("opened");
            document?.querySelector("html")?.classList?.toggle("menu-opened");
        },
        initFullScreen() {
            document.body.classList.toggle("fullscreen-enable");
            if (
                !document.fullscreenElement &&
                /* alternative standard method */
                !document.mozFullScreenElement &&
                !document.webkitFullscreenElement
            ) {
                // current working methods
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                }
            } else {
                if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
            }
        },
        initMouseoverListener() {
            document.addEventListener('mouseover', this.handleMouseover);
        },
        handleMouseover(e) {
            e.stopPropagation();

            const body = document.body;
            const toggleBtn = document.getElementById('toggle_btn');

            if (body.classList.contains('mini-sidebar') && this.isElementVisible(toggleBtn)) {
                const target = e.target.closest('.sidebar, .header-left');

                if (target) {
                    body.classList.add('expand-menu');
                    this.slideDownSubmenu();
                } else {
                    body.classList.remove('expand-menu');
                    this.slideUpSubmenu();
                }

                e.preventDefault();
            }
        },
        isElementVisible(element) {
            return element.offsetWidth > 0 || element.offsetHeight > 0;
        },
        slideDownSubmenu() {
            const subdropPlusUl = document.getElementsByClassName('subdrop');
            for (let i = 0; i < subdropPlusUl.length; i++) {
                const submenu = subdropPlusUl[i].nextElementSibling;
                if (submenu && submenu.tagName.toLowerCase() === 'ul') {
                    submenu.style.display = 'block';
                }
            }
        },
        slideUpSubmenu() {
            const subdropPlusUl = document.getElementsByClassName('subdrop');
            for (let i = 0; i < subdropPlusUl.length; i++) {
                const submenu = subdropPlusUl[i].nextElementSibling;
                if (submenu && submenu.tagName.toLowerCase() === 'ul') {
                    submenu.style.display = 'none';
                }
            }
        },
    },
    beforeUnmount() {
        document.removeEventListener('mouseover', this.handleMouseover);
        document.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('storage', this.handleStorageChange);
    },
};
</script>

<style scoped>
.pp-search { position: relative; }
.pp-search__results { display: block; position: absolute; top: 100%; left: 0; min-width: 320px; max-height: 360px; overflow-y: auto; z-index: 1050; }
.pp-search__results .dropdown-item.active { background: var(--bs-primary, #fe9f43); color: #fff; }
.pp-search__results .dropdown-item.active small { color: #fff !important; }
</style>
