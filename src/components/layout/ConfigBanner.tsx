'use client';

export default function ConfigBanner() {
  return (
    <div className="bg-[rgba(255,183,77,0.06)] border-b border-[rgba(255,183,77,0.2)] px-8 py-4 hidden">
      {/* Solo visible si SHEET_ID no está configurado — mostrar con JS si es necesario */}
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
        <p className="text-[13px] text-tk-text2 leading-[1.6]">
          URL del Sheet:{' '}
          <code className="font-mono text-xs bg-[rgba(255,183,77,0.1)] text-tk-amber px-1.5 py-px rounded">
            docs.google.com/spreadsheets/d/<strong>[SHEET_ID]</strong>/edit
          </code>
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {['Abre el Google Sheet', 'Archivo → Compartir → Cualquier persona con el enlace', 'Copia el ID de la URL', 'Pégalo en SHEET_ID'].map((step, i) => (
            <div key={i} className="flex items-center gap-1.5 font-mono text-[11px] text-tk-text3 bg-[rgba(255,183,77,0.05)] border border-[rgba(255,183,77,0.12)] px-2.5 py-1 rounded-full">
              <div className="w-4 h-4 rounded-full bg-[rgba(255,183,77,0.15)] text-tk-amber flex items-center justify-center text-[9px] font-semibold flex-shrink-0">
                {i + 1}
              </div>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
