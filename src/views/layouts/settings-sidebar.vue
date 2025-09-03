<template>
  <div class="settings-sidebar" id="sidebar2">
    <div class="sidebar-inner slimscroll">
      <div id="sidebar-menu5" class="sidebar-menu">
        <h4 class="fw-bold fs-18 mb-2 pb-2">Settings</h4>
        <ul>
          <li class="submenu-open">
            <ul>
              <li v-for="menu in Settings" :key="menu.title" class="submenu">
                <a
                  href="javascript:void(0);"
                  @click="toggleSubMenu(menu)"
                  :class="{ subdrop: menu.expanded, active: isActiveMenu(menu) }"
                >
                  <vue-feather :type="menu.icon" class="fs-18"></vue-feather>
                  <span>{{ menu.title }}</span>
                  <span class="menu-arrow"></span>
                </a>
                <ul :class="{ 'd-block': menu.expanded, 'd-none': !menu.expanded }">
                  <li v-for="subMenu in menu.subMenu" :key="subMenu.routes">
                    <router-link
                      :to="subMenu.routes"
                      class="router-link"
                      :class="{ active: isActive(subMenu.routes) }"
                    >
                      {{ subMenu.title }}
                    </router-link>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Settings from "@/assets/json/settings.json";

export default {
  data() {
    return {
      Settings: Settings,
    };
  },
  methods: {
    toggleSubMenu(menu) {
      menu.expanded = !menu.expanded;
    },
    isActive(route) {
      return this.$route.path === route;
    },
    isActiveMenu(menu) {
      // Check if any submenu item matches the current route
      return menu.subMenu.some((subMenu) => this.$route.path === subMenu.routes);
    },
  },
};
</script>
