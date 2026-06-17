import { createSupabaseBrowser } from '@/lib/supabase/client';
import type { CasoCritico, SeguimientoNota, DocumentoCaso, Tarea, EstatusCaso } from '@/features/casos/types';

const TABLA_CASOS  = 'casos';
const TABLA_SEG    = 'casos_seguimiento';
const TABLA_TAREAS = 'casos_tareas';
const BUCKET_DOCS  = 'casos-docs';
const MAX_MB       = 10;

/** ¿Hay credenciales de Supabase configuradas? Si no, la app usa mock. */
export const supabaseHabilitado = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

interface RowSeg   { id: string; ticket_id: string; autor: string; texto: string; timestamp: string }
interface RowTarea {
  id: string; ticket_id: string; texto: string; responsable: string; fecha_limite: string;
  depende_proveedor: boolean; completada: boolean; notificar: boolean; notificado: boolean; created_at: string;
}

function parseDocs(raw: unknown): DocumentoCaso[] {
  if (Array.isArray(raw)) return raw as DocumentoCaso[];
  if (typeof raw === 'string' && raw.trim()) {
    try { return JSON.parse(raw) as DocumentoCaso[]; } catch { return []; }
  }
  return [];
}

function mapTarea(t: RowTarea): Tarea {
  return {
    id: t.id, texto: t.texto, responsable: t.responsable, fecha_limite: t.fecha_limite,
    depende_proveedor: !!t.depende_proveedor, completada: !!t.completada,
    notificar: !!t.notificar, notificado: !!t.notificado, created_at: t.created_at,
  };
}

function mapCaso(row: Record<string, unknown>, segs: RowSeg[], tareas: RowTarea[]): CasoCritico {
  const r = row as Record<string, unknown>;
  const s = (k: string) => (r[k] == null ? '' : String(r[k]));
  return {
    id:               String(r.id),
    numero_caso:      s('numero_caso'),
    proveedor:        (s('proveedor') as CasoCritico['proveedor']) || 'WTA',
    voucher:          s('voucher'),
    nombre_paciente:  s('nombre_paciente'),
    pasaporte:        s('pasaporte'),
    fecha_nacimiento: s('fecha_nacimiento'),
    area:             (s('area') as CasoCritico['area']) || 'System',
    estatus:          (s('estatus') as CasoCritico['estatus']) || 'Abierto',
    fecha_evento:     s('fecha_evento'),
    fecha_apertura:   s('fecha_apertura').slice(0, 10),
    origen_viaje:     s('origen_viaje'),
    pais_servicio:    s('pais_servicio'),
    descripcion:      s('descripcion'),
    documentos:       parseDocs(r.documentos),
    seguimiento:      segs.filter(x => x.ticket_id === r.id)
      .map<SeguimientoNota>(x => ({ id: x.id, autor: x.autor, texto: x.texto, timestamp: x.timestamp }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    tareas:           tareas.filter(x => x.ticket_id === r.id)
      .map(mapTarea)
      .sort((a, b) => a.fecha_limite.localeCompare(b.fecha_limite)),
  };
}

/** Trae todos los casos con su seguimiento y tareas. */
export async function fetchCasos(): Promise<CasoCritico[]> {
  const sb = createSupabaseBrowser();
  const [{ data: casos, error: e1 }, { data: segs, error: e2 }, { data: tareas, error: e3 }] = await Promise.all([
    sb.from(TABLA_CASOS).select('*').order('created_at', { ascending: false }),
    sb.from(TABLA_SEG).select('*'),
    sb.from(TABLA_TAREAS).select('*'),
  ]);
  if (e1) throw e1;
  if (e2) console.warn('[CASOS] seguimiento no disponible:', e2.message);
  if (e3) console.warn('[CASOS] tareas no disponibles:', e3.message);
  return (casos ?? []).map(c => mapCaso(c as Record<string, unknown>, (segs ?? []) as RowSeg[], (tareas ?? []) as RowTarea[]));
}

/** Valida un archivo antes de subir. */
export function validarDocumento(file: File): string | null {
  if (file.size > MAX_MB * 1024 * 1024) return `"${file.name}" supera ${MAX_MB} MB.`;
  return null;
}

/** Sube un documento al bucket y devuelve su URL pública. */
export async function subirDocumento(numeroCaso: string, file: File): Promise<DocumentoCaso> {
  const sb = createSupabaseBrowser();
  const safe = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `${numeroCaso || 'sin-caso'}/${Date.now()}-${safe}`;
  const { error } = await sb.storage.from(BUCKET_DOCS).upload(path, file, {
    upsert: false, contentType: file.type || 'application/octet-stream',
  });
  if (error) throw error;
  const { data } = sb.storage.from(BUCKET_DOCS).getPublicUrl(path);
  return { nombre: file.name, url: data.publicUrl, path };
}

/** Inserta un caso nuevo y devuelve el registro creado. */
export async function insertCaso(caso: Omit<CasoCritico, 'id' | 'seguimiento' | 'tareas'>, creadoPor?: string): Promise<CasoCritico> {
  const sb = createSupabaseBrowser();
  const { data, error } = await sb.from(TABLA_CASOS).insert({
    numero_caso: caso.numero_caso, proveedor: caso.proveedor, voucher: caso.voucher,
    nombre_paciente: caso.nombre_paciente, pasaporte: caso.pasaporte, fecha_nacimiento: caso.fecha_nacimiento || null,
    area: caso.area, estatus: caso.estatus,
    fecha_evento: caso.fecha_evento || new Date().toISOString(), fecha_apertura: caso.fecha_apertura,
    origen_viaje: caso.origen_viaje, pais_servicio: caso.pais_servicio,
    descripcion: caso.descripcion, documentos: caso.documentos ?? [], creado_por: creadoPor ?? null,
  }).select().single();
  if (error) throw error;
  return mapCaso(data as Record<string, unknown>, [], []);
}

/** Cambia el estatus de un caso (drag & drop del Kanban). */
export async function updateEstatus(id: string, estatus: EstatusCaso): Promise<void> {
  const sb = createSupabaseBrowser();
  const { error } = await sb.from(TABLA_CASOS).update({ estatus }).eq('id', id);
  if (error) throw error;
}

/** Agrega una nota de seguimiento a un caso. */
export async function insertSeguimiento(ticketId: string, autor: string, texto: string): Promise<SeguimientoNota> {
  const sb = createSupabaseBrowser();
  const { data, error } = await sb.from(TABLA_SEG)
    .insert({ ticket_id: ticketId, autor, texto })
    .select().single();
  if (error) throw error;
  const r = data as RowSeg;
  return { id: r.id, autor: r.autor, texto: r.texto, timestamp: r.timestamp };
}

/** Crea un recordatorio del caso. */
export async function insertTarea(
  ticketId: string,
  t: { texto: string; fecha_limite: string; notificar: boolean },
): Promise<Tarea> {
  const sb = createSupabaseBrowser();
  const { data, error } = await sb.from(TABLA_TAREAS).insert({
    ticket_id: ticketId, texto: t.texto, fecha_limite: t.fecha_limite, notificar: t.notificar,
  }).select().single();
  if (error) throw error;
  return mapTarea(data as RowTarea);
}

/** Marca una tarea como completada / pendiente. */
export async function toggleTarea(id: string, completada: boolean): Promise<void> {
  const sb = createSupabaseBrowser();
  const { error } = await sb.from(TABLA_TAREAS).update({ completada }).eq('id', id);
  if (error) throw error;
}
