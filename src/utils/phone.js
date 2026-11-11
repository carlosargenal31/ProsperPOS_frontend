// Utilidades de teléfono e identificación (mismo criterio que la tienda en línea)

export const COUNTRIES = [
  { code: '+504', iso: 'hn', name: 'Honduras', len: 8, groups: [4, 4] },
  { code: '+502', iso: 'gt', name: 'Guatemala', len: 8, groups: [4, 4] },
  { code: '+503', iso: 'sv', name: 'El Salvador', len: 8, groups: [4, 4] },
  { code: '+505', iso: 'ni', name: 'Nicaragua', len: 8, groups: [4, 4] },
  { code: '+506', iso: 'cr', name: 'Costa Rica', len: 8, groups: [4, 4] },
  { code: '+507', iso: 'pa', name: 'Panamá', len: 8, groups: [4, 4] },
  { code: '+1', iso: 'us', name: 'Estados Unidos', len: 10, groups: [3, 3, 4] },
  { code: '+1', iso: 'ca', name: 'Canadá', len: 10, groups: [3, 3, 4] },
  { code: '+52', iso: 'mx', name: 'México', len: 10, groups: [2, 4, 4] },
  { code: '+57', iso: 'co', name: 'Colombia', len: 10, groups: [3, 3, 4] },
  { code: '+34', iso: 'es', name: 'España', len: 9, groups: [3, 3, 3] }
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

export const flagUrl = (iso) => `https://flagcdn.com/24x18/${iso}.png`;

export const findCountry = (iso) => COUNTRIES.find(c => c.iso === iso) || DEFAULT_COUNTRY;

export function formatLocal(digits, country) {
  const d = String(digits || '').replace(/\D/g, '').slice(0, country.len);
  const parts = [];
  let i = 0;
  for (const g of country.groups) {
    if (i >= d.length) break;
    parts.push(d.slice(i, i + g));
    i += g;
  }
  return parts.join('-');
}

/** Convierte "+504 9999-9999" o "99999999" en { country, local } */
export function parsePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return { country: DEFAULT_COUNTRY, local: '' };
  if (raw.startsWith('+')) {
    const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
    const match = sorted.find(c => raw.startsWith(c.code));
    if (match) {
      return { country: match, local: formatLocal(raw.slice(match.code.length), match) };
    }
  }
  return { country: DEFAULT_COUNTRY, local: formatLocal(raw, DEFAULT_COUNTRY) };
}

export function buildPhone(country, local) {
  const digits = String(local || '').replace(/\D/g, '');
  if (!digits) return '';
  return `${country.code} ${formatLocal(digits, country)}`;
}

export function isValidPhone(value, required = false) {
  if (!value) return !required;
  const { country, local } = parsePhone(value);
  return local.replace(/\D/g, '').length === country.len;
}

// DNI hondureño: 13 dígitos (0801-1990-12345). Pasaporte: 6-15 letras/números.
export function formatDni(value) {
  const d = String(value || '').replace(/\D/g, '').slice(0, 13);
  if (d.length <= 4) return d;
  if (d.length <= 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8)}`;
}

export function detectDocType(value) {
  return /[a-zA-Z]/.test(String(value || '')) ? 'pasaporte' : 'dni';
}

export function isValidIdDocument(value, type, required = false) {
  const v = String(value || '').trim();
  if (!v) return !required;
  if (type === 'pasaporte') return /^[A-Za-z0-9]{6,15}$/.test(v);
  return /^\d{4}-\d{4}-\d{5}$/.test(v);
}
