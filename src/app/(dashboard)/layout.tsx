'use client';

import Sidebar from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // El sidebar principal (Tickets/Clientes/Data) SOLO aparece en el Pipeline (ruta `/`).
  // En Hub (admin sin entrar a Pipeline) el HubView lo cubre con un overlay fixed.
  // En `/clientes`, `/executive` y cualquier otra ruta del grupo, el sidebar se oculta.
  const showSidebar = pathname === '/';

  return (
    <>
      {showSidebar && <Sidebar />}
      <div className={`flex-1 flex flex-col min-w-0 ${showSidebar ? 'ml-[220px]' : ''}`}>
        {children}
      </div>
    </>
  );
}
