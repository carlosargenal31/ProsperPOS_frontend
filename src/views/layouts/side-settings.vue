<template>
  <div class="customizer-links" id="setdata">
    <ul class="sticky-sidebar">
      <li class="sidebar-icons">
        <a
          href="javascript:void(0);"
          class="navigation-add"
          data-bs-toggle="tooltip"
          data-bs-placement="left"
          data-bs-original-title="Theme"
          @click="toggleClass()"
        >
          <vue-feather type="settings" class="settings"></vue-feather>
        </a>
      </li>
    </ul>
  </div>
  <div
    :class="{
      'sidebar-settings': true,
      'nav-toggle': true,
      'show-settings': showPreview,
    }"
    @click="hidePreview"
  >
    <div class="sidebar-content sticky-sidebar-one" id="sect">
      <div class="sidebar-header">
        <div class="sidebar-theme-title">
          <h5>Theme Customizer</h5>
          <p>Customize & Preview in Real Time</p>
        </div>
        <div class="close-sidebar-icon d-flex">
          <a class="sidebar-refresh me-2" href="javascript:void(0);"
            ><vue-feather type="refresh-ccw"></vue-feather
          ></a>
          <a class="sidebar-close" href="javascript:void(0);" @click="closeSidebar"
            ><vue-feather type="x"></vue-feather
          ></a>
        </div>
      </div>
      <form action="javascript:;" method="post">
        <div class="sidebar-body">
          <div class="theme-mode">
            <div class="theme-head">
              <h6>Theme Mode</h6>
              <p>Enjoy Dark & Light modes.</p>
            </div>
            <div class="row">
              <div class="col-xl-6 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="theme-mode"
                        id="light_mode"
                        class="check color-check stylemode alldata"
                        value="light_mode"
                      />
                      <label for="light_mode" class="checktoggles">
                        <img src="@/assets/img/theme/theme-img-01.jpg" alt="" />
                        <span class="theme-name">Light Mode</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-6 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="theme-mode"
                        id="dark_mode"
                        class="check color-check stylemode alldata"
                        value="dark_mode"
                      />
                      <label for="dark_mode" class="checktoggles">
                        <img src="@/assets/img/theme/theme-img-02.jpg" alt="" />
                        <span class="theme-name">Dark Mode</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="theme-mode">
            <div class="theme-head">
              <h6>Direction</h6>
              <p>Select the direction for your app.</p>
            </div>
            <div class="row">
              <div class="col-xl-6 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="direction"
                        id="ltr"
                        class="check direction"
                        value="ltr"
                      />
                      <label for="ltr" class="checktoggles">
                        <a
                          href="https://dreamspos.dreamstechnologies.com/vue/template/"
                          target="_blank"
                        >
                          <img src="@/assets/img/theme/theme-img-01.jpg" alt="" />
                          <span class="theme-name">LTR</span>
                        </a>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-6 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="direction"
                        id="rtl"
                        class="check direction"
                        value="rtl"
                      />
                      <label for="rtl" class="checktoggles">
                        <a
                          href="https://dreamspos.dreamstechnologies.com/vue/template-rtl/"
                          target="_blank"
                        >
                          <img src="@/assets/img/theme/theme-img-03.jpg" alt="" />
                          <span class="theme-name">RTL</span>
                        </a>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="theme-mode border-0 mb-0">
            <div class="theme-head">
              <h6>Layout Mode</h6>
              <p>Select the primary layout style for your app.</p>
            </div>
            <div class="row">
              <div class="col-xl-6 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="layout"
                        id="default_layout"
                        class="check layout-mode alldata"
                        value="default"
                      />
                      <label for="default_layout" class="checktoggles">
                        <img src="@/assets/img/theme/theme-img-01.jpg" alt="" />
                        <span class="theme-name">Default</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-6 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="layout"
                        id="box_layout"
                        class="check layout-mode alldata"
                        value="box"
                      />
                      <label for="box_layout" class="checktoggles">
                        <img src="@/assets/img/theme/theme-img-07.jpg" alt="" />
                        <span class="theme-name">Box</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-6 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="layout"
                        id="collapse_layout"
                        class="check layout-mode alldata"
                        value="collapsed"
                      />
                      <label for="collapse_layout" class="checktoggles">
                        <img src="@/assets/img/theme/theme-img-05.jpg" alt="" />
                        <span class="theme-name">Collapsed</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-6 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="layout"
                        id="horizontal_layout"
                        class="check layout-mode alldata"
                        value="horizontal"
                      />
                      <label for="horizontal_layout" class="checktoggles">
                        <img src="@/assets/img/theme/theme-img-06.jpg" alt="" />
                        <span class="theme-name">Horizontal</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-6 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="layout"
                        id="modern_layout"
                        class="check layout-mode alldata"
                        value="modern"
                      />
                      <label for="modern_layout" class="checktoggles">
                        <img src="@/assets/img/theme/theme-img-04.jpg" alt="" />
                        <span class="theme-name">Modern</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="theme-mode">
            <div class="theme-head">
              <h6>Navigation Colors</h6>
              <p>Setup the color for the Navigation</p>
            </div>
            <div class="row">
              <div class="col-xl-4 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="nav_color"
                        id="light_color"
                        class="check nav-color alldata"
                        value="light"
                      />
                      <label for="light_color" class="checktoggles">
                        <span class="theme-name">Light</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-4 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="nav_color"
                        id="grey_color"
                        class="check nav-color alldata"
                        value="grey"
                      />
                      <label for="grey_color" class="checktoggles">
                        <span class="theme-name">Grey</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-4 ere">
                <div class="layout-wrap">
                  <div class="d-flex align-items-center">
                    <div class="status-toggle d-flex align-items-center me-2">
                      <input
                        type="radio"
                        name="nav_color"
                        id="dark_color"
                        class="check nav-color alldata"
                        value="dark"
                      />
                      <label for="dark_color" class="checktoggles">
                        <span class="theme-name">Dark</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="sidebar-footer">
          <div class="row">
            <div class="col-xl-6">
              <div class="footer-preview-btn">
                <button @click="resetData" type="button" class="btn btn-secondary w-100">
                  Reset
                </button>
              </div>
            </div>
            <div class="col-xl-6">
              <div class="footer-reset-btn">
                <a
                  href="https://themeforest.net/item/dreamspos-pos-inventory-management-admin-dashboard-template/38834413"
                  target="_blank"
                  class="btn btn-primary w-100"
                  >Buy Now</a
                >
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            theme: localStorage.getItem('theme') || 'light',
            sidebarTheme: localStorage.getItem('sidebarTheme') || 'light',
            color: localStorage.getItem('color') || 'primary',
            layout: localStorage.getItem('layout') || 'default',
            topbar: localStorage.getItem('topbar') || 'white',
            topbarcolor: localStorage.getItem('topbarcolor') || 'white',
            size: localStorage.getItem('size') || 'default',
            width: localStorage.getItem('width') || 'fluid',
        };
    },
    mounted() {
        this.applyThemeSettings();

        // Attach event listeners to radio buttons
        document.querySelectorAll('input[name="LayoutTheme"]').forEach((radio) => {
            radio.addEventListener('change', this.handleLayoutChange);
        });

        
    },
    methods: {
        applyThemeSettings() {
            document.documentElement.setAttribute('data-theme', this.theme);
            document.documentElement.setAttribute('data-sidebar', this.sidebarTheme);
            document.documentElement.setAttribute('data-color', this.color);
            document.documentElement.setAttribute('data-layout', this.layout);
            document.documentElement.setAttribute('data-topbar', this.topbar);
            document.documentElement.setAttribute('data-topbarcolor', this.topbarcolor);
            document.documentElement.setAttribute('data-size', this.size);
            document.documentElement.setAttribute('data-width', this.width);
        },
        setThemeAndSidebarTheme(theme, sidebarTheme, color, layout, topbar, topbarcolor, size, width) {
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.setAttribute('data-sidebar', sidebarTheme);
            document.documentElement.setAttribute('data-color', color);
            document.documentElement.setAttribute('data-layout', layout);
            document.documentElement.setAttribute('data-topbar', topbar);
            document.documentElement.setAttribute('data-topbarcolor', topbarcolor);
            document.documentElement.setAttribute('data-size', size);
            document.documentElement.setAttribute('data-width', width);

            let layout_mini = 0;
            document.body.classList.remove("mini-sidebar", "menu-horizontal", "expand-menu", "layout-box-mode");

            if (layout === 'mini' || size === 'compact' || width === 'box') {
                document.body.classList.add("mini-sidebar");
                layout_mini = 1;
            }
            if (layout === 'horizontal' || layout === 'horizontal-overlay' || layout === 'horizontal-single') {
                document.body.classList.add("menu-horizontal");
            }
            if (size === 'hoverview') {
                document.body.classList.add("expand-menu");
                if (layout_mini === 0) document.body.classList.remove("mini-sidebar");
            }
            if (width === 'box') {
                document.body.classList.add("layout-box-mode");
                document.body.classList.add("mini-sidebar");
                layout_mini = 1;
            }

            // Store settings
            localStorage.setItem('theme', theme);
            localStorage.setItem('sidebarTheme', sidebarTheme);
            localStorage.setItem('color', color);
            localStorage.setItem('layout', layout);
            localStorage.setItem('topbar', topbar);
            localStorage.setItem('topbarcolor', topbarcolor);
            localStorage.setItem('size', size);
            localStorage.setItem('width', width);
        },
        handleLayoutChange(event) {
            this.layout = event.target.value;
            this.setThemeAndSidebarTheme(
                this.theme,
                this.sidebarTheme,
                this.color,
                this.layout,
                this.topbar,
                this.topbarcolor,
                this.size,
                this.width
            );
        },

        handleSidebarBgChange() {
            const sidebarBg = document.querySelector('input[name="sidebarbg"]:checked') ? document.querySelector('input[name="sidebarbg"]:checked').value : null;
    
            if (sidebarBg) {
                document.body.setAttribute('data-sidebarbg', sidebarBg);
                localStorage.setItem('sidebarBg', sidebarBg);
            } else {
                document.body.removeAttribute('data-sidebarbg');
                localStorage.removeItem('sidebarBg');
            }
        },

        handleTopbarBgChange() {
            const topbarbg = document.querySelector('input[name="topbarbg"]:checked') ? document.querySelector('input[name="topbarbg"]:checked').value : null;
    
            if (topbarbg) {
                document.body.setAttribute('data-topbarbg', topbarbg);
                localStorage.setItem('topbarbg', topbarbg);
            } else {
                document.body.removeAttribute('data-topbarbg');
                localStorage.removeItem('topbarbg');
            }
        },
    
        handleInputChange() {
            const theme = document.querySelector('input[name="theme"]:checked').value;
            const layout = document.querySelector('input[name="LayoutTheme"]:checked').value;
            const size = document.querySelector('input[name="size"]:checked').value;
            const width = document.querySelector('input[name="width"]:checked').value;

            
            color = localStorage.getItem('primaryRGB');
            sidebarTheme = localStorage.getItem('sidebarRGB');
            topbar = localStorage.getItem('topbarRGB');
            topbarcolor = localStorage.getItem('topbarcolorRGB');
            
            if(document.querySelector('input[name="color"]:checked') != null)
            {
                color = document.querySelector('input[name="color"]:checked').value;
            }else{
                color = 'all'
            }

            if(document.querySelector('input[name="sidebar"]:checked') != null)
            {
                sidebarTheme = document.querySelector('input[name="sidebar"]:checked').value;
            }else{
                sidebarTheme = 'all'
            }

            if(document.querySelector('input[name="topbar"]:checked') != null)
            {
                topbar = document.querySelector('input[name="topbar"]:checked').value;
            }else{
                topbar = 'all'
            }

            if(document.querySelector('input[name="topbarcolor"]:checked') != null)
            {
                topbarcolor = document.querySelector('input[name="topbarcolor"]:checked').value;
            }else{
                topbarcolor = 'all'
            }
    
            setThemeAndSidebarTheme(theme, sidebarTheme, color, layout, topbar, topbarcolor, size, width);
        },
    
        resetThemeAndSidebarThemeAndColorAndBg() {
            setThemeAndSidebarTheme('light', 'light', 'primary', 'default', 'white', 'white', 'default', 'fluid', 'enable');
            document.body.removeAttribute('data-sidebarbg');
            document.body.removeAttribute('data-topbarbg');
    
            document.getElementById('lightTheme').checked = true;
            document.getElementById('lightSidebar').checked = true;
            document.getElementById('primaryColor').checked = true;
            document.getElementById('defaultLayout').checked = true;
            document.getElementById('whiteTopbar').checked = true;
            document.getElementById('whiteTopbarcolor').checked = true;
            document.getElementById('defaultSize').checked = true;
            document.getElementById('fluidWidth').checked = true;
    
            const checkedSidebarBg = document.querySelector('input[name="sidebarbg"]:checked');
            if (checkedSidebarBg) {
                checkedSidebarBg.checked = false;
            }
    
            localStorage.removeItem('sidebarBg');

            const checkedTopbarBg = document.querySelector('input[name="topbarbg"]:checked');
            if (checkedTopbarBg) {
                checkedTopbarBg.checked = false;
            }
    
            localStorage.removeItem('topbarbg');
        },
    }
};
</script>