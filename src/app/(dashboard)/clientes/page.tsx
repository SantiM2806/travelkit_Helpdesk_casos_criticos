'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import type { Cliente, EstadoCliente, TipoCliente, Integrador } from '@/features/clientes/types';

/* ── Badges ─────────────────────────────────────── */
function BadgeEstado({ estado }: { estado: EstadoCliente }) {
  const map: Record<EstadoCliente, { bg: string; color: string }> = {
    Activa:         { bg: '#0d2b1f', color: '#4caf8a' },
    Inactiva:       { bg: '#2b0d0d', color: '#ef5350' },
    'En Desarrollo': { bg: '#2b1a00', color: '#ffa726' },
  };
  const s = map[estado] ?? { bg: '#1c1f22', color: '#9aa0a8' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
      {estado}
    </span>
  );
}

function BadgeTipo({ tipo }: { tipo: TipoCliente | null }) {
  if (!tipo) return <span className="text-tk-text3 text-[12px]">—</span>;
  const colors: Record<TipoCliente, string> = {
    'AGV Mayorista': '#4fc3f7',
    'AGV Minorista': '#64b5f6',
    'Comparadora':   '#9575cd',
    'E-commerce':    '#ffa726',
  };
  const c = colors[tipo] ?? '#9aa0a8';
  return (
    <span className="inline-block px-2 py-0.5 rounded font-mono text-[11px]"
      style={{ background: `${c}15`, color: c, border: `1px solid ${c}30` }}>
      {tipo}
    </span>
  );
}

/* ── Modal Nuevo Cliente ─────────────────────────── */
interface NuevoClienteModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const TIPOS: TipoCliente[]   = ['AGV Mayorista', 'AGV Minorista', 'Comparadora', 'E-commerce'];
const INTEGRADORES: Integrador[] = ['Garlan', 'Cacao', 'Legacy'];
const ESTADOS: EstadoCliente[] = ['Activa', 'Inactiva', 'En Desarrollo'];

function NuevoClienteModal({ open, onClose, onCreated }: NuevoClienteModalProps) {
  const [form, setForm] = useState({
    nombre: '', empresa: '', tipo_cliente: '' as TipoCliente | '',
    integrador: '' as Integrador | '', estado: 'En Desarrollo' as EstadoCliente,
    origen_integracion: '' as 'Directo' | 'Consolidador' | '',
    consolidador: '', responsable: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  function reset() {
    setForm({ nombre: '', empresa: '', tipo_cliente: '', integrador: '', estado: 'En Desarrollo', origen_integracion: '', consolidador: '', responsable: '' });
    setError('');
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) { setError('El nombre es requerido.'); return; }
    setSaving(true);
    setError('');
    const sb = createSupabaseBrowser();
    const { error: err } = await sb.from('clientes').insert({
      nombre: form.nombre.trim(),
      empresa: form.empresa.trim() || null,
      tipo_cliente: form.tipo_cliente || null,
      integrador: form.integrador || null,
      estado: form.estado,
      origen_integracion: form.origen_integracion || null,
      consolidador: form.origen_integracion === 'Consolidador' ? form.consolidador.trim() || null : null,
      responsable: form.responsable.trim() || null,
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    reset();
    onCreated();
    onClose();
  }

  if (!open) return null;

  const inputCls = "w-full px-3 py-2 rounded-lg bg-tk-bg3 border border-tk-border2 text-tk-text text-[13px] font-sans placeholder:text-tk-text3 focus:outline-none focus:border-tk-accent transition-colors";
  const labelCls = "block text-[11px] font-mono font-semibold text-tk-text3 uppercase tracking-[0.06em] mb-1.5";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-[560px] rounded-2xl flex flex-col max-h-[90vh]"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-mono text-[14px] font-semibold text-tk-text tracking-wide">Nuevo Cliente</h2>
          <button onClick={handleClose} className="text-tk-text3 hover:text-tk-text transition-colors cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 grid grid-cols-2 gap-4">

            <div className="col-span-2">
              <label className={labelCls}>Nombre *</label>
              <input className={inputCls} placeholder="Nombre del cliente" value={form.nombre}
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Empresa</label>
              <input className={inputCls} placeholder="Razón social o nombre comercial" value={form.empresa}
                onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))} />
            </div>

            <div>
              <label className={labelCls}>Tipo de cliente</label>
              <select className={inputCls} value={form.tipo_cliente}
                onChange={e => setForm(p => ({ ...p, tipo_cliente: e.target.value as TipoCliente | '' }))}>
                <option value="">— Seleccionar —</option>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Integrador</label>
              <select className={inputCls} value={form.integrador}
                onChange={e => setForm(p => ({ ...p, integrador: e.target.value as Integrador | '' }))}>
                <option value="">— Seleccionar —</option>
                {INTEGRADORES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Estado</label>
              <select className={inputCls} value={form.estado}
                onChange={e => setForm(p => ({ ...p, estado: e.target.value as EstadoCliente }))}>
                {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Origen de integración</label>
              <select className={inputCls} value={form.origen_integracion}
                onChange={e => setForm(p => ({ ...p, origen_integracion: e.target.value as 'Directo' | 'Consolidador' | '', consolidador: '' }))}>
                <option value="">— Seleccionar —</option>
                <option value="Directo">Directo</option>
                <option value="Consolidador">Consolidador</option>
              </select>
            </div>

            {form.origen_integracion === 'Consolidador' && (
              <div className="col-span-2">
                <label className={labelCls}>¿Cuál consolidador?</label>
                <input className={inputCls} placeholder="Nombre del consolidador" value={form.consolidador}
                  onChange={e => setForm(p => ({ ...p, consolidador: e.target.value }))} />
              </div>
            )}

            <div className="col-span-2">
              <label className={labelCls}>Responsable</label>
              <input className={inputCls} placeholder="Miembro del equipo asignado" value={form.responsable}
                onChange={e => setForm(p => ({ ...p, responsable: e.target.value }))} />
            </div>

          </div>

          {error && <p className="px-6 pb-2 text-[12px] text-tk-red">{error}</p>}

          <div className="px-6 pb-6 flex gap-3 justify-end">
            <button type="button" onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-tk-border2 text-tk-text2 font-mono text-[12px] uppercase tracking-wide cursor-pointer hover:border-tk-border hover:text-tk-text transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-lg bg-tk-accent text-[#0d0f11] font-mono text-[12px] font-semibold uppercase tracking-wide cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? 'Guardando…' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Página principal ────────────────────────────── */
const ESTADO_FILTERS: (EstadoCliente | 'Todos')[] = ['Todos', 'Activa', 'En Desarrollo', 'Inactiva'];

export default function ClientesPage() {
  const [clientes,       setClientes]       = useState<Cliente[]>([]);
  const [filtered,       setFiltered]       = useState<Cliente[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [estadoFilter,   setEstadoFilter]   = useState<EstadoCliente | 'Todos'>('Todos');
  const [modalOpen,      setModalOpen]      = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const sb = createSupabaseBrowser();
    const { data } = await sb.from('clientes').select('*').order('nombre', { ascending: true });
    setClientes((data ?? []) as Cliente[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(clientes.filter(c => {
      const matchEstado = estadoFilter === 'Todos' || c.estado === estadoFilter;
      const matchSearch = !q || c.nombre.toLowerCase().includes(q) || (c.empresa ?? '').toLowerCase().includes(q) || (c.responsable ?? '').toLowerCase().includes(q);
      return matchEstado && matchSearch;
    }));
  }, [clientes, search, estadoFilter]);

  const stats = {
    total:    clientes.length,
    activas:  clientes.filter(c => c.estado === 'Activa').length,
    enDev:    clientes.filter(c => c.estado === 'En Desarrollo').length,
    inactivas: clientes.filter(c => c.estado === 'Inactiva').length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-tk-bg">

      {/* Header de página */}
      <div className="sticky top-0 z-30 h-14 bg-tk-bg2 border-b border-tk-border flex items-center px-6 gap-4">
        <h1 className="font-mono text-[14px] font-semibold text-tk-text tracking-wide">CLIENTES</h1>
        <div className="ml-auto">
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-[7px] bg-tk-accent text-[#0d0f11] font-mono text-[11px] font-semibold tracking-[0.06em] uppercase rounded cursor-pointer hover:opacity-90 transition-opacity">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo cliente
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-3 border-b border-tk-border bg-tk-bg2 flex items-center gap-6 flex-wrap">
        {[
          { label: 'Total',        value: stats.total,     color: '#4fc3f7' },
          { label: 'Activas',      value: stats.activas,   color: '#4caf8a' },
          { label: 'En Desarrollo', value: stats.enDev,    color: '#ffa726' },
          { label: 'Inactivas',    value: stats.inactivas, color: '#ef5350' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="font-mono text-[18px] font-semibold" style={{ color: s.color }}>{s.value}</span>
            <span className="font-mono text-[10px] text-tk-text3 uppercase tracking-[0.08em]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-tk-border flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tk-text3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="w-full pl-8 pr-3 py-1.5 bg-tk-bg3 border border-tk-border2 rounded-lg text-[13px] text-tk-text placeholder:text-tk-text3 focus:outline-none focus:border-tk-accent transition-colors"
            placeholder="Buscar cliente…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Estado chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {ESTADO_FILTERS.map(f => (
            <button key={f} onClick={() => setEstadoFilter(f)}
              className="px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-[0.06em] cursor-pointer transition-all duration-150 border"
              style={estadoFilter === f
                ? { background: 'rgba(79,195,247,0.12)', color: '#4fc3f7', borderColor: 'rgba(79,195,247,0.3)' }
                : { background: 'transparent', color: 'var(--text3)', borderColor: 'transparent' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <main className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-tk-text3 text-[13px] font-mono">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-tk-text3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 opacity-30">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <p className="font-mono text-[13px]">{search || estadoFilter !== 'Todos' ? 'Sin resultados' : 'Aún no hay clientes registrados'}</p>
            {!search && estadoFilter === 'Todos' && (
              <button onClick={() => setModalOpen(true)} className="font-mono text-[12px] text-tk-accent hover:underline cursor-pointer">
                + Agregar el primero
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['Cliente', 'Empresa', 'Tipo', 'Integrador', 'Estado', 'Origen', 'Consolidador', 'Responsable'].map(h => (
                  <th key={h} className="px-5 py-3 font-mono text-[10px] font-semibold text-tk-text3 uppercase tracking-[0.08em] whitespace-nowrap">{h}</th>
                ))}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-tk-border hover:bg-tk-bg2 transition-colors group cursor-pointer"
                  onClick={() => window.location.href = `/clientes/${c.id}`}>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-semibold text-tk-text group-hover:text-tk-accent transition-colors">{c.nombre}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-tk-text2">{c.empresa ?? '—'}</td>
                  <td className="px-5 py-3.5"><BadgeTipo tipo={c.tipo_cliente} /></td>
                  <td className="px-5 py-3.5 font-mono text-[12px] text-tk-text2">{c.integrador ?? '—'}</td>
                  <td className="px-5 py-3.5"><BadgeEstado estado={c.estado} /></td>
                  <td className="px-5 py-3.5 text-[12px] text-tk-text2">{c.origen_integracion ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[12px] text-tk-text3">{c.consolidador ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[12px] text-tk-text2">{c.responsable ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/clientes/${c.id}`} onClick={e => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] text-tk-accent hover:underline tracking-wide">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      <NuevoClienteModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={load} />
    </div>
  );
}
