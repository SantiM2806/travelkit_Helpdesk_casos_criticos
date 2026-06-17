import type { EstatusCaso } from '@/features/casos/types';

/** ISO-2 → emoji bandera (regional indicator symbols). */
export function flagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return '🏳️';
  const A = 0x1f1e6;
  const cc = iso2.toUpperCase();
  return String.fromCodePoint(A + cc.charCodeAt(0) - 65, A + cc.charCodeAt(1) - 65);
}

/** ISO-2 → URL de bandera en SVG (nítida en cualquier tamaño/pantalla). */
export function flagUrl(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return '';
  return `https://flagcdn.com/${iso2.toLowerCase()}.svg`;
}

const PAIS_NOMBRE: Record<string, string> = {
  CO: 'Colombia', EC: 'Ecuador', MX: 'México', DO: 'Rep. Dominicana',
  US: 'Estados Unidos', ES: 'España', PE: 'Perú', AR: 'Argentina',
  CL: 'Chile', BR: 'Brasil', PA: 'Panamá',
};
export const paisNombre = (iso2: string) => PAIS_NOMBRE[iso2?.toUpperCase()] ?? iso2;

/** Variante de Badge (IDENTIDAD-VISUAL.md §9.2) según estatus. */
export function estatusVariant(e: EstatusCaso): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (e) {
    case 'Abierto':             return 'danger';
    case 'En seguimiento':      return 'info';
    case 'Respuesta Proveedor': return 'warning';
    case 'Resuelto':            return 'success';
    default:                    return 'default';
  }
}

/** Borde lateral SLA (§10.2) según estatus. */
export function estatusBorde(e: EstatusCaso): string {
  switch (e) {
    case 'Abierto':             return 'border-l-red-500';
    case 'En seguimiento':      return 'border-l-blue-500';
    case 'Respuesta Proveedor': return 'border-l-amber-400';
    case 'Resuelto':            return 'border-l-emerald-500';
    default:                    return 'border-l-gray-300';
  }
}

export function fmtFecha(iso: string): string {
  if (!iso) return '—';
  return iso.slice(0, 10);
}

export function fmtFechaHora(iso: string): { fecha: string; hora: string } {
  if (!iso) return { fecha: '—', hora: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { fecha: iso.slice(0, 10), hora: '' };
  const fecha = d.toISOString().slice(0, 10);
  const hora = d.toTimeString().slice(0, 8);
  return { fecha, hora };
}
