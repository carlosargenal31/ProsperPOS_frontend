<template>
  <ul>
    <li class="submenu-open" v-for="item in ecommerce_sidebar_data" :key="item.tittle">
        <h6 class="submenu-hdr">{{ item.tittle }}</h6>
        <ul>
            <template v-for="menu in item.menu" :key="menu.menuValue">
                <li v-if="!menu.hasSubRoute" :class="{ 'active': isMenuActive(menu) }">
                    <router-link v-if="menu.route" :to="menu.route">
                        <i :class="menu.icon" class="fs-16 me-2"></i>
                        <span>{{ menu.menuValue }}</span>
                    </router-link>
                </li>
            </template>
        </ul>
    </li>
  </ul>
</template>

<script>
import ecommerce_sidebar_data from "@/assets/json/ecommerce-sidebar.json";

export default {
  data() {
      return {
          ecommerce_sidebar_data: ecommerce_sidebar_data,
      }
  },
  computed: {
      isMenuActive() {
          return (menu) => {
              return this.$route.path === menu.route ||
              this.$route.path === menu.active_link;
          };
      }
  }
};
</script>
