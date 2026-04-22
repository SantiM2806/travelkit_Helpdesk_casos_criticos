'use client';

import type { ToastItem } from '@/features/tickets/types';

interface ToastContainerProps {
  toasts: ToastItem[];
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`bg-tk-bg2 border border-tk-border2 border-l-[3px] border-l-tk-green rounded-md px-4 py-2.5 font-mono text-xs text-tk-text shadow-[0_4px_20px_rgba(0,0,0,0.35)] tracking-[0.02em] ${
            t.hiding ? 'animate-toast-out' : 'animate-toast-in'
          }`}
          dangerouslySetInnerHTML={{ __html: t.html }}
        />
      ))}
    </div>
  );
}
