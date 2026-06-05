'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import Image from 'next/image';
import { createSupabaseBrowser } from '@/lib/supabase/client';

const supabase = createSupabaseBrowser();

// ─── Estilos por estado ────────────────────────────────────────────────────
const ESTADOS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  'Idea':          { color: '#1976D2', bg: '#f0f5ff', border: '#bbdefb' },
  'Planificación': { color: '#7B1FA2', bg: '#faf0ff', border: '#e1bee7' },
  'En Desarrollo': { color: '#F57C00', bg: '#fff8f0', border: '#ffcc80' },
  'Listo':         { color: '#388E3C', bg: '#f0faf0', border: '#c8e6c9' },
  'Pausado':       { color: '#757575', bg: '#f5f5f5', border: '#e0e0e0' },
};

const PRIORIDAD_STYLE: Record<string, string> = {
  'Alta':  'bg-[#fff5f5] text-[#D32F2F] border-[#D32F2F]/20',
  'Media': 'bg-[#fff8f0] text-[#F57C00] border-[#F57C00]/20',
  'Baja':  'bg-[#f5f5f5] text-[#888]    border-[#ddd]',
};

interface Proyecto {
  id:               string;
  codigo:           string | null;
  titulo:           string | null;
  descripcion:      string | null;
  estado:           string;
  prioridad:        string | null;
  asignado_a:       string | null;
  area:             string | null;
  notas_internas:   string | null;
  app_afectada:     string | null;
  impacto_negocio:  string | null;
  created_at:       string;
  updated_at:       string;
}

type Vista = 'it' | 'criticos';

// ══════════════════════════════════════════════════════════════════════════
//   PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function ExecutiveDashboard() {
  const [userName,     setUserName]     = useState('');
  const [vista,        setVista]        = useState<Vista>('it');
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [proyectos,    setProyectos]    = useState<Proyecto[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState<Proyecto | null>(null);
  const [newIdeaOpen,  setNewIdeaOpen]  = useState(false);

  const loadProyectos = useCallback(async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('tipo', 'interna_proyecto')
      .order('created_at', { ascending: false });
    if (!error && data) setProyectos(data as Proyecto[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta  = data.user?.user_metadata;
      const email = data.user?.email || '';
      const nameFromEmail = email.split('@')[0].split('.').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setUserName(meta?.full_name || meta?.name || nameFromEmail);
    });
    loadProyectos();
  }, [loadProyectos]);

  // ESC cierra modales
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelected(null);
        setNewIdeaOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex flex-col bg-[#fafafa] text-[#1a1a1a] font-sans min-h-screen">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-[80] h-14 bg-white border-b border-[#e8e8e8] flex items-center px-4 md:px-6 gap-3 shadow-sm">
        {/* Brand: solo logo Travelkit */}
        <div className="flex items-center pr-4 mr-1 border-r border-[#ebebeb] h-full">
          <Image
            src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png"
            alt="Travelkit"
            width={90}
            height={28}
            className="h-6 w-auto object-contain"
            priority
          />
        </div>

        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[#f5f5f5] active:bg-[#eee] transition-colors"
          aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#666]">
            {sidebarOpen ? (
              <>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <polyline points="9 18 15 12 9 6"/>
              </>
            )}
          </svg>
        </button>
        <h1 className="text-[15px] font-semibold text-[#1a1a1a]">Dashboard Ejecutivo</h1>
        <span className="text-[12px] text-[#aaa] hidden sm:block">· Vista de iniciativas y críticos</span>
        <div className="ml-auto flex items-center gap-3">
          {userName && <span className="text-[13px] text-[#555] hidden md:block">{userName}</span>}
        </div>
      </header>

      {/* ── CUERPO: SIDEBAR + MAIN ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR (colapsable) */}
        <aside
          className={`bg-white border-r border-[#ebebeb] flex-shrink-0 transition-[width] duration-300 ease-out overflow-hidden ${sidebarOpen ? 'w-56' : 'w-[60px]'}`}
        >
          <nav className="flex flex-col gap-1 p-2.5">
            <SidebarItem
              active={vista === 'it'}
              open={sidebarOpen}
              label="IT"
              onClick={() => setVista('it')}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              }
            />
            <SidebarItem
              active={vista === 'criticos'}
              open={sidebarOpen}
              label="Casos Críticos"
              onClick={() => setVista('criticos')}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              }
            />
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">
          {vista === 'it'       && <ITView proyectos={proyectos} loading={loading} onSelect={setSelected} onAddIdea={() => setNewIdeaOpen(true)} />}
          {vista === 'criticos' && <CriticosView />}
        </main>
      </div>

      {/* MODAL DETALLE */}
      {selected && <DetalleModal proyecto={selected} onClose={() => setSelected(null)} />}

      {/* MODAL NUEVA IDEA */}
      {newIdeaOpen && (
        <NuevaIdeaModal
          userName={userName}
          onClose={() => setNewIdeaOpen(false)}
          onSuccess={() => { setNewIdeaOpen(false); loadProyectos(); }}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//   SIDEBAR ITEM
// ══════════════════════════════════════════════════════════════════════════
function SidebarItem({
  active, open, label, icon, onClick,
}: { active: boolean; open: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={!open ? label : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-[13px] font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F]/40 ${
        active
          ? 'bg-[#fff5f5] text-[#D32F2F]'
          : 'text-[#666] hover:bg-[#fafafa] hover:text-[#1a1a1a]'
      }`}
    >
      {/* indicador lateral activo */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#D32F2F] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
      />
      {icon}
      <span
        className={`whitespace-nowrap transition-[opacity,transform] duration-200 ${
          open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//   VISTA: IT — Cards de proyectos internos
// ══════════════════════════════════════════════════════════════════════════
function ITView({
  proyectos, loading, onSelect, onAddIdea,
}: { proyectos: Proyecto[]; loading: boolean; onSelect: (p: Proyecto) => void; onAddIdea: () => void }) {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[20px] font-semibold text-[#1a1a1a]">Iniciativas IT</h2>
          <p className="text-[13px] text-[#888] mt-1">Proyectos internos de innovación y tecnología propia</p>
        </div>
        <button
          onClick={onAddIdea}
          className="group flex items-center gap-2 px-4 py-2.5 bg-[#D32F2F] hover:bg-[#b71c1c] active:bg-[#9a1616] text-white text-[13px] font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F]/40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar idea
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#888] text-[14px]">Cargando proyectos…</div>
      ) : proyectos.length === 0 ? (
        <EmptyState
          title="Sin iniciativas aún"
          subtitle="Cuando el equipo IT cree proyectos internos en el pipeline, aparecerán aquí como tarjetas."
          icon={(
            <svg viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" className="w-8 h-8">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proyectos.map(p => <ProyectoCard key={p.id} proyecto={p} onClick={() => onSelect(p)} />)}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//   CARD de proyecto (con UX interactivo)
// ══════════════════════════════════════════════════════════════════════════
function ProyectoCard({ proyecto, onClick }: { proyecto: Proyecto; onClick: () => void }) {
  const estadoStyle = ESTADOS_STYLE[proyecto.estado] || ESTADOS_STYLE['Idea'];
  const fecha = new Date(proyecto.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl border border-[#ebebeb] p-5 text-left transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#D32F2F]/30 outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F]/40 relative overflow-hidden"
    >
      {/* barra superior decorativa que aparece en hover */}
      <span
        className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
        style={{ background: estadoStyle.color }}
      />

      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-[10px] font-mono font-semibold text-[#bbb] tracking-wider">{proyecto.codigo || '—'}</span>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-md border whitespace-nowrap"
          style={{ color: estadoStyle.color, background: estadoStyle.bg, borderColor: estadoStyle.border }}
        >
          {proyecto.estado}
        </span>
      </div>

      <h3 className="text-[14px] font-semibold text-[#1a1a1a] group-hover:text-[#D32F2F] transition-colors mb-2 line-clamp-2 min-h-[2.6em]">
        {proyecto.titulo || 'Sin título'}
      </h3>

      <p className="text-[12px] text-[#666] line-clamp-3 mb-4 min-h-[3.6em]">
        {proyecto.descripcion || 'Sin descripción'}
      </p>

      <div className="flex items-center justify-between text-[11px] text-[#aaa] pt-3 border-t border-[#f5f5f5]">
        <span>{fecha}</span>
        <div className="flex items-center gap-2">
          {proyecto.prioridad && (
            <span className={`px-2 py-0.5 rounded border font-medium ${PRIORIDAD_STYLE[proyecto.prioridad] || PRIORIDAD_STYLE['Media']}`}>
              {proyecto.prioridad}
            </span>
          )}
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
            style={{ color: estadoStyle.color }}
          >
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//   VISTA: CASOS CRÍTICOS — placeholder (se conecta después)
// ══════════════════════════════════════════════════════════════════════════
function CriticosView() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-[20px] font-semibold text-[#1a1a1a]">Casos Críticos</h2>
        <p className="text-[13px] text-[#888] mt-1">Tickets de alta prioridad que requieren atención inmediata</p>
      </div>

      <EmptyState
        title="Próximamente"
        subtitle="Esta vista se conectará al pipeline crítico cuando definamos la fuente de datos."
        icon={(
          <svg viewBox="0 0 24 24" fill="none" stroke="#F57C00" strokeWidth="1.5" className="w-8 h-8">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        )}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//   EMPTY STATE reusable
// ══════════════════════════════════════════════════════════════════════════
function EmptyState({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#ebebeb] p-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#fafafa] flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-[14px] font-medium text-[#1a1a1a]">{title}</p>
      <p className="text-[12px] text-[#888] mt-1 max-w-sm">{subtitle}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//   MODAL DETALLE de proyecto
// ══════════════════════════════════════════════════════════════════════════
function DetalleModal({ proyecto, onClose }: { proyecto: Proyecto; onClose: () => void }) {
  const estadoStyle = ESTADOS_STYLE[proyecto.estado] || ESTADOS_STYLE['Idea'];
  const fecha = new Date(proyecto.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  const actualizado = new Date(proyecto.updated_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-[#f0f0f0] flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-semibold text-[#bbb] tracking-wider">{proyecto.codigo || '—'}</span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                style={{ color: estadoStyle.color, background: estadoStyle.bg, borderColor: estadoStyle.border }}
              >
                {proyecto.estado}
              </span>
              {proyecto.prioridad && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${PRIORIDAD_STYLE[proyecto.prioridad] || PRIORIDAD_STYLE['Media']}`}>
                  {proyecto.prioridad}
                </span>
              )}
            </div>
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] leading-snug">{proyecto.titulo || 'Sin título'}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[#f5f5f5] active:bg-[#eee] transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#888]">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <Section title="Descripción">
            <p className="text-[13px] text-[#333] leading-relaxed whitespace-pre-wrap">{proyecto.descripcion || 'Sin descripción'}</p>
          </Section>

          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Área"        value={proyecto.area || '—'} />
            <Field label="Asignado a"  value={proyecto.asignado_a || 'Sin asignar'} />
            <Field label="Creado"      value={fecha} />
            <Field label="Actualizado" value={actualizado} />
          </div>

          {proyecto.app_afectada && (
            <Section title="App afectada">
              <p className="text-[13px] text-[#333]">{proyecto.app_afectada}</p>
            </Section>
          )}

          {proyecto.impacto_negocio && (
            <Section title="Impacto en negocio">
              <p className="text-[13px] text-[#333] leading-relaxed whitespace-pre-wrap">{proyecto.impacto_negocio}</p>
            </Section>
          )}

          {proyecto.notas_internas && (
            <Section title="Notas internas">
              <p className="text-[13px] text-[#555] leading-relaxed whitespace-pre-wrap bg-[#fafafa] rounded-lg p-3 border border-[#f0f0f0]">{proyecto.notas_internas}</p>
            </Section>
          )}
        </div>
      </div>

    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-widest mb-2">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[13px] text-[#1a1a1a]">{value}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//   MODAL: NUEVA IDEA (formulario corto para el gerente)
// ══════════════════════════════════════════════════════════════════════════
function NuevaIdeaModal({
  userName, onClose, onSuccess,
}: { userName: string; onClose: () => void; onSuccess: () => void }) {
  const [titulo,      setTitulo]      = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad,   setPrioridad]   = useState<'Baja' | 'Media' | 'Alta'>('Media');
  const [impacto,     setImpacto]     = useState('');
  const [area,        setArea]        = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (titulo.trim().length < 3) {
      setError('Dale un título descriptivo (mínimo 3 caracteres).');
      return;
    }
    if (descripcion.trim().length < 10) {
      setError('Cuenta un poco más en la descripción (mínimo 10 caracteres).');
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email || 'unknown@travelkit.us';

    const { error: insertError } = await supabase.from('tickets').insert({
      tipo:               'interna_proyecto',
      titulo:             titulo.trim(),
      descripcion:        descripcion.trim(),
      estado:             'Idea',
      prioridad,
      impacto_negocio:    impacto.trim() || null,
      area:               area.trim() || null,
      solicitante_email:  email,
      solicitante_nombre: userName || null,
    });

    setSaving(false);
    if (insertError) {
      console.error('[NuevaIdea] insert failed:', insertError);
      setError('No se pudo guardar la idea. Verifica tu conexión e intenta de nuevo.');
      return;
    }
    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-[#f0f0f0] flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border" style={{ color: '#1976D2', background: '#f0f5ff', borderColor: '#bbdefb' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5">
                  <path d="M9 18h6M10 22h4M15.09 14A5 5 0 1 0 7 9.5"/>
                </svg>
                Nueva idea
              </span>
            </div>
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] leading-snug">¿Qué tienes en mente?</h2>
            <p className="text-[12px] text-[#888] mt-0.5">Cuéntanos brevemente. El equipo IT la evaluará y la sube al pipeline.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[#f5f5f5] active:bg-[#eee] transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#888]">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wider">
              Título <span className="text-[#D32F2F]">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              required
              maxLength={120}
              placeholder="Ej: Migrar reportes financieros a Power BI"
              className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e0e0e0] rounded-lg text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)]"
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wider">
              Descripción <span className="text-[#D32F2F]">*</span>
            </label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              required
              rows={4}
              maxLength={800}
              placeholder="¿Qué problema resuelve? ¿Cómo lo imaginas funcionando?"
              className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e0e0e0] rounded-lg text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)] resize-none"
            />
            <span className="text-[10px] text-[#bbb] self-end">{descripcion.length} / 800</span>
          </div>

          {/* Prioridad + Área en dos columnas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wider">Prioridad</label>
              <div className="flex gap-1.5">
                {(['Baja','Media','Alta'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrioridad(p)}
                    className={`flex-1 px-2 py-2 rounded-lg text-[12px] font-semibold border transition-all ${
                      prioridad === p
                        ? p === 'Alta' ? 'bg-[#fff5f5] text-[#D32F2F] border-[#D32F2F]/40'
                          : p === 'Media' ? 'bg-[#fff8f0] text-[#F57C00] border-[#F57C00]/40'
                          : 'bg-[#f5f5f5] text-[#666] border-[#aaa]/40'
                        : 'bg-white text-[#999] border-[#e0e0e0] hover:border-[#aaa]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wider">Área (opcional)</label>
              <input
                type="text"
                value={area}
                onChange={e => setArea(e.target.value)}
                maxLength={80}
                placeholder="Ej: Comercial, Operaciones..."
                className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e0e0e0] rounded-lg text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)]"
              />
            </div>
          </div>

          {/* Impacto en negocio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wider">Impacto en el negocio (opcional)</label>
            <textarea
              value={impacto}
              onChange={e => setImpacto(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="¿Qué ganamos? ¿Ahorra tiempo, reduce errores, abre nuevo canal?"
              className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e0e0e0] rounded-lg text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)] resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-[#fff5f5] border border-[#fcc] rounded-lg px-3.5 py-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-[12px] text-[#c00]">{error}</p>
            </div>
          )}
        </form>

        {/* FOOTER con acciones */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#666] hover:text-[#1a1a1a] hover:bg-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] hover:bg-[#b71c1c] active:bg-[#9a1616] text-white text-[13px] font-semibold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Guardando…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Guardar idea
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
