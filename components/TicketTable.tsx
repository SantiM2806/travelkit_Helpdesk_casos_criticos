'use client';

import { useEffect, useRef } from 'react';
import type { Ticket } from '@/lib/types';
import { normalizeEstado, formatDate, badgePrioridad, badgeEstado, badgeCat } from '@/lib/utils';

interface TicketTableProps {
  filteredTickets: Ticket[];
  allTickets:      Ticket[];
  isLoading:       boolean;
}

export default function TicketTable({ filteredTickets, allTickets, isLoading }: TicketTableProps) {
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
            {['Ticket ID', 'Email', 'Categoría', 'Prioridad', 'Descripción', 'Estado', 'Fecha'].map((h, i) => (
              <th
                key={h}
                className={`font-mono text-[10px] font-semibold tracking-[0.12em] uppercase text-tk-text3 py-3 px-4 text-left bg-tk-bg2 border-b border-tk-border whitespace-nowrap select-none first:pl-5 last:pr-5 ${
                  [2, 4, 6].includes(i) ? 'hidden md:table-cell' : ''
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={tbodyRef}>
          {/* Loading */}
          {showLoading && (
            <tr>
              <td colSpan={7} className="py-14 text-center border-b-0">
                <div className="flex gap-[5px] items-center justify-center">
                  <span className="loading-dot w-[7px] h-[7px] rounded-full bg-tk-accent animate-dot-bounce" />
                  <span className="loading-dot w-[7px] h-[7px] rounded-full bg-tk-accent animate-dot-bounce" />
                  <span className="loading-dot w-[7px] h-[7px] rounded-full bg-tk-accent animate-dot-bounce" />
                </div>
                <div className="font-mono text-[12px] font-semibold tracking-[0.08em] uppercase text-tk-text3 mt-3">Cargando tickets</div>
                <div className="text-[12px] text-tk-text3 mt-1">Conectando con el Sheet…</div>
              </td>
            </tr>
          )}

          {/* Sin tickets */}
          {showEmpty && (
            <tr>
              <td colSpan={7} className="py-14 text-center border-b-0">
                <span className="text-[32px] block mb-3 opacity-30">📭</span>
                <div className="font-mono text-[12px] font-semibold tracking-[0.08em] uppercase text-tk-text3">Sin tickets registrados</div>
                <div className="text-[12px] text-tk-text3 mt-1">El Sheet no contiene datos aún.</div>
              </td>
            </tr>
          )}

          {/* Sin resultados */}
          {showNoResults && (
            <tr>
              <td colSpan={7} className="py-14 text-center border-b-0">
                <span className="text-[32px] block mb-3 opacity-30">🔍</span>
                <div className="font-mono text-[12px] font-semibold tracking-[0.08em] uppercase text-tk-text3">Sin resultados</div>
                <div className="text-[12px] text-tk-text3 mt-1">Ningún ticket coincide con los filtros aplicados.</div>
              </td>
            </tr>
          )}

          {/* Rows */}
          {showRows && filteredTickets.map((t, i) => {
            const norm      = normalizeEstado(t.estado);
            const priBadge  = badgePrioridad(t.prioridad);
            const estBadge  = badgeEstado(norm, t.estado);
            const catBadge  = badgeCat(t.categoria);

            return (
              <tr
                key={t.ticket_id}
                className="ticket-row border-b border-tk-border last:border-b-0 hover:bg-tk-bg3 cursor-default"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                <td className="py-3 px-4 pl-5 font-mono text-xs text-tk-text2 whitespace-nowrap">
                  {t.ticket_id || <span className="text-tk-text3">—</span>}
                </td>
                <td className="py-3 px-4 text-[13px] text-tk-text whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis">
                  {t.email || <span className="text-tk-text3">—</span>}
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  {catBadge
                    ? <span className={catBadge.cls}>{catBadge.label}</span>
                    : <span className="text-tk-text3">—</span>
                  }
                </td>
                <td className="py-3 px-4">
                  <span className={priBadge.cls}>{priBadge.label}</span>
                </td>
                <td className="py-3 px-4 text-xs text-tk-text2 max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap hidden md:table-cell">
                  {t.descripcion || <span className="text-tk-text3">—</span>}
                </td>
                <td className="py-3 px-4">
                  <span className={estBadge.cls}>
                    {estBadge.dotCls && (
                      <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${estBadge.dotCls}`} />
                    )}
                    {estBadge.label}
                  </span>
                </td>
                <td className="py-3 px-4 pr-5 font-mono text-[11px] text-tk-text3 whitespace-nowrap hidden md:table-cell">
                  {formatDate(t.timestamp)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
