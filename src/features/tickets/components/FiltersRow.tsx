'use client';

import { useRef } from 'react';
import type { EstadoFilter, PrioridadFilter } from '@/features/tickets/types';

interface FiltersRowProps {
  activeEstado:    EstadoFilter;
  activePrioridad: PrioridadFilter;
  searchQuery:     string;
  onEstadoChange:    (v: EstadoFilter) => void;
  onPrioridadChange: (v: PrioridadFilter) => void;
  onSearchChange:    (v: string) => void;
}

const ESTADOS:    EstadoFilter[]    = ['Todos', 'Abierto', 'En proceso', 'Resuelto', 'Otra área'];
const PRIORIDADES: PrioridadFilter[] = ['Todas', 'Alta', 'Media', 'Baja'];

const ESTADO_ACTIVE: Record<string, string> = {
  Todos:       'bg-[rgba(79,195,247,0.1)]  border-tk-accent  text-tk-accent',
  Abierto:     'bg-[rgba(239,83,80,0.1)]   border-tk-red     text-tk-red',
  'En proceso':'bg-[rgba(255,167,38,0.1)]  border-tk-orange  text-tk-orange',
  Resuelto:    'bg-[rgba(76,175,138,0.1)]  border-tk-green   text-tk-green',
  'Otra área': 'bg-[rgba(149,117,205,0.1)] border-tk-violet  text-tk-violet',
};

const PRIORIDAD_ACTIVE: Record<string, string> = {
  Todas: 'bg-[rgba(79,195,247,0.1)]  border-tk-accent  text-tk-accent',
  Alta:  'bg-[rgba(239,83,80,0.1)]   border-tk-red     text-tk-red',
  Media: 'bg-[rgba(255,112,67,0.1)]  border-tk-amber   text-tk-amber',
  Baja:  'bg-[rgba(76,175,138,0.1)]  border-tk-green   text-tk-green',
};

const BASE_CHIP = 'font-mono text-[11px] tracking-[0.04em] py-[5px] px-[11px] rounded-full border border-tk-border2 bg-transparent text-tk-text2 cursor-pointer transition-all duration-[0.12s] whitespace-nowrap leading-none hover:text-tk-text hover:bg-tk-bg3';

export default function FiltersRow({ activeEstado, activePrioridad, searchQuery, onEstadoChange, onPrioridadChange, onSearchChange }: FiltersRowProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange(e.target.value), 200);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 mb-5">
      {/* Estado + Prioridad chips */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Estado chips */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3 mr-1 whitespace-nowrap">Estado</span>
          {ESTADOS.map(e => (
            <button
              key={e}
              onClick={() => onEstadoChange(e)}
              className={`${BASE_CHIP} ${activeEstado === e ? ESTADO_ACTIVE[e] : ''}`}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="w-px h-[18px] bg-tk-border mx-1 flex-shrink-0 hidden sm:block" />

        {/* Prioridad chips */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3 mr-1 whitespace-nowrap">Prioridad</span>
          {PRIORIDADES.map(p => (
            <button
              key={p}
              onClick={() => onPrioridadChange(p)}
              className={`${BASE_CHIP} ${activePrioridad === p ? PRIORIDAD_ACTIVE[p] : ''}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Search — full width on mobile, auto on desktop */}
      <div className="sm:ml-auto relative flex items-center w-full sm:w-auto">
        <svg
          className="absolute left-2.5 w-[13px] h-[13px] text-tk-text3 pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          defaultValue={searchQuery}
          onChange={handleSearch}
          placeholder="Buscar ticket, email…"
          className="search-input w-full sm:w-[220px] pl-[30px] pr-2.5 py-[6px] bg-tk-bg3 border border-tk-border rounded text-tk-text font-mono text-xs tracking-[0.02em] transition-[border-color,background] duration-[0.15s]"
        />
      </div>
    </div>
  );
}
