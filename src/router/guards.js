// src/router/guards.js
import { useAuthStore } from '@/stores/auth';

/**
 * Guard para rutas que requieren autenticación
 */
export const authGuard = (to, from, next) => {
  const authStore = useAuthStore();

  // Verificar si el usuario está autenticado
  if (!authStore.isAuthenticated) {
    // Guardar la ruta a la que intentaba acceder
    next({
      path: '/sign-in',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
};

/**
 * Guard para rutas que requieren permisos específicos
 */
export const permissionGuard = (permission) => {
  return (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      next({
        path: '/sign-in',
        query: { redirect: to.fullPath }
      });
    } else if (!authStore.hasPermission(permission)) {
      // Redireccionar a página de acceso denegado
      next({
        path: '/unauthorized',
        replace: true
      });
    } else {
      next();
    }
  };
};

/**
 * Guard para rutas que requieren roles específicos
 */
export const roleGuard = (roles) => {
  return (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      next({
        path: '/sign-in',
        query: { redirect: to.fullPath }
      });
    } else {
      // Verificar si el usuario tiene alguno de los roles requeridos
      const hasRole = roles.some(role => authStore.hasRole(role));
      
      if (!hasRole) {
        next({
          path: '/unauthorized',
          replace: true
        });
      } else {
        next();
      }
    }
  };
};

/**
 * Guard para rutas de invitados (solo usuarios no autenticados)
 */
export const guestGuard = (to, from, next) => {
  const authStore = useAuthStore();

  if (authStore.isAuthenticated) {
    // Si ya está autenticado, redireccionar al dashboard
    next('/dashboard');
  } else {
    next();
  }
};

/**
 * Verificar si el token está expirado
 */
export const tokenExpiryGuard = async (to, from, next) => {
  const authStore = useAuthStore();

  if (authStore.isAuthenticated) {
    try {
      // Intentar renovar el token si está cerca de expirar
      const token = authStore.accessToken;
      const tokenData = parseJwt(token);
      
      // Verificar si el token expira en menos de 5 minutos
      if (tokenData.exp) {
        const expiryTime = tokenData.exp * 1000; // Convertir a milisegundos
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;
        
        // Si faltan menos de 5 minutos para expirar, renovar
        if (timeUntilExpiry < 5 * 60 * 1000) {
          await authStore.refreshAccessToken();
        }
      }
      
      next();
    } catch (error) {
      console.error('Error verificando token:', error);
      // Si falla, limpiar autenticación y redireccionar
      authStore.clearAuth();
      next({
        path: '/sign-in',
        query: { redirect: to.fullPath }
      });
    }
  } else {
    next();
  }
};

/**
 * Función auxiliar para parsear JWT
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * Guard global que combina verificación de autenticación y token
 */
export const globalGuard = async (to, from, next) => {
  const authStore = useAuthStore();

  // Inicializar el store si no está inicializado
  if (!authStore.isAuthenticated && localStorage.getItem('accessToken')) {
    authStore.initialize();
  }

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/sign-in', '/register', '/forgot-password', '/reset-password'];
  
  if (publicRoutes.includes(to.path)) {
    // Si ya está autenticado y va a login, redireccionar al dashboard
    if (authStore.isAuthenticated) {
      next('/dashboard');
    } else {
      next();
    }
  } else {
    // Para rutas protegidas, verificar autenticación
    await tokenExpiryGuard(to, from, next);
  }
};