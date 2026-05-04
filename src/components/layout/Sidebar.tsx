'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

const NAV = [
  {
    href: '/',
    label: 'Tickets',
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="M16 5v-.5a2.5 2.5 0 0 0-5 0V5m0 14v.5a2.5 2.5 0 0 0 5 0V19"/>
      </svg>
    ),
  },
  {
    href: '/clientes',
    label: 'Clientes',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/executive',
    label: 'Executive',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const sb = createSupabaseBrowser();
    sb.auth.getUser().then(({ data }) => {
      const meta  = data.user?.user_metadata;
      const email = data.user?.email ?? '';
      const fromEmail = email.split('@')[0].split('.').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setUserName(meta?.full_name ?? meta?.name ?? fromEmail);
    });
  }, []);

  async function handleLogout() {
    const sb = createSupabaseBrowser();
    await sb.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 w-[220px] h-screen z-40 flex flex-col"
      style={{ background: '#141618', borderRight: '1px solid #2a2d31' }}>

      {/* Brand */}
      <div className="h-14 flex items-center px-5 gap-2.5 flex-shrink-0" style={{ borderBottom: '1px solid #2a2d31' }}>
        <Image
          src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png"
          alt="Travelkit"
          width={90}
          height={28}
          className="h-6 w-auto object-contain"
          priority
        />
        <div className="font-mono text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: '#5f6368' }}>
          <span style={{ color: '#4fc3f7' }}>IT</span> HUB
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150"
              style={active
                ? { background: 'rgba(79,195,247,0.1)', color: '#4fc3f7', border: '1px solid rgba(79,195,247,0.2)' }
                : { color: '#9aa0a8', border: '1px solid transparent' }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#1c1f22'; (e.currentTarget as HTMLElement).style.color = '#e8eaed'; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9aa0a8'; } }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer: user + logout */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid #2a2d31' }}>
        {userName && (
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold flex-shrink-0"
              style={{ background: '#1c1f22', border: '1px solid #383c42', color: '#4fc3f7' }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="font-mono text-[11px] truncate" style={{ color: '#9aa0a8' }}>{userName}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-[11px] tracking-[0.06em] uppercase transition-all duration-150 cursor-pointer"
          style={{ color: '#5f6368', border: '1px solid transparent' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef5350'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,83,80,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,83,80,0.3)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5f6368'; (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
