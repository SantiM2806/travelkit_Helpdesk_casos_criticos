'use client';

import type { View } from '@/features/tickets/types';

interface HeaderProps {
  currentView: View;
  onViewChange: (v: View) => void;
  isLoading: boolean;
  onSync: () => void;
  syncTime: string;
}

export default function Header({ currentView, onViewChange, isLoading, onSync, syncTime }: HeaderProps) {
  return (
    <header className="sticky top-0 z-[100] h-14 bg-tk-bg2 border-b border-tk-border flex items-center px-4 md:px-8 gap-3 md:gap-4">

      {/* Brand — solo texto, sin logo */}
      <div className="font-mono text-[13px] font-semibold tracking-[0.08em] text-tk-text2 uppercase flex-shrink-0">
        <span className="text-tk-accent">IT</span> / HELPDESK
      </div>

      <div className="w-px h-5 bg-tk-border2 flex-shrink-0 hidden sm:block" />

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {/* Timestamp */}
        <div className="font-mono text-[11px] text-tk-text3 tracking-[0.04em] hidden lg:block">
          ÚLTIMA SYNC <span className="text-tk-text2">{syncTime}</span>
        </div>

        {/* View toggle */}
        <div className="flex border border-tk-border2 rounded overflow-hidden">
          <button
            onClick={() => onViewChange('table')}
            className={`flex items-center gap-[5px] px-2 sm:px-2.5 py-[5px] font-mono text-[10px] tracking-[0.06em] uppercase transition-[background,color] duration-[0.12s] leading-none border-none cursor-pointer ${
              currentView === 'table'
                ? 'bg-[rgba(79,195,247,0.12)] text-tk-accent'
                : 'bg-transparent text-tk-text3 hover:bg-tk-bg3 hover:text-tk-text2'
            }`}
            title="Vista tabla"
          >
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/>
            </svg>
            <span className="hidden sm:inline">TABLA</span>
          </button>
          <button
            onClick={() => onViewChange('kanban')}
            className={`flex items-center gap-[5px] px-2 sm:px-2.5 py-[5px] font-mono text-[10px] tracking-[0.06em] uppercase transition-[background,color] duration-[0.12s] leading-none border-l border-tk-border2 cursor-pointer ${
              currentView === 'kanban'
                ? 'bg-[rgba(79,195,247,0.12)] text-tk-accent'
                : 'bg-transparent text-tk-text3 hover:bg-tk-bg3 hover:text-tk-text2'
            }`}
            title="Vista kanban"
          >
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="5" height="18" rx="1"/>
              <rect x="10" y="3" width="5" height="12" rx="1"/>
              <rect x="17" y="3" width="5" height="15" rx="1"/>
            </svg>
            <span className="hidden sm:inline">KANBAN</span>
          </button>
        </div>

        {/* Sync button */}
        <button
          onClick={onSync}
          disabled={isLoading}
          title="Sincronizar"
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-transparent border border-tk-border2 rounded text-tk-text2 font-mono text-[11px] tracking-[0.06em] uppercase cursor-pointer transition-[border-color,color,background] duration-[0.15s] whitespace-nowrap hover:border-tk-accent hover:text-tk-accent hover:bg-[rgba(79,195,247,0.04)] active:bg-[rgba(79,195,247,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-[13px] h-[13px] flex-shrink-0 transition-transform duration-[0.6s] ${isLoading ? 'animate-spin-sync' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          <span className="hidden sm:inline">SYNC</span>
        </button>
      </div>
    </header>
  );
}
