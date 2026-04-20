const ESTADO_NORM_MAP: Record<string, string> = {
  abierto:     'abierto',
  'en proceso':'proceso',
  proceso:     'proceso',
  resuelto:    'resuelto',
  'otra área': 'otrarea',
  otra:        'otrarea',
};

export function normalizeEstado(v: string): string {
  const s = (v || '').toLowerCase().trim();
  for (const [key, val] of Object.entries(ESTADO_NORM_MAP)) {
    if (s.includes(key)) return val;
  }
  return s;
}

export function formatDate(raw: string): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function getSyncTimeStr(): string {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
}

/* ── Badge class helpers ── */
const BASE_BADGE =
  'inline-flex items-center gap-[5px] font-mono text-[10px] font-semibold tracking-[0.06em] uppercase px-2 py-[3px] rounded-full whitespace-nowrap leading-[1.4]';

const PRIORIDAD_CLASS: Record<string, string> = {
  alta:  'bg-tk-red-bg   text-tk-red    border border-[rgba(239,83,80,0.2)]',
  media: 'bg-tk-amber-bg text-tk-amber  border border-[rgba(255,112,67,0.2)]',
  baja:  'bg-tk-green-bg text-tk-green  border border-[rgba(76,175,138,0.2)]',
};

const ESTADO_CLASS: Record<string, string> = {
  abierto:  'bg-tk-red-bg    text-tk-red    border border-[rgba(239,83,80,0.2)]',
  proceso:  'bg-tk-orange-bg text-tk-orange  border border-[rgba(255,167,38,0.2)]',
  resuelto: 'bg-tk-green-bg  text-tk-green  border border-[rgba(76,175,138,0.2)]',
  otrarea:  'bg-tk-violet-bg text-tk-violet  border border-[rgba(149,117,205,0.2)]',
};

const CAT_CLASS = 'bg-tk-blue-bg text-tk-blue border border-[rgba(100,181,246,0.2)]';

export function badgePrioridad(p: string): { cls: string; label: string } {
  const k = (p || '').toLowerCase().trim();
  return { cls: `${BASE_BADGE} ${PRIORIDAD_CLASS[k] ?? CAT_CLASS}`, label: p || '—' };
}

export function badgeEstado(norm: string, raw: string): { cls: string; dotCls: string; label: string } {
  return {
    cls:    `${BASE_BADGE} ${ESTADO_CLASS[norm] ?? CAT_CLASS}`,
    dotCls: norm in ESTADO_CLASS ? `badge-dot-${norm}` : '',
    label:  raw || '—',
  };
}

export function badgeCat(c: string): { cls: string; label: string } | null {
  if (!c) return null;
  return { cls: `${BASE_BADGE} ${CAT_CLASS}`, label: c };
}
