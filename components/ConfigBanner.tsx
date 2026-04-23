'use client';

export default function ConfigBanner() {
  return (
    <div className="bg-[rgba(255,183,77,0.06)] border-b border-[rgba(255,183,77,0.2)] px-8 py-4 hidden">
      <div className="max-w-[900px]">
        <div className="font-mono text-[11px] font-semibold tracking-[0.1em] uppercase text-tk-amber mb-2 flex items-center gap-2">
          <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Configuración requerida — Sheet ID no definido
        </div>
        <p className="text-[13px] text-tk-text2 mb-1 leading-[1.6]">
          Edita <code className="font-mono text-xs bg-[rgba(255,183,77,0.1)] text-tk-amber px-1.5 py-px rounded">lib/data.ts</code> y activa{' '}
          <code className="font-mono text-xs bg-[rgba(255,183,77,0.1)] text-tk-amber px-1.5 py-px rounded">loadFromSheet()</code> con tu Google Sheet ID.
        </p>
      </div>
    </div>
  );
}