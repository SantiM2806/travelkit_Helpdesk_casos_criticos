'use client';

import { useEffect, useRef } from 'react';
import type { Ticket } from '@/features/tickets/types';
import { normalizeEstado } from '@/features/tickets/utils/formatters';

interface StatsBarProps {
  allTickets: Ticket[];
}

interface StatCell {
  key: string;
  label: string;
  id: string;
  barId: string;
  colorClass: string;
  barColor: string;
  getValue: (tickets: Ticket[]) => number;
  getWidth: (val: number, total: number) => string;
}

const CELLS: StatCell[] = [
  {
    key: 'total', label: 'Total casos', id: 'statTotal', barId: 'barTotal',
    colorClass: 'text-tk-accent', barColor: 'bg-tk-accent',
    getValue: t => t.length,
    getWidth: (_, total) => total > 0 ? '100%' : '0%',
  },
  {
    key: 'abierto', label: 'Abiertos', id: 'statAbierto', barId: 'barAbierto',
    colorClass: 'text-tk-red', barColor: 'bg-tk-red',
    getValue: t => t.filter(x => normalizeEstado(x.estado) === 'abierto').length,
    getWidth: (val, total) => total ? `${(val / total) * 100}%` : '0%',
  },
  {
    key: 'gestion', label: 'En gestión', id: 'statGestion', barId: 'barGestion',
    colorClass: 'text-tk-orange', barColor: 'bg-tk-orange',
    getValue: t => t.filter(x => normalizeEstado(x.estado) === 'gestion').length,
    getWidth: (val, total) => total ? `${(val / total) * 100}%` : '0%',
  },
  {
    key: 'finalizado', label: 'Finalizados', id: 'statFinalizado', barId: 'barFinalizado',
    colorClass: 'text-tk-green', barColor: 'bg-tk-green',
    getValue: t => t.filter(x => normalizeEstado(x.estado) === 'finalizado').length,
    getWidth: (val, total) => total ? `${(val / total) * 100}%` : '0%',
  },
];

export default function StatsBar({ allTickets }: StatsBarProps) {
  const total = allTickets.length;
  const values = CELLS.map(c => c.getValue(allTickets));

  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    requestAnimationFrame(() => {
      CELLS.forEach((cell, i) => {
        const bar = barsRef.current[i];
        if (bar) bar.style.width = cell.getWidth(values[i], total);
      });
    });
  }, [allTickets]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-tk-bg2 border-b border-tk-border grid grid-cols-2 md:grid-cols-4">
      {CELLS.map((cell, i) => (
        <div
          key={cell.key}
          className="pt-4 px-4 md:px-8 pb-0 border-r border-tk-border last:border-r-0 even:border-r-0 md:even:border-r md:[&:nth-child(4)]:border-r-0 relative overflow-hidden border-b md:border-b-0 [&:nth-child(n+3)]:border-b-0"
        >
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-tk-text3 mb-1">
            {cell.label}
          </div>
          <div className={`font-mono text-[28px] font-semibold leading-[1.1] mb-[14px] transition-colors duration-300 ${cell.colorClass}`}>
            {values[i] || '—'}
          </div>
          {/* Animated bar */}
          <div className="h-[3px] bg-tk-border absolute bottom-0 left-0 right-0">
            <div
              ref={el => { barsRef.current[i] = el; }}
              className={`stat-bar-fill ${cell.barColor}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
