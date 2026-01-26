/**
 * Configuración de permisos del sidebar por rol
 */

export const SIDEBAR_PERMISSIONS = {
  // Secciones permitidas para Vendedor (cashier)
  cashier: [
    'Ventas',
    'Inventario',
    'Ajustes',
    'Ayuda'
  ],

  // Secciones permitidas para Personal de Bodega (warehouse)
  warehouse: [
    'Ventas',
    'Inventario',
    'Ajustes',
    'Ayuda'
  ],

  // Submenús permitidos para Vendedor
  cashier_submenus: {
    'Ventas': {
      'Archivos': ['Cupones', 'Ofertas'],
      'Procesos': ['POS Facturación', 'Devoluciones Ventas', 'Guías de Remisión', 'Arqueo de Caja'],
      'Reportes': ['Reimpresiones Ventas', 'Ventas por Vendedor', 'Estado Cuenta Ventas']
    },
    'Inventario': {
      'Archivos': ['Productos'],
      'Reportes': ['Lista de Inventario Físico', 'Codigo de Barras']
    },
    'Ajustes': {
      'Ajustes Generales': ['Seguridad']
    }
  },

  // Submenús permitidos para Personal de Bodega
  warehouse_submenus: {
    'Ventas': {
      'Procesos': ['Guías de Remisión']
    },
    'Inventario': {
      'Archivos': ['Productos', 'Categorias', 'Sub Categorias', 'Marcas', 'Unidades', 'Codigo de Barras'],
      'Procesos': ['Manejo de Inventario', 'Ajuste de Inventario'],
      'Reportes': ['Lista de Inventario Físico', 'Historial de Existencias']
    },
    'Ajustes': {
      'Ajustes Generales': ['Seguridad']
    }
  }
};

/**
 * Verifica si un usuario tiene permiso para ver una sección
 * @param {Object} user - Usuario actual
 * @param {string} sectionTitle - Título de la sección
 * @returns {boolean}
 */
export function canViewSection(user, sectionTitle) {
  if (!user || !user.roles) {
    console.log('[canViewSection] No user or roles');
    return false;
  }

  // Admins y super admins ven todo
  if (user.roles.includes('admin') || user.roles.includes('super_admin') || user.roles.includes('administrador')) {
    console.log(`[canViewSection] "${sectionTitle}": Admin - TRUE`);
    return true;
  }

  // Verificar para vendedor (cashier o vendedor)
  if (user.roles.includes('cashier') || user.roles.includes('vendedor')) {
    const canView = SIDEBAR_PERMISSIONS.cashier.includes(sectionTitle);
    console.log(`[canViewSection] "${sectionTitle}": Cashier/Vendedor - ${canView}`);
    return canView;
  }

  // Verificar para bodega (warehouse o almacenista o personal_de_bodega)
  if (user.roles.includes('warehouse') || user.roles.includes('almacenista') || user.roles.includes('bodega') || user.roles.includes('personal_de_bodega')) {
    const canView = SIDEBAR_PERMISSIONS.warehouse.includes(sectionTitle);
    console.log(`[canViewSection] "${sectionTitle}": Warehouse/Almacenista/Personal de Bodega - ${canView}`);
    return canView;
  }

  console.log(`[canViewSection] "${sectionTitle}": No matching role - FALSE (roles: ${user.roles.join(', ')})`);
  return false;
}

/**
 * Verifica si un usuario tiene permiso para ver un submenú
 * @param {Object} user - Usuario actual
 * @param {string} sectionTitle - Título de la sección padre
 * @param {string} submenuTitle - Título del submenú
 * @returns {boolean}
 */
export function canViewSubmenu(user, sectionTitle, submenuTitle) {
  if (!user || !user.roles) return false;

  // Admins ven todo
  if (user.roles.includes('admin') || user.roles.includes('super_admin')) {
    return true;
  }

  // Verificar para vendedor
  if (user.roles.includes('cashier')) {
    const allowedSubmenus = SIDEBAR_PERMISSIONS.cashier_submenus[sectionTitle];
    if (!allowedSubmenus) return false;

    if (Array.isArray(allowedSubmenus)) {
      return allowedSubmenus.includes(submenuTitle);
    }

    // Es un objeto con submenús anidados
    return Object.values(allowedSubmenus).some(items => {
      if (Array.isArray(items)) {
        return items.includes(submenuTitle);
      }
      return false;
    });
  }

  // Verificar para bodega
  if (user.roles.includes('warehouse') || user.roles.includes('almacenista') || user.roles.includes('bodega') || user.roles.includes('personal_de_bodega')) {
    const allowedSubmenus = SIDEBAR_PERMISSIONS.warehouse_submenus[sectionTitle];
    if (!allowedSubmenus) return false;

    if (Array.isArray(allowedSubmenus)) {
      return allowedSubmenus.includes(submenuTitle);
    }

    // Es un objeto con submenús anidados
    return Object.values(allowedSubmenus).some(items => {
      if (Array.isArray(items)) {
        return items.includes(submenuTitle);
      }
      return false;
    });
  }

  return false;
}

/**
 * Verifica si un usuario tiene permiso para ver un item dentro de un submenú
 * @param {Object} user - Usuario actual
 * @param {string} sectionTitle - Título de la sección padre
 * @param {string} submenuTitle - Título del submenú padre
 * @param {string} itemTitle - Título del item
 * @returns {boolean}
 */
export function canViewSubmenuItem(user, sectionTitle, submenuTitle, itemTitle) {
  if (!user || !user.roles) {
    console.log('[canViewSubmenuItem] No user or roles');
    return false;
  }

  // Admins ven todo
  if (user.roles.includes('admin') || user.roles.includes('super_admin') || user.roles.includes('administrador')) {
    console.log(`[canViewSubmenuItem] "${sectionTitle}" > "${submenuTitle}" > "${itemTitle}": Admin - TRUE`);
    return true;
  }

  // Verificar para vendedor (cashier o vendedor)
  if (user.roles.includes('cashier') || user.roles.includes('vendedor')) {
    const sectionSubmenus = SIDEBAR_PERMISSIONS.cashier_submenus[sectionTitle];
    if (!sectionSubmenus) {
      console.log(`[canViewSubmenuItem] "${sectionTitle}" > "${submenuTitle}" > "${itemTitle}": No section submenus - FALSE`);
      return false;
    }

    const submenuItems = sectionSubmenus[submenuTitle];
    if (!submenuItems) {
      console.log(`[canViewSubmenuItem] "${sectionTitle}" > "${submenuTitle}" > "${itemTitle}": No submenu items - FALSE`);
      return false;
    }

    const canView = Array.isArray(submenuItems) && submenuItems.includes(itemTitle);
    console.log(`[canViewSubmenuItem] "${sectionTitle}" > "${submenuTitle}" > "${itemTitle}": Cashier/Vendedor - ${canView}`);
    console.log(`  - submenuItems:`, submenuItems);
    return canView;
  }

  // Verificar para bodega (warehouse o almacenista o personal_de_bodega)
  if (user.roles.includes('warehouse') || user.roles.includes('almacenista') || user.roles.includes('bodega') || user.roles.includes('personal_de_bodega')) {
    const sectionSubmenus = SIDEBAR_PERMISSIONS.warehouse_submenus[sectionTitle];
    if (!sectionSubmenus) {
      console.log(`[canViewSubmenuItem] "${sectionTitle}" > "${submenuTitle}" > "${itemTitle}": No section submenus - FALSE`);
      return false;
    }

    const submenuItems = sectionSubmenus[submenuTitle];
    if (!submenuItems) {
      console.log(`[canViewSubmenuItem] "${sectionTitle}" > "${submenuTitle}" > "${itemTitle}": No submenu items - FALSE`);
      return false;
    }

    const canView = Array.isArray(submenuItems) && submenuItems.includes(itemTitle);
    console.log(`[canViewSubmenuItem] "${sectionTitle}" > "${submenuTitle}" > "${itemTitle}": Warehouse/Almacenista/Personal de Bodega - ${canView}`);
    console.log(`  - submenuItems:`, submenuItems);
    return canView;
  }

  console.log(`[canViewSubmenuItem] "${sectionTitle}" > "${submenuTitle}" > "${itemTitle}": No matching role - FALSE (roles: ${user.roles.join(', ')})`);
  return false;
}
