/**
 * Utilidad para descargar manuales de usuario
 */

/**
 * Descarga un manual PDF (abre en nueva pestaña)
 * @param {string} manualFile - Nombre del archivo del manual (ej: 'manual-administrador.pdf')
 */
export function downloadManual(manualFile) {
  try {
    // Los manuales se sirven desde el backend
    const manualUrl = `http://localhost:3000/manuales/${manualFile}`;

    // Abrir en nueva pestaña
    const newWindow = window.open(manualUrl, '_blank');

    if (!newWindow) {
      // Si el popup fue bloqueado
      alert('Por favor permite las ventanas emergentes para ver el manual');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error al abrir el manual:', error);
    alert('Error al abrir el manual. Por favor contacta al administrador.');
    return false;
  }
}

/**
 * Verifica si un manual existe en el servidor
 * @param {string} manualFile - Nombre del archivo del manual
 * @returns {Promise<boolean>}
 */
export async function manualExists(manualFile) {
  try {
    const manualUrl = `/manuales/${manualFile}`;
    const response = await fetch(manualUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error al verificar la existencia del manual:', error);
    return false;
  }
}

/**
 * Abre un manual en una nueva pestaña
 * @param {string} manualFile - Nombre del archivo del manual
 */
export function openManual(manualFile) {
  try {
    const manualUrl = `/manuales/${manualFile}`;
    window.open(manualUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Error al abrir el manual:', error);
    return false;
  }
}
