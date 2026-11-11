// Fechas "solo día" (DATE de MySQL). Evita el desfase de un día que ocurre al
// convertir con new Date()/toISOString() entre UTC y la hora de Honduras (UTC-6).

const pad = (n) => String(n).padStart(2, '0');

/** Fecha local de hoy en formato yyyy-MM-dd */
export const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Normaliza un valor de fecha a yyyy-MM-dd sin cambiar el día */
export const toDateOnly = (value) => {
  if (!value) return '';
  if (value instanceof Date) {
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  const str = String(value);
  const m = str.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : str;
};

/** dd/MM/yyyy para mostrar */
export const formatDateOnly = (value) => {
  const d = toDateOnly(value);
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (d || '-');
};
