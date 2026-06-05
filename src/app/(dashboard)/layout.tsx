'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // El sidebar principal (Tickets/Clientes/...) aparece en todas las rutas
  // del dashboard EXCEPTO `/executive`, que tiene su propio sidebar interno
  // (IT / Casos Criticos).
  // En el Hub (admin sin entrar a Pipeline) el HubView lo cubre con un
  // overlay fixed, asi que aunque este montado, no se ve.
  const showSidebar = !pathname.startsWith('/executive');

  // Estado de colapso del sidebar, persistido en localStorage.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tk-sidebar-collapsed');
    if (saved === '1') setCollapsed(true);
  }, []);

  function toggleSidebar() {
    setCollapsed(c => {
      const next = !c;
      localStorage.setItem('tk-sidebar-collapsed', next ? '1' : '0');
      return next;
    });
  }

  // Margen del contenido segun visibilidad y colapso
  const marginClass = !showSidebar ? '' : collapsed ? 'ml-[60px]' : 'ml-[220px]';

  return (
    <>
      {showSidebar && <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />}
      <div className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ease-out ${marginClass}`}>
        {children}
      </div>
    </>
  );
}
