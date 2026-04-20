'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Ticket, EstadoFilter, PrioridadFilter, View, Theme, PendingMove, ToastItem, MovementLog } from '@/lib/types';
import { MOCK_DATA } from '@/lib/data';
import { normalizeEstado, getSyncTimeStr } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

import Header          from '@/components/Header';
import ConfigBanner    from '@/components/ConfigBanner';
import StatsBar        from '@/components/StatsBar';
import FiltersRow      from '@/components/FiltersRow';
import TicketTable     from '@/components/TicketTable';
import KanbanBoard     from '@/components/KanbanBoard';
import Modal           from '@/components/Modal';
import ToastContainer  from '@/components/ToastContainer';

const AUTO_REFRESH = 60; // segundos (0 = desactivado)

export default function Page() {
  /* ── Estado global ── */
  const [allTickets,      setAllTickets]      = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [activeEstado,    setActiveEstado]    = useState<EstadoFilter>('Todos');
  const [activePrioridad, setActivePrioridad] = useState<PrioridadFilter>('Todas');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [isLoading,       setIsLoading]       = useState(false);
  const [currentView,     setCurrentView]     = useState<View>('table');
  const [pendingMove,     setPendingMove]     = useState<PendingMove | null>(null);
  const [theme,           setTheme]           = useState<Theme>('dark');
  const [toasts,          setToasts]          = useState<ToastItem[]>([]);
  const [syncTime,        setSyncTime]        = useState('—');

  const movementLog = useRef<MovementLog[]>([]);
  const loadingRef  = useRef(false);

  /* ── Filtros ── */
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = allTickets.filter(t => {
      const norm = normalizeEstado(t.estado);

      const matchEstado =
        activeEstado === 'Todos'      ||
        (activeEstado === 'Abierto'    && norm === 'abierto')  ||
        (activeEstado === 'En proceso' && norm === 'proceso')  ||
        (activeEstado === 'Resuelto'   && norm === 'resuelto') ||
        (activeEstado === 'Otra área'  && norm === 'otrarea');

      const matchPrioridad =
        activePrioridad === 'Todas' ||
        t.prioridad.toLowerCase() === activePrioridad.toLowerCase();

      const matchSearch =
        !q ||
        t.ticket_id.toLowerCase().includes(q)  ||
        t.email.toLowerCase().includes(q)       ||
        t.descripcion.toLowerCase().includes(q) ||
        t.categoria.toLowerCase().includes(q);

      return matchEstado && matchPrioridad && matchSearch;
    });
    setFilteredTickets(filtered);
  }, [allTickets, activeEstado, activePrioridad, searchQuery]);

  /* ── Carga datos desde Supabase ── */
  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.from('tickets').select('*').order('timestamp', { ascending: false });
      if (error) throw error;
      if (data) {
        setAllTickets(data as Ticket[]);
      }
    } catch (err) {
      console.error('Database connection error:', err);
      // Fallback
      setAllTickets([...MOCK_DATA]);
    } finally {
      setSyncTime(getSyncTimeStr());
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  /* ── Init ── */
  useEffect(() => {
    const saved = localStorage.getItem('tk-theme') as Theme | null;
    if (saved) setTheme(saved);
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto-refresh ── */
  useEffect(() => {
    if (AUTO_REFRESH <= 0) return;
    const interval = setInterval(loadData, AUTO_REFRESH * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  /* ── Tema ── */
  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tk-theme', next);
  }

  /* ── Toast ── */
  function showToast(html: string) {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, html, hiding: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, hiding: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
    }, 3000);
  }

  /* ── Modal ── */
  function handleMoveRequest(ticketId: string, fromEstado: string, toEstado: string) {
    setPendingMove({ ticketId, fromEstado, toEstado });
  }

  function handleModalClose() {
    setPendingMove(null);
  }

  async function handleModalConfirm(responsable: string, accion: string, area: string) {
    if (!pendingMove) return;
    const { ticketId, fromEstado, toEstado } = pendingMove;

    setAllTickets(prev => prev.map(t => {
      if (t.ticket_id !== ticketId) return t;
      return {
        ...t,
        estado:      toEstado,
        responsable,
        ...(area ? { area } : {}),
      };
    }));

    movementLog.current.push({
      ticket_id: ticketId, de: fromEstado, a: toEstado,
      responsable, area: area || null, accion, timestamp: new Date().toISOString(),
    });

    setPendingMove(null);

    /* Guardar en base de datos de Supabase */
    const { error } = await supabase
      .from('tickets')
      .update({
        estado: toEstado,
        responsable,
        ...(area ? { area } : {})
      })
      .eq('ticket_id', ticketId);

    if (error) {
      console.error("Error al actualizar estado en supabase: ", error);
      showToast(`Error al mover ${ticketId}. Verifica tu conexión a internet.`);
      return; 
    }

    /* Animación landing en kanban */
    if (currentView === 'kanban') {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const moved = document.querySelector<HTMLElement>(`.kanban-card[data-ticket-id="${ticketId}"]`);
        if (moved) {
          moved.classList.add('animate-card-land');
          moved.addEventListener('animationend', () => moved.classList.remove('animate-card-land'), { once: true });
        }
      }));
    }

    showToast(`${ticketId} movido a <strong style="color:var(--accent)">${toEstado}</strong> · por ${responsable.split(' ')[0]}`);
  }

  /* ── Render ── */
  return (
    <>
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        theme={theme}
        onThemeToggle={toggleTheme}
        isLoading={isLoading}
        onSync={loadData}
        syncTime={syncTime}
      />

      <ConfigBanner />

      <StatsBar allTickets={allTickets} />

      <main className="flex-1 px-8 py-6">
        {/* Error banner — solo visible con Google Sheets real */}
        <div id="errorBanner" className="hidden bg-[rgba(239,83,80,0.06)] border border-[rgba(239,83,80,0.25)] rounded-md px-5 py-4 mb-5">
          <div className="font-mono text-xs font-semibold text-tk-red tracking-[0.06em] uppercase mb-2 flex items-center gap-2">
            Error al cargar datos
          </div>
          <p className="text-[13px] text-tk-text2">No se pudo conectar con el Google Sheet.</p>
        </div>

        {/* Filtros — solo en vista tabla */}
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

        {/* Vista tabla */}
        {currentView === 'table' && (
          <TicketTable
            filteredTickets={filteredTickets}
            allTickets={allTickets}
            isLoading={isLoading}
          />
        )}

        {/* Vista kanban */}
        {currentView === 'kanban' && (
          <KanbanBoard
            allTickets={allTickets}
            onMoveRequest={handleMoveRequest}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="px-8 py-3 border-t border-tk-border flex items-center bg-tk-bg2 gap-4">
        <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3">
          IT Helpdesk System · Travelkit Colombia
        </div>
        <div className="ml-auto font-mono text-[11px] text-tk-text3">
          <span className="text-tk-text2">{filteredTickets.length}</span> /{' '}
          <span className="text-tk-text2">{allTickets.length}</span> tickets
        </div>
      </footer>

      {/* Modal */}
      <Modal
        pendingMove={pendingMove}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </>
  );
}

/* ══════════════════════════════════════════════════
   CONEXIÓN REAL — Google Sheets
   1. Comparte el Sheet como público
   2. Reemplaza SHEET_ID y SHEET_NAME
   3. Usa loadFromSheet() en lugar de loadData()
══════════════════════════════════════════════════ */
// const SHEET_ID   = 'TU_SHEET_ID_AQUI';
// const SHEET_NAME = 'Sheet1';
// const COLS = { ticket_id:0, timestamp:1, email:2, categoria:3, prioridad:4, descripcion:5, estado:6 };
//
// function parseCSVLine(line: string): string[] {
//   const cols: string[] = [];
//   let inQuote = false, cur = '';
//   for (let i = 0; i < line.length; i++) {
//     const c = line[i];
//     if (c === '"') { if (inQuote && line[i+1]==='"'){cur+='"';i++;}else{inQuote=!inQuote;} }
//     else if (c === ',' && !inQuote) { cols.push(cur.trim()); cur=''; }
//     else { cur += c; }
//   }
//   cols.push(cur.trim());
//   return cols;
// }
//
// async function loadFromSheet() { ... }
