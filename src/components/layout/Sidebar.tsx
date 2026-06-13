'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

const NAV = [
  {
    href: '/?view=pipeline',
    matchPath: '/',
    label: 'Casos',
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
        <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v1.5a1.5 1.5 0 0 0 0 3V15a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1.5a1.5 1.5 0 0 0 0-3V9z"/>
        <line x1="9" y1="8" x2="9" y2="16" strokeDasharray="2 2"/>
      </svg>
    ),
  },
  {
    href: '/clientes',
    matchPath: '/clientes',
    label: 'Clientes',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  // -------------------------------------------------------------------------
  // "Data" temporalmente oculto. Cuando se decida darle uso (ver con el
  // gerente cual sera la fuente de datos del dashboard ejecutivo), descomentar
  // este bloque.
  // -------------------------------------------------------------------------
  // {
  //   href: '/executive',
  //   matchPath: '/executive',
  //   label: 'Data',
  //   exact: false,
  //   icon: (
  //     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
  //       <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
  //       <path d="M22 12A10 10 0 0 0 12 2v10z"/>
  //     </svg>
  //   ),
  // },
];

const SUN_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MOON_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const [userName, setUserName] = useState('');
  const [theme, setTheme]       = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('tk-theme') as 'dark' | 'light' | null;
    const initial = saved ?? (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') ?? 'dark';
    setTheme(initial);
  }, []);

  useEffect(() => {
    const sb = createSupabaseBrowser();
    sb.auth.getUser().then(({ data }) => {
      const meta     = data.user?.user_metadata;
      const email    = data.user?.email ?? '';
      const fromEmail = email.split('@')[0].split('.').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setUserName(meta?.full_name ?? meta?.name ?? fromEmail);
    });
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tk-theme', next);
  }

  async function handleLogout() {
    const sb = createSupabaseBrowser();
    await sb.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col bg-tk-bg2 border-r border-tk-border transition-[width] duration-300 ease-out ${
        collapsed ? 'w-[60px]' : 'w-[220px]'
      }`}
    >
      {/* Brand + toggle */}
      <div className="h-14 flex items-center flex-shrink-0 border-b border-tk-border overflow-hidden">
        {/* Toggle button (siempre visible) */}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Abrir menú' : 'Cerrar menú'}
          title={collapsed ? 'Abrir menú' : 'Cerrar menú'}
          className="w-[60px] h-full flex items-center justify-center text-tk-text2 hover:text-tk-text hover:bg-tk-bg3 transition-colors flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            {collapsed ? (
              <>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <polyline points="9 18 15 12 9 6"/>
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </>
            )}
          </svg>
        </button>

        {/* Logo + label (solo visibles cuando expandido) */}
        <div className={`flex items-center gap-2.5 transition-opacity duration-200 whitespace-nowrap ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <Image
            src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png"
            alt="Travelkit"
            width={90}
            height={28}
            className="h-6 w-auto object-contain"
            priority
          />
          <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-tk-text3 uppercase">
            <span style={{ color: '#D32F2F' }}>IT</span> HUB
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(item => {
          const matchTarget = item.matchPath || item.href;
          const active = item.exact ? pathname === matchTarget : pathname.startsWith(matchTarget);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 border ${
                active
                  ? 'bg-[rgba(211,47,47,0.1)] border-[rgba(211,47,47,0.25)] text-[#D32F2F]'
                  : 'text-tk-text2 border-transparent hover:bg-tk-bg3 hover:text-tk-text'
              }`}
            >
              {item.icon}
              <span className={`whitespace-nowrap transition-[opacity,transform] duration-200 ${collapsed ? 'opacity-0 -translate-x-2 pointer-events-none w-0 overflow-hidden' : 'opacity-100 translate-x-0'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 flex-shrink-0 border-t border-tk-border space-y-1">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className={`w-full flex items-center gap-2.5 ${collapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-lg text-tk-text2 hover:bg-tk-bg3 hover:text-tk-text text-[12px] font-mono uppercase tracking-[0.06em] transition-all duration-150 border border-transparent hover:border-tk-border2 cursor-pointer`}
        >
          {theme === 'dark' ? SUN_ICON : MOON_ICON}
          <span className={`whitespace-nowrap transition-[opacity,transform] duration-200 ${collapsed ? 'opacity-0 -translate-x-2 pointer-events-none w-0 overflow-hidden' : 'opacity-100 translate-x-0'}`}>
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </span>
        </button>

        {/* User row */}
        {userName && (
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center px-0' : 'px-3'} py-2`}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold flex-shrink-0 bg-tk-bg3 border border-tk-border2" style={{ color: '#D32F2F' }} title={collapsed ? userName : undefined}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className={`font-mono text-[11px] text-tk-text2 truncate flex-1 transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>{userName}</span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={`w-full flex items-center gap-2.5 ${collapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-lg text-tk-text3 hover:text-tk-red hover:bg-tk-red-bg text-[11px] font-mono tracking-[0.06em] uppercase transition-all duration-150 border border-transparent hover:border-tk-red/30 cursor-pointer`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className={`whitespace-nowrap transition-[opacity,transform] duration-200 ${collapsed ? 'opacity-0 -translate-x-2 pointer-events-none w-0 overflow-hidden' : 'opacity-100 translate-x-0'}`}>
            Cerrar sesión
          </span>
        </button>

      </div>
    </aside>
  );
}
