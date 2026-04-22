'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Theme, View } from '@/features/tickets/types';
import { createSupabaseBrowser } from '@/lib/supabase/client';

interface HeaderProps {
  currentView: View;
  onViewChange: (v: View) => void;
  theme: Theme;
  onThemeToggle: () => void;
  isLoading: boolean;
  onSync: () => void;
  syncTime: string;
  userName?: string;
}

const SUN_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MOON_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const LOGOUT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[13px] h-[13px] flex-shrink-0">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Header({ currentView, onViewChange, theme, onThemeToggle, isLoading, onSync, syncTime, userName }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-[100] h-14 bg-tk-bg2 border-b border-tk-border flex items-center px-4 md:px-8 gap-3 md:gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2 h-8 flex-shrink-0">
        <Image
          src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png"
          alt="Travelkit"
          width={100}
          height={32}
          className="h-7 w-auto object-contain"
        />
        <div className="font-mono text-[13px] font-semibold tracking-[0.08em] text-tk-text2 uppercase hidden sm:block">
          <span className="text-tk-accent">IT</span> / HELPDESK
        </div>
      </div>

      <div className="w-px h-5 bg-tk-border2 flex-shrink-0 hidden sm:block" />

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {/* Timestamp — solo desktop */}
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

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="flex items-center justify-center w-[30px] h-[30px] bg-transparent border border-tk-border2 rounded text-tk-text2 cursor-pointer transition-[border-color,color,background] duration-[0.15s] flex-shrink-0 hover:border-tk-accent hover:text-tk-accent hover:bg-[rgba(79,195,247,0.04)]"
        >
          {theme === 'dark' ? SUN_ICON : MOON_ICON}
        </button>

        {/* Usuario + Logout */}
        {userName && (
          <div className="flex items-center gap-2 border-l border-tk-border2 pl-2 md:pl-3 ml-0 md:ml-1">
            <span className="font-mono text-[11px] text-tk-text2 tracking-[0.04em] whitespace-nowrap hidden md:block">
              {userName}
            </span>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center gap-1 px-2 py-[5px] bg-transparent border border-tk-border2 rounded text-tk-text3 font-mono text-[10px] tracking-[0.06em] uppercase cursor-pointer transition-[border-color,color,background] duration-[0.15s] hover:border-tk-red hover:text-tk-red hover:bg-[rgba(239,83,80,0.06)]"
            >
              {LOGOUT_ICON}
              <span className="hidden sm:inline">SALIR</span>
            </button>
          </div>
        )}

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
