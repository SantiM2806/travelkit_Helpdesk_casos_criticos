'use client';

import { useEffect, useRef } from 'react';
import type { Ticket } from '@/features/tickets/types';
import { normalizeEstado, formatDate, badgePrioridad, badgeEstado, badgeCat } from '@/features/tickets/utils/formatters';

interface TicketTableProps {
  filteredTickets: Ticket[];
  allTickets:      Ticket[];
  isLoading:       boolean;
  onTicketClick:   (ticket: Ticket) => void;
}

export default function TicketTable({ filteredTickets, allTickets, isLoading, onTicketClick }: TicketTableProps) {
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  /* Animación stagger en filas */
  useEffect(() => {
    if (!tbodyRef.current) return;
    const rows = tbodyRef.current.querySelectorAll<HTMLElement>('.ticket-row');
    rows.forEach(row => {
      requestAnimationFrame(() => row.classList.add('row-visible'));
    });
  }, [filteredTickets]);

  const showLoading   = isLoading;
  const showEmpty     = !isLoading && allTickets.length === 0;
  const showNoResults = !isLoading && allTickets.length > 0 && filteredTickets.length === 0;
  const showRows      = !isLoading && filteredTickets.length > 0;

  return (
    <div className="border border-tk-border rounded-md overflow-hidden overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {['Caso ID', 'Cliente', 'Agencia', 'Tipo', 'Prioridad', 'Estado', 'Responsable'].map((h, i) => (
              <th
                key={h}
                className={`font-mono text-[10px] font-semibold tracking-[0.12em] uppercase text-tk-text3 py-3 px-4 text-left bg-tk-bg2 border-b border-tk-border whitespace-nowrap select-none first:pl-5 last:pr-5 ${
                  [2, 3, 6].includes(i) ? 'hidden md:table-cell' : ''
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={tbodyRef}>
          {/* Skeleton loading */}
          {showLoading && Array.from({ length: 7 }).map((_, i) => (
            <tr key={i} className="border-b border-tk-border last:border-b-0" style={{ opacity: 1 - i * 0.1 }}>
              <td className="py-3 px-4 pl-5"><div className="skeleton-cell h-3 w-16" /></td>
              <td className="py-3 px-4"><div className="skeleton-cell h-3" style={{ width: `${100 + (i % 3) * 40}px` }} /></td>
              <td className="py-3 px-4 hidden md:table-cell"><div className="skeleton-cell h-5 w-20 rounded-full" /></td>
              <td className="py-3 px-4"><div className="skeleton-cell h-5 w-14 rounded-full" /></td>
              <td className="py-3 px-4 hidden md:table-cell"><div className="skeleton-cell h-3" style={{ width: `${160 + (i % 4) * 30}px` }} /></td>
              <td className="py-3 px-4"><div className="skeleton-cell h-5 w-20 rounded-full" /></td>
              <td className="py-3 px-4 pr-5 hidden md:table-cell"><div className="skeleton-cell h-3 w-20" /></td>
            </tr>
          ))}

          {/* Sin casos */}
          {showEmpty && (
            <tr>
              <td colSpan={7} className="py-14 text-center border-b-0">
                <div className="font-mono text-[12px] font-semibold tracking-[0.08em] uppercase text-tk-text3">Sin casos registrados</div>
                <div className="text-[12px] text-tk-text3 mt-1">Aún no hay casos críticos en el sistema.</div>
              </td>
            </tr>
          )}

          {/* Sin resultados */}
          {showNoResults && (
            <tr>
              <td colSpan={7} className="py-14 text-center border-b-0">
                <div className="font-mono text-[12px] font-semibold tracking-[0.08em] uppercase text-tk-text3">Sin resultados</div>
                <div className="text-[12px] text-tk-text3 mt-1">Ningún caso coincide con los filtros aplicados.</div>
              </td>
            </tr>
          )}

          {/* Rows */}
          {showRows && filteredTickets.map((t, i) => {
            const norm     = normalizeEstado(t.estado);
            const priBadge = badgePrioridad(t.prioridad);
            const estBadge = badgeEstado(norm, t.estado);
            const tipoBadge = badgeCat(t.tipo_solicitud || t.categoria || '');

            return (
              <tr
                key={t.id}
                onClick={() => onTicketClick(t)}
                className="ticket-row border-b border-tk-border last:border-b-0 hover:bg-tk-bg3 cursor-pointer"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {/* Caso ID */}
                <td className="py-3 px-4 pl-5 font-mono text-xs text-tk-text2 whitespace-nowrap">
                  {t.ticket_id || t.codigo || <span className="text-tk-text3">—</span>}
                </td>
                {/* Cliente */}
                <td className="py-3 px-4 text-[13px] text-tk-text whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                  {t.cliente || t.full_name || <span className="text-tk-text3">—</span>}
                </td>
                {/* Agencia */}
                <td className="py-3 px-4 text-[13px] text-tk-text2 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis hidden md:table-cell">
                  {t.agencia || t.department || <span className="text-tk-text3">—</span>}
                </td>
                {/* Tipo */}
                <td className="py-3 px-4 hidden md:table-cell">
                  {tipoBadge
                    ? <span className={tipoBadge.cls}>{tipoBadge.label}</span>
                    : <span className="text-tk-text3">—</span>
                  }
                </td>
                {/* Prioridad */}
                <td className="py-3 px-4">
                  <span className={priBadge.cls}>{priBadge.label}</span>
                </td>
                {/* Estado */}
                <td className="py-3 px-4">
                  <span className={estBadge.cls}>
                    {estBadge.dotCls && (
                      <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${estBadge.dotCls}`} />
                    )}
                    {estBadge.label}
                  </span>
                </td>
                {/* Responsable */}
                <td className="py-3 px-4 pr-5 font-mono text-[11px] text-tk-text3 whitespace-nowrap hidden md:table-cell">
                  {t.responsable || <span className="text-tk-text3">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
