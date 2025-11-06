<template>
    <!-- Header -->
    <div class="header">
        <div class="main-header">

            <!-- Logo -->
            <div class="header-left active">
                <router-link to="/dashboard/" class="logo logo-normal">
                    <img src="@/assets/img/logo.png" alt="">
                </router-link>
                <router-link to="/dashboard/" class="logo logo-white">
                    <img src="@/assets/img/logo-white.png" alt="">
                </router-link>
                <router-link to="/dashboard/" class="logo-small">
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

                <!-- Search -->
                <li class="nav-item nav-searchinputs">
                    <div class="top-nav-search">
                        <a href="javascript:void(0);" class="responsive-search">
                            <i class="fa fa-search"></i>
                        </a>
                        <form action="#" class="dropdown">
                            <div class="searchinputs input-group dropdown-toggle" id="dropdownMenuClickable" data-bs-toggle="dropdown" data-bs-auto-close="false">
                                <input type="text" placeholder="Buscar">
                                <div class="search-addon">
                                    <span><i class="ti ti-search"></i></span>
                                </div>
                                <span class="input-group-text">
                                    <kbd class="d-flex align-items-center"><img src="@/assets/img/icons/command.svg" alt="img" class="me-1">K</kbd>
                                </span>
                            </div>
                            <div class="dropdown-menu search-dropdown" aria-labelledby="dropdownMenuClickable">
                                <div class="search-info">
                                    <h6><span><i data-feather="search" class="feather-16"></i></span>Recent Searches
                                    </h6>
                                    <ul class="search-tags">
                                        <li><a href="javascript:void(0);">Products</a></li>
                                        <li><a href="javascript:void(0);">Sales</a></li>
                                        <li><a href="javascript:void(0);">Applications</a></li>
                                    </ul>
                                </div>
                                <div class="search-info">
                                    <h6><span><i data-feather="help-circle" class="feather-16"></i></span>Help</h6>
                                    <p>How to Change Product Volume from 0 to 200 on Inventory management</p>
                                    <p>Change Product Name</p>
                                </div>
                                <div class="search-info">
                                    <h6><span><i data-feather="user" class="feather-16"></i></span>Customers</h6>
                                    <ul class="customers">
                                        <li><a href="javascript:void(0);">Aron Varu<img src="@/assets/img/profiles/avator1.jpg" alt="" class="img-fluid"></a></li>
                                        <li><a href="javascript:void(0);">Jonita<img src="@/assets/img/profiles/avatar-01.jpg" alt="" class="img-fluid"></a></li>
                                        <li><a href="javascript:void(0);">Aaron<img src="@/assets/img/profiles/avatar-10.jpg" alt="" class="img-fluid"></a></li>
                                    </ul>
                                </div>
                            </div>
                        </form>
                    </div>
                </li>
                <!-- /Search -->

                <li class="nav-item dropdown link-nav">
                    <a href="javascript:void(0);" class="btn btn-primary btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
                        <i class="ti ti-circle-plus me-1"></i>Agregar Nuevo
                    </a>
                    <div class="dropdown-menu dropdown-xl dropdown-menu-center">
                        <div class="row g-2">
                            <div class="col-md-2">
                                <router-link to="/inventory/category-list" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-brand-codepen"></i>
                                    </span>
                                    <p>Categoría</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/inventory/add-product" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-square-plus"></i>
                                    </span>
                                    <p>Producto</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/purchases/purchase-list" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-shopping-bag"></i>
                                    </span>
                                    <p>Compra</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/pos/pos-5" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-shopping-cart"></i>
                                    </span>
                                    <p>Venta</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/expenses/expenses-list" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-truck"></i>
                                    </span>
                                    <p>Envío</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/sales/quotation-list" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-device-floppy"></i>
                                    </span>
                                    <p>Cotización</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/sales/sales-returns" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-copy"></i>
                                    </span>
                                    <p>Devolución</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/users/users-list" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-user"></i>
                                    </span>
                                    <p>Usuario</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/ecommerce/customers" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-users"></i>
                                    </span>
                                    <p>Cliente</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/inventory/brand-list" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-shield"></i>
                                    </span>
                                    <p>Marca</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/people/suppliers" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-user-check"></i>
                                    </span>
                                    <p>Proveedor</p>
                                </router-link>
                            </div>
                            <div class="col-md-2">
                                <router-link to="/stock/manage-stocks" class="link-item">
                                    <span class="link-icon">
                                        <i class="ti ti-stack-3"></i>
                                    </span>
                                    <p>Inventario</p>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </li>
                
                <li class="nav-item pos-nav">
                    <router-link to="/pos/pos-5" class="btn btn-dark btn-md d-inline-flex align-items-center">
                        <i class="ti ti-device-laptop me-1"></i>POS
                    </router-link>
                </li>

                <li class="nav-item nav-item-box">
                    <a href="javascript:void(0);" id="btnFullscreen" @click="initFullScreen">
                        <i class="ti ti-maximize"></i>
                    </a>
                </li>

                <li class="nav-item nav-item-box">
                    <router-link to="/settings/general-settings"><i class="ti ti-settings"></i></router-link>
                </li>
                <li class="nav-item dropdown has-arrow main-drop profile-nav">
                    <a href="javascript:void(0);" class="nav-link userset" data-bs-toggle="dropdown">
                        <span class="user-info p-0">
                            <span class="user-letter">
                                <img src="@/assets/img/profiles/avator1.jpg" alt="" class="img-fluid">
                            </span>
                        </span>
                    </a>
                    <div class="dropdown-menu menu-drop-user">
                        <div class="profileset d-flex align-items-center">
                            <span class="user-img me-2">
                                <img src="@/assets/img/profiles/avator1.jpg" alt="">
                            </span>
                            <div>
                                <h6 class="fw-medium">Carlos Argeñal</h6>
                                <p>Admin</p>
                            </div>
                        </div>
                        <router-link class="dropdown-item" to="/settings/general-settings"><i class="ti ti-user-circle me-2"></i>Mi Perfil</router-link>
                        <hr class="my-2">
                        <router-link class="dropdown-item logout pb-0" to="/"><i class="ti ti-logout me-2"></i>Cerrar sesión</router-link>
                    </div>
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
        return {};
    },
    mounted() {
        this.initMouseoverListener();
    },
    methods: {
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
    },
};
</script>