'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Ticket, EstadoFilter, PrioridadFilter, View, PendingMove, ToastItem, MovementLog } from '@/features/tickets/types';
import { MOCK_DATA } from '@/features/tickets/actions/ticket.actions';
import { normalizeEstado, getSyncTimeStr } from '@/features/tickets/utils/formatters';
import { supabase } from '@/lib/supabase/server';
import { createSupabaseBrowser } from '@/lib/supabase/client';

import Header         from '@/components/layout/Header';
import ConfigBanner   from '@/components/layout/ConfigBanner';
import StatsBar       from '@/features/tickets/components/StatsBar';
import FiltersRow     from '@/features/tickets/components/FiltersRow';
import TicketTable    from '@/features/tickets/components/TicketTable';
import KanbanBoard    from '@/features/tickets/components/KanbanBoard';
import Modal          from '@/components/common/Modal';
import ToastContainer from '@/components/common/ToastContainer';
import NuevaSolicitudModal from '@/features/tickets/components/NuevaSolicitudModal';
import TicketDetailModal   from '@/features/tickets/components/TicketDetailModal';

const AUTO_REFRESH = 60;

/* ══════════════════════════════════════════════════
   HUB — Panel de selección para admin
══════════════════════════════════════════════════ */
const HUB_MODULES = [
  {
    href: '/solicitud',
    label: 'Web de Solicitud',
    description: 'Reporta fallas, solicita accesos y adjunta evidencia. Disponible para todos los empleados.',
    badge: 'Acceso público',
    badgeColor: '#2e7d32',
    badgeBg: '#f0faf0',
    badgeBorder: '#c8e6c9',
    accentColor: '#2e7d32',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
  },
  {
    href: '/?view=pipeline',
    label: 'Web de Pipeline',
    description: 'Gestiona el flujo de tickets en tabla o Kanban, actualiza estados y monitorea en tiempo real.',
    badge: 'Equipo IT',
    badgeColor: '#1565c0',
    badgeBg: '#f0f5ff',
    badgeBorder: '#bbdefb',
    accentColor: '#1565c0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <path d="M17.5 14v3m0 0v3m0-3h3m-3 0h-3"/>
      </svg>
    ),
  },
  {
    href: '/executive',
    label: 'Web Executive',
    description: 'Dashboard con KPIs, SLA promedio, gráficos por área y categorías críticas.',
    badge: 'Alta gerencia',
    badgeColor: '#6a1b9a',
    badgeBg: '#faf0ff',
    badgeBorder: '#e1bee7',
    accentColor: '#6a1b9a',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
] as const;

function HubCard({ module }: { module: typeof HUB_MODULES[number] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={module.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col bg-white rounded-2xl overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F] transition-all duration-200"
      style={{
        border: `1px solid ${hovered ? module.accentColor + '55' : '#ebebeb'}`,
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: module.accentColor, opacity: hovered ? 1 : 0.35 }} />
      <div className="flex flex-col flex-1 p-7 gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 transition-all duration-200"
            style={{ color: module.accentColor, background: hovered ? module.badgeBg : '#f9f9f9', border: `1px solid ${hovered ? module.badgeBorder : '#efefef'}` }}>
            {module.icon}
          </div>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5"
            style={{ color: module.badgeColor, background: module.badgeBg, border: `1px solid ${module.badgeBorder}` }}>
            {module.badge}
          </span>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <h2 className="text-[15px] font-semibold text-[#1a1a1a] leading-snug">{module.label}</h2>
          <p className="text-[13px] text-[#777] leading-relaxed">{module.description}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: module.accentColor }}>
          Acceder
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="w-3.5 h-3.5 transition-transform duration-150" style={{ transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}>
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>
    </Link>
  );
}

function HubView({ onEnterPipeline }: { onEnterPipeline: () => void }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans flex flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-5 mb-10">
        <Image
          src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png"
          alt="Travelkit"
          width={180}
          height={54}
          className="h-14 w-auto object-contain"
          priority
        />
        <div className="text-center">
          <h1 className="text-[22px] font-semibold text-[#1a1a1a] leading-tight tracking-tight">
            Panel de Control Travelkit
          </h1>
          <p className="text-[13px] text-[#888] mt-1.5">
            Selecciona el módulo al que deseas acceder
          </p>
        </div>
      </div>

      <div className="w-full max-w-[960px] grid grid-cols-1 md:grid-cols-3 gap-4">
        {HUB_MODULES.map(mod =>
          mod.href === '/?view=pipeline' ? (
            <button
              key={mod.href}
              onClick={onEnterPipeline}
              className="flex flex-col bg-white rounded-2xl overflow-hidden text-left w-full outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F] transition-all duration-200 group"
              style={{ border: '1px solid #ebebeb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.border = `1px solid ${mod.accentColor}55`;
                el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.10)';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.border = '1px solid #ebebeb';
                el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
                el.style.transform = 'translateY(0)';
              }}
            >
              <div className="h-[3px] w-full flex-shrink-0" style={{ background: mod.accentColor, opacity: 0.35 }} />
              <div className="flex flex-col flex-1 p-7 gap-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0" style={{ color: mod.accentColor, background: '#f9f9f9', border: '1px solid #efefef' }}>
                    {mod.icon}
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5"
                    style={{ color: mod.badgeColor, background: mod.badgeBg, border: `1px solid ${mod.badgeBorder}` }}>
                    {mod.badge}
                  </span>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <h2 className="text-[15px] font-semibold text-[#1a1a1a] leading-snug">{mod.label}</h2>
                  <p className="text-[13px] text-[#777] leading-relaxed">{mod.description}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: mod.accentColor }}>
                  Acceder
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </div>
            </button>
          ) : (
            <HubCard key={mod.href} module={mod} />
          )
        )}
      </div>

      <p className="mt-10 text-[12px] text-[#bbb]">
        Travelkit Colombia · Sistema interno · {new Date().getFullYear()}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PÁGINA PRINCIPAL — Hub (admin) o Pipeline (resto)
══════════════════════════════════════════════════ */
export default function Page() {
  const [role,           setRole]           = useState<string | null>(null);
  const [showPipeline,   setShowPipeline]   = useState(false);
  const [roleResolved,   setRoleResolved]   = useState(false);

  /* ── Pipeline state ── */
  const [allTickets,      setAllTickets]      = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [activeEstado,    setActiveEstado]    = useState<EstadoFilter>('Todos');
  const [activePrioridad, setActivePrioridad] = useState<PrioridadFilter>('Todas');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [isLoading,       setIsLoading]       = useState(false);
  const [currentView,     setCurrentView]     = useState<View>('table');
  const [pendingMove,     setPendingMove]     = useState<PendingMove | null>(null);
  const [toasts,          setToasts]          = useState<ToastItem[]>([]);
  const [syncTime,        setSyncTime]        = useState('—');
  const [userName,        setUserName]        = useState('');
  const [userEmail,       setUserEmail]       = useState('');
  const [nuevaSolicitud,  setNuevaSolicitud]  = useState(false);
  const [selectedTicket,  setSelectedTicket]  = useState<Ticket | null>(null);

  const movementLog = useRef<MovementLog[]>([]);
  const loadingRef  = useRef(false);

  /* ── Detectar rol al montar ── */
  useEffect(() => {
    const auth = createSupabaseBrowser();
    auth.auth.getUser().then(({ data }) => {
      const meta  = data.user?.user_metadata;
      const email = data.user?.email || '';
      const r     = meta?.role as string | undefined;
      setRole(r ?? null);
      setRoleResolved(true);

      const emailLocal    = email.split('@')[0];
      const nameFromEmail = emailLocal
        .split('.')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      setUserName(meta?.full_name || meta?.name || nameFromEmail);
      setUserEmail(email);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Cargar datos (pipeline) ── */
  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('tickets').select('*').order('timestamp', { ascending: false });
      if (error) throw error;
      if (data) setAllTickets(data as Ticket[]);
    } catch {
      setAllTickets([...MOCK_DATA]);
    } finally {
      setSyncTime(getSyncTimeStr());
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  /* ── Cargar datos cuando se entra al pipeline ── */
  const isAdminInPipeline = role === 'admin' && showPipeline;
  const isPipelineVisible = role !== 'admin' || isAdminInPipeline;

  useEffect(() => {
    if (isPipelineVisible && roleResolved) loadData();
  }, [isPipelineVisible, roleResolved]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto-refresh ── */
  useEffect(() => {
    if (!isPipelineVisible || AUTO_REFRESH <= 0) return;
    const interval = setInterval(loadData, AUTO_REFRESH * 1000);
    return () => clearInterval(interval);
  }, [isPipelineVisible, loadData]);

  /* ── Filtros ── */
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredTickets(allTickets.filter(t => {
      const norm = normalizeEstado(t.estado);
      const matchEstado =
        activeEstado === 'Todos' ||
        (activeEstado === 'Abierto'    && norm === 'abierto')  ||
        (activeEstado === 'En proceso' && norm === 'proceso')  ||
        (activeEstado === 'Resuelto'   && norm === 'resuelto') ||
        (activeEstado === 'Otra área'  && norm === 'otrarea');
      const matchPrioridad = activePrioridad === 'Todas' || t.prioridad.toLowerCase() === activePrioridad.toLowerCase();
      const matchSearch = !q || t.ticket_id.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) ||
        t.descripcion.toLowerCase().includes(q) || t.categoria.toLowerCase().includes(q);
      return matchEstado && matchPrioridad && matchSearch;
    }));
  }, [allTickets, activeEstado, activePrioridad, searchQuery]);

  function showToast(html: string) {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, html, hiding: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, hiding: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
    }, 3000);
  }

  async function handleModalConfirm(responsable: string, accion: string, area: string) {
    if (!pendingMove) return;
    const { ticketId, fromEstado, toEstado } = pendingMove;
    setAllTickets(prev => prev.map(t =>
      t.ticket_id !== ticketId ? t : { ...t, estado: toEstado, responsable, ...(area ? { area } : {}) }
    ));
    movementLog.current.push({ ticket_id: ticketId, de: fromEstado, a: toEstado, responsable, area: area || null, accion, timestamp: new Date().toISOString() });
    setPendingMove(null);

    const [{ error }, { error: movError }] = await Promise.all([
      supabase.from('tickets').update({ estado: toEstado, responsable, ...(area ? { area } : {}) }).eq('ticket_id', ticketId),
      supabase.from('ticket_movements').insert({ ticket_id: ticketId, de: fromEstado, a: toEstado, responsable, area: area || null, accion }),
    ]);
    if (movError) console.error('❌ ticket_movements insert error:', movError);
    if (error) { showToast(`Error al mover ${ticketId}. Verifica tu conexión.`); return; }

    if (currentView === 'kanban') {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(`.kanban-card[data-ticket-id="${ticketId}"]`);
        if (el) { el.classList.add('animate-card-land'); el.addEventListener('animationend', () => el.classList.remove('animate-card-land'), { once: true }); }
      }));
    }
    showToast(`${ticketId} movido a <strong style="color:var(--accent)">${toEstado}</strong> · por ${responsable.split(' ')[0]}`);
  }

  /* ── Esperar a que se resuelva el rol ── */
  if (!roleResolved) return null;

  /* ── Admin ve el Hub (a menos que haya entrado al pipeline) ── */
  if (role === 'admin' && !showPipeline) {
    return <HubView onEnterPipeline={() => setShowPipeline(true)} />;
  }

  /* ── Pipeline ── */
  return (
    <>
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        isLoading={isLoading}
        onSync={loadData}
        syncTime={syncTime}
      />
      <ConfigBanner />
      <StatsBar allTickets={allTickets} />

      <main className="flex-1 px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 mb-0">
          <div className="flex-1 min-w-0">
            {currentView === 'table' && (
              <FiltersRow
                activeEstado={activeEstado}
                activePrioridad={activePrioridad}
                searchQuery={searchQuery}
                onEstadoChange={setActiveEstado}
                onPrioridadChange={setActivePrioridad}
                onSearchChange={setSearchQuery}
              />
            )}
          </div>
          {/* Admin puede volver al Hub */}
          {role === 'admin' && (
            <button
              onClick={() => setShowPipeline(false)}
              className="flex items-center gap-1.5 px-3 py-[7px] border border-tk-border2 text-tk-text3 font-mono text-[10px] tracking-[0.06em] uppercase rounded cursor-pointer hover:border-tk-accent hover:text-tk-accent transition-colors duration-150 flex-shrink-0 self-start"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Panel
            </button>
          )}
          <button
            onClick={() => setNuevaSolicitud(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-[7px] font-mono text-[11px] font-semibold tracking-[0.06em] uppercase rounded cursor-pointer transition-opacity duration-[0.15s] hover:opacity-90 active:opacity-80 whitespace-nowrap flex-shrink-0 self-start text-white"
            style={{ background: '#CC0000' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            NUEVA SOLICITUD
          </button>
        </div>

        <div key={`view-${currentView}`} className="animate-fade-up">
          {currentView === 'table' && (
            <TicketTable filteredTickets={filteredTickets} allTickets={allTickets} isLoading={isLoading} onTicketClick={setSelectedTicket} />
          )}
          {currentView === 'kanban' && (
            <KanbanBoard allTickets={allTickets} onMoveRequest={(id, from, to) => setPendingMove({ ticketId: id, fromEstado: from, toEstado: to })} onTicketClick={setSelectedTicket} />
          )}
        </div>
      </main>

      <footer className="px-4 md:px-8 py-3 border-t border-tk-border flex items-center bg-tk-bg2 gap-4">
        <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3">
          IT Helpdesk System · Travelkit Colombia
        </div>
        <div className="ml-auto font-mono text-[11px] text-tk-text3">
          <span className="text-tk-text2">{filteredTickets.length}</span> / <span className="text-tk-text2">{allTickets.length}</span> tickets
        </div>
      </footer>

      <Modal pendingMove={pendingMove} onClose={() => setPendingMove(null)} onConfirm={handleModalConfirm} />
      <ToastContainer toasts={toasts} />
      <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      <NuevaSolicitudModal
        open={nuevaSolicitud}
        userEmail={userEmail}
        onClose={() => setNuevaSolicitud(false)}
        onCreated={() => { loadData(); showToast('Solicitud registrada correctamente en el sistema.'); }}
      />
    </>
  );
}
