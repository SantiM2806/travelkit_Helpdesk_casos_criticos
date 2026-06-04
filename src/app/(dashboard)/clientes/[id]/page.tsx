'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import type { Cliente, ClienteActividad, EstadoCliente, TipoCliente, Integrador, TipoActividad } from '@/features/clientes/types';

const TIPOS: TipoCliente[]      = ['AGV Mayorista', 'AGV Minorista', 'Comparadora', 'E-commerce'];
const INTEGRADORES: Integrador[] = ['Garlan', 'Cacao', 'Legacy'];
const ESTADOS: EstadoCliente[]   = ['Activa', 'Inactiva', 'En Desarrollo'];
const TIPOS_ACT: TipoActividad[] = ['Nota', 'Llamada', 'Email', 'Reunión', 'Ticket'];

function BadgeEstado({ estado }: { estado: EstadoCliente }) {
  const map: Record<EstadoCliente, { bg: string; color: string }> = {
    Activa:          { bg: '#0d2b1f', color: '#4caf8a' },
    Inactiva:        { bg: '#2b0d0d', color: '#ef5350' },
    'En Desarrollo': { bg: '#2b1a00', color: '#ffa726' },
  };
  const s = map[estado] ?? { bg: '#1c1f22', color: '#9aa0a8' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[12px] font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {estado}
    </span>
  );
}

function BadgeActividad({ tipo }: { tipo: TipoActividad }) {
  const map: Record<TipoActividad, { bg: string; color: string; icon: string }> = {
    Nota:    { bg: '#1c1f22', color: '#9aa0a8', icon: '📝' },
    Llamada: { bg: '#0d1a2b', color: '#64b5f6', icon: '📞' },
    Email:   { bg: '#1a1028', color: '#9575cd', icon: '✉️' },
    Reunión: { bg: '#0d2b1f', color: '#4caf8a', icon: '🤝' },
    Ticket:  { bg: '#2b1a00', color: '#ffa726', icon: '🎫' },
  };
  const s = map[tipo];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33` }}>
      {s.icon} {tipo}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' +
    d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

/* ── Componente principal ───────────────────────── */
export default function ClienteDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [cliente,      setCliente]      = useState<Cliente | null>(null);
  const [actividades,  setActividades]  = useState<ClienteActividad[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [editing,      setEditing]      = useState(false);
  const [editForm,     setEditForm]     = useState<Partial<Cliente>>({});
  const [saving,       setSaving]       = useState(false);

  /* nueva actividad */
  const [actForm, setActForm] = useState({ tipo: 'Nota' as TipoActividad, descripcion: '', responsable: '' });
  const [actSaving, setActSaving] = useState(false);

  const load = useCallback(async () => {
    const sb = createSupabaseBrowser();
    const [{ data: c }, { data: a }] = await Promise.all([
      sb.from('clientes').select('*').eq('id', id).single(),
      sb.from('cliente_actividades').select('*').eq('cliente_id', id).order('created_at', { ascending: false }),
    ]);
    if (!c) { router.push('/clientes'); return; }
    setCliente(c as Cliente);
    setEditForm(c as Cliente);
    setActividades((a ?? []) as ClienteActividad[]);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function handleSaveEdit() {
    if (!cliente) return;
    setSaving(true);
    const sb = createSupabaseBrowser();
    const { error } = await sb.from('clientes').update({
      nombre:             editForm.nombre,
      empresa:            editForm.empresa || null,
      tipo_cliente:       editForm.tipo_cliente || null,
      integrador:         editForm.integrador || null,
      estado:             editForm.estado,
      origen_integracion: editForm.origen_integracion || null,
      consolidador:       editForm.origen_integracion === 'Consolidador' ? editForm.consolidador || null : null,
      responsable:        editForm.responsable || null,
      updated_at:         new Date().toISOString(),
    }).eq('id', id);
    setSaving(false);
    if (!error) { setEditing(false); load(); }
  }

  async function handleAddActividad(e: React.FormEvent) {
    e.preventDefault();
    if (!actForm.descripcion.trim()) return;
    setActSaving(true);
    const sb = createSupabaseBrowser();
    await sb.from('cliente_actividades').insert({
      cliente_id:  id,
      tipo:        actForm.tipo,
      descripcion: actForm.descripcion.trim(),
      responsable: actForm.responsable.trim() || null,
    });
    setActForm({ tipo: 'Nota', descripcion: '', responsable: '' });
    setActSaving(false);
    load();
  }

  const inputCls = "w-full px-3 py-2 rounded-lg bg-tk-bg3 border border-tk-border2 text-tk-text text-[13px] focus:outline-none focus:border-tk-accent transition-colors";
  const labelCls = "block text-[10px] font-mono font-semibold text-tk-text3 uppercase tracking-[0.06em] mb-1";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tk-bg">
        <p className="font-mono text-[13px] text-tk-text3">Cargando…</p>
      </div>
    );
  }

  if (!cliente) return null;

  return (
    <div className="flex flex-col min-h-screen bg-tk-bg">

      {/* Header */}
      <div className="sticky top-0 z-30 h-14 bg-tk-bg2 border-b border-tk-border flex items-center px-6 gap-3">
        <Link href="/clientes" className="flex items-center gap-1.5 text-tk-text3 hover:text-tk-text transition-colors font-mono text-[11px] uppercase tracking-wide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Clientes
        </Link>
        <span className="text-tk-border2">/</span>
        <span className="font-mono text-[13px] font-semibold text-tk-text">{cliente.nombre}</span>
        <div className="ml-2"><BadgeEstado estado={cliente.estado} /></div>
        <div className="ml-auto flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setEditForm(cliente); }}
                className="px-3 py-1.5 rounded-lg border border-tk-border2 text-tk-text2 font-mono text-[11px] uppercase tracking-wide cursor-pointer hover:border-tk-border hover:text-tk-text transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="px-3 py-1.5 rounded-lg text-white font-mono text-[11px] font-semibold uppercase tracking-wide cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: '#CC0000' }}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-tk-border2 text-tk-text2 font-mono text-[11px] uppercase tracking-wide cursor-pointer hover:border-tk-accent hover:text-tk-accent transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Contenido en dos columnas */}
      <div className="flex flex-1 gap-0 min-h-0">

        {/* ── Columna izquierda: info del cliente ── */}
        <div className="w-[340px] flex-shrink-0 border-r border-tk-border p-6 space-y-5 overflow-y-auto">
          <div>
            <p className="font-mono text-[10px] font-semibold text-tk-text3 uppercase tracking-[0.1em] mb-4">Información del cliente</p>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Nombre *</label>
                  <input className={inputCls} value={editForm.nombre ?? ''} onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Empresa</label>
                  <input className={inputCls} value={editForm.empresa ?? ''} onChange={e => setEditForm(p => ({ ...p, empresa: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Tipo de cliente</label>
                  <select className={inputCls} value={editForm.tipo_cliente ?? ''} onChange={e => setEditForm(p => ({ ...p, tipo_cliente: e.target.value as TipoCliente | '' || null }))}>
                    <option value="">— Seleccionar —</option>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Integrador</label>
                  <select className={inputCls} value={editForm.integrador ?? ''} onChange={e => setEditForm(p => ({ ...p, integrador: e.target.value as Integrador | '' || null }))}>
                    <option value="">— Seleccionar —</option>
                    {INTEGRADORES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Estado</label>
                  <select className={inputCls} value={editForm.estado ?? 'En Desarrollo'} onChange={e => setEditForm(p => ({ ...p, estado: e.target.value as EstadoCliente }))}>
                    {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Origen de integración</label>
                  <select className={inputCls} value={editForm.origen_integracion ?? ''} onChange={e => setEditForm(p => ({ ...p, origen_integracion: e.target.value as 'Directo' | 'Consolidador' | '' || null, consolidador: null }))}>
                    <option value="">— Seleccionar —</option>
                    <option value="Directo">Directo</option>
                    <option value="Consolidador">Consolidador</option>
                  </select>
                </div>
                {editForm.origen_integracion === 'Consolidador' && (
                  <div>
                    <label className={labelCls}>¿Cuál consolidador?</label>
                    <input className={inputCls} value={editForm.consolidador ?? ''} onChange={e => setEditForm(p => ({ ...p, consolidador: e.target.value }))} />
                  </div>
                )}
                <div>
                  <label className={labelCls}>Responsable</label>
                  <input className={inputCls} value={editForm.responsable ?? ''} onChange={e => setEditForm(p => ({ ...p, responsable: e.target.value }))} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Empresa',    value: cliente.empresa },
                  { label: 'Tipo',       value: cliente.tipo_cliente },
                  { label: 'Integrador', value: cliente.integrador },
                  { label: 'Origen',     value: cliente.origen_integracion },
                  { label: 'Consolidador', value: cliente.consolidador, show: cliente.origen_integracion === 'Consolidador' },
                  { label: 'Responsable', value: cliente.responsable },
                ].filter(f => f.show !== false).map(f => (
                  <div key={f.label} className="flex items-start gap-3">
                    <span className="font-mono text-[10px] text-tk-text3 uppercase tracking-[0.06em] w-24 flex-shrink-0 pt-0.5">{f.label}</span>
                    <span className="text-[13px] text-tk-text">{f.value ?? <span className="text-tk-text3">—</span>}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3">
                  <span className="font-mono text-[10px] text-tk-text3 uppercase tracking-[0.06em] w-24 flex-shrink-0 pt-0.5">Estado</span>
                  <BadgeEstado estado={cliente.estado} />
                </div>
                <div className="pt-1 border-t border-tk-border">
                  <div className="flex items-start gap-3 mt-3">
                    <span className="font-mono text-[10px] text-tk-text3 uppercase tracking-[0.06em] w-24 flex-shrink-0 pt-0.5">Alta</span>
                    <span className="text-[12px] text-tk-text3">{formatDate(cliente.created_at)}</span>
                  </div>
                  <div className="flex items-start gap-3 mt-2">
                    <span className="font-mono text-[10px] text-tk-text3 uppercase tracking-[0.06em] w-24 flex-shrink-0 pt-0.5">Actualizado</span>
                    <span className="text-[12px] text-tk-text3">{formatDate(cliente.updated_at)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna derecha: actividades ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Formulario nueva actividad */}
          <div className="p-6 border-b border-tk-border flex-shrink-0">
            <p className="font-mono text-[10px] font-semibold text-tk-text3 uppercase tracking-[0.1em] mb-4">Registrar actividad</p>
            <form onSubmit={handleAddActividad} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <select className={`${inputCls} w-40 flex-shrink-0`} value={actForm.tipo}
                  onChange={e => setActForm(p => ({ ...p, tipo: e.target.value as TipoActividad }))}>
                  {TIPOS_ACT.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input className={inputCls} placeholder="Responsable (opcional)" value={actForm.responsable}
                  onChange={e => setActForm(p => ({ ...p, responsable: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <textarea
                  className={`${inputCls} resize-none flex-1`}
                  rows={2}
                  placeholder="Describe la actividad, acuerdo o comunicación…"
                  value={actForm.descripcion}
                  onChange={e => setActForm(p => ({ ...p, descripcion: e.target.value }))}
                />
                <button type="submit" disabled={actSaving || !actForm.descripcion.trim()}
                  className="px-4 py-2 rounded-lg text-white font-mono text-[11px] font-semibold uppercase tracking-wide cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 self-end flex-shrink-0"
                  style={{ background: '#CC0000' }}>
                  {actSaving ? '…' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="font-mono text-[10px] font-semibold text-tk-text3 uppercase tracking-[0.1em] mb-4">
              Historial · {actividades.length} {actividades.length === 1 ? 'registro' : 'registros'}
            </p>

            {actividades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-tk-text3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 opacity-30">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p className="font-mono text-[13px]">Sin actividades registradas aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actividades.map((a, idx) => (
                  <div key={a.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: '#4fc3f7' }} />
                      {idx < actividades.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: 'var(--border)' }} />}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-4 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <BadgeActividad tipo={a.tipo} />
                        {a.responsable && <span className="text-[11px] text-tk-text2">{a.responsable}</span>}
                        <span className="text-[11px] text-tk-text3 ml-auto whitespace-nowrap">{formatDate(a.created_at)}</span>
                      </div>
                      <p className="text-[13px] text-tk-text leading-relaxed break-words whitespace-pre-wrap">{a.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
