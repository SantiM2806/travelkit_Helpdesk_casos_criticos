'use client';

import type { Ticket } from '@/features/tickets/types';
import { formatDate, badgePrioridad, badgeEstado, normalizeEstado } from '@/features/tickets/utils/formatters';

interface Props {
  ticket: Ticket | null;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3">{label}</span>
      <span className="text-[13px] text-tk-text leading-relaxed">{value}</span>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center font-mono text-[10px] font-semibold tracking-[0.06em] uppercase px-2 py-[3px] rounded-full border bg-tk-blue-bg text-tk-blue border-[rgba(100,181,246,0.2)]">
      {label}
    </span>
  );
}

export default function TicketDetailModal({ ticket, onClose }: Props) {
  if (!ticket) return null;

  const norm     = normalizeEstado(ticket.estado);
  const priBadge = badgePrioridad(ticket.urgency || ticket.prioridad);
  const estBadge = badgeEstado(norm, ticket.estado);

  const mainCat  = ticket.main_category || ticket.categoria;
  const subCat   = ticket.sub_category;
  const reqType  = ticket.request_type;
  const subject  = ticket.subject;
  const desc     = ticket.description || ticket.descripcion;
  const dept     = ticket.department;
  const imgUrl   = ticket.attachment_url || ticket.imagen_url;
  const name     = ticket.full_name;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-tk-bg border-l border-tk-border z-[201] flex flex-col shadow-2xl animate-slide-in-right overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-tk-border bg-tk-bg2 flex-shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[13px] font-semibold text-tk-text2 tracking-[0.04em]">
              {ticket.ticket_id}
            </span>
            <span className={estBadge.cls}>
              {estBadge.dotCls && <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${estBadge.dotCls}`} />}
              {estBadge.label}
            </span>
            <span className={priBadge.cls}>{priBadge.label}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-tk-border text-tk-text3 hover:text-tk-text hover:border-tk-border2 transition-colors cursor-pointer flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Solicitante */}
          <div className="bg-tk-bg2 border border-tk-border rounded-lg px-4 py-4 flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3 mb-1">Solicitante</span>
            {name && <span className="text-[14px] font-semibold text-tk-text">{name}</span>}
            <span className="text-[12px] text-tk-text2">{ticket.email}</span>
            {dept && (
              <div className="mt-2 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-tk-text3">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
                <span className="text-[12px] text-tk-text3">{dept}</span>
              </div>
            )}
          </div>

          {/* Categorización */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3">Categorización</span>
            <div className="flex flex-wrap gap-2">
              {mainCat && <Chip label={mainCat} />}
              {subCat  && <Chip label={subCat} />}
              {reqType && (
                <span className="inline-flex items-center font-mono text-[10px] font-semibold tracking-[0.06em] uppercase px-2 py-[3px] rounded-full border bg-tk-amber-bg text-tk-amber border-[rgba(255,112,67,0.2)]">
                  {reqType}
                </span>
              )}
            </div>
          </div>

          {/* Asunto */}
          {subject && (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3">Asunto</span>
              <p className="text-[14px] font-semibold text-tk-text leading-snug">{subject}</p>
            </div>
          )}

          {/* Descripción */}
          {desc && (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3">Descripción</span>
              <p className="text-[13px] text-tk-text2 leading-relaxed whitespace-pre-wrap">{desc}</p>
            </div>
          )}

          {/* Evidencia */}
          {imgUrl && (
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3">Evidencia adjunta</span>
              <a href={imgUrl} target="_blank" rel="noopener noreferrer" className="group relative block">
                <img
                  src={imgUrl}
                  alt="Evidencia"
                  className="w-full rounded-lg border border-tk-border object-cover max-h-[200px] group-hover:opacity-80 transition-opacity"
                />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/60 text-white text-[12px] px-3 py-1.5 rounded-full font-medium">Ver imagen completa</span>
                </span>
              </a>
            </div>
          )}

          {/* Responsable */}
          {ticket.responsable && (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3">Responsable IT</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-tk-accent/20 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-tk-accent">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span className="text-[13px] text-tk-text">{ticket.responsable}</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-tk-border bg-tk-bg2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-tk-text3">
              Creado: {formatDate(ticket.timestamp)}
            </span>
            {ticket.area && (
              <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-tk-violet bg-tk-violet-bg border border-[rgba(149,117,205,0.2)] px-2 py-[3px] rounded-full">
                {ticket.area}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
