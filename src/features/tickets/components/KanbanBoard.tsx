'use client';

import { useRef } from 'react';
import type { Ticket } from '@/features/tickets/types';
import { normalizeEstado, badgePrioridad, badgeCat } from '@/features/tickets/utils/formatters';

interface KanbanBoardProps {
  allTickets:    Ticket[];
  onMoveRequest: (ticketId: string, fromEstado: string, toEstado: string) => void;
}

interface DragState {
  card:       HTMLElement;
  ticketId:   string;
  startX:     number;
  startY:     number;
  offsetX:    number;
  offsetY:    number;
  width:      number;
  activated:  boolean;
  floater:    HTMLElement | null;
  activeCol:  HTMLElement | null;
  lastVX:     number;
  lastX:      number;
}

const COLS = [
  { estado: 'Abierto',    norm: 'abierto',  colorCls: 'text-tk-red',    dotCls: 'bg-tk-red',    id: 'kCol-Abierto'    },
  { estado: 'En proceso', norm: 'proceso',  colorCls: 'text-tk-orange', dotCls: 'bg-tk-orange', id: 'kCol-En proceso'  },
  { estado: 'Resuelto',   norm: 'resuelto', colorCls: 'text-tk-green',  dotCls: 'bg-tk-green',  id: 'kCol-Resuelto'   },
  { estado: 'Otra área',  norm: 'otrarea',  colorCls: 'text-tk-violet', dotCls: 'bg-tk-violet', id: 'kCol-Otra área'  },
];

export default function KanbanBoard({ allTickets, onMoveRequest }: KanbanBoardProps) {
  const dragStateRef = useRef<DragState | null>(null);

  const byEstado: Record<string, Ticket[]> = {
    'Abierto': [], 'En proceso': [], 'Resuelto': [], 'Otra área': [],
  };
  allTickets.forEach(t => {
    const n = normalizeEstado(t.estado);
    for (const col of COLS) {
      if (n === col.norm) { byEstado[col.estado].push(t); break; }
    }
  });

  /* ── Drag & Drop ── */
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();

    dragStateRef.current = {
      card: card as HTMLElement,
      ticketId:  card.dataset.ticketId ?? '',
      startX:    e.clientX,
      startY:    e.clientY,
      offsetX:   e.clientX - rect.left,
      offsetY:   e.clientY - rect.top,
      width:     rect.width,
      activated: false,
      floater:   null,
      activeCol: null,
      lastVX:    0,
      lastX:     e.clientX,
    };
    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup',   onPointerUp);
  }

  function onPointerMove(e: PointerEvent) {
    const ds = dragStateRef.current;
    if (!ds) return;
    e.preventDefault();

    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;

    if (!ds.activated) {
      if (Math.hypot(dx, dy) < 6) return;
      ds.activated = true;
      activateDrag(e);
    }

    ds.lastVX = e.clientX - ds.lastX;
    ds.lastX  = e.clientX;
    const tilt = Math.max(-8, Math.min(8, ds.lastVX * 0.6));

    if (ds.floater) {
      ds.floater.style.left      = `${e.clientX - ds.offsetX}px`;
      ds.floater.style.top       = `${e.clientY - ds.offsetY}px`;
      ds.floater.style.transform = `rotate(${tilt}deg) scale(1.05)`;
    }

    highlightCol(e.clientX, e.clientY);
  }

  function activateDrag(e: PointerEvent) {
    const ds = dragStateRef.current;
    if (!ds) return;
    ds.card.style.opacity   = '0.12';
    ds.card.style.transform = 'scale(0.96)';
    ds.card.style.borderStyle  = 'dashed';
    ds.card.style.borderColor  = 'var(--accent)';
    ds.card.style.pointerEvents = 'none';

    const floater = ds.card.cloneNode(true) as HTMLElement;
    floater.className = `kanban-card-float ${ds.card.className.replace('cursor-grab', '')}`;
    floater.style.width    = `${ds.width}px`;
    floater.style.left     = `${e.clientX - ds.offsetX}px`;
    floater.style.top      = `${e.clientY - ds.offsetY}px`;
    floater.style.transform = 'rotate(1.5deg) scale(1.05)';
    document.body.appendChild(floater);
    ds.floater = floater;
  }

  function highlightCol(x: number, y: number) {
    const ds = dragStateRef.current;
    if (!ds) return;
    let found: HTMLElement | null = null;
    document.querySelectorAll<HTMLElement>('.kanban-col-el').forEach(col => {
      const r = col.getBoundingClientRect();
      col.classList.remove('kanban-col-drag-over');
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) found = col;
    });
    if (found) (found as HTMLElement).classList.add('kanban-col-drag-over');
    ds.activeCol = found;
  }

  function onPointerUp() {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup',   onPointerUp);

    const ds = dragStateRef.current;
    if (!ds) return;

    if (ds.activated && ds.floater) {
      ds.floater.style.transition = 'transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease';
      ds.floater.style.transform  = 'rotate(0deg) scale(0.94)';
      ds.floater.style.opacity    = '0';
      setTimeout(() => ds.floater?.remove(), 260);
    }

    // Restore card style
    ds.card.style.opacity      = '';
    ds.card.style.transform    = '';
    ds.card.style.borderStyle  = '';
    ds.card.style.borderColor  = '';
    ds.card.style.pointerEvents = '';

    document.querySelectorAll('.kanban-col-el').forEach(c => c.classList.remove('kanban-col-drag-over'));

    if (ds.activated && ds.activeCol) {
      const targetEstado = (ds.activeCol as HTMLElement).dataset.estado ?? '';
      const ticket = allTickets.find(t => t.ticket_id === ds.ticketId);
      if (ticket && ticket.estado !== targetEstado) {
        onMoveRequest(ds.ticketId, ticket.estado, targetEstado);
      }
    }

    dragStateRef.current = null;
  }

  /* ── Render ── */
  return (
    <div className="grid grid-cols-4 gap-4 items-start max-[1200px]:grid-cols-2 max-[900px]:grid-cols-1">
      {COLS.map(col => {
        const tickets = byEstado[col.estado];
        return (
          <div
            key={col.estado}
            data-estado={col.estado}
            className="kanban-col-el bg-tk-bg2 border border-tk-border rounded-lg min-h-[480px] flex flex-col relative transition-[border-color,background] duration-[0.15s] max-[900px]:min-h-0"
          >
            {/* Column header */}
            <div className="kanban-col-header-inner px-4 py-3 border-b border-tk-border flex items-center gap-2 flex-shrink-0">
              <div className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${col.dotCls}`} />
              <div className={`font-mono text-[11px] font-semibold tracking-[0.1em] uppercase ${col.colorCls}`}>
                {col.estado}
              </div>
              <div className="font-mono text-[10px] px-[7px] py-[2px] rounded-full bg-tk-bg3 text-tk-text3 border border-tk-border ml-auto">
                {tickets.length}
              </div>
            </div>

            {/* Column body */}
            <div className="kanban-col-body-inner p-3 flex flex-col gap-2 flex-1 min-h-[200px]">
              {tickets.length === 0 ? (
                <div className="flex items-center justify-center h-20 border border-dashed border-tk-border rounded-md font-mono text-[10px] tracking-[0.06em] uppercase text-tk-text3">
                  Sin tickets
                </div>
              ) : (
                tickets.map(t => <KanbanCard key={t.ticket_id} ticket={t} onPointerDown={onPointerDown} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Kanban Card ── */
interface KanbanCardProps {
  ticket: Ticket;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}

function KanbanCard({ ticket, onPointerDown }: KanbanCardProps) {
  const priBadge = badgePrioridad(ticket.prioridad);
  const catBadge = badgeCat(ticket.categoria);

  return (
    <div
      data-ticket-id={ticket.ticket_id}
      onPointerDown={onPointerDown}
      className="kanban-card bg-tk-bg3 border border-tk-border rounded-md px-[14px] py-3 cursor-grab select-none transition-[border-color,transform,box-shadow,opacity] duration-[0.12s,0.15s,0.15s,0.2s] hover:border-tk-border2 hover:shadow-[0_3px_12px_rgba(0,0,0,0.25)] hover:-translate-y-px active:cursor-grabbing"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-[7px]">
        <span className="font-mono text-[11px] font-semibold text-tk-text2 tracking-[0.04em]">
          {ticket.ticket_id}
        </span>
        <span className={priBadge.cls}>{priBadge.label}</span>
      </div>

      {/* Solicitante */}
      <div className="text-xs text-tk-text2 mb-[5px] whitespace-nowrap overflow-hidden text-ellipsis">
        {ticket.full_name || ticket.email}
      </div>

      {/* Asunto / Descripción */}
      <div className="card-desc text-xs text-tk-text leading-[1.5] mb-2.5">
        {ticket.subject || ticket.descripcion}
      </div>

      {/* Bottom */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {catBadge && <span className={catBadge.cls}>{catBadge.label}</span>}
      </div>

      {/* Área */}
      {ticket.area && (
        <div className="mt-2 pt-2 border-t border-tk-border flex items-center gap-[5px] font-mono text-[10px] text-tk-violet tracking-[0.02em]">
          <svg className="w-[10px] h-[10px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
          {ticket.area}
        </div>
      )}

      {/* Responsable */}
      {ticket.responsable && (
        <div className="mt-2 pt-2 border-t border-tk-border flex items-center gap-[5px] font-mono text-[10px] text-tk-text3 tracking-[0.02em]">
          <svg className="w-[10px] h-[10px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          {ticket.responsable}
        </div>
      )}
    </div>
  );
}
