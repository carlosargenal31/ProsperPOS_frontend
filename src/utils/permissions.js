// ===================================================================
// UTILIDAD DE PERMISOS
// ===================================================================

/**
 * Obtener el usuario actual del localStorage
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Verificar si el usuario tiene un permiso específico
 * @param {string} permission - El permiso a verificar (ej: 'users.create')
 * @returns {boolean}
 */
export function hasPermission(permission) {
  const user = getCurrentUser();
  if (!user) return false;

  // Super admins y admins tienen todos los permisos
  if (user.roles && (user.roles.includes('super_admin') || user.roles.includes('admin'))) {
    return true;
  }

  // Verificar si el usuario tiene el permiso específico
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }

  return false;
}

/**
 * Verificar si el usuario tiene alguno de los permisos especificados
 * @param {string[]} permissions - Array de permisos a verificar
 * @returns {boolean}
 */
export function hasAnyPermission(permissions) {
  return permissions.some(permission => hasPermission(permission));
}

/**
 * Verificar si el usuario tiene todos los permisos especificados
 * @param {string[]} permissions - Array de permisos a verificar
 * @returns {boolean}
 */
export function hasAllPermissions(permissions) {
  return permissions.every(permission => hasPermission(permission));
}

/**
 * Verificar si el usuario tiene un rol específico
 * @param {string} role - El rol a verificar (ej: 'admin')
 * @returns {boolean}
 */
export function hasRole(role) {
  const user = getCurrentUser();
  if (!user || !user.roles) return false;

  return user.roles.includes(role);
}

/**
 * Verificar si el usuario tiene alguno de los roles especificados
 * @param {string[]} roles - Array de roles a verificar
 * @returns {boolean}
 */
export function hasAnyRole(roles) {
  return roles.some(role => hasRole(role));
}

/**
 * Obtener todos los permisos del usuario actual
 * @returns {string[]}
 */
export function getUserPermissions() {
  const user = getCurrentUser();
  if (!user || !user.permissions) return [];

  return user.permissions;
}

/**
 * Obtener todos los roles del usuario actual
 * @returns {string[]}
 */
export function getUserRoles() {
  const user = getCurrentUser();
  if (!user || !user.roles) return [];

  return user.roles;
}

/**
 * Verificar si el usuario puede acceder a un módulo
 * @param {string} module - El módulo a verificar (ej: 'users')
 * @returns {boolean}
 */
export function canAccessModule(module) {
  const user = getCurrentUser();
  if (!user) return false;

  // Super admins y admins pueden acceder a todo
  if (user.roles && (user.roles.includes('super_admin') || user.roles.includes('admin'))) {
    return true;
  }

  // Verificar si tiene algún permiso del módulo
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.some(perm => perm.startsWith(`${module}.`));
  }

  return false;
}
